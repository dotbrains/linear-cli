const { createClient } = require("../config");
const { printJson } = require("../helpers");

function registerInitiatives(program) {
  program
    .command("initiatives")
    .description(
      "List all initiatives.\n\n" +
        "Example:\n" +
        "  $ linear initiatives"
    )
    .option("--first <n>", "page size", "50")
    .action(async (opts) => {
      const client = createClient();
      const allNodes = [];
      let connection = await client.initiatives({ first: parseInt(opts.first, 10) });
      allNodes.push(...connection.nodes);
      while (connection.pageInfo.hasNextPage) {
        connection = await connection.fetchNext();
        allNodes.push(...connection.nodes);
      }
      printJson(allNodes);
    });

  program
    .command("initiative <id>")
    .description(
      "Fetch a single initiative by ID.\n\n" +
        "Example:\n" +
        "  $ linear initiative abc-123"
    )
    .action(async (id) => {
      const client = createClient();
      const initiative = await client.initiative(id);
      printJson(initiative);
    });

  program
    .command("initiative-create")
    .description(
      "Create a new initiative.\n\n" +
        "Example:\n" +
        '  $ linear initiative-create --name "Platform Reliability" --description "Q1 focus"'
    )
    .requiredOption("--name <text>", "initiative name")
    .option("--description <text>", "initiative description")
    .action(async (opts) => {
      const client = createClient();
      const input = { name: opts.name };
      if (opts.description) input.description = opts.description;
      const result = await client.createInitiative(input);
      printJson(await result.initiative);
    });

  program
    .command("initiative-update <id>")
    .description(
      "Update an initiative.\n\n" +
        "Example:\n" +
        '  $ linear initiative-update abc-123 --name "Platform Stability"'
    )
    .option("--name <text>", "new name")
    .option("--description <text>", "new description")
    .action(async (id, opts) => {
      const client = createClient();
      const input = {};
      if (opts.name) input.name = opts.name;
      if (opts.description) input.description = opts.description;
      if (!Object.keys(input).length) {
        console.error("Error: provide at least one field to update.");
        process.exit(1);
      }
      const result = await client.updateInitiative(id, input);
      printJson(await result.initiative);
    });

  program
    .command("initiative-delete <id>")
    .description(
      "Delete an initiative by ID.\n\n" +
        "Example:\n" +
        "  $ linear initiative-delete abc-123"
    )
    .action(async (id) => {
      const client = createClient();
      const result = await client.deleteInitiative(id);
      printJson({ success: result.success });
    });
}

module.exports = { registerInitiatives };
