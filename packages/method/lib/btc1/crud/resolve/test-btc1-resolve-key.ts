import { DidBtc1 } from '../../../../src/did-btc1.js';

// const dids = [
//   'did:btc1:k1q0dygyp3gz969tp46dychzy4q78c2k3js68kvyr0shanzg67jnuez2cfplh',
//   'did:btc1:mainnet:k1q0dygyp3gz969tp46dychzy4q78c2k3js68kvyr0shanzg67jnuez2cfplh',
//   'did:btc1:k1qtrcv5afyksyeam937p9uura4lzq4mqwx3aqatrl4yer02rrnlayk6cm9v2',
//   'did:btc1:mainnet:k1qtrcv5afyksyeam937p9uura4lzq4mqwx3aqatrl4yer02rrnlayk6cm9v2',
//   'did:btc1:regtest:k1qtrcv5afyksyeam937p9uura4lzq4mqwx3aqatrl4yer02rrnlayk6cm9v2',
//   'did:btc1:k1qtrcv5afyksyeam937p9uura4lzq4mqwx3aqatrl4yer02rrnlayk6cm9v2'
// ];
// const response = await Promise.all(
//   dids.map(async (did) => ({did, resolution: await DidBtc1.resolve(did)}))
// );
// console.log('response', response);

try {

  const did0 = 'did:btc1:regtest:k1qdh2ef3aqne63sdhq8tr7c8zv9lyl5xy4llj8uw3ejfj5xsuhcacjq98ccc';
  console.log('did0', did0);
  const resolution0 = await DidBtc1.resolve(did0);
  console.log('resolution0', resolution0);
} catch {
  console.error('Error resolving did0');
}

// try {
//   const did1 = 'did:btc1:mainnet:k1q0dygyp3gz969tp46dychzy4q78c2k3js68kvyr0shanzg67jnuez2cfplh';
//   console.log('did1', did1);
//   const resolution1 = await DidBtc1.resolve('did:btc1:mainnet:k1q0dygyp3gz969tp46dychzy4q78c2k3js68kvyr0shanzg67jnuez2cfplh');
//   console.log('resolution1', resolution1);
// } catch {
//   console.error('Error resolving did1');
// }

// try {
//   const did2 = 'did:btc1:k1qtrcv5afyksyeam937p9uura4lzq4mqwx3aqatrl4yer02rrnlayk6cm9v2';
//   console.log('did2', did2);
//   const resolution2 = await DidBtc1.resolve('did:btc1:k1qtrcv5afyksyeam937p9uura4lzq4mqwx3aqatrl4yer02rrnlayk6cm9v2');
//   console.log('resolution2', resolution2);
// } catch {
//   console.error('Error resolving did2');
// }

// try {
//   const did3 = 'did:btc1:mainnet:k1qtrcv5afyksyeam937p9uura4lzq4mqwx3aqatrl4yer02rrnlayk6cm9v2';
//   console.log('did3', did3);
//   const resolution3 = await DidBtc1.resolve('did:btc1:mainnet:k1qtrcv5afyksyeam937p9uura4lzq4mqwx3aqatrl4yer02rrnlayk6cm9v2');
//   console.log('resolution3', resolution3);
// } catch {
//   console.error('Error resolving did3');
// }