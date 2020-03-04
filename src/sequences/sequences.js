const $ = require('jquery')
/**
 *
 * @class SequenceGenerator
 */
class SequenceGenerator {
    /**
     *Creates an instance of SequenceGenerator.
     * @param {*} generator a function that takes a natural number and returns a number, it can optionally take the cache as a second argument
     * @param {*} ID the ID of the sequence
     * @memberof SequenceGenerator
     */
    constructor(ID, generator) {
        this.generator = generator;
        this.ID = ID;
        this.cache = [];
        this.newSize = 1;
    }
    /**
     * if we need to get the nth element and it's not present in
     * in the cache, then we either double the size, or the 
     * new size becomes n+1
     * @param {*} n 
     * @memberof SequenceGenerator
     */
    resizeCache(n) {
        this.newSize = this.cache.length * 2;
        if (n + 1 > this.newSize) {
            this.newSize = n + 1;
        }
    }
    /**
     * Populates the cache up until the current newSize
     * this is called after resizeCache
     * @memberof SequenceGenerator
     */
    fillCache() {
        for (let i = this.cache.length; i < this.newSize; i++) {
            //the generator is given the cache since it would make computation more efficient sometimes
            //but the generator doesn't necessarily need to take more than one argument.
            this.cache[i] = this.generator(i, this.cache);
        }
    }
    /**
     * Get element is what the drawing tools will be calling, it retrieves
     * the nth element of the sequence by either getting it from the cache
     * or if isn't present, by building the cache and then getting it
     * @param {*} n the index of the element in the sequence we want
     * @returns a number
     * @memberof SequenceGenerator
     */
    getElement(n) {
        if (this.cache[n] != undefined || this.finite) {
            // console.log("cache hit")
            return this.cache[n];
        } else {
            // console.log("cache miss")
            this.resizeCache(n);
            this.fillCache();
            return this.cache[n];
        }
    }
}


/**
 *
 *
 * @param {*} code arbitrary sage code to be executed on aleph
 * @returns ajax response object
 */
function sageExecute(code) {
    return $.ajax({
        type: 'POST',
        async: false,
        url: 'http://aleph.sagemath.org/service',
        data: "code=" + code
    });
}

/**
 *
 *
 * @param {*} code arbitrary sage code to be executed on aleph
 * @returns ajax response object
 */
async function sageExecuteAsync(code) {
    return await $.ajax({
        type: 'POST',
        url: 'http://aleph.sagemath.org/service',
        data: "code=" + code
    });
}


class OEISSequenceGenerator {
    constructor(ID, OEIS) {
        this.OEIS = OEIS;
        this.ID = ID;
        this.cache = [];
        this.newSize = 1;
        this.prefillCache();
    }
    oeisFetch(n) {
        console.log("Fetching..");
        let code = `print(sloane.${this.OEIS}.list(${n}))`;
        let resp = sageExecute(code);
        return JSON.parse(resp.responseJSON.stdout);
    }
    async prefillCache() {
        this.resizeCache(3000);
        let code = `print(sloane.${this.OEIS}.list(${this.newSize}))`;
        let resp = await sageExecuteAsync(code);
        console.log(resp);
        this.cache = this.cache.concat(JSON.parse(resp.stdout));
    }
    resizeCache(n) {
        this.newSize = this.cache.length * 2;
        if (n + 1 > this.newSize) {
            this.newSize = n + 1;
        }
    }
    fillCache() {
        let newList = this.oeisFetch(this.newSize);
        this.cache = this.cache.concat(newList);
    }
    getElement(n) {
        if (this.cache[n] != undefined) {
            return this.cache[n];
        } else {
            this.resizeCache();
            this.fillCache();
            return this.cache[n];
        }
    }
}

function BuiltInNameToSeq(ID, seqName, seqParams) {
    let generator = BuiltInSeqs[seqName].generator(seqParams);
    return new SequenceGenerator(ID, generator);
}


function ListToSeq(ID, list) {
    let listGenerator = function (n) {
        return list[n];
    };
    return new SequenceGenerator(ID, listGenerator);
}

function OEISToSeq(ID, OEIS) {
    return new OEISSequenceGenerator(ID, OEIS);
}


const BuiltInSeqs = {};

var sequences = {
    'BuiltInNameToSeq': BuiltInNameToSeq,
    'ListToSeq': ListToSeq,
    'OEISToSeq': OEISToSeq,
    'BuiltInSeqs': BuiltInSeqs
};

export default sequences;

/*jshint ignore: start */
BuiltInSeqs["Fibonacci"] = require('./sequenceFibonacci.js');
BuiltInSeqs["Lucas"] = require('./sequenceLucas.js');
BuiltInSeqs["Primes"] = require('./sequencePrimes.js');
BuiltInSeqs["Naturals"] = require('./sequenceNaturals.js');
BuiltInSeqs["LinRec"] = require('./sequenceLinRec.js');
BuiltInSeqs['Primes'] = require('./sequencePrimes.js');
