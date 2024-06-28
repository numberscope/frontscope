/* A "SIM" (Specimen In Memory) is a triple of strings,
    The first string contains the specimen URL
    The second string contains the specimen name
    The third string contains the date on which it was last saved
*/

// NON MEMORY RELATED HELPER FUNCTIONS
interface SIM {
    url: string
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

//MEMORY RELATED HELPER FUNCTIONS AND VARIABLES

//Keys of where the SIMs are saved (is arbitrary)
const cacheKey = 'savedSpecimens'
const currentKey = 'currentSpecimen'

/**
 * Fetches the array of SIMs represented in memory.
 * @return {SIM[]}
 */
function getSIMs(): SIM[] {
    // Retrieves the saved SIMs from browser cache
    const savedSIMsJson = localStorage.getItem(cacheKey)
    // Creates empty list in case none is found in browser storage
    let savedSIMs: SIM[] = []

    // Parses the saved SIMs if they exist and overrides empty savedUrls
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
 * @param {string} name
 * @return {SIM}
 */
function getSIMByName(name: string): SIM {
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
 * @return {SIM}
 */
export function getCurrent(): SIM {
    // Retrieves the saved SIM in the current slot
    const savedCurrent = localStorage.getItem(currentKey)

    //Creates an empty saved SIM in case the slot is somehow empty
    let currentSIM: SIM = {url: '', name: '', date: ''}

    //Overrides the empty SIM with whatever is in the memory
    if (savedCurrent) {
        currentSIM = JSON.parse(savedCurrent)
    }

    return currentSIM
}

/**
 * Overrides the url and name in the current slot.
 * To be called whenever changes are made to the current specimen.
 *
 * @param {string} url
 * @param {string} name
 */
export function updateCurrent(url: string, name: string): void {
    // Overrides url and name in the current slot
    const current: SIM = getCurrent()
    current.name = name
    current.url = url
    localStorage.setItem(currentKey, JSON.stringify(current))
}

/**
 * Packages the url and name into a new SIM and saves it.
 * It also updates the "last saved" property of the SIM.
 * If the name corresponds to an already existing SIM, it is overriden.
 * It should be called when the user presses the save button.
 *
 * @param {string} url
 * @param {string} name
 */

export function saveSpecimen(url: string, name: string): void {
    const date = getCurrentDate()
    const savedURLs = getSIMs()
    const existing = savedURLs.find(SIM => SIM.name === name)
    if (existing) {
        existing.url = url
        existing.date = getCurrentDate()
    } else {
        savedURLs.push({name, url, date})
    }
    putSIMs(savedURLs)
}

/**
 * Deletes a specimen specified by name from the cached array.
 * It should be called when the user presses the delete button.
 *
 * @param {string} name
 */
export function deleteSpecimen(name: string): void {
    const savedURLs = getSIMs()
    const index = savedURLs.findIndex(SIM => SIM.name === name)
    // If the SIM object is found, remove it from the array
    if (index !== -1) savedURLs.splice(index, 1)
    putSIMs(savedURLs)
}

/**
 * Loads the parameter of a SIM specified by name into current.
 * It should be called when the user presses a specimen in the gallery.
 * If the name is not found in memory it will throw an error.
 *
 * @param {string}name
 */
export function openSpecimen(name: string): void {
    const SIM = getSIMByName(name)

    localStorage.setItem(currentKey, JSON.stringify(SIM))
}
