import {test, expect} from '@playwright/test'

test.describe('Documentation site', () => {
    test('Includes husky actions', async ({page}) => {
        await page.goto('/doc/doc/husky-pre-commit/')
        await expect(
            await page.locator('.hljs-built_in').nth(0).innerText()
        ).toEqual('test')
    })
})
