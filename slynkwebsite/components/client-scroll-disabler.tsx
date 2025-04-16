"use client"

import { useEffect } from "react"

export default function ClientScrollDisabler() {
  useEffect(() => {
    // Disable scroll restoration
    if (typeof window !== 'undefined' && 'scrollRestoration' in history) {
      history.scrollRestoration = 'manual'
    }
    
    // Add a class to the document to allow CSS to handle scroll behavior
    document.documentElement.classList.add('disable-scroll-to-top')
    
    return () => {
      // Clean up on unmount
      document.documentElement.classList.remove('disable-scroll-to-top')
    }
  }, [])
  
  return null
} 