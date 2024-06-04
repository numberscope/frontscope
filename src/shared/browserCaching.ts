//Key of where the urls are saved, is arbitrary
const cacheKey = 'savedUrls'

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
