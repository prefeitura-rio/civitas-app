import { config } from '@/config'
import { createProxyHandler } from '@/lib/bff/create-proxy-handler'
import { invalidateScreenPermissionsCache } from '@/lib/bff/screen-permissions'

const DEACTIVATE_USER_PATH = /^\/users-roles\/[^/]+\/deactivate\/?$/

const handler = createProxyHandler({
  pathPrefix: '/api/bff',
  getUpstreamBaseUrl: () => config.apiUrl,
  // O BFF-IV guarda as permissões de tela por sessão: um usuário desativado perde o acesso já na próxima chamada.
  onUpstreamResponse: ({ method, path, status }) => {
    if (
      method === 'PATCH' &&
      status >= 200 &&
      status < 300 &&
      DEACTIVATE_USER_PATH.test(path)
    ) {
      invalidateScreenPermissionsCache()
    }
  },
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
