import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Sparkles } from "lucide-react";
import type { DayInput } from "@/lib/study-analytics";

interface Props {
  onAnalyze: (input: DayInput) => void;
}

export function DailyForm({ onAnalyze }: Props) {
  const [studyHours, setStudyHours] = useState(4);
  const [breakMinutes, setBreakMinutes] = useState(20);
  const [distractionMinutes, setDistractionMinutes] = useState(30);
  const [focusLevel, setFocusLevel] = useState(7);
  const [sleepHours, setSleepHours] = useState(7);
  const [stressLevel, setStressLevel] = useState(5);
  const [motivationLevel, setMotivationLevel] = useState(7);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAnalyze({ studyHours, breakMinutes, distractionMinutes, focusLevel, sleepHours, stressLevel, motivationLevel });
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card p-6 md:p-8 space-y-6 animate-slide-up">
      <div>
        <h2 className="text-2xl font-semibold gradient-text">Today's Check-in</h2>
        <p className="text-sm text-muted-foreground mt-1">Log your day to unlock insights and track patterns.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <NumField label="Hours studied today" value={studyHours} onChange={setStudyHours} step={0.5} max={24} />
        <NumField label="Sleep last night (hrs)" value={sleepHours} onChange={setSleepHours} step={0.5} max={14} />
        <NumField label="Break time (min)" value={breakMinutes} onChange={setBreakMinutes} step={5} max={600} />
        <NumField label="Distraction time (min)" value={distractionMinutes} onChange={setDistractionMinutes} step={5} max={600} />
      </div>

      <div className="space-y-5">
        <SliderField label="Focus level" value={focusLevel} setValue={setFocusLevel} />
        <SliderField label="Stress level" value={stressLevel} setValue={setStressLevel} />
        <SliderField label="Motivation level" value={motivationLevel} setValue={setMotivationLevel} />
      </div>

      <Button type="submit" size="lg" className="w-full gradient-bg text-primary-foreground hover:opacity-90 transition-opacity h-12 text-base font-medium shadow-[var(--shadow-glow)]">
        <Sparkles className="mr-2 h-5 w-5" />
        Analyze My Day
      </Button>
    </form>
  );
}

function NumField({ label, value, onChange, step = 1, max = 100 }: { label: string; value: number; onChange: (n: number) => void; step?: number; max?: number }) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <Input type="number" min={0} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value) || 0)} className="bg-background/60 backdrop-blur" />
    </div>
  );
}

function SliderField({ label, value, setValue }: { label: string; value: number; setValue: (n: number) => void }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label className="text-sm font-medium">{label}</Label>
        <span className="text-sm font-semibold gradient-text">{value}/10</span>
      </div>
      <Slider value={[value]} min={1} max={10} step={1} onValueChange={(v) => setValue(v[0])} />
    </div>
  );
}
