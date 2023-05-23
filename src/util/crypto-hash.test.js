const cryptHash = require("./crypto-hash.js");

describe("crypto-hash()", () => {
  it("will return a SHA-256 hashed output", () => {
    expect(cryptHash("foo")).toBe(
      "b2213295d564916f89a6a42455567c87c3f480fcd7a1c15e220f17d7169a790b"
    );
  });
  it("it will take parameters in any order and produce the same result", () => {
    expect(cryptHash("one", "two", "three")).toBe(
      cryptHash("three", "one", "two")
    );
  });

  it("produces a unique hash when the properties have changed on an input", () => {
    const foo = {};
    const originalHash = cryptHash(foo);
    foo["a"] = "a";

    expect(cryptHash(foo)).not.toEqual(originalHash);
  });
});
