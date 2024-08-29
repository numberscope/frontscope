import {test, expect} from '@playwright/test'

test.beforeEach(async ({page}) => {
    await page.goto('/gallery', {waitUntil: 'domcontentloaded'})
    await page.evaluate(() => localStorage.clear())
})

test.describe('Gallery', () => {
    test('Has a title', async ({page}) => {
        await expect(page).toHaveTitle(/Numberscope/)
    })
    test('minimizing', async ({page}) => {
        await expect(page.locator('#featured-arrow')).toHaveClass(/arrow-up/)
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
    test('clicking on a featured item', async ({page}) => {
        await page.locator('.card-body >> nth=2').click()
        await expect(page.url()).not.toContain('gallery')
        await expect(
            await page.locator('#sequenceTab .item-name').innerText()
        ).toMatch('Formula: 12')
        await expect(
            await page.locator('#visualiserTab .item-name').innerText()
        ).toMatch('Mod Fill')
    })
    test('saving a specimen and then deleting it', async ({page}) => {
        await page.goto('/', {waitUntil: 'domcontentloaded'})
        await page.locator('#specimen-bar-desktop #save-button').click()
        await page.goto('/gallery', {waitUntil: 'domcontentloaded'})

        const savedCard = await page
            .locator('#saved-gallery .card-body')
            .first()

        await expect(
            await savedCard.locator('.card-title').innerText()
        ).toMatch('Specimen')
        await expect(
            await savedCard.locator('.card-text').innerText()
        ).toMatch('Random integers 0 to 9')

        await savedCard.locator('.delete-button').click()
        await expect(page.locator('#saved-specimens >> *')).toHaveCount(0)
    })
})
