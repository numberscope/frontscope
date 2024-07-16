/* Some utilities for querying and checking fields (= own properties)
   of objects
*/

export type StringFields<T extends {[key: string]: unknown}> = {
    [K in keyof T]: string
}

export function makeStringFields<T extends {[key: string]: unknown}>(
    example: T
): StringFields<T> {
    // TypeScript not currently up to deducing the type of Object.fromEntries
    // in any very specific way
    return Object.fromEntries(
        Object.keys(example).map(k => [k, ''])
    ) as StringFields<T>
}

export function hasField(obj: object, field: string) {
    return Object.prototype.hasOwnProperty.call(obj, field)
}
