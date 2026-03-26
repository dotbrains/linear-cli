const { createClient } = require("../config");
const { printJson } = require("../helpers");

function registerProjectUpdates(program) {
  program
    .command("project-updates")
    .description(
      "List project updates.\n\n" +
        "Examples:\n" +
        "  $ linear project-updates --project abc-123\n" +
        "  $ linear project-updates"
    )
    .option("--project <id>", "filter by project ID")
    .option("--first <n>", "page size", "50")
    .action(async (opts) => {
      const client = createClient();
      const filter = opts.project ? { project: { id: { eq: opts.project } } } : undefined;
      const allNodes = [];
      let connection = await client.projectUpdates({
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
    .command("project-update-get <id>")
    .description(
      "Fetch a single project update by ID.\n\n" +
        "Example:\n" +
        "  $ linear project-update-get abc-123"
    )
    .action(async (id) => {
      const client = createClient();
      const update = await client.projectUpdate(id);
      printJson(update);
    });

  program
    .command("project-update-create")
    .description(
      "Post a progress update on a project.\n\n" +
        "Example:\n" +
        '  $ linear project-update-create --project abc-123 --body "Shipped the auth module."'
    )
    .requiredOption("--project <id>", "project ID")
    .requiredOption("--body <markdown>", "update body (markdown)")
    .option("--health <status>", "project health: onTrack, atRisk, offTrack")
    .action(async (opts) => {
      const client = createClient();
      const input = { projectId: opts.project, body: opts.body };
      if (opts.health) input.health = opts.health;
      const result = await client.createProjectUpdate(input);
      printJson(await result.projectUpdate);
    });
}

module.exports = { registerProjectUpdates };
