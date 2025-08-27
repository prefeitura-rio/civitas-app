# 🚀 Scripts de Deploy e Rollback - Civitas App

Este diretório contém scripts para gerenciar deployments, tags e rollbacks do projeto Civitas.

## 📁 Scripts Disponíveis

### 🔄 `rollback.sh` - Script de Rollback
Script para fazer rollback de deployments para versões anteriores.

### 🏷️ `manage-tags.sh` - Gerenciamento de Tags
Script para listar, gerenciar e monitorar tags e deployments.

### 📦 `version-check.sh` - Verificação de Versão
Script para verificar se a versão do package.json mudou e só fazer deploy se mudou.

### 🚀 `bump-version.sh` - Atualização de Versão
Script para atualizar versão no package.json e trigger deploy automático.

## 🔄 Rollback

### Uso Básico
```bash
./scripts/rollback.sh [ambiente] [tag_ou_commit]
```

### Exemplos
```bash
# Rollback para uma tag específica
./scripts/rollback.sh prod prod-20241201-143022

# Rollback para um commit específico
./scripts/rollback.sh staging abc123def456

# Rollback para a versão latest
./scripts/rollback.sh prod latest

# Rollback rápido (versão anterior)
./scripts/rollback.sh prod undo

# Listar deployments disponíveis
./scripts/rollback.sh prod list

# Mostrar histórico de deployments
./scripts/rollback.sh prod history
```

### Funcionalidades
- ✅ **Validação** de versões existentes
- ✅ **Confirmação** antes do rollback
- ✅ **Rollback automático** em caso de falha
- ✅ **Verificação** de status após rollback
- ✅ **Suporte** a tags Git e commits SHA

## 🏷️ Gerenciamento de Tags

### Uso Básico
```bash
./scripts/manage-tags.sh [comando] [opções]
```

## 📦 Verificação de Versão

### Uso Básico
```bash
./scripts/version-check.sh [ambiente]
```

### Exemplos
```bash
# Verificar se deve fazer deploy para staging
./scripts/version-check.sh staging

# Verificar se deve fazer deploy para produção
./scripts/version-check.sh prod
```

### Funcionalidades
- ✅ **Lê versão** do package.json
- ✅ **Compara** com última tag do ambiente
- ✅ **Cria tag** se versão mudou
- ✅ **Só faz deploy** se versão mudou
- ✅ **Previne deploys** desnecessários

## 🚀 Atualização de Versão

### Uso Básico
```bash
./scripts/bump-version.sh [tipo] [ambiente] [versão_custom]
```

### Exemplos
```bash
# Incrementar patch (3.2.0 -> 3.2.1)
./scripts/bump-version.sh patch staging

# Incrementar minor (3.2.0 -> 3.3.0)
./scripts/bump-version.sh minor prod

# Incrementar major (3.2.0 -> 4.0.0)
./scripts/bump-version.sh major prod

# Definir versão específica
./scripts/bump-version.sh custom 3.3.0 staging
```

### Funcionalidades
- ✅ **Atualiza versão** no package.json
- ✅ **Cria commit** automático
- ✅ **Faz push** para origin
- ✅ **Trigger deploy** automático
- ✅ **Confirmação** antes do deploy

### Comandos Disponíveis

#### 📋 Listagem
```bash
# Listar todas as tags
./scripts/manage-tags.sh list

# Listar apenas tags de produção
./scripts/manage-tags.sh list-prod

# Listar apenas tags de staging
./scripts/manage-tags.sh list-staging
```

#### ℹ️ Informações
```bash
# Informações detalhadas de uma tag
./scripts/manage-tags.sh info prod-20241201-143022
```

#### 🗑️ Limpeza
```bash
# Deletar uma tag específica
./scripts/manage-tags.sh delete staging-20241115-120000

# Limpar tags antigas (padrão: 30 dias)
./scripts/manage-tags.sh cleanup 7
```

#### 🔍 Monitoramento
```bash
# Verificar saúde da aplicação
./scripts/manage-tags.sh health prod

# Mostrar logs recentes
./scripts/manage-tags.sh logs staging

# Mostrar status do deployment
./scripts/manage-tags.sh status prod
```

## 🏗️ Pipeline Melhorado

### Tags Automáticas
O pipeline agora cria automaticamente:

