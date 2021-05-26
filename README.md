# conf

Simple config handling for your app or module

[![Test CI](https://github.com/lemarier/deno-conf/workflows/Test%20CI/badge.svg)](https://github.com//lemarier/deno-conf/actions)

```ts
import Conf from "https://deno.land/x/conf/mod.ts"

const config = new Conf({
  projectName: "test",
})

config.set("unicorn", "🦄")
console.log(config.get("unicorn"))
//=> '🦄'

config.delete("unicorn")
console.log(config.get("unicorn"))
//=> undefined
```

## API

Changes are written to disk atomically, so if the process crashes during a write, it will not corrupt the existing config.

### Conf(options?)

Returns a new instance.

### options

Type: `object`

#### defaults

Type: `object`

Default values for the config items.

#### configName

Type: `string`\
Default: `'config'`

Name of the config file (without extension).

Useful if you need multiple config files for your app or module. For example, different config files between two major versions.

#### projectName

Type: `string`\
\*Required

#### cwd

Type: `string`\
Default: System default [user config directory](https://github.com/lemarier/deno-env-paths#pathsconfig)

**You most likely don't need this. Please don't use it unless you really have to. By default, it will pick the optimal location by adhering to system conventions. You are very likely to get this wrong and annoy users.**

Overrides `projectName`.

The only use-case I can think of is having the config located in the app directory or on some external storage.

#### fileExtension

Type: `string`\
Default: `'json'`

Extension of the config file.

You would usually not need this, but could be useful if you want to interact with a file with a custom file extension that can be associated with your app. These might be simple save/export/preference files that are intended to be shareable or saved outside of the app.

#### clearInvalidConfig

Type: `boolean`\
Default: `true`

The config is cleared if reading the config file causes a `SyntaxError`. This is a good default, as the config file is not intended to be hand-edited, so it usually means the config is corrupt and there's nothing the user can do about it anyway. However, if you let the user edit the config file directly, mistakes might happen and it could be more useful to throw an error when the config is invalid instead of clearing. Disabling this option will make it throw a `SyntaxError` on invalid config instead of clearing.

#### serialize

Type: `Function`\
Default: `value => JSON.stringify(value, null, '\t')`

Function to serialize the config object to a UTF-8 string when writing the config file.

You would usually not need this, but it could be useful if you want to use a format other than JSON.

#### deserialize

Type: `Function`\
Default: `JSON.parse`

Function to deserialize the config object from a UTF-8 string when reading the config file.

You would usually not need this, but it could be useful if you want to use a format other than JSON.

### Instance

The instance is [`iterable`](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Iteration_protocols) so you can use it directly in a [`for…of`](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Statements/for...of) loop.

#### .set(key, value)

Set an item.

The `value` must be JSON serializable. Trying to set the type `undefined`, `function`, or `symbol` will result in a TypeError.

#### .set(object)

Set multiple items at once.

#### .get(key, defaultValue?)

Get an item or `defaultValue` if the item does not exist.

#### .reset(...keys)

Reset items to their default values, as defined by the `defaults` or `schema` option.

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

Inspired by [conf](https://github.com/sindresorhus/conf) from [sindresorhus](https://github.com/sindresorhus).
