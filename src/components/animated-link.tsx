"use client"

import Link from "next/link"
import { ReactNode, MouseEvent } from "react"

interface AnimatedLinkProps {
  href: string
  children: ReactNode
  className?: string
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void
}

export function AnimatedLink({
  href,
  children,
  className = "",
  onClick,
  ...props
}: AnimatedLinkProps) {
  // Simply pass through to Link component
  return (
    <Link href={href} onClick={onClick} className={className} {...props}>
      {children}
    </Link>
  )
} 