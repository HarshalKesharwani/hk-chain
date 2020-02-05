const express       = require('express');
const bodyParser    = require('body-parser');
const request       = require('request');
const path          = require('path');
const Blockchain    = require('./blockchain');
const Wallet        = require('./wallet');
const PubSub        = require('./app/pubSub.pubnub');
const Peers          = require('./wallet/peers');
const TransactionPool   = require('./wallet/transaction-pool');  
const TransactionMiner  = require('./app/transaction-miner'); 

const transactionPool   = new TransactionPool();  
const { DEFAULT_PORT,
    CHANNEL_BLOCKCHAIN,
    BROADCAST_PUBLIC_KEY_INTERVAL }  = require('./config');

const isDevelopment = process.env.ENV === 'development';
const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`; //isDevelopment ? `http://localhost:${DEFAULT_PORT}` : 'https://desolate-falls-51169.herokuapp.com';
const blockchain    = new Blockchain();
const wallet        = new Wallet();
const pubSub        = new PubSub({ blockchain, transactionPool, wallet });


const transactionMiner  = new TransactionMiner({
    transactionPool, blockchain, pubSub, wallet
});
process.env.PWD = process.cwd();
const app   = express();
app.use(bodyParser.json());
app.use(
    express.static(
        path.join(process.env.PWD,'client/dist')
        )
    );


setTimeout( ()      =>pubSub.publish({ 
    channel: CHANNEL_BLOCKCHAIN, message: JSON.stringify(blockchain.chain)
}), 1000);

setInterval(
    () => pubSub.broadcastPublicKey(),
    BROADCAST_PUBLIC_KEY_INTERVAL
)

app.get("/api/peers", (req, res)   => {
    let peers = Peers.getPeers();
    peers.splice( peers.indexOf(wallet.publicKey), 1 )
    res.json(peers);
});

app.get("/api/blocks", (req, res)   => {
    res.json(blockchain.chain);
});

app.get('/api/blocks/length', (req, res) => {
    res.json(blockchain.chain.length);
  });
  
  app.get('/api/blocks/:id', (req, res) => {
    const { id } = req.params;
    const { length } = blockchain.chain;
  
    const blocksReversed = blockchain.chain.slice().reverse();
  
    let startIndex = (id-1) * 5;
    let endIndex = id * 5;
  
    startIndex = startIndex < length ? startIndex : length;
    endIndex = endIndex < length ? endIndex : length;
  
    res.json(blocksReversed.slice(startIndex, endIndex));
  });

app.post("/api/block", (req, res)   => {
    res.json(blockchain.chain[req.body.blockNumber - 1]);
});

app.post("/api/mine", (req, res)    => {
    const { data, addedBy }     = req.body;
    blockchain.addBlock({ data, addedBy });
    pubSub.broadcastChain();//blockchain.chain
    res.redirect("/api/blocks");
});

app.post("/api/transact", (req, res) => {
    const { recipient, amount } = req.body;
    let transaction = transactionPool.existingTransaction({ inputAddress    : wallet.publicKey });
    
    try {
        console.log("transaction "+transaction);
        if(transaction !== undefined) {
            console.log("exist");
            transaction.updateTransaction({ 
                            senderWallet    : wallet,
                            recipient,
                            amount
                        });
        } else {
            console.log("not exist");
            transaction         = wallet.createTransaction({  
                recipient,
                amount,
                chain : blockchain.chain
            });
        }
    }catch(error) {
        return res.status(400).json({ type : 'error', message : error.message });
    }
    transactionPool.setTransaction(transaction);
    pubSub.broadcastTransaction(transaction);
    res.json({ type : 'success',transaction });
});

app.get("/api/transaction-pool", (req, res) => {
    res.json(transactionPool.transactionMap);
});

app.get("/api/mine-transaction", (req, res) => {
    try {
        transactionMiner.mineTransactions();
        res.redirect("/api/blocks");
    }
    catch(error) {
        res.status(400).json({ type : 'error', message : error.message });
    }
});

app.get("/api/wallet-info", (req, res) => {
    const address = wallet.publicKey;
    res.json({
        address,
        balance : Wallet.calculateBalance({ 
            address,
            chain : blockchain.chain
        })
    });
});

app.get("*", (req, res) => {
    res.sendFile(
        path.join(process.env.PWD, 'client/dist/index.html')
    );
});

const syncWithRootState = ()                => {
    request(`${ROOT_NODE_ADDRESS}/api/blocks`, (error, response, body)   => {
        if(!error && response.statusCode === 200) {
            const responseChain = JSON.parse(body);
            blockchain.replaceChain(responseChain);
        }
    });

    request(`${ROOT_NODE_ADDRESS}/api/transaction-pool`, (error, response, body) => {
        if(!error && response.statusCode === 200) {
            const transactionMap =  JSON.parse(body);
            console.log(`Transaction map synced on startup`, transactionMap);
            transactionPool.setMap(transactionMap);
        }
    });

    pubSub.broadcastPublicKey();
}

if(isDevelopment) {
    let walletFoo = new Wallet();
    let walletBar = new Wallet();

    const generatedWalletTransaction  = ({ wallet, recipient, amount }) => {
        const transaction   = wallet.createTransaction({
            recipient, amount, chain : blockchain.chain
        }); 

        transactionPool.setTransaction(transaction);
    }

    const walletAction      = ()    => {
        generatedWalletTransaction({
            wallet, recipient : walletFoo.publicKey, amount : 5
        });
    }

    const walletFooAction  = ()     => {
        generatedWalletTransaction({
            wallet : walletFoo, recipient : walletBar.publicKey, amount : 10
        });
    }

    const walletBarAction  = ()     => {
        generatedWalletTransaction({
            wallet : walletBar, recipient : wallet.publicKey, amount : 15
        });
    }

    for(let i=0; i<10; i++) {
        if(i%3 === 0) {
            walletAction();
            walletFooAction();
        }
        else if(i%3 === 1) {
            walletAction();
            walletBarAction();
        }
        else {
            walletBarAction();
            walletFooAction();
        }
        transactionMiner.mineTransactions();
    }
}

let PEER_PORT;

if(process.env.GENERATE_PEER_PORT === 'true') {
    PEER_PORT   = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}

const PORT      =  process.env.PORT || PEER_PORT || DEFAULT_PORT;
app.listen(PORT, ()                 => {
    console.log(`listening to port ${PORT}`);
    if(PORT     !== DEFAULT_PORT)
    syncWithRootState();
});