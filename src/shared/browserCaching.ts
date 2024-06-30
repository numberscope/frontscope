import {Specimen} from './Specimen'

/* A "SIM" (Specimen In Memory) is a triple of strings,
    The first string contains the specimen encoded in base64
    The second string contains the specimen name
    The third string contains the date on which it was last saved
*/

// NON MEMORY RELATED HELPER FUNCTIONS
export interface SIM {
    en64: string
    name: string
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

// MEMORY RELATED HELPER FUNCTIONS AND VARIABLES

// Keys of where the SIMs are saved (is arbitrary)
const cacheKey = 'savedSpecimens'
const currentKey = 'currentSpecimen'

// The default specimen
// Will be displayed when the user visits the website for the first time
const defaultSpecimen = new Specimen('Specimen', 'ModFill', 'Random')

/**
 * Fetches the array of SIMs represented in memory.
 * @return {SIM[]}
 */
export function getSIMs(): SIM[] {
    // Retrieves the saved SIMs from browser cache
    const savedSIMsJson = localStorage.getItem(cacheKey)
    // Creates empty list in case none is found in browser storage
    let savedSIMs: SIM[] = []

    // Parses the saved SIMs if they exist
    if (savedSIMsJson) {
        savedSIMs = JSON.parse(savedSIMsJson)
    }

    return savedSIMs
}

/**
 * Overwrites the array of SIMS in local storage.
 * @param {SIM[]} sims
 */
function putSIMs(sims: SIM[]) {
    localStorage.setItem(cacheKey, JSON.stringify(sims))
}

/**
 * Fetches the SIM associated with a certain name.
 *
 * @param {string} name  Name of SIM to look up
 * @return {SIM} Associated SIM
 */
export function getSIMByName(name: string): SIM {
    const savedSIMs = getSIMs()

    // Finds the SIM that matches the given name
    const SIM = savedSIMs.find(SIM => SIM.name === name)

    // Return the found SIM object or null if not found
    if (SIM) {
        return SIM
    } else {
        // Throws an error if that name is not assigned to any SIM
        throw new Error('Name not found')
    }
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

    //Creates an empty saved SIM in case the slot is somehow empty
    let currentSIM: SIM = {en64: '', name: '', date: ''}

    //Overrides the empty SIM with whatever is in the memory
    if (savedCurrent) {
        currentSIM = JSON.parse(savedCurrent)
    }

    return currentSIM
}

// Helper type for updateCurrent
interface SpecNameEncode {
    name: string
    encode64(): string
}

/**
 * Overrides the base64 encoding and inferred name in the current slot.
 * To be called whenever changes are made to the current specimen.
 *
 * @param {{name: string, encode64():string}} specimen  new current specimen
 */
export function updateCurrent(specimen: SpecNameEncode): void {
    // Overrides the current slot
    const current = getCurrent()
    current.name = specimen.name
    current.en64 = specimen.encode64()
    localStorage.setItem(currentKey, JSON.stringify(current))
}

/**
 * Packages the base64 encoding and name into a new SIM and saves it.
 * It also updates the "last saved" property of the SIM.
 * If the name corresponds to an already existing SIM, it is overriden.
 * It should be called when the user presses the save button.
 *
 * @param {string} base64  encoding of the specimen to save
 * @param {string} name  name to save specimen under
 */

export function saveSpecimen(en64: string, name: string): void {
    const date = getCurrentDate()
    const savedSIMs = getSIMs()
    const existing = savedSIMs.find(SIM => SIM.name === name)
    if (existing) {
        existing.en64 = en64
        existing.date = getCurrentDate()
    } else {
        savedSIMs.push({name, en64, date})
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
    const index = savedSIMs.findIndex(SIM => SIM.name === name)
    // If the SIM object is found, remove it from the array
    if (index !== -1) savedSIMs.splice(index, 1)
    putSIMs(savedSIMs)
}

/**
 * Loads the parameter of a SIM specified by name into current.
 * It should be called when the user presses a specimen in the gallery.
 * If the name is not found in memory it will throw an error.
 *
 * @param {string} name  Name of specimen to make current
 */
export function loadSIMToCurrent(name: string): void {
    const SIM = getSIMByName(name)
    localStorage.setItem(currentKey, JSON.stringify(SIM))
}

/**
 * Returns the Specimen specified by the current SIM
 * @return {Specimen} the current specimen
 */
export function openCurrent(): Specimen {
    const currentSIM = getCurrent()
    if (currentSIM.en64 == '') {
        return defaultSpecimen
    }
    return Specimen.decode64(currentSIM.en64)
}
