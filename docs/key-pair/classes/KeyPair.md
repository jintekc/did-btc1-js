[**@did-btc1/key-pair v0.4.5**](../README.md)

***

[@did-btc1/key-pair](../globals.md) / KeyPair

# Class: KeyPair

Defined in: [key-pair.ts:17](https://github.com/jintekc/did-btc1-js/blob/af332da7c0dbfaa226d4a59473507b446d34322b/packages/key-pair/src/key-pair.ts#L17)

Encapsulates a PublicKey and a PrivateKey object as a single KeyPair object.
 KeyPair

## Implements

- [`IKeyPair`](../interfaces/IKeyPair.md)

## Constructors

### Constructor

> **new KeyPair**(`privateKey`): `KeyPair`

Defined in: [key-pair.ts:30](https://github.com/jintekc/did-btc1-js/blob/af332da7c0dbfaa226d4a59473507b446d34322b/packages/key-pair/src/key-pair.ts#L30)

Creates an instance of KeyPair. Must provide a at least a private key.
Can optionally provide btoh a private and public key, but must be a valid pair.

#### Parameters

##### privateKey

`KeyPairParams` = `{}`

The private key object

#### Returns

`KeyPair`

## Accessors

### privateKey

#### Get Signature

> **get** **privateKey**(): [`PrivateKey`](PrivateKey.md)

Defined in: [key-pair.ts:71](https://github.com/jintekc/did-btc1-js/blob/af332da7c0dbfaa226d4a59473507b446d34322b/packages/key-pair/src/key-pair.ts#L71)

Set the PrivateKey.

##### See

IKeyPair.privateKey

##### Throws

If the private key is not available

##### Returns

[`PrivateKey`](PrivateKey.md)

The PrivateKey object

#### Throws

If the private key is not available.

#### Implementation of

[`IKeyPair`](../interfaces/IKeyPair.md).[`privateKey`](../interfaces/IKeyPair.md#privatekey)

***

### publicKey

#### Get Signature

> **get** **publicKey**(): [`PublicKey`](PublicKey.md)

Defined in: [key-pair.ts:60](https://github.com/jintekc/did-btc1-js/blob/af332da7c0dbfaa226d4a59473507b446d34322b/packages/key-pair/src/key-pair.ts#L60)

Get the PublicKey.

##### See

IKeyPair.publicKey

##### Returns

[`PublicKey`](PublicKey.md)

The PublicKey object

#### Set Signature

> **set** **publicKey**(`publicKey`): `void`

Defined in: [key-pair.ts:51](https://github.com/jintekc/did-btc1-js/blob/af332da7c0dbfaa226d4a59473507b446d34322b/packages/key-pair/src/key-pair.ts#L51)

Set the PublicKey.

##### See

IKeyPair.publicKey

##### Parameters

###### publicKey

[`PublicKey`](PublicKey.md)

The PublicKey object

##### Returns

`void`

#### Implementation of

[`IKeyPair`](../interfaces/IKeyPair.md).[`publicKey`](../interfaces/IKeyPair.md#publickey)

## Methods

### json()

> **json**(): `KeyPairJSON`

Defined in: [key-pair.ts:85](https://github.com/jintekc/did-btc1-js/blob/af332da7c0dbfaa226d4a59473507b446d34322b/packages/key-pair/src/key-pair.ts#L85)

JSON representation of a KeyPair.

#### Returns

`KeyPairJSON`

The KeyPair as a JSON object

#### See

IKeyPair.json

#### Implementation of

[`IKeyPair`](../interfaces/IKeyPair.md).[`json`](../interfaces/IKeyPair.md#json)
