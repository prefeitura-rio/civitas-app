# Contexto Completo - Civitas App

## 🏢 Sobre o Projeto

### **O que é o Civitas**
O **Civitas** é um sistema de monitoramento urbano da **Prefeitura do Rio de Janeiro** que integra múltiplas fontes de dados para segurança pública e gestão urbana:

- **🚗 Rastreamento de veículos** por placas e radares
- **📍 Monitoramento geográfico** em tempo real
- **🚨 Alertas de segurança** (Fogo Cruzado, Waze Police)
- **📊 Relatórios e denúncias** integrados
- **🎯 Operações policiais** coordenadas

### **Arquitetura do Sistema**
- **Frontend**: Next.js 14+ com TypeScript e React
- **Backend**: API REST (porta 8080 local)
- **Banco de dados**: Sistema de paginação avançado
- **Mapas**: Sistema de mapas customizado com múltiplas camadas
- **Autenticação**: Sistema próprio com roles de usuário
- **Deploy**: Google Cloud Build + Kubernetes

---

## 🛠️ Stack Tecnológica

### **Frontend**
- **Framework**: Next.js 14+ (App Router)
- **Linguagem**: TypeScript
- **UI Components**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS
- **State Management**: React Query + Context API
- **Maps**: Sistema de mapas customizado
- **Date Handling**: date-fns com locale pt-BR
- **Testing**: Jest + React Testing Library
- **Package Manager**: pnpm

### **Ferramentas de Desenvolvimento**
- **Linting**: ESLint + Prettier
- **Type Checking**: TypeScript strict mode
- **Git Hooks**: Husky (pre-commit)
- **CI/CD**: Google Cloud Build
- **Container**: Docker (node:20-alpine)
- **Deployment**: Kubernetes

### **Bibliotecas Principais**
```json
{
  "@tanstack/react-query": "Query state management",
  "date-fns": "Date manipulation",
  "axios": "HTTP client",
  "tailwindcss": "CSS framework",
  "@radix-ui/*": "UI primitives",
  "react-hook-form": "Form handling",
  "zod": "Schema validation"
}
```

---

## 📁 Estrutura do Projeto

### **Diretórios Principais**
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

### **Módulos Funcionais**

#### **🚗 Módulo de Veículos** (`src/app/(app)/veiculos/`)
- **Busca por Placa**: Pesquisa e tracking de veículos
- **Busca por Radar**: Detecções de radar em tempo real
- **Resultado Enriquecido**: Dados complementares de detecções
- **Mapas Interativos**: Visualização geográfica com múltiplas camadas
- **Relatórios**: Exportação e análise de dados

#### **🗺️ Sistema de Mapas** (`components/map/`)
- **Context Menus**: Informações contextuais por clique
- **Hover Cards**: Tooltips informativos
- **Layers**: Múltiplas camadas (radares, alertas, etc.)
- **Controls**: Controles customizados de navegação

#### **📊 Sistema de Relatórios**
- **Date Range Pickers**: Seleção de períodos
- **Filtros Dinâmicos**: Filtros avançados por múltiplos critérios
- **Exportação**: CSV e outros formatos
- **Paginação**: Sistema robusto de paginação

---

## 🔐 Sistema de Autenticação

### **Credenciais de Desenvolvimento**
- **Usuário**: `test.user`
- **Senha**: `123456`
- **API Local**: `http://localhost:8080`

### **Fluxo de Auth**
1. Login via API REST
2. Token JWT armazenado
3. Middleware de autenticação no Next.js
4. Redirecionamento automático se não autenticado

### **Arquivos de Auth**
- `src/auth/auth.ts` - Configuração principal
- `src/middleware.ts` - Middleware Next.js
- `.env` - URLs da API por ambiente

---

## 🌍 Internacionalização

### **Configuração de Locale**
- **Idioma**: Português brasileiro (pt-BR)
- **Datas**: Formato dd/MM/yyyy
- **Horários**: 24h (HH:mm)
- **Números**: Formato brasileiro

### **Implementação**
```typescript
// src/lib/date-config.ts
export const dateConfig = {
  locale: ptBR,              // date-fns locale
  defaultTime: { /* 00:00 */ },
  maxTime: { /* 23:59:59 */ },
  formats: { /* formatos pt-BR */ }
}
```

---

## 🧩 Componentes Principais

### **Date Pickers** (Recém-migrados para pt-BR)
- `DatePicker` - Seleção de data simples
- `DateRangePicker` - Seleção de intervalo
- `DateTimePicker` - Data + hora
- `DatePickerWithRange` - Range com time picker

### **Mapas**
- `MapComponent` - Mapa principal
- `HoverCard` - Cards informativos
- `ContextMenu` - Menus contextuais
- `MapControls` - Controles customizados

