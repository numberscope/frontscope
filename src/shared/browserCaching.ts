/* This file is responsible for all of the state of Numberscope that is kept
   in browser localStorage. Currently that consists of a collection of saved
   Specimens, and the list of IDs of OEIS sequences that will be shown in
   the Sequence Switcher.
*/

/* A "SIM" (Specimen In Memory) is an object with two string properties:
   query - gives the url-query-encoding of the specimen
   date - gives the date on which it was last saved.

   In a prior version of the code, SIMs used a base64-encoding of specimens,
   so there is code below that reinterprets such encoding into query strings
   on the fly, for backwards compatibility with specimens that may have been
   saved before the switch to query-encoding.
*/

// NON MEMORY RELATED HELPER FUNCTIONS
export interface SIM {
    query: string
    date: string
    canDelete: boolean
}

function getCurrentDate(): string {
    const currentDate = new Date()
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    }
    return new Intl.DateTimeFormat('en-US', options).format(currentDate)
}

// QUERY ENCODING OF SPECIMENS
const vizKey = 'viz'
export const seqKey = 'seq'
/**
 * Generates a URL query string from the information specifying a specimen.
 *
 * @param {string} name  The name of the specimen
 * @param {string} visualizerKind  The kind of Visualizer
 * @param {string} sequenceKind  The kind of Sequence
 * @param {string?} visualizerQuery  Optional visualizer query parameter string
 * @param {string?} sequenceQuery  Optional sequence query parameter string
 * @return {string} the URL query string encoding of the parameter
 */
export function specimenQuery(
    name: string,
    visualizerKind: string,
    sequenceKind: string,
    visualizerQuery?: string,
    sequenceQuery?: string
): string {
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
        visualizerKind,
        sequenceKind,
        visualizerQuery,
        sequenceQuery,
    }
}

// MEMORY RELATED HELPER FUNCTIONS AND VARIABLES

// Keys of where the SIMs and IDs are saved (are arbitrary)
const cacheKey = 'savedSpecimens'
const currentKey = 'currentSpecimen'
const idKey = 'activeIDs'

// The default specimen
// Will be displayed when the user visits the website for the first time
export const defaultQuery = specimenQuery(
    'Default Specimen',
    'ModFill',
    'Random'
)

// For backward compatibility:
function newSIMfromOld(oldSim: {date: string; en64: string}): SIM {
    const data = JSON.parse(window.atob(oldSim.en64))
    if (!('name' in data && 'sequence' in data && 'visualizer' in data))
        return {
            query: specimenQuery('Conversion Error', 'Unknown', 'Unknown'),
            date: '',
            canDelete: true,
        }
    let vizQuery = ''
    if ('visualizerParams' in data && data.visualizerParams) {
        const vizData = JSON.parse(window.atob(data.visualizerParams))
        const vizParams = new URLSearchParams(vizData)
        vizQuery = vizParams.toString()
    }
    let seqQuery = ''
    if ('sequenceParams' in data && data.sequenceParams) {
        const seqData = JSON.parse(window.atob(data.sequenceParams))
        const seqParams = new URLSearchParams(seqData)
        seqQuery = seqParams.toString()
    }
    return {
        date: oldSim.date,
        query: specimenQuery(
            data.name,
            data.visualizer,
            data.sequence,
            vizQuery,
            seqQuery
        ),
        canDelete: true,
    }
}

/**
 * Fetches the array of SIMs represented in memory.
 * @return {SIM[]}
 */
export function getSIMs(): SIM[] {
    // Retrieves the saved SIMs from browser cache
    const savedSIMsJson = localStorage.getItem(cacheKey)
    // Creates empty list in case none is found in browser storage
    const savedSIMs: SIM[] = []

    // Parses the saved SIMs if they exist
    if (savedSIMsJson)
        for (const sim of JSON.parse(savedSIMsJson))
            if ('date' in sim)
                if ('query' in sim) savedSIMs.push(sim)
                else if ('en64' in sim) savedSIMs.push(newSIMfromOld(sim))

    return savedSIMs
}

/**
 * Overwrites the array of SIMS in local storage.
 * @param {SIM[]} sims
 */
