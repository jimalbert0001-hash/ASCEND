import { Link, useLocation } from "wouter";
import { LayoutDashboard, BookOpen, Rocket, Crown, Music, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

const MOBILE_NAV_ITEMS = [
  { name: "Home", href: "/", icon: LayoutDashboard },
  { name: "Acad", href: "/academics", icon: BookOpen },
  { name: "Chess", href: "/chess", icon: Crown },
  { name: "Guitar", href: "/guitar", icon: Music },
  { name: "AI", href: "/ai-mentor", icon: Bot },
];

export function MobileNav() {
  const [location] = useLocation();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 border-t border-border bg-background/90 backdrop-blur-md z-40 flex items-center justify-around px-2 pb-safe">
      {MOBILE_NAV_ITEMS.map((item) => {
        const active = item.href === "/" ? location === "/" : location.startsWith(item.href);
        return (
          <Link key={item.href} href={item.href} className={cn(
            "flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors",
            active ? "text-primary" : "text-muted-foreground hover:text-foreground"
          )} data-testid={`mobile-nav-${item.name.toLowerCase()}`}>
            <item.icon className={cn("w-5 h-5", active && "fill-primary/20")} />
            <span className="text-[10px] font-medium tracking-wide">{item.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
