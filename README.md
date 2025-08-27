# 🏢 CIVITAS

**Central de Vigilância, Inteligência e Tecnologia de Apoio à Segurança Pública**

Sistema de monitoramento urbano da **Prefeitura do Rio de Janeiro** que integra múltiplas fontes de dados para segurança pública e gestão urbana.

[![Node.js](https://img.shields.io/badge/Node.js-20.11.1-green.svg)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14+-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![pnpm](https://img.shields.io/badge/pnpm-9.15.2-orange.svg)](https://pnpm.io/)
[![Tests](https://img.shields.io/badge/Tests-72%2B%20passing-brightgreen.svg)](https://jestjs.io/)

## 🚀 Funcionalidades

- **🚗 Rastreamento de veículos** por placas e radares
- **📍 Monitoramento geográfico** em tempo real
- **🚨 Alertas de segurança** (Fogo Cruzado, Waze Police)
- **📊 Relatórios e denúncias** integrados
- **🎯 Operações policiais** coordenadas
- **🗺️ Mapas interativos** com múltiplas camadas
- **📱 Interface responsiva** mobile-first

## 🛠️ Stack Tecnológica

### Frontend
- **Framework**: [Next.js 14+](https://nextjs.org/) (App Router)
- **Linguagem**: [TypeScript](https://www.typescriptlang.org/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: [React Query](https://tanstack.com/query) + Context API
- **Date Handling**: [date-fns](https://date-fns.org/) com locale pt-BR
- **Testing**: [Jest](https://jestjs.io/) + [React Testing Library](https://testing-library.com/)

### Ferramentas
- **Package Manager**: [pnpm](https://pnpm.io/)
- **Linting**: ESLint + Prettier
- **CI/CD**: Google Cloud Build
- **Container**: Docker (node:20-alpine)
- **Deployment**: Kubernetes

## 📋 Pré-requisitos

- **Node.js**: 20.11.1 ou superior
- **pnpm**: 9.15.2 ou superior
- **Git**: Versão mais recente

## 🚀 Instalação e Configuração

### 1. Clone o repositório
```bash
git clone <repository-url>
cd civitas-app
```

### 2. Instale as dependências
```bash
# Habilite o corepack (se necessário)
corepack enable
corepack prepare pnpm@9.15.2 --activate

# Instale as dependências
pnpm install
```

### 3. Configure as variáveis de ambiente
```bash
# Copie o arquivo de exemplo
cp .env.example .env.local

# Edite o arquivo .env.local com suas configurações
```

**Variáveis obrigatórias:**
```env
# API URL (desenvolvimento local)
NEXT_PUBLIC_CIVITAS_API_URL="http://localhost:8080"

# Outras variáveis específicas do ambiente...
```

### 4. Inicie o servidor de desenvolvimento
```bash
pnpm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

## 🔐 Autenticação

### Credenciais de Desenvolvimento
- **Usuário**: `test.user`
- **Senha**: `123456`
- **API Local**: `http://localhost:8080`

## 🧪 Testes

### Executar todos os testes
```bash
pnpm run test
```

### Executar testes em modo watch
```bash
pnpm run test:watch
```

### Executar testes com coverage
```bash
pnpm run test:coverage
```

### Executar testes específicos
```bash
# Testes relacionados a date pickers
pnpm run test -- --testPathPatterns="date"

# Testes de componentes específicos
pnpm run test -- --testPathPatterns="date-picker"
```

## 🏗️ Comandos Disponíveis

### 🎯 Makefile (Recomendado)
```bash
# Ver todos os comandos disponíveis
make help

# Desenvolvimento
make install          # Instalar dependências
make dev              # Iniciar servidor de desenvolvimento
make build            # Build para produção
make test             # Executar testes
make lint             # Executar linting
make clean            # Limpar arquivos temporários

# Deploy
make deploy-staging   # Deploy para staging
make deploy-prod      # Deploy para produção

# Rollback
make rollback-staging tag=staging-3.2.0-20241201-143022
make rollback-prod tag=prod-3.2.0-20241201-143022

# Versão
make bump-patch       # Incrementar patch (3.2.0 -> 3.2.1)
make bump-minor       # Incrementar minor (3.2.0 -> 3.3.0)
make bump-major       # Incrementar major (3.2.0 -> 4.0.0)
make bump-custom v=3.3.0  # Versão específica

# Monitoramento
make list-tags        # Listar tags disponíveis
make status-staging   # Status do deployment staging
make status-prod      # Status do deployment produção
make health-staging   # Health check staging
make health-prod      # Health check produção
make logs-staging     # Logs recentes staging
make logs-prod        # Logs recentes produção

# Comandos de conveniência
make quick-deploy     # Deploy rápido para staging
make quick-rollback   # Rollback rápido
make version          # Mostrar versão atual
make info             # Informações do projeto
```

### 📜 Scripts Diretos (Alternativo)
```bash
# Desenvolvimento
pnpm run dev          # Inicia servidor de desenvolvimento
pnpm run build        # Build para produção
pnpm run start        # Inicia servidor de produção

# Qualidade de código
pnpm run lint         # Executa ESLint
pnpm run lint:fix     # Corrige problemas de linting automaticamente
pnpm run type-check   # Verifica tipos TypeScript

# Testes
pnpm run test         # Executa todos os testes
pnpm run test:watch   # Executa testes em modo watch
pnpm run test:coverage # Executa testes com coverage
```

## 📁 Estrutura do Projeto

```
civitas-app/
├── src/
│   ├── app/                    # Next.js App Router
│   │   └── (app)/             # Rotas protegidas
│   │       └── veiculos/      # Módulo de veículos (principal)
│   ├── components/            # Componentes reutilizáveis
│   │   ├── ui/               # shadcn/ui components
│   │   ├── custom/           # Components customizados
│   │   └── providers/        # Context providers
│   ├── hooks/                # Custom hooks
│   ├── lib/                  # Utilities e configurações
│   ├── utils/                # Funções utilitárias
│   ├── contexts/             # React contexts
│   ├── http/                 # HTTP clients e APIs
│   ├── models/               # TypeScript interfaces
│   ├── auth/                 # Autenticação
│   └── __tests__/            # Testes organizados
├── public/                   # Assets estáticos
├── k8s/                      # Kubernetes configs
└── coverage/                 # Relatórios de teste
```

## 🌍 Internacionalização

O projeto está configurado para português brasileiro (pt-BR) com:

- **Date pickers** em português
- **Formatos de data** brasileiros (dd/MM/yyyy)
- **Horários** em formato 24h
- **Configuração centralizada** em `src/lib/date-config.ts`

### Alterando Locale
```typescript
// src/lib/date-config.ts
export const dateConfig = {
  locale: ptBR,  // Alterar aqui afeta todo o projeto
  // ...
}
```

## 🚀 Deploy

### Ambientes
- **Local**: `http://localhost:3000`
- **Staging**: URLs de staging da Prefeitura
- **Produção**: URLs de produção da Prefeitura

### Pipeline CI/CD
O projeto usa Google Cloud Build com:
- **Testes automatizados** antes do deploy
- **Build otimizado** para produção
- **Deploy automático** para Kubernetes

## 🔧 Desenvolvimento

### Convenções de Commits
```bash
feat: nova funcionalidade
fix: correção de bug
docs: documentação
style: formatação
refactor: refatoração
test: testes
chore: configuração/build
```

### Troubleshooting

#### Erro: "pnpm: command not found"
```bash
corepack enable
corepack prepare pnpm@9.15.2 --activate
```

#### Servidor não conecta com API local
Verifique se o `.env.local` tem:
```env
NEXT_PUBLIC_CIVITAS_API_URL="http://localhost:8080"  # COM http://
```


## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Suporte

Para suporte técnico ou dúvidas sobre o projeto, entre em contato com a equipe de desenvolvimento da Prefeitura do Rio de Janeiro.

## 📄 Licença

Este projeto é propriedade da **Prefeitura do Rio de Janeiro** e está sob licença interna.

---

**Desenvolvido com ❤️ pela equipe de TI da Prefeitura do Rio de Janeiro**

