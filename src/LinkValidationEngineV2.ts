// =============================================================================
// LINK VALIDATION ENGINE V2.0.0 - SOTA Enterprise-Grade Link Fixer
// CRITICAL FIX: Resolves 404 errors and anchor text corruption
// =============================================================================

import { escapeRegExp } from './contentUtils';

// ==================== TYPE DEFINITIONS ====================

export interface ValidatedPage {
  title: string;
  slug: string;
  fullUrl: string;
  isValid: boolean;
  keywords: string[];
}

export interface AnchorMatch {
  originalText: string;
  startIndex: number;
  endIndex: number;
  exactMatch: boolean;
}

export interface LinkInjectionResultV2 {
  success: boolean;
  anchor: string;
  targetUrl: string;
  targetSlug: string;
  validationStatus: 'verified' | 'skipped' | 'failed';
  reason?: string;
}

export interface LinkValidationConfig {
  validateUrls: boolean;
  requireExactAnchorMatch: boolean;
  minAnchorWords: number;
  maxAnchorWords: number;
  skipExistingLinks: boolean;
  preserveAnchorCase: boolean;
}

// ==================== DEFAULT CONFIG ====================

const DEFAULT_CONFIG: LinkValidationConfig = {
  validateUrls: true,
  requireExactAnchorMatch: true,
  minAnchorWords: 2,
  maxAnchorWords: 8,
  skipExistingLinks: true,
  preserveAnchorCase: true,
};

// ==================== URL VALIDATION ====================

/**
 * CRITICAL: Validates that a URL will not result in 404
 * Checks against known valid slugs from the page list
 */
export const validateSlugExists = (
  slug: string,
  validSlugs: Set<string>
): boolean => {
  if (!slug || slug.trim() === '') return false;
  
  const normalizedSlug = slug
    .toLowerCase()
    .replace(/^\/+|\/+$/g, '')
    .trim();
  
  return validSlugs.has(normalizedSlug);
};

/**
 * Build a complete, validated URL from base and slug
 */
export const buildValidatedUrl = (
  baseUrl: string,
  slug: string,
  validSlugs: Set<string>
): string | null => {
  if (!validateSlugExists(slug, validSlugs)) {
    console.warn(`[LinkValidation] BLOCKED: Slug "${slug}" not in valid slugs list`);
    return null;
  }
  
  const cleanBase = baseUrl.replace(/\/+$/, '');
  const cleanSlug = slug.replace(/^\/+|\/+$/, '');
  
  return `${cleanBase}/${cleanSlug}/`;
};

// ==================== ANCHOR TEXT VALIDATION ====================

/**
 * CRITICAL: Find EXACT text match in HTML content
 * This prevents anchor text corruption by ensuring we only link
 * text that exists exactly as-is in the document
 */
export const findExactAnchorMatch = (
  html: string,
  anchorText: string
): AnchorMatch | null => {
  if (!anchorText || anchorText.trim().length < 3) return null;
  
  // Create case-sensitive regex for exact match
  const escapedAnchor = escapeRegExp(anchorText);
  const exactRegex = new RegExp(`\\b${escapedAnchor}\\b`, 'g');
  
  const match = exactRegex.exec(html);
  
  if (!match) {
    return null;
  }
  
  // Verify the match is not inside an existing link
  const beforeMatch = html.substring(Math.max(0, match.index - 200), match.index);
  const afterMatch = html.substring(match.index, Math.min(html.length, match.index + 200));
  
  // Check if we're inside an <a> tag
  const lastOpenA = beforeMatch.lastIndexOf('<a ');
  const lastCloseA = beforeMatch.lastIndexOf('</a>');
  
  if (lastOpenA > lastCloseA) {
    // We're inside an anchor tag, skip
    return null;
  }
  
  return {
    originalText: match[0],
    startIndex: match.index,
    endIndex: match.index + match[0].length,
    exactMatch: true,
  };
};

/**
 * Extract potential anchor phrases from text
 * Returns phrases that exist EXACTLY in the content
 */
