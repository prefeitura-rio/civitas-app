import {
  EMAIL_STATUS,
  shouldMarkAsAguardandoOnConverterOpen,
} from '@/http/emails/get-email'

describe('shouldMarkAsAguardandoOnConverterOpen', () => {
  it('returns true only for Não Lido', () => {
    expect(shouldMarkAsAguardandoOnConverterOpen(EMAIL_STATUS.NAO_LIDO)).toBe(
      true,
    )
  })

  it.each([
    EMAIL_STATUS.AGUARDANDO_RESPOSTA,
    EMAIL_STATUS.RESPONDIDO,
    EMAIL_STATUS.SPAM,
  ] as const)('returns false for %s', (status) => {
    expect(shouldMarkAsAguardandoOnConverterOpen(status)).toBe(false)
  })
})
