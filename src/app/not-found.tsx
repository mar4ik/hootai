"use client"

import React from 'react'
import { Sidebar } from "@/components/sidebar"
import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 p-4 sm:p-6 md:p-8 overflow-auto bg-gray-50 font-istok">
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg border border-gray-100 p-5 sm:p-6 md:p-8 my-4 sm:my-6 flex flex-col items-center justify-center">
          <div className="text-5xl mb-6">🦉</div>
          <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
          <p className="text-gray-600 mb-6 text-center">
            Sorry, the page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <Link 
            href="/"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md transition-all hover:shadow-lg focus:ring-4 focus:ring-indigo-300 focus:ring-opacity-50"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  )
} 