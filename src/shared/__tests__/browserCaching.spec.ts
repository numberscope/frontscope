import {describe, it, expect, vi, beforeEach} from 'vitest'
import {
    getCurrent,
    updateCurrent,
    saveSpecimen,
    deleteSpecimen,
    loadSIMToCurrent,
    openCurrent,
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

    it('should update the current SIM', () => {
        updateCurrent({name: 'Test', encode64: () => mockNoncoding})
        const current = JSON.parse(
            localStorage.getItem('currentSpecimen') as string
        )
        expect(current.en64).toBe(mockNoncoding)
        expect(current.name).toBe('Test')
    })

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

    it('should make a named specimen current', () => {
        const savedUrls = [
            {en64: mockNoncoding, name: 'Example1', date: mockDate},
            {en64: mockNoncoding + 'Two', name: 'Example2', date: mockDate},
        ]
        localStorage.setItem('savedSpecimens', JSON.stringify(savedUrls))
        loadSIMToCurrent('Example2')
        expect(getCurrent().en64).toEqual(mockNoncoding + 'Two')
        expect(getCurrent().name).toEqual('Example2')
    })

    it('should generate the current Specimen', () => {
        updateCurrent({
            name: 'Twelve',
            encode64: () =>
                'eyJuYW1lIjoiVHdlbHZlIiwic2VxdWVuY2UiOiJSYW5kb20iLCJzZXF1ZW5jZ'
                + 'VBhcmFtcyI6ImV5SnRhVzRpT2lJeE1pSXNJbTFoZUNJNklqRXlJbjA9Iiwi'
                + 'dmlzdWFsaXplciI6Ik1vZEZpbGwiLCJ2aXN1YWxpemVyUGFyYW1zIjoiZXl'
                + 'KdGIyUkVhVzFsYm5OcGIyNGlPaUl4TWlKOSJ9',
        })
        const specimen = openCurrent()
        expect(specimen.name).toEqual('Twelve')
        expect(specimen.visualizerKey).toEqual('ModFill')
        expect(specimen.sequenceKey).toEqual('Random')
        // Anything else we should check? The mod dimension?
    })
})
