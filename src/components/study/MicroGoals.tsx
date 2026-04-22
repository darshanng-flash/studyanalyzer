import { Lightbulb } from "lucide-react";
import { microGoals, type DayRecord } from "@/lib/study-analytics";

export function MicroGoals({ record }: { record: DayRecord }) {
  const goals = microGoals(record);
  return (
    <div className="glass-card p-6 animate-fade-in">
      <h3 className="font-semibold flex items-center gap-2 mb-3">
        <Lightbulb className="h-5 w-5 text-primary" /> Micro-Goals for Tomorrow
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {goals.map((g, i) => (
          <div key={i} className="p-3 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/15 text-sm hover:scale-[1.02] transition-transform">
            {g}
          </div>
        ))}
      </div>
    </div>
  );
}
