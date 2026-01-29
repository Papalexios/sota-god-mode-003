// =============================================================================
// YOUTUBE SERVICE v1.0 - Enterprise YouTube Integration via Serper API
// =============================================================================

import { fetchWithProxies } from './contentUtils';

export interface YouTubeSearchResult {
  title: string;
  videoId: string;
  channel: string;
  description: string;
  thumbnail: string;
  publishedAt?: string;
  viewCount?: string;
  duration?: string;
}

export interface YouTubeEmbedOptions {
  style: 'minimal' | 'featured' | 'card';
  autoplay: boolean;
  showRelated: boolean;
  showInfo: boolean;
}

const DEFAULT_EMBED_OPTIONS: YouTubeEmbedOptions = {
  style: 'featured',
  autoplay: false,
  showRelated: false,
  showInfo: true
};

/**
 * Search for YouTube videos via Serper API
 */
export async function searchYouTubeVideos(
  keyword: string,
  serperApiKey: string,
  maxResults: number = 5
): Promise<YouTubeSearchResult[]> {
  if (!serperApiKey) {
    console.warn('[YouTubeService] No Serper API key provided');
    return [];
  }

  try {
    // Build highly specific queries for maximum relevance
    const currentYear = new Date().getFullYear();

    const queries = [
      `"${keyword}" tutorial ${currentYear}`,
      `"${keyword}" complete guide ${currentYear}`,
      `"${keyword}" explained ${currentYear}`,
      `${keyword} how to ${currentYear} OR ${currentYear - 1}`,
      `${keyword} beginner guide tutorial`
    ];

    console.log(`[YouTubeService] Searching with ${queries.length} optimized queries`);

    const allResults: YouTubeSearchResult[] = [];

    for (const query of queries) {
      try {
        const response = await fetchWithProxies('https://google.serper.dev/videos', {
          method: 'POST',
          headers: {
            'X-API-KEY': serperApiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ q: query, num: 10 })
        });

        if (!response.ok) continue;

        const data = await response.json();
        const videos = data.videos || [];

        for (const video of videos) {
          if (!video.link?.includes('youtube.com') && !video.link?.includes('youtu.be')) {
            continue;
          }

          const videoId = extractVideoId(video.link);
          if (!videoId) continue;

          // Check for duplicates
          if (allResults.some(r => r.videoId === videoId)) continue;

          allResults.push({
            title: video.title || '',
            videoId,
            channel: video.channel || 'YouTube',
            description: video.snippet || video.description || '',
            thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
            duration: video.duration,
            publishedAt: video.date
          });
        }
      } catch (e) {
        console.error('[YouTubeService] Search query failed:', query);
      }
    }

    // Score and sort results
    const scored = allResults.map(video => ({
      ...video,
      score: calculateRelevanceScore(video, keyword)
    }));

    scored.sort((a, b) => b.score - a.score);

    return scored.slice(0, maxResults);
  } catch (error) {
    console.error('[YouTubeService] Search failed:', error);
    return [];
  }
}

/**
 * Extract video ID from YouTube URL
 */
