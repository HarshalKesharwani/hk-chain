const cryptoHash = require('./crypto-hash');

describe("Crypto Hash", () => {
    const hash = '4fb34b852f184428851df9d00e9fb45962efc0337dd19b7d30a96bd099bbaee6';

    it("produces same hash", () => {
        expect(cryptoHash('harshal')).toEqual(hash);
    });

    it("arguments in different sequence produces same hash", () => {
        expect(cryptoHash('I', 'am', 'genious')).toEqual(cryptoHash('am', 'I', 'genious'));
    });

    it("generates different hash for same object containing different fields", () => {
        const foo = {};
        const originalHash = cryptoHash(foo);
        foo['a'] = 'a';
        expect(cryptoHash(foo)).not.toEqual(originalHash);
    });
});