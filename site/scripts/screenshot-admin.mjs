// Capture de l'espace de rédaction après connexion : ADMIN_EMAIL=… ADMIN_PASSWORD=… node scripts/screenshot-admin.mjs [baseUrl]
import fs from 'node:fs'
import path from 'node:path'
import { chromium } from '@playwright/test'

const base = process.argv[2] || 'http://localhost:3100'
const outDir = path.resolve('.screenshots'); fs.mkdirSync(outDir, { recursive: true })
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1366, height: 900 }, locale: 'fr-FR' })
await page.goto(`${base}/admin/login`, { waitUntil: 'networkidle', timeout: 180000 })
await page.fill('input[name="email"], #field-email', process.env.ADMIN_EMAIL)
await page.fill('input[name="password"], #field-password', process.env.ADMIN_PASSWORD)
await page.click('button[type="submit"]')
await page.waitForURL(/\/admin(?!\/login)/, { timeout: 120000 })
await page.waitForLoadState('networkidle')
await page.screenshot({ path: path.join(outDir, 'admin-accueil.png'), fullPage: true })
await page.goto(`${base}/admin/collections/articles/create`, { waitUntil: 'networkidle', timeout: 180000 })
await page.screenshot({ path: path.join(outDir, 'admin-article-nouveau.png'), fullPage: true })
await page.goto(`${base}/admin/collections/articles`, { waitUntil: 'networkidle', timeout: 180000 })
await page.screenshot({ path: path.join(outDir, 'admin-articles-liste.png'), fullPage: true })
console.log('ok')
await browser.close()
