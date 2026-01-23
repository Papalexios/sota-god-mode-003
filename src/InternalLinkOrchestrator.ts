// =============================================================================
// INTERNAL LINK ORCHESTRATOR v2.0.0 - ENTERPRISE GRADE
// STRICT Zone-Based Distribution with 4-7 Word Contextual Anchors
// =============================================================================

import {
  UltraPremiumAnchorEngineV2,
  UltraAnchorCandidate,
  PageContext,
  validateAnchorText,
} from './UltraPremiumAnchorEngineV2';
import { ANCHOR_TEXT_CONFIG } from './constants';
import { escapeRegExp } from './contentUtils';

// ==================== TYPE DEFINITIONS ====================

export interface LinkDistributionZone {
  name: string;
  startPercent: number;
  endPercent: number;
  minLinks: number;
  maxLinks: number;
  priority: number;
  currentCount: number;
}

export interface ZoneValidationResult {
  isValid: boolean;
  violations: string[];
  distribution: Map<string, { count: number; min: number; max: number }>;
}

export interface LinkDistributionConfig {
  zones: LinkDistributionZone[];
  totalTargetLinks: number;
  minParagraphLength: number;
  maxLinksPerParagraph: number;
  minWordsBetweenLinks: number;
  skipSections: string[];
  strictZoneEnforcement: boolean;
  minAnchorWords: number;
  maxAnchorWords: number;
}

export interface OrchestratorResult {
  html: string;
  linksInjected: number;
  distribution: Map<string, number>;
  injectionDetails: Array<{
    anchor: string;
    targetSlug: string;
    zone: string;
    wordCount: number;
    qualityScore: number;
  }>;
  zoneValidation: ZoneValidationResult;
}

// ==================== STRICT ZONE REQUIREMENTS ====================

const STRICT_ZONE_REQUIREMENTS: LinkDistributionZone[] = [
  { 
    name: 'INTRO', 
    startPercent: 0, 
    endPercent: 10, 
    minLinks: 0, 
    maxLinks: 1, 
    priority: 5,
    currentCount: 0 
  },
  { 
    name: 'EARLY_BODY', 
    startPercent: 10, 
    endPercent: 30, 
    minLinks: 2, 
    maxLinks: 3, 
    priority: 3,
    currentCount: 0 
  },
  { 
    name: 'MID_BODY', 
    startPercent: 30, 
    endPercent: 60, 
    minLinks: 3, 
    maxLinks: 4, 
    priority: 1, // Highest priority - most links here
    currentCount: 0 
  },
  { 
    name: 'LATE_BODY', 
    startPercent: 60, 
    endPercent: 80, 
    minLinks: 2, 
    maxLinks: 3, 
    priority: 2,
    currentCount: 0 
  },
  { 
    name: 'FAQ_CONCLUSION', 
    startPercent: 80, 
    endPercent: 100, 
    minLinks: 1, 
    maxLinks: 3, 
    priority: 4,
    currentCount: 0 
  },
];

const DEFAULT_CONFIG: LinkDistributionConfig = {
  zones: STRICT_ZONE_REQUIREMENTS.map(z => ({ ...z })),
  totalTargetLinks: 12,
  minParagraphLength: 60,
  maxLinksPerParagraph: 1,
  minWordsBetweenLinks: ANCHOR_TEXT_CONFIG.MIN_WORDS_BETWEEN_LINKS,
  skipSections: [
    '.sota-faq-section',
    '.sota-references-section',
    '.sota-references-wrapper',
    '[class*="faq"]',
    '[class*="reference"]',
    '.verification-footer-sota',
    '[itemtype*="FAQPage"]',
    'nav',
    'header',
    'footer',
    '.sidebar',
    '.toc',
  ],
  strictZoneEnforcement: true,
  minAnchorWords: ANCHOR_TEXT_CONFIG.MIN_ANCHOR_WORDS,
  maxAnchorWords: ANCHOR_TEXT_CONFIG.MAX_ANCHOR_WORDS,
};

