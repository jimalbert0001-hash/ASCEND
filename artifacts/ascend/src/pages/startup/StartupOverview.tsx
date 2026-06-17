import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Rocket, Users, DollarSign, TrendingUp, ChevronRight, Plus, Star, Bug, Lightbulb, FolderKanban } from "lucide-react";
import { GoalsBanner } from "@/components/GoalsBanner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  projectsData, ideasData, revenueData,
  getOverallStats, getProjectStats, STAGE_LABELS,
} from "@/lib/startup-data";
import { isDataCleared } from "@/lib/data-cleared";

const stagger = { animate: { transition: { staggerChildren: 0.07 } } };
const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const PROJECT_ACCENT: Record<string, { text: string; bg: string; hex: string }> = {
  violet: { text: 'text-violet-400', bg: 'bg-violet-500/10', hex: '#8b5cf6' },
  emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', hex: '#10b981' },
  cyan: { text: 'text-cyan-400', bg: 'bg-cyan-500/10', hex: '#06b6d4' },
};
const STAGE_COLOR: Record<string, string> = {
  idea: 'bg-muted/40 text-muted-foreground',
  mvp: 'bg-amber-500/10 text-amber-400',
  growth: 'bg-emerald-500/10 text-emerald-400',
  scaling: 'bg-violet-500/10 text-violet-400',
};

function MetricCard({ icon: Icon, label, value, sub, accent = 'violet' }: { icon: any; label: string; value: string | number; sub?: string; accent?: string }) {
  const colors: Record<string, string> = {
    violet: 'text-violet-400 bg-violet-500/10',
    emerald: 'text-emerald-400 bg-emerald-500/10',
    amber: 'text-amber-400 bg-amber-500/10',
    sky: 'text-sky-400 bg-sky-500/10',
  };
  const [textCol, bgCol] = (colors[accent] ?? colors.violet).split(' ');
  return (
    <motion.div variants={fadeUp}>
      <Card className="p-5 border-border/50 bg-card/60 backdrop-blur flex items-center gap-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${bgCol}`}>
          <Icon className={`w-5 h-5 ${textCol}`} />
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold mt-0.5">{value}</p>
          {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
        </div>
      </Card>
    </motion.div>
  );
}

function MiniBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
      <motion.div className="h-full rounded-full" style={{ backgroundColor: color }}
        initial={{ width: 0 }} animate={{ width: `${Math.min(pct, 100)}%` }} transition={{ duration: 1, ease: 'easeOut' }} />
    </div>
  );
}

