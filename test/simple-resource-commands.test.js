const assert = require("node:assert/strict");
const test = require("node:test");
const {
  createConnection,
  createProgram,
  loadCommandModule,
  run,
} = require("../test-utils/command-test-utils");

test("me prints authenticated viewer", async () => {
  let printed;
  const client = { viewer: Promise.resolve({ id: "user-1", name: "Test User" }) };
  const mod = loadCommandModule("me.js", {
    createClient: () => client,
    printJson: (data) => {
      printed = data;
    },
  });

  try {
    const program = createProgram();
    mod.registerMe(program);
    await run(program, ["me"]);
    assert.deepEqual(printed, { id: "user-1", name: "Test User" });
  } finally {
    mod.restore();
  }
});

test("users paginates organization users", async () => {
  let receivedInput;
  let printed;
  const client = {
    users: async (input) => {
      receivedInput = input;
      return createConnection([[{ id: "u1" }], [{ id: "u2" }]]);
    },
  };
  const mod = loadCommandModule("users.js", {
    createClient: () => client,
    printJson: (data) => {
      printed = data;
    },
  });

  try {
    const program = createProgram();
    mod.registerUsers(program);
    await run(program, ["users"]);
    assert.deepEqual(receivedInput, { first: 100 });
    assert.deepEqual(printed, [{ id: "u1" }, { id: "u2" }]);
  } finally {
    mod.restore();
  }
});

test("user fetches by id", async () => {
  let receivedId;
  let printed;
  const client = {
    user: async (id) => {
      receivedId = id;
      return { id, name: "A User" };
    },
  };
  const mod = loadCommandModule("users.js", {
    createClient: () => client,
    printJson: (data) => {
      printed = data;
    },
  });

  try {
    const program = createProgram();
    mod.registerUsers(program);
    await run(program, ["user", "user-42"]);
    assert.equal(receivedId, "user-42");
    assert.deepEqual(printed, { id: "user-42", name: "A User" });
  } finally {
    mod.restore();
  }
});

test("teams paginates organization teams", async () => {
  let receivedInput;
  let printed;
  const client = {
    teams: async (input) => {
      receivedInput = input;
      return createConnection([[{ id: "t1" }], [{ id: "t2" }]]);
    },
  };
  const mod = loadCommandModule("teams.js", {
    createClient: () => client,
    printJson: (data) => {
      printed = data;
    },
  });

  try {
    const program = createProgram();
    mod.registerTeams(program);
    await run(program, ["teams"]);
    assert.deepEqual(receivedInput, { first: 100 });
    assert.deepEqual(printed, [{ id: "t1" }, { id: "t2" }]);
  } finally {
    mod.restore();
  }
});

test("team fetches by id", async () => {
  let receivedId;
  let printed;
  const client = {
    team: async (id) => {
      receivedId = id;
      return { id, key: "ENG" };
    },
  };
  const mod = loadCommandModule("teams.js", {
    createClient: () => client,
    printJson: (data) => {
      printed = data;
    },
  });

  try {
    const program = createProgram();
    mod.registerTeams(program);
    await run(program, ["team", "team-1"]);
    assert.equal(receivedId, "team-1");
    assert.deepEqual(printed, { id: "team-1", key: "ENG" });
  } finally {
    mod.restore();
  }
});

test("labels paginates issue labels", async () => {
  let receivedInput;
  let printed;
  const client = {
    issueLabels: async (input) => {
      receivedInput = input;
      return createConnection([[{ id: "l1" }], [{ id: "l2" }]]);
    },
  };
  const mod = loadCommandModule("labels.js", {
    createClient: () => client,
    printJson: (data) => {
      printed = data;
    },
  });

  try {
    const program = createProgram();
    mod.registerLabels(program);
    await run(program, ["labels"]);
    assert.deepEqual(receivedInput, { first: 250 });
    assert.deepEqual(printed, [{ id: "l1" }, { id: "l2" }]);
  } finally {
    mod.restore();
  }
});

