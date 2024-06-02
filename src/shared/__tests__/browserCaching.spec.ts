import {describe, it, expect, beforeEach} from 'vitest'
import {saveURL, deleteURL} from '../browserCaching'

// Mocks the browser cache
beforeEach(() => {
    localStorage.clear()
    localStorage.setItem('savedUrls', JSON.stringify([]))
})

describe('saveURL', () => {
    it('This should add the URL to the array', () => {
        saveURL('https://example.com')
        const savedUrls = JSON.parse(
            localStorage.getItem('savedUrls') || '[]'
        )
        expect(savedUrls).toContain('https://example.com')
    })

    it('This should not add the URL if it already exists in the array', () => {
        saveURL('https://example.com')
        saveURL('https://example.com')
        const savedUrls = JSON.parse(
            localStorage.getItem('savedUrls') || '[]'
        )
        expect(savedUrls.length).toBe(1)
    })
})

describe('deleteURL', () => {
    it('This should delete the URL if it exists in the array', () => {
        saveURL('https://example.com')
        deleteURL('https://example.com')
        const savedUrls = JSON.parse(
            localStorage.getItem('savedUrls') || '[]'
        )
        expect(savedUrls).not.toContain('https://example.com')
    })

    it('should throw an error if the URL does not exist in the array', () => {
        expect(() => deleteURL('https://nonexistent.com')).toThrow(
            'Cannot delete a specimen which is not stored.'
        )
    })
})
