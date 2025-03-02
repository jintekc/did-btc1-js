import { default as Client } from 'bitcoin-core';
import '../utils/exts.js';
import { DEFAULT_CLIENT_CONFIG } from '../constants/bitcoind.js';
import BitcoindClientError from './bitcoin-client-error.js';
import IBitcoinClient from './ibitcoin-client.js';
import {
  AddMultiSigAddressParams,
  BatchOption,
  BitcoinSignature,
  BitcoinBlock,
  BlockHashOptions,
  BlockHeader,
  BumpFeeOptions,
  BumpFeeResult,
  ChainInfo,
  ClientConfig,
  CreateMultisigParams,
  CreateMultiSigResult,
  CreateRawTxParams,
  CreateWalletDescriptorOptions,
  CreateWalletDescriptorsResult,
  CreateWalletParams,
  CreateWalletResult,
  DecodedRawTransaction,
  DerivedAddresses,
  FundRawTxOptions,
  FundRawTxResult,
  GetUTXOsResult,
  ImportDescriptorRequest,
  ImportMultiOptions,
  ImportMultiRequest,
  ImportMultiResult,
  ListTransactionsParams,
  ListTransactionsResult,
  ListUnspentParams,
  MemoryStats,
  MempoolContent,
  MempoolInfo,
  Outpoint,
  RawTransactionVerbosity,
  ReturnFormatOptions,
  ScanBlocksParams,
  ScriptDecoded,
  SendAllParams,
  SendAllResult,
  SendManyParams,
  SignRawTxParams,
  SignedRawTx,
  Transaction,
  UnspentTxInfo,
  ValidateAddressResult,
  WalletTransaction
} from '../types/bitcoind.js';

/**
 * @class Bitcoind
 * @description Wrapper class for the bitcoin-core library Client object. Improved Client interface UX.
 * @implements interface {@link IBitcoind}.
 * @constructor Constructs a new {@link Bitcoind} instance from a new {@link Client} instance.
 * @param client The bitcoin-core client instance.
 * @returns A new {@link Bitcoind} instance.
 * @example
 * ```
 * import Bitcoind from 'did-btc1-js';
 * const bob = Bitcoind.connect(); // To use default polar config, pass no args.
 * const result = await bob.getBlockchainInfo();
 * ```
 */
export default class BitcoinClient implements Partial<IBitcoinClient> {
  /**
   * @description The Bitcoind client instance. See {@link Client}.
   * For more information about the bitcoin-core library, see {@link https://npmjs.org/package/bitcoin-core}.
   */
  client: Client;

  /**
   * @description Constructs a new {@link Bitcoind} instance from a new Client instance.
   * @param client The {@link Client} instance.
   */
  constructor(client: Client) {
    this.client = client;
  }

  /**
   * @description Get the Bitcoind client configuration.
   * @returns A {@link ClientConfig} object.
   * @example
   * ```
   * const alice = Bitcoind.connect();
   * const config = alice.config();
   * ```
   */
  public config(): ClientConfig {
    return new ClientConfig(this.client);
  }

  /**
   * @description Get the Bitcoind client instance.
   * @returns The {@link Client} instance.
   * @example
   * ```
   * const alice = Bitcoind.connect();
   * const config = alice.get();
   * ```
   */
  get(): Client {
    return this.client;
  }

  /**
   * @description
   * Static method initializes a new Bitcoind client with the given configuration.
   * Use this method to create and pass a new client instance to a Bitcoind constructor.
   * @param config Required {@link ClientConfig} object.
   * @returns A new {@link Client} instance.
   * @example
   * ```
   * const config = {
   *     host: 'http://bitcoin.alice.me:18443',
   *     username: 'alice',
   *     password: 'alicepass',
   *     version: '28.1.0',
   * }
   * const aliceClient = Bitcoind.initialize(config); // Client config required
   * const alice = new Bitcoind(aliceClient);
   * ```
   */
  public static initialize(config: ClientConfig): Client {
    return new Client(config);
  }

