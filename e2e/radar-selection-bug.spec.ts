import { test, expect } from '@playwright/test'

test.describe('Bug de Seleção de Radares', () => {
  test('deve reproduzir o bug: desselecionar todos os radares não deve resselecionar automaticamente', async ({ page }) => {
    console.log('🧪 Iniciando teste E2E do bug de seleção')

    // Adicionar token de autenticação fake para bypass do middleware
    await page.context().addCookies([{
      name: 'token',
      value: 'fake-test-token-for-e2e',
      domain: 'localhost',
      path: '/',
    }])

    // Navegar para a URL específica com radares pré-selecionados
    const testUrl = 'http://localhost:3000/veiculos/busca-por-radar/resultado?startDate=2025-09-10T08%3A43%3A00.000Z&endDate=2025-09-10T13%3A43%3A00.000Z&radarIds=0530041121&radarIds=0530031111&radarIds=0530031112&radarIds=0530041122'
    
    console.log('📍 Navegando para URL com radares pré-selecionados')
    await page.goto(testUrl)

    // Aguardar a página carregar completamente
    await page.waitForLoadState('networkidle')
    
    // Aguardar o componente do formulário aparecer
    await page.waitForSelector('[data-testid="radar-selection-button"], button:has-text("Radares")', { timeout: 10000 })
    
    console.log('📋 Procurando botão de seleção de radares')
    
    // Encontrar o botão que mostra quantos radares estão selecionados
    const radarButton = page.locator('button:has-text("Radares")').first()
    
    // Verificar se 4 radares estão inicialmente selecionados
    await expect(radarButton).toContainText('Radares (4)')
    console.log('✅ Confirmado: 4 radares inicialmente selecionados')
    
    // Clicar no botão para abrir a lista de radares
    await radarButton.click()
    
    // Aguardar a lista aparecer
    await page.waitForSelector('[role="listbox"], .radar-list', { timeout: 5000 })
    
    console.log('📂 Lista de radares aberta, procurando radares selecionados')
    
    // Encontrar todos os radares selecionados (assumindo que têm um indicador visual)
    // Vamos procurar por checkboxes marcados ou botões "Remove" 
    const selectedRadars = await page.locator('[role="option"][data-state="checked"], button:has-text("Remover"), .selected-radar').all()
    
    console.log(`🎯 Encontrados ${selectedRadars.length} radares selecionados para remover`)
    
    // Aguardar um pouco para estabilizar a UI
    await page.waitForTimeout(500)
    
    // Desselecionar todos os radares um por um
    for (let i = 0; i < selectedRadars.length; i++) {
      console.log(`❌ Desselecionando radar ${i + 1}/${selectedRadars.length}`)
      
      // Recriar a lista porque o DOM pode ter mudado
      const currentSelectedRadars = await page.locator('[role="option"][data-state="checked"], button:has-text("Remover"), .selected-radar').all()
      
      if (currentSelectedRadars.length > 0) {
        await currentSelectedRadars[0].click()
        // Aguardar um pouco para o estado atualizar
        await page.waitForTimeout(200)
      }
    }
    
    console.log('🔍 Todos os radares desselecionados, verificando estado final')
    
    // Aguardar um tempo para possíveis side effects
    await page.waitForTimeout(1000)
    
    // Verificar se o contador mostra 0 radares
    const finalRadarButton = page.locator('button:has-text("Radares")').first()
    
    // O texto deveria ser "Radares (0)" se não há bug
    await expect(finalRadarButton).toContainText('Radares (0)')
    
    console.log('✅ Teste concluído: Nenhum radar deve estar selecionado')
    
    // Screenshot para debug se necessário
    await page.screenshot({ 
      path: './e2e-results/radar-deselection-final.png', 
      fullPage: true 
    })
    
    // Verificação adicional: se clicar no botão novamente, a lista deve estar vazia
    await finalRadarButton.click()
    await page.waitForTimeout(500)
    
    const finalSelectedCount = await page.locator('[role="option"][data-state="checked"], button:has-text("Remover"), .selected-radar').count()
    
    expect(finalSelectedCount).toBe(0)
    console.log(`🎯 Verificação final: ${finalSelectedCount} radares selecionados (deve ser 0)`)
  })
  
  test('deve permitir visualizar a página de resultados e interagir com radares', async ({ page }) => {
    console.log('🧪 Teste de visualização da página de resultados')
    
    // Adicionar token de autenticação fake para bypass do middleware
    await page.context().addCookies([{
      name: 'token',
      value: 'fake-test-token-for-e2e',
      domain: 'localhost',
      path: '/',
    }])
    
    const testUrl = 'http://localhost:3000/veiculos/busca-por-radar/resultado?startDate=2025-09-10T08%3A43%3A00.000Z&endDate=2025-09-10T13%3A43%3A00.000Z&radarIds=0530041121&radarIds=0530031111&radarIds=0530031112&radarIds=0530041122'
    
    await page.goto(testUrl)
    await page.waitForLoadState('networkidle')
    
    // Tirar screenshot da página inicial
    await page.screenshot({ 
      path: './e2e-results/radar-results-page.png', 
      fullPage: true 
    })
    
    // Verificar se a página carregou corretamente
    await expect(page).toHaveTitle(/Civitas|Busca por Radar/)
    
    // Verificar se o formulário está presente
    const form = page.locator('form, [data-testid="search-form"]')
    await expect(form).toBeVisible()
    
    console.log('✅ Página de resultados carregada com sucesso')
  })
})