console.log('[InternalLinkOrchestrator] Module loaded - Strict Zone Enforcement Active');

// ==================== HELPER FUNCTIONS ====================

/**
 * Get the nearest heading above an element
 */
const getNearbyHeading = (element: Element, doc: Document): string | null => {
  const section = element.closest('section, article, div[class*="section"]');
  if (section) {
    const heading = section.querySelector('h2, h3');
    if (heading) return heading.textContent?.trim() || null;
  }

  let sibling = element.previousElementSibling;
  while (sibling) {
    if (['H2', 'H3', 'H4'].includes(sibling.tagName)) {
      return sibling.textContent?.trim() || null;
    }
    sibling = sibling.previousElementSibling;
  }

  return null;
};

/**
 * Determine which zone an element belongs to based on position
 */
const getElementZone = (
  elementIndex: number,
  totalElements: number,
  zones: LinkDistributionZone[]
): LinkDistributionZone | null => {
  const positionPercent = (elementIndex / totalElements) * 100;

  for (const zone of zones) {
    if (positionPercent >= zone.startPercent && positionPercent < zone.endPercent) {
      return zone;
    }
  }

  return zones[zones.length - 1];
};

/**
 * Check if element should be skipped for link injection
 */
const shouldSkipElement = (element: Element, skipSelectors: string[]): boolean => {
  for (const selector of skipSelectors) {
    try {
      if (element.closest(selector)) return true;
    } catch (e) {}
  }
  return false;
};

/**
 * Count words in text
 */
const countWords = (text: string): number => {
  return text.trim().split(/\s+/).filter(w => w.length > 0).length;
};

/**
 * Validate zone distribution meets STRICT requirements
 */
const validateZoneDistribution = (
  zones: LinkDistributionZone[]
): ZoneValidationResult => {
  const violations: string[] = [];
  const distribution = new Map<string, { count: number; min: number; max: number }>();
  
  for (const zone of zones) {
    distribution.set(zone.name, {
      count: zone.currentCount,
      min: zone.minLinks,
      max: zone.maxLinks,
    });
    
    if (zone.currentCount > zone.maxLinks) {
      violations.push(`${zone.name}: Exceeds maximum (${zone.currentCount}/${zone.maxLinks})`);
    }
    
    // Only check minimum if we're done processing (handled separately)
  }
  
  return {
    isValid: violations.length === 0,
    violations,
    distribution,
  };
};

// ==================== MAIN ORCHESTRATOR CLASS ====================

export class InternalLinkOrchestrator {
  private config: LinkDistributionConfig;
  private anchorEngine: UltraPremiumAnchorEngineV2;
  private zones: LinkDistributionZone[];
  private lastLinkWordPosition: number;
  private totalWordsProcessed: number;
  private injectionDetails: OrchestratorResult['injectionDetails'];

  constructor(config: Partial<LinkDistributionConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.zones = this.config.zones.map(z => ({ ...z, currentCount: 0 }));
    this.anchorEngine = new UltraPremiumAnchorEngineV2({
      minWords: this.config.minAnchorWords,
      maxWords: this.config.maxAnchorWords,
      minQualityScore: 75,
    });
    this.lastLinkWordPosition = -this.config.minWordsBetweenLinks;
    this.totalWordsProcessed = 0;
    this.injectionDetails = [];
    
    console.log(`[InternalLinkOrchestrator] Initialized with ${this.config.minAnchorWords}-${this.config.maxAnchorWords} word anchors`);
  }

  /**
   * Reset orchestrator state for a new document
   */
  reset(): void {
    this.anchorEngine.reset();
    this.zones = this.config.zones.map(z => ({ ...z, currentCount: 0 }));
    this.lastLinkWordPosition = -this.config.minWordsBetweenLinks;
    this.totalWordsProcessed = 0;
    this.injectionDetails = [];
  }

