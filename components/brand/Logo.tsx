"use client";

import * as React from "react";

type LogoProps = {
  className?: string;
  size?: number | string;
  alt?: string;
};

export default function Logo({ className = "", size, alt = "Postlin" }: LogoProps) {
  const style = size ? { width: size, height: size } : undefined;
  return <img src="/logo.svg" alt={alt} className={className} style={style} />;
}
