import { Link } from "wouter";
import { motion } from "framer-motion";
import { Rocket, Users, DollarSign, TrendingUp, ChevronRight, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { getOverallStats, getProjectStats, projectsData } from "@/lib/startup-data";

const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export function StartupSnapshot() {
  const overall = getOverallStats();
  const mainProject = projectsData.find(p => p.status === 'active');
  const stats = mainProject ? getProjectStats(mainProject.id) : null;

  return (
    <motion.div variants={fadeUp} initial="initial" animate="animate">
      <Card className="p-5 border-border/50 bg-card/60 backdrop-blur h-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
              <Rocket className="w-4.5 h-4.5 text-orange-400" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Startup</h3>
              <p className="text-xs text-muted-foreground">{overall.activeProjects} active project{overall.activeProjects !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <Link href="/startup" className="text-xs text-primary hover:underline flex items-center gap-0.5">
            Open <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-muted/20 rounded-lg p-2.5">
            <div className="flex items-center gap-1 text-muted-foreground mb-1">
              <Users className="w-3 h-3" />
              <span className="text-[10px]">Users</span>
            </div>
            <p className="font-bold text-sm">{overall.totalUsers.toLocaleString()}</p>
            {stats && (
              <p className="text-[10px] text-emerald-400 flex items-center gap-0.5 mt-0.5">
                <ArrowUpRight className="w-2.5 h-2.5" />+{stats.userGrowth}%
              </p>
            )}
          </div>
          <div className="bg-muted/20 rounded-lg p-2.5">
            <div className="flex items-center gap-1 text-muted-foreground mb-1">
              <DollarSign className="w-3 h-3" />
              <span className="text-[10px]">MRR</span>
            </div>
            <p className="font-bold text-sm">${overall.totalMrr.toLocaleString()}</p>
            {stats && (
              <p className="text-[10px] text-emerald-400 flex items-center gap-0.5 mt-0.5">
                <ArrowUpRight className="w-2.5 h-2.5" />+{stats.mrrGrowth}%
              </p>
            )}
          </div>
          <div className="bg-muted/20 rounded-lg p-2.5">
            <div className="flex items-center gap-1 text-muted-foreground mb-1">
              <TrendingUp className="w-3 h-3" />
              <span className="text-[10px]">Growth</span>
            </div>
            <p className="font-bold text-sm">{stats?.userGrowth ?? 0}%</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">MoM</p>
          </div>
        </div>

        {mainProject && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-medium">{mainProject.name}</span>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded uppercase font-bold">
                {mainProject.stage}
              </span>
            </div>
            <div className="flex gap-2 text-[10px] text-muted-foreground">
              <span className="text-amber-400">{overall.openBugs} bugs open</span>
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
