import { Bell, Coffee, Lightbulb, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { DayRecord } from "@/lib/study-analytics";
import { getLast7Days } from "@/lib/study-analytics";

interface Note {
  id: string;
  icon: React.ReactNode;
  title: string;
  body: string;
}

export function SmartNotifications({ records }: { records: DayRecord[] }) {
  const notes = useMemo<Note[]>(() => {
    const out: Note[] = [];
    const week = getLast7Days(records);
    if (week.length === 0) return out;

    const avgDistract = week.reduce((s, r) => s + r.distractionMinutes, 0) / week.length;
    const eveningHeavy = week.filter((r) => r.studyTimeOfDay === "evening" || r.studyTimeOfDay === "night")
      .reduce((s, r) => s + r.distractionMinutes, 0) / Math.max(1, week.length);
    const lastSleep = week[week.length - 1]?.sleepHours ?? 7;
    const avgBurn = week.reduce((s, r) => s + r.burnoutScore, 0) / week.length;

    if (eveningHeavy > 30 && avgDistract > 30) {
      out.push({ id: "evening", icon: <Lightbulb className="h-4 w-4" />, title: "Evening pattern detected", body: "You usually get distracted in the evening — set a no-phone block." });
    }
    if (lastSleep < 6.5) {
      out.push({ id: "sleep", icon: <Bell className="h-4 w-4" />, title: "Sleep dipping", body: "Sleep dropped below 6.5h — protect tonight's rest to recover focus." });
    }
    if (avgBurn >= 2) {
      out.push({ id: "break", icon: <Coffee className="h-4 w-4" />, title: "Time to take a break", body: "Burnout signals are rising — schedule a recovery hour today." });
    }
    return out.slice(0, 3);
  }, [records]);

  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  useEffect(() => { setDismissed(new Set()); }, [records.length]);
  const visible = notes.filter((n) => !dismissed.has(n.id));
  if (visible.length === 0) return null;

  return (
    <div className="space-y-3 animate-fade-in">
      {visible.map((n) => (
        <div
          key={n.id}
          className="glass-card p-4 flex items-start gap-3 border-l-4 hover:translate-x-0.5 transition-transform"
          style={{ borderLeftColor: "hsl(var(--primary))" }}
        >
          <div className="w-8 h-8 rounded-lg gradient-bg text-primary-foreground flex items-center justify-center shrink-0">
            {n.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold">{n.title}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{n.body}</div>
          </div>
          <button
            onClick={() => setDismissed((s) => new Set(s).add(n.id))}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
