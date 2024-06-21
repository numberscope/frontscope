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
        await page.locator('#results .sequence').first().click()
        await expect(
            await page.locator('#sequenceTab .subheading').innerText()
        ).toMatch('Constant Sequence')
    })
    test('minimizing a tab', async ({page}) => {
        await page.locator('#visualiserTab .minimize').click()
        await expect(page.locator('#visualiserTab')).toHaveClass(/minimized/)
        await expect(
            await page.locator('#visualiserTab').evaluate(element => {
                return element.clientHeight
            })
        ).toBeLessThan(125)

        await page.locator('#visualiserTab .minimize').click()
        await expect(page.locator('#visualiserTab')).not.toHaveClass(
            /minimized/
        )
        await expect(
            await page.locator('#visualiserTab').evaluate(element => {
                return element.clientHeight
            })
        ).toBeGreaterThan(375)
    })
    test('Changing a parameter', async ({page}) => {
        const oldURL = page.url()

        await page.locator('#modDimension').fill('100')
        await expect(page.locator('#modDimension')).toHaveValue('100')

        await expect(page.url()).not.toEqual(oldURL)
    })
    test('changing the specimen name', async ({page}) => {
        const oldURL = page.url()

        await page.locator('#specimen-bar-desktop input').fill('test')
        const currentSpecimenIM = await page.evaluate(() => {
            return localStorage.getItem('currentSpecimen')
        })
        if (currentSpecimenIM === null) {
            throw new Error('currentSpecimen is null')
        }
        const currentSpecimen = JSON.parse(currentSpecimenIM)

        await expect(currentSpecimen.name).toEqual('test')
        await expect(page.url()).not.toEqual(oldURL)
    })
    test('copying to clipboard', async ({page, context, browserName}) => {
        // grant clipboard permissions for chromium, other browsers don't
        // allow this due to privacy concerns
        if (browserName === 'chromium') {
            await context.grantPermissions([
                'clipboard-read',
                'clipboard-write',
            ])
        }

        await page.locator('#specimen-bar-desktop #share-button').click()

        let clipboardContent
        if (browserName === 'chromium') {
            const handle = await page.evaluateHandle(() =>
                navigator.clipboard.readText()
            )
            clipboardContent = await handle.jsonValue()
        } else {
            // we can't read the clipboard content in other browsers
            clipboardContent = page.url()
        }

        const url = page.url()
        await expect(clipboardContent).toMatch(url)
    })
})
