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

// Use a more distinctive name to avoid conflicts with third-party scripts
const STORAGE_KEY = 'hootai-analysis-storage-v2';

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
          
          // Validate that the result has the expected structure
          if (!result || typeof result !== 'object') {
            throw new Error('Received invalid analysis result format');
          }
          
          // Ensure we have at least a summary field
          if (!result.summary) {
            result.summary = 'Analysis completed, but no summary was provided.';
          }
          
          // Ensure problems array exists
          if (!Array.isArray(result.problems)) {
            result.problems = [];
          }
          
          // Ensure issues array exists
          if (!Array.isArray(result.issues)) {
            result.issues = [];
          }
          
          set({ result, isLoading: false })
        } catch (error) {
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
      name: STORAGE_KEY,              // Use the versioned storage key
      skipHydration: false,           // Don't skip initial hydration
      partialize: (state) => ({       // Persist these fields
        analysisData: state.analysisData,
        result: state.result,
        isLoading: state.isLoading,   // Also persist loading state
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
          
          // Make sure to actually save the value immediately
          try {
            localStorage.setItem(name, JSON.stringify(value))
            
            // Verify the data was saved correctly
            const savedStr = localStorage.getItem(name);
            if (!savedStr) {
              // Failed to save analysis data to localStorage
            }
          } catch (_e) {
            // Error saving analysis data to localStorage
          }
        },
        removeItem: (name) => {
          if (!isLocalStorageAvailable() || typeof window === 'undefined') return
          localStorage.removeItem(name)
        },
      },
    }
  )
) 