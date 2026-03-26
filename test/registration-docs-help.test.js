const assert = require("node:assert/strict");
const { execFile } = require("node:child_process");
const fs = require("fs");
const path = require("path");
const test = require("node:test");
const { promisify } = require("node:util");
const {
  ROOT,
  createProgram,
  registerAllCommandModules,
} = require("../test-utils/command-test-utils");

const execFileAsync = promisify(execFile);

test("all command modules register successfully", () => {
  const program = createProgram();
  registerAllCommandModules(program);
  assert.ok(program.commands.length > 0);
});

test("README command list matches registered CLI commands", () => {
  const readmePath = path.join(ROOT, "README.md");
  const readme = fs.readFileSync(readmePath, "utf-8");
  const sectionMatch = readme.match(/## Commands([\s\S]*?)## Configuration/);
  assert.ok(sectionMatch, "README should include a Commands section");

  const readmeCommandNames = new Set();
  for (const match of sectionMatch[1].matchAll(/\| `linear ([^`]+)` \|/g)) {
    const commandName = match[1].trim().split(/\s+/)[0];
    readmeCommandNames.add(commandName);
  }
  assert.ok(readmeCommandNames.size > 0, "README command table should not be empty");

  const program = createProgram();
  registerAllCommandModules(program);
  const registeredNames = new Set(program.commands.map((cmd) => cmd.name()));
  registeredNames.delete("help");

  const missingFromCli = [...readmeCommandNames].filter((name) => !registeredNames.has(name));
  const missingFromReadme = [...registeredNames].filter((name) => !readmeCommandNames.has(name));

  assert.deepEqual(missingFromCli, []);
  assert.deepEqual(missingFromReadme, []);
});

test("cli includes the renamed project update fetch command", async () => {
  const cliPath = path.join(ROOT, "src", "cli.js");
  const { stdout } = await execFileAsync(
    process.execPath,
    [cliPath, "project-update-get", "--help"],
    {
      cwd: ROOT,
    }
  );

  assert.match(stdout, /project-update-get/);
  assert.match(stdout, /Fetch a single\s+project update by ID/);
});
