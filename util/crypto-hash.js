//To generate SHA-256 hash of provided data
const Crypto = require('crypto');

const cryptoHash = (...inputs) => {

    const hash   = Crypto.createHash('sha256');
    hash.update(inputs.map((input) => JSON.stringify(input)).sort().join(' '));
    return hash.digest('hex');
}

module.exports = cryptoHash;