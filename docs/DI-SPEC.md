# Data Integrity Schnorr secp256k1 Cryptosuites v0.1

View the latest published specifciation [data-integrity-schnorr-secp256k1](https://dcdpr.github.io/data-integrity-schnorr-secp256k1/)

**_Abstract_**

This specification describes Data Integrity cryptographic suites for use when
creating or verifying a digital signature using the secp256k1 instantiation
of the Schnorr Signature Algorithm as defined in [BIP340].

---

<!--
Status of This Document (commented out in source):
The Working Group is actively seeking implementation feedback...
-->

## Introduction

This specification defines a cryptographic suite for the purpose of creating,
verifying proofs for Schnorr signatures over secp256k1 in conformance with the
Data Integrity [VC-DATA-INTEGRITY] specification.

<!--
The approach is accepted by the U.S. National Institute of Standards...
-->

The suites described in this specification use the RDF Dataset Canonicalization
Algorithm [RDF-CANON] or the JSON Canonicalization Scheme [RFC8785] to
transform an input document into its canonical form. The canonical
representation is then hashed and signed with a detached signature algorithm.

### Terminology

Terminology used throughout this document is defined in the
[Terminology](https://www.w3.org/TR/vc-data-integrity/#terminology)
section of the [VC-DATA-INTEGRITY] specification.

### Conformance

A **conforming proof** is any concrete expression of the data model
that complies with the normative statements in this specification. Specifically,
all relevant normative statements in Sections
[Data Model](#data-model) and [Algorithms](#algorithms)
of this document MUST be enforced.

A **conforming processor** is any algorithm realized
as software and/or hardware that generates or consumes a
_conforming proof_. Conforming processors MUST produce errors when
non-conforming documents are consumed.

This document contains examples of JSON and JSON-LD data. Some of these examples
are invalid JSON, as they include features such as inline comments (`//`)
explaining certain portions and ellipses (`...`) indicating the omission of
information that is irrelevant to the example. These parts would have to be
removed in order to treat the examples as valid JSON or JSON-LD.

---

## Data Model

The following sections outline the data model that is used by this specification
to express verification methods, such as cryptographic public keys, and
data integrity proofs, such as digital signatures.

### Verification Methods

This cryptographic suite is used to verify Data Integrity Proofs
([VC-DATA-INTEGRITY]) produced using secp256k1 cryptographic key material.
The encoding formats for those key types are provided in this section. Lossless
cryptographic key transformation processes that result in equivalent
cryptographic key material MAY be used for the processing of digital
signatures.

#### Multikey

The [Multikey format](https://www.ietf.org/archive/id/draft-multiformats-cid-06.html#name-multikey),
defined in [CID], is used to express public keys for the cryptographic
suites defined in this specification.

The `publicKeyMultibase` value of the verification method MUST be a base-58-btc
Multibase encoding of a Multikey-encoded secp256k1 x-only public key.
The Multikey encoding of a secp256k1 x-only 256-bit public key MUST start
with the two-byte prefix `0xe14a` followed by the
32-byte x-only public key data. The resulting 34-byte value MUST then be encoded
using the base-58-btc alphabet, according to the [Multibase section](https://datatracker.ietf.org/doc/html/draft-multiformats-multibase-01),
and then prepended with the base-58-btc Multibase header (`z`).
Any other encoding MUST NOT be allowed.

Developers are advised to not accidentally publish a representation of a private
key. Implementations of this specification will raise errors if they encounter a
Multikey prefix value other than `0xe14a` in a `publicKeyMultibase` value.

[Example 1](https://dcdpr.github.io/data-integrity-schnorr-secp256k1/#example-an-secp256k1-xonly-public-key-encoded-as-a-multikey): An secp256k1 xonly public key encoded as a Multikey

```json
{
  "id": "https://example.com/issuer/123#key-0",
  "type": "Multikey",
  "controller": "https://example.com/issuer/123",
  "publicKeyMultibase": "z66PwJnYvwJLhGrVc8vcuUkKs99sKCzYRM2HQ2gDCGTAStHk"
}
```

[Example 2](https://dcdpr.github.io/data-integrity-schnorr-secp256k1/#example-an-secp256k1-xonly-public-key-encoded-as-a-multikey-in-a-did-document): An secp256k1 xonly public key encoded as a Multikey in a DID document

```json
{
  "id": "did:example:123",
  "@context": [
    "https://www.w3.org/ns/did/v1",
    "https://w3id.org/security/multikey/v1"
  ],
  "verificationMethod": [
    {
      "id": "did:example:123#initialKey",
      "type": "Multikey",
      "controller": "did:example:123",
      "publicKeyMultibase": "z66PwJnYvwJLhGrVc8vcuUkKs99sKCzYRM2HQ2gDCGTAStHk"
    }
  ],
  "authentication": [
    "did:example:123#initialKey"
  ],
  "assertionMethod": [
    "did:example:123#initialKey"
  ],
  "capabilityInvocation": [
    "did:example:123#initialKey"
  ],
  "capabilityDelegation": [
    "did:example:123#initialKey"
  ]
}
```

<!--
TODO: Do we want to define a secretKeyMultibase value for secp256k1 keys?
-->

Developers are advised to prevent accidental publication of a representation of
a secret key, and to not export the `secretKeyMultibase` property by default
when serializing key pairs to Multikey.

### Proof Representations

This section details the proof representation formats that are defined by
this specification.

#### DataIntegrityProof

A proof contains the attributes specified in the
[Proofs section](https://www.w3.org/TR/vc-data-integrity/#proofs)
of [VC-DATA-INTEGRITY] with the following restrictions.

- The `type` property MUST be `DataIntegrityProof`.
- The `cryptosuite` property of the proof MUST be
  `schnorr-secp256k1-jcs-2025` or `schnorr-secp256k1-rdfc-2025`.
- The `proofValue` property of the proof MUST be a detached Schnorr signature
  produced according to [BIP340], encoded using the base-64-url header and
  alphabet as described in the [Multibase section](https://w3c.github.io/vc-data-integrity/)
  of the controller document spec.

```json
{
  "@context": [
    {"myWebsite": "https://vocabulary.example/myWebsite"},
    "https://www.w3.org/ns/credentials/v2"
  ],
  "myWebsite": "https://hello.world.example/",
  "proof": {
    "type": "DataIntegrityProof",
    "cryptosuite": "schnorr-secp256k1-jcs-2024",
    "verificationMethod": "did:btc1:k1q2ddta4gt5n7u6d3xwhdyua57t6awrk55ut82qvurfm0qnrxx5nw7vnsy65#initialKey",
    "proofPurpose": "assertionMethod",
    "proofValue": "zsxM9je5iKynKyN6rRPi9QjTWpG6inJ1umwGfnCo4fiu4MqYf46PLd4TE2wVZvdZegDuC6xL6n3Kj8S1PbC8tmTm"
  }
}
```

> TODO: Make example a valid proof. Currently it is a real proof, but not over that content

---

## Algorithms

The following section describes multiple Data Integrity cryptographic suites
that use the Schnorr Signature for secp256k1 Algorithm [BIP340].

### Instantiate Cryptosuite

This algorithm is used to configure a cryptographic suite to be used by the
[Add Proof](https://www.w3.org/TR/vc-data-integrity/#add-proof) and
[Verify Proof](https://www.w3.org/TR/vc-data-integrity/#verify-proof)
functions in [VC-DATA-INTEGRITY]. The algorithm takes an options object
(`options`) as input and returns a cryptosuite instance (`cryptosuite`).

1. Initialize `cryptosuite` to an empty struct.
2. If `options.type` does not equal `DataIntegrityProof`, return `cryptosuite`.
3. If `options.cryptosuite` is `schnorr-secp256k1-rdfc-2025`:
   1. Set `cryptosuite.createProof` to the algorithm in
      [Create Proof (schnorr-secp256k1-rdfc-2025)](#create-proof-schnorr-secp256k1-rdfc-2025).
   2. Set `cryptosuite.verifyProof` to the algorithm in
      [Verify Proof (schnorr-secp256k1-rdfc-2025)](#verify-proof-schnorr-secp256k1-rdfc-2025).
4. If `options.cryptosuite` is `schnorr-secp256k1-jcs-2025`:
   1. Set `cryptosuite.createProof` to the algorithm in
      [Create Proof (schnorr-secp256k1-jcs-2025)](#create-proof-schnorr-secp256k1-jcs-2025).
   2. Set `cryptosuite.verifyProof` to the algorithm in
      [Verify Proof (schnorr-secp256k1-jcs-2025)](#verify-proof-schnorr-secp256k1-jcs-2025).
5. Return `cryptosuite`.

---

### schnorr-secp256k1-rdfc-2025

The `schnorr-secp256k1-rdfc-2025` cryptographic suite takes an input document, canonicalizes
the document using the RDF Dataset Canonicalization algorithm [RDF-CANON], and then
cryptographically hashes and signs the output, resulting in the production of a data
integrity proof. The algorithms in this section also include the verification of
such a data integrity proof.

> **Note:** When the RDF Dataset Canonicalization Algorithm [RDF-CANON] is used,
> implementations will detect [dataset poisoning](https://www.w3.org/TR/rdf-canon/#dataset-poisoning)
> by default, and abort processing upon such detection.

#### Create Proof (schnorr-secp256k1-rdfc-2025)

The following algorithm specifies how to create a data integrity proof given
an unsecured data document (`unsecuredDocument`) and proof options (`options`).  

Output: a data integrity proof (map) or an error.

1. Let `proof` be a clone of `options`.
2. Let `proofConfig` be the result of running [Proof Configuration (schnorr-secp256k1-rdfc-2025)](#proof-configuration-schnorr-secp256k1-rdfc-2025)
   with `options`.
3. Let `transformedData` be the result of running the [Transformation (schnorr-secp256k1-rdfc-2025)](#transformation-schnorr-secp256k1-rdfc-2025)
   with `unsecuredDocument`, `proofConfig`, and `options`.
4. Let `hashData` be the result of running [Hashing (schnorr-secp256k1-rdfc-2025)](#hashing-schnorr-secp256k1-rdfc-2025)
   with `transformedData` and `proofConfig`.
5. Let `proofBytes` be the result of running [Proof Serialization (schnorr-secp256k1-rdfc-2025)](#proof-serialization-schnorr-secp256k1-rdfc-2025)
   with `hashData` and `options`.
6. Let `proof.proofValue` be a base58-btc-encoded Multibase value of `proofBytes`.
7. Return `proof`.

#### Verify Proof (schnorr-secp256k1-rdfc-2025)

The following algorithm specifies how to verify a data integrity proof given
a secured data document (`securedDocument`).  

Output: a verification result:  

- `verified`: `true` or `false`  
- `verifiedDocument`: if `verified` is `false`, `null`; otherwise, an unsecured data document.

1. Let `unsecuredDocument` be a copy of `securedDocument` with the `proof` value removed.
2. Let `proofOptions` be a copy of `securedDocument.proof` with `proofValue` removed.
3. Let `proofBytes` be the Multibase-decoded base58-btc value in `securedDocument.proof.proofValue`.
4. Let `transformedData` be the result of running [Transformation (schnorr-secp256k1-rdfc-2025)](#transformation-schnorr-secp256k1-rdfc-2025)
   with `unsecuredDocument` and `proofOptions`.
5. Let `proofConfig` be the result of running [Proof Configuration (schnorr-secp256k1-rdfc-2025)](#proof-configuration-schnorr-secp256k1-rdfc-2025)
   with `unsecuredDocument` and `proofOptions`.
6. Let `hashData` be the result of running [Hashing (schnorr-secp256k1-rdfc-2025)](#hashing-schnorr-secp256k1-rdfc-2025)
   with `transformedData` and `proofConfig`.
7. Let `verified:boolean` be the result of running [Proof Verification (schnorr-secp256k1-rdfc-2025)](#proof-verification-schnorr-secp256k1-rdfc-2025)
   on `hashData`, `proofBytes`, and `proofConfig`.
8. Return a verification result:
   - `verified`: `verified`
   - `verifiedDocument`: if `verified` is `true`, `unsecuredDocument`; otherwise, `null`.

#### Transformation (schnorr-secp256k1-rdfc-2025)

Specifies how to transform an unsecured input document into a transformed document
for input to the hashing algorithm.

Required inputs:  

- `unsecuredDocument`  
- `options` (must contain `type` = `DataIntegrityProof` and `cryptosuite` = `schnorr-secp256k1-rdfc-2025`)

Output: a _transformed data document_.

1. If `options.type` is not `DataIntegrityProof` and `options.cryptosuite` is not
   `schnorr-secp256k1-rdfc-2025`, raise an error (PROOF_TRANSFORMATION_ERROR).
2. Let `canonicalDocument` be the result of:
   - converting `unsecuredDocument` to RDF statements,
   - applying the RDF Dataset Canonicalization Algorithm [RDF-CANON], and
   - serializing the result to a serialized canonical form.
3. Return `canonicalDocument`.

#### Hashing (schnorr-secp256k1-rdfc-2025)

Specifies how to cryptographically hash a transformed data document and
proof configuration into cryptographic hash data.

Required inputs:  

- `transformedDocument`  
- `canonicalProofConfig`  

Output: _hash data_ (byte array).

1. Let `bytesToHash` be the result of concatenating the `canonicalProofConfig` with the `transformedDocument`.
2. Let `hashData` be the result of applying SHA-256 (RFC6234) to `bytesToHash`. This will be 32 bytes.
3. Return `hashData`.

#### Proof Configuration (schnorr-secp256k1-rdfc-2025)

Specifies how to generate a proof configuration from proof options.

Required inputs:  

- `unsecuredDocument`  
- `options` (must contain `type` = `DataIntegrityProof` and `cryptosuite` = `schnorr-secp256k1-rdfc-2025`)

Output: _proof configuration_.

1. Let `proofConfig` be a clone of `options`.
2. If `proofConfig.type` is not `DataIntegrityProof` or `proofConfig.cryptosuite`
   is not `schnorr-secp256k1-rdfc-2025`, raise an error (PROOF_GENERATION_ERROR).
3. If `proofConfig.created` is present and not a valid XMLSCHEMA11-2 datetime,
   raise an error (PROOF_GENERATION_ERROR).
4. Set `proofConfig.@context` to `unsecuredDocument.@context`.
5. Let `canonicalProofConfig` be the result of applying the RDF Dataset
   Canonicalization Algorithm to `proofConfig`.
6. Return `canonicalProofConfig`.

#### Proof Serialization (schnorr-secp256k1-rdfc-2025)

Specifies how to serialize a digital signature from cryptographic hash data.

Required inputs:  

- `hashData`  
- `options` (must contain a `verificationMethod` referencing private key bytes)

Output: _digital proof_ (byte array).

1. Let `privateKeyBytes` be the result of retrieving the private key bytes (or a signing interface) associated with `options.verificationMethod`.
2. Let `proofBytes` be the result of applying the secp256k1 Schnorr Digital
   Signature Algorithm [BIP340] to `hashData` using the private key. This will be 64 bytes.
3. Return `proofBytes`.

#### Proof Verification (schnorr-secp256k1-rdfc-2025)

Specifies how to verify a digital signature from cryptographic hash data.

Required inputs:  

- `hashData`  
- `proofBytes`  
- `options`

Output: a boolean `verificationResult`.

1. Let `publicKeyBytes` be the result of retrieving the public key bytes associated
   with `options.verificationMethod`.
2. Let `verificationResult` be the result of applying the Schnorr Signatures for
   secp256k1 Algorithm [BIP340] to verify `hashData` against `proofBytes` using `publicKeyBytes`.
3. Return `verificationResult`.

---

### schnorr-secp256k1-jcs-2025

The `schnorr-secp256k1-jcs-2025` cryptographic suite takes an input document, canonicalizes
the document using the JSON Canonicalization Scheme [RFC8785], and then
cryptographically hashes and signs the output, resulting in the production of a
data integrity proof.

#### Create Proof (schnorr-secp256k1-jcs-2025)

Specifies how to create a data integrity proof given an unsecured data document
and proof options.

1. Let `proof` be a clone of the proof options (`options`).
2. If `unsecuredDocument.@context` is present, set `proof.@context` to `unsecuredDocument.@context`.
3. Let `proofConfig` be the result of running [Proof Configuration (schnorr-secp256k1-jcs-2025)](#proof-configuration-schnorr-secp256k1-jcs-2025)
   with `proof`.
4. Let `transformedData` be the result of running [Transformation (schnorr-secp256k1-jcs-2025)](#transformation-schnorr-secp256k1-jcs-2025)
   with `unsecuredDocument` and `options`.
5. Let `hashData` be the result of running [Hashing (schnorr-secp256k1-jcs-2025)](#hashing-schnorr-secp256k1-jcs-2025)
   with `transformedData` and `proofConfig`.
6. Let `proofBytes` be the result of running [Proof Serialization (schnorr-secp256k1-jcs-2025)](#proof-serialization-schnorr-secp256k1-jcs-2025)
   with `hashData` and `options`.
7. Let `proof.proofValue` be a base58-btc-encoded Multibase value of `proofBytes`.
8. Return `proof`.

#### Verify Proof (schnorr-secp256k1-jcs-2025)

Specifies how to verify a data integrity proof given a secured data document.

Output: a verification result:

- `verified`: boolean
- `verifiedDocument`: either the unsecured document or `null`

1. Let `unsecuredDocument` be a copy of `securedDocument` with `proof` removed.
2. Let `proofOptions` be a copy of `securedDocument.proof` with `proofValue` removed.
3. Let `proofBytes` be the Multibase-decoded base58-btc value in `securedDocument.proof.proofValue`.
4. If `proofOptions.@context` exists:
   1. Check that `securedDocument.@context` starts with all values
      in `proofOptions.@context` in the same order. Otherwise, set `verified = false` and go to the last step.
   2. Set `unsecuredDocument.@context` to `proofOptions.@context`.
5. Let `transformedData` be the result of [Transformation (schnorr-secp256k1-jcs-2025)](#transformation-schnorr-secp256k1-jcs-2025)
   with `unsecuredDocument` and `proofOptions`.
6. Let `proofConfig` be the result of [Proof Configuration (schnorr-secp256k1-jcs-2025)](#proof-configuration-schnorr-secp256k1-jcs-2025)
   with `proofOptions`.
7. Let `hashData` be the result of [Hashing (schnorr-secp256k1-jcs-2025)](#hashing-schnorr-secp256k1-jcs-2025)
   with `transformedData` and `proofConfig`.
8. Let `verified` be the result of [Proof Verification (schnorr-secp256k1-jcs-2025)](#proof-verification-schnorr-secp256k1-jcs-2025)
   on `hashData`, `proofBytes`, and `proofConfig`.
9. Return a verification result:
   - `verified = verified`
   - `verifiedDocument = unsecuredDocument` if verified, otherwise `null`.

#### Transformation (schnorr-secp256k1-jcs-2025)

Specifies how to transform an unsecured input document into a transformed document
for hashing.

1. If `options.type` is not `DataIntegrityProof` or `options.cryptosuite` is not
   `schnorr-secp256k1-jcs-2025`, raise an error (PROOF_VERIFICATION_ERROR).
2. Let `canonicalDocument` be the result of applying JSON Canonicalization Scheme
   [RFC8785] to a JSON serialization of `unsecuredDocument`.
3. Return `canonicalDocument`.

#### Hashing (schnorr-secp256k1-jcs-2025)

Specifies how to cryptographically hash a transformed document and proof configuration.

1. Let `bytesToHash` be the result of concatenating the `canonicalProofConfig` with the `transformedDocument`.
2. Let `hashData` be the result of applying SHA-256 to `bytesToHash`. The result is 32 bytes.
3. Return `hashData`.

#### Proof Configuration (schnorr-secp256k1-jcs-2025)

Specifies how to generate a proof configuration from proof options.

1. Let `proofConfig` be a clone of `options`.
2. If `proofConfig.type` is not `DataIntegrityProof` or
   `proofConfig.cryptosuite` is not `schnorr-secp256k1-jcs-2025`,
   raise an error (PROOF_GENERATION_ERROR).
3. If `proofConfig.created` is set and is not a valid XMLSCHEMA11-2 datetime,
   raise an error (PROOF_GENERATION_ERROR).
4. Let `canonicalProofConfig` be the result of applying JSON Canonicalization
   Scheme [RFC8785] to `proofConfig`.
5. Return `canonicalProofConfig`.

#### Proof Serialization (schnorr-secp256k1-jcs-2025)

Specifies how to serialize a digital signature from cryptographic hash data.

1. Let `privateKeyBytes` be retrieved from `options.verificationMethod`.
2. Let `proofBytes` be the result of applying the Schnorr secp256k1 signature algorithm
   [BIP340] to `hashData` using `privateKeyBytes`. The result is 64 bytes.
3. Return `proofBytes`.

#### Proof Verification (schnorr-secp256k1-jcs-2025)

Specifies how to verify a digital signature from cryptographic hash data.

1. Let `publicKeyBytes` be retrieved from `options.verificationMethod`.
2. Let `verificationResult` be the result of applying the Schnorr secp256k1
   verification algorithm [BIP340] with `hashData`, `proofBytes`, and `publicKeyBytes`.
3. Return `verificationResult`.

---

## Security Considerations

> Before reading this section, readers are urged to familiarize themselves
> with general security advice provided in the
> [Security Considerations section of the Data Integrity specification](https://www.w3.org/TR/vc-data-integrity/#security-considerations).

The following section describes security considerations that developers
implementing this specification should be aware of in order to create secure
software.

### TODO: Security Properties of BIP340 Schnorr Secp256k1 Implementations

<!--
(Ed25519 notes commented out in the HTML)
-->

---

## Privacy Considerations

> Before reading this section, readers are urged to familiarize themselves
> with general privacy advice provided in the
> [Privacy Considerations section of the Data Integrity specification](https://www.w3.org/TR/vc-data-integrity/#privacy-considerations).

The following section describes privacy considerations that developers
implementing this specification should be aware of in order to avoid violating
privacy assumptions.

### Selective and Unlinkable Disclosure

The cryptographic suites described in this specification do not support
_selective disclosure_ or _unlinkable disclosure_. If
_selective disclosure_ is a desired feature, readers might find the
[VC-DI-ECDSA] specification useful. If _unlinkable disclosure_ is of
interest, the [VC-DI-BBS] specification provides an unlinkable digital
signature mechanism.

---

<!--
Appendix (commented out in source)
-->

## Test Vectors

### TODO: Representation: schnorr-secp256k1-rdfc-2025

_(Section content commented out in the original HTML.)_

### TODO: Representation: schnorr-secp256k1-jcs-2025

_(Section content commented out in the original HTML.)_

---

## Revision History

_(No changes documented yet in the original text beyond placeholders.)_

---

## Acknowledgements

_(This section was commented out in the HTML. Place acknowledgements here if needed.)_

---

## References

- **[BIP340]**: _Schnorr Signatures for secp256k1_  
  [https://github.com/bitcoin/bips/blob/master/bip-0340.mediawiki](https://github.com/bitcoin/bips/blob/master/bip-0340.mediawiki)

- **[RDF-CANON]**: _RDF Dataset Canonicalization_  
  [https://www.w3.org/TR/rdf-canon/](https://www.w3.org/TR/rdf-canon/)

- **[RFC8785]**: _JSON Canonicalization Scheme (JCS)_  
  [https://datatracker.ietf.org/doc/rfc8785/](https://datatracker.ietf.org/doc/rfc8785/)

- **[VC-DATA-INTEGRITY]**: _Verifiable Credential Data Integrity_  
  [https://www.w3.org/TR/vc-data-integrity/](https://www.w3.org/TR/vc-data-integrity/)

- **[CID]**: _Multiformats: CID_  
  [https://github.com/multiformats/cid](https://github.com/multiformats/cid)

- **[VC-DI-ECDSA]**: _Data Integrity ECDSA Cryptosuites_  
  [https://www.w3.org/TR/vc-di-ecdsa/](https://www.w3.org/TR/vc-di-ecdsa/)

- **[VC-DI-BBS]**: _Data Integrity BBS Cryptosuites_  
  [https://www.w3.org/TR/vc-di-bbs/](https://www.w3.org/TR/vc-di-bbs/)
