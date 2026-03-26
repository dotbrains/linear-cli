const { createClient } = require("../config");
const { printJson } = require("../helpers");

function registerTemplates(program) {
  program
    .command("templates")
    .description(
      "List all issue and project templates.\n\n" +
        "Example:\n" +
        "  $ linear templates"
    )
    .action(async () => {
      const client = createClient();
      const allNodes = [];
      let connection = await client.templates();
      // templates() returns a plain array, not a paginated connection
      if (Array.isArray(connection)) {
        printJson(connection);
        return;
      }
      allNodes.push(...connection.nodes);
      while (connection.pageInfo && connection.pageInfo.hasNextPage) {
        connection = await connection.fetchNext();
        allNodes.push(...connection.nodes);
      }
      printJson(allNodes);
    });

  program
    .command("template <id>")
    .description(
      "Fetch a single template by ID.\n\n" +
        "Example:\n" +
        "  $ linear template abc-123"
    )
    .action(async (id) => {
      const client = createClient();
      const tmpl = await client.template(id);
      printJson(tmpl);
    });
}

module.exports = { registerTemplates };
