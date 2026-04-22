import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import type { DayRecord, WeeklyStats, LevelInfo } from "./study-analytics";

interface ReportInput {
  stats: WeeklyStats;
  level: LevelInfo;
  totalXP: number;
  records: DayRecord[];
  chartContainer: HTMLElement | null;
}

export async function exportWeeklyReport({ stats, level, totalXP, records, chartContainer }: ReportInput) {
  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const W = pdf.internal.pageSize.getWidth();
  const margin = 40;
  let y = margin;

  // Header
  pdf.setFillColor(99, 102, 241);
  pdf.rect(0, 0, W, 90, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(22);
  pdf.text("Weekly Study Report", margin, 50);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);
  pdf.text(new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" }), margin, 70);
  y = 120;

  // Stats grid
  pdf.setTextColor(20, 20, 30);
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.text("This Week at a Glance", margin, y);
  y += 20;

  const stat = (label: string, value: string, col: number) => {
    const colW = (W - margin * 2) / 3;
    const x = margin + col * colW;
    pdf.setDrawColor(220, 220, 230);
    pdf.setFillColor(248, 248, 252);
    pdf.roundedRect(x, y, colW - 8, 60, 8, 8, "FD");
    pdf.setFontSize(9); pdf.setFont("helvetica", "normal"); pdf.setTextColor(120, 120, 135);
    pdf.text(label.toUpperCase(), x + 12, y + 18);
    pdf.setFontSize(16); pdf.setFont("helvetica", "bold"); pdf.setTextColor(40, 40, 60);
    pdf.text(value, x + 12, y + 42);
  };

  stat("Avg Efficiency", `${stats.avgEfficiency}%`, 0);
  stat("Study Hours", `${stats.totalStudyHours}h`, 1);
  stat("Streak", `${stats.streak} days`, 2);
  y += 75;
  stat("Performance", stats.performanceLabel, 0);
  stat("Burnout", `${stats.avgBurnout} / 4`, 1);
  stat("Level / XP", `${level.level} · ${totalXP}`, 2);
  y += 90;

  // Chart snapshot
  if (chartContainer) {
    try {
      const canvas = await html2canvas(chartContainer, { backgroundColor: "#ffffff", scale: 2, logging: false });
      const imgData = canvas.toDataURL("image/png");
      const imgW = W - margin * 2;
      const imgH = (canvas.height / canvas.width) * imgW;
      if (y + imgH > 780) { pdf.addPage(); y = margin; }
      pdf.setFontSize(14); pdf.setFont("helvetica", "bold"); pdf.setTextColor(20, 20, 30);
      pdf.text("Weekly Charts", margin, y); y += 16;
      pdf.addImage(imgData, "PNG", margin, y, imgW, Math.min(imgH, 760 - y));
      y += Math.min(imgH, 760 - y) + 20;
    } catch (e) {
      console.warn("Chart snapshot failed", e);
    }
  }

  // AI summary
  if (y > 680) { pdf.addPage(); y = margin; }
  pdf.setFontSize(14); pdf.setFont("helvetica", "bold"); pdf.setTextColor(20, 20, 30);
  pdf.text("AI Weekly Summary", margin, y); y += 18;
  pdf.setFontSize(11); pdf.setFont("helvetica", "normal"); pdf.setTextColor(60, 60, 80);
  const summaryLines = pdf.splitTextToSize(stats.weeklySummary, W - margin * 2);
  pdf.text(summaryLines, margin, y); y += summaryLines.length * 14 + 10;

  // Insights
  pdf.setFontSize(13); pdf.setFont("helvetica", "bold"); pdf.setTextColor(20, 20, 30);
  pdf.text("Key Insights", margin, y); y += 16;
  pdf.setFontSize(10); pdf.setFont("helvetica", "normal"); pdf.setTextColor(60, 60, 80);
  stats.weeklyInsights.forEach((ins) => {
    const lines = pdf.splitTextToSize(`• ${ins}`, W - margin * 2);
    if (y + lines.length * 12 > 800) { pdf.addPage(); y = margin; }
    pdf.text(lines, margin, y); y += lines.length * 12 + 4;
  });
  y += 6;

  // Personality + best time + prediction
  if (y > 730) { pdf.addPage(); y = margin; }
  pdf.setFontSize(13); pdf.setFont("helvetica", "bold"); pdf.setTextColor(20, 20, 30);
  pdf.text("Patterns Detected", margin, y); y += 16;
  pdf.setFontSize(10); pdf.setFont("helvetica", "normal"); pdf.setTextColor(60, 60, 80);
  [
    `Personality: ${stats.personality}`,
    `Best time to study: ${stats.bestTimeWindow}`,
    `Prediction: ${stats.prediction}`,
    `Encouragement: ${stats.weeklyEncouragement}`,
  ].forEach((t) => {
    const lines = pdf.splitTextToSize(t, W - margin * 2);
    if (y + lines.length * 12 > 800) { pdf.addPage(); y = margin; }
    pdf.text(lines, margin, y); y += lines.length * 12 + 4;
  });

  // Footer
  const pages = pdf.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(9); pdf.setTextColor(150, 150, 160);
    pdf.text(`Study Efficiency Dashboard · Page ${i} of ${pages}`, margin, 820);
  }

  pdf.save(`study-report-${new Date().toISOString().slice(0, 10)}.pdf`);
}
