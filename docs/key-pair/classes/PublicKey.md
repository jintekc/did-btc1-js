[**@did-btc1/key-pair v0.4.5**](../README.md)

***

[@did-btc1/key-pair](../globals.md) / PublicKey

# Class: PublicKey

Defined in: [public-key.ts:26](https://github.com/jintekc/did-btc1-js/blob/af332da7c0dbfaa226d4a59473507b446d34322b/packages/key-pair/src/public-key.ts#L26)

Encapsulates a secp256k1 public key.
Provides get methods for different formats (compressed, x-only, multibase).
Provides helpers methods for comparison and serialization.
 PublicKey

## Implements

- [`IPublicKey`](../interfaces/IPublicKey.md)

## Constructors

### Constructor

> **new PublicKey**(`bytes`): `PublicKey`

Defined in: [public-key.ts:36](https://github.com/jintekc/did-btc1-js/blob/af332da7c0dbfaa226d4a59473507b446d34322b/packages/key-pair/src/public-key.ts#L36)

Creates an instance of PublicKey.

#### Parameters

##### bytes

`Bytes`

The public key byte array.

#### Returns

`PublicKey`

#### Throws

if the byte length is not 32 (x-only) or 33 (compressed)

## Accessors

### bytes

#### Get Signature

> **get** **bytes**(): `Uint8Array`

Defined in: [public-key.ts:56](https://github.com/jintekc/did-btc1-js/blob/af332da7c0dbfaa226d4a59473507b446d34322b/packages/key-pair/src/public-key.ts#L56)

Get the public key bytes.

##### See

IPublicKey.bytes

##### Returns

`Uint8Array`

The public key bytes

Compressed public key getter.

#### Implementation of

[`IPublicKey`](../interfaces/IPublicKey.md).[`bytes`](../interfaces/IPublicKey.md#bytes)

***

### hex

#### Get Signature

> **get** **hex**(): `Hex`

Defined in: [public-key.ts:174](https://github.com/jintekc/did-btc1-js/blob/af332da7c0dbfaa226d4a59473507b446d34322b/packages/key-pair/src/public-key.ts#L174)

Returns the raw public key as a hex string.

##### See

IPublicKey.hex

##### Returns

`Hex`

The public key as a hex string.

Public key hex string getter.

#### Implementation of

[`IPublicKey`](../interfaces/IPublicKey.md).[`hex`](../interfaces/IPublicKey.md#hex)

***

### multibase

#### Get Signature

> **get** **multibase**(): `string`

Defined in: [public-key.ts:106](https://github.com/jintekc/did-btc1-js/blob/af332da7c0dbfaa226d4a59473507b446d34322b/packages/key-pair/src/public-key.ts#L106)

Get the multibase public key.

##### See

IPublicKey.multibase

##### Returns

`string`

The public key in base58btc x-only multibase format.

Public key multibase getter.

#### Implementation of

[`IPublicKey`](../interfaces/IPublicKey.md).[`multibase`](../interfaces/IPublicKey.md#multibase)

***

### parity

#### Get Signature

> **get** **parity**(): `number`

Defined in: [public-key.ts:76](https://github.com/jintekc/did-btc1-js/blob/af332da7c0dbfaa226d4a59473507b446d34322b/packages/key-pair/src/public-key.ts#L76)

Get the parity byte of the public key.

##### See

IPublicKey.parity

##### Returns

`number`

The parity byte of the public key.

Public key parity getter.

#### Implementation of

[`IPublicKey`](../interfaces/IPublicKey.md).[`parity`](../interfaces/IPublicKey.md#parity)

***

### prefix

#### Get Signature

> **get** **prefix**(): `Bytes`

Defined in: [public-key.ts:115](https://github.com/jintekc/did-btc1-js/blob/af332da7c0dbfaa226d4a59473507b446d34322b/packages/key-pair/src/public-key.ts#L115)

Get the public key prefix bytes.

##### See

IPublicKey.prefix

##### Returns

`Bytes`

The 2-byte prefix of the public key.

Public key multibase prefix getter.

#### Implementation of

[`IPublicKey`](../interfaces/IPublicKey.md).[`prefix`](../interfaces/IPublicKey.md#prefix)

***

### uncompressed

#### Get Signature

> **get** **uncompressed**(): `Bytes`

Defined in: [public-key.ts:66](https://github.com/jintekc/did-btc1-js/blob/af332da7c0dbfaa226d4a59473507b446d34322b/packages/key-pair/src/public-key.ts#L66)

Get the uncompressed public key.

##### See

IPublicKey.uncompressed

##### Returns

`Bytes`

The 65-byte uncompressed public key (0x04, x, y).

Uncompressed public key getter.

#### Implementation of

[`IPublicKey`](../interfaces/IPublicKey.md).[`uncompressed`](../interfaces/IPublicKey.md#uncompressed)

***

### x

#### Get Signature

> **get** **x**(): `Bytes`

Defined in: [public-key.ts:86](https://github.com/jintekc/did-btc1-js/blob/af332da7c0dbfaa226d4a59473507b446d34322b/packages/key-pair/src/public-key.ts#L86)

Get the x-coordinate of the public key.

##### See

IPublicKey.x

##### Returns

`Bytes`

The 32-byte x-coordinate of the public key.

Public key x-coordinate getter.

#### Implementation of

[`IPublicKey`](../interfaces/IPublicKey.md).[`x`](../interfaces/IPublicKey.md#x)

***

### y

#### Get Signature

> **get** **y**(): `Bytes`

Defined in: [public-key.ts:96](https://github.com/jintekc/did-btc1-js/blob/af332da7c0dbfaa226d4a59473507b446d34322b/packages/key-pair/src/public-key.ts#L96)

Get the y-coordinate of the public key.

##### See

IPublicKey.y

##### Returns

`Bytes`

The 32-byte y-coordinate of the public key.

Public key y-coordinate getter.

#### Implementation of

[`IPublicKey`](../interfaces/IPublicKey.md).[`y`](../interfaces/IPublicKey.md#y)

## Methods

### decode()

> **decode**(): `Bytes`

Defined in: [public-key.ts:125](https://github.com/jintekc/did-btc1-js/blob/af332da7c0dbfaa226d4a59473507b446d34322b/packages/key-pair/src/public-key.ts#L125)

Decodes the multibase string to the 34-byte corresponding public key (2 byte prefix + 32 byte public key).

#### Returns

`Bytes`

The decoded public key: prefix and public key bytes

#### Implementation of

[`IPublicKey`](../interfaces/IPublicKey.md).[`decode`](../interfaces/IPublicKey.md#decode)

***

### encode()

> **encode**(): `string`

Defined in: [public-key.ts:153](https://github.com/jintekc/did-btc1-js/blob/af332da7c0dbfaa226d4a59473507b446d34322b/packages/key-pair/src/public-key.ts#L153)

Encodes compressed secp256k1 public key from bytes to BIP340 base58btc multibase format

#### Returns

`string`

The public key encoded in base-58-btc multibase format

#### Implementation of

[`IPublicKey`](../interfaces/IPublicKey.md).[`encode`](../interfaces/IPublicKey.md#encode)

***

### equals()

> **equals**(`other`): `boolean`

Defined in: [public-key.ts:185](https://github.com/jintekc/did-btc1-js/blob/af332da7c0dbfaa226d4a59473507b446d34322b/packages/key-pair/src/public-key.ts#L185)

Compares this public key to another public key.

#### Parameters

##### other

`PublicKey`

The other public key to compare

#### Returns

`boolean`

True if the public keys are equal, false otherwise.

#### See

IPublicKey.equals

#### Implementation of

[`IPublicKey`](../interfaces/IPublicKey.md).[`equals`](../interfaces/IPublicKey.md#equals)

***

### json()

> **json**(): `PublicKeyJSON`

Defined in: [public-key.ts:194](https://github.com/jintekc/did-btc1-js/blob/af332da7c0dbfaa226d4a59473507b446d34322b/packages/key-pair/src/public-key.ts#L194)

Public key JSON representation.

#### Returns

`PublicKeyJSON`

The public key as a JSON object.

#### See

IPublicKey.json

#### Implementation of

[`IPublicKey`](../interfaces/IPublicKey.md).[`json`](../interfaces/IPublicKey.md#json)
