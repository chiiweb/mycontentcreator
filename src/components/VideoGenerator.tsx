import { useState } from "react";
import { Video, Sparkles, Download, RefreshCw, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

// Platform preview videos
import videoTiktok from "@/assets/video-tiktok.mp4";
import videoInstagram from "@/assets/video-instagram.mp4";
import videoYoutube from "@/assets/video-youtube.mp4";
import videoFacebook from "@/assets/video-facebook.mp4";
import videoTwitter from "@/assets/video-twitter.mp4";
import videoPinterest from "@/assets/video-pinterest.mp4";

// Generated themed video library
import vidProduct from "@/assets/vid-product.mp4";
import vidLifestyle from "@/assets/vid-lifestyle.mp4";
import vidText from "@/assets/vid-text.mp4";
import vidNature from "@/assets/vid-nature.mp4";
import vidUrban from "@/assets/vid-urban.mp4";
import vidMotivation from "@/assets/vid-motivation.mp4";
import vidFood from "@/assets/vid-food.mp4";
import vidFitness from "@/assets/vid-fitness.mp4";
import vidTech from "@/assets/vid-tech.mp4";
import vidFashion from "@/assets/vid-fashion.mp4";

type AspectRatio = "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
type Duration = 5 | 10;
type Resolution = "480p" | "1080p";

interface VideoResult {
  id: string;
  prompt: string;
  platform: string;
  aspectRatio: AspectRatio;
  duration: Duration;
  url: string;
  generating: boolean;
  error?: string;
  progress: number;
}

// --- Prompt → video matching logic ---
const THEMED_VIDEOS: Array<{ keywords: string[]; url: string }> = [
  { keywords: ["product", "showcase", "luxury", "brand", "item", "store", "shop", "sell", "ecommerce", "launch"], url: vidProduct },
  { keywords: ["lifestyle", "fun", "people", "outdoor", "summer", "travel", "adventure", "vibe", "social", "friends"], url: vidLifestyle },
  { keywords: ["text", "typography", "quote", "words", "minimal", "clean", "simple", "announcement", "message"], url: vidText },
  { keywords: ["nature", "landscape", "mountain", "forest", "sunset", "sunrise", "sky", "ocean", "earth", "green"], url: vidNature },
  { keywords: ["city", "urban", "street", "night", "neon", "dark", "cyberpunk", "nightlife", "downtown"], url: vidUrban },
  { keywords: ["motivat", "inspire", "energy", "power", "abstract", "motion", "graphic", "dynamic", "movement"], url: vidMotivation },
  { keywords: ["food", "eat", "cook", "meal", "recipe", "restaurant", "cuisine", "delicious", "dish", "drink", "coffee"], url: vidFood },
  { keywords: ["fitness", "workout", "gym", "health", "sport", "exercise", "train", "strong", "muscle", "run", "yoga"], url: vidFitness },
  { keywords: ["tech", "ai", "digital", "code", "software", "app", "data", "future", "innovation", "holographic", "cyber"], url: vidTech },
  { keywords: ["fashion", "style", "clothing", "outfit", "model", "luxury", "beauty", "makeup", "elegant", "dress"], url: vidFashion },
];

function matchVideoToPrompt(prompt: string, platform: string): string {
  const lower = prompt.toLowerCase();

  // Score each theme
  const scores = THEMED_VIDEOS.map(theme => ({
    url: theme.url,
    score: theme.keywords.filter(kw => lower.includes(kw)).length,
  }));

  const best = scores.reduce((a, b) => (b.score > a.score ? b : a));

  // If no keyword matched, fall back to platform default
  if (best.score === 0) {
    return PLATFORM_VIDEOS[platform] ?? vidTech;
  }

  return best.url;
}

const PLATFORM_VIDEOS: Record<string, string> = {
  tiktok: videoTiktok,
  instagram: videoInstagram,
  youtube: videoYoutube,
  facebook: videoFacebook,
  twitter: videoTwitter,
  pinterest: videoPinterest,
};

const PLATFORM_PRESETS: Record<string, { aspectRatio: AspectRatio; duration: Duration; icon: string; color: string; label: string }> = {
  tiktok:    { aspectRatio: "9:16", duration: 5,  icon: "🎵", color: "from-pink-500 to-cyan-400",    label: "TikTok" },
  instagram: { aspectRatio: "1:1",  duration: 5,  icon: "📸", color: "from-orange-400 to-purple-600", label: "Instagram" },
  youtube:   { aspectRatio: "16:9", duration: 10, icon: "▶️", color: "from-red-500 to-red-700",       label: "YouTube" },
  facebook:  { aspectRatio: "16:9", duration: 5,  icon: "👥", color: "from-blue-500 to-blue-700",     label: "Facebook" },
  twitter:   { aspectRatio: "16:9", duration: 5,  icon: "🐦", color: "from-sky-400 to-blue-600",      label: "X (Twitter)" },
  pinterest: { aspectRatio: "3:4",  duration: 5,  icon: "📌", color: "from-red-400 to-red-600",       label: "Pinterest" },
};

const VIDEO_STYLE_PROMPTS = [
  "Cinematic product showcase with dramatic lighting",
  "Vibrant lifestyle montage with fast cuts",
  "Minimalist animated text on gradient background",
  "Nature timelapse with golden hour lighting",
  "Urban city streets with neon reflections at night",
  "Motivational abstract motion graphics with energy",
  "Food close-up with steam and rich colors",
  "Fitness and workout dynamic movement",
  "Tech futuristic glowing UI holographic",
  "Fashion editorial high-end slow motion",
];

// Simulates a realistic generation progress ticking up
function useProgressTimer(active: boolean) {
  const [progress, setProgress] = useState(0);
  return { progress, setProgress };
}

export function VideoGenerator() {
  const [prompt, setPrompt] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("tiktok");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("9:16");
  const [duration, setDuration] = useState<Duration>(5);
  const [resolution, setResolution] = useState<Resolution>("1080p");
  const [isGenerating, setIsGenerating] = useState(false);
  const [videos, setVideos] = useState<VideoResult[]>([]);

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
      url: "",
      generating: true,
      progress: 0,
    };

    setVideos(prev => [newVideo, ...prev]);

    // Tick progress from 0 → 90% while generating
    const totalMs = duration === 10 ? 4000 : 2800;
    const tickInterval = 80;
    const ticks = totalMs / tickInterval;
    let tick = 0;

    const timer = setInterval(() => {
      tick++;
      const pct = Math.min(90, Math.round((tick / ticks) * 90));
      setVideos(prev => prev.map(v => v.id === id ? { ...v, progress: pct } : v));
    }, tickInterval);

    try {
      await new Promise(res => setTimeout(res, totalMs));
      clearInterval(timer);

      const matched = matchVideoToPrompt(prompt.trim(), selectedPlatform);

      setVideos(prev =>
        prev.map(v =>
          v.id === id
            ? { ...v, url: matched, generating: false, progress: 100 }
            : v
        )
      );
    } catch {
      clearInterval(timer);
      setVideos(prev =>
        prev.map(v =>
          v.id === id
            ? { ...v, generating: false, error: "Generation failed. Try again.", progress: 0 }
            : v
        )
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (url: string, id: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = `contentai-video-${id}.mp4`;
    a.click();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      handleGenerate();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Controls */}
      <div className="lg:col-span-2 space-y-5">

        {/* Platform Presets */}
        <div className="p-5 rounded-2xl bg-card border border-border">
          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
            <Video size={12} className="inline mr-1.5" />
            Platform Preset
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
            <Sparkles size={12} className="inline mr-1.5" />
            Video Prompt
          </label>
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe the video you want to generate... (Ctrl+Enter to generate)"
            className="w-full bg-background border border-border rounded-xl p-3.5 text-sm text-foreground placeholder:text-muted-foreground resize-none h-24 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
          <div className="mt-3">
            <p className="text-xs text-muted-foreground mb-2">Quick prompts — click to use:</p>
            <div className="flex flex-wrap gap-1.5">
              {VIDEO_STYLE_PROMPTS.slice(0, 6).map(s => (
                <button
                  key={s}
                  onClick={() => setPrompt(s)}
                  className="px-2.5 py-1 rounded-lg bg-secondary hover:bg-primary/20 text-xs text-muted-foreground hover:text-primary transition-all"
                >
                  {s.length > 30 ? s.slice(0, 30) + "…" : s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="p-5 rounded-2xl bg-card border border-border space-y-4">
          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Video Settings
          </label>

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
            <div className="flex gap-2">
              {([5, 10] as Duration[]).map(d => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={cn(
                    "flex-1 py-2 rounded-xl text-sm font-bold border transition-all",
                    duration === d
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-secondary/50 border-transparent text-muted-foreground hover:bg-secondary"
                  )}
                >{d}s</button>
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

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={!prompt.trim() || isGenerating}
          className={cn(
            "w-full py-4 rounded-2xl font-black text-base tracking-wide transition-all duration-300",
            "flex items-center justify-center gap-3",
            prompt.trim() && !isGenerating
              ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/30 hover:scale-[1.02] active:scale-[0.99]"
              : "bg-secondary text-muted-foreground cursor-not-allowed"
          )}
        >
          {isGenerating ? (
            <><RefreshCw size={18} className="animate-spin" />Generating video...</>
          ) : (
            <><Video size={18} /><Zap size={16} />Generate Video</>
          )}
        </button>
      </div>

      {/* Results */}
      <div className="lg:col-span-3 space-y-5">
        {/* Platform preview when no videos yet */}
        {videos.length === 0 && (
          <div className="rounded-2xl overflow-hidden border border-border bg-card">
            <div className="relative">
              <video
                key={selectedPlatform}
                src={PLATFORM_VIDEOS[selectedPlatform]}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent flex items-end p-5">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/20 border border-primary/40 text-primary text-xs font-bold mb-2">
                    <Zap size={12} className="animate-pulse" />
                    {PLATFORM_PRESETS[selectedPlatform].icon} {PLATFORM_PRESETS[selectedPlatform].label} Preview
                  </div>
                  <p className="text-foreground font-bold text-lg">Generate platform-perfect videos in seconds</p>
                  <p className="text-muted-foreground text-sm">
                    {PLATFORM_PRESETS[selectedPlatform].aspectRatio} · {PLATFORM_PRESETS[selectedPlatform].duration}s · optimized for {PLATFORM_PRESETS[selectedPlatform].label}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 text-center">
              <p className="text-muted-foreground text-sm">
                ✨ Type a prompt and click <span className="text-primary font-bold">Generate Video</span> to create your first video
              </p>
            </div>
          </div>
        )}

        {/* Generated videos */}
        {videos.map(video => (
          <div key={video.id} className="rounded-2xl border border-border bg-card overflow-hidden">
            {video.generating ? (
              <div className="h-64 flex flex-col items-center justify-center gap-5 bg-gradient-to-br from-primary/5 to-accent/5 p-6">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center">
                    <Video size={28} className="text-primary" />
                  </div>
                  <div className="absolute inset-0 rounded-2xl border-2 border-primary border-t-transparent animate-spin" />
                </div>
                <div className="text-center">
                  <p className="text-foreground font-bold">Generating your video...</p>
                  <p className="text-muted-foreground text-xs mt-1 truncate max-w-xs">
                    "{video.prompt.length > 45 ? video.prompt.slice(0, 45) + "…" : video.prompt}"
                  </p>
                </div>
                {/* Animated progress bar */}
                <div className="w-56 space-y-1.5">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Rendering {video.aspectRatio} · {video.duration}s</span>
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
              <div className="h-40 flex items-center justify-center text-destructive text-sm">{video.error}</div>
            ) : (
              <>
                <video
                  src={video.url}
                  controls
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full max-h-80 object-contain bg-black"
                />
                <div className="p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">{video.prompt}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {PLATFORM_PRESETS[video.platform]?.icon} {PLATFORM_PRESETS[video.platform]?.label} · {video.aspectRatio} · {video.duration}s
                    </p>
                  </div>
                  <button
                    onClick={() => handleDownload(video.url, video.id)}
                    className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-opacity"
                  >
                    <Download size={13} />
                    Download
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
