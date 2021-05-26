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

#### projectName

Type: `string`\
\*Required

The `projectName` is a required config parameter and must be a non-empty `string`. Any leading or trailing whitespace will be removed.

#### configName

Type: `string`\
Default: `'config'`

Name of the config file (without extension).

Useful if you need multiple config files for your app or module. For example, different config files between two major versions.

#### fileExtension

Type: `string`\
Default: `'json'`

Extension of the config file.

You would usually not need this, but could be useful if you want to interact with a file with a custom file extension that can be associated with your app. These might be simple save/export/preference files that are intended to be shareable or saved outside of the app.

#### defaults

Type: `object`\
Default: `null`

Default values for the config items. If provided, and if `reset` is called, the config store will be reset to this object's values.

#### clearInvalidConfig

Type: `boolean`\
Default: `true`

The config is cleared if reading the config file causes a `SyntaxError`. This is a good default, as the config file is not intended to be hand-edited, so it usually means the config is corrupt and there's nothing the user can do about it anyway. However, if you let the user edit the config file directly, mistakes might happen and it could be more useful to throw an error when the config is invalid instead of clearing. Disabling this option will make it throw a `SyntaxError` on invalid config instead of clearing.

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

Reset items to their default values, as defined by the `defaults` option.

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
