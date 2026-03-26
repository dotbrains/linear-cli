'use client';

import React, { useState } from 'react';
import { CodeBlock } from '@/components/CodeBlock';

export function CodeExamplesSection() {
  const [activeTab, setActiveTab] = useState<'search' | 'issues' | 'comments' | 'labels' | 'agent'>('search');

  const examples = {
    search: `# Full-text search across issues, documents, and projects
$ linear search "auth bug"
→ [
    { "identifier": "ENG-123", "title": "Fix auth race condition", ... },
    { "identifier": "ENG-456", "title": "Auth token expiry bug", ... },
    { "identifier": "ENG-789", "title": "OAuth callback failure", ... }
  ]

# Search for documents
$ linear search "onboarding" --type Documents`,
    issues: `# Fetch a single issue by identifier
$ linear issue ENG-123
→ { "identifier": "ENG-123", "title": "Fix auth race condition",
     "priority": 1, "state": "In Progress", "comments": [...] }

# List issues by label
$ linear issues --labels Bug
$ linear issues --labels Bug Feature --first 50`,
    comments: `# Add a comment to an issue
$ linear comment-add ENG-123 -b "Looks good to me"
✓ Comment created

# Edit an existing comment
$ linear comment-edit <commentId> -b "Updated: LGTM with nits"

# List your own comments
$ linear comments-mine --first 10

# Delete a comment
$ linear comment-delete <commentId>`,
    labels: `# List all issue labels in the organization
$ linear labels
→ [
    { "id": "abc-123", "name": "Bug", "color": "#eb5757" },
    { "id": "def-456", "name": "Feature", "color": "#4ea7fc" },
    ...
  ]

# List all organization users
$ linear users
→ [
    { "id": "usr-123", "name": "Alice", "email": "alice@co.com" },
    ...
  ]`,
    agent: `# With the Warp/Claude skill installed, just ask:
> "Find all unfinished bugs in Linear and list them"
→ Agent runs: linear search "bug"
→ Agent runs: linear issues --labels Bug
→ Agent summarizes results

# Or automate with scripts:
$ linear issues --labels Bug | jq '.[].identifier' | \\
  xargs -I {} linear comment-add {} -b "Triaged by bot"`,
  };

  const tabs = [
    { key: 'search' as const, label: 'Search', language: 'bash' },
    { key: 'issues' as const, label: 'Issues', language: 'bash' },
    { key: 'comments' as const, label: 'Comments', language: 'bash' },
    { key: 'labels' as const, label: 'Labels & Users', language: 'bash' },
    { key: 'agent' as const, label: 'Agent', language: 'bash' },
  ];

  return (
    <section id="code-examples" className="py-12 sm:py-16 lg:py-20 bg-dark-gray/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-cream mb-3 sm:mb-4">
            Code Examples
          </h2>
          <p className="text-cream/70 text-base sm:text-lg lg:text-xl max-w-3xl mx-auto">
            See linear-cli in action — search, issues, comments, and agent workflows
          </p>
        </div>
        <div className="bg-dark-slate border border-linear-indigo/30 rounded-xl overflow-hidden">
          <div className="flex border-b border-linear-indigo/30 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'bg-dark-gray/50 text-linear-purple border-b-2 border-linear-purple'
                    : 'text-cream/70 hover:text-cream hover:bg-dark-gray/30'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="p-4 sm:p-6 overflow-x-auto">
            <CodeBlock
              code={examples[activeTab]}
              language={tabs.find((t) => t.key === activeTab)?.language}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
