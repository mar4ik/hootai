"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

interface FeedbackPromptProps {
  show: boolean
}

type FeedbackScore = 'happy' | 'neutral' | 'sad' | null;
type FeedbackState = 'initial' | 'submitting' | 'success' | 'collapsed';

export function FeedbackPrompt({ show }: FeedbackPromptProps) {
  const [score, setScore] = useState<FeedbackScore>(null)
  const [comment, setComment] = useState('')
  const [feedbackState, setFeedbackState] = useState<FeedbackState>('initial')
  const [shouldShow, setShouldShow] = useState(false)
  
  // Check if feedback has already been shown this session
  useEffect(() => {
    if (show) {
      const hasSeenFeedback = sessionStorage.getItem('hasSeenFeedback') === 'true';
      const feedbackSubmitted = sessionStorage.getItem('feedbackSubmitted') === 'true';
      
      if (feedbackSubmitted) {
        setFeedbackState('collapsed');
        setShouldShow(true);
      } else if (!hasSeenFeedback) {
        // Delay showing the feedback prompt by a few seconds after login
        const timer = setTimeout(() => {
          setShouldShow(true);
        }, 5000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [show]);

  // Don't render if we shouldn't show the component
  if (!show || !shouldShow) {
    return null;
  }

  const handleSubmit = async () => {
    if (score === null) return;
    
    setFeedbackState('submitting');
    
    try {
      // Add timeout to the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const _response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          score: score === 'happy' ? 10 : score === 'neutral' ? 7 : 3,
          comment 
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      // Mark as seen and submitted for this session
      sessionStorage.setItem('hasSeenFeedback', 'true');
      sessionStorage.setItem('feedbackSubmitted', 'true');
      
      // Show success state
      setFeedbackState('success');
      
      // Auto-collapse after 3 seconds
      setTimeout(() => {
        setFeedbackState('collapsed');
      }, 3000);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      
      // Even if there's an error, mark as seen to avoid bothering user again
      sessionStorage.setItem('hasSeenFeedback', 'true');
      sessionStorage.setItem('feedbackSubmitted', 'true');
      
      // Show success anyway to avoid user frustration
      setFeedbackState('success');
      setTimeout(() => {
        setFeedbackState('collapsed');
      }, 3000);
    }
  };

  const handleDismiss = () => {
    // Mark as seen for this session
    sessionStorage.setItem('hasSeenFeedback', 'true');
    setFeedbackState('collapsed');
  };
  
  const handleExpand = () => {
    setFeedbackState('initial');
  };

  // Show collapsed feedback button
  if (feedbackState === 'collapsed') {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button 
          onClick={handleExpand}
          className="bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:bg-gray-100 transition-all"
          aria-label="Give feedback"
          title="Give feedback"
        >
          <span className="text-lg">💬</span>
        </button>
      </div>
    );
  }

  // Show thank you message after submission
  if (feedbackState === 'success') {
    return (
      <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-xs border border-gray-200 animate-in fade-in slide-in-from-bottom-5 z-50">
        <p className="text-sm font-medium text-green-600 flex items-center">
          <span className="mr-2">✅</span>
          Thanks for your feedback!
        </p>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-xs border border-gray-200 animate-in fade-in slide-in-from-bottom-5 z-50">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium">Were the insights you received <br /> from Hoot AI useful?</h3>
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
          disabled={score === null || feedbackState === 'submitting'}
          onClick={handleSubmit}
          className="text-xs py-1 px-3 h-auto"
        >
          {feedbackState === 'submitting' ? 'Submitting...' : 'Submit'}
        </Button>
      </div>
    </div>
  );
} 