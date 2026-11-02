import { test, expect } from '@playwright/test'
import { login } from '../helpers/login'
import { seedTestUser, cleanupTestUser, testUser } from '../helpers/seedUser'

const base = 'http://localhost:3100'

test.describe('Espace de rédaction', () => {
  test.beforeAll(async () => {
    await seedTestUser()
  })
  test.afterAll(async () => {
    await cleanupTestUser()
  })

  test('connexion puis liste des articles', async ({ page }) => {
    await login({ page, serverURL: base, user: testUser })
    await page.goto(`${base}/admin/collections/articles`)
    await expect(page.locator('h1', { hasText: 'Articles' })).toBeVisible()
    await expect(page.locator('table tbody tr').first()).toBeVisible()
  })

  test('le formulaire de création est en français', async ({ page }) => {
    await login({ page, serverURL: base, user: testUser })
    await page.goto(`${base}/admin/collections/articles/create`)
    await expect(page.getByText('Titre', { exact: false }).first()).toBeVisible()
    await expect(page.getByText('Rubrique', { exact: false }).first()).toBeVisible()
    await expect(page.getByText('Chapeau', { exact: false }).first()).toBeVisible()
  })
})
