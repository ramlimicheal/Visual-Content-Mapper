
import React, { useState, useRef } from "react";
import type { ChangeEvent } from 'react';
import { Button } from "./components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "./components/ui/Card";
import { Label } from "./components/ui/Label";
import { Input } from "./components/ui/Input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./components/ui/Tabs";
import { Badge } from "./components/ui/Badge";
import { 
  Sparkles, Upload, ImageIcon, Copy, Download, Eye,
  MapPin, Layout, Type as TypeIcon, CheckCircle2, AlertTriangle,
  RefreshCw, Zap, Target, Hash, Maximize2, FileText
} from "./components/icons";
import type { AnalysisResult, DetectedSection, SectionType } from "./types";
import { downloadFile } from "./utils";
import { actionAnalyzeScreenshot } from "./services/geminiService";


export default function App() {
  // Upload State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Input State
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [keywords, setKeywords] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  
  // Results
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  
  // UI State
  const [busy, setBusy] = useState(false);
  const [currentTab, setCurrentTab] = useState("upload");
  const [error, setError] = useState("");
  const [showComparison, setShowComparison] = useState(false);
  
  const keywordsArray = keywords.split(',').map(k => k.trim()).filter(Boolean);
  
  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError("");
    } else {
      setError("Please upload a valid image file");
    }
  };
  
  const handleAnalyze = async () => {
    if (!imageFile) {
      setError("Please upload a screenshot first");
      return;
    }
    
    setBusy(true);
    setError("");
    setAnalysis(null);
    try {
      const result = await actionAnalyzeScreenshot({
        imageFile,
        websiteUrl,
        keywords: keywordsArray,
        targetAudience
      });
      
      setAnalysis(result);
      setSelectedSection(result.sections[0]?.id || null);
      setCurrentTab("results");
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message || "Analysis failed");
      } else {
        setError("An unknown error occurred during analysis.");
      }
    } finally {
      setBusy(false);
    }
  };
  
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Maybe show a toast notification here in a real app
    } catch (e) {
      console.error("Copy failed:", e);
    }
  };
  
  const exportAllContent = () => {
    if (!analysis) return;
    
    let content = `# Website Content Map\n\n`;
    content += `**Website:** ${websiteUrl || 'N/A'}\n`;
    content += `**Target Audience:** ${targetAudience}\n`;
    content += `**Keywords:** ${keywords}\n`;
    content += `**Overall SEO Score:** ${analysis.overallSeoScore}/100\n\n`;
    content += `---\n\n`;
    
    analysis.sections.forEach((section, i) => {
      content += `## ${i + 1}. ${section.label} (${section.type})\n\n`;
      content += `**SEO Score:** ${section.seoScore}/100\n`;
      content += `**Keywords:** ${section.keywords.join(', ')}\n`;
      content += `**Character Count:** ${section.characterCount}\n\n`;
      content += `**Content:**\n\n${section.suggestedContent}\n\n`;
      content += `---\n\n`;
    });
    
    content += `## Recommendations\n\n`;
    analysis.recommendations.forEach((rec, i) => {
      content += `${i + 1}. ${rec}\n`;
    });
    
    downloadFile('content-map.md', content, 'text/markdown');
  };
  
  const canAnalyze = imageFile && keywordsArray.length > 0 && targetAudience;
  const selectedSectionData = analysis?.sections.find(s => s.id === selectedSection);
  
  const sectionTypeIcons: Record<SectionType, React.ElementType> = {
    hero: Zap,
    subheading: TypeIcon,
    features: Layout,
    cta_button: Target,
    body_text: FileText,
    footer: Layout,
    navigation: MapPin,
    testimonial: CheckCircle2,
    pricing: Hash,
    form: Input
  };
  
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-slate-50">
      <div className="max-w-[1900px] mx-auto p-4 sm:p-6 space-y-6">
        
        <div className="text-center space-y-4 py-8">
          <div className="flex items-center justify-center gap-4">
            <ImageIcon className="h-12 w-12 text-indigo-400 animate-pulse" />
            <h1 className="text-4xl sm:text-6xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Visual Content Mapper
            </h1>
            <Eye className="h-12 w-12 text-pink-400 animate-pulse" />
          </div>
          <p className="text-slate-300 text-lg sm:text-xl max-w-3xl mx-auto">
            Screenshot → AI Analysis → SEO-Optimized Content → Visual Mapping
          </p>
        </div>
        
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
          <TabsList className="bg-slate-900/70 border border-slate-700 p-1 grid grid-cols-2 w-full max-w-2xl mx-auto">
            <TabsTrigger value="upload" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              <Upload className="h-4 w-4 mr-2" />
              Upload & Setup
            </TabsTrigger>
            <TabsTrigger value="results" disabled={!analysis} className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white disabled:cursor-not-allowed disabled:opacity-50">
              <MapPin className="h-4 w-4 mr-2" />
              Visual Mapping
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 bg-slate-900/60 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <ImageIcon className="h-5 w-5 text-indigo-400" />
                    Screenshot & Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="text-base mb-3 block">1. Upload Website Screenshot *</Label>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all ${
                        imagePreview
                          ? 'border-indigo-600 bg-indigo-950/20'
                          : 'border-slate-700 bg-slate-800/30 hover:border-slate-600'
                      }`}
                    >
                      {imagePreview ? (
                        <div className="space-y-4 text-center">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-auto max-h-[300px] object-contain rounded-lg border border-slate-700"
                          />
                          <Button variant="outline" size="sm" className="mt-4 mx-auto">
                            <Upload className="h-4 w-4 mr-2" />
                            Change Screenshot
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center space-y-3">
                          <Upload className="h-12 w-12 mx-auto text-slate-500" />
                          <div>
                            <p className="font-semibold text-slate-300">Click to upload or drag and drop</p>
                            <p className="text-xs text-slate-500 mt-1">PNG, JPG, WebP up to 10MB</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </div>
                  
                  <div className="space-y-4">
                    <Label className="text-base mb-1 block">2. Provide Context</Label>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-slate-400">Target Audience *</Label>
                        <Input className="mt-2 bg-slate-950 border-slate-700" placeholder="e.g., small businesses, developers" value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} />
                      </div>
                       <div>
                        <Label className="text-sm text-slate-400">Website URL (Optional)</Label>
                        <Input className="mt-2 bg-slate-950 border-slate-700" placeholder="https://example.com" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-base mb-1 block">3. Add SEO Keywords *</Label>
                    <Input className="mt-2 bg-slate-950 border-slate-700" placeholder="e.g., automation, productivity, workflow" value={keywords} onChange={(e) => setKeywords(e.target.value)} />
                    <p className="text-xs text-slate-400 mt-2">
                      {keywordsArray.length} keywords • Separate with commas. Used for SEO optimization.
                    </p>
                  </div>
                  
                  <Button onClick={handleAnalyze} disabled={!canAnalyze || busy} className="w-full h-14 text-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-700">
                    {busy ? ( <> <RefreshCw className="h-5 w-5 mr-2 animate-spin" /> Analyzing Screenshot... </> ) 
                         : ( <> <Sparkles className="h-5 w-5 mr-2" /> Analyze & Generate Content </> )}
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border-indigo-700/50">
                <CardHeader> <CardTitle className="text-lg">How It Works</CardTitle> </CardHeader>
                <CardContent className="text-sm text-slate-300 space-y-4">
                    {[
                      { title: "Upload Screenshot", desc: "Take a full-page screenshot of the website you want to optimize." },
                      { title: "AI Analyzes Layout", desc: "Detects sections like hero, features, CTAs, and testimonials." },
                      { title: "Generate SEO Content", desc: "Creates optimized copy for each section based on your keywords." },
                      { title: "Visual Mapping", desc: "Side-by-side comparison with exact positioning for new content." },
                      { title: "Copy & Paste", desc: "Easy one-click copy for exact placement in your website builder." }
                    ].map((step, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="bg-indigo-600 rounded-full w-6 h-6 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">{i + 1}</div>
                        <div>
                          <strong>{step.title}</strong>
                          <p className="text-xs text-slate-400">{step.desc}</p>
                        </div>
                      </div>
                    ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="results" className="space-y-6">
            {analysis && (
              <div className="space-y-6">
                <Card className="bg-slate-900/60 border-slate-700">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-6">
                        <div>
                          <div className="text-sm text-slate-400">Overall SEO Score</div>
                          <div className="text-3xl font-bold text-green-400">{analysis.overallSeoScore}/100</div>
                        </div>
                        <div>
                          <div className="text-sm text-slate-400">Sections Detected</div>
                          <div className="text-3xl font-bold">{analysis.sections.length}</div>
                        </div>
                        <div>
                          <div className="text-sm text-slate-400">Page Type</div>
                          <div className="text-lg font-semibold">{analysis.pageType}</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={exportAllContent} variant="outline" size="sm" className="gap-2"> <Download className="h-4 w-4" /> Export Content Map </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="grid lg:grid-cols-2 gap-6 items-start">
                  <Card className="bg-slate-900/60 border-slate-700 sticky top-6">
                    <CardHeader> <CardTitle className="text-lg">Visual Layout Map</CardTitle> </CardHeader>
                    <CardContent>
                      <div className="relative border border-slate-700 rounded-lg overflow-hidden">
                        <img src={analysis.imageUrl} alt="Screenshot" className="w-full h-auto" />
                        {analysis.sections.map(section => {
                          const Icon = sectionTypeIcons[section.type] || MapPin;
                          const isSelected = selectedSection === section.id;
                          const isHovered = hoveredSection === section.id;
                          return (
                            <div key={section.id} onClick={() => setSelectedSection(section.id)} onMouseEnter={() => setHoveredSection(section.id)} onMouseLeave={() => setHoveredSection(null)}
                              className={`absolute cursor-pointer transition-all duration-200 ${ isSelected ? 'bg-indigo-600/40 border-2 border-indigo-400' : isHovered ? 'bg-indigo-600/30 border-2 border-indigo-500' : 'bg-indigo-600/10 border border-indigo-600/50 hover:bg-indigo-600/20' }`}
                              style={{ left: `${section.position.x}%`, top: `${section.position.y}%`, width: `${section.position.width}%`, height: `${section.position.height}%` }}>
                              <div className="absolute top-1 left-1 flex items-center gap-1 bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full shadow-lg">
                                <Icon className="h-3 w-3" /> <span>{section.label}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-slate-900/60 border-slate-700">
                    <CardHeader> <CardTitle className="text-lg">SEO-Optimized Content</CardTitle> </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-4">
                        {analysis.sections.map(section => {
                          const Icon = sectionTypeIcons[section.type] || MapPin;
                          return (
                            <button key={section.id} onClick={() => setSelectedSection(section.id)}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-sm ${ selectedSection === section.id ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-800/50 border-slate-700 hover:bg-slate-700' }`}>
                              <Icon className="h-4 w-4" /> <span>{section.label}</span>
                            </button>
                          );
                        })}
                      </div>
                      
                      {selectedSectionData && (
                        <div key={selectedSectionData.id} className="space-y-4 transition-opacity duration-300">
                          <div className="grid grid-cols-3 gap-3 text-center">
                            <div className="p-2 rounded bg-slate-800/50"> <div className="text-xs text-slate-400">SEO Score</div> <div className="text-lg font-bold text-green-400">{selectedSectionData.seoScore}/100</div> </div>
                            <div className="p-2 rounded bg-slate-800/50"> <div className="text-xs text-slate-400">Keywords</div> <div className="text-lg font-bold">{selectedSectionData.keywords.length}</div> </div>
                            <div className="p-2 rounded bg-slate-800/50"> <div className="text-xs text-slate-400">Characters</div> <div className="text-lg font-bold">{selectedSectionData.characterCount}</div> </div>
                          </div>
                          
                          <div>
                            <div className="text-xs font-medium text-slate-400 mb-2">Optimized For Keywords:</div>
                            <div className="flex flex-wrap gap-1.5">
                              {selectedSectionData.keywords.map((kw, i) => ( <Badge key={i} variant="outline" className="border-slate-600"> {kw} </Badge> ))}
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-lg p-0.5">
                                <button onClick={() => setShowComparison(false)} className={`flex items-center gap-1.5 px-2 py-1 text-xs rounded-md transition-colors ${!showComparison ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>
                                  <Sparkles className="h-3 w-3" />
                                  Suggested
                                </button>
                                <button onClick={() => setShowComparison(true)} disabled={!selectedSectionData.currentContent} className={`flex items-center gap-1.5 px-2 py-1 text-xs rounded-md transition-colors ${showComparison ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-700'} disabled:opacity-50 disabled:cursor-not-allowed`}>
                                  <Maximize2 className="h-3 w-3" />
                                  Compare
                                </button>
                              </div>
                                <Button onClick={() => copyToClipboard(selectedSectionData.suggestedContent)} size="sm" variant="outline" className="gap-2 text-xs h-7 px-2 border-slate-600"> <Copy className="h-3 w-3" /> Copy </Button>
                            </div>
                            
                            {showComparison && selectedSectionData.currentContent ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <div className="text-xs font-medium text-slate-400 mb-2">Original Content</div>
                                  <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800 h-full text-sm text-slate-300">
                                    <pre className="whitespace-pre-wrap font-sans text-slate-300 bg-transparent p-0 m-0">
                                      {selectedSectionData.currentContent || "No text content detected."}
                                    </pre>
                                  </div>
                                </div>
                                <div>
                                  <div className="text-xs font-medium text-slate-400 mb-2">Suggested Content</div>
                                  <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800 h-full">
                                    <div className="prose prose-sm prose-invert max-w-none text-slate-200 leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: selectedSectionData.suggestedContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/•/g, '<br/>•') }} />
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800">
                                <div className="prose prose-sm prose-invert max-w-none text-slate-200 leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: selectedSectionData.suggestedContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/•/g, '<br/>•') }} />
                              </div>
                            )}
                          </div>

                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
                
                <Card className="bg-slate-900/60 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target className="h-4 w-4 text-indigo-400" /> SEO Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-3">
                      {analysis.recommendations.map((rec, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/30 border border-slate-800">
                          <div className="bg-indigo-600 rounded-full w-6 h-6 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">{i + 1}</div>
                          <p className="text-sm text-slate-300">{rec}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        {error && (
            <div className="transition-opacity duration-300">
              <Card className="bg-red-950/20 border-red-800">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0" />
                    <p className="text-red-200">{error}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
        )}
        
        <div className="text-center text-xs text-slate-500 pt-8">
          <p>Powered by Gemini API</p>
        </div>
      </div>
    </div>
  );
}
