
import type { AnalysisResult, AnalysisHistory, BrandVoiceProfile } from "../types";

// Re-export types for convenience
export type { AnalysisHistory, BrandVoiceProfile };

const STORAGE_KEYS = {
  ANALYSIS_HISTORY: 'vcm_analysis_history',
  BRAND_VOICE: 'vcm_brand_voice',
  PREFERENCES: 'vcm_preferences',
  RECENT_KEYWORDS: 'vcm_recent_keywords',
  RECENT_AUDIENCES: 'vcm_recent_audiences'
};

// Analysis History Management
export function saveAnalysisToHistory(
  result: AnalysisResult,
  config: {
    websiteUrl: string;
    keywords: string[];
    targetAudience: string;
  }
): void {
  try {
    const history = getAnalysisHistory();
    const newEntry: AnalysisHistory = {
      id: `analysis_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      result,
      timestamp: Date.now(),
      config
    };

    history.unshift(newEntry);

    // Keep only last 50 analyses
    if (history.length > 50) {
      history.splice(50);
    }

    localStorage.setItem(STORAGE_KEYS.ANALYSIS_HISTORY, JSON.stringify(history));
  } catch (error) {
    console.error('Failed to save analysis to history:', error);
  }
}

export function getAnalysisHistory(): AnalysisHistory[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ANALYSIS_HISTORY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load analysis history:', error);
    return [];
  }
}

export function getAnalysisById(id: string): AnalysisHistory | null {
  const history = getAnalysisHistory();
  return history.find(item => item.id === id) || null;
}

export function deleteAnalysisFromHistory(id: string): void {
  try {
    const history = getAnalysisHistory();
    const filtered = history.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEYS.ANALYSIS_HISTORY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to delete analysis:', error);
  }
}

export function clearAnalysisHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.ANALYSIS_HISTORY);
  } catch (error) {
    console.error('Failed to clear history:', error);
  }
}

// Brand Voice Management
export function saveBrandVoice(profile: BrandVoiceProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.BRAND_VOICE, JSON.stringify(profile));
  } catch (error) {
    console.error('Failed to save brand voice:', error);
  }
}

export function getBrandVoice(): BrandVoiceProfile | null {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.BRAND_VOICE);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to load brand voice:', error);
    return null;
  }
}

export function clearBrandVoice(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.BRAND_VOICE);
  } catch (error) {
    console.error('Failed to clear brand voice:', error);
  }
}

// User Preferences
export interface UserPreferences {
  autoSaveHistory: boolean;
  defaultExportFormat: 'markdown' | 'json' | 'html' | 'csv';
  enableVariants: boolean;
  variantCount: number;
  theme: 'dark' | 'light' | 'auto';
  showAdvancedMetrics: boolean;
  autoLoadBrandVoice: boolean;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  autoSaveHistory: true,
  defaultExportFormat: 'markdown',
  enableVariants: true,
  variantCount: 3,
  theme: 'dark',
  showAdvancedMetrics: true,
  autoLoadBrandVoice: true
};

export function savePreferences(preferences: Partial<UserPreferences>): void {
  try {
    const current = getPreferences();
    const updated = { ...current, ...preferences };
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save preferences:', error);
  }
}

export function getPreferences(): UserPreferences {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    return data ? { ...DEFAULT_PREFERENCES, ...JSON.parse(data) } : DEFAULT_PREFERENCES;
  } catch (error) {
    console.error('Failed to load preferences:', error);
    return DEFAULT_PREFERENCES;
  }
}

// Recent Keywords & Audiences (for autocomplete)
export function addRecentKeyword(keyword: string): void {
  try {
    const recent = getRecentKeywords();
    if (!recent.includes(keyword)) {
      recent.unshift(keyword);
      if (recent.length > 20) recent.splice(20);
      localStorage.setItem(STORAGE_KEYS.RECENT_KEYWORDS, JSON.stringify(recent));
    }
  } catch (error) {
    console.error('Failed to save recent keyword:', error);
  }
}

export function getRecentKeywords(): string[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.RECENT_KEYWORDS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load recent keywords:', error);
    return [];
  }
}

export function addRecentAudience(audience: string): void {
  try {
    const recent = getRecentAudiences();
    if (!recent.includes(audience)) {
      recent.unshift(audience);
      if (recent.length > 10) recent.splice(10);
      localStorage.setItem(STORAGE_KEYS.RECENT_AUDIENCES, JSON.stringify(recent));
    }
  } catch (error) {
    console.error('Failed to save recent audience:', error);
  }
}

export function getRecentAudiences(): string[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.RECENT_AUDIENCES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load recent audiences:', error);
    return [];
  }
}

// Compare two analyses
export function compareAnalyses(
  analysis1: AnalysisResult,
  analysis2: AnalysisResult
): {
  seoScoreDelta: number;
  sectionsAdded: string[];
  sectionsRemoved: string[];
  sectionsImproved: string[];
  sectionsDeclined: string[];
  overallImprovement: boolean;
} {
  const seoScoreDelta = analysis2.overallSeoScore - analysis1.overallSeoScore;

  const sections1 = new Map(analysis1.sections.map(s => [s.id, s]));
  const sections2 = new Map(analysis2.sections.map(s => [s.id, s]));

  const sectionsAdded: string[] = [];
  const sectionsRemoved: string[] = [];
  const sectionsImproved: string[] = [];
  const sectionsDeclined: string[] = [];

  // Check for added sections
  sections2.forEach((section, id) => {
    if (!sections1.has(id)) {
      sectionsAdded.push(section.label);
    }
  });

  // Check for removed and changed sections
  sections1.forEach((section1, id) => {
    const section2 = sections2.get(id);
    if (!section2) {
      sectionsRemoved.push(section1.label);
    } else {
      if (section2.seoScore > section1.seoScore) {
        sectionsImproved.push(section2.label);
      } else if (section2.seoScore < section1.seoScore) {
        sectionsDeclined.push(section2.label);
      }
    }
  });

  return {
    seoScoreDelta,
    sectionsAdded,
    sectionsRemoved,
    sectionsImproved,
    sectionsDeclined,
    overallImprovement: seoScoreDelta > 0
  };
}

// Export history as batch
export function exportHistoryAsJSON(): string {
  const history = getAnalysisHistory();
  const brandVoice = getBrandVoice();
  const preferences = getPreferences();

  return JSON.stringify({
    exportedAt: Date.now(),
    version: '1.0',
    history,
    brandVoice,
    preferences
  }, null, 2);
}

// Import history from JSON
export function importHistoryFromJSON(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);

    if (data.history) {
      localStorage.setItem(STORAGE_KEYS.ANALYSIS_HISTORY, JSON.stringify(data.history));
    }
    if (data.brandVoice) {
      localStorage.setItem(STORAGE_KEYS.BRAND_VOICE, JSON.stringify(data.brandVoice));
    }
    if (data.preferences) {
      localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(data.preferences));
    }

    return true;
  } catch (error) {
    console.error('Failed to import history:', error);
    return false;
  }
}

// Get statistics
export function getAnalysisStatistics(): {
  totalAnalyses: number;
  averageSeoScore: number;
  topKeywords: { keyword: string; count: number }[];
  analysisOverTime: { date: string; count: number }[];
  topPageTypes: { type: string; count: number }[];
} {
  const history = getAnalysisHistory();

  if (history.length === 0) {
    return {
      totalAnalyses: 0,
      averageSeoScore: 0,
      topKeywords: [],
      analysisOverTime: [],
      topPageTypes: []
    };
  }

  const totalAnalyses = history.length;
  const averageSeoScore = history.reduce((sum, item) => sum + item.result.overallSeoScore, 0) / totalAnalyses;

  // Top keywords
  const keywordCounts = new Map<string, number>();
  history.forEach(item => {
    item.config.keywords.forEach(kw => {
      keywordCounts.set(kw, (keywordCounts.get(kw) || 0) + 1);
    });
  });
  const topKeywords = Array.from(keywordCounts.entries())
    .map(([keyword, count]) => ({ keyword, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Analysis over time (group by day)
  const dateCounts = new Map<string, number>();
  history.forEach(item => {
    const date = new Date(item.timestamp).toLocaleDateString();
    dateCounts.set(date, (dateCounts.get(date) || 0) + 1);
  });
  const analysisOverTime = Array.from(dateCounts.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Top page types
  const pageTypeCounts = new Map<string, number>();
  history.forEach(item => {
    const type = item.result.pageType;
    pageTypeCounts.set(type, (pageTypeCounts.get(type) || 0) + 1);
  });
  const topPageTypes = Array.from(pageTypeCounts.entries())
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);

  return {
    totalAnalyses,
    averageSeoScore,
    topKeywords,
    analysisOverTime,
    topPageTypes
  };
}
