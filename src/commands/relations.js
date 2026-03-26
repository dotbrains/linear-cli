const { createClient } = require("../config");
const { printJson } = require("../helpers");

// Valid relation types from the Linear API
const RELATION_TYPES = ["blocks", "duplicate", "related"];

async function resolveIssueId(client, id) {
  try {
    const issue = await client.issue(id);
    return issue.id;
  } catch {
    const results = await client.searchIssues(id, { first: 1, includeArchived: true });
    if (!results.nodes.length) {
      console.error(`Issue not found: ${id}`);
      process.exit(1);
    }
    return results.nodes[0].id;
  }
}

function registerRelations(program) {
  program
    .command("issue-relations <issueId>")
    .description(
      "List relations for an issue.\n\n" +
        "Example:\n" +
        "  $ linear issue-relations ENG-123"
    )
    .action(async (issueId) => {
      const client = createClient();
      const uuid = await resolveIssueId(client, issueId);
      const allNodes = [];
      let connection = await client.issueRelations({
        first: 50,
        filter: { issue: { id: { eq: uuid } } },
      });
      allNodes.push(...connection.nodes);
      while (connection.pageInfo.hasNextPage) {
        connection = await connection.fetchNext();
        allNodes.push(...connection.nodes);
      }
      printJson(allNodes);
    });

  program
    .command("issue-relation <id>")
    .description(
      "Fetch a single issue relation by ID.\n\n" +
        "Example:\n" +
        "  $ linear issue-relation abc-123"
    )
    .action(async (id) => {
      const client = createClient();
      const relation = await client.issueRelation(id);
      printJson(relation);
    });

  program
    .command("issue-relation-add")
    .description(
      "Add a relation between two issues.\n\n" +
        "Relation types: blocks, duplicate, related\n\n" +
        "Examples:\n" +
        "  $ linear issue-relation-add --issue ENG-123 --related-issue ENG-456 --type blocks\n" +
        "  $ linear issue-relation-add --issue ENG-123 --related-issue ENG-789 --type related"
    )
    .requiredOption("--issue <id>", "issue ID or identifier")
    .requiredOption("--related-issue <id>", "related issue ID or identifier")
    .requiredOption(`--type <type>`, `relation type: ${RELATION_TYPES.join(", ")}`)
    .action(async (opts) => {
      const client = createClient();
      if (!RELATION_TYPES.includes(opts.type)) {
        console.error(`Error: invalid type "${opts.type}". Use: ${RELATION_TYPES.join(", ")}`);
        process.exit(1);
      }
      const [issueId, relatedIssueId] = await Promise.all([
        resolveIssueId(client, opts.issue),
        resolveIssueId(client, opts.relatedIssue),
      ]);
      const result = await client.createIssueRelation({ issueId, relatedIssueId, type: opts.type });
      printJson(await result.issueRelation);
    });

  program
    .command("issue-relation-delete <id>")
    .description(
      "Delete an issue relation by ID.\n\n" +
        "Example:\n" +
        "  $ linear issue-relation-delete abc-123"
    )
    .action(async (id) => {
      const client = createClient();
      const result = await client.deleteIssueRelation(id);
      printJson({ success: result.success });
    });
}

module.exports = { registerRelations };
