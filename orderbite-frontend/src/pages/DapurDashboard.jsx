import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { LogOut, ChefHat, Flame, CheckCircle2 } from "lucide-react";
import api from "../api/axios";
import echo from "../echo";

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
    const channel = echo.channel("orders");
    channel.listen(".order.created", () => fetchOrders());
    channel.listen(".item.status.updated", () => fetchOrders());
    return () => echo.leaveChannel("orders");
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

  if (loading) return <div className="loading-wrap" style={{ padding: 40 }}><div className="spinner" /> Memuat...</div>;

  const pendingItems = orders.flatMap((order) =>
    (order.items || [])
      .filter((item) => item.status !== "siap")
      .map((item) => ({ ...item, tableNumber: order.table?.nomor_meja, customerName: order.nama_customer }))
  );

  return (
    <div>
      <div className="dashboard-header">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div className="sidebar-brand-icon" style={{ background: "var(--primary-light)", color: "var(--primary-dark)" }}><ChefHat size={19} /></div>
          <div>
            <h2 style={{ margin: 0, fontSize: 18 }}>Dashboard Dapur</h2>
            <p style={{ margin: 0, fontSize: 13 }}>{user?.name}</p>
          </div>
        </div>
        <button className="secondary" onClick={handleLogout}><LogOut size={15} /> Logout</button>
      </div>

      <div className="dashboard-body">
        {error && <p style={{ color: "#dc2626", fontSize: 13 }}>{error}</p>}

        <h3 style={{ fontSize: 16, marginBottom: 14 }}>Antrian Pesanan</h3>

        {pendingItems.length === 0 ? (
          <div className="card empty-state">
            <div className="empty-state-icon"><CheckCircle2 size={26} /></div>
            <p>Tidak ada pesanan yang perlu dimasak saat ini.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 14 }}>
            {pendingItems.map((item) => (
              <div key={item.id} className="card" style={{
                borderLeft: item.status === "dimasak" ? "4px solid var(--warning)" : "4px solid #9ca3af",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <h4 style={{ margin: 0, fontSize: 16 }}>Meja {item.tableNumber}</h4>
                  {item.status === "dimasak" && <Flame size={16} color="#b45309" />}
                </div>
                <p style={{ margin: "3px 0 10px", fontSize: 12.5 }}>{item.customerName}</p>
                <strong style={{ fontSize: 14 }}>{item.menu_item?.nama} x{item.qty}</strong>
                {item.catatan && <p style={{ fontStyle: "italic", fontSize: 12.5, marginTop: 6 }}>Catatan: {item.catatan}</p>}

                <div style={{ marginTop: 12 }}>
                  <span className={`badge ${item.status === "dimasak" ? "badge-warning" : "badge-neutral"}`}>{item.status}</span>
                </div>

                <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                  {item.status === "pending" && (
                    <button onClick={() => handleUpdateStatus(item.id, "dimasak")} style={{ width: "100%", justifyContent: "center" }}>Mulai Masak</button>
                  )}
                  {item.status === "dimasak" && (
                    <button onClick={() => handleUpdateStatus(item.id, "siap")} style={{ width: "100%", justifyContent: "center", background: "var(--success)" }}>Tandai Siap</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}