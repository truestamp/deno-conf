import {
  dirname as pathDirname,
  resolve as pathResolve,
} from "https://deno.land/std@0.97.0/path/mod.ts";

import envPaths from "https://raw.githubusercontent.com/truestamp/deno-app-paths/main/mod.ts";

const plainObject = () => Object.create(null);
const INTERNAL_KEY = "__internal__";

export interface ConfigParameters {
  projectName: string;
  configName?: string;
  fileExtension?: string;
  clearInvalidConfig?: boolean;
  defaults?: Record<string, unknown> | null;
}

const checkValueType = (key: string, value: any) => {
  const nonJsonTypes = ["undefined", "symbol", "function"];

  const type = typeof value;

  if (nonJsonTypes.includes(type)) {
    throw new TypeError(
      `Setting a value of type \`${type}\` for key \`${key}\` is not allowed as it's not supported by JSON`,
    );
  }
};

export default class Config {
  private _options: ConfigParameters = {
    projectName: "",
    configName: "config",
    fileExtension: "json",
    clearInvalidConfig: true,
    defaults: null,
  };

  defaultValues: Record<string, unknown> = {};

  serialize: (value: string) => string = (value: string) =>
    JSON.stringify(value, null, 2);
  deserialize: (text: string) => Record<string, unknown> = JSON.parse;

  path: string;

  constructor(options: ConfigParameters) {
    this._options = {
      ...this._options,
      ...options,
    };

    // Did we provided default value for our configs?
    if (this._options.defaults) {
      this.defaultValues = this._options.defaults;
    }

    const dottedfileExtension = this._options.fileExtension
      ? `.${this._options.fileExtension}`
      : "";

    if (!this._options.projectName || this._options.projectName.trim() === "") {
      throw new Error("the projectName option must be provided and non-empty");
    }

    this._options.projectName = this._options.projectName.trim();

    this.path = pathResolve(
      envPaths(this._options.projectName).config,
      `${this._options.configName}${dottedfileExtension}`,
    );
  }

  private _ensureDirectory() {
    // Ensure the directory exists as it could have been deleted in the meantime.
    Deno.mkdirSync(pathDirname(this.path), { recursive: true });
  }

  private _write(value: string) {
    const encoder = new TextEncoder();
    const data = encoder.encode(this.serialize(value));
    try {
      Deno.writeFileSync(this.path, data);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  private _containsReservedKey(key: string) {
    if (typeof key === "object") {
      const firstKey = Object.keys(key)[0];

      if (firstKey === INTERNAL_KEY) {
        return true;
      }
    }

    if (typeof key !== "string") {
      return false;
    }

    return false;
  }

  has(key: string) {
    return key in this.store;
  }

  reset(...keys: string[]) {
    if (!this.defaultValues) {
      return;
    }

    for (const key of keys) {
      this.set(key, this.defaultValues[key]);
    }
  }

  delete(key: string) {
    const { store } = this;
    delete store[key];
    this.store = store;
  }

  clear() {
    this.store = plainObject();
  }

  get size() {
    return Object.keys(this.store).length;
  }

  get store() {
    try {
      const decoder = new TextDecoder("utf-8");
      const dataBin = Deno.readFileSync(this.path);
      const data = this.deserialize(decoder.decode(dataBin));
      return Object.assign(plainObject(), data);
    } catch (error) {
      // if nothing is found, return plain object
      if (error.name === "NotFound") {
        this._ensureDirectory();
        return plainObject();
      }

      throw error;
    }
  }

  set store(value) {
    this._ensureDirectory();
    this._write(value);
  }

  get options() {
    return this._options;
  }

  get(key: string, defaultValue: any = null) {
    return key in this.store ? this.store[key] : defaultValue;
  }

  set(key: string, value: any) {
    if (typeof key !== "string" && typeof key !== "object") {
      throw new TypeError(
        `Expected \`key\` to be of type \`string\` or \`object\`, got ${typeof key}`,
      );
    }

    if (typeof key !== "object" && value === undefined) {
      throw new TypeError("Use `delete()` to clear values");
    }

    if (this._containsReservedKey(key)) {
      throw new TypeError(
        `Please don't use the '${INTERNAL_KEY}' key, as it's used to manage this module's internal operations.`,
      );
    }

    const { store } = this;

    const set = (key: string, value: any) => {
      checkValueType(key, value);
      store[key] = value;
    };

    if (typeof key === "object") {
      const object = key;
      for (const [key, value] of Object.entries(object)) {
        set(key, value);
      }
    } else {
      set(key, value);
    }

    this.store = store;
  }

  *[Symbol.iterator]() {
    for (const [key, value] of Object.entries(this.store)) {
      yield [key, value];
    }
  }
}
