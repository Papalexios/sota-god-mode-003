// =============================================================================
// SOTA INTERNAL LINK ENGINE v1.0 - BULLETPROOF ANCHOR TEXT + DISTRIBUTION
// Fixes: Broken anchors, improper distribution, link clustering
// =============================================================================

export interface InternalPage {
  title: string;
  slug: string;
  url?: string;
}

export interface LinkPlacement {
  paragraphIndex: number;
  anchorText: string;
  targetSlug: string;
  targetTitle: string;
  targetUrl: string;
}

export interface LinkEngineConfig {
  minLinksPerPost: number;
  maxLinksPerPost: number;
  minAnchorWords: number;
  maxAnchorWords: number;
  maxLinksPerParagraph: number;
  minWordsBetweenLinks: number;
  avoidFirstParagraph: boolean;
  avoidLastParagraph: boolean;
}

const DEFAULT_CONFIG: LinkEngineConfig = {
  minLinksPerPost: 4,
  maxLinksPerPost: 8,
  minAnchorWords: 4,
  maxAnchorWords: 7,
  maxLinksPerParagraph: 1,
  minWordsBetweenLinks: 150,
  avoidFirstParagraph: true,
  avoidLastParagraph: true
};

const FORBIDDEN_ANCHOR_STARTS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of',
  'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be',
  'this', 'that', 'these', 'those', 'it', 'its', 'they', 'their', 'your',
  'our', 'my', 'his', 'her', 'we', 'you', 'i', 'if', 'so', 'yet', 'nor',
  'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below',
  'between', 'under', 'again', 'further', 'then', 'once', 'here', 'there',
  'when', 'where', 'why', 'how', 'all', 'each', 'every', 'both', 'few',
  'more', 'most', 'other', 'some', 'such', 'no', 'not', 'only', 'same',
  'than', 'too', 'very', 'just', 'also', 'now', 'being', 'having', 'which',
  'who', 'whom', 'whose', 'what', 'while', 'although', 'because', 'since'
]);

const FORBIDDEN_ANCHOR_ENDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of',
  'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be',
  'this', 'that', 'these', 'those', 'it', 'its', 'they', 'their', 'your',
  'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'have',
  'has', 'had', 'do', 'does', 'did', 'being', 'having', 'if', 'so', 'yet',
  'than', 'too', 'very', 'just', 'also', 'now', 'quite', 'rather', 'really'
]);

const TOXIC_ANCHORS = new Set([
  'click here', 'read more', 'learn more', 'find out', 'check out',
  'this article', 'this guide', 'this post', 'more info', 'see more',
  'here', 'link', 'click', 'read', 'learn', 'check', 'see', 'view'
]);

const REQUIRED_DESCRIPTIVE_WORDS = new Set([
  'guide', 'tutorial', 'tips', 'strategies', 'techniques', 'methods', 'steps',
  'practices', 'approach', 'framework', 'system', 'process', 'checklist',
  'resources', 'tools', 'benefits', 'solutions', 'recommendations', 'insights',
  'overview', 'basics', 'fundamentals', 'essentials', 'introduction', 'advanced',
  'best', 'complete', 'comprehensive', 'ultimate', 'proven', 'effective',
  'essential', 'professional', 'expert', 'beginner', 'training', 'health',
  'nutrition', 'grooming', 'behavior', 'care', 'wellness', 'diet', 'exercise',
  'marketing', 'seo', 'content', 'strategy', 'optimization', 'conversion',
  'growth', 'revenue', 'sales', 'business', 'advice', 'secrets', 'mistakes',
  'problems', 'issues', 'ways', 'reasons', 'facts', 'myths', 'signs',
  'examples', 'templates', 'ideas', 'inspiration', 'planning', 'management'
]);

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeText(text: string): string {
  return text.toLowerCase().trim().replace(/\s+/g, ' ');
}

