import { expect, test } from '@playwright/test'

test.describe('Teste Básico do Formulário de Radar', () => {
  test('deve carregar a página de login sem erros', async ({ page }) => {
    console.log('🧪 Teste básico - verificando se a aplicação carrega')
    
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(2000)
    
    // Verificar se a página carregou corretamente
    await expect(page).toHaveTitle(/CIVITAS/)
    
    // Verificar se elementos básicos estão presentes
    const loginForm = page.locator('form, input[type="text"], input[type="password"]')
    const hasLoginElements = await loginForm.count() > 0
    
    expect(hasLoginElements).toBeTruthy()
    
    await page.screenshot({ 
      path: './e2e-results/basic-app-load-test.png',
      fullPage: true 
    })
    
    console.log('✅ Aplicação carregou corretamente')
  })

  test('deve mostrar elementos de login corretos', async ({ page }) => {
    console.log('🧪 Teste de elementos de login')
    
    await page.goto('http://localhost:3000/auth/sign-in', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(2000)
    
    // Verificar campos de login
    const userInput = page.locator('input[type="text"]').first()
    const passwordInput = page.locator('input[type="password"]').first()
    const loginButton = page.locator('button:has-text("Login")').first()
    
    await expect(userInput).toBeVisible()
    await expect(passwordInput).toBeVisible()
    await expect(loginButton).toBeVisible()
    
    // Testar interação básica
    await userInput.fill('test')
    await expect(userInput).toHaveValue('test')
    
    await passwordInput.fill('password')
    await expect(passwordInput).toHaveValue('password')
    
    console.log('✅ Elementos de login funcionando corretamente')
  })

  test('deve redirecionar para login quando não autenticado', async ({ page }) => {
    console.log('🧪 Teste de redirecionamento de autenticação')
    
    await page.goto('http://localhost:3000/veiculos/busca-por-radar', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(2000)
    
    // Deve redirecionar para login
    const currentUrl = page.url()
    expect(currentUrl).toContain('/auth/sign-in')
    
    console.log('✅ Redirecionamento de autenticação funcionando')
  })
})