import { config } from '@/config'
import { createProxyHandler } from '@/lib/bff/create-proxy-handler'

const handler = createProxyHandler({
  pathPrefix: '/api/bff',
  getUpstreamBaseUrl: () => config.apiUrl,
})

export {
  handler as GET,
  handler as HEAD,
  handler as POST,
  handler as PUT,
  handler as PATCH,
  handler as DELETE,
  handler as OPTIONS,
}
