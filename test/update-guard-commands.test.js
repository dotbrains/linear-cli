const assert = require("node:assert/strict");
const test = require("node:test");
const {
  createProgram,
  expectExit,
  loadCommandModule,
  run,
} = require("../test-utils/command-test-utils");

const guardCases = [
  {
    title: "issue-update",
    moduleFile: "issues.js",
    registerName: "registerIssues",
    commandArgs: ["issue-update", "ENG-123"],
    createClient(state) {
      return {
        issue: async () => ({ id: "issue-1" }),
        updateIssue: async () => {
          state.called = true;
          return { issue: Promise.resolve({}) };
        },
      };
    },
  },
  {
    title: "project-update",
    moduleFile: "projects.js",
    registerName: "registerProjects",
    commandArgs: ["project-update", "project-1"],
    createClient(state) {
      return {
        updateProject: async () => {
          state.called = true;
          return { project: Promise.resolve({}) };
        },
      };
    },
  },
  {
    title: "document-update",
    moduleFile: "documents.js",
    registerName: "registerDocuments",
    commandArgs: ["document-update", "doc-1"],
    createClient(state) {
      return {
        updateDocument: async () => {
          state.called = true;
          return { document: Promise.resolve({}) };
        },
      };
    },
  },
  {
    title: "webhook-update",
    moduleFile: "webhooks.js",
    registerName: "registerWebhooks",
    commandArgs: ["webhook-update", "hook-1"],
    createClient(state) {
      return {
        updateWebhook: async () => {
          state.called = true;
          return { webhook: Promise.resolve({}) };
        },
      };
    },
  },
  {
    title: "label-update",
    moduleFile: "labels.js",
    registerName: "registerLabels",
    commandArgs: ["label-update", "label-1"],
    createClient(state) {
      return {
        updateIssueLabel: async () => {
          state.called = true;
          return { issueLabel: Promise.resolve({}) };
        },
      };
    },
  },
  {
    title: "roadmap-update",
    moduleFile: "roadmaps.js",
    registerName: "registerRoadmaps",
    commandArgs: ["roadmap-update", "roadmap-1"],
    createClient(state) {
      return {
        updateRoadmap: async () => {
          state.called = true;
          return { roadmap: Promise.resolve({}) };
        },
      };
    },
  },
  {
    title: "cycle-update",
    moduleFile: "cycles.js",
    registerName: "registerCycles",
    commandArgs: ["cycle-update", "cycle-1"],
    createClient(state) {
      return {
        updateCycle: async () => {
          state.called = true;
          return { cycle: Promise.resolve({}) };
        },
      };
    },
  },
  {
    title: "milestone-update",
    moduleFile: "milestones.js",
    registerName: "registerMilestones",
    commandArgs: ["milestone-update", "milestone-1"],
    createClient(state) {
      return {
        updateProjectMilestone: async () => {
          state.called = true;
          return { projectMilestone: Promise.resolve({}) };
        },
      };
    },
  },
  {
    title: "initiative-update",
    moduleFile: "initiatives.js",
    registerName: "registerInitiatives",
    commandArgs: ["initiative-update", "initiative-1"],
    createClient(state) {
      return {
        updateInitiative: async () => {
          state.called = true;
          return { initiative: Promise.resolve({}) };
        },
      };
    },
  },
];

for (const guardCase of guardCases) {
  test(`${guardCase.title} exits when no fields are provided`, async () => {
    const state = { called: false };
    const mod = loadCommandModule(guardCase.moduleFile, {
      createClient: () => guardCase.createClient(state),
      printJson: () => {},
    });

    try {
      const program = createProgram();
      mod[guardCase.registerName](program);
      await expectExit(() => run(program, guardCase.commandArgs), {
        stderrPattern: /provide at least one field to update/i,
      });
      assert.equal(state.called, false);
    } finally {
      mod.restore();
    }
  });
}