export const extractExactPhrases = (
  text: string,
  minWords: number = 2,
  maxWords: number = 8
): string[] => {
  const phrases: string[] = [];
  
  // Remove HTML tags for phrase extraction
  const plainText = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const words = plainText.split(' ').filter(w => w.length > 0);
  
  if (words.length < minWords) return phrases;
  
  // Generate all possible phrases of valid length
  for (let len = minWords; len <= Math.min(maxWords, words.length); len++) {
    for (let start = 0; start <= words.length - len; start++) {
      const phrase = words.slice(start, start + len).join(' ');
      
      // Only include if it doesn't start/end with common stopwords
      const firstWord = words[start].toLowerCase();
      const lastWord = words[start + len - 1].toLowerCase();
      
      const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
      
      if (!stopWords.includes(firstWord) && !stopWords.includes(lastWord)) {
        phrases.push(phrase);
      }
    }
  }
  
  return phrases;
};

// ==================== LINK INJECTION ====================

/**
 * CRITICAL: Inject link with EXACT text preservation
 * This function NEVER modifies the anchor text
 */
export const injectLinkExact = (
  html: string,
  anchorText: string,
  targetUrl: string
): { html: string; success: boolean } => {
  const match = findExactAnchorMatch(html, anchorText);
  
  if (!match) {
    return { html, success: false };
  }
  
  // Use the EXACT matched text, preserving case and spacing
  const exactText = match.originalText;
  const linkHtml = `<a href="${targetUrl}">${exactText}</a>`;
  
  const newHtml = 
    html.substring(0, match.startIndex) +
    linkHtml +
    html.substring(match.endIndex);
  
  return { html: newHtml, success: true };
};

// ==================== MAIN ENGINE CLASS ====================

export class LinkValidationEngineV2 {
  private config: LinkValidationConfig;
  private validSlugs: Set<string>;
  private usedAnchors: Set<string>;
  private usedUrls: Set<string>;
  private injectionCount: number;
  
  constructor(
    validPages: Array<{ slug: string; title: string }>,
    config: Partial<LinkValidationConfig> = {}
  ) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.validSlugs = new Set(
      validPages.map(p => p.slug.toLowerCase().replace(/^\/+|\/+$/g, ''))
    );
    this.usedAnchors = new Set();
    this.usedUrls = new Set();
    this.injectionCount = 0;
    
