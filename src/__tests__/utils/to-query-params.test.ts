import { toQueryParams } from '@/utils/to-query-params'

describe('toQueryParams', () => {
  it('deve converter objeto simples para URLSearchParams', () => {
    const data = {
      name: 'test',
      value: '123',
    }

    const result = toQueryParams(data)

    expect(result.get('name')).toBe('test')
    expect(result.get('value')).toBe('123')
  })

  it('deve converter arrays para múltiplos parâmetros', () => {
    const data = {
      items: ['item1', 'item2', 'item3'],
    }

    const result = toQueryParams(data)

    expect(result.getAll('items')).toEqual(['item1', 'item2', 'item3'])
  })

  it('deve converter datas para ISO string', () => {
    const date = new Date('2024-01-15T10:00:00.000Z')
    const data = {
      startDate: date,
    }

    const result = toQueryParams(data)

    expect(result.get('startDate')).toBe('2024-01-15T10:00:00.000Z')
  })

  it('deve converter objetos aninhados com datas', () => {
    const startDate = new Date('2024-01-15T10:00:00.000Z')
    const endDate = new Date('2024-01-15T12:00:00.000Z')

    const data = {
      date: {
        from: startDate,
        to: endDate,
      },
      plate: 'ABC1234',
      radarIds: ['RADAR001', 'RADAR002'],
    }

    const result = toQueryParams(data)

    expect(result.get('from')).toBe('2024-01-15T10:00:00.000Z')
    expect(result.get('to')).toBe('2024-01-15T12:00:00.000Z')
    expect(result.get('plate')).toBe('ABC1234')
    expect(result.getAll('radarIds')).toEqual(['RADAR001', 'RADAR002'])
  })

  it('deve converter objetos aninhados com tipos primitivos', () => {
    const data = {
      config: {
        enabled: true,
        count: 42,
        name: 'test',
      },
    }

    const result = toQueryParams(data)

    expect(result.get('enabled')).toBe('true')
    expect(result.get('count')).toBe('42')
    expect(result.get('name')).toBe('test')
  })

  it('deve ignorar valores falsy', () => {
    const data = {
      name: '',
      value: null,
      test: undefined,
      valid: 'ok',
    }

    const result = toQueryParams(data)

    expect(result.get('name')).toBeNull()
    expect(result.get('value')).toBeNull()
    expect(result.get('test')).toBeNull()
    expect(result.get('valid')).toBe('ok')
  })

  it('deve converter dados do formulário de busca por radar corretamente', () => {
    const startDate = new Date('2024-01-15T10:00:00.000Z')
    const endDate = new Date('2024-01-15T12:00:00.000Z')

    const formData = {
      startDate,
      endDate,
      plate: 'ABC1234',
      radarIds: ['RADAR001', 'RADAR002'],
    }

    const result = toQueryParams(formData)

    expect(result.get('startDate')).toBe('2024-01-15T10:00:00.000Z')
    expect(result.get('endDate')).toBe('2024-01-15T12:00:00.000Z')
    expect(result.get('plate')).toBe('ABC1234')
    expect(result.getAll('radarIds')).toEqual(['RADAR001', 'RADAR002'])
  })

  it('deve gerar string de query válida', () => {
    const startDate = new Date('2024-01-15T10:00:00.000Z')
    const endDate = new Date('2024-01-15T12:00:00.000Z')

    const formData = {
      startDate,
      endDate,
      plate: 'ABC1234',
      radarIds: ['RADAR001'],
    }

    const result = toQueryParams(formData)
    const queryString = result.toString()

    expect(queryString).toContain('startDate=2024-01-15T10%3A00%3A00.000Z')
    expect(queryString).toContain('endDate=2024-01-15T12%3A00%3A00.000Z')
    expect(queryString).toContain('plate=ABC1234')
    expect(queryString).toContain('radarIds=RADAR001')
  })
})
