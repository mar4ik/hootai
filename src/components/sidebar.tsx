"use client"

import Link from "next/link"

export function Sidebar() {
  return (
    <div className="w-64 border-r bg-background h-full flex flex-col">
      <div className="p-4 border-b">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <span className="text-2xl">🦉</span> Hoot.ai
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        <Link
          href="/"
          className="flex items-center gap-2 p-3 rounded-md bg-muted/50 text-primary hover:bg-muted transition-colors"
        >
          <span className="text-xl">🚀</span>
          <span>Getting started</span>
        </Link>
        <Link
          href="/what_is_next"
          className="flex items-center gap-2 p-3 rounded-md hover:bg-muted/50 transition-colors"
        >
          <span className="text-xl">🍀</span>
          <span>What is coming next?</span>
        </Link>
        <Link href="/about" className="flex items-center gap-2 p-3 rounded-md hover:bg-muted/50 transition-colors">
          <span className="text-xl">🤔</span>
          <span>About Hoot.ai</span>
        </Link>
        <Link
          href="/wall_of_fame"
          className="flex items-center gap-2 p-3 rounded-md hover:bg-muted/50 transition-colors"
        >
          <span className="text-xl">❤️</span>
          <span>Wall of fame</span>
        </Link>
      </nav>
      
      <div className="p-4 border-t space-y-4">        
        <div className="p-4 bg-muted/30 rounded-lg space-y-2">
          <h3 className="font-medium flex items-center gap-1">
            <span className="text-lg">🍀</span> Find this interesting?
          </h3>
          <p className="text-sm text-muted-foreground">
            I&apos;m still looking for people who want to join me in building this awesome product.
          </p>
          <p className="text-sm text-muted-foreground">
            If you&apos;re interested, email me at{" "}
            <a href="mailto:mariam.morozova@gmail.com" className="text-primary hover:underline">
              mariam.morozova@gmail.com
            </a>
          </p>

          <a 
            href="#" 
            className="block w-full text-center p-2.5 mt-3 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white transition-colors"
          >
            Donate <span className="ml-1">♥</span>
          </a>
        </div>
      </div>
    </div>
  )
}
