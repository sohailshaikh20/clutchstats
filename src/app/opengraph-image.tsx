import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "ClutchStats.gg";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
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
          background: "linear-gradient(145deg, #0F1923 0%, #1A2634 45%, #0F1923 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            fontSize: 72,
            fontWeight: 700,
            letterSpacing: -2,
          }}
        >
          <span style={{ color: "#FF4655" }}>CLUTCH</span>
          <span style={{ color: "#ECE8E1", marginLeft: 8 }}>STATS</span>
          <span style={{ color: "#768691", fontSize: 40, marginLeft: 12 }}>
            .gg
          </span>
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 28,
            color: "#768691",
            letterSpacing: 4,
            textTransform: "uppercase",
          }}
        >
          Competitive gaming stats
        </div>
      </div>
    ),
    { ...size }
  );
}
