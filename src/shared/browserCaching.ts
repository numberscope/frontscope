import {getFeatured} from './defineFeatured'
import {math} from './math'
import {parseSpecimenQuery, specimenQuery} from './specimenEncoding'

/* This file is responsible for all of the state of Numberscope that is kept
   in browser localStorage. Currently that state consists of

   1. A list of saved Specimens,
   2. A list ("history", since it is kept in most-recently-used order
      except for the undeletable "standard" sequences at the front) of
      Sequences that will be shown in the Sequence Switcher.
   3. The "preferred" (most recently used) style of displaying each Gallery
      of specimens: as THUMBNAILS or LIST.
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
    canDelete?: boolean // if not present, defaults to false
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

/* Returns a link to the OEIS related to the first OEIS ID that appears in the
   given string
*/
export function oeisLinkFor(words: string) {
    const id = words.match(/A\d{6}/)
    let url = 'https://oeis.org'
    if (id) url += `/${id[0]}`
    return url
}

// MEMORY RELATED HELPER FUNCTIONS AND VARIABLES

// Keys used to save the different pieces of state in browser localStorage.
// Each key is arbitrary, but they must all be distinct.
const cacheKey = 'savedSpecimens'
const currentKey = 'currentSpecimen'
const cannedKey = 'sequenceHistory'
const galleryKey = 'preferredGalleries'

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

    // If there wasn't any current, set up the current to be
    // a random selection from the featured items. Shallow clone
    // it for the sake of updateCurrent().
    const current = {...math.pickRandom(getFeatured())}
    localStorage.setItem(currentKey, JSON.stringify(current))
    return current
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
    // We also save the current sequence:
    const {sequenceKind, sequenceQuery} = parseSpecimenQuery(query)
    addSequence(sequenceKind, sequenceQuery)
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
 * Fetches the array of canned sequences stored locally.
 * Each sequence is stored as a pair of strings [sequenceKey, queryString]
 * @return {string[][]}
 */
export const standardSequences = [
    ['Formula', ''],
    ['Random', ''],
]
const defaultSequences = [
    ...standardSequences,
    ['Formula', 'formula=%28sqrt%282%29n%29+%25+3'],
    ['OEIS A000040', ''],
    ['OEIS A000045', ''],
]
export function getSequences(): string[][] {
    const cannedJson = localStorage.getItem(cannedKey)
    return cannedJson ? JSON.parse(cannedJson) : defaultSequences
}

/** Utility to find a sequence in a list of sequences **/
const cannedIgnore = new Set(['first', 'last', 'length'])
function findMatchingSequence(
    canned: string[][],
    key: string,
    query: string
): number {
    const params = new URLSearchParams(query)
    return canned.findIndex(element => {
        if (element[0] !== key) return false
        const cannedParams = new URLSearchParams(element[1])
        for (const [prop, val] of params) {
            if (cannedIgnore.has(prop)) continue
            if (!cannedParams.has(prop)) return false
            if (cannedParams.get(prop) !== val) return false
        }
        // OK, cannedParams has all of the properties of params with the
        // same values. But it might have other properties, so check that:
        for (const [prop] of cannedParams) {
            if (cannedIgnore.has(prop)) continue
            if (!params.has(prop)) return false
        }
        // Good enough match!
        return true
    })
}

/**
 * Adds another sequence to the ones stored locally, if it is not already
 * present. Note that in looking up whether the sequence is already present,
 * the extent parameters 'first', 'last', and 'length' are ignored; but their
 * new values overwrite the previously present values if it is.
 * @param {string} key  The sequence key of the sequence to potentially add
 * @param {string} query  The query of the sequence to potentially add
 */

export function addSequence(key: string, query: string): void {
    const canned = getSequences()
    const present = findMatchingSequence(canned, key, query)
    // remove prior version of this sequence if there and is not standard
    if (present >= standardSequences.length) canned.splice(present, 1)
    // And put this sequence just after standard ones if it is not standard
    if (present < 0 || present >= standardSequences.length) {
        canned.splice(standardSequences.length, 0, [key, query])
    }
    localStorage.setItem(cannedKey, JSON.stringify(canned))
}

/**
 * Removes a sequence from the ones stored locally, if it is present.
 * @param {string} key  The sequence key to potentially delete
 * @param {string} query  The query describing the sequence to delete.
 */
export function deleteSequence(key: string, query: string): void {
    const canned = getSequences()
    // We can use equality here because we will only ever try to remove
    // exactly the sequence that is already there.
    const index = canned.findIndex(
        element => element[0] === key && element[1] === query
    )
    if (index !== -1) {
        canned.splice(index, 1)
        localStorage.setItem(cannedKey, JSON.stringify(canned))
    }
}

/**
 * Constants to use for getting/saving display state
 */

export const THUMBNAILS = false
export const LIST = true
export type GalleryPreference = typeof THUMBNAILS | typeof LIST

function getGalleryPrefs() {
    const prefsJson = localStorage.getItem(galleryKey)
    return prefsJson ? JSON.parse(prefsJson) : {}
}
/**
 * Retrieves the preferred method of display for the Gallery named _gallery_.
 * @param {string} gallery  name of Gallery to fetch the preference for
 * @returns {GalleryPreference}  preferred format, THUMBNAILS or LIST
 */
export function getPreferredGallery(gallery: string) {
    return getGalleryPrefs()[gallery] ? LIST : THUMBNAILS
}

/**
 * Sets the preferred method of display for the Gallery named _gallery_.
 * @param {string} gallery  name of Gallery to set the preference for
 * @param {GalleryPreference} pref  new preferred display format
 */
export function setPreferredGallery(
    gallery: string,
    pref: GalleryPreference
) {
    const prefs = getGalleryPrefs()
    prefs[gallery] = pref
    localStorage.setItem(galleryKey, JSON.stringify(prefs))
}