  /**
   * @description
   * Static method connects to a bitcoin node running the bitcoin core daemon (bitcoind).
   * To use default polar config, leave blank. See {@link DEFAULT_CLIENT_CONFIG}.
   * @param config Optional {@link ClientConfig} object.
   * @returns A new {@link BitcoinClient} instance.
   * @example
   * ```
   * const alice = BitcoinClient.connect();
   * ```
   */
  public static connect(config?: ClientConfig): BitcoinClient {
    return new BitcoinClient(this.initialize(config ?? DEFAULT_CLIENT_CONFIG));
  }

  /**
   * @description Handle errors that occur while executing commands.
   * @param methods An array of {@link BatchOption} objects.
   * @param error The error that was thrown.
   * @throws Throws a {@link BitcoindClientError} with the error message.
   */
  private handleError(methods: BatchOption[], error: Error) {
    // Construct the error message
    const baseError = 'Error while executing command(s): ';
    // Get the command names
    const commands = methods.map((method) => method.method);
    // Throw the error
    error.message = `${baseError}${commands.join(', ')}`;
    throw new BitcoindClientError('Error executing command', error);
  }

  /**
   * @description Send one or more gRPC commands bitcoind node.
   * @param methods An array of {@link BatchOption} objects.
   * @returns A promise resolving to the object in the JSON Array of `result`.
   * @throws Throws a {@link BitcoindClientError} if the response is not valid JSON after normalization.
   */
  public async command<T = any>(methods: BatchOption[]): Promise<T> {
    // Execute the command(s) and catch any errors
    const result = await this.client.command(methods).catch(
      (error: Error) => this.handleError(methods, error)
    );
    // Normalize the response
    const response = JSON.unprototyped(result) ? JSON.normalize(result) : result;
    // Check if the response is valid JSON
    if (!JSON.is(response)) {
      const invalidJson = 'Invalid post-normalized JSON response';
      console.error(invalidJson);
      throw new BitcoindClientError(invalidJson, response);
    }
    // Return the response
    return Array.isArray(response)
      ? response.pop()
      : response;
  };

  /**
   * TODO: Comments
   */
  public async getUnspentTransactionOutputs(outpoints: Outpoint[]): Promise<GetUTXOsResult> {
    return this.client.getUnspentTransactionOutputs(outpoints);
  }

  /**
   * TODO: Comments
   */
  public async getTransactionByHash(hash: string, options?: ReturnFormatOptions): Promise<string> {
    return this.client.getTransactionByHash(hash, options);
  }

  /**
   * TODO: Comments
   */
  public async getBlockHeadersByHash(hash: string, count: number, options?: ReturnFormatOptions): Promise<BlockHeader[]> {
    return this.client.getBlockHeadersByHash(hash, count, options);
  }

  /**
   * TODO: Comments
   */
  public async getMemoryPoolContent(): Promise<MempoolContent> {
    return this.client.getMemoryPoolContent();
  }

  /**
   * TODO: Comments
   */
  public async getMemoryPoolInformation(): Promise<MempoolInfo> {
    return this.client.getMemoryPoolInformation();
  }

  /**
   * TODO: Comments
   */
  public async getBlockByHash(hash: string, options?: BlockHashOptions): Promise<BitcoinBlock> {
    return this.client.getBlockByHash(hash, options);
  }

  /**
   * TODO: Comments
   */
  public async abandonTransaction(txid: string): Promise<void> {
    return await this.command([{ method: 'abandontransaction', parameters: [txid] }]);
  }

  /**
   * TODO: Comments
   */
  public async abortRescan(): Promise<void> {
    return await this.command([{ method: 'abortrescan' }]);
  }

  /**
   * TODO: Comments
   */
  public async addMultiSigAddress(params: AddMultiSigAddressParams): Promise<string> {
    return await this.command([{ method: 'addmultisigaddress', parameters: [params] }]);
  }

  /**
   * TODO: Comments
   */
  public async addWitnessAddress(address: string): Promise<void> {
    return await this.command([{ method: 'addwitnessaddress', parameters: [address] }]);
  }

