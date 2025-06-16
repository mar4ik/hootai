import axios from "axios";
import { AnalysisData } from '@/components/main-content'
import { z } from 'zod'

// Define Zod schema for type safety
const AnalysisResultSchema = z.object({
  summary: z.string(),
  problems: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      error: z.array(z.string()).optional(),
    })
  ),
  issues: z.array(
    z.object({
      id: z.number(),
      title: z.string(),
      observation: z.string(),
      impact: z.string(),
      suggestion: z.string(),
      estimation: z.string(),
      aptestplan: z.string(),
      priorityList: z.string(),
    })
  )
})
// Add this email checker function near isSearchEngine:
function isEmail(input: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input)
}

export type AnalysisResult = z.infer<typeof AnalysisResultSchema>

// Search engine checker helper
function isSearchEngine(url: string): boolean {
  const searchDomains = [
    'google.com',
    'bing.com',
    'yahoo.com',
    'duckduckgo.com',
    'ask.com',
    'aol.com',
    'baidu.com',
    'yandex.com'
  ]

  try {
    const parsed = new URL(url)
    return searchDomains.some(domain => parsed.hostname.includes(domain))
  } catch (_e) {
    return false
  }
}

const UX_ANALYSIS_PROMPT = `You are a UX Data Analyst and UI Expert. The user will either provide a website link or a CSV/PDF file containing website analytics.

IMPORTANT: You must respond with ONLY a valid JSON object that matches this exact structure, with no additional text before or after:
{
  "summary": "string",
  "problems": [
    {
      "title": "string",
      "description": "string",
      "error": ["string"]
    }
  ],
  "issues": [
    {
      "id": number,
      "title": "string",
      "observation": "string",
      "impact": "string",
      "suggestion": "string",
      "estimation": "string",
      "aptestplan": "string",
      "priorityList": "string"
    }
  ]
}

DO NOT include any explanatory text, markdown formatting, or code blocks around the JSON. Return ONLY the raw JSON object.

🚫 Skip Condition (Search Engine Pages):
If the provided link is to a general-purpose search engine or search engine results page (e.g., www.google.com, www.bing.com, www.yahoo.com, www.duckduckgo.com, etc.), do not perform any analysis. Simply respond with:
{
  "summary": "This is a general search engine page, which doesn't have a specific user flow or UI content to analyze.",
  "problems": [],
  "issues": []
}

📊 File Input (CSV or PDF):
If the user uploads a CSV or PDF file, assume it contains website user analytics. In that case:
1. Identify patterns, friction points, or drop-offs in user behavior.
2. Summarize key UX insights based on the data.
3. Suggest 3 specific UX improvements based on these insights.
4. Estimate how much each improvement could increase user satisfaction (as a %).
5. Prioritize each improvement as Critical, Medium, or Low.
6. Propose an A/B test plan for each improvement (include a hypothesis, what to test, and how to measure success).

🌐 Web Page Input (All other valid websites):
If the user provides a valid website (that is not a search engine):
1. Identify any broken flows, pain points, or friction areas based on standard UX heuristics.
2. Summarize your UX findings.
3. Suggest 3 specific UX improvements based on your findings.
4. Estimate how much each improvement could increase user satisfaction (as a %).
5. Create a prioritized list of these improvements. Mark each as Critical, Medium, or Low.
6. Propose an A/B test plan for each improvement: include a hypothesis, what to test, and how to measure success.

Note: Do not analyze raw HTML or hidden elements. Focus only on visible, user-facing content. Begin your analysis only after the page is fully loaded.`

const AZURE_GROK_RESOURCE = process.env.AZURE_GROK_RESOURCE;
const AZURE_GROK_DEPLOYMENT = process.env.AZURE_GROK_DEPLOYMENT;
const AZURE_OPENAI_API_KEY = process.env.AZURE_OPENAI_API_KEY;
const AZURE_OPENAI_API_VERSION = process.env.AZURE_OPENAI_API_VERSION;

const AZURE_GROK_ENDPOINT = `https://${AZURE_GROK_RESOURCE}.openai.azure.com/openai/deployments/${AZURE_GROK_DEPLOYMENT}/chat/completions?api-version=${AZURE_OPENAI_API_VERSION}`;