function extractVideoId(url: string): string | null {
  if (!url) return null;

  // Standard YouTube URL
  if (url.includes('youtube.com/watch')) {
    try {
      const urlObj = new URL(url);
      return urlObj.searchParams.get('v');
    } catch {
      return null;
    }
  }

  // Short YouTube URL
  if (url.includes('youtu.be/')) {
    const match = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  }

  // Embed URL
  if (url.includes('youtube.com/embed/')) {
    const match = url.match(/embed\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  }

  return null;
}

/**
 * Calculate relevance score for a video
 */
function calculateRelevanceScore(video: YouTubeSearchResult, keyword: string): number {
  const titleLower = video.title.toLowerCase();
  const descriptionLower = (video.description || '').toLowerCase();
  const keywordLower = keyword.toLowerCase();
  const keywordWords = keywordLower.split(/\s+/).filter(w => w.length > 2);

  let score = 0;

  // Exact keyword match in title - HIGHEST priority
  if (titleLower.includes(keywordLower)) score += 100;

  // Individual keyword word matches
  for (const word of keywordWords) {
    if (titleLower.includes(word)) score += 15;
    if (descriptionLower.includes(word)) score += 5;
  }

  // Educational quality indicators
  if (titleLower.includes('tutorial')) score += 30;
  if (titleLower.includes('complete guide') || titleLower.includes('full guide')) score += 35;
  if (titleLower.includes('step by step') || titleLower.includes('step-by-step')) score += 25;
  if (titleLower.includes('how to')) score += 20;
  if (titleLower.includes('explained')) score += 15;
  if (titleLower.includes('beginner')) score += 12;
  if (titleLower.includes('ultimate')) score += 10;
  if (titleLower.includes('comprehensive')) score += 10;

  // Authority indicators
  const authorityChannels = ['official', 'academy', 'institute', 'university', 'professional'];
  const channelLower = video.channel.toLowerCase();
  if (authorityChannels.some(term => channelLower.includes(term))) score += 20;

  // Freshness bonus (recent = more relevant)
  const currentYear = new Date().getFullYear();
  if (titleLower.includes(String(currentYear))) score += 40;
  if (titleLower.includes(String(currentYear - 1))) score += 25;
  if (titleLower.includes('2024') || titleLower.includes('2025') || titleLower.includes('2026')) {
    score += 20;
  }

  // Duration indicators (longer = more comprehensive)
  if (video.duration) {
    const durationLower = video.duration.toLowerCase();
    // Prefer 10-30 minute videos (sweet spot for tutorials)
    if (durationLower.match(/1[0-9]:|2[0-9]:/)) score += 15;
    // Very short videos might be low quality
    if (durationLower.match(/^[0-2]:/)) score -= 10;
  }

  // STRONG penalties for irrelevant content
  const badIndicators = [
    'reaction', 'reacting', 'react to',
    'unboxing', 'haul',
    'vlog', 'daily vlog',
    'drama', 'exposed',
    'clickbait', 'shocking',
    'prank', 'challenge',
    'review only', 'first look',
    'livestream', 'stream',
    'compilation', 'funny moments'
  ];

  for (const bad of badIndicators) {
    if (titleLower.includes(bad)) score -= 50;
  }

  // Penalty for very short titles (often low quality)
  if (video.title.length < 20) score -= 15;

  // Penalty for ALL CAPS titles (often clickbait)
  if (video.title === video.title.toUpperCase() && video.title.length > 5) {
    score -= 25;
  }

  // Penalty for excessive punctuation (clickbait indicator)
  const punctuationCount = (video.title.match(/[!?]{2,}/g) || []).length;
  if (punctuationCount > 0) score -= (punctuationCount * 15);

  return Math.max(0, score); // Never return negative scores
}

/**
 * Generate embed HTML for a YouTube video
 */
export function generateYouTubeEmbed(
  video: YouTubeSearchResult,
  options: Partial<YouTubeEmbedOptions> = {}
): string {
  const opts = { ...DEFAULT_EMBED_OPTIONS, ...options };
  
  const embedParams = new URLSearchParams({
    rel: opts.showRelated ? '1' : '0',
    modestbranding: '1',
    autoplay: opts.autoplay ? '1' : '0'
  });

  if (opts.style === 'minimal') {
    return `
<div class="youtube-embed-minimal" style="margin: 1.5rem 0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
  <div style="position: relative; padding-bottom: 56.25%; height: 0;">
    <iframe 
      src="https://www.youtube.com/embed/${video.videoId}?${embedParams.toString()}"
      title="${video.title.replace(/"/g, '&quot;')}"
      frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen
      loading="lazy"
      style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
    ></iframe>
  </div>
</div>`;
  }

  if (opts.style === 'card') {
    return `
<div class="youtube-embed-card" style="margin: 2rem 0; background: #f8fafc; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
  <div style="position: relative; padding-bottom: 56.25%; height: 0;">
    <iframe 
      src="https://www.youtube.com/embed/${video.videoId}?${embedParams.toString()}"
      title="${video.title.replace(/"/g, '&quot;')}"
      frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen
      loading="lazy"
      style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
    ></iframe>
  </div>
  <div style="padding: 1rem;">
    <h4 style="margin: 0 0 0.5rem; font-size: 1rem; color: #1e293b;">${video.title}</h4>
    <p style="margin: 0; font-size: 0.85rem; color: #64748b;">${video.channel}</p>
  </div>
</div>`;
  }

  // Featured (default)
  return `
<div class="youtube-embed-featured" style="margin: 2.5rem 0; background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.3);">
  <div style="padding: 1.25rem 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.1);">
    <div style="display: flex; align-items: center; gap: 0.75rem;">
      <span style="font-size: 1.5rem;">📹</span>
      <div>
        <h4 style="margin: 0; color: #E2E8F0; font-size: 1rem; font-weight: 600;">Recommended Video</h4>
        <p style="margin: 0.25rem 0 0; color: #94A3B8; font-size: 0.85rem;">${video.channel}</p>
      </div>
    </div>
  </div>
  <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;">
    <iframe 
      src="https://www.youtube.com/embed/${video.videoId}?${embedParams.toString()}"
      title="${video.title.replace(/"/g, '&quot;')}"
      frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowfullscreen
      loading="lazy"
      style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
    ></iframe>
  </div>
  <div style="padding: 1rem 1.5rem; background: rgba(0,0,0,0.2);">
    <p style="margin: 0; color: #CBD5E1; font-size: 0.9rem; line-height: 1.5;">
      <strong style="color: #E2E8F0;">${video.title}</strong>
    </p>
  </div>
</div>`;
}

/**
 * Find and embed the most relevant YouTube video for a topic
 */
export async function findAndEmbedYouTubeVideo(
  topic: string,
  serperApiKey: string,
  options?: Partial<YouTubeEmbedOptions>
): Promise<{ html: string; video: YouTubeSearchResult | null }> {
  const videos = await searchYouTubeVideos(topic, serperApiKey, 1);
  
  if (videos.length === 0) {
    return { html: '', video: null };
  }

  const video = videos[0];
  const html = generateYouTubeEmbed(video, options);
  
  return { html, video };
}

export default {
  searchYouTubeVideos,
  generateYouTubeEmbed,
  findAndEmbedYouTubeVideo,
  extractVideoId
};

