const { createClient } = require("../config");
const { printJson } = require("../helpers");

function registerIssues(program) {
  program
    .command("issues")
    .description(
      "List issues matching the specified labels.\n\n" +
        "Examples:\n" +
        "  $ linear-cli issues --labels Bug\n" +
        "  $ linear-cli issues --labels Bug Feature\n" +
        '  $ linear-cli issues --labels "Tech Debt" --first 100\n\n' +
        "Label names are matched exactly (case-sensitive). " +
        "When multiple labels are given, issues matching any of them are returned."
    )
    .requiredOption("-l, --labels <names...>", "one or more label names (space-separated)")
    .option("--first <n>", "page size", "50")
    .action(async (opts) => {
      const client = createClient();
      const allNodes = [];
      let connection = await client.issues({
        first: parseInt(opts.first, 10),
        filter: { labels: { name: { in: opts.labels } } },
      });
      allNodes.push(...connection.nodes);
      while (connection.pageInfo.hasNextPage) {
        connection = await connection.fetchNext();
        allNodes.push(...connection.nodes);
      }
      printJson(allNodes);
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
