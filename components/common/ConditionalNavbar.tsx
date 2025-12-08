"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * ConditionalNavbar - Controls navbar visibility based on current route
 * 
 * Uses CSS class toggling to avoid hydration mismatches.
 * The navbar is hidden on dashboard routes (/dashboard/*) and visible everywhere else.
 */
export default function ConditionalNavbar() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const el = document.getElementById("global-navbar");
    if (!el) return;

    // Toggle 'hidden' class based on current pathname
    if (pathname?.startsWith("/dashboard")) {
      el.classList.add("hidden");
    } else {
      el.classList.remove("hidden");
    }
  }, [pathname, mounted]);

  // This component does not render anything itself; it only manages
  // the visibility class of the server-rendered navbar element.
  return null;
}
