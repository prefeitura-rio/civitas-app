import { getCortexAddressSearch } from '@/utils/cortex-address'

const address = {
  tipoLogradouro: 'RUA',
  logradouro: 'CELSO JOSE ABDALLA SAYEG',
  numeroLogradouro: '521',
  bairro: 'JARDIM BOTANICO (SOUSAS)',
  municipio: 'CAMPINAS',
  uf: 'SP',
  cep: '13106-272',
}

describe('getCortexAddressSearch', () => {
  it('maps the nullable BFF address fields to structured geocoding fields', () => {
    expect(getCortexAddressSearch(address)).toEqual({
      street: 'RUA CELSO JOSE ABDALLA SAYEG',
      addressNumber: '521',
      neighborhood: 'JARDIM BOTANICO (SOUSAS)',
      place: 'CAMPINAS',
      region: 'SP',
      postcode: '13106272',
    })
  })

  it('does not repeat a street type that is already present in logradouro', () => {
    expect(
      getCortexAddressSearch({
        ...address,
        logradouro: 'RUA CELSO JOSE ABDALLA SAYEG',
      }).street,
    ).toBe('RUA CELSO JOSE ABDALLA SAYEG')
  })

  it('omits nulls, placeholders, and unnumbered street indicators', () => {
    expect(
      getCortexAddressSearch({
        ...address,
        tipoLogradouro: null,
        numeroLogradouro: 'S/N',
        bairro: ' N/A ',
        municipio: null,
        cep: null,
      }),
    ).toEqual({ street: 'CELSO JOSE ABDALLA SAYEG', region: 'SP' })
  })
})
