const assert = require("node:assert/strict");
const test = require("node:test");
const {
  createConnection,
  createProgram,
  expectExit,
  loadCommandModule,
  run,
} = require("../test-utils/command-test-utils");

for (const { command, method } of [
  { command: "issue-delete", method: "deleteIssue" },
  { command: "issue-archive", method: "archiveIssue" },
  { command: "issue-unarchive", method: "unarchiveIssue" },
]) {
  test(`${command} resolves issue and returns success`, async () => {
    let receivedId;
    let printed;
    const client = {
      issue: async () => ({ id: "issue-uuid" }),
      [method]: async (id) => {
        receivedId = id;
        return { success: true };
      },
    };
    const mod = loadCommandModule("issues.js", {
      createClient: () => client,
      printJson: (data) => {
        printed = data;
      },
    });

    try {
      const program = createProgram();
      mod.registerIssues(program);
      await run(program, [command, "ENG-1"]);
      assert.equal(receivedId, "issue-uuid");
      assert.deepEqual(printed, { success: true });
    } finally {
      mod.restore();
    }
  });
}

for (const { command, method } of [
  { command: "issue-subscribe", method: "issueSubscribe" },
  { command: "issue-unsubscribe", method: "issueUnsubscribe" },
]) {
  test(`${command} resolves issue and prints updated issue`, async () => {
    let receivedId;
    let printed;
    const client = {
      issue: async () => ({ id: "issue-uuid" }),
      [method]: async (id) => {
        receivedId = id;
        return { issue: Promise.resolve({ id, action: method }) };
      },
    };
    const mod = loadCommandModule("issues.js", {
      createClient: () => client,
      printJson: (data) => {
        printed = data;
      },
    });

    try {
      const program = createProgram();
      mod.registerIssues(program);
      await run(program, [command, "ENG-1"]);
      assert.equal(receivedId, "issue-uuid");
      assert.deepEqual(printed, { id: "issue-uuid", action: method });
    } finally {
      mod.restore();
    }
  });
}

test("issue-reminder maps remind-at to reminderAt input", async () => {
  let received;
  let printed;
  const client = {
    issue: async () => ({ id: "issue-uuid" }),
    issueReminder: async (id, input) => {
      received = { id, input };
      return { issue: Promise.resolve({ id, reminderAt: input.reminderAt }) };
    },
  };
  const mod = loadCommandModule("issues.js", {
    createClient: () => client,
    printJson: (data) => {
      printed = data;
    },
  });

  try {
    const program = createProgram();
    mod.registerIssues(program);
    await run(program, ["issue-reminder", "ENG-1", "--remind-at", "2026-01-01T09:00:00Z"]);
    assert.deepEqual(received, {
      id: "issue-uuid",
      input: { reminderAt: "2026-01-01T09:00:00Z" },
    });
    assert.deepEqual(printed, { id: "issue-uuid", reminderAt: "2026-01-01T09:00:00Z" });
  } finally {
    mod.restore();
  }
});

test("issue command falls back to searchIssues when direct lookup fails", async () => {
  let searchedTerm;
  let printed;
  const foundIssue = { id: "issue-found", identifier: "ENG-2", title: "Found by search" };
  Object.defineProperty(foundIssue, "comments", {
    enumerable: false,
    value: async () => createConnection([[{ id: "com-1" }]]),
  });
  const client = {
    issue: async () => {
      throw new Error("not found");
    },
    searchIssues: async (term) => {
      searchedTerm = term;
      return { nodes: [foundIssue] };
    },
  };
  const mod = loadCommandModule("issues.js", {
    createClient: () => client,
    printJson: (data) => {
      printed = data;
    },
  });

  try {
    const program = createProgram();
    mod.registerIssues(program);
    await run(program, ["issue", "ENG-2"]);
    assert.equal(searchedTerm, "ENG-2");
    assert.deepEqual(printed, {
      id: "issue-found",
      identifier: "ENG-2",
      title: "Found by search",
      comments: [{ id: "com-1" }],
    });
  } finally {
    mod.restore();
  }
});

