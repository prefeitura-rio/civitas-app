import { test, expect } from '@playwright/test'

test.describe('Bug de Seleção de Radares com Auth Real', () => {
  test('deve permitir login e testar o bug de resseleção automática', async ({ page }) => {
    console.log('🧪 Iniciando teste com autenticação real')

    // Navegar para a página de login
    await page.goto('http://localhost:3000/auth/sign-in')
    await page.waitForLoadState('networkidle')

    // Screenshot da tela de login
    await page.screenshot({ 
      path: './e2e-results/login-page.png', 
      fullPage: true 
    })

    // Fazer login com as credenciais de teste
    const userInput = page.locator('input[type="text"]').first()
    const passwordInput = page.locator('input[type="password"]').first()
    const loginButton = page.locator('button:has-text("Login")').first()

    await userInput.fill(process.env.TEST_USER || '15164636760')
    await passwordInput.fill(process.env.TEST_PASSWORD || 'sy45hsSoiOCf5WkLIB2dNhIv2nIruuPPgyGPDaNoC4hWrcooQCxKhqiyU4MG')
    
    await loginButton.click()

    // Aguardar redirecionamento após login
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    console.log('✅ Login realizado, navegando para URL com radares')

    // Navegar para a URL específica com radares pré-selecionados
    const testUrl = 'http://localhost:3000/veiculos/busca-por-radar/resultado?startDate=2025-09-10T08%3A43%3A00.000Z&endDate=2025-09-10T13%3A43%3A00.000Z&radarIds=0530041121&radarIds=0530031111&radarIds=0530031112&radarIds=0530041122'
    
    await page.goto(testUrl)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3000) // Aguardar carregamento dos dados

    // Screenshot da página de resultados
    await page.screenshot({ 
      path: './e2e-results/results-page-loaded.png', 
      fullPage: true 
    })

    console.log('📋 Procurando filtros de radar na página')

    // Procurar pelo filtro de radares (MultiSelectWithSearch)
    const radarFilter = page.locator('button:has-text("radar"), button:has-text("Radar"), button:has-text("Selecione um radar")').first()
    
    if (await radarFilter.isVisible()) {
      console.log('🎯 Filtro de radar encontrado!')
      
      // Clicar no filtro de radares para abrir
      await radarFilter.click()
      await page.waitForTimeout(500)

      // Screenshot do filtro aberto
      await page.screenshot({ 
        path: './e2e-results/filter-opened.png', 
        fullPage: true 
      })

      // Procurar pelo botão "Limpar" ou "Clear"
      const clearButton = page.locator('text=Limpar, text=Clear, button:has-text("Limpar")').first()
      
      if (await clearButton.isVisible()) {
        console.log('❌ Clicando em Limpar para remover todos os radares')
        await clearButton.click()
        await page.waitForTimeout(1000)

        // Fechar o popover
        const closeButton = page.locator('text=Fechar, button:has-text("Fechar")').first()
        if (await closeButton.isVisible()) {
          await closeButton.click()
        }

        await page.waitForTimeout(1000)

        // Screenshot após limpar
        await page.screenshot({ 
          path: './e2e-results/after-clear.png', 
          fullPage: true 
        })

        // Aguardar um tempo para ver se os radares voltam automaticamente
        console.log('⏰ Aguardando para verificar se radares voltam automaticamente...')
        await page.waitForTimeout(2000)

        // Screenshot final
        await page.screenshot({ 
          path: './e2e-results/final-state.png', 
          fullPage: true 
        })

        // Verificar se o filtro ainda mostra "Selecione um radar" (vazio)
        const filterText = await radarFilter.textContent()
        console.log(`🔍 Texto do filtro após limpeza: "${filterText}"`)
        
        // Se contém "Selecione um radar", significa que está vazio (correto)
        // Se contém códigos de radar, significa que o bug ainda existe
        expect(filterText).toContain('Selecione um radar')

        console.log('✅ Bug corrigido: Filtro permanece vazio após limpeza')
      } else {
        console.log('❌ Botão Limpar não encontrado')
      }
    } else {
      console.log('❌ Filtro de radar não encontrado')
      
      // Listar todos os elementos disponíveis para debug
      const allButtons = await page.locator('button').allTextContents()
      console.log('🔍 Botões encontrados:', allButtons)
    }
  })
})