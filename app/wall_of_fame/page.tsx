"use client"

import React from 'react'
import { Sidebar } from "@/components/sidebar"
import WallOfFameContent from "@/components/wall-of-fame"

export default function WallOfFamePage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <WallOfFameContent />
    </div>
  )
}