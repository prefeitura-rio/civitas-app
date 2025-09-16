#!/bin/bash

# Script para Atualizar Versão e Fazer Deploy
# Uso: ./scripts/bump-version.sh [tipo] [ambiente]

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

# Verificar se os argumentos foram fornecidos
if [ $# -lt 2 ]; then
    echo "Uso: $0 [tipo] [ambiente]"
    echo ""
    echo "Tipos de atualização:"
    echo "  patch   - Incrementa patch (3.2.0 -> 3.2.1)"
    echo "  minor   - Incrementa minor (3.2.0 -> 3.3.0)"
    echo "  major   - Incrementa major (3.2.0 -> 4.0.0)"
    echo "  custom  - Define versão específica"
    echo ""
    echo "Ambientes:"
    echo "  staging - Ambiente de staging"
    echo "  prod    - Ambiente de produção"
    echo ""
    echo "Exemplos:"
    echo "  $0 patch staging"
    echo "  $0 minor prod"
    echo "  $0 custom 3.3.0 staging"
    exit 1
fi

BUMP_TYPE=$1
ENVIRONMENT=$2
CUSTOM_VERSION=$3

# Validar tipo de bump
if [ "$BUMP_TYPE" != "patch" ] && [ "$BUMP_TYPE" != "minor" ] && [ "$BUMP_TYPE" != "major" ] && [ "$BUMP_TYPE" != "custom" ]; then
    print_error "Tipo inválido. Use 'patch', 'minor', 'major' ou 'custom'"
    exit 1
fi

# Validar ambiente
if [ "$ENVIRONMENT" != "staging" ] && [ "$ENVIRONMENT" != "prod" ]; then
    print_error "Ambiente inválido. Use 'staging' ou 'prod'"
    exit 1
fi

# Verificar se é custom e tem versão
if [ "$BUMP_TYPE" = "custom" ] && [ -z "$CUSTOM_VERSION" ]; then
    print_error "Para bump custom, especifique a versão: $0 custom 3.3.0 staging"
    exit 1
fi

print_header "=== Atualização de Versão e Deploy ==="
echo ""

# Função para obter versão atual
get_current_version() {
    local version=$(node -p "require('./package.json').version")
    echo "$version"
}

# Função para validar formato de versão
validate_version() {
    local version=$1
    if [[ $version =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        return 0
    else
        return 1
    fi
}

# Função para calcular nova versão
calculate_new_version() {
    local current_version=$1
    local bump_type=$2
    local custom_version=$3
    
    if [ "$bump_type" = "custom" ]; then
        echo "$custom_version"
        return
    fi
    
    # Separar versão em componentes
    IFS='.' read -ra VERSION_PARTS <<< "$current_version"
    local major=${VERSION_PARTS[0]}
    local minor=${VERSION_PARTS[1]}
    local patch=${VERSION_PARTS[2]}
    
    case $bump_type in
        "patch")
            echo "$major.$minor.$((patch + 1))"
            ;;
        "minor")
            echo "$major.$((minor + 1)).0"
            ;;
        "major")
            echo "$((major + 1)).0.0"
            ;;
    esac
}

# Função para atualizar versão no package.json
update_package_version() {
    local new_version=$1
    
    print_info "Atualizando versão no package.json para $new_version..."
    
    # Usar npm para atualizar versão (isso também cria um commit)
    npm version "$new_version" --no-git-tag-version
    
    print_success "Versão atualizada para $new_version"
}

# Função para criar commit e push
create_version_commit() {
    local new_version=$1
    local environment=$2
    
    print_info "Criando commit para nova versão..."
    
    # Adicionar mudanças
    git add package.json package-lock.json
    
    # Criar commit
    git commit -m "chore: bump version to $new_version for $environment deployment"
    
    # Push para origin
    git push origin HEAD
    
    print_success "Commit criado e enviado para origin"
}

