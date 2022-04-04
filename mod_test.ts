import {
  assertEquals,
  assertStringIncludes,
  assertThrows,
} from "https://deno.land/std@0.133.0/testing/asserts.ts";

import Conf from "./mod.ts";
import { ConfigParameters } from "./mod.ts";

// This test runner will actually write to this file. It MUST be cleared between
// each run to avoid leakage of data between tests.
const projectName = "deno-conf-test-runner";

const genTestConfRandomName = () => {
  const random = Math.random().toString(36).substr(2);
  return `config-${random}`;
};

// IMPORTANT : Call at the beginning of EVERY test
// Generate a new unique config for each test run to avoid
// any possible interference between tests
const genTestConf = (
  confConfig: ConfigParameters = { projectName },
) => {
  // give each test config file its own random filename
  if (!confConfig.configName) {
    confConfig.configName = genTestConfRandomName();
  }

  const conf = new Conf(confConfig);

  // just in case
  try {
    Deno.removeSync(conf.path, { recursive: true });
  } catch (_error) {
    // no-op
  }

  return conf;
};

// IMPORTANT : Call at the end of EVERY test
// Cleanup old conf files at the end of a test
const cleanupTestConf = (conf: Conf) => {
  try {
    Deno.removeSync(conf.path, { recursive: true });
  } catch (_error) {
    // no-op
  }
};

Deno.test("instantiate class with projectName", () => {
  const conf = genTestConf({ projectName });
  cleanupTestConf(conf);
});

Deno.test("instantiate class with projectName with spaces should be trimmed", () => {
  const randomProjectName = genTestConfRandomName();
  const conf = genTestConf({ projectName: " " + randomProjectName + " " });
  assertEquals(conf.options.projectName, randomProjectName);

  cleanupTestConf(conf);
});

Deno.test("instantiate class with empty projectName throws", () => {
  assertThrows(
    () => {
      genTestConf({ projectName: " " });
    },
    Error,
    "the projectName option must be provided and non-empty",
  );
});

Deno.test("instantiate class with configName", () => {
  const conf = genTestConf({
    projectName,
    configName: genTestConfRandomName(),
  });
  cleanupTestConf(conf);
});

Deno.test("instantiate class with resetInvalidConfig", () => {
  const conf = genTestConf({
    projectName,
    resetInvalidConfig: false,
  });
  cleanupTestConf(conf);
});

Deno.test("the conf should be iterable", () => {
  const conf = genTestConf();

  conf.set("numberZero", 0); // number
  conf.set("numberOne", 1); // number
  conf.set("booleanTrue", true); // boolean
  conf.set("booleanFalse", false); // boolean
  conf.set("string", "bar"); // string
  conf.set("unicorn", "🦄"); // unicode string

  const testObj = { onumber: 1, oboolean: true, ostring: "bar" };
  conf.set("object", testObj);

  let iterableSize = 0;

  // exercise the iterable
  for (const item of conf) {
    iterableSize += 1;
  }

  // the number of iterated items should equal the size
  assertEquals(iterableSize, conf.size);

  cleanupTestConf(conf);
});

Deno.test("set all value types", () => {
  const conf = genTestConf();

  conf.set("numberZero", 0); // number
  conf.set("numberOne", 1); // number
  conf.set("booleanTrue", true); // boolean
  conf.set("booleanFalse", false); // boolean
  conf.set("string", "bar"); // string
  conf.set("unicorn", "🦄"); // unicode string

  const testObj = { onumber: 1, oboolean: true, ostring: "bar" };
  conf.set("object", testObj);

  assertEquals(conf.get("numberZero"), 0);
  assertEquals(conf.get("numberOne"), 1);
  assertEquals(conf.get("booleanTrue"), true);

  assertEquals(conf.get("booleanFalse"), false);
  assertEquals(conf.get("string"), "bar");
  assertEquals(conf.get("unicorn"), "🦄");
  assertEquals(conf.get("object"), testObj);

  cleanupTestConf(conf);
});

