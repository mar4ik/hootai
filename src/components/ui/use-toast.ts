// Simple toast hook for notifications

interface ToastOptions {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
  duration?: number;
}

// Mock implementation since we don't have a real toast system
export function toast(options: ToastOptions) {
  // If in browser, show an alert for better visibility
  if (typeof window !== 'undefined') {
    // Only show alert in development to avoid annoying users
    if (process.env.NODE_ENV === 'development') {
      alert(`${options.title}\n${options.description || ''}`);
    }
  }
  
  return {
    id: Date.now(),
    dismiss: () => {
      // Mock dismiss function
    }
  };
} 