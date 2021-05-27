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
  defaultValues: Record<string, string | number | boolean | null>
  path: string
  has(key: string): boolean
  reset(): void
  resetKeys(keys: string[]): void
  delete(key: string): void
  clear(): void
  get size(): number
  get store()
  set store(value)
  get options(): ConfigParameters
  get(key: string)
  set(key: string, value: Record<string, boolean | null | number | string> | boolean | null | number | string)
  setObject(obj: Record<string, boolean | null | number | string>)
  *[Symbol.iterator]()

interface ConfigParameters

  projectName: string
  configName?: string
  resetInvalidConfig?: boolean
  defaults?: Record<string, string | number | boolean | null> | null
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

#### .clear()

Delete all items.

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
