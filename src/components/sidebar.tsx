import Link from "next/link"
import { Rocket, Leaf, Info, Heart } from "lucide-react"

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
          <Rocket className="h-5 w-5" />
          <span>Getting started</span>
        </Link>
        <Link
          href="/coming-next"
          className="flex items-center gap-2 p-3 rounded-md hover:bg-muted/50 transition-colors"
        >
          <Leaf className="h-5 w-5" />
          <span>What is coming next?</span>
        </Link>
        <Link href="/about" className="flex items-center gap-2 p-3 rounded-md hover:bg-muted/50 transition-colors">
          <Info className="h-5 w-5" />
          <span>About Hoot.ai</span>
        </Link>
        <Link
          href="/wall-of-fame"
          className="flex items-center gap-2 p-3 rounded-md hover:bg-muted/50 transition-colors"
        >
          <Heart className="h-5 w-5" />
          <span>Wall of fame</span>
        </Link>
      </nav>
      <div className="p-4 border-t">
        <div className="p-4 bg-muted/30 rounded-lg space-y-2">
          <h3 className="font-medium flex items-center gap-1">
            <span className="text-lg">🌱</span> Find this interesting?
          </h3>
          <p className="text-sm text-muted-foreground">
            I&apos;m still looking for people who want to join me in building this awesome product.
          </p>
          <p className="text-sm text-muted-foreground">
            If you&apos;re interested, email me at{" "}
            <a href="mailto:contact@hoot.ai" className="text-primary hover:underline">
              contact@hoot.ai
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