  /**
   * TODO: Comments
   */
  public async backupWallet(destination: string): Promise<void> {
    return await this.command([{ method: 'backupwallet', parameters: [destination] }]);
  }

  /**
   * TODO: Comments
   */
  public async bumpFee(txid: string, options?: BumpFeeOptions): Promise<BumpFeeResult> {
    return await this.command([{ method: 'bumpfee', parameters: [txid, options] }]);
  }

  /**
   * TODO: Comments
   */
  public async createMultiSig(nrequired: number, keys: string[]): Promise<CreateMultiSigResult> {
    return await this.command([{ method: 'createmultisig', parameters: [nrequired, keys] }]);
  }

  /**
   * TODO: Comments
   */
  public async createWallet(params: CreateWalletParams): Promise<CreateWalletResult> {
    return await this.command([{ method: 'createwallet', parameters: [params] }]);
  }

  /**
   * TODO: Comments
   */
  public async decodeScript(hexstring: string): Promise<ScriptDecoded> {
    return await this.command([{ method: 'decodescript', parameters: [hexstring] }]);
  }

  /**
   * TODO: Comments
   */
  public async getBestBlockHash(): Promise<string> {
    return await this.command([{ method: 'getbestblockhash', parameters: [] }]);
  }

  /**
   * TODO: Comments
   */
  public async getBlock(blockhash: string, verbosity?: number): Promise<BitcoinBlock> {
    return await this.command([{ method: 'getblock', parameters: [blockhash, verbosity] }]);
  }

  /**
   * TODO: Comments
   */
  public async getBlockCount(): Promise<number> {
    return await this.command([{ method: 'getblockcount', parameters: [] }]);
  }

  /**
   * TODO: Comments
   */
  public async getBlockHash(height: number): Promise<string> {
    return await this.command([{ method: 'getblockhash', parameters: [height] }]);
  }

  /**
   * TODO: Comments
   */
  public async getBlockHeader(hash: string, verbose?: boolean): Promise<string | BlockHeader> {
    return await this.command([{ method: 'getblockheader', parameters: [hash, verbose] }]);
  }

  /**
   * TODO: Comments
   */
  public async getBlockchainInfo(): Promise<ChainInfo> {
    return this.client.getBlockchainInformation();
  }

  /**
   * TODO: Comments
   */
  public async getInfo(...args: any[]): Promise<void> {
    return await this.command([{ method: 'getinfo', parameters: [...args] }]);
  }

  /**
   * TODO: Comments
   */
  public async getMemoryInfo(mode?: 'stats' | 'mallocinfo'): Promise<MemoryStats | string> {
    return await this.command([{ method: 'getmemoryinfo', parameters: [mode] }]);
  }

  /**
   * TODO: Comments
   */
  public async scanBlocks(params: ScanBlocksParams): Promise<any> {
    return await this.command([{ method: 'scanblocks', parameters: [params] }]);
  }

  /**
   * TODO: Comments
   */
  public async fundRawTransaction(hexstring: string, options: FundRawTxOptions): Promise<FundRawTxResult> {
    return await this.command([{ method: 'fundrawtransaction', parameters: [hexstring, options] }]);
  }

  /**
   * TODO: Comments
   */
  public async signRawTransaction(params: SignRawTxParams): Promise<SignedRawTx> {
    return await this.command([{ method: 'signrawtransaction', parameters: [params] }]);
  }

  /**
   * TODO: Comments
   */
  public async sendRawTransaction(hexstring: string, allowhighfees?: boolean): Promise<void> {
    return await this.command([{ method: 'sendrawtransaction', parameters: [hexstring, allowhighfees] }]);
  }

  /**
   * TODO: Comments
   */
  public async listTransactions(params: ListTransactionsParams): Promise<ListTransactionsResult> {
    return await this.command([{ method: 'listtransactions', parameters: [params] }]);
  }

  /**
   * TODO: Comments
   */
  public async decodeRawTransaction(hexstring: string): Promise<DecodedRawTransaction> {
    return await this.command([{ method: 'decoderawtransaction', parameters: [hexstring] }]);
  }

