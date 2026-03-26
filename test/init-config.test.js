const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const test = require("node:test");
const {
  CONFIG_MODULE,
  createProgram,
  expectExit,
  loadInitCommandModule,
  run,
  runNodeScript,
} = require("../test-utils/command-test-utils");

test("init exits when config already exists and --force is not set", async () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "linear-cli-init-"));
  const configPath = path.join(tempDir, "config.json");
  fs.writeFileSync(configPath, JSON.stringify({ apiKey: "lin_api_existing" }));

  const mod = loadInitCommandModule({ configPath });

  try {
    const program = createProgram();
    mod.registerInit(program);
    await expectExit(() => run(program, ["init"]), {
      stderrPattern: /Config already exists at .*Use --force to overwrite\./s,
    });
  } finally {
    mod.restore();
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test("init exits when prompted API key is empty", async () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "linear-cli-init-"));
  const configPath = path.join(tempDir, "config.json");

  const mod = loadInitCommandModule({
    configPath,
    promptAnswer: "   ",
  });

  try {
    const program = createProgram();
    mod.registerInit(program);
    await expectExit(() => run(program, ["init"]), {
      stderrPattern: /API key cannot be empty\./,
    });
    assert.equal(fs.existsSync(configPath), false);
  } finally {
    mod.restore();
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test("init exits when API key validation fails", async () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "linear-cli-init-"));
  const configPath = path.join(tempDir, "config.json");
  const linearClientInputs = [];

  const mod = loadInitCommandModule({
    configPath,
    promptAnswer: "lin_api_bad",
    linearClientFactory: class MockLinearClient {
      constructor(opts) {
        linearClientInputs.push(opts);
        this.viewer = Promise.reject(new Error("invalid key"));
      }
    },
  });

  try {
    const program = createProgram();
    mod.registerInit(program);
    await expectExit(() => run(program, ["init"]), {
      stderrPattern: /Invalid API key\. Please check and try again\./,
    });
    assert.deepEqual(linearClientInputs, [{ apiKey: "lin_api_bad" }]);
    assert.equal(fs.existsSync(configPath), false);
  } finally {
    mod.restore();
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test("init --force validates key and writes config", async () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "linear-cli-init-"));
  const configPath = path.join(tempDir, "config.json");
  fs.writeFileSync(configPath, JSON.stringify({ apiKey: "lin_api_old" }));
  const linearClientInputs = [];
  const originalConsoleError = console.error;
  const stderrLines = [];
  console.error = (...args) => {
    stderrLines.push(args.join(" "));
  };

  const mod = loadInitCommandModule({
    configPath,
    promptAnswer: "lin_api_new",
    linearClientFactory: class MockLinearClient {
      constructor(opts) {
        linearClientInputs.push(opts);
        this.viewer = Promise.resolve({ name: "Test User", email: "test@example.com" });
      }
    },
  });

  try {
    const program = createProgram();
    mod.registerInit(program);
    await run(program, ["init", "--force"]);
    assert.deepEqual(linearClientInputs, [{ apiKey: "lin_api_new" }]);
    assert.deepEqual(JSON.parse(fs.readFileSync(configPath, "utf-8")), {
      apiKey: "lin_api_new",
    });
    assert.match(stderrLines.join("\n"), /Authenticated as Test User \(test@example\.com\)/);
  } finally {
    console.error = originalConsoleError;
    mod.restore();
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test("config exits when config file is missing", async () => {
  const homeDir = fs.mkdtempSync(path.join(os.tmpdir(), "linear-cli-home-"));
  const script = `const { loadConfig } = require(${JSON.stringify(CONFIG_MODULE)}); loadConfig();`;

  try {
    const result = await runNodeScript(script, { HOME: homeDir });
    assert.equal(result.exitCode, 1);
    assert.match(result.stderr, /config file not found/);
    assert.match(result.stderr, /Run `linear init` to set up your API key/);
  } finally {
    fs.rmSync(homeDir, { recursive: true, force: true });
  }
});

test("config exits on malformed JSON", async () => {
  const homeDir = fs.mkdtempSync(path.join(os.tmpdir(), "linear-cli-home-"));
  const configDir = path.join(homeDir, ".config", "linear");
  const configPath = path.join(configDir, "config.json");
  const script = `const { loadConfig } = require(${JSON.stringify(CONFIG_MODULE)}); loadConfig();`;
  fs.mkdirSync(configDir, { recursive: true });
  fs.writeFileSync(configPath, "{ invalid json");

  try {
    const result = await runNodeScript(script, { HOME: homeDir });
    assert.equal(result.exitCode, 1);
    assert.match(result.stderr, /failed to parse config/);
  } finally {
    fs.rmSync(homeDir, { recursive: true, force: true });
  }
});

test("config exits with clear error for unsupported cookie auth", async () => {
  const homeDir = fs.mkdtempSync(path.join(os.tmpdir(), "linear-cli-home-"));
  const configDir = path.join(homeDir, ".config", "linear");
  const configPath = path.join(configDir, "config.json");
  const script = `const { loadConfig } = require(${JSON.stringify(CONFIG_MODULE)}); loadConfig();`;
  fs.mkdirSync(configDir, { recursive: true });
  fs.writeFileSync(configPath, JSON.stringify({ cookie: "session_cookie" }));

  try {
    const result = await runNodeScript(script, { HOME: homeDir });
    assert.equal(result.exitCode, 1);
    assert.match(result.stderr, /session cookie auth is no longer supported/);
    assert.match(result.stderr, /Generate a personal API key/);
  } finally {
    fs.rmSync(homeDir, { recursive: true, force: true });
  }
});

test("config exits when apiKey is missing", async () => {
  const homeDir = fs.mkdtempSync(path.join(os.tmpdir(), "linear-cli-home-"));
  const configDir = path.join(homeDir, ".config", "linear");
  const configPath = path.join(configDir, "config.json");
  const script = `const { loadConfig } = require(${JSON.stringify(CONFIG_MODULE)}); loadConfig();`;
  fs.mkdirSync(configDir, { recursive: true });
  fs.writeFileSync(configPath, JSON.stringify({}));

  try {
    const result = await runNodeScript(script, { HOME: homeDir });
    assert.equal(result.exitCode, 1);
    assert.match(result.stderr, /"apiKey" is missing/);
  } finally {
    fs.rmSync(homeDir, { recursive: true, force: true });
  }
});
