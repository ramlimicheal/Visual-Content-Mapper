
import type { AnalysisResult, ExportFormat } from "../types";

// Export to Markdown
export function exportToMarkdown(analysis: AnalysisResult, config: {
  websiteUrl: string;
  keywords: string;
  targetAudience: string;
}): string {
  let content = `# Visual Content Analysis Report\n\n`;
  content += `**Generated:** ${new Date(analysis.timestamp || Date.now()).toLocaleString()}\n`;
  content += `**Website:** ${config.websiteUrl || 'N/A'}\n`;
  content += `**Target Audience:** ${config.targetAudience}\n`;
  content += `**Keywords:** ${config.keywords}\n`;
  content += `**Overall SEO Score:** ${analysis.overallSeoScore}/100\n`;
  content += `**Page Type:** ${analysis.pageType}\n\n`;
  content += `---\n\n`;

  // Technical SEO Section
  if (analysis.technicalSeo) {
    content += `## 📋 Technical SEO\n\n`;
    content += `**Meta Title:** ${analysis.technicalSeo.metaTitle || 'N/A'}\n\n`;
    content += `**Meta Description:** ${analysis.technicalSeo.metaDescription || 'N/A'}\n\n`;
    if (analysis.technicalSeo.h1Tags && analysis.technicalSeo.h1Tags.length > 0) {
      content += `**H1 Tags:**\n${analysis.technicalSeo.h1Tags.map(h => `- ${h}`).join('\n')}\n\n`;
    }
    if (analysis.technicalSeo.schemaMarkup) {
      content += `**Schema Markup:**\n\`\`\`json\n${analysis.technicalSeo.schemaMarkup}\n\`\`\`\n\n`;
    }
    content += `---\n\n`;
  }

  // Brand Voice Analysis
  if (analysis.brandVoiceAnalysis) {
    content += `## 🎯 Brand Voice Analysis\n\n`;
    content += `**Detected Tone:** ${analysis.brandVoiceAnalysis.detectedTone}\n`;
    content += `**Consistency Score:** ${analysis.brandVoiceAnalysis.consistency}/100\n\n`;
    if (analysis.brandVoiceAnalysis.suggestions.length > 0) {
      content += `**Suggestions:**\n${analysis.brandVoiceAnalysis.suggestions.map(s => `- ${s}`).join('\n')}\n\n`;
    }
    content += `---\n\n`;
  }

  // Sections
  content += `## 📝 Content Sections\n\n`;
  analysis.sections.forEach((section, i) => {
    content += `### ${i + 1}. ${section.label} (${section.type})\n\n`;
    content += `**SEO Score:** ${section.seoScore}/100\n`;
    content += `**Keywords:** ${section.keywords.join(', ')}\n`;
    content += `**Character Count:** ${section.characterCount}\n`;

    if (section.readabilityScore) {
      content += `**Readability Score:** ${section.readabilityScore}/100\n`;
    }
    if (section.sentimentScore !== undefined) {
      content += `**Sentiment:** ${section.sentimentScore > 0 ? 'Positive' : section.sentimentScore < 0 ? 'Negative' : 'Neutral'} (${section.sentimentScore.toFixed(2)})\n`;
    }
    if (section.brandVoiceMatch) {
      content += `**Brand Voice Match:** ${section.brandVoiceMatch}/100\n`;
    }

    content += `\n**Primary Content:**\n\n${section.suggestedContent}\n\n`;

    // Content Variants
    if (section.contentVariants && section.contentVariants.length > 0) {
      content += `**Alternative Variants:**\n\n`;
      section.contentVariants.forEach((variant, vi) => {
        content += `**Variant ${vi + 1}** (${variant.tone}, ${variant.lengthCategory})\n`;
        content += `- SEO Score: ${variant.seoScore}/100\n`;
        if (variant.predictedCTR) {
          content += `- Predicted CTR: ${variant.predictedCTR.toFixed(1)}%\n`;
        }
        content += `- Reasoning: ${variant.reasoning}\n`;
        content += `- Content: ${variant.content}\n\n`;
      });
    }

    // Issues
    if (section.technicalSeoIssues && section.technicalSeoIssues.length > 0) {
      content += `**⚠️ Technical SEO Issues:**\n${section.technicalSeoIssues.map(issue => `- ${issue}`).join('\n')}\n\n`;
    }
    if (section.accessibilityIssues && section.accessibilityIssues.length > 0) {
      content += `**♿ Accessibility Issues:**\n${section.accessibilityIssues.map(issue => `- ${issue}`).join('\n')}\n\n`;
    }

    content += `---\n\n`;
  });

  // Recommendations
  content += `## 💡 Recommendations\n\n`;
  analysis.recommendations.forEach((rec, i) => {
    content += `${i + 1}. ${rec}\n`;
  });
  content += `\n`;

  // Performance Metrics
  if (analysis.performanceMetrics) {
    content += `---\n\n## ⚡ Performance Metrics\n\n`;
    content += `**Estimated Load Time:** ${analysis.performanceMetrics.estimatedLoadTime}s\n`;
    content += `**Mobile Optimization:** ${analysis.performanceMetrics.mobileOptimization}/100\n\n`;
    content += `**Core Web Vitals:**\n`;
    content += `- LCP (Largest Contentful Paint): ${analysis.performanceMetrics.coreWebVitals.lcp}\n`;
    content += `- FID (First Input Delay): ${analysis.performanceMetrics.coreWebVitals.fid}\n`;
    content += `- CLS (Cumulative Layout Shift): ${analysis.performanceMetrics.coreWebVitals.cls}\n`;
  }

  return content;
}

