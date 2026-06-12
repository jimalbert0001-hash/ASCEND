import { Link } from "wouter";
import { motion } from "framer-motion";
import { Music, Clock, ListMusic, Star, ChevronRight, Mic, BookOpen, TrendingUp, Play } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { getGuitarStats, practiceSessions, songsData, skillAreas, SONG_STATUS_COLORS, PRACTICE_FOCUS_COLORS } from "@/lib/guitar-data";

const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const stagger = { animate: { transition: { staggerChildren: 0.07 } } };

export function GuitarOverview() {
  const stats = getGuitarStats();
  const recentSessions = practiceSessions.slice(0, 4);
  const activeSongs = songsData.filter(s => s.status === 'learning').slice(0, 3);
  const polishedSongs = songsData.filter(s => s.status === 'polished');

  return (
    <motion.div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto" variants={stagger} initial="initial" animate="animate">
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <Music className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-3xl font-black tracking-tight uppercase">Guitar</h2>
            <p className="text-muted-foreground text-sm font-mono uppercase tracking-widest mt-0.5">Strings, scales & soul</p>
          </div>
        </div>
        <Link href="/guitar/practice">
          <button className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
            Log Practice <ChevronRight className="w-4 h-4" />
          </button>
        </Link>
      </motion.div>

      {/* Stats */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Practice', value: `${stats.totalHours}h`, sub: `${stats.thisMonthHours}h this month`, icon: Clock, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Songs Learned', value: stats.songsLearned, sub: `${stats.songsRepertoire} polished`, icon: ListMusic, color: 'text-sky-400', bg: 'bg-sky-500/10' },
          { label: 'Chords Mastered', value: stats.chordsMastered, sub: `of ${stats.totalChords} tracked`, icon: Star, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'Skill Level', value: `${stats.currentLevel}/10`, sub: `${stats.totalSessions} sessions`, icon: TrendingUp, color: 'text-violet-400', bg: 'bg-violet-500/10' },
        ].map(s => (
          <Card key={s.label} className="p-4 border-border/50 bg-card/60">
            <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center mb-3', s.bg)}>
              <s.icon className={cn('w-4.5 h-4.5', s.color)} />
            </div>
            <p className="text-2xl font-black">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            <p className="text-[11px] text-emerald-400 mt-1">{s.sub}</p>
          </Card>
        ))}
      </motion.div>

      {/* Skill Progression */}
      <motion.div variants={fadeUp}>
        <Card className="p-5 border-border/50 bg-card/60">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h3 className="font-semibold text-sm">Skill Progression</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {skillAreas.map(skill => (
              <div key={skill.id} className="flex items-center gap-3">
                <span className="text-xs font-medium w-36 shrink-0">{skill.name}</span>
                <div className="flex-1">
                  <Progress value={skill.level * 10} className="h-2" />
                </div>
                <span className={cn('text-xs font-bold w-8 text-right', skill.color)}>{skill.level}/10</span>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Practice */}
        <Card className="p-5 border-border/50 bg-card/60">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-sm">Recent Practice</span>
            </div>
            <Link href="/guitar/practice" className="text-xs text-primary hover:underline">See all</Link>
          </div>
          <div className="space-y-2.5">
            {recentSessions.map(s => (
              <div key={s.id} className="flex items-center gap-3 p-2.5 bg-muted/20 rounded-lg">
                <div className={cn('px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0', PRACTICE_FOCUS_COLORS[s.focus])}>
                  {s.focus}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{s.notes}</p>
                  <p className="text-[10px] text-muted-foreground">{s.date} · {s.durationMins} mins{s.bpm ? ` · ${s.bpm} BPM` : ''}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Songs In Progress */}
        <Card className="p-5 border-border/50 bg-card/60">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Play className="w-4 h-4 text-sky-400" />
              <span className="font-semibold text-sm">Currently Learning</span>
            </div>
            <Link href="/guitar/songs" className="text-xs text-primary hover:underline">See all</Link>
          </div>
          <div className="space-y-2.5">
            {activeSongs.map(s => (
              <div key={s.id} className="flex items-start gap-3 p-2.5 bg-muted/20 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold">{s.title}</p>
                  <p className="text-[10px] text-muted-foreground">{s.artist} · {s.genre}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {s.chords.slice(0, 4).map(c => <span key={c} className="text-[10px] bg-muted/40 px-1.5 py-0.5 rounded font-mono">{c}</span>)}
                    {s.chords.length > 4 && <span className="text-[10px] text-muted-foreground">+{s.chords.length - 4}</span>}
                  </div>
                </div>
                <div className="flex gap-0.5 mt-0.5">
                  {[1, 2, 3, 4, 5].map(n => <div key={n} className={cn('w-1.5 h-1.5 rounded-full', n <= s.difficulty ? 'bg-amber-400' : 'bg-muted/40')} />)}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Quick Nav */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { label: 'Practice Log', href: '/guitar/practice', icon: Clock, color: 'text-emerald-400', bg: 'bg-emerald-500/10', stat: `${stats.thisMonthHours}h this month` },
          { label: 'Song Library', href: '/guitar/songs', icon: ListMusic, color: 'text-sky-400', bg: 'bg-sky-500/10', stat: `${stats.songsLearned} learned` },
          { label: 'Progress', href: '/guitar/progress', icon: TrendingUp, color: 'text-violet-400', bg: 'bg-violet-500/10', stat: `Level ${stats.currentLevel}/10` },
        ].map(c => (
          <Link key={c.href} href={c.href}>
            <Card className="p-4 border-border/50 bg-card/60 hover:bg-card transition-colors cursor-pointer">
              <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center mb-2', c.bg)}>
                <c.icon className={cn('w-4 h-4', c.color)} />
              </div>
              <p className="text-sm font-semibold">{c.label}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{c.stat}</p>
            </Card>
          </Link>
        ))}
      </motion.div>
    </motion.div>
  );
}
