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

  program
    .command("cycle-create")
    .description(
      "Create a cycle for a team.\n\n" +
        "Example:\n" +
        "  $ linear cycle-create --team abc-123 --name \"Sprint 12\" --starts-at 2024-12-01 --ends-at 2024-12-14"
    )
    .requiredOption("--team <id>", "team ID")
    .requiredOption("--starts-at <date>", "start date (YYYY-MM-DD)")
    .requiredOption("--ends-at <date>", "end date (YYYY-MM-DD)")
    .option("--name <text>", "cycle name")
    .option("--description <text>", "cycle description")
    .action(async (opts) => {
      const client = createClient();
      const input = { teamId: opts.team, startsAt: new Date(opts.startsAt), endsAt: new Date(opts.endsAt) };
      if (opts.name) input.name = opts.name;
      if (opts.description) input.description = opts.description;
      const result = await client.createCycle(input);
      printJson(await result.cycle);
    });

  program
    .command("cycle-update <id>")
    .description(
      "Update a cycle.\n\n" +
        "Example:\n" +
        '  $ linear cycle-update abc-123 --name "Sprint 13"'
    )
    .option("--name <text>", "new name")
    .option("--description <text>", "new description")
    .option("--starts-at <date>", "new start date (YYYY-MM-DD)")
    .option("--ends-at <date>", "new end date (YYYY-MM-DD)")
    .action(async (id, opts) => {
      const client = createClient();
      const input = {};
      if (opts.name) input.name = opts.name;
      if (opts.description) input.description = opts.description;
      if (opts.startsAt) input.startsAt = new Date(opts.startsAt);
      if (opts.endsAt) input.endsAt = new Date(opts.endsAt);
      if (!Object.keys(input).length) {
        console.error("Error: provide at least one field to update.");
        process.exit(1);
      }
      const result = await client.updateCycle(id, input);
      printJson(await result.cycle);
    });

  program
    .command("cycle-archive <id>")
    .description(
      "Archive a cycle by ID.\n\n" +
        "Example:\n" +
        "  $ linear cycle-archive abc-123"
    )
    .action(async (id) => {
      const client = createClient();
      const result = await client.archiveCycle(id);
      printJson({ success: result.success });
    });
}

module.exports = { registerCycles };
