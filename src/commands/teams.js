const { createClient } = require("../config");
const { printJson } = require("../helpers");

function registerTeams(program) {
  program
    .command("teams")
    .description(
      "List all teams in the organization.\n\n" +
        "Example:\n" +
        "  $ linear teams"
    )
    .action(async () => {
      const client = createClient();
      const allNodes = [];
      let connection = await client.teams({ first: 100 });
      allNodes.push(...connection.nodes);
      while (connection.pageInfo.hasNextPage) {
        connection = await connection.fetchNext();
        allNodes.push(...connection.nodes);
      }
      printJson(allNodes);
    });

  program
    .command("team <id>")
    .description(
      "Fetch a single team by ID.\n\n" +
        "Example:\n" +
        "  $ linear team abc-123"
    )
    .action(async (id) => {
      const client = createClient();
      const team = await client.team(id);
      printJson(team);
    });
}

module.exports = { registerTeams };
