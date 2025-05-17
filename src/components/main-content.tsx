"use client"

import { useState } from "react"
import { GettingStarted } from "@/components/getting-started"
import { AnalysisResults } from "@/components/analysis-results"

type Step = "getting-started" | "analysis-results"

export function MainContent() {
  const [currentStep, setCurrentStep] = useState<Step>("getting-started")
  const [analyzedUrl, setAnalyzedUrl] = useState<string>("")

  const handleAnalysis = (url: string) => {
    setAnalyzedUrl(url)
    setCurrentStep("analysis-results")
  }

  const handleStartOver = () => {
    setCurrentStep("getting-started")
  }

  return (
    <div className="flex-1 overflow-auto">
      {currentStep === "getting-started" && <GettingStarted onAnalyze={handleAnalysis} />}
      {currentStep === "analysis-results" && <AnalysisResults url={analyzedUrl} onStartOver={handleStartOver} />}
    </div>
  )
}
