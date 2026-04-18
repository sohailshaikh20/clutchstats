"use client";

import Image from "next/image";
import { useState } from "react";
import { hueFromString, teamInitials } from "@/lib/esports/team-fallback";

const BLUR_DATA_URL =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAIAAgDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwABmQ/9k=";

export function TeamLogo({
  name,
  logoUrl,
  size = 40,
}: {
  name: string;
  logoUrl?: string | null;
  size?: number;
}) {
  const [failed, setFailed] = useState(false);
  const hue = hueFromString(name);
  const initials = teamInitials(name, 2);

  if (!logoUrl || failed) {
    const hue2 = (hue + 42) % 360;
    const gradient = `linear-gradient(135deg, hsl(${hue} 58% 36%) 0%, hsl(${hue2} 52% 22%) 100%)`;
    return (
      <div
        className="flex shrink-0 items-center justify-center rounded-full border border-white/15 font-heading text-[11px] font-bold text-white shadow-inner ring-1 ring-white/10"
        style={{ width: size, height: size, background: gradient }}
        aria-hidden
      >
        {initials}
      </div>
    );
  }

  const src = logoUrl.startsWith("http://") ? `https://${logoUrl.slice(7)}` : logoUrl;

  return (
    <Image
      src={src}
      alt=""
      width={size}
      height={size}
      sizes={`${size}px`}
      placeholder="blur"
      blurDataURL={BLUR_DATA_URL}
      className="shrink-0 rounded-full border border-white/15 bg-surface object-contain ring-1 ring-white/10"
      onError={() => setFailed(true)}
    />
  );
}
