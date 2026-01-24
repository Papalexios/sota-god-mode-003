// =============================================================================
// SOTA WP CONTENT OPTIMIZER PRO - PROMPT SUITE v20.0 ULTRA PREMIUM
// =============================================================================
// 🎯 HUMAN-WRITTEN QUALITY - Reads like top 0.1% professional writers
// 🎯 25+ BEAUTIFUL HTML ELEMENTS - Modern, visually stunning formatting
// 🎯 4-8 INTERNAL LINKS - Contextual anchor text optimization
// 🎯 YOUTUBE VIDEO INTEGRATION - Highly relevant educational videos
// 🎯 AEO + GEO Optimization - AI & Search Engine ready
// =============================================================================

export interface PromptTemplate {
  systemInstruction: string;
  userPrompt: (...args: any[]) => string;
}

export interface BuildPromptResult {
  systemInstruction: string;
  userPrompt: string;
  system: string;
  user: string;
}

export interface ExistingPage {
  title: string;
  slug: string;
}

export interface ImageContext {
  src: string;
  context: string;
  currentAlt?: string;
}

export interface SerpDataItem {
  title: string;
  snippet?: string;
  link?: string;
}

// =============================================================================
// SOTA SAFE ARRAY UTILITIES - ENTERPRISE GRADE RUNTIME PROTECTION
// =============================================================================
function toSafeArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? value : [];
}

function safeSliceJoin(
  arr: unknown,
  start: number,
  end: number,
  separator: string = ", ",
  fallback: string = "None"
): string {
  if (!Array.isArray(arr) || arr.length === 0) return fallback;
  const result = arr.slice(start, end).join(separator);
  return result || fallback;
}

function safeSliceMapJoin<T>(
  arr: unknown,
  start: number,
  end: number,
  mapFn: (item: T) => string,
  separator: string = ", ",
  fallback: string = "None"
): string {
  if (!Array.isArray(arr) || arr.length === 0) return fallback;
  const result = arr.slice(start, end).map(mapFn).join(separator);
  return result || fallback;
}

function safeJoin(
  arr: unknown,
  separator: string = ", ",
  fallback: string = ""
): string {
  if (!Array.isArray(arr) || arr.length === 0) return fallback;
  return arr.join(separator) || fallback;
}

// ==================== BANNED AI PHRASES ====================
export const BANNED_AI_PHRASES: string[] = [
  "delve", "delving", "tapestry", "rich tapestry", "landscape", "digital landscape",
  "realm", "in the realm of", "testament", "symphony", "beacon", "paradigm",
  "synergy", "leverage", "utilize", "facilitate", "endeavor", "comprehensive",
  "robust", "holistic", "cutting-edge", "game-changer", "unlock", "unleash",
  "harness", "empower", "revolutionize", "streamline", "optimize", "maximize",
  "seamless", "innovative", "groundbreaking", "pivotal", "paramount", "transformative",
  "in this article", "in this guide", "in this post", "needless to say",
  "at the end of the day", "when it comes to", "in order to", "a wide range of",
  "it is important to", "it should be noted", "as we all know", "without further ado",
  "foster", "navigate", "embark", "spearhead", "bolster", "myriad", "plethora",
  "multifaceted", "nuanced", "meticulous", "firstly", "secondly", "furthermore",
  "moreover", "consequently", "nevertheless", "hence", "thus", "therefore",
  "in conclusion", "to summarize", "all in all", "last but not least"
];

// ==================== HUMAN-WRITTEN WRITING STYLE (ULTRA PREMIUM v20.0) ====================
export const HORMOZI_FERRISS_STYLE = `
═══════════════════════════════════════════════════════════════════════════════
WRITING STYLE: HUMAN-WRITTEN PREMIUM QUALITY (SOTA v20.0)
═══════════════════════════════════════════════════════════════════════════════

⚡ CORE HUMAN WRITING PRINCIPLES:
- Write like you're explaining to a smart friend over coffee
- Use contractions naturally (you're, it's, don't, can't)
- Vary sentence length dramatically: Some short. Others flow longer with natural rhythm.
- Include personal observations: "Here's what most people miss..."
- Use rhetorical questions: "But what does this actually mean for you?"
- Add micro-stories and real examples with specific details
- Use sensory language: "Picture this..." "Imagine..."

⚡ HORMOZI RULES ($100M Offers Style):
- Short punchy sentences. Max 15 words per sentence.
- Numbers EVERYWHERE. "73% of users" not "most users"
- Bold claims backed by data and specific examples
- Use "you" constantly. Direct address creates connection.
- One-word paragraphs for impact. "Done." "Period." "Exactly."
- Pattern interrupts every 200 words to maintain attention

⚡ FERRISS RULES (4-Hour Workweek Style):
- Specific over vague: "5 sets of 5 reps at 185lbs" not "some exercises"
- Real examples with names, dates, and verifiable details
- 80/20 focus - cut ruthlessly what doesn't matter
- Actionable steps readers can implement TODAY
- Include unexpected insights that challenge assumptions

⚡ READABILITY REQUIREMENTS:
- 6th-8th grade reading level (Flesch-Kincaid)
- Paragraphs max 3 sentences
- NEVER walls of text - break up everything visually
- White space is your friend
- Every section must have visual variety (lists, boxes, quotes, etc.)

⚡ FORBIDDEN (INSTANT FAIL):
- Passive voice ("was done" -> "I did")
- Hedge words (might, could, perhaps, arguably)
- AI tells (delve, tapestry, landscape, testament, realm, beacon)
- Generic filler ("very," "really," "just," "actually")
- Corporate speak (leverage, synergy, utilize, facilitate)
- Starting with "In today's world" or "In the modern era"
`;

