#!/usr/bin/env node

const { Command } = require("commander");
const { registerSearch } = require("./commands/search");
const { registerUsers } = require("./commands/users");
const { registerLabels } = require("./commands/labels");
const { registerIssues } = require("./commands/issues");
const { registerComments } = require("./commands/comments");
const { registerStatus } = require("./commands/status");
const { registerInit } = require("./commands/init");

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

const program = new Command();
program
  .name("linear-cli")
  .version("1.0.0")
  .description(
    "CLI for the Linear API.\n\n" +
      "Setup:\n" +
      "  Run `linear-cli init` to configure your API key.\n\n" +
      "Output:\n" +
      "  All commands output JSON."
  );

// Register commands
registerInit(program);
registerSearch(program);
registerUsers(program);
registerLabels(program);
registerIssues(program);
registerComments(program);
registerStatus(program);

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

program.parseAsync(process.argv).catch((err) => {
  console.error(err.message);
  process.exit(1);
});
