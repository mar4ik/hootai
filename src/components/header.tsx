"use client"

import Image from "next/image"
import { AnimatedLink } from "./animated-link"

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center">
        <AnimatedLink href="/" className="flex items-center gap-2">
          <Image 
            src="/owl-favicon.svg" 
            alt="Hoot.ai Logo" 
            width={32} 
            height={32} 
            className="h-8 w-8" 
          />
          <span className="text-xl font-bold">Hoot.ai</span>
        </AnimatedLink>
      </div>
    </header>
  )
} 