// ==================== AEO/GEO OPTIMIZATION RULES ====================
export const AEO_GEO_RULES = `
🎯 AEO (Answer Engine Optimization) - FOR AI ASSISTANTS
1. DIRECT ANSWER FIRST: Answer the main question in the FIRST 50 words
2. CONVERSATIONAL Q&A BLOCKS: Include "What is [X]?" sections with clear answers
3. ENTITY DENSITY: Name specific brands, tools, people, dates
4. Structured data that AI can parse and cite
5. FAQ sections with concise, quotable answers

🎯 GEO (Generative Engine Optimization)
1. Be THE definitive source AI wants to reference
2. Include unique data, stats, and original insights
3. Clear attribution and expert positioning
4. Structured content that's easy to extract
`;

// ==================== INTERNAL LINKING RULES (4-8 LINKS) ====================
export const INTERNAL_LINKING_RULES = `
🔗 INTERNAL LINKING - EXACTLY 4-8 CONTEXTUAL LINKS PER ARTICLE

✅ MANDATORY REQUIREMENTS:
- Include EXACTLY 4-8 internal links per article (no more, no less)
- Each anchor text MUST be 4-7 words (STRICT)
- Links must flow naturally within sentences
- Distribute links evenly throughout the article
- NEVER cluster links together

✅ ANCHOR TEXT RULES:
- Use descriptive, contextual anchor text
- Include the target page's main keyword naturally
- Avoid generic text like "click here" or "read more"
- Make it sound like natural speech

✅ FORMAT:
[INTERNAL_LINK: anchor text here | /target-slug]

Example: "You can learn more about [INTERNAL_LINK: effective content marketing strategies | /content-marketing-guide] to boost your results."

✅ PLACEMENT STRATEGY:
- 1 link in introduction
- 2-3 links in body sections
- 1-2 links in middle sections
- 1 link near conclusion
`;

