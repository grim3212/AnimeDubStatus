// One entry point for deploying, used both locally and by GitHub Actions.
//
//   node scripts/deploy.mjs full      cdk deploy, upload the site, then refresh the data
//   node scripts/deploy.mjs web       upload the site only (no infrastructure changes)
//   node scripts/deploy.mjs destroy   empty the site bucket, then cdk destroy
//
// Build the site first (`npm run build`). Locally this uses the "default" AWS CLI profile (the account root, signed in with `aws login`;
// there are no deploy keys); in CI (CI=true) it uses whatever credentials the workflow configured.
//
// The site is uploaded with plain `aws s3 sync` instead of CDK's BucketDeployment, which would
// add helper Lambdas and roles with generated names.
import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const STACK = 'AnimeDubStatus'
const REGION = 'us-west-2'
// AWS_PROFILE picks a different named profile.
const PROFILE = process.env.AWS_PROFILE || 'default'

const ci = Boolean(process.env.CI)
const rootDir = fileURLToPath(new URL('..', import.meta.url))
const dist = fileURLToPath(new URL('../.output/public', import.meta.url))
const profileArgs = ci ? [] : ['--profile', PROFILE]

function run(cmd, args, opts = {}) {
  console.log(`> ${cmd === process.execPath ? 'cdk' : cmd} ${args.join(' ')}`)
  return execFileSync(cmd, args, { stdio: 'inherit', cwd: rootDir, ...opts })
}

const aws = (...args) => run('aws', [...args, ...profileArgs, '--region', REGION])

const cdkBin = createRequire(import.meta.url).resolve('aws-cdk/bin/cdk')
// CI can't answer CDK's "approve these IAM changes?" prompt; locally you still get asked.
const cdk = (...args) =>
  run(process.execPath, [cdkBin, ...args, ...profileArgs, ...(ci ? ['--require-approval', 'never'] : [])])

function stackOutputs() {
  const json = execFileSync(
    'aws',
    ['cloudformation', 'describe-stacks', '--stack-name', STACK, '--query', 'Stacks[0].Outputs',
      '--output', 'json', ...profileArgs, '--region', REGION],
    { encoding: 'utf8' },
  )
  return Object.fromEntries(JSON.parse(json).map(o => [o.OutputKey, o.OutputValue]))
}

function uploadSite() {
  if (!existsSync(`${dist}/index.html`)) throw new Error('.output/public is missing. Run `npm run build` first.')
  const { SiteBucket: bucket, DistributionId: distributionId } = stackOutputs()

  // data/ belongs to the refresh-data Lambda: never upload over it or delete it (excluded paths
  // are skipped by --delete too). A local `npm run refresh-data` puts files there.
  // Hashed build assets never change, so browsers can keep them for a year.
  aws('s3', 'sync', `${dist}/_nuxt`, `s3://${bucket}/_nuxt`, '--delete', '--no-progress',
    '--cache-control', 'public,max-age=31536000,immutable')
  // Everything else (pages, icons) must refresh on every deploy.
  aws('s3', 'sync', dist, `s3://${bucket}`, '--delete', '--no-progress',
    '--exclude', '_nuxt/*', '--exclude', 'data/*', '--cache-control', 'no-cache')
  aws('cloudfront', 'create-invalidation', '--distribution-id', distributionId, '--paths', '/*',
    '--query', 'Invalidation.Id', '--output', 'text')
}

// Runs the data job now instead of waiting up to 6 hours (and fills data/ on a first deploy).
function refreshData() {
  const { RefreshDataFunction: fn } = stackOutputs()
  aws('lambda', 'invoke', '--function-name', fn, '--invocation-type', 'Event', '--no-cli-pager',
    process.platform === 'win32' ? 'NUL' : '/dev/null')
}

switch (process.argv[2]) {
  case 'full':
    cdk('deploy', STACK)
    uploadSite()
    refreshData()
    break
  case 'web':
    uploadSite()
    break
  case 'refresh-data':
    refreshData()
    break
  case 'destroy': {
    const { SiteBucket: bucket } = stackOutputs()
    aws('s3', 'rm', `s3://${bucket}`, '--recursive')
    cdk('destroy', STACK)
    break
  }
  default:
    console.error('Usage: node scripts/deploy.mjs full|web|refresh-data|destroy')
    process.exit(1)
}
