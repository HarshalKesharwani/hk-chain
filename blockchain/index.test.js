const Blockchain        = require('./index');
const Block             = require('./block');
const { cryptoHash }    = require('../util');
const Wallet            = require('../wallet');
const Transaction       = require('../wallet/transaction');

describe("Blockchain", () => { 
    let bc, blockchain, newBlockchain, originalChain, errorMock;

        beforeEach(() => {
            bc                  = new Blockchain();
            blockchain          = new Blockchain();
            newBlockchain       = new Blockchain();
            errorMock           = jest.fn();
            
            blockchain.addBlock({addedBy:'Harshal',data: 'test'});
            blockchain.addBlock({addedBy:'Harshal',data: 'data'});
            blockchain.addBlock({addedBy:'Harshal',data: ['test', 'data']}); 

            originalChain       = blockchain.chain;
            global.console.error= errorMock;
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

    describe("Bad block with jumped difficulty", () => {
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
        let logMock;
        beforeEach(() => {
            logMock     = jest.fn();
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
                blockchain.replaceChain(newBlockchain.chain);
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
            });

            it("new chain replaces original chain", () => {
                blockchain.replaceChain(newBlockchain.chain);
                expect(blockchain.chain).toEqual(newBlockchain.chain);
            });
        });

        describe("isValidTransactionData()", () => {
            it("calls isValidTransactionData", () => {
                let isValidTransactionDataMock = jest.fn();
                blockchain.isValidTransactionData = isValidTransactionDataMock;
                newBlockchain.addBlock({addedBy:'Harshal',data: '1'});
                newBlockchain.addBlock({addedBy:'Harshal',data: '2'});
                newBlockchain.addBlock({addedBy:'Harshal',data: '3'});
                newBlockchain.addBlock({addedBy:'Harshal',data: '4'});
                blockchain.replaceChain(newBlockchain.chain, true);
                expect(isValidTransactionDataMock).toHaveBeenCalled();
            });
        });
    });

    describe("isValidTransactionData", () => {
        let newBlockchain1, blockc, transaction, wallet, rewardTransaction, minerWallet;
    
        beforeEach(() => {
            blockc          = new Blockchain();
            newBlockchain1  = new Blockchain();
            wallet          = new Wallet();
            transaction     = wallet.createTransaction({
                recipient   : 'foorecipient',
                amount      : 65,
                chain       : newBlockchain1.chain   
            });
            minerWallet    = new Wallet();
            rewardTransaction   = Transaction.rewardTransaction({ minerWallet });
        });
    
        describe("and transaction data is valid", () => {
            it('returns true', () => {
                newBlockchain1.addBlock({
                    addedBy : 'miner',
                    data    : [transaction, rewardTransaction]
                });
    
                expect(
                    blockc.isValidTransactionData({
                        newChain   : newBlockchain1.chain
                    })
                ).toBe(true);
                expect(errorMock).not.toHaveBeenCalled();
            });
        });
    
        describe("transaction data has multiple rewards", () => {
            it("returns false and logs an error", () => {
                newBlockchain1.addBlock({
                    addedBy : 'miner',
                    data    : [transaction, rewardTransaction, rewardTransaction]
                });
    
                expect(
                    blockc.isValidTransactionData({
                        newChain   : newBlockchain1.chain
                    })
                ).toBe(false);
                expect(errorMock).toHaveBeenCalled();
            });
        });
    
        describe("transaction data has at least one malformed outputMap", () => {
            describe("and transaction is a reward transaction", () => {
                it("returns false and logs an error", () => {
                    rewardTransaction.outputMap[minerWallet.publicKey] = 9000;
                    newBlockchain1.addBlock({
                        addedBy : 'miner',
                        data    : [transaction, rewardTransaction]
                    });
                    expect(
                        blockc.isValidTransactionData({
                            newChain   : newBlockchain1.chain
                        })
                    ).toBe(false);
                    expect(errorMock).toHaveBeenCalled();
                });
            });
    
            describe("and transaction is not a reward transaction", () => {
                it("returns false and logs an error", () => {
                    transaction.outputMap[wallet.publicKey] = 9000;
                    newBlockchain1.addBlock({
                        addedBy : 'miner',
                        data    : [transaction, rewardTransaction]
                    });
                    expect(
                        blockc.isValidTransactionData({
                            newChain   : newBlockchain1.chain
                        })
                    ).toBe(false);
                    expect(errorMock).toHaveBeenCalled();
                });          
            });
        });
    
        describe("transaction data has atleast one malformed input", () => {
            
            it("returns false and logs an error", () => {
                wallet.balance          = 9000;
                const evilOutputMap     = {
                    [wallet.publicKey]  : 8900,
                    foorecipient        : 100 
                };
                const evilTransaction = {
                    input   : {
                        timestamp   : Date.now(),
                        address     : wallet.publicKey,
                        amount      : wallet.balance,
                        signature   : wallet.sign(evilOutputMap)
                    },
                    outputMap       : evilOutputMap
                };
                newBlockchain1.addBlock({
                    addedBy : minerWallet.publicKey,
                    data    : [evilTransaction, rewardTransaction]
                });
                
                expect(
                    blockc.isValidTransactionData({
                        newChain   : newBlockchain1.chain
                    })
                ).toBe(false);
                expect(errorMock).toHaveBeenCalled();
            });
        });
    
        describe("block contains multiple identical transactions", () => {
            it("returns false and logs an error", () => {
                newBlockchain1.addBlock({
                    addedBy : minerWallet.publicKey,
                    data    : [transaction, transaction, transaction, rewardTransaction] 
                });
    
                expect(
                    blockc.isValidTransactionData({ newChain : newBlockchain1.chain })
                    ).toBe(false);
                expect(errorMock).toHaveBeenCalled();
            });
        });
    });
});