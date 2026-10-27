import { fileURLToPath } from 'node:url'
import { CfnOutput, Duration, RemovalPolicy, Stack, type StackProps } from 'aws-cdk-lib'
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager'
import {
  CachePolicy,
  Distribution,
  Function as CfFunction,
  FunctionCode,
  FunctionEventType,
  HeadersFrameOption,
  HeadersReferrerPolicy,
  HttpVersion,
  PriceClass,
  ResponseHeadersPolicy,
  S3OriginAccessControl,
  Signing,
  ViewerProtocolPolicy,
} from 'aws-cdk-lib/aws-cloudfront'
import { S3BucketOrigin } from 'aws-cdk-lib/aws-cloudfront-origins'
import { Alarm, ComparisonOperator, TreatMissingData } from 'aws-cdk-lib/aws-cloudwatch'
import { SnsAction } from 'aws-cdk-lib/aws-cloudwatch-actions'
import { Rule, Schedule } from 'aws-cdk-lib/aws-events'
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets'
import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda'
import { NodejsFunction, OutputFormat } from 'aws-cdk-lib/aws-lambda-nodejs'
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs'
import { BlockPublicAccess, Bucket, BucketEncryption } from 'aws-cdk-lib/aws-s3'
import { Topic } from 'aws-cdk-lib/aws-sns'
import { EmailSubscription } from 'aws-cdk-lib/aws-sns-subscriptions'
import type { Construct } from 'constructs'

export interface SiteConfig {
  /** The canonical domain, e.g. animedubstatus.com. */
  domainName: string
  /** Extra domains that redirect to domainName, e.g. ["www.animedubstatus.com"]. */
  redirectDomains: string[]
  /** ACM certificate (us-east-1, as CloudFront requires) covering every domain above. */
  certificateArn: string
  /** Optional: email that hears about it when the data job keeps failing. */
  alertEmail?: string
}

/** Every resource gets an explicit "animedubstatus-*" name so the console is readable. */
export const RESOURCE_PREFIX = 'animedubstatus'

/** "animedubstatus.com" -> "animedubstatus-com" (dashes, so HTTPS to S3 never trips on dots). */
export const siteBucketName = (domainName: string) => domainName.replace(/\./g, '-')

export class SiteStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps & { config: SiteConfig }) {
    super(scope, id, props)
    const { config } = props
    const name = (suffix: string) => `${RESOURCE_PREFIX}-${suffix}`
    const certificate = Certificate.fromCertificateArn(this, 'Cert', config.certificateArn)

    // The site is uploaded by scripts/deploy.mjs (aws s3 sync) after `cdk deploy`. CDK's
    // BucketDeployment would add helper Lambdas and roles with generated names.
    // data/ is written by the refresh-data Lambda and is left alone by deploys.
    const bucket = new Bucket(this, 'Site', {
      bucketName: siteBucketName(config.domainName),
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      encryption: BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      // `npm run destroy` empties it first (autoDeleteObjects would add an unnamed helper Lambda).
      removalPolicy: RemovalPolicy.DESTROY,
    })

    // www.animedubstatus.com (and any other redirect domain) -> https://animedubstatus.com
    const redirect = new CfFunction(this, 'CanonicalHost', {
      functionName: name('canonical-host'),
      code: FunctionCode.fromInline(`
function handler(event) {
  var req = event.request;
  var host = req.headers.host && req.headers.host.value;
  if (host && host !== ${JSON.stringify(config.domainName)}) {
    var qs = Object.keys(req.querystring).map(function (k) {
      var v = req.querystring[k];
      return encodeURIComponent(k) + (v.value === undefined || v.value === '' ? '' : '=' + encodeURIComponent(v.value));
    }).join('&');
    return {
      statusCode: 301,
      statusDescription: 'Moved Permanently',
      headers: { location: { value: 'https://' + ${JSON.stringify(config.domainName)} + req.uri + (qs ? '?' + qs : '') } },
    };
  }
  return req;
}`),
    })

    // The Content-Security-Policy itself is a <meta> tag in each page (see infra/lib/csp.ts).
    const headers = new ResponseHeadersPolicy(this, 'Headers', {
      responseHeadersPolicyName: name('headers'),
      securityHeadersBehavior: {
        frameOptions: { frameOption: HeadersFrameOption.DENY, override: true },
        contentTypeOptions: { override: true },
        referrerPolicy: { referrerPolicy: HeadersReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN, override: true },
        strictTransportSecurity: {
          accessControlMaxAge: Duration.days(365),
          includeSubdomains: false,
          override: true,
        },
      },
      customHeadersBehavior: {
        customHeaders: [
          {
            header: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
            override: true,
          },
          { header: 'Cross-Origin-Opener-Policy', value: 'same-origin', override: true },
        ],
      },
    })

