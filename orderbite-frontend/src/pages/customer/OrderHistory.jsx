import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Receipt, Clock } from "lucide-react";

export default function OrderHistory() {
  const { tableId } = useParams();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(`ob_history_${tableId}`) || "[]");
    setHistory(stored);
  }, [tableId]);

  const formatRupiah = (num) => `Rp ${Number(num).toLocaleString("id-ID")}`;

  return (
    <div style={{ maxWidth: 500, margin: "0 auto", padding: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <Link to={`/order/${tableId}`} className="icon-btn secondary" style={{ display: "flex" }}>
          <ArrowLeft size={18} />
        </Link>
        <h2 style={{ margin: 0 }}>Riwayat Pesanan</h2>
      </div>

      {history.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon"><Receipt size={26} /></div>
          <p>Belum ada riwayat pesanan di meja ini.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {history.map((h) => (
            <Link
              key={h.id}
              to={`/order/${tableId}/status/${h.id}`}
              className="card"
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", textDecoration: "none", color: "inherit" }}
            >
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>Pesanan #{h.id}</p>
                <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                  <Clock size={12} />
                  {h.created_at ? new Date(h.created_at).toLocaleString("id-ID") : "-"}
                </p>
              </div>
              <span style={{ fontWeight: 700, color: "var(--primary-dark)" }}>
                {formatRupiah(h.total)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}