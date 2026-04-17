import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0F1923",
          borderRadius: 6,
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 16,
            fontWeight: 800,
            fontFamily: "ui-sans-serif, system-ui, sans-serif",
            letterSpacing: -1,
          }}
        >
          <span style={{ color: "#FF4655" }}>C</span>
          <span style={{ color: "#ECE8E1" }}>S</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