    const originAccessControl = new S3OriginAccessControl(this, 'SiteOac', {
      originAccessControlName: name('site'),
      signing: Signing.SIGV4_ALWAYS,
    })

    // CloudFront distributions have no name, only an AWS-assigned id; the comment labels it.
    const distribution = new Distribution(this, 'Cdn', {
      comment: config.domainName,
      domainNames: [config.domainName, ...config.redirectDomains],
      certificate,
      priceClass: PriceClass.PRICE_CLASS_100, // US/Canada/Europe edges only: the cheapest tier
      httpVersion: HttpVersion.HTTP2_AND_3,
      defaultRootObject: 'index.html',
      defaultBehavior: {
        origin: S3BucketOrigin.withOriginAccessControl(bucket, { originAccessControl }),
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        // Honors each object's Cache-Control (set by deploy.mjs and the refresh-data Lambda).
        cachePolicy: CachePolicy.CACHING_OPTIMIZED,
        responseHeadersPolicy: headers,
        functionAssociations: [{ function: redirect, eventType: FunctionEventType.VIEWER_REQUEST }],
      },
      // A private bucket answers 403 for missing files.
      errorResponses: [403, 404].map(httpStatus => ({
        httpStatus,
        responseHttpStatus: 404,
        responsePagePath: '/404.html',
        ttl: Duration.minutes(5),
      })),
    })

    // Rebuilds data/dub-info.json and data/airing.json (see jobs/refresh-data.ts).
    const refreshData = new NodejsFunction(this, 'RefreshData', {
      functionName: name('refresh-data'),
      entry: fileURLToPath(new URL('../../jobs/refresh-data.ts', import.meta.url)),
      handler: 'handler',
      runtime: Runtime.NODEJS_24_X,
      architecture: Architecture.ARM_64,
      memorySize: 512,
      timeout: Duration.minutes(2),
      environment: { DATA_BUCKET: bucket.bucketName, NODE_OPTIONS: '--enable-source-maps' },
      bundling: { format: OutputFormat.ESM, minify: true, sourceMap: true, target: 'node24' },
      logGroup: new LogGroup(this, 'RefreshDataLogs', {
        logGroupName: `/aws/lambda/${name('refresh-data')}`,
        retention: RetentionDays.ONE_MONTH,
        removalPolicy: RemovalPolicy.DESTROY,
      }),
    })
    bucket.grantPut(refreshData, 'data/*')

    // The forum list is updated about daily; AniList's next-episode times change as episodes air.
    new Rule(this, 'RefreshSchedule', {
      ruleName: name('refresh-data'),
      schedule: Schedule.rate(Duration.hours(6)),
      targets: [new LambdaFunction(refreshData, { retryAttempts: 2 })],
    })

    if (config.alertEmail) {
      const topic = new Topic(this, 'Alerts', { topicName: name('alerts') })
      topic.addSubscription(new EmailSubscription(config.alertEmail))
      // One failed run is usually a source being briefly down; two in a row (~12h) needs a look.
      new Alarm(this, 'RefreshDataFailing', {
        alarmName: name('refresh-data-failing'),
        alarmDescription: 'The refresh-data job failed twice in a row. Check its logs in CloudWatch.',
        metric: refreshData.metricErrors({ period: Duration.hours(6) }),
        threshold: 1,
        comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
        evaluationPeriods: 2,
        treatMissingData: TreatMissingData.NOT_BREACHING,
      }).addAlarmAction(new SnsAction(topic))
    }

    new CfnOutput(this, 'CloudflareCname', {
      value: distribution.distributionDomainName,
      description: 'In Cloudflare: CNAME the apex (@) and www to this value',
    })
    new CfnOutput(this, 'SiteUrl', { value: `https://${config.domainName}` })
    // Read by scripts/deploy.mjs.
    new CfnOutput(this, 'SiteBucket', { value: bucket.bucketName })
    new CfnOutput(this, 'DistributionId', { value: distribution.distributionId })
    new CfnOutput(this, 'RefreshDataFunction', { value: refreshData.functionName })
  }
}
