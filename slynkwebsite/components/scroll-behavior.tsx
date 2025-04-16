"use client"

import { useEffect } from "react"

export default function ScrollBehavior() {
  useEffect(() => {
    // Disable scroll restoration
    if (typeof window !== 'undefined' && 'scrollRestoration' in history) {
      history.scrollRestoration = 'manual'
    }
    
    // Add a class to the document to help with CSS overrides
    document.documentElement.classList.add('disable-scroll-to-top')
    
    return () => {
      document.documentElement.classList.remove('disable-scroll-to-top')
    }
  }, [])
  
  return null
} 