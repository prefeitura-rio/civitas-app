# Testes Unitários - CIVITAS

Este diretório contém os testes unitários para o projeto CIVITAS.

## Estrutura dos Testes

```
src/__tests__/
├── utils/                           # Testes para funções utilitárias
│   ├── validate-cpf.test.ts        # Validação de CPF
│   ├── validate-cnpj.test.ts       # Validação de CNPJ
│   ├── haversine-distance.test.ts  # Cálculo de distância entre coordenadas
│   ├── string-extensions.test.ts   # Extensões de string
│   └── calculate-color-gradient.test.ts # Cálculo de gradiente de cores
└── README.md                        # Este arquivo
```

## Executando os Testes

### Todos os testes
```bash
pnpm test
```

### Testes em modo watch (re-executa automaticamente quando arquivos mudam)
```bash
pnpm test:watch
```

### Testes com relatório de cobertura
```bash
pnpm test:coverage
```

## Tecnologias Utilizadas

- **Jest**: Framework de testes
- **@testing-library/react**: Utilitários para testar componentes React
- **@testing-library/jest-dom**: Matchers customizados para DOM
- **@testing-library/user-event**: Simulação de interações do usuário

## Convenções

### Estrutura dos Testes
- Organize testes em blocos `describe` por funcionalidade
- Use `describe` aninhados para casos específicos
- Nomeie testes com `it` ou `test` de forma descritiva

### Nomenclatura
- Arquivos de teste devem ter o sufixo `.test.ts` ou `.test.tsx`
- Coloque os testes próximos ao código que testam (mesma estrutura de pastas)

### Exemplo de Estrutura
```typescript
describe('NomeDaFuncao', () => {
  describe('when condition', () => {
    it('should do something', () => {
      // Arrange
      const input = 'test'
      
      // Act
      const result = myFunction(input)
      
      // Assert
      expect(result).toBe('expected')
    })
  })
  
  describe('edge cases', () => {
    it('should handle empty input', () => {
      expect(myFunction('')).toBe('')
    })
  })
})
```

## Cobertura de Testes

Os testes estão configurados para coletar métricas de cobertura dos seguintes diretórios:
- `src/**/*.{js,jsx,ts,tsx}`

Excluindo:
- Arquivos de definição de tipos (`*.d.ts`)
- Layouts e páginas do Next.js
- Arquivos de CSS

## Contribuindo

Ao adicionar novos testes:

1. Siga a estrutura de pastas existente
2. Teste casos de sucesso, erro e edge cases
3. Use nomes descritivos para os testes
4. Adicione comentários quando necessário
5. Mantenha os testes simples e focados

## Mocks Configurados

Os seguintes mocks estão configurados globalmente no `jest.setup.js`:

- `next/navigation`: Para hooks de roteamento do Next.js
- `next/image`: Para o componente Image do Next.js
- `mapbox-gl`: Para funcionalidades de mapa

## Links Úteis

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library](https://testing-library.com/docs/)
- [Next.js Testing](https://nextjs.org/docs/testing)
