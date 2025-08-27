#!/bin/bash

# Script de Gerenciamento de Tags e Deployments para Civitas App
# Uso: ./scripts/manage-tags.sh [comando] [opções]

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Função para imprimir com cores
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${PURPLE}[HEADER]${NC} $1"
}

# Configurações
PROJECT_ID="datario"
CLUSTER_NAME="datario"
LOCATION="us-central1"

# Função para mostrar ajuda
show_help() {
    echo "Script de Gerenciamento de Tags e Deployments - Civitas App"
    echo ""
    echo "Uso: $0 [comando] [opções]"
    echo ""
    echo "Comandos disponíveis:"
    echo ""
    echo "  list                    - Listar todas as tags e deployments"
    echo "  list-prod               - Listar apenas tags de produção"
    echo "  list-staging            - Listar apenas tags de staging"
    echo "  info [tag]              - Mostrar informações detalhadas de uma tag"
    echo "  delete [tag]            - Deletar uma tag (local e remota)"
    echo "  cleanup [dias]          - Limpar tags antigas (padrão: 30 dias)"
    echo "  health [ambiente]       - Verificar saúde da aplicação"
    echo "  logs [ambiente]         - Mostrar logs recentes"
    echo "  status [ambiente]       - Mostrar status do deployment"
    echo "  help                    - Mostrar esta ajuda"
    echo ""
    echo "Exemplos:"
    echo "  $0 list"
    echo "  $0 info prod-20241201-143022"
    echo "  $0 delete staging-20241115-120000"
    echo "  $0 cleanup 7"
    echo "  $0 health prod"
    echo "  $0 logs staging"
}

# Função para listar todas as tags
list_all_tags() {
    print_header "=== Tags Git Disponíveis ==="
    echo ""
    
    print_info "Tags de Produção:"
    git tag --list | grep "^prod-" | tail -10 | while read tag; do
        local date=$(git log -1 --format=%cd --date=short $tag)
        local commit=$(git rev-parse --short $tag)
        echo "  - $tag (Commit: $commit, Data: $date)"
    done
    echo ""
    
    print_info "Tags de Staging:"
    git tag --list | grep "^staging-" | tail -10 | while read tag; do
        local date=$(git log -1 --format=%cd --date=short $tag)
        local commit=$(git rev-parse --short $tag)
        echo "  - $tag (Commit: $commit, Data: $date)"
    done
    echo ""
    
    print_info "Outras Tags:"
    git tag --list | grep -v "^prod-\|^staging-" | tail -5 | while read tag; do
        local date=$(git log -1 --format=%cd --date=short $tag)
        local commit=$(git rev-parse --short $tag)
        echo "  - $tag (Commit: $commit, Data: $date)"
    done
}

# Função para listar tags por ambiente
list_environment_tags() {
    local env=$1
    print_header "=== Tags de $env ==="
    echo ""
    
    git tag --list | grep "^$env-" | tail -20 | while read tag; do
        local date=$(git log -1 --format=%cd --date=short $tag)
        local commit=$(git rev-parse --short $tag)
        local message=$(git tag -l --format='%(contents:subject)' $tag | head -1)
        echo "  - $tag"
        echo "    Commit: $commit"
        echo "    Data: $date"
        echo "    Mensagem: $message"
        echo ""
    done
}

# Função para mostrar informações de uma tag
show_tag_info() {
    local tag=$1
    
    if [ -z "$tag" ]; then
        print_error "Tag não especificada!"
        echo "Uso: $0 info [tag]"
        exit 1
    fi
    
    if ! git tag --list | grep -q "^$tag$"; then
        print_error "Tag '$tag' não encontrada!"
        exit 1
    fi
    
    print_header "=== Informações da Tag: $tag ==="
    echo ""
    
    local commit=$(git rev-parse $tag)
    local short_commit=$(git rev-parse --short $tag)
    local date=$(git log -1 --format=%cd --date=full $tag)
    local author=$(git log -1 --format=%an $tag)
    local message=$(git tag -l --format='%(contents:subject)' $tag)
    local body=$(git tag -l --format='%(contents:body)' $tag)
    
    echo "Tag: $tag"
    echo "Commit: $commit ($short_commit)"
    echo "Data: $date"
    echo "Autor: $author"
    echo "Mensagem: $message"
    echo ""
    
    if [ -n "$body" ]; then
        echo "Descrição:"
        echo "$body"
        echo ""
    fi
    
    # Mostrar diferenças do commit anterior
    print_info "Mudanças desde o commit anterior:"
    git log --oneline $(git describe --tags --abbrev=0 $tag^)..$tag | head -10
    
    echo ""
    
    # Verificar se a imagem Docker existe
    print_info "Verificando imagem Docker..."
    if gcloud container images list-tags gcr.io/$PROJECT_ID/civitas --filter="tags~$short_commit" --limit=1 | grep -q "$short_commit"; then
        print_success "Imagem Docker encontrada!"
        gcloud container images list-tags gcr.io/$PROJECT_ID/civitas --filter="tags~$short_commit" --format="table(tags,timestamp.datetime,digest)"
    else
        print_warning "Imagem Docker não encontrada para este commit."
    fi
}

# Função para deletar uma tag
delete_tag() {
    local tag=$1
    
    if [ -z "$tag" ]; then
        print_error "Tag não especificada!"
        echo "Uso: $0 delete [tag]"
        exit 1
    fi
    
    if ! git tag --list | grep -q "^$tag$"; then
        print_error "Tag '$tag' não encontrada!"
        exit 1
    fi
    
    print_warning "ATENÇÃO: Você está prestes a deletar a tag: $tag"
    echo "Isso irá remover a tag localmente e no repositório remoto."
    echo ""
    
    read -p "Tem certeza que deseja continuar? (y/N): " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Operação cancelada pelo usuário."
        exit 0
    fi
    
    print_info "Deletando tag local..."
    git tag -d $tag
    
    print_info "Deletando tag remota..."
    git push origin :refs/tags/$tag
    
    print_success "Tag '$tag' deletada com sucesso!"
}

