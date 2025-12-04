/** md
## Displaying errors to the user

If Numberscope experiences an error, we don't want it
to silently fail and leave the user wondering why things
aren't working. Instead, we tell them about the error
with the hope that they either reload the page or tell
us about the error.

This module provides three functions to help with this situation.

### alertMessage(err)

Returns a string based on err with (hopefully helpful) information about
what is going on and what the person exploring sequences might do.

#### Example usage

```typescript
window.alert( alertMessage(someError) )
```
**/
export const alertMessage = (error: string | unknown) => {
    const errorMessage =
        'This visualization generated an error.\n\n' + `${error}\n\n`
    const suggestion =
        'Please see the "Errors" section in the User Guide, '
        + 'accessible via the Help menu in the top bar. '
    return errorMessage + suggestion
}

const eoClass = 'error-overlay'

/** md
### errorOverlay(err, domLocation)

The second argument `domLocation` should be an HTMLElement visible in the
currently displayed webpage. This function alters the content of the page
to place the `alertMessage(err)` as a child of the specified element. The
class of the new child is `error-overlay`. It is recommended to style this
class so that the message will overlay any other content in the `domLocation`
and highlight the message. The style sheets set up by the frontscope application
provides such appropriate styling by default.
 **/
export function errorOverlay(error: string | unknown, where: HTMLElement) {
    const overlay = document.createElement('div')
    const dangerSpan = document.createElement('span')
    dangerSpan.innerText = '⚠\n'
    dangerSpan.style.fontSize = '60px'
    overlay.appendChild(dangerSpan)
    const errorSpan = document.createElement('span')
    errorSpan.innerText = alertMessage(error)
    overlay.appendChild(errorSpan)
    overlay.classList.add(eoClass)
    where.appendChild(overlay)
}

/** md
### hasErrorOverlay(domLocation)

As in `errorOverlay()`, the `domLocation` argument of this function should be
an HTMLElement on the page. This function returns a boolean value indicating
whether that `domLocation` already contains an error overlay, so that
(for example) code can avoid inserting two overlays, which would be confusing
and difficult to read.
 **/
export function hasErrorOverlay(where: HTMLElement) {
    return !!where.getElementsByClassName(eoClass).length
}

/** md
### clearErrorOverlay(domLocation)

Removes an errorOverlay in the given `domLocation` HTMLElement, if one is
present.
 **/
export function clearErrorOverlay(where: HTMLElement) {
    for (const child of where.getElementsByClassName(eoClass)) {
        where.removeChild(child)
    }
}
