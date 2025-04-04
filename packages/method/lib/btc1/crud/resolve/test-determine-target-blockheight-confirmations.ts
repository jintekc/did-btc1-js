import BitcoinRpc from '../../../../src/bitcoin/rpc-client.js';
import { BlockV3, DEFAULT_RPC_CLIENT_CONFIG } from '../../../../src/index.js';

const X = 7;
const rpc = BitcoinRpc.connect(DEFAULT_RPC_CLIENT_CONFIG);

async function getBlockSafe(height: number): Promise<BlockV3> {
  const block = await rpc.getBlock({ height }) as BlockV3;
  if(!block) {
    throw new Error('No block found at height ' + height);
  }
  return block;
}

async function xConfirmationsBlockHeight() {
  let height = await rpc.getBlockCount();
  let block = await getBlockSafe(height) as BlockV3;

  while (block.confirmations <= X) {
    block = await getBlockSafe(--height);
  }

  return block;
}
const xConfirmBlock = await xConfirmationsBlockHeight();
console.log(`Found first block height with more than ${X} confirmations`);
console.log(`Block #${xConfirmBlock.height}`);
console.log(`Block hash: ${xConfirmBlock.hash}`);
console.log('Block', xConfirmBlock);