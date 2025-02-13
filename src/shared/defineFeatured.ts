import {specimenQuery} from './specimenEncoding'

// Encodings of the featured specimens

const featuredSIMs = [
    specimenQuery(
        'The Raucous Recama&#769;n',
        'Turtle',
        'OEIS A005132',
        'domain=0+1&steps=2+3&strokeColor=%235e8d85&bgColor=E5E0F6'
            + '&speed=20&ruleMode=1&angleFormula=89.674'
            + '&stepFormula=a%5E%280.7%29%2F2&colorFormula=rainbow%28n%29'
            + '&colorChooser=813d9c'
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
        'modDimension=600&fillColor=a51d2d&alpha=min(0.4%2C+0.01*m)'
            + '&highlightFormula=n+mod+163+%3E+81&highColor=ff7800',
        'formula=163n'
    ),
    specimenQuery(
        "Virahanka's Prime Construct",
        'ModFill',
        'OEIS A000045',
        'modDimension=130&backgroundColor=62a0ea&fillColor=613583'
            + '&alpha=0.05&aspectRatio=false&highlightFormula=isPrime%28n%29'
            + '&highColor=e5a50a',
        ''
    ),
    specimenQuery(
        'Prime Residues',
        'ModFill',
        'Formula',
        'fillColor=1a5fb4&alpha=0.1&highlightFormula=isPrime%28n%29'
            + '&highColor=f66151',
        'formula=n'
    ),
    specimenQuery(
        'Baffling Beatty Bars',
        'ModFill',
        'Formula',
        'modDimension=350&fillColor=26a269&alpha=0.3'
            + '&highlightFormula=floor%28sqrt%283%29n%29&highColor=1a5fb4',
        'formula=floor%28sqrt%282%29*n%29'
    ),
    specimenQuery(
        'Woven Residues',
        'ModFill',
        'Random',
        'modDimension=5000',
        'min=10000&max=100000'
    ),
    specimenQuery(
        "Picasso's Periods",
        'ModFill',
        'Formula',
        'modDimension=100&backgroundColor=000000&fillColor=1a5fb4'
            + '&alpha=0.15&aspectRatio=false&highlightFormula=isPrime%28a%29'
            + '&highColor=bf8383&alphaHigh=0.4&sunzi=0.03&frameRate=24',
        'formula=n%5E3%2B2n%2B1'
    ),
    specimenQuery(
        'Chaos Game',
        'Chaos',
        'Random',
        'corners=3&colorStyle=1&dummyDotControl=true'
            + '&circSize=2&alpha=0.4&darkMode=true',
        'max=2'
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
        'domain=-1+1&angles=30+120&steps=30+30&widths=2&strokeColor=%237a9f6f'
            + '&bgColor=363071&speed=3&ruleMode=1&angleFormula=%7B%22-1%22%3A'
            + '+30%2C+%221%22%3A+120%7D%5Bstring%28a%29%5D&stepFormula=%7B%22'
            + '-1%22%3A+30%2C+%221%22%3A+30%7D%5Bstring%28a%29%5D&widthFormula'
            + '=%7B%22-1%22%3A+2%2C+%221%22%3A+2%7D%5Bstring%28a%29%5D'
            + '&colorFormula=%7B%22-1%22%3A+%237a106080%2C+%221%22%3A'
            + '+%237a9f6f50%7D%5Bstring%28a%29%5D',
        'formula=sign%28sin%28n%2B1%29%29'
    ),
    specimenQuery(
        'Mobius Heartbeat',
        'Turtle',
        'OEIS A008683',
        'domain=0+1+-1&angles=0+89+-89&angleMeaning=1&steps=0+10+10'
            + '&strokeColor=%23E9F4F2+%23DC967E+%237FB7ED&bgColor=080908'
            + '&speed=20&angleFormula=%7B%220%22%3A+0%2C+%221%22%3A+89%2C'
            + '+%22-1%22%3A+-89%7D%5Bstring%28a%29%5D&stepFormula=%7B%220'
            + '%22%3A+0%2C+%221%22%3A+10%2C+%22-1%22%3A+10%7D%5Bstring%28a'
            + '%29%5D&widthFormula=%7B%220%22%3A+1%2C+%221%22%3A+1%2C+%22'
            + '-1%22%3A+1%7D%5Bstring%28a%29%5D&colorFormula=%7B%220%22%3A'
            + '+%23E9F4F2%2C+%221%22%3A+%23DC967E%2C+%22-1%22%3A+%237FB7ED'
            + '%7D%5Bstring%28a%29%5D&colorChooser=813d9c',
        ''
    ),
    specimenQuery(
        'Hat Trick',
        'Turtle',
        'OEIS A363348',
        'domain=0+1+2+3&angles=0&steps=15&widths=2&strokeColor=%2390EE90'
            + '+%2300CED1+%23FF7D4D+%231F93FF+%23B63A71+%23C71585+%23FF7D4D'
            + '&bgColor=795767&speed=10&ruleMode=1&angleFormula=a*30'
            + '&widthFormula=3&colorFormula=chroma.scale%28%27YlGnBu%27%29'
            + '.colors%2850%29%5Bmod%28n%2C30%29%2B1%5D&colorChooser=409CF5',
        ''
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
        'domain=0+1&angles=8+120&steps=40+400'
            + '&animationControls=true&folds=200+0'
            + '&bgColor=4f4875&strokeColor=%23cec0c0',
        'modulus=9&last=999&length=1000'
    ),
    specimenQuery(
        'Beatty DNA',
        'Turtle',
        'Formula',
        'domain=0+1+2&angles=79+0+45&steps=2.5+1.5+3'
            + '&speed=30&bgColor=354F6B&strokeColor='
            + '%23DEACAC+%23DFB5C3+%23410510',
        '&formula=floor%28n*sqrt%282%29%29%253'
    ),
    specimenQuery(
        'Zeta Zero #10143',
        'Turtle',
        'Formula',
        'angleMeaning=1&speed=5&ruleMode=1&angleFormula=log(n)*10000.06534'
            + '&angleMeasure=1&stepFormula=200%2Fsqrt(n)'
            + '&bgColor=201E2D'
            + '&widthFormula=3'
            + '&colorFormula=chroma%28%28chroma.scale%28%5B%27%23fafa6e'
            + '%27%2C+%27%232A4858%27%2C+%27%23fafa6e%27%5D%29.mode%28%27lch%27'
            + '%29.colors%28360%29%29%5Bfloor%28number%28b+rad%2C+deg%29+%25'
            + '+360%29%2B1%5D%29.alpha%280.2%2Bn%2F1000%29',
        'first=1&last=3183&length=3183'
    ),
    specimenQuery(
        'PEMDASymmetry',
        'Turtle',
        'Formula',
        'bgColor=22274e&speed=10&ruleMode=1&angleFormula=30%2B15a'
            + '&stepFormula=4&colorFormula=rainbow(abs(y-160))',
        'formula=(n%2F10)^2+-+n%2F10^2&last=8191&length=8192'
    ),
    specimenQuery(
        'Gosper Flowsnake',
        'Turtle',
        'OEIS A229214',
        'domain=-3+-2+-1+1+2+3&angles=-60+-120+180+0+60+120'
            + '&angleMeaning=1&steps=8&widths=2&strokeColor=%2390EE90'
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
            + '%23C71585%7D%5Bstring%28a%29%5D&seq=OEIS+A229214',
        'last=1040&length=1040'
    ),
    specimenQuery(
        'The Vertigo of Divergence',
        'Turtle',
        'Formula',
        'bgColor=3A3A45&speed=10&ruleMode=1&angleFormula=a%5E1.0012%2F128'
            + '&angleMeasure=1&stepFormula=13'
            + '&widthFormula=3'
            + '&colorFormula=%28chroma.scale%28%5B+%27%2301204e%27%2C%27'
            + '%23f85525'
            + '%27%2C+%27%2301204e%27%5D%29.mode%28%27lch%27%29.colors'
            + '%28120%29%29%5Bn%25120%2B1%5D',
        'first=100&last=5099&length=5000'
    ),
    specimenQuery(
        'Thue Traipse',
        'Turtle',
        'OEIS A010060',
        'domain=0+1&angles=15+-165&steps=2+1'
            + '&speed=10&bgColor=e0def7&strokeColor=%231E90FF'
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