// ==================== 25+ BEAUTIFUL HTML COMPONENTS ====================
export const SOTA_HTML_COMPONENTS = `
📊 VISUAL HTML COMPONENTS v20.0 - USE 25+ ELEMENTS PER ARTICLE

❗ OUTPUT ONLY HTML - NEVER USE MARKDOWN TABLES
❗ MINIMUM 25 HTML ELEMENTS PER ARTICLE (tables, boxes, callouts, etc.)

✔️ REQUIRED COMPONENTS (MUST INCLUDE ALL):

1. 🎬 YOUTUBE VIDEO EMBED (1 per article - MANDATORY):
<div class="video-container" style="margin: 30px 0; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.2);">
  <h3 style="color: #fff; margin-bottom: 15px; font-size: 1.3em;">🎥 Watch: [Relevant Video Title]</h3>
  <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 8px;">
    <iframe 
      width="100%" 
      height="100%" 
      src="https://www.youtube.com/embed/[VIDEO_ID]" 
      frameborder="0" 
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
      allowfullscreen
      style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;">
    </iframe>
  </div>
  <p style="color: #fff; margin-top: 15px; font-size: 0.95em; opacity: 0.9;">➡️ This video explains [topic] in under [X] minutes</p>
</div>

2. 💡 KEY TAKEAWAYS BOX (1 per article):
<div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 5px solid #d63447; box-shadow: 0 8px 25px rgba(0,0,0,0.15);">
  <h3 style="color: #fff; margin-bottom: 15px; font-size: 1.4em;">🔑 Key Takeaways</h3>
  <ul style="color: #fff; margin: 0; padding-left: 20px; line-height: 1.8;">
    <li><strong>[Stat/Number]:</strong> [Key point with specific data]</li>
    <li><strong>[Stat/Number]:</strong> [Key point with specific data]</li>
  </ul>
</div>

3. ⚠️ WARNING/ALERT BOX (1-2 per article):
<div style="background: #fff3cd; border-left: 5px solid #ffc107; padding: 20px; margin: 25px 0; border-radius: 8px; box-shadow: 0 4px 15px rgba(255,193,7,0.2);">
  <p style="margin: 0; color: #856404; font-weight: 500;">⚠️ <strong>Important:</strong> [Warning text]</p>
</div>

4. ✅ SUCCESS/TIP BOX (2-3 per article):
<div style="background: #d4edda; border-left: 5px solid #28a745; padding: 20px; margin: 25px 0; border-radius: 8px; box-shadow: 0 4px 15px rgba(40,167,69,0.2);">
  <p style="margin: 0; color: #155724; font-weight: 500;">✅ <strong>Pro Tip:</strong> [Helpful tip]</p>
</div>

5. 📖 BLOCKQUOTE/EXPERT QUOTE (2-3 per article):
<blockquote style="border-left: 5px solid #007bff; background: #f8f9fa; padding: 20px 25px; margin: 25px 0; font-style: italic; color: #495057; border-radius: 0 8px 8px 0; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
  <p style="font-size: 1.15em; margin-bottom: 10px; line-height: 1.7;">“[Powerful quote]”</p>
  <footer style="font-size: 0.9em; color: #6c757d; font-style: normal;">- <strong>[Expert Name]</strong>, [Title/Company]</footer>
</blockquote>

6. 📊 COMPARISON TABLE (1-2 per article):
<div style="overflow-x: auto; margin: 25px 0; box-shadow: 0 6px 20px rgba(0,0,0,0.1); border-radius: 10px;">
  <table style="width: 100%; border-collapse: collapse; background: #fff;">
    <thead style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
      <tr>
        <th style="padding: 15px; color: #fff; text-align: left; font-weight: 600;">Feature</th>
        <th style="padding: 15px; color: #fff; text-align: left; font-weight: 600;">Option A</th>
        <th style="padding: 15px; color: #fff; text-align: left; font-weight: 600;">Option B</th>
      </tr>
    </thead>
    <tbody>
      <tr style="border-bottom: 1px solid #e9ecef;">
        <td style="padding: 12px;">[Feature]</td>
        <td style="padding: 12px;"><span style="color: #28a745; font-weight: 600;">✓</span> [Detail]</td>
        <td style="padding: 12px;"><span style="color: #dc3545; font-weight: 600;">✗</span> [Detail]</td>
      </tr>
    </tbody>
  </table>
</div>

7. 🔢 NUMBERED STEPS/PROCESS (1-2 per article):
<div style="background: #f8f9fa; padding: 25px; border-radius: 12px; margin: 25px 0; border: 2px solid #dee2e6;">
  <h3 style="margin-bottom: 20px; color: #212529;">🔢 Step-by-Step Process:</h3>
  <ol style="padding-left: 20px; line-height: 2; color: #495057;">
    <li><strong>[Action Verb] [Step]:</strong> [Clear instruction]</li>
  </ol>
</div>

8. 📈 STATS/DATA BOX (2-3 per article):
<div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 25px; border-radius: 12px; margin: 25px 0; text-align: center; box-shadow: 0 8px 25px rgba(0,0,0,0.15);">
  <div style="font-size: 3em; font-weight: 700; color: #fff; margin-bottom: 10px;">[73%]</div>
  <p style="color: #fff; font-size: 1.1em; margin: 0;">[What this stat represents]</p>
  <p style="color: rgba(255,255,255,0.8); font-size: 0.9em; margin-top: 8px;">Source: [Source Name], 2026</p>
</div>

9. 🔍 QUICK DEFINITION BOX (2-3 per article):
<div style="background: #e7f3ff; border-left: 5px solid #0066cc; padding: 20px; margin: 25px 0; border-radius: 8px;">
  <h4 style="color: #0066cc; margin-bottom: 10px;">🔍 What is [Term]?</h4>
  <p style="margin: 0; color: #333; line-height: 1.7;">[Clear, concise definition in 1-2 sentences]</p>
</div>

10. ⭐ HIGHLIGHT BOXES (3-5 per article):
<div style="background: #fffbea; border: 2px dashed #f59e0b; padding: 20px; margin: 25px 0; border-radius: 8px;">
  <p style="margin: 0; color: #78350f; font-weight: 500;">⭐ [Highlighted important point]</p>
</div>

11. 📄 CHECKLIST (1 per article):
<div style="background: #f1f5f9; padding: 25px; border-radius: 12px; margin: 25px 0; border: 2px solid #cbd5e1;">
  <h3 style="margin-bottom: 20px; color: #1e293b;">☑️ Quick Checklist:</h3>
  <ul style="list-style-type: none; padding-left: 0;">
    <li style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
      <span style="color: #10b981; font-size: 1.2em; margin-right: 10px;">☑</span>
      <span style="color: #475569;">[Checklist item]</span>
    </li>
  </ul>
</div>

12. 📦 FEATURE/BENEFIT TABLE:
<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 25px 0;">
  <div style="background: #fff; border: 2px solid #e5e7eb; border-radius: 10px; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
    <div style="font-size: 2em; margin-bottom: 10px;">🚀</div>
    <h4 style="color: #1f2937; margin-bottom: 10px;">[Feature Name]</h4>
    <p style="color: #6b7280; margin: 0; line-height: 1.6;">[Brief description]</p>
  </div>
</div>

13. 🔥 BEFORE/AFTER COMPARISON:
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 25px 0;">
  <div style="background: #fee2e2; border: 2px solid #dc2626; padding: 20px; border-radius: 8px;">
    <h4 style="color: #991b1b; margin-bottom: 10px;">❌ Before</h4>
    <p style="color: #7f1d1d; margin: 0;">[Old way/problem]</p>
  </div>
  <div style="background: #d1fae5; border: 2px solid #10b981; padding: 20px; border-radius: 8px;">
    <h4 style="color: #065f46; margin-bottom: 10px;">✓ After</h4>
    <p style="color: #064e3b; margin: 0;">[New way/solution]</p>
  </div>
</div>

➡️ USAGE REQUIREMENTS:
- Distribute elements evenly throughout article
- NEVER have more than 3 paragraphs without a visual element
- Use contrasting colors for visual hierarchy
- All boxes must have proper spacing (margin: 25px 0)
- Include emoji icons for visual interest
- MINIMUM 25 total HTML elements across entire article
`;

