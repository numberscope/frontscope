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
export const vizKey = 'viz'
export const seqKey = 'seq'
export const vizQueryKey = vizKey + 'Q'
export const seqQueryKey = seqKey + 'Q'
export function specimenQuery(
    name: string,
    visualizerKind: string,
    sequenceKind: string,
    visualizerQuery?: string,
    sequenceQuery?: string
): string {
    const query = new URLSearchParams({
        name,
        [vizKey]: visualizerKind,
        [seqKey]: sequenceKind,
    })
    if (visualizerQuery) query.append(vizQueryKey, visualizerQuery)
    if (sequenceQuery) query.append(seqQueryKey, sequenceQuery)
    return query.toString()
}

// MEMORY RELATED HELPER FUNCTIONS AND VARIABLES

// Keys of where the SIMs are saved (is arbitrary)
const cacheKey = 'savedSpecimens'
const currentKey = 'currentSpecimen'

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

    return {query: defaultQuery, date: ''}
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
        savedSIMs.push({query, date})
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
