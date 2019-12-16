const Blockchain        = require('./index');
const Block             = require('./block');
const { cryptoHash }    = require('../util');

describe("Blockchain", () => { 
    let bc, blockchain, newBlockchain, originalChain;

        beforeEach(() => {
            bc                  = new Blockchain();
            blockchain          = new Blockchain();
            newBlockchain       = new Blockchain();

            blockchain.addBlock({addedBy:'Harshal',data: 'test'});
            blockchain.addBlock({addedBy:'Harshal',data: 'data'});
            blockchain.addBlock({addedBy:'Harshal',data: ['test', 'data']}); 

            originalChain = blockchain.chain;
        });

    it("Instance of blockchain", () => {
        expect(bc.chain instanceof Array).toBe(true);
    });

    it("Starts with valid genesis block", () => {
        expect(bc.chain[0]).toEqual(Block.genesis());
    });

    it("Adds block to the chain", () => {
        const newData = 'data';
        bc.addBlock({ addedBy: 'Harshal', data: newData});
        expect(bc.chain[bc.chain.length - 1].data).toEqual(newData);
    });

    it("block number added correctly", () => {
        const newData = 'block number data';
        bc.addBlock({addedBy: 'Harshal', data : newData});
    
        expect(bc.chain[bc.chain.length - 1].blockNumber).toEqual(bc.chain.length);
    });

    describe("isValidChain", () => {
        describe("chain is not valid", () => {
            it("starts with invalid genesis block", () => {
                blockchain.chain[0].data = 'invalid genesis data';
                expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
            });

            it("last hash is not changed", () => {
                blockchain.chain[2].lastHash = 'broken-lastHash';
                expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
            });
        });

        describe("chain is valid", () => {
            it("chain is valid", () => {
                expect(Blockchain.isValidChain(blockchain.chain)).toBe(true);
            });
        });
    });

    describe("Bad block with jumpoed difficulty", () => {
        it("Jumped difficulty", () => {
            const lastBlock         = blockchain.chain[blockchain.chain.length - 1];
            const lastDifficulty    = lastBlock.difficulty;
            const timestamp         = Date.now();
            const addedBy           = 'Harshal';
            const jumpedDifficulty  = lastDifficulty - 3;
            const blockNumber       = blockchain.chain.length + 1;
            const nonce             = 0;
            const data              = 'bad block data';
            const hash              = cryptoHash(
                                                timestamp,
                                                blockNumber,
                                                addedBy,
                                                data,
                                                lastBlock.hash,
                                                jumpedDifficulty,
                                                nonce
                                            );
            const badBlock          = new Block({ 
                                            blockNumber,
                                            timestamp,
                                            hash,
                                            nonce,
                                            data,
                                            'lastHash'      : lastBlock.hash,
                                            'addedBy'       : addedBy,
                                            'difficulty'    : jumpedDifficulty
                                        });
            blockchain.chain.push(badBlock);
            expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
        });
    });

    describe("replaceChain", () => {
        let logMock, errorMock;
        beforeEach(() => {
            logMock     = jest.fn();
            errorMock   = jest.fn();

            global .console.error   = errorMock;
            global.console.log      = logMock;
        });

        describe("new chain is not longer", () => {
            beforeEach(() => {
                blockchain.replaceChain(newBlockchain.chain);
            });
            it("not longer", () => {
                expect(blockchain.chain).toEqual(originalChain);
            });

            it("errorMock have been called", () => {
                expect(errorMock).toHaveBeenCalled();
            });
        });

        describe("new chain is longer", () => {
            beforeEach(() => {
                newBlockchain.addBlock({addedBy:'Harshal',data: 'test'});
                newBlockchain.addBlock({addedBy:'Harshal',data: 'data'});
                newBlockchain.addBlock({addedBy:'Harshal',data: ['test', 'data']});
                newBlockchain.addBlock({addedBy:'Harshal',data: ['test', 'data', 'new', 'chain', 'added']});
                newBlockchain.chain[2].lastHash = 'some-fake-hash';
                blockchain.replaceChain(newBlockchain.chain)
            });

            it("new chain does not replace original chain", () => {
                expect(blockchain.chain).toEqual(originalChain);
            });

            it("errorMock have been called", () => {
                expect(errorMock).toHaveBeenCalled();
            });
        });

        describe("new chain is longer and valid", () => {
            beforeEach(() => {
                newBlockchain.addBlock({addedBy:'Harshal',data: 'test'});
                newBlockchain.addBlock({addedBy:'Harshal',data: 'data'});
                newBlockchain.addBlock({addedBy:'Harshal',data: ['test', 'data']});
                newBlockchain.addBlock({addedBy:'Harshal',data: ['test', 'data', 'new', 'chain', 'added']});
                blockchain.replaceChain(newBlockchain.chain);
            });

            it("new chain replaces original chain", () => {
                expect(blockchain.chain).toEqual(newBlockchain.chain);
            });

            it("logMock have been called", () => {
                expect(logMock).toHaveBeenCalled();
            });
        });
    });
});