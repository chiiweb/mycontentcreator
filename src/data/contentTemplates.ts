export type Platform = "instagram" | "twitter" | "linkedin" | "facebook" | "tiktok" | "youtube";
export type Tone = "professional" | "casual" | "humorous" | "inspirational" | "educational" | "promotional";
export type ContentType = "post" | "story" | "reel" | "thread" | "carousel" | "video_script";

export interface GeneratedContent {
  id: string;
  platform: Platform;
  contentType: ContentType;
  tone: Tone;
  topic: string;
  caption: string;
  hashtags: string[];
  callToAction: string;
  characterCount: number;
  scheduledDate?: string;
  scheduledTime?: string;
  emoji: string[];
  tips: string[];
}

export interface CalendarEntry extends GeneratedContent {
  date: string;
  time: string;
  status: "scheduled" | "draft" | "posted";
}

export const PLATFORMS: Record<Platform, { name: string; icon: string; color: string; maxChars: number; gradient: string }> = {
  instagram: {
    name: "Instagram",
    icon: "📸",
    color: "#E1306C",
    maxChars: 2200,
    gradient: "from-orange-400 via-pink-500 to-purple-600",
  },
  twitter: {
    name: "X (Twitter)",
    icon: "🐦",
    color: "#1d9bf0",
    maxChars: 280,
    gradient: "from-sky-400 to-blue-600",
  },
  linkedin: {
    name: "LinkedIn",
    icon: "💼",
    color: "#0077b5",
    maxChars: 3000,
    gradient: "from-blue-600 to-blue-800",
  },
  facebook: {
    name: "Facebook",
    icon: "👥",
    color: "#1877f2",
    maxChars: 63206,
    gradient: "from-blue-500 to-blue-700",
  },
  tiktok: {
    name: "TikTok",
    icon: "🎵",
    color: "#fe2c55",
    maxChars: 2200,
    gradient: "from-pink-500 via-red-500 to-cyan-400",
  },
  youtube: {
    name: "YouTube",
    icon: "▶️",
    color: "#ff0000",
    maxChars: 5000,
    gradient: "from-red-500 to-red-700",
  },
};

export const TONES: Record<Tone, { name: string; icon: string; description: string }> = {
  professional: { name: "Professional", icon: "💎", description: "Authoritative & credible" },
  casual: { name: "Casual", icon: "😊", description: "Friendly & approachable" },
  humorous: { name: "Humorous", icon: "😂", description: "Witty & entertaining" },
  inspirational: { name: "Inspirational", icon: "🚀", description: "Motivating & uplifting" },
  educational: { name: "Educational", icon: "📚", description: "Informative & insightful" },
  promotional: { name: "Promotional", icon: "🔥", description: "Sales-driven & persuasive" },
};

export const CONTENT_TYPES: Record<Platform, ContentType[]> = {
  instagram: ["post", "story", "reel", "carousel"],
  twitter: ["post", "thread"],
  linkedin: ["post", "carousel"],
  facebook: ["post", "story"],
  tiktok: ["video_script", "post"],
  youtube: ["video_script", "post"],
};

const HOOK_STARTERS = {
  professional: [
    "Industry data reveals that",
    "Leading experts agree that",
    "The future of {industry} depends on",
    "3 evidence-based strategies to",
    "What separates top performers from the rest:",
  ],
  casual: [
    "Okay so I've been thinking about",
    "Hot take: {topic} actually matters way more than",
    "Nobody talks about this enough but",
    "Real talk — if you want to",
    "Quick story that changed how I think about",
  ],
  humorous: [
    "POV: You just discovered that",
    "Me explaining {topic} at 3am:",
    "The algorithm when you post about {topic}:",
    "Tell me you know {topic} without telling me you know {topic}",
    "Nobody: ... Me at 2am thinking about",
  ],
  inspirational: [
    "Every great achievement starts with the decision to",
    "The moment you realize {topic} is the moment everything changes.",
    "Stop waiting for the perfect moment to",
    "Your future self is counting on you to",
    "One year from now, you'll wish you had started",
  ],
  educational: [
    "Most people don't know that",
    "Here's what they don't teach you about",
    "The science behind {topic} is fascinating:",
    "A complete breakdown of",
    "Everything you need to know about",
  ],
  promotional: [
    "Introducing the solution to your {topic} problems:",
    "Why smart businesses are switching to",
    "Limited time: transform your {topic} with",
    "Join thousands who have already",
    "Don't let {topic} hold you back anymore —",
  ],
};