# Função para mostrar informações de deploy
show_deploy_info() {
    local new_version=$1
    local environment=$2
    
    print_header "=== Informações do Deploy ==="
    echo ""
    echo "Nova versão: $new_version"
    echo "Ambiente: $environment"
    echo "Branch atual: $(git branch --show-current)"
    echo "Commit: $(git rev-parse --short HEAD)"
    echo ""
    
    if [ "$environment" = "prod" ]; then
        print_warning "ATENÇÃO: Deploy para PRODUÇÃO!"
        echo "Certifique-se de que:"
        echo "  ✅ Testes passaram"
        echo "  ✅ Code review foi aprovado"
        echo "  ✅ Staging está funcionando"
        echo ""
    fi
}

# Função para confirmar deploy
confirm_deploy() {
    local new_version=$1
    local environment=$2
    
    echo ""
    print_warning "Você está prestes a:"
    echo "  1. Atualizar versão para $new_version"
    echo "  2. Criar commit e push"
    echo "  3. Trigger deploy automático para $environment"
    echo ""
    
    if [ "$environment" = "prod" ]; then
        print_warning "Isso irá fazer deploy em PRODUÇÃO!"
    fi
    
    read -p "Tem certeza que deseja continuar? (y/N): " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Operação cancelada pelo usuário."
        exit 0
    fi
}

# Função para mostrar próximos passos
show_next_steps() {
    local new_version=$1
    local environment=$2
    
    print_header "=== Próximos Passos ==="
    echo ""
    print_success "Versão atualizada com sucesso!"
    echo ""
    print_info "O que aconteceu:"
    echo "  ✅ Versão atualizada para $new_version"
    echo "  ✅ Commit criado e enviado"
    echo "  ✅ Deploy automático iniciado"
    echo ""
    print_info "O que vai acontecer:"
    echo "  🔄 Cloud Build será executado"
    echo "  🧪 Testes serão executados"
    echo "  🏷️ Nova tag será criada"
    echo "  🚀 Aplicação será deployada"
    echo ""
    print_info "Como monitorar:"
    echo "  📊 Google Cloud Console > Cloud Build"
    echo "  🔍 Logs: gcloud builds log [BUILD_ID]"
    echo "  🌐 Aplicação: https://$environment.civitas.rio"
    echo ""
    print_info "Comandos úteis:"
    echo "  # Verificar status do deploy"
    echo "  ./scripts/manage-tags.sh status $environment"
    echo ""
    echo "  # Ver logs recentes"
    echo "  ./scripts/manage-tags.sh logs $environment"
    echo ""
    echo "  # Verificar saúde"
    echo "  ./scripts/manage-tags.sh health $environment"
}

# Main execution
main() {
    print_info "Iniciando processo de atualização de versão..."
    echo ""
    
    # Obter versão atual
    local current_version=$(get_current_version)
    print_info "Versão atual: $current_version"
    
    # Calcular nova versão
    local new_version=$(calculate_new_version "$current_version" "$BUMP_TYPE" "$CUSTOM_VERSION")
    print_info "Nova versão: $new_version"
    echo ""
    
    # Validar nova versão
    if ! validate_version "$new_version"; then
        print_error "Formato de versão inválido: $new_version"
        print_error "Use formato: X.Y.Z (ex: 3.2.1)"
        exit 1
    fi
    
    # Verificar se versão mudou
    if [ "$current_version" = "$new_version" ]; then
        print_warning "Versão não mudou: $current_version"
        print_info "Nenhuma ação necessária."
        exit 0
    fi
    
    # Mostrar informações
    show_deploy_info "$new_version" "$ENVIRONMENT"
    
    # Confirmar deploy
    confirm_deploy "$new_version" "$ENVIRONMENT"
    
    # Atualizar versão
    update_package_version "$new_version"
    
    # Criar commit e push
    create_version_commit "$new_version" "$ENVIRONMENT"
    
    # Mostrar próximos passos
    show_next_steps "$new_version" "$ENVIRONMENT"
    
    print_success "Processo concluído! Deploy iniciado automaticamente."
}

# Executar main
main "$@"
