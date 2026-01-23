// =============================================================================
// SOTA WP CONTENT OPTIMIZER PRO - NEURONWRITER INTEGRATION v12.0
// Enterprise-Grade NLP Term Optimization
// =============================================================================

import { callAiWithRetry } from './utils';

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
  content_basic?: string;
  content_extended?: string;
}

export interface NeuronAnalysis {
  terms_txt?: NeuronTerms;
  contentScore?: number;
  recommendations?: string[];
}

// ==================== API FUNCTIONS ====================

const NEURON_API_BASE = 'https://app.neuronwriter.com/api/v1';

/**
 * Lists all NeuronWriter projects for the given API key
 */
export const listNeuronProjects = async (apiKey: string): Promise<NeuronProject[]> => {
  if (!apiKey || apiKey.trim().length < 10) {
    throw new Error('Invalid NeuronWriter API key');
  }

  try {
    const response = await callAiWithRetry(async () => {
      const res = await fetch(`${NEURON_API_BASE}/projects`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(15000)
      });

      if (!res.ok) {
        const errorText = await res.text().catch(() => 'Unknown error');
        throw new Error(`NeuronWriter API error (${res.status}): ${errorText}`);
      }

      return res;
    }, 2);

    const data = await response.json();
    
    if (!Array.isArray(data)) {
      throw new Error('Invalid response format from NeuronWriter');
    }

    return data.map((project: any) => ({
      project: project.project || project.id,
      name: project.name || 'Unnamed Project',
      engine: project.engine || 'google',
      language: project.language || 'en'
    }));
  } catch (error: any) {
    console.error('[NeuronWriter] Failed to list projects:', error);
    throw error;
  }
};

/**
 * Fetches NLP terms for a specific query from NeuronWriter
 */
export const fetchNeuronTerms = async (
  apiKey: string,
  projectId: string,
  query: string
): Promise<NeuronTerms | null> => {
  if (!apiKey || !projectId || !query) {
    console.warn('[NeuronWriter] Missing required parameters');
    return null;
  }

  try {
    // First, create or get a query analysis
    const analysisResponse = await callAiWithRetry(async () => {
      const res = await fetch(`${NEURON_API_BASE}/projects/${projectId}/queries`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query }),
        signal: AbortSignal.timeout(30000)
      });

      if (!res.ok) {
        const errorText = await res.text().catch(() => 'Unknown error');
        throw new Error(`NeuronWriter query error (${res.status}): ${errorText}`);
      }

      return res;
    }, 2);

    const analysisData = await analysisResponse.json();
    const queryId = analysisData.id || analysisData.query_id;

    if (!queryId) {
      console.warn('[NeuronWriter] No query ID returned');
      return null;
    }

    // Wait for analysis to complete (poll with timeout)
    let attempts = 0;
    const maxAttempts = 10;
    let terms: NeuronTerms | null = null;

    while (attempts < maxAttempts) {
      attempts++;
      
      const termsResponse = await fetch(
        `${NEURON_API_BASE}/projects/${projectId}/queries/${queryId}/terms`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          signal: AbortSignal.timeout(10000)
        }
      );

      if (termsResponse.ok) {
        const termsData = await termsResponse.json();
        
        if (termsData.status === 'completed' || termsData.terms_txt) {
          terms = {
            h1: termsData.terms_txt?.h1 || '',
            title: termsData.terms_txt?.title || '',
            h2: termsData.terms_txt?.h2 || '',
            content_basic: termsData.terms_txt?.content_basic || '',
            content_extended: termsData.terms_txt?.content_extended || ''
          };
          break;
        }
      }

      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    return terms;
  } catch (error: any) {
    console.error('[NeuronWriter] Failed to fetch terms:', error);
    return null;
  }
};

/**
 * Formats NeuronWriter terms for AI prompt injection
 */
export const formatNeuronTermsForPrompt = (terms: NeuronTerms | null): string => {
  if (!terms) return '';

  const sections: string[] = [];

  if (terms.h1) {
    sections.push(`H1 Terms: ${terms.h1}`);
  }

  if (terms.title) {
    sections.push(`Title Terms: ${terms.title}`);
  }

  if (terms.h2) {
    sections.push(`H2 Terms: ${terms.h2}`);
  }

  if (terms.content_basic) {
    sections.push(`Content (Basic): ${terms.content_basic}`);
  }

  if (terms.content_extended) {
    sections.push(`Content (Extended): ${terms.content_extended}`);
  }

  return sections.join('\n');
};

/**
 * Calculates content score based on NeuronWriter terms coverage
 */
export const calculateNeuronContentScore = (
  content: string,
  terms: NeuronTerms
): number => {
  if (!content || !terms) return 0;

  const contentLower = content.toLowerCase();
  let totalTerms = 0;
  let foundTerms = 0;

  // Extract all terms from NeuronWriter data
  const allTermsText = [
    terms.h1,
    terms.title,
    terms.h2,
    terms.content_basic,
    terms.content_extended
  ].filter(Boolean).join(' ');

  // Split into individual terms (assume comma or semicolon separated)
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

  if (totalTerms === 0) return 100; // No terms to check

  return Math.round((foundTerms / totalTerms) * 100);
};

/**
 * Gets missing NeuronWriter terms that should be added to content
 */
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


// =============================================================================
// GET NEURONWRITER DATA FOR CONTENT GENERATION
// =============================================================================

export interface NeuronWriterData {
  terms: string[];
  competitors: string[];
  questions: string[];
  headings: string[];
}

export const getNeuronWriterData = async (
  apiKey: string,
  projectId: string,
  keyword: string
): Promise<NeuronWriterData | null> => {
  if (!apiKey || !projectId) {
    console.warn('[getNeuronWriterData] Missing API key or project ID');
    return null;
  }

  try {
    // NeuronWriter API endpoint
    const response = await fetch(`https://app.neuronwriter.com/api/v1/projects/${projectId}/content-editor`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        keyword: keyword,
        language: 'en',
        country: 'us',
      }),
    });

    if (!response.ok) {
      console.warn(`[getNeuronWriterData] API returned ${response.status}`);
      return null;
    }

    const data = await response.json();

    // Extract NLP terms and competitor data
    return {
      terms: data.terms?.map((t: any) => t.term || t.name || t) || [],
      competitors: data.competitors?.map((c: any) => c.url || c) || [],
      questions: data.questions || data.paa || [],
      headings: data.headings || [],
    };
  } catch (error: any) {
    console.error('[getNeuronWriterData] Error:', error.message);
    return null;
  }
};


// ==================== EXPORTS ====================

export default {
  listNeuronProjects,
  fetchNeuronTerms,
  formatNeuronTermsForPrompt,
  calculateNeuronContentScore,
  getMissingNeuronTerms
};

