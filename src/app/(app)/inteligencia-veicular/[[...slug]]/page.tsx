import { ConnectionCheck } from '../components/connection-check'

// Catch-all: as rotas internas do módulo (/inteligencia-veicular/profile/<placa>, /groups, ...) são resolvidas pelo
// próprio módulo no navegador. Por enquanto, só a verificação da ligação com o serviço.
export default function VehicleIntelligencePage() {
  return <ConnectionCheck />
}