    console.log(`[LinkValidationEngineV2] Initialized with ${this.validSlugs.size} valid slugs`);
  }
  
  /**
   * Reset engine state for new document
   */
  reset(): void {
    this.usedAnchors.clear();
    this.usedUrls.clear();
    this.injectionCount = 0;
  }
  
  /**
   * CRITICAL: Main method to inject a validated link
   * Returns null if validation fails - NEVER creates broken links
   */
  injectValidatedLink(
    html: string,
    anchorText: string,
    slug: string,
    baseUrl: string
  ): LinkInjectionResultV2 | null {
    // Step 1: Validate the slug exists
    const targetUrl = buildValidatedUrl(baseUrl, slug, this.validSlugs);
    
    if (!targetUrl) {
      console.warn(`[LinkValidationEngineV2] REJECTED: Invalid slug "${slug}"`);
      return {
        success: false,
        anchor: anchorText,
        targetUrl: '',
        targetSlug: slug,
        validationStatus: 'failed',
        reason: `Slug "${slug}" not found in valid pages list`,
      };
    }
    
    // Step 2: Check if URL already used
    if (this.usedUrls.has(targetUrl)) {
      return {
        success: false,
        anchor: anchorText,
        targetUrl,
        targetSlug: slug,
        validationStatus: 'skipped',
        reason: 'URL already linked in this document',
      };
    }
    
    // Step 3: Find EXACT anchor match in HTML
    const anchorMatch = findExactAnchorMatch(html, anchorText);
    
    if (!anchorMatch) {
      console.warn(`[LinkValidationEngineV2] REJECTED: Anchor "${anchorText}" not found exactly in content`);
      return {
        success: false,
        anchor: anchorText,
        targetUrl,
        targetSlug: slug,
        validationStatus: 'failed',
        reason: `Exact anchor text "${anchorText}" not found in content`,
      };
    }
    
    // Step 4: Check if anchor already used
    const normalizedAnchor = anchorMatch.originalText.toLowerCase();
    if (this.usedAnchors.has(normalizedAnchor)) {
      return {
        success: false,
        anchor: anchorText,
        targetUrl,
        targetSlug: slug,
        validationStatus: 'skipped',
        reason: 'Anchor text already used',
      };
    }
    
    // Step 5: Inject the link using EXACT matched text
    const { html: newHtml, success } = injectLinkExact(html, anchorMatch.originalText, targetUrl);
    
    if (success) {
      this.usedAnchors.add(normalizedAnchor);
      this.usedUrls.add(targetUrl);
      this.injectionCount++;
      
      console.log(`[LinkValidationEngineV2] SUCCESS: "${anchorMatch.originalText}" -> ${targetUrl}`);
      
      return {
        success: true,
        anchor: anchorMatch.originalText,
        targetUrl,
        targetSlug: slug,
        validationStatus: 'verified',
      };
    }
    
    return null;
  }
  
  /**
   * Process container element and inject best matching link
   */
  processElement(
    element: Element,
    availablePages: Array<{ title: string; slug: string; keywords?: string[] }>,
    baseUrl: string
  ): LinkInjectionResultV2 | null {
    const html = element.innerHTML;
    const text = element.textContent || '';
    
    if (text.length < 50) return null;
    
    // Extract potential phrases from content
    const phrases = extractExactPhrases(
      text,
      this.config.minAnchorWords,
      this.config.maxAnchorWords
    );
    
    // Try each page to find a match
    for (const page of availablePages) {
      if (this.usedUrls.has(`${baseUrl}/${page.slug}/`)) continue;
      
      // Generate anchor candidates from page title/keywords
      const pageKeywords = [
        page.title,
        ...(page.keywords || []),
        ...page.title.split(' ').filter(w => w.length > 4),
      ];
      
      // Find phrases that match page content
      for (const phrase of phrases) {
        const phraseLower = phrase.toLowerCase();
        
        for (const keyword of pageKeywords) {
          if (phraseLower.includes(keyword.toLowerCase()) || 
              keyword.toLowerCase().includes(phraseLower)) {
            
            // Attempt injection
            const result = this.injectValidatedLink(html, phrase, page.slug, baseUrl);
            
            if (result && result.success) {
              element.innerHTML = injectLinkExact(html, phrase, result.targetUrl).html;
              return result;
            }
          }
        }
      }
    }
    
    return null;
  }
  
  /**
   * Get statistics
   */
  getStats(): { injected: number; uniqueAnchors: number; uniqueUrls: number } {
    return {
      injected: this.injectionCount,
      uniqueAnchors: this.usedAnchors.size,
      uniqueUrls: this.usedUrls.size,
    };
  }
}

// ==================== CONVENIENCE FUNCTION ====================

/**
 * SOTA Enterprise Link Injection - Main Entry Point
 * GUARANTEES: No 404s, No anchor text corruption
 */
export const injectValidatedInternalLinks = (
  content: string,
  availablePages: Array<{ title: string; slug: string }>,
  baseUrl: string,
  targetLinks: number = 10
): { html: string; injected: number; results: LinkInjectionResultV2[] } => {
  if (availablePages.length === 0) {
    console.log('[LinkValidationEngineV2] No pages available');
    return { html: content, injected: 0, results: [] };
  }
  
  const engine = new LinkValidationEngineV2(availablePages);
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'text/html');
  const results: LinkInjectionResultV2[] = [];
  
  const paragraphs = Array.from(doc.body.querySelectorAll('p, li'));
  let injected = 0;
  
  for (const p of paragraphs) {
    if (injected >= targetLinks) break;
    
    const result = engine.processElement(p, availablePages, baseUrl);
    if (result) {
      results.push(result);
      if (result.success) injected++;
    }
  }
  
  console.log(`[LinkValidationEngineV2] Complete: ${injected}/${targetLinks} links injected`);
  
  return {
    html: doc.body.innerHTML,
    injected,
    results,
  };
};

// ==================== EXPORTS ====================

export default {
  LinkValidationEngineV2,
  validateSlugExists,
  buildValidatedUrl,
  findExactAnchorMatch,
  extractExactPhrases,
  injectLinkExact,
  injectValidatedInternalLinks,
  DEFAULT_CONFIG,
};
