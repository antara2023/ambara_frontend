import {
  Baby, Banknote, Briefcase, CalendarClock, CalendarDays, CalendarHeart, ClipboardList, Clock, Clover, Coins, Compass,
  Flame, Flower2, Gem, GitMerge, GraduationCap, Grid3x3, Hash, Heart, HeartHandshake, Landmark, Map as MapIcon, Moon, MoonStar,
  Orbit, Receipt, RefreshCw, Rewind, ScrollText, Shield, ShieldAlert, ShieldCheck, Sparkles, Star, Sun, Sunrise,
  TrainFront, TrendingUp, type LucideProps,
} from "lucide-react";
import type { IconName } from "~/lib/catalog";

const ICONS: Record<IconName, React.ComponentType<LucideProps>> = {
  flame: Flame, clock: Clock, star: Star, "shield-alert": ShieldAlert, "calendar-clock": CalendarClock, gem: Gem,
  compass: Compass, scroll: ScrollText, grid: Grid3x3, sparkles: Sparkles, "calendar-days": CalendarDays,
  "calendar-heart": CalendarHeart, baby: Baby, orbit: Orbit, sun: Sun, heart: Heart, landmark: Landmark,
  banknote: Banknote, train: TrainFront, shield: Shield, "shield-check": ShieldCheck, "graduation-cap": GraduationCap,
  clipboard: ClipboardList, receipt: Receipt, briefcase: Briefcase, rings: HeartHandshake, refresh: RefreshCw,
  moon: Moon, sunrise: Sunrise, merge: GitMerge, flower: Flower2, "moon-star": MoonStar, hash: Hash, map: MapIcon,
  coins: Coins, trending: TrendingUp, clover: Clover, rewind: Rewind,
};

export function Icon({ name, ...props }: { name: IconName } & LucideProps) {
  const C = ICONS[name] ?? Sparkles;
  return <C aria-hidden {...props} />;
}

/** Round pastel badge with a bold outline (the public site's "pop" design); hue gives each calculator its own colour. */
export function IconBadge({ name, hue, size = 44 }: { name: IconName; hue: number; size?: number }) {
  return (
    <span aria-hidden className="pop-glyph" style={{ width: size, height: size, background: `hsl(${hue} 85% 84%)` }}>
      <Icon name={name} size={size * 0.44} strokeWidth={2.2} />
    </span>
  );
}
