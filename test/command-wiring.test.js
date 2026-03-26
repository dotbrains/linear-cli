const assert = require("node:assert/strict");
const test = require("node:test");
const {
  createConnection,
  createProgram,
  loadCommandModule,
  run,
} = require("../test-utils/command-test-utils");

test("comments-mine uses viewer id and paginates", async () => {
  let queryInput;
  let printed;
  const client = {
    viewer: Promise.resolve({ id: "user-123" }),
    comments: async (input) => {
      queryInput = input;
      return createConnection([[{ id: "COM-1" }], [{ id: "COM-2" }]]);
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
    await run(program, ["comments-mine", "--first", "10"]);

    assert.deepEqual(queryInput, {
      first: 10,
      filter: { user: { id: { eq: "user-123" } } },
    });
    assert.deepEqual(printed, [{ id: "COM-1" }, { id: "COM-2" }]);
  } finally {
    mod.restore();
  }
});

test("projects command maps team filter and paginates", async () => {
  let receivedInput;
  let printed;
  const client = {
    projects: async (input) => {
      receivedInput = input;
      return createConnection([[{ id: "PROJ-1" }], [{ id: "PROJ-2" }]]);
    },
  };

  const mod = loadCommandModule("projects.js", {
    createClient: () => client,
    printJson: (data) => {
      printed = data;
    },
  });

  try {
    const program = createProgram();
    mod.registerProjects(program);
    await run(program, ["projects", "--team", "team-1", "--first", "15"]);

    assert.deepEqual(receivedInput, {
      first: 15,
      filter: { accessibleTeams: { id: { eq: "team-1" } } },
    });
    assert.deepEqual(printed, [{ id: "PROJ-1" }, { id: "PROJ-2" }]);
  } finally {
    mod.restore();
  }
});

test("project-create maps options to createProject input", async () => {
  let receivedInput;
  let printed;
  const createdProject = { id: "project-1", name: "Roadmap" };
  const client = {
    createProject: async (input) => {
      receivedInput = input;
      return { project: Promise.resolve(createdProject) };
    },
  };

  const mod = loadCommandModule("projects.js", {
    createClient: () => client,
    printJson: (data) => {
      printed = data;
    },
  });

  try {
    const program = createProgram();
    mod.registerProjects(program);
    await run(program, [
      "project-create",
      "--team",
      "team-1",
      "--name",
      "Roadmap",
      "--description",
      "Phase 1",
      "--state",
      "status-1",
      "--start-date",
      "2026-01-01",
      "--target-date",
      "2026-06-01",
    ]);

    assert.deepEqual(receivedInput, {
      teamIds: ["team-1"],
      name: "Roadmap",
      description: "Phase 1",
      statusId: "status-1",
      startDate: "2026-01-01",
      targetDate: "2026-06-01",
    });
    assert.deepEqual(printed, createdProject);
  } finally {
    mod.restore();
  }
});

test("workflow-states applies team filter and paginates", async () => {
  let receivedInput;
  let printed;
  const client = {
    workflowStates: async (input) => {
      receivedInput = input;
      return createConnection([[{ id: "state-1" }], [{ id: "state-2" }]]);
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
    await run(program, ["workflow-states", "--team", "team-1"]);

    assert.deepEqual(receivedInput, {
      first: 250,
      filter: { team: { id: { eq: "team-1" } } },
    });
    assert.deepEqual(printed, [{ id: "state-1" }, { id: "state-2" }]);
  } finally {
    mod.restore();
  }
});

test("attachment-link-url maps issue, url, and optional title", async () => {
  let receivedInput;
  let printed;
  const attachment = { id: "att-1" };
  const client = {
    attachmentLinkURL: async (input) => {
      receivedInput = input;
      return { attachment: Promise.resolve(attachment) };
    },
  };

  const mod = loadCommandModule("attachments.js", {
    createClient: () => client,
    printJson: (data) => {
      printed = data;
    },
  });

  try {
    const program = createProgram();
    mod.registerAttachments(program);
    await run(program, [
      "attachment-link-url",
      "ENG-123",
      "--url",
      "https://example.com/design-doc",
      "--title",
      "Design doc",
    ]);

    assert.deepEqual(receivedInput, {
      issueId: "ENG-123",
      url: "https://example.com/design-doc",
      title: "Design doc",
    });
    assert.deepEqual(printed, attachment);
  } finally {
    mod.restore();
  }
});

test("notification-mark-unread sets readAt to null", async () => {
  let receivedId;
  let receivedInput;
  let printed;
  const notification = { id: "notif-1", readAt: null };
  const client = {
    updateNotification: async (id, input) => {
      receivedId = id;
      receivedInput = input;
      return { notification: Promise.resolve(notification) };
    },
  };

  const mod = loadCommandModule("notifications.js", {
    createClient: () => client,
    printJson: (data) => {
      printed = data;
    },
  });

  try {
    const program = createProgram();
    mod.registerNotifications(program);
    await run(program, ["notification-mark-unread", "notif-1"]);

    assert.equal(receivedId, "notif-1");
    assert.deepEqual(receivedInput, { readAt: null });
    assert.deepEqual(printed, notification);
  } finally {
    mod.restore();
  }
});

test("webhook-update maps disabled flag to enabled=false", async () => {
  let receivedId;
  let receivedInput;
  let printed;
  const webhook = { id: "hook-1", enabled: false, label: "Critical" };
  const client = {
    updateWebhook: async (id, input) => {
      receivedId = id;
      receivedInput = input;
      return { webhook: Promise.resolve(webhook) };
    },
  };

  const mod = loadCommandModule("webhooks.js", {
    createClient: () => client,
    printJson: (data) => {
      printed = data;
    },
  });

  try {
    const program = createProgram();
    mod.registerWebhooks(program);
    await run(program, ["webhook-update", "hook-1", "--label", "Critical", "--disabled"]);

    assert.equal(receivedId, "hook-1");
    assert.deepEqual(receivedInput, { label: "Critical", enabled: false });
    assert.deepEqual(printed, webhook);
  } finally {
    mod.restore();
  }
});

test("cycle-create converts starts-at and ends-at to Date objects", async () => {
  let receivedInput;
  let printed;
  const cycle = { id: "cycle-1" };
  const client = {
    createCycle: async (input) => {
      receivedInput = input;
      return { cycle: Promise.resolve(cycle) };
    },
  };

  const mod = loadCommandModule("cycles.js", {
    createClient: () => client,
    printJson: (data) => {
      printed = data;
    },
  });

  try {
    const program = createProgram();
    mod.registerCycles(program);
    await run(program, [
      "cycle-create",
      "--team",
      "team-1",
      "--starts-at",
      "2026-01-01",
      "--ends-at",
      "2026-01-14",
      "--name",
      "Sprint 12",
      "--description",
      "Platform work",
    ]);

    assert.equal(receivedInput.teamId, "team-1");
    assert.equal(receivedInput.name, "Sprint 12");
    assert.equal(receivedInput.description, "Platform work");
    assert.ok(receivedInput.startsAt instanceof Date);
    assert.ok(receivedInput.endsAt instanceof Date);
    assert.equal(receivedInput.startsAt.toISOString(), "2026-01-01T00:00:00.000Z");
    assert.equal(receivedInput.endsAt.toISOString(), "2026-01-14T00:00:00.000Z");
    assert.deepEqual(printed, cycle);
  } finally {
    mod.restore();
  }
});
