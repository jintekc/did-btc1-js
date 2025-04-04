import { Btc1Read } from '../../../../src/index.js';

const signals = await Btc1Read.findNextSignals({
  blockheight : 4000,
  target      : 4473,
  beacons     : [
    {
      'id'              : '#initialP2WPKH',
      'type'            : 'SingletonBeacon',
      'serviceEndpoint' : 'bitcoin:bcrt1qlgq8mywrjff7ycan95j8cs3p3g8nd2v2ta4769'
    }
  ]
});

console.log('signals', signals);