// Export to JSON
export function exportToJSON(analysis: AnalysisResult): string {
  return JSON.stringify(analysis, null, 2);
}

// Export to HTML
export function exportToHTML(analysis: AnalysisResult, config: {
  websiteUrl: string;
  keywords: string;
  targetAudience: string;
}): string {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Visual Content Analysis Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px;
      border-radius: 12px;
      margin-bottom: 30px;
    }
    .header h1 { margin: 0 0 20px 0; }
    .meta { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; }
    .meta-item { background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; }
    .meta-item strong { display: block; font-size: 12px; opacity: 0.8; margin-bottom: 5px; }
    .section {
      background: white;
      padding: 30px;
      border-radius: 12px;
      margin-bottom: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .section h2 { color: #667eea; margin-top: 0; }
    .score {
      display: inline-block;
      background: #10b981;
      color: white;
      padding: 5px 15px;
      border-radius: 20px;
      font-weight: bold;
      font-size: 14px;
    }
    .variant {
      background: #f9fafb;
      border-left: 4px solid #667eea;
      padding: 15px;
      margin: 15px 0;
      border-radius: 4px;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      margin-right: 8px;
      background: #e0e7ff;
      color: #4338ca;
    }
    .issue {
      background: #fef2f2;
      border-left: 4px solid #ef4444;
      padding: 12px;
      margin: 10px 0;
    }
    .recommendation {
      padding: 15px;
      background: #f0fdf4;
      border-left: 4px solid #10b981;
      margin: 10px 0;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 Visual Content Analysis Report</h1>
    <div class="meta">
      <div class="meta-item">
        <strong>Generated</strong>
        ${new Date(analysis.timestamp || Date.now()).toLocaleString()}
      </div>
      <div class="meta-item">
        <strong>Website</strong>
        ${config.websiteUrl || 'N/A'}
      </div>
      <div class="meta-item">
        <strong>Target Audience</strong>
        ${config.targetAudience}
      </div>
      <div class="meta-item">
        <strong>Overall SEO Score</strong>
        <span class="score">${analysis.overallSeoScore}/100</span>
      </div>
    </div>
  </div>

  ${analysis.sections.map((section, i) => `
    <div class="section">
      <h2>${i + 1}. ${section.label} <span class="badge">${section.type}</span></h2>
      <p><span class="score">${section.seoScore}/100</span></p>
      <p><strong>Keywords:</strong> ${section.keywords.join(', ')}</p>

      <h3>Primary Content:</h3>
      <p>${section.suggestedContent.replace(/\n/g, '<br>')}</p>

      ${section.contentVariants && section.contentVariants.length > 0 ? `
        <h3>Content Variants:</h3>
        ${section.contentVariants.map((v, vi) => `
          <div class="variant">
            <strong>Variant ${vi + 1}</strong>
            <span class="badge">${v.tone}</span>
            <span class="badge">${v.lengthCategory}</span>
            <span class="badge">SEO: ${v.seoScore}/100</span>
            ${v.predictedCTR ? `<span class="badge">CTR: ${v.predictedCTR.toFixed(1)}%</span>` : ''}
            <p><em>${v.reasoning}</em></p>
            <p>${v.content}</p>
          </div>
        `).join('')}
      ` : ''}

      ${section.technicalSeoIssues && section.technicalSeoIssues.length > 0 ? `
        <h4>⚠️ Technical SEO Issues:</h4>
        ${section.technicalSeoIssues.map(issue => `<div class="issue">${issue}</div>`).join('')}
      ` : ''}
    </div>
  `).join('')}

  <div class="section">
    <h2>💡 Recommendations</h2>
    ${analysis.recommendations.map((rec, i) => `
      <div class="recommendation">
        <strong>${i + 1}.</strong> ${rec}
      </div>
    `).join('')}
  </div>
</body>
</html>
  `;

  return html;
}

// Export to CSV
export function exportToCSV(analysis: AnalysisResult): string {
  const headers = ['Section', 'Type', 'SEO Score', 'Keywords', 'Character Count', 'Content'];
  const rows = analysis.sections.map(section => [
    section.label,
    section.type,
    section.seoScore.toString(),
    section.keywords.join('; '),
    section.characterCount.toString(),
    `"${section.suggestedContent.replace(/"/g, '""')}"`
  ]);

  return [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
}

// Main export function
export function exportAnalysis(
  analysis: AnalysisResult,
  format: ExportFormat,
  config: {
    websiteUrl: string;
    keywords: string;
    targetAudience: string;
  }
): void {
  let content: string;
  let mimeType: string;
  let extension: string;

  switch (format) {
    case 'markdown':
      content = exportToMarkdown(analysis, config);
      mimeType = 'text/markdown';
      extension = 'md';
      break;
    case 'json':
      content = exportToJSON(analysis);
      mimeType = 'application/json';
      extension = 'json';
      break;
    case 'html':
      content = exportToHTML(analysis, config);
      mimeType = 'text/html';
      extension = 'html';
      break;
    case 'csv':
      content = exportToCSV(analysis);
      mimeType = 'text/csv';
      extension = 'csv';
      break;
    default:
      content = exportToMarkdown(analysis, config);
      mimeType = 'text/markdown';
      extension = 'md';
  }

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `content-analysis-${Date.now()}.${extension}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
