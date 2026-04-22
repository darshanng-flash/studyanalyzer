import { Crown, Flame, Sparkles, Trophy } from "lucide-react";
import type { Achievement, LevelInfo } from "@/lib/study-analytics";
import { AnimatedNumber } from "./AnimatedNumber";

interface Props {
  totalXP: number;
  level: LevelInfo;
  streak: number;
  achievements: Achievement[];
}

export function GamificationCard({ totalXP, level, streak, achievements }: Props) {
  const unlocked = achievements.filter((a) => a.unlocked).length;
  return (
    <div className="glass-card p-6 space-y-5 animate-fade-in hover:shadow-[var(--shadow-glow)] transition-shadow">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center shadow-[var(--shadow-glow)]">
            <Crown className="h-7 w-7 text-primary-foreground" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Current Level</p>
            <h3 className="text-2xl font-bold gradient-text">{level.level}</h3>
            <p className="text-xs text-muted-foreground">
              {level.nextLevel ? `Next: ${level.nextLevel}` : "Max tier reached"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Stat icon={<Sparkles className="h-4 w-4" />} label="XP" value={totalXP} />
          <Stat icon={<Flame className="h-4 w-4 text-warning" />} label="Streak" value={streak} suffix=" d" />
          <Stat icon={<Trophy className="h-4 w-4 text-primary" />} label="Badges" value={unlocked} />
        </div>
      </div>

      {/* XP progress */}
      <div>
        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          <span>{level.current} / {level.needed} XP to next level</span>
          <span>{level.progress}%</span>
        </div>
        <div className="h-3 rounded-full bg-secondary/60 overflow-hidden">
          <div
            className="h-full gradient-bg transition-all duration-1000 ease-out"
            style={{ width: `${level.progress}%` }}
          />
        </div>
      </div>

      {/* Achievements */}
      <div>
        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Trophy className="h-4 w-4 text-primary" /> Achievements
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {achievements.map((a) => (
            <div
              key={a.id}
              className={`p-3 rounded-xl border transition-all hover:scale-[1.02] ${
                a.unlocked
                  ? "bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30"
                  : "bg-muted/30 border-border opacity-60"
              }`}
            >
              <div className="text-2xl mb-1">{a.emoji}</div>
              <div className="text-xs font-semibold leading-tight">{a.title}</div>
              <div className="text-[10px] text-muted-foreground mt-1 leading-tight">{a.description}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, label, value, suffix = "" }: { icon: React.ReactNode; label: string; value: number; suffix?: string }) {
  return (
    <div className="text-center px-3 py-2 rounded-xl bg-secondary/60 backdrop-blur min-w-[64px]">
      <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground uppercase tracking-wide font-medium">
        {icon}{label}
      </div>
      <div className="text-lg font-bold gradient-text">
        <AnimatedNumber value={value} suffix={suffix} />
      </div>
    </div>
  );
}
