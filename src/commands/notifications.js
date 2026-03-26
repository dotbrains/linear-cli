const { createClient } = require("../config");
const { printJson } = require("../helpers");

function registerNotifications(program) {
  program
    .command("notifications")
    .description(
      "List notifications for the authenticated user.\n\n" +
        "Examples:\n" +
        "  $ linear notifications\n" +
        "  $ linear notifications --first 20"
    )
    .option("--first <n>", "page size", "50")
    .action(async (opts) => {
      const client = createClient();
      const allNodes = [];
      let connection = await client.notifications({ first: parseInt(opts.first, 10) });
      allNodes.push(...connection.nodes);
      while (connection.pageInfo.hasNextPage) {
        connection = await connection.fetchNext();
        allNodes.push(...connection.nodes);
      }
      printJson(allNodes);
    });

  program
    .command("notification-mark-read <id>")
    .description(
      "Mark a notification as read.\n\n" +
        "Example:\n" +
        "  $ linear notification-mark-read abc-123"
    )
    .action(async (id) => {
      const client = createClient();
      const result = await client.updateNotification(id, { readAt: new Date().toISOString() });
      printJson(await result.notification);
    });

  program
    .command("notification-mark-unread <id>")
    .description(
      "Mark a notification as unread.\n\n" +
        "Example:\n" +
        "  $ linear notification-mark-unread abc-123"
    )
    .action(async (id) => {
      const client = createClient();
      const result = await client.updateNotification(id, { readAt: null });
      printJson(await result.notification);
    });
}

module.exports = { registerNotifications };
