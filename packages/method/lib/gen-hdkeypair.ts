import { bech32 } from '@scure/base';
import { wordlist } from '@scure/bip39/wordlists/english';
import { generateMnemonic, mnemonicToSeed } from '@scure/bip39';
import { HDKey } from '@scure/bip32';

// Generate a secp256k1 key pair
async function generateKeyPair({ mnemonic, network }: { mnemonic?: string; network?: string } = {}) {
  network ??= 'mainnet';
  mnemonic ??= generateMnemonic(wordlist, 128);

  const seed = await mnemonicToSeed(mnemonic);
  const { publicKey: pubKeyBytes } = HDKey.fromMasterSeed(seed).derive(
    `m/44'/${network === 'mainnet' ? 0 : 1}'/0'/0/0`
  );
  if (!pubKeyBytes) {
    throw new Error(`Failed to derive publicKey`);
  }
  const bitcoinAddress = bech32.encodeFromBytes('bc', pubKeyBytes);
  const did = `did:btc1:${bitcoinAddress}`;
  const decoded = bech32.decodeToBytes(bitcoinAddress);
  console.log('{ pubKeyBytes, decoded }', { pubKeyBytes, decoded: decoded.bytes });
  console.log(pubKeyBytes.join(' '));
  console.log(decoded.bytes.join(' '));
  console.log(pubKeyBytes.join(' ') === decoded.bytes.join(' '));
}

// Generate and log the key pair
await generateKeyPair();