function extractCleanText(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function getWordCount(text: string): number {
  return text.split(/\s+/).filter(w => w.length > 0).length;
}

export function validateAnchorText(anchor: string, config: LinkEngineConfig = DEFAULT_CONFIG): {
  valid: boolean;
  reason: string;
  score: number;
} {
  const cleaned = anchor.trim()
    .replace(/^[^a-zA-Z0-9]+/, '')
    .replace(/[^a-zA-Z0-9]+$/, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned) {
    return { valid: false, reason: 'Empty anchor text', score: 0 };
  }

  const words = cleaned.split(/\s+/).filter(w => w.length > 0);

  if (words.length < config.minAnchorWords) {
    return { valid: false, reason: `Too short: ${words.length} words (min ${config.minAnchorWords})`, score: 0 };
  }

  if (words.length > config.maxAnchorWords) {
    return { valid: false, reason: `Too long: ${words.length} words (max ${config.maxAnchorWords})`, score: 0 };
  }

  const anchorLower = cleaned.toLowerCase();
  for (const toxic of TOXIC_ANCHORS) {
    if (anchorLower === toxic || anchorLower.includes(toxic)) {
      return { valid: false, reason: `Contains toxic phrase: "${toxic}"`, score: 0 };
    }
  }

  const firstWord = words[0].toLowerCase().replace(/[^a-z']/g, '');
  if (FORBIDDEN_ANCHOR_STARTS.has(firstWord)) {
    return { valid: false, reason: `Cannot start with: "${firstWord}"`, score: 0 };
  }

  const lastWord = words[words.length - 1].toLowerCase().replace(/[^a-z']/g, '');
  if (FORBIDDEN_ANCHOR_ENDS.has(lastWord)) {
    return { valid: false, reason: `Cannot end with: "${lastWord}"`, score: 0 };
  }

  const hasDescriptive = words.some(w =>
    REQUIRED_DESCRIPTIVE_WORDS.has(w.toLowerCase().replace(/[^a-z]/g, ''))
  );
  if (!hasDescriptive) {
    return { valid: false, reason: 'Missing descriptive word', score: 0 };
  }

  const fragmentPatterns = [
    /\s+(is|are|was|were|will|would|could|should|can|may|might|must)$/i,
    /\s+(and|or|but|that|which|who|when|where|why|how)$/i,
    /\s+(the|a|an|very|really|quite|rather|so|too)$/i,
    /\s+(have|has|had|do|does|did|being|having)$/i,
    /\s+(if|although|because|since|while|unless)$/i
  ];

  for (const pattern of fragmentPatterns) {
    if (pattern.test(cleaned)) {
      return { valid: false, reason: 'Incomplete sentence fragment', score: 0 };
    }
  }

  const meaningfulWords = words.filter(w =>
    !FORBIDDEN_ANCHOR_STARTS.has(w.toLowerCase()) && w.length > 2
  );
  if (meaningfulWords.length < 2) {
    return { valid: false, reason: 'Too few meaningful words', score: 0 };
  }

  let score = 50;
  if (words.length >= 4 && words.length <= 6) score += 20;
  else if (words.length === 7) score += 10;

  const descriptiveCount = words.filter(w =>
    REQUIRED_DESCRIPTIVE_WORDS.has(w.toLowerCase().replace(/[^a-z]/g, ''))
  ).length;
  score += Math.min(descriptiveCount * 8, 24);

  const powerPatterns = [
    /\b(complete|comprehensive|ultimate|definitive)\s+\w+\s+guide\b/i,
    /\b(step[- ]by[- ]step|how[- ]to)\s+\w+/i,
    /\b(best|top|proven|effective)\s+(practices|strategies|techniques|tips)/i,
    /\b(beginner|advanced|expert)\s+\w+\s+(guide|tips|tutorial)/i
  ];
  for (const pattern of powerPatterns) {
    if (pattern.test(cleaned)) {
      score += 15;
      break;
    }
  }

  return { valid: true, reason: 'Valid anchor', score: Math.min(100, score) };
}

function extractKeyTerms(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3 && !FORBIDDEN_ANCHOR_STARTS.has(w));
}

function findBestAnchorInParagraph(
  paragraphText: string,
  targetPage: InternalPage,
  config: LinkEngineConfig = DEFAULT_CONFIG
): { anchor: string; score: number } | null {
  const text = extractCleanText(paragraphText);
  const words = text.split(/\s+/).filter(w => w.length > 0);

  if (words.length < config.minAnchorWords) return null;

  const targetTerms = [
    ...extractKeyTerms(targetPage.title),
    ...extractKeyTerms(targetPage.slug.replace(/-/g, ' '))
  ];
  const uniqueTerms = [...new Set(targetTerms)];

  let bestCandidate: { anchor: string; score: number } | null = null;

  for (let len = config.minAnchorWords; len <= config.maxAnchorWords; len++) {
    for (let start = 0; start <= words.length - len; start++) {
      const phraseWords = words.slice(start, start + len);
      const phrase = phraseWords.join(' ');

      const validation = validateAnchorText(phrase, config);
      if (!validation.valid) continue;

      const phraseLower = phrase.toLowerCase();
      let matchScore = 0;
      for (const term of uniqueTerms) {
        if (phraseLower.includes(term)) {
          matchScore += 20;
        }
      }

      if (matchScore === 0) continue;

      const totalScore = validation.score + matchScore;

      if (!bestCandidate || totalScore > bestCandidate.score) {
        bestCandidate = { anchor: phrase, score: totalScore };
      }
    }
  }

  return bestCandidate;
}

interface ParagraphInfo {
  index: number;
  element: Element;
  text: string;
  wordCount: number;
  hasLink: boolean;
  isFirstParagraph: boolean;
  isLastParagraph: boolean;
  isSpecialSection: boolean;
}

function analyzeParagraphs(doc: Document): ParagraphInfo[] {
  const containers = Array.from(doc.querySelectorAll('p, li'));
  const total = containers.length;

  return containers.map((el, index) => {
    const text = el.textContent || '';
    const hasLink = el.querySelectorAll('a').length > 0;

    const isSpecialSection = Boolean(
      el.closest('.sota-faq-section, .sota-faq, .sota-references, .sota-key-takeaways, ' +
        '.sota-conclusion, .verification-footer-sota, [class*="faq"], [class*="reference"], ' +
        'blockquote, table, [class*="takeaway"], details')
    );

    return {
      index,
      element: el,
      text,
      wordCount: getWordCount(text),
      hasLink,
      isFirstParagraph: index === 0,
      isLastParagraph: index === total - 1,
      isSpecialSection
    };
  });
}

function selectLinkableParagraphs(
  paragraphs: ParagraphInfo[],
  config: LinkEngineConfig = DEFAULT_CONFIG
): ParagraphInfo[] {
  return paragraphs.filter(p => {
    if (p.wordCount < 50) return false;
    if (p.hasLink) return false;
    if (p.isSpecialSection) return false;
    if (config.avoidFirstParagraph && p.isFirstParagraph) return false;
    if (config.avoidLastParagraph && p.isLastParagraph) return false;
    return true;
  });
}

function distributeLinksEvenly(
  linkableParagraphs: ParagraphInfo[],
  targetLinkCount: number
): number[] {
  if (linkableParagraphs.length === 0 || targetLinkCount === 0) return [];

  const total = linkableParagraphs.length;
  const actualLinks = Math.min(targetLinkCount, total);

  if (actualLinks === 1) {
    return [Math.floor(total / 2)];
  }

  const indices: number[] = [];
  const step = (total - 1) / (actualLinks - 1);

  for (let i = 0; i < actualLinks; i++) {
    const idx = Math.round(i * step);
    if (!indices.includes(idx)) {
      indices.push(idx);
    }
  }

  return indices;
}

export function processContentWithInternalLinks(
  html: string,
  availablePages: InternalPage[],
  baseUrl: string,
  config: LinkEngineConfig = DEFAULT_CONFIG
): {
  html: string;
  placements: LinkPlacement[];
  stats: { total: number; successful: number; failed: number };
} {
  if (!html || availablePages.length === 0) {
    return { html, placements: [], stats: { total: 0, successful: 0, failed: 0 } };
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const paragraphs = analyzeParagraphs(doc);
  const linkable = selectLinkableParagraphs(paragraphs, config);

  const targetCount = Math.min(
    Math.max(config.minLinksPerPost, Math.floor(linkable.length / 3)),
    config.maxLinksPerPost
  );

  const selectedIndices = distributeLinksEvenly(linkable, targetCount);

  const cleanBaseUrl = baseUrl.replace(/\/+$/, '');
  const usedSlugs = new Set<string>();
  const placements: LinkPlacement[] = [];
  let successful = 0;
  let failed = 0;

  const shuffledPages = [...availablePages].sort(() => Math.random() - 0.5);

  for (const localIdx of selectedIndices) {
    const paragraph = linkable[localIdx];
    if (!paragraph) continue;

    let linkPlaced = false;

    for (const page of shuffledPages) {
      if (usedSlugs.has(page.slug)) continue;

      const anchor = findBestAnchorInParagraph(paragraph.text, page, config);
      if (!anchor) continue;

      const targetUrl = page.url || `${cleanBaseUrl}/${page.slug}/`;
      const escaped = escapeRegExp(anchor.anchor);
      const regex = new RegExp(`\\b(${escaped})\\b(?![^<]*<\\/a>)`, 'i');

      const originalHtml = paragraph.element.innerHTML;
      const linkHtml = `<a href="${targetUrl}" style="color:#2563eb;text-decoration:underline;text-underline-offset:3px;font-weight:500;">$1</a>`;
      const newHtml = originalHtml.replace(regex, linkHtml);

      if (newHtml !== originalHtml && newHtml.includes(targetUrl)) {
        paragraph.element.innerHTML = newHtml;
        usedSlugs.add(page.slug);

        placements.push({
          paragraphIndex: paragraph.index,
          anchorText: anchor.anchor,
          targetSlug: page.slug,
          targetTitle: page.title,
          targetUrl
        });

        successful++;
        linkPlaced = true;
        console.log(`[SOTALinkEngine] Placed: "${anchor.anchor}" → ${page.slug}`);
        break;
      }
    }

    if (!linkPlaced) {
      failed++;
    }
  }

  return {
    html: doc.body.innerHTML,
    placements,
    stats: {
      total: selectedIndices.length,
      successful,
      failed
    }
  };
}

export function generateLinkCandidateMarkers(
  availablePages: InternalPage[],
  count: number = 6
): string {
  const shuffled = [...availablePages].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, count);

  return selected.map(page => {
    const titleWords = page.title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 3 && !FORBIDDEN_ANCHOR_STARTS.has(w));

    const slugWords = page.slug
      .split('-')
      .filter(w => w.length > 3);

    const keyTerms = [...new Set([...titleWords, ...slugWords])].slice(0, 3);

    return `Target: "${page.title}" (/${page.slug}/) - Key terms: ${keyTerms.join(', ')}`;
  }).join('\n');
}

export function createSOTALinkEngine(customConfig?: Partial<LinkEngineConfig>) {
  const config = { ...DEFAULT_CONFIG, ...customConfig };

  return {
    config,
    validate: (anchor: string) => validateAnchorText(anchor, config),
    process: (html: string, pages: InternalPage[], baseUrl: string) =>
      processContentWithInternalLinks(html, pages, baseUrl, config),
    generateMarkers: (pages: InternalPage[], count?: number) =>
      generateLinkCandidateMarkers(pages, count)
  };
}

export default createSOTALinkEngine;
