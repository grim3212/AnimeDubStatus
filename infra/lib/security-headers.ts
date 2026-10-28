import { Function as CfFunction, FunctionCode, FunctionRuntime, type ResponseHeadersPolicyProps } from 'aws-cdk-lib/aws-cloudfront'
import type { Construct } from 'constructs'

/**
 * The site's security headers (CSP, HSTS, framing, referrer, custom headers), set by a CloudFront
 * Function on every response instead of a custom response headers policy.
 *
 * Why: CloudFront response headers policies only have generated ids, so a deploy role can't be
 * limited to its own site's policy, and any site's deploy could rewrite another site's CSP. Functions
 * have names, and this site's deploy role can only change functions named for this site. Behaviours
 * also use AWS's managed SECURITY_HEADERS policy (which nobody can change) as a baseline, since
 * CloudFront doesn't run viewer-response functions on every error response.
 *
 * Takes the same shape as ResponseHeadersPolicyProps, so the settings read exactly as before.
 */
export function securityHeadersFunction(scope: Construct, id: string, props: ResponseHeadersPolicyProps) {
  const headers: Record<string, string> = {}
  const s = props.securityHeadersBehavior
  if (s?.contentSecurityPolicy) headers['content-security-policy'] = s.contentSecurityPolicy.contentSecurityPolicy
  if (s?.frameOptions) headers['x-frame-options'] = s.frameOptions.frameOption
  if (s?.contentTypeOptions) headers['x-content-type-options'] = 'nosniff'
  if (s?.referrerPolicy) headers['referrer-policy'] = s.referrerPolicy.referrerPolicy
  if (s?.strictTransportSecurity) {
    const t = s.strictTransportSecurity
    headers['strict-transport-security'] = [
      `max-age=${t.accessControlMaxAge.toSeconds()}`,
      ...(t.includeSubdomains ? ['includeSubDomains'] : []),
      ...(t.preload ? ['preload'] : []),
    ].join('; ')
  }
  if (s?.xssProtection) {
    const x = s.xssProtection
    headers['x-xss-protection'] = x.protection ? `1${x.modeBlock ? '; mode=block' : ''}${x.reportUri ? `; report=${x.reportUri}` : ''}` : '0'
  }
  for (const h of props.customHeadersBehavior?.customHeaders ?? []) headers[h.header.toLowerCase()] = h.value

  const sets = Object.entries(headers)
    .map(([name, value]) => `  h[${JSON.stringify(name)}] = { value: ${JSON.stringify(value)} };`)
    .join('\n')
  return new CfFunction(scope, id, {
    functionName: props.responseHeadersPolicyName,
    comment: 'Security headers on every response',
    runtime: FunctionRuntime.JS_2_0,
    code: FunctionCode.fromInline(`function handler(event) {\n  var h = event.response.headers;\n${sets}\n  return event.response;\n}`),
  })
}
