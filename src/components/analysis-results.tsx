"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, Search, Target, File, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AnalysisData } from "./main-content"
import { AnalysisResult } from "@/lib/ai-service"

interface AnalysisResultsProps {
  data: AnalysisData
  onStartOver: () => void
}

export function AnalysisResults({ data, onStartOver }: AnalysisResultsProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<AnalysisResult | null>(null)

  useEffect(() => {
    async function performAnalysis() {
      setIsLoading(true)
      setError(null)
      
      try {
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Analysis failed')
        }

        const analysisResult = await response.json()
        setResult(analysisResult)
      } catch (err) {
        setError("Failed to analyze content. Please try again.")
        console.error("Analysis error:", err)
      } finally {
        setIsLoading(false)
      }
    }

    performAnalysis()
  }, [data])

  const renderSourceInfo = () => {
    if (data.type === "url") {
      return (
        <div className="flex items-center gap-2 text-xl font-semibold">
          <Search className="h-5 w-5" />
          <h2>
            UX Analysis of <span className="text-blue-600">{data.content}</span>
          </h2>
        </div>
      )
    } else {
      return (
        <div className="flex items-center gap-2 text-xl font-semibold">
          <File className="h-5 w-5" />
          <h2>
            UX Analysis of <span className="text-blue-600">{data.fileName || "uploaded file"}</span>
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
          <Button onClick={onStartOver} variant="outline">Try Again</Button>
        </div>
      </div>
    )
  }

  if (!result) {
    return null
  }

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <span className="text-2xl">😊</span>
          <h1 className="text-3xl font-bold">Analysis</h1>
        </div>
        <Button variant="ghost" onClick={onStartOver} className="flex items-center gap-1">
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
