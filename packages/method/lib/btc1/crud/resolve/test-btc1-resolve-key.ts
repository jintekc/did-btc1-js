import { DidBtc1 } from '../../../../src/did-btc1.js';

const resolve = await DidBtc1.resolve('did:btc1:k1q0dygyp3gz969tp46dychzy4q78c2k3js68kvyr0shanzg67jnuez2cfplh');
console.log(JSON.stringify(resolve, null, 2));