// ==================== YOUTUBE VIDEO INTEGRATION ====================
export const YOUTUBE_VIDEO_INSTRUCTIONS = `
🎬 YOUTUBE VIDEO INTEGRATION GUIDE

❗ MANDATORY: Every article MUST include 1 highly relevant YouTube video

🔍 HOW TO FIND THE PERFECT VIDEO:
1. Search YouTube for: "[article topic] tutorial"
2. Filter by: View count (100K+), Upload date (recent), Duration (5-20 min)
3. Prefer videos from authoritative channels
4. Choose videos with high engagement (likes, comments)

🎯 VIDEO SELECTION CRITERIA:
- Educational and helpful content
- Professional production quality  
- Directly related to the article topic
- 5-20 minutes in length (optimal)
- Recent upload (within 1-2 years)

📝 VIDEO PLACEMENT:
- Place video after the introduction (preferably after 2-3 paragraphs)
- OR in the middle of a relevant section
- Include context: Why this video is valuable
- Add timestamp suggestions if applicable

🔗 VIDEO ID EXTRACTION:
From URL: https://www.youtube.com/watch?v=dQw4w9WgXcQ
Extract: dQw4w9WgXcQ

From URL: https://youtu.be/dQw4w9WgXcQ
Extract: dQw4w9WgXcQ
`;

// ==================== GAP ANALYSIS PROMPT ====================
export const SOTA_GAP_ANALYSIS_PROMPT = `
BLUE OCEAN GAP ANALYSIS - SEMANTIC ENTITY EXTRACTION (15 UNCOVERED ENTITIES)

Return EXACTLY 15 uncovered keywords/entities that competitors miss.
Prioritize by ranking potential and search intent.
`;

