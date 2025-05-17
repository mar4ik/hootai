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

    const result = await analyzeContent({ type, content, fileName })
    return NextResponse.json(result)
  } catch (error) {
    console.error('API route error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze content' },
      { status: 500 }
    )
  }
} 