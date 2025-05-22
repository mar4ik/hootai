import { generateObject } from 'ai'
import { openai } from '@ai-sdk/openai'
import { AnalysisData } from '@/components/main-content'
import { z } from 'zod'

// Define Zod schema for type safety
const AnalysisResultSchema = z.object({
  summary: z.string(),
  problems: z.array(
    z.object({
      title: z.string(),
      description: z.string()
    })
  ),
  issues: z.array(
    z.object({
      id: z.number(),
      title: z.string(),
      observation: z.string(),
      impact: z.string(),
      suggestion: z.string().optional()
    })
  )
})

// Export the TypeScript type derived from the Zod schema
export type AnalysisResult = z.infer<typeof AnalysisResultSchema>

const UX_ANALYSIS_PROMPT = `
Act as a UX data analyst and a UI expert. Here's is a website link.
Identify broken flows and user frustration. Then, summarize your findings and suggest
3 UX changes that could improve user experience for this specific case.
Suggest how much this flow will improve after adding your improvements.
Create a priority list of improvements what goes first what next, mark as critical, medium, low.
create an A/B test plan.
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

    // Using ai-sdk to generate structured object with the schema
    const { object } = await generateObject({
      model: openai('gpt-4o'),
      prompt: analysisPrompt,
      schema: AnalysisResultSchema,
      temperature: 0.2,
      maxTokens: 2000,
    })

    return object
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