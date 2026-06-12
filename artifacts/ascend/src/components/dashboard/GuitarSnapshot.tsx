import { Link } from "wouter";
import { motion } from "framer-motion";
import { Music, Clock, ListMusic, Star, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { getGuitarStats } from "@/lib/guitar-data";

const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export function GuitarSnapshot() {
  const stats = getGuitarStats();

  return (
    <motion.div variants={fadeUp} initial="initial" animate="animate">
      <Card className="p-5 border-border/50 bg-card/60 backdrop-blur h-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
              <Music className="w-4.5 h-4.5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Guitar</h3>
              <p className="text-xs text-muted-foreground">Level {stats.currentLevel} / 10</p>
            </div>
          </div>
          <Link href="/guitar" className="text-xs text-primary hover:underline flex items-center gap-0.5">
            Open <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-muted-foreground">Skill Level</span>
            <span className="text-xs font-bold text-emerald-400">{stats.currentLevel}/10</span>
          </div>
          <div className="w-full bg-muted/30 rounded-full h-1.5">
            <div className="h-1.5 rounded-full bg-emerald-400 transition-all" style={{ width: `${stats.currentLevel * 10}%` }} />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">{stats.totalHours}h total practice time</p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="bg-muted/20 rounded-lg p-2.5">
            <div className="flex items-center gap-1 text-muted-foreground mb-1">
              <Clock className="w-3 h-3" />
              <span className="text-[10px]">This Month</span>
            </div>
            <p className="font-bold text-sm">{stats.thisMonthHours}h</p>
            <p className="text-[10px] text-muted-foreground">{stats.thisMonthMins} mins</p>
          </div>
          <div className="bg-muted/20 rounded-lg p-2.5">
            <div className="flex items-center gap-1 text-muted-foreground mb-1">
              <ListMusic className="w-3 h-3" />
              <span className="text-[10px]">Songs</span>
            </div>
            <p className="font-bold text-sm">{stats.songsLearned}</p>
            <p className="text-[10px] text-muted-foreground">{stats.songsRepertoire} polished</p>
          </div>
          <div className="bg-muted/20 rounded-lg p-2.5">
            <div className="flex items-center gap-1 text-muted-foreground mb-1">
              <Star className="w-3 h-3" />
              <span className="text-[10px]">Chords</span>
            </div>
            <p className="font-bold text-sm">{stats.chordsMastered}</p>
            <p className="text-[10px] text-muted-foreground">of {stats.totalChords}</p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
