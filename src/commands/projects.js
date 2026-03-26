const { createClient } = require("../config");
const { printJson } = require("../helpers");

function registerProjects(program) {
  program
    .command("projects")
    .description(
      "List projects.\n\n" +
        "Examples:\n" +
        "  $ linear projects\n" +
        "  $ linear projects --team abc-123"
    )
    .option("--team <id>", "filter by team ID")
    .option("--first <n>", "page size", "50")
    .action(async (opts) => {
      const client = createClient();
      const filter = opts.team ? { accessibleTeams: { id: { eq: opts.team } } } : undefined;
      const allNodes = [];
      let connection = await client.projects({
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
    .command("project <id>")
    .description(
      "Fetch a single project by ID.\n\n" +
        "Example:\n" +
        "  $ linear project abc-123"
    )
    .action(async (id) => {
      const client = createClient();
      const project = await client.project(id);
      printJson(project);
    });
}

module.exports = { registerProjects };
