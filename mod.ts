import {
  dirname as pathDirname,
  resolve as pathResolve,
} from "https://deno.land/std@0.97.0/path/mod.ts";

import { existsSync } from "https://deno.land/std@0.97.0/fs/exists.ts";

import envPaths from "https://raw.githubusercontent.com/truestamp/deno-app-paths/main/mod.ts";

const plainObject = () => Object.create(null);

export interface ConfigParameters {
  projectName: string;
  configName?: string;
  resetInvalidConfig?: boolean;
  defaults?: Record<string, string | number | boolean | null> | null;
}

export default class Config {
  private _options: ConfigParameters = {
    projectName: "",
    configName: "config",
    resetInvalidConfig: false,
    defaults: null,
  };

  defaultValues: Record<string, string | number | boolean | null> =
    plainObject();

  path: string;

  constructor(options: ConfigParameters) {
    this._options = {
      ...this._options,
      ...options,
    };

    // Were `defaults` provided?
    this.defaultValues = this._options.defaults
      ? this._options.defaults
      : plainObject();

    if (!this._options.projectName || this._options.projectName.trim() === "") {
      throw new Error("the projectName option must be provided and non-empty");
    }

    this._options.projectName = this._options.projectName.trim();

    this.path = pathResolve(
      envPaths(this._options.projectName).config,
      `${this._options.configName}.json`,
    );
  }

  has(key: string): boolean {
    return key in this.store;
  }

  // Reset ALL keys to defaults. Overwrites entire config.
  reset(): void {
    if (this.path && existsSync(this.path)) {
      Deno.removeSync(this.path, { recursive: true });
    }

    if (Object.keys(this.defaultValues).length === 0) {
      return;
    }

    Object.entries(this.defaultValues).forEach(([key, value]) => {
      // console.log(`setting ${key}:${value}`);
      this.set(key, value);
    });

    return;
  }

  // Reset one or more keys to defaults
  // This is a no-op if there are no defaults
  resetKeys(keys: string[]): void {
    if (Object.keys(this.defaultValues).length === 0) {
      return;
    }

    for (const key of keys) {
      this.set(key, this.defaultValues[key]);
    }
  }

  delete(key: string): void {
    const { store } = this;
    delete store[key];
    this.store = store;
  }

  clear(): void {
    this.store = plainObject();
  }

  get size(): number {
    return Object.keys(this.store).length;
  }

  get store() {
    try {
      return JSON.parse(Deno.readTextFileSync(this.path));
    } catch (error) {
      switch (error.name) {
        case "SyntaxError":
          // Unable to read the JSON file. Reset it to defaults if that is the
          // desired behavior.
          if (this._options.resetInvalidConfig) {
            this.reset();
            // FIXME : This should return the full store
            return;
          }
          break;
        case "NotFound":
          return plainObject();
      }

      throw error;
    }
  }

  set store(value) {
    try {
      if (!existsSync(pathDirname(this.path))) {
        Deno.mkdirSync(pathDirname(this.path), { recursive: true });
      }
    } catch (error) {
      // console.log(error.message)
    }

    Deno.writeTextFileSync(this.path, JSON.stringify(value, null, 2));
  }

  get options(): ConfigParameters {
    return this._options;
  }

  get(key: string) {
    if (this.store && key in this.store) {
      return this.store[key];
    } else if (
      this._options.defaults && key in this._options.defaults
    ) {
      return this._options.defaults[key];
    } else {
      return null;
    }
  }

  set(
    key: string,
    value:
      | Record<string, boolean | null | number | string>
      | boolean
      | null
      | number
      | string,
  ) {
    const { store } = this;

    const innerSet = (
      key: string,
      value:
        | Record<string, boolean | null | number | string>
        | boolean
        | null
        | number
        | string,
    ) => {
      // checkValueType(key, value);
      store[key] = value;
    };

    innerSet(key, value);

    this.store = store;
  }

  setObject(
    obj: Record<
      string,
      | boolean
      | null
      | number
      | string
      | Record<string, boolean | null | number | string>
    >,
  ) {
    for (const [key, value] of Object.entries(obj)) {
      this.set(key, value);
    }
  }

  *[Symbol.iterator]() {
    for (const [key, value] of Object.entries(this.store)) {
      yield [key, value];
    }
  }
}
