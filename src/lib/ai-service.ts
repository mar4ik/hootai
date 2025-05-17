import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { AnalysisData } from '@/components/main-content'

export interface AnalysisResult {
  summary: string
  problems: {
    title: string
    description: string
  }[]
  issues: {
    id: number
    title: string
    observation: string
    impact: string
    suggestion?: string
  }[]
}

const UX_ANALYSIS_PROMPT = `
You are a professional UX analyst reviewing a website or product data.
Analyze the provided content and identify UX issues, problems, and potential improvements.

Format your response as a JSON object with the following structure:
{
  "summary": "A brief summary of the overall UX analysis",
  "problems": [
    {
      "title": "Short problem title",
      "description": "Detailed description of the problem"
    }
  ],
  "issues": [
    {
      "id": 1,
      "title": "Issue title",
      "observation": "What you observed",
      "impact": "How this impacts users",
      "suggestion": "Optional suggestion for improvement"
    }
  ]
}

Limit your analysis to 3-5 key problems and issues.
Provide specific, actionable insights based on UX best practices.
`

export async function analyzeContent(data: AnalysisData): Promise<AnalysisResult> {
  try {
    let analysisPrompt = UX_ANALYSIS_PROMPT
    
    if (data.type === 'url') {
      // For URLs, we want to fetch the content first
      try {
        const response = await fetch(data.content)
        if (!response.ok) {
          throw new Error(`Failed to fetch URL: ${response.statusText}`)
        }
        
        const html = await response.text()
        analysisPrompt += `\n\nAnalyze this website HTML content:\n${html}`
      } catch {
        // If fetch fails, we'll just use the URL itself
        analysisPrompt += `\n\nAnalyze this website URL: ${data.content}`
      }
    } else if (data.type === 'file') {
      // For files, we use the content directly
      if (data.fileName?.toLowerCase().endsWith('.csv')) {
        analysisPrompt += `\n\nAnalyze this CSV data:\n${data.content}`
      } else if (data.fileName?.toLowerCase().endsWith('.pdf')) {
        // Note: PDF content might need special handling
        analysisPrompt += `\n\nAnalyze this PDF content:\n${data.content}`
      } else {
        analysisPrompt += `\n\nAnalyze this content:\n${data.content}`
      }
    }

    // Using ai-sdk to generate text with JSON output
    const { text } = await generateText({
      model: openai('gpt-4o'),
      prompt: analysisPrompt + "\n\nRemember to format your response as a valid JSON object according to the structure provided.",
      temperature: 0.2,
      maxTokens: 2000,
    })

    try {
      return JSON.parse(text) as AnalysisResult
    } catch (parseError) {
      console.error('Error parsing JSON response:', parseError)
      throw new Error('Failed to parse AI response as JSON')
    }
  } catch (error) {
    console.error('Error analyzing content:', error)
    // Return a default error result
    return {
      summary: 'Analysis failed. Please try again.',
      problems: [{ 
        title: 'Analysis Error', 
        description: 'We encountered an error while analyzing your content.' 
      }],
      issues: []
    }
  }
} 