const BODY_TEMPLATES = {
  instagram: {
    post: [
      `✨ {hook}\n\nHere's what you need to know:\n\n▸ {point1}\n▸ {point2}\n▸ {point3}\n\n{cta}`,
      `🔥 {hook}\n\n{body_paragraph}\n\nThe takeaway? {lesson}\n\n{cta}`,
      `💡 {hook}\n\n1️⃣ {point1}\n2️⃣ {point2}\n3️⃣ {point3}\n4️⃣ {point4}\n\n{cta}`,
    ],
    story: [
      `{hook} 👀\n\nSwipe up to learn more! ➡️`,
      `Quick tip about {topic}: {point1} 💫\n\nSave this for later! 🔖`,
    ],
    reel: [
      `🎬 POV: You finally understand {topic}\n\n{hook}\n\n{body_paragraph}\n\n{cta}`,
    ],
    carousel: [
      `Slide 1: {hook}\nSlide 2: {point1}\nSlide 3: {point2}\nSlide 4: {point3}\nSlide 5: {cta}`,
    ],
  },
  twitter: {
    post: [
      `{hook}\n\nThread 🧵👇`,
      `{hook}\n\n{point1}\n\n{cta}`,
      `Hot take: {hook}\n\n{body_short}`,
    ],
    thread: [
      `1/ {hook}\n\n2/ {point1}\n\n3/ {point2}\n\n4/ {point3}\n\n5/ The bottom line: {lesson}`,
    ],
  },
  linkedin: {
    post: [
      `{hook}\n\nHere's what I've learned:\n\n• {point1}\n• {point2}\n• {point3}\n\n{body_paragraph}\n\nWhat's your take? Drop a comment below. 👇\n\n{cta}`,
      `I've been in {industry} for years, and {hook}\n\nThe thing nobody talks about:\n\n{point1}\n{point2}\n{point3}\n\n{lesson}\n\n{cta}`,
    ],
    carousel: [
      `📊 {hook}\n\nI broke this down into a simple framework:\n\n→ Step 1: {point1}\n→ Step 2: {point2}\n→ Step 3: {point3}\n→ Result: {lesson}\n\n{cta}`,
    ],
  },
  facebook: {
    post: [
      `{hook}\n\n{body_paragraph}\n\nKey takeaways:\n✅ {point1}\n✅ {point2}\n✅ {point3}\n\n{cta}`,
    ],
    story: [
      `{hook}\n\nLearn more in the link below! 👇`,
    ],
  },
  tiktok: {
    video_script: [
      `[HOOK - 0-3s]: {hook}\n\n[BODY - 3-30s]: \n{body_paragraph}\n\n{point1}\n{point2}\n{point3}\n\n[CTA - 30-60s]: {cta}\n\nDon't forget to like and follow! 🎵`,
    ],
    post: [
      `{hook} ✨\n\n{body_paragraph}\n\n{cta}`,
    ],
  },
  youtube: {
    video_script: [
      `[INTRO]: {hook}\n\nIn this video, we're covering:\n• {point1}\n• {point2}\n• {point3}\n\n[MAIN CONTENT]:\n{body_paragraph}\n\n[OUTRO]: {cta}\n\nSubscribe for more content like this! 🔔`,
    ],
    post: [
      `🎬 New video alert!\n\n{hook}\n\n{body_paragraph}\n\n{cta}`,
    ],
  },
};

