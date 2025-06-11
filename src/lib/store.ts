import { create } from 'zustand'
import { AnalysisData } from '@/components/main-content'
import { AnalysisResult } from '@/lib/ai-service'
import { persist } from 'zustand/middleware'

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

// Helper to safely check for localStorage availability
const isLocalStorageAvailable = () => {
  try {
    const testKey = "__test__";
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (_e) {
    return false;
  }
};

export const useAnalysisStore = create<AnalysisState>()(
  persist(
    (set, get) => ({
      // Начальное состояние
      analysisData: null,
      result: null,
      isLoading: false,
      error: null,
      
      // Установка данных для анализа (без сброса результатов)
      setAnalysisData: (data) => {
        // Only reset results if data is null or different from current data
        const currentData = get().analysisData;
        
        if (data === null) {
          // If clearing data, clear everything
          set({ analysisData: null, result: null, error: null });
        } else if (!currentData || 
                  currentData.type !== data.type || 
                  currentData.content !== data.content) {
          // Only clear result if this is new/different data
          set({ analysisData: data, result: null, error: null });
        } else {
          // Same data, preserve result
          set({ analysisData: data, error: null });
        }
      },
      
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
    }),
    {
      name: 'hootai-analysis-storage',  // Storage key
      skipHydration: false,             // Don't skip initial hydration
      partialize: (state) => ({         // Persist these fields
        analysisData: state.analysisData,
        result: state.result,
        isLoading: state.isLoading,     // Also persist loading state
      }),
      storage: {
        // Use localStorage if available, otherwise use a no-op storage
        getItem: (name) => {
          if (!isLocalStorageAvailable() || typeof window === 'undefined') return null
          const str = localStorage.getItem(name)
          return str ? JSON.parse(str) : null
        },
        setItem: (name, value) => {
          if (!isLocalStorageAvailable() || typeof window === 'undefined') return
          localStorage.setItem(name, JSON.stringify(value))
        },
        removeItem: (name) => {
          if (!isLocalStorageAvailable() || typeof window === 'undefined') return
          localStorage.removeItem(name)
        },
      },
    }
  )
) 