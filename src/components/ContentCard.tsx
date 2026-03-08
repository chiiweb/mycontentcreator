import { useState } from "react";
import { Copy, Check, Calendar, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
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

  const borderGradientMap: Record<string, string> = {
    instagram: "linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)",
    twitter: "linear-gradient(135deg, #1d9bf0, #0f6cbd)",
    linkedin: "linear-gradient(135deg, #0077b5, #005582)",
    facebook: "linear-gradient(135deg, #1877f2, #0c5dcf)",
    tiktok: "linear-gradient(135deg, #fe2c55, #25f4ee)",
    youtube: "linear-gradient(135deg, #ff0000, #cc0000)",
  };

  const handleCopy = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopiedSection(section);
    setCopied(true);
    setTimeout(() => { setCopied(false); setCopiedSection(null); }, 2000);
  };

  const handleCopyAll = () => {
    handleCopy(`${content.caption}\n\n${content.hashtags.join(" ")}`, "all");
  };

  return (
    <div
      className="relative rounded-2xl card-glow animate-fade-in"
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      {/* Gradient border */}
      <div
        className="absolute inset-0 rounded-2xl p-[1px]"
        style={{ background: borderGradientMap[content.platform] }}
      >
        <div className="h-full w-full rounded-2xl bg-card" />
      </div>

      <div className="relative z-10 p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 flex-wrap">
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
            className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground ml-2"
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
                  <button
                    key={i}
                    className="px-2.5 py-1 rounded-full text-xs font-medium transition-all hover:scale-105 bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20"
                    onClick={() => handleCopy(tag, `tag_${i}`)}
                  >
                    {copiedSection === `tag_${i}` ? "✓ " : ""}{tag}
                  </button>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="mb-4 p-3 rounded-xl bg-primary/5 border border-primary/20">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider block mb-1">Call to Action</span>
              <p className="text-sm text-foreground/80">{content.callToAction}</p>
            </div>

            {/* Tips toggle */}
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
