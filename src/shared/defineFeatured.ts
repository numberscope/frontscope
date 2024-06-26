/* eslint-disable max-len */
import type {SIM} from './browserCaching'

//Use the array below to define the featured specimens.
//IMPORTANT: DO NOT USE THE FULL LINK IN THE URL FIELD, ONLY THE TOKEN

export function getFeatured(): SIM[] {
    const featuredSIMs = [
        {
            url: 'eyJuYW1lIjoiQmFzaWMgTW9kZmlsbCIsInNlcXVlbmNlIjoiUmFuZG9tIiwic2VxdWVuY2VQYXJhbXMiOiJleUp0YVc0aU9pSXlJaXdpYldGNElqb2lNVFFpZlE9PSIsInZpc3VhbGl6ZXIiOiJNb2RGaWxsIiwidmlzdWFsaXplclBhcmFtcyI6ImV5SnRiMlJFYVcxbGJuTnBiMjRpT2lJeE1pSjkifQ==',
            name: 'Basic Modfill',
            date: '',
        },
        {
            url: 'eyJuYW1lIjoiVHdlbHZlIiwic2VxdWVuY2UiOiJSYW5kb20iLCJzZXF1ZW5jZVBhcmFtcyI6ImV5SnRhVzRpT2lJeE1pSXNJbTFoZUNJNklqRXlJbjA9IiwidmlzdWFsaXplciI6Ik1vZEZpbGwiLCJ2aXN1YWxpemVyUGFyYW1zIjoiZXlKdGIyUkVhVzFsYm5OcGIyNGlPaUl4TWlKOSJ9',
            name: 'Twelve',
            date: '',
        },
    ]

    return featuredSIMs
}
