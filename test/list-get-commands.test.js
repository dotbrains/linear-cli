const assert = require("node:assert/strict");
const test = require("node:test");
const {
  createConnection,
  createProgram,
  loadCommandModule,
  run,
} = require("../test-utils/command-test-utils");

const listCases = [
  {
    title: "notifications lists with pagination",
    moduleFile: "notifications.js",
    registerName: "registerNotifications",
    args: ["notifications", "--first", "20"],
    method: "notifications",
    expectedInput: { first: 20 },
    pages: [[{ id: "n1" }], [{ id: "n2" }]],
  },
  {
    title: "documents lists with pagination",
    moduleFile: "documents.js",
    registerName: "registerDocuments",
    args: ["documents", "--first", "10"],
    method: "documents",
    expectedInput: { first: 10 },
    pages: [[{ id: "d1" }], [{ id: "d2" }]],
  },
  {
    title: "attachments lists with issue filter and pagination",
    moduleFile: "attachments.js",
    registerName: "registerAttachments",
    args: ["attachments", "ENG-1"],
    method: "attachments",
    expectedInput: {
      first: 50,
      filter: { issue: { id: { eq: "ENG-1" } } },
    },
    pages: [[{ id: "a1" }], [{ id: "a2" }]],
  },
  {
    title: "project-updates lists with project filter and pagination",
    moduleFile: "project-updates.js",
    registerName: "registerProjectUpdates",
    args: ["project-updates", "--project", "project-1", "--first", "5"],
    method: "projectUpdates",
    expectedInput: {
      first: 5,
      filter: { project: { id: { eq: "project-1" } } },
    },
    pages: [[{ id: "pu1" }], [{ id: "pu2" }]],
  },
  {
    title: "webhooks lists with pagination",
    moduleFile: "webhooks.js",
    registerName: "registerWebhooks",
    args: ["webhooks"],
    method: "webhooks",
    expectedInput: { first: 100 },
    pages: [[{ id: "w1" }], [{ id: "w2" }]],
  },
  {
    title: "initiatives lists with pagination",
    moduleFile: "initiatives.js",
    registerName: "registerInitiatives",
    args: ["initiatives", "--first", "3"],
    method: "initiatives",
    expectedInput: { first: 3 },
    pages: [[{ id: "i1" }], [{ id: "i2" }]],
  },
  {
    title: "milestones lists with project filter and pagination",
    moduleFile: "milestones.js",
    registerName: "registerMilestones",
    args: ["milestones", "--project", "project-1", "--first", "9"],
    method: "projectMilestones",
    expectedInput: {
      first: 9,
      filter: { project: { id: { eq: "project-1" } } },
    },
    pages: [[{ id: "m1" }], [{ id: "m2" }]],
  },
  {
    title: "roadmaps lists with pagination",
    moduleFile: "roadmaps.js",
    registerName: "registerRoadmaps",
    args: ["roadmaps"],
    method: "roadmaps",
    expectedInput: { first: 50 },
    pages: [[{ id: "r1" }], [{ id: "r2" }]],
  },
  {
    title: "cycles lists with team filter and pagination",
    moduleFile: "cycles.js",
    registerName: "registerCycles",
    args: ["cycles", "--team", "team-1", "--first", "8"],
    method: "cycles",
    expectedInput: {
      first: 8,
      filter: { team: { id: { eq: "team-1" } } },
    },
    pages: [[{ id: "c1" }], [{ id: "c2" }]],
  },
];

for (const listCase of listCases) {
  test(listCase.title, async () => {
    let receivedInput;
    let printed;
    const client = {
      [listCase.method]: async (input) => {
        receivedInput = input;
        return createConnection(listCase.pages);
      },
    };
    const mod = loadCommandModule(listCase.moduleFile, {
      createClient: () => client,
      printJson: (data) => {
        printed = data;
      },
    });

    try {
      const program = createProgram();
      mod[listCase.registerName](program);
      await run(program, listCase.args);
      assert.deepEqual(receivedInput, listCase.expectedInput);
      assert.deepEqual(printed, listCase.pages.flat());
    } finally {
      mod.restore();
    }
  });
}

const getCases = [
  {
    title: "document fetches by id",
    moduleFile: "documents.js",
    registerName: "registerDocuments",
    args: ["document", "doc-1"],
    method: "document",
    expectedId: "doc-1",
    response: { id: "doc-1", title: "Doc" },
  },
  {
    title: "attachment fetches by id",
    moduleFile: "attachments.js",
    registerName: "registerAttachments",
    args: ["attachment", "att-1"],
    method: "attachment",
    expectedId: "att-1",
    response: { id: "att-1", url: "https://example.com" },
  },
  {
    title: "project fetches by id",
    moduleFile: "projects.js",
    registerName: "registerProjects",
    args: ["project", "project-1"],
    method: "project",
    expectedId: "project-1",
    response: { id: "project-1", name: "Project" },
  },
  {
    title: "cycle fetches by id",
    moduleFile: "cycles.js",
    registerName: "registerCycles",
    args: ["cycle", "cycle-1"],
    method: "cycle",
    expectedId: "cycle-1",
    response: { id: "cycle-1", name: "Sprint" },
  },
  {
    title: "roadmap fetches by id",
    moduleFile: "roadmaps.js",
    registerName: "registerRoadmaps",
    args: ["roadmap", "roadmap-1"],
    method: "roadmap",
    expectedId: "roadmap-1",
    response: { id: "roadmap-1", name: "Roadmap" },
  },
  {
    title: "milestone fetches by id",
    moduleFile: "milestones.js",
    registerName: "registerMilestones",
    args: ["milestone", "milestone-1"],
    method: "projectMilestone",
    expectedId: "milestone-1",
    response: { id: "milestone-1", name: "GA" },
  },
  {
    title: "initiative fetches by id",
    moduleFile: "initiatives.js",
    registerName: "registerInitiatives",
    args: ["initiative", "initiative-1"],
    method: "initiative",
    expectedId: "initiative-1",
    response: { id: "initiative-1", name: "Platform" },
  },
  {
    title: "webhook fetches by id",
    moduleFile: "webhooks.js",
    registerName: "registerWebhooks",
    args: ["webhook", "webhook-1"],
    method: "webhook",
    expectedId: "webhook-1",
    response: { id: "webhook-1", url: "https://example.com/hook" },
  },
  {
    title: "project-update-get fetches by id",
    moduleFile: "project-updates.js",
    registerName: "registerProjectUpdates",
    args: ["project-update-get", "update-1"],
    method: "projectUpdate",
    expectedId: "update-1",
    response: { id: "update-1", body: "progress" },
  },
];

for (const getCase of getCases) {
  test(getCase.title, async () => {
    let receivedId;
    let printed;
    const client = {
      [getCase.method]: async (id) => {
        receivedId = id;
        return getCase.response;
      },
    };
    const mod = loadCommandModule(getCase.moduleFile, {
      createClient: () => client,
      printJson: (data) => {
        printed = data;
      },
    });

    try {
      const program = createProgram();
      mod[getCase.registerName](program);
      await run(program, getCase.args);
      assert.equal(receivedId, getCase.expectedId);
      assert.deepEqual(printed, getCase.response);
    } finally {
      mod.restore();
    }
  });
}
