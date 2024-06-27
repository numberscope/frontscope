import {describe, it, expect, vi, beforeEach} from 'vitest'
import {
    getCurrent,
    saveSpecimenToBrowser,
    deleteSpecimen,
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

describe('SIM functions', () => {
    it('should get the current SIM', () => {
        const current = {
            url: 'https://example.com',
            name: 'Example',
            date: mockDate,
        }
        localStorage.setItem('currentSpecimen', JSON.stringify(current))
        expect(getCurrent()).toEqual(current)
    })

    it('should save a new specimen', () => {
        saveSpecimenToBrowser('https://example.com', 'Example')
        const savedUrls = JSON.parse(
            localStorage.getItem('savedSpecimens') as string
        )
        expect(savedUrls).toEqual([
            {url: 'https://example.com', name: 'Example', date: mockDate},
        ])
    })

    it('should update an existing specimen', () => {
        saveSpecimenToBrowser('https://example.com', 'Example')
        saveSpecimenToBrowser('https://example2.com', 'Example')
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
})