test("label-create maps input and prints created label", async () => {
  let receivedInput;
  let printed;
  const client = {
    createIssueLabel: async (input) => {
      receivedInput = input;
      return { issueLabel: Promise.resolve({ id: "label-1", ...input }) };
    },
  };
  const mod = loadCommandModule("labels.js", {
    createClient: () => client,
    printJson: (data) => {
      printed = data;
    },
  });

  try {
    const program = createProgram();
    mod.registerLabels(program);
    await run(program, [
      "label-create",
      "--team",
      "team-1",
      "--name",
      "Tech Debt",
      "--color",
      "#e2e2e2",
    ]);
    assert.deepEqual(receivedInput, {
      teamId: "team-1",
      name: "Tech Debt",
      color: "#e2e2e2",
    });
    assert.deepEqual(printed, { id: "label-1", ...receivedInput });
  } finally {
    mod.restore();
  }
});

test("label-delete calls deleteIssueLabel", async () => {
  let receivedId;
  let printed;
  const client = {
    deleteIssueLabel: async (id) => {
      receivedId = id;
      return { success: true };
    },
  };
  const mod = loadCommandModule("labels.js", {
    createClient: () => client,
    printJson: (data) => {
      printed = data;
    },
  });

  try {
    const program = createProgram();
    mod.registerLabels(program);
    await run(program, ["label-delete", "label-1"]);
    assert.equal(receivedId, "label-1");
    assert.deepEqual(printed, { success: true });
  } finally {
    mod.restore();
  }
});

test("workflow-state fetches by id", async () => {
  let receivedId;
  let printed;
  const client = {
    workflowState: async (id) => {
      receivedId = id;
      return { id, name: "Done" };
    },
  };
  const mod = loadCommandModule("workflow-states.js", {
    createClient: () => client,
    printJson: (data) => {
      printed = data;
    },
  });

  try {
    const program = createProgram();
    mod.registerWorkflowStates(program);
    await run(program, ["workflow-state", "state-1"]);
    assert.equal(receivedId, "state-1");
    assert.deepEqual(printed, { id: "state-1", name: "Done" });
  } finally {
    mod.restore();
  }
});

test("templates supports array responses", async () => {
  let printed;
  const client = {
    templates: async () => [{ id: "tpl-1" }, { id: "tpl-2" }],
  };
  const mod = loadCommandModule("templates.js", {
    createClient: () => client,
    printJson: (data) => {
      printed = data;
    },
  });

  try {
    const program = createProgram();
    mod.registerTemplates(program);
    await run(program, ["templates"]);
    assert.deepEqual(printed, [{ id: "tpl-1" }, { id: "tpl-2" }]);
  } finally {
    mod.restore();
  }
});

test("templates paginates connection responses", async () => {
  let printed;
  const client = {
    templates: async () => createConnection([[{ id: "tpl-1" }], [{ id: "tpl-2" }]]),
  };
  const mod = loadCommandModule("templates.js", {
    createClient: () => client,
    printJson: (data) => {
      printed = data;
    },
  });

  try {
    const program = createProgram();
    mod.registerTemplates(program);
    await run(program, ["templates"]);
    assert.deepEqual(printed, [{ id: "tpl-1" }, { id: "tpl-2" }]);
  } finally {
    mod.restore();
  }
});

test("template fetches by id", async () => {
  let receivedId;
  let printed;
  const client = {
    template: async (id) => {
      receivedId = id;
      return { id, name: "Bug template" };
    },
  };
  const mod = loadCommandModule("templates.js", {
    createClient: () => client,
    printJson: (data) => {
      printed = data;
    },
  });

  try {
    const program = createProgram();
    mod.registerTemplates(program);
    await run(program, ["template", "tpl-1"]);
    assert.equal(receivedId, "tpl-1");
    assert.deepEqual(printed, { id: "tpl-1", name: "Bug template" });
  } finally {
    mod.restore();
  }
});
