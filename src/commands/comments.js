const { createClient } = require("../config");
const { printJson } = require("../helpers");

function registerComments(program) {
  program
    .command("comment-add <issueId>")
    .description(
      "Add a comment to an issue.\n\n" +
        "The issue can be specified by UUID or identifier (e.g. ENG-123).\n" +
        "The comment body is markdown.\n\n" +
        "Examples:\n" +
        '  $ linear-cli comment-add ENG-123 -b "Looks good to me"\n' +
        '  $ linear-cli comment-add ENG-123 -b "## Summary\\nDone."'
    )
    .requiredOption("-b, --body <markdown>", "comment body in markdown")
    .action(async (issueId, opts) => {
      const client = createClient();
      const result = await client.createComment({ issueId, body: opts.body });
      printJson(result.comment);
    });

  program
    .command("comment-edit <commentId>")
    .description(
      "Edit an existing comment by its UUID.\n\n" +
        "Example:\n" +
        '  $ linear-cli comment-edit abc-123 -b "Updated text"'
    )
    .requiredOption("-b, --body <markdown>", "new comment body in markdown")
    .action(async (commentId, opts) => {
      const client = createClient();
      const result = await client.updateComment(commentId, { body: opts.body });
      printJson(result.comment);
    });

  program
    .command("comment-delete <commentId>")
    .description(
      "Delete a comment by its UUID.\n\n" +
        "Example:\n" +
        "  $ linear-cli comment-delete abc-123"
    )
    .action(async (commentId) => {
      const client = createClient();
      const result = await client.deleteComment(commentId);
      printJson({ success: result.success });
    });

  program
    .command("comment-get <commentId>")
    .description(
      "Get a comment by its UUID.\n\n" +
        "Example:\n" +
        "  $ linear-cli comment-get abc-123"
    )
    .action(async (commentId) => {
      const client = createClient();
      const comment = await client.comment({ id: commentId });
      printJson(comment);
    });

  program
    .command("comments-mine")
    .description(
      "List comments created by the authenticated user.\n\n" +
        "Example:\n" +
        "  $ linear-cli comments-mine\n" +
        "  $ linear-cli comments-mine --first 10"
    )
    .option("--first <n>", "page size", "50")
    .action(async (opts) => {
      const client = createClient();
      const me = await client.viewer;
      const allNodes = [];
      let connection = await client.comments({
        first: parseInt(opts.first, 10),
        filter: { user: { id: { eq: me.id } } },
      });
      allNodes.push(...connection.nodes);
      while (connection.pageInfo.hasNextPage) {
        connection = await connection.fetchNext();
        allNodes.push(...connection.nodes);
      }
      printJson(allNodes);
    });
}

module.exports = { registerComments };
