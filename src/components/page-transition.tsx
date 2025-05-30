"use client"

import { ReactNode } from "react"

interface PageTransitionProps {
  children: ReactNode
}

export function PageTransition({ children }: PageTransitionProps) {
  // Simply render children without any transitions
  return <>{children}</>
} 