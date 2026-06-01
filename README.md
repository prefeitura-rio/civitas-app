# CIVITAS
Central de Vigilância, Inteligência e Tecnologia de Apoio à Segurança Pública

## 🚀 Tecnologias

- **Framework**: Next.js 14
- **Linguagem**: TypeScript
- **Gerenciador de Pacotes**: pnpm
- **UI**: Tailwind CSS + Radix UI
- **Testes**: Jest + React Testing Library
- **Linting**: ESLint + Prettier
- **CI/CD**: Google Cloud Build

## 📋 Pré-requisitos

- Node.js 18+ 
- pnpm 8.9.0+
- Git

## 🛠️ Primeiros Passos

### 1. Clone o repositório
```bash
git clone https://github.com/prefeitura-rio/civitas-app.git
cd civitas-app
```

### 2. Instale as dependências
```bash
pnpm install
```

### 3. Configure as variáveis de ambiente
Crie o arquivo `.env.local` baseado no `.env.example`:
```bash
cp .env.example .env.local
# Edite o arquivo com suas configurações
```

Variáveis de autenticação/sessão (server-side, não usar `NEXT_PUBLIC_`):
- `AUTH_SESSION_SECRET`
- `AUTH_COOKIE_SECURE` (`true`/`false`)
- `AUTH_COOKIE_SAMESITE` (`lax`/`strict`/`none`)
- `AUTH_TOKEN_PATH`
- `AUTH_ACCESS_TOKEN_REFRESH_LEEWAY_SECONDS`
- `AUTH_SHORT_IDLE_TIMEOUT_SECONDS`
- `AUTH_SHORT_ABSOLUTE_TIMEOUT_SECONDS`
- `AUTH_LONG_IDLE_TIMEOUT_SECONDS`
- `AUTH_LONG_ABSOLUTE_TIMEOUT_SECONDS`

Sobre timeout de sessão:
- `idle timeout`: encerra sessão após inatividade.
- `absolute timeout`: encerra sessão após tempo total máximo, mesmo com atividade.
- os dois devem ser usados juntos para reduzir risco de sessão esquecida e sessão infinita.

### 4. Inicie o servidor de desenvolvimento
```bash
pnpm dev
```

Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

## 🧪 Testes

### Executar todos os testes
```bash
pnpm test
```

### Executar testes em modo watch
```bash
pnpm test:watch
```

### Executar testes com coverage
```bash
pnpm test:coverage
```

### Executar testes específicos
```bash
pnpm test src/__tests__/components/ui/button.test.tsx
```

## 🏗️ Build e Deploy

### Build de produção
```bash
pnpm build
```

### Verificação de tipos
```bash
pnpm type-check
```

### Linting
```bash
pnpm lint
pnpm lint:fix
```

## 📁 Estrutura do Projeto

```
src/
├── app/                    # App Router do Next.js
├── components/            # Componentes React
│   ├── ui/               # Componentes base (Button, Input, etc.)
│   └── custom/           # Componentes específicos da aplicação
├── hooks/                 # Custom hooks
├── lib/                   # Utilitários e configurações
├── types/                 # Definições de tipos TypeScript
├── utils/                 # Funções utilitárias
└── __tests__/            # Testes organizados por estrutura
```

## 🔧 Scripts Disponíveis

- `pnpm dev` - Servidor de desenvolvimento
- `pnpm build` - Build de produção
- `pnpm start` - Servidor de produção
- `pnpm test` - Executar testes
- `pnpm test:coverage` - Testes com coverage
- `pnpm lint` - Verificar código
- `pnpm lint:fix` - Corrigir problemas de linting
- `pnpm type-check` - Verificar tipos TypeScript

## 🚨 Troubleshooting

### Problemas com dependências
Se houver problemas com dependências, tente:
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Problemas de tipos
Para verificar problemas de TypeScript:
```bash
pnpm type-check
```

## 📝 Contribuindo

1. Crie uma branch para sua feature
2. Faça commit das suas mudanças
3. Execute os testes: `pnpm test`
4. Verifique o linting: `pnpm lint`
5. Abra um Pull Request

---

**Desenvolvido com ❤️ pela equipe da Prefeitura do Rio de Janeiro**