  /**
   * TODO: Comments
   */
  public async combineRawTransaction(txs: string[]): Promise<string> {
    return await this.command([{ method: 'combinerawtransaction', parameters: [txs] }]);
  }

  /**
   * TODO: Comments
   */
  public async createRawTransaction(params: CreateRawTxParams): Promise<string> {
    return await this.command([{ method: 'createrawtransaction', parameters: [params] }]);
  }

  /**
   * @description Creates a multi-signature address with n signature of m keys required.
   *
   * @param nrequired: The number of required signatures out of the n keys. (number, required)
   * @param keys: The hex-encoded public keys. (string[], required)
   * @param address_type The address type to use. Options are "legacy", "p2sh-segwit", and "bech32" (string, optional, default="legacy").
   *
   * @returns: json object with the address and redeemScript. See {@link CreateMultiSigResult}.
   *
   * @example: Create a multisig address from 2 public keys
   *
   * const bob = Bitcoind.connect();
   *
   * const keys = [
   *    '03789ed0bb717d88f7d321a368d905e7430207ebbd82bd342cf11ae157a7ace5fd',
   *    '03dbc6764b8884a92e871274b87583e6d5c2a58819473e17e107ef3f6aa5a61626'
   * ]
   *
   * const multisig = await bob.createMultisig({ nrequired: 2, keys });
   */
  public async createMultisig({ nrequired, keys, address_type }: CreateMultisigParams): Promise<CreateMultiSigResult> {
    return await this.command([{ method: 'createmultisig', parameters: [nrequired, keys, address_type] }]);
  }
  /**
   * TODO: Comments
   */
  public async getDescriptorInfo(descriptor: string): Promise<any> {
    return await this.command([{ method: 'getdescriptorinfo', parameters: [descriptor] }]);
  }
  /**
   * TODO: Comments
   */
  public async signMessageWithPrivkey(privkey: string, message: string): Promise<BitcoinSignature> {
    return await this.command([{ method: 'signmessagewithprivkey', parameters: [privkey, message] }]);
  }
  /**
   * TODO: Comments
   */
  public async validateAddress(address: string): Promise<ValidateAddressResult> {
    return await this.command([{ method: 'validateaddress', parameters: [address] }]);
  }
  /**
   * TODO: Comments
   */
  public async verifyMessage(address: string, signature: string, message: string): Promise<boolean> {
    return await this.command([{ method: 'verifymessage', parameters: [address, signature, message] }]);
  }

  /**
   * @description Derives one or more addresses corresponding to an output descriptor.
   *
   * Examples of output descriptors are:
   *   pkh(<pubkey>)                                     P2PKH outputs for the given pubkey
   *   wpkh(<pubkey>)                                    Native segwit P2PKH outputs for the given pubkey
   *   sh(multi(<n>,<pubkey>,<pubkey>,...))              P2SH-multisig outputs for the given threshold and pubkeys
   *   raw(<hex script>)                                 Outputs whose output script equals the specified hex-encoded bytes
   *   tr(<pubkey>,multi_a(<n>,<pubkey>,<pubkey>,...))   P2TR-multisig outputs for the given threshold and pubkeys
   *
   * In the above, <pubkey> either refers to a fixed public key in hexadecimal notation, or to an xpub/xprv optionally followed by one
   * or more path elements separated by "/", where "h" represents a hardened child key.
   * For more information on output descriptors, see the documentation in {@link https://github.com/bitcoin/bitcoin/blob/master/doc/descriptors.md}.
   *
   * @param descriptor The descriptor. (string, required)
   * @param range If descriptor is ranged, must specify end or [begin,end] to derive. (numeric or array, optional)
   *
   * @returns a list of derived addresses
   *
   * @example First three native segwit receive addresses
   * ```
   * const bitcoind = Bitcoind.connect()
   * const addresses = bitcoind.deriveAddresses("wpkh([d34db33f/84h/0h/0h]xpub6DJ2dN.../0/*)#cjjspncu", [0,2])
   * ```
   */
  public async deriveAddresses(descriptor: string, range?: Array<number>): Promise<Array<DerivedAddresses>> {
    return await this.command([{ method: 'deriveaddresses', parameters: [descriptor, range] }]);
  }

