import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import echo from "../../echo";
import publicApi from "../../api/publicAxios";

export default function OrderStatus() {
  const { tableId, orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  return () => {
    echo.leaveChannel(`order.${orderId}`);
  };
}, [orderId]);

  if (loading) return <p style={{ padding: 20 }}>Memuat...</p>;
  if (error) return <p style={{ padding: 20, color: "red" }}>{error}</p>;

  const statusLabel = {
    pending: "Menunggu diproses",
    dimasak: "Sedang dimasak",
    siap: "Siap disajikan",
  };

  return (
    <div style={{ padding: 20, maxWidth: 500, margin: "0 auto" }}>
      <h2>Status Pesanan</h2>
      <p>Meja: <strong>{order.table?.nomor_meja}</strong></p>
      <p>Atas nama: <strong>{order.nama_customer}</strong></p>
      <p>Pembayaran: <strong>{order.status_pembayaran === "lunas" ? "Lunas" : "Belum Bayar (bayar di kasir)"}</strong></p>

      <h3>Item Pesanan</h3>
      {order.items.map((item) => (
        <div key={item.id} style={{ border: "1px solid #eee", padding: 10, borderRadius: 8, marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>{item.menu_item?.nama} x{item.qty}</span>
            <span style={{
              padding: "2px 8px", borderRadius: 12, fontSize: 12,
              background: item.status === "siap" ? "#d1fae5" : item.status === "dimasak" ? "#fef3c7" : "#f3f4f6",
            }}>
              {statusLabel[item.status]}
            </span>
          </div>
        </div>
      ))}

      <div style={{ marginTop: 20, fontWeight: "bold", display: "flex", justifyContent: "space-between" }}>
        <span>Total</span>
        <span>Rp {Number(order.total_harga).toLocaleString("id-ID")}</span>
      </div>

      <Link to={`/order/${tableId}`} style={{ display: "inline-block", marginTop: 20 }}>
        ← Pesan Lagi
      </Link>
    </div>
  );
}