#!/usr/bin/env node

const { Command } = require("commander");
const { registerInit } = require("./commands/init");
const { registerMe } = require("./commands/me");
const { registerSearch } = require("./commands/search");
const { registerUsers } = require("./commands/users");
const { registerTeams } = require("./commands/teams");
const { registerLabels } = require("./commands/labels");
const { registerWorkflowStates } = require("./commands/workflow-states");
const { registerIssues } = require("./commands/issues");
const { registerComments } = require("./commands/comments");
const { registerProjects } = require("./commands/projects");
const { registerCycles } = require("./commands/cycles");
const { registerRoadmaps } = require("./commands/roadmaps");
const { registerNotifications } = require("./commands/notifications");
const { registerDocuments } = require("./commands/documents");
const { registerAttachments } = require("./commands/attachments");
const { registerRelations } = require("./commands/relations");
const { registerStatus } = require("./commands/status");
const { version } = require("../package.json");

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

const program = new Command();
program
  .name("linear")
  .version(version)
  .description(
    "CLI for the Linear API.\n\n" +
      "Setup:\n" +
      "  Run `linear init` to configure your API key.\n\n" +
      "Output:\n" +
      "  All commands output JSON."
  );

// Register commands
registerInit(program);
registerMe(program);
registerSearch(program);
registerUsers(program);
registerTeams(program);
registerLabels(program);
registerWorkflowStates(program);
registerIssues(program);
registerComments(program);
registerProjects(program);
registerCycles(program);
registerRoadmaps(program);
registerNotifications(program);
registerDocuments(program);
registerAttachments(program);
registerRelations(program);
registerStatus(program);

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

program.parseAsync(process.argv).catch((err) => {
  console.error(err.message);
  process.exit(1);
});
