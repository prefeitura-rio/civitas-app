/** O recorte é lido da URL quando o módulo carrega: cada teste recarrega o módulo com a URL dele. */
async function loadWith(search: string) {
  window.history.replaceState(null, '', `/${search}`)
  jest.resetModules()
  return import('@/modules/vehicle-intelligence/config/recortes')
}

beforeEach(() => window.sessionStorage.clear())

describe('recorte da URL', () => {
  it('usa transeuntes sem parâmetro ou com um recorte desconhecido', async () => {
    expect((await loadWith('')).recorteAtual).toBe('transeuntes')
    expect((await loadWith('?recorte=outro')).recorteAtual).toBe('transeuntes')
  })

  it('liga cada recorte à sua estratégia', async () => {
    expect((await loadWith('?recorte=transeuntes')).copassagem).toBe(false)
    expect((await loadWith('?recorte=veiculos')).copassagem).toBe(true)
    expect((await loadWith('?recorte=carga')).copassagem).toBe(true)
  })
})

describe.each(['transeuntes', 'veiculos', 'carga'])(
  'caminhos do recorte %s',
  (id) => {
    it('leva /api/v1 ao motor do recorte e mantém a query', async () => {
      const { recorteApiPath } = await loadWith(`?recorte=${id}`)
      expect(recorteApiPath('/api/v1/groups?sementes=200')).toBe(
        `/api/bff-iv/api/${id}/v1/groups?sementes=200`,
      )
    })

    it('leva as rotas comuns aos três recortes ao BFF, e os dados estáticos à pasta do módulo', async () => {
      const { recorteApiPath } = await loadWith(`?recorte=${id}`)
      expect(recorteApiPath('/api/cerco')).toBe('/api/bff-iv/api/cerco')
      expect(recorteApiPath('/data/bairros_rio.geojson')).toBe(
        '/vehicle-intelligence/data/bairros_rio.geojson',
      )
    })

    it('isola as chaves do navegador por recorte', async () => {
      const { recorteStorageKey } = await loadWith(`?recorte=${id}`)
      expect(recorteStorageKey('event-scope:v2')).toBe(
        `civitas:${id}:event-scope:v2`,
      )
    })
  },
)

describe('recorte lembrado na aba', () => {
  it('sem ?recorte=, usa o último escolhido (os links do sidebar do CIVITAS não levam a query)', async () => {
    expect((await loadWith('?recorte=carga')).recorteAtual).toBe('carga')
    expect((await loadWith('')).recorteAtual).toBe('carga')
  })

  it('o ?recorte= da URL vale mais que o lembrado', async () => {
    await loadWith('?recorte=carga')
    expect((await loadWith('?recorte=veiculos')).recorteAtual).toBe('veiculos')
    expect((await loadWith('')).recorteAtual).toBe('veiculos')
  })
})

// Arquivo de módulo (sem imports, o TypeScript o trataria como script global).
export {}
