
import { GoogleGenAI, Type } from "@google/genai";
import type { AnalysisResult, DetectedSection } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    sections: {
      type: Type.ARRAY,
      description: "An array of all detected content sections from the webpage screenshot.",
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: "A unique identifier for the section, can be a short random string." },
          type: { type: Type.STRING, description: "The type of the section (e.g., 'hero', 'cta_button', 'features')." },
          label: { type: Type.STRING, description: "A descriptive label for the section (e.g., 'Hero Headline', 'Primary Call-to-Action')." },
          position: {
            type: Type.OBJECT,
            description: "The bounding box of the section as percentages of the image dimensions.",
            properties: {
              x: { type: Type.NUMBER, description: "The top-left x-coordinate as a percentage from the left edge." },
              y: { type: Type.NUMBER, description: "The top-left y-coordinate as a percentage from the top edge." },
              width: { type: Type.NUMBER, description: "The width of the section as a percentage." },
              height: { type: Type.NUMBER, description: "The height of the section as a percentage." },
            },
            required: ['x', 'y', 'width', 'height']
          },
          currentContent: { type: Type.STRING, description: "The current text content transcribed from the section. If no text is present, this can be an empty string." },
          suggestedContent: { type: Type.STRING, description: "The new, SEO-optimized content suggestion, written for the target audience and using the provided keywords. Use markdown for formatting where appropriate (e.g., bullet points)." },
          seoScore: { type: Type.NUMBER, description: "An estimated SEO score for the new suggested content, on a scale of 0-100." },
          keywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of the primary SEO keywords used in the suggested content." },
          characterCount: { type: Type.NUMBER, description: "The character count of the suggested content." },
        },
        required: ['id', 'type', 'label', 'position', 'suggestedContent', 'seoScore', 'keywords', 'characterCount']
      }
    },
    overallSeoScore: { type: Type.NUMBER, description: "An overall estimated SEO score for the entire page with all suggested changes, on a scale of 0-100." },
    recommendations: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of 5-6 actionable SEO and user experience recommendations for the page." },
    pageType: { type: Type.STRING, description: "The identified type of the webpage (e.g., 'Landing Page', 'Pricing Page', 'Blog Post')." },
  },
  required: ['sections', 'overallSeoScore', 'recommendations', 'pageType']
};

export async function actionAnalyzeScreenshot({
  imageFile,
  websiteUrl,
  keywords,
  targetAudience
}: {
  imageFile: File;
  websiteUrl: string;
  keywords: string[];
  targetAudience: string;
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

    const prompt = `
      You are an expert UI/UX analyst and SEO copywriter. Analyze the provided website screenshot.
      Your task is to identify all key content sections, and for each section, generate new SEO-optimized content.

      **Analysis Context:**
      - Website URL (if provided): ${websiteUrl}
      - Target Audience: ${targetAudience}
      - Primary SEO Keywords to use: ${keywords.join(', ')}

      **Instructions:**
      1.  **Detect Content Sections:** Analyze the image to identify distinct UI sections like 'hero' headline, 'subheading', 'features' list, 'cta_button', 'testimonial', 'footer', etc.
      2.  **Extract Information for Each Section:** For every section you identify:
          -   Determine its type from the allowed list.
          -   Create a clear, concise label (e.g., "Main Hero Headline").
          -   Calculate its position and dimensions as percentages of the total image size.
          -   If there is visible text, transcribe it as 'currentContent'.
      3.  **Generate SEO-Optimized Content:** For each section, write new 'suggestedContent' that:
          -   Is tailored to the **${targetAudience}**.
          -   Naturally incorporates the provided **SEO keywords**.
          -   Follows copywriting best practices for that section type (e.g., action-oriented for CTAs, benefit-driven for features).
          -   Use Markdown for formatting like bolding or lists.
      4.  **Provide SEO Metrics:** For each new piece of content, estimate an 'seoScore', list the 'keywords' you used, and provide the 'characterCount'.
      5.  **Overall Analysis:** After analyzing all sections, provide an 'overallSeoScore' for the revised page, a list of general 'recommendations' to further improve the page, and identify the 'pageType'.
      6.  **ID Generation:** For the 'id' field of each section, generate a short, unique random string.
      
      Return your complete analysis in the specified JSON format.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [imagePart, { text: prompt }] },
            config: {
                responseMimeType: "application/json",
                responseSchema: analysisSchema,
            },
        });
        
        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);
        
        // The API returns a raw object, we need to cast it and add the imageUrl
        const analysisResult: Omit<AnalysisResult, 'imageUrl'> = result;
        
        return {
            ...analysisResult,
            imageUrl: URL.createObjectURL(imageFile),
        };

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to analyze screenshot: ${error.message}`);
        }
        throw new Error("An unknown error occurred during analysis.");
    }
}
