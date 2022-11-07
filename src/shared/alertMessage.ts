/** md
 * ## A utility for creating an error message to alert
 *
 * If Numberscope experiences an error, we don't want it
 * to silently fail and leave the user wondering why things
 * aren't working. Instead, we tell them about the error
 * with the hope that they either reload the page or tell
 * us about the error.
 *
 * @param {string|unknown} error - the error you want to display to the user
 * @returns {string} - message you want to alert
 */
export const alertMessage = (error: string | unknown) => {
    const errorMessage =
        'Numberscope experienced an error.\n\n'
        + 'Error Message:\n'
        + `${error}\n\n`
    const reloadDirective = 'You might need to reload the page.\n\n'
    const sendEmailDirective =
        'If this issue persists, please send an '
        + 'email to numberscope@colorado.edu with steps to reproduce '
        + 'the error and the error message.'
    return errorMessage + reloadDirective + sendEmailDirective
}
