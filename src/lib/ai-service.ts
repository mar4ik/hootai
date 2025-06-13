import { AzureOpenAI } from 'openai'
import { AnalysisData } from '@/components/main-content'
import { z } from 'zod'

// Initialize Azure OpenAI client
const azureOpenAI = new AzureOpenAI({
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  endpoint: "https://hoot-ai.openai.azure.com/",
  apiVersion: "2024-12-01-preview"
})

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

IMPORTANT: You must respond with a valid JSON object that matches this exact structure:
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

    const response = await azureOpenAI.chat.completions.create({
      model: "gpt-4.1",
      messages: [
        {
          role: "system",
          content: "You are a UX Data Analyst and UI Expert. You must respond with valid JSON only."
        },
        {
          role: "user",
          content: analysisPrompt
        }
      ],
      max_tokens: 800,
      temperature: 1.0,
      top_p: 1.0,
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
      response_format: { type: "json_object" }
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from Azure OpenAI')
    }

    try {
      const object = JSON.parse(content)
      return AnalysisResultSchema.parse(object)
    } catch (_parseError) {
      console.error('Failed to parse response:', content)
      throw new Error('Invalid response format from AI')
    }
  } catch (error) {
    console.error('Error analyzing content:', error)
    return {
      summary: 'Analysis failed. Please try again.',
      problems: [{
        title: 'Analysis Error',
        description: 'We encountered an error while analyzing your content.',
        error: ['error'],
      }],
      issues: []
    }
  }
}
