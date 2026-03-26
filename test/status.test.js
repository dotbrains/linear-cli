const assert = require("node:assert/strict");
const test = require("node:test");
const {
  createProgram,
  loadCommandModule,
  run,
} = require("../test-utils/command-test-utils");

test("status command calls the expected status endpoint", async () => {
  let request;
  let printed;
  const mod = loadCommandModule("status.js", {
    STATUS_HOST: "status.linear.test",
    httpGet: async (host, pathName) => {
      request = { host, pathName };
      return JSON.stringify({ ok: true });
    },
    printJson: (data) => {
      printed = data;
    },
  });

  try {
    const program = createProgram();
    mod.registerStatus(program);
    await run(program, ["status"]);

    assert.deepEqual(request, {
      host: "status.linear.test",
      pathName: "/api/statuspage",
    });
    assert.deepEqual(printed, { ok: true });
  } finally {
    mod.restore();
  }
});

test("status command propagates httpGet errors", async () => {
  let printed = false;
  const mod = loadCommandModule("status.js", {
    httpGet: async () => {
      throw new Error("network down");
    },
    printJson: () => {
      printed = true;
    },
  });

  try {
    const program = createProgram();
    mod.registerStatus(program);
    await assert.rejects(() => run(program, ["status"]), /network down/);
    assert.equal(printed, false);
  } finally {
    mod.restore();
  }
});

test("status command fails on invalid JSON response", async () => {
  let printed = false;
  const mod = loadCommandModule("status.js", {
    httpGet: async () => "not-json",
    printJson: () => {
      printed = true;
    },
  });

  try {
    const program = createProgram();
    mod.registerStatus(program);
    await assert.rejects(() => run(program, ["status"]), /JSON|Unexpected token/i);
    assert.equal(printed, false);
  } finally {
    mod.restore();
  }
});
