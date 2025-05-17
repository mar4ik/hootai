"use client"

import type React from "react"
import { useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Rocket, File, Upload, Link as LinkIcon, X } from "lucide-react"

interface GettingStartedProps {
  onAnalyze: (data: { type: "url" | "file"; content: string; fileName?: string }) => void
}

export function GettingStarted({ onAnalyze }: GettingStartedProps) {
  const [url, setUrl] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (selectedFile: File | null) => {
    setUploadError(null)
    
    if (!selectedFile) {
      setFile(null)
      return
    }

    // Validate file type
    const fileType = selectedFile.name.split('.').pop()?.toLowerCase()
    if (!fileType || !['csv', 'pdf'].includes(fileType)) {
      setUploadError("Only CSV and PDF files are supported")
      return
    }

    // Validate file size (5MB limit)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setUploadError("File size exceeds 5MB limit")
      return
    }

    setFile(selectedFile)
    setUrl("")
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0])
    }
  }, [])

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileChange(e.target.files[0])
    }
  }

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleRemoveFile = () => {
    setFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (url) {
      // Validate URL format
      try {
        new URL(url.startsWith('http') ? url : `https://${url}`)
        onAnalyze({ type: "url", content: url })
      } catch {
        setUploadError("Please enter a valid URL")
      }
    } else if (file) {
      try {
        // For CSV and PDF, we'll read the file content
        const content = await file.text()
        onAnalyze({ type: "file", content, fileName: file.name })
      } catch {
        setUploadError("Error reading file. Please try again.")
      }
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
          {!file && (
            <div className="flex flex-col gap-4">
              <div 
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragging ? 'border-purple-500 bg-purple-50' : 'border-gray-300'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-10 w-10 text-gray-400" />
                  <p className="text-lg font-medium">Drag & drop your file here</p>
                  <p className="text-sm text-muted-foreground">Supports CSV and PDF (up to 5MB)</p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileInputChange}
                    accept=".csv,.pdf"
                    className="hidden"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="mt-2"
                    onClick={handleButtonClick}
                  >
                    <File className="h-4 w-4 mr-2" />
                    Browse files
                  </Button>
                </div>
              </div>

              <div className="flex items-center">
                <div className="flex-grow h-px bg-gray-200"></div>
                <span className="px-4 text-muted-foreground text-sm">or</span>
                <div className="flex-grow h-px bg-gray-200"></div>
              </div>

              <div className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Enter website URL here"
                  className="h-12 flex-1"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value)
                    setUploadError(null)
                  }}
                />
              </div>
            </div>
          )}

          {file && (
            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
              <div className="flex items-center gap-3">
                <File className="h-6 w-6 text-blue-500" />
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0" 
                onClick={handleRemoveFile}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          )}

          {uploadError && (
            <div className="text-red-500 text-sm p-2 bg-red-50 rounded border border-red-100">
              {uploadError}
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-12 text-lg bg-purple-100 hover:bg-purple-200 text-purple-900"
            disabled={!url && !file}
          >
            Run Hoot.ai
          </Button>
        </form>
      </div>
    </div>
  )
}