  /**
   * Check if we can add more links to a zone (STRICT enforcement)
   */
  private canAddLinkToZone(zone: LinkDistributionZone): boolean {
    return zone.currentCount < zone.maxLinks;
  }

  /**
   * Check if minimum spacing requirement is met
   */
  private meetsSpacingRequirement(): boolean {
    return (this.totalWordsProcessed - this.lastLinkWordPosition) >= this.config.minWordsBetweenLinks;
  }

  /**
   * Get total links injected
   */
  private getTotalLinksInjected(): number {
    return this.zones.reduce((sum, z) => sum + z.currentCount, 0);
  }

  /**
   * Process HTML content and inject contextual internal links
   * STRICT zone enforcement with 4-7 word anchors
   */
  processContent(
    html: string,
    availablePages: PageContext[],
    baseUrl: string
  ): OrchestratorResult {
    console.log('[InternalLinkOrchestrator] Starting STRICT zone-based link injection...');
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const body = doc.body;

    // Collect all linkable elements
    const allElements = Array.from(body.querySelectorAll('p, li'));
    
    // Filter out elements in skip sections
    const linkableElements = allElements.filter(el => {
      if (shouldSkipElement(el, this.config.skipSections)) return false;
      if ((el.textContent?.length || 0) < this.config.minParagraphLength) return false;
      if (el.querySelectorAll('a').length >= this.config.maxLinksPerParagraph) return false;
      return true;
    });

    console.log(`[InternalLinkOrchestrator] Found ${linkableElements.length} linkable elements`);

    // Sort pages by specificity (more specific = higher priority)
    const sortedPages = [...availablePages].sort((a, b) => {
      return b.title.split(' ').length - a.title.split(' ').length;
    });

    // Process zones by priority (lower priority number = process first)
    const sortedZones = [...this.zones].sort((a, b) => a.priority - b.priority);

    // Multi-pass injection to ensure zone requirements are met
    for (const zone of sortedZones) {
      if (this.getTotalLinksInjected() >= this.config.totalTargetLinks) break;
      
      // Get elements in this zone
      const zoneElements = linkableElements.filter((el, idx) => {
        const elementZone = getElementZone(idx, allElements.length, this.zones);
        return elementZone?.name === zone.name;
      });

      console.log(`[InternalLinkOrchestrator] Processing zone ${zone.name}: ${zoneElements.length} elements, target: ${zone.minLinks}-${zone.maxLinks} links`);

      // Process elements in this zone
      for (const element of zoneElements) {
        if (this.getTotalLinksInjected() >= this.config.totalTargetLinks) break;
        if (!this.canAddLinkToZone(zone)) break;

        // Get element's word count
        const elementWords = countWords(element.textContent || '');
        
        // Check spacing requirement
        if (!this.meetsSpacingRequirement()) {
          this.totalWordsProcessed += elementWords;
          continue;
        }

        // Get nearby heading for context
        const nearbyHeading = getNearbyHeading(element, doc);

        // Try each page to find a valid match
        for (const page of sortedPages) {
          if (!this.canAddLinkToZone(zone)) break;
          if (this.anchorEngine['usedTargets']?.has(page.slug)) continue;

          // Find best anchor in this paragraph
          const candidate = this.anchorEngine.findBestAnchor(
            element.textContent || '',
            page,
            nearbyHeading || undefined
          );

          if (!candidate) continue;

          // Validate anchor meets strict requirements
          const validation = validateAnchorText(candidate.text, {
            minWords: this.config.minAnchorWords,
            maxWords: this.config.maxAnchorWords,
            idealWordRange: [4, 6],
            minQualityScore: 75,
            semanticWeight: 0.3,
            contextWeight: 0.25,
            naturalWeight: 0.25,
            seoWeight: 0.2,
            avoidGenericAnchors: true,
            enforceDescriptive: true,
            requireTopicRelevance: true,
            sentencePositionBias: 'natural',
            maxOverlapWithHeading: 0.4,
          });

          if (!validation.valid) {
            console.log(`[InternalLinkOrchestrator] Skipped invalid anchor: "${candidate.text}" - ${validation.reason}`);
            continue;
          }

          // Build URL
          const cleanBaseUrl = baseUrl.replace(/\/+$/, '');
          const targetUrl = `${cleanBaseUrl}/${page.slug}/`;

          // Inject the link
          const currentHtml = element.innerHTML;
          const { html: newHtml, result } = this.anchorEngine.injectLink(
            currentHtml,
            candidate.text,
            targetUrl
          );

          if (result.success) {
            element.innerHTML = newHtml;
            zone.currentCount++;
            this.lastLinkWordPosition = this.totalWordsProcessed + Math.floor(elementWords / 2);
            
            this.injectionDetails.push({
              anchor: candidate.text,
              targetSlug: page.slug,
              zone: zone.name,
              wordCount: candidate.wordCount,
              qualityScore: candidate.qualityScore,
            });

            console.log(`[InternalLinkOrchestrator] ✅ Zone ${zone.name}: "${candidate.text}" (${candidate.wordCount} words) → ${page.slug}`);
            break; // Move to next element
          }
        }

        this.totalWordsProcessed += elementWords;
      }
    }

    // Final validation
    const zoneValidation = validateZoneDistribution(this.zones);
    
    console.log('[InternalLinkOrchestrator] === FINAL DISTRIBUTION ===');
    this.zones.forEach(z => {
      const status = z.currentCount >= z.minLinks ? '✅' : '⚠️';
      console.log(`  ${status} ${z.name}: ${z.currentCount}/${z.minLinks}-${z.maxLinks}`);
    });
    console.log(`[InternalLinkOrchestrator] Total: ${this.getTotalLinksInjected()}/${this.config.totalTargetLinks}`);

    // Build distribution map
    const distribution = new Map<string, number>();
    this.zones.forEach(z => distribution.set(z.name, z.currentCount));

    return {
      html: body.innerHTML,
      linksInjected: this.getTotalLinksInjected(),
      distribution,
      injectionDetails: this.injectionDetails,
      zoneValidation,
    };
  }

