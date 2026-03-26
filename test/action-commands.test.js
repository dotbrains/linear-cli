const assert = require("node:assert/strict");
const test = require("node:test");
const {
  createProgram,
  loadCommandModule,
  run,
} = require("../test-utils/command-test-utils");

test("notification-mark-read sets readAt timestamp", async () => {
  let received;
  let printed;
  const client = {
    updateNotification: async (id, input) => {
      received = { id, input };
      return { notification: Promise.resolve({ id, ...input }) };
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
    await run(program, ["notification-mark-read", "notif-1"]);
    assert.equal(received.id, "notif-1");
    assert.equal(typeof received.input.readAt, "string");
    assert.ok(!Number.isNaN(Date.parse(received.input.readAt)));
    assert.deepEqual(printed, { id: "notif-1", readAt: received.input.readAt });
  } finally {
    mod.restore();
  }
});

for (const { command, method } of [
  { command: "notifications-mark-read-all", method: "notificationMarkReadAll" },
  { command: "notifications-mark-unread-all", method: "notificationMarkUnreadAll" },
  { command: "notifications-archive-all", method: "notificationArchiveAll" },
]) {
  test(`${command} calls ${method} and prints success`, async () => {
    let receivedInput;
    let printed;
    const client = {
      [method]: async (input) => {
        receivedInput = input;
        return { success: true };
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
      await run(program, [command]);
      assert.deepEqual(receivedInput, {});
      assert.deepEqual(printed, { success: true });
    } finally {
      mod.restore();
    }
  });
}

test("document-create maps input and prints created document", async () => {
  let receivedInput;
  let printed;
  const client = {
    createDocument: async (input) => {
      receivedInput = input;
      return { document: Promise.resolve({ id: "doc-1", ...input }) };
    },
  };
  const mod = loadCommandModule("documents.js", {
    createClient: () => client,
    printJson: (data) => {
      printed = data;
    },
  });

  try {
    const program = createProgram();
    mod.registerDocuments(program);
    await run(program, [
      "document-create",
      "--title",
      "My Doc",
      "--project",
      "project-1",
      "--content",
      "## Summary",
    ]);
    assert.deepEqual(receivedInput, {
      title: "My Doc",
      projectId: "project-1",
      content: "## Summary",
    });
    assert.deepEqual(printed, { id: "doc-1", ...receivedInput });
  } finally {
    mod.restore();
  }
});

test("document-update maps changed fields", async () => {
  let received;
  let printed;
  const client = {
    updateDocument: async (id, input) => {
      received = { id, input };
      return { document: Promise.resolve({ id, ...input }) };
    },
  };
  const mod = loadCommandModule("documents.js", {
    createClient: () => client,
    printJson: (data) => {
      printed = data;
    },
  });

  try {
    const program = createProgram();
    mod.registerDocuments(program);
    await run(program, ["document-update", "doc-1", "--title", "Renamed"]);
    assert.deepEqual(received, { id: "doc-1", input: { title: "Renamed" } });
    assert.deepEqual(printed, { id: "doc-1", title: "Renamed" });
  } finally {
    mod.restore();
  }
});

for (const { command, moduleFile, registerName, method } of [
  {
    command: "document-delete",
    moduleFile: "documents.js",
    registerName: "registerDocuments",
    method: "deleteDocument",
  },
  {
    command: "attachment-delete",
    moduleFile: "attachments.js",
    registerName: "registerAttachments",
    method: "deleteAttachment",
  },
  {
    command: "project-delete",
    moduleFile: "projects.js",
    registerName: "registerProjects",
    method: "deleteProject",
  },
  {
    command: "roadmap-delete",
    moduleFile: "roadmaps.js",
    registerName: "registerRoadmaps",
    method: "deleteRoadmap",
  },
  {
    command: "milestone-delete",
    moduleFile: "milestones.js",
    registerName: "registerMilestones",
    method: "deleteProjectMilestone",
  },
  {
    command: "initiative-delete",
    moduleFile: "initiatives.js",
    registerName: "registerInitiatives",
    method: "deleteInitiative",
  },
  {
    command: "webhook-delete",
    moduleFile: "webhooks.js",
    registerName: "registerWebhooks",
    method: "deleteWebhook",
  },
  {
    command: "cycle-archive",
    moduleFile: "cycles.js",
    registerName: "registerCycles",
    method: "archiveCycle",
  },
  {
    command: "label-delete",
    moduleFile: "labels.js",
    registerName: "registerLabels",
    method: "deleteIssueLabel",
  },
]) {
  test(`${command} prints success`, async () => {
    let receivedId;
    let printed;
    const client = {
      [method]: async (id) => {
        receivedId = id;
        return { success: true };
      },
    };
    const mod = loadCommandModule(moduleFile, {
      createClient: () => client,
      printJson: (data) => {
        printed = data;
      },
    });

    try {
      const program = createProgram();
      mod[registerName](program);
      await run(program, [command, "id-1"]);
      assert.equal(receivedId, "id-1");
      assert.deepEqual(printed, { success: true });
    } finally {
      mod.restore();
    }
  });
}

for (const { command, method, expectedInput, expectedPrinted } of [
  {
    command: "attachment-link-github-pr",
    method: "attachmentLinkGitHubPR",
    expectedInput: { issueId: "ENG-1", url: "https://github.com/org/repo/pull/1" },
    expectedPrinted: { id: "att-1", source: "pr" },
  },
  {
    command: "attachment-link-github-issue",
    method: "attachmentLinkGitHubIssue",
    expectedInput: { issueId: "ENG-1", url: "https://github.com/org/repo/issues/1" },
    expectedPrinted: { id: "att-2", source: "issue" },
  },
]) {
  test(`${command} maps issue and url`, async () => {
    let receivedInput;
    let printed;
    const client = {
      [method]: async (input) => {
        receivedInput = input;
        return { attachment: Promise.resolve(expectedPrinted) };
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
      await run(program, [command, "ENG-1", "--url", expectedInput.url]);
      assert.deepEqual(receivedInput, expectedInput);
      assert.deepEqual(printed, expectedPrinted);
    } finally {
      mod.restore();
    }
  });
}

for (const caseData of [
  {
    title: "project-update maps changed fields",
    moduleFile: "projects.js",
    registerName: "registerProjects",
    args: ["project-update", "project-1", "--name", "New Name"],
    method: "updateProject",
    expected: { id: "project-1", input: { name: "New Name" } },
    promiseKey: "project",
  },
  {
    title: "roadmap-update maps changed fields",
    moduleFile: "roadmaps.js",
    registerName: "registerRoadmaps",
    args: ["roadmap-update", "roadmap-1", "--description", "Updated"],
    method: "updateRoadmap",
    expected: { id: "roadmap-1", input: { description: "Updated" } },
    promiseKey: "roadmap",
  },
  {
    title: "milestone-update maps changed fields",
    moduleFile: "milestones.js",
    registerName: "registerMilestones",
    args: ["milestone-update", "milestone-1", "--target-date", "2026-12-01"],
    method: "updateProjectMilestone",
    expected: { id: "milestone-1", input: { targetDate: "2026-12-01" } },
    promiseKey: "projectMilestone",
  },
  {
    title: "initiative-update maps changed fields",
    moduleFile: "initiatives.js",
    registerName: "registerInitiatives",
    args: ["initiative-update", "initiative-1", "--name", "Platform Core"],
    method: "updateInitiative",
    expected: { id: "initiative-1", input: { name: "Platform Core" } },
    promiseKey: "initiative",
  },
  {
    title: "cycle-update maps changed fields",
    moduleFile: "cycles.js",
    registerName: "registerCycles",
    args: ["cycle-update", "cycle-1", "--name", "Sprint 20"],
    method: "updateCycle",
    expected: { id: "cycle-1", input: { name: "Sprint 20" } },
    promiseKey: "cycle",
  },
  {
    title: "label-update maps changed fields",
    moduleFile: "labels.js",
    registerName: "registerLabels",
    args: ["label-update", "label-1", "--color", "#ff0000"],
    method: "updateIssueLabel",
    expected: { id: "label-1", input: { color: "#ff0000" } },
    promiseKey: "issueLabel",
  },
]) {
  test(caseData.title, async () => {
    let received;
    let printed;
    const client = {
      [caseData.method]: async (id, input) => {
        received = { id, input };
        return { [caseData.promiseKey]: Promise.resolve({ id, ...input }) };
      },
    };
    const mod = loadCommandModule(caseData.moduleFile, {
      createClient: () => client,
      printJson: (data) => {
        printed = data;
      },
    });

    try {
      const program = createProgram();
      mod[caseData.registerName](program);
      await run(program, caseData.args);
      assert.deepEqual(received, caseData.expected);
      assert.deepEqual(printed, { ...caseData.expected.input, id: caseData.expected.id });
    } finally {
      mod.restore();
    }
  });
}

for (const caseData of [
  {
    title: "webhook-create maps optional fields",
    moduleFile: "webhooks.js",
    registerName: "registerWebhooks",
    args: [
      "webhook-create",
      "--url",
      "https://example.com/hook",
      "--team",
      "team-1",
      "--label",
      "Primary",
      "--secret",
      "secret",
    ],
    method: "createWebhook",
    expectedInput: {
      url: "https://example.com/hook",
      teamId: "team-1",
      label: "Primary",
      secret: "secret",
    },
    promiseKey: "webhook",
  },
  {
    title: "project-update-create maps body and health",
    moduleFile: "project-updates.js",
    registerName: "registerProjectUpdates",
    args: [
      "project-update-create",
      "--project",
      "project-1",
      "--body",
      "Shipped auth",
      "--health",
      "onTrack",
    ],
    method: "createProjectUpdate",
    expectedInput: {
      projectId: "project-1",
      body: "Shipped auth",
      health: "onTrack",
    },
    promiseKey: "projectUpdate",
  },
  {
    title: "initiative-create maps optional description",
    moduleFile: "initiatives.js",
    registerName: "registerInitiatives",
    args: ["initiative-create", "--name", "Platform", "--description", "Q2 focus"],
    method: "createInitiative",
    expectedInput: {
      name: "Platform",
      description: "Q2 focus",
    },
    promiseKey: "initiative",
  },
  {
    title: "milestone-create maps project, name, and target date",
    moduleFile: "milestones.js",
    registerName: "registerMilestones",
    args: [
      "milestone-create",
      "--project",
      "project-1",
      "--name",
      "Beta",
      "--target-date",
      "2026-10-10",
    ],
    method: "createProjectMilestone",
    expectedInput: {
      projectId: "project-1",
      name: "Beta",
      targetDate: "2026-10-10",
    },
    promiseKey: "projectMilestone",
  },
  {
    title: "roadmap-create maps optional description",
    moduleFile: "roadmaps.js",
    registerName: "registerRoadmaps",
    args: ["roadmap-create", "--name", "2027 Roadmap", "--description", "Company priorities"],
    method: "createRoadmap",
    expectedInput: {
      name: "2027 Roadmap",
      description: "Company priorities",
    },
    promiseKey: "roadmap",
  },
]) {
  test(caseData.title, async () => {
    let receivedInput;
    let printed;
    const client = {
      [caseData.method]: async (input) => {
        receivedInput = input;
        return { [caseData.promiseKey]: Promise.resolve({ id: "new-id", ...input }) };
      },
    };
    const mod = loadCommandModule(caseData.moduleFile, {
      createClient: () => client,
      printJson: (data) => {
        printed = data;
      },
    });

    try {
      const program = createProgram();
      mod[caseData.registerName](program);
      await run(program, caseData.args);
      assert.deepEqual(receivedInput, caseData.expectedInput);
      assert.deepEqual(printed, { id: "new-id", ...caseData.expectedInput });
    } finally {
      mod.restore();
    }
  });
}
