import { NextRequest, NextResponse } from 'next/server'
import { AnalysisData } from '@/components/main-content'
import { analyzeContent } from '@/lib/ai-service'

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

    try {
      const result = await analyzeContent({ type, content, fileName })
      
      // Ensure we're returning a properly formatted result
      if (typeof result === 'string') {
        // If result is a string (which shouldn't happen), try to parse it
        try {
          const parsedResult = JSON.parse(result);
          return NextResponse.json(parsedResult);
        } catch (_e) {
          // If parsing fails, wrap it in a proper structure
          return NextResponse.json({
            summary: result,
            problems: [],
            issues: []
          });
        }
      }
      
      // Validate the result structure before returning
      const validatedResult = {
        summary: result.summary || "Analysis completed successfully.",
        problems: Array.isArray(result.problems) ? result.problems : [],
        issues: Array.isArray(result.issues) ? result.issues : []
      };
      
      return NextResponse.json(validatedResult)
    } catch (analysisError) {

      return NextResponse.json(
        { 
          summary: 'Analysis failed. Please try again.',
          problems: [{
            title: 'Analysis Error',
            description: analysisError instanceof Error ? analysisError.message : 'We encountered an error while analyzing your content.',
            error: ['error'],
          }],
          issues: []
        },
        { status: 200 } // Return 200 with error content for better UX
      )
    }
  } catch (error) {

    return NextResponse.json(
      { 
        summary: 'Analysis request failed. Please try again.',
        problems: [{
          title: 'Request Error',
          description: error instanceof Error ? error.message : 'Failed to process analysis request',
          error: ['error'],
        }],
        issues: []
      },
      { status: 200 } // Return 200 with error content for better UX
    )
  }
} 