const { createClient } = require("../config");
const { printJson } = require("../helpers");

function registerWebhooks(program) {
  program
    .command("webhooks")
    .description(
      "List all webhooks.\n\n" +
        "Example:\n" +
        "  $ linear webhooks"
    )
    .action(async () => {
      const client = createClient();
      const allNodes = [];
      let connection = await client.webhooks({ first: 100 });
      allNodes.push(...connection.nodes);
      while (connection.pageInfo.hasNextPage) {
        connection = await connection.fetchNext();
        allNodes.push(...connection.nodes);
      }
      printJson(allNodes);
    });

  program
    .command("webhook <id>")
    .description(
      "Fetch a single webhook by ID.\n\n" +
        "Example:\n" +
        "  $ linear webhook abc-123"
    )
    .action(async (id) => {
      const client = createClient();
      const webhook = await client.webhook(id);
      printJson(webhook);
    });

  program
    .command("webhook-create")
    .description(
      "Create a webhook.\n\n" +
        "Example:\n" +
        "  $ linear webhook-create --url https://example.com/hook --team abc-123"
    )
    .requiredOption("--url <url>", "webhook endpoint URL")
    .option("--team <id>", "team ID to scope the webhook to")
    .option("--label <text>", "human-readable label")
    .option("--secret <text>", "signing secret")
    .action(async (opts) => {
      const client = createClient();
      const input = { url: opts.url };
      if (opts.team) input.teamId = opts.team;
      if (opts.label) input.label = opts.label;
      if (opts.secret) input.secret = opts.secret;
      const result = await client.createWebhook(input);
      printJson(await result.webhook);
    });

  program
    .command("webhook-update <id>")
    .description(
      "Update a webhook.\n\n" +
        "Example:\n" +
        "  $ linear webhook-update abc-123 --url https://example.com/new-hook"
    )
    .option("--url <url>", "new endpoint URL")
    .option("--label <text>", "new label")
    .option("--enabled", "enable the webhook")
    .option("--disabled", "disable the webhook")
    .action(async (id, opts) => {
      const client = createClient();
      const input = {};
      if (opts.url) input.url = opts.url;
      if (opts.label) input.label = opts.label;
      if (opts.enabled) input.enabled = true;
      if (opts.disabled) input.enabled = false;
      if (!Object.keys(input).length) {
        console.error("Error: provide at least one field to update.");
        process.exit(1);
      }
      const result = await client.updateWebhook(id, input);
      printJson(await result.webhook);
    });

  program
    .command("webhook-delete <id>")
    .description(
      "Delete a webhook by ID.\n\n" +
        "Example:\n" +
        "  $ linear webhook-delete abc-123"
    )
    .action(async (id) => {
      const client = createClient();
      const result = await client.deleteWebhook(id);
      printJson({ success: result.success });
    });
}

module.exports = { registerWebhooks };
