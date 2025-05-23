import { create } from 'zustand'
import { AnalysisData } from '@/components/main-content'
import { AnalysisResult } from '@/lib/ai-service'

interface AnalysisState {
  // Данные анализа
  analysisData: AnalysisData | null
  result: AnalysisResult | null
  isLoading: boolean
  error: string | null
  
  // Действия
  setAnalysisData: (data: AnalysisData | null) => void
  startAnalysis: () => Promise<void>
  reset: () => void
}

export const useAnalysisStore = create<AnalysisState>((set, get) => ({
  // Начальное состояние
  analysisData: null,
  result: null,
  isLoading: false,
  error: null,
  
  // Установка данных для анализа (без запуска анализа)
  setAnalysisData: (data) => set({ analysisData: data, result: null, error: null }),
  
  // Запуск анализа
  startAnalysis: async () => {
    const { analysisData } = get()
    
    if (!analysisData) return
    
    set({ isLoading: true, error: null })
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(analysisData),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Analysis failed')
      }
      
      const result = await response.json()
      set({ result, isLoading: false })
    } catch (error) {
      console.error('Analysis error:', error)
      set({ 
        error: error instanceof Error ? error.message : 'Failed to analyze content', 
        isLoading: false 
      })
    }
  },
  
  // Сброс всего состояния
  reset: () => set({
    analysisData: null,
    result: null,
    isLoading: false,
    error: null
  }),
})) 