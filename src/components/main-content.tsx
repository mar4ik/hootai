"use client"

import { useState } from "react"
import { GettingStarted } from "@/components/getting-started"
import { AnalysisResults } from "@/components/analysis-results"

type Step = "getting-started" | "analysis-results"

export type AnalysisData = {
  type: "url" | "file"
  content: string
  fileName?: string
}

export function MainContent() {
  const [currentStep, setCurrentStep] = useState<Step>("getting-started")
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null)

  const handleAnalysis = (data: AnalysisData) => {
    setAnalysisData(data)
    setCurrentStep("analysis-results")
  }

  const handleStartOver = () => {
    setCurrentStep("getting-started")
    setAnalysisData(null)
  }

  return (
    <div className="flex-1 overflow-auto">
      {currentStep === "getting-started" && <GettingStarted onAnalyze={handleAnalysis} />}
      {currentStep === "analysis-results" && analysisData && <AnalysisResults data={analysisData} onStartOver={handleStartOver} />}
    </div>
  )
}
