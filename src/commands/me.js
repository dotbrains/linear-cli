const { createClient } = require("../config");
const { printJson } = require("../helpers");

function registerMe(program) {
  program
    .command("me")
    .description(
      "Show the authenticated user's profile.\n\n" +
        "Example:\n" +
        "  $ linear me"
    )
    .action(async () => {
      const client = createClient();
      const viewer = await client.viewer;
      printJson(viewer);
    });
}

module.exports = { registerMe };
