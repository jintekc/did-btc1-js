[**@did-btc1/key-pair v0.4.5**](../README.md)

***

[@did-btc1/key-pair](../globals.md) / IPrivateKey

# Interface: IPrivateKey

Defined in: [interface.ts:20](https://github.com/jintekc/did-btc1-js/blob/af332da7c0dbfaa226d4a59473507b446d34322b/packages/key-pair/src/interface.ts#L20)

Interface for the PrivateKey class.
 IPrivateKey

## Properties

### bytes

> `readonly` **bytes**: `Bytes`

Defined in: [interface.ts:25](https://github.com/jintekc/did-btc1-js/blob/af332da7c0dbfaa226d4a59473507b446d34322b/packages/key-pair/src/interface.ts#L25)

Get the private key bytes.

***

### hex

> `readonly` **hex**: `Hex`

Defined in: [interface.ts:44](https://github.com/jintekc/did-btc1-js/blob/af332da7c0dbfaa226d4a59473507b446d34322b/packages/key-pair/src/interface.ts#L44)

Get the private key as a hex string.

***

### point

> `readonly` **point**: `bigint`

Defined in: [interface.ts:38](https://github.com/jintekc/did-btc1-js/blob/af332da7c0dbfaa226d4a59473507b446d34322b/packages/key-pair/src/interface.ts#L38)

Get the private key point.

***

### secret

> **secret**: `bigint`

Defined in: [interface.ts:32](https://github.com/jintekc/did-btc1-js/blob/af332da7c0dbfaa226d4a59473507b446d34322b/packages/key-pair/src/interface.ts#L32)

Getter returns the private key bytes in secret form.
Setter allows alternative method of using a bigint secret to genereate the private key bytes.

## Methods

### computePublicKey()

> **computePublicKey**(): [`PublicKey`](../classes/PublicKey.md)

Defined in: [interface.ts:59](https://github.com/jintekc/did-btc1-js/blob/af332da7c0dbfaa226d4a59473507b446d34322b/packages/key-pair/src/interface.ts#L59)

Uses the private key to compute the corresponding public key.

#### Returns

[`PublicKey`](../classes/PublicKey.md)

A new PublicKey object.

#### See

PrivateKeyUtils.computePublicKey

***

### equals()

> **equals**(`other`): `boolean`

Defined in: [interface.ts:51](https://github.com/jintekc/did-btc1-js/blob/af332da7c0dbfaa226d4a59473507b446d34322b/packages/key-pair/src/interface.ts#L51)

Checks if this private key is equal to another private key.

#### Parameters

##### other

[`PrivateKey`](../classes/PrivateKey.md)

#### Returns

`boolean`

True if the private keys are equal.

***

### isValid()

> **isValid**(): `boolean`

Defined in: [interface.ts:66](https://github.com/jintekc/did-btc1-js/blob/af332da7c0dbfaa226d4a59473507b446d34322b/packages/key-pair/src/interface.ts#L66)

Checks if the private key is valid.

#### Returns

`boolean`

Whether the private key is valid.

***

### json()

> **json**(): `PrivateKeyJSON`

Defined in: [interface.ts:73](https://github.com/jintekc/did-btc1-js/blob/af332da7c0dbfaa226d4a59473507b446d34322b/packages/key-pair/src/interface.ts#L73)

JSON representation of a PrivateKey object.

#### Returns

`PrivateKeyJSON`

The PrivateKey as a JSON object.
