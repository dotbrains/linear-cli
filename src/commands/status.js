const { STATUS_HOST, httpGet, printJson } = require("../helpers");

function registerStatus(program) {
  program
    .command("status")
    .description("Check Linear platform status")
    .action(async () => {
      const raw = await httpGet(STATUS_HOST, "/api/statuspage");
      printJson(JSON.parse(raw));
    });
}

module.exports = { registerStatus };
