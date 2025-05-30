"use client"

import React from 'react'
import Link from "next/link"
import Image from "next/image"
import { PageLayout } from "@/components/page-layout"

export default function NotFound() {
  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg border border-gray-100 p-5 sm:p-6 md:p-8 my-4 sm:my-6 flex flex-col items-center justify-center">
        <div className="mb-6">
          <Image 
            src="/owl-favicon.svg" 
            alt="Hoot.ai Logo" 
            width={80} 
            height={80} 
            className="h-20 w-20" 
          />
        </div>
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
    </PageLayout>
  )
} 