  /**
   * TODO: Comments
   */
  public async addMultisigAddress(): Promise<any> {
    return await this.command([{ method: 'addmultisigaddress' }]);
  }

  /**
   * @description Creates the wallet's descriptor for the given address type. The address type must be one that the
   * wallet does not already have a descriptor for. Requires wallet passphrase to be set with walletpassphrase call
   * if wallet is encrypted.
   * @param type The address type the descriptor will produce. Options are "legacy", "p2sh-segwit", "bech32", and "bech32m". (string, required)
   * @param options Options object that can be used to pass named arguments, listed below. (json object, optional)
   * @param options.internal Whether to only make one descriptor that is internal (if parameter is true) or external (if parameter is false)
   *                          (boolean, optional, default=Both external and internal will be generated unless this parameter is specified)
   * @param options.hdkey The HD key that the wallet knows the private key of, listed using 'gethdkeys', to use for this descriptor's key.
   *                       (string, optional, default=The HD key used by all other active descriptors)
   * @returns A {@link CreateWalletDescriptorsResult} response object
   */
  public async createWalletDescriptor(type: string, options: CreateWalletDescriptorOptions): Promise<CreateWalletDescriptorsResult> {
    return await this.command([{ method: 'createwalletdescriptor', parameters: [type, options] }]);
  }

  /**
   * TODO: Comments
   */
  public async getBalance(): Promise<any> {
    return await this.command([{ method: 'getbalance' }]);
  }

  /**
   * TODO: Comments
   */
  public async getNewAddress(account?: string): Promise<string> {
    return await this.command([{ method: 'getnewaddress', parameters: [account] }]);
  }

  /**
   * TODO: Comments
   */
  public async importAddress(script: string, label?: string, rescan?: boolean, p2sh?: boolean): Promise<void> {
    return await this.command([{ method: 'importaddress', parameters: [script, label, rescan, p2sh] }]);
  }

  /**
   * @description Import descriptors.
   *
   * This will trigger a rescan of the blockchain based on the earliest timestamp of all descriptors being imported.
   * Requires a new wallet backup. Note: This call can take over an hour to complete if using an early timestamp;
   * during that time, other rpc calls may report that the imported keys, addresses or scripts exist but related
   * transactions are still missing. The rescan is significantly faster if block filters are available
   * (using startup option "-blockfilterindex=1").
   *
   * @param requests Array of {@link ImportDescriptorRequest} objects to be imported
   * @returns Array of {@link ImportDescriptorResult} objects
   * @returns
   */
  public async importDescriptors(requests: Array<ImportDescriptorRequest>): Promise<any> {
    return await this.command([{ method: 'importdescriptors', parameters: [requests] }]);
  }

  /**
   * TODO: Comments
   */
  public async importMulti(requests: ImportMultiRequest[], options?: ImportMultiOptions): Promise<Array<ImportMultiResult>> {
    return await this.command([{ method: 'importmulti', parameters: [requests, options] }]);
  }

  /**
   * TODO: Comments
   */
  public async listUnspent(params: ListUnspentParams): Promise<UnspentTxInfo[]> {
    return await this.command([{ method: 'listunspent', parameters: [params] }]);
  }

  /**
   * TODO: Comments
   */
  public async rescanBlockchain(): Promise<any> {
    return await this.command([{ method: 'addmultisigaddress' }]);
  }

  /**
   * TODO: Comments
   */
  public async sendToAddress(): Promise<any> {
    return await this.command([{ method: 'sendtoaddress' }]);
  }

  /**
   * TODO: Comments
   */
  public async signMessage(): Promise<any> {
    return await this.command([{ method: 'signmessage' }]);
  }

  /**
   * TODO: Comments
   */
  public async signRawTransactionWithWallet(): Promise<any> {
    return await this.command([{ method: 'signrawtransactionwithwallet' }]);
  }

