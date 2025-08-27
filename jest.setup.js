// Importar extensões de Date para garantir que sejam carregadas nos testes
import './src/utils/date-extensions'
import './src/utils/string-extensions'
import '@testing-library/jest-dom'

// Silenciar completamente console.error durante os testes para limpar a saída
beforeAll(() => {
  console.error = jest.fn()
})

afterAll(() => {
  jest.restoreAllMocks()
})
