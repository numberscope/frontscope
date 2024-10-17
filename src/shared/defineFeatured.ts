import {specimenQuery} from './specimenEncoding'

// Encodings of the featured specimens

const featuredSIMs = [
    specimenQuery(
        'Thue Trellis',
        'Turtle',
        'OEIS A010060',
        'domain=0+1&turns=15+-165&steps=2+3&speed=5'
            + '&pathLook=false&bgColor=e0def7&strokeColor=5e8d85'
    ),
    specimenQuery(
        'Divisor Square',
        'Chaos',
        'OEIS A000005',
        'corners=8&walkers=8&alpha=0.7&pixelsPerFrame=2000'
    ),
    specimenQuery(
        'Twelve',
        'ModFill',
        'Formula',
        'modDimension=12',
        'formula=12'
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
        'binSize=1',
        'formula=n%5E3-n%5E2&length=1000'
    ),
    specimenQuery(
        'Wait For It',
        'Turtle',
        'Formula',
        '&domain=-1+1&turns=30+120&steps=30+30&strokeWeight=2'
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
        '&domain=0+1+2+3+4+5+6+7+8&turns=8+120+0+0+0+0+0+0+0'
            + '&steps=20+200+0+0+0+0+0+0+0&foldControls=true'
            + '&folds=200+0+0+0+0+0+0+0+0+&speed=100&bgColor=4f4875'
            + '&strokeColor=cec0c0',
        '&modulus=9&last=999&length=1000'
    ),
    specimenQuery(
        'Beatty DNA',
        'Turtle',
        'OEIS A001951',
        '&domain=0+1+2&turns=79+0+45&steps=5+2+6&foldControls=true&folds=0+0+0'
            + '&speed=10&bgColor=e9eee3&strokeColor=4b7a81',
        '&modulus=3'
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
