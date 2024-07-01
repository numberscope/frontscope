/* eslint-disable max-len */
import type {SIM} from './browserCaching'

// Use the array below to define the featured specimens.
// Note that `en64` is the base64 encoding of the desired specimens, which
// can be found as the value of the `specimen=` query string in the URL.

export function getFeatured(): SIM[] {
    const featuredSIMs = [
        {
            en64: 'eyJuYW1lIjoiQmFzaWMgTW9kZmlsbCIsInNlcXVlbmNlIjoiUmFuZG9tIiwic2VxdWVuY2VQYXJhbXMiOiJleUp0YVc0aU9pSXlJaXdpYldGNElqb2lNVFFpZlE9PSIsInZpc3VhbGl6ZXIiOiJNb2RGaWxsIiwidmlzdWFsaXplclBhcmFtcyI6ImV5SnRiMlJFYVcxbGJuTnBiMjRpT2lJeE1pSjkifQ==',
            name: 'Basic Modfill',
            date: '',
        },
        {
            en64: 'eyJuYW1lIjoiVHdlbHZlIiwic2VxdWVuY2UiOiJSYW5kb20iLCJzZXF1ZW5jZVBhcmFtcyI6ImV5SnRhVzRpT2lJeE1pSXNJbTFoZUNJNklqRXlJbjA9IiwidmlzdWFsaXplciI6Ik1vZEZpbGwiLCJ2aXN1YWxpemVyUGFyYW1zIjoiZXlKdGIyUkVhVzFsYm5OcGIyNGlPaUl4TWlKOSJ9',
            name: 'Twelve',
            date: '',
        },
        {
            en64: 'eyJuYW1lIjoiTGF0dGljZXdvcmsiLCJzZXF1ZW5jZSI6IlJhbmRvbSIsInNlcXVlbmNlUGFyYW1zIjoiZXlKdGFXNGlPaUl3SWl3aWJXRjRJam9pTVNKOSIsInZpc3VhbGl6ZXIiOiJUdXJ0bGUiLCJ2aXN1YWxpemVyUGFyYW1zIjoiZXlKa2IyMWhhVzRpT2lJd0xDQXhJaXdpY21GdVoyVWlPaUkwTlN3Z01UTTFJaXdpYzNSbGNGTnBlbVVpT2lJeU1DSXNJbk4wWVhKMElqb2lNQ3dnTUNJc0luTjBjbTlyWlZkbGFXZG9kQ0k2SWpNaUxDSmlaME52Ykc5eUlqb2lJelppTVdFeFlTSXNJbk4wY205clpVTnZiRzl5SWpvaUkyTTVPRGM0TnlKOSJ9',
            name: 'Latticework',
            date: '',
        },
        {
            en64: 'eyJuYW1lIjoiUmVzaWR1ZSBSaXNlIiwic2VxdWVuY2UiOiJSYW5kb20iLCJzZXF1ZW5jZVBhcmFtcyI6ImV5SnRhVzRpT2lJd0lpd2liV0Y0SWpvaU9UQXdNREFpZlE9PSIsInZpc3VhbGl6ZXIiOiJNb2RGaWxsIiwidmlzdWFsaXplclBhcmFtcyI6ImV5SnRiMlJFYVcxbGJuTnBiMjRpT2lJeE1EQXdNQ0o5In0=',
            name: 'Residue Rise',
            date: '',
        },
        {
            en64: 'eyJuYW1lIjoiQ2hhb3MgR2FtZSIsInNlcXVlbmNlIjoiUmFuZG9tIiwic2VxdWVuY2VQYXJhbXMiOiJleUp0YVc0aU9pSXdJaXdpYldGNElqb2lNaUo5IiwidmlzdWFsaXplciI6IkNoYW9zIiwidmlzdWFsaXplclBhcmFtcyI6ImV5SmpiM0p1WlhKeklqb2lNeUlzSW1aeVlXTWlPaUl3TGpVaUxDSjNZV3hyWlhKeklqb2lNU0lzSW1OdmJHOXlVM1I1YkdVaU9pSXhJaXdpWjNKaFpHbGxiblJNWlc1bmRHZ2lPaUl4TURBd01DSXNJbWhwWjJoc2FXZG9kRmRoYkd0bGNpSTZJakFpTENKbWFYSnpkQ0k2SWpBaUxDSnNZWE4wSWpvaU1UQXdNREF3TURBd01DSXNJbVIxYlcxNVJHOTBRMjl1ZEhKdmJDSTZJblJ5ZFdVaUxDSmphWEpqVTJsNlpTSTZJaklpTENKaGJIQm9ZU0k2SWpBdU5DSXNJbkJwZUdWc2MxQmxja1p5WVcxbElqb2lOREF3SWl3aWMyaHZkMHhoWW1Wc2N5STZJbVpoYkhObElpd2laR0Z5YTAxdlpHVWlPaUowY25WbEluMD0ifQ==',
            name: 'Chaos Game',
            date: '',
        },
        {
            en64: 'eyJuYW1lIjoiUG9seWZhY3RvcnMiLCJzZXF1ZW5jZSI6IkZvcm11bGEiLCJzZXF1ZW5jZVBhcmFtcyI6ImV5Sm1iM0p0ZFd4aElqb2libDR6TFc1ZU1pSjkiLCJ2aXN1YWxpemVyIjoiSGlzdG9ncmFtIiwidmlzdWFsaXplclBhcmFtcyI6ImV5SmlhVzVUYVhwbElqb2lNU0lzSW1acGNuTjBTVzVrWlhnaU9pSWlMQ0owWlhKdGN5STZJakV3TURBaUxDSnRiM1Z6WlU5MlpYSWlPaUowY25WbEluMD0ifQ==',
            name: 'Polyfactors',
            date: '',
        },
        {
            en64: 'eyJuYW1lIjoiV2FpdCBGb3IgSXQiLCJzZXF1ZW5jZSI6IkZvcm11bGEiLCJzZXF1ZW5jZVBhcmFtcyI6ImV5Sm1iM0p0ZFd4aElqb2liV2x1S0dac2IyOXlLSE5wYmlodUtTa3BKVFVpZlE9PSIsInZpc3VhbGl6ZXIiOiJUdXJ0bGUiLCJ2aXN1YWxpemVyUGFyYW1zIjoiZXlKa2IyMWhhVzRpT2lJd0xDQXhMQ0F5TENBekxDQTBJaXdpY21GdVoyVWlPaUl6TUN3Z05EVXNJRFl3TENBNU1Dd2dNVEl3SWl3aWMzUmxjRk5wZW1VaU9pSXpNQ0lzSW5OMFlYSjBJam9pTUN3Z01DSXNJbk4wY205clpWZGxhV2RvZENJNklqSWlMQ0ppWjBOdmJHOXlJam9pSXpWa05UQTVaaUlzSW5OMGNtOXJaVU52Ykc5eUlqb2lJemRoT1dZMlppSjkifQ==',
            name: 'Wait For It',
            date: '',
        },
    ]

    return featuredSIMs
}