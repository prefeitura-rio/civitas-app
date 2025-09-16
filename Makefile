# Makefile para Civitas App
# Comandos centralizados para deploy, rollback e gerenciamento

.PHONY: help install dev build test lint clean deploy-staging deploy-prod rollback-staging rollback-prod bump-patch bump-minor bump-major bump-custom list-tags status-staging status-prod health-staging health-prod logs-staging logs-prod

# Configurações
PROJECT_NAME := civitas-app
CURRENT_VERSION := $(shell node -p "require('./package.json').version")

# Cores para output
RED := \033[0;31m
GREEN := \033[0;32m
YELLOW := \033[1;33m
BLUE := \033[0;34m
PURPLE := \033[0;35m
NC := \033[0m

# Funções de output
INFO := @echo "$(BLUE)[INFO]$(NC)"
SUCCESS := @echo "$(GREEN)[SUCCESS]$(NC)"
WARNING := @echo "$(YELLOW)[WARNING]$(NC)"
ERROR := @echo "$(RED)[ERROR]$(NC)"
HEADER := @echo "$(PURPLE)[HEADER]$(NC)"

# Comando padrão
.DEFAULT_GOAL := help

help: ## Mostrar ajuda
	$(HEADER) === Civitas App - Comandos Disponíveis ===
	@echo ""
	@echo "Desenvolvimento:"
	@echo "  install         - Instalar dependências"
	@echo "  dev             - Iniciar servidor de desenvolvimento"
	@echo "  build           - Build para produção"
	@echo "  test            - Executar testes"
	@echo "  lint            - Executar linting"
	@echo "  clean           - Limpar arquivos temporários"
	@echo ""
	@echo "Deploy:"
	@echo "  deploy-staging  - Deploy para staging"
	@echo "  deploy-prod     - Deploy para produção"
	@echo ""
	@echo "Rollback:"
	@echo "  rollback-staging [tag] - Rollback staging para tag específica"
	@echo "  rollback-prod [tag]    - Rollback produção para tag específica"
	@echo ""
	@echo "Versão:"
	@echo "  bump-patch      - Incrementar patch (3.2.0 -> 3.2.1)"
	@echo "  bump-minor      - Incrementar minor (3.2.0 -> 3.3.0)"
	@echo "  bump-major      - Incrementar major (3.2.0 -> 4.0.0)"
	@echo "  bump-custom [v] - Definir versão específica"
	@echo ""
	@echo "Monitoramento:"
	@echo "  list-tags       - Listar tags disponíveis"
	@echo "  status-staging  - Status do deployment staging"
	@echo "  status-prod     - Status do deployment produção"
	@echo "  health-staging  - Health check staging"
	@echo "  health-prod     - Health check produção"
	@echo "  logs-staging    - Logs recentes staging"
	@echo "  logs-prod       - Logs recentes produção"
	@echo ""
	@echo "Exemplos:"
	@echo "  make deploy-staging"
	@echo "  make rollback-prod prod-3.2.0-20241201-143022"
	@echo "  make bump-patch"
	@echo "  make status-prod"
	@echo ""
	@echo "Versão atual: $(CURRENT_VERSION)"

# Desenvolvimento
install: ## Instalar dependências
	$(INFO) Instalando dependências...
	corepack enable
	corepack prepare pnpm@9.15.2 --activate
	pnpm install
	$(SUCCESS) Dependências instaladas!

dev: ## Iniciar servidor de desenvolvimento
	$(INFO) Iniciando servidor de desenvolvimento...
	pnpm run dev

build: ## Build para produção
	$(INFO) Fazendo build para produção...
	pnpm run build
	$(SUCCESS) Build concluído!

test: ## Executar testes
	$(INFO) Executando testes...
	pnpm run test
	$(SUCCESS) Testes concluídos!

lint: ## Executar linting
	$(INFO) Executando linting...
	pnpm run lint
	$(SUCCESS) Linting concluído!

clean: ## Limpar arquivos temporários
	$(INFO) Limpando arquivos temporários...
	rm -rf .next
	rm -rf coverage
	rm -rf node_modules/.cache
	$(SUCCESS) Limpeza concluída!

# Deploy
deploy-staging: ## Deploy para staging
	$(HEADER) === Deploy para Staging ===
	$(INFO) Versão atual: $(CURRENT_VERSION)
	@read -p "Confirmar deploy para staging? (y/N): " confirm; \
	if [ "$$confirm" = "y" ] || [ "$$confirm" = "Y" ]; then \
		./scripts/bump-version.sh patch staging; \
	else \
		echo "Deploy cancelado."; \
	fi

deploy-prod: ## Deploy para produção
	$(HEADER) === Deploy para Produção ===
	$(WARNING) ATENÇÃO: Deploy para PRODUÇÃO!
	$(INFO) Versão atual: $(CURRENT_VERSION)
	@read -p "Confirmar deploy para PRODUÇÃO? (y/N): " confirm; \
	if [ "$$confirm" = "y" ] || [ "$$confirm" = "Y" ]; then \
		./scripts/bump-version.sh patch prod; \
	else \
		echo "Deploy cancelado."; \
	fi

# Rollback
rollback-staging: ## Rollback staging para tag específica
	$(HEADER) === Rollback Staging ===
	@if [ -z "$(tag)" ]; then \
		echo "Uso: make rollback-staging tag=staging-3.2.0-20241201-143022"; \
		exit 1; \
	fi
	$(INFO) Fazendo rollback para: $(tag)
	./scripts/rollback.sh staging $(tag)

rollback-prod: ## Rollback produção para tag específica
	$(HEADER) === Rollback Produção ===
	$(WARNING) ATENÇÃO: Rollback em PRODUÇÃO!
	@if [ -z "$(tag)" ]; then \
		echo "Uso: make rollback-prod tag=prod-3.2.0-20241201-143022"; \
		exit 1; \
	fi
	$(INFO) Fazendo rollback para: $(tag)
	./scripts/rollback.sh prod $(tag)

# Versão
bump-patch: ## Incrementar patch (3.2.0 -> 3.2.1)
	$(HEADER) === Incrementar Patch ===
	$(INFO) Versão atual: $(CURRENT_VERSION)
	@read -p "Para qual ambiente? (staging/prod): " env; \
	if [ "$$env" = "staging" ] || [ "$$env" = "prod" ]; then \
		./scripts/bump-version.sh patch $$env; \
	else \
		echo "Ambiente inválido. Use 'staging' ou 'prod'"; \
	fi

bump-minor: ## Incrementar minor (3.2.0 -> 3.3.0)
	$(HEADER) === Incrementar Minor ===
	$(INFO) Versão atual: $(CURRENT_VERSION)
	@read -p "Para qual ambiente? (staging/prod): " env; \
	if [ "$$env" = "staging" ] || [ "$$env" = "prod" ]; then \
		./scripts/bump-version.sh minor $$env; \
	else \
		echo "Ambiente inválido. Use 'staging' ou 'prod'"; \
	fi

bump-major: ## Incrementar major (3.2.0 -> 4.0.0)
	$(HEADER) === Incrementar Major ===
	$(WARNING) ATENÇÃO: Breaking changes!
	$(INFO) Versão atual: $(CURRENT_VERSION)
	@read -p "Para qual ambiente? (staging/prod): " env; \
	if [ "$$env" = "staging" ] || [ "$$env" = "prod" ]; then \
		./scripts/bump-version.sh major $$env; \
	else \
		echo "Ambiente inválido. Use 'staging' ou 'prod'"; \
	fi

bump-custom: ## Definir versão específica
	$(HEADER) === Versão Customizada ===
	$(INFO) Versão atual: $(CURRENT_VERSION)
	@if [ -z "$(v)" ]; then \
		echo "Uso: make bump-custom v=3.3.0"; \
		exit 1; \
	fi
	@read -p "Para qual ambiente? (staging/prod): " env; \
	if [ "$$env" = "staging" ] || [ "$$env" = "prod" ]; then \
		./scripts/bump-version.sh custom $(v) $$env; \
	else \
		echo "Ambiente inválido. Use 'staging' ou 'prod'"; \
	fi

# Monitoramento
list-tags: ## Listar tags disponíveis
	$(HEADER) === Tags Disponíveis ===
	./scripts/manage-tags.sh list

status-staging: ## Status do deployment staging
	$(HEADER) === Status Staging ===
	./scripts/manage-tags.sh status staging

status-prod: ## Status do deployment produção
	$(HEADER) === Status Produção ===
	./scripts/manage-tags.sh status prod

health-staging: ## Health check staging
	$(HEADER) === Health Check Staging ===
	./scripts/manage-tags.sh health staging

health-prod: ## Health check produção
	$(HEADER) === Health Check Produção ===
	./scripts/manage-tags.sh health prod

logs-staging: ## Logs recentes staging
	$(HEADER) === Logs Staging ===
	./scripts/manage-tags.sh logs staging

logs-prod: ## Logs recentes produção
	$(HEADER) === Logs Produção ===
	./scripts/manage-tags.sh logs prod

# Comandos de conveniência
quick-deploy: ## Deploy rápido para staging
	$(INFO) Deploy rápido para staging...
	./scripts/bump-version.sh patch staging

quick-rollback: ## Rollback rápido (última versão)
	$(INFO) Rollback rápido para staging...
	./scripts/rollback.sh staging undo

version: ## Mostrar versão atual
	$(HEADER) === Versão Atual ===
	$(INFO) Versão: $(CURRENT_VERSION)
	$(INFO) Branch: $(shell git branch --show-current)
	$(INFO) Commit: $(shell git rev-parse --short HEAD)

check: ## Verificar se deve fazer deploy
	$(HEADER) === Verificação de Deploy ===
	./scripts/version-check.sh staging

# Comandos de manutenção
cleanup-tags: ## Limpar tags antigas
	$(HEADER) === Limpeza de Tags ===
	@read -p "Quantos dias? (padrão: 30): " days; \
	days=$${days:-30}; \
	./scripts/manage-tags.sh cleanup $$days

info: ## Informações do projeto
	$(HEADER) === Informações do Projeto ===
	$(INFO) Nome: $(PROJECT_NAME)
	$(INFO) Versão: $(CURRENT_VERSION)
	$(INFO) Node.js: $(shell node --version)
	$(INFO) pnpm: $(shell pnpm --version)
	$(INFO) Branch: $(shell git branch --show-current)
	$(INFO) Commit: $(shell git rev-parse --short HEAD)
	$(INFO) Última tag: $(shell git describe --tags --abbrev=0 2>/dev/null || echo "Nenhuma")

# Comandos de emergência
emergency-rollback: ## Rollback de emergência para produção
	$(ERROR) === ROLLBACK DE EMERGÊNCIA ===
	$(WARNING) ATENÇÃO: Rollback imediato para produção!
	@read -p "Confirmar rollback de emergência? (y/N): " confirm; \
	if [ "$$confirm" = "y" ] || [ "$$confirm" = "Y" ]; then \
		./scripts/rollback.sh prod undo; \
	else \
		echo "Rollback cancelado."; \
	fi

# Comandos de debug
debug-env: ## Debug das variáveis de ambiente
	$(HEADER) === Debug de Ambiente ===
	$(INFO) NODE_ENV: $(NODE_ENV)
	$(INFO) NEXT_PUBLIC_CIVITAS_API_URL: $(NEXT_PUBLIC_CIVITAS_API_URL)
	$(INFO) PWD: $(PWD)
	$(INFO) USER: $(USER)

# Comandos de setup
setup: ## Setup inicial do projeto
	$(HEADER) === Setup Inicial ===
	$(INFO) Configurando projeto...
	make install
	$(INFO) Configurando git hooks...
	git config core.hooksPath .git/hooks
	$(INFO) Verificando configuração...
	make check
	$(SUCCESS) Setup concluído!

# Comandos de documentação
docs: ## Gerar documentação
	$(HEADER) === Gerando Documentação ===
	$(INFO) Atualizando README...
	$(INFO) Documentação atualizada!

# Comandos de backup
backup: ## Backup do estado atual
	$(HEADER) === Backup do Estado ===
	$(INFO) Criando backup...
	git tag backup-$(shell date +%Y%m%d-%H%M%S)
	$(SUCCESS) Backup criado!

# Comandos de restore
restore: ## Restaurar de backup
	$(HEADER) === Restaurar de Backup ===
	@read -p "Tag do backup: " backup_tag; \
	if [ -n "$$backup_tag" ]; then \
		git checkout $$backup_tag; \
		$(SUCCESS) Restaurado de $$backup_tag; \
	else \
		echo "Tag não especificada"; \
	fi