test("issue-relations resolves issue and paginates relations", async () => {
  let relationQueryInput;
  let printed;
  const client = {
    issue: async () => ({ id: "issue-uuid" }),
    issueRelations: async (input) => {
      relationQueryInput = input;
      return createConnection([[{ id: "rel-1" }], [{ id: "rel-2" }]]);
    },
  };
  const mod = loadCommandModule("relations.js", {
    createClient: () => client,
    printJson: (data) => {
      printed = data;
    },
  });

  try {
    const program = createProgram();
    mod.registerRelations(program);
    await run(program, ["issue-relations", "ENG-1"]);
    assert.deepEqual(relationQueryInput, {
      first: 50,
      filter: { issue: { id: { eq: "issue-uuid" } } },
    });
    assert.deepEqual(printed, [{ id: "rel-1" }, { id: "rel-2" }]);
  } finally {
    mod.restore();
  }
});

test("issue-relation fetches relation by id", async () => {
  let receivedId;
  let printed;
  const client = {
    issueRelation: async (id) => {
      receivedId = id;
      return { id, type: "related" };
    },
  };
  const mod = loadCommandModule("relations.js", {
    createClient: () => client,
    printJson: (data) => {
      printed = data;
    },
  });

  try {
    const program = createProgram();
    mod.registerRelations(program);
    await run(program, ["issue-relation", "rel-1"]);
    assert.equal(receivedId, "rel-1");
    assert.deepEqual(printed, { id: "rel-1", type: "related" });
  } finally {
    mod.restore();
  }
});

test("issue-relation-add resolves identifiers and creates relation", async () => {
  let createdInput;
  let searchedIssue;
  let printed;
  const client = {
    issue: async (id) => {
      if (id === "ENG-2") {
        throw new Error("not found");
      }
      return { id: "uuid-1" };
    },
    searchIssues: async (term) => {
      searchedIssue = term;
      return { nodes: [{ id: "uuid-2" }] };
    },
    createIssueRelation: async (input) => {
      createdInput = input;
      return { issueRelation: Promise.resolve({ id: "rel-new", ...input }) };
    },
  };
  const mod = loadCommandModule("relations.js", {
    createClient: () => client,
    printJson: (data) => {
      printed = data;
    },
  });

  try {
    const program = createProgram();
    mod.registerRelations(program);
    await run(program, [
      "issue-relation-add",
      "--issue",
      "ENG-1",
      "--related-issue",
      "ENG-2",
      "--type",
      "related",
    ]);
    assert.equal(searchedIssue, "ENG-2");
    assert.deepEqual(createdInput, {
      issueId: "uuid-1",
      relatedIssueId: "uuid-2",
      type: "related",
    });
    assert.deepEqual(printed, { id: "rel-new", ...createdInput });
  } finally {
    mod.restore();
  }
});

test("issue-relation-add exits on invalid relation type", async () => {
  let createCalled = false;
  const client = {
    createIssueRelation: async () => {
      createCalled = true;
      return { issueRelation: Promise.resolve({}) };
    },
  };
  const mod = loadCommandModule("relations.js", {
    createClient: () => client,
    printJson: () => {},
  });

  try {
    const program = createProgram();
    mod.registerRelations(program);
    await expectExit(
      () =>
        run(program, [
          "issue-relation-add",
          "--issue",
          "ENG-1",
          "--related-issue",
          "ENG-2",
          "--type",
          "blocks-me",
        ]),
      {
        stderrPattern: /invalid type "blocks-me"\. Use: blocks, duplicate, related/,
      }
    );
    assert.equal(createCalled, false);
  } finally {
    mod.restore();
  }
});

test("issue-relation-delete calls deleteIssueRelation", async () => {
  let receivedId;
  let printed;
  const client = {
    deleteIssueRelation: async (id) => {
      receivedId = id;
      return { success: true };
    },
  };
  const mod = loadCommandModule("relations.js", {
    createClient: () => client,
    printJson: (data) => {
      printed = data;
    },
  });

  try {
    const program = createProgram();
    mod.registerRelations(program);
    await run(program, ["issue-relation-delete", "rel-1"]);
    assert.equal(receivedId, "rel-1");
    assert.deepEqual(printed, { success: true });
  } finally {
    mod.restore();
  }
});