function putSIMs(sims: SIM[]) {
    localStorage.setItem(cacheKey, JSON.stringify(sims))
}

export function nameOfQuery(query: string): string {
    const params = new URLSearchParams(query)
    return params.get('name') || 'Error: name not specified'
}

/**
 * Fetches the SIM associated with a certain name.
 *
 * @param {string} name  Name of SIM to look up
 * @param {SIM[]?} sims  Optional list to look in, defaults to getSIMs()
 * @return {SIM|undefined} Associated SIM, or undefined if none
 */
export function getSIMByName(name: string, sims = getSIMs()) {
    // Finds the SIM that matches the given name
    const theSIM = sims.find(s => name === nameOfQuery(s.query))

    // Return the found SIM object or null if not found
    if (theSIM) return theSIM
    return undefined
}

//MAIN FUNCTIONS

/**
 * Loads the last remembered current into the memory slot.
 * To be called whenever the website is booted up.
 * @return {SIM} the current SIM
 */
export function getCurrent(): SIM {
    // Retrieves the saved SIM in the current slot
    const savedCurrent = localStorage.getItem(currentKey)

    if (savedCurrent) {
        const data = JSON.parse(savedCurrent)
        if ('query' in data) return data
        if ('en64' in data) return newSIMfromOld(data)
    }

    return {query: defaultQuery, date: '', canDelete: true}
}

// Helper type for updateCurrent
interface Queryable {
    query: string
}

/**
 * Overrides query in the current slot.
 * To be called whenever changes are made to the current specimen.
 *
 * @param {{query: string}} specimen  new current specimen
 */
export function updateCurrent(specimen: Queryable): void {
    const current = getCurrent()
    current.query = specimen.query
    localStorage.setItem(currentKey, JSON.stringify(current))
}

/**
 * Saves the specimen corresponding to the given query, updating its
 * "last saved" property.
 * If the name in the query corresponds to an already existing SIM,
 * it is overwritten.
 * It should be called when the user presses the save button.
 *
 * @param {string} query  encoding of the specimen to save
 */

export function saveSpecimen(query: string): void {
    const date = getCurrentDate()
    const savedSIMs = getSIMs()
    const existing = getSIMByName(nameOfQuery(query), savedSIMs)
    if (existing) {
        existing.query = query
        existing.date = date
    } else {
        savedSIMs.push({query, date, canDelete: true})
    }
    putSIMs(savedSIMs)
}

/**
 * Deletes a specimen specified by name from the cached array.
 * It should be called when the user presses the delete button.
 *
 * @param {string} name  Name of specimen to delete
 */
export function deleteSpecimen(name: string): void {
    const savedSIMs = getSIMs()
    const index = savedSIMs.findIndex(s => name === nameOfQuery(s.query))
    // If the SIM object is found, remove it from the array
    if (index !== -1) savedSIMs.splice(index, 1)
    putSIMs(savedSIMs)
}

/**
 * Fetches the array of IDs stored locally.
 * @return {string[]}
 */
export function getIDs(): string[] {
    // Retrieves the saved SIMs from browser cache
    const savedIDsJson = localStorage.getItem(idKey)
    // Creates default list in case none is found in browser storage
    let savedIDs: string[] = ['A000040', 'A000045']

    // Parses the saved IDs if they exist
    if (savedIDsJson) savedIDs = JSON.parse(savedIDsJson)
    return savedIDs
}

/**
 * Adds another ID to the ones stored locally, if it is not already present.
 * @param {string} id  The id to potentially add
 */
export function addID(id: string): void {
    const savedIDs = getIDs()
    if (!savedIDs.includes(id)) {
        savedIDs.unshift(id)
        localStorage.setItem(idKey, JSON.stringify(savedIDs))
    }
}

/**
 * Removes an ID from the ones stored locally, if it is present.
 * @param {string} id  The id to potentially delete
 */
export function deleteID(id: string): void {
    const savedIDs = getIDs()
    const index = savedIDs.indexOf(id)
    if (index !== -1) {
        savedIDs.splice(index, 1)
        localStorage.setItem(idKey, JSON.stringify(savedIDs))
    }
}
