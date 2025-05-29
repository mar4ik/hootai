"use client"

import React from 'react'
import { Sidebar } from "@/components/sidebar"
import TeamContent from "@/components/team"

export default function TeamPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <TeamContent />
    </div>
  )
} 