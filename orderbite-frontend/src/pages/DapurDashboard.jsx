import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { LogOut, ChefHat, Flame, CheckCircle2 } from "lucide-react";
import api from "../api/axios";
import echo from "../echo";
import LoadingScreen from "../components/LoadingScreen";

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

  if (loading) return <LoadingScreen />;

  // Kelompokkan per ORDER (1 meja + 1 customer = 1 kartu), sembunyikan order yang semua itemnya sudah "siap"
  const activeOrders = orders
    .map((order) => ({
      ...order,
      items: (order.items || []).filter((item) => item.status !== "siap"),
    }))
    .filter((order) => order.items.length > 0);

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

        {activeOrders.length === 0 ? (
          <div className="card empty-state">
            <div className="empty-state-icon"><CheckCircle2 size={26} /></div>
            <p>Tidak ada pesanan yang perlu dimasak saat ini.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
            {activeOrders.map((order) => {
              const anyDimasak = order.items.some((it) => it.status === "dimasak");
              return (
                <div key={order.id} className="card" style={{
                  borderLeft: anyDimasak ? "4px solid var(--warning)" : "4px solid #9ca3af",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <h4 style={{ margin: 0, fontSize: 16 }}>Meja {order.table?.nomor_meja}</h4>
                    {anyDimasak && <Flame size={16} color="#b45309" />}
                  </div>
                  <p style={{ margin: "3px 0 12px", fontSize: 12.5 }}>{order.nama_customer}</p>

                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {order.items.map((item) => (
                      <div key={item.id} style={{ borderTop: "1px solid var(--border)", paddingTop: 10 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <strong style={{ fontSize: 14 }}>{item.menu_item?.nama} x{item.qty}</strong>
                          <span className={`badge ${item.status === "dimasak" ? "badge-warning" : "badge-neutral"}`}>{item.status}</span>
                        </div>
                        {item.catatan && <p style={{ fontStyle: "italic", fontSize: 12.5, margin: "4px 0 0" }}>Catatan: {item.catatan}</p>}

                        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                          {item.status === "pending" && (
                            <button onClick={() => handleUpdateStatus(item.id, "dimasak")} style={{ width: "100%", justifyContent: "center", padding: "6px 12px", fontSize: 13 }}>Mulai Masak</button>
                          )}
                          {item.status === "dimasak" && (
                            <button onClick={() => handleUpdateStatus(item.id, "siap")} style={{ width: "100%", justifyContent: "center", padding: "6px 12px", fontSize: 13, background: "var(--success)" }}>Tandai Siap</button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}