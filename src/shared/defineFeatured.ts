import {specimenQuery} from './specimenEncoding'

// Encodings of the featured specimens

const featuredSIMs = [
    specimenQuery(
        'Thue Trellis',
        'Turtle',
        'OEIS A010060',
        'domain=0+1&turns=15+-165&steps=2+3'
            + '&pathLook=true&speed=10&bgColor=e0def7&strokeColor=5e8d85'
    ),
    specimenQuery(
        'Divisor Square',
        'Chaos',
        'OEIS A000005',
        'corners=8&walkers=8&alpha=0.7&pixelsPerFrame=2000'
    ),
    specimenQuery(
        'Dance no. 163',
        'ModFill',
        'Formula',
        'modDimension=600&alpha=50&fillColor=a51d2d'
            + '&highlightFormula=%28n%25163*2%29%3E163'
            + '&highColor=ff7800',
        'formula=163*n'
    ),
    specimenQuery(
        'Prime Residues',
        'ModFill',
        'Formula',
        'alpha=20&fillColor=1a5fb4&highColor=f66151',
        'formula=n'
    ),
    specimenQuery(
        'Baffling Beatty Bars',
        'ModFill',
        'Formula',
        'modDimension=250&alpha=70&fillColor=26a269&highlightFormula=floor'
            + '%28sqrt%283%29*n%29&highColor=1a5fb4',
        'formula=floor%28sqrt%282%29*n%29'
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
        'binSize=1',
        'formula=n%5E3-n%5E2&length=1000'
    ),
    specimenQuery(
        'Wait For It',
        'Turtle',
        'Formula',
        'domain=-1+1&turns=30+120&steps=30+30&pathLook=true&strokeWeight=2'
            + '&bgColor=5d509f&strokeColor=7a9f6f',
        'formula=sign%28sin%28n%2B1%29%29'
    ),
    specimenQuery(
        'Tau Many Primes',
        'FactorFence',
        'OEIS A000594',
        'signs=false'
    ),
    specimenQuery(
        'VFib Snowflake',
        'Turtle',
        'OEIS A000045',
        'domain=0+1&turns=8+120&steps=40+400'
            + '&animationControls=true&folds=200+0'
            + '&bgColor=4f4875&strokeColor=cec0c0',
        'modulus=9&last=999&length=1000'
    ),
    specimenQuery(
        'Beatty DNA',
        'Turtle',
        'OEIS A001951',
        '&domain=0+1+2&turns=79+0+45&steps=2.5+1.5+3'
            + '&pathLook=true&speed=10&bgColor=6c162b&strokeColor=be9b9b',
        '&modulus=3'
    ),
]

// Is there any reason for us to associate dates with featured specimens? Do
// we want to record when they were added and show that information somehow?
// Also, we freeze each featured specimen to make sure it is an error if
// any part of frontscope tries to modify it.
const theSIMs = featuredSIMs.map(query => {
    return Object.freeze({query, date: '', canDelete: false})
})

export function getFeatured() {
    return theSIMs
}
