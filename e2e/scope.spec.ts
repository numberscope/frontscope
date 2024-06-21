import {test, expect} from '@playwright/test'

test.beforeEach(async ({page}) => {
    await page.goto('/')
})

test.describe('Scope', () => {
    test('Has a title', async ({page}) => {
        await expect(page).toHaveTitle(/Numberscope/)
    })

    test('Tabs are draggable', async ({page}) => {
        await page
            .locator('#visualiserTab .buttons')
            .dragTo(page.locator('#canvas-container'), {
                sourcePosition: {
                    x: 10,
                    y: 10,
                },
                targetPosition: {
                    x: 100,
                    y: 100,
                },
            })
        await expect(page.locator('#bottom-right-dropzone')).toHaveClass(
            /empty/
        )
    })

    test('Sidebars disappear when tabs are dragged', async ({page}) => {
        await page
            .locator('#visualiserTab .buttons')
            .dragTo(page.locator('#canvas-container'), {
                sourcePosition: {
                    x: 10,
                    y: 10,
                },
            })

        await page
            .locator('#sequenceTab .buttons')
            .dragTo(page.locator('#canvas-container'), {
                sourcePosition: {
                    x: 10,
                    y: 10,
                },

                targetPosition: {
                    x: 500,
                    y: 100,
                },
            })

        await expect(page.locator('#right-dropzone-container')).toHaveClass(
            /empty/
        )
        await expect(
            page.locator('#right-dropzone-container .dropzone-resize')
        ).toHaveCSS('display', 'none')

        await expect(page.locator('#left-dropzone-container')).toHaveClass(
            /empty/
        )
        await expect(
            page.locator('#left-dropzone-container .dropzone-resize')
        ).toHaveCSS('display', 'none')
    })

    test('Changing a sequence', async ({page}) => {
        await page.locator('#sequenceTab .change-button').click()

        await page
            .locator('#sequenceTab .buttons')
            .dragTo(page.locator('#canvas-container'), {
                sourcePosition: {
                    x: 10,
                    y: 10,
                },

                targetPosition: {
                    x: 500,
                    y: 100,
                },
            })

        await expect(page.locator('#right-dropzone-container')).toHaveClass(
            /empty/
        )
        await expect(
            page.locator('#right-dropzone-container .dropzone-resize')
        ).toHaveCSS('display', 'none')

        await expect(page.locator('#left-dropzone-container')).toHaveClass(
            /empty/
        )
        await expect(
            page.locator('#left-dropzone-container .dropzone-resize')
        ).toHaveCSS('display', 'none')
    })
})
