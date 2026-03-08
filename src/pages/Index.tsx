import { useState, useCallback } from "react";
import {
  Sparkles, Zap, Globe, Calendar, Download, RefreshCw,
  BarChart3, Hash, Megaphone, CheckCircle2,
  ArrowRight, Star, TrendingUp, Users, Clock, Video
} from "lucide-react";
import { VideoGenerator } from "@/components/VideoGenerator";
import { cn } from "@/lib/utils";
import {
  PLATFORMS, TONES, CONTENT_TYPES,
  type Platform, type Tone, type ContentType, type GeneratedContent, type CalendarEntry,
  generateContent, generateBulkCalendar
} from "@/data/contentTemplates";
import { PlatformBadge } from "@/components/PlatformBadge";
import { ContentCard } from "@/components/ContentCard";
import { ContentCalendar } from "@/components/ContentCalendar";

const QUICK_TOPICS = [
  "Productivity hacks for entrepreneurs",
  "Healthy morning routines",
  "AI tools changing business",
  "Passive income strategies",
  "Travel on a budget",
  "Social media growth tips",
  "Mental health awareness",
  "Sustainable living",
  "Fitness motivation",
  "Personal branding",
];

type Tab = "generate" | "calendar" | "bulk" | "video";

export default function Index() {
  // Generator state
  const [topic, setTopic] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(["instagram"]);
  const [selectedTone, setSelectedTone] = useState<Tone>("casual");
  const [selectedContentType, setSelectedContentType] = useState<ContentType>("post");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContents, setGeneratedContents] = useState<GeneratedContent[]>([]);
  const [generateCount, setGenerateCount] = useState(3);

  // Calendar state
  const [calendarEntries, setCalendarEntries] = useState<CalendarEntry[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("generate");

  // Bulk generator state
  const [bulkTopic, setBulkTopic] = useState("");
  const [bulkPlatforms, setBulkPlatforms] = useState<Platform[]>(["instagram", "twitter", "linkedin"]);
  const [bulkTone, setBulkTone] = useState<Tone>("professional");
  const [bulkDays, setBulkDays] = useState(30);
  const [bulkStartDate, setBulkStartDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [isBulkGenerating, setIsBulkGenerating] = useState(false);

  const togglePlatform = useCallback((p: Platform) => {
    setSelectedPlatforms(prev =>
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    );
    // Reset content type to first available
    const types = CONTENT_TYPES[p];
    if (types && !types.includes(selectedContentType)) {
      setSelectedContentType(types[0]);
    }
  }, [selectedContentType]);

  const toggleBulkPlatform = useCallback((p: Platform) => {
    setBulkPlatforms(prev =>
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    );
  }, []);

  const handleGenerate = useCallback(() => {
    if (!topic.trim()) return;
    setIsGenerating(true);
    setGeneratedContents([]);

    // Simulate AI thinking with slight delay
    setTimeout(() => {
      const platforms = selectedPlatforms.length > 0 ? selectedPlatforms : (["instagram"] as Platform[]);
      const results: GeneratedContent[] = [];

      for (let i = 0; i < generateCount; i++) {
        const platform = platforms[i % platforms.length];
        const availableTypes = CONTENT_TYPES[platform];
        const contentType = availableTypes.includes(selectedContentType) ? selectedContentType : availableTypes[0];
        results.push(generateContent(topic.trim(), platform, selectedTone, contentType));
      }

      setGeneratedContents(results);
      setIsGenerating(false);
    }, 800 + Math.random() * 400);
  }, [topic, selectedPlatforms, selectedTone, selectedContentType, generateCount]);

  const handleAddToCalendar = useCallback((content: GeneratedContent) => {
    const now = new Date();
    now.setDate(now.getDate() + calendarEntries.length + 1);
    const entry: CalendarEntry = {
      ...content,
      date: now.toISOString().split("T")[0],
      time: "09:00",
      status: "scheduled",
    };
    setCalendarEntries(prev => [...prev, entry]);
    setActiveTab("calendar");
  }, [calendarEntries.length]);

  const handleBulkGenerate = useCallback(() => {
    if (!bulkTopic.trim() || bulkPlatforms.length === 0) return;
    setIsBulkGenerating(true);

    setTimeout(() => {
      const entries = generateBulkCalendar(bulkTopic.trim(), bulkPlatforms, bulkTone, bulkStartDate, bulkDays);
      setCalendarEntries(prev => {
        const existingIds = new Set(prev.map(e => e.id));
        const newEntries = entries.filter(e => !existingIds.has(e.id));
        return [...prev, ...newEntries];
      });
      setIsBulkGenerating(false);
      setActiveTab("calendar");
    }, 1200);
  }, [bulkTopic, bulkPlatforms, bulkTone, bulkStartDate, bulkDays]);

  // Available content types (union of all selected platforms)
  const availableContentTypes = selectedPlatforms.length > 0
    ? [...new Set(selectedPlatforms.flatMap(p => CONTENT_TYPES[p]))]
    : CONTENT_TYPES.instagram;

  const TABS = [
    { id: "generate" as Tab, label: "Generate", icon: Sparkles },
    { id: "video" as Tab, label: "Video AI", icon: Video },
    { id: "bulk" as Tab, label: "Bulk Calendar", icon: Calendar },
    { id: "calendar" as Tab, label: `Scheduled (${calendarEntries.length})`, icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Header */}
      <div className="relative overflow-hidden border-b border-border">
        {/* Background glow effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-3xl -translate-y-1/2" />
          <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-accent/10 blur-3xl -translate-y-1/2" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:32px_32px] opacity-20" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-10 sm:py-14">
          <div className="flex flex-col items-center text-center mb-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-semibold mb-6 animate-fade-in">
              <Zap size={14} className="animate-pulse" />
              <span>Smarter than Jasper · Faster than Copy.ai · More powerful than Canva</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black leading-tight mb-4 animate-slide-up">
              <span className="gradient-text">AI Content</span>
              <br />
              <span className="text-foreground">That Goes Viral</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mb-8 animate-fade-in">
              Generate platform-specific social media content, captions, hashtags & complete content calendars in seconds — for every platform, every tone, any niche.
            </p>

            {/* Stats row */}
            <div className="flex items-center gap-6 sm:gap-10 flex-wrap justify-center animate-fade-in">
              {[
                { icon: Globe, label: "6 Platforms", value: "All-in-one" },
                { icon: Zap, label: "Instant Gen", value: "< 1 second" },
                { icon: Download, label: "Export Ready", value: "CSV & JSON" },
                { icon: Users, label: "Works For", value: "Any Niche" },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-2 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon size={16} className="text-primary" />
                  </div>
                  <div>
                    <div className="font-bold text-foreground">{value}</div>
                    <div className="text-muted-foreground text-xs">{label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mb-8 p-1.5 bg-card rounded-2xl border border-border w-fit">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all",
                activeTab === id
                  ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/25 scale-[1.02]"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        {/* ═══════════════════════════════════════ GENERATE TAB ═══════════════════════════════════════ */}
        {activeTab === "generate" && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left Panel - Controls */}
            <div className="lg:col-span-2 space-y-5">
              {/* Topic Input */}
              <div className="p-5 rounded-2xl bg-card border border-border card-glow">
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                  <Sparkles size={12} className="inline mr-1.5" />
                  What's your content about?
                </label>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Productivity hacks for remote workers, healthy meal prep tips, AI tools for small businesses..."
                  className="w-full bg-background border border-border rounded-xl p-3.5 text-sm text-foreground placeholder:text-muted-foreground resize-none h-24 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleGenerate();
                  }}
                />
                {/* Quick topics */}
                <div className="mt-3">
                  <p className="text-xs text-muted-foreground mb-2">Quick ideas:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_TOPICS.slice(0, 5).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTopic(t)}
                        className="px-2.5 py-1 rounded-lg bg-secondary hover:bg-primary/20 text-xs text-muted-foreground hover:text-primary transition-all truncate max-w-[140px]"
                        title={t}
                      >
                        {t.length > 22 ? t.slice(0, 22) + "…" : t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Platform Selector */}
              <div className="p-5 rounded-2xl bg-card border border-border card-glow">
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                  <Globe size={12} className="inline mr-1.5" />
                  Platforms ({selectedPlatforms.length} selected)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(PLATFORMS) as Platform[]).map((p) => (
                    <PlatformBadge
                      key={p}
                      platform={p}
                      size="sm"
                      selected={selectedPlatforms.includes(p)}
                      onClick={() => togglePlatform(p)}
                    />
                  ))}
                </div>
                <button
                  onClick={() => setSelectedPlatforms(Object.keys(PLATFORMS) as Platform[])}
                  className="mt-3 w-full text-xs text-muted-foreground hover:text-primary transition-colors text-center"
                >
                  Select all platforms →
                </button>
              </div>

              {/* Tone Selector */}
              <div className="p-5 rounded-2xl bg-card border border-border card-glow">
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                  <Megaphone size={12} className="inline mr-1.5" />
                  Tone of Voice
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.entries(TONES) as [Tone, typeof TONES[Tone]][]).map(([key, t]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedTone(key)}
                      className={cn(
                        "flex items-center gap-2 p-3 rounded-xl text-sm font-medium transition-all border",
                        selectedTone === key
                          ? "bg-primary/10 border-primary/50 text-primary scale-[1.02] shadow-sm"
                          : "bg-secondary/50 border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary"
                      )}
                    >
                      <span className="text-base">{t.icon}</span>
                      <div className="text-left">
                        <div className="text-xs font-bold leading-none">{t.name}</div>
                        <div className="text-xs opacity-70 mt-0.5">{t.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Content Type */}
              <div className="p-5 rounded-2xl bg-card border border-border card-glow">
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                  <BarChart3 size={12} className="inline mr-1.5" />
                  Content Type
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableContentTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedContentType(type)}
                      className={cn(
                        "px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-all border",
                        selectedContentType === type
                          ? "bg-accent/10 border-accent/50 text-accent"
                          : "bg-secondary/50 border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary"
                      )}
                    >
                      {type.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Variation Count */}
              <div className="p-5 rounded-2xl bg-card border border-border card-glow">
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                  <RefreshCw size={12} className="inline mr-1.5" />
                  Variations to Generate
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 5, 6].map((n) => (
                    <button
                      key={n}
                      onClick={() => setGenerateCount(n)}
                      className={cn(
                        "flex-1 py-2 rounded-xl text-sm font-bold transition-all border",
                        generateCount === n
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-secondary/50 border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary"
                      )}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={!topic.trim() || selectedPlatforms.length === 0 || isGenerating}
                className={cn(
                  "w-full py-4 rounded-2xl font-black text-base tracking-wide transition-all duration-300",
                  "flex items-center justify-center gap-3",
                  topic.trim() && selectedPlatforms.length > 0 && !isGenerating
                    ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:scale-[1.02] active:scale-[0.99] animate-pulse-glow"
                    : "bg-secondary text-muted-foreground cursor-not-allowed"
                )}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    Generating content...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Generate Content
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
              {!topic.trim() && (
                <p className="text-xs text-muted-foreground text-center -mt-3">Enter a topic above to get started</p>
              )}
            </div>

            {/* Right Panel - Results */}
            <div className="lg:col-span-3 space-y-4">
              {isGenerating && (
                <div className="space-y-4">
                  {Array.from({ length: generateCount }).map((_, i) => (
                    <div key={i} className="h-64 rounded-2xl animate-shimmer" />
                  ))}
                </div>
              )}

              {!isGenerating && generatedContents.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-6 animate-float">
                    <Sparkles size={36} className="text-primary" />
                  </div>
                  <h3 className="text-2xl font-black text-foreground mb-3">Ready to create</h3>
                  <p className="text-muted-foreground max-w-xs text-sm leading-relaxed">
                    Set your topic, pick your platforms & tone, then hit Generate to create viral-ready content instantly.
                  </p>
                  <div className="mt-6 grid grid-cols-2 gap-3 w-full max-w-sm">
                    {[
                      { icon: Hash, text: "Platform-specific hashtags" },
                      { icon: Zap, text: "Viral hooks & captions" },
                      { icon: Clock, text: "Optimal posting times" },
                      { icon: Star, text: "Engagement tips" },
                    ].map(({ icon: Icon, text }) => (
                      <div key={text} className="flex items-center gap-2 p-3 rounded-xl bg-card border border-border text-xs text-muted-foreground">
                        <Icon size={14} className="text-primary flex-shrink-0" />
                        {text}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!isGenerating && generatedContents.length > 0 && (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-green-400" />
                      <span className="text-sm font-semibold text-foreground">
                        {generatedContents.length} piece{generatedContents.length !== 1 ? "s" : ""} generated
                      </span>
                    </div>
                    <button
                      onClick={handleGenerate}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary hover:bg-primary/20 text-xs font-semibold text-muted-foreground hover:text-primary transition-all"
                    >
                      <RefreshCw size={12} />
                      Regenerate
                    </button>
                  </div>
                  {generatedContents.map((c, i) => (
                    <ContentCard
                      key={c.id}
                      content={c}
                      onAddToCalendar={handleAddToCalendar}
                      animationDelay={i * 100}
                    />
                  ))}
                </>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════ BULK CALENDAR TAB ═══════════════════════════════════════ */}
        {activeTab === "bulk" && (
          <div className="max-w-2xl mx-auto">
            <div className="p-6 rounded-2xl bg-card border border-border card-glow space-y-6">
              <div>
                <h2 className="text-2xl font-black text-foreground mb-1">Bulk Content Calendar</h2>
                <p className="text-muted-foreground text-sm">Generate a full month (or more) of scheduled content across all your platforms in one click.</p>
              </div>

              {/* Topic */}
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  Content Topic / Niche
                </label>
                <input
                  type="text"
                  value={bulkTopic}
                  onChange={(e) => setBulkTopic(e.target.value)}
                  placeholder="e.g. Digital marketing for startups"
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                />
              </div>

              {/* Platforms */}
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                  Platforms ({bulkPlatforms.length} selected)
                </label>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(PLATFORMS) as Platform[]).map((p) => (
                    <PlatformBadge
                      key={p}
                      platform={p}
                      size="sm"
                      selected={bulkPlatforms.includes(p)}
                      onClick={() => toggleBulkPlatform(p)}
                    />
                  ))}
                </div>
              </div>

              {/* Tone */}
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                  Tone of Voice
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.entries(TONES) as [Tone, typeof TONES[Tone]][]).map(([key, t]) => (
                    <button
                      key={key}
                      onClick={() => setBulkTone(key)}
                      className={cn(
                        "flex items-center gap-2 p-2.5 rounded-xl text-xs font-medium transition-all border",
                        bulkTone === key
                          ? "bg-primary/10 border-primary/50 text-primary"
                          : "bg-secondary/50 border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary"
                      )}
                    >
                      <span>{t.icon}</span>
                      <span>{t.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date & Days */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={bulkStartDate}
                    onChange={(e) => setBulkStartDate(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Days to Generate
                  </label>
                  <select
                    value={bulkDays}
                    onChange={(e) => setBulkDays(Number(e.target.value))}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  >
                    <option value={7}>7 days (1 week)</option>
                    <option value={14}>14 days (2 weeks)</option>
                    <option value={30}>30 days (1 month)</option>
                    <option value={60}>60 days (2 months)</option>
                    <option value={90}>90 days (3 months)</option>
                  </select>
                </div>
              </div>

              {/* Preview of what will be generated */}
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                <div className="text-sm font-semibold text-primary mb-2">📊 What you'll get:</div>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={12} className="text-green-400" />
                    ~{Math.floor(bulkDays * bulkPlatforms.length * 0.7)} total posts
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={12} className="text-green-400" />
                    {bulkPlatforms.length} platforms covered
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={12} className="text-green-400" />
                    Full captions + hashtags
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={12} className="text-green-400" />
                    CSV & JSON download
                  </div>
                </div>
              </div>

              <button
                onClick={handleBulkGenerate}
                disabled={!bulkTopic.trim() || bulkPlatforms.length === 0 || isBulkGenerating}
                className={cn(
                  "w-full py-4 rounded-2xl font-black text-base tracking-wide transition-all duration-300",
                  "flex items-center justify-center gap-3",
                  bulkTopic.trim() && bulkPlatforms.length > 0 && !isBulkGenerating
                    ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:scale-[1.02] active:scale-[0.99]"
                    : "bg-secondary text-muted-foreground cursor-not-allowed"
                )}
              >
                {isBulkGenerating ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    Generating {bulkDays}-day calendar...
                  </>
                ) : (
                  <>
                    <Calendar size={18} />
                    Generate {bulkDays}-Day Calendar
                    <Download size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════ CALENDAR TAB ═══════════════════════════════════════ */}
        {activeTab === "calendar" && (
          <ContentCalendar
            entries={calendarEntries}
            onRemoveEntry={(id) => setCalendarEntries(prev => prev.filter(e => e.id !== id))}
            onClearAll={() => setCalendarEntries([])}
          />
        )}
      </div>

      {/* Footer */}
      <footer className="mt-16 py-8 border-t border-border text-center text-sm text-muted-foreground">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles size={16} className="text-primary" />
          <span className="font-bold text-foreground gradient-text">ContentAI Pro</span>
        </div>
        <p>Generating viral-ready content for 6 platforms · Works globally · Zero learning curve</p>
      </footer>
    </div>
  );
}
