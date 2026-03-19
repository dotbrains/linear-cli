const { createClient } = require("../config");
const { printJson } = require("../helpers");

function registerLabels(program) {
  program
    .command("labels")
    .description("List all issue labels")
    .action(async () => {
      const client = createClient();
      const allNodes = [];
      let connection = await client.issueLabels({ first: 250 });
      allNodes.push(...connection.nodes);
      while (connection.pageInfo.hasNextPage) {
        connection = await connection.fetchNext();
        allNodes.push(...connection.nodes);
      }
      printJson(allNodes);
    });
}

module.exports = { registerLabels };
