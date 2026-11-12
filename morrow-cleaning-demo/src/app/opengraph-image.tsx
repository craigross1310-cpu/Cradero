import { ImageResponse } from "next/og";

export const alt = "Morrow Cleaning Co. — Your home, beautifully clean. Your price, in seconds.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "linear-gradient(160deg, #f6ece6 0%, #fbf7f4 60%)", color: "#1f1d1b" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: "#1f1d1b", display: "flex", alignItems: "center", justifyContent: "center", color: "#e9b52c", fontSize: 38, fontWeight: 700 }}>M</div>
          <div style={{ fontSize: 40, fontWeight: 600 }}>Morrow Cleaning Co.</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 76, fontWeight: 600, lineHeight: 1.05, letterSpacing: -2 }}>Your home, beautifully clean.</div>
          <div style={{ fontSize: 76, fontWeight: 600, lineHeight: 1.05, letterSpacing: -2, color: "#4a4541", display: "flex" }}>
            Your price,&nbsp;<span style={{ color: "#1f1d1b", borderBottom: "10px solid #e9b52c" }}>in seconds.</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, fontSize: 26, color: "#4a4541" }}>
          <span>Instant quotes</span>·<span>Online booking</span>·<span>Vetted professionals</span>
        </div>
      </div>
    ),
    size,
  );
}
