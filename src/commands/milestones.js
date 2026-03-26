const { createClient } = require("../config");
const { printJson } = require("../helpers");

function registerMilestones(program) {
  program
    .command("milestones")
    .description(
      "List project milestones.\n\n" +
        "Examples:\n" +
        "  $ linear milestones --project abc-123\n" +
        "  $ linear milestones"
    )
    .option("--project <id>", "filter by project ID")
    .option("--first <n>", "page size", "50")
    .action(async (opts) => {
      const client = createClient();
      const filter = opts.project ? { project: { id: { eq: opts.project } } } : undefined;
      const allNodes = [];
      let connection = await client.projectMilestones({
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
    .command("milestone <id>")
    .description(
      "Fetch a single project milestone by ID.\n\n" +
        "Example:\n" +
        "  $ linear milestone abc-123"
    )
    .action(async (id) => {
      const client = createClient();
      const milestone = await client.projectMilestone(id);
      printJson(milestone);
    });

  program
    .command("milestone-create")
    .description(
      "Create a project milestone.\n\n" +
        "Example:\n" +
        '  $ linear milestone-create --project abc-123 --name "Beta Launch" --target-date 2024-12-01'
    )
    .requiredOption("--project <id>", "project ID")
    .requiredOption("--name <text>", "milestone name")
    .option("--description <text>", "milestone description")
    .option("--target-date <date>", "target date (YYYY-MM-DD)")
    .action(async (opts) => {
      const client = createClient();
      const input = { projectId: opts.project, name: opts.name };
      if (opts.description) input.description = opts.description;
      if (opts.targetDate) input.targetDate = opts.targetDate;
      const result = await client.createProjectMilestone(input);
      printJson(await result.projectMilestone);
    });

  program
    .command("milestone-update <id>")
    .description(
      "Update a project milestone.\n\n" +
        "Example:\n" +
        '  $ linear milestone-update abc-123 --name "GA Launch" --target-date 2025-01-15'
    )
    .option("--name <text>", "new name")
    .option("--description <text>", "new description")
    .option("--target-date <date>", "new target date (YYYY-MM-DD)")
    .action(async (id, opts) => {
      const client = createClient();
      const input = {};
      if (opts.name) input.name = opts.name;
      if (opts.description) input.description = opts.description;
      if (opts.targetDate) input.targetDate = opts.targetDate;
      if (!Object.keys(input).length) {
        console.error("Error: provide at least one field to update.");
        process.exit(1);
      }
      const result = await client.updateProjectMilestone(id, input);
      printJson(await result.projectMilestone);
    });

  program
    .command("milestone-delete <id>")
    .description(
      "Delete a project milestone by ID.\n\n" +
        "Example:\n" +
        "  $ linear milestone-delete abc-123"
    )
    .action(async (id) => {
      const client = createClient();
      const result = await client.deleteProjectMilestone(id);
      printJson({ success: result.success });
    });
}

module.exports = { registerMilestones };
