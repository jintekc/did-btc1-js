import Client from 'bitcoin-core';
import { Block } from 'multiformats';
import {
  AddMultiSigAddressParams,
  BatchOption,
  BumpFeeOption,
  BumpFeeResult,
  ChainInfo,
  CreateMultiSigResult,
  CreateRawTxParams,
  CreateWalletParams,
  CreateWalletResult,
  DecodedRawTransaction,
  FeeEstimateMode,
  FundRawTxOptions,
  MempoolInfo,
  MiningInfo,
  PeerInfo,
  ScriptDecoded,
  ValidateAddressResult
} from '../types/bitcoind.js';

/**
 * Interface for the Bitcoin Core RPC client.
 */
export default interface IBitcoinClient {
    client: Client;

    /** @description Executes multiple commands in a batch request. */
    command?<R extends ReturnType<any>>(methods: BatchOption[]): Promise<ReadonlyArray<R>>;

    /** @description Marks a transaction and its in-wallet descendants as abandoned, allowing their inputs to be respent. */
    abandonTransaction(txid: string): Promise<void>;

    /** @description Stops the current wallet rescan triggered by an RPC call, such as by an importprivkey call. */
    abortRescan(): Promise<void>;

    /** @description Adds a multi-signature address with n required signatures and a set of keys. */
    addMultiSigAddress({ nrequired, keys, account }: AddMultiSigAddressParams): Promise<string>;

    /** @description Adds a witness address for SegWit compatibility. */
    addWitnessAddress(address: string): Promise<void>;

    /** @description Backs up the wallet file to a specified destination. */
    backupWallet(destination: string): Promise<void>;

    /** @description Increases the fee of an unconfirmed transaction to improve its confirmation time. */
    bumpFee(txid: string, options?: BumpFeeOption): Promise<BumpFeeResult>;

    /** @description Removes all banned nodes from the ban list. */
    clearBanned(): Promise<void>;

    /** @description Combines multiple raw transactions into a single transaction. */
    combineRawTransaction(txs: string[]): Promise<string>;

    /** @description Creates a multi-signature address with n required signatures and a set of keys. */
    createMultiSig(nrequired: number, keys: string[]): Promise<CreateMultiSigResult>;

    /** @description Creates a raw transaction spending specified inputs to specified outputs. */
    createRawTransaction({
      inputs,
      outputs,
      locktime,
      replacable
    }: CreateRawTxParams): Promise<string>;

    /** @description Creates a new wallet with various optional parameters. */
    createWallet({
      wallet_name,
      disable_private_keys,
      blank,
      passphrase,
      avoid_reuse,
      descriptors,
      load_on_startup,
    }: CreateWalletParams): Promise<CreateWalletResult>;

    /** @description Decodes a raw transaction hex string. */
    decodeRawTransaction(hexstring: string): Promise<DecodedRawTransaction>;

    /** @description Decodes a hex-encoded script. */
    decodeScript(hexstring: string): Promise<ScriptDecoded>;

    /** @description Disconnects a node by address or node ID. */
    disconnectNode(address?: string, nodeid?: number): Promise<void>;

    /** @description Reveals the private key corresponding to an address. */
    dumpPrivKey(address: string): Promise<string>;

    /** @description Dumps all wallet keys and metadata to a file. */
    dumpWallet(filename: string): Promise<{ filename: string }>;

    /** @description Encrypts the wallet with a passphrase. */
    encryptWallet(passphrase: string): Promise<void>;

    /** @description Estimates the fee rate for a given confirmation target. */
    estimateSmartFee(
        conf_target: number,
        estimate_mode?: FeeEstimateMode,
    ): Promise<{ feerate?: number; errors?: string[]; blocks?: number }>;

    /** @description Funds a raw transaction by adding necessary inputs and change. */
    fundRawTransaction(
        hexstring: string,
        options: FundRawTxOptions,
    ): Promise<{ hex: string; fee: number; changepos: number }>;

    /** @description Returns the number of blocks in the longest blockchain. */
    getBlockCount(): Promise<number>;

    /** @description Gets the hash of a block at a given height. */
    getBlockHash(height: number): Promise<string>;

    /** @description Gets detailed information about a specific block. */
    getBlock(blockhash: string, verbosity?: number): Promise<string | Block>;

    /** @description Retrieves general blockchain state info. */
    getBlockchainInfo(): Promise<ChainInfo>;

    /** @description Gets the number of active connections to other nodes. */
    getConnectionCount(): Promise<number>;

    /** @description Gets the estimated network difficulty. */
    getDifficulty(): Promise<number>;

    /** @description Retrieves memory pool statistics. */
    getMempoolInfo(): Promise<MempoolInfo>;

    /** @description Retrieves mining statistics. */
    getMiningInfo(): Promise<MiningInfo>;

    /** @description Gets a new Bitcoin address for receiving payments. */
    getNewAddress(account?: string): Promise<string>;

    /** @description Gets detailed peer connection information. */
    getPeerInfo(): Promise<PeerInfo[]>;

    /** @description Sends raw transaction hex to the Bitcoin network. */
    sendRawTransaction(hexstring: string, allowhighfees?: boolean): Promise<void>;

    /** @description Sends bitcoins to a specified address. */
    sendToAddress(
        address: string,
        amount: number,
        comment?: string,
        comment_to?: string,
        subtreactfeefromamount?: boolean,
        replaceable?: boolean,
        conf_target?: number,
        estimate_mode?: FeeEstimateMode,
    ): Promise<string>;

    /** @description Validates a Bitcoin address. */
    validateAddress(address: string): Promise<ValidateAddressResult>;

    /** @description Verifies a signed message. */
    verifyMessage(address: string, signature: string, message: string): Promise<boolean>;

    /** @description Locks the wallet, requiring a passphrase to unlock. */
    walletLock(passphrase: string, timeout: number): Promise<void>;
};;;;;;;;;;