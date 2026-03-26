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

  program
    .command("user <id>")
    .description(
      "Fetch a single user by ID.\n\n" +
        "Example:\n" +
        "  $ linear user abc-123"
    )
    .action(async (id) => {
      const client = createClient();
      const user = await client.user(id);
      printJson(user);
    });
}

module.exports = { registerUsers };
