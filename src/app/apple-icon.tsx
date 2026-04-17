import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(145deg, #0F1923 0%, #1A2634 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 72,
            fontWeight: 800,
            fontFamily: "ui-sans-serif, system-ui, sans-serif",
            letterSpacing: -4,
          }}
        >
          <span style={{ color: "#FF4655" }}>C</span>
          <span style={{ color: "#ECE8E1" }}>S</span>
        </div>
        <div
          style={{
            marginTop: 12,
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: 4,
            color: "#8B9BB4",
            fontFamily: "ui-sans-serif, system-ui, sans-serif",
          }}
        >
          CLUTCHSTATS
        </div>
      </div>
    ),
    { ...size },
  );
}
