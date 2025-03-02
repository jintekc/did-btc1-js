import { expect } from 'chai';
import { Multikey } from '../src/di-bip340/multikey/index.js';
import { Btc1KeyManagerError } from '../src/index.js';
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
describe('Multikey', () => {
  const id = '#initialKey';
  const type = 'Multikey';
  const controller = 'did:btc1:k1qvddh3hl7n5czluwhz9ry35tunkhtldhgr66zp907ewg4l7p6u786tz863a';
  const fullId = `${controller}${id}`;
  const prefix = new Uint8Array([225,  74]);
  const publicKeyMultibase = 'z66PrEE8AWgvHuw3Zyd3mFEJjgFmAfswkDGF9TurXoKr5hmb';
  const verificationMethod = { id, type, controller, publicKeyMultibase };
  const publicKey = new Uint8Array([
    79,  96, 138,  82,   3,  54,  86, 141,
    235,  42, 148,  25,  72,  25,  71,   0,
    240, 255, 250, 153,  12, 162, 243, 137,
    60,  65, 215, 217, 230,  85,   1,  42
  ]);
  const privateKey = new Uint8Array([
    139, 106,  49, 176,  63,  12, 121,  46,
    94, 115, 142, 201,  94,  75, 143, 216,
    210,  68, 197, 137, 232,  63,  63, 178,
    30, 220, 161, 210,  96, 218, 198, 158
  ]);
  const message = Buffer.from('Hello BTC1!').toString('hex');
  const validSignature = 'd340703b03d0f568655f3d6f245c50a7bc42cca8e8d059890d8314a290b2d4ce59a1070f816fed5270a721c77264b021a7a37719c53a4054b06ee59207cfe3ac';
  const invalidSignature = '230a929a88dd2924b3edb9ea471e460f590abf5dc41e3011479d25c779389fcb1567ad0897a14460c5681913d13750d565019978d2ecbea9da7ddfea80d6cbe3';
  /**
   * Incomplete parameters
   */
  describe('with incomplete parameters: { id, controller }', () => {
    it('should throw Btc1KeyManagerError with message "Must pass public or private key"', () => {
      expect(() => new Multikey({ id, controller }))
        .to.throw(Btc1KeyManagerError, 'Must pass publicKey, privateKey or both');
    });
  });

  /**
   * All parameters
   */
  describe('with all parameters: { id, controller, privateKey, publicKey }', () => {
    const multikey = new Multikey({ id, controller, privateKey, publicKey });

    it('should successfully construct a new Multikey', () => {
      expect(multikey).to.exist.and.to.be.instanceOf(Multikey);
    });

    it('should have proper variables: id, controller, privateKey, publicKey', () => {
      expect(multikey.id).to.equal(id);
      expect(multikey.controller).to.equal(controller);
      expect(multikey.privateKey).to.exist.and.to.be.instanceOf(Uint8Array);
      expect(multikey.publicKey).to.exist.and.to.be.instanceOf(Uint8Array);
      multikey.privateKey?.every((b, i) => expect(b).to.equal(privateKey[i]));
      multikey.publicKey?.every((b, i) => expect(b).to.equal(publicKey[i]));
    });

    it('should create a valid schnorr signature', () => {
      const signature = multikey.sign(message);
      expect(signature).to.exist.and.to.be.instanceOf(Uint8Array);
      expect(signature.length).to.equal(64);
    });

    it('should verify a valid schnorr signature that was produced by the Multikey', () => {
      expect(multikey.verify(message, validSignature)).to.be.true;
    });

    it('should verify that an invalid schnorr signature was not produced by the Multikey', () => {
      expect(multikey.verify(message, invalidSignature)).to.be.false;
    });

    it('should encode publicKey from bytes to Multikey Format', () => {
      expect(multikey.encode()).to.equal(publicKeyMultibase);
    });

    it('should decode publicKeyMultibase from Multikey Format to bytes', () => {
      const publicKeyMultibaseBytes = multikey.decode(publicKeyMultibase);
      const prefixBytes = publicKeyMultibaseBytes.subarray(0, 2);
      expect(publicKeyMultibaseBytes).to.exist.and.to.be.instanceOf(Uint8Array);
      expect(prefixBytes).to.exist.and.to.be.instanceOf(Uint8Array);
      expect(publicKeyMultibaseBytes.subarray(2).every((b, i) => expect(b).to.equal(publicKey[i])));
      expect(prefixBytes.every((b, i) => expect(b).to.equal(prefix[i])));
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
      expect(multikeyFromVm.publicKey).to.exist.and.to.be.instanceOf(Uint8Array);
      multikeyFromVm.publicKey?.every((b, i) => expect(b).to.equal(publicKey[i]));
    });

  });

  /**
   * Public Key only
   */
  describe('with partial parameters: { id, controller, publicKey }', () => {
    const multikey = new Multikey({ id, controller, publicKey });

    it('should successfully construct a new Multikey with publicKey only', () => {
      expect(multikey).to.exist.and.to.be.instanceOf(Multikey);
      expect(multikey.publicKey).to.exist.and.to.be.instanceOf(Uint8Array);
    });

    it('should have proper variables: id, controller, privateKey, publicKey', () => {
      expect(multikey.id).to.equal(id);
      expect(multikey.controller).to.equal(controller);
      expect(multikey.privateKey).to.be.undefined;
      expect(multikey.publicKey).to.exist.and.to.be.instanceOf(Uint8Array);
      multikey.publicKey?.every((b, i) => expect(b).to.equal(publicKey[i]));
    });

    it('should throw Btc1KeyManagerError with message "No private key"', () => {
      expect(() => multikey.sign(message))
        .to.throw(Btc1KeyManagerError, 'No private key');
    });

    it('should verify that a valid schnorr signature was produced by the Multikey', () => {
      expect(multikey.verify(message, validSignature)).to.be.true;
    });

    it('should verify that an invalid schnorr signature was not produced by the Multikey', () => {
      expect(multikey.verify(message, invalidSignature)).to.be.false;
    });

    it('should encode publicKey from bytes to Multikey Format', () => {
      expect(multikey.encode()).to.equal(publicKeyMultibase);
    });

    it('should decode publicKeyMultibase from Multikey Format to bytes', () => {
      const publicKeyMultibaseBytes = multikey.decode(publicKeyMultibase);
      const prefixBytes = publicKeyMultibaseBytes.subarray(0, 2);
      expect(publicKeyMultibaseBytes).to.exist.and.to.be.instanceOf(Uint8Array);
      expect(prefixBytes).to.exist.and.to.be.instanceOf(Uint8Array);
      expect(publicKeyMultibaseBytes.subarray(2).every((b, i) => expect(b).to.equal(publicKey[i])));
      expect(prefixBytes.every((b, i) => expect(b).to.equal(prefix[i])));
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
      expect(multikeyFromVm.publicKey).to.exist.and.to.be.instanceOf(Uint8Array);
      multikeyFromVm.publicKey?.every((b, i) => expect(b).to.equal(publicKey[i]));
    });
  });

  /**
   * Private Key only
   */
  describe('with partial parameters: { id, controller, privateKey }', () => {
    const multikey = new Multikey({ id, controller, privateKey });

    it('should successfully construct a new Multikey with a privateKey and a publicKey', () => {
      expect(multikey).to.exist.and.to.be.instanceOf(Multikey);
    });

    it('should have proper variables: id, controller, privateKey, publicKey', () => {
      expect(multikey.id).to.equal(id);
      expect(multikey.controller).to.equal(controller);
      expect(multikey.publicKey).to.exist.and.to.be.instanceOf(Uint8Array);
      expect(multikey.privateKey).to.exist.and.to.be.instanceOf(Uint8Array);
      multikey.privateKey?.every((b, i) => expect(b).to.equal(privateKey[i]));
      multikey.publicKey?.every((b, i) => expect(b).to.equal(publicKey[i]));
    });

    it('should create a valid schnorr signature', () => {
      const signature = multikey.sign(message);
      expect(signature).to.exist.and.to.be.instanceOf(Uint8Array);
      expect(signature.length).to.equal(64);
    });

    it('should verify that a valid schnorr signature was produced by the Multikey', () => {
      expect(multikey.verify(message, validSignature)).to.be.true;
    });

    it('should verify that an invalid schnorr signature was not produced by the Multikey', () => {
      expect(multikey.verify(message, invalidSignature)).to.be.false;
    });

    it('should encode publicKey from bytes to Multikey Format', () => {
      expect(multikey.encode()).to.equal(publicKeyMultibase);
    });

    it('should decode publicKeyMultibase from Multikey Format to bytes', () => {
      const publicKeyMultibaseBytes = multikey.decode(publicKeyMultibase);
      const prefixBytes = publicKeyMultibaseBytes.subarray(0, 2);
      expect(publicKeyMultibaseBytes).to.exist.and.to.be.instanceOf(Uint8Array);
      expect(prefixBytes).to.exist.and.to.be.instanceOf(Uint8Array);
      expect(publicKeyMultibaseBytes.subarray(2).every((b, i) => expect(b).to.equal(publicKey[i])));
      expect(prefixBytes.every((b, i) => expect(b).to.equal(prefix[i])));
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
      expect(multikeyFromVm.publicKey).to.exist.and.to.be.instanceOf(Uint8Array);
      multikeyFromVm.publicKey?.every((b, i) => expect(b).to.equal(publicKey[i]));
    });
  });
});