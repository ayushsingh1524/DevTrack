"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { PixelText } from "./pixel-text";
import { cn } from "@/lib/utils";

interface LogoLinkProps {
  className?: string;
  textClassName?: string;
}

export function LogoLink({ className, textClassName }: LogoLinkProps) {
  const [isHovered, setIsHovered] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <Link 
      href="/" 
      className={cn("flex items-center", className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center transition-transform hover:scale-105 bg-transparent shrink-0">
        <img src="/logo.png" alt="TaskNest Logo" className="w-full h-full object-cover scale-[1.35]" />
      </div>
      <PixelText text="TaskNest" className={textClassName} forceHover={isHovered} />
    </Link>
  );
}