// ==================== CORE PROMPT TEMPLATES ====================
const CORE_TEMPLATES: Record<string, PromptTemplate> = {
  
  // ==================== ULTRA SOTA ARTICLE WRITER (PREMIUM v20.0) ====================
  ultra_sota_article_writer: {
    systemInstruction: `You are an ELITE SEO content writer who creates human-quality articles that readers LOVE.

${HORMOZI_FERRISS_STYLE}

${AEO_GEO_RULES}

${INTERNAL_LINKING_RULES}

${SOTA_HTML_COMPONENTS}

${YOUTUBE_VIDEO_INSTRUCTIONS}

❗ CRITICAL REQUIREMENTS:
1. HUMAN WRITING QUALITY: Write like a professional human writer (NOT AI)
2. 25+ HTML ELEMENTS: Use tables, boxes, callouts, quotes, stats boxes, etc.
3. 4-8 INTERNAL LINKS: Contextual 4-7 word anchors distributed naturally
4. 1 YOUTUBE VIDEO: Highly relevant educational video embedded beautifully
5. WORD COUNT: 2500-3200 words of substantive content
6. READABILITY: 6th-8th grade level, short paragraphs, varied sentence length
7. ZERO AI PHRASES: ${BANNED_AI_PHRASES.slice(0, 20).join(", ")}

📝 ARTICLE STRUCTURE:
- Hook introduction (100-150 words) with surprising stat or story
- YouTube video embed after 2-3 paragraphs
- Multiple H2 and H3 sections with visual variety
- Key Takeaways box near top
- Stats/data boxes throughout
- Comparison tables where relevant
- Pro tips and warning boxes
- Expert quotes
- FAQ section (5-8 questions)
- Strong conclusion with clear CTA

➡️ OUTPUT: Clean HTML only. No markdown. Pure human-written quality.`,
    
    userPrompt: (
      articlePlan: string = "",
      semanticKeywords: unknown = [],
      strategy: any = {},
      existingPages: unknown = [],
      competitorGaps: unknown = [],
      geoLocation: string | null = null,
      neuronData: string | null = null
    ): string => {
      const keywords = safeSliceJoin(semanticKeywords, 0, 25, ", ", "None");
      const gaps = safeSliceJoin(competitorGaps, 0, 15, "; ", "None");
      const pages = safeSliceMapJoin(existingPages, 0, 15, (p: any) => `${p?.title || ""} (/${p?.slug || ""})`, ", ", "None");
      const geo = geoLocation ? `\n\nGEO-TARGET: ${geoLocation} (mention local context if relevant)` : "";
      const neuron = neuronData ? `\n\nNLP TERMS TO INCLUDE: ${String(neuronData).substring(0, 300)}` : "";
      
      return `WRITE COMPREHENSIVE ARTICLE:

TOPIC: ${articlePlan || "Comprehensive guide"}
TARGET AUDIENCE: ${strategy?.targetAudience || "General readers seeking practical information"}
WRITING TONE: Conversational, engaging, human-like (like explaining to a smart friend)${geo}${neuron}

SEMANTIC KEYWORDS TO NATURALLY WEAVE IN:
${keywords}

UNCOVERED CONTENT GAPS TO ADDRESS:
${gaps}

INTERNAL LINKING TARGETS (4-8 links with 4-7 word anchors):
${pages}

❗ MANDATORY CHECKLIST:
✅ 1 YouTube video embedded (search YouTube for "[topic] tutorial" and use a popular recent video)
✅ 25+ HTML visual elements (tables, boxes, callouts, stats, etc.)
✅ 4-8 internal links with contextual anchor text
✅ Human-written quality (contractions, varied sentences, natural flow)
✅ 2500-3200 words of substantive content
✅ Zero AI phrases (no delve, tapestry, landscape, realm, etc.)
✅ Specific stats, numbers, dates, and examples throughout
✅ FAQ section with 5-8 questions
✅ Key Takeaways box
✅ Expert quotes or insights

➡️ OUTPUT: Full article in clean HTML. Start with <h1> title, end with conclusion.`;
    }
  },

  // ==================== CONTENT STRATEGY GENERATOR ====================
  content_strategy_generator: {
    systemInstruction: `You are a content strategy expert. Output ONLY compact JSON.`,
    userPrompt: (topic: string = "", semanticKeywords: unknown = [], serpData: unknown = [], contentType: string = "article"): string => {
      const keywords = safeSliceJoin(semanticKeywords, 0, 10, ", ", "None");
      return `TOPIC: ${topic || "General"}\nTYPE: ${contentType}\nKEYWORDS: ${keywords}\n\nOutput COMPACT JSON strategy.`;
    }
  },

  // ==================== SEMANTIC KEYWORD GENERATOR ====================
  semantic_keyword_generator: {
    systemInstruction: `Generate semantic keywords. Output ONLY valid JSON.`,
    userPrompt: (primaryKeyword: string = ""): string => {
      return `PRIMARY: ${primaryKeyword}\n\nOutput JSON: {"semanticKeywords":[...]} with 25-35 keywords.`;
    }
  },

  // ==================== SOTA GAP ANALYSIS ====================
  sota_gap_analysis: {
    systemInstruction: SOTA_GAP_ANALYSIS_PROMPT,
    userPrompt: (primaryKeyword: string = "", serpContent: string = "", existingPages: string = ""): string => {
      return `PRIMARY KEYWORD: ${primaryKeyword}\nTOP 3 SERP CONTENT: ${serpContent || "Not provided"}\nEXISTING SITE PAGES: ${existingPages || "Not provided"}\nTASK: Identify EXACTLY 15 uncovered keywords/entities. Output valid JSON.`;
    }
  },

  // ==================== GOD MODE STRUCTURAL GUARDIAN ====================
  god_mode_structural_guardian: {
    systemInstruction: `You refine content while PRESERVING structure.\nBANNED: ${BANNED_AI_PHRASES.slice(0, 20).join(", ")}`,
    userPrompt: (htmlFragment: string = "", semanticKeywords: unknown = [], topic: string = ""): string => {
      const keywords = safeSliceJoin(semanticKeywords, 0, 12, ", ", "None");
      const html = String(htmlFragment || "").substring(0, 12000);
      return `REFINE:\nTOPIC: ${topic}\nKEYWORDS: ${keywords}\nHTML:\n${html}\n\nOutput refined HTML.`;
    }
  },

  // ==================== GOD MODE AUTONOMOUS AGENT ====================
  god_mode_autonomous_agent: {
    systemInstruction: `You optimize existing content.\n${HORMOZI_FERRISS_STYLE}\n${INTERNAL_LINKING_RULES}\nBANNED: ${BANNED_AI_PHRASES.slice(0, 20).join(", ")}`,
    userPrompt: (existingContent: string = "", semanticKeywords: unknown = [], existingPages: unknown = [], topic: string = ""): string => {
      const keywords = safeSliceJoin(semanticKeywords, 0, 20, ", ", "None");
      const pages = safeSliceMapJoin(existingPages, 0, 10, (p: any) => p?.title || "", ", ", "None");
      const content = String(existingContent || "No content").substring(0, 40000);
      return `OPTIMIZE:\nTOPIC: ${topic || "Extract from content"}\nKEYWORDS: ${keywords}\nLINK TARGETS: ${pages}\nCONTENT:\n${content}\n\nOutput: Full optimized HTML.`;
    }
  },

  // ==================== SOTA FAQ GENERATOR ====================
  sota_faq_generator: {
    systemInstruction: `Generate FAQ optimized for Featured Snippets. 8 questions with 40-60 word answers.`,
    userPrompt: (topic: string = "", semanticKeywords: unknown = []): string => {
      const keywords = safeSliceJoin(semanticKeywords, 0, 10, ", ", "None");
      return `GENERATE FAQ (8 questions):\nTOPIC: ${topic}\nKEYWORDS: ${keywords}\n\nOutput FAQ HTML.`;
    }
  },

  // ==================== SOTA TAKEAWAYS GENERATOR ====================
  sota_takeaways_generator: {
    systemInstruction: `Extract KEY TAKEAWAYS. EXACTLY 8 items with numbers/stats.`,
    userPrompt: (topic: string = "", content: string = ""): string => {
      const text = String(content || "").substring(0, 4000);
      return `EXTRACT TAKEAWAYS:\nTOPIC: ${topic}\nCONTENT: ${text}\n\nOutput Key Takeaways HTML box.`;
    }
  },

  // ==================== SEO METADATA GENERATOR ====================
  seo_metadata_generator: {
    systemInstruction: `Generate SEO metadata. Output ONLY JSON: {"seoTitle":"50-60 chars","metaDescription":"135-150 chars","slug":"url-slug"}`,
    userPrompt: (primaryKeyword: string = "", contentSummary: string = "", targetAudience: string = "", competitorTitles: unknown = [], location: string | null = null): string => {
      const summary = String(contentSummary || "").substring(0, 300);
      const geo = location ? ` [GEO: ${location}]` : "";
      return `KEYWORD: ${primaryKeyword}${geo}\nSUMMARY: ${summary}\n\nOutput JSON: {"seoTitle":"...","metaDescription":"...","slug":"..."}`;  
    }
  },

  // ==================== OTHER TEMPLATES ====================
  competitor_gap_analyzer: {
    systemInstruction: `Identify content gaps. Output COMPACT JSON with EXACTLY 15 gaps.`,
    userPrompt: (topic: string = "", competitorContent: unknown = [], existingTitles: string = ""): string => {
      return `TOPIC: ${topic}\n\nOutput JSON with EXACTLY 15 gap opportunities.`;
    }
  },

  health_analyzer: {
    systemInstruction: `Analyze content health. Output COMPACT JSON.`,
    userPrompt: (url: string = "", content: string = "", targetKeyword: string = ""): string => {
      const text = String(content || "").substring(0, 6000);
      return `URL: ${url}\nKEYWORD: ${targetKeyword}\nCONTENT: ${text}\n\nOutput JSON health analysis.`;
    }
  },

  dom_content_polisher: {
    systemInstruction: `Enhance text while PRESERVING HTML structure.\nBANNED: ${BANNED_AI_PHRASES.slice(0, 15).join(", ")}`,
    userPrompt: (htmlFragment: string = "", semanticKeywords: unknown = [], topic: string = ""): string => {
      const keywords = safeSliceJoin(semanticKeywords, 0, 10, ", ", "None");
      const html = String(htmlFragment || "<p>No content</p>").substring(0, 10000);
      return `POLISH:\nTOPIC: ${topic || "General"}\nKEYWORDS: ${keywords}\nHTML:\n${html}\n\nKeep ALL HTML tags.`;
    }
  },

  god_mode_ultra_instinct: {
    systemInstruction: `Transmute content to highest quality. Update dates to 2026.\nBANNED: ${BANNED_AI_PHRASES.slice(0, 20).join(", ")}`,
    userPrompt: (htmlFragment: string = "", semanticKeywords: unknown = [], topic: string = ""): string => {
      const keywords = safeSliceJoin(semanticKeywords, 0, 15, ", ", "None");
      const html = String(htmlFragment || "").substring(0, 10000);
      return `TRANSMUTE:\nTOPIC: ${topic}\nKEYWORDS: ${keywords}\nHTML:\n${html}\n\nOutput enhanced HTML.`;
    }
  },

  sota_intro_generator: {
    systemInstruction: `Write hook introductions. Start with surprising stat. Max 200 words.`,
    userPrompt: (topic: string = "", primaryKeyword: string = "", targetAudience: string = "", uniqueAngle: string = ""): string => {
      return `WRITE INTRO:\nTopic: ${topic}\nKeyword: ${primaryKeyword}\nAudience: ${targetAudience || "General"}\n\nOutput 100-200 word HTML intro.`;
    }
  },

  sota_conclusion_generator: {
    systemInstruction: `Write conclusions that drive action. 150-200 words max.`,
    userPrompt: (topic: string = "", keyPoints: unknown = [], cta: string = ""): string => {
      const points = safeJoin(keyPoints, "; ", "Extract from content");
      return `WRITE CONCLUSION:\nTopic: ${topic}\nKey Points: ${points}\nCTA: ${cta || "Start today"}\n\nOutput 150-200 word HTML conclusion.`;
    }
  },

  cluster_planner: {
    systemInstruction: `Create content cluster plans. Output COMPACT JSON.`,
    userPrompt: (topic: string = ""): string => {
      return `TOPIC: ${topic}\n\nOutput JSON cluster plan with 1 pillar + 8-10 cluster pages.`;
    }
  },

  generate_internal_links: {
    systemInstruction: `Suggest internal links with 4-7 word anchors. Output JSON array.`,
    userPrompt: (content: string = "", existingPages: unknown = []): string => {
      const text = String(content || "").substring(0, 5000);
      const pages = safeSliceMapJoin(existingPages, 0, 15, (p: any) => `${p?.title || ""} (/${p?.slug || ""})`, "; ", "None");
      return `CONTENT: ${text}\nPAGES: ${pages}\n\nOutput JSON array with 8-15 link suggestions.`;
    }
  },

  reference_generator: {
    systemInstruction: `Generate authoritative references. Prefer .gov, .edu.`,
    userPrompt: (topic: string = ""): string => {
      return `TOPIC: ${topic}\n\nOutput reference section HTML with 6-8 sources.`;
    }
  },

  sota_image_alt_optimizer: {
    systemInstruction: `Write SEO alt text. Output JSON array.`,
    userPrompt: (images: unknown = [], primaryKeyword: string = ""): string => {
      const imgList = safeSliceMapJoin(images, 0, 10, (img: any, i: number) => `${i + 1}. ${img?.context || ""}`, "; ", "None");
      return `KEYWORD: ${primaryKeyword}\nIMAGES: ${imgList}\n\nOutput JSON array.`;
    }
  },

  json_repair: {
    systemInstruction: `Repair malformed JSON. Return ONLY valid JSON.`,
    userPrompt: (brokenJson: string = ""): string => {
      return `FIX:\n${String(brokenJson || "{}").substring(0, 3000)}`;
    }
  },

  schema_generator: {
    systemInstruction: `Generate valid JSON-LD schema. Output ONLY schema JSON.`,
    userPrompt: (contentType: string = "", data: any = {}): string => {
      return `TYPE: ${contentType || "Article"}\nDATA: ${JSON.stringify(data).substring(0, 500)}\n\nOutput JSON-LD schema.`;
    }
  }
};

