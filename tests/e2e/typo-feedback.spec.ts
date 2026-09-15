import { expect, test } from '@playwright/test'

test('keeps the correct prefix after a wrong key so the word can be completed', async ({ page }) => {
  await page.goto('/')
  const closeTip = page.getByLabel('关闭提示')
  if (await closeTip.count()) await closeTip.click()
  await page.keyboard.press('Enter')
  await page.keyboard.press('c')
  await expect(page.locator('span', { hasText: /^c$/ }).first()).toHaveClass(/text-green-600/)

  await page.keyboard.press('x')
  await expect(page.locator('span', { hasText: /^a$/ })).not.toHaveClass(/text-red-600/)

  await page.keyboard.press('a')
  await page.keyboard.press('n')
  await page.keyboard.press('c')
  await page.keyboard.press('e')
  await page.keyboard.press('l')
  await expect(page.locator('span', { hasText: /^e$/ }).first()).toBeVisible()
  await expect(page.locator('div', { hasText: '输入数' }).locator('span', { hasText: /^6$/ }).first()).toBeVisible()
})

test('skips the current word from the word action area', async ({ page }) => {
  await page.goto('/')
  await page.keyboard.press('Enter')
  await page.getByRole('button', { name: '跳过该词' }).click()
  await expect(page.locator('span', { hasText: /^e$/ }).first()).toBeVisible()
})
