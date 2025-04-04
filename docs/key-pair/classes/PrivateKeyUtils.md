[**@did-btc1/key-pair v0.4.5**](../README.md)

***

[@did-btc1/key-pair](../globals.md) / PrivateKeyUtils

# Class: PrivateKeyUtils

Defined in: [private-key.ts:194](https://github.com/jintekc/did-btc1-js/blob/af332da7c0dbfaa226d4a59473507b446d34322b/packages/key-pair/src/private-key.ts#L194)

Utility class for creating and working with PrivateKey objects.
 PrivateKeyUtils

## Constructors

### Constructor

> **new PrivateKeyUtils**(): `PrivateKeyUtils`

#### Returns

`PrivateKeyUtils`

## Methods

### computePublicKey()

> `static` **computePublicKey**(`privateKeyBytes`): `Bytes`

Defined in: [private-key.ts:277](https://github.com/jintekc/did-btc1-js/blob/af332da7c0dbfaa226d4a59473507b446d34322b/packages/key-pair/src/private-key.ts#L277)

Computes the public key bytes from a private key bytes.

#### Parameters

##### privateKeyBytes

`Bytes`

The private key bytes

#### Returns

`Bytes`

The public key bytes

#### Throws

If the public key is not compressed or not derived

***

### fromSecret()

> `static` **fromSecret**(`secret`): [`PrivateKey`](PrivateKey.md)

Defined in: [private-key.ts:261](https://github.com/jintekc/did-btc1-js/blob/af332da7c0dbfaa226d4a59473507b446d34322b/packages/key-pair/src/private-key.ts#L261)

Create a new PrivateKey object from a bigint secret.

#### Parameters

##### secret

`bigint`

The secret bigint

#### Returns

[`PrivateKey`](PrivateKey.md)

A new PrivateKey object

***

### isValid()

> `static` **isValid**(`bytes`): `boolean`

Defined in: [private-key.ts:251](https://github.com/jintekc/did-btc1-js/blob/af332da7c0dbfaa226d4a59473507b446d34322b/packages/key-pair/src/private-key.ts#L251)

Checks if the private key is valid.

#### Parameters

##### bytes

`Bytes`

The private key bytes

#### Returns

`boolean`

True if the private key is valid, false otherwise

***

### randomBytes()

> `static` **randomBytes**(): `Bytes`

Defined in: [private-key.ts:305](https://github.com/jintekc/did-btc1-js/blob/af332da7c0dbfaa226d4a59473507b446d34322b/packages/key-pair/src/private-key.ts#L305)

Static method to generate random private key bytes.

#### Returns

`Bytes`

Uint8Array of 32 random bytes.

***

### toBytes()

> `static` **toBytes**(`secret`): `Bytes`

Defined in: [private-key.ts:228](https://github.com/jintekc/did-btc1-js/blob/af332da7c0dbfaa226d4a59473507b446d34322b/packages/key-pair/src/private-key.ts#L228)

Convert a private key bytes to a bigint secret.

#### Parameters

##### secret

`bigint`

The private key secret.

#### Returns

`Bytes`

The private key secret as private key bytes.

***

### toKeyPair()

> `static` **toKeyPair**(`bytes`): [`KeyPair`](KeyPair.md)

Defined in: [private-key.ts:201](https://github.com/jintekc/did-btc1-js/blob/af332da7c0dbfaa226d4a59473507b446d34322b/packages/key-pair/src/private-key.ts#L201)

Convert a PrivateKey or PrivateKeyBytes to a KeyPair.

#### Parameters

##### bytes

`Bytes`

#### Returns

[`KeyPair`](KeyPair.md)

The KeyPair object containing the public and private keys

#### Throws

If the private key is not valid

***

### toSecret()

> `static` **toSecret**(`bytes`): `bigint`

Defined in: [private-key.ts:218](https://github.com/jintekc/did-btc1-js/blob/af332da7c0dbfaa226d4a59473507b446d34322b/packages/key-pair/src/private-key.ts#L218)

Convert a bigint secret to private key bytes.

#### Parameters

##### bytes

`Bytes`

The private key bytes

#### Returns

`bigint`

The private key bytes as a bigint secret