# Função para limpar tags antigas
cleanup_old_tags() {
    local days=${1:-30}
    
    print_info "Limpando tags mais antigas que $days dias..."
    echo ""
    
    # Listar tags antigas
    local old_tags=$(git for-each-ref --format='%(refname:short) %(committerdate:iso)' refs/tags | \
                     awk -v days="$days" '{
                         split($2, date, " ")
                         split(date[1], ymd, "-")
                         tag_date = mktime(ymd[1] " " ymd[2] " " ymd[3] " 0 0 0")
                         current_date = systime()
                         days_diff = (current_date - tag_date) / 86400
                         if (days_diff > days) print $1
                     }' | grep -E "^(prod-|staging-)" | head -10)
    
    if [ -z "$old_tags" ]; then
        print_info "Nenhuma tag antiga encontrada."
        return 0
    fi
    
    print_warning "Tags antigas encontradas:"
    echo "$old_tags"
    echo ""
    
    read -p "Deseja deletar essas tags? (y/N): " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Operação cancelada pelo usuário."
        exit 0
    fi
    
    local deleted_count=0
    while read tag; do
        if [ -n "$tag" ]; then
            print_info "Deletando tag: $tag"
            git tag -d $tag 2>/dev/null || true
            git push origin :refs/tags/$tag 2>/dev/null || true
            ((deleted_count++))
        fi
    done <<< "$old_tags"
    
    print_success "$deleted_count tags deletadas com sucesso!"
}

# Função para verificar saúde da aplicação
check_health() {
    local env=$1
    
    if [ -z "$env" ]; then
        print_error "Ambiente não especificado!"
        echo "Uso: $0 health [ambiente]"
        exit 1
    fi
    
    if [ "$env" != "prod" ] && [ "$env" != "staging" ]; then
        print_error "Ambiente inválido. Use 'prod' ou 'staging'"
        exit 1
    fi
    
    print_header "=== Verificação de Saúde: $env ==="
    echo ""
    
    # Configurar kubectl
    print_info "Configurando kubectl..."
    gcloud container clusters get-credentials $CLUSTER_NAME --zone $LOCATION --project $PROJECT_ID
    
    # Verificar deployment
    print_info "Status do Deployment:"
    kubectl get deployment civitas -n default
    
    echo ""
    
    # Verificar pods
    print_info "Status dos Pods:"
    kubectl get pods -n default | grep civitas
    
    echo ""
    
    # Verificar serviços
    print_info "Status dos Serviços:"
    kubectl get svc -n default | grep civitas
    
    echo ""
    
    # Health check da aplicação
    print_info "Health Check da Aplicação:"
    local url="https://$env.civitas.rio/health"
    if curl -f -s "$url" >/dev/null; then
        print_success "Aplicação respondendo em: $url"
    else
        print_error "Aplicação não está respondendo em: $url"
    fi
}

# Função para mostrar logs
show_logs() {
    local env=$1
    
    if [ -z "$env" ]; then
        print_error "Ambiente não especificado!"
        echo "Uso: $0 logs [ambiente]"
        exit 1
    fi
    
    if [ "$env" != "prod" ] && [ "$env" != "staging" ]; then
        print_error "Ambiente inválido. Use 'prod' ou 'staging'"
        exit 1
    fi
    
    print_header "=== Logs Recentes: $env ==="
    echo ""
    
    # Configurar kubectl
    print_info "Configurando kubectl..."
    gcloud container clusters get-credentials $CLUSTER_NAME --zone $LOCATION --project $PROJECT_ID
    
    # Mostrar logs dos pods
    print_info "Logs dos últimos 50 eventos:"
    kubectl logs -n default -l app=civitas --tail=50 --timestamps
}

# Função para mostrar status
show_status() {
    local env=$1
    
    if [ -z "$env" ]; then
        print_error "Ambiente não especificado!"
        echo "Uso: $0 status [ambiente]"
        exit 1
    fi
    
    if [ "$env" != "prod" ] && [ "$env" != "staging" ]; then
        print_error "Ambiente inválido. Use 'prod' ou 'staging'"
        exit 1
    fi
    
    print_header "=== Status do Deployment: $env ==="
    echo ""
    
    # Configurar kubectl
    print_info "Configurando kubectl..."
    gcloud container clusters get-credentials $CLUSTER_NAME --zone $LOCATION --project $PROJECT_ID
    
    # Status detalhado
    print_info "Status Detalhado:"
    kubectl describe deployment civitas -n default
    
    echo ""
    
    # Histórico de rollouts
    print_info "Histórico de Rollouts:"
    kubectl rollout history deployment civitas -n default
}

# Main execution
main() {
    local command=$1
    local arg=$2
    
    case $command in
        "list")
            list_all_tags
            ;;
        "list-prod")
            list_environment_tags "prod"
            ;;
        "list-staging")
            list_environment_tags "staging"
            ;;
        "info")
            show_tag_info $arg
            ;;
        "delete")
            delete_tag $arg
            ;;
        "cleanup")
            cleanup_old_tags $arg
            ;;
        "health")
            check_health $arg
            ;;
        "logs")
            show_logs $arg
            ;;
        "status")
            show_status $arg
            ;;
        "help"|"-h"|"--help"|"")
            show_help
            ;;
        *)
            print_error "Comando desconhecido: $command"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# Executar main
main "$@"
