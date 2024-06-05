//Key of where the urls are saved, is arbitrary
const cacheKey = 'savedUrls'
const currentKey = 'currentKey'

function getURLs(): string[] {
    // Retrieves the saved URLs from browser cache
    const savedUrlsJson = localStorage.getItem(cacheKey)
    // Creates empty savedUrls in case none is found in browser storage
    let savedUrls: string[] = []

    // Parses the saved URLs if they exist and overrides empty savedUrls
    if (savedUrlsJson) {
        savedUrls = JSON.parse(savedUrlsJson)
    }

    return savedUrls
}

export function getCurrent(): string {
    // Retrieves the saved URL in the current slot
    const savedCurrent = localStorage.getItem(currentKey)

    //Creates an empty saved URL in case the slot is somehow empty
    let currentURL: string = ''

    //Overrides the empty URL with whatever is in the memory
    if (savedCurrent) {
        currentURL = savedCurrent
    }

    return currentURL
}

export function setCurrent(url: string): void {
    localStorage.setItem(currentKey, url)
}

export function getURLAt(idx: number): string {
    const savedUrls = getURLs()

    //Checks that the index is valid
    if (idx >= 0 && idx < savedUrls.length) {
        //Returns the URL stored at the position indicated
        return savedUrls[idx]
    } else {
        throw new Error('Index out of bounds')
    }
}

export function saveURL(url: string): void {
    const savedUrls = getURLs()

    // Checks if the URL is already in the array
    if (!savedUrls.includes(url)) {
        // Appends the URL to the array
        savedUrls.push(url)

        // Saves the updated array back to the browser cache
        localStorage.setItem(cacheKey, JSON.stringify(savedUrls))
    }
}

export function deleteURL(url: string): void {
    const savedUrls = getURLs()

    // Checks if the URL is in the array
    const urlIndex = savedUrls.indexOf(url)
    if (urlIndex !== -1) {
        // Removes the URL from the array
        savedUrls.splice(urlIndex, 1)

        // Saves the updated array back to the browser cache
        localStorage.setItem(cacheKey, JSON.stringify(savedUrls))
    } else {
        throw new Error('Cannot delete a specimen which is not stored.')
    }
}
