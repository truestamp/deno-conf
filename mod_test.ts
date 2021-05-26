import {
  assertEquals,
  assertObjectMatch,
  assertThrows,
} from "https://deno.land/std@0.97.0/testing/asserts.ts";
import { existsSync } from "https://deno.land/std@0.97.0/fs/exists.ts";

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

  // console.log(confConfig);

  const conf = new Conf(confConfig);

  // just in case
  if (existsSync(conf.path)) {
    Deno.removeSync(conf.path, { recursive: true });
  }

  return conf;
};

// IMPORTANT : Call at the end of EVERY test
// Cleanup old conf files at the end of a test
const cleanupTestConf = (conf: Conf) => {
  if (conf && conf.path && existsSync(conf.path)) {
    Deno.removeSync(conf.path, { recursive: true });
  }
};

Deno.test("instantiate class with projectName", () => {
  const conf = genTestConf({ projectName });
  cleanupTestConf(conf);
});

Deno.test("instantiate class with no projectName throws", () => {
  assertThrows(
    () => {
      genTestConf({ projectName: null });
    },
    Error,
    "Project name could not be inferred. Please specify the `projectName` option.",
  );
});

Deno.test("instantiate class with configName", () => {
  const conf = genTestConf({
    projectName,
    configName: genTestConfRandomName(),
  });
  cleanupTestConf(conf);
});

Deno.test("instantiate class with empty cwd", () => {
  const conf = genTestConf({
    projectName,
    cwd: "",
  });
  cleanupTestConf(conf);
});

Deno.test("instantiate class with fileExtension", () => {
  const conf = genTestConf({
    projectName,
    fileExtension: "foo",
  });
  cleanupTestConf(conf);
});

Deno.test("instantiate class with clearInvalidConfig", () => {
  const conf = genTestConf({
    projectName,
    clearInvalidConfig: false,
  });
  cleanupTestConf(conf);
});

Deno.test("set all value types", () => {
  const conf = genTestConf();

  conf.set("number", 1); // number
  conf.set("boolean", false); // boolean
  conf.set("string", "bar"); // string
  conf.set("unicorn", "🦄"); // unicode string

  const testObj = { onumber: 1, oboolean: true, ostring: "bar" };
  conf.set("object", testObj);

  assertEquals(conf.get("number"), 1);
  assertEquals(conf.get("boolean"), false);
  assertEquals(conf.get("string"), "bar");
  assertEquals(conf.get("unicorn"), "🦄");
  assertObjectMatch(conf.get("object"), testObj);

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

Deno.test("clear config store", () => {
  const conf = genTestConf();

  conf.set("foo", "bar");
  assertEquals(conf.get("foo"), "bar");
  conf.clear();
  assertEquals(conf.get("foo"), null);

  cleanupTestConf(conf);
});

Deno.test("reset values to defaults", () => {
  const conf = genTestConf({
    projectName,
    defaults: { foo: "old", bar: "old" },
  });

  conf.set("untouched", true);

  // the default values should not be active
  assertEquals(conf.get("untouched"), true);
  assertEquals(conf.get("foo"), null);
  assertEquals(conf.get("bar"), null);

  conf.set("foo", "new");
  assertEquals(conf.get("foo"), "new");

  conf.set("bar", "new");
  assertEquals(conf.get("foo"), "new");

  conf.reset("foo", "bar");
  assertEquals(conf.get("untouched"), true);
  assertEquals(conf.get("foo"), "old");
  assertEquals(conf.get("bar"), "old");

  cleanupTestConf(conf);
});