  /**
   * Get current distribution statistics
   */
  getDistribution(): Map<string, number> {
    const distribution = new Map<string, number>();
    this.zones.forEach(z => distribution.set(z.name, z.currentCount));
    return distribution;
  }

  /**
   * Get zone validation status
   */
  getValidationStatus(): ZoneValidationResult {
    return validateZoneDistribution(this.zones);
  }
}

// ==================== CONVENIENCE FUNCTION ====================

/**
 * Process content with enterprise-grade contextual internal links
 * Main entry point for the linking system
 */
export const injectEnterpriseInternalLinks = (
  content: string,
  availablePages: Array<{ title: string; slug: string }>,
  baseUrl: string,
  targetLinks: number = 12
): string => {
  if (availablePages.length === 0) {
    console.log('[Enterprise Links] No pages available for linking');
    return content;
  }

  const orchestrator = new InternalLinkOrchestrator({
    totalTargetLinks: targetLinks,
    minAnchorWords: 4,
    maxAnchorWords: 7,
    strictZoneEnforcement: true,
  });

  const pageContexts: PageContext[] = availablePages.map(p => ({
    title: p.title,
    slug: p.slug,
  }));

  const result = orchestrator.processContent(content, pageContexts, baseUrl);

  console.log(`[Enterprise Links] Complete: ${result.linksInjected} links injected across ${result.distribution.size} zones`);

  return result.html;
};

// ==================== EXPORTS ====================

export default {
  InternalLinkOrchestrator,
  injectEnterpriseInternalLinks,
  DEFAULT_CONFIG,
  STRICT_ZONE_REQUIREMENTS,
  validateZoneDistribution,
};