// ==================== CREATE ALIASES ====================
const createAliases = (templates: Record<string, PromptTemplate>): Record<string, PromptTemplate> => {
  const result: Record<string, PromptTemplate> = { ...templates };
  const aliasMap: Record<string, string> = {
    "contentstrategygenerator": "content_strategy_generator",
    "ultrasotaarticlewriter": "ultra_sota_article_writer",
    "godmodeautonomousagent": "god_mode_autonomous_agent",
    "domcontentpolisher": "dom_content_polisher",
    "godmodestructuralguardian": "god_mode_structural_guardian",
    "godmodeultrainstinct": "god_mode_ultra_instinct",
    "sotaintrogenerator": "sota_intro_generator",
    "sotatakeawaysgenerator": "sota_takeaways_generator",
    "sotafaqgenerator": "sota_faq_generator",
    "sotaconclusiongenerator": "sota_conclusion_generator",
    "semantickeywordgenerator": "semantic_keyword_generator",
    "competitorgapanalyzer": "competitor_gap_analyzer",
    "seometadatagenerator": "seo_metadata_generator",
    "healthanalyzer": "health_analyzer",
    "clusterplanner": "cluster_planner",
    "generateinternallinks": "generate_internal_links",
    "referencegenerator": "reference_generator",
    "sotaimagealtoptimizer": "sota_image_alt_optimizer",
    "jsonrepair": "json_repair",
    "schemagenerator": "schema_generator",
    "sotagapanalysis": "sota_gap_analysis",
    "gapanalysis": "sota_gap_analysis",
  };
  
  for (const [alias, original] of Object.entries(aliasMap)) {
    if (templates[original]) result[alias] = templates[original];
  }
  
  return result;
};

