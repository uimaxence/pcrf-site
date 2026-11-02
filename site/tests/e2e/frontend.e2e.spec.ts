import { test, expect } from '@playwright/test'

const base = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3100'

test.describe('Site public', () => {
  test('la page d’accueil s’affiche avec les menus et les sections', async ({ page }) => {
    await page.goto(base + '/')
    await expect(page).toHaveTitle(/Parti Communiste Révolutionnaire de France/)
    await expect(page.locator('.nav--primary a', { hasText: 'Accueil' })).toBeVisible()
    await expect(page.locator('.tranche__title', { hasText: 'À la une' })).toBeVisible()
    await expect(page.locator('.window--programme')).toBeVisible()
  })

  test('une rubrique liste ses articles', async ({ page }) => {
    await page.goto(base + '/rubrique/france')
    await expect(page.locator('.page-head h1')).toHaveText('France')
    await expect(page.locator('.card').first()).toBeVisible()
  })

  test('un article s’ouvre depuis une liste', async ({ page }) => {
    await page.goto(base + '/rubrique/france')
    const first = page.locator('.card__title a').first()
    const title = await first.textContent()
    await first.click()
    await expect(page.locator('.article__title')).toHaveText(title!.trim())
  })

  test('les anciennes adresses SPIP sont redirigées', async ({ request }) => {
    const r = await request.get(base + '/-France-', { maxRedirects: 0 })
    expect([301, 308]).toContain(r.status())
    expect(r.headers()['location']).toContain('/rubrique/france')
  })

  test('le flux RSS et le plan du site répondent', async ({ request }) => {
    const rss = await request.get(base + '/rss.xml')
    expect(rss.status()).toBe(200)
    expect(await rss.text()).toContain('<rss')
    const sitemap = await request.get(base + '/sitemap.xml')
    expect(sitemap.status()).toBe(200)
  })

  test('le formulaire de contact accepte un message', async ({ page }) => {
    await page.goto(base + '/contact')
    await page.fill('#c-name', 'Test')
    await page.fill('#c-email', 'test@example.org')
    await page.fill('#c-message', 'Message de test automatique.')
    await page.click('.form button[type="submit"]')
    await expect(page.locator('.form__ok')).toBeVisible({ timeout: 20000 })
  })

  test('la recherche renvoie des résultats', async ({ page }) => {
    await page.goto(base + '/recherche?q=capital')
    await expect(page.locator('.card').first()).toBeVisible()
  })
})
