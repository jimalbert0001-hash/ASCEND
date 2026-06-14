import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, BookOpen, Rocket, Crown, Music, Bot, Trophy, User, Settings,
  ChevronDown, FlaskConical, BarChart2, RotateCcw, TestTube2, BookMarked,
  FolderKanban, Map, Layers, TrendingUp,
  Clock, Swords, BookOpen as OpeningBook,
  ListMusic, Star,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ACADEMICS_SUB_ITEMS = [
  { name: "Subjects", href: "/academics/subjects", icon: BookMarked },
  { name: "Mock Tests", href: "/academics/tests", icon: TestTube2 },
  { name: "Revision", href: "/academics/revision", icon: RotateCcw },
  { name: "Analytics", href: "/academics/analytics", icon: BarChart2 },
];

const STARTUP_SUB_ITEMS = [
  { name: "Projects", href: "/startup/projects", icon: FolderKanban },
  { name: "Roadmap", href: "/startup/roadmap", icon: Map },
  { name: "Features & Bugs", href: "/startup/features", icon: Layers },
  { name: "Metrics", href: "/startup/metrics", icon: TrendingUp },
];

const CHESS_SUB_ITEMS = [
  { name: "Training & Games", href: "/chess/training", icon: Clock },
  { name: "Games", href: "/chess/games", icon: Swords },
  { name: "Openings", href: "/chess/openings", icon: OpeningBook },
  { name: "Tournaments", href: "/chess/tournaments", icon: Trophy },
  { name: "Analytics", href: "/chess/analytics", icon: BarChart2 },
];

const GUITAR_SUB_ITEMS = [
  { name: "Practice Log", href: "/guitar/practice", icon: Clock },
  { name: "Song Library", href: "/guitar/songs", icon: ListMusic },
  { name: "Progress", href: "/guitar/progress", icon: Star },
];

const NAV_ITEMS = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Academics", href: "/academics", icon: BookOpen, subItems: ACADEMICS_SUB_ITEMS },
  { name: "Startup", href: "/startup", icon: Rocket, subItems: STARTUP_SUB_ITEMS },
  { name: "Chess", href: "/chess", icon: Crown, subItems: CHESS_SUB_ITEMS },
  { name: "Guitar", href: "/guitar", icon: Music, subItems: GUITAR_SUB_ITEMS },
  { name: "AI Mentor", href: "/ai-mentor", icon: Bot, badge: "AI" },
];

const SECONDARY_NAV_ITEMS = [
  { name: "Achievements", href: "/achievements", icon: Trophy },
  { name: "Profile", href: "/profile", icon: User },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const [location] = useLocation();

  function isModuleActive(href: string) {
    return location.startsWith(href);
  }

  function isSubNavOpen(item: typeof NAV_ITEMS[number]) {
    if (!item.subItems) return false;
    return location.startsWith(item.href);
  }

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen border-r border-border bg-sidebar shrink-0 p-4">
      <div className="flex items-center gap-3 px-2 mb-8">
        <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
          A
        </div>
        <span className="font-bold tracking-widest text-lg text-sidebar-foreground uppercase">Ascend</span>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const active = item.href === "/" ? location === "/" : location === item.href;
          const parentActive = item.subItems ? isModuleActive(item.href) : active;
          const subNavOpen = isSubNavOpen(item);

          return (
            <div key={item.href}>
              <Link href={item.href} className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all group",
                parentActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )}>
                <item.icon className={cn("w-5 h-5 shrink-0", parentActive ? "text-primary" : "text-muted-foreground group-hover:text-primary")} />
                <span className="flex-1">{item.name}</span>
                {item.badge && (
                  <span className="text-[10px] font-bold bg-primary/20 text-primary px-1.5 py-0.5 rounded uppercase tracking-wider">
                    {item.badge}
                  </span>
                )}
                {item.subItems && (
                  <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform shrink-0", subNavOpen && "rotate-180")} />
                )}
              </Link>

              {item.subItems && (
                <AnimatePresence initial={false}>
                  {subNavOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="ml-4 pl-3 border-l border-border/40 mt-0.5 mb-1 space-y-0.5">
                        {item.subItems.map((sub, i) => {
                          const subActive = location === sub.href;
                          return (
                            <motion.div
                              key={sub.href}
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.05 }}
                            >
                              <Link href={sub.href} className={cn(
                                "flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-all group",
                                subActive
                                  ? "bg-primary/10 text-primary"
                                  : "text-muted-foreground hover:bg-sidebar-accent/40 hover:text-foreground"
                              )}>
                                <sub.icon className={cn("w-4 h-4 shrink-0", subActive ? "text-primary" : "text-muted-foreground/60 group-hover:text-muted-foreground")} />
                                {sub.name}
                              </Link>
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          );
        })}
      </nav>

      <div className="pt-4 border-t border-border space-y-0.5">
        {SECONDARY_NAV_ITEMS.map((item) => {
          const active = location === item.href;
          return (
            <Link key={item.href} href={item.href} className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all group",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
            )}>
              <item.icon className={cn("w-5 h-5 shrink-0", active ? "text-primary" : "text-muted-foreground")} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
