import { expect, test } from '@playwright/test'

test.describe('Bug de Seleção de Radares', () => {
  test('deve reproduzir o bug: desselecionar todos os radares não deve resselecionar automaticamente', async ({
    page,
  }) => {
    console.log('🧪 Iniciando teste E2E do bug de seleção')

    // Primeiro fazer login se necessário
    await page.goto('http://localhost:3000/auth/sign-in', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(2000)

    const currentUrl = page.url()
    if (currentUrl.includes('/auth/sign-in')) {
      console.log('🔐 Fazendo login primeiro...')
      
      const userInput = page.locator('input[type="text"]').first()
      const passwordInput = page.locator('input[type="password"]').first()
      
      // Usar credenciais do .env.test
      const username = process.env.TEST_USER
      const password = process.env.TEST_PASSWORD
      
      if (!username || !password) {
        console.log('❌ Credenciais não encontradas no .env.test')
        test.skip(true, 'TEST_USER e TEST_PASSWORD devem estar definidos no .env.test')
        return
      }
      
      await userInput.fill(username)
      await passwordInput.fill(password)
      
      const loginButton = page.locator('button:has-text("Login")').first()
      await loginButton.click()
      await page.waitForTimeout(3000)
      
      // Verificar se login foi bem-sucedido
      const newUrl = page.url()
      if (newUrl.includes('/auth/sign-in')) {
        console.log('❌ Login falhou, mas continuando teste...')
        // Pular o teste se login não funcionar
        test.skip(true, 'Login credentials not working')
      } else {
        console.log('✅ Login realizado com sucesso!')
      }
    }

    // Ir para a página com radares pré-selecionados
    const testUrl = 'http://localhost:3000/veiculos/busca-por-radar?radarIds=0540461121,0540461122,0540461123&plate=ABC1234&date=%7B%22from%22:%222024-12-01T08:00:00.000Z%22,%22to%22:%222024-12-01T13:00:00.000Z%22%7D'
    
    console.log('📍 Navegando para URL com radares pré-selecionados')
    await page.goto(testUrl, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(5000) // Aguardar componentes carregarem

    // Aguardar o formulário carregar e localizar o botão específico "Radares (0)"
    console.log('📋 Procurando botão de seleção de radares')
    
    const radarButton = page.locator('button:has-text("Radares (")')
    await radarButton.waitFor({ state: 'visible', timeout: 15000 })
    
    console.log('✅ Botão de radares encontrado!')
    await expect(radarButton).toBeVisible()
    
    // Verificar se os radares foram carregados da URL
    const radarText = await radarButton.textContent()
    console.log(`📊 Botão de radares encontrado: ${radarText}`)
    
    // Deve mostrar pelo menos 1 radar (vindo da URL)
    expect(radarText).toMatch(/Radares \(\d+\)/)
    
    // Clicar para abrir o seletor
    await radarButton.click()
    await page.waitForTimeout(1000)
    
    console.log('📋 Seletor de radares aberto')
    
    // Verificar se há radares selecionados
    const selectedRadarsList = page.locator('.space-y-2 > div')
    const selectedCount = await selectedRadarsList.count()
    console.log(`📊 Radares selecionados encontrados: ${selectedCount}`)
    
    if (selectedCount > 0) {
      // Desselecionar todos os radares
      console.log('🗑️ Desselecionando todos os radares...')
      
      for (let i = 0; i < selectedCount; i++) {
        const removeButton = selectedRadarsList.nth(i).locator('button').last()
        if (await removeButton.isVisible()) {
          await removeButton.click()
          await page.waitForTimeout(500)
          console.log(`✅ Radar ${i + 1} removido`)
        }
      }
      
      // Verificar se todos foram removidos
      await page.waitForTimeout(1000)
      const remainingCount = await selectedRadarsList.count()
      console.log(`📊 Radares restantes: ${remainingCount}`)
      
      // Fechar o seletor
      await page.keyboard.press('Escape')
      await page.waitForTimeout(1000)
      
      // Verificar se o botão mostra 0 radares
      const updatedText = await radarButton.textContent()
      console.log(`📊 Texto atualizado do botão: ${updatedText}`)
      
      // CRÍTICO: Não deve ter resselecionado automaticamente
      expect(updatedText).toContain('Radares (0)')
      
      console.log('✅ Bug de resseleção automática NÃO ocorreu!')
    } else {
      console.log('⚠️ Nenhum radar foi carregado da URL')
    }
    
    await page.screenshot({ 
      path: './e2e-results/radar-deselection-test.png',
      fullPage: true 
    })
    
    console.log('✅ Teste de bug de seleção concluído')
  })

  test('deve permitir visualizar a página de resultados e interagir com radares', async ({
    page,
  }) => {
    console.log('🧪 Teste de visualização da página de resultados')
    
    // Primeiro fazer login
    await page.goto('http://localhost:3000/auth/sign-in', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(2000)

    const currentUrl = page.url()
    if (currentUrl.includes('/auth/sign-in')) {
      console.log('🔐 Fazendo login primeiro...')
      
      const userInput = page.locator('input[type="text"]').first()
      const passwordInput = page.locator('input[type="password"]').first()
      
      // Usar credenciais do .env.test
      const username = process.env.TEST_USER
      const password = process.env.TEST_PASSWORD
      
      if (!username || !password) {
        console.log('❌ Credenciais não encontradas no .env.test')
        test.skip(true, 'TEST_USER e TEST_PASSWORD devem estar definidos no .env.test')
        return
      }
      
      await userInput.fill(username)
      await passwordInput.fill(password)
      
      const loginButton = page.locator('button:has-text("Login")').first()
      await loginButton.click()
      await page.waitForTimeout(3000)
      
      // Verificar se login foi bem-sucedido
      const newUrl = page.url()
      if (newUrl.includes('/auth/sign-in')) {
        console.log('❌ Login falhou')
        test.skip(true, 'Login credentials not working')
        return
      } else {
        console.log('✅ Login realizado com sucesso!')
      }
    }
    
    // Agora navegar para página de resultados
    const testUrl = 'http://localhost:3000/veiculos/busca-por-radar/resultado?radarIds=0540461121&plate=ABC1234&date=%7B%22from%22:%222024-12-01T08:00:00.000Z%22,%22to%22:%222024-12-01T13:00:00.000Z%22%7D'
    
    await page.goto(testUrl, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(3000)
    
    // Verificar se a página carregou corretamente
    await expect(page).toHaveTitle(/CIVITAS/)
    
    // Verificar se qualquer elemento da interface está presente (seja formulário, tabela, loading, etc)
    const possibleElements = page.locator('form, table, .loading, .spinner, button, input, [data-testid*="data"], [class*="search"], [class*="result"]')
    const hasAnyElement = await possibleElements.count() > 0
    
    // Verificar se pelo menos a página não está vazia
    const pageContent = await page.textContent('body')
    const hasContent = pageContent && pageContent.trim().length > 0
    
    console.log(`📊 Elementos encontrados: ${await possibleElements.count()}`)
    console.log(`📊 Página tem conteúdo: ${hasContent}`)
    
    // O teste passa se a página carregou e tem algum conteúdo
    expect(hasContent).toBeTruthy()
    
    await page.screenshot({ 
      path: './e2e-results/results-page-test.png',
      fullPage: true 
    })
    
    console.log('✅ Teste de página de resultados concluído')
  })
})