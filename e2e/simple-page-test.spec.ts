import { test, expect } from '@playwright/test'

test.describe('Teste Simples da Página', () => {
  test('deve navegar para a página de busca por radar (sem resultados)', async ({ page }) => {
    console.log('🧪 Testando página de busca sem resultados')

    // Adicionar token de autenticação fake para bypass do middleware
    await page.context().addCookies([{
      name: 'token',
      value: 'fake-test-token-for-e2e',
      domain: 'localhost',
      path: '/',
    }])

    // Navegar para a página de busca (não resultados)
    const searchUrl = 'http://localhost:3000/veiculos/busca-por-radar'
    
    console.log('📍 Navegando para página de busca')
    await page.goto(searchUrl)

    // Aguardar a página carregar completamente
    await page.waitForLoadState('networkidle')
    
    // Screenshot da página
    await page.screenshot({ 
      path: './e2e-results/search-page.png', 
      fullPage: true 
    })
    
    console.log('📸 Screenshot salvo em e2e-results/search-page.png')
    
    // Procurar por qualquer texto que indique que estamos na página certa
    await page.waitForSelector('h1, [data-testid], button, input', { timeout: 10000 })
    
    // Verificar se há algum elemento de formulário
    const hasForm = await page.locator('form, input, button').count() > 0
    expect(hasForm).toBe(true)
    
    console.log('✅ Página carregada com elementos de formulário')
    
    // Listar todos os textos visíveis na página para debug
    const allText = await page.locator('body').innerText()
    console.log('📄 Conteúdo da página:', allText.substring(0, 500))
  })

  test('deve encontrar elementos relacionados a radares', async ({ page }) => {
    // Adicionar token de autenticação fake para bypass do middleware
    await page.context().addCookies([{
      name: 'token',
      value: 'fake-test-token-for-e2e',
      domain: 'localhost',
      path: '/',
    }])

    const searchUrl = 'http://localhost:3000/veiculos/busca-por-radar'
    await page.goto(searchUrl)
    await page.waitForLoadState('networkidle')
    
    // Procurar por vários seletores possíveis
    const possibleSelectors = [
      'button:has-text("Radares")',
      'button:has-text("radar")',
      '[placeholder*="radar"]',
      '[data-testid*="radar"]',
      'button:has-text("Selec")',
      'input[type="text"]',
      'button',
    ]
    
    for (const selector of possibleSelectors) {
      const count = await page.locator(selector).count()
      console.log(`🔍 Selector "${selector}": ${count} elementos encontrados`)
      
      if (count > 0) {
        const texts = await page.locator(selector).allTextContents()
        console.log(`   Textos: ${texts.join(', ')}`)
      }
    }
    
    // Screenshot detalhado
    await page.screenshot({ 
      path: './e2e-results/elements-debug.png', 
      fullPage: true 
    })
  })
})