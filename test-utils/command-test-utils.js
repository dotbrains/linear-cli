const assert = require("node:assert/strict");
const { execFile } = require("node:child_process");
const path = require("path");
const { promisify } = require("node:util");
const { Command } = require("commander");

const execFileAsync = promisify(execFile);

const ROOT = path.resolve(__dirname, "..");
const CONFIG_MODULE = path.join(ROOT, "src", "config.js");
const HELPERS_MODULE = path.join(ROOT, "src", "helpers.js");
const COMMAND_MODULES = [
  ["init.js", "registerInit"],
  ["me.js", "registerMe"],
  ["search.js", "registerSearch"],
  ["users.js", "registerUsers"],
  ["teams.js", "registerTeams"],
  ["labels.js", "registerLabels"],
  ["workflow-states.js", "registerWorkflowStates"],
  ["issues.js", "registerIssues"],
  ["comments.js", "registerComments"],
  ["projects.js", "registerProjects"],
  ["cycles.js", "registerCycles"],
  ["roadmaps.js", "registerRoadmaps"],
  ["notifications.js", "registerNotifications"],
  ["documents.js", "registerDocuments"],
  ["attachments.js", "registerAttachments"],
  ["relations.js", "registerRelations"],
  ["milestones.js", "registerMilestones"],
  ["project-updates.js", "registerProjectUpdates"],
  ["webhooks.js", "registerWebhooks"],
  ["initiatives.js", "registerInitiatives"],
  ["templates.js", "registerTemplates"],
  ["status.js", "registerStatus"],
];

function createProgram() {
  const program = new Command();
  program.exitOverride();
  return program;
}

function createConnection(pages, index = 0) {
  return {
    nodes: pages[index],
    pageInfo: { hasNextPage: index < pages.length - 1 },
    fetchNext: async () => createConnection(pages, index + 1),
  };
}

async function run(program, args) {
  await program.parseAsync(["node", "linear", ...args]);
}

async function runNodeScript(script, env = {}) {
  try {
    const { stdout, stderr } = await execFileAsync(process.execPath, ["-e", script], {
      cwd: ROOT,
      env: { ...process.env, ...env },
    });
    return { exitCode: 0, stdout, stderr };
  } catch (err) {
    return {
      exitCode: err.code,
      stdout: err.stdout || "",
      stderr: err.stderr || "",
    };
  }
}

async function expectExit(runFn, { code = 1, stderrPattern } = {}) {
  const originalExit = process.exit;
  const originalConsoleError = console.error;
  const stderrLines = [];

  process.exit = (exitCode = 0) => {
    const err = new Error(`process.exit(${exitCode})`);
    err.name = "ProcessExitError";
    err.exitCode = exitCode;
    throw err;
  };
  console.error = (...args) => {
    stderrLines.push(args.join(" "));
  };

  try {
    await assert.rejects(runFn, (err) => {
      return err && err.name === "ProcessExitError" && err.exitCode === code;
    });
  } finally {
    process.exit = originalExit;
    console.error = originalConsoleError;
  }

  const stderr = stderrLines.join("\n");
  if (stderrPattern) {
    assert.match(stderr, stderrPattern);
  }
  return stderr;
}

function registerAllCommandModules(program) {
  for (const [file, exportName] of COMMAND_MODULES) {
    const modulePath = path.join(ROOT, "src", "commands", file);
    delete require.cache[require.resolve(modulePath)];
    const mod = require(modulePath);
    assert.equal(typeof mod[exportName], "function", `${file} should export ${exportName}`);
    mod[exportName](program);
    delete require.cache[require.resolve(modulePath)];
  }
}

function loadCommandModule(commandFile, mocks = {}) {
  const config = require(CONFIG_MODULE);
  const helpers = require(HELPERS_MODULE);
  const original = {
    createClient: config.createClient,
    printJson: helpers.printJson,
    httpGet: helpers.httpGet,
    STATUS_HOST: helpers.STATUS_HOST,
  };

  if (Object.prototype.hasOwnProperty.call(mocks, "createClient")) {
    config.createClient = mocks.createClient;
  }
  if (Object.prototype.hasOwnProperty.call(mocks, "printJson")) {
    helpers.printJson = mocks.printJson;
  }
  if (Object.prototype.hasOwnProperty.call(mocks, "httpGet")) {
    helpers.httpGet = mocks.httpGet;
  }
  if (Object.prototype.hasOwnProperty.call(mocks, "STATUS_HOST")) {
    helpers.STATUS_HOST = mocks.STATUS_HOST;
  }

  const commandModulePath = path.join(ROOT, "src", "commands", commandFile);
  delete require.cache[require.resolve(commandModulePath)];
  const commandModule = require(commandModulePath);

  return {
    ...commandModule,
    restore() {
      config.createClient = original.createClient;
      helpers.printJson = original.printJson;
      helpers.httpGet = original.httpGet;
      helpers.STATUS_HOST = original.STATUS_HOST;
      delete require.cache[require.resolve(commandModulePath)];
    },
  };
}

function loadInitCommandModule({ configPath, promptAnswer, linearClientFactory } = {}) {
  const config = require(CONFIG_MODULE);
  const readline = require("readline");
  const sdk = require("@linear/sdk");
  const original = {
    configPath: config.CONFIG_PATH,
    createInterface: readline.createInterface,
    LinearClient: sdk.LinearClient,
  };

  if (configPath !== undefined) {
    config.CONFIG_PATH = configPath;
  }
  if (promptAnswer !== undefined) {
    readline.createInterface = () => ({
      question(_question, cb) {
        cb(promptAnswer);
      },
      close() {},
    });
  }
  if (linearClientFactory !== undefined) {
    sdk.LinearClient = linearClientFactory;
  }

  const commandModulePath = path.join(ROOT, "src", "commands", "init.js");
  delete require.cache[require.resolve(commandModulePath)];
  const commandModule = require(commandModulePath);

  return {
    ...commandModule,
    restore() {
      config.CONFIG_PATH = original.configPath;
      readline.createInterface = original.createInterface;
      sdk.LinearClient = original.LinearClient;
      delete require.cache[require.resolve(commandModulePath)];
    },
  };
}

module.exports = {
  COMMAND_MODULES,
  CONFIG_MODULE,
  ROOT,
  createConnection,
  createProgram,
  expectExit,
  loadCommandModule,
  loadInitCommandModule,
  registerAllCommandModules,
  run,
  runNodeScript,
};