const HASHTAG_LIBRARY: Record<string, string[]> = {
  business: ["#business", "#entrepreneur", "#startup", "#success", "#mindset", "#leadership", "#marketing", "#growth", "#innovation", "#hustle"],
  tech: ["#technology", "#tech", "#AI", "#innovation", "#coding", "#software", "#digital", "#future", "#startup", "#programming"],
  fitness: ["#fitness", "#health", "#workout", "#gym", "#motivation", "#wellness", "#lifestyle", "#fit", "#training", "#healthylifestyle"],
  food: ["#food", "#foodie", "#recipe", "#cooking", "#delicious", "#homemade", "#foodphotography", "#yummy", "#chef", "#instafood"],
  travel: ["#travel", "#wanderlust", "#adventure", "#explore", "#travelgram", "#vacation", "#tourism", "#instatravel", "#world", "#travelphotography"],
  fashion: ["#fashion", "#style", "#ootd", "#outfit", "#clothing", "#trend", "#fashionista", "#streetstyle", "#designer", "#lookbook"],
  education: ["#education", "#learning", "#knowledge", "#study", "#tips", "#howto", "#tutorial", "#skills", "#growth", "#mindset"],
  marketing: ["#marketing", "#digitalmarketing", "#socialmedia", "#branding", "#contentmarketing", "#seo", "#growthhacking", "#business", "#strategy", "#advertising"],
  default: ["#viral", "#trending", "#content", "#socialmedia", "#digital", "#online", "#share", "#follow", "#like", "#explore"],
};

const POINTS_LIBRARY = [
  "Consistency beats perfection every single time",
  "Your audience wants value, not just content",
  "Engagement rate matters more than follower count",
  "Authentic storytelling builds lasting connections",
  "Data-driven decisions outperform gut feelings by 3x",
  "The best time to start was yesterday; the next best is now",
  "Quality content compounds over time like interest",
  "Understanding your audience is the foundation of everything",
  "Cross-platform presence multiplies your reach exponentially",
  "A/B testing eliminates guesswork from your strategy",
  "Community building drives sustainable organic growth",
  "Your niche is not a limitation — it's your superpower",
  "First impressions determine whether people read your caption",
  "Stories connect faster than facts alone",
  "Visual hierarchy guides the viewer's eye and attention",
  "Every post should have one clear goal and one clear CTA",
  "Repurposing content is the smartest time investment",
  "Collaboration expands your audience exponentially",
  "Emotion drives sharing more than information does",
  "Value first, promotion second — always",
];

