/* Helper functions for laying out the user interface */
export function isMobile() {
    const tabletBreakpoint = parseInt(
        window
            .getComputedStyle(document.documentElement)
            .getPropertyValue('--ns-breakpoint-tablet')
    )
    return window.innerWidth < tabletBreakpoint
}

// Returns the decimal string of a big number with (breaking) thin spaces
// every three characters if it is over nine digits long
export function breakableString(n: bigint) {
    let s = n.toString()
    const minus = Number(n < 0) // stupid typescript, Number conversion auto
    const breaklength = 10 + minus
    if (s.length < breaklength) return s
    let firstblock = s.length % 3
    if (firstblock === 1 && minus) firstblock = 4
    let prefix = ''
    if (firstblock) {
        prefix = s.substr(0, firstblock)
        s = s.substr(firstblock)
    }
    const parts = Array.from(s.match(/.{3}/g) ?? [])
    if (prefix) parts.unshift(prefix)
    return parts.join('\u2009') // thin space
}
