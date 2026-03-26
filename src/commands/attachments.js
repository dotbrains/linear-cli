const { createClient } = require("../config");
const { printJson } = require("../helpers");

function registerAttachments(program) {
  program
    .command("attachments <issueId>")
    .description(
      "List attachments for an issue.\n\n" +
        "Example:\n" +
        "  $ linear attachments ENG-123"
    )
    .action(async (issueId) => {
      const client = createClient();
      const allNodes = [];
      let connection = await client.attachments({
        first: 50,
        filter: { issue: { id: { eq: issueId } } },
      });
      allNodes.push(...connection.nodes);
      while (connection.pageInfo.hasNextPage) {
        connection = await connection.fetchNext();
        allNodes.push(...connection.nodes);
      }
      printJson(allNodes);
    });

  program
    .command("attachment <id>")
    .description(
      "Fetch a single attachment by ID.\n\n" +
        "Example:\n" +
        "  $ linear attachment abc-123"
    )
    .action(async (id) => {
      const client = createClient();
      const attachment = await client.attachment(id);
      printJson(attachment);
    });

  program
    .command("attachment-link-url <issueId>")
    .description(
      "Link an external URL to an issue.\n\n" +
        "Example:\n" +
        '  $ linear attachment-link-url ENG-123 --url https://example.com --title "Design doc"'
    )
    .requiredOption("--url <url>", "URL to attach")
    .option("--title <text>", "display title for the attachment")
    .action(async (issueId, opts) => {
      const client = createClient();
      const input = { issueId, url: opts.url };
      if (opts.title) input.title = opts.title;
      const result = await client.attachmentLinkURL(input);
      printJson(await result.attachment);
    });

  program
    .command("attachment-link-github-pr <issueId>")
    .description(
      "Link a GitHub Pull Request to an issue.\n\n" +
        "Example:\n" +
        "  $ linear attachment-link-github-pr ENG-123 --url https://github.com/org/repo/pull/42"
    )
    .requiredOption("--url <url>", "GitHub PR URL")
    .action(async (issueId, opts) => {
      const client = createClient();
      const result = await client.attachmentLinkGitHubPR({ issueId, url: opts.url });
      printJson(await result.attachment);
    });

  program
    .command("attachment-link-github-issue <issueId>")
    .description(
      "Link a GitHub Issue to a Linear issue.\n\n" +
        "Example:\n" +
        "  $ linear attachment-link-github-issue ENG-123 --url https://github.com/org/repo/issues/10"
    )
    .requiredOption("--url <url>", "GitHub Issue URL")
    .action(async (issueId, opts) => {
      const client = createClient();
      const result = await client.attachmentLinkGitHubIssue({ issueId, url: opts.url });
      printJson(await result.attachment);
    });

  program
    .command("attachment-delete <id>")
    .description(
      "Delete an attachment by ID.\n\n" +
        "Example:\n" +
        "  $ linear attachment-delete abc-123"
    )
    .action(async (id) => {
      const client = createClient();
      const result = await client.deleteAttachment(id);
      printJson({ success: result.success });
    });
}

module.exports = { registerAttachments };
