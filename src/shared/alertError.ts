/** md
 * ## A utility for displaying errors to the user
 *
 * If Numberscope experiences an error, we don't want it
 * to silently fail and leave the user wondering why things
 * aren't working. Instead, we tell them about the error
 * with the hope that they either reload the page or tell
 * us about the error.
 *
 * @param {string|unknown} error - the error you want to display to the user
 */
export const alertError = (error: string | unknown) => {
    if (typeof error !== 'string') {
        throw new TypeError('error not string')
    }
    const sendEmailMessage =
        'If this issue persists, please send an '
        + 'email to numberscope@colorado.edu with steps to reproduce '
        + 'the error and the error message.'
    window.alert(`Numberscope experienced an error.

Error Message:
${error}

You might need to reload the page.

${sendEmailMessage}`)
}
