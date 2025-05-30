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
      priorityList:z.string(),
    })
  )
})

// Export the TypeScript type derived from the Zod schema
export type AnalysisResult = z.infer<typeof AnalysisResultSchema>

const UX_ANALYSIS_PROMPT = `
You are a UX Data Analyst and UI Expert. User will provide you a website link.
1. Identify any broken flows, pain points, or friction areas based on standard UX heuristics.
3. Summarize your UX findings.
4. Suggest 3 specific UX improvements based on your findings.
5. Estimate how much each improvement could increase user satisfaction (as a %).
6. Create a prioritized list of these improvements. Mark each as Critical, Medium, or Low.
7. Propose an A/B test plan for each improvement: include a hypothesis, what to test, and how to measure success.
Important: Do not analyze raw HTML or hidden elements. Focus only on visible, user-facing content. Begin only after the page is fully loaded.`

// 1. Identify top 3 user flows from the homepage or content.
// 2. Identify any broken flows, pain points, or friction areas based on standard UX heuristics.
// 3. Summarize your UX findings.
// 4. Suggest 3 specific UX improvements based on your findings.
// 5. Estimate how much each improvement could increase user satisfaction (as a %).
// 6. Create a prioritized list of these improvements. Mark each as Critical, Medium, or Low.
// 7. Propose an A/B test plan for each improvement: include a hypothesis, what to test, and how to measure success.
// Important: Do not analyze raw HTML or hidden elements. Focus only on visible, user-facing content. Begin only after the page is fully loaded.


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
        description: 'We encountered an error while analyzing your content.',
        error: ['error'],
      }],
      issues: []
    }
  }
} 
console.log(`Sending feedback to mariam.morozova@gmail.com: ...`)
