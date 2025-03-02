export default class BitcoindError extends Error {
  /**
     * Constructs an instance of BitcoindError, a custom error class for handling bitcoin-core-related errors.
     *
     * @param message - A human-readable description of the error.
     * @param data - Additional data to include with the error.
     *
     */
  constructor(message: string, public data?: Record<string, any>) {
    super(message);
    this.name = 'BitcoindError';
    this.data = data;

    // Ensures that instanceof works properly, the correct prototype chain when using inheritance,
    // and that V8 stack traces (like Chrome, Edge, and Node.js) are more readable and relevant.
    Object.setPrototypeOf(this, new.target.prototype);

    // Captures the stack trace in V8 engines (like Chrome, Edge, and Node.js).
    // In non-V8 environments, the stack trace will still be captured.
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, BitcoindError);
    }
  }
}