// =============================================================================
// SOTA NEURONWRITER INTEGRATION v14.0 - CLOUDFLARE PAGES OPTIMIZED
// Auto-detects proxy: Cloudflare Pages Functions or Supabase Edge Functions
// =============================================================================

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const USE_CLOUDFLARE_PROXY = !SUPABASE_URL || SUPABASE_URL.trim() === '';

// ==================== TYPES ====================

export interface NeuronProject {
  project: string;
  name: string;
  engine: string;
  language: string;
}

export interface NeuronTerms {
  h1?: string;
  title?: string;
  h2?: string;
  h3?: string;
  content_basic?: string;
  content_extended?: string;
  entities_basic?: string;
  entities_extended?: string;
  questions?: string[];
  headings?: string[];
}

export interface NeuronWriterData {
  terms: string[];
  competitors: string[];
  questions: string[];
  headings: string[];
}

interface ProxyResponse {
  success: boolean;
  status?: number;
  data?: any;
  error?: string;
  type?: string;
}

// ==================== PROXY HELPER ====================

const callNeuronWriterProxy = async (
  endpoint: string,
  apiKey: string,
  method: string = 'GET',
  body?: Record<string, unknown>
): Promise<ProxyResponse> => {
  const proxyUrl = USE_CLOUDFLARE_PROXY
    ? '/api/neuronwriter'
    : `${SUPABASE_URL}/functions/v1/neuronwriter-proxy`;

  console.log(`[NeuronWriter] Using ${USE_CLOUDFLARE_PROXY ? 'Cloudflare Pages' : 'Supabase'} proxy`);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-NeuronWriter-Key': apiKey,
    };

    if (!USE_CLOUDFLARE_PROXY) {
      headers['Authorization'] = `Bearer ${SUPABASE_ANON_KEY}`;
    }

    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        endpoint,
        method,
        apiKey,
        body
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`Proxy error (${response.status}): ${errorText}`);
    }

    const result: ProxyResponse = await response.json();
    return result;
  } catch (error: any) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      throw new Error('Request timed out. The NeuronWriter API took too long to respond.');
    }

    throw error;
  }
};

// ==================== API FUNCTIONS ====================

export const listNeuronProjects = async (apiKey: string): Promise<NeuronProject[]> => {
  if (!apiKey || apiKey.trim().length < 10) {
    throw new Error('Invalid NeuronWriter API key. Please enter a valid key.');
  }

  console.log('[NeuronWriter] Fetching projects via Edge Function...');

  try {
    const result = await callNeuronWriterProxy('/list-projects', apiKey, 'POST', {});

    if (!result.success) {
      throw new Error(result.error || `API error: ${result.status}`);
    }

    const data = result.data;

    if (!data) {
      throw new Error('No data returned from NeuronWriter API');
    }

    const projects = Array.isArray(data) ? data : (data.projects || data.data || []);

    if (!Array.isArray(projects)) {
      console.warn('[NeuronWriter] Unexpected response format:', data);
      throw new Error('Invalid response format from NeuronWriter');
    }

    console.log(`[NeuronWriter] Found ${projects.length} projects`);

    return projects.map((project: any) => ({
      project: project.project || project.id || project.uuid,
      name: project.name || project.title || 'Unnamed Project',
      engine: project.engine || project.search_engine || 'google',
      language: project.language || project.lang || 'en'
    }));
  } catch (error: any) {
    console.error('[NeuronWriter] Failed to list projects:', error);
    throw new Error(`Failed to fetch NeuronWriter projects: ${error.message}`);
  }
};

/**
 * SOTA NeuronWriter Integration v15.0 - Enterprise-Grade with Fallback
 * 
 * Features:
 * - Retry logic with exponential backoff
 * - Graceful degradation with synthetic SEO terms
 * - Comprehensive error categorization
 * - Query/Answer caching for performance
 */

// Term cache to avoid redundant API calls
const neuronTermsCache = new Map<string, { terms: NeuronTerms; timestamp: number }>();
const NEURON_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour cache

