'use client';

import React from 'react';
import { CodeBlock } from '@/components/CodeBlock';

export function QuickStartSection() {
  return (
    <section id="quick-start" className="py-12 sm:py-16 lg:py-20 bg-dark-gray/50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-cream mb-3 sm:mb-4">
            Quick Start
          </h2>
          <p className="text-slate-gray text-base sm:text-lg lg:text-xl max-w-3xl mx-auto">
            Install and run your first Linear query in under a minute
          </p>
        </div>
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          <div className="bg-dark-gray/50 rounded-xl p-6 sm:p-8 border border-linear-indigo/20 min-w-0">
            <h3 className="text-xl sm:text-2xl font-bold text-cream mb-4 sm:mb-6">1. Install</h3>
            <div className="bg-linear-indigo/10 border border-linear-indigo/30 rounded-lg p-3 sm:p-4 mb-4">
              <p className="text-cream text-xs sm:text-sm leading-relaxed">
                <span className="text-linear-purple font-semibold">Note:</span> Published to GitHub Packages. One-time registry + auth setup required.
              </p>
            </div>
            <CodeBlock
              code={`# 1. Point @dotbrains scope at GitHub Packages
npm config set @dotbrains:registry https://npm.pkg.github.com

# 2. Authenticate (use a PAT with read:packages scope)
npm config set //npm.pkg.github.com/:_authToken $(gh auth token)

# 3. Install globally
npm install -g @dotbrains/linear-cli`}
              language="bash"
            />
          </div>
          <div className="bg-dark-gray/50 rounded-xl p-6 sm:p-8 border border-linear-purple/20 min-w-0">
            <h3 className="text-xl sm:text-2xl font-bold text-cream mb-4 sm:mb-6">2. Configure & Use</h3>
            <CodeBlock
            code={`# Set up your Linear API key
linear init

# Search for issues
linear search "auth bug"

# Get a specific issue with comments
linear issue ENG-123

# Create an issue
linear issue-create --team <teamId> --title "Fix login bug" --priority 1

# Add a comment
linear comment-add ENG-123 -b "On it"

# List your notifications
linear notifications

# Check Linear platform status
linear status`}
              language="bash"
            />
            <div className="mt-6 bg-linear-indigo/10 border border-linear-indigo/30 rounded-lg p-4 sm:p-5">
              <p className="text-cream text-sm leading-relaxed">
                <span className="text-linear-purple font-semibold">Tip:</span> Generate a personal API key at{' '}
                <a href="https://linear.app/settings/account/security" target="_blank" rel="noopener noreferrer" className="text-linear-lavender hover:text-cream underline">
                  Linear &gt; Settings &gt; Security
                </a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
