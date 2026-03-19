'use client';

import { Github, BookOpen, MessageCircle } from 'lucide-react';

export function CTASection() {
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-linear-indigo/10 via-dark-slate to-dark-slate">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-cream mb-4 sm:mb-6">
          Ready to Get Started?
        </h2>
        <p className="text-base sm:text-lg lg:text-xl text-cream/70 mb-8 sm:mb-12 max-w-3xl mx-auto">
          Install @dotbrains/linear-cli and manage Linear from the command line in under a minute
        </p>
        <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
          <a
            href="https://github.com/dotbrains/linear-cli"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-dark-gray/50 border border-linear-indigo/30 hover:border-linear-indigo rounded-xl p-6 sm:p-8 transition-all group hover:shadow-lg hover:shadow-linear-indigo/20"
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-linear-purple to-linear-indigo rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
              <Github className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-cream mb-2">View on GitHub</h3>
            <p className="text-cream/60 text-xs sm:text-sm">Star the repo, fork it, and contribute</p>
          </a>
          <a
            href="https://github.com/dotbrains/linear-cli#readme"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-dark-gray/50 border border-linear-purple/30 hover:border-linear-purple rounded-xl p-6 sm:p-8 transition-all group hover:shadow-lg hover:shadow-linear-purple/20"
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-linear-indigo to-linear-lavender rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
              <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-cream mb-2">Read the Docs</h3>
            <p className="text-cream/60 text-xs sm:text-sm">README, commands, and configuration</p>
          </a>
          <a
            href="https://github.com/dotbrains/linear-cli/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-dark-gray/50 border border-linear-lavender/30 hover:border-linear-lavender rounded-xl p-6 sm:p-8 transition-all group hover:shadow-lg hover:shadow-linear-lavender/20"
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-linear-lavender to-linear-purple rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
              <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-cream mb-2">Report Issues</h3>
            <p className="text-cream/60 text-xs sm:text-sm">Bug reports and feature requests</p>
          </a>
        </div>
      </div>
    </section>
  );
}
