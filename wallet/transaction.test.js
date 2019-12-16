const Transaction           = require('./transaction');
const Wallet                = require('./index');
const { VerifySignature }   = require('../util/index');

describe("Transaction", ()                          => {
    let transaction, senderWallet, recipient, amount;
    let errMock;
    beforeEach(()                                   => {
        senderWallet    = new Wallet();
        recipient       = 'recipient-public-key';
        amount          = 50;
        transaction     = new Transaction({ 
                                senderWallet,  
                                recipient,
                                amount
                            });

        errMock         = jest.fn();
        console.error   = errMock;
    });

    it("has an `id`", ()                            => {
        expect(transaction).toHaveProperty('id');
    });

    describe("outputMap", ()                        => {
        it("has property `outputMap`", ()           => {
            expect(transaction).toHaveProperty('outputMap');
        });

        it("outputs the amount to recipient", ()    => {
            expect(transaction.outputMap[recipient]).toEqual(amount);
        });

        it("outputs amount to sender", ()           => {
            expect(transaction.outputMap[senderWallet.publicKey]).toEqual(senderWallet.balance - amount);
        });
        
    });

    describe("Input", ()                            => {

        it("has an `input`", ()                     => {
            expect(transaction).toHaveProperty('input');
        });

        it("has an `timestamp`", ()                     => {
            expect(transaction.input).toHaveProperty('timestamp');
        });

        it("input has `amount`", ()                  => {
            expect(transaction.input.amount).toEqual(senderWallet.balance);
        });

        it("input has an address", ()               => {
            expect(transaction.input.address).toEqual(senderWallet.publicKey);
        });

        it("transaction has valid signature", ()               => {
            expect(
                VerifySignature({
                    publicKey   : senderWallet.publicKey,
                    data        : transaction.outputMap,
                    signature   : transaction.input.signature
                })
            ).toBe(true);
        });
    });

    describe("validateTransaction()", ()            => {

        describe("validates valid transaction", ()  => {
            it("and returns true", ()               => {
                expect(Transaction.validateTransaction(transaction)).toBe(true);
            });
        });

        describe("invalidates  transaction", ()     => {
            describe(" with invalid outputMap", ()  => {
                it("and return false & logs an error", () => {
                    transaction.outputMap[senderWallet.publicKey]   = 999999;
                    expect(Transaction.validateTransaction(transaction)).toBe(false);
                });
            });

            describe(" with invalid signature", ()  => {
                it("and return false & logs an error", () => {
                    transaction.input.signature   = new Wallet().sign('data');
                    expect(Transaction.validateTransaction(transaction)).toBe(false);
                });
            });
        });
    });

    describe("Update Transaction", ()               => {
        let originalSignature, originalBalance, nextRecipient, nextAmount;

        describe("And amount is valid", ()          => {
            beforeEach(()                               => {
                originalSignature   = transaction.input.signature;
                originalBalance     = transaction.outputMap[senderWallet.publicKey];
                nextRecipient       = 'next-dummy-recipient';
                nextAmount          = 35;
    
                transaction.updateTransaction({
                    senderWallet    : transaction.senderWallet,
                    recipient       : nextRecipient,
                    amount          : nextAmount    
                });
            });
    
            it("should update sender balance", ()       => {
                expect(transaction.outputMap[senderWallet.publicKey]).toEqual(originalBalance - nextAmount);
            });
    
            it("total sum should be same", ()           => {
                expect(
                    Object.values(transaction.outputMap)
                    .reduce( (totalAmount, Outputamount) => {
                       return totalAmount + Outputamount
                    })
                ).toEqual(transaction.input.amount);
            });
            
            it("signature should be modified", ()       => {
                expect(transaction.input.signature).not.toEqual(originalSignature);
            });
        });

        describe("And amount is invalid", ()        => {
            it("should throw an error", ()          => {
                expect(() => {
                    transaction.updateTransaction({
                                            senderWallet,
                                            recipient: nextAmount,
                                            amount : 999999
                    })
                }).toThrowError();
            });
        });
        
    });
});