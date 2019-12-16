const hextToBinary    = require('hex-to-binary');
const Block           = require('./block');
const { cryptoHash }  = require('../util');
const   {
            GENESIS_DATA,
            MINING_RATE
        }             = require('../config'); 

describe("Block", () => {

    const blockNumber = 1;
    const timestamp   = Date.now();
    const lastHash    = 'last-hash-last-hash';
    const data        = ['data1', 'data2'];
    const hash        = 'hash-hash';
    const addedBy     = 'Harshal';
    const nonce       = 1;
    const difficulty  = 1;
    const block       = new Block({blockNumber, timestamp, lastHash, data, hash, addedBy, nonce, difficulty});

    it("Has a blockNumber, timestamp, lastHash, data, hash, addedBy", () => {
        expect(block.blockNumber).toEqual(blockNumber);
        expect(block.timestamp).toEqual(timestamp);
        expect(block.lastHash).toEqual(lastHash);
        expect(block.data).toEqual(data);
        expect(block.hash).toEqual(hash);
        expect(block.addedBy).toEqual(addedBy);
        expect(block.difficulty).toEqual(difficulty);
        expect(block.nonce).toEqual(nonce);
    });
    
    describe("Adjust mining rate", () => {
        it("increase difficulty", () => {
            expect(Block.adjustDifficulty({ 
                                            lastBlock : block, 
                                            timestamp: timestamp + MINING_RATE - 100 
                                        })).toEqual(block.difficulty + 1);
        });

        it("decrease difficulty", () => {
            expect(Block.adjustDifficulty({ 
                                            lastBlock : block, 
                                            timestamp: timestamp + MINING_RATE + 100 
                                        })).toEqual(block.difficulty - 1);
        });
    });
});

describe("Genesis", () => {
    const genesisBlock = Block.genesis(GENESIS_DATA);
    
    it("is genesis block created", () => {
        expect(genesisBlock instanceof Block).toBe(true);
    });

    it("valid genesis block data", () => {
        expect(genesisBlock.blockNumber).toEqual(GENESIS_DATA.blockNumber);
        expect(genesisBlock.timestamp).toEqual(GENESIS_DATA.timestamp);
        expect(genesisBlock.lastHash).toEqual(GENESIS_DATA.lastHash);
        expect(genesisBlock.data).toEqual(GENESIS_DATA.data);
        expect(genesisBlock.hash).toEqual(GENESIS_DATA.hash);
        expect(genesisBlock.addedBy).toEqual(GENESIS_DATA.addedBy);
        expect(genesisBlock.nonce).toEqual(GENESIS_DATA.nonce);
        expect(genesisBlock.difficulty).toEqual(GENESIS_DATA.difficulty);
    });
});

describe("mineBlock", () => {
    const lastBlock   = Block.genesis();
    const data        = ['test', 'data'];
    const addedBy     = 'Harshal';
    const blockNumber = 2;
    const mineBlock = Block.mineBlock({ 'lastBlock': lastBlock, data, addedBy, blockNumber, });
    it("instance of block", () => {
        expect(mineBlock instanceof Block).toBe(true);
    });

    it("block created", () => {
        expect(mineBlock).not.toEqual(undefined);
    });

    it("timestamp is defined", () => {
        expect(mineBlock.timestamp).not.toEqual(undefined);
    });
    
    it("hash is defined", () => {
        expect(mineBlock.hash).not.toEqual(undefined);
    });

    it("addedBy is defined", () => {
        expect(mineBlock.addedBy).not.toEqual(undefined);
    });

    it("blockNumber is defined", () => {
        expect(mineBlock.blockNumber).not.toEqual(undefined);
    });

    it("difficulty is defined", () => {
        expect(mineBlock.difficulty).not.toEqual(undefined);
    });

    it("nonce is defined", () => {
        expect(mineBlock.nonce).not.toEqual(undefined);
    });

    it("data is not tampered", () => {
        expect(mineBlock.data).toEqual(data);
    });

    it("hash is valid", () => {
        expect(mineBlock.hash).toEqual(cryptoHash(mineBlock.timestamp, mineBlock.difficulty, mineBlock.nonce, lastBlock.hash, data, addedBy, blockNumber));
    });

    it("sets the hash with given difficulty", () => {
        console.log(mineBlock.difficulty, mineBlock.nonce, mineBlock.hash);
        expect(hextToBinary(mineBlock.hash).substring(0, mineBlock.difficulty)).toEqual('0'.repeat(mineBlock.difficulty));
    });

    it("difficulty is updated", () => {
        const possibleResults = [lastBlock.difficulty + 1, lastBlock.difficulty - 1];
        expect(possibleResults.includes(mineBlock.difficulty));
    });
});