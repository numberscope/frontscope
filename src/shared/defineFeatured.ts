import {specimenQuery} from './browserCaching'

// Encodings of the featured specimens

const featuredSIMs = [
    // This first one is a candidate for removal from Featured, I would say
    specimenQuery(
        'Basic Modfill',
        'ModFill',
        'Random',
        'modDimension=12',
        'min=3&max=14'
    ),
    specimenQuery(
        'Twelve',
        'ModFill',
        'Formula',
        'modDimension=12',
        'formula=12'
    ),
    specimenQuery(
        'Latticework',
        'Turtle',
        'Random',
        'domain=0+1&range=45+135&strokeWeight=3'
            + '&bgColor=6b1a1a&strokeColor=c98787',
        'min=0&max=1'
    ),
    specimenQuery(
        'Residue Rise',
        'ModFill',
        'Random',
        'modDimension=10000',
        'min=0&max=90000'
    ),
    specimenQuery(
        'Chaos Game',
        'Chaos',
        'Random',
        'corners=3&colorStyle=1&dummyDotControl=true'
            + '&circSize=2&alpha=0.4&darkMode=true',
        'min=0&max=2'
    ),
    specimenQuery(
        'Polyfactors',
        'Histogram',
        'Formula',
        'binSize=1&terms=1000',
        'formula=n%5E3-n%5E2'
    ),
    specimenQuery(
        'Wait For It',
        'Turtle',
        'Formula',
        'domain=-1+1&range=30+120&stepSize=30&strokeWeight=2'
            + '&bgColor=5d509f&strokeColor=7a9f6f',
        'formula=sign%28sin%28n%2B1%29%29'
    ),
]

// Is there any reason for us to associate dates with featured specimens? Do
// we want to record when they were added and show that information somehow?
const theSIMs = featuredSIMs.map(query => {
    return {query, date: '', canDelete: false}
})

export function getFeatured() {
    return theSIMs
}
