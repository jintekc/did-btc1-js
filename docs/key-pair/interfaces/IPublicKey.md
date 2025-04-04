[**@did-btc1/key-pair v0.4.5**](../README.md)

***

[@did-btc1/key-pair](../globals.md) / IPublicKey

# Interface: IPublicKey

Defined in: [interface.ts:82](https://github.com/jintekc/did-btc1-js/blob/af332da7c0dbfaa226d4a59473507b446d34322b/packages/key-pair/src/interface.ts#L82)

Interface for the PublicKey class.
 IPublicKey

## Properties

### bytes

> **bytes**: `Bytes`

Defined in: [interface.ts:87](https://github.com/jintekc/did-btc1-js/blob/af332da7c0dbfaa226d4a59473507b446d34322b/packages/key-pair/src/interface.ts#L87)

Compressed public key getter.

***

### hex

> `readonly` **hex**: `Hex`

Defined in: [interface.ts:129](https://github.com/jintekc/did-btc1-js/blob/af332da7c0dbfaa226d4a59473507b446d34322b/packages/key-pair/src/interface.ts#L129)

Public key hex string getter.

***

### multibase

> `readonly` **multibase**: `string`

Defined in: [interface.ts:117](https://github.com/jintekc/did-btc1-js/blob/af332da7c0dbfaa226d4a59473507b446d34322b/packages/key-pair/src/interface.ts#L117)

Public key multibase getter.

#### Returns

The public key as a base58btc multibase string.

***

### parity

> `readonly` **parity**: `number`

Defined in: [interface.ts:99](https://github.com/jintekc/did-btc1-js/blob/af332da7c0dbfaa226d4a59473507b446d34322b/packages/key-pair/src/interface.ts#L99)

Public key parity getter.

***

### prefix

> `readonly` **prefix**: `Bytes`

Defined in: [interface.ts:123](https://github.com/jintekc/did-btc1-js/blob/af332da7c0dbfaa226d4a59473507b446d34322b/packages/key-pair/src/interface.ts#L123)

Public key multibase prefix getter.

***

### uncompressed

> `readonly` **uncompressed**: `Bytes`

Defined in: [interface.ts:93](https://github.com/jintekc/did-btc1-js/blob/af332da7c0dbfaa226d4a59473507b446d34322b/packages/key-pair/src/interface.ts#L93)

Uncompressed public key getter.

***

### x

> `readonly` **x**: `Bytes`

Defined in: [interface.ts:105](https://github.com/jintekc/did-btc1-js/blob/af332da7c0dbfaa226d4a59473507b446d34322b/packages/key-pair/src/interface.ts#L105)

Public key x-coordinate getter.

***

### y

> `readonly` **y**: `Bytes`

Defined in: [interface.ts:111](https://github.com/jintekc/did-btc1-js/blob/af332da7c0dbfaa226d4a59473507b446d34322b/packages/key-pair/src/interface.ts#L111)

Public key y-coordinate getter.

## Methods

### decode()

> **decode**(): `Bytes`

Defined in: [interface.ts:135](https://github.com/jintekc/did-btc1-js/blob/af332da7c0dbfaa226d4a59473507b446d34322b/packages/key-pair/src/interface.ts#L135)

Decode the base58btc multibase string to the compressed public key prefixed with 0x02.

#### Returns

`Bytes`

The public key as a 33-byte compressed public key with header.

***

### encode()

> **encode**(): `string`

Defined in: [interface.ts:141](https://github.com/jintekc/did-btc1-js/blob/af332da7c0dbfaa226d4a59473507b446d34322b/packages/key-pair/src/interface.ts#L141)

Encode the PublicKey as an x-only base58btc multibase public key.

#### Returns

`string`

The public key formatted a base58btc multibase string.

***

### equals()

> **equals**(`other`): `boolean`

Defined in: [interface.ts:148](https://github.com/jintekc/did-btc1-js/blob/af332da7c0dbfaa226d4a59473507b446d34322b/packages/key-pair/src/interface.ts#L148)

Public key equality check. Checks if `this` public key is equal to `other` public key.

#### Parameters

##### other

[`PublicKey`](../classes/PublicKey.md)

The public key to compare.

#### Returns

`boolean`

True if the public keys are equal.

***

### json()

> **json**(): `PublicKeyJSON`

Defined in: [interface.ts:154](https://github.com/jintekc/did-btc1-js/blob/af332da7c0dbfaa226d4a59473507b446d34322b/packages/key-pair/src/interface.ts#L154)

JSON representation of a PublicKey object.

#### Returns

`PublicKeyJSON`

The PublicKey as a JSON object.
