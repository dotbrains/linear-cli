# linear — CLI for the Linear API

![linear](./assets/og-image.svg)

[![CI](https://github.com/dotbrains/linear-cli/actions/workflows/ci.yml/badge.svg)](https://github.com/dotbrains/linear-cli/actions/workflows/ci.yml)
[![Release Pipeline](https://github.com/dotbrains/linear-cli/actions/workflows/publish.yml/badge.svg)](https://github.com/dotbrains/linear-cli/actions/workflows/publish.yml)
[![Release](https://img.shields.io/github/v/release/dotbrains/linear-cli?display_name=tag)](https://github.com/dotbrains/linear-cli/releases/latest)
[![GitHub Package](https://img.shields.io/badge/npm-%40dotbrains%2Flinear--cli-CB3837?logo=npm)](https://github.com/dotbrains/linear-cli/packages)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

![Node.js](https://img.shields.io/badge/-Node.js-339933?style=flat-square&logo=node.js&logoColor=white)
![JavaScript](https://img.shields.io/badge/-JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![Linear](https://img.shields.io/badge/-Linear-5E6AD2?style=flat-square&logo=linear&logoColor=white)

A CLI for the Linear API — search issues, create and update issues, manage comments, list teams, projects, cycles, roadmaps, workflow states, and notifications. All commands output JSON. Built on [`@linear/sdk`](https://www.npmjs.com/package/@linear/sdk) and [Commander](https://www.npmjs.com/package/commander).

## Problem

Linear has a rich GraphQL API but no official CLI. When working in the terminal — triaging bugs, scripting issue workflows, or integrating with CI — you need a fast way to query and mutate Linear data without switching to the browser.

`linear` provides:

- **Full-text search** — search issues, documents, or projects from the command line.
- **Issue management** — create, update, delete, and fetch issues with rich filtering by team, assignee, state, priority, and label.
- **Teams & workflow states** — list all teams and their workflow states.
- **Projects, cycles & roadmaps** — list and fetch planning entities.
- **Notifications** — list and mark notifications read/unread.
- **Automatic pagination** — all list commands fetch every page, so you always get the full result set.
- **JSON output** — every command writes JSON to stdout, making it trivial to pipe into `jq`, scripts, or other tools.
- **Comment management** — add, edit, delete, and list comments without leaving the terminal.
- **Agent integration** — ships with a Warp/Claude Code agent skill so AI agents can query Linear autonomously.

## Configuration

### Config File

| Variable | Location | Description |
|---|---|---|
| `apiKey` | `~/.config/linear/config.json` | Linear personal API key (`lin_api_...`) |

The config file is created by `linear init`. Generate a personal API key at [Linear > Settings > Security](https://linear.app/settings/account/security).

### Config Format

```json
{
  "apiKey": "lin_api_..."
}
```

## Commands

### `linear init [--force]`

Set up linear by configuring your API key.

Steps:
1. Checks if `~/.config/linear/config.json` already exists (exits unless `--force` is passed).
2. Prompts for an API key via stdin.
3. Validates the key by calling `client.viewer` against the Linear API.
4. Creates the config directory (`~/.config/linear/`) if it doesn't exist.
5. Writes the config file with the validated key.

### `linear me`

Print the authenticated user's profile.

Steps:
1. Reads the API key from config.
2. Resolves `client.viewer`.
3. Prints the viewer as JSON.

### `linear search <term>`

Full-text search across Linear entities.

Options:
- `-t, --type <type>` — entity type: `Issue` (default), `Document`, or `Project`.
- `--archived` — include archived results.

Steps:
1. Reads the API key from config.
2. Calls `client.searchIssues()`, `client.searchDocuments()`, or `client.searchProjects()` based on `--type`.
3. Prints the result nodes as JSON.

### `linear users`

List all organization users.

Steps:
1. Reads the API key from config.
2. Fetches users with `client.users()`, page size 100.
3. Follows pagination (`fetchNext()`) until all users are collected.
4. Prints all users as JSON.

### `linear teams`

List all teams in the organization.

Steps:
1. Reads the API key from config.
2. Fetches teams with `client.teams()`, page size 100.
3. Follows pagination until all teams are collected.
4. Prints all teams as JSON.

### `linear team <id>`

Fetch a single team by ID.

Steps:
1. Reads the API key from config.
2. Calls `client.team(id)`.
3. Prints the team as JSON.

### `linear labels`

List all issue labels.

Steps:
1. Reads the API key from config.
2. Fetches labels with `client.issueLabels()`, page size 250.
3. Follows pagination until all labels are collected.
4. Prints all labels as JSON.

### `linear workflow-states`

List workflow states.

Options:
- `--team <id>` — filter by team ID.

Steps:
1. Reads the API key from config.
2. Fetches workflow states with `client.workflowStates()`, page size 250, optionally filtered by team.
3. Follows pagination until all states are collected.
4. Prints all states as JSON.

### `linear issues`

List issues with optional filters.

Options:
- `-l, --labels <names...>` — filter by one or more label names (space-separated, case-sensitive).
- `--team <id>` — filter by team ID.
- `--assignee <id>` — filter by assignee user ID.
- `--state <id>` — filter by workflow state ID.
- `--priority <n>` — filter by priority (0=no priority, 1=urgent, 2=high, 3=medium, 4=low).
- `--first <n>` — page size (default: 50).

Steps:
1. Reads the API key from config.
2. Builds a filter object from any provided options.
3. Queries `client.issues()` with the constructed filter.
4. Follows pagination until all matching issues are collected.
5. Prints all issues as JSON.

When multiple labels are given, issues matching **any** of them are returned (OR semantics).

### `linear issue <id>`

Fetch a single issue by UUID or identifier (e.g. `ENG-123`).

Steps:
1. Reads the API key from config.
2. Attempts `client.issue(id)` (direct UUID lookup).
3. If that fails, falls back to `client.searchIssues(id, { first: 1, includeArchived: true })` to resolve identifiers like `ENG-123`.
4. Fetches all comments on the issue via `issue.comments()` with pagination.
5. Prints the issue with its comments as JSON.

### `linear issue-create`

Create a new issue.

Options:
- `--team <id>` — team ID (required).
- `--title <text>` — issue title (required).
- `--description <markdown>` — issue description.
- `--assignee <id>` — assignee user ID.
- `--state <id>` — workflow state ID.
- `--priority <n>` — priority (0–4).
- `--labels <ids...>` — label IDs to apply.

Steps:
1. Reads the API key from config.
2. Calls `client.createIssue(input)`.
3. Prints the created issue as JSON.

### `linear issue-update <id>`

Update an existing issue by UUID or identifier.

Options (all optional; at least one required):
- `--title <text>`, `--description <markdown>`, `--assignee <id>`, `--state <id>`, `--priority <n>`, `--labels <ids...>`.

Steps:
1. Reads the API key from config.
2. Resolves the issue UUID (with identifier fallback via `searchIssues`).
3. Calls `client.updateIssue(uuid, input)`.
4. Prints the updated issue as JSON.

### `linear issue-delete <id>`

Delete an issue by UUID or identifier.

Steps:
1. Reads the API key from config.
2. Resolves the issue UUID (with identifier fallback).
3. Calls `client.deleteIssue(uuid)`.
4. Prints `{ "success": true/false }` as JSON.

### `linear comment-add <issueId> -b <body>`

Add a comment to an issue.

Steps:
1. Reads the API key from config.
2. Calls `client.createComment({ issueId, body })`.
3. Prints the created comment as JSON.

The issue can be specified by UUID or identifier. The body is markdown.

### `linear comment-edit <commentId> -b <body>`

Edit an existing comment by its UUID.

Steps:
1. Reads the API key from config.
2. Calls `client.updateComment(commentId, { body })`.
3. Prints the updated comment as JSON.

### `linear comment-delete <commentId>`

Delete a comment by its UUID.

Steps:
1. Reads the API key from config.
2. Calls `client.deleteComment(commentId)`.
3. Prints `{ "success": true/false }` as JSON.

### `linear comment-get <commentId>`

Get a comment by its UUID.

Steps:
1. Reads the API key from config.
2. Calls `client.comment({ id: commentId })`.
3. Prints the comment as JSON.

### `linear comments-mine`

List comments created by the authenticated user.

Options:
- `--first <n>` — page size (default: 50).

Steps:
1. Reads the API key from config.
2. Resolves the authenticated user via `client.viewer`.
3. Queries `client.comments()` with a filter: `{ user: { id: { eq: me.id } } }`.
4. Follows pagination until all comments are collected.
5. Prints all comments as JSON.

### `linear projects`

List projects.

Options:
- `--team <id>` — filter by team ID.
- `--first <n>` — page size (default: 50).

Steps:
1. Reads the API key from config.
2. Fetches projects with `client.projects()`, optionally filtered by accessible team.
3. Follows pagination until all projects are collected.
4. Prints all projects as JSON.

### `linear project <id>`

Fetch a single project by ID.

Steps:
1. Reads the API key from config.
2. Calls `client.project(id)`.
3. Prints the project as JSON.

### `linear cycles`

List cycles.

Options:
- `--team <id>` — filter by team ID.
- `--first <n>` — page size (default: 50).

Steps:
1. Reads the API key from config.
2. Fetches cycles with `client.cycles()`, optionally filtered by team.
3. Follows pagination until all cycles are collected.
4. Prints all cycles as JSON.

### `linear cycle <id>`

Fetch a single cycle by ID.

Steps:
1. Reads the API key from config.
2. Calls `client.cycle(id)`.
3. Prints the cycle as JSON.

### `linear roadmaps`

List all roadmaps.

Steps:
1. Reads the API key from config.
2. Fetches roadmaps with `client.roadmaps()`, page size 50.
3. Follows pagination until all roadmaps are collected.
4. Prints all roadmaps as JSON.

### `linear notifications`

List notifications for the authenticated user.

Options:
- `--first <n>` — page size (default: 50).

Steps:
1. Reads the API key from config.
2. Fetches notifications with `client.notifications()`.
3. Follows pagination until all notifications are collected.
4. Prints all notifications as JSON.

### `linear notification-mark-read <id>`

Mark a notification as read.

Steps:
1. Reads the API key from config.
2. Calls `client.updateNotification(id, { readAt: <now> })`.
3. Prints the updated notification as JSON.

### `linear notification-mark-unread <id>`

Mark a notification as unread.

Steps:
1. Reads the API key from config.
2. Calls `client.updateNotification(id, { readAt: null })`.
3. Prints the updated notification as JSON.

### `linear roadmap <id>`

Fetch a single roadmap by ID.

Steps:
1. Reads the API key from config.
2. Calls `client.roadmap(id)`.
3. Prints the roadmap as JSON.

### `linear user <id>`

Fetch a single user by ID.

Steps:
1. Reads the API key from config.
2. Calls `client.user(id)`.
3. Prints the user as JSON.

### `linear issue-archive <id>`

Archive an issue by UUID or identifier.

Steps:
1. Reads the API key from config.
2. Resolves the issue UUID (with identifier fallback).
3. Calls `client.archiveIssue(uuid)`.
4. Prints `{ "success": true/false }` as JSON.

### `linear issue-unarchive <id>`

Unarchive an issue by UUID or identifier.

Steps:
1. Reads the API key from config.
2. Resolves the issue UUID (with identifier fallback, including archived issues).
3. Calls `client.unarchiveIssue(uuid)`.
4. Prints `{ "success": true/false }` as JSON.

### `linear issue-relations <issueId>`

List relations for an issue.

Steps:
1. Reads the API key from config.
2. Resolves the issue UUID.
3. Queries `client.issueRelations()` filtered by the issue ID.
4. Follows pagination and prints all relations as JSON.

### `linear issue-relation <id>`

Fetch a single issue relation by ID.

Steps:
1. Reads the API key from config.
2. Calls `client.issueRelation(id)`.
3. Prints the relation as JSON.

### `linear issue-relation-add`

Add a relation between two issues.

Options:
- `--issue <id>` — issue ID or identifier (required).
- `--related-issue <id>` — related issue ID or identifier (required).
- `--type <type>` — relation type: `blocks`, `duplicate`, or `related` (required).

Steps:
1. Reads the API key from config.
2. Resolves both issue UUIDs (with identifier fallback).
3. Calls `client.createIssueRelation({ issueId, relatedIssueId, type })`.
4. Prints the created relation as JSON.

### `linear issue-relation-delete <id>`

Delete an issue relation by ID.

Steps:
1. Reads the API key from config.
2. Calls `client.deleteIssueRelation(id)`.
3. Prints `{ "success": true/false }` as JSON.

### `linear comment-resolve <commentId>`

Resolve a comment by its UUID.

Steps:
1. Reads the API key from config.
2. Calls `client.commentResolve(commentId)`.
3. Prints the updated comment as JSON.

### `linear comment-unresolve <commentId>`

Unresolve a comment by its UUID.

Steps:
1. Reads the API key from config.
2. Calls `client.commentUnresolve(commentId)`.
3. Prints the updated comment as JSON.

### `linear notifications-mark-read-all`

Mark all notifications as read.

Steps:
1. Reads the API key from config.
2. Calls `client.notificationMarkReadAll({})`.
3. Prints `{ "success": true/false }` as JSON.

### `linear notifications-mark-unread-all`

Mark all notifications as unread.

Steps:
1. Reads the API key from config.
2. Calls `client.notificationMarkUnreadAll({})`.
3. Prints `{ "success": true/false }` as JSON.

### `linear notifications-archive-all`

Archive all notifications.

Steps:
1. Reads the API key from config.
2. Calls `client.notificationArchiveAll({})`.
3. Prints `{ "success": true/false }` as JSON.

### `linear documents`

List documents.

Options:
- `--first <n>` — page size (default: 50).

Steps:
1. Reads the API key from config.
2. Fetches documents with `client.documents()`.
3. Follows pagination and prints all documents as JSON.

### `linear document <id>`

Fetch a single document by ID.

Steps:
1. Reads the API key from config.
2. Calls `client.document(id)`.
3. Prints the document as JSON.

### `linear document-create`

Create a new document.

Options:
- `--title <text>` — document title (required).
- `--project <id>` — project ID to associate the document with (required).
- `--content <markdown>` — document content.

Steps:
1. Reads the API key from config.
2. Calls `client.createDocument({ title, projectId, content })`.
3. Prints the created document as JSON.

### `linear document-update <id>`

Update a document.

Options (at least one required):
- `--title <text>`, `--content <markdown>`.

Steps:
1. Reads the API key from config.
2. Calls `client.updateDocument(id, input)`.
3. Prints the updated document as JSON.

### `linear document-delete <id>`

Delete a document by ID.

Steps:
1. Reads the API key from config.
2. Calls `client.deleteDocument(id)`.
3. Prints `{ "success": true/false }` as JSON.

### `linear attachments <issueId>`

List attachments for an issue.

Steps:
1. Reads the API key from config.
2. Queries `client.attachments()` filtered by issue ID.
3. Follows pagination and prints all attachments as JSON.

### `linear attachment <id>`

Fetch a single attachment by ID.

Steps:
1. Reads the API key from config.
2. Calls `client.attachment(id)`.
3. Prints the attachment as JSON.

### `linear attachment-link-url <issueId>`

Link an external URL to an issue.

Options:
- `--url <url>` — URL to attach (required).
- `--title <text>` — display title.

Steps:
1. Reads the API key from config.
2. Calls `client.attachmentLinkURL({ issueId, url, title })`.
3. Prints the created attachment as JSON.

### `linear attachment-link-github-pr <issueId>`

Link a GitHub Pull Request to an issue.

Options:
- `--url <url>` — GitHub PR URL (required).

Steps:
1. Reads the API key from config.
2. Calls `client.attachmentLinkGitHubPR({ issueId, url })`.
3. Prints the created attachment as JSON.

### `linear attachment-link-github-issue <issueId>`

Link a GitHub Issue to a Linear issue.

Options:
- `--url <url>` — GitHub Issue URL (required).

Steps:
1. Reads the API key from config.
2. Calls `client.attachmentLinkGitHubIssue({ issueId, url })`.
3. Prints the created attachment as JSON.

### `linear attachment-delete <id>`

Delete an attachment by ID.

Steps:
1. Reads the API key from config.
2. Calls `client.deleteAttachment(id)`.
3. Prints `{ "success": true/false }` as JSON.

### `linear status`

Check Linear platform status.

Steps:
1. Makes an HTTPS GET request to `https://constellation.linear.app/api/statuspage`.
2. Parses the JSON response.
3. Prints it as JSON.

This command does not require an API key.

## How It Works

### Authentication

The CLI reads a personal API key from `~/.config/linear/config.json`. The key is loaded once per process and cached in memory. A `LinearClient` instance from `@linear/sdk` is created on demand for each command.

If the config file is missing, the CLI prints an error directing the user to run `linear init`. If the file exists but contains a legacy `cookie` field instead of `apiKey`, a migration message is shown.

### Pagination

All list commands (`users`, `teams`, `labels`, `workflow-states`, `issues`, `projects`, `cycles`, `roadmaps`, `notifications`, `comments-mine`) follow the same pattern:

1. Make an initial query with a `first` (page size) parameter.
2. Push the result `nodes` into an accumulator array.
3. While `connection.pageInfo.hasNextPage` is true, call `connection.fetchNext()` and push the new nodes.
4. Print the full array when done.

This guarantees the caller always receives the complete result set regardless of how many pages exist.

### JSON Output

Every command calls `printJson()`, which is `JSON.stringify(data, null, 2)` to stdout. All user-facing messages (errors, prompts, progress) go to stderr, keeping stdout clean for piping.

### Status Check

The `status` command bypasses the Linear SDK entirely. It makes a raw HTTPS GET request to Linear's status page API (`constellation.linear.app`) using Node's built-in `https` module, avoiding the need for an API key.

## Architecture

```mermaid
flowchart LR
    User -->|linear <cmd>| CLI[cli.js]
    CLI --> Init[init.js]
    CLI --> Me[me.js]
    CLI --> Search[search.js]
    CLI --> Users[users.js]
    CLI --> Teams[teams.js]
    CLI --> Labels[labels.js]
    CLI --> WS[workflow-states.js]
    CLI --> Issues[issues.js]
    CLI --> Comments[comments.js]
    CLI --> Projects[projects.js]
    CLI --> Cycles[cycles.js]
    CLI --> Roadmaps[roadmaps.js]
    CLI --> Notifications[notifications.js]
    CLI --> Status[status.js]
    Init --> Config[config.js]
    Me --> Config
    Search --> Config
    Users --> Config
    Teams --> Config
    Labels --> Config
    WS --> Config
    Issues --> Config
    Comments --> Config
    Projects --> Config
    Cycles --> Config
    Roadmaps --> Config
    Notifications --> Config
    Config --> SDK["@linear/sdk"]
    SDK --> API["Linear GraphQL API"]
    Status --> Helpers[helpers.js]
    Helpers --> StatusAPI["constellation.linear.app"]
```

### Command Registration Pipeline

```mermaid
sequenceDiagram
    participant User
    participant CLI as cli.js
    participant Cmd as Command Module
    participant Config as config.js
    participant SDK as @linear/sdk

    User->>CLI: linear <command> [args]
    CLI->>CLI: Commander parses argv
    CLI->>Cmd: dispatch to action handler
    Cmd->>Config: createClient()
    Config->>Config: loadConfig() — read ~/.config/linear/config.json
    Config->>SDK: new LinearClient({ apiKey })
    SDK-->>Cmd: client
    Cmd->>SDK: API call (search, list, mutate)
    SDK->>API: GraphQL request
    API-->>SDK: response
    SDK-->>Cmd: result
    Cmd->>Cmd: printJson(result)
    Cmd-->>User: JSON to stdout
```

## Package Structure

```
linear-cli/
├── src/
│   ├── cli.js                 # CLI entry point: Commander setup, command registration
│   ├── config.js              # Config loading (CONFIG_PATH), LinearClient factory (createClient)
│   ├── helpers.js             # httpGet(), printJson(), STATUS_HOST constant
│   └── commands/
│       ├── init.js            # `init` command — API key setup and validation
│       ├── me.js              # `me` command — authenticated user profile
│       ├── search.js          # `search` command — full-text search (Issue, Document, Project)
│       ├── users.js           # `users` command — list organization users
│       ├── teams.js           # `teams` + `team` commands — list teams, fetch single team
│       ├── labels.js          # `labels` command — list issue labels
│       ├── workflow-states.js # `workflow-states` command — list workflow states
│       ├── issues.js          # `issues`, `issue`, `issue-create`, `issue-update`, `issue-delete`
│       ├── comments.js        # `comment-add`, `comment-edit`, `comment-delete`, `comment-get`, `comments-mine`
│       ├── projects.js        # `projects` + `project` commands
│       ├── cycles.js          # `cycles` + `cycle` commands
│       ├── roadmaps.js        # `roadmaps` command
│       ├── notifications.js   # `notifications`, `notification-mark-read/unread`, `notifications-mark-read/unread-all`, `notifications-archive-all`
│       ├── documents.js       # `documents`, `document`, `document-create`, `document-update`, `document-delete`
│       ├── attachments.js     # `attachments`, `attachment`, `attachment-link-url/github-pr/github-issue`, `attachment-delete`
│       ├── relations.js       # `issue-relations`, `issue-relation`, `issue-relation-add`, `issue-relation-delete`
│       └── status.js          # `status` command — Linear platform status check
├── assets/
│   └── og-image.svg           # Project banner image
├── .claude/
│   └── skills/
│       └── linear/
│           └── SKILL.md       # Agent skill for Warp / Claude Code integration
├── .github/workflows/
│   ├── ci.yml                 # CI: lint + build (matrix: Node 18/20, ubuntu/macos)
│   └── publish.yml            # Publish to GitHub Packages on release
├── eslint.config.js           # ESLint flat config (CommonJS, ES2022)
├── package.json               # Dependencies, scripts, bin entry
├── SPEC.md                    # This file
├── README.md                  # User-facing documentation
└── LICENSE                    # MIT
```

## Testing Strategy

### Linting

ESLint with the flat config (`eslint.config.js`) runs on all files in `src/`. Configured for CommonJS (`sourceType: "commonjs"`) with `ecmaVersion: 2022`. The only custom rule is `no-unused-vars` with `argsIgnorePattern: "^_"`.

### Build Verification

The build step uses esbuild to bundle `src/cli.js` into a single `dist/linear` file targeting Node 18. This runs as part of CI to catch import errors and missing dependencies.

### Running Checks

```bash
# Lint
npm run lint

# Build
npm run build
```

### CI

Linting and build verification run on every push to `main`/`master` and all pull requests. See [GitHub Actions](#github-actions) for details.

## GitHub Actions

### CI — `.github/workflows/ci.yml`

Triggered on push to `main`/`master`, all pull requests, and via `workflow_call` (reusable).

**Jobs:**

1. **lint**
   - Runs on `ubuntu-latest`, Node 20.
   - Steps: checkout → setup Node → `npm ci` → `npm run lint`.

2. **build**
   - Matrix: `node: [18, 20]`, `os: [ubuntu-latest, macos-latest]`.
   - Steps: checkout → setup Node → `npm ci` → `npm run build`.

### Publish — `.github/workflows/publish.yml`

Triggered when a GitHub release is published.

**Steps:**
1. Runs CI via `workflow_call` (reusable workflow).
2. Checks out the repo.
3. Sets up Node 20 with the GitHub Packages registry (`https://npm.pkg.github.com`).
4. Runs `npm ci`, `npm run build`, `npm publish`.
5. Publishes `@dotbrains/linear-cli` to GitHub Packages using the built-in `GITHUB_TOKEN`.

Consumers install by configuring the `@dotbrains` scope:

```sh
# .npmrc
@dotbrains:registry=https://npm.pkg.github.com
```

```sh
npm install -g @dotbrains/linear-cli
```

## Implementation Language

**JavaScript** (CommonJS). Published as `@dotbrains/linear-cli` on [GitHub Packages](https://github.com/dotbrains/linear-cli/packages). Distributed as a single bundled file via `dist/linear` (esbuild, targeting Node 18). The `bin` field in `package.json` points to `dist/linear`.

Key dependencies:
- **[`@linear/sdk@^78.0.0`](https://www.npmjs.com/package/@linear/sdk)** — official Linear GraphQL API client. Handles authentication, query building, pagination cursors, and type-safe responses.
- **[`commander@^14.0.3`](https://www.npmjs.com/package/commander)** — CLI framework. Parses arguments, registers subcommands, generates help text.

Dev dependencies:
- **[`esbuild@^0.27.4`](https://esbuild.github.io/)** — bundler. Produces the single-file `dist/linear` executable.
- **[`eslint@^10.0.3`](https://eslint.org/)** + **`@eslint/js@^10.0.1`** — linter with flat config.

## Design Decisions

### 1. JSON-only output, messages to stderr

All command output is JSON on stdout. All human-readable messages (errors, prompts, validation feedback) go to stderr. This makes the CLI composable: you can pipe output directly into `jq` or another program without worrying about non-JSON noise.

### 2. `@linear/sdk` instead of raw GraphQL

The official SDK provides typed methods, built-in pagination helpers (`fetchNext()`), and handles authentication. Using it avoids hand-writing GraphQL queries and managing cursor-based pagination manually. The tradeoff is a heavier dependency, but the SDK is well-maintained and eliminates an entire class of bugs.

### 3. Identifier fallback via search

`linear issue ENG-123` first tries a direct UUID lookup. If that throws (because `ENG-123` is an identifier, not a UUID), it falls back to `searchIssues` with `first: 1`. This gives users the ergonomics of typing identifiers (what they see in the UI) without requiring a separate "resolve identifier" API call.

### 4. No SDK for status check

The `status` command hits `constellation.linear.app`, which is a separate service from the Linear API. Using Node's built-in `https` module avoids initializing the SDK (and requiring an API key) for a command that doesn't need authentication.

### 5. Single-file esbuild bundle

The CLI is bundled into one file with esbuild rather than distributed as raw source. This simplifies the npm package (`files: ["dist"]`), avoids runtime dependency resolution issues, and makes global installs (`npm install -g`) fast and reliable.

### 6. Config file over environment variables

The API key lives in `~/.config/linear/config.json` rather than an environment variable. This keeps the key out of shell history and environment listings, and the `init` command validates the key before persisting it. The config path follows the XDG Base Directory convention on macOS/Linux.

### 7. Eager pagination

All list commands fetch every page before printing. This is simpler than streaming and guarantees the output is a single valid JSON array. For the expected data volumes (org users, labels, filtered issues), full pagination completes quickly. If a user needs partial results, they can pipe through `jq '.[0:10]'`.

## Non-Goals

- **Interactive TUI.** The CLI outputs JSON for composability. No curses-based UI, no interactive prompts beyond `init`.
- **Webhook handling.** No server component. The CLI is a client that talks to Linear's API on demand.
- **Multi-workspace.** One API key, one workspace. Switching workspaces requires re-running `init --force`.
- **Offline support.** Every command makes a live API call. No local caching or offline mode.
- **TypeScript.** The project uses plain JavaScript (CommonJS) intentionally to keep the toolchain minimal — no compilation step for development, just esbuild for the release bundle.
