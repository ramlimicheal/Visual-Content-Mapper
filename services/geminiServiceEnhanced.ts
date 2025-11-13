
import { GoogleGenAI, Type } from "@google/genai";
import type {
  AnalysisResult,
  DetectedSection,
  ContentVariant,
  ToneType,
  BrandVoiceProfile,
  CompetitorInsight,
  TechnicalSEO
} from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

// Enhanced schema with multi-variant support
const enhancedAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    sections: {
      type: Type.ARRAY,
      description: "An array of all detected content sections with multiple content variants.",
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: "Unique identifier for the section." },
          type: { type: Type.STRING, description: "Section type (hero, cta_button, features, etc.)." },
          label: { type: Type.STRING, description: "Descriptive label for the section." },
          position: {
            type: Type.OBJECT,
            description: "Bounding box as percentages.",
            properties: {
              x: { type: Type.NUMBER },
              y: { type: Type.NUMBER },
              width: { type: Type.NUMBER },
              height: { type: Type.NUMBER },
            },
            required: ['x', 'y', 'width', 'height']
          },
          currentContent: { type: Type.STRING, description: "Current text content from the section." },
          suggestedContent: { type: Type.STRING, description: "Primary SEO-optimized content suggestion." },
          contentVariants: {
            type: Type.ARRAY,
            description: "Alternative content variations with different tones and lengths (3-5 variants).",
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING, description: "Unique variant ID." },
                content: { type: Type.STRING, description: "The variant content." },
                seoScore: { type: Type.NUMBER, description: "SEO score for this variant (0-100)." },
                tone: { type: Type.STRING, description: "Tone: professional, casual, friendly, authoritative, playful, empathetic." },
                lengthCategory: { type: Type.STRING, description: "Length: short, medium, long." },
                predictedCTR: { type: Type.NUMBER, description: "Predicted click-through rate percentage." },
                reasoning: { type: Type.STRING, description: "Why this variant might perform well." }
              },
              required: ['id', 'content', 'seoScore', 'tone', 'lengthCategory', 'reasoning']
            }
          },
          seoScore: { type: Type.NUMBER, description: "SEO score for primary content (0-100)." },
          keywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Keywords used." },
          characterCount: { type: Type.NUMBER, description: "Character count of primary content." },
          readabilityScore: { type: Type.NUMBER, description: "Flesch reading ease score (0-100, higher is easier)." },
          sentimentScore: { type: Type.NUMBER, description: "Sentiment score (-1 to 1, negative to positive)." },
          brandVoiceMatch: { type: Type.NUMBER, description: "How well content matches brand voice (0-100)." },
          technicalSeoIssues: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Any technical SEO issues detected in this section."
          },
          accessibilityIssues: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Accessibility concerns (contrast, alt text, etc.)."
          }
        },
        required: ['id', 'type', 'label', 'position', 'suggestedContent', 'contentVariants', 'seoScore', 'keywords', 'characterCount']
      }
    },
    overallSeoScore: { type: Type.NUMBER, description: "Overall SEO score (0-100)." },
    recommendations: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "5-10 actionable recommendations."
    },
    pageType: { type: Type.STRING, description: "Page type (Landing Page, Product Page, etc.)." },
    technicalSeo: {
      type: Type.OBJECT,
      description: "Technical SEO recommendations.",
      properties: {
        metaTitle: { type: Type.STRING, description: "Suggested meta title (50-60 chars)." },
        metaDescription: { type: Type.STRING, description: "Suggested meta description (150-160 chars)." },
        h1Tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Suggested H1 tags." },
        imageAltTexts: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Alt texts for images." },
        schemaMarkup: { type: Type.STRING, description: "JSON-LD schema markup suggestion." },
        internalLinks: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Suggested internal link anchors." }
      }
    },
    brandVoiceAnalysis: {
      type: Type.OBJECT,
      description: "Analysis of brand voice consistency.",
      properties: {
        detectedTone: { type: Type.STRING, description: "Detected tone from current content." },
        consistency: { type: Type.NUMBER, description: "Voice consistency score (0-100)." },
        suggestions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Suggestions for voice improvement." }
      }
    },
    performanceMetrics: {
      type: Type.OBJECT,
      description: "Estimated performance metrics.",
      properties: {
        estimatedLoadTime: { type: Type.NUMBER, description: "Estimated load time in seconds." },
        mobileOptimization: { type: Type.NUMBER, description: "Mobile optimization score (0-100)." },
        coreWebVitals: {
          type: Type.OBJECT,
          properties: {
            lcp: { type: Type.STRING, description: "Largest Contentful Paint assessment (good/needs improvement/poor)." },
            fid: { type: Type.STRING, description: "First Input Delay assessment." },
            cls: { type: Type.STRING, description: "Cumulative Layout Shift assessment." }
          }
        }
      }
    }
  },
  required: ['sections', 'overallSeoScore', 'recommendations', 'pageType']
};

