"use client"

import { MainContent } from "@/components/main-content"
import { PageLayout } from "@/components/page-layout"
import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"

export default function Home() {
  const pathname = usePathname()
  const router = useRouter()
  const [isFirstLoad, setIsFirstLoad] = useState(true)
  
  // Track if this is the first load
  useEffect(() => {
    if (isFirstLoad) {
      setIsFirstLoad(false)
    }
  }, [isFirstLoad])

  // This ensures our transition effect will work even if the user navigates
  // directly to the page (not just through internal navigation)
  useEffect(() => {
    // Reset the scroll position when the path changes
    window.scrollTo(0, 0)
  }, [pathname])
  
  // Remove hash fragment from URL if present
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      // Use history API to replace the URL without the hash
      window.history.replaceState(
        {}, 
        document.title, 
        window.location.pathname + window.location.search
      )
    }
  }, [])

  return (
    <PageLayout>
      <MainContent />
    </PageLayout>
  )
}
