import { readFileSync } from 'node:fs'
import { App, Tags } from 'aws-cdk-lib'
import { SiteStack, type SiteConfig } from '../lib/site-stack'

const config = JSON.parse(
  readFileSync(new URL('../config.json', import.meta.url), 'utf8'),
) as SiteConfig

const app = new App()
// Everything lives in us-west-2. The certificate is in us-east-1 (CloudFront requires that
// region) and referenced by ARN.
new SiteStack(app, 'AnimeDubStatus', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: 'us-west-2' },
  config,
})

// Every resource is tagged with the site's name.
Tags.of(app).add('site', 'animedubstatus')
