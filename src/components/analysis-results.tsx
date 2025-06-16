"use client"

import { ArrowLeft, Search, Target, File, Loader2, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAnalysisStore } from "@/lib/store"
import { useAuth } from "@/lib/auth-context"
import React from "react"
import Link from "next/link"
import { FeedbackPrompt } from "./FeedbackPrompt"

interface AnalysisResultsProps {
  onStartOver: () => void
}

export function AnalysisResults({ onStartOver }: AnalysisResultsProps) {
  const { 
    analysisData, 
    result, 
    isLoading, 
    error, 
    startAnalysis 
  } = useAnalysisStore()
  
  const { user } = useAuth()
  const isAuthenticated = !!user

  // Determine if we should show feedback prompt
  const showFeedbackPrompt = !!(isAuthenticated && result && !isLoading && !error)

  // Detect if summary is the search engine message
  const isSearchEngineSummary = result?.summary === "This is a general search engine page, which doesn't have a specific user flow or UI content to analyze."
  const isEmailInput = result?.summary === "The input appears to be an email address, which is not valid for UX analysis."

  const renderSourceInfo = () => {
    if (!analysisData) return null;
    
    if (analysisData.type === "url") {
      return (
        <div className="flex items-center gap-2 text-xl font-semibold">
          <Search className="h-5 w-5" />
          <h2>
            UX Analysis of <a className="text-blue-600" href={analysisData.content} target="_blank" rel="noopener noreferrer">{analysisData.content}</a>
          </h2>
        </div>
      )
    } else {
      return (
        <div className="flex items-center gap-2 text-xl font-semibold">
          <File className="h-5 w-5" />
          <h2>
            UX Analysis of <a className="text-blue-600" href={analysisData.content} target="_blank" rel="noopener noreferrer">{analysisData.fileName || "uploaded file"}</a>
          </h2>
        </div>
      )
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto p-8 flex flex-col items-center justify-center h-[80vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h2 className="text-xl font-medium">Analyzing your content...</h2>
        <p className="text-muted-foreground mt-2">This may take a minute or two.</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-medium text-red-800 mb-2">Analysis Failed</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <div className="flex gap-4 justify-center">
            <Button 
              onClick={() => startAnalysis()} 
              className="p-2.5 sm:p-3 text-base rounded-lg shadow-md transition-all hover:shadow-lg bg-indigo-500 hover:bg-indigo-600 text-white focus:ring-4 focus:ring-indigo-300 focus:ring-opacity-50"
            >
              Try Again
            </Button>
            <Button 
              onClick={onStartOver} 
              className="p-2.5 sm:p-3 text-base rounded-lg shadow-md transition-all hover:shadow-lg bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 focus:ring-4 focus:ring-indigo-300 focus:ring-opacity-50"
            >
              Start Over
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="max-w-3xl mx-auto p-8 flex flex-col items-center justify-center h-[80vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h2 className="text-xl font-medium">Preparing analysis...</h2>
        <p className="text-muted-foreground mt-2">Just a moment...</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto p-8 relative">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <span className="text-2xl">😊</span>
          <h1 className="text-3xl font-bold">Analysis</h1>
        </div>
        <button 
          onClick={onStartOver} 
          className="text-blue-600 hover:text-blue-800 hover:cursor-pointer flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Start over
        </button>
      </div>

      <div className="space-y-8 relative">
        {renderSourceInfo()}

        {result.summary && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h2 className="text-xl font-bold mb-2">Summary</h2>
            <p className="text-blue-800">{result.summary}</p>
          </div>
        )}

        {/* Only show problems and issues if NOT a search engine summary or email */}
        {!isSearchEngineSummary && !isEmailInput && (
          <>
            {!isAuthenticated && (
              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 mb-6">
                <div className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-indigo-500" />
                  <p className="text-indigo-800 font-medium">
                    You&apos;re viewing 40% of the analysis results. Sign up to unlock the full report.
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-red-500" />
                <h3 className="text-lg font-semibold">User Problem Summary</h3>
              </div>

              <ul className="space-y-4 pl-5">
                {/* Show 40% of problems for unauthenticated users */}
                {(isAuthenticated 
                  ? result.problems
                  : result.problems.slice(0, Math.ceil(result.problems.length * 0.4))
                ).map((problem, index) => (
                  <li key={index} className="list-disc list-outside">
                    <span className="font-semibold">{problem.title}:</span> {problem.description}
                    {problem.error && problem.error.length > 0 && (
                      <ul className="list-disc pl-6 text-sm text-red-600">
                        {problem.error.map((err, j) => (
                          <li key={j}>{err}</li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <span className="text-xl">📋</span>
                <h3 className="text-lg font-semibold">Identified UX Issues</h3>
              </div>

              {/* Show 40% of issues for unauthenticated users */}
              {(isAuthenticated 
                ? result.issues
                : result.issues.slice(0, Math.ceil(result.issues.length * 0.4))
              ).map((issue) => (
                <div key={issue.id} className="space-y-2">
                  <h4 className="flex items-center gap-2 font-medium text-blue-700">
                    <span className="text-blue-500">◆</span> {issue.id}. {issue.title} <span className="text-xs text-gray-500">({issue.priorityList})</span>
                  </h4>

                  <ul className="space-y-4 pl-5">
                    <li className="list-disc list-outside">
                      <span className="font-semibold">Observation:</span> {issue.observation}
                    </li>
                    <li className="list-disc list-outside">
                      <span className="font-semibold">Impact:</span> {issue.impact}
                    </li>
                    {issue.suggestion && (
                      <li className="list-disc list-outside">
                        <span className="font-semibold">Suggestion:</span> {issue.suggestion}
                      </li>
                    )}
                    {issue.aptestplan && (
                      <li className="list-disc list-outside">
                        <span className="font-semibold">A/B Test Plan:</span> {issue.aptestplan}
                      </li>
                    )}
                    <li className="list-disc list-outside">
                      <span className="font-semibold">Priority:</span>{' '}
                      {issue.priorityList && (
                        <>
                          {issue.priorityList.toLowerCase().includes('critical') && <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-1"></span>}
                          {issue.priorityList.toLowerCase().includes('medium') && <span className="inline-block w-3 h-3 bg-yellow-500 rounded-full mr-1"></span>}
                          {issue.priorityList.toLowerCase().includes('low') && <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-1"></span>}
                          {issue.priorityList}
                        </>
                      )}
                    </li>
                  </ul>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Overlay for unauthenticated users */}
        {!isAuthenticated && !isSearchEngineSummary && !isEmailInput && (
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white pointer-events-none" style={{ top: '50%' }}>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-b from-white/80 to-white p-8 text-center pointer-events-auto">
              <div className="flex flex-col items-center gap-4">
                <div className="p-3 bg-indigo-100 rounded-full">
                  <Lock className="h-8 w-8 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold">Sign up or sign in to see full analytics</h3>
                <p className="text-gray-600 mb-4">Get complete insights and actionable recommendations</p>
                <div className="flex gap-4">
                  <Link href="/auth/sign-in?return_to=analysis">
                    <Button variant="outline" className="px-6">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/sign-up?return_to=analysis">
                    <Button variant="default" className="px-6 bg-indigo-600 hover:bg-indigo-700">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* NPS Feedback Prompt */}
      <FeedbackPrompt show={showFeedbackPrompt} />
    </div>
  )
}
