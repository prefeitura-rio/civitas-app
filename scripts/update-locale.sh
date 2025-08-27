#!/bin/bash

echo "🔄 Atualizando locale em todos os arquivos..."

# Substituir ptBR por dateConfig.locale
echo "📝 Substituindo ptBR por dateConfig.locale..."
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's/ptBR/dateConfig.locale/g'

# Substituir locale: ptBR por locale: dateConfig.locale
echo "📝 Substituindo locale: ptBR por locale: dateConfig.locale..."
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's/locale: ptBR/locale: dateConfig.locale/g'

# Adicionar import de dateConfig onde não existe
echo "📝 Adicionando imports de dateConfig..."
find src -name "*.tsx" -o -name "*.ts" | while read file; do
  if grep -q "dateConfig\.locale" "$file" && ! grep -q "import.*date-config" "$file"; then
    echo "➕ Adicionando import em $file"
    # Adicionar import após a primeira linha que contém 'import'
    sed -i '' '/^import.*$/a\
import { dateConfig } from "@/lib/date-config"' "$file"
  fi
done

echo "✅ Locale atualizado em todos os arquivos!"
echo "🔍 Verifique se os imports foram adicionados corretamente"
