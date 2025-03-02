import Bitcoind from '../src/utils/bitcoind.js';
import { DEFAULT_CLIENT_CONFIG } from '../src/utils/bitcoind/constants.js';

// Bitcoind.initialize()
/*
headers?: Record<string, string>;
host?: string;
logger?: any;
password?: string;
timeout?: number;
username?: string;
version?: string;
wallet?: string;
allowDefaultWallet?: boolean;
*/
// const config = {
//     host: 'http://bitcoin.alice.me:18443',
//     username: 'alice',
//     password: 'alicepass',
//     version: '28.1.0',
// }
// const client = Bitcoind.initialize(config);
// const bitcoind = new Bitcoind(client);
// const info = await bitcoind.getBlockchainInformation()
// console.log('info', info)
const X = 7;
const targetTime = 1739565192; // block 1160
const bob = Bitcoind.connect(DEFAULT_CLIENT_CONFIG);

async function targetTimeBlockHeight(targetTime: number) {
  let blockheight = await bob.getBlockCount();
  let blockhash = await bob.getBlockHash(blockheight);
  let block = await bob.getBlock(blockhash);

  const info = await bob.getBlockchainInfo();
  if (blockheight !== info.blocks) {
    throw new Error(`Block height mismatch! blockheight ${blockheight} !== info.blocks ${info.blocks}`);
  }

  do {
    blockhash = await bob.getBlockHash(--blockheight);
    block = await bob.getBlock(blockhash);
  } while (block.time > targetTime);

  return block;
}

const targetTimeBlock = await targetTimeBlockHeight(targetTime);
console.log(`Found first block with time < targetTime of ${targetTime}`);
console.log(`Block #${targetTimeBlock.height}`);
console.log(`Block hash: ${targetTimeBlock.hash}`);
console.log('Block', targetTimeBlock);


async function xConfirmationsBlockHeight() {
  let blockheight = await bob.getBlockCount();
  let blockhash = await bob.getBlockHash(blockheight);
  let block = await bob.getBlock(blockhash);

  const info = await bob.getBlockchainInfo();
  if (blockheight !== info.blocks) {
    throw new Error(`Block height mismatch! blockheight ${blockheight} !== info.blocks ${info.blocks}`);
  }

  while (block.confirmations <= X) {
    blockhash = await bob.getBlockHash(--blockheight);
    block = await bob.getBlock(blockhash);
  }

  return block;
}
const xConfirmBlock = await xConfirmationsBlockHeight();
console.log(`Found first block height with more than ${X} confirmations`);
console.log(`Block #${xConfirmBlock.height}`);
console.log(`Block hash: ${xConfirmBlock.hash}`);
console.log('Block', xConfirmBlock);

// const bobMem = await bob.getBlockchainInfo();
// console.log('Object.entries(bobMem[0])', Object.entries(bobMem[0]))
// console.log('Object.keys(bobMem[0])', Object.keys(bobMem[0]))
// console.log('Object.values(bobMem[0])', Object.values(bobMem[0]))
// console.log('bobMem', JSON.parse(JSON.stringify(bobMem)))

// const alice = Bitcoind.connect(DEFAULT_CLIENT_CONFIG)
// const aliceMem = await alice.getMemoryInfo('stats');
// console.log('aliceMem', aliceMem)

// const sendall = await bob.sendAll({
//     recipients: [
//         'bc1q09vm5lfy0j5reeulh4x5752q25uqqvz34hufdl',
//         'bc1q02ad21edsxd23d32dfgqqsz4vv4nmtfzuklhy3'
//     ],
//     options: { fee_rate: 1.1 }
// });
// console.log('sendall', sendall)

// const keys = [
//     '03789ed0bb717d88f7d321a368d905e7430207ebbd82bd342cf11ae157a7ace5fd',
//     '03dbc6764b8884a92e871274b87583e6d5c2a58819473e17e107ef3f6aa5a61626'
// ]
// const multisig = await bob.createMultisig({ nrequired: 2, keys });
// console.log('multisig', multisig)