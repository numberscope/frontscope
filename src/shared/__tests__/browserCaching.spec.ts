import {describe, it, expect, vi, beforeEach} from 'vitest'
import {
    getCurrent,
    updateCurrent,
    getURLNameAt,
    getURLNameByName,
    saveSpecimen,
    deleteSpecimen,
    openSpecimen,
} from '../browserCaching'

// Mocks localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {}

    return {
        getItem(key: string) {
            return store[key] || null
        },
        setItem(key: string, value: string) {
            store[key] = value
        },
        clear() {
            store = {}
        },
        removeItem(key: string) {
            delete store[key]
        },
    }
})()

Object.defineProperty(global, 'localStorage', {
    value: localStorageMock,
})

// Mock date
const mockDate = '06/27/2024, 10:00:00'
vi.useFakeTimers()
vi.setSystemTime(new Date(mockDate))

beforeEach(() => {
    localStorage.clear()
})

describe('URLName functions', () => {
    it('should get the current URLName', () => {
        const current = {
            url: 'https://example.com',
            name: 'Example',
            date: mockDate,
        }
        localStorage.setItem('currentSpecimen', JSON.stringify(current))
        expect(getCurrent()).toEqual(current)
    })

    it('should update the current URLName', () => {
        updateCurrent('https://test.com', 'Test')
        const current = JSON.parse(
            localStorage.getItem('currentSpecimen') as string
        )
        expect(current.url).toBe('https://test.com')
        expect(current.name).toBe('Test')
    })

    it('should get URLName at a specific index', () => {
        const savedUrls = [
            {url: 'https://example1.com', name: 'Example1', date: mockDate},
            {url: 'https://example2.com', name: 'Example2', date: mockDate},
        ]
        localStorage.setItem('savedSpecimens', JSON.stringify(savedUrls))
        expect(getURLNameAt(1)).toEqual(savedUrls[1])
    })

    it('should throw error when getting URLName at out-of-bounds index', () => {
        const savedUrls = [
            {url: 'https://example1.com', name: 'Example1', date: mockDate},
        ]
        localStorage.setItem('savedSpecimens', JSON.stringify(savedUrls))
        expect(() => getURLNameAt(2)).toThrow('Index out of bounds')
    })

    it('should get URLName by name', () => {
        const savedUrls = [
            {url: 'https://example1.com', name: 'Example1', date: mockDate},
            {url: 'https://example2.com', name: 'Example2', date: mockDate},
        ]
        localStorage.setItem('savedSpecimens', JSON.stringify(savedUrls))
        expect(getURLNameByName('Example2')).toEqual(savedUrls[1])
    })

    it('should throw error when URLName by name is not found', () => {
        const savedUrls = [
            {url: 'https://example1.com', name: 'Example1', date: mockDate},
        ]
        localStorage.setItem('savedSpecimens', JSON.stringify(savedUrls))
        expect(() => getURLNameByName('NonExistent')).toThrow(
            'Name not found'
        )
    })

    it('should save a new specimen', () => {
        saveSpecimen('https://example.com', 'Example')
        const savedUrls = JSON.parse(
            localStorage.getItem('savedSpecimens') as string
        )
        expect(savedUrls).toEqual([
            {url: 'https://example.com', name: 'Example', date: mockDate},
        ])
    })

    it('should update an existing specimen', () => {
        saveSpecimen('https://example.com', 'Example')
        saveSpecimen('https://example2.com', 'Example')
        const savedUrls = JSON.parse(
            localStorage.getItem('savedSpecimens') as string
        )
        expect(savedUrls).toEqual([
            {url: 'https://example2.com', name: 'Example', date: mockDate},
        ])
    })

    it('should delete a specimen by name', () => {
        const savedUrls = [
            {url: 'https://example1.com', name: 'Example1', date: mockDate},
            {url: 'https://example2.com', name: 'Example2', date: mockDate},
        ]
        localStorage.setItem('savedSpecimens', JSON.stringify(savedUrls))
        deleteSpecimen('Example1')
        const updatedUrls = JSON.parse(
            localStorage.getItem('savedSpecimens') as string
        )
        expect(updatedUrls).toEqual([savedUrls[1]])
    })

    it('should open a specimen by name', () => {
        const savedUrls = [
            {url: 'https://example1.com', name: 'Example1', date: mockDate},
            {url: 'https://example2.com', name: 'Example2', date: mockDate},
        ]
        localStorage.setItem('savedSpecimens', JSON.stringify(savedUrls))
        openSpecimen('Example1')
        const current = JSON.parse(
            localStorage.getItem('currentSpecimen') as string
        )
        expect(current).toEqual(savedUrls[0])
    })
})
