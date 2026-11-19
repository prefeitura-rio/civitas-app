import { AxiosError, type InternalAxiosRequestConfig } from 'axios'

import { api } from '@/lib/api'
import { redirectToSignIn } from '@/lib/session-redirect'

jest.mock('@/lib/session-redirect', () => ({ redirectToSignIn: jest.fn() }))

// O Blob do jsdom não tem text() (os navegadores têm).
if (!Blob.prototype.text) {
  Blob.prototype.text = function text(this: Blob) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = () => reject(reader.error)
      reader.readAsText(this)
    })
  }
}

const originalAdapter = api.defaults.adapter

function respondWith(status: number, data: unknown) {
  api.defaults.adapter = async (config: InternalAxiosRequestConfig) => {
    throw new AxiosError('failed', 'ERR_BAD_REQUEST', config, null, {
      data,
      status,
      statusText: '',
      headers: {},
      config,
    })
  }
}

const jsonBlob = (body: unknown) =>
  new Blob([JSON.stringify(body)], { type: 'application/json' })

/** Espera a chamada terminar sem prender o teste na promise pendente do redirect. */
async function settle(promise: Promise<unknown>) {
  await Promise.race([
    promise.catch(() => undefined),
    new Promise((resolve) => setTimeout(resolve, 50)),
  ])
}

describe('api: fim de sessão em respostas binárias', () => {
  afterEach(() => {
    api.defaults.adapter = originalAdapter
    jest.clearAllMocks()
    window.history.replaceState(null, '', '/')
  })

  it('403 user_deactivated num download (corpo Blob) encerra o login com o motivo', async () => {
    respondWith(403, jsonBlob({ code: 'user_deactivated' }))

    await settle(api.get('/arquivo', { responseType: 'blob' }))

    expect(redirectToSignIn).toHaveBeenCalledWith('user_deactivated')
    expect(window.location.pathname).not.toBe('/forbidden')
  })

  it('403 comum num download continua sendo falta de permissão', async () => {
    respondWith(403, jsonBlob({ detail: 'Sem permissão' }))

    await settle(api.get('/arquivo', { responseType: 'blob' }))

    expect(redirectToSignIn).not.toHaveBeenCalled()
  })

  it('Blob que não é JSON não derruba o login', async () => {
    respondWith(403, new Blob(['%PDF-1.7'], { type: 'application/pdf' }))

    await settle(api.get('/arquivo', { responseType: 'blob' }))

    expect(redirectToSignIn).not.toHaveBeenCalled()
  })

  it('403 user_deactivated em JSON segue encerrando o login', async () => {
    respondWith(403, { code: 'user_deactivated' })

    await settle(api.get('/dados'))

    expect(redirectToSignIn).toHaveBeenCalledWith('user_deactivated')
  })
})
