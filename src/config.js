const { LinearClient } = require("@linear/sdk");
const fs = require("fs");
const path = require("path");
const os = require("os");

const CONFIG_PATH = path.join(os.homedir(), ".config", "linear-cli", "config.json");

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

let _config = null;

function loadConfig() {
  if (_config) return _config;
  if (!fs.existsSync(CONFIG_PATH)) {
    console.error(`Error: config file not found at ${CONFIG_PATH}`);
    console.error(
      "Create it with:\n\n" +
        "  mkdir -p ~/.config/linear-cli\n" +
        '  cat > ~/.config/linear-cli/config.json << \'EOF\'\n' +
        "  {\n" +
        '    "apiKey": "lin_api_..."\n' +
        "  }\n" +
        "  EOF\n\n" +
        "Generate a personal API key at:\n" +
        "  https://linear.app/settings/account/security"
    );
    process.exit(1);
  }
  try {
    _config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
  } catch (err) {
    console.error(`Error: failed to parse config at ${CONFIG_PATH}: ${err.message}`);
    process.exit(1);
  }
  if (!_config.apiKey) {
    if (_config.cookie) {
      console.error(
        "Error: session cookie auth is no longer supported.\n\n" +
          "Generate a personal API key at:\n" +
          "  https://linear.app/settings/account/security\n\n" +
          "Then update your config to:\n" +
          '  { "apiKey": "lin_api_..." }'
      );
    } else {
      console.error(`Error: "apiKey" is missing from ${CONFIG_PATH}`);
    }
    process.exit(1);
  }
  return _config;
}

function createClient() {
  const config = loadConfig();
  return new LinearClient({ apiKey: config.apiKey });
}

module.exports = { CONFIG_PATH, loadConfig, createClient };
