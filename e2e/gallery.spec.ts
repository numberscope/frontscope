import {test, expect} from '@playwright/test'

test.beforeEach(async ({page}) => {
    await page.goto('/gallery', {waitUntil: 'domcontentloaded'})
    await page.evaluate(() => localStorage.clear())
})

test.describe('Scope', () => {
    test('Has a title', async ({page}) => {
        await expect(page).toHaveTitle(/Numberscope/)
    })
    test('minimizing', async ({page}) => {
        await expect(page.locator('#featured-arrow')).not.toHaveClass(
            /arrow-up/
        )
        await expect(page.locator('#featured-arrow')).not.toHaveClass(
            /arrow-down/
        )

        await page.locator('#featured-arrow').first().click()
        await expect(page.locator('#featured-arrow')).not.toHaveClass(
            /arrow-up/
        )
        await expect(page.locator('#featured-arrow')).toHaveClass(
            /arrow-down/
        )

        await page.locator('#featured-arrow').first().click()
        await expect(page.locator('#featured-arrow')).toHaveClass(/arrow-up/)
        await expect(page.locator('#featured-arrow')).not.toHaveClass(
            /arrow-down/
        )
    })
})
