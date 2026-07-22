import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function DapurDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    try {
      const res = await api.get("/kitchen-orders");
      setOrders(res.data);
    } catch (err) {
      setError("Gagal memuat pesanan dapur");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 4000); // polling tiap 4 detik
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleUpdateStatus = async (orderItemId, newStatus) => {
    try {
      await api.patch(`/order-items/${orderItemId}/status`, { status: newStatus });
      fetchOrders();
    } catch (err) {
      setError("Gagal update status");
    }
  };

  if (loading) return <p>Memuat...</p>;

  // Flatten semua item pesanan yang belum "siap" untuk ditampilkan sebagai antrian dapur
  const pendingItems = orders.flatMap((order) =>
    (order.items || [])
      .filter((item) => item.status !== "siap")
      .map((item) => ({ ...item, tableNumber: order.table?.nomor_meja, customerName: order.nama_customer }))
  );

  return (
    <div style={{ padding: 30 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h1>Dashboard Dapur — {user?.name}</h1>
        <button onClick={handleLogout}>Logout</button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <h2>Antrian Pesanan</h2>

      {pendingItems.length === 0 ? (
        <p>Tidak ada pesanan yang perlu dimasak saat ini.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 15 }}>
          {pendingItems.map((item) => (
            <div key={item.id} style={{
              border: "1px solid #ccc",
              borderRadius: 8,
              padding: 15,
              background: item.status === "dimasak" ? "#fef3c7" : "#f3f4f6",
            }}>
              <h4 style={{ margin: 0 }}>Meja {item.tableNumber}</h4>
              <p style={{ margin: "4px 0", fontSize: 13, color: "#555" }}>{item.customerName}</p>
              <strong>{item.menu_item?.nama} x{item.qty}</strong>
              {item.catatan && <p style={{ fontStyle: "italic", fontSize: 13 }}>Catatan: {item.catatan}</p>}
              <p>Status: <strong>{item.status}</strong></p>

              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                {item.status === "pending" && (
                  <button onClick={() => handleUpdateStatus(item.id, "dimasak")}>Mulai Masak</button>
                )}
                {item.status === "dimasak" && (
                  <button onClick={() => handleUpdateStatus(item.id, "siap")}>Tandai Siap</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}