  /**
   * TODO: Comments
   */
  public async send(): Promise<any> {
    return await this.command([{ method: 'send' }]);
  }

  /**
   * @warning EXPERIMENTAL this call may be changed in future releases.
   *
   * @description Spend the value of all (or specific) confirmed UTXOs & unconfirmed change in the wallet to one or
   * more recipients. Unconfirmed inbound UTXOs and locked UTXOs will not be spent. Sendall will respect the
   * avoid_reuse wallet flag. If your wallet contains many small inputs, either because it received tiny payments or as
   * a result of accumulating change, consider using `send_max` to exclude inputs that are worth less than the fees
   * needed to spend them.
   *
   * @param params See {@link SendAllParams}
   * @param recipients The sendall recipient destinations. json array, required. Each address may only appear once.
   *    See {@link SendAllRecipients} and {@link SendAllRecipients}. Optionally some recipients can be specified with an
   *    amount to perform payments, but at least one address must appear without a specified amount.
   * @param params.conf_target Confirmation target in blocks. numeric, optional, default=wallet -txconfirmtarget.
   * @param estimate_mode The fee estimate mode, must be one of (case insensitive). string, optional, default="unset".
   *    See {@link FeeEstimateMode} for possible values.
   * @param fee_rate Specify a fee rate in sat/vB. numeric or string, optional, default=not set,
   *    falls back to wallet fee estimation
   * @param options: Options object that can be used to pass named arguments. json object, optional
   *
   * @returns A promise resolving to a {@link SendAllResult} object
   *
   * @example
   * Spend all UTXOs from the wallet with a fee rate of 1 sat/vB using named arguments
   * const bob = Bitcoind.connect({
   *    username: 'bob',
   *    password: 'bobpass',
   *    host: 'http://127.0.0.1:18443',
   *    allowDefaultWallet: true,
   *    version: '28.1.0'
   * });
   * const sendall = await bob.sendAll({
   *    recipients: [
   *      'bc1q09vm5lfy0j5reeulh4x5752q25uqqvz34hufdl',
   *      'bc1q02ad21edsxd23d32dfgqqsz4vv4nmtfzuklhy3'
   *    ],
   *     options: { fee_rate: 1.1 }
   * });
   */
  public async sendAll(params: SendAllParams): Promise<SendAllResult> {
    return await this.command([{ method: 'sendall', parameters: [params] }]);
  }

  /**
   * TODO: Comments
   */
  public async sendMany(params: SendManyParams): Promise<string> {
    return await this.command([{ method: 'sendmany', parameters: [params] }]);
  }

  /**
   * @description Get detailed information about in-wallet transaction <txid>.
   * @param txid: The transaction id. (string, required)
   * @param {boolean} include_watchonly Whether to include watch-only addresses in balance calculation and details.
   * @returns A {@link WalletTransaction} object.
   */
  public async getTransaction(txid: string, include_watchonly?: boolean): Promise<WalletTransaction> {
    return await this.command([{ method: 'gettransaction', parameters: [txid, include_watchonly] }]);
  }

  /**
   * @description By default, this call only returns a transaction if it is in the mempool. If -txindex is enabled
   * and no blockhash argument is passed, it will return the transaction if it is in the mempool or any block.
   * If a blockhash argument is passed, it will return the transaction if the specified block is available and
   * the transaction is in that block.
   * @param txid: The transaction id. (string, required)
   * @param verbosity: What form to return the data in: hexencoded, json or json with fee and prevout. (number, optional, default=1)
   * See enum {@link RawTransactionVerbosity} for possible values.
   * @returns: A {@link Transaction} object.
   */
  public async getRawTransaction(txid: string, verbosity: RawTransactionVerbosity): Promise<Transaction> {
    return await this.command([{ method: 'getrawtransaction', parameters: [txid, verbosity] }]);
  }

  public async getRawTransactions(txids: string[], verbosity: RawTransactionVerbosity): Promise<Transaction[]> {
    return await Promise.all(
      txids.map(
        async (txid) => await this.getRawTransaction(txid, verbosity)
      )
    );
  }
}