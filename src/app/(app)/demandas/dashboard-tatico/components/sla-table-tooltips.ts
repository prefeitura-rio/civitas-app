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
