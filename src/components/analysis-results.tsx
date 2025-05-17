"use client"

import { ArrowLeft, Search, Target } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AnalysisResultsProps {
  url: string
  onStartOver: () => void
}

export function AnalysisResults({ url, onStartOver }: AnalysisResultsProps) {
  // In a real app, this data would come from an API
  const demoData = {
    problems: [
      {
        title: "Navigation Challenges",
        description: "Users may find it difficult to navigate due to inconsistent or unclear labeling of sections.",
      },
      {
        title: "Content Clarity: Some",
        description: "sections may lack sufficient context or explanation, leading to potential confusion.",
      },
      {
        title: "Visual Hierarchy",
        description:
          "The prominence of certain elements may not align with user expectations, affecting the overall user experience.",
      },
    ],
    issues: [
      {
        id: 1,
        title: "Inconsistent Navigation Labels",
        observation: "The navigation labels may not clearly convey their purpose or content to first-time visitors.",
        impact:
          "Users might be uncertain about what content to expect under each section, leading to potential frustration.",
      },
      {
        id: 2,
        title: "Lack of Context in Showcase Items",
        observation: 'The "Showcase" section displays project titles without accompanying descriptions or context.',
        impact: "Users may not understand the significance or details of each project, reducing engagement.",
      },
      {
        id: 3,
        title: "Visual Hierarchy and Emphasis",
        observation: "Certain elements, such as contact information, are not prominently displayed.",
        impact: "Important information may be overlooked by users, affecting their ability to take desired actions.",
      },
    ],
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
        <div className="flex items-center gap-2 text-xl font-semibold">
          <Search className="h-5 w-5" />
          <h2>
            UX Analysis of <span className="text-blue-600">{url || "example.com"}</span>
          </h2>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-red-500" />
            <h3 className="text-lg font-semibold">User Problem Summary</h3>
          </div>

          <ul className="space-y-4 pl-5">
            {demoData.problems.map((problem, index) => (
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

          {demoData.issues.map((issue) => (
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
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
