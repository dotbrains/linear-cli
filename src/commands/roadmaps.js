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
}

module.exports = { registerRoadmaps };
