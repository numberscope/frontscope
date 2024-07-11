/* Helper functions for laying out the user interface */
export function isMobile() {
    const tabletBreakpoint = parseInt(
        window
            .getComputedStyle(document.documentElement)
            .getPropertyValue('--ns-breakpoint-tablet')
    )
    return window.innerWidth < tabletBreakpoint
}
