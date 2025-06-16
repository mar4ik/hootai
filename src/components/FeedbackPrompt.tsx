"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface FeedbackPromptProps {
  show: boolean
}

export function FeedbackPrompt({ show }: FeedbackPromptProps) {
  const [score, setScore] = useState<number | null>(null)
  const [comment, setComment] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!show || submitted) {
    return null
  }

  const handleSubmit = async () => {
    if (score === null) return
    
    setIsSubmitting(true)
    
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ score, comment }),
      })
      
      setSubmitted(true)
      setTimeout(() => {
        setSubmitted(false)
      }, 3000)
    } catch (error) {
      console.error('Failed to submit feedback:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show thank you message after submission
  if (submitted) {
    return (
      <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-6 max-w-md border border-gray-200 animate-in fade-in slide-in-from-bottom-5">
        <h3 className="text-lg font-medium mb-2">Thank you for your feedback!</h3>
        <p className="text-gray-600">Your input helps us improve Hoot.ai.</p>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-6 max-w-md border border-gray-200 animate-in fade-in slide-in-from-bottom-5">
      <h3 className="text-lg font-medium mb-2">How likely are you to recommend Hoot.ai to a friend or colleague?</h3>
      
      <div className="flex justify-between my-4">
        {[...Array(11)].map((_, i) => (
          <button
            key={i}
            onClick={() => setScore(i)}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              score === i 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
            }`}
          >
            {i}
          </button>
        ))}
      </div>
      
      <div className="flex justify-between text-sm text-gray-500 mb-4">
        <span>Not likely</span>
        <span>Very likely</span>
      </div>
      
      {score !== null && (
        <div className="mt-4">
          <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-1">
            {score <= 6 ? 'What could we improve?' : 'Any feedback?'}
          </label>
          <textarea
            id="feedback"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            rows={3}
          />
        </div>
      )}
      
      <div className="mt-4 flex justify-end gap-2">
        <Button 
          variant="outline" 
          onClick={() => setSubmitted(true)}
        >
          Skip
        </Button>
        <Button 
          disabled={score === null || isSubmitting} 
          onClick={handleSubmit}
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </Button>
      </div>
    </div>
  )
} 