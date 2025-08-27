#!/bin/bash

# Script de Verificação de Versão para Deploy Automático
# Uso: ./scripts/version-check.sh [ambiente]

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

# Verificar se o ambiente foi fornecido
if [ $# -lt 1 ]; then
    echo "Uso: $0 [ambiente]"
    echo ""
    echo "Ambientes disponíveis:"
    echo "  staging  - Ambiente de staging"
    echo "  prod     - Ambiente de produção"
    echo ""
    echo "Exemplos:"
    echo "  $0 staging"
    echo "  $0 prod"
    exit 1
fi

ENVIRONMENT=$1

# Validar ambiente
if [ "$ENVIRONMENT" != "staging" ] && [ "$ENVIRONMENT" != "prod" ]; then
    print_error "Ambiente inválido. Use 'staging' ou 'prod'"
    exit 1
fi

print_header "=== Verificação de Versão para $ENVIRONMENT ==="
echo ""

# Função para ler versão do package.json
get_package_version() {
    local version=$(node -p "require('./package.json').version")
    echo "$version"
}

# Função para obter a última tag do ambiente
get_last_tag() {
    local env=$1
    local last_tag=$(git tag --list | grep "^$env-" | sort -V | tail -1)
    echo "$last_tag"
}

# Função para extrair versão de uma tag
extract_version_from_tag() {
    local tag=$1
    if [[ $tag =~ ^[^-]+-([0-9]+\.[0-9]+\.[0-9]+) ]]; then
        echo "${BASH_REMATCH[1]}"
    else
        echo ""
    fi
}

# Função para criar nova tag
create_new_tag() {
    local env=$1
    local version=$2
    local timestamp=$(date +%Y%m%d-%H%M%S)
    local new_tag="${env}-${version}-${timestamp}"
    
    print_info "Criando nova tag: $new_tag"
    
    # Configurar git
    git config --global user.email "cloudbuild@datario.com"
    git config --global user.name "Cloud Build"
    
    # Criar tag anotada
    git tag -a "$new_tag" -m "Deploy $env v$version - $(date +%Y-%m-%d %H:%M:%S)"
    
    # Push da tag
    git push origin "$new_tag"
    
    print_success "Tag $new_tag criada e enviada com sucesso!"
    echo "$new_tag"
}

# Função para verificar se deve fazer deploy
check_deploy_needed() {
    local env=$1
    local package_version=$2
    
    print_info "Verificando se deploy é necessário..."
    echo ""
    
    # Obter última tag do ambiente
    local last_tag=$(get_last_tag $env)
    
    if [ -z "$last_tag" ]; then
        print_warning "Nenhuma tag encontrada para $env. Primeiro deploy!"
        return 0  # Deploy necessário
    fi
    
    print_info "Última tag encontrada: $last_tag"
    
    # Extrair versão da última tag
    local last_version=$(extract_version_from_tag "$last_tag")
    
    if [ -z "$last_version" ]; then
        print_warning "Não foi possível extrair versão da tag $last_tag"
        print_info "Assumindo que deploy é necessário..."
        return 0  # Deploy necessário
    fi
    
    print_info "Versão da última tag: $last_version"
    print_info "Versão do package.json: $package_version"
    echo ""
    
    # Comparar versões
    if [ "$package_version" != "$last_version" ]; then
        print_success "Versão mudou! Deploy necessário."
        print_info "De $last_version para $package_version"
        return 0  # Deploy necessário
    else
        print_warning "Versão não mudou. Deploy não necessário."
        print_info "Mantendo versão $package_version"
        return 1  # Deploy não necessário
    fi
}

# Função para mostrar informações de versão
show_version_info() {
    local package_version=$1
    local last_tag=$2
    local last_version=$3
    
    print_header "=== Informações de Versão ==="
    echo ""
    echo "Ambiente: $ENVIRONMENT"
    echo "Versão do package.json: $package_version"
    echo "Última tag: $last_tag"
    echo "Versão da última tag: $last_version"
    echo ""
    
    # Mostrar histórico de tags recentes
    print_info "Tags recentes de $ENVIRONMENT:"
    git tag --list | grep "^$ENVIRONMENT-" | tail -5 | while read tag; do
        local date=$(git log -1 --format=%cd --date=short $tag)
        echo "  - $tag (Data: $date)"
    done
    echo ""
}

# Função para simular deploy (para testes)
simulate_deploy() {
    local env=$1
    local version=$2
    
    print_info "Simulando deploy para $env v$version..."
    print_info "Em produção, aqui seria executado o Cloud Build"
    print_success "Deploy simulado concluído!"
}

# Main execution
main() {
    print_info "Iniciando verificação de versão..."
    echo ""
    
    # Ler versão do package.json
    local package_version=$(get_package_version)
    print_info "Versão atual do package.json: $package_version"
    echo ""
    
    # Obter última tag
    local last_tag=$(get_last_tag $ENVIRONMENT)
    local last_version=""
    
    if [ -n "$last_tag" ]; then
        last_version=$(extract_version_from_tag "$last_tag")
    fi
    
    # Mostrar informações
    show_version_info "$package_version" "$last_tag" "$last_version"
    
    # Verificar se deploy é necessário
    if check_deploy_needed $ENVIRONMENT "$package_version"; then
        print_header "=== DEPLOY NECESSÁRIO ==="
        echo ""
        
        # Criar nova tag
        local new_tag=$(create_new_tag $ENVIRONMENT "$package_version")
        
        print_success "Deploy aprovado! Nova tag criada: $new_tag"
        print_info "O Cloud Build será executado automaticamente."
        
        # Em produção, o Cloud Build seria executado aqui
        # simulate_deploy $ENVIRONMENT "$package_version"
        
        # Retornar sucesso para o pipeline
        exit 0
    else
        print_header "=== DEPLOY NÃO NECESSÁRIO ==="
        echo ""
        print_warning "Versão não mudou. Deploy cancelado."
        print_info "Para forçar deploy, atualize a versão no package.json"
        echo ""
        print_info "Comandos úteis:"
        echo "  # Atualizar versão patch (3.2.0 -> 3.2.1)"
        echo "  npm version patch"
        echo ""
        echo "  # Atualizar versão minor (3.2.0 -> 3.3.0)"
        echo "  npm version minor"
        echo ""
        echo "  # Atualizar versão major (3.2.0 -> 4.0.0)"
        echo "  npm version major"
        echo ""
        echo "  # Definir versão específica"
        echo "  npm version 3.3.0"
        
        # Retornar código de saída para indicar que não deve fazer deploy
        exit 1
    fi
}

# Executar main
main "$@"
