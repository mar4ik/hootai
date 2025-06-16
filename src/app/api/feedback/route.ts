import { NextRequest, NextResponse } from 'next/server'

interface FeedbackData {
  score: number
  comment?: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as FeedbackData
    const { score, comment } = body
    
    if (typeof score !== 'number' || score < 0 || score > 10) {
      return NextResponse.json(
        { error: 'Invalid score: must be a number between 0 and 10' },
        { status: 400 }
      )
    }

    // Map the score to a sentiment
    let sentiment = 'neutral'
    if (score >= 9) sentiment = 'positive'
    else if (score <= 5) sentiment = 'negative'

    // For now, just log the feedback
    console.log('Received feedback:', { 
      score, 
      comment, 
      sentiment,
      timestamp: new Date().toISOString()
    })
    
    // TODO: In the future, store this in Supabase
    // const { data, error } = await supabase
    //   .from('feedback')
    //   .insert([{ 
    //     score, 
    //     comment, 
    //     sentiment,
    //     created_at: new Date().toISOString()
    //   }])
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error processing feedback:', error)
    
    return NextResponse.json(
      { error: 'Failed to process feedback' },
      { status: 500 }
    )
  }
} 