import { Multikey } from '../src/di-bip340/multikey/index.js';
const id = '#initialKey';
const controller = 'did:btc1:k1qvddh3hl7n5czluwhz9ry35tunkhtldhgr66zp907ewg4l7p6u786tz863a';
const publicKey = new Uint8Array([
  79,  96, 138,  82,   3,  54,  86, 141,
  235,  42, 148,  25,  72,  25,  71,   0,
  240, 255, 250, 153,  12, 162, 243, 137,
  60,  65, 215, 217, 230,  85,   1,  42
]);
const privateKey = new Uint8Array([
  139, 106,  49, 176,  63,  12, 121,  46,
  94, 115, 142, 201,  94,  75, 143, 216,
  210,  68, 197, 137, 232,  63,  63, 178,
  30, 220, 161, 210,  96, 218, 198, 158
]);

const message = Buffer.from('Hello BTC1!').toString('hex');
const validSignature = 'd340703b03d0f568655f3d6f245c50a7bc42cca8e8d059890d8314a290b2d4ce59a1070f816fed5270a721c77264b021a7a37719c53a4054b06ee59207cfe3ac';
const invalidSignature = '230a929a88dd2924b3edb9ea471e460f590abf5dc41e3011479d25c779389fcb1567ad0897a14460c5681913d13750d565019978d2ecbea9da7ddfea80d6cbe3';

const multikey = new Multikey({ id, controller, privateKey, publicKey });
const signature = multikey.sign(message);
console.log('signature', signature);
const verify = [validSignature, invalidSignature].map(s => multikey.verify(message, s));
console.log('verify', verify);
const encoded = multikey.encode();
console.log('encoded', encoded);
let pubkey = multikey.decode(encoded);
console.log('pubkey1', pubkey);
const prefix = pubkey.subarray(0, 2);
console.log('prefix', prefix);
pubkey = pubkey.subarray(2);
console.log('pubkey2', pubkey);
const verificationMethod = multikey.toVerificationMethod();
console.log('verificationMethod', verificationMethod);
const multikeyFromVm = multikey.fromVerificationMethod(verificationMethod);
console.log('multikeyFromVm', multikeyFromVm);