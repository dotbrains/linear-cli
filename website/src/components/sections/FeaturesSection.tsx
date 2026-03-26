'use client';

import { Search, MessageSquare, Tag, Users, Activity, Settings, Cpu, FileJson, Key, GitBranch, Bell, Webhook, FolderKanban } from 'lucide-react';

export function FeaturesSection() {
  const features = [
    {
      icon: <Search className="w-6 h-6" />,
      title: 'Full-Text Search',
      description: 'Search across issues, documents, and projects. Results include identifiers, titles, and metadata — ready for scripting.',
    },
    {
      icon: <FileJson className="w-6 h-6" />,
      title: 'Issue CRUD',
      description: 'Create, update, delete, archive, and fetch issues by ID or identifier. Filter by team, assignee, state, priority, or label.',
    },
    {
      icon: <FolderKanban className="w-6 h-6" />,
      title: 'Projects, Cycles & Roadmaps',
      description: 'Full CRUD for projects, cycles, roadmaps, and initiatives. List milestones, post project updates, and manage planning entities.',
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: 'Comments',
      description: 'Add, edit, delete, resolve, and unresolve comments. List your own comments. Full comment lifecycle from the terminal.',
    },
    {
      icon: <GitBranch className="w-6 h-6" />,
      title: 'Attachments & Relations',
      description: 'Link GitHub PRs, issues, and external URLs to Linear issues. Create and delete issue relations (blocks, duplicate, related).',
    },
    {
      icon: <Tag className="w-6 h-6" />,
      title: 'Labels & Workflow States',
      description: 'List, create, update, and delete labels. List workflow states per team. Complete metadata management from the CLI.',
    },
    {
      icon: <Bell className="w-6 h-6" />,
      title: 'Notifications',
      description: 'List notifications, mark individual ones read or unread, and bulk-archive or bulk-mark all notifications in one command.',
    },
    {
      icon: <Webhook className="w-6 h-6" />,
      title: 'Webhooks',
      description: 'List, create, update, and delete webhooks. Full webhook lifecycle management without leaving the terminal.',
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Teams & Users',
      description: 'List all teams, fetch a single team, list all users or look up a specific user. Essential for scripting assignments.',
    },
    {
      icon: <Activity className="w-6 h-6" />,
      title: 'Platform Status',
      description: 'Check Linear platform status including ongoing incidents and scheduled maintenances. No API key required.',
    },
    {
      icon: <Key className="w-6 h-6" />,
      title: 'Secure Init',
      description: 'Interactive setup validates your API key against the Linear API before storing it. Reconfigure anytime with --force.',
    },
    {
      icon: <Cpu className="w-6 h-6" />,
      title: 'Agent Skill',
      description: 'Includes a Warp and Claude Code skill. Agents automatically use linear when you ask about bugs or issues.',
    },
    {
      icon: <Settings className="w-6 h-6" />,
      title: 'Auto-Pagination',
      description: 'All list commands fetch every page automatically. No manual cursor handling — just get all the data.',
    },
  ];

  return (
    <section id="features" className="py-12 sm:py-16 lg:py-20 bg-dark-slate">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-cream mb-3 sm:mb-4">
            Everything You Need from Linear
          </h2>
          <p className="text-cream/70 text-base sm:text-lg lg:text-xl max-w-3xl mx-auto">
            80+ commands covering issues, projects, cycles, roadmaps, teams, documents, webhooks, notifications, and more
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-dark-gray/50 border border-linear-indigo/20 hover:border-linear-purple/40 rounded-xl p-5 sm:p-6 transition-all hover:shadow-lg hover:shadow-linear-indigo/10"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-linear-purple to-linear-indigo rounded-lg flex items-center justify-center text-white mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-cream mb-2">{feature.title}</h3>
              <p className="text-cream/60 text-sm sm:text-base leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
