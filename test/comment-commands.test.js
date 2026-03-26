const assert = require("node:assert/strict");
const test = require("node:test");
const {
  createProgram,
  loadCommandModule,
  run,
} = require("../test-utils/command-test-utils");

test("comment-add maps issue id and body", async () => {
  let receivedInput;
  let printed;
  const client = {
    createComment: async (input) => {
      receivedInput = input;
      return { comment: { id: "c-1", ...input } };
    },
  };
  const mod = loadCommandModule("comments.js", {
    createClient: () => client,
    printJson: (data) => {
      printed = data;
    },
  });

  try {
    const program = createProgram();
    mod.registerComments(program);
    await run(program, ["comment-add", "ENG-1", "--body", "looks good"]);
    assert.deepEqual(receivedInput, { issueId: "ENG-1", body: "looks good" });
    assert.deepEqual(printed, { id: "c-1", issueId: "ENG-1", body: "looks good" });
  } finally {
    mod.restore();
  }
});

test("comment-edit maps comment id and body", async () => {
  let received;
  let printed;
  const client = {
    updateComment: async (id, input) => {
      received = { id, input };
      return { comment: { id, ...input } };
    },
  };
  const mod = loadCommandModule("comments.js", {
    createClient: () => client,
    printJson: (data) => {
      printed = data;
    },
  });

  try {
    const program = createProgram();
    mod.registerComments(program);
    await run(program, ["comment-edit", "comment-1", "--body", "updated"]);
    assert.deepEqual(received, { id: "comment-1", input: { body: "updated" } });
    assert.deepEqual(printed, { id: "comment-1", body: "updated" });
  } finally {
    mod.restore();
  }
});

test("comment-delete calls deleteComment", async () => {
  let receivedId;
  let printed;
  const client = {
    deleteComment: async (id) => {
      receivedId = id;
      return { success: true };
    },
  };
  const mod = loadCommandModule("comments.js", {
    createClient: () => client,
    printJson: (data) => {
      printed = data;
    },
  });

  try {
    const program = createProgram();
    mod.registerComments(program);
    await run(program, ["comment-delete", "comment-1"]);
    assert.equal(receivedId, "comment-1");
    assert.deepEqual(printed, { success: true });
  } finally {
    mod.restore();
  }
});

test("comment-get fetches by id object", async () => {
  let receivedInput;
  let printed;
  const client = {
    comment: async (input) => {
      receivedInput = input;
      return { id: input.id, body: "hi" };
    },
  };
  const mod = loadCommandModule("comments.js", {
    createClient: () => client,
    printJson: (data) => {
      printed = data;
    },
  });

  try {
    const program = createProgram();
    mod.registerComments(program);
    await run(program, ["comment-get", "comment-1"]);
    assert.deepEqual(receivedInput, { id: "comment-1" });
    assert.deepEqual(printed, { id: "comment-1", body: "hi" });
  } finally {
    mod.restore();
  }
});

for (const [command, method] of [
  ["comment-resolve", "commentResolve"],
  ["comment-unresolve", "commentUnresolve"],
]) {
  test(`${command} returns updated comment`, async () => {
    let receivedId;
    let printed;
    const client = {
      [method]: async (id) => {
        receivedId = id;
        return { comment: Promise.resolve({ id, state: method }) };
      },
    };
    const mod = loadCommandModule("comments.js", {
      createClient: () => client,
      printJson: (data) => {
        printed = data;
      },
    });

    try {
      const program = createProgram();
      mod.registerComments(program);
      await run(program, [command, "comment-1"]);
      assert.equal(receivedId, "comment-1");
      assert.deepEqual(printed, { id: "comment-1", state: method });
    } finally {
      mod.restore();
    }
  });
}
