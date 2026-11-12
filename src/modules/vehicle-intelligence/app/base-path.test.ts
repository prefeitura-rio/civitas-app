import {
  serviceUrl,
  toAppPath,
  toRoutePath,
} from '@/modules/vehicle-intelligence/app/base-path'

describe('caminho base do módulo no civitas-app', () => {
  it('leva as rotas internas para /inteligencia-veicular', () => {
    expect(toAppPath('/')).toBe('/inteligencia-veicular')
    expect(toAppPath('/groups')).toBe('/inteligencia-veicular/groups')
    expect(toAppPath('/profile/ABC1D23/correlations')).toBe(
      '/inteligencia-veicular/profile/ABC1D23/correlations',
    )
  })

  it('tira o prefixo da URL; a raiz e caminhos de fora viram a visão geral', () => {
    expect(toRoutePath('/inteligencia-veicular')).toBe('/')
    expect(toRoutePath('/inteligencia-veicular/')).toBe('/')
    expect(toRoutePath('/inteligencia-veicular/groups/ABC1D23-DEF4G56')).toBe(
      '/groups/ABC1D23-DEF4G56',
    )
    expect(toRoutePath('/inteligencia-veicularX/groups')).toBe('/')
    expect(toRoutePath('/veiculos/busca-por-placa')).toBe('/')
  })

  it('ida e volta preservam a rota', () => {
    for (const route of [
      '/',
      '/correlation',
      '/occurrence/019-06778%2F2026',
      '/territories/Complexo%20da%20Mar%C3%A9',
    ]) {
      expect(toRoutePath(toAppPath(route))).toBe(route)
    }
  })

  it('API e tiles pelo BFF; dados estáticos na pasta do módulo; o resto intacto', () => {
    expect(serviceUrl('/api/veiculos/v1/dashboard?x=1')).toBe(
      '/api/bff-iv/api/veiculos/v1/dashboard?x=1',
    )
    expect(serviceUrl('/tiles/voyager/{z}/{x}/{y}.png')).toBe(
      '/api/bff-iv/tiles/voyager/{z}/{x}/{y}.png',
    )
    expect(serviceUrl('/data/bairros_rio.geojson')).toBe(
      '/vehicle-intelligence/data/bairros_rio.geojson',
    )
    expect(serviceUrl('https://example.org/a')).toBe('https://example.org/a')
  })
})
