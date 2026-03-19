# linear-cli — CLI for the Linear API

![linear-cli](./assets/og-image.svg)

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
linear-cli init

# Search for issues
linear-cli search "auth bug"

# Get a specific issue with comments
linear-cli issue ENG-123

# List issues by label
linear-cli issues --labels Bug

# Add a comment
linear-cli comment-add ENG-123 -b "Looks good to me"

# Check Linear platform status
linear-cli status
```

## How It Works

1. Reads your API key from `~/.config/linear-cli/config.json`.
2. Uses the official `@linear/sdk` to communicate with the Linear GraphQL API.
3. Paginates automatically — all list commands fetch every page.
4. Outputs raw JSON to stdout for easy piping into `jq`, scripts, or other tools.

## Installation

This package is published to [GitHub Packages](https://github.com/dotbrains/linear-cli/packages), not npmjs. You must configure the `@dotbrains` scope to point at the GitHub registry before installing:

```sh
# Add to ~/.npmrc (one-time setup)
echo "@dotbrains:registry=https://npm.pkg.github.com" >> ~/.npmrc
```

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
| `linear-cli init` | Set up linear-cli by configuring your API key |
| `linear-cli search <term>` | Full-text search (Issues, Documents, or Projects) |
| `linear-cli users` | List organization users |
| `linear-cli labels` | List all issue labels |
| `linear-cli issues --labels <names...>` | List issues matching one or more labels |
| `linear-cli issue <id>` | Fetch a single issue by ID or identifier (e.g. ENG-123) |
| `linear-cli comment-add <issueId> -b <body>` | Add a comment to an issue |
| `linear-cli comment-edit <commentId> -b <body>` | Edit an existing comment |
| `linear-cli comment-delete <commentId>` | Delete a comment |
| `linear-cli comment-get <commentId>` | Get a comment by UUID |
| `linear-cli comments-mine` | List comments by the authenticated user |
| `linear-cli status` | Check Linear platform status |

## Configuration

```sh
# First-time setup
linear-cli init
```

This prompts for your API key, validates it against the Linear API, and writes the config to `~/.config/linear-cli/config.json`.

Generate a personal API key at [Linear > Settings > Security](https://linear.app/settings/account/security).

To reconfigure, run `linear-cli init --force`.

## Claude Skill

This repo includes a [Claude Code](https://docs.anthropic.com/en/docs/claude-code) skill at `.claude/skills/linear.md` that lets Claude automatically use `linear-cli` whenever you ask about bugs, issues, or anything Linear-related.

With this skill installed, you can say things like:

> Find every engineering-related bug in Linear that is unfinished. For each one, look at the problem and then — by analyzing the codebase and git history — figure out which engineers are best suited to addressing each issue. Then leave a comment with that info.

Claude will use `linear-cli` to search for issues, inspect the codebase, and post comments — all autonomously.

## Dependencies

- **[Node.js](https://nodejs.org/)** >= 18
- **[@linear/sdk](https://www.npmjs.com/package/@linear/sdk)** — official Linear API client
- **[Commander](https://www.npmjs.com/package/commander)** — CLI framework

## License

MIT
