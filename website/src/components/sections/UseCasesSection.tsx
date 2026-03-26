'use client';

import { Cpu, Search, MessageSquare, Activity, FileJson, Zap } from 'lucide-react';

export function UseCasesSection() {
  const useCases = [
    {
      icon: <Cpu className="w-6 h-6" />,
      title: 'Agent Workflows',
      description: 'Let Warp or Claude autonomously search, triage, update, and comment on issues. The included skill gives agents full Linear API access.',
    },
    {
      icon: <Search className="w-6 h-6" />,
      title: 'Issue Triage',
      description: 'Search for issues by keyword, filter by label, and quickly assess priorities — all without leaving your terminal.',
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: 'Bulk Comment Operations',
      description: 'Script bulk comment additions across issues. Pipe issue identifiers into comment-add for automated triage notes.',
    },
    {
      icon: <Activity className="w-6 h-6" />,
      title: 'Status Monitoring',
      description: 'Check Linear platform status from CI pipelines or monitoring scripts. Detect incidents before they affect your workflow.',
    },
    {
      icon: <FileJson className="w-6 h-6" />,
      title: 'Data Export & Reporting',
      description: 'All output is JSON — pipe into jq for transforms, feed into dashboards, or generate reports from issue and comment data.',
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'CI/CD Integration',
      description: 'Search for related issues in CI, post deployment comments automatically, or gate releases on issue status.',
    },
  ];

  return (
    <section id="use-cases" className="py-12 sm:py-16 lg:py-20 bg-dark-slate">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-cream mb-3 sm:mb-4">
            Use Cases
          </h2>
          <p className="text-cream/70 text-base sm:text-lg lg:text-xl max-w-3xl mx-auto">
            From agent automation to CI pipelines — linear fits into any workflow
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {useCases.map((useCase, index) => (
            <div
              key={index}
              className="bg-dark-gray/50 border border-linear-indigo/20 rounded-xl p-5 sm:p-6 hover:border-linear-purple/40 transition-all"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-linear-purple to-linear-indigo rounded-lg flex items-center justify-center text-white mb-3 sm:mb-4">
                {useCase.icon}
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-cream mb-2">{useCase.title}</h3>
              <p className="text-cream/60 text-sm sm:text-base leading-relaxed">{useCase.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
