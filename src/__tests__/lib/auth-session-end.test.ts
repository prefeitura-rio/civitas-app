import {
  consumeSessionEndNotice,
  markSessionEndNotice,
  readErrorCode,
  readResponseErrorCode,
  shouldEndSession,
  USER_DEACTIVATED_CODE,
} from '@/lib/auth-session-end'

describe('auth-session-end', () => {
  beforeEach(() => sessionStorage.clear())

  it.each([
    [401, undefined, true],
    [401, 'session_invalidated', true],
    [403, USER_DEACTIVATED_CODE, true],
    [403, undefined, false],
    [403, 'forbidden', false],
    [500, USER_DEACTIVATED_CODE, false],
  ])('shouldEndSession(%s, %s) === %s', (status, code, expected) => {
    expect(shouldEndSession(status, code)).toBe(expected)
  })

  it('records and consumes the deactivated notice once', () => {
    markSessionEndNotice(USER_DEACTIVATED_CODE)
    expect(consumeSessionEndNotice()).toBe('user_deactivated')
    expect(consumeSessionEndNotice()).toBeNull()
  })

  it('records and consumes the session-invalidated notice', () => {
    markSessionEndNotice('session_invalidated')
    expect(consumeSessionEndNotice()).toBe('session_invalidated')
    expect(consumeSessionEndNotice()).toBeNull()
  })

  it('ignores unknown codes', () => {
    markSessionEndNotice('whatever')
    markSessionEndNotice(undefined)
    expect(consumeSessionEndNotice()).toBeNull()
  })

  it.each([
    [{ code: 'user_deactivated', detail: 'x' }, 'user_deactivated'],
    [{ code: 42 }, undefined],
    [{ detail: 'sem code' }, undefined],
    [null, undefined],
    ['texto', undefined],
    [undefined, undefined],
  ])('readErrorCode(%p) → %p', (body, expected) => {
    expect(readErrorCode(body)).toBe(expected)
  })

  it('readResponseErrorCode lê o code do corpo JSON', async () => {
    const response = { json: async () => ({ code: 'user_deactivated' }) }
    expect(await readResponseErrorCode(response as unknown as Response)).toBe(
      'user_deactivated',
    )
  })

  it('readResponseErrorCode ignora corpo que não é JSON', async () => {
    const response = {
      json: async () => {
        throw new SyntaxError('Unexpected token')
      },
    }
    expect(
      await readResponseErrorCode(response as unknown as Response),
    ).toBeUndefined()
  })
})
