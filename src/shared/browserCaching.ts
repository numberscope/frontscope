/* A "URLName" is a triple of strings,
    The first string contains the specimen URL
    The second string contains the specimen name
    The third string contains the date on which it was last saved
*/

// NON MEMORY RELATED HELPER FUNCTIONS
interface URLName {
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

//Key of where the URLNames are saved (is arbitrary)
const cacheKey = 'savedSpecimens'
const currentKey = 'currentSpecimen'

function getURLNames(): URLName[] {
    // Retrieves the saved URLs from browser cache
    const savedUrlsJson = localStorage.getItem(cacheKey)
    // Creates empty savedUrls in case none is found in browser storage
    let savedUrls: URLName[] = []

    // Parses the saved URLs if they exist and overrides empty savedUrls
    if (savedUrlsJson) {
        savedUrls = JSON.parse(savedUrlsJson)
    }

    return savedUrls
}

//MAIN FUNCTIONS

export function getCurrent(): URLName {
    // Retrieves the saved URL in the current slot
    const savedCurrent = localStorage.getItem(currentKey)

    //Creates an empty saved URL in case the slot is somehow empty
    let currentURLName: URLName = {url: '', name: '', date: ''}

    //Overrides the empty URL with whatever is in the memory
    if (savedCurrent) {
        currentURLName = JSON.parse(savedCurrent)
    }

    return currentURLName
}

export function updateCurrent(url: string, name: string): void {
    // Overrides url and name in the current slot
    const current: URLName = getCurrent()
    current.name = name
    current.url = url
    localStorage.setItem(currentKey, JSON.stringify(current))
}

export function getURLNameAt(idx: number): URLName {
    const savedUrlNames = getURLNames()

    //Checks that the index is valid
    if (idx >= 0 && idx < savedUrlNames.length) {
        //Returns the URLNames stored at the position indicated
        return savedUrlNames[idx]
    } else {
        throw new Error('Index out of bounds')
    }
}

export function getURLNameByName(name: string): URLName {
    const savedUrlNames = getURLNames()

    // Finds the URLName that matches the given name
    const urlName = savedUrlNames.find(urlName => urlName.name === name)

    // Return the found URLName object or null if not found
    if (urlName) {
        return urlName
    } else {
        // Throws an error if that name is not assigned to any URLName
        throw new Error('Name not found')
    }
}

export function saveSpecimen(url: string, name: string): void {
    const savedUrls = getURLNames()
    let urlName = {url: url, name: name, date: getCurrentDate()}
    let contains = false

    //Checks if the URLName's name is contained in the array
    try {
        urlName = getURLNameByName(name)
        contains = true

        // TODO send warning
    } catch (error) {
        //If there is no name which matches, that is ok
    }

    // Checks if the URLName is already in the array
    if (!contains) {
        // Appends the URL to the array
        savedUrls.push(urlName)
    } else {
        // Searches for a URLName with a matching name,
        // if it is found it is overriden
        for (let i = 0; i < savedUrls.length; i++) {
            if (savedUrls[i].name === name) {
                savedUrls[i] = {url, name, date: getCurrentDate()}
                break
            }
        }
    }

    // Saves the updated array back to the browser cache
    localStorage.setItem(cacheKey, JSON.stringify(savedUrls))
}

export function deleteSpecimen(name: string): void {
    const savedUrls = getURLNames()

    // Finds the index of the URLName object with the matching name
    const index = savedUrls.findIndex(urlName => urlName.name === name)

    // If the URLName object is found, this removes it from the array
    if (index !== -1) {
        savedUrls.splice(index, 1)
    }

    // Saves the updated array back to the browser cache
    localStorage.setItem(cacheKey, JSON.stringify(savedUrls))
}

export function openSpecimen(name: string): void {
    const UrlName = getURLNameByName(name)

    localStorage.setItem(currentKey, JSON.stringify(UrlName))
}