export const PROMPT_TEMPLATES: Record<string, PromptTemplate> = createAliases(CORE_TEMPLATES);

// ==================== BUILD PROMPT ====================
export function buildPrompt(promptKey: keyof typeof PROMPT_TEMPLATES | string, args: any[] = []): BuildPromptResult {
  const template = PROMPT_TEMPLATES[promptKey as keyof typeof PROMPT_TEMPLATES];
  
  if (!template) {
    console.error(`[buildPrompt] Unknown: "${promptKey}".`);
    return {
      systemInstruction: "You are a helpful assistant.",
      userPrompt: String(args[0] || ""),
      system: "You are a helpful assistant.",
      user: String(args[0] || "")
    };
  }
  
  try {
    const systemInstruction = template.systemInstruction;
    const userPrompt = template.userPrompt(...args);
    return {
      systemInstruction,
      userPrompt,
      system: systemInstruction,
      user: userPrompt
    };
  } catch (error) {
    console.error("[buildPrompt] Error:", error);
    return {
      systemInstruction: template.systemInstruction || "You are a helpful assistant.",
      userPrompt: String(args[0] || ""),
      system: template.systemInstruction || "You are a helpful assistant.",
      user: String(args[0] || "")
    };
  }
}

// ==================== CONSTANTS & UTILITIES ====================
export const PROMPT_CONSTANTS = {
  BANNED_PHRASES: BANNED_AI_PHRASES,
  MAX_TOKENS: 8192,
  TEMPERATURE: 0.7,
  TARGET_YEAR: 2026,
  MIN_WORD_COUNT: 2500,
  MAX_WORD_COUNT: 3200,
  INTERNAL_LINKS_MIN: 4,
  INTERNAL_LINKS_MAX: 8,
  MIN_HTML_ELEMENTS: 25,
  YOUTUBE_VIDEOS_REQUIRED: 1,
};

