[**@did-btc1/key-pair v0.4.3**](../README.md)

***

[@did-btc1/key-pair](../globals.md) / PrivateKey

# Class: PrivateKey

Defined in: [private-key.ts:24](https://github.com/jintekc/did-btc1-js/blob/39e4a4200a4ca873ea5b9fda29e99ad64678b8c2/packages/key-pair/src/private-key.ts#L24)

Encapsulates a secp256k1 private key
Provides get methods for different formats (raw, secret, point).
Provides helpers methods for comparison, serialization and publicKey generation.
 PrivateKey

## Implements

- [`IPrivateKey`](../interfaces/IPrivateKey.md)

## Constructors

### Constructor

> **new PrivateKey**(`seed`): `PrivateKey`

Defined in: [private-key.ts:37](https://github.com/jintekc/did-btc1-js/blob/39e4a4200a4ca873ea5b9fda29e99ad64678b8c2/packages/key-pair/src/private-key.ts#L37)

Instantiates an instance of PrivateKey.

#### Parameters

##### seed

`PrivateKeySeed`

bytes (Uint8Array) or secret (bigint)

#### Returns

`PrivateKey`

#### Throws

If seed is not provided, not a valid 32-byte private key or not a valid bigint secret

## Accessors

### bytes

#### Get Signature

> **get** **bytes**(): `Uint8Array`

Defined in: [private-key.ts:77](https://github.com/jintekc/did-btc1-js/blob/39e4a4200a4ca873ea5b9fda29e99ad64678b8c2/packages/key-pair/src/private-key.ts#L77)

Return the private key bytes.

##### See

IPrivateKey.bytes

##### Returns

`Uint8Array`

Get the private key bytes.

#### Implementation of

[`IPrivateKey`](../interfaces/IPrivateKey.md).[`bytes`](../interfaces/IPrivateKey.md#bytes)

***

### hex

#### Get Signature

> **get** **hex**(): `Hex`

Defined in: [private-key.ts:129](https://github.com/jintekc/did-btc1-js/blob/39e4a4200a4ca873ea5b9fda29e99ad64678b8c2/packages/key-pair/src/private-key.ts#L129)

Returns the raw private key as a hex string.

##### See

IPrivateKey.hex

##### Returns

`Hex`

The private key as a hex string

Get the private key as a hex string.

#### Implementation of

[`IPrivateKey`](../interfaces/IPrivateKey.md).[`hex`](../interfaces/IPrivateKey.md#hex)

***

### point

#### Get Signature

> **get** **point**(): `bigint`

Defined in: [private-key.ts:99](https://github.com/jintekc/did-btc1-js/blob/39e4a4200a4ca873ea5b9fda29e99ad64678b8c2/packages/key-pair/src/private-key.ts#L99)

Return the private key point.

##### See

IPrivateKey.point

##### Throws

If the public key is undefined or not compressed

##### Returns

`bigint`

The private key point.

Get the private key point.

#### Implementation of

[`IPrivateKey`](../interfaces/IPrivateKey.md).[`point`](../interfaces/IPrivateKey.md#point)

***

### secret

#### Get Signature

> **get** **secret**(): `bigint`

Defined in: [private-key.ts:87](https://github.com/jintekc/did-btc1-js/blob/39e4a4200a4ca873ea5b9fda29e99ad64678b8c2/packages/key-pair/src/private-key.ts#L87)

Return the private key secret.

##### See

IPrivateKey.secret

##### Returns

`bigint`

Getter returns the private key bytes in secret form.
Setter allows alternative method of using a bigint secret to genereate the private key bytes.

#### Implementation of

[`IPrivateKey`](../interfaces/IPrivateKey.md).[`secret`](../interfaces/IPrivateKey.md#secret)

## Methods

### computePublicKey()

> **computePublicKey**(): [`PublicKey`](PublicKey.md)

Defined in: [private-key.ts:152](https://github.com/jintekc/did-btc1-js/blob/39e4a4200a4ca873ea5b9fda29e99ad64678b8c2/packages/key-pair/src/private-key.ts#L152)

Computes the public key from the private key bytes.

#### Returns

[`PublicKey`](PublicKey.md)

The computed public key

#### See

IPrivateKey.computePublicKey

#### Implementation of

[`IPrivateKey`](../interfaces/IPrivateKey.md).[`computePublicKey`](../interfaces/IPrivateKey.md#computepublickey)

***

### equals()

> **equals**(`other`): `boolean`

Defined in: [private-key.ts:141](https://github.com/jintekc/did-btc1-js/blob/39e4a4200a4ca873ea5b9fda29e99ad64678b8c2/packages/key-pair/src/private-key.ts#L141)

Checks if this private key is equal to another.

#### Parameters

##### other

`PrivateKey`

The other private key

#### Returns

`boolean`

True if the private keys are equal, false otherwise

#### See

IPrivateKey.equals

#### Implementation of

[`IPrivateKey`](../interfaces/IPrivateKey.md).[`equals`](../interfaces/IPrivateKey.md#equals)

***

### isValid()

> **isValid**(): `boolean`

Defined in: [private-key.ts:163](https://github.com/jintekc/did-btc1-js/blob/39e4a4200a4ca873ea5b9fda29e99ad64678b8c2/packages/key-pair/src/private-key.ts#L163)

Checks if the private key is valid.

#### Returns

`boolean`

True if the private key is valid, false otherwise

#### See

IPrivateKey.computePublicKey

#### Implementation of

[`IPrivateKey`](../interfaces/IPrivateKey.md).[`isValid`](../interfaces/IPrivateKey.md#isvalid)

***

### json()

> **json**(): `PrivateKeyJSON`

Defined in: [private-key.ts:171](https://github.com/jintekc/did-btc1-js/blob/39e4a4200a4ca873ea5b9fda29e99ad64678b8c2/packages/key-pair/src/private-key.ts#L171)

Returns the private key as a JSON object.

#### Returns

`PrivateKeyJSON`

#### See

IPrivateKey.json

#### Implementation of

[`IPrivateKey`](../interfaces/IPrivateKey.md).[`json`](../interfaces/IPrivateKey.md#json)
