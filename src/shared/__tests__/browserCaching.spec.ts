import {describe, it, expect, vi, beforeEach} from 'vitest'
import {
    getCurrent,
    updateCurrent,
    saveSpecimen,
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
const mockQuery = 'name=Test&viz=ModFill&seq=Random'
const anotherQuery = 'name=Test&viz=Turtle&seq=Formula'
const twoSIMs = [
    {query: mockQuery, date: mockDate},
    {query: 'name=Another', date: mockDate},
]

vi.useFakeTimers()
vi.setSystemTime(new Date(mockDate))

beforeEach(() => {
    localStorage.clear()
})

describe('SIM functions', () => {
    it('should get the current SIM', () => {
        const current = {query: mockQuery, date: mockDate}
        localStorage.setItem('currentSpecimen', JSON.stringify(current))
        expect(getCurrent()).toEqual(current)
    })

    it('should update the current SIM', () => {
        updateCurrent({query: mockQuery})
        const current = JSON.parse(
            localStorage.getItem('currentSpecimen') as string
        )
        expect(current.query).toBe(mockQuery)
    })

    it('should save a new specimen', () => {
        saveSpecimen(mockQuery)
        const savedUrls = JSON.parse(
            localStorage.getItem('savedSpecimens') as string
        )
        expect(savedUrls).toEqual([{query: mockQuery, date: mockDate}])
    })

    it('should update an existing specimen', () => {
        saveSpecimen(mockQuery)
        saveSpecimen(anotherQuery)
        const savedUrls = JSON.parse(
            localStorage.getItem('savedSpecimens') as string
        )
        expect(savedUrls).toEqual([{query: anotherQuery, date: mockDate}])
    })

    it('should delete a specimen by name', () => {
        localStorage.setItem('savedSpecimens', JSON.stringify(twoSIMs))
        deleteSpecimen('Test')
        const updatedUrls = JSON.parse(
            localStorage.getItem('savedSpecimens') as string
        )
        expect(updatedUrls).toEqual([twoSIMs[1]])
    })
})