1. **Tag com versão**: `prod-3.2.0-20241201-143022`
2. **Tag latest**: `latest`
3. **Tag com commit SHA**: `abc123def456`

### Deploy Inteligente
- **Só faz deploy** se versão do package.json mudou
- **Previne deploys** desnecessários
- **Tags organizadas** por versão e ambiente
- **Histórico completo** de versões

### Armazenamento de Histórico
- **Google Cloud Storage**: `gs://datario-deployments/prod/`
- **Arquivos de info**: `deployment-info-20241201-143022.txt`
- **Metadados**: timestamp, commit, branch, imagem

### Health Check
- **Verificação automática** após deploy
- **Timeout**: 30 segundos
- **URL**: `https://civitas.rio/health`

## 🎯 Como Fazer Rollback

### 1. Listar Versões Disponíveis
```bash
./scripts/manage-tags.sh list-prod
```

### 2. Escolher Versão Alvo
```bash
# Por tag
./scripts/rollback.sh prod prod-3.2.0-20241201-143022

# Por commit
./scripts/rollback.sh prod abc123def456

# Rollback rápido
./scripts/rollback.sh prod undo
```

## 🚀 Como Fazer Deploy

### 1. Atualizar Versão
```bash
# Patch (bugfix)
./scripts/bump-version.sh patch staging

# Minor (nova feature)
./scripts/bump-version.sh minor prod

# Major (breaking change)
./scripts/bump-version.sh major prod

# Versão específica
./scripts/bump-version.sh custom 3.3.0 staging
```

### 2. Deploy Automático
- ✅ **Versão atualizada** no package.json
- ✅ **Commit criado** automaticamente
- ✅ **Push enviado** para origin
- ✅ **Cloud Build** executado automaticamente
- ✅ **Tag criada** com versão e timestamp
- ✅ **Aplicação deployada** no ambiente

### 3. Confirmar Rollback
O script pedirá confirmação antes de executar.

### 4. Verificar Status
```bash
./scripts/manage-tags.sh status prod
./scripts/manage-tags.sh health prod
```

## 🔧 Configurações

### Variáveis de Ambiente
```bash
PROJECT_ID="datario"
CLUSTER_NAME="datario"
LOCATION="us-central1"
```

### URLs dos Ambientes
- **Staging**: `https://staging.civitas.rio`
- **Produção**: `https://civitas.rio`

## 🚨 Troubleshooting

### Erro: "kubectl não encontrado"
```bash
# Instalar kubectl
gcloud components install kubectl
```

### Erro: "gcloud não encontrado"
```bash
# Instalar Google Cloud SDK
curl https://sdk.cloud.google.com | bash
```

### Erro: "Cluster não acessível"
```bash
# Configurar credenciais
gcloud container clusters get-credentials datario --zone us-central1 --project datario
```

### Rollback Falhou
```bash
# Verificar logs
./scripts/manage-tags.sh logs prod

# Tentar rollback manual
kubectl rollout undo deployment/civitas -n default
```

## 📊 Monitoramento

### Verificar Saúde
```bash
# Produção
./scripts/manage-tags.sh health prod

# Staging
./scripts/manage-tags.sh health staging
```

### Ver Logs
```bash
# Logs recentes
./scripts/manage-tags.sh logs prod

# Logs específicos
kubectl logs -n default -l app=civitas --tail=100
```

### Status do Deployment
```bash
# Status geral
./scripts/manage-tags.sh status prod

# Status detalhado
kubectl describe deployment civitas -n default
```

## 🎉 Benefícios

### Para Desenvolvedores
- ✅ **Rollback rápido** e seguro
- ✅ **Histórico completo** de deployments
- ✅ **Tags organizadas** por ambiente
- ✅ **Monitoramento** em tempo real

### Para Operações
- ✅ **Deployments rastreáveis**
- ✅ **Rollback automático** em falhas
- ✅ **Health checks** automáticos
- ✅ **Logs centralizados**

### Para Produção
- ✅ **Zero downtime** nos rollbacks
- ✅ **Versões identificáveis** por tag
- ✅ **Recuperação rápida** de problemas
- ✅ **Auditoria completa** de mudanças

---

**Desenvolvido com ❤️ pela equipe de TI da Prefeitura do Rio de Janeiro**
