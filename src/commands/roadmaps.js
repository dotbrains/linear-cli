const { createClient } = require("../config");
const { printJson } = require("../helpers");

function registerRoadmaps(program) {
  program
    .command("roadmaps")
    .description(
      "List all roadmaps.\n\n" +
        "Example:\n" +
        "  $ linear roadmaps"
    )
    .action(async () => {
      const client = createClient();
      const allNodes = [];
      let connection = await client.roadmaps({ first: 50 });
      allNodes.push(...connection.nodes);
      while (connection.pageInfo.hasNextPage) {
        connection = await connection.fetchNext();
        allNodes.push(...connection.nodes);
      }
      printJson(allNodes);
    });

  program
    .command("roadmap <id>")
    .description(
      "Fetch a single roadmap by ID.\n\n" +
        "Example:\n" +
        "  $ linear roadmap abc-123"
    )
    .action(async (id) => {
      const client = createClient();
      const roadmap = await client.roadmap(id);
      printJson(roadmap);
    });

  program
    .command("roadmap-create")
    .description(
      "Create a new roadmap.\n\n" +
        "Example:\n" +
        '  $ linear roadmap-create --name "2025 Roadmap"'
    )
    .requiredOption("--name <text>", "roadmap name")
    .option("--description <text>", "roadmap description")
    .action(async (opts) => {
      const client = createClient();
      const input = { name: opts.name };
      if (opts.description) input.description = opts.description;
      const result = await client.createRoadmap(input);
      printJson(await result.roadmap);
    });

  program
    .command("roadmap-update <id>")
    .description(
      "Update a roadmap.\n\n" +
        "Example:\n" +
        '  $ linear roadmap-update abc-123 --name "2026 Roadmap"'
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
      const result = await client.updateRoadmap(id, input);
      printJson(await result.roadmap);
    });

  program
    .command("roadmap-delete <id>")
    .description(
      "Delete a roadmap by ID.\n\n" +
        "Example:\n" +
        "  $ linear roadmap-delete abc-123"
    )
    .action(async (id) => {
      const client = createClient();
      const result = await client.deleteRoadmap(id);
      printJson({ success: result.success });
    });
}

module.exports = { registerRoadmaps };
