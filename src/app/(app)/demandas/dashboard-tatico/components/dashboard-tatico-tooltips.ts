// Volume de Demanda
export const VOLUME_TOTAL_TOOLTIP =
  'Chamados criados e encerrados no período do filtro (dia, semana, mês ou ano).'

export const VOLUME_URGENCY_TOOLTIP =
  'Chamados encerrados no período, separados por prioridade (Urgente, Alta e Rotina).'

export const VOLUME_NATURE_TOOLTIP =
  'Chamados encerrados por natureza. A cor de cada mês compara o volume com a média dos 3 meses anteriores. A matriz exibe os últimos 12 meses.'

export const VOLUME_SERVICE_TOOLTIP =
  'Chamados encerrados por tipo de serviço. A cor de cada mês compara o volume com a média dos 3 meses anteriores. A matriz exibe os últimos 12 meses.'

export const VOLUME_REQUESTER_TOOLTIP =
  'Chamados encerrados por demandante. A cor de cada mês compara o volume com a média dos 3 meses anteriores. A matriz exibe os últimos 12 meses.'

export const VOLUME_MEDIA_TOOLTIP =
  'Chamados encerrados com apelido de imprensa, no período do filtro.'

// SLA
export const SLA_GENERAL_RESOLUTION_TOOLTIP =
  'Dias entre abertura e encerramento da demanda. Também considera o 1º e-mail, quando houver.'

export const SLA_PRIORITY_RESOLUTION_TOOLTIP =
  'Dias de resolução por prioridade, no período do filtro.'

export const SLA_MEDIA_DELIVERY_TOOLTIP =
  'Dias médios de resolução de chamados com apelido de imprensa.'

const SLA_COLOR_LEGEND =
  'A tabela exibe os últimos 3 meses. A cor de cada mês compara o percentual daquele mês com a média dos três meses exibidos na mesma linha: vermelho = na média ou acima dessa média; azul = abaixo.'

export const SLA_BY_PRIORITY_TOOLTIP =
  'Percentual de serviços da demanda concluídos dentro do prazo, agrupado por prioridade (Urgente, Alta ou Rotina). O prazo considerado é o maior SLA configurado entre os serviços vinculados à demanda.\n\n' +
  SLA_COLOR_LEGEND

export const SLA_BY_SERVICE_TOOLTIP =
  'Percentual de serviços concluídos dentro do prazo, agrupado por tipo de serviço (Busca por Placa, Análise de Imagem etc.). Cada serviço utiliza o prazo definido em Configuração de SLA.\n\n' +
  SLA_COLOR_LEGEND

export const SLA_BY_TEAM_TOOLTIP =
  'Percentual de serviços da demanda concluídos dentro do prazo, agrupado pela equipe responsável. O prazo considerado é o maior SLA configurado entre os serviços vinculados à demanda.\n\n' +
  SLA_COLOR_LEGEND

// Visão Operacional
export const OPERATIONAL_OPEN_BY_TEAM_TOOLTIP =
  'Chamados em aberto por equipe e status, no período do filtro.'

export const OPERATIONAL_CLOSED_BY_TEAM_TOOLTIP =
  'Chamados encerrados por equipe que finalizou. Exclui Administrativo e Coordenadores.'

export const OPERATIONAL_RESOLUTION_BY_TEAM_TOOLTIP =
  'Dias médios de resolução por equipe que finalizou. Exclui Administrativo e Coordenadores.'