### **UI Básica** (shadcn/ui)
- `Button`, `Input`, `Select`
- `Dialog`, `Popover`, `Tooltip`
- `Table`, `Card`, `Badge`
- `Calendar` - Base dos date pickers

### **Providers**
- `QueryClientProvider` - React Query
- `I18nProvider` - Internacionalização
- `MapContextProvider` - Estado dos mapas
- `SidebarContextProvider` - Estado da sidebar

---

## 🔍 Funcionalidades de Busca

### **Busca por Placa**
- Input de placa com validação
- Histórico de detecções
- Visualização em mapa
- Filtros por período
- Exportação de dados

### **Busca por Radar**
- Seleção de radares específicos
- Detecções em tempo real
- Resultado enriquecido com dados extras
- Integração com mapas
- Filtros avançados

### **Filtros Dinâmicos**
Hooks customizados para filtros:
- `use-search-by-plate-result-dynamic-filter`
- `use-search-by-radar-result-dynamic-filter`
- `use-search-by-plate-enhanced-result-dynamic-filter`
- `use-search-by-radar-enhanced-result-dynamic-filter`

---

## 📊 Sistema de Dados

### **Entidades Principais**
```typescript
// src/models/entities.d.ts
interface Detection {
  id: string
  plate: string
  timestamp: Date
  location: Location
  radar: Radar
  // ... outros campos
}

interface Vehicle {
  plate: string
  detections: Detection[]
  // ... outros campos
}
```

### **Paginação**
```typescript
// src/models/pagination.d.ts
interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}
```

### **APIs**
- `src/lib/api.ts` - Cliente HTTP principal
- `src/http/` - Endpoints específicos
- URLs configuráveis por ambiente

---

## 🧪 Sistema de Testes

### **Configuração**
- **Framework**: Jest + React Testing Library
- **Setup**: `jest.setup.js` + `jest.config.js`
- **Coverage**: Relatórios em `coverage/`
- **Warnings**: Suprimidos para console limpo

### **Tipos de Teste**
1. **Componentes UI**: Renderização e interação
2. **Hooks**: Lógica customizada
3. **Utils**: Funções utilitárias
4. **Formatação**: Datas e strings
5. **Configuração**: Validação de configs

### **Comandos**
```bash
pnpm run test                    # Todos os testes
pnpm run test:watch             # Watch mode
pnpm run test:coverage          # Com coverage
pnpm run test -- --testPathPatterns="date"  # Testes específicos
```

---

## 🚀 Deploy e CI/CD

### **Ambientes**
- **Local**: `http://localhost:3000`
- **Staging**: URLs de staging da Prefeitura
- **Produção**: URLs de produção da Prefeitura

### **Pipeline Google Cloud Build**
```yaml
# cloudbuild-staging.yaml & cloudbuild-prod.yaml
steps:
  - name: "node:20-alpine"        # Testes
  - name: "gcr.io/cloud-builders/docker"  # Build
  - name: "gcr.io/cloud-builders/kubectl" # Deploy K8s
```

### **Kubernetes**
- Configs em `k8s/staging/` e `k8s/prod/`
- Resources e kustomization
- Rolling updates

---

## 🔧 Ferramentas e Utils

### **Date Extensions** (`src/utils/date-extensions.ts`)
Métodos customizados adicionados ao `Date.prototype`:
```typescript
Date.prototype.setMinTime()    // 00:00:00
Date.prototype.setMaxTime()    // 23:59:59
Date.prototype.setCurrentTime() // Hora atual
Date.prototype.addDays(n)      // Adicionar dias
Date.prototype.addHours(n)     // Adicionar horas
```

### **Validações** (`src/utils/`)
- `validate-cpf.ts` - Validação de CPF
- `validate-cnpj.ts` - Validação de CNPJ
- `zod-schemas.ts` - Schemas de validação

### **Formatters** (`src/utils/`)
- `string-formatters.ts` - Formatação de strings
- `formatLocation.ts` - Formatação de coordenadas
- `format-reports-request.ts` - Formatação de requests

### **Específicos do Rio** (`src/utils/`)
- `rio-viewport.ts` - Viewport padrão do Rio de Janeiro
- `getBoundingBox.ts` - Cálculo de bounding boxes
- `haversine-distance.ts` - Distância entre coordenadas

---

## 🎨 Design System

### **Tema e Cores**
- **Primary**: Azul da Prefeitura do Rio
- **Assets**: Logos oficiais em `src/assets/`
- **Icons**: Atlas de ícones customizados
- **Responsive**: Mobile-first design

### **Componentes de Layout**
- Sidebar retrátil
- Header com navegação
- Main content area
- Footer com informações

---

## 🔍 Integrações Externas

### **Fogo Cruzado**
- API de alertas de violência
- Visualização em mapa
- Context menu com detalhes

