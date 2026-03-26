const assert = require("node:assert/strict");
const test = require("node:test");
const {
  createConnection,
  createProgram,
  expectExit,
  loadCommandModule,
  run,
} = require("../test-utils/command-test-utils");

test("issues command maps filters and paginates", async () => {
  let receivedInput;
  let printed;
  const client = {
    issues: async (input) => {
      receivedInput = input;
      return createConnection([[{ id: "ISS-1" }], [{ id: "ISS-2" }]]);
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
    await run(program, [
      "issues",
      "--labels",
      "Bug",
      "Feature",
      "--team",
      "team-1",
      "--assignee",
      "user-1",
      "--state",
      "state-1",
      "--priority",
      "2",
      "--first",
      "25",
    ]);

    assert.deepEqual(receivedInput, {
      first: 25,
      filter: {
        labels: { name: { in: ["Bug", "Feature"] } },
        team: { id: { eq: "team-1" } },
        assignee: { id: { eq: "user-1" } },
        state: { id: { eq: "state-1" } },
        priority: { eq: 2 },
      },
    });
    assert.deepEqual(printed, [{ id: "ISS-1" }, { id: "ISS-2" }]);
  } finally {
    mod.restore();
  }
});

test("issue-create maps options to createIssue input", async () => {
  let receivedInput;
  let printed;
  const createdIssue = { id: "ISS-100", title: "Fix login bug" };
  const client = {
    createIssue: async (input) => {
      receivedInput = input;
      return { issue: Promise.resolve(createdIssue) };
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
    await run(program, [
      "issue-create",
      "--team",
      "team-1",
      "--title",
      "Fix login bug",
      "--description",
      "Repro in prod",
      "--assignee",
      "user-1",
      "--state",
      "state-1",
      "--priority",
      "1",
      "--labels",
      "label-1",
      "label-2",
    ]);

    assert.deepEqual(receivedInput, {
      teamId: "team-1",
      title: "Fix login bug",
      description: "Repro in prod",
      assigneeId: "user-1",
      stateId: "state-1",
      priority: 1,
      labelIds: ["label-1", "label-2"],
    });
    assert.deepEqual(printed, createdIssue);
  } finally {
    mod.restore();
  }
});

test("issue-update falls back to searchIssues for identifiers", async () => {
  let lookedUpIssueId;
  let searched;
  let updated;
  let printed;
  const client = {
    issue: async (id) => {
      lookedUpIssueId = id;
      throw new Error("not found");
    },
    searchIssues: async (term, vars) => {
      searched = { term, vars };
      return { nodes: [{ id: "issue-uuid" }] };
    },
    updateIssue: async (id, input) => {
      updated = { id, input };
      return { issue: Promise.resolve({ id, ...input }) };
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
    await run(program, ["issue-update", "ENG-123", "--title", "Updated title"]);

    assert.equal(lookedUpIssueId, "ENG-123");
    assert.deepEqual(searched, {
      term: "ENG-123",
      vars: { first: 1, includeArchived: true },
    });
    assert.deepEqual(updated, {
      id: "issue-uuid",
      input: { title: "Updated title" },
    });
    assert.deepEqual(printed, { id: "issue-uuid", title: "Updated title" });
  } finally {
    mod.restore();
  }
});

test("issue command fetches directly and paginates comments", async () => {
  let lookedUpIssueId;
  let searchIssuesCalled = false;
  let printed;
  const issue = { id: "issue-1", identifier: "ENG-1", title: "Investigate bug" };
  Object.defineProperty(issue, "comments", {
    enumerable: false,
    value: async () => createConnection([[{ id: "com-1" }], [{ id: "com-2" }]]),
  });

  const client = {
    issue: async (id) => {
      lookedUpIssueId = id;
      return issue;
    },
    searchIssues: async () => {
      searchIssuesCalled = true;
      return { nodes: [] };
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
    await run(program, ["issue", "ENG-1"]);

    assert.equal(lookedUpIssueId, "ENG-1");
    assert.equal(searchIssuesCalled, false);
    assert.deepEqual(printed, {
      id: "issue-1",
      identifier: "ENG-1",
      title: "Investigate bug",
      comments: [{ id: "com-1" }, { id: "com-2" }],
    });
  } finally {
    mod.restore();
  }
});

test("issue command exits when identifier cannot be resolved", async () => {
  const client = {
    issue: async () => {
      throw new Error("not found");
    },
    searchIssues: async () => ({ nodes: [] }),
  };

  const mod = loadCommandModule("issues.js", {
    createClient: () => client,
    printJson: () => {},
  });

  try {
    const program = createProgram();
    mod.registerIssues(program);
    await expectExit(() => run(program, ["issue", "ENG-404"]), {
      stderrPattern: /Issue not found: ENG-404/,
    });
  } finally {
    mod.restore();
  }
});

test("issue-delete exits when identifier cannot be resolved", async () => {
  const client = {
    issue: async () => {
      throw new Error("not found");
    },
    searchIssues: async () => ({ nodes: [] }),
  };

  const mod = loadCommandModule("issues.js", {
    createClient: () => client,
    printJson: () => {},
  });

  try {
    const program = createProgram();
    mod.registerIssues(program);
    await expectExit(() => run(program, ["issue-delete", "ENG-404"]), {
      stderrPattern: /Issue not found: ENG-404/,
    });
  } finally {
    mod.restore();
  }
});

test("search routes by type and forwards archived option", async () => {
  let searchCall;
  let printed;
  const client = {
    searchProjects: async (term, vars) => {
      searchCall = { term, vars };
      return { nodes: [{ id: "PROJ-1" }] };
    },
  };

  const mod = loadCommandModule("search.js", {
    createClient: () => client,
    printJson: (data) => {
      printed = data;
    },
  });

  try {
    const program = createProgram();
    mod.registerSearch(program);
    await run(program, ["search", "roadmap", "--type", "Project", "--archived"]);

    assert.deepEqual(searchCall, {
      term: "roadmap",
      vars: { includeArchived: true },
    });
    assert.deepEqual(printed, [{ id: "PROJ-1" }]);
  } finally {
    mod.restore();
  }
});

test("search defaults to Issue type", async () => {
  let searchCall;
  let printed;
  const client = {
    searchIssues: async (term, vars) => {
      searchCall = { term, vars };
      return { nodes: [{ id: "ISS-42" }] };
    },
  };

  const mod = loadCommandModule("search.js", {
    createClient: () => client,
    printJson: (data) => {
      printed = data;
    },
  });

  try {
    const program = createProgram();
    mod.registerSearch(program);
    await run(program, ["search", "login bug"]);

    assert.deepEqual(searchCall, {
      term: "login bug",
      vars: { includeArchived: false },
    });
    assert.deepEqual(printed, [{ id: "ISS-42" }]);
  } finally {
    mod.restore();
  }
});

test("search routes to Document type", async () => {
  let searchCall;
  let printed;
  const client = {
    searchDocuments: async (term, vars) => {
      searchCall = { term, vars };
      return { nodes: [{ id: "DOC-1" }] };
    },
  };

  const mod = loadCommandModule("search.js", {
    createClient: () => client,
    printJson: (data) => {
      printed = data;
    },
  });

  try {
    const program = createProgram();
    mod.registerSearch(program);
    await run(program, ["search", "incident postmortem", "--type", "Document"]);

    assert.deepEqual(searchCall, {
      term: "incident postmortem",
      vars: { includeArchived: false },
    });
    assert.deepEqual(printed, [{ id: "DOC-1" }]);
  } finally {
    mod.restore();
  }
});

test("search exits with clear error for unsupported type", async () => {
  const mod = loadCommandModule("search.js", {
    createClient: () => ({}),
    printJson: () => {},
  });

  try {
    const program = createProgram();
    mod.registerSearch(program);
    await expectExit(() => run(program, ["search", "foo", "--type", "Team"]), {
      stderrPattern: /Unknown type: Team\. Use Issue, Document, or Project\./,
    });
  } finally {
    mod.restore();
  }
});
