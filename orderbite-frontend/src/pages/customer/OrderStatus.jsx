import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Clock, Flame, CheckCircle2, Store, X } from "lucide-react";
import publicApi from "../../api/publicAxios";
import echo from "../../echo";

export default function OrderStatus() {
  const { tableId, orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showPopup, setShowPopup] = useState(true);

  const fetchOrder = async () => {
    try {
      const res = await publicApi.get(`/orders/${orderId}`);
      setOrder(res.data);
    } catch (err) {
      setError("Pesanan tidak ditemukan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    const channel = echo.channel(`order.${orderId}`);
    channel.listen(".item.status.updated", () => fetchOrder());
    channel.listen(".order.payment.updated", () => fetchOrder());
    return () => echo.leaveChannel(`order.${orderId}`);
  }, [orderId]);

  if (loading) return <div className="loading-wrap" style={{ padding: 40, justifyContent: "center" }}><div className="spinner" /> Memuat...</div>;
  if (error) return <p style={{ padding: 20, color: "#dc2626", textAlign: "center" }}>{error}</p>;

  const statusMeta = {
    pending: { label: "Menunggu diproses", icon: Clock, cls: "badge-neutral" },
    dimasak: { label: "Sedang dimasak", icon: Flame, cls: "badge-warning" },
    siap: { label: "Siap disajikan", icon: CheckCircle2, cls: "badge-success" },
  };

  return (
    <div style={{ maxWidth: 500, margin: "0 auto", padding: 20 }}>
      {/* Popup instruksi ke kasir */}
      {showPopup && order.status_pembayaran !== "lunas" && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(22,36,26,0.55)", backdropFilter: "blur(2px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 100, padding: 20,
        }}>
          <div className="card" style={{ maxWidth: 360, textAlign: "center", padding: 30, position: "relative" }}>
            <button
              onClick={() => setShowPopup(false)}
              className="icon-btn ghost"
              style={{ position: "absolute", top: 12, right: 12, padding: 4 }}
            >
              <X size={18} />
            </button>

            <div style={{
              width: 56, height: 56, borderRadius: "50%",
              background: "var(--primary-light)", color: "var(--primary-dark)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px",
            }}>
              <Store size={26} />
            </div>

            <h3 style={{ margin: "0 0 8px" }}>Pesanan Berhasil Dibuat!</h3>
            <p style={{ fontSize: 14, marginBottom: 20 }}>
              Silakan menuju <strong>kasir</strong> untuk melakukan pembayaran dan mengambil pesanan Anda.
            </p>

            <div style={{
              background: "var(--primary-light)", borderRadius: 12,
              padding: "16px 20px", marginBottom: 20,
            }}>
              <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted)" }}>Kode Pesanan Anda</p>
              <p style={{ margin: "4px 0 0", fontSize: 32, fontWeight: 800, color: "var(--primary-dark)" }}>
                #{order.id}
              </p>
            </div>

            <p style={{ fontSize: 12, color: "var(--text-faint)", marginBottom: 20 }}>
              Sebutkan kode ini ke kasir saat membayar.
            </p>

            <button onClick={() => setShowPopup(false)} style={{ width: "100%", justifyContent: "center" }}>
              Mengerti
            </button>
          </div>
        </div>
      )}

      <div style={{ background: "linear-gradient(135deg, #a9cba3, #4f8a5c)", color: "white", padding: "26px 22px", borderRadius: 18, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <p style={{ margin: 0, opacity: 0.9, fontSize: 13 }}>Meja {order.table?.nomor_meja}</p>
            <h2 style={{ margin: "4px 0 10px", color: "white" }}>Status Pesanan</h2>
          </div>
          <span style={{
            background: "rgba(255,255,255,0.25)", padding: "6px 12px",
            borderRadius: 10, fontWeight: 700, fontSize: 15,
          }}>
            #{order.id}
          </span>
        </div>
        <span className={`badge ${order.status_pembayaran === "lunas" ? "badge-success" : "badge-warning"}`} style={{ background: "rgba(255,255,255,0.25)", color: "white" }}>
          {order.status_pembayaran === "lunas" ? "Lunas" : "Belum Bayar"}
        </span>
      </div>

      {order.status_pembayaran !== "lunas" && (
        <div className="card" style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 12, background: "#fffbeb", border: "1px solid #fde68a" }}>
          <Store size={20} color="#b45309" />
          <p style={{ margin: 0, fontSize: 13.5, color: "#92400e" }}>
            Tunjukkan kode <strong>#{order.id}</strong> ke kasir untuk membayar & mengambil pesanan.
          </p>
        </div>
      )}

      <h3 style={{ fontSize: 15, marginBottom: 10 }}>Item Pesanan</h3>
      {order.items.map((item) => {
        const meta = statusMeta[item.status];
        const Icon = meta.icon;
        return (
          <div key={item.id} className="card" style={{ marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 14 }}>{item.menu_item?.nama} x{item.qty}</span>
            <span className={`badge ${meta.cls}`}><Icon size={12} /> {meta.label}</span>
          </div>
        );
      })}

      <div className="card" style={{ marginTop: 16, display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
        <span>Total</span>
        <span>Rp {Number(order.total_harga).toLocaleString("id-ID")}</span>
      </div>

      <Link to={`/order/${tableId}`} style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 20, color: "var(--primary-dark)", fontWeight: 600, textDecoration: "none", fontSize: 14 }}>
        <ArrowLeft size={16} /> Pesan Lagi
      </Link>
    </div>
  );
}