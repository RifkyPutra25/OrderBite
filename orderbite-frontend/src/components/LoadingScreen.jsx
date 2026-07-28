import { Store } from "lucide-react";

export default function LoadingScreen() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 18,
      background: "var(--bg)",
    }}>
      <div style={{ position: "relative", width: 64, height: 64 }}>
        <div className="spinner" style={{ width: 64, height: 64 }} />
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "var(--primary-dark)",
        }}>
          <Store size={24} />
        </div>
      </div>
      <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "var(--text-muted)" }}>Memuat OrderBite...</p>
    </div>
  );
}