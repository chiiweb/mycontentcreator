import { useState, useMemo } from "react";
import { Download, Calendar, ChevronLeft, ChevronRight, Trash2, FileJson, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { type CalendarEntry, PLATFORMS, exportCalendarToCSV, exportCalendarToJSON } from "@/data/contentTemplates";
import { PlatformBadge } from "./PlatformBadge";

interface ContentCalendarProps {
  entries: CalendarEntry[];
  onRemoveEntry: (id: string) => void;
  onClearAll: () => void;
}

export function ContentCalendar({ entries, onRemoveEntry, onClearAll }: ContentCalendarProps) {
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);

  const sortedEntries = useMemo(
    () => [...entries].sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)),
    [entries]
  );

  // Group entries by date for calendar view
  const entriesByDate = useMemo(() => {
    const map: Record<string, CalendarEntry[]> = {};
    entries.forEach((e) => {
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    });
    return map;
  }, [entries]);

  // Get week dates
  const weekDates = useMemo(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + currentWeekOffset * 7);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return d.toISOString().split("T")[0];
    });
  }, [currentWeekOffset]);

  const downloadCSV = () => {
    const csv = exportCalendarToCSV(sortedEntries);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `content-calendar-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadJSON = () => {
    const json = exportCalendarToJSON(sortedEntries);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `content-calendar-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const statusColors: Record<CalendarEntry["status"], string> = {
    scheduled: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    draft: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    posted: "bg-green-500/20 text-green-400 border-green-500/30",
  };

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center mb-4 animate-float">
          <Calendar size={32} className="text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No scheduled content yet</h3>
        <p className="text-muted-foreground text-sm max-w-xs">
          Generate content and click "Schedule" to add it to your calendar, or use the Bulk Calendar generator below.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-foreground">
            {entries.length} post{entries.length !== 1 ? "s" : ""} scheduled
          </span>
          <div className="flex rounded-xl bg-secondary p-1 gap-1">
            {(["list", "calendar"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all",
                  viewMode === mode
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={downloadCSV}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-green-500/10 hover:bg-green-500/20 text-green-400 text-sm font-semibold transition-all border border-green-500/20"
          >
            <FileText size={14} />
            CSV
          </button>
          <button
            onClick={downloadJSON}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-sm font-semibold transition-all border border-blue-500/20"
          >
            <FileJson size={14} />
            JSON
          </button>
          <button
            onClick={onClearAll}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-destructive/10 hover:bg-destructive/20 text-destructive text-sm font-semibold transition-all border border-destructive/20"
          >
            <Trash2 size={14} />
            Clear
          </button>
        </div>
      </div>

      {/* Calendar View */}
      {viewMode === "calendar" && (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <button
              onClick={() => setCurrentWeekOffset(prev => prev - 1)}
              className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm font-semibold text-foreground">
              {new Date(weekDates[0]).toLocaleDateString("en-US", { month: "short", day: "numeric" })} –{" "}
              {new Date(weekDates[6]).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
            <button
              onClick={() => setCurrentWeekOffset(prev => prev + 1)}
              className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground"
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <div className="grid grid-cols-7 divide-x divide-border">
            {weekDates.map((date) => {
              const dayEntries = entriesByDate[date] || [];
              const dayName = new Date(date + "T00:00:00").toLocaleDateString("en-US", { weekday: "short" });
              const dayNum = new Date(date + "T00:00:00").getDate();
              const isToday = date === new Date().toISOString().split("T")[0];

              return (
                <div key={date} className="min-h-32">
                  <div className={cn(
                    "p-2 text-center border-b border-border",
                    isToday && "bg-primary/10"
                  )}>
                    <div className="text-xs text-muted-foreground">{dayName}</div>
                    <div className={cn(
                      "text-lg font-bold",
                      isToday ? "text-primary" : "text-foreground"
                    )}>{dayNum}</div>
                  </div>
                  <div className="p-1 space-y-1">
                    {dayEntries.map((entry) => (
                      <div
                        key={entry.id}
                        className="p-1.5 rounded-lg text-xs cursor-pointer hover:opacity-80 transition-opacity"
                        style={{ background: `${PLATFORMS[entry.platform].color}20`, borderLeft: `2px solid ${PLATFORMS[entry.platform].color}` }}
                        title={`${PLATFORMS[entry.platform].name}: ${entry.topic}`}
                      >
                        <div className="font-semibold truncate text-foreground">{PLATFORMS[entry.platform].icon} {entry.time}</div>
                        <div className="truncate text-muted-foreground">{entry.topic}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <div className="space-y-2">
          {sortedEntries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-all group"
            >
              <div className="flex-shrink-0 w-12 text-center">
                <div className="text-xs font-bold text-foreground">{new Date(entry.date + "T00:00:00").toLocaleDateString("en-US", { month: "short" })}</div>
                <div className="text-xl font-black text-primary leading-none">{new Date(entry.date + "T00:00:00").getDate()}</div>
              </div>
              <div className="flex-shrink-0">
                <div className="w-0.5 h-10 bg-border rounded-full" />
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs text-muted-foreground font-mono">{entry.time}</span>
                <PlatformBadge platform={entry.platform} size="sm" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-foreground truncate">{entry.topic}</div>
                <div className="text-xs text-muted-foreground truncate capitalize">{entry.tone} · {entry.contentType.replace("_", " ")}</div>
              </div>
              <span className={cn("px-2.5 py-1 rounded-full text-xs font-semibold border flex-shrink-0 capitalize", statusColors[entry.status])}>
                {entry.status}
              </span>
              <button
                onClick={() => onRemoveEntry(entry.id)}
                className="flex-shrink-0 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-destructive/20 hover:text-destructive text-muted-foreground transition-all"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
