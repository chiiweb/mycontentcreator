import { cn } from "@/lib/utils";
import { PLATFORMS, type Platform } from "@/data/contentTemplates";

interface PlatformBadgeProps {
  platform: Platform;
  size?: "sm" | "md" | "lg";
  selected?: boolean;
  onClick?: () => void;
}

export function PlatformBadge({ platform, size = "md", selected, onClick }: PlatformBadgeProps) {
  const p = PLATFORMS[platform];
  const gradients: Record<Platform, string> = {
    instagram: "from-orange-400 via-pink-500 to-purple-600",
    twitter: "from-sky-400 to-blue-600",
    linkedin: "from-blue-600 to-blue-800",
    facebook: "from-blue-500 to-blue-700",
    tiktok: "from-pink-500 via-red-500 to-cyan-400",
    youtube: "from-red-500 to-red-700",
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative rounded-xl font-semibold transition-all duration-300 overflow-hidden group",
        size === "sm" && "px-3 py-1.5 text-xs",
        size === "md" && "px-4 py-2.5 text-sm",
        size === "lg" && "px-5 py-3 text-base",
        selected
          ? "ring-2 ring-offset-2 ring-offset-background scale-105 shadow-lg"
          : "opacity-70 hover:opacity-100 hover:scale-105",
        onClick ? "cursor-pointer" : "cursor-default"
      )}
      style={selected ? { outlineColor: p.color } : {}}
    >
      <span className={cn("absolute inset-0 bg-gradient-to-br", gradients[platform], !selected && "opacity-70")} />
      <span className="relative z-10 flex items-center gap-1.5 text-white font-bold">
        <span>{p.icon}</span>
        <span>{p.name}</span>
      </span>
    </button>
  );
}
