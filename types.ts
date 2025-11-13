
export type SectionType =
  | "hero"
  | "subheading"
  | "features"
  | "cta_button"
  | "body_text"
  | "footer"
  | "navigation"
  | "testimonial"
  | "pricing"
  | "form";

export type ToneType = "professional" | "casual" | "friendly" | "authoritative" | "playful" | "empathetic";

export type ContentVariant = {
  id: string;
  content: string;
  seoScore: number;
  tone: ToneType;
  lengthCategory: "short" | "medium" | "long";
  predictedCTR?: number;
  reasoning: string;
};

export type DetectedSection = {
  id: string;
  type: SectionType;
  label: string;
  position: { x: number; y: number; width: number; height: number };
  currentContent?: string;
  suggestedContent: string;
  contentVariants?: ContentVariant[];
  seoScore: number;
  keywords: string[];
  characterCount: number;
  readabilityScore?: number;
  sentimentScore?: number;
  brandVoiceMatch?: number;
  technicalSeoIssues?: string[];
  accessibilityIssues?: string[];
};

export type CompetitorInsight = {
  competitorName: string;
  strengths: string[];
  weaknesses: string[];
  uniqueDifferentiators: string[];
  keywordGaps: string[];
};

export type BrandVoiceProfile = {
  tone: ToneType;
  vocabulary: string[];
  sentenceStructure: "simple" | "complex" | "mixed";
  formalityLevel: number;
  targetReadingLevel: number;
  avoidWords: string[];
};

export type TechnicalSEO = {
  metaTitle?: string;
  metaDescription?: string;
  h1Tags: string[];
  imageAltTexts: string[];
  schemaMarkup?: string;
  internalLinks: string[];
  canonicalUrl?: string;
  robotsDirective?: string;
};

export type AnalysisResult = {
  sections: DetectedSection[];
  overallSeoScore: number;
  recommendations: string[];
  pageType: string;
  imageUrl: string;
  imageFileName?: string;
  timestamp?: number;
  technicalSeo?: TechnicalSEO;
  competitorInsights?: CompetitorInsight[];
  brandVoiceAnalysis?: {
    detectedTone: ToneType;
    consistency: number;
    suggestions: string[];
  };
  performanceMetrics?: {
    estimatedLoadTime: number;
    mobileOptimization: number;
    coreWebVitals: {
      lcp: string;
      fid: string;
      cls: string;
    };
  };
};

export type AnalysisHistory = {
  id: string;
  result: AnalysisResult;
  timestamp: number;
  config: {
    websiteUrl: string;
    keywords: string[];
    targetAudience: string;
  };
};

export type BatchAnalysisJob = {
  id: string;
  images: File[];
  status: "pending" | "processing" | "completed" | "failed";
  results: AnalysisResult[];
  progress: number;
  startTime: number;
  endTime?: number;
};

export type ExportFormat = "markdown" | "json" | "html" | "csv" | "pdf";

export type ComparisonMode = {
  enabled: boolean;
  originalAnalysis: AnalysisResult;
  updatedAnalysis: AnalysisResult;
  improvements: {
    seoScoreDelta: number;
    sectionsChanged: string[];
    keyInsights: string[];
  };
};
