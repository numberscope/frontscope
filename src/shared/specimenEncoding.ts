/* This file defines how specimens are encoded into strings, and how
   strings are decoded into the information needed to create a specimen.
   At the moment (and likely permanently), the encodes are URL query
   parameter strings.
*/

const vizKey = 'viz'
export const seqKey = 'seq'
type QuerySpec = {
    name: string
    visualizerKind: string
    sequenceKind: string
    visualizerQuery: string
    sequenceQuery: string
}
/**
 * Generates a URL query string from the information specifying a specimen.
 *
 * @param {string | QuerySpec} nameOrSpec
 *     The name of the specimen, or an object with key `name` and all of
 *     the other argument names as keys, in which case the other arguments
 *     are taken from this object instead
 * @param {string} visualizerKind  The kind of Visualizer
 * @param {string} sequenceKind  The kind of Sequence
 * @param {string?} visualizerQuery  Optional visualizer query parameter string
 * @param {string?} sequenceQuery  Optional sequence query parameter string
 * @return {string} the URL query string encoding of the parameter
 */
export function specimenQuery(
    nameOrSpec: string | QuerySpec,
    visualizerKind?: string,
    sequenceKind?: string,
    visualizerQuery?: string,
    sequenceQuery?: string
): string {
    let name = ''
    if (!visualizerKind) {
        // Only one arg, must be query
        const spec = nameOrSpec as QuerySpec
        name = spec.name
        visualizerKind = spec.visualizerKind
        sequenceKind = spec.sequenceKind
        visualizerQuery = spec.visualizerQuery
        sequenceQuery = spec.sequenceQuery
    } else {
        name = nameOrSpec as string
    }
    if (!sequenceKind) return ''
    const leadQuery = new URLSearchParams({
        name,
        [vizKey]: visualizerKind,
    })
    const sepQuery = new URLSearchParams({[seqKey]: sequenceKind})
    const queries = [leadQuery.toString()]
    if (visualizerQuery) queries.push(visualizerQuery)
    queries.push(sepQuery.toString())
    if (sequenceQuery) queries.push(sequenceQuery)
    return queries.join('&')
}
/**
 * Splits a URL query string for a specimen into its constituent parts
 * Returns an object with keys `name`, `visualizerKind`, `specimenKind`,
 * `visualizerQuery`, and `sequenceQuery`, corresponding to the five
 * arguments of specimenQuery(). I.e., this function inverts specimenQuery().
 *
 * @param {string} query  A URL query string encoding a specimen
 * @return {object} representation of components as decribed above.
 */
export function parseSpecimenQuery(query: string) {
    const params = new URLSearchParams(query)
    const name = params.get('name') || 'Error: Unknown Name'
    // We never insert a frame count in queries we generate, but
    // we do parse it out in case it was specified, e.g. to make
    // tests reproducible
    const frames = parseFloat(params.get('frames') || 'Infinity')
    // Similarly, we never insert a seed, but parse it in case it
    // was specified
    const seed = params.get('randomSeed') || null
    const visualizerKind =
        params.get(vizKey) || 'Error: No visualizer kind specified'
    const sequenceKind =
        params.get(seqKey) || 'Error: No sequence kind specified'
    const vizPat = new RegExp(`&${vizKey}=[^&]*&`, 'd')
    const seqPat = new RegExp(`&${seqKey}=[^&]*&?`, 'd')
    let visualizerQuery = ''
    let sequenceQuery = ''
    const vizMatch = query.match(vizPat)
    const seqMatch = query.match(seqPat)
    if (vizMatch?.indices && seqMatch?.index && seqMatch?.indices) {
        const firstAfterViz = vizMatch.indices[0][1]
        if (seqMatch.index > firstAfterViz)
            visualizerQuery = query.substring(firstAfterViz, seqMatch.index)
        const firstAfterSeq = seqMatch.indices[0][1]
        if (firstAfterSeq < query.length)
            sequenceQuery = query.substring(firstAfterSeq)
    }
    return {
        name,
        frames,
        seed,
        visualizerKind,
        sequenceKind,
        visualizerQuery,
        sequenceQuery,
    }
}
