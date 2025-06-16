"use client"

import Image from "next/image"
import Link from "next/link"

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center">
        <Link href="/" className="flex items-center gap-2">
          <Image 
            src="/owl-favicon.svg" 
            alt="Hoot.ai Logo" 
            width={32} 
            height={32} 
            className="h-8 w-8"
            priority 
          />
          <span className="text-xl font-bold">Hoot.ai</span>
        </Link>
      </div>
    </header>
  )
} 