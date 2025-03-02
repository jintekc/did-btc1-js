import { DidBtc1Document } from '../src/types.js';

export const idTypes = { key: 'key', external: 'external' };
export const versions = ['1', '2', '3', '4', '5'];
export const networks = ['mainnet', 'testnet', 'signet', 'regtest'];
export const pkDocs = [
  {
    'pubKeyBytes' : [
      2,
      150,
      42,
      66,
      82,
      32,
      223,
      81,
      248,
      241,
      168,
      33,
      138,
      205,
      18,
      178,
      216,
      7,
      182,
      135,
      243,
      165,
      233,
      64,
      139,
      166,
      53,
      225,
      212,
      54,
      83,
      51,
      23
    ],
    'intermediateDocument' : {
      '@context' : [
        'https://www.w3.org/ns/did/v1',
        'https://w3id.org/security/multikey/v1',
        'https://github.com/dcdpr/did-btc1'
      ],
      'id'             : 'did:btc1:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      'authentication' : [
        '#initialKey'
      ],
      'assertionMethod' : [
        '#initialKey'
      ],
      'capabilityInvocation' : [
        '#initialKey'
      ],
      'capabilityDelegation' : [
        '#initialKey'
      ],
      'verificationMethod' : [
        {
          'id'                 : '#initialKey',
          'type'               : 'Multikey',
          'controller'         : 'did:btc1:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
          'publicKeyMultibase' : 'z4jKbyg1bUG6fJwYh4swsUt4YKK2oAd5MJg2tN7je1GtjX2qc'
        }
      ],
      'service' : [
        {
          'id'              : '#initialP2PKH',
          'type'            : 'SingletonBeacon',
          'serviceEndpoint' : 'bitcoin:13Yy4wKBrJbnQWD7ddVW8hhgCm8o6xvp9n'
        },
        {
          'id'              : '#initialP2WPKH',
          'type'            : 'SingletonBeacon',
          'serviceEndpoint' : 'bitcoin:bc1qr0alxy2upt2y5e46zeaayrw04uyzsvrmrkrwa3'
        },
        {
          'id'              : '#initialP2TR',
          'type'            : 'SingletonBeacon',
          'serviceEndpoint' : 'bitcoin:bc1pvq4q6u937m8qx4fv4ldsc5wyykw9784y89p9xvdza28q9r3wlepq54nwvg'
        }
      ]
    }
  },
  {
    'pubKeyBytes' : [
      2,
      8,
      173,
      80,
      206,
      191,
      181,
      41,
      209,
      243,
      156,
      103,
      235,
      233,
      196,
      112,
      78,
      239,
      136,
      24,
      40,
      47,
      3,
      128,
      127,
      111,
      108,
      246,
      39,
      171,
      163,
      65,
      83
    ],
    'intermediateDocument' : {
      '@context' : [
        'https://www.w3.org/ns/did/v1',
        'https://w3id.org/security/multikey/v1',
        'https://github.com/dcdpr/did-btc1'
      ],
      'id'             : 'did:btc1:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      'authentication' : [
        '#initialKey'
      ],
      'assertionMethod' : [
        '#initialKey'
      ],
      'capabilityInvocation' : [
        '#initialKey'
      ],
      'capabilityDelegation' : [
        '#initialKey'
      ],
      'verificationMethod' : [
        {
          'id'                 : '#initialKey',
          'type'               : 'Multikey',
          'controller'         : 'did:btc1:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
          'publicKeyMultibase' : 'z4jKbp9hcHTT2qKymkC12QU95s1HYPtvPdpcg936sUTasQw78'
        }
      ],
      'service' : [
        {
          'id'              : '#initialP2PKH',
          'type'            : 'SingletonBeacon',
          'serviceEndpoint' : 'bitcoin:174EZ9haVAZRoScHMAhSUBiDPdByTFKEyU'
        },
        {
          'id'              : '#initialP2WPKH',
          'type'            : 'SingletonBeacon',
          'serviceEndpoint' : 'bitcoin:bc1qgfk4zvff45vq0mxt2ej5l5l6rm6wyw8h8cyu73'
        },
        {
          'id'              : '#initialP2TR',
          'type'            : 'SingletonBeacon',
          'serviceEndpoint' : 'bitcoin:bc1pcl4maq320vf7zzkfg2qa74dj9lz240s74alul8xe5fgkr6jwjhnsm6ymrf'
        }
      ]
    }
  },
  {
    'pubKeyBytes' : [
      3,
      126,
      37,
      9,
      210,
      249,
      110,
      238,
      28,
      234,
      251,
      237,
      110,
      91,
      251,
      178,
      38,
      130,
      146,
      98,
      155,
      75,
      151,
      20,
      109,
      18,
      59,
      114,
      221,
      109,
      143,
      41,
      59
    ],
    'intermediateDocument' : {
      '@context' : [
        'https://www.w3.org/ns/did/v1',
        'https://w3id.org/security/multikey/v1',
        'https://github.com/dcdpr/did-btc1'
      ],
      'id'             : 'did:btc1:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      'authentication' : [
        '#initialKey'
      ],
      'assertionMethod' : [
        '#initialKey'
      ],
      'capabilityInvocation' : [
        '#initialKey'
      ],
      'capabilityDelegation' : [
        '#initialKey'
      ],
      'verificationMethod' : [
        {
          'id'                 : '#initialKey',
          'type'               : 'Multikey',
          'controller'         : 'did:btc1:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
          'publicKeyMultibase' : 'z4jKcFHZZetMXY3cMt4ymtSX1yt1kaVbs6PU1S2CTCFrRTxBC'
        }
      ],
      'service' : [
        {
          'id'              : '#initialP2PKH',
          'type'            : 'SingletonBeacon',
          'serviceEndpoint' : 'bitcoin:1PqQygjrmKfkHppKRys14BWT7WrJHnfrqJ'
        },
        {
          'id'              : '#initialP2WPKH',
          'type'            : 'SingletonBeacon',
          'serviceEndpoint' : 'bitcoin:bc1qlfatl22qgjsj3tf98wsdsxafegflst6afkc44k'
        },
        {
          'id'              : '#initialP2TR',
          'type'            : 'SingletonBeacon',
          'serviceEndpoint' : 'bitcoin:bc1puavdsjafdmjes2uf4dfpnulwylnuz06s9ec0rad9jj8lfacu3dpqtragdh'
        }
      ]
    }
  },
  {
    'pubKeyBytes' : [
      3,
      185,
      40,
      189,
      152,
      15,
      199,
      29,
      149,
      197,
      49,
      215,
      126,
      239,
      193,
      151,
      15,
      151,
      249,
      169,
      85,
      5,
      205,
      123,
      151,
      151,
      79,
      84,
      154,
      201,
      113,
      179,
      101
    ],
    'intermediateDocument' : {
      '@context' : [
        'https://www.w3.org/ns/did/v1',
        'https://w3id.org/security/multikey/v1',
        'https://github.com/dcdpr/did-btc1'
      ],
      'id'             : 'did:btc1:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      'authentication' : [
        '#initialKey'
      ],
      'assertionMethod' : [
        '#initialKey'
      ],
      'capabilityInvocation' : [
        '#initialKey'
      ],
      'capabilityDelegation' : [
        '#initialKey'
      ],
      'verificationMethod' : [
        {
          'id'                 : '#initialKey',
          'type'               : 'Multikey',
          'controller'         : 'did:btc1:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
          'publicKeyMultibase' : 'z4jKcKFvthk3Z44bfNAT7Uy5hxxmw94bqG39G3sJcKYuQd2JQ'
        }
      ],
      'service' : [
        {
          'id'              : '#initialP2PKH',
          'type'            : 'SingletonBeacon',
          'serviceEndpoint' : 'bitcoin:15i1ueHNufYx7wWRkAfpWPVW3s96prV6J9'
        },
        {
          'id'              : '#initialP2WPKH',
          'type'            : 'SingletonBeacon',
          'serviceEndpoint' : 'bitcoin:bc1qxw39pvn7qfztp7u6nxu8wnurfgs73npazzj7lp'
        },
        {
          'id'              : '#initialP2TR',
          'type'            : 'SingletonBeacon',
          'serviceEndpoint' : 'bitcoin:bc1ppjqyzl9yjmywan9zss0adwng3wl9jx9plgtuswh5mf0t997c8fwqeya8s0'
        }
      ]
    }
  },
  {
    'pubKeyBytes' : [
      2,
      142,
      10,
      12,
      161,
      20,
      127,
      139,
      20,
      10,
      237,
      112,
      17,
      106,
      237,
      240,
      198,
      189,
      66,
      247,
      127,
      46,
      56,
      150,
      139,
      211,
      223,
      221,
      72,
      146,
      129,
      48,
      238
    ],
    'intermediateDocument' : {
      '@context' : [
        'https://www.w3.org/ns/did/v1',
        'https://w3id.org/security/multikey/v1',
        'https://github.com/dcdpr/did-btc1'
      ],
      'id'             : 'did:btc1:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      'authentication' : [
        '#initialKey'
      ],
      'assertionMethod' : [
        '#initialKey'
      ],
      'capabilityInvocation' : [
        '#initialKey'
      ],
      'capabilityDelegation' : [
        '#initialKey'
      ],
      'verificationMethod' : [
        {
          'id'                 : '#initialKey',
          'type'               : 'Multikey',
          'controller'         : 'did:btc1:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
          'publicKeyMultibase' : 'z4jKby8Hr5ssaXVRRvVNtQiwFmnvqZiLV28x9GCQmGE4L7w3b'
        }
      ],
      'service' : [
        {
          'id'              : '#initialP2PKH',
          'type'            : 'SingletonBeacon',
          'serviceEndpoint' : 'bitcoin:1AjYr1saJRyy44fyPRxj3mG5XkxzSnizwV'
        },
        {
          'id'              : '#initialP2WPKH',
          'type'            : 'SingletonBeacon',
          'serviceEndpoint' : 'bitcoin:bc1qdtzj7ad9sccre4gx09khh4wxne3gnv37ttausk'
        },
        {
          'id'              : '#initialP2TR',
          'type'            : 'SingletonBeacon',
          'serviceEndpoint' : 'bitcoin:bc1pds4r2nk0f8fmp6t03zt5qpx7lcqvr9vms7r7t8ds6ad42rv3x0lq755n6a'
        }
      ]
    }
  },
  {
    'pubKeyBytes' : [
      3,
      12,
      55,
      136,
      144,
      33,
      53,
      160,
      128,
      177,
      50,
      4,
      144,
      113,
      49,
      106,
      230,
      93,
      31,
      84,
      47,
      215,
      79,
      57,
      157,
      22,
      59,
      106,
      30,
      126,
      253,
      251,
      232
    ],
    'intermediateDocument' : {
      '@context' : [
        'https://www.w3.org/ns/did/v1',
        'https://w3id.org/security/multikey/v1',
        'https://github.com/dcdpr/did-btc1'
      ],
      'id'             : 'did:btc1:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      'authentication' : [
        '#initialKey'
      ],
      'assertionMethod' : [
        '#initialKey'
      ],
      'capabilityInvocation' : [
        '#initialKey'
      ],
      'capabilityDelegation' : [
        '#initialKey'
      ],
      'verificationMethod' : [
        {
          'id'                 : '#initialKey',
          'type'               : 'Multikey',
          'controller'         : 'did:btc1:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
          'publicKeyMultibase' : 'z4jKc7cqSfqMU9KhGWFxiTdgS8HQ4AicXusEAqjuR93s9TYAs'
        }
      ],
      'service' : [
        {
          'id'              : '#initialP2PKH',
          'type'            : 'SingletonBeacon',
          'serviceEndpoint' : 'bitcoin:1AvjLBYjmGDNd2D1QrJgmfrwf67ftnfzFf'
        },
        {
          'id'              : '#initialP2WPKH',
          'type'            : 'SingletonBeacon',
          'serviceEndpoint' : 'bitcoin:bc1qdn3g8y2fd64k3gq4at2m20ecy7c86xpxjk8pjz'
        },
        {
          'id'              : '#initialP2TR',
          'type'            : 'SingletonBeacon',
          'serviceEndpoint' : 'bitcoin:bc1p0ssudqadt93x5gk2djq3e6dy6jrpxu8tqa3g0p3g3pmudla7hm2s2zhc04'
        }
      ]
    }
  },
  {
    'pubKeyBytes' : [
      2,
      132,
      153,
      251,
      65,
      204,
      80,
      104,
      232,
      138,
      202,
      138,
      240,
      100,
      179,
      39,
      255,
      188,
      253,
      36,
      51,
      183,
      80,
      62,
      25,
      75,
      176,
      43,
      90,
      130,
      118,
      119,
      255
    ],
    'intermediateDocument' : {
      '@context' : [
        'https://www.w3.org/ns/did/v1',
        'https://w3id.org/security/multikey/v1',
        'https://github.com/dcdpr/did-btc1'
      ],
      'id'             : 'did:btc1:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      'authentication' : [
        '#initialKey'
      ],
      'assertionMethod' : [
        '#initialKey'
      ],
      'capabilityInvocation' : [
        '#initialKey'
      ],
      'capabilityDelegation' : [
        '#initialKey'
      ],
      'verificationMethod' : [
        {
          'id'                 : '#initialKey',
          'type'               : 'Multikey',
          'controller'         : 'did:btc1:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
          'publicKeyMultibase' : 'z4jKbxVT4gzqY2bjnyDiGkdxeWwC2YiARMCjJpDCQ2v1fyE6i'
        }
      ],
      'service' : [
        {
          'id'              : '#initialP2PKH',
          'type'            : 'SingletonBeacon',
          'serviceEndpoint' : 'bitcoin:1K9ttKd1fLuNmvYemcUfNkwBWk7BPGgtdm'
        },
        {
          'id'              : '#initialP2WPKH',
          'type'            : 'SingletonBeacon',
          'serviceEndpoint' : 'bitcoin:bc1qcuswwv8d6lgdpk7elvpge779c0u5rr0nsaz8mc'
        },
        {
          'id'              : '#initialP2TR',
          'type'            : 'SingletonBeacon',
          'serviceEndpoint' : 'bitcoin:bc1ptdtup4pqn5llfj4hh5qm76a87jp50ydmhywzanwe6ghk4qz9vqkqsv3fn9'
        }
      ]
    }
  },
  {
    'pubKeyBytes' : [
      3,
      37,
      204,
      123,
      81,
      55,
      75,
      148,
      242,
      225,
      116,
      49,
      77,
      45,
      173,
      214,
      35,
      188,
      153,
      207,
      40,
      128,
      77,
      180,
      247,
      44,
      168,
      85,
      6,
      32,
      183,
      26,
      78
    ],
    'intermediateDocument' : {
      '@context' : [
        'https://www.w3.org/ns/did/v1',
        'https://w3id.org/security/multikey/v1',
        'https://github.com/dcdpr/did-btc1'
      ],
      'id'             : 'did:btc1:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      'authentication' : [
        '#initialKey'
      ],
      'assertionMethod' : [
        '#initialKey'
      ],
      'capabilityInvocation' : [
        '#initialKey'
      ],
      'capabilityDelegation' : [
        '#initialKey'
      ],
      'verificationMethod' : [
        {
          'id'                 : '#initialKey',
          'type'               : 'Multikey',
          'controller'         : 'did:btc1:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
          'publicKeyMultibase' : 'z4jKc9LhNCwNPUXDapfuif2sQzQ79HL6kkjdg2tJAogvov3P3'
        }
      ],
      'service' : [
        {
          'id'              : '#initialP2PKH',
          'type'            : 'SingletonBeacon',
          'serviceEndpoint' : 'bitcoin:1FQowwS7QAQUXnmrMsX6qwQbYBedSy2u4z'
        },
        {
          'id'              : '#initialP2WPKH',
          'type'            : 'SingletonBeacon',
          'serviceEndpoint' : 'bitcoin:bc1qncfgfpge7frugpeq6qdkh9npczcylzuaqq4fs9'
        },
        {
          'id'              : '#initialP2TR',
          'type'            : 'SingletonBeacon',
          'serviceEndpoint' : 'bitcoin:bc1py6xa4haa348ggc49yxn75r6t68q36n3k2cqg24dsxet7hq8m992qy92qce'
        }
      ]
    }
  },
  {
    'pubKeyBytes' : [
      2,
      88,
      156,
      3,
      165,
      209,
      150,
      93,
      198,
      118,
      105,
      115,
      174,
      247,
      88,
      179,
      208,
      166,
      155,
      144,
      116,
      197,
      190,
      142,
      122,
      161,
      162,
      10,
      38,
      178,
      123,
      160,
      142
    ],
    'intermediateDocument' : {
      '@context' : [
        'https://www.w3.org/ns/did/v1',
        'https://w3id.org/security/multikey/v1',
        'https://github.com/dcdpr/did-btc1'
      ],
      'id'             : 'did:btc1:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      'authentication' : [
        '#initialKey'
      ],
      'assertionMethod' : [
        '#initialKey'
      ],
      'capabilityInvocation' : [
        '#initialKey'
      ],
      'capabilityDelegation' : [
        '#initialKey'
      ],
      'verificationMethod' : [
        {
          'id'                 : '#initialKey',
          'type'               : 'Multikey',
          'controller'         : 'did:btc1:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
          'publicKeyMultibase' : 'z4jKbuXivWznqPxnr5UhLRpMw8zFUTUmLH16MY9L7Q86Hn5xZ'
        }
      ],
      'service' : [
        {
          'id'              : '#initialP2PKH',
          'type'            : 'SingletonBeacon',
          'serviceEndpoint' : 'bitcoin:16EsoKNxrWZS2Hq6cUUuQV6rGAf7pFR2xa'
        },
        {
          'id'              : '#initialP2WPKH',
          'type'            : 'SingletonBeacon',
          'serviceEndpoint' : 'bitcoin:bc1q89u8pcxd5mfvzcflda0q9yyx2edegdezem6t3v'
        },
        {
          'id'              : '#initialP2TR',
          'type'            : 'SingletonBeacon',
          'serviceEndpoint' : 'bitcoin:bc1p6rzuzx3sf7u3vj3u6j3jv445cu7vvx376tee0fcxdwrl8vr765qsnscnfu'
        }
      ]
    }
  },
  {
    'pubKeyBytes' : [
      3,
      156,
      56,
      103,
      166,
      235,
      177,
      108,
      241,
      208,
      213,
      177,
      249,
      77,
      212,
      213,
      70,
      216,
      126,
      0,
      15,
      127,
      126,
      255,
      82,
      169,
      103,
      133,
      249,
      217,
      70,
      225,
      21
    ],
    'intermediateDocument' : {
      '@context' : [
        'https://www.w3.org/ns/did/v1',
        'https://w3id.org/security/multikey/v1',
        'https://github.com/dcdpr/did-btc1'
      ],
      'id'             : 'did:btc1:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      'authentication' : [
        '#initialKey'
      ],
      'assertionMethod' : [
        '#initialKey'
      ],
      'capabilityInvocation' : [
        '#initialKey'
      ],
      'capabilityDelegation' : [
        '#initialKey'
      ],
      'verificationMethod' : [
        {
          'id'                 : '#initialKey',
          'type'               : 'Multikey',
          'controller'         : 'did:btc1:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
          'publicKeyMultibase' : 'z4jKcHJxvTp5bYX5dyqu5sqhBBcdXqVuWH33bD4qcT3Tngv9i'
        }
      ],
      'service' : [
        {
          'id'              : '#initialP2PKH',
          'type'            : 'SingletonBeacon',
          'serviceEndpoint' : 'bitcoin:18xZuHHzzwnysdTn9e1XVkeRmeCJbszraJ'
        },
        {
          'id'              : '#initialP2WPKH',
          'type'            : 'SingletonBeacon',
          'serviceEndpoint' : 'bitcoin:bc1q2a9nj8ps9yx8dc9swamq60halyv4rxtt44uw7t'
        },
        {
          'id'              : '#initialP2TR',
          'type'            : 'SingletonBeacon',
          'serviceEndpoint' : 'bitcoin:bc1pslqz4w7fj6la8d2tzuqcuskvays3fhp74l5y5ujh402fk39xk8vq5q9dps'
        }
      ]
    }
  }
];
export const pubKeyBytes = new Uint8Array([
  2, 150, 42, 66, 82, 32, 223, 81, 248,
  241, 168, 33, 138, 205, 18, 178, 216, 7,
  182, 135, 243, 165, 233, 64, 139, 166, 53,
  225, 212, 54, 83, 51, 23
]);
export const intermediateDocument = {
  '@context' : [
    'https://www.w3.org/ns/did/v1',
    'https://w3id.org/security/multikey/v1',
    'https://github.com/dcdpr/did-btc1'
  ],
  'id'             : 'did:btc1:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  'authentication' : [
    '#initialKey'
  ],
  'assertionMethod' : [
    '#initialKey'
  ],
  'capabilityInvocation' : [
    '#initialKey'
  ],
  'capabilityDelegation' : [
    '#initialKey'
  ],
  'verificationMethod' : [
    {
      'id'                 : '#initialKey',
      'type'               : 'Multikey',
      'controller'         : 'did:btc1:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      'publicKeyMultibase' : 'z4jKbyg1bUG6fJwYh4swsUt4YKK2oAd5MJg2tN7je1GtjX2qc'
    }
  ],
  'service' : [
    {
      'id'              : '#initialP2PKH',
      'type'            : 'SingletonBeacon',
      'serviceEndpoint' : 'bitcoin:13Yy4wKBrJbnQWD7ddVW8hhgCm8o6xvp9n'
    },
    {
      'id'              : '#initialP2WPKH',
      'type'            : 'SingletonBeacon',
      'serviceEndpoint' : 'bitcoin:bc1qr0alxy2upt2y5e46zeaayrw04uyzsvrmrkrwa3'
    },
    {
      'id'              : '#initialP2TR',
      'type'            : 'SingletonBeacon',
      'serviceEndpoint' : 'bitcoin:bc1pvq4q6u937m8qx4fv4ldsc5wyykw9784y89p9xvdza28q9r3wlepq54nwvg'
    }
  ]
} as DidBtc1Document;