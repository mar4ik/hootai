"use client"

import type React from "react"
import { useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAnalysisStore } from "@/lib/store"
import { AnalysisData } from "@/components/main-content"

interface GettingStartedProps {
  onAnalyze: (data: AnalysisData) => void
}

export function GettingStarted({ onAnalyze }: GettingStartedProps) {
  const [url, setUrl] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Получаем функции из Zustand store
  const setAnalysisData = useAnalysisStore(state => state.setAnalysisData)
  const startAnalysis = useAnalysisStore(state => state.startAnalysis)

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
        const normalizedUrl = url.startsWith('http') ? url : `https://${url}`
        new URL(normalizedUrl)
        const data: AnalysisData = { type: "url", content: normalizedUrl }
        
        // Сохраняем данные в store
        setAnalysisData(data)
        
        // Переходим на страницу результатов
        onAnalyze(data)
        
        // Сразу запускаем анализ
        startAnalysis()
      } catch {
        setUploadError("Please enter a valid URL")
      }
    } else if (file) {
      try {
        // For CSV and PDF, we'll read the file content
        const content = await file.text()
        const data: AnalysisData = { type: "file", content, fileName: file.name }
        
        // Сохраняем данные в store
        setAnalysisData(data)
        
        // Переходим на страницу результатов
        onAnalyze(data)
        
        // Сразу запускаем анализ
        startAnalysis()
      } catch {
        setUploadError("Error reading file. Please try again.")
      }
    }
  }

  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8 overflow-auto bg-gray-50 font-istok">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg border border-gray-100 p-5 sm:p-6 md:p-8 my-4 sm:my-6">
        <div className="space-y-6 mb-8">
          <div className="space-y-2">
            <h1 className="text-[24px] font-bold flex items-center gap-2">
              <span className="text-xl">🚀</span> Getting started
            </h1>
            <h2 className="text-lg font-medium">Unlock UX Insights Instantly with 🦉 Hoot.ai</h2>
          </div>

          <div className="space-y-4">
            <p className="text-[14px] text-gray-800">Start optimizing your product experience in minutes.</p>
            <p className="text-[14px] text-gray-800">
              Upload a CSV or PDF file with user journey data like page views, click paths, or session logs or simply enter your website URL.
            </p>
            <p className="text-[14px] text-gray-600">
              Hoot.ai will analyze user behavior, detect friction points and give you actionable UX insights powered by
              AI.
            </p>

            <p className="text-[14px] text-gray-800">No setup. No code. Just clear answers.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          {!file && (
            <div className="flex flex-col gap-4">
              <div 
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center gap-2">
                  <span className="text-3xl text-gray-400">📤</span>
                  <p className="text-base font-medium">Drag & drop your file here</p>
                  <p className="text-[14px] text-gray-600">Supports CSV and PDF (up to 5MB)</p>
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
                    className="mt-2 border border-gray-300 rounded-lg shadow-sm hover:border-gray-400"
                    onClick={handleButtonClick}
                  >
                    <span className="text-base mr-2">📄</span>
                    Browse files
                  </Button>
                </div>
              </div>

              <div className="flex items-center">
                <div className="flex-grow h-px bg-gray-200"></div>
                <span className="px-4 text-gray-500 text-[14px]">or</span>
                <div className="flex-grow h-px bg-gray-200"></div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xl text-gray-400">🔗</span>
                <Input
                  type="text"
                  placeholder="Enter website URL here"
                  className="h-12 flex-1 border border-gray-300 rounded-lg shadow-sm hover:border-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
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
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="text-xl text-indigo-500">📄</span>
                <div>
                  <p className="font-medium text-[14px]">{file.name}</p>
                  <p className="text-[14px] text-gray-600">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0" 
                onClick={handleRemoveFile}
              >
                <span className="text-base">❌</span>
              </Button>
            </div>
          )}

          {uploadError && (
            <div className="text-red-500 text-[14px] p-3 bg-red-50 rounded-lg border border-red-200 shadow-sm">
              {uploadError}
            </div>
          )}

          <Button
            type="submit"
            className="w-full p-2.5 sm:p-3 text-base sm:text-lg rounded-lg shadow-md transition-all hover:shadow-lg bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-4 focus:ring-indigo-300 focus:ring-opacity-50 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:bg-indigo-600 disabled:hover:shadow-md mt-2"
            disabled={!url && !file}
          >
            Run Hoot.ai
          </Button>
        </form>
      </div>
    </div>
  )
}