export function StartupOverview() {
  const cleared = isDataCleared();
  const overall = getOverallStats();
  const activeProjects = cleared ? [] : projectsData.filter(p => p.status === 'active');
  const displayIdeas = cleared ? [] : ideasData.slice(0, 3);

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-6xl mx-auto">
      <motion.header variants={fadeUp} initial="initial" animate="animate" className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-orange-500/10 rounded-xl border border-orange-500/20">
            <Rocket className="w-7 h-7 text-orange-400" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Startup Builder</h2>
            <p className="text-muted-foreground text-sm mt-0.5">Build, track, and scale your ventures</p>
          </div>
        </div>
        <Link href="/startup/projects">
          <Button className="gap-2 self-start sm:self-auto bg-orange-500 hover:bg-orange-600 text-white">
            <Plus className="w-4 h-4" />New Project
          </Button>
        </Link>
      </motion.header>

      <motion.div variants={fadeUp} initial="initial" animate="animate">
        <GoalsBanner category="startup" />
      </motion.div>

      {/* Hero Stats */}
      <motion.div variants={stagger} initial="initial" animate="animate" className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard icon={FolderKanban} label="Active Projects" value={overall.activeProjects} sub="Currently building" accent="violet" />
        <MetricCard icon={Users} label="Total Users" value={overall.totalUsers.toLocaleString()} sub="Across all projects" accent="sky" />
        <MetricCard icon={DollarSign} label="Total MRR" value={`$${overall.totalMrr.toLocaleString()}`} sub="Monthly recurring" accent="emerald" />
        <MetricCard icon={Bug} label="Open Bugs" value={overall.openBugs} sub="Needs attention" accent="amber" />
      </motion.div>

      {/* Active Projects */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Active Projects</h3>
          <Link href="/startup/projects" className="text-sm text-primary hover:underline flex items-center gap-1">
            All projects <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <motion.div variants={stagger} initial="initial" animate="animate" className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeProjects.map(project => {
            const accent = PROJECT_ACCENT[project.color] ?? PROJECT_ACCENT.violet;
            const stats = getProjectStats(project.id);
            const rev = revenueData.filter(r => r.projectId === project.id);
            const mrrTarget = 15000;
            const mrrPct = Math.round((stats.mrr / mrrTarget) * 100);
            return (
              <motion.div key={project.id} variants={fadeUp}>
                <Card className="p-5 border-border/50 bg-card/60 backdrop-blur hover:border-border transition-all hover:shadow-lg group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${accent.bg} flex items-center justify-center shrink-0`}>
                        <Rocket className={`w-5 h-5 ${accent.text}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-base">{project.name}</h4>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide ${STAGE_COLOR[project.stage]}`}>
                            {STAGE_LABELS[project.stage]}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{project.tagline}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs mb-4">
                    <div className="bg-muted/20 rounded-lg p-2.5">
                      <p className="text-muted-foreground">Users</p>
                      <p className="font-bold mt-0.5 text-sm">{stats.totalUsers.toLocaleString()}</p>
                      <p className={`mt-0.5 ${stats.userGrowth >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {stats.userGrowth >= 0 ? '+' : ''}{stats.userGrowth}% MoM
                      </p>
                    </div>
                    <div className="bg-muted/20 rounded-lg p-2.5">
                      <p className="text-muted-foreground">MRR</p>
                      <p className="font-bold mt-0.5 text-sm">${stats.mrr.toLocaleString()}</p>
                      <p className={`mt-0.5 ${stats.mrrGrowth >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {stats.mrrGrowth >= 0 ? '+' : ''}{stats.mrrGrowth}% MoM
                      </p>
                    </div>
                    <div className="bg-muted/20 rounded-lg p-2.5">
                      <p className="text-muted-foreground">Retention</p>
                      <p className="font-bold mt-0.5 text-sm">{stats.retention}%</p>
                      <p className="text-muted-foreground mt-0.5">Monthly</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                      <span>MRR Progress</span>
                      <span className={accent.text}>${stats.mrr.toLocaleString()} / $15k target</span>
                    </div>
                    <MiniBar pct={mrrPct} color={accent.hex} />
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {(project.tags ?? []).slice(0, 4).map(tag => (
                      <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-muted/30 text-muted-foreground">{tag}</span>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Link href="/startup/roadmap" className="flex-1">
                      <Button variant="outline" size="sm" className="w-full text-xs h-8">Roadmap</Button>
                    </Link>
                    <Link href="/startup/metrics" className="flex-1">
                      <Button variant="ghost" size="sm" className="w-full text-xs h-8">
                        Metrics <ChevronRight className="w-3 h-3 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Idea Vault Preview */}
      <motion.div variants={fadeUp} initial="initial" animate="animate">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Idea Vault</h3>
          <Link href="/startup/projects" className="text-sm text-primary hover:underline flex items-center gap-1">
            {overall.ideasCount} ideas <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {displayIdeas.map(idea => {
            const statusColors: Record<string, string> = {
              raw: 'text-muted-foreground bg-muted/30',
              refined: 'text-amber-400 bg-amber-500/10',
              validated: 'text-emerald-400 bg-emerald-500/10',
              dropped: 'text-red-400 bg-red-500/10',
            };
            return (
              <Card key={idea.id} className="p-4 border-border/50 bg-card/60 backdrop-blur">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Lightbulb className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-sm truncate">{idea.title}</p>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase shrink-0 ${statusColors[idea.status]}`}>{idea.status}</span>
                    </div>
                    <div className="flex items-center gap-0.5 mt-1">
                      {[1, 2, 3, 4, 5].map(n => (
                        <Star key={n} className={`w-2.5 h-2.5 ${n <= idea.rating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30'}`} />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{idea.description}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {(idea.tags ?? []).slice(0, 3).map(t => (
                    <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-muted/30 text-muted-foreground">{t}</span>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      </motion.div>

      {/* Bottom nav cards */}
      <motion.div variants={stagger} initial="initial" animate="animate" className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { href: '/startup/projects', icon: FolderKanban, label: 'Projects & Ideas', sub: `${cleared ? 0 : projectsData.length} projects`, color: 'text-violet-400 bg-violet-500/10' },
          { href: '/startup/roadmap', icon: TrendingUp, label: 'Roadmap', sub: 'Q1–Q4 planning', color: 'text-blue-400 bg-blue-500/10' },
          { href: '/startup/features', icon: Lightbulb, label: 'Features & Bugs', sub: `${overall.openBugs} open bugs`, color: 'text-amber-400 bg-amber-500/10' },
          { href: '/startup/metrics', icon: DollarSign, label: 'Metrics', sub: 'Revenue & growth', color: 'text-emerald-400 bg-emerald-500/10' },
        ].map(card => (
          <motion.div key={card.href} variants={fadeUp}>
            <Link href={card.href}>
              <Card className="p-4 border-border/50 bg-card/60 backdrop-blur hover:border-primary/30 transition-all cursor-pointer group">
                <div className={`w-9 h-9 rounded-lg ${card.color.split(' ')[1]} flex items-center justify-center mb-3`}>
                  <card.icon className={`w-4.5 h-4.5 ${card.color.split(' ')[0]}`} />
                </div>
                <p className="font-semibold text-sm">{card.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{card.sub}</p>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
