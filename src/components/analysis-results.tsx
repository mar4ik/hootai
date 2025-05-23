"use client"

import { ArrowLeft, Search, Target, File, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAnalysisStore } from "@/lib/store"

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

  const renderSourceInfo = () => {
    if (!analysisData) return null;
    
    if (analysisData.type === "url") {
      return (
        <div className="flex items-center gap-2 text-xl font-semibold">
          <Search className="h-5 w-5" />
          <h2>
            UX Analysis of <span className="text-blue-600">{analysisData.content}</span>
          </h2>
        </div>
      )
    } else {
      return (
        <div className="flex items-center gap-2 text-xl font-semibold">
          <File className="h-5 w-5" />
          <h2>
            UX Analysis of <span className="text-blue-600">{analysisData.fileName || "uploaded file"}</span>
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
              className="p-2.5 sm:p-3 text-base rounded-lg shadow-md transition-all hover:shadow-lg bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-4 focus:ring-indigo-300 focus:ring-opacity-50"
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
    <div className="max-w-3xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <span className="text-2xl">😊</span>
          <h1 className="text-3xl font-bold">Analysis</h1>
        </div>
        <Button 
          onClick={onStartOver} 
          className="flex items-center gap-1 p-2 rounded-lg shadow-sm hover:bg-gray-100 transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          Start over
        </Button>
      </div>

      <div className="space-y-8">
        {renderSourceInfo()}

        {result.summary && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <p className="text-blue-800">{result.summary}</p>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-red-500" />
            <h3 className="text-lg font-semibold">User Problem Summary</h3>
          </div>

          <ul className="space-y-4 pl-5">
            {result.problems.map((problem, index) => (
              <li key={index} className="list-disc list-outside">
                <span className="font-semibold">{problem.title}:</span> {problem.description}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <span className="text-xl">📋</span>
            <h3 className="text-lg font-semibold">Identified UX Issues</h3>
          </div>

          {result.issues.map((issue) => (
            <div key={issue.id} className="space-y-2">
              <h4 className="flex items-center gap-2 font-medium text-blue-700">
                <span className="text-blue-500">◆</span> {issue.id}. {issue.title}
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
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
