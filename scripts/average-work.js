const Blockchain    = require('../blockchain');

const blockchain    = new Blockchain();

const times           = [];
let prevTime, nextBlock, timeDiff, avgTime;

blockchain.addBlock({ addedBy: 'Harshal', data: 'Initial' });

for (let i = 0; i < 10000; i++) {
    prevTime        = blockchain.chain[blockchain.chain.length - 1].timestamp;
    blockchain.addBlock({ addedBy: 'Harshal', data: `block ${i}` });
    nextBlock       = blockchain.chain[blockchain.chain.length - 1];
    timeDiff        = nextBlock.timestamp - prevTime;
    times.push(timeDiff);
    avgTime         = times.reduce((total, num) => (total + num))/times.length;
                    
    console.log(`Block Number: ${i}, Difficulty: ${nextBlock.difficulty}, Time Difference: ${timeDiff}ms,  Average Time: ${avgTime}`);
}