"use client"

import { Sidebar } from "@/components/sidebar"
import AboutContent from "@/components/about"

export default function AboutPage() {
    return (
        <div className="flex h-screen bg-background">
             <Sidebar />
             <AboutContent />
        </div>
    );
}