import { MultikeyError } from '../src/utils/error.js';
import { KeyPair, KeyPairError, KeyPairUtils, PrivateKey, PrivateKeyUtils, PublicKey } from '@did-btc1/key-pair';
import { expect } from 'chai';
import { Multikey } from '../src/di-bip340/multikey/index.js';
import ObjectUtils from '../src/utils/object-utils.js';

/**
 * Multikey Test Cases
 *
 * 1. id, controller only → should throw
 * 2. id, controller, privateKey → should succeed
 * 3. id, controller, publicKey → should succeed
 * 4. id, controller, privateKey, publicKey → should succeed
 *
 */
describe('Multikey instantiated', () => {
  // Crypto Constants
  const privateKeyBytes = new Uint8Array([
    115, 253, 220, 18, 252, 147, 66, 187,
    41, 174, 155, 94, 212, 118, 50,  59,
    220, 105,  58, 17, 110,  54, 81,  36,
    85, 174, 232, 48, 254, 138, 37, 162
  ]);
  /*const publicKeyBytes = new Uint8Array([
    2, 154, 213, 246, 168,  93,  39, 238,
    105, 177,  51, 174, 210, 115, 180, 242,
    245, 215,  14, 212, 167,  22, 117,   1,
    156,  26, 118, 240,  76, 102,  53,  38,
    239
  ]);*/
  const keyPair = KeyPairUtils.fromPrivateKey(privateKeyBytes);
  const { publicKey, privateKey } = keyPair;

  // Multikey Constants
  const id = '#initialKey';
  const type = 'Multikey';
  const controller = 'did:btc1:k1qvddh3hl7n5czluwhz9ry35tunkhtldhgr66zp907ewg4l7p6u786tz863a';
  const fullId = `${controller}${id}`;
  const publicKeyMultibase = 'z66PwJnYvwJLhGrVc8vcuUkKs99sKCzYRM2HQ2gDCGTAStHk';
  const verificationMethod = { id, type, controller, publicKeyMultibase };
  const message = Buffer.from('Hello BTC1!');
  const validSignature = new Uint8Array([
    120, 106, 121,  54, 225,  45, 189, 134,  48,  20, 118,
    70, 228,  69,  29,  32,  74, 170,  55, 215, 193, 245,
    54, 220, 220,  20,  69,  11, 192, 138, 137,  85, 121,
    26, 215,  77, 208, 122, 118,  95,  30,  91,   3, 137,
    245,   1,  67, 147,  99,  48,  39,  83, 189, 132, 158,
    65, 114, 110,  48,  39,  91, 142, 117, 138
  ]);
  const invalidSignature =  new Uint8Array([
    25, 105, 158, 232,  91,   7,  61,   8,   2, 215, 191,
    122,  47,  51, 195, 195, 207,  95, 213, 226,  72, 224,
    10, 153,  84,  66, 197, 186, 110, 108,  91, 156, 195,
    157, 126,  82,  51,  10, 167, 163, 240, 244, 231, 140,
    202, 250, 220, 245, 132,  34, 102,  64, 202,  24,  97,
    163,  84,  73, 128,   5, 188, 219,  47, 133
  ]);

  /**
   * Incomplete parameters
   */
  describe('without a KeyPair', () => {
    it('should throw MultikeyError', () => {
      expect(() => new Multikey({ id, controller }))
        .to.throw(MultikeyError, 'Argument missing: "keyPair" required');
    });
  });

  /**
   * All parameters
   */
  describe('with a new KeyPair', () => {
    const multikey = new Multikey({ id, controller, keyPair });

    it('should successfully construct a new Multikey', () => {
      expect(multikey).to.exist.and.to.be.instanceOf(Multikey);
    });

    it('should have proper variables: id, controller, privateKey, publicKey', () => {
      expect(multikey.id).to.equal(id);
      expect(multikey.controller).to.equal(controller);
      expect(multikey.privateKey).to.exist.and.to.be.instanceOf(PrivateKey);
      expect(multikey.publicKey).to.exist.and.to.be.instanceOf(PublicKey);
      expect(multikey.privateKey.equals(privateKey)).to.be.true;
      expect(multikey.publicKey.equals(publicKey)).to.be.true;
    });

    it('should create a valid schnorr signature', () => {
      const signature = multikey.sign(message);
      expect(signature).to.exist.and.to.be.instanceOf(Uint8Array);
      expect(signature.length).to.equal(64);
    });

    it('should resolve verification of a valid schnorr signature to true', () => {
      expect(multikey.verify(validSignature, message)).to.be.true;
    });

    it('should resolve verification of an invalid schnorr signature to false', () => {
      expect(multikey.verify(invalidSignature, message)).to.be.false;
    });

    it('should contain a PublicKey in x-only base58btc format', () => {
      const publicKey = multikey.publicKey;
      expect(publicKey).to.exist.and.to.be.instanceOf(PublicKey);
      expect(publicKey.multibase).to.equal(publicKeyMultibase);
    });

    it('should decode publicKeyMultibase from Multikey Format to bytes', () => {
      expect(multikey.publicKey.encode()).to.equal(publicKeyMultibase);
    });

    it('should have a matching full id', () => {
      expect(multikey.fullId()).to.equal(fullId);
    });

    it('should return a valid, matching verification method', () => {
      expect(ObjectUtils.deepEqual(multikey.toVerificationMethod(), verificationMethod)).to.equal(true);
    });

    it('should construct a valid Multikey with matching data given a valid verification method', () => {
      const multikeyFromVm = multikey.fromVerificationMethod(verificationMethod);
      expect(multikeyFromVm).to.exist.and.to.be.instanceOf(Multikey);
      expect(multikeyFromVm.id).to.equal(id);
      expect(multikeyFromVm.controller).to.equal(controller);
      expect(multikeyFromVm.publicKey).to.exist.and.to.be.instanceOf(PublicKey);
      expect(multikeyFromVm.publicKey.equals(publicKey)).to.be.true;
    });

  });

  /**
   * Key Pair with Public Key passed only
   */
  describe('with a PublicKey-only KeyPair', () => {
    const keyPair = new KeyPair({ publicKey });
    const multikey = new Multikey({ id, controller, keyPair });

    it('should successfully construct a new Multikey with publicKey only', () => {
      expect(multikey).to.exist.and.to.be.instanceOf(Multikey);
      expect(multikey.publicKey).to.exist.and.to.be.instanceOf(PublicKey);
    });

    it('should have proper variables: id, controller, publicKey', () => {
      expect(multikey.id).to.equal(id);
      expect(multikey.controller).to.equal(controller);
      expect(() => multikey.privateKey).to.throw(KeyPairError, 'Private key not available');
      expect(multikey.publicKey).to.exist.and.to.be.instanceOf(PublicKey);
      expect(multikey.publicKey.equals(publicKey)).to.be.true;
    });

    it('should throw KeyPairError', () => {
      expect(() => multikey.sign(message))
        .to.throw(KeyPairError, 'Private key not available');
    });

    it('should verify that a valid schnorr signature was produced by the Multikey', () => {
      expect(multikey.verify(validSignature, message)).to.be.true;
    });

    it('should verify that an invalid schnorr signature was not produced by the Multikey', () => {
      expect(multikey.verify(invalidSignature, message)).to.be.false;
    });

    it('should encode publicKey from bytes to Multikey Format', () => {
      expect(multikey.publicKey.encode()).to.equal(publicKeyMultibase);
    });

    it('should decode publicKeyMultibase from Multikey Format to bytes', () => {
      expect(multikey.publicKey.decode()).to.be.instanceOf(Uint8Array);
    });

    it('should have a matching full id', () => {
      expect(multikey.fullId()).to.equal(fullId);
    });

    it('should return a valid, matching verification method', () => {
      expect(ObjectUtils.deepEqual(multikey.toVerificationMethod(), verificationMethod)).to.equal(true);
    });

    it('should construct a valid Multikey with matching data given a valid verification method', () => {
      const multikeyFromVm = multikey.fromVerificationMethod(verificationMethod);
      expect(multikeyFromVm).to.exist.and.to.be.instanceOf(Multikey);
      expect(multikeyFromVm.id).to.equal(id);
      expect(multikeyFromVm.controller).to.equal(controller);
      expect(multikeyFromVm.publicKey).to.exist.and.to.be.instanceOf(PublicKey);
      expect(multikeyFromVm.publicKey.equals(publicKey)).to.be.true;
    });
  });

  /**
   * Key Pair with PrivateKey passed only
   */
  describe('instantiate by passing only a privateKey to a new KeyPair', () => {
    const keyPair = new KeyPair({ privateKey });
    const multikey = new Multikey({ id, controller, keyPair });

    it('should successfully construct a new Multikey with a keyPair', () => {
      expect(multikey).to.exist.and.to.be.instanceOf(Multikey);
    });

    it('should have proper variables: id, controller, keyPair', () => {
      expect(multikey.id).to.equal(id);
      expect(multikey.controller).to.equal(controller);
      expect(multikey.publicKey).to.exist.and.to.be.instanceOf(PublicKey);
      expect(multikey.privateKey).to.exist.and.to.be.instanceOf(PrivateKey);
      expect(multikey.privateKey.equals(privateKey)).to.be.true;
      expect(multikey.publicKey.equals(publicKey)).to.be.true;
    });

    it('should create a valid schnorr signature', () => {
      const signature = multikey.sign(message);
      expect(signature).to.exist.and.to.be.instanceOf(Uint8Array);
      expect(signature.length).to.equal(64);
    });

    it('should verify that a valid schnorr signature was produced by the Multikey', () => {
      expect(multikey.verify(validSignature, message)).to.be.true;
    });

    it('should verify that an invalid schnorr signature was not produced by the Multikey', () => {
      expect(multikey.verify(invalidSignature, message)).to.be.false;
    });

    it('should encode publicKey from bytes to Multikey Format', () => {
      expect(multikey.publicKey.encode()).to.equal(publicKeyMultibase);
    });

    it('should decode publicKeyMultibase from Multikey Format to public key bytes', () => {
      expect(multikey.publicKey.decode()).to.be.instanceOf(Uint8Array);
    });

    it('should have a matching full id', () => {
      expect(multikey.fullId()).to.equal(fullId);
    });

    it('should return a valid, matching verification method', () => {
      expect(ObjectUtils.deepEqual(multikey.toVerificationMethod(), verificationMethod)).to.equal(true);
    });

    it('should construct a valid Multikey with matching data given a valid verification method', () => {
      const multikeyFromVm = multikey.fromVerificationMethod(verificationMethod);
      expect(multikeyFromVm).to.exist.and.to.be.instanceOf(Multikey);
      expect(multikeyFromVm.id).to.equal(id);
      expect(multikeyFromVm.controller).to.equal(controller);
      expect(multikeyFromVm.publicKey).to.exist.and.to.be.instanceOf(PublicKey);
      expect(multikeyFromVm.publicKey.equals(publicKey)).to.be.true;
    });
  });

  /**
   * Key Pair from Secret
   */
  describe('Multikey from KeyPair with PrivateKey fromSecret', () => {
    const SECRET = 52464508790539176856770556715241483442035423615466097401201513777400180778402n;
    const privateKey = PrivateKeyUtils.fromSecret(SECRET);
    const keyPair = new KeyPair({ privateKey });
    const multikey = new Multikey({ id, controller, keyPair });

    it('should successfully construct a new Multikey with a keyPair', () => {
      expect(multikey).to.exist.and.to.be.instanceOf(Multikey);
    });

    it('should have proper variables: id, controller, keyPair', () => {
      expect(multikey.id).to.equal(id);
      expect(multikey.controller).to.equal(controller);
      expect(multikey.publicKey).to.exist.and.to.be.instanceOf(PublicKey);
      expect(multikey.privateKey).to.exist.and.to.be.instanceOf(PrivateKey);
      expect(multikey.privateKey.equals(privateKey)).to.be.true;
      expect(multikey.publicKey.equals(publicKey)).to.be.true;
      expect(multikey.privateKey.secret).to.equal(SECRET);
    });

    it('should create a valid schnorr signature', () => {
      const signature = multikey.sign(message);
      expect(signature).to.exist.and.to.be.instanceOf(Uint8Array);
      expect(signature.length).to.equal(64);
    });

    it('should verify that a valid schnorr signature was produced by the Multikey', () => {
      expect(multikey.verify(validSignature, message)).to.be.true;
    });

    it('should verify that an invalid schnorr signature was not produced by the Multikey', () => {
      expect(multikey.verify(invalidSignature, message)).to.be.false;
    });

    it('should encode publicKey from bytes to Multikey Format', () => {
      expect(multikey.publicKey.encode()).to.equal(publicKeyMultibase);
    });

    it('should decode publicKeyMultibase from Multikey Format to public key bytes', () => {
      expect(multikey.publicKey.decode()).to.be.instanceOf(Uint8Array);
    });

    it('should have a matching full id', () => {
      expect(multikey.fullId()).to.equal(fullId);
    });

    it('should return a valid, matching verification method', () => {
      expect(ObjectUtils.deepEqual(multikey.toVerificationMethod(), verificationMethod)).to.equal(true);
    });

    it('should construct a valid Multikey with matching data given a valid verification method', () => {
      const multikeyFromVm = multikey.fromVerificationMethod(verificationMethod);
      expect(multikeyFromVm).to.exist.and.to.be.instanceOf(Multikey);
      expect(multikeyFromVm.id).to.equal(id);
      expect(multikeyFromVm.controller).to.equal(controller);
      expect(multikeyFromVm.publicKey).to.exist.and.to.be.instanceOf(PublicKey);
      expect(multikeyFromVm.publicKey.equals(publicKey)).to.be.true;
      expect(() => multikeyFromVm.privateKey.secret).to.throw(KeyPairError, 'Private key not available');

    });
  });
});