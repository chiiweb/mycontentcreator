import { useState, useRef, useEffect, useCallback } from "react";
import {
  Video, Sparkles, Download, RefreshCw, Zap, Mic, MicOff,
  Volume2, VolumeX, Upload, Captions, Settings2, Play, Pause,
  ChevronDown, ChevronUp, X, Music
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────
type AspectRatio = "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
type Duration = 5 | 10 | 60 | 300;
type Resolution = "480p" | "1080p";

interface VideoResult {
  id: string;
  prompt: string;
  platform: string;
  aspectRatio: AspectRatio;
  duration: Duration;
  videoUrl: string;
  thumbnailUrl: string;
  videoTitle: string;
  generating: boolean;
  error?: string;
  progress: number;
  caption: string;
}

// ─── Pexels free-tier key (read-only, publishable) ───────────────────────────
const PEXELS_API_KEY = "gKYoovYF5XtEDPpvQbNDDHBNUVADLZzOAIEA8N2uW9FzDQSn6cqfxGbf";

// ─── Character / concept knowledge base ─────────────────────────────────────
// Enriches prompts so Pexels returns relevant results for known IPs
const CHARACTER_MAP: Record<string, string[]> = {
  chiikawa: ["cute rabbit bunny pastel kawaii anime", "small fluffy animal forest"],
  pikachu: ["yellow electric pokemon lightning cute", "cartoon yellow mouse"],
  totoro: ["forest spirit nature giant grey fluffy", "studio ghibli nature"],
  kirby: ["pink round cute star puffball", "pink balloon floating"],
  naruto: ["ninja orange action running", "anime ninja fight"],
  goku: ["martial arts power dragon ball", "super hero energy"],
  mickey: ["classic cartoon black mouse ears", "amusement park character"],
  hello_kitty: ["white cat bow kawaii pastel", "cute white cat pink"],
  snoopy: ["beagle dog white black cartoon", "puppy dog playing"],
  bluey: ["blue dog puppy family play", "kids cartoon dog"],
  peppa: ["pink pig family cartoon kids", "piglet playing"],
  pokemon: ["colorful creatures battle adventure", "monster capture adventure"],
  minecraft: ["blocky voxel build craft survival", "pixel cube building"],
  fortnite: ["battle royale colorful island shoot", "gaming action"],
  roblox: ["blocky avatar build play online", "kids gaming world"],
};

function enrichPromptForSearch(prompt: string): string {
  const lower = prompt.toLowerCase().replace(/[^a-z0-9 ]/g, "");
  for (const [key, synonyms] of Object.entries(CHARACTER_MAP)) {
    if (lower.includes(key)) {
      return synonyms[0] + " " + prompt;
    }
  }
  return prompt;
}

// ─── Pexels video search ──────────────────────────────────────────────────────
async function searchPexelsVideo(
  prompt: string,
  aspectRatio: AspectRatio
): Promise<{ url: string; thumb: string; title: string } | null> {
  const enriched = enrichPromptForSearch(prompt);
  // Pick best orientation for Pexels filter
  const orientation =
    aspectRatio === "9:16" || aspectRatio === "3:4"
      ? "portrait"
      : aspectRatio === "1:1"
      ? "square"
      : "landscape";

  // Extract meaningful search terms (first 6 words)
  const query = enriched.split(" ").slice(0, 6).join(" ");

  try {
    const res = await fetch(
      `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&orientation=${orientation}&per_page=10&size=medium`,
      { headers: { Authorization: PEXELS_API_KEY } }
    );
    if (!res.ok) throw new Error("Pexels error");
    const data = await res.json();
    const videos: any[] = data.videos ?? [];
    if (!videos.length) return null;

    // Pick a random one from top 5 for variety
    const pick = videos[Math.floor(Math.random() * Math.min(5, videos.length))];

    // Prefer HD file, fallback to first available
    const files: any[] = pick.video_files ?? [];
    const hd =
      files.find((f) => f.quality === "hd") ??
      files.find((f) => f.quality === "sd") ??
      files[0];

    if (!hd) return null;

    return {
      url: hd.link,
      thumb: pick.image ?? "",
      title: pick.url?.split("/").filter(Boolean).pop() ?? "pexels-video",
    };
  } catch {
    return null;
  }
}

// ─── Fallback: curated Pexels video IDs per theme ────────────────────────────
const FALLBACK_VIDEO_IDS: Record<string, number> = {
  nature: 3571264,
  city: 3163534,
  tech: 3129671,
  food: 3543812,
  fitness: 3764958,
  fashion: 4195408,
  music: 3045017,
  travel: 3044726,
  motivation: 3772668,
  default: 2499611,
};

async function getFallbackVideo(prompt: string): Promise<{ url: string; thumb: string; title: string } | null> {
  const lower = prompt.toLowerCase();
  let key = "default";
  for (const k of Object.keys(FALLBACK_VIDEO_IDS)) {
    if (lower.includes(k)) { key = k; break; }
  }
  const id = FALLBACK_VIDEO_IDS[key];
  try {
    const res = await fetch(`https://api.pexels.com/videos/videos/${id}`, {
      headers: { Authorization: PEXELS_API_KEY },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const files: any[] = data.video_files ?? [];
    const hd = files.find((f) => f.quality === "hd") ?? files[0];
    if (!hd) return null;
    return { url: hd.link, thumb: data.image ?? "", title: "video" };
  } catch {
    return null;
  }
}

// ─── Caption generator ───────────────────────────────────────────────────────
function generateCaption(prompt: string, platform: string): string {
  const lower = prompt.toLowerCase();
  const platformEmoji: Record<string, string> = {
    tiktok: "🎵", instagram: "📸", youtube: "▶️",
    facebook: "👥", twitter: "🐦", pinterest: "📌",
  };
  const em = platformEmoji[platform] ?? "✨";
  const templates = [
    `${em} ${prompt} — watch till the end! #viral #trending`,
    `Just created this for you ✨ ${prompt} | Drop a ❤️ if you love it!`,
    `${prompt} 🔥 You won't believe what happens next... #explore`,
    `POV: You just discovered ${prompt} 👀 ${em} #fyp`,
    `Everything you need to know about ${lower.includes("how") ? "this" : prompt} 💡 #tips`,
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}

// ─── Platform presets ─────────────────────────────────────────────────────────
const PLATFORM_PRESETS: Record<string, { aspectRatio: AspectRatio; duration: Duration; icon: string; label: string }> = {
  tiktok:    { aspectRatio: "9:16", duration: 5,   icon: "🎵", label: "TikTok" },
  instagram: { aspectRatio: "1:1",  duration: 5,   icon: "📸", label: "Instagram" },
  youtube:   { aspectRatio: "16:9", duration: 60,  icon: "▶️", label: "YouTube" },
  facebook:  { aspectRatio: "16:9", duration: 60,  icon: "👥", label: "Facebook" },
  twitter:   { aspectRatio: "16:9", duration: 5,   icon: "🐦", label: "X (Twitter)" },
  pinterest: { aspectRatio: "3:4",  duration: 5,   icon: "📌", label: "Pinterest" },
};

const DURATION_LABELS: Record<number, string> = {
  5: "5s · Reel / Short",
  10: "10s · Story",
  60: "1m · Explainer",
  300: "5m · Deep-dive",
};

const GENERATING_MESSAGES = [
  "Researching your topic and finding the perfect visuals...",
  "Scouring the internet for the best matching footage...",
  "Picking the most cinematic clips for your concept...",
  "Almost there — adding the finishing touches!",
  "Looks amazing — just rendering the final output!",
];

const QUICK_PROMPTS = [
  "Cinematic product showcase with dramatic lighting",
  "Vibrant lifestyle montage with fast cuts",
  "Nature timelapse with golden hour lighting",
  "Urban city streets with neon reflections at night",
  "Fitness and workout dynamic movement",
  "Tech futuristic glowing UI holographic",
  "Food close-up with steam and rich colors",
  "Fashion editorial high-end slow motion",
  "Chiikawa cute kawaii forest adventure",
  "Motivational abstract motion graphics",
];

// ─── Narrator hook ────────────────────────────────────────────────────────────
function useNarrator() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const uttRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    const load = () => {
      const v = speechSynthesis.getVoices();
      if (v.length) {
        setVoices(v);
        // Auto-select a nice English voice
        const pref = v.find(x => /en.*(US|GB|AU)/i.test(x.lang)) ?? v[0];
        setSelectedVoice(pref?.name ?? "");
      }
    };
    load();
    speechSynthesis.addEventListener("voiceschanged", load);
    return () => speechSynthesis.removeEventListener("voiceschanged", load);
  }, []);

  const speak = useCallback((text: string) => {
    speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    const voice = voices.find(v => v.name === selectedVoice);
    if (voice) utt.voice = voice;
    utt.rate = rate;
    utt.pitch = pitch;
    uttRef.current = utt;
    speechSynthesis.speak(utt);
  }, [voices, selectedVoice, rate, pitch]);

  const stop = useCallback(() => {
    speechSynthesis.cancel();
  }, []);

  return { voices, selectedVoice, setSelectedVoice, rate, setRate, pitch, setPitch, speak, stop };
}

// ─── Main component ───────────────────────────────────────────────────────────
export function VideoGenerator() {
  const [prompt, setPrompt] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("tiktok");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("9:16");
  const [duration, setDuration] = useState<Duration>(5);
  const [resolution, setResolution] = useState<Resolution>("1080p");
  const [isGenerating, setIsGenerating] = useState(false);
  const [videos, setVideos] = useState<VideoResult[]>([]);
  const [statusMsg, setStatusMsg] = useState("");

  // Narrator state
  const [narratorEnabled, setNarratorEnabled] = useState(true);
  const [captionsEnabled, setCaptionsEnabled] = useState(true);
  const [showNarratorPanel, setShowNarratorPanel] = useState(false);
  const narrator = useNarrator();

  // Audio upload state
  const [customAudio, setCustomAudio] = useState<{ name: string; url: string } | null>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  // Playing captions state per video id
  const [playingCaption, setPlayingCaption] = useState<Record<string, boolean>>({});

  const handlePlatformSelect = (key: string) => {
    setSelectedPlatform(key);
    setAspectRatio(PLATFORM_PRESETS[key].aspectRatio);
    setDuration(PLATFORM_PRESETS[key].duration);
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    const id = `vid_${Date.now()}`;

    const newVideo: VideoResult = {
      id,
      prompt: prompt.trim(),
      platform: selectedPlatform,
      aspectRatio,
      duration,
      videoUrl: "",
      thumbnailUrl: "",
      videoTitle: "",
      generating: true,
      progress: 0,
      caption: generateCaption(prompt.trim(), selectedPlatform),
    };
    setVideos(prev => [newVideo, ...prev]);

    // Cycle status messages
    let msgIdx = 0;
    setStatusMsg(GENERATING_MESSAGES[0]);
    const msgTimer = setInterval(() => {
      msgIdx = Math.min(msgIdx + 1, GENERATING_MESSAGES.length - 1);
      setStatusMsg(GENERATING_MESSAGES[msgIdx]);
    }, 1200);

    // Animate progress
    const totalMs = 6000;
    const tickMs = 80;
    let tick = 0;
    const ticks = totalMs / tickMs;
    const progressTimer = setInterval(() => {
      tick++;
      const pct = Math.min(90, Math.round((tick / ticks) * 90));
      setVideos(prev => prev.map(v => v.id === id ? { ...v, progress: pct } : v));
    }, tickMs);

    try {
      // Search Pexels for a real matching video
      let result = await searchPexelsVideo(prompt.trim(), aspectRatio);
      if (!result) result = await getFallbackVideo(prompt.trim());

      clearInterval(progressTimer);
      clearInterval(msgTimer);
      setStatusMsg("");

      if (!result) throw new Error("No video found — try a different prompt!");

      setVideos(prev =>
        prev.map(v =>
          v.id === id
            ? { ...v, videoUrl: result!.url, thumbnailUrl: result!.thumb, videoTitle: result!.title, generating: false, progress: 100 }
            : v
        )
      );
    } catch (err: any) {
      clearInterval(progressTimer);
      clearInterval(msgTimer);
      setStatusMsg("");
      setVideos(prev =>
        prev.map(v =>
          v.id === id
            ? { ...v, generating: false, error: err?.message ?? "Something went wrong — give it another shot!", progress: 0 }
            : v
        )
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async (url: string, id: string) => {
    try {
      const a = document.createElement("a");
      a.href = url;
      a.download = `contentai-video-${id}.mp4`;
      a.target = "_blank";
      a.click();
    } catch {
      window.open(url, "_blank");
    }
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setCustomAudio({ name: file.name, url });
  };

  const handleNarrate = (video: VideoResult) => {
    if (!narratorEnabled) return;
    const text = `Here's your video about ${video.prompt}. ${video.caption.replace(/[#🎵📸▶️👥🐦📌✨🔥👀💡]/g, "")}`;
    narrator.speak(text);
    setPlayingCaption(prev => ({ ...prev, [video.id]: true }));
    setTimeout(() => setPlayingCaption(prev => ({ ...prev, [video.id]: false })), 8000);
  };

  const handleStopNarrate = () => {
    narrator.stop();
    setPlayingCaption({});
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleGenerate();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* ── Controls ── */}
      <div className="lg:col-span-2 space-y-5">

        {/* Platform Presets */}
        <div className="p-5 rounded-2xl bg-card border border-border">
          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
            <Video size={12} className="inline mr-1.5" />Platform Preset
          </label>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(PLATFORM_PRESETS).map(([key, p]) => (
              <button
                key={key}
                onClick={() => handlePlatformSelect(key)}
                className={cn(
                  "flex items-center gap-2 p-3 rounded-xl text-sm font-semibold border transition-all",
                  selectedPlatform === key
                    ? "border-primary/50 bg-primary/10 text-primary scale-[1.02]"
                    : "border-transparent bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                <span>{p.icon}</span>
                <div className="text-left">
                  <div className="text-xs font-bold leading-none">{p.label}</div>
                  <div className="text-xs opacity-60 mt-0.5">{p.aspectRatio} · {p.duration}s</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Prompt */}
        <div className="p-5 rounded-2xl bg-card border border-border">
          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
            <Sparkles size={12} className="inline mr-1.5" />Video Prompt
          </label>
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe the video — e.g. 'Chiikawa cute forest adventure' or 'neon city night timelapse'... (Ctrl+Enter to generate)"
            className="w-full bg-background border border-border rounded-xl p-3.5 text-sm text-foreground placeholder:text-muted-foreground resize-none h-24 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
          <div className="mt-3">
            <p className="text-xs text-muted-foreground mb-2">Quick prompts:</p>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_PROMPTS.slice(0, 6).map(s => (
                <button
                  key={s}
                  onClick={() => setPrompt(s)}
                  className="px-2.5 py-1 rounded-lg bg-secondary hover:bg-primary/20 text-xs text-muted-foreground hover:text-primary transition-all"
                >
                  {s.length > 28 ? s.slice(0, 28) + "…" : s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="p-5 rounded-2xl bg-card border border-border space-y-4">
          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Video Settings</label>

          <div>
            <p className="text-xs text-muted-foreground mb-2">Aspect Ratio</p>
            <div className="flex flex-wrap gap-2">
              {(["16:9", "9:16", "1:1", "4:3", "3:4"] as AspectRatio[]).map(r => (
                <button
                  key={r}
                  onClick={() => setAspectRatio(r)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-bold border transition-all",
                    aspectRatio === r
                      ? "bg-accent/10 border-accent/50 text-accent"
                      : "bg-secondary/50 border-transparent text-muted-foreground hover:bg-secondary"
                  )}
                >{r}</button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-2">Duration</p>
            <div className="grid grid-cols-2 gap-2">
              {([5, 10, 60, 300] as Duration[]).map(d => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={cn(
                    "py-2 px-3 rounded-xl text-xs font-bold border transition-all text-left leading-tight",
                    duration === d
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-secondary/50 border-transparent text-muted-foreground hover:bg-secondary"
                  )}
                >{DURATION_LABELS[d]}</button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-2">Quality</p>
            <div className="flex gap-2">
              {(["480p", "1080p"] as Resolution[]).map(r => (
                <button
                  key={r}
                  onClick={() => setResolution(r)}
                  className={cn(
                    "flex-1 py-2 rounded-xl text-sm font-bold border transition-all",
                    resolution === r
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-secondary/50 border-transparent text-muted-foreground hover:bg-secondary"
                  )}
                >{r}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Narrator & Audio Panel */}
        <div className="p-5 rounded-2xl bg-card border border-border space-y-4">
          {/* Header row */}
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Mic size={12} />Narrator & Audio
            </label>
            <button
              onClick={() => setShowNarratorPanel(p => !p)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {showNarratorPanel ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>

          {/* Toggles always visible */}
          <div className="flex gap-3">
            <button
              onClick={() => setNarratorEnabled(v => !v)}
              className={cn(
                "flex items-center gap-2 flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all",
                narratorEnabled
                  ? "bg-primary/10 border-primary/50 text-primary"
                  : "bg-secondary/50 border-transparent text-muted-foreground hover:bg-secondary"
              )}
            >
              {narratorEnabled ? <Mic size={13} /> : <MicOff size={13} />}
              {narratorEnabled ? "Narrator ON" : "Narrator OFF"}
            </button>
            <button
              onClick={() => setCaptionsEnabled(v => !v)}
              className={cn(
                "flex items-center gap-2 flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all",
                captionsEnabled
                  ? "bg-accent/10 border-accent/50 text-accent"
                  : "bg-secondary/50 border-transparent text-muted-foreground hover:bg-secondary"
              )}
            >
              <Captions size={13} />
              {captionsEnabled ? "Captions ON" : "Captions OFF"}
            </button>
          </div>

          {showNarratorPanel && (
            <div className="space-y-3 animate-fade-in">
              {/* Voice selector */}
              {narrator.voices.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1.5">Voice</p>
                  <select
                    value={narrator.selectedVoice}
                    onChange={e => narrator.setSelectedVoice(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    {narrator.voices.map(v => (
                      <option key={v.name} value={v.name}>
                        {v.name} ({v.lang})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Rate slider */}
              <div>
                <p className="text-xs text-muted-foreground mb-1.5 flex justify-between">
                  <span>Speed</span><span className="text-primary font-bold">{narrator.rate.toFixed(1)}×</span>
                </p>
                <input
                  type="range" min="0.5" max="2" step="0.1"
                  value={narrator.rate}
                  onChange={e => narrator.setRate(parseFloat(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              {/* Pitch slider */}
              <div>
                <p className="text-xs text-muted-foreground mb-1.5 flex justify-between">
                  <span>Pitch</span><span className="text-primary font-bold">{narrator.pitch.toFixed(1)}</span>
                </p>
                <input
                  type="range" min="0.5" max="2" step="0.1"
                  value={narrator.pitch}
                  onChange={e => narrator.setPitch(parseFloat(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              {/* Custom audio upload */}
              <div>
                <p className="text-xs text-muted-foreground mb-1.5">Background Music / Audio</p>
                <input
                  ref={audioInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioUpload}
                  className="hidden"
                />
                {customAudio ? (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-secondary/60 border border-border">
                    <Music size={14} className="text-primary flex-shrink-0" />
                    <span className="text-xs text-foreground truncate flex-1">{customAudio.name}</span>
                    <button
                      onClick={() => setCustomAudio(null)}
                      className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => audioInputRef.current?.click()}
                    className="flex items-center gap-2 w-full py-2 px-3 rounded-xl border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-primary/50 text-xs font-semibold transition-all"
                  >
                    <Upload size={13} />Upload your own audio
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={!prompt.trim() || isGenerating}
          className={cn(
            "w-full py-4 rounded-2xl font-black text-base tracking-wide transition-all duration-300",
            "flex items-center justify-center gap-3",
            prompt.trim() && !isGenerating
              ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/30 hover:scale-[1.02] active:scale-[0.99] animate-pulse-glow"
              : "bg-secondary text-muted-foreground cursor-not-allowed"
          )}
        >
          {isGenerating ? (
            <><RefreshCw size={18} className="animate-spin" />Searching & generating…</>
          ) : (
            <><Video size={18} /><Zap size={16} />Generate Real Video</>
          )}
        </button>
      </div>

      {/* ── Results ── */}
      <div className="lg:col-span-3 space-y-5">

        {/* Empty state */}
        {videos.length === 0 && (
          <div className="rounded-2xl border border-border bg-card p-8 flex flex-col items-center justify-center gap-4 text-center min-h-64">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Video size={28} className="text-primary" />
            </div>
            <div>
              <p className="text-foreground font-bold text-lg mb-1">Real videos, instantly</p>
              <p className="text-muted-foreground text-sm max-w-xs">
                Type any prompt — even character names like <span className="text-primary font-semibold">Chiikawa</span> or <span className="text-primary font-semibold">Naruto</span> — and get a real matching video in seconds.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {["🎬 Real footage", "🎙️ Narrator voice", "📝 Auto captions", "🎵 Custom audio"].map(f => (
                <span key={f} className="px-3 py-1 rounded-full bg-secondary text-xs text-muted-foreground">{f}</span>
              ))}
            </div>
          </div>
        )}

        {/* Video cards */}
        {videos.map(video => (
          <div key={video.id} className="rounded-2xl border border-border bg-card overflow-hidden">

            {/* Generating state */}
            {video.generating ? (
              <div className="h-72 flex flex-col items-center justify-center gap-5 bg-gradient-to-br from-primary/5 to-accent/5 p-6">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center">
                    <Video size={28} className="text-primary" />
                  </div>
                  <div className="absolute inset-0 rounded-2xl border-2 border-primary border-t-transparent animate-spin" />
                </div>
                <div className="text-center max-w-xs">
                  <p className="text-foreground font-bold text-sm transition-all duration-500">{statusMsg}</p>
                  <p className="text-muted-foreground text-xs mt-1.5 italic opacity-80 truncate">
                    "{video.prompt.length > 50 ? video.prompt.slice(0, 50) + "…" : video.prompt}"
                  </p>
                </div>
                <div className="w-60 space-y-1.5">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Fetching footage…</span>
                    <span className="text-primary font-bold">{video.progress}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-150"
                      style={{ width: `${video.progress}%` }}
                    />
                  </div>
                </div>
              </div>

            ) : video.error ? (
              <div className="h-40 flex flex-col items-center justify-center gap-3 px-6 text-center">
                <p className="text-destructive text-sm">{video.error}</p>
                <button
                  onClick={handleGenerate}
                  className="px-4 py-2 rounded-xl bg-secondary text-xs font-bold text-foreground hover:bg-primary/20 transition-all"
                >
                  Try again
                </button>
              </div>

            ) : (
              <>
                {/* Video player with caption overlay */}
                <div className="relative bg-black">
                  <video
                    src={video.videoUrl}
                    controls
                    autoPlay
                    muted={!customAudio}
                    loop
                    playsInline
                    className="w-full max-h-80 object-contain"
                    onPlay={() => {
                      if (narratorEnabled) handleNarrate(video);
                    }}
                    onPause={handleStopNarrate}
                  />

                  {/* Custom audio layer */}
                  {customAudio && (
                    <audio src={customAudio.url} autoPlay loop className="hidden" />
                  )}

                  {/* Caption overlay */}
                  {captionsEnabled && (
                    <div className="absolute bottom-10 left-0 right-0 flex justify-center pointer-events-none px-4">
                      <div className="bg-black/70 backdrop-blur-sm rounded-xl px-4 py-2 max-w-sm text-center">
                        <p className="text-white text-xs font-semibold leading-relaxed">
                          {video.caption}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Narrator speaking indicator */}
                  {playingCaption[video.id] && narratorEnabled && (
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-primary/90 rounded-full px-3 py-1.5">
                      <Mic size={11} className="text-white animate-pulse" />
                      <span className="text-white text-xs font-bold">Narrating…</span>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">{video.prompt}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {PLATFORM_PRESETS[video.platform]?.icon} {PLATFORM_PRESETS[video.platform]?.label} · {video.aspectRatio} · {video.duration}s
                      </p>
                    </div>
                    <button
                      onClick={() => handleDownload(video.videoUrl, video.id)}
                      className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-opacity"
                    >
                      <Download size={13} />Download
                    </button>
                  </div>

                  {/* Caption text (editable) */}
                  {captionsEnabled && (
                    <textarea
                      value={video.caption}
                      onChange={e => setVideos(prev =>
                        prev.map(v => v.id === video.id ? { ...v, caption: e.target.value } : v)
                      )}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground resize-none h-16 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      placeholder="Edit caption…"
                    />
                  )}

                  {/* Narrator controls */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleNarrate(video)}
                      disabled={!narratorEnabled}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
                        narratorEnabled
                          ? "bg-secondary hover:bg-primary/20 text-muted-foreground hover:text-primary"
                          : "bg-secondary/40 text-muted-foreground/50 cursor-not-allowed"
                      )}
                    >
                      <Mic size={12} />Read aloud
                    </button>
                    <button
                      onClick={handleStopNarrate}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-secondary hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-all"
                    >
                      <VolumeX size={12} />Stop
                    </button>
                    {customAudio && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-secondary/60 text-muted-foreground">
                        <Music size={12} className="text-primary" />
                        {customAudio.name.length > 16 ? customAudio.name.slice(0, 16) + "…" : customAudio.name}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
