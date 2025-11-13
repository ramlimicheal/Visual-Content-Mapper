
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

export type DetectedSection = {
  id: string;
  type: SectionType;
  label: string;
  position: { x: number; y: number; width: number; height: number };
  currentContent?: string;
  suggestedContent: string;
  seoScore: number;
  keywords: string[];
  characterCount: number;
};

export type AnalysisResult = {
  sections: DetectedSection[];
  overallSeoScore: number;
  recommendations: string[];
  pageType: string;
  imageUrl: string;
};
