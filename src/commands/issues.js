const { createClient } = require("../config");
const { printJson } = require("../helpers");

function registerIssues(program) {
  program
    .command("issues")
    .description(
      "List issues with optional filters.\n\n" +
        "Examples:\n" +
        "  $ linear issues\n" +
        "  $ linear issues --labels Bug\n" +
        "  $ linear issues --labels Bug Feature\n" +
        "  $ linear issues --team abc-123 --priority 1\n" +
        '  $ linear issues --state abc-123 --first 100\n\n' +
        "Label names are matched exactly (case-sensitive). " +
        "When multiple labels are given, issues matching any of them are returned."
    )
    .option("-l, --labels <names...>", "filter by one or more label names (space-separated)")
    .option("--team <id>", "filter by team ID")
    .option("--assignee <id>", "filter by assignee user ID")
    .option("--state <id>", "filter by workflow state ID")
    .option("--priority <n>", "filter by priority (0=no priority, 1=urgent, 2=high, 3=medium, 4=low)")
    .option("--first <n>", "page size", "50")
    .action(async (opts) => {
      const client = createClient();
      const filter = {};
      if (opts.labels) filter.labels = { name: { in: opts.labels } };
      if (opts.team) filter.team = { id: { eq: opts.team } };
      if (opts.assignee) filter.assignee = { id: { eq: opts.assignee } };
      if (opts.state) filter.state = { id: { eq: opts.state } };
      if (opts.priority !== undefined) filter.priority = { eq: parseInt(opts.priority, 10) };
      const allNodes = [];
      let connection = await client.issues({
        first: parseInt(opts.first, 10),
        filter: Object.keys(filter).length ? filter : undefined,
      });
      allNodes.push(...connection.nodes);
      while (connection.pageInfo.hasNextPage) {
        connection = await connection.fetchNext();
        allNodes.push(...connection.nodes);
      }
      printJson(allNodes);
    });

  program
    .command("issue-create")
    .description(
      "Create a new issue.\n\n" +
        "Examples:\n" +
        '  $ linear issue-create --team abc-123 --title "Fix login bug"\n' +
        '  $ linear issue-create --team abc-123 --title "Crash on startup" --priority 1 --assignee user-id'
    )
    .requiredOption("--team <id>", "team ID to create the issue in")
    .requiredOption("--title <text>", "issue title")
    .option("--description <markdown>", "issue description (markdown)")
    .option("--assignee <id>", "assignee user ID")
    .option("--state <id>", "workflow state ID")
    .option("--priority <n>", "priority (0=no priority, 1=urgent, 2=high, 3=medium, 4=low)")
    .option("--labels <ids...>", "label IDs to apply (space-separated)")
    .action(async (opts) => {
      const client = createClient();
      const input = { teamId: opts.team, title: opts.title };
      if (opts.description) input.description = opts.description;
      if (opts.assignee) input.assigneeId = opts.assignee;
      if (opts.state) input.stateId = opts.state;
      if (opts.priority !== undefined) input.priority = parseInt(opts.priority, 10);
      if (opts.labels) input.labelIds = opts.labels;
      const result = await client.createIssue(input);
      printJson(await result.issue);
    });

  program
    .command("issue-update <id>")
    .description(
      "Update an existing issue.\n\n" +
        "Examples:\n" +
        '  $ linear issue-update ENG-123 --title "Updated title"\n' +
        "  $ linear issue-update ENG-123 --priority 2 --assignee user-id"
    )
    .option("--title <text>", "new title")
    .option("--description <markdown>", "new description (markdown)")
    .option("--assignee <id>", "new assignee user ID")
    .option("--state <id>", "new workflow state ID")
    .option("--priority <n>", "new priority (0=no priority, 1=urgent, 2=high, 3=medium, 4=low)")
    .option("--labels <ids...>", "replace label IDs (space-separated)")
    .action(async (id, opts) => {
      const client = createClient();
      // Resolve identifier (e.g. ENG-123) to UUID if needed
      let issue;
      try {
        issue = await client.issue(id);
      } catch {
        const results = await client.searchIssues(id, { first: 1, includeArchived: true });
        if (!results.nodes.length) {
          console.error(`Issue not found: ${id}`);
          process.exit(1);
        }
        issue = results.nodes[0];
      }
      const input = {};
      if (opts.title) input.title = opts.title;
      if (opts.description) input.description = opts.description;
      if (opts.assignee) input.assigneeId = opts.assignee;
      if (opts.state) input.stateId = opts.state;
      if (opts.priority !== undefined) input.priority = parseInt(opts.priority, 10);
      if (opts.labels) input.labelIds = opts.labels;
      if (!Object.keys(input).length) {
        console.error("Error: provide at least one field to update.");
        process.exit(1);
      }
      const result = await client.updateIssue(issue.id, input);
      printJson(await result.issue);
    });

  program
    .command("issue-delete <id>")
    .description(
      "Delete an issue by ID or identifier.\n\n" +
        "Example:\n" +
        "  $ linear issue-delete ENG-123"
    )
    .action(async (id) => {
      const client = createClient();
      let issue;
      try {
        issue = await client.issue(id);
      } catch {
        const results = await client.searchIssues(id, { first: 1, includeArchived: true });
        if (!results.nodes.length) {
          console.error(`Issue not found: ${id}`);
          process.exit(1);
        }
        issue = results.nodes[0];
      }
      const result = await client.deleteIssue(issue.id);
      printJson({ success: result.success });
    });

  program
    .command("issue <id>")
    .description("Fetch a single issue by ID or identifier (e.g. ENG-123)")
    .action(async (id) => {
      const client = createClient();
      let issue;
      try {
        issue = await client.issue(id);
      } catch {
        // id might be an identifier like ENG-123; search for it
        const results = await client.searchIssues(id, {
          first: 1,
          includeArchived: true,
        });
        if (!results.nodes.length) {
          console.error(`Issue not found: ${id}`);
          process.exit(1);
        }
        issue = results.nodes[0];
      }
      const comments = [];
      let commentConn = await issue.comments({ first: 250 });
      comments.push(...commentConn.nodes);
      while (commentConn.pageInfo.hasNextPage) {
        commentConn = await commentConn.fetchNext();
        comments.push(...commentConn.nodes);
      }
      printJson({ ...issue, comments });
    });
}

module.exports = { registerIssues };
