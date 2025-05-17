"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Rocket } from "lucide-react"

interface GettingStartedProps {
  onAnalyze: (url: string) => void
}

export function GettingStarted({ onAnalyze }: GettingStartedProps) {
  const [url, setUrl] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (url) {
      onAnalyze(url)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Rocket className="h-8 w-8" /> Getting started
          </h1>
          <h2 className="text-xl font-medium">Unlock UX Insights Instantly with 🦉 Hoot.ai</h2>
        </div>

        <div className="space-y-4">
          <p className="text-lg">Start optimizing your product experience in minutes.</p>
          <p className="text-lg">
            <strong>Upload your CSV or PDF product data</strong>, or just enter your <strong>website URL</strong>.
          </p>

          <p className="text-muted-foreground">
            Hoot.ai will analyze user behavior, detect friction points, and give you actionable UX insights powered by
            AI.
          </p>

          <div className="bg-muted/30 p-4 rounded-lg">
            <p className="font-medium">No setup. No code. Just clear answers.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <Button
              type="button"
              variant="outline"
              className="h-12 px-6 w-full sm:w-auto"
              onClick={() => alert("File upload functionality would be implemented here")}
            >
              Upload File
            </Button>
            <span className="text-muted-foreground">or</span>
            <Input
              type="text"
              placeholder="Enter website URL here"
              className="h-12 flex-1"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-lg bg-purple-100 hover:bg-purple-200 text-purple-900"
            disabled={!url}
          >
            Run Hoot.ai
          </Button>
        </form>
      </div>
    </div>
  )
}
