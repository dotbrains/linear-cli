const { createClient } = require("../config");
const { printJson } = require("../helpers");

function registerDocuments(program) {
  program
    .command("documents")
    .description(
      "List documents.\n\n" +
        "Examples:\n" +
        "  $ linear documents\n" +
        "  $ linear documents --first 20"
    )
    .option("--first <n>", "page size", "50")
    .action(async (opts) => {
      const client = createClient();
      const allNodes = [];
      let connection = await client.documents({ first: parseInt(opts.first, 10) });
      allNodes.push(...connection.nodes);
      while (connection.pageInfo.hasNextPage) {
        connection = await connection.fetchNext();
        allNodes.push(...connection.nodes);
      }
      printJson(allNodes);
    });

  program
    .command("document <id>")
    .description(
      "Fetch a single document by ID.\n\n" +
        "Example:\n" +
        "  $ linear document abc-123"
    )
    .action(async (id) => {
      const client = createClient();
      const doc = await client.document(id);
      printJson(doc);
    });

  program
    .command("document-create")
    .description(
      "Create a new document.\n\n" +
        "Examples:\n" +
        '  $ linear document-create --title "My Doc" --project abc-123\n' +
        '  $ linear document-create --title "My Doc" --project abc-123 --content "## Overview"'
    )
    .requiredOption("--title <text>", "document title")
    .requiredOption("--project <id>", "project ID to associate the document with")
    .option("--content <markdown>", "document content (markdown)")
    .action(async (opts) => {
      const client = createClient();
      const input = { title: opts.title, projectId: opts.project };
      if (opts.content) input.content = opts.content;
      const result = await client.createDocument(input);
      printJson(await result.document);
    });

  program
    .command("document-update <id>")
    .description(
      "Update a document.\n\n" +
        "Example:\n" +
        '  $ linear document-update abc-123 --title "New Title"'
    )
    .option("--title <text>", "new title")
    .option("--content <markdown>", "new content (markdown)")
    .action(async (id, opts) => {
      const client = createClient();
      const input = {};
      if (opts.title) input.title = opts.title;
      if (opts.content) input.content = opts.content;
      if (!Object.keys(input).length) {
        console.error("Error: provide at least one field to update.");
        process.exit(1);
      }
      const result = await client.updateDocument(id, input);
      printJson(await result.document);
    });

  program
    .command("document-delete <id>")
    .description(
      "Delete a document by ID.\n\n" +
        "Example:\n" +
        "  $ linear document-delete abc-123"
    )
    .action(async (id) => {
      const client = createClient();
      const result = await client.deleteDocument(id);
      printJson({ success: result.success });
    });
}

module.exports = { registerDocuments };
