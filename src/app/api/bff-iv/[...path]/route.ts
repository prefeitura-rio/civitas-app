import { NextResponse } from 'next/server'

import { getVehicleIntelligenceApiUrl } from '@/config'
import { createProxyHandler } from '@/lib/bff/create-proxy-handler'
import { checkSessionScreenAccess } from '@/lib/bff/screen-permissions'
import {
  VEHICLE_INTELLIGENCE_BFF_PREFIX,
  VEHICLE_INTELLIGENCE_SCREEN_CODE,
} from '@/lib/vehicle-intelligence/constants'

// BFF do Inteligência Veicular: mesma sessão e renovação de token do BFF do civitas-api, mais a permissão da tela
// vehicle_intelligence, conferida no civitas-api a cada minuto por sessão. O serviço não tem endereço público: esta
// rota é o único caminho até ele.
const handler = createProxyHandler({
  pathPrefix: VEHICLE_INTELLIGENCE_BFF_PREFIX,
  getUpstreamBaseUrl: getVehicleIntelligenceApiUrl,
  authorize: async (session) => {
    const result = await checkSessionScreenAccess(
      session,
      VEHICLE_INTELLIGENCE_SCREEN_CODE,
    )
    if (result.access === 'allowed') return null
    // 401 encerra a sessão (o proxy limpa os cookies); o `code` vira o aviso na tela de login.
    return result.access === 'unauthorized'
      ? NextResponse.json(
          {
            message: 'Unauthorized',
            ...(result.code ? { code: result.code } : {}),
          },
          { status: 401 },
        )
      : NextResponse.json({ message: 'Forbidden' }, { status: 403 })
  },
  clearSessionOnUpstreamUnauthorized: false,
  logLabel: 'bff-iv',
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
