export type ErrorOptions = {
  type?: string;
  name?: string;
  data?: any;
}

export class DidBtc1Error extends Error {
  name: string = 'DidBtc1Error';
  type: string = 'DidBtc1Error';
  data?: Record<string, any>;

  constructor(message: string, options: ErrorOptions = {}) {
    super(message);
    this.type = options.type ?? this.type;
    this.name = options.name ?? this.name;
    this.data = options.data;

    // Ensures that instanceof works properly, the correct prototype chain when using inheritance,
    // and that V8 stack traces (like Chrome, Edge, and Node.js) are more readable and relevant.
    Object.setPrototypeOf(this, new.target.prototype);

    // Captures the stack trace in V8 engines (like Chrome, Edge, and Node.js).
    // In non-V8 environments, the stack trace will still be captured.
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DidBtc1Error);
    }
  }
}

export class Btc1Error extends DidBtc1Error {
  constructor(message: string, type: string, data?: Record<string, any>) {
    super(message, { type, name: type, data });
  }
}

export class Btc1ReadError extends DidBtc1Error {
  constructor(message: string, type: string = 'Btc1ReadError', data?: Record<string, any>) {
    super(message, { type, name: 'Btc1ReadError', data });
  }
}

export class Btc1KeyManagerError extends DidBtc1Error {
  constructor(message: string, type: string = 'Btc1KeyManagerError', data?: Record<string, any>) {
    super(message, { type, name: type, data });
  }
}

export class BitcoinRpcError extends DidBtc1Error {
  constructor(message: string, type: string = 'BitcoinRpcError', data?: Record<string, any>) {
    super(message, { type, name: type, data });
  }
}

export class DidDocumentError extends DidBtc1Error {
  constructor(message: string, type: string = 'DidDocumentError', data?: Record<string, any>) {
    super(message, { type, name: type, data });
  }
}

export class CryptosuiteError extends DidBtc1Error {
  constructor(message: string, type: string = 'CryptosuiteError', data?: Record<string, any>) {
    super(message, { type, name: type, data });
  }
}

export class KeyPairError extends DidBtc1Error {
  constructor(message: string, type: string = 'KeyPairError', data?: Record<string, any>) {
    super(message, { type, name: type, data });
  }
}

export class PrivateKeyError extends DidBtc1Error {
  constructor(message: string, type: string = 'PrivateKeyError', data?: Record<string, any>) {
    super(message, { type, name: type, data });
  }
}

export class PublicKeyError extends DidBtc1Error {
  constructor(message: string, type: string = 'PublicKeyError', data?: Record<string, any>) {
    super(message, { type, name: type, data });
  }
}

export class MultikeyError extends DidBtc1Error {
  constructor(message: string, type: string = 'MultikeyError', data?: Record<string, any>) {
    super(message, { type, name: type, data });
  }
}

export class ProofError extends DidBtc1Error {
  constructor(message: string, type: string = 'ProofError', data?: Record<string, any>) {
    super(message, { type, name: type, data });
  }
}

export class SingletonBeaconError extends DidBtc1Error {
  constructor(message: string, type: string = 'SingletonBeaconError', data?: Record<string, any>) {
    super(message, { type, name: type, data });
  }
}

export class CIDAggregateBeaconError extends DidBtc1Error {
  constructor(message: string, type: string = 'CIDAggregateBeaconError', data?: Record<string, any>) {
    super(message, { type, name: type, data });
  }
}

export class SMTAggregateBeaconError extends DidBtc1Error {
  constructor(message: string, type: string = 'SMTAggregateBeaconError', data?: Record<string, any>) {
    super(message, { type, name: type, data });
  }
}

export class CanonicalizationError extends DidBtc1Error {
  constructor(message: string, type: string = 'CanonicalizationError', data?: Record<string, any>) {
    super(message, { type, name: type, data });
  }
}