const { createClient } = require("../config");
const { printJson } = require("../helpers");

function registerCycles(program) {
  program
    .command("cycles")
    .description(
      "List cycles.\n\n" +
        "Examples:\n" +
        "  $ linear cycles\n" +
        "  $ linear cycles --team abc-123"
    )
    .option("--team <id>", "filter by team ID")
    .option("--first <n>", "page size", "50")
    .action(async (opts) => {
      const client = createClient();
      const filter = opts.team ? { team: { id: { eq: opts.team } } } : undefined;
      const allNodes = [];
      let connection = await client.cycles({
        first: parseInt(opts.first, 10),
        filter,
      });
      allNodes.push(...connection.nodes);
      while (connection.pageInfo.hasNextPage) {
        connection = await connection.fetchNext();
        allNodes.push(...connection.nodes);
      }
      printJson(allNodes);
    });

  program
    .command("cycle <id>")
    .description(
      "Fetch a single cycle by ID.\n\n" +
        "Example:\n" +
        "  $ linear cycle abc-123"
    )
    .action(async (id) => {
      const client = createClient();
      const cycle = await client.cycle(id);
      printJson(cycle);
    });
}

module.exports = { registerCycles };
