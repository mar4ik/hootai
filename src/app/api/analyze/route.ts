import { NextRequest, NextResponse } from 'next/server'
import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { AnalysisData } from '@/components/main-content'
import { AnalysisResult } from '@/lib/ai-service'

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, content, fileName } = body as AnalysisData
    
    if (!type || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: type and content' },
        { status: 400 }
      )
    }

    if (type !== 'url' && type !== 'file') {
      return NextResponse.json(
        { error: 'Invalid type: must be "url" or "file"' },
        { status: 400 }
      )
    }

    let analysisPrompt = UX_ANALYSIS_PROMPT
    
    if (type === 'url') {
      // For URLs, we want to fetch the content first
      try {
        const response = await fetch(content)
        if (!response.ok) {
          throw new Error(`Failed to fetch URL: ${response.statusText}`)
        }
        
        const html = await response.text()
        analysisPrompt += `\n\nAnalyze this website HTML content:\n${html}`
      } catch {
        // If fetch fails, we'll just use the URL itself
        analysisPrompt += `\n\nAnalyze this website URL: ${content}`
      }
    } else if (type === 'file') {
      // For files, we use the content directly
      if (fileName?.toLowerCase().endsWith('.csv')) {
        analysisPrompt += `\n\nAnalyze this CSV data:\n${content}`
      } else if (fileName?.toLowerCase().endsWith('.pdf')) {
        // Note: PDF content might need special handling
        analysisPrompt += `\n\nAnalyze this PDF content:\n${content}`
      } else {
        analysisPrompt += `\n\nAnalyze this content:\n${content}`
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
      const result = JSON.parse(text) as AnalysisResult
      return NextResponse.json(result)
    } catch (parseError) {
      console.error('Error parsing JSON response:', parseError)
      return NextResponse.json(
        { error: 'Failed to parse AI response as JSON' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('API route error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze content' },
      { status: 500 }
    )
  }
} 