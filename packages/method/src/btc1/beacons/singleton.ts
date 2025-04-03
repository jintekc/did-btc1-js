import { canonicalization, DidUpdatePayload, Logger, SingletonBeaconError } from '@did-btc1/common';
import { DidServiceEndpoint } from '@web5/dids';
import BitcoinRpc from '../../bitcoin/rpc-client.js';
import { Beacon } from '../../interfaces/beacon.js';
import { BeaconService, BeaconSignal } from '../../interfaces/ibeacon.js';
import { RawTransactionV2 } from '../../types/bitcoin.js';
import { SidecarData, SignalsMetadata, SingletonSidecar } from '../../types/crud.js';

/**
 * Implements {@link https://dcdpr.github.io/did-btc1/#singleton-beacon | 5.1 Singleton Beacon}.
 *
 * A Singleton Beacon enables a single entity to independently post a DID Update Payload in a Beacon Signal. Its is a
 * Beacon that can be used to publish a single DID Update Payload targeting a single DID document. The serviceEndpoint
 * for this Beacon Type is a Bitcoin address represented as a URI following the BIP21 scheme. It is recommended that
 * this Bitcoin address be under the sole control of the DID controller. How the Bitcoin address and the cryptographic
 * material that controls it are generated is left to the implementation.
 *
 * @class SingletonBeacon
 * @type {SingletonBeacon}
 * @extends {Beacon}
 */
export class SingletonBeacon extends Beacon {

  /**
   * Creates an instance of SingletonBeacon.
   * @param {BeaconService} service The Beacon service.
   * @param {?SidecarData} [sidecar] Optional sidecar data.
   */
  constructor(service: BeaconService, sidecar?: SidecarData) {
    super({ ...service, type: 'SingletonBeacon' }, sidecar as SingletonSidecar);
  }

  /**
   * Get the Beacon service.
   * @readonly
   * @type {BeaconService} The Beacon service.
   */
  get service(): BeaconService {
    return {
      type            : this.type,
      id              : this.id,
      serviceEndpoint : this.serviceEndpoint
    };
  }


  /**
   * Implements {@link https://dcdpr.github.io/did-btc1/#establish-singleton-beacon | 5.1.1 Establish Singleton Beacon}.
   *
   * Static, convenience method for establishing a Beacon object.
   *
   * A Singleton Beacon is a Beacon that can be used to publish a single DID Update Payload targeting a single DID
   * document. The serviceEndpoint for this Beacon Type is a Bitcoin address represented as a URI following the BIP21
   * scheme. It is RECOMMENDED that this Bitcoin address be under the sole control of the DID controller. How the
   * Bitcoin address and the cryptographic material that controls it are generated is left to the implementation.
   * The Establish Singleton Beacon algorithm takes in a Bitcoin address and a serviceId and returns a Singleton Beacon service.
   * It returns a SignletonBeacon object with the given id, type, and serviceEndpoint.
   *
   * @param {string} id The Beacon ID.
   * @param {string} type The Beacon type.
   * @param {DidServiceEndpoint} serviceEndpoint The service endpoint.
   * @returns {Beacon} The Beacon.
   */
  public static establish(id: string, type: string, serviceEndpoint: DidServiceEndpoint): SingletonBeacon {
    return new SingletonBeacon({ id, type, serviceEndpoint });
  }

  /**
   * TODO: Figure out if this is necessary or not.
   * @param {string} didUpdatePayload The DID Update Payload to generate the signal for.
   * @returns {BeaconSignal} The generated signal.
   * @throws {Btc1Error} if the signal is invalid.
   */
  public generateSignal(didUpdatePayload: string): BeaconSignal {
    throw new Error('Method not implemented.' + didUpdatePayload);
  }