const CTAS_BY_TONE: Record<Tone, string[]> = {
  professional: [
    "Connect with us to learn more about how we can help.",
    "Schedule a consultation today — link in bio.",
    "Download our free resource guide at the link below.",
    "Subscribe to our newsletter for weekly industry insights.",
    "Tag a colleague who needs to see this.",
  ],
  casual: [
    "Drop a 🔥 if this resonates with you!",
    "Save this for later — you'll thank yourself! 💾",
    "Share this with your bestie who needs to hear it 👇",
    "Follow for more tips like this every week! ✨",
    "Comment below: what's your experience with this?",
  ],
  humorous: [
    "Follow for more cursed wisdom 😂",
    "You're welcome. Now go do something with this info 😅",
    "Tag someone who definitely needs this intervention 🚨",
    "Like if you've been personally victimized by this 🙋",
    "Save this to send to your group chat later 💀",
  ],
  inspirational: [
    "Start today. Your future self is watching. 🌟",
    "Save this for when you need a reminder of what you're capable of 💪",
    "Share this with someone who needs to hear it right now 🙏",
    "Follow for daily doses of inspiration and motivation ✨",
    "Comment 'YES' if you're ready to make it happen! 🚀",
  ],
  educational: [
    "Save this post for future reference! 📌",
    "Follow for more tips, tricks, and insights like this.",
    "Share with someone who could use this knowledge today.",
    "Drop your questions in the comments — I read them all!",
    "Subscribe for deep-dive tutorials every week.",
  ],
  promotional: [
    "Click the link in bio to get started TODAY — limited spots available! ⚡",
    "DM us 'INFO' to learn how to get access.",
    "Use code VIRAL for 20% off — today only! 🎁",
    "Join 10,000+ people already seeing results. Link below! 👇",
    "Book your free demo now — spots filling up fast! 🔥",
  ],
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickMultiple<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function detectCategory(topic: string): string {
  const lower = topic.toLowerCase();
  if (lower.match(/business|startup|entrepreneur|company|brand|sales|revenue|profit/)) return "business";
  if (lower.match(/tech|software|app|code|ai|digital|data|cyber/)) return "tech";
  if (lower.match(/fitness|gym|workout|health|diet|exercise|weight/)) return "fitness";
  if (lower.match(/food|recipe|cook|eat|meal|diet|restaurant/)) return "food";
  if (lower.match(/travel|trip|vacation|tour|destination|explore/)) return "travel";
  if (lower.match(/fashion|style|outfit|clothing|wear|trend/)) return "fashion";
  if (lower.match(/learn|study|education|school|course|tutorial/)) return "education";
  if (lower.match(/market|advertis|brand|campaign|seo|content|social/)) return "marketing";
  return "default";
}

function generateHashtags(topic: string, platform: Platform, count: number): string[] {
  const category = detectCategory(topic);
  const categoryTags = HASHTAG_LIBRARY[category] || HASHTAG_LIBRARY.default;
  const defaultTags = HASHTAG_LIBRARY.default;

  // Platform-specific modifiers
  const platformTags: Record<Platform, string[]> = {
    instagram: ["#instagood", "#instadaily", "#photooftheday", "#reels", "#explore"],
    twitter: ["#trending", "#thread", "#viral", "#tips", "#learn"],
    linkedin: ["#linkedin", "#professional", "#networking", "#career", "#b2b"],
    facebook: ["#facebook", "#community", "#share", "#viral", "#trending"],
    tiktok: ["#fyp", "#foryoupage", "#tiktok", "#viral", "#trending"],
    youtube: ["#youtube", "#subscribe", "#video", "#tutorial", "#youtuber"],
  };

  // Topic-specific tags
  const topicWords = topic.toLowerCase().split(" ").filter(w => w.length > 3);
  const topicTags = topicWords.map(w => `#${w.replace(/[^a-zA-Z0-9]/g, "")}`).filter(t => t.length > 2);

  const allTags = [...new Set([...topicTags, ...categoryTags, ...platformTags[platform], ...defaultTags])];
  return pickMultiple(allTags, Math.min(count, allTags.length));
}

function processTemplate(template: string, topic: string, tone: Tone, platform: Platform): string {
  const hooks = HOOK_STARTERS[tone];
  const hook = pickRandom(hooks).replace("{topic}", topic).replace("{industry}", topic);
  const points = pickMultiple(POINTS_LIBRARY, 4);
  const cta = pickRandom(CTAS_BY_TONE[tone]);

  const bodyParagraphs = [
    `When it comes to ${topic}, most people overlook the fundamentals that actually drive results. The difference between those who succeed and those who don't often comes down to consistency, clarity, and commitment.`,
    `${topic} has transformed the way we think about growth and success. Whether you're just starting out or you've been at this for years, there's always a deeper level of understanding waiting to be unlocked.`,
    `The reality about ${topic} is that it's not as complicated as people make it out to be. Once you break it down into actionable steps, the path forward becomes crystal clear.`,
    `Here's the truth about ${topic} that nobody wants to admit: the basics work. The foundations matter. And showing up consistently is what separates the exceptional from the average.`,
  ];

  return template
    .replace("{hook}", hook)
    .replace("{topic}", topic)
    .replace("{industry}", topic)
    .replace("{point1}", points[0])
    .replace("{point2}", points[1])
    .replace("{point3}", points[2])
    .replace("{point4}", points[3])
    .replace("{body_paragraph}", pickRandom(bodyParagraphs))
    .replace("{body_short}", `${points[0]}. ${points[1]}.`)
    .replace("{lesson}", points[2])
    .replace("{cta}", cta);
}

export function generateContent(
  topic: string,
  platform: Platform,
  tone: Tone,
  contentType: ContentType
): GeneratedContent {
  const platformTemplates = BODY_TEMPLATES[platform] as Record<ContentType, string[]>;
  const typeTemplates = platformTemplates[contentType] || platformTemplates[Object.keys(platformTemplates)[0] as ContentType];
  const template = pickRandom(typeTemplates);
  const caption = processTemplate(template, topic, tone, platform);

  const hashtagCount = platform === "twitter" ? 3 : platform === "linkedin" ? 5 : platform === "instagram" ? 15 : platform === "tiktok" ? 8 : 6;
  const hashtags = generateHashtags(topic, platform, hashtagCount);

  const emojiSets: Record<Tone, string[]> = {
    professional: ["💡", "📊", "🎯", "✅", "📈", "🔑", "💎", "🌟"],
    casual: ["😊", "✨", "🙌", "💫", "🎉", "👋", "😄", "🤩"],
    humorous: ["😂", "🤣", "💀", "😅", "🤦", "👀", "🙄", "😤"],
    inspirational: ["🚀", "💪", "🌟", "🔥", "⚡", "🏆", "✨", "🎯"],
    educational: ["📚", "💡", "🧠", "📝", "🔍", "📖", "✏️", "🎓"],
    promotional: ["🔥", "⚡", "🎁", "💥", "🚨", "👇", "➡️", "🎯"],
  };

  const tips: Record<Platform, string[]> = {
    instagram: ["Post between 6-9 AM or 3-6 PM for max engagement", "Use all 10 carousel slides to boost reach", "Reply to comments within the first hour", "Add location tags to boost local discovery"],
    twitter: ["Tweet during 9-11 AM on weekdays", "Keep threads under 10 posts for best completion rate", "Use 1-2 hashtags max for organic reach", "Engage with replies to boost algorithm visibility"],
    linkedin: ["B2B content performs best Tue-Thu mornings", "Personal stories get 3x more engagement than company news", "End with a question to drive comments", "Tag relevant people (not spammy) to expand reach"],
    facebook: ["Facebook Reels now get 3x organic reach", "Post at 1-4 PM for peak engagement", "Facebook Groups drive more engagement than Pages", "Use Facebook Stories for behind-the-scenes content"],
    tiktok: ["First 3 seconds determine if viewers stay", "Post 3-5x per week for algorithm favor", "Use trending sounds to boost discovery", "Reply to comments with video responses"],
    youtube: ["Titles under 60 characters rank better", "Create custom thumbnails with faces for 30% more clicks", "First 30 seconds must hook viewers", "Add chapters to improve watch time"],
  };

  return {
    id: `content_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    platform,
    contentType,
    tone,
    topic,
    caption,
    hashtags,
    callToAction: pickRandom(CTAS_BY_TONE[tone]),
    characterCount: caption.length,
    emoji: pickMultiple(emojiSets[tone], 4),
    tips: pickMultiple(tips[platform], 2),
  };
}

export function generateBulkCalendar(
  topic: string,
  platforms: Platform[],
  tone: Tone,
  startDate: string,
  days: number
): CalendarEntry[] {
  const entries: CalendarEntry[] = [];
  const start = new Date(startDate);
  const postTimes = ["09:00", "12:00", "15:00", "18:00", "20:00"];

  for (let day = 0; day < days; day++) {
    const date = new Date(start);
    date.setDate(start.getDate() + day);
    const dateStr = date.toISOString().split("T")[0];

    // Post 1-3 times per day
    const postsPerDay = Math.min(platforms.length, Math.floor(Math.random() * 2) + 1);
    const dayPlatforms = [...platforms].sort(() => Math.random() - 0.5).slice(0, postsPerDay);

    dayPlatforms.forEach((platform, idx) => {
      const availableTypes = CONTENT_TYPES[platform];
      const contentType = pickRandom(availableTypes);
      const content = generateContent(topic, platform, tone, contentType);
      entries.push({
        ...content,
        date: dateStr,
        time: postTimes[idx % postTimes.length],
        status: "scheduled",
        scheduledDate: dateStr,
        scheduledTime: postTimes[idx % postTimes.length],
      });
    });
  }

  return entries.sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
}

export function exportCalendarToCSV(entries: CalendarEntry[]): string {
  const headers = ["Date", "Time", "Platform", "Content Type", "Tone", "Topic", "Caption", "Hashtags", "Call To Action", "Status", "Character Count", "Tips"];
  const rows = entries.map(e => [
    e.date,
    e.time,
    PLATFORMS[e.platform].name,
    e.contentType,
    e.tone,
    e.topic,
    `"${e.caption.replace(/"/g, '""').replace(/\n/g, " | ")}"`,
    `"${e.hashtags.join(" ")}"`,
    `"${e.callToAction}"`,
    e.status,
    e.characterCount,
    `"${e.tips.join(" | ")}"`,
  ]);
  return [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
}

export function exportCalendarToJSON(entries: CalendarEntry[]): string {
  return JSON.stringify(entries, null, 2);
}
