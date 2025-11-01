import { specimenQuery } from './specimenEncoding'

// Encodings of the featured specimens

const featuredSIMs = [
  specimenQuery(
    'The Raucous Recamán',
    'Turtle',
    'OEIS A005132',
    'domain=0+1&steps=2+3&strokeColor=%235e8d85&bgColor=E5E0F6'
    + '&speed=20&ruleMode=1&angleFormula=89.674'
    + '&stepFormula=a%5E%280.7%29%2F2&colorFormula=rainbow%28n%29'
    + '&colorChooser=813d9c'
  ),
  specimenQuery(
    'Prime Jewels',
    'Chaos',
    'Formula',
    'corners=4&walkers=2&sizeFormula=0.7'
    + '&colorFormula=%5B%23103547%2C%2375795E%2C%23962020'
    + '%2C%23D76533%2C%23385563%2C%23BDCAAE%2C%23DA9202'
    + '%2C%23612B39%5D%5Bmod%28A%28n%29-A%28n%2B8%29%2C8'
    + '%29%2B1%5D&pixelsPerFrame=200',
    'formula=isPrime%28n%29*2%2BisPrime%28n%2B24%29'
  ),
  specimenQuery(
    'Resistance is Futile',
    'Chaos',
    'OEIS A000005',
    'corners=8&walkers=2&sizeFormula=0.6'
    + '&colorFormula=%5B%234D8E90%2C%23C6B06E%5D'
    + '%5Bmod%28w%2C2%29%2B1%5D&pixelsPerFrame=200',
    'corners=8&walkers=8&alpha=0.7&pixelsPerFrame=2000'
  ),
  specimenQuery(
    'Dance no. 163',
    'ModFill',
    'Formula',
    'modDimension=600&fillColor=min(0.4%2C+m%2F100)'
    + '+*+(n+mod+163+>+81+%3F+%23ff7800+%3A+%23a51d2d)',
    'formula=163n'
  ),
  specimenQuery(
    "Virahanka's Prime Construct",
    'ModFill',
    'OEIS A000045',
    'modDimension=130&backgroundColor=62a0ea'
    + '&fillColor=isPrime(n)+%3F+%23e5a50a0d+%3A+%236135830d'
  ),
  specimenQuery(
    'Prime Residues',
    'ModFill',
    'Formula',
    'fillColor=isPrime(n)+%3F+%23f661511a+%3A+%231a5fb41a'
  ),
  specimenQuery(
    'Baffling Beatty Bars',
    'ModFill',
    'Formula',
    'modDimension=350'
    + '&fillColor=floor(sqrt(3)n)+%25+2'
    + '+%3F+%231a5fb44d+%3A+%2326a2694d',
    'formula=floor(sqrt(2)n)'
  ),
  specimenQuery(
    'Woven Residues',
    'ModFill',
    'Random',
    'modDimension=5000&fillColor=rainbow(n%2F2)',
    'min=10000&max=100000'
  ),
  specimenQuery(
    "Picasso's Periods",
    'ModFill',
    'Formula',
    'modDimension=100&backgroundColor=00000008'
    + '&fillColor=isPrime(a)+%3F+%23bf838366+%3A+%231a5fb424'
    + '&sunzi=true&frameRate=24',
    'formula=n%5E3%2B2n%2B1'
  ),
  specimenQuery(
    'Doily-Dally',
    'Chaos',
    'Formula',
    'corners=11&bgColor=1D0E0E03&staticMode=true'
    + '&cornerFormula=mod%28a%2Bc%2Cp%29'
    + '&sizeFormula=0.5&colorFormula=a%3F%235351BEFF%3A%231D5C98FF'
    + '&colorChooser=5351BEFF&pixelsPerFrame=500&fadeEffect=0.00',
    'formula=pickRandom%28%5B+0%2C3%2C3%2C-3'
    + '%2C-3%5D%29'
  ),
  specimenQuery(
    'Barnsley Fern',
    'Chaos',
    'Random',
    'stepFormula=%28%28%5B0%2C0%3B0%2C.16%5D*%28a%3D%3D0%29+%2B+'
    + '%5B.85%2C.04%3B-.04%2C.85%5D+*%28a%3E2%29+%2B+%5B.2'
    + '%2C-.26%3B.23%2C.22%5D*%28a%3D%3D1%29+%2B++%5B-.15'
    + '%2C.28%3B.26%2C.24%5D*%28a%3D%3D2%29%29*P%2F40+%2B'
    + '+%5B0%2C1.6%5D*%28a%3D1+or+a%3E2%29+%2B+%5B0%2C.44'
    + '%5D*%28a%3D%3D2%29%29*40&sizeFormula=0.5'
    + '&colorFormula=%2300D132&colorChooser=00D132FF',
    'max=7&last=99999&length=100000'
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
    'domain=-1+1&angles=30+120&steps=30+30&widths=2'
    + '&strokeColor=%237a106080+%237a9f6f50&bgColor=363071&speed=3'
    + '&angleFormula=%7B%22-1%22%3A+30%2C+%221%22%3A+120%7D'
    + '%5Bstring%28a%29%5D&stepFormula=%7B%22-1%22%3A+30%2C'
    + '+%221%22%3A+30%7D%5Bstring%28a%29%5D&widthFormula'
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
    + '%7D%5Bstring%28a%29%5D&colorChooser=813d9c'
  ),
  specimenQuery(
    'Hat Trick',
    'Turtle',
    'OEIS A363348',
    'domain=0+1+2+3&angles=0&steps=15&widths=2&strokeColor=%2390EE90'
    + '+%2300CED1+%23FF7D4D+%231F93FF+%23B63A71+%23C71585+%23FF7D4D'
    + '&bgColor=795767&speed=10&ruleMode=1&angleFormula=a*30'
    + '&widthFormula=3&colorFormula=chroma.scale%28%27YlGnBu%27%29'
    + '.colors%2850%29%5Bmod%28n%2C30%29%2B1%5D&colorChooser=409CF5'
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
    'formula=floor%28n*sqrt%282%29%29%253'
  ),
  specimenQuery(
    'Zeta Zero #10143',
    'Turtle',
    'Formula',
    'angleMeaning=1&speed=5&ruleMode=1&angleFormula=-log(n)*10000.06534'
    + '&angleMeasure=1&stepFormula=300%2Fsqrt(n)&bgColor=201E2D'
    + '&widthFormula=4-n%2F1000'
    + '&colorFormula=chroma%28chroma.scale%28%5B%23fafa6e%2C'
    + '+%232A4858%2C+%23fafa6e%5D%29.mode%28%27lch%27'
    + '%29.colors%28360%29%5Bfloor%28number%28b+rad%2C+deg%29+%25'
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
  specimenQuery(
    "Pascal's Triangle",
    'FormulaGrid',
    'OEIS A007318',
    'aspect=r&fillOrder=2&pathFormula=%5Bceil%28c%2F2%29+-+invTriangular'
    + '%28k-1%29+%2B+2*%28k+-+triangular%28invTriangular%28k-1%29%29+'
    + '-+1%29%2CinvTriangular%28k-1%29+%2B+1%5D'
    + '&backgroundColor=21218FFF'
    + '&fillFormula=%7Bhexagon%3A+rainbow%2872a-100%29.desaturate'
    + '%281.2%29.brighten%280.8%29%7D'
  ),
  specimenQuery(
    'Lattice Murmuration',
    'FormulaGrid',
    'OEIS A293773',
    'dimensions=200+5000&fillOrder=3&pathFormula=%5Bk%2C+floor'
    + '%28r%2F2%29+-+a%5D&backgroundColor=D2E1FBFF'
    + '&fillFormula={circle%3A+black}&inset=12'
  ),
  specimenQuery(
    'Modular Multiplication Table',
    'FormulaGrid',
    'Formula',
    'dimensions=200+200&aspect=1&backgroundColor=0B207CFF&speed=100'
    + '&fillFormula=%7Brectangle%3A%0A++%233bbf7d'
    + '.alpha%28abs%282*mod%28x+y%2C+c%29-c%29%2Fc%29%2C%0A'
    + 'mouseover%3A+%5B+x%2C+%27%C3%97%27%2C+y%2C+%27%3D%27%2C'
    + '+mod%28x+y%2C+c%29%5D%7D'
  ),
  specimenQuery(
    'Ulam Divisors',
    'FormulaGrid',
    'OEIS A000005',
    'dimensions=200+200&aspect=1&fillOrder=1&pathFormula=spiral%28k%29'
    + '&backgroundColor=000000FF&speed=100'
    + '&fillFormula=%7Bcircle%3A%0A++%230571b0'
    + '.mix%28darkseagreen%2C+%28a-10%29%2F8%29%2C%0A'
    + 'mouseover%3A+%5B%27d%28%27%2C+n%2C+%27%29+%3D+%27%2C+a%5D%7D'
    + '&inset=0.8'
  ),
  specimenQuery(
    'Integerstellar',
    'FormulaGrid',
    'Formula',
    'dimensions=200&backgroundColor=000000FF&speed=1024'
    + '&fillFormula=%7Bcircle%3A%0A++yellow'
    + '.mix%28black%2C+1-gcd%28x%2Cy%29%2Fsqrt%28x+y%29%29%2C%0A'
    + 'mouseover%3A+%5B%0A++++%27gcd%28%27%2C+x%2C+%27%2C+%27%2C'
    + '+y%2C+%27%29+%3D+%27%2C+gcd%28x%2Cy%29%0A%5D%7D&inset=0.8'
  ),
  specimenQuery(
    'Deja vu Differences',
    'Differences',
    'OEIS A000045',
    'levels=25'
  ),
]

// Is there any reason for us to associate dates with featured specimens? Do
// we want to record when they were added and show that information somehow?
// Also, we freeze each featured specimen to make sure it is an error if
// any part of frontscope tries to modify it.
const theSIMs = featuredSIMs.map(query => {
  return Object.freeze({ query, date: '', canDelete: false })
})

export function getFeatured() {
  return theSIMs
}
