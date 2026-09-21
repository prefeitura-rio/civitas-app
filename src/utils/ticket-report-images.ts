const TICKET_REPORT_IMAGE_SRC_RE =
  /(src\s*=\s*["'])\/(?:api\/bff\/)?tickets\/([0-9a-f-]{36}\/(?:demand|response)-report\/images\/[0-9a-f-]{36})(["'])/gi

/** Converte a rota interna da API em rota do BFF autenticado para o navegador. */
export function toBrowserTicketReportHtml(html: string): string {
  return html.replace(TICKET_REPORT_IMAGE_SRC_RE, '$1/api/bff/tickets/$2$3')
}

/** Remove o prefixo do BFF antes de persistir o HTML na API. */
export function toStoredTicketReportHtml(html: string): string {
  return html.replace(TICKET_REPORT_IMAGE_SRC_RE, '$1/tickets/$2$3')
}
