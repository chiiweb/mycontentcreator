import { useState } from "react";
import { Copy, Check, Download, Calendar, Clock, Share2, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { PLATFORMS, TONES, type GeneratedContent } from "@/data/contentTemplates";
import { PlatformBadge } from "./PlatformBadge";

interface ContentCardProps {
  content: GeneratedContent;
  onAddToCalendar?: (content: GeneratedContent) => void;
  animationDelay?: number;
}

export function ContentCard({ content, onAddToCalendar, animationDelay = 0 }: ContentCardProps) {
  const [copied, setCopied] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(true);
  const [showTips, setShowTips] = useState(false);

  const platform = PLATFORMS[content.platform];
  const tone = TONES[content.tone];
  const isOverLimit = content.characterCount > platform.maxChars;

  const handleCopy = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(section);
      setCopied(true);
      setTimeout(() => { setCopied(false); setCopiedSection(null); }, 2000);
    } catch {
      // Fallback
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopiedSection(section);
      setCopied(true);
      setTimeout(() => { setCopied(false); setCopiedSection(null); }, 2000);
    }
  };

  const handleCopyAll = () => {
    const fullContent = `${content.caption}\n\n${content.hashtags.join(" ")}`;
    handleCopy(fullContent, "all");
  };

  const gradients: Record<string, string> = {
    instagram: "from-orange-500/10 via-pink-500/10 to-purple-500/10",
    twitter: "from-sky-500/10 to-blue-500/10",
    linkedin: "from-blue-600/10 to-blue-800/10",
    facebook: "from-blue-500/10 to-indigo-500/10",
    tiktok: "from-pink-500/10 via-red-500/10 to-cyan-500/10",
    youtube: "from-red-500/10 to-red-700/10",
  };

  const borderGradients: Record<string, string> = {
    instagram: "from-orange-400 via-pink-500 to-purple-600",
    twitter: "from-sky-400 to-blue-500",
    linkedin: "from-blue-500 to-blue-700",
    facebook: "from-blue-400 to-indigo-500",
    tiktok: "from-pink-500 to-cyan-400",
    youtube: "from-red-400 to-red-600",
  };

  return (
    <div
      className="relative rounded-2xl overflow-hidden card-glow animate-fade-in"
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      {/* Gradient border */}
      <div className={cn("absolute inset-0 rounded-2xl p-[1px] bg-gradient-to-br", borderGradients[content.platform])}>
        <div className={cn("h-full w-full rounded-2xl bg-gradient-to-br", gradients[content.platform], "bg-card")} />
      </div>

      <div className="relative z-10 p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <PlatformBadge platform={content.platform} size="sm" />
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary text-muted-foreground text-xs font-medium">
              {tone.icon} {tone.name}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-secondary text-muted-foreground text-xs font-medium capitalize">
              {content.contentType.replace("_", " ")}
            </span>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground"
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {/* Topic */}
        <div className="mb-3 flex items-center gap-2">
          <Sparkles size={14} className="text-primary flex-shrink-0" />
          <span className="text-sm text-muted-foreground">Topic:</span>
          <span className="text-sm font-semibold text-foreground truncate">{content.topic}</span>
        </div>

        {expanded && (
          <>
            {/* Caption */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Caption</span>
                <button
                  onClick={() => handleCopy(content.caption, "caption")}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-secondary hover:bg-primary/20 transition-colors text-xs text-muted-foreground hover:text-primary"
                >
                  {copiedSection === "caption" ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                  {copiedSection === "caption" ? "Copied!" : "Copy"}
                </button>
              </div>
              <div className="relative">
                <div className="p-3.5 rounded-xl bg-background/60 border border-border text-sm leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto text-foreground/90">
                  {content.caption}
                </div>
                <div className={cn(
                  "absolute bottom-2 right-2 text-xs px-2 py-0.5 rounded-full font-mono",
                  isOverLimit ? "bg-destructive/20 text-destructive" : "bg-secondary text-muted-foreground"
                )}>
                  {content.characterCount}/{platform.maxChars}
                </div>
              </div>
            </div>

            {/* Hashtags */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Hashtags</span>
                <button
                  onClick={() => handleCopy(content.hashtags.join(" "), "hashtags")}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-secondary hover:bg-primary/20 transition-colors text-xs text-muted-foreground hover:text-primary"
                >
                  {copiedSection === "hashtags" ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                  {copiedSection === "hashtags" ? "Copied!" : "Copy"}
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {content.hashtags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-all hover:scale-105"
                    style={{
                      background: `${platform.color}20`,
                      color: platform.color,
                      border: `1px solid ${platform.color}40`,
                    }}
                    onClick={() => handleCopy(tag, `tag_${i}`)}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="mb-4 p-3 rounded-xl bg-primary/5 border border-primary/20">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">Call to Action</span>
              </div>
              <p className="text-sm text-foreground/80">{content.callToAction}</p>
            </div>

            {/* Tips */}
            <button
              onClick={() => setShowTips(!showTips)}
              className="w-full text-left text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 mb-2"
            >
              <Sparkles size={12} />
              {showTips ? "Hide" : "Show"} optimization tips
            </button>

            {showTips && (
              <div className="mb-4 space-y-2">
                {content.tips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground p-2.5 rounded-lg bg-accent/5 border border-accent/20">
                    <span className="text-accent mt-0.5">💡</span>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-3 pt-3 border-t border-border/50">
          <button
            onClick={handleCopyAll}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-secondary hover:bg-primary/20 transition-all text-sm font-medium text-foreground hover:text-primary group"
          >
            {copied && copiedSection === "all" ? (
              <><Check size={14} className="text-green-400" /> Copied!</>
            ) : (
              <><Copy size={14} className="group-hover:scale-110 transition-transform" /> Copy All</>
            )}
          </button>
          {onAddToCalendar && (
            <button
              onClick={() => onAddToCalendar(content)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-primary/20 to-accent/20 hover:from-primary/30 hover:to-accent/30 transition-all text-sm font-medium text-primary group border border-primary/30"
            >
              <Calendar size={14} className="group-hover:scale-110 transition-transform" />
              Schedule
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
