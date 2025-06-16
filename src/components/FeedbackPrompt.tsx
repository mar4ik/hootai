"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

interface FeedbackPromptProps {
  show: boolean
}

type FeedbackScore = 'happy' | 'neutral' | 'sad' | null;

export function FeedbackPrompt({ show }: FeedbackPromptProps) {
  const [score, setScore] = useState<FeedbackScore>(null)
  const [comment, setComment] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [shouldShow, setShouldShow] = useState(false)
  
  // Check if feedback has already been shown this session
  useEffect(() => {
    if (show) {
      const hasSeenFeedback = sessionStorage.getItem('hasSeenFeedback') === 'true';
      
      if (!hasSeenFeedback) {
        // Delay showing the feedback prompt by a few seconds after login
        const timer = setTimeout(() => {
          setShouldShow(true);
        }, 5000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [show]);

  // Don't render if we shouldn't show the component
  if (!show || !shouldShow || submitted) {
    return null;
  }

  const handleSubmit = async () => {
    if (score === null) return;
    
    setIsSubmitting(true);
    
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          score: score === 'happy' ? 10 : score === 'neutral' ? 7 : 3,
          comment 
        }),
      });
      
      // Mark as seen for this session
      sessionStorage.setItem('hasSeenFeedback', 'true');
      
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
      }, 3000);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show thank you message after submission
  if (submitted) {
    return (
      <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-xs border border-gray-200 animate-in fade-in slide-in-from-bottom-5">
        <p className="text-sm font-medium text-green-600">Thank you for your feedback!</p>
      </div>
    );
  }

  const handleDismiss = () => {
    // Mark as seen for this session
    sessionStorage.setItem('hasSeenFeedback', 'true');
    setSubmitted(true);
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-xs border border-gray-200 animate-in fade-in slide-in-from-bottom-5">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium">Were the insights you received from Hoot AI useful?</h3>
        <button 
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-500"
          aria-label="Close"
        >
          &times;
        </button>
      </div>
      
      <div className="flex justify-around my-3">
        <button
          onClick={() => setScore('happy')}
          className={`text-2xl p-2 rounded-full transition-all ${
            score === 'happy' ? 'bg-green-100 scale-110' : 'hover:bg-gray-100'
          }`}
          aria-label="Happy"
        >
          😀
        </button>
        <button
          onClick={() => setScore('neutral')}
          className={`text-2xl p-2 rounded-full transition-all ${
            score === 'neutral' ? 'bg-blue-100 scale-110' : 'hover:bg-gray-100'
          }`}
          aria-label="Neutral"
        >
          😐
        </button>
        <button
          onClick={() => setScore('sad')}
          className={`text-2xl p-2 rounded-full transition-all ${
            score === 'sad' ? 'bg-red-100 scale-110' : 'hover:bg-gray-100'
          }`}
          aria-label="Sad"
        >
          🙁
        </button>
      </div>
      
      {score !== null && (
        <div className="mt-2">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={2}
            placeholder="Any additional feedback? (optional)"
          />
        </div>
      )}
      
      <div className="mt-3 flex justify-end">
        <Button 
          disabled={score === null || isSubmitting}
          onClick={handleSubmit}
          className="text-xs py-1 px-3 h-auto"
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </Button>
      </div>
    </div>
  );
} 