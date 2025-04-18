import { Canonicalization } from './canonicalization.js';
import { Patch } from './patch.js';
import { JSONObject, Maybe, Prototyped, Unprototyped } from './types/general.js';

/** Extend the global namespace */
declare global {
    /** Extend the Array Object class interface */
    interface Array<T> {
        /** Get the last element of the array */
        last(): T | undefined;
        [-1](): T | undefined;
    }
    /** Extend the JSON class interface */
    interface JSON {
        /** Check if an object is a JSON object */
        is(unknown: Maybe<JSONObject>): boolean;
        /** Check if JSON string can be parsed to JSON object */
        parsable(unknown: Maybe<string>): boolean;
        /** Check if JSON object can be converted to JSON string */
        stringifiable(unknown: Maybe<JSONObject>): boolean;
        /** Check if JSON object is unprototyped [Object: null prototype] {} */
        unprototyped(unknown: Maybe<Prototyped>): boolean;
        /** Normalize unprototyped JSON object to prototyped JSON object */
        normalize(unknown: Maybe<Unprototyped>): Prototyped;
        /** Shallow copy of JSON object */
        copy(obj: JSONObject): JSONObject;
        /** Deep copy of JSON object */
        deepCopy(obj: JSONObject): JSONObject;
        /** Check if two objects are strictly equal */
        equal(a: any, b: any): boolean;
        /** Check if two objects are deeply equal */
        deepEqual(a: any, b: any): boolean;
        /** Delete a key from JSON object */
        delete({ obj, key }: { obj: JSONObject, key: string }): JSONObject;
        /** Canonicalization object */
        canonicalization: Canonicalization;
        /** JSON Patch (IETF RFC 6902) */
        patch: Patch;
    }

    interface Date {
      getUTCDateTime(): string;
      toUnix(): number;
    }

    interface String {
      toSnakeScream(): string;
      toSnake(): string;
    }
}

Array.prototype.last = function <T>(): T | undefined {
  return this[this.length - 1] ?? undefined;
};

Array.prototype[-1] = function <T>(): T | undefined {
  return this.last();
};

JSON.is = function (unknown: Maybe<JSONObject>): boolean {
  if (unknown === null || typeof unknown !== 'object') return false;
  if (Array.isArray(unknown))
    return unknown.every(item => Object.getPrototypeOf(item) !== null);
  else
    return Object.getPrototypeOf(unknown) === null;
};

JSON.parsable = function (unknown: Maybe<string>): boolean {
  try {
    JSON.parse(unknown);
    return true;
  } catch {
    return false;
  }
};

JSON.stringifiable = function (unknown: Maybe<JSONObject>): boolean {
  try {
    JSON.stringify(unknown);
    return true;
  } catch {
    return false;
  }
};

JSON.unprototyped = function (unknown: Maybe<Unprototyped>): boolean {
  if (Array.isArray(unknown)) {
    return unknown.every(item => Object.getPrototypeOf(item) === null);
  }
  return Object.getPrototypeOf(unknown) === null;
};

JSON.normalize = function (unknown: Maybe<Unprototyped>): Prototyped {
  try {
    return JSON.parse(JSON.stringify(unknown));
  } catch {
    throw new Error('The object is not unprotocyped');
  }
};

// Use Object.assign to create a shallow copy
JSON.copy = function (obj: JSONObject): JSONObject {
  return Object.assign({}, obj);
};

// Create deep copy using JSON serialization
JSON.deepCopy = function (unknown: Maybe<JSONObject>): JSONObject {
  return JSON.parse(JSON.stringify(unknown));
};

// Check for strict equality
JSON.equal = function (a: any, b: any): boolean {
  return a === b;
};

// Check for deep equality
JSON.deepEqual = function (a: any, b: any): boolean {
  // If they're strictly equal, they're immediately the same (handles primitives as well).
  if(JSON.equal(a, b)) return true;

  // If either is null or their types differ, they can't be equal.
  if (a === null || b === null || typeof a !== typeof b) return false;

  // If both are objects, compare their properties
  if (typeof a === 'object') {
    // Check if they're both arrays
    const isArrayA = Array.isArray(a);
    const isArrayB = Array.isArray(b);
    if (isArrayA !== isArrayB) return false;

    if (isArrayA && isArrayB) {
      // Compare array lengths first
      if (a.length !== b.length) return false;
      // Compare each array element
      for (let i = 0; i < a.length; i++) {
        if (!this.deepEqual(a[i], b[i])) return false;
      }
      return true;
    } else {
      // Compare object keys
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);
      if (keysA.length !== keysB.length) return false;

      // Compare each key's value
      for (const key of keysA) {
        if (!Object.prototype.hasOwnProperty.call(b, key)) {
          return false;
        }
        if (!this.deepEqual(a[key], b[key])) {
          return false;
        }
      }
      return true;
    }
  }

  // Otherwise, they're different primitives (e.g. number vs. string)
  return false;
};

JSON.delete = function({ obj, key }: { obj: JSONObject, key: string }): JSONObject {
  // Ensure it's an object and not null
  if (!JSON.is(obj)) return obj;

  // If the key exists at the current level, delete it
  if (Object.prototype.hasOwnProperty.call(obj, key)) {
    delete obj[key];
  }

  // Recursively check nested objects and arrays
  for (const key in obj) {
    if (typeof obj[key] === 'object') {
      obj[key] = this.delete({ obj: obj[key], key });
    }
  }

  return obj;
};

JSON.canonicalization = new Canonicalization();
JSON.patch = new Patch();

Date.prototype.getUTCDateTime = function (): string {
  return `${this.toISOString().slice(0, -5)}Z`;
};

Date.prototype.toUnix = function (): number {
  const time = this.getTime();
  if (isNaN(time)) {
    throw new Error(`Invalid date string: "${this}"`);
  }
  return time;
};

String.prototype.toSnake = function (): string {
  return this
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .toLowerCase();
};

String.prototype.toSnakeScream = function (): string {
  return this.toSnake().toUpperCase();
};

export default global;