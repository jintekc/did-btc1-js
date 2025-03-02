import Btc1AuxUtils from '../src/utils/btc1/utils.js';

const xorent = new Uint8Array([
  51, 244, 91, 193, 57, 100, 160,
  136, 113, 193, 128, 159, 241, 214,
  175, 124, 27, 228, 224, 150, 225,
  52, 38, 168, 219, 36, 207, 29,
  28, 213, 171, 237
]);
const salt = new Uint8Array([
  15, 5, 190, 217, 145, 136, 112,
  125, 77, 155, 190, 19, 207, 88,
  177, 183, 142, 65, 245, 213, 91,
  38, 130, 251, 184, 213, 22, 190,
  117, 168, 247, 251
]);
const privkey = Btc1AuxUtils.recoverPrivateKey(xorent, salt);
console.log('privkey', privkey);