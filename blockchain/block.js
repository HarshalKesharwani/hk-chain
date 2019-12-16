const hexToBinary      = require('hex-to-binary');
const { cryptoHash }   = require('../util');
const   {
            GENESIS_DATA,
            MINING_RATE
        }              = require('../config');

class Block {
    //constructor
    constructor({ blockNumber, timestamp, lastHash, data, hash, addedBy, difficulty, nonce }) {
        this.blockNumber    = blockNumber;
        this.timestamp      = timestamp;
        this.lastHash       = lastHash;
        this.data           = data;
        this.hash           = hash;
        this.addedBy        = addedBy;
        this.difficulty     = difficulty;
        this.nonce          = nonce;
    }

    //utility function
    toString() {
        return 
        `Block -
            Block Number : ${this.blockNumber}
            Timestamp    : ${this.timestamp}
            Last Hash    : ${this.lastHash}
            Data         : ${this.data}
            Hash         : ${this.hash}
            Added By     : ${this.addedBy}
            Difficulty   : ${this.difficulty}
            Nonce        : ${this.nonce}`;
    }

    static genesis() {
        return new this(GENESIS_DATA);
    }

    static mineBlock({lastBlock, data, blockNumber, addedBy}) {
        const lastHash      = lastBlock.hash;
        let difficulty      = lastBlock.difficulty;
        let nonce           = 0;
        let timestamp, hash;
        do {
            nonce++;
            timestamp       = Date.now();
            difficulty      = Block.adjustDifficulty({ lastBlock, timestamp });
            hash            = cryptoHash(
                                    timestamp,
                                    lastHash,
                                    data,
                                    blockNumber,
                                    addedBy,
                                    nonce,
                                    difficulty
                                );
        }
        while(hexToBinary(hash).substring(0, difficulty) !== '0'.repeat(difficulty));
                        
        return new this(                    {
            timestamp   : timestamp,
            blockNumber : blockNumber,
            data        : data,
            lastHash    : lastHash,
            hash        : hash,
            addedBy     : addedBy,
            nonce       : nonce,
            difficulty  : difficulty
        });
    }

    static adjustDifficulty({ lastBlock, timestamp }) {
        const { difficulty } = lastBlock; 

        if(difficulty < 1) 
            return 1;

        if(MINING_RATE < (timestamp - lastBlock.timestamp)) {
            return difficulty - 1;
        }

        return difficulty + 1;
    }
}

module.exports = Block;

/*
const b = new Block({
    blockNumber: 1,
    timestamp  : Date.now(),
    lastHash   : 'last-hash-last-hash',
    data       : ['data1', 'data2'],
    hash       : 'hash-hash', 
    addedBy    : 'Harshal' 
});
console.log(b);
*/