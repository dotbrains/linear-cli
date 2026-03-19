const { LinearClient } = require("@linear/sdk");
const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { CONFIG_PATH } = require("../config");

function prompt(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stderr });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

function registerInit(program) {
  program
    .command("init")
    .description("Set up linear by configuring your API key")
    .option("--force", "overwrite existing config file")
    .action(async (opts) => {
      if (fs.existsSync(CONFIG_PATH) && !opts.force) {
        console.error(`Config already exists at ${CONFIG_PATH}`);
        console.error("Use --force to overwrite.");
        process.exit(1);
      }

      console.error("Generate a personal API key at:");
      console.error("  https://linear.app/settings/account/security\n");

      const apiKey = await prompt("API key: ");
      if (!apiKey) {
        console.error("Error: API key cannot be empty.");
        process.exit(1);
      }

      // Validate the key
      console.error("Validating...");
      try {
        const client = new LinearClient({ apiKey });
        const viewer = await client.viewer;
        console.error(`✓ Authenticated as ${viewer.name} (${viewer.email})`);
      } catch {
        console.error("✗ Invalid API key. Please check and try again.");
        process.exit(1);
      }

      // Write config
      const dir = path.dirname(CONFIG_PATH);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(CONFIG_PATH, JSON.stringify({ apiKey }, null, 2) + "\n");
      console.error(`✓ Config written to ${CONFIG_PATH}`);
    });
}

module.exports = { registerInit };
