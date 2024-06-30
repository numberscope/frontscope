import {describe, it, expect, vi, beforeEach} from 'vitest'
import {
    getCurrent,
    //    updateCurrent,
    saveSpecimen,
    deleteSpecimen,
    //    loadSIMToCurrent,
    //    openCurrent,
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
const mockNoncoding = 'ThisIsNotReallyASpecimenEncoding'
vi.useFakeTimers()
vi.setSystemTime(new Date(mockDate))

beforeEach(() => {
    localStorage.clear()
})

describe('SIM functions', () => {
    it('should get the current SIM', () => {
        const current = {
            en64: mockNoncoding,
            name: 'Example',
            date: mockDate,
        }
        localStorage.setItem('currentSpecimen', JSON.stringify(current))
        expect(getCurrent()).toEqual(current)
    })

    /**** TODO: Need new test for updateCurrent 
    it('should update the current SIM', () => {
        updateCurrent('https://test.com', 'Test')
        const current = JSON.parse(
            localStorage.getItem('currentSpecimen') as string
        )
        expect(current.url).toBe('https://test.com')
        expect(current.name).toBe('Test')
    }) ****/

    it('should save a new specimen', () => {
        saveSpecimen(mockNoncoding, 'Example')
        const savedUrls = JSON.parse(
            localStorage.getItem('savedSpecimens') as string
        )
        expect(savedUrls).toEqual([
            {en64: mockNoncoding, name: 'Example', date: mockDate},
        ])
    })

    it('should update an existing specimen', () => {
        saveSpecimen(mockNoncoding + 'Different', 'Example')
        saveSpecimen(mockNoncoding, 'Example')
        const savedUrls = JSON.parse(
            localStorage.getItem('savedSpecimens') as string
        )
        expect(savedUrls).toEqual([
            {en64: mockNoncoding, name: 'Example', date: mockDate},
        ])
    })

    it('should delete a specimen by name', () => {
        const savedUrls = [
            {en64: mockNoncoding, name: 'Example1', date: mockDate},
            {en64: mockNoncoding + 'Two', name: 'Example2', date: mockDate},
        ]
        localStorage.setItem('savedSpecimens', JSON.stringify(savedUrls))
        deleteSpecimen('Example1')
        const updatedUrls = JSON.parse(
            localStorage.getItem('savedSpecimens') as string
        )
        expect(updatedUrls).toEqual([savedUrls[1]])
    })

    /***** TODO: Replace with tests for loadSIMToCurrent and openCurrent 
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
    }) ***/
})
