function mod(n, m) {
    return ((n % m) + m) % m;
}

function GEN_EllipticDivisibility({
    W1,
    W2,
    W3,
    W4,
    m
}) {
    //w1*w2*w3 is invalid input

    const ED = function (n, cache) {
        //define your function here
        if ((cache.length == 0) && (typeof (m) == 'number')) {
            console.log("here");
            console.log("m: " + m);
            cache.push(mod(0, m));
            cache.push(mod(W1, m));
            cache.push(mod(W2, m));
            cache.push(mod(W3, m));
            cache.push(mod(W4, m));
        }
        if ((cache.length == 0) && (typeof (m) != 'number')) {
            cache.push(0);
            cache.push(W1);
            cache.push(W2);
            cache.push(W3);
            cache.push(W4);
        }
        if (n <= 4) {
            return cache[n];
        }
        if (cache[n] != undefined) {
            return cache[n];
        }
        let ret;
        if (n % 2 == 1) {
            let k = (n - 1) / 2;
            ret = (ED(k + 2, cache) * ED(k, cache) ** 3 - ED(k - 1, cache) * ED(k + 1, cache) ** 3) / (cache[1] ** 3);
        } else {
            let k = n / 2;
            ret = (ED(k + 2, cache) * ED(k, cache) * ED(k - 1, cache) ** 2 - ED(k, cache) * ED(k - 2, cache) * ED(k + 1, cache) ** 2) / (cache[2] * cache[1] ** 2);
        }

        if (typeof (m) == 'number') {
            return mod(ret, m);
        } else {
            return ret;
        }
    };
    return ED;

}

const SCHEMA_EllipticDivisibility = {
    W1: {
        type: "number",
        title: "W1"
    },
    W2: {
        type: "number",
        title: "W2"
    },
    W3: {
        type: "number",
        title: "W3"
    },
    W4: {
        type: "number",
        title: "W4"
    },
    m: {
        type: "number",
        title: "mod"
    }
};

const SEQ_EllipticDivisibility = {
    generator: GEN_EllipticDivisibility,
    name: 'Elliptic Divisibility',
    description: '',
    paramsSchema: SCHEMA_EllipticDivisibility
};

module.exports = SEQ_EllipticDivisibility;

ed = SEQ_EllipticDivisibility.generator({
    W1: 1,
    W2: 1,
    W3: -1,
    W4: 1,
    m: 5
});
// ed2 = SEQ_EllipticDivisibility.generator({W1:1,W2:1,W3:-1,W4:1,m:''} )

arr = [];
cache = [];
for (i = 0; i < 40; i++) {
    arr.push(ed(i, cache));
}
console.log(arr);
// console.log( mod(21, 5))
// arr2 = []
// cache2 = []
// for(i = 0; i<10;i++){
//     arr2.push(ed(i,cache2) % 5)
// }
// console.log(arr2.slice(4))