const { createClient } = require("../config");
const { printJson } = require("../helpers");

function registerSearch(program) {
  program
    .command("search <term>")
    .description("Full-text search")
    .option("-t, --type <type>", "entity type: Issue, Document, Project", "Issue")
    .option("--archived", "include archived results")
    .action(async (term, opts) => {
      const client = createClient();
      const vars = { includeArchived: !!opts.archived };
      let results;
      switch (opts.type) {
        case "Issue":
          results = await client.searchIssues(term, vars);
          break;
        case "Document":
          results = await client.searchDocuments(term, vars);
          break;
        case "Project":
          results = await client.searchProjects(term, vars);
          break;
        default:
          console.error(`Unknown type: ${opts.type}. Use Issue, Document, or Project.`);
          process.exit(1);
      }
      printJson(results.nodes);
    });
}

module.exports = { registerSearch };
