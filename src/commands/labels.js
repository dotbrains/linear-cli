const { createClient } = require("../config");
const { printJson } = require("../helpers");

function registerLabels(program) {
  program
    .command("labels")
    .description("List all issue labels")
    .action(async () => {
      const client = createClient();
      const allNodes = [];
      let connection = await client.issueLabels({ first: 250 });
      allNodes.push(...connection.nodes);
      while (connection.pageInfo.hasNextPage) {
        connection = await connection.fetchNext();
        allNodes.push(...connection.nodes);
      }
      printJson(allNodes);
    });

  program
    .command("label-create")
    .description(
      "Create a new issue label.\n\n" +
        "Examples:\n" +
        '  $ linear label-create --team abc-123 --name "Tech Debt" --color "#e2e2e2"'
    )
    .requiredOption("--team <id>", "team ID to create the label in")
    .requiredOption("--name <text>", "label name")
    .option("--color <hex>", "label color as a hex string (e.g. #e2e2e2)")
    .action(async (opts) => {
      const client = createClient();
      const input = { teamId: opts.team, name: opts.name };
      if (opts.color) input.color = opts.color;
      const result = await client.createIssueLabel(input);
      printJson(await result.issueLabel);
    });

  program
    .command("label-update <id>")
    .description(
      "Update an issue label.\n\n" +
        "Example:\n" +
        '  $ linear label-update abc-123 --name "Bug" --color "#eb4646"'
    )
    .option("--name <text>", "new label name")
    .option("--color <hex>", "new label color")
    .action(async (id, opts) => {
      const client = createClient();
      const input = {};
      if (opts.name) input.name = opts.name;
      if (opts.color) input.color = opts.color;
      if (!Object.keys(input).length) {
        console.error("Error: provide at least one field to update.");
        process.exit(1);
      }
      const result = await client.updateIssueLabel(id, input);
      printJson(await result.issueLabel);
    });

  program
    .command("label-delete <id>")
    .description(
      "Delete an issue label by ID.\n\n" +
        "Example:\n" +
        "  $ linear label-delete abc-123"
    )
    .action(async (id) => {
      const client = createClient();
      const result = await client.deleteIssueLabel(id);
      printJson({ success: result.success });
    });
}

module.exports = { registerLabels };
