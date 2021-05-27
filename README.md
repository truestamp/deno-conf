# conf

Simple config handling for your app or module

[![Test CI](https://github.com/lemarier/deno-conf/workflows/Test%20CI/badge.svg)](https://github.com//lemarier/deno-conf/actions)

## Example

```ts
import Conf from "https://raw.githubusercontent.com/truestamp/deno-conf/main/mod.ts"

const config = new Conf({
  projectName: "com.yourorg.yourapp",
})

config.set("unicorn", "🦄")
console.log(config.get("unicorn"))
//=> '🦄'

config.delete("unicorn")
console.log(config.get("unicorn"))
//=> null
```

## API

```ts
class default

  constructor(options: ConfigParameters)
  defaultValues: StoreType
  path: string
  get size(): number
    Get the number of config items stored.
    @returns {number} The count of config items
  get dir(): string
    Get the path of the config directory.
    @returns {string} The directory portion of the config path
  get store(): StoreType
    Get the contents of the config store.
    @returns {StoreType} The config store
  set store(data: StoreType)
    Set the contents of the config store to an Object.

    @param {StoreType} data
    @returns {void}
  get options(): ConfigParameters
    Get the config store parameters.

    @returns {ConfigParameters}
  has(key: string): boolean
    Returns boolean whether `key` is present in the config store.

    @param {string} key The key to search for.
    @returns {boolean} Key exists in config store?
  reset(): void
    Destructively removes any existing config file and resets all
    keys to defaults if present, writing them to a new config.

    If no defaults are present no new config file will be created.

    @returns {void}
  resetKeys(keys: string[]): void
    Destructively reset one or more keys to defaults if they exist.

    If no defaults are present then this will be a no-op for all
    provided keys.

    If defaults are present then each key that matches one in defaults
    will be overwritten with the default value.

    @param {string[]} keys An Array of string keys to reset to defaults.
    @returns {void}
  delete(key: string): void
    Destructively remove a single item from the config store.

    @param {string} key The key to delete from the config store.
    @returns {void}
  get(key: string): ItemType
    Get a single item from the config store.

    @param {string} key The key to get from the config store.
    @returns {ItemType} A single ItemType item.
  set(key: string, value: ItemType): void
    Set a single item into the config store.

    @param {string} key The key to write to the config store.
    @param {ItemType} value The value to write to the config store.
    @returns {void} void.
  setObject(data: StoreType): void
    Set multiple items into the config store.

    @param {StoreType} data The Object to write to the config store.
    @returns {void} void.
  *[Symbol.iterator]()

interface ConfigParameters

  projectName: string
  configName?: string
  resetInvalidConfig?: boolean
  defaults?: StoreType | null
```

### Conf(options?: ConfigParameters)

Returns a new instance.

### options

Type: `ConfigParameters`

#### projectName

Type: `string`\
\*Required

The `projectName` is a required config parameter and must be a non-empty `string`. Any leading or trailing whitespace will be automatically removed.

#### configName

Type: `string`\
Default: `'config'`

Choose the name of the config file without providing the extension. The `.json` extension will automatically be appended.

Useful if you need multiple config files for your app or module. For example, using different config files between two major versions.

#### defaults

Type: `object`\
Default: `null`

Default values for the config items. If provided, and if `reset` is called, the config store will be reset to this object's values.

#### resetInvalidConfig

Type: `boolean`\
Default: `false`

When trying to read a corrupted JSON config file a `SyntaxError` will be raised.

In this situation if `resetInvalidConfig` is set to `true` then the config file will be destroyed and overwritten with a new config file that only contains the `defaults` (if they were defined).

If `resetInvalidConfig` is `false` and a corrupted file is encountered then no changes will be made to the file and an error will be thrown. This is the safe default and should only be set to `true` if there is no chance of losing important data in the corrupted config.

### Instance

The instance is [`Iterable`](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Iteration_protocols) so you can use it directly in a [`for…of`](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Statements/for...of) loop.

#### .set(key, value)

Set an item.

The `value` must be JSON serializable.

#### .setObject(object)

Set multiple items at once by passing in an object, where each key in the object will be stored in the config.

#### .get(key)

Get an item by its `key`, returning `null` if the `key` doesn't exist.

#### .reset()

Reset **all** items that have matching defaults, as defined by the `defaults` option, to their default values.

This will **DELETE** the entire configuration file if it exists and fill it only with `defaults` if they exist.

#### .resetKeys(string[])

Reset specific item(s) to their default values, as defined by the `defaults` option. Accepts a `string[]` of keys to reset.

If there were no `defaults` defined, or the keys passed in the `string[]` don't match any existing keys then this is a no-op.

#### .has(key)

Check if an item exists.

#### .delete(key)

Delete an item.

#### .size

Get the item count.

#### .store

Get all the config as an object or replace the current config with an object:

```js
conf.store = {
  hello: "world",
}
```

#### .path

Get the path to the config file.

---

Forked from [deno-conf](https://github.com/lemarier/deno-conf)

Inspired by [conf](https://github.com/sindresorhus/conf) from [sindresorhus](https://github.com/sindresorhus).
