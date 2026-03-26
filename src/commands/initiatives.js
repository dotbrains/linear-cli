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
}

module.exports = { registerInitiatives };
