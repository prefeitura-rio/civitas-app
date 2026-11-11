async function loadWith(recorte: string) {
  window.history.replaceState(null, '', `/?recorte=${recorte}`)
  jest.resetModules()
  return import('@/modules/vehicle-intelligence/stores/event-scope')
}

describe('scopeParams no entorno do fato (transeuntes)', () => {
  it('manda o padrão do recorte: motos, ±10 min e raio de 1 km', async () => {
    const { DEFAULT_EVENT_SCOPE, scopeParams } = await loadWith('transeuntes')
    expect(scopeParams(DEFAULT_EVENT_SCOPE).toString()).toBe(
      'modalidade=ROUBO&modalidade=FURTO&janela_evento=10&deslocamento=MOTO&raio_metros=1000',
    )
  })

  it('não manda os parâmetros da copassagem', async () => {
    const { DEFAULT_EVENT_SCOPE, scopeParams } = await loadWith('transeuntes')
    const params = scopeParams({
      ...DEFAULT_EVENT_SCOPE,
      maxFactDistance: 500,
      somenteCarga: true,
    })
    expect(params.has('distancia_fato_metros')).toBe(false)
    expect(params.has('somente_carga')).toBe(false)
  })
})

describe('scopeParams na copassagem (carga)', () => {
  it('manda o padrão do recorte: as duas categorias, ±30 min e ±10 min entre passagens', async () => {
    const { DEFAULT_EVENT_SCOPE, scopeParams } = await loadWith('carga')
    expect(scopeParams(DEFAULT_EVENT_SCOPE).toString()).toBe(
      'modalidade=CARGA_VEICULO&modalidade=CARGA&janela_evento=30&janela_correlacao=10',
    )
  })

  it('acrescenta CISP, meses, distância e só carga quando escolhidos', async () => {
    const { DEFAULT_EVENT_SCOPE, scopeParams } = await loadWith('carga')
    const params = scopeParams({
      ...DEFAULT_EVENT_SCOPE,
      cisps: ['014'],
      months: 3,
      maxFactDistance: 500,
      somenteCarga: true,
    })
    expect(params.toString()).toBe(
      'modalidade=CARGA_VEICULO&modalidade=CARGA&cisp=014&janela_evento=30&meses=3' +
        '&janela_correlacao=10&distancia_fato_metros=500&somente_carga=true',
    )
  })
})

describe('windowParams (Ver todos os fatos)', () => {
  it('transeuntes: só a janela e o raio da barra, ±10 min e 1 km no padrão', async () => {
    const { DEFAULT_EVENT_SCOPE, windowParams } = await loadWith('transeuntes')
    expect(windowParams(DEFAULT_EVENT_SCOPE).toString()).toBe(
      'janela_evento=10&raio_metros=1000',
    )
  })

  it('copassagem: a janela do fato e a entre passagens, sem filtros de fato', async () => {
    const { DEFAULT_EVENT_SCOPE, windowParams } = await loadWith('carga')
    const params = windowParams({
      ...DEFAULT_EVENT_SCOPE,
      cisps: ['014'],
      months: 3,
      somenteCarga: true,
    })
    expect(params.toString()).toBe('janela_evento=30&janela_correlacao=10')
  })
})

describe('allowed', () => {
  it('fica com as opções publicadas que a interface oferece, em ordem', async () => {
    const { allowed } = await loadWith('transeuntes')
    expect(allowed([30, 10, 45], [10, 20, 30])).toEqual([10, 30])
  })

  it('usa os limites da interface quando a base não publica nada', async () => {
    const { allowed } = await loadWith('transeuntes')
    expect(allowed(undefined, [20, 10])).toEqual([10, 20])
  })
})

// Arquivo de módulo (sem imports, o TypeScript o trataria como script global).
export {}
