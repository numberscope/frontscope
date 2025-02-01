import type {Color as Chroma} from 'chroma-js'
import chromaRaw from 'chroma-js'
export type {Color as Chroma} from 'chroma-js'

const ALPHA = 3
export function overlay(bot: Chroma, top: Chroma): Chroma {
    const retgl = top.gl()
    if (retgl.length < 4 || isNaN(retgl[ALPHA]) || retgl[ALPHA] >= 1.0) {
        return chromaRaw(top)
    }
    const topa = retgl[ALPHA]
    const botgl = bot.gl()
    const bota = botgl[ALPHA] ?? 1.0
    for (let c = 0; c <= ALPHA; ++c) {
        let botval = botgl[c]
        if (c < ALPHA) {
            retgl[c] *= topa
            botval *= bota
        }
        retgl[c] += botval * (1 - topa)
    }
    return chromaRaw(...retgl, 'gl')
}

type Quad = [number, number, number, number]
export const chroma = function (...args: unknown[]) {
    if (args.length === 0) return chromaRaw('black')
    if (args.length === 1) {
        const arg = args[0]
        if (arg instanceof Array && arg.length === 4) {
            return chromaRaw(...(arg as Quad), 'gl')
        }
        if (typeof arg === 'number') {
            if (arg <= 1.0) {
                return chromaRaw(arg, arg, arg, 1, 'gl')
            }
            return chromaRaw(arg, arg, arg)
        }
    }
    if (
        args.length === 2
        && typeof args[0] === 'string'
        && typeof args[1] === 'number'
    ) {
        return chromaRaw(args[0]).alpha(args[1])
    }
    if (
        args.length >= 3
        && typeof args[0] === 'number'
        && typeof args[1] === 'number'
        && typeof args[2] === 'number'
        && args[0] <= 1.0
        && args[1] <= 1.0
        && args[2] <= 1.0
    ) {
        if (args.length === 3) {
            return chromaRaw(args[0], args[1], args[2], 1, 'gl')
        }
        if (
            args.length === 4
            && typeof args[3] === 'number'
            && args[3] <= 1.0
        ) {
            args.push('gl')
        }
    }
    return chromaRaw(...(args as Parameters<typeof chromaRaw>))
} as typeof chromaRaw &
    ((col: string, alpha: number) => Chroma) &
    ((quad: Quad) => Chroma) &
    (() => Chroma)

Object.assign(chroma, chromaRaw)