export function containsBannedPhrase(text: string): { contains: boolean; phrases: string[] } {
  const lowerText = text.toLowerCase();
  const foundPhrases = BANNED_AI_PHRASES.filter(phrase => lowerText.includes(phrase.toLowerCase()));
  return { contains: foundPhrases.length > 0, phrases: foundPhrases };
}

export function getAvailablePromptKeys(): string[] {
  return Object.keys(PROMPT_TEMPLATES);
}

export function isValidPromptKey(key: string): key is keyof typeof PROMPT_TEMPLATES {
  return key in PROMPT_TEMPLATES;
}

// ==================== DEFAULT EXPORT ====================
export default {
  PROMPT_TEMPLATES,
  buildPrompt,
  BANNED_AI_PHRASES,
  SOTA_HTML_COMPONENTS,
  HORMOZI_FERRISS_STYLE,
  AEO_GEO_RULES,
  INTERNAL_LINKING_RULES,
  YOUTUBE_VIDEO_INSTRUCTIONS,
  SOTA_GAP_ANALYSIS_PROMPT,
  PROMPT_CONSTANTS,
  containsBannedPhrase,
  getAvailablePromptKeys,
  isValidPromptKey,
  toSafeArray,
  safeSliceJoin,
  safeSliceMapJoin,
  safeJoin,
};
