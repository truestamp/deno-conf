import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import Conf from "./mod.ts";

const projectName: string = "test";

// Make sure the class works fine
new Conf({ projectName, configName: "test" });
new Conf({ projectName, cwd: "" });
new Conf({ projectName, fileExtension: "foo" });
new Conf({ projectName, clearInvalidConfig: false });
new Conf({ projectName, serialize: (_: any) => "foo" });
new Conf(
  {
    projectName,
    deserialize: (_: string) => ({ foo: "foo", unicorn: true }),
  },
);
new Conf({ projectName, projectSuffix: "foo" });
new Conf({ projectName, accessPropertiesByDotNotation: false });

// Make our tests
Deno.test("set values", () => {
  const conf = new Conf({ projectName });

  conf.set("hello", 1);
  conf.set("unicorn", false);
  conf.set("foo", "bar");
  assertEquals(conf.get("hello"), 1);
  assertEquals(conf.get("unicorn"), false);
  assertEquals(conf.get("foo"), "bar");
});

Deno.test("delete single element", () => {
  const conf = new Conf({ projectName });
  assertEquals(conf.get("hello"), 1);
  conf.delete("hello");
  assertEquals(conf.get("hello"), null);
});

Deno.test("clear whole database", () => {
  const conf = new Conf({ projectName });
  assertEquals(conf.get("foo"), "bar");
  conf.clear();
  assertEquals(conf.get("hello"), null);
  assertEquals(conf.get("unicorn"), null);
  assertEquals(conf.get("foo"), null);
});
