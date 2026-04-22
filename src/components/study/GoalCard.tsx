import { useState } from "react";
import { Target, Pencil, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AnimatedNumber } from "./AnimatedNumber";

interface Props {
  goal: number;
  current: number;
  daysElapsed: number;
  onChange: (n: number) => void;
}

export function GoalCard({ goal, current, daysElapsed, onChange }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(goal);

  const pct = goal > 0 ? Math.min(100, Math.round((current / goal) * 100)) : 0;
  const expected = (goal / 7) * Math.max(1, daysElapsed);
  let status: "On track" | "Behind" | "Ahead" = "On track";
  if (current >= expected + goal * 0.05) status = "Ahead";
  else if (current < expected - goal * 0.05) status = "Behind";

  const statusColor =
    status === "Ahead" ? "text-success" : status === "Behind" ? "text-destructive" : "text-primary";

  return (
    <div className="glass-card p-6 animate-fade-in">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Weekly Study Goal</h3>
        </div>
        {!editing ? (
          <Button variant="ghost" size="sm" onClick={() => { setDraft(goal); setEditing(true); }}>
            <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
          </Button>
        ) : (
          <div className="flex gap-2 items-center">
            <Input
              type="number" min={1} max={100} value={draft}
              onChange={(e) => setDraft(Number(e.target.value) || 0)}
              className="h-8 w-20 bg-background/60"
            />
            <Button size="sm" onClick={() => { onChange(draft); setEditing(false); }}>
              <Check className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-3xl font-bold gradient-text">
          <AnimatedNumber value={current} decimals={1} />
        </span>
        <span className="text-muted-foreground">/ {goal} h</span>
        <span className={`ml-auto text-sm font-semibold ${statusColor}`}>{status}</span>
      </div>

      <div className="mt-3 h-3 rounded-full bg-secondary/60 overflow-hidden">
        <div
          className="h-full gradient-bg transition-all duration-1000 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-2 text-xs text-muted-foreground">{pct}% complete · day {Math.min(7, daysElapsed)} of 7</div>
    </div>
  );
}