Deno.test("set all value types as an Object", () => {
  const conf = genTestConf();

  const testObj = { onumber: 1, oboolean: true, ostring: "bar" };

  conf.setObject({
    numberZero: 0,
    numberOne: 1,
    booleanTrue: true,
    booleanFalse: false,
    stringBar: "bar",
    unicorn: "🦄",
    object: testObj,
  });

  assertEquals(conf.get("numberZero"), 0);
  assertEquals(conf.get("numberOne"), 1);
  assertEquals(conf.get("booleanTrue"), true);

  assertEquals(conf.get("booleanFalse"), false);
  assertEquals(conf.get("stringBar"), "bar");
  assertEquals(conf.get("unicorn"), "🦄");
  assertEquals(conf.get("object"), testObj);

  cleanupTestConf(conf);
});

Deno.test("set single nested Object", () => {
  const conf = genTestConf();

  const testObjInner = {
    onumber: 1,
    oboolean: true,
    ostring: "bar",
    onull: null,
    oarray: ["string", 1, true, false, null],
  };

  const testObjOuter = {
    onumber: 1,
    oboolean: true,
    ostring: "bar",
    nested: testObjInner,
  };

  conf.setObject({
    object: testObjOuter,
  });

  assertEquals(conf.get("object"), testObjOuter);

  cleanupTestConf(conf);
});