export async function analyzeContent(data: AnalysisData): Promise<AnalysisResult> {
  try {
    let analysisPrompt = UX_ANALYSIS_PROMPT

    // Check for search engine URL first
    if (data.type === 'url' && isSearchEngine(data.content)) {
      return {
        summary: "This is a general search engine page, which doesn't have a specific user flow or UI content to analyze.",
        problems: [],
        issues: []
      }
    }

    // NEW: Check if input is email address — skip summary
    if (data.type === 'url' && isEmail(data.content)) {
      return {
        summary: "The input appears to be an email address, which is not valid for UX analysis. Please enter a website URL (e.g., https://example.com) or upload a CSV/PDF file containing analytics data.",
        problems: [],
        issues: []
      }
    }

    // For valid URLs, try to append context
    if (data.type === 'url') {
      try {
        const response = await fetch(data.content)
        if (!response.ok) {
          throw new Error(`Failed to fetch URL: ${response.statusText}`)
        }
        analysisPrompt += `\n\nAnalyze this website URL: ${data.content}`
      } catch {
        analysisPrompt += `\n\nAnalyze this website URL: ${data.content}`
      }
    } else if (data.type === 'file') {
      // For file types
      if (data.fileName?.toLowerCase().endsWith('.csv')) {
        analysisPrompt += `\n\nAnalyze this CSV data:\n${data.content}`
      } else if (data.fileName?.toLowerCase().endsWith('.pdf')) {
        analysisPrompt += `\n\nAnalyze this PDF content:\n${data.content}`
      } else {
        analysisPrompt += `\n\nAnalyze this content:\n${data.content}`
      }
    }



    if (!AZURE_GROK_RESOURCE || !AZURE_GROK_DEPLOYMENT || !AZURE_OPENAI_API_KEY || !AZURE_OPENAI_API_VERSION) {
      throw new Error("One or more Azure OpenAI environment variables are not set.");
    }

    let response;
    try {
      response = await axios.post(
        AZURE_GROK_ENDPOINT,
        {
          messages: [
            { role: "system", content: "You are a UX analysis AI that responds ONLY with valid JSON. Never include explanations or text outside of the JSON object." },
            { role: "user", content: analysisPrompt }
          ],
          max_tokens: 1000,
          temperature: 0.7,
          top_p: 1.0,
          frequency_penalty: 0.0,
          presence_penalty: 0.0
        },
        {
          headers: {
            "api-key": AZURE_OPENAI_API_KEY,
            "Content-Type": "application/json"
          }
        }
      );
    } catch (apiError) {
      console.error("Azure Grok API call failed:", apiError);
      throw new Error("Azure Grok API call failed");
    }

    const content = response.data.choices?.[0]?.message?.content;
    if (!content) throw new Error("No response from Azure Grok");

    // Direct attempt to parse the content as JSON first
    if (typeof content === 'string') {
      try {
        // Try direct parsing first
        const directParsed = JSON.parse(content.trim());
        if (directParsed && typeof directParsed === 'object') {
          // Ensure we have the required fields
          const validatedResult = {
            summary: directParsed.summary || "Analysis completed successfully.",
            problems: Array.isArray(directParsed.problems) ? directParsed.problems : [],
            issues: Array.isArray(directParsed.issues) ? directParsed.issues : []
          };
          return AnalysisResultSchema.parse(validatedResult);
        }
      } catch (_e) {
        // Direct JSON parsing failed, trying alternative methods
      }
    }

    try {
      // If content is a string, try to parse it as JSON
      if (typeof content === 'string') {
        try {
          // Try to extract JSON from the string if it contains JSON
          // Check if the content is a raw JSON string that needs to be parsed
          if (content.trim().startsWith('{') && content.trim().endsWith('}')) {
            const object = JSON.parse(content);
            return AnalysisResultSchema.parse(object);
          } 
          
          // If the content contains JSON embedded in text, try to extract it
          // Use a more robust approach to find complete JSON objects
          try {
            // Try to find a complete JSON object by looking for balanced braces
            let depth = 0;
            let startIndex = -1;
            let extractedJson = '';
            
            for (let i = 0; i < content.length; i++) {
              if (content[i] === '{') {
                if (depth === 0) {
                  startIndex = i;
                }
                depth++;
              } else if (content[i] === '}') {
                depth--;
                if (depth === 0 && startIndex !== -1) {
                  // We found a complete JSON object
                  extractedJson = content.substring(startIndex, i + 1);
                  try {
                    const object = JSON.parse(extractedJson);
                    if (object && typeof object === 'object') {
                      return AnalysisResultSchema.parse(object);
                    }
                  } catch (_e) {
                    // Found JSON-like structure but failed to parse
                  }
                }
              }
            }
          } catch (_jsonError) {
            // Failed to extract JSON
          }
          
          // If we couldn't extract valid JSON, treat it as a summary string
          return AnalysisResultSchema.parse({
            summary: content,
            problems: [],
            issues: []
          });
        } catch (_e) {
          // If it's not valid JSON, maybe it's just a summary string, so wrap it
          return AnalysisResultSchema.parse({
            summary: content,
            problems: [],
            issues: []
          });
        }
      }
      // If content is already an object, use it directly
      if (typeof content === 'object') {
        return AnalysisResultSchema.parse(content);
      }
      throw new Error('Unexpected content type from Azure Grok');
    } catch (_parseError) {
      throw new Error('Azure Grok response was not valid JSON');
    }
  } catch (error) {
    return {
      summary: 'Analysis failed. Please try again.',
      problems: [{
        title: 'Analysis Error',
        description: error instanceof Error ? error.message : 'We encountered an error while analyzing your content.',
        error: ['error'],
      }],
      issues: []
    };
  }
}
