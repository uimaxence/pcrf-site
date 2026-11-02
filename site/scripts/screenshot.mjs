// Captures d'écran du site test : node scripts/screenshot.mjs [baseUrl] [chemin1 chemin2 ...]
import fs from 'node:fs'
import path from 'node:path'
import { chromium } from '@playwright/test'

const base = process.argv[2] || process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3100'
const paths = process.argv.slice(3).length ? process.argv.slice(3) : ['/']
const outDir = path.resolve('.screenshots')
fs.mkdirSync(outDir, { recursive: true })
const browser = await chromium.launch()
for (const [name, viewport] of [['desktop', { width: 1366, height: 900 }], ['mobile', { width: 390, height: 844 }]]) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1, locale: 'fr-FR' })
  const page = await ctx.newPage()
  for (const p of paths) {
    await page.goto(base + p, { waitUntil: 'networkidle', timeout: 120000 })
    const file = path.join(outDir, `${name}-${p === '/' ? 'accueil' : p.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '')}.png`)
    await page.screenshot({ path: file, fullPage: true })
    console.log(file)
  }
  await ctx.close()
}
await browser.close()
