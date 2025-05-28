import React from 'react'
import Link from 'next/link'

export default function WallOfFameContent() {
  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8 overflow-auto bg-gray-50 font-istok">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg border border-gray-100 p-5 sm:p-6 md:p-8 my-4 sm:my-6">
        <h1 className="text-[24px] font-bold mb-8 flex items-center">
          <span className="mr-2 text-xl sm:text-2xl">❤️</span> Wall of fame
        </h1>
        
        <div className="space-y-8">
          {/* Contributor Card */}
          <div className="space-y-5">
            <h2 className="text-xl font-semibold flex items-center">
              <span className="mr-2">🎉</span> Kudos to Ivan Bunin
            </h2>
            
            <p className="text-[14px] text-gray-800 leading-relaxed">
              A big thank you to Ivan Bunin, an AI guru engineer who helped to develop Hoot.ai&apos;s concept car! <span className="inline-block">🎉</span>
            </p>
            
            <div className="mt-8">
              <div className="flex flex-wrap items-center gap-x-1 mb-2">
                <span className="text-[14px] text-gray-800 mr-1">👉 Check</span>
                <Link 
                  href="https://www.linkedin.com/in/enkiyme/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[14px] text-blue-600 hover:underline font-medium"
                >
                  Ivan&apos;s Linkedin profile
                </Link>
                <span className="text-[14px] text-gray-800">and his personal project</span>
              </div>
              
              <Link 
                href="http://app.vsebe.net/"
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[14px] text-blue-600 hover:underline block font-medium"
              >
                http://app.vsebe.net/
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 