### **Waze Police Alerts**
- Alertas de polícia do Waze
- Integração em tempo real
- Markers no mapa

### **Disque Denúncia**
- Sistema de denúncias
- Logo oficial integrado

---

## 📋 Resumo Geral da Sessão
**Objetivo**: Migrar todos os date pickers do projeto para português brasileiro (pt-BR) e centralizar configurações de data/locale.

**Status**: ✅ **CONCLUÍDO COM SUCESSO**

---

## 🎯 Tarefas Solicitadas e Executadas

### 1. **Mudança de Branch**
- ✅ Criada branch `feature/datepicker-pt-br` a partir da branch atual
- ✅ Mudança realizada com sucesso

### 2. **Localização dos Date Pickers**
- ✅ Todos os date pickers alterados de inglês para português (pt-BR)
- ✅ Configuração centralizada criada em `src/lib/date-config.ts`

### 3. **Horário Padrão**
- ✅ Date pickers sempre começam em **00:00** quando selecionada nova data
- ✅ Horário máximo **23:59:59.999** também centralizado

### 4. **Testes**
- ✅ Criados testes abrangentes para validar funcionalidade pt-BR
- ✅ 72+ testes passando
- ✅ Warnings de teste silenciados para console limpo

### 5. **CI/CD Pipeline**
- ✅ Adicionados testes aos pipelines de staging e produção
- ✅ Versões do Node.js corrigidas (18 → 20-alpine)
- ✅ Uso correto do pnpm ao invés de npm

---

## 🏗️ Arquitetura Implementada

### **Arquivo Central de Configuração**
`src/lib/date-config.ts`:
```typescript
import { ptBR } from 'date-fns/locale'

export const dateConfig = {
  locale: ptBR,                    // Locale pt-BR centralizado
  defaultTime: {                   // Horário padrão 00:00
    hours: 0,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
  },
  maxTime: {                       // Horário máximo 23:59:59.999
    hours: 23,
    minutes: 59,
    seconds: 59,
    milliseconds: 999,
  },
  formats: {                       // Formatos de data comuns
    dateTime: 'dd MMM, y HH:mm',
    date: 'dd/MM/yyyy',
    time: 'HH:mm',
    full: "EEEE, dd 'de' MMMM 'de' yyyy",
  },
} as const
```

### **Uso nos Componentes**
- **ANTES**: `import { ptBR } from 'date-fns/locale'` + `locale: ptBR`
- **DEPOIS**: `import { dateConfig } from '@/lib/date-config'` + `locale: dateConfig.locale`

---

## 📁 Arquivos Modificados

### **Componentes de Date Picker**
- `src/components/ui/date-picker.tsx` - Date picker principal
- `src/components/custom/date-range-picker.tsx` - Range picker principal
- `src/components/custom/date-range-picker-v2.tsx` - Range picker v2
- `src/components/custom/date-time-picker.tsx` - Date time picker com LocaleProvider

### **Provider de Internacionalização**
- `src/components/providers/i18n-provider.tsx` - Wrapper para React Aria I18nProvider

### **Utilities**
- `src/utils/date-extensions.ts` - Métodos customizados de Date usando dateConfig
- `src/utils/set-all-values.ts` - Utility que usa formatação de data

### **Componentes do Mapa**
- `src/app/(app)/veiculos/components/map/components/context-menu/components/fogo-cruzado-info.tsx`
- `src/app/(app)/veiculos/components/map/components/context-menu/components/radar-info.tsx`
- `src/app/(app)/veiculos/components/map/components/context-menu/components/waze-police-alert-info.tsx`
- `src/app/(app)/veiculos/components/map/components/hover-cards/detection-point-hover-card.tsx`

### **26+ Arquivos Adicionais**
Todos os arquivos que usavam `ptBR` foram atualizados sistematicamente para usar `dateConfig.locale`.

---

## 🧪 Testes Criados

### **Testes de Componentes**
- `src/__tests__/components/ui/date-picker.test.tsx` - Teste do DatePicker
- `src/__tests__/components/custom/date-range-picker.test.tsx` - Teste do DatePickerWithRange
- `src/__tests__/components/providers/i18n-provider.test.tsx` - Teste do LocaleProvider

### **Testes de Configuração**
- `src/__tests__/lib/date-config.test.ts` - Teste da configuração centralizada

### **Testes de Formatação**
- `src/__tests__/utils/date-formatting.test.ts` - Testes extensivos de formatação pt-BR

### **Configuração de Testes**
- `jest.setup.js` - Supressão de warnings React para console limpo
- `src/types/global.d.ts` - Tipos globais Jest DOM

---

## 🚀 Pipeline CI/CD

### **Arquivos de Build Atualizados**
- `cloudbuild-staging.yaml`
- `cloudbuild-prod.yaml`

