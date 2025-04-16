"use client"

import { usePathname } from "next/navigation"
import { useEffect } from "react"

export function DisableAutoScroll() {
  const pathname = usePathname()
  
  useEffect(() => {
    // Disable scroll restoration
    if (history.scrollRestoration) {
      history.scrollRestoration = 'manual'
    }
    
    // Prevent scrolling to top on route change
    window.scrollTo = function() { return; };
  }, [pathname])
  
  return null
} 