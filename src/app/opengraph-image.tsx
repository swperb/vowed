import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Vowed - wedding planning that respects your time";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
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
          backgroundColor: "#fdf8f6",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ fontSize: 120, fontWeight: 600, color: "#9a4733", letterSpacing: -2 }}>
          Vowed
        </div>
        <div style={{ fontSize: 38, color: "#57534e", marginTop: 12 }}>
          Wedding planning that respects your time
        </div>
        <div style={{ fontSize: 26, color: "#a8a29e", marginTop: 40 }}>
          Free and open source
        </div>
      </div>
    ),
    { ...size }
  );
}
