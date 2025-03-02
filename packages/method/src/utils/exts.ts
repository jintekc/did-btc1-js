export type Maybe<T> = T | any;
export type JSONObject = Record<string | number | symbol, any>; // JSON object: prototyped or unprototyped
export type Prototyped = JSONObject;
export type Unprototyped = JSONObject;

/** Extend the global namespace */
declare global {
    /** Extend the Array Object class interface */
    interface Array<T> {
        /** Get the last element of the array */
        last(): T | undefined;
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
    }
}

Object.defineProperty(Array.prototype, '-1', {
  get() {
    return this[this.length - 1];
  },
  enumerable   : false,
  configurable : true
});

Array.prototype.last = function <T>(): T | undefined {
  return this[this.length - 1];
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
    throw new Error('The object is not raw');
  }
};

export default global;