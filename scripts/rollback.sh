#!/bin/bash

# Script de Rollback para Civitas App
# Uso: ./scripts/rollback.sh [ambiente] [tag_ou_commit]

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

# Verificar se os argumentos foram fornecidos
if [ $# -lt 2 ]; then
    echo "Uso: $0 [ambiente] [tag_ou_commit]"
    echo ""
    echo "Ambientes disponíveis:"
    echo "  staging  - Ambiente de staging"
    echo "  prod     - Ambiente de produção"
    echo ""
    echo "Exemplos:"
    echo "  $0 staging prod-20241201-143022"
    echo "  $0 prod abc123def456"
    echo "  $0 prod latest"
    exit 1
fi

ENVIRONMENT=$1
TARGET_VERSION=$2
PROJECT_ID="datario"
CLUSTER_NAME="datario"
LOCATION="us-central1"

print_info "Iniciando rollback para $ENVIRONMENT..."
print_info "Versão alvo: $TARGET_VERSION"

# Validar ambiente
if [ "$ENVIRONMENT" != "staging" ] && [ "$ENVIRONMENT" != "prod" ]; then
    print_error "Ambiente inválido. Use 'staging' ou 'prod'"
    exit 1
fi

# Verificar se o kubectl está configurado
if ! command -v kubectl &> /dev/null; then
    print_error "kubectl não encontrado. Instale o kubectl primeiro."
    exit 1
fi

# Verificar se o gcloud está configurado
if ! command -v gcloud &> /dev/null; then
    print_error "gcloud não encontrado. Instale o Google Cloud SDK primeiro."
    exit 1
fi

# Configurar kubectl para o cluster
print_info "Configurando kubectl para o cluster $CLUSTER_NAME..."
gcloud container clusters get-credentials $CLUSTER_NAME --zone $LOCATION --project $PROJECT_ID

# Função para listar deployments disponíveis
list_deployments() {
    print_info "Deployments disponíveis para $ENVIRONMENT:"
    echo ""
    
    # Listar tags Git
    print_info "Tags Git disponíveis:"
    git tag --list | grep "^$ENVIRONMENT-" | tail -10 | while read tag; do
        echo "  - $tag"
    done
    echo ""
    
    # Listar imagens Docker
    print_info "Imagens Docker disponíveis:"
    gcloud container images list-tags gcr.io/$PROJECT_ID/civitas --limit=10 --format="table(tags,timestamp.datetime)" | grep -E "($ENVIRONMENT-|latest)" || true
    echo ""
    
    # Listar deployments do Kubernetes
    print_info "Deployments Kubernetes:"
    kubectl get deployments -n default | grep civitas || true
    echo ""
}

# Função para verificar se a versão existe
check_version_exists() {
    local version=$1
    
    # Verificar se é uma tag Git
    if git tag --list | grep -q "^$version$"; then
        print_success "Tag Git encontrada: $version"
        return 0
    fi
    
    # Verificar se é uma imagem Docker
    if gcloud container images list-tags gcr.io/$PROJECT_ID/civitas --filter="tags~$version" --limit=1 | grep -q "$version"; then
        print_success "Imagem Docker encontrada: $version"
        return 0
    fi
    
    # Verificar se é um commit SHA
    if git rev-parse --verify $version >/dev/null 2>&1; then
        print_success "Commit SHA encontrado: $version"
        return 0
    fi
    
    print_error "Versão $version não encontrada!"
    echo ""
    list_deployments
    exit 1
}

# Função para determinar a imagem Docker
get_docker_image() {
    local version=$1
    
    if [ "$version" = "latest" ]; then
        echo "gcr.io/$PROJECT_ID/civitas:latest"
    elif git tag --list | grep -q "^$version$"; then
        # Se é uma tag Git, usar o commit SHA associado
        local commit_sha=$(git rev-list -n 1 $version)
        echo "gcr.io/$PROJECT_ID/civitas:$commit_sha"
    else
        # Assumir que é um commit SHA ou tag de imagem
        echo "gcr.io/$PROJECT_ID/civitas:$version"
    fi
}

# Função para fazer o rollback
perform_rollback() {
    local target_image=$1
    
    print_info "Executando rollback para: $target_image"
    
    # Atualizar o deployment no Kubernetes
    print_info "Atualizando deployment no Kubernetes..."
    kubectl set image deployment/civitas civitas=$target_image -n default
    
    # Aguardar o rollout
    print_info "Aguardando rollout completar..."
    kubectl rollout status deployment/civitas -n default --timeout=300s
    
    if [ $? -eq 0 ]; then
        print_success "Rollback concluído com sucesso!"
        
        # Verificar status do deployment
        print_info "Status do deployment:"
        kubectl get deployment civitas -n default
        
        # Verificar pods
        print_info "Status dos pods:"
        kubectl get pods -n default | grep civitas
        
    else
        print_error "Rollback falhou!"
        print_info "Tentando rollback automático..."
        kubectl rollout undo deployment/civitas -n default
        exit 1
    fi
}

# Função para confirmar rollback
confirm_rollback() {
    local target_image=$1
    
    echo ""
    print_warning "ATENÇÃO: Você está prestes a fazer rollback para:"
    echo "  Ambiente: $ENVIRONMENT"
    echo "  Versão: $TARGET_VERSION"
    echo "  Imagem: $target_image"
    echo ""
    print_warning "Isso irá reverter todas as mudanças feitas após esta versão!"
    echo ""
    
    read -p "Tem certeza que deseja continuar? (y/N): " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Rollback cancelado pelo usuário."
        exit 0
    fi
}

# Função para mostrar histórico de deployments
show_deployment_history() {
    print_info "Histórico de deployments:"
    kubectl rollout history deployment/civitas -n default
}

# Função para rollback rápido (última versão)
quick_rollback() {
    print_info "Executando rollback rápido para a versão anterior..."
    kubectl rollout undo deployment/civitas -n default
    kubectl rollout status deployment/civitas -n default --timeout=300s
    
    if [ $? -eq 0 ]; then
        print_success "Rollback rápido concluído!"
    else
        print_error "Rollback rápido falhou!"
        exit 1
    fi
}

# Main execution
main() {
    print_info "=== Script de Rollback Civitas ==="
    echo ""
    
    # Verificar se é um rollback rápido
    if [ "$TARGET_VERSION" = "undo" ] || [ "$TARGET_VERSION" = "previous" ]; then
        quick_rollback
        exit 0
    fi
    
    # Verificar se é para listar deployments
    if [ "$TARGET_VERSION" = "list" ] || [ "$TARGET_VERSION" = "ls" ]; then
        list_deployments
        exit 0
    fi
    
    # Verificar se é para mostrar histórico
    if [ "$TARGET_VERSION" = "history" ] || [ "$TARGET_VERSION" = "hist" ]; then
        show_deployment_history
        exit 0
    fi
    
    # Verificar se a versão existe
    check_version_exists $TARGET_VERSION
    
    # Determinar a imagem Docker
    DOCKER_IMAGE=$(get_docker_image $TARGET_VERSION)
    
    # Confirmar rollback
    confirm_rollback $DOCKER_IMAGE
    
    # Executar rollback
    perform_rollback $DOCKER_IMAGE
    
    print_success "Rollback para $ENVIRONMENT concluído com sucesso!"
    print_info "Verifique a aplicação em: https://$ENVIRONMENT.civitas.rio"
}

# Executar main
main "$@"
