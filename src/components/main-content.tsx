"use client"

import { useState, useEffect } from "react"
import { GettingStarted } from "@/components/getting-started"
import { AnalysisResults } from "@/components/analysis-results"
import { useAnalysisStore } from "@/lib/store"
import { useAuth } from "@/lib/auth-context"

type Step = "getting-started" | "analysis-results"

export type AnalysisData = {
  type: "url" | "file"
  content: string
  fileName?: string
}

export function MainContent() {
  const [currentStep, setCurrentStep] = useState<Step>("getting-started")
  const setAnalysisData = useAnalysisStore(state => state.setAnalysisData)
  const reset = useAnalysisStore(state => state.reset)
  const analysisData = useAnalysisStore(state => state.analysisData)
  const result = useAnalysisStore(state => state.result)
  const startAnalysis = useAnalysisStore(state => state.startAnalysis)
  const { user } = useAuth()

  // Check for persisted analysis data on component mount
  useEffect(() => {
    // If we have both analysis data and results, show the results view
    if (analysisData && result) {
      setCurrentStep("analysis-results")
    }
    
    // Check for post-authentication return flag
    if (typeof window !== 'undefined') {
      const preserveAnalysis = localStorage.getItem('preserve_analysis')
      if (preserveAnalysis === 'true' && user) {
        // Clear the flag
        localStorage.removeItem('preserve_analysis')
        console.log("Found preserve_analysis flag, showing analysis results if available")
        
        if (analysisData) {
          // If we have analysis data but no result, re-run the analysis
          if (!result) {
            console.log("Re-running analysis after login")
            startAnalysis()
          }
          
          // Show analysis results even if they're being re-generated
          console.log("Showing preserved analysis results after login")
          setCurrentStep("analysis-results")
        }
      }
    }
  }, [analysisData, result, user, startAnalysis])

  const handleAnalysis = (data: AnalysisData) => {
    setAnalysisData(data)
    setCurrentStep("analysis-results")
  }

  const handleStartOver = () => {
    setCurrentStep("getting-started")
    reset()
  }

  return (
    <div className="flex-1 overflow-auto">
      {currentStep === "getting-started" && <GettingStarted onAnalyze={handleAnalysis} />}
      {currentStep === "analysis-results" && <AnalysisResults onStartOver={handleStartOver} />}
    </div>
  )
}
