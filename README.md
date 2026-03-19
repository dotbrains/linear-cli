# linear — CLI for the Linear API

![linear](./assets/og-image.svg)

[![CI](https://github.com/dotbrains/linear-cli/actions/workflows/ci.yml/badge.svg)](https://github.com/dotbrains/linear-cli/actions/workflows/ci.yml)
[![GitHub Package](https://img.shields.io/badge/npm-%40dotbrains%2Flinear--cli-CB3837?logo=npm)](https://github.com/dotbrains/linear-cli/packages)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

![Node.js](https://img.shields.io/badge/-Node.js-339933?style=flat-square&logo=node.js&logoColor=white)
![JavaScript](https://img.shields.io/badge/-JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![Linear](https://img.shields.io/badge/-Linear-5E6AD2?style=flat-square&logo=linear&logoColor=white)

Search issues, manage comments, list labels and users, and check platform status — all from the command line. All commands output JSON.

## Quick Start

```sh
# Install (see Installation section for registry setup)
npm install -g @dotbrains/linear-cli

# Set up your API key
linear init

# Search for issues
linear search "auth bug"

# Get a specific issue with comments
linear issue ENG-123

# List issues by label
linear issues --labels Bug

# Add a comment
linear comment-add ENG-123 -b "Looks good to me"

# Check Linear platform status
linear status
```

## How It Works

1. Reads your API key from `~/.config/linear/config.json`.
2. Uses the official `@linear/sdk` to communicate with the Linear GraphQL API.
3. Paginates automatically — all list commands fetch every page.
4. Outputs raw JSON to stdout for easy piping into `jq`, scripts, or other tools.

## Installation

This package is published to [GitHub Packages](https://github.com/dotbrains/linear-cli/packages), not npmjs. One-time setup is required:

```sh
# 1. Point the @dotbrains scope at GitHub Packages
npm config set @dotbrains:registry https://npm.pkg.github.com

# 2. Authenticate with a GitHub personal access token (needs read:packages scope)
npm config set //npm.pkg.github.com/:_authToken <YOUR_GITHUB_PAT>
```

> **Tip:** If you have the [GitHub CLI](https://cli.github.com/) installed, you can use `gh auth token` instead of a PAT:
> ```sh
> npm config set //npm.pkg.github.com/:_authToken $(gh auth token)
> ```

Then install globally:

```sh
npm install -g @dotbrains/linear-cli
```

Or install from source:

```sh
git clone https://github.com/dotbrains/linear-cli.git
cd linear-cli
npm install
npm link
```

## Commands

| Command | Description |
|---|---|
| `linear init` | Set up linear by configuring your API key |
| `linear search <term>` | Full-text search (Issues, Documents, or Projects) |
| `linear users` | List organization users |
| `linear labels` | List all issue labels |
| `linear issues --labels <names...>` | List issues matching one or more labels |
| `linear issue <id>` | Fetch a single issue by ID or identifier (e.g. ENG-123) |
| `linear comment-add <issueId> -b <body>` | Add a comment to an issue |
| `linear comment-edit <commentId> -b <body>` | Edit an existing comment |
| `linear comment-delete <commentId>` | Delete a comment |
| `linear comment-get <commentId>` | Get a comment by UUID |
| `linear comments-mine` | List comments by the authenticated user |
| `linear status` | Check Linear platform status |

## Configuration

```sh
# First-time setup
linear init
```

This prompts for your API key, validates it against the Linear API, and writes the config to `~/.config/linear/config.json`.

Generate a personal API key at [Linear > Settings > Security](https://linear.app/settings/account/security).

To reconfigure, run `linear init --force`.

## Agent Skill

This repo includes an agent skill at `.claude/skills/linear/SKILL.md` that is automatically discovered by [Warp](https://www.warp.dev/) and [Claude Code](https://docs.anthropic.com/en/docs/claude-code). When working in this repo, the agent can use `linear` whenever you ask about bugs, issues, or anything Linear-related.

With the skill active, you can say things like:

> Find every engineering-related bug in Linear that is unfinished. For each one, look at the problem and then — by analyzing the codebase and git history — figure out which engineers are best suited to addressing each issue. Then leave a comment with that info.

The agent will use `linear` to search for issues, inspect the codebase, and post comments — all autonomously.

## Specification

See [`SPEC.md`](./SPEC.md) for the full technical specification — every command, its options, step-by-step behavior, authentication flow, pagination strategy, and error handling.

## Website

A marketing site lives in [`website/`](./website/). Built with Next.js, Tailwind, and TypeScript. Run locally:

```sh
cd website && npm install && npm run dev
```

## Testing

This project does not include unit tests. Each command is a thin wrapper around [`@linear/sdk`](https://www.npmjs.com/package/@linear/sdk) — the CLI parses arguments, calls the SDK, and prints the response as JSON. There is no business logic to test independently; the SDK itself is tested and maintained by Linear. Correctness is verified by running commands against the live API during development.

## Dependencies

- **[Node.js](https://nodejs.org/)** >= 18
- **[@linear/sdk](https://www.npmjs.com/package/@linear/sdk)** — official Linear API client
- **[Commander](https://www.npmjs.com/package/commander)** — CLI framework

## License

MIT
