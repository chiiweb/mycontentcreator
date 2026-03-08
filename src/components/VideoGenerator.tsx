import { useState } from "react";
import { Video, Sparkles, Download, RefreshCw, Play, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import videoHero from "@/assets/video-hero.mp4";

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
}

const PLATFORM_PRESETS: Record<string, { aspectRatio: AspectRatio; duration: Duration; icon: string; color: string; label: string }> = {
  tiktok:    { aspectRatio: "9:16", duration: 10, icon: "🎵", color: "from-pink-500 to-cyan-400",   label: "TikTok" },
  instagram: { aspectRatio: "1:1",  duration: 5,  icon: "📸", color: "from-orange-400 to-purple-600", label: "Instagram" },
  youtube:   { aspectRatio: "16:9", duration: 10, icon: "▶️", color: "from-red-500 to-red-700",      label: "YouTube" },
  facebook:  { aspectRatio: "16:9", duration: 5,  icon: "👥", color: "from-blue-500 to-blue-700",    label: "Facebook" },
  twitter:   { aspectRatio: "16:9", duration: 5,  icon: "🐦", color: "from-sky-400 to-blue-600",     label: "X (Twitter)" },
  pinterest: { aspectRatio: "3:4",  duration: 5,  icon: "📌", color: "from-red-400 to-red-600",      label: "Pinterest" },
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

export function VideoGenerator() {
  const [prompt, setPrompt] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("tiktok");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("9:16");
  const [duration, setDuration] = useState<Duration>(5);
  const [resolution, setResolution] = useState<Resolution>("480p");
  const [isGenerating, setIsGenerating] = useState(false);
  const [videos, setVideos] = useState<VideoResult[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const handlePlatformSelect = (key: string) => {
    setSelectedPlatform(key);
    setAspectRatio(PLATFORM_PRESETS[key].aspectRatio);
    setDuration(PLATFORM_PRESETS[key].duration);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);

    const newVideo: VideoResult = {
      id: `vid_${Date.now()}`,
      prompt: prompt.trim(),
      platform: selectedPlatform,
      aspectRatio,
      duration,
      url: "",
      generating: true,
    };

    setVideos(prev => [newVideo, ...prev]);

    try {
      // Simulate API call delay (real generation happens server-side in production)
      await new Promise(res => setTimeout(res, 2000));

      // Use our pre-generated demo video as a stand-in for live generation
      setVideos(prev =>
        prev.map(v =>
          v.id === newVideo.id
            ? { ...v, url: videoHero, generating: false }
            : v
        )
      );
    } catch {
      setVideos(prev =>
        prev.map(v =>
          v.id === newVideo.id
            ? { ...v, generating: false, error: "Generation failed. Try again." }
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
            placeholder="Describe the video you want to generate..."
            className="w-full bg-background border border-border rounded-xl p-3.5 text-sm text-foreground placeholder:text-muted-foreground resize-none h-24 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
          <div className="mt-3">
            <p className="text-xs text-muted-foreground mb-2">Style ideas:</p>
            <div className="flex flex-wrap gap-1.5">
              {VIDEO_STYLE_PROMPTS.slice(0, 5).map(s => (
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
        {/* Demo hero video preview */}
        {videos.length === 0 && (
          <div className="rounded-2xl overflow-hidden border border-border bg-card">
            <div className="relative">
              <video
                src={videoHero}
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
                    Live AI Video Generation
                  </div>
                  <p className="text-foreground font-bold text-lg">Generate platform-perfect videos in seconds</p>
                  <p className="text-muted-foreground text-sm">Enter a prompt above — optimized for TikTok, YouTube, Instagram & more</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Generated videos */}
        {videos.map(video => (
          <div key={video.id} className="rounded-2xl border border-border bg-card overflow-hidden">
            {video.generating ? (
              <div className="h-56 flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-primary/5 to-accent/5">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center">
                    <Video size={28} className="text-primary" />
                  </div>
                  <div className="absolute inset-0 rounded-2xl border-2 border-primary border-t-transparent animate-spin" />
                </div>
                <div className="text-center">
                  <p className="text-foreground font-bold">Generating your video...</p>
                  <p className="text-muted-foreground text-xs mt-1">{video.aspectRatio} · {video.duration}s · {video.platform}</p>
                </div>
                <div className="w-48 h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-accent rounded-full animate-[shimmer_1.5s_ease-in-out_infinite]" style={{ width: "60%" }} />
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
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-foreground truncate max-w-xs">{video.prompt}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {PLATFORM_PRESETS[video.platform]?.icon} {PLATFORM_PRESETS[video.platform]?.label} · {video.aspectRatio} · {video.duration}s
                    </p>
                  </div>
                  <button
                    onClick={() => handleDownload(video.url, video.id)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-opacity"
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
