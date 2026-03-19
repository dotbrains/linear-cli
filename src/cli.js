#!/usr/bin/env node

const { Command } = require("commander");
const { registerSearch } = require("./commands/search");
const { registerUsers } = require("./commands/users");
const { registerLabels } = require("./commands/labels");
const { registerIssues } = require("./commands/issues");
const { registerComments } = require("./commands/comments");
const { registerStatus } = require("./commands/status");

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
      "  1. Generate a personal API key at https://linear.app/settings/account/security\n" +
      "  2. Create the config file:\n\n" +
      "    mkdir -p ~/.config/linear-cli\n" +
      '    cat > ~/.config/linear-cli/config.json << \'EOF\'\n' +
      "    {\n" +
      '      "apiKey": "lin_api_..."\n' +
      "    }\n" +
      "    EOF\n\n" +
      "Output:\n" +
      "  All commands output JSON."
  );

// Register commands
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
