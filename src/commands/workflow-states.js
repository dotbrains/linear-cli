const { createClient } = require("../config");
const { printJson } = require("../helpers");

function registerWorkflowStates(program) {
  program
    .command("workflow-states")
    .description(
      "List workflow states.\n\n" +
        "Examples:\n" +
        "  $ linear workflow-states\n" +
        "  $ linear workflow-states --team abc-123"
    )
    .option("--team <id>", "filter by team ID")
    .action(async (opts) => {
      const client = createClient();
      const filter = opts.team ? { team: { id: { eq: opts.team } } } : undefined;
      const allNodes = [];
      let connection = await client.workflowStates({ first: 250, filter });
      allNodes.push(...connection.nodes);
      while (connection.pageInfo.hasNextPage) {
        connection = await connection.fetchNext();
        allNodes.push(...connection.nodes);
      }
      printJson(allNodes);
    });
}

module.exports = { registerWorkflowStates };