// Main enhanced analysis function
export async function actionAnalyzeScreenshotEnhanced({
  imageFile,
  websiteUrl,
  keywords,
  targetAudience,
  brandVoice,
  generateVariants = true,
  competitorUrls = []
}: {
  imageFile: File;
  websiteUrl: string;
  keywords: string[];
  targetAudience: string;
  brandVoice?: BrandVoiceProfile;
  generateVariants?: boolean;
  competitorUrls?: string[];
}): Promise<AnalysisResult> {

    const imageBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(imageFile);
    });

    const imagePart = {
        inlineData: {
            data: imageBase64,
            mimeType: imageFile.type,
        },
    };

    const brandVoiceContext = brandVoice
      ? `
      **Brand Voice Guidelines:**
      - Tone: ${brandVoice.tone}
      - Formality Level: ${brandVoice.formalityLevel}/10
      - Target Reading Level: Grade ${brandVoice.targetReadingLevel}
      - Sentence Structure: ${brandVoice.sentenceStructure}
      - Preferred Vocabulary: ${brandVoice.vocabulary.join(', ')}
      - Words to Avoid: ${brandVoice.avoidWords.join(', ')}
      `
      : '';

    const competitorContext = competitorUrls.length > 0
      ? `**Competitor Context:** Differentiate from these competitors: ${competitorUrls.join(', ')}`
      : '';

    const prompt = `
      You are an expert UI/UX analyst, SEO specialist, and conversion copywriter. Perform a COMPREHENSIVE analysis of this website screenshot.

      **Context:**
      - Website URL: ${websiteUrl || 'Not provided'}
      - Target Audience: ${targetAudience}
      - SEO Keywords: ${keywords.join(', ')}
      ${brandVoiceContext}
      ${competitorContext}

      **Your Mission:**

      1. **Visual Analysis** - Detect ALL content sections (hero, subheading, features, CTA buttons, testimonials, forms, footer, navigation, pricing, body text).

      2. **Content Generation** - For EACH section:
         - Extract current content (if visible text exists)
         - Generate PRIMARY SEO-optimized content
         ${generateVariants ? '- Generate 3-5 CONTENT VARIANTS with different:' : ''}
         ${generateVariants ? '  * Tones: professional, casual, friendly, authoritative, playful, empathetic' : ''}
         ${generateVariants ? '  * Lengths: short (concise), medium (balanced), long (detailed)' : ''}
         ${generateVariants ? '  * Each variant should have predicted CTR and reasoning' : ''}
         - Calculate readability score (Flesch Reading Ease)
         - Analyze sentiment (-1 to 1 scale)
         - Assess brand voice match (0-100)
         - Identify technical SEO issues
         - Flag accessibility concerns

      3. **Technical SEO Audit**:
         - Suggest optimized meta title (50-60 chars)
         - Suggest meta description (150-160 chars)
         - Recommend H1 tag structure
         - Generate alt texts for visible images
         - Create JSON-LD schema markup
         - Suggest internal linking strategy

      4. **Brand Voice Analysis**:
         - Detect current tone from existing content
         - Assess voice consistency across sections
         - Provide actionable improvement suggestions

      5. **Performance Predictions**:
         - Estimate page load time based on visual complexity
         - Score mobile optimization (0-100)
         - Assess Core Web Vitals (LCP, FID, CLS)

      6. **Comprehensive Recommendations**:
         - 5-10 prioritized, actionable SEO improvements
         - Conversion optimization tactics
         - Accessibility enhancements
         - Content strategy suggestions

      **Important Guidelines:**
      - Make content SEO-rich but natural (no keyword stuffing)
      - Ensure brand voice consistency if guidelines provided
      - All content should be conversion-focused
      - Prioritize user experience and readability
      - Consider mobile-first design principles
      - Flag any critical issues (accessibility, SEO, UX)

      Return comprehensive analysis in the specified JSON format.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [imagePart, { text: prompt }] },
            config: {
                responseMimeType: "application/json",
                responseSchema: enhancedAnalysisSchema,
                temperature: 0.7,
            },
        });

        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);

        return {
            ...result,
            imageUrl: URL.createObjectURL(imageFile),
            imageFileName: imageFile.name,
            timestamp: Date.now(),
        };

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to analyze screenshot: ${error.message}`);
        }
        throw new Error("An unknown error occurred during analysis.");
    }
}

