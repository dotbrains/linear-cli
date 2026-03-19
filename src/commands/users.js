const { createClient } = require("../config");
const { printJson } = require("../helpers");

function registerUsers(program) {
  program
    .command("users")
    .description("List organization users")
    .action(async () => {
      const client = createClient();
      const allNodes = [];
      let connection = await client.users({ first: 100 });
      allNodes.push(...connection.nodes);
      while (connection.pageInfo.hasNextPage) {
        connection = await connection.fetchNext();
        allNodes.push(...connection.nodes);
      }
      printJson(allNodes);
    });
}

module.exports = { registerUsers };
