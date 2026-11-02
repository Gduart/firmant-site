/* eslint-disable @typescript-eslint/no-require-imports -- Executa o patch com filesystem isolado. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");
const patchSource = fs.readFileSync(path.join(__dirname, "patch-opennext-worker-sockets.cjs"), "utf8");
function patch(input) {
  let output = input;
  vm.runInNewContext(patchSource, {
    require(name) {
      if (name === "path") return path;
      assert.equal(name, "fs");
      return { existsSync: file => file.endsWith("handler.mjs"), readFileSync: () => output, writeFileSync: (_file, value) => { output = value; } };
    },
    process: { cwd: () => "/repo" }, console: { log() {}, warn() {} },
  });
  return output;
}
for (const strict of [false, true]) {
  test(`socket export funciona no wrapper ${strict ? "com use strict" : "legado"}`, () => {
    const input = `const modules={42893:a2=>{${strict ? '"use strict";' : ""}a2.exports=require("cloudflare:sockets")}}; const m={exports:{}}; modules[42893](m); globalThis.connection=m.exports.connect();`;
    const output = patch(input);
    assert.ok(!output.includes('require("cloudflare:sockets")'));
    const context = { __firmantCloudflareSocketConnect: () => "connected" };
    vm.runInNewContext(output.replace(/^import[^\n]+\n/, ""), context);
    assert.equal(context.connection, "connected");
    assert.equal(patch(output), output, "reaplicar o patch não duplica imports");
  });
}
