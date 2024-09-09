import {Random} from '../Random'

export class FragileRandom extends Random {
    calced = new Set()

    calculate(n: bigint) {
        // Check if we've been asked before
        if (this.calced.has(n)) {
            throw Error(`FragileRandom: tried to calculate ${n} twice`)
        }
        this.calced.add(n)
        return super.calculate(n)
    }
}
