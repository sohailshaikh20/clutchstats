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
  const bg = `hsl(${hue} 55% 32%)`;
  const initials = teamInitials(name, 2);

  if (!logoUrl || failed) {
    return (
      <div
        className="flex shrink-0 items-center justify-center rounded-full border border-white/10 font-heading text-xs font-bold text-white"
        style={{ width: size, height: size, backgroundColor: bg }}
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
      className="shrink-0 rounded-full border border-white/10 bg-surface object-contain"
      onError={() => setFailed(true)}
    />
  );
}
