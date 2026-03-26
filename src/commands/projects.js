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

  program
    .command("project-create")
    .description(
      "Create a new project.\n\n" +
        "Example:\n" +
        '  $ linear project-create --team abc-123 --name "New Feature" --description "Phase 1"'
    )
    .requiredOption("--team <id>", "team ID")
    .requiredOption("--name <text>", "project name")
    .option("--description <text>", "project description")
    .option("--state <id>", "project status ID")
    .option("--start-date <date>", "start date (YYYY-MM-DD)")
    .option("--target-date <date>", "target date (YYYY-MM-DD)")
    .action(async (opts) => {
      const client = createClient();
      const input = { teamIds: [opts.team], name: opts.name };
      if (opts.description) input.description = opts.description;
      if (opts.state) input.statusId = opts.state;
      if (opts.startDate) input.startDate = opts.startDate;
      if (opts.targetDate) input.targetDate = opts.targetDate;
      const result = await client.createProject(input);
      printJson(await result.project);
    });

  program
    .command("project-update <id>")
    .description(
      "Update a project.\n\n" +
        "Example:\n" +
        '  $ linear project-update abc-123 --name "Updated Name" --target-date 2025-06-01'
    )
    .option("--name <text>", "new name")
    .option("--description <text>", "new description")
    .option("--state <id>", "new project status ID")
    .option("--start-date <date>", "new start date (YYYY-MM-DD)")
    .option("--target-date <date>", "new target date (YYYY-MM-DD)")
    .action(async (id, opts) => {
      const client = createClient();
      const input = {};
      if (opts.name) input.name = opts.name;
      if (opts.description) input.description = opts.description;
      if (opts.state) input.statusId = opts.state;
      if (opts.startDate) input.startDate = opts.startDate;
      if (opts.targetDate) input.targetDate = opts.targetDate;
      if (!Object.keys(input).length) {
        console.error("Error: provide at least one field to update.");
        process.exit(1);
      }
      const result = await client.updateProject(id, input);
      printJson(await result.project);
    });

  program
    .command("project-delete <id>")
    .description(
      "Delete a project by ID.\n\n" +
        "Example:\n" +
        "  $ linear project-delete abc-123"
    )
    .action(async (id) => {
      const client = createClient();
      const result = await client.deleteProject(id);
      printJson({ success: result.success });
    });
}

module.exports = { registerProjects };
