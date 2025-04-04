import { DidBtc1 } from '../../../../src/did-btc1.js';

const resolve = await DidBtc1.resolve('did:btc1:regtest:k1qdh2ef3aqne63sdhq8tr7c8zv9lyl5xy4llj8uw3ejfj5xsuhcacjq98ccc');
console.log(JSON.stringify(resolve, null, 2));