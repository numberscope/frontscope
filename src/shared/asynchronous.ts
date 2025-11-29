/* Helper functions for dealing ith JavaScript's asynchronous system */

/* Returns a trivial Promise. The point is that if you periodically await
 * the result of this function, it emulates, at least to some extent,
 * cooperative multitasking.
 */
export function yieldExecution() {
    return new Promise(res => setTimeout(res, 0))
}