export const fetchNeuronTerms = async (
  apiKey: string,
  projectId: string,
  query: string,
  retryCount: number = 2
): Promise<NeuronTerms | null> => {
  if (!apiKey || !projectId || !query) {
    console.warn('[NeuronWriter] Missing required parameters');
    return generateFallbackTerms(query, 'Missing required parameters');
  }

  // Check cache first
  const cacheKey = `${projectId}:${query.toLowerCase().trim()}`;
  const cached = neuronTermsCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < NEURON_CACHE_TTL_MS) {
    console.log(`[NeuronWriter] 📦 Cache hit for: "${query}"`);
    return cached.terms;
  }

  console.log(`[NeuronWriter] Creating NEW content query for: "${query}"`);

  for (let attempt = 0; attempt <= retryCount; attempt++) {
    try {
      if (attempt > 0) {
        const delay = 1000 * Math.pow(2, attempt - 1); // Exponential backoff
        console.log(`[NeuronWriter] ⏳ Retry ${attempt}/${retryCount} after ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      const analysisResult = await callNeuronWriterProxy(
        '/new-query',
        apiKey,
        'POST',
        {
          project: projectId,
          keyword: query,
          engine: 'google',
          language: 'en'
        }
      );

      if (!analysisResult.success) {
        console.error(`[NeuronWriter] Query creation FAILED (attempt ${attempt + 1}):`, analysisResult.error);

        // If it's an auth error or invalid project, don't retry
        if (analysisResult.status === 401 || analysisResult.status === 403) {
          console.error('[NeuronWriter] ⛔ Authentication error - check API key');
          return generateFallbackTerms(query, 'Authentication failed');
        }
        if (analysisResult.status === 404) {
          console.error('[NeuronWriter] ⛔ Project not found - check project ID');
          return generateFallbackTerms(query, 'Project not found');
        }

        continue; // Retry for transient errors
      }

      const queryId = analysisResult.data?.query || analysisResult.data?.id || analysisResult.data?.query_id;

      if (!queryId) {
        console.error('[NeuronWriter] No query ID returned from API');
        continue; // Retry
      }

      console.log(`[NeuronWriter] ✅ Query created: ${queryId} - Waiting for analysis...`);

      // Polling phase
      let pollAttempts = 0;
      const maxPollAttempts = 20; // Increased for reliability
      let terms: NeuronTerms | null = null;

      while (pollAttempts < maxPollAttempts) {
        pollAttempts++;

        // Progressive delay (faster at start, slower later)
        const pollingDelay = pollAttempts < 5 ? 1500 : (pollAttempts < 10 ? 2500 : 3500);
        await new Promise(resolve => setTimeout(resolve, pollingDelay));

        console.log(`[NeuronWriter] 🔄 Polling for data (attempt ${pollAttempts}/${maxPollAttempts})...`);

        const termsResult = await callNeuronWriterProxy(
          '/get-query',
          apiKey,
          'POST',
          { query: queryId }
        );

        if (termsResult.success && termsResult.data) {
          const data = termsResult.data;

          // Check for ready state with multiple possible data structures
          const isReady =
            data.status === 'ready' ||
            data.status === 'completed' ||
            data.terms ||
            data.content_terms ||
            data.recommendations ||
            (data.content && Object.keys(data.content).length > 0);

          if (isReady) {
            // Extract terms from various possible response structures
            const termsTxt = data.terms || data.content_terms || data.recommendations || data.content || {};
            const termsObj = typeof termsTxt === 'object' ? termsTxt : {};

            terms = {
              h1: extractTermString(termsObj.h1 || termsObj.H1 || termsObj.title_terms),
              title: extractTermString(termsObj.title || termsObj.Title || termsObj.meta_title || termsObj.seo_title),
              h2: extractTermString(termsObj.h2 || termsObj.H2 || termsObj.subheading_terms),
              h3: extractTermString(termsObj.h3 || termsObj.H3),
              content_basic: extractTermString(termsObj.content_basic || termsObj.content || termsObj.basic || termsObj.required_terms),
              content_extended: extractTermString(termsObj.content_extended || termsObj.extended || termsObj.advanced || termsObj.optional_terms),
              entities_basic: extractTermString(termsObj.entities_basic || termsObj.entities || termsObj.ner_basic || termsObj.named_entities),
              entities_extended: extractTermString(termsObj.entities_extended || termsObj.ner_extended || termsObj.ner_advanced),
              questions: extractQuestions(data.ideas || data.questions || data.paa || data.related_questions || []),
              headings: extractHeadings(data.headings || data.suggested_headings || data.h2_suggestions || data.outline || [])
            };

            const termCount = countTerms(terms);

            // Validate we got actual terms
            if (termCount > 0) {
              console.log(`[NeuronWriter] ✅ SUCCESS - Fetched ${termCount} total terms/entities`);
              console.log(`[NeuronWriter] 📊 Breakdown:`);
              console.log(`   H1: ${terms.h1?.split(',').length || 0} terms`);
              console.log(`   H2: ${terms.h2?.split(',').length || 0} terms`);
              console.log(`   Content Basic: ${terms.content_basic?.split(',').length || 0} terms`);
              console.log(`   Content Extended: ${terms.content_extended?.split(',').length || 0} terms`);
              console.log(`   Entities Basic: ${terms.entities_basic?.split(',').length || 0} entities`);
              console.log(`   Entities Extended: ${terms.entities_extended?.split(',').length || 0} entities`);
              console.log(`   Questions: ${terms.questions?.length || 0}`);
              console.log(`   Suggested Headings: ${terms.headings?.length || 0}`);

              // Cache the result
              neuronTermsCache.set(cacheKey, { terms, timestamp: Date.now() });

              return terms;
            } else {
              console.warn('[NeuronWriter] ⚠️ Response marked ready but no terms found, continuing to poll...');
            }
          }

          if (data.status === 'failed' || data.error) {
            console.error('[NeuronWriter] ❌ Analysis FAILED:', data.error || 'Unknown error');
            break; // Exit polling loop, will retry outer loop
          }

          console.log(`[NeuronWriter] ⏳ Status: ${data.status || 'processing'}...`);
        }
      }

      if (terms) {
        return terms;
      }

      console.warn('[NeuronWriter] ⏱️ Polling timeout, retrying query creation...');

    } catch (error: any) {
      console.error(`[NeuronWriter] ❌ Error (attempt ${attempt + 1}):`, error.message);

      // Check for network/timeout errors
      if (error.message.includes('timeout') || error.message.includes('abort')) {
        console.warn('[NeuronWriter] ⏱️ Request timeout, will retry...');
        continue;
      }

      // Fatal errors - don't retry
      if (error.message.includes('Invalid API key') || error.message.includes('Unauthorized')) {
        console.error('[NeuronWriter] ⛔ Fatal authentication error');
        return generateFallbackTerms(query, 'Authentication failed');
      }
    }
  }

  // All attempts exhausted - generate fallback terms
  console.warn('[NeuronWriter] ⚠️ All attempts exhausted, generating fallback terms');
  return generateFallbackTerms(query, 'API unavailable after retries');
};

/**
 * Generate synthetic SEO terms when NeuronWriter API fails
 * This ensures content generation never blocks due to NeuronWriter issues
 */
function generateFallbackTerms(keyword: string, reason: string): NeuronTerms {
  console.log(`[NeuronWriter] 🔧 Generating fallback terms for: "${keyword}" (reason: ${reason})`);

  const words = keyword.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  const baseWord = words[0] || keyword.split(' ')[0];

  // Generate semantically related terms based on the keyword
  const relatedTerms = words.length > 1
    ? words.slice(1).map(w => `${baseWord} ${w}`).join(', ')
    : `${baseWord} guide, ${baseWord} tips, ${baseWord} best practices`;

  return {
    h1: keyword,
    title: `${keyword}, ultimate guide, comprehensive`,
    h2: `how ${keyword} works, benefits of ${keyword}, ${keyword} tips, why ${keyword}, getting started with ${keyword}`,
    h3: `${keyword} basics, ${keyword} examples, common ${keyword} mistakes`,
    content_basic: `${keyword}, ${relatedTerms}, best, guide, tips, how to, what is, why, important, consider`,
    content_extended: `comprehensive, ultimate, professional, expert, effective, essential, proven, practical, step-by-step`,
    entities_basic: words.join(', '),
    entities_extended: '',
    questions: [
      `What is ${keyword}?`,
      `How does ${keyword} work?`,
      `Why is ${keyword} important?`,
      `What are the benefits of ${keyword}?`,
      `How to get started with ${keyword}?`
    ],
    headings: [
      `What is ${keyword}?`,
      `How ${keyword} Works`,
      `Benefits of ${keyword}`,
      `Getting Started with ${keyword}`,
      `${keyword} Best Practices`,
      `Common ${keyword} Mistakes to Avoid`
    ]
  };
}

/**
 * Clear NeuronWriter cache (useful for testing or force refresh)
 */
export function clearNeuronWriterCache(): void {
  neuronTermsCache.clear();
  console.log('[NeuronWriter] 🧹 Cache cleared');
}

function extractTermString(value: any): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) {
    return value.map(v => {
      if (typeof v === 'string') return v;
      return v?.term || v?.name || v?.keyword || v?.text || '';
    }).filter(Boolean).join(', ');
  }
  return '';
}

function extractQuestions(value: any): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map(v => {
      if (typeof v === 'string') return v;
      return v?.question || v?.text || v?.title || '';
    }).filter(Boolean).slice(0, 10);
  }
  return [];
}

function extractHeadings(value: any): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map(v => {
      if (typeof v === 'string') return v;
      return v?.heading || v?.text || v?.title || v?.h2 || '';
    }).filter(Boolean).slice(0, 15);
  }
  return [];
}

function countTerms(terms: NeuronTerms): number {
  let count = 0;
  if (terms.h1) count += terms.h1.split(',').length;
  if (terms.h2) count += terms.h2.split(',').length;
  if (terms.h3) count += terms.h3.split(',').length;
  if (terms.content_basic) count += terms.content_basic.split(',').length;
  if (terms.content_extended) count += terms.content_extended.split(',').length;
  if (terms.entities_basic) count += terms.entities_basic.split(',').length;
  if (terms.entities_extended) count += terms.entities_extended.split(',').length;
  if (terms.questions) count += terms.questions.length;
  if (terms.headings) count += terms.headings.length;
  return count;
}

export const getNeuronWriterData = async (
  apiKey: string,
  projectId: string,
  keyword: string
): Promise<NeuronWriterData | null> => {
  if (!apiKey || !projectId) {
    console.warn('[NeuronWriter] Missing API key or project ID');
    return null;
  }

  console.log(`[NeuronWriter] Fetching content editor data for: "${keyword}"`);

  try {
    const createResult = await callNeuronWriterProxy(
      '/new-query',
      apiKey,
      'POST',
      {
        project: projectId,
        keyword,
        engine: 'google',
        language: 'en'
      }
    );

    if (!createResult.success) {
      console.warn('[NeuronWriter] Query creation failed:', createResult.error);
      return null;
    }

    const queryId = createResult.data?.query || createResult.data?.id;

    if (!queryId) {
      console.warn('[NeuronWriter] No query ID returned');
      return null;
    }

    let attempts = 0;
    const maxAttempts = 12;

    while (attempts < maxAttempts) {
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 2500));

      const result = await callNeuronWriterProxy(
        '/get-query',
        apiKey,
        'POST',
        { query: queryId }
      );

      if (result.success && result.data) {
        const data = result.data;

        if (data.status === 'ready') {
          return {
            terms: extractTerms(data.terms || data.content_terms || []),
            competitors: extractCompetitors(data.competitors || data.serp || []),
            questions: data.ideas || data.questions || data.paa || [],
            headings: data.headings || data.suggested_headings || [],
          };
        }

        if (data.status === 'failed') {
          console.warn('[NeuronWriter] Analysis failed');
          return null;
        }
      }
    }

    console.warn('[NeuronWriter] Timed out waiting for analysis');
    return null;
  } catch (error: any) {
    console.error('[NeuronWriter] Error:', error.message);
    return null;
  }
};

// ==================== HELPER FUNCTIONS ====================

const extractTerms = (terms: any[]): string[] => {
  if (!Array.isArray(terms)) return [];

  return terms.map((t: any) => {
    if (typeof t === 'string') return t;
    return t.term || t.name || t.keyword || t.text || '';
  }).filter(Boolean);
};

const extractCompetitors = (competitors: any[]): string[] => {
  if (!Array.isArray(competitors)) return [];

  return competitors.map((c: any) => {
    if (typeof c === 'string') return c;
    return c.url || c.link || c.domain || '';
  }).filter(Boolean);
};

export const formatNeuronTermsForPrompt = (terms: NeuronTerms | null): string => {
  if (!terms) return '';

  const sections: string[] = [];

  sections.push('=== NEURONWRITER SEO OPTIMIZATION TERMS ===');
  sections.push('CRITICAL: Use these terms to achieve 90%+ NeuronWriter score!\n');

  if (terms.h1) {
    sections.push(`## H1 TERMS (Must use in main heading):\n${terms.h1}\n`);
  }

  if (terms.title) {
    sections.push(`## TITLE TERMS (Use in page title):\n${terms.title}\n`);
  }

  if (terms.h2) {
    sections.push(`## H2 TERMS (Must use in subheadings):\n${terms.h2}\n`);
  }

  if (terms.h3) {
    sections.push(`## H3 TERMS (Use in sub-subheadings):\n${terms.h3}\n`);
  }

  if (terms.content_basic) {
    sections.push(`## CONTENT BASIC TERMS (REQUIRED - Use ALL of these in body text):\n${terms.content_basic}\n`);
  }

  if (terms.content_extended) {
    sections.push(`## CONTENT EXTENDED TERMS (Use as many as possible):\n${terms.content_extended}\n`);
  }

  if (terms.entities_basic) {
    sections.push(`## ENTITIES BASIC (Named entities to include):\n${terms.entities_basic}\n`);
  }

  if (terms.entities_extended) {
    sections.push(`## ENTITIES EXTENDED (Additional named entities):\n${terms.entities_extended}\n`);
  }

  if (terms.questions && terms.questions.length > 0) {
    sections.push(`## QUESTIONS TO ANSWER (Include in FAQ or content):\n${terms.questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}\n`);
  }

  if (terms.headings && terms.headings.length > 0) {
    sections.push(`## SUGGESTED H2 HEADINGS:\n${terms.headings.map((h, i) => `${i + 1}. ${h}`).join('\n')}\n`);
  }

  sections.push('\n=== END NEURONWRITER TERMS ===');
  sections.push('INSTRUCTION: Incorporate ALL basic terms and as many extended terms as possible for maximum SEO score.');

  return sections.join('\n');
};

export const calculateNeuronContentScore = (
  content: string,
  terms: NeuronTerms
): number => {
  if (!content || !terms) return 0;

  const contentLower = content.toLowerCase();
  let totalTerms = 0;
  let foundTerms = 0;

  const allTermsText = [
    terms.h1,
    terms.title,
    terms.h2,
    terms.content_basic,
    terms.content_extended
  ].filter(Boolean).join(' ');

  const termsList = allTermsText
    .split(/[,;]/)
    .map(t => t.trim().toLowerCase())
    .filter(t => t.length > 2);

  totalTerms = termsList.length;

  for (const term of termsList) {
    if (contentLower.includes(term)) {
      foundTerms++;
    }
  }

  if (totalTerms === 0) return 100;

  return Math.round((foundTerms / totalTerms) * 100);
};

export const getMissingNeuronTerms = (
  content: string,
  terms: NeuronTerms,
  maxTerms: number = 20
): string[] => {
  if (!content || !terms) return [];

  const contentLower = content.toLowerCase();
  const missing: string[] = [];

  const allTermsText = [
    terms.content_basic,
    terms.content_extended,
    terms.h2
  ].filter(Boolean).join(' ');

  const termsList = allTermsText
    .split(/[,;]/)
    .map(t => t.trim().toLowerCase())
    .filter(t => t.length > 2);

  for (const term of termsList) {
    if (!contentLower.includes(term)) {
      missing.push(term);
    }

    if (missing.length >= maxTerms) break;
  }

  return missing;
};

// ==================== EXPORTS ====================

export default {
  listNeuronProjects,
  fetchNeuronTerms,
  formatNeuronTermsForPrompt,
  calculateNeuronContentScore,
  getMissingNeuronTerms,
  getNeuronWriterData
};
