const Wallet            = require('./index');
const { 
        VerifySignature
    }                   = require('../util');
const Transaction       = require('./transaction');

describe("Wallet", ()                           => {
    let wallet;
    beforeEach(()                               => {
        wallet          = new Wallet();
    });

    it("has a `balance`", ()                    => {
        expect(wallet).toHaveProperty('balance');
    });

    it("has a `publicKey`", ()                  => {
        expect(wallet).toHaveProperty('publicKey');
    });

    describe("Verify Signature", ()             => {
        let data        = "sample data";
        it("verifies valid signature", ()       => {
            expect(
                VerifySignature({
                publicKey : wallet.publicKey,
                data,
                signature : wallet.sign(data) 
                })
            ).toBe(true);
        });

        it("Invalid signature not verified", ()       => {
            expect(
                VerifySignature({
                publicKey : wallet.publicKey,
                data,
                signature : new Wallet().sign(data) 
                })
            ).toBe(false);
        });
    });

    describe("Create Transaction", ()           => {
        let transaction, recipient, amount;
        beforeEach(()                           => {
            recipient           = 'dummy recipient';
            amount              = 99;
            transaction   = wallet.createTransaction({ recipient, amount });
        });

        it("should have instance of transaction object",
                                            ()  => {
            expect(transaction instanceof Transaction).toBe(true);
        });

        it("should have valid sender", ()       => {
            expect(transaction.senderWallet.publicKey).toEqual(wallet.publicKey);
        });

        it("should update recipient balance", ()=> {
            expect(transaction.outputMap[recipient]).toEqual(amount);
        });
    });
});