"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function ConditionalNavbar() {
  const pathname = usePathname();

  useEffect(() => {
    const el = document.getElementById("global-navbar");
    if (!el) return;

    if (pathname?.startsWith("/dashboard")) {
      el.style.display = "none";
    } else {
      el.style.display = "";
    }
  }, [pathname]);

  // This component does not render the navbar itself; it only toggles the
  // server-rendered navbar element's visibility.
  return null;
}
