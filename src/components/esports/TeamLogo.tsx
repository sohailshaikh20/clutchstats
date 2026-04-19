"use client";

import Image from "next/image";
import { useState } from "react";
import { normalizeLogoUrl } from "@/lib/vlr/matches";

const BLUR_DATA_URL =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAIAAgDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwABmQ/9k=";

export function getTeamInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters: string[] = [];
  for (let i = 0; i < Math.min(parts.length, 2); i++) {
    const ch = parts[i]?.[0];
    if (ch) letters.push(ch);
  }
  const s = letters.join("").toUpperCase().slice(0, 3);
  return s || name.slice(0, 3).toUpperCase();
}

export function colorFromTeamName(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = name.charCodeAt(i) + ((h << 5) - h);
  }
  const hue = Math.abs(h) % 360;
  const sat = 45 + (Math.abs(h >> 2) % 20);
  const light = 26 + (Math.abs(h >> 5) % 14);
  return `hsl(${hue} ${sat}% ${light}%)`;
}

interface TeamLogoProps {
  logoUrl?: string | null;
  name: string;
  size?: number;
  className?: string;
}

export function TeamLogo({ logoUrl, name, size = 32, className = "" }: TeamLogoProps) {
  const [failed, setFailed] = useState(false);
  const normalized = normalizeLogoUrl(logoUrl ?? undefined);
  const initials = getTeamInitials(name);
  const color = colorFromTeamName(name);

  if (!normalized || failed) {
    return (
      <div
        className={`flex shrink-0 items-center justify-center font-mono font-bold text-white ${className}`}
        style={{
          width: size,
          height: size,
          background: color,
          fontSize: Math.max(10, size * 0.35),
        }}
        aria-hidden
      >
        {initials}
      </div>
    );
  }

  const src = normalized.startsWith("http://") ? `https://${normalized.slice(7)}` : normalized;

  return (
    <div className={`relative shrink-0 overflow-hidden ${className}`} style={{ width: size, height: size }}>
      <Image
        src={src}
        alt={`${name} logo`}
        width={size}
        height={size}
        sizes={`${size}px`}
        placeholder="blur"
        blurDataURL={BLUR_DATA_URL}
        className="object-contain"
        onError={() => setFailed(true)}
      />
    </div>
  );
}