  /**
   * TODO: Finish implementation per spec
   *
   * Implements {@link https://dcdpr.github.io/did-btc1/#process-singleton-beacon-signal | 5.1.3 Process Singleton Beacon Signal}.
   *
   * The Process Singleton Beacon Signal algorithm is called by the Process Beacon Signals algorithm as part of the Read
   * operation. It takes a Bitcoin transaction representing a Beacon Signal and optional signalSidecarData containing
   * any sidecar data provided to the resolver for the Beacon Signal identified by the Bitcoin transaction identifier.
   * It returns the DID Update payload announced by the Beacon Signal or throws an error.
   *
   * @param {RawTransactionV2} signal Bitcoin transaction representing a Beacon Signal.
   * @param {?SignalsMetadata} signalsMetadata Optional sidecar data for the Beacon Signal.
   * @returns {Promise<DidUpdatePayload | undefined>} The DID Update payload announced by the Beacon Signal.
   * @throws {DidError} if the signalTx is invalid or the signalSidecarData is invalid.
   */
  public async processSignal(signal: RawTransactionV2, signalsMetadata: SignalsMetadata): Promise<DidUpdatePayload | undefined> {
    // Get the first output of the transaction
    const txOut = signal.vout[0];

    // Check if the first output is an OP_RETURN script
    const [OP_RETURN, UPDATE_PAYLOAD_HASH] = txOut.scriptPubKey.asm.split(' ');
    if (!OP_RETURN || OP_RETURN !== 'OP_RETURN') {
      return undefined;
    };

    // Extract the 32 bytes after the OP_RETURN
    const signalsMetadataMap = new Map(Object.entries(signalsMetadata!));

    const didUpdatePayload = signalsMetadataMap.get(signal.txid)?.updatePayload;
    if(!didUpdatePayload) {
      throw new SingletonBeaconError('Update Payload not found in signal metadata.', 'PROCESS_SIGNAL_ERROR');
    }

    // Check if the hashBytes are in the sidecarData
    if (signalsMetadata) {
      const updateHashBytes = await canonicalization.process(didUpdatePayload);
      console.log('updateHashBytes', updateHashBytes);

      console.log('UPDATE_PAYLOAD_HASH', UPDATE_PAYLOAD_HASH);

      if (updateHashBytes !== UPDATE_PAYLOAD_HASH) {
        throw new SingletonBeaconError('Update payload hash does not match transaction hash.', 'PROCESS_SIGNAL_ERROR');
      }
    } else {
      // TODO: Step 6
      // Else:
      //  Set didUpdatePayload to the result of passing hashBytes into the Fetch Content from Addressable Storage algorithm.
      //  If didUpdatePayload is null, MUST raise a latePublishingError. MAY identify Beacon Signal to resolver and request additional Sidecar data be provided.
    }

    return didUpdatePayload;
  }


  /**
   * Implements {@link https://dcdpr.github.io/did-btc1/#broadcast-singleton-beacon-signal | 5.1.2 Broadcast Singleton Beacon Signal}.
   *
   * The Broadcast Singleton Beacon Signal algorithm is called by the Announce DID Update algorithm as part of the
   * Update operation, if the Beacon being used is of the type SingletonBeacon. It takes as input a Beacon service and a
   * secured didUpdatePayload. The algorithm constructs a Bitcoin transaction that spends from the Beacon address
   * identified in the service and contains a transaction output of the format [OP_RETURN, OP_PUSH32, <hashBytes>],
   * where hashBytes is the SHA256 hash of the canonical didUpdatePayload. The Bitcoin transaction is then signed and
   * broadcast to the Bitcoin network, thereby publicly announcing a DID update in a Beacon Signal. It returns a
   * signalMetadata object mapping the Bitcoin transaction identifier of the Beacon Signal to the necessary data needed
   * to verify the signal announces a specific DID Update Payload.
   *
   * @param {DidUpdatePayload} didUpdatePayload The verificationMethod object to be used for signing.
   * @returns {SignedRawTx} Successful output of a bitcoin transaction.
   * @throws {SingletonBeaconError} if the bitcoin address is invalid or unfunded.
   */
  public async broadcastSignal(didUpdatePayload: DidUpdatePayload): Promise<SignalsMetadata> {
    // Connect to the default bitcoind node
    const rpc = BitcoinRpc.connect();

    // 1. Initialize an addressURI variable to beacon.serviceEndpoint.
    const addressUri = this.service.serviceEndpoint as string;

    // 2. Set bitcoinAddress to the decoding of addressURI following BIP21.
    const bitcoinAddress = addressUri.replace('bitcoin:', '');

    // 3. Ensure bitcoinAddress is funded, if not, fund this address.
    Logger.warn('// TODO: 3. Ensure bitcoinAddress is funded, if not, fund this address.');

    // 4. Set hashBytes to the result of passing didUpdatePayload to the JSON Canonicalization and Hash algorithm.
    const hashBytes = await canonicalization.process(didUpdatePayload);

    // 5. Initialize spendTx to a Bitcoin transaction that spends a transaction controlled by the bitcoinAddress and
    //    contains at least one transaction output. This output MUST have the following format
    //    [OP_RETURN, OP_PUSH32, hashBytes]
    const spendTx = await rpc.createRawTransaction({
      inputs     : [{ txid: '', vout: 0 }],
      outputs    : { address: bitcoinAddress, data: `OP_RETURN OP_PUSH32 ${hashBytes}` },
      locktime   : 0,
      replacable : false
    });

    // 6. Retrieve the cryptographic material, e.g private key or signing capability, associated with the bitcoinAddress
    //    or service. How this is done is left to the implementer.
    Logger.warn('// TODO: 6. Retrieve the cryptographic material associated with the bitcoinAddress or service.');

    // 7. Sign the spendTx.
    const signedRawTx = await rpc.signRawTransaction({ hexstring: spendTx });

    // 8. Broadcast spendTx to the Bitcoin network.
    await rpc.sendRawTransaction(signedRawTx.hex, true);

    // 9. Set signalId to the Bitcoin transaction identifier of spendTx.
    const signalId = 'signedRawTx.txid';

    // 10. Initialize signalMetadata to an empty object.
    // 11. Set signalMetadata.updatePayload to didUpdatePayload.
    // 12. Return the object {<signalId>: signalMetadata}.
    // Note: Consolidated 10-11 into a single object and returning as JSON instead of Map for easier impl.
    return { [signalId]: { updatePayload: didUpdatePayload, proofs: [] } };
  }
}