Deno.test("set deeply nested Object", () => {
  const conf = genTestConf();

  const deeplyNestedObj = {
    one: {
      two: {
        three: {
          four: {
            five: {
              six: {
                seven: {
                  eight: {
                    nine: {
                      ten: {
                        foo: "bar",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    }
  }

  conf.setObject({ object: deeplyNestedObj });

  assertEquals(conf.get("object"), deeplyNestedObj);

  cleanupTestConf(conf);
});

Deno.test("delete a value", () => {
  const conf = genTestConf();

  conf.set("hello", 1); // number
  assertEquals(conf.get("hello"), 1);
  conf.delete("hello");
  assertEquals(conf.get("hello"), null);

  cleanupTestConf(conf);
});

Deno.test("get size", () => {
  const conf = genTestConf();

  conf.set("foo", "bar");
  assertEquals(conf.get("foo"), "bar");
  assertEquals(conf.size, 1);

  conf.set("bar", "foo");
  assertEquals(conf.get("bar"), "foo");
  assertEquals(conf.size, 2);

  cleanupTestConf(conf);
});

Deno.test("get path", () => {
  const conf = genTestConf();
  assertStringIncludes(conf.path, projectName);

  cleanupTestConf(conf);
});

Deno.test("get dir", () => {
  const conf = genTestConf();
  assertStringIncludes(conf.dir, projectName);

  cleanupTestConf(conf);
});

Deno.test("has key", () => {
  const conf = genTestConf();

  conf.set("foo", "bar");
  assertEquals(conf.has("foo"), true);

  conf.set("bar", "foo");
  assertEquals(conf.has("bar"), true);

  // returns false for a missing key
  assertEquals(conf.has("zoo"), false);

  cleanupTestConf(conf);
});

Deno.test("reset without use of default values", () => {
  const conf = genTestConf({
    projectName,
  });

  conf.set("foo", "new");
  assertEquals(conf.get("foo"), "new");

  conf.set("bar", "new");
  assertEquals(conf.get("bar"), "new");

  // reset and delete conf file
  conf.reset();

  // default values should be set back to defaults
  assertEquals(conf.get("foo"), null);
  assertEquals(conf.get("bar"), null);

  cleanupTestConf(conf);
});

Deno.test("reset all values that have defaults to defaults", () => {
  const conf = genTestConf({
    projectName,
    defaults: { foo: "old", bar: "old" },
  });

  conf.set("untouched", true);

  // the default values should also be active
  assertEquals(conf.get("untouched"), true);
  assertEquals(conf.get("foo"), "old");
  assertEquals(conf.get("bar"), "old");

  conf.set("foo", "new");
  assertEquals(conf.get("foo"), "new");

  conf.set("bar", "new");
  assertEquals(conf.get("bar"), "new");

  // reset and delete conf file
  conf.reset();

  // non-default values should now be null
  assertEquals(conf.get("untouched"), null);

  // default values should be set back to defaults
  assertEquals(conf.get("foo"), "old");
  assertEquals(conf.get("bar"), "old");

  cleanupTestConf(conf);
});

Deno.test("reset existing specific keys without use of default values", () => {
  const conf = genTestConf({
    projectName,
  });

  conf.set("foo", "new");
  assertEquals(conf.get("foo"), "new");

  conf.set("bar", "new");
  assertEquals(conf.get("bar"), "new");

  // reset and delete conf file
  conf.resetKeys(["foo"]);

  // only the specific key(s) should be set back to null
  assertEquals(conf.get("foo"), "new");
  assertEquals(conf.get("bar"), "new");

  cleanupTestConf(conf);
});

Deno.test("reset non-existing specific keys without use of default values", () => {
  const conf = genTestConf({
    projectName,
  });

  conf.set("foo", "new");

  // reset and delete conf file
  conf.resetKeys(["bar"]);

  // only the specific key(s) should be set back to null
  assertEquals(conf.get("foo"), "new");
  assertEquals(conf.get("bar"), null);

  cleanupTestConf(conf);
});

Deno.test("reset specific key values to defaults", () => {
  const conf = genTestConf({
    projectName,
    defaults: { foo: "old", bar: "old", baz: "old" },
  });

  conf.set("untouched", true);

  // the default values should also be active
  assertEquals(conf.get("untouched"), true);
  assertEquals(conf.get("foo"), "old");
  assertEquals(conf.get("bar"), "old");
  assertEquals(conf.get("baz"), "old");

  conf.set("foo", "new");
  assertEquals(conf.get("foo"), "new");

  conf.set("bar", "new");
  assertEquals(conf.get("bar"), "new");

  conf.set("baz", "new");
  assertEquals(conf.get("baz"), "new");

  // multi keys
  conf.resetKeys(["foo", "bar"]);
  assertEquals(conf.get("untouched"), true);
  assertEquals(conf.get("foo"), "old");
  assertEquals(conf.get("bar"), "old");
  assertEquals(conf.get("baz"), "new");

  // single key
  conf.resetKeys(["baz"]);
  assertEquals(conf.get("baz"), "old");

  cleanupTestConf(conf);
});

Deno.test("reading an invalid config with 'resetInvalidConfig: true' should reset to defaults if they exist", () => {
  const conf = genTestConf({
    projectName,
    defaults: { foo: "old", bar: "old", baz: "old" },
    resetInvalidConfig: true,
  });

  // write and read from original config OK
  conf.set("foo", "new");
  assertEquals(conf.get("foo"), "new");

  // corrupt the JSON file
  Deno.writeTextFileSync(conf.path, "broken-json");

  assertEquals(conf.get("foo"), "old");
  assertEquals(conf.get("bar"), "old");
  assertEquals(conf.get("baz"), "old");

  cleanupTestConf(conf);
});

Deno.test("reading an invalid config with 'resetInvalidConfig: false' should throw", () => {
  const conf = genTestConf({
    projectName,
    defaults: { foo: "old", bar: "old", baz: "old" },
    resetInvalidConfig: false,
  });

  // write a non-parseable JSON file
  Deno.writeTextFileSync(conf.path, "broken-json");

  assertThrows(
    () => {
      conf.get("foo");
    },
    Error,
    "Unexpected token b in JSON at position 0",
  );

  cleanupTestConf(conf);
});

Deno.test("directly store an object to the store where the config dir doesn't exist", () => {
  // change the project name to ensure we're not
  // sharing a config dir with other running tests.
  const conf = genTestConf({
    projectName: projectName + "-delete-dir",
  });

  // ensure the test dir doesn't exist
  try {
    Deno.removeSync(conf.dir, { recursive: true });
  } catch (_error) {
    // no-op
  }

  conf.store = { foo: "bar" };

  assertEquals(conf.get("foo"), "bar");

  // cleanup the special test dir
  Deno.removeSync(conf.dir, { recursive: true });

  cleanupTestConf(conf);
});

Deno.test("store should return default values merged with actual values that have been set", () => {
  const conf = genTestConf({
    projectName,
    defaults: { adefault: "stuff" },
  });

  conf.set("bar", "baz");

  assertEquals(conf.get("adefault"), "stuff");
  assertEquals(conf.get("bar"), "baz");

  cleanupTestConf(conf);
});

Deno.test("store should return default values even if nothing else was set", () => {
  const conf = genTestConf({
    projectName,
    defaults: { adefault: "stuff" },
  });

  assertEquals(conf.get("adefault"), "stuff");

  cleanupTestConf(conf);
});

Deno.test("store should return empty object even if nothing else was set", () => {
  const conf = genTestConf({
    projectName,
  });

  assertEquals(conf.store, {});

  cleanupTestConf(conf);
});
