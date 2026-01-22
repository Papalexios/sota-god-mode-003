// EnhancedUI.tsx - SOTA Enterprise Editor Enhancement Module
// Internal linking and advanced UI components

import React, { useState, useCallback, useEffect, useRef } from 'react';

export interface LinkSuggestion {
  id: string;
  title: string;
  url: string;
  relevance: number;
  type: 'internal' | 'external' | 'anchor';
}

export interface EditorState {
  content: string;
  cursorPosition: number;
  selectedText: string;
  activeLinks: LinkSuggestion[];
}

export const useInternalLinking = (content: string) => {
  const [suggestions, setSuggestions] = useState<LinkSuggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeContent = useCallback(async (text: string) => {
    setIsAnalyzing(true);
    try {
      const keywords = extractKeywords(text);
      const links = await findInternalLinks(keywords);
      setSuggestions(links);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  useEffect(() => {
    const debounced = setTimeout(() => analyzeContent(content), 500);
    return () => clearTimeout(debounced);
  }, [content, analyzeContent]);

  return { suggestions, isAnalyzing };
};

const extractKeywords = (text: string): string[] => {
  const words = text.toLowerCase().split(/\s+/);
  const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were']);
  return words.filter(w => w.length > 3 && !stopWords.has(w));
};

const findInternalLinks = async (keywords: string[]): Promise<LinkSuggestion[]> => {
  return keywords.slice(0, 5).map((kw, i) => ({
    id: `link-${i}`,
    title: kw.charAt(0).toUpperCase() + kw.slice(1),
    url: `/docs/${kw}`,
    relevance: 0.9 - i * 0.1,
    type: 'internal' as const
  }));
};

export const EnhancedEditor: React.FC<{ initialContent?: string }> = ({
  initialContent = ''
}) => {
  const [state, setState] = useState<EditorState>({
    content: initialContent,
    cursorPosition: 0,
    selectedText: '',
    activeLinks: []
  });
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const { suggestions, isAnalyzing } = useInternalLinking(state.content);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setState(prev => ({
      ...prev,
      content: e.target.value,
      cursorPosition: e.target.selectionStart
    }));
  }, []);

  const insertLink = useCallback((link: LinkSuggestion) => {
    const { content, cursorPosition } = state;
    const before = content.slice(0, cursorPosition);
    const after = content.slice(cursorPosition);
    const markdown = `[${link.title}](${link.url})`;
    setState(prev => ({
      ...prev,
      content: before + markdown + after,
      cursorPosition: cursorPosition + markdown.length
    }));
  }, [state]);

  return (
    <div className="enhanced-editor">
      <textarea
        ref={editorRef}
        value={state.content}
        onChange={handleChange}
        className="editor-textarea"
      />
      {isAnalyzing && <div className="analyzing-indicator">Analyzing...</div>}
      <div className="suggestions-panel">
        {suggestions.map(s => (
          <button key={s.id} onClick={() => insertLink(s)}>
            {s.title} ({Math.round(s.relevance * 100)}%)
          </button>
        ))}
      </div>
    </div>
  );
};

export default EnhancedEditor;
