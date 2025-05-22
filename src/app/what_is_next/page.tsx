"use client"

import React from 'react'
import { Sidebar } from "@/components/sidebar"
import WhatIsNextContent from "@/components/what-is-next"

export default function WhatIsNextPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <WhatIsNextContent />
    </div>
  )
}