import {specimenQuery} from './specimenEncoding'
import type {QuerySpec} from './specimenEncoding'

// Encodings of the featured specimens
// Note that we could/should specify a `version` property for
// each/every featured specimen, indicating the frontscope version number at
// which the specimen was defined. However, to avoid initial redundancy,
// we just default that version property to `0.4.0`, the version at which
// the URL scheme was introduced.
const featuredSIMs = [
    {
        name: 'The Raucous Recamán',
        visualizerKind: 'Turtle',
        sequenceKind: 'OEIS A005132',
        visualizerQuery:
            'domain=0+1&steps=2+3&strokeColor=%235e8d85&bgColor=E5E0F6'
            + '&speed=20&ruleMode=1&angleFormula=89.674'
            + '&stepFormula=a%5E%280.7%29%2F2&colorFormula=rainbow%28n%29'
            + '&colorChooser=813d9c',
        thumbFrames: 60,
    },
    {
        name: 'Gosper Flowsnake',
        visualizerKind: 'Turtle',
        sequenceKind: 'OEIS A229214',
        visualizerQuery:
            'domain=-3+-2+-1+1+2+3&angles=-150+150+90+-90+-30+30'
            + '&angleMeaning=1&steps=12&widths=2&strokeColor=%2390EE90'
            + '+%2300CED1+%23FF7D4D+%231F93FF+%23B63A71+%23C71585'
            + '&bgColor=22274e&speed=10&angleFormula=%7B%22-3%22%3A'
            + '+-60%2C+%22-2%22%3A+-120%2C+%22-1%22%3A+180%2C+%221%22'
            + '%3A+0%2C+%222%22%3A+60%2C+%223%22%3A+120%7D%5Bstring%28a'
            + '%29%5D&stepFormula=%7B%22-3%22%3A+8%2C+%22-2%22%3A+8%2C+'
            + '%22-1%22%3A+8%2C+%221%22%3A+8%2C+%222%22%3A+8%2C+%223%22'
            + '%3A+8%7D%5Bstring%28a%29%5D&widthFormula=%7B%22-3%22%3A+'
            + '2%2C+%22-2%22%3A+2%2C+%22-1%22%3A+2%2C+%221%22%3A+2%2C+'
            + '%222%22%3A+2%2C+%223%22%3A+2%7D%5Bstring%28a%29%5D'
            + '&colorFormula=%7B%22-3%22%3A+%2390EE90%2C+%22-2%22%3A+'
            + '%2300CED1%2C+%22-1%22%3A+%23FF7D4D%2C+%221%22%3A+'
            + '%231F93FF%2C+%222%22%3A+%23B63A71%2C+%223%22%3A+'
            + '%23C71585%7D%5Bstring%28a%29%5D',
        sequenceQuery: 'last=1040&length=1040',
        thumbFrames: 15,
    },
    {
        name: 'Doily-Dally',
        visualizerKind: 'Chaos',
        sequenceKind: 'Formula',
        visualizerQuery:
            'corners=11&bgColor=1D0E0E03&staticMode=true'
            + '&cornerFormula=mod%28a%2Bc%2Cp%29'
            + '&sizeFormula=0.5&colorFormula=a%3F%235351BEFF%3A%231D5C98FF'
            + '&colorChooser=5351BEFF&pixelsPerFrame=500&fadeEffect=0.00',
        sequenceQuery:
            'formula=pickRandom%28%5B+0%2C3%2C3%2C-3' + '%2C-3%5D%29',
        thumbFrames: 20,
    },
    {
        name: "Pascal's Triangle",
        visualizerKind: 'FormulaGrid',
        sequenceKind: 'OEIS A007318',
        visualizerQuery:
            'aspect=r&fillOrder=2&pathFormula=%5Bceil%28c%2F2%29'
            + '+-+invTriangular%28k-1%29+%2B+2*%28k+-+triangular'
            + '%28invTriangular%28k-1%29%29+'
            + '-+1%29%2CinvTriangular%28k-1%29+%2B+1%5D'
            + '&backgroundColor=21218FFF'
            + '&fillFormula=%7Bhexagon%3A+rainbow%2872a-100%29.desaturate'
            + '%281.2%29.brighten%280.8%29%7D',
        sequenceQuery: 'last=7600',
        thumbFrames: 90,
    },
    {
        name: 'Resistance is Futile',
        visualizerKind: 'Chaos',
        sequenceKind: 'OEIS A000005',
        visualizerQuery:
            'corners=8&walkers=6&sizeFormula=0.5'
            + '&colorFormula='
            + '[%235A5B5B%2C%239094A0%2C%23636467%2C%23858F99'
            + '%2C%2333352A%2C%23C0E3B1][mod(w%2B3%2C6)%2B1]'
            + '&pixelsPerFrame=200',
        thumbFrames: 35,
    },
    {
        name: 'Dance no. 163',
        visualizerKind: 'ModFill',
        sequenceKind: 'Formula',
        visualizerQuery:
            'modDimension=600&fillColor=min(0.4%2C+m%2F100)'
            + '+*+(n+mod+163+>+81+%3F+%23ff7800+%3A+%23a51d2d)',
        sequenceQuery: 'formula=163n',
        thumbFrames: 40,
    },
    {
        name: 'Integerstellar',
        visualizerKind: 'FormulaGrid',
        sequenceKind: 'Formula',
        visualizerQuery:
            'dimensions=200&backgroundColor=000000FF&speed=1024'
            + '&fillFormula=%7Bcircle%3A%0A++yellow.mix%28black%2C+1'
            + '-gcd%28A%28x%29%2CA%28y%29%29%2Fsqrt%28A%28x%29A%28y%29%29%29'
            + '%2C%0Amouseover%3A+%5B%0A++++%27%40%27%2C+x%2C+%27%2C+%27%2C'
            + '+y%2C+%27%3A+gcd%28%27%2C+A%28x%29%2C+%27%2C+%27%2C+A%28y%29%2C'
            + '+%27%29+%3D+%27%2C+gcd%28A%28x%29%2CA%28y%29%29%0A%5D%7D'
            + '&inset=0.8',
        thumbFrames: 60,
    },
    {
        name: 'Lattice Murmuration',
        visualizerKind: 'FormulaGrid',
        sequenceKind: 'OEIS A293773',
        visualizerQuery:
            'dimensions=200+5000&fillOrder=3&pathFormula=%5Bk%2C+floor'
            + '%28r%2F2%29+-+a%5D&backgroundColor=D2E1FBFF'
            + '&fillFormula={circle%3A+black}&inset=12',
        thumbFrames: 200,
    },
    {
        name: 'Tau Many Primes',
        visualizerKind: 'FactorStacks',
        sequenceKind: 'OEIS A000594',
        visualizerQuery: 'signs=false',
    },
    {
        name: 'Polyfactors',
        visualizerKind: 'FactorHistogram',
        sequenceKind: 'Formula',
        visualizerQuery: 'binSize=1',
        sequenceQuery: 'formula=n%5E3-n%5E2&length=1000',
    },
    {
        name: 'VFib Snowflake',
        visualizerKind: 'Turtle',
        sequenceKind: 'OEIS A000045',
        visualizerQuery:
            'domain=0+1&angles=8+120&steps=40+400'
            + '&animationControls=true&folds=400+0&widths=0.5&&drawPath=1'
            + '&bgColor=4f4875&strokeColor=%23cec0c0',
        sequenceQuery: 'modulus=9&last=680&length=681',
    },
    {
        name: 'Baffling Beatty Bars',
        visualizerKind: 'ModFill',
        sequenceKind: 'Formula',
        visualizerQuery:
            'modDimension=350&fillColor=floor(sqrt(3)n)+%25+2'
            + '+%3F+%231a5fb44d+%3A+%2326a2694d',
        sequenceQuery: 'formula=floor(sqrt(2)n)',
        thumbFrames: 300,
    },
    {
        name: 'Ulam Divisors',
        visualizerKind: 'FormulaGrid',
        sequenceKind: 'OEIS A000005',
        visualizerQuery:
            'dimensions=200+200&aspect=1&fillOrder=1&pathFormula=spiral%28k%29'
            + '&backgroundColor=000000FF&speed=100'
            + '&fillFormula=%7Bcircle%3A%0A++%230571b0'
            + '.mix%28darkseagreen%2C+%28a-10%29%2F8%29%2C%0A'
            + 'mouseover%3A+%5B%27d%28%27%2C+n%2C+%27%29+%3D+%27%2C+a%5D%7D'
            + '&inset=0.8',
        thumbFrames: 280,
    },
    {
        name: 'Beatty DNA',
        visualizerKind: 'Turtle',
        sequenceKind: 'Formula',
        visualizerQuery:
            'domain=0+1+2&angles=79+0+45&steps=2.5+1.5+3'
            + '&speed=30&bgColor=354F6B&strokeColor='
            + '%23DEACAC+%23DFB5C3+%23410510',
        sequenceQuery: 'formula=floor%28n*sqrt%282%29%29%253',
        thumbFrames: 60,
    },
    {
        name: 'Mobius Heartbeat',
        visualizerKind: 'Turtle',
        sequenceKind: 'OEIS A008683',
        visualizerQuery:
            'domain=0+1+-1&angles=0+89+-89&angleMeaning=1&steps=0+10+10'
            + '&strokeColor=%23E9F4F2+%23DC967E+%237FB7ED&bgColor=080908'
            + '&speed=20&angleFormula=%7B%220%22%3A+0%2C+%221%22%3A+89%2C'
            + '+%22-1%22%3A+-89%7D%5Bstring%28a%29%5D&stepFormula=%7B%220'
            + '%22%3A+0%2C+%221%22%3A+10%2C+%22-1%22%3A+10%7D%5Bstring%28a'
            + '%29%5D&widthFormula=%7B%220%22%3A+1%2C+%221%22%3A+1%2C+%22'
            + '-1%22%3A+1%7D%5Bstring%28a%29%5D&colorFormula=%7B%220%22%3A'
            + '+%23E9F4F2%2C+%221%22%3A+%23DC967E%2C+%22-1%22%3A+%237FB7ED'
            + '%7D%5Bstring%28a%29%5D&colorChooser=813d9c',
        thumbFrames: 60,
    },
    {
        name: 'Prime Jewels',
        visualizerKind: 'Chaos',
        sequenceKind: 'Formula',
        visualizerQuery:
            'corners=4&walkers=2&sizeFormula=0.7'
            + '&colorFormula=%5B%23103547%2C%2375795E%2C%23962020'
            + '%2C%23D76533%2C%23385563%2C%23BDCAAE%2C%23DA9202'
            + '%2C%23612B39%5D%5Bmod%28A%28n%29-A%28min%28M%2Cn%2B8%29%29'
            + '%2C8%29%2B1%5D&pixelsPerFrame=200',
        sequenceQuery:
            'formula=isPrime%28n%29*2%2BisPrime%28n%2B24%29'
            + '&last=99999&length=100000',
    },
    {
        name: 'The Meandering of the Punctual Bird',
        visualizerKind: 'Chaos',
        sequenceKind: 'OEIS A132131',
        visualizerQuery:
            'corners=8&walkers=4&eagernessFormula=0.16&sizeFormula=2'
            + '&colorFormula=rainbow%28W*360%2Fh%29&pixelsPerFrame=3'
            + '&fadeEffect=0.015',
        sequenceQuery: 'first=1000&length=26349',
        thumbFrames: 10,
    },
    {
        name: 'Natural History',
        visualizerKind: 'NumberGlyph',
        sequenceKind: 'Formula',
        visualizerQuery:
            'customize=true&growthFormula=%28log%28max%28abs'
            + '%28n%29%2C2%29%29+*+x%29+%25+1&brightCap=1',
        sequenceQuery: 'first=1&last=98',
        thumbFrames: 120,
    },
    {
        name: 'Barnsley Fern',
        visualizerKind: 'Chaos',
        sequenceKind: 'Random',
        visualizerQuery:
            'stepFormula=%28%28%5B0%2C0%3B0%2C.16%5D*%28a%3D%3D0%29+%2B+%5B.85'
            + '%2C.04%3B-.04%2C.85%5D+*%28a%3E2%29+%2B+%5B.2%2C-.26%3B.23'
            + '%2C.22%5D*%28a%3D%3D1%29+%2B++%5B-.15%2C.28%3B.26%2C.24%5D'
            + '*%28a%3D%3D2%29%29*%28P%2B%5B0%2C200%5D%29%2F40+%2B+%5B0'
            + '%2C1.6%5D*%28a%3D1+or+a%3E2%29+%2B+%5B0%2C.44%5D*%28a%3D'
            + '%3D2%29%29*40+-+%5B0%2C200%5D&sizeFormula=0.5'
            + '&colorFormula=%2300D132&colorChooser=00D132FF',
        sequenceQuery: 'max=7&last=99999&length=100000',
        thumbFrames: 50,
    },
    {
        name: "Picasso's Periods",
        visualizerKind: 'ModFill',
        sequenceKind: 'Formula',
        visualizerQuery:
            'modDimension=100&backgroundColor=00000008'
            + '&fillColor=isPrime(a)+%3F+%23bf838366+%3A+%231a5fb424'
            + '&sunzi=true&frameRate=24',
        sequenceQuery: 'formula=n%5E3%2B2n%2B1',
        thumbFrames: 20,
    },
    {
        name: 'Wait For It',
        visualizerKind: 'Turtle',
        sequenceKind: 'Formula',
        visualizerQuery:
            'domain=-1+1&angles=30+120&steps=30+30&widths=2'
            + '&strokeColor=%237a106080+%237a9f6f50&bgColor=363071&speed=3'
            + '&angleFormula=%7B%22-1%22%3A+30%2C+%221%22%3A+120%7D'
            + '%5Bstring%28a%29%5D&stepFormula=%7B%22-1%22%3A+30%2C'
            + '+%221%22%3A+30%7D%5Bstring%28a%29%5D&widthFormula'
            + '=%7B%22-1%22%3A+2%2C+%221%22%3A+2%7D%5Bstring%28a%29%5D'
            + '&colorFormula=%7B%22-1%22%3A+%237a106080%2C+%221%22%3A'
            + '+%237a9f6f50%7D%5Bstring%28a%29%5D',
        sequenceQuery: 'formula=sign%28sin%28n%2B1%29%29',
        thumbFrames: 80,
    },
    {
        name: 'Woven Residues',
        visualizerKind: 'ModFill',
        sequenceKind: 'Random',
        visualizerQuery: 'modDimension=5000&fillColor=rainbow(n%2F2)',
        sequenceQuery: 'min=10000&max=100000',
        thumbFrames: 150,
    },
    {
        name: 'Zeta Zero #10143',
        visualizerKind: 'Turtle',
        sequenceKind: 'Formula',
        visualizerQuery:
            'angleMeaning=1&speed=5&ruleMode=1'
            + '&angleFormula=-log(n)*10000.06534'
            + '&angleMeasure=1&stepFormula=300%2Fsqrt(n)&bgColor=201E2D'
            + '&widthFormula=4-n%2F1000'
            + '&colorFormula=chroma%28chroma.scale%28%5B%23fafa6e%2C'
            + '+%232A4858%2C+%23fafa6e%5D%29.mode%28%27lch%27'
            + '%29.colors%28360%29%5Bfloor%28number%28b+rad%2C+deg%29+%25'
            + '+360%29%2B1%5D%29.alpha%280.2%2Bn%2F1000%29'
            + '&viewpoint=0+160',
        sequenceQuery: 'first=1&last=3183&length=3183',
        thumbScale: 0.5,
    },
    {
        name: 'PEMDA Symmetry',
        visualizerKind: 'Turtle',
        sequenceKind: 'Formula',
        visualizerQuery:
            'bgColor=22274e&speed=10&ruleMode=1&angleFormula=30%2B15a'
            + '&stepFormula=4&colorFormula=rainbow(abs(y-160))'
            + '&viewpoint=-100+-160',
        sequenceQuery: 'formula=(n%2F10)^2+-+n%2F10^2&last=8191&length=8192',
        thumbFrames: 100,
        thumbScale: 0.33,
    },
    {
        name: 'The Vertigo of Divergence',
        visualizerKind: 'Turtle',
        sequenceKind: 'Formula',
        visualizerQuery:
            'bgColor=3A3A45&speed=10&ruleMode=1'
            + '&angleFormula=a%5E1.0012%2F128&angleMeasure=1&stepFormula=13'
            + '&widthFormula=3'
            + '&colorFormula=%28chroma.scale%28%5B+%27%2301204e%27%2C%27'
            + '%23f85525'
            + '%27%2C+%27%2301204e%27%5D%29.mode%28%27lch%27%29.colors'
            + '%28120%29%29%5Bn%25120%2B1%5D',
        sequenceQuery: 'first=100&last=5099&length=5000',
        thumbFrames: 70,
    },
    {
        name: 'Thue Traipse',
        visualizerKind: 'Turtle',
        sequenceKind: 'OEIS A010060',
        visualizerQuery:
            'domain=0+1&angles=15+-165&steps=2+1'
            + '&speed=10&bgColor=e0def7&strokeColor=%231E90FF',
        thumbFrames: 50,
    },
    {
        name: 'Modular Multiplication Table',
        visualizerKind: 'FormulaGrid',
        sequenceKind: 'Formula',
        visualizerQuery:
            'dimensions=200+200&aspect=1&backgroundColor=0B207CFF&speed=100'
            + '&fillFormula=%7Brectangle%3A%0A++%233bbf7d'
            + '.alpha%28abs%282*mod%28x+y%2C+c%29-c%29%2Fc%29%2C%0A'
            + 'mouseover%3A+%5B+x%2C+%27%C3%97%27%2C+y%2C+%27%3D%27%2C'
            + '+mod%28x+y%2C+c%29%5D%7D',
        thumbFrames: 400,
    },
    {
        name: 'Hat Trick',
        visualizerKind: 'Turtle',
        sequenceKind: 'OEIS A363348',
        visualizerQuery:
            'domain=0+1+2+3&angles=0&steps=15&widths=2&strokeColor=%2390EE90'
            + '+%2300CED1+%23FF7D4D+%231F93FF+%23B63A71+%23C71585+%23FF7D4D'
            + '&bgColor=795767&speed=10&ruleMode=1&angleFormula=a*30'
            + '&widthFormula=3&colorFormula=chroma.scale%28%27YlGnBu%27%29'
            + '.colors%2850%29%5Bmod%28n%2C30%29%2B1%5D'
            + '&colorChooser=409CF5',
        thumbFrames: 20,
    },
    {
        name: 'Deja vu Differences',
        visualizerKind: 'Differences',
        sequenceKind: 'OEIS A000045',
        visualizerQuery: 'levels=25',
        thumbFrames: 1,
    },
]

// Is there any reason for us to associate dates with featured specimens? Do
// we want to record when they were added and show that information somehow?
// Also, we freeze each featured specimen to make sure it is an error if
// any part of frontscope tries to modify it.
const theSIMs = featuredSIMs.map(record => {
    const spec: QuerySpec = Object.assign({}, record)
    if (!('version' in spec)) spec.version = '0.4.0'
    return Object.freeze({
        query: specimenQuery(spec),
        date: '',
        canDelete: false,
        thumbFrames: record.thumbFrames,
        thumbScale: record.thumbScale || 1,
    })
})

export function getFeatured() {
    return theSIMs
}
