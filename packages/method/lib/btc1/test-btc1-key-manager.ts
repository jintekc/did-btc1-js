import { Cryptosuite, DataIntegrityProof, KeyPairUtils, Multikey } from '@did-btc1/cryptosuite';
import { Btc1KeyManager } from '../../src/btc1/key-manager.js';

// Properly format the id
const id = '#initialKey';

// Default to bip340-jcs-2025 cryptosuite
const type = 'bip340-jcs-2025';

// Generate a new keypair if one is not provided
const keyPair = KeyPairUtils.generate();

// Create a new Multikey instance
const multikey = new Multikey({ id, controller, keyPair });

// Create a new Cryptosuite instance
const cryptosuite = new Cryptosuite({ cryptosuite: type, multikey });

// Create a new DataIntegrityProof instance
const proof = new DataIntegrityProof(cryptosuite);
const keyManager = new Btc1KeyManager({ multikey, proof});