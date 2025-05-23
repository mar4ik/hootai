"use client"

import { useState } from "react"
import { GettingStarted } from "@/components/getting-started"
import { AnalysisResults } from "@/components/analysis-results"
import { useAnalysisStore } from "@/lib/store"

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
