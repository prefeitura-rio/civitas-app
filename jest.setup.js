// Importar extensões de Date para garantir que sejam carregadas nos testes
import './src/utils/date-extensions'
import './src/utils/string-extensions'
import '@testing-library/jest-dom'

// Mock das variáveis de ambiente para os testes
process.env.NEXT_PUBLIC_CIVITAS_API_URL = 'http://localhost:3000'
process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN = 'test-mapbox-token'

// Mock do ResizeObserver para testes
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Silenciar completamente console.error durante os testes para limpar a saída
beforeAll(() => {
  console.error = jest.fn()
})

afterAll(() => {
  jest.restoreAllMocks()
})
