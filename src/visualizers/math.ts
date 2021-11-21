/* minus() takes two optional inputs and returns undefined if either
   is undefined, and the first minus the second otherwise
   @param left  the first operand
   @param right the second operand
 */ 
export function minus(left?: bigint, right?: bigint): bigint|undefined {
    if (typeof right === 'undefined') return undefined;
    if (typeof left === 'undefined') return undefined;
    return left-right;
}