### **Melhorias Implementadas**
```yaml
# Novo step adicionado:
- name: "node:20-alpine"
  entrypoint: "bash"
  args:
    - "-c"
    - |
      corepack enable && \
      corepack prepare pnpm@9.15.2 --activate && \
      pnpm install --frozen-lockfile && \
      pnpm run test -- --passWithNoTests --watchAll=false --coverage=false
```

---

## 🔧 Problemas Resolvidos

### 1. **Erro de Login**
- **Problema**: URL da API sem protocolo (`localhost:8080`)
- **Solução**: Corrigido para `http://localhost:8080` no `.env`

### 2. **Erros de Sintaxe TypeScript**
- **Problema**: Métodos Date customizados não reconhecidos
- **Solução**: Refatoração para usar implementação nativa + dateConfig

### 3. **Erros de Sintaxe JSX**
- **Problema**: Múltiplos arquivos com sintaxe quebrada após script automático
- **Solução**: Restauração sistemática do commit funcional + aplicação controlada das mudanças

### 4. **Imports Duplicados**
- **Problema**: Script criou imports duplicados de dateConfig
- **Solução**: Script de limpeza automática

### 5. **Versões Inconsistentes no Pipeline**
- **Problema**: Pipeline usava Node.js 18, projeto usa Node.js 20
- **Solução**: Alinhamento para node:20-alpine + pnpm

---

## 🎯 Funcionalidades Implementadas

### **Date Pickers em Português**
- ✅ Meses em português (jan, fev, mar, etc.)
- ✅ Dias da semana em português
- ✅ Formatos de data brasileiros (dd/MM/yyyy)
- ✅ Horário padrão 00:00 para novas seleções

### **Configuração Centralizada**
- ✅ Um único local para alterar locale
- ✅ Horários (mínimo/máximo) centralizados
- ✅ Formatos de data padronizados
- ✅ Fácil manutenção futura

### **Testes Robustos**
- ✅ Validação de formatação pt-BR
- ✅ Teste de componentes date picker
- ✅ Teste de configuração centralizada
- ✅ Console limpo (warnings suprimidos)

### **Pipeline Melhorado**
- ✅ Testes executados antes de deploy
- ✅ Versões consistentes (Node.js 20 + pnpm)
- ✅ Falha de deploy se testes falharem

---

## 📊 Estatísticas do Projeto

- **Commits realizados**: 7 commits principais
- **Arquivos modificados**: 33+ arquivos
- **Testes criados**: 5+ arquivos de teste
- **Linhas de código**: 900+ modificações
- **Testes passando**: 72+ testes

---

## 🛠️ Como Usar (Para Desenvolvedores)

### **Para alterar locale:**
```typescript
// Editar apenas: src/lib/date-config.ts
export const dateConfig = {
  locale: ptBR,  // Alterar aqui afeta todo o projeto
  // ...
}
```

### **Para alterar horário padrão:**
```typescript
// No mesmo arquivo:
defaultTime: {
  hours: 8,      // Novo padrão: 08:00
  minutes: 0,
  seconds: 0,
  milliseconds: 0,
}
```

### **Para executar testes:**
```bash
# Todos os testes
pnpm run test

# Testes relacionados a data
pnpm run test -- --testPathPatterns="date"

# Com coverage
pnpm run test:coverage
```

---

## 🚨 Pontos de Atenção

### **Para Futuras Modificações:**
1. **SEMPRE** usar `dateConfig.locale` ao invés de `ptBR` diretamente
2. **SEMPRE** testar após mudanças nos date pickers
3. **VERIFICAR** se o servidor compila sem erros antes de commit
4. **USAR** pnpm (não npm) para consistência

### **Se Houver Problemas:**
1. Verificar se imports do `dateConfig` estão corretos
2. Verificar se não há imports duplicados
3. Rodar testes para verificar se funcionalidade não quebrou
4. Em caso de erro de sintaxe, restaurar do commit funcional

---

## 🎉 Status Final

**TUDO FUNCIONANDO PERFEITAMENTE! ✅**

- ✅ Date pickers em português brasileiro
- ✅ Horário padrão 00:00 
- ✅ Configuração centralizada
- ✅ Testes passando (72+)
- ✅ Pipeline com validação
- ✅ Servidor rodando sem erros
- ✅ Login funcionando (credenciais: test.user / 123456)

**O projeto está pronto para uso em produção! 🚀**

---

## 📞 Informações Adicionais

- **Branch**: `feature/datepicker-pt-br`
- **Última atualização**: 27 de agosto de 2025
- **Versão Node.js**: 20.11.1
- **Package Manager**: pnpm
- **Servidor local**: http://localhost:3000
- **API local**: http://localhost:8080

**Este documento contém todo o contexto necessário para dar continuidade ao trabalho! 📝**