// Batch analysis for multiple screenshots
export async function actionBatchAnalyze({
  imageFiles,
  websiteUrl,
  keywords,
  targetAudience,
  brandVoice,
  onProgress
}: {
  imageFiles: File[];
  websiteUrl: string;
  keywords: string[];
  targetAudience: string;
  brandVoice?: BrandVoiceProfile;
  onProgress?: (progress: number, currentFile: string) => void;
}): Promise<AnalysisResult[]> {
  const results: AnalysisResult[] = [];

  for (let i = 0; i < imageFiles.length; i++) {
    const file = imageFiles[i];

    if (onProgress) {
      onProgress((i / imageFiles.length) * 100, file.name);
    }

    try {
      const result = await actionAnalyzeScreenshotEnhanced({
        imageFile: file,
        websiteUrl,
        keywords,
        targetAudience,
        brandVoice,
        generateVariants: true
      });

      results.push(result);
    } catch (error) {
      console.error(`Failed to analyze ${file.name}:`, error);
      // Continue with next file even if one fails
    }
  }

  if (onProgress) {
    onProgress(100, 'Completed');
  }

  return results;
}

// Competitor comparison analysis
export async function actionCompetitorComparison({
  yourScreenshot,
  competitorScreenshots,
  websiteUrl,
  keywords,
  targetAudience
}: {
  yourScreenshot: File;
  competitorScreenshots: File[];
  websiteUrl: string;
  keywords: string[];
  targetAudience: string;
}): Promise<{
  yourAnalysis: AnalysisResult;
  competitorAnalyses: AnalysisResult[];
  insights: CompetitorInsight[];
}> {

  // Analyze your page
  const yourAnalysis = await actionAnalyzeScreenshotEnhanced({
    imageFile: yourScreenshot,
    websiteUrl,
    keywords,
    targetAudience,
    generateVariants: true
  });

  // Analyze competitor pages
  const competitorAnalyses: AnalysisResult[] = [];
  for (const competitorFile of competitorScreenshots) {
    const analysis = await actionAnalyzeScreenshotEnhanced({
      imageFile: competitorFile,
      websiteUrl: 'Competitor',
      keywords,
      targetAudience,
      generateVariants: false
    });
    competitorAnalyses.push(analysis);
  }

  // Generate competitive insights using AI
  const insights = await generateCompetitiveInsights(yourAnalysis, competitorAnalyses, keywords);

  return {
    yourAnalysis,
    competitorAnalyses,
    insights
  };
}

// Generate competitive insights
async function generateCompetitiveInsights(
  yourAnalysis: AnalysisResult,
  competitorAnalyses: AnalysisResult[],
  keywords: string[]
): Promise<CompetitorInsight[]> {
  const prompt = `
    Analyze competitive positioning:

    **Your Page:**
    - SEO Score: ${yourAnalysis.overallSeoScore}
    - Sections: ${yourAnalysis.sections.map(s => s.type).join(', ')}
    - Keywords Used: ${yourAnalysis.sections.flatMap(s => s.keywords).join(', ')}

    **Competitors:**
    ${competitorAnalyses.map((comp, i) => `
      Competitor ${i + 1}:
      - SEO Score: ${comp.overallSeoScore}
      - Sections: ${comp.sections.map(s => s.type).join(', ')}
    `).join('\n')}

    Provide:
    1. Each competitor's strengths
    2. Each competitor's weaknesses
    3. Your unique differentiators
    4. Keyword gaps to exploit

    Return as JSON array of CompetitorInsight objects.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts: [{ text: prompt }] },
      config: {
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    });

    const insights = JSON.parse(response.text.trim());
    return insights.insights || [];
  } catch (error) {
    console.error("Failed to generate competitive insights:", error);
    return [];
  }
}

// Refine content with AI chat
export async function actionRefineContent({
  originalContent,
  userFeedback,
  context
}: {
  originalContent: string;
  userFeedback: string;
  context: {
    sectionType: string;
    keywords: string[];
    targetAudience: string;
  };
}): Promise<string> {
  const prompt = `
    Original content: "${originalContent}"

    User feedback: "${userFeedback}"

    Context:
    - Section Type: ${context.sectionType}
    - Keywords: ${context.keywords.join(', ')}
    - Target Audience: ${context.targetAudience}

    Refine the content based on user feedback while maintaining SEO best practices.
    Return ONLY the refined content, no explanations.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts: [{ text: prompt }] },
      config: {
        temperature: 0.8,
      },
    });

    return response.text.trim();
  } catch (error) {
    console.error("Failed to refine content:", error);
    throw error;
  }
}
