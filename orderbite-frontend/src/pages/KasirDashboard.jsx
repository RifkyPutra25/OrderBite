import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { LogOut, Store, ShoppingCart, X } from "lucide-react";
import api from "../api/axios";
import echo from "../echo";

export default function KasirDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [tables, setTables] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedTable, setSelectedTable] = useState("");
  const [namaCustomer, setNamaCustomer] = useState("");
  const [cart, setCart] = useState([]);

  const fetchAll = async () => {
    try {
      const [tablesRes, menuRes, ordersRes] = await Promise.all([
        api.get("/tables"),
        api.get("/menu-items"),
        api.get("/orders"),
      ]);
      setTables(tablesRes.data);
      setMenuItems(menuRes.data);
      setOrders(ordersRes.data);
    } catch (err) {
      setError("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    const channel = echo.channel("orders");
    channel.listen(".order.created", () => fetchAll());
    channel.listen(".item.status.updated", () => fetchAll());
    channel.listen(".order.payment.updated", () => fetchAll());
    return () => echo.leaveChannel("orders");
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const addToCart = (menuItem) => {
    const existing = cart.find((c) => c.menu_item_id === menuItem.id);
    if (existing) {
      setCart(cart.map((c) => c.menu_item_id === menuItem.id ? { ...c, qty: c.qty + 1 } : c));
    } else {
      setCart([...cart, { menu_item_id: menuItem.id, nama: menuItem.nama, harga: menuItem.harga, qty: 1 }]);
    }
  };

  const removeFromCart = (menuItemId) => setCart(cart.filter((c) => c.menu_item_id !== menuItemId));
  const totalCart = cart.reduce((sum, c) => sum + c.harga * c.qty, 0);

  const handleCreateOrder = async () => {
    setError("");
    if (!selectedTable || !namaCustomer || cart.length === 0) {
      setError("Lengkapi meja, nama customer, dan minimal 1 item");
      return;
    }
    try {
      await api.post("/orders", {
        resto_table_id: selectedTable,
        nama_customer: namaCustomer,
        items: cart.map((c) => ({ menu_item_id: c.menu_item_id, qty: c.qty })),
      });
      setCart([]);
      setNamaCustomer("");
      setSelectedTable("");
      fetchAll();
    } catch (err) {
      setError("Gagal membuat pesanan");
    }
  };

  const handleMarkPaid = async (orderId) => {
    try {
      await api.patch(`/orders/${orderId}/payment`);
      fetchAll();
    } catch (err) {
      setError("Gagal update pembayaran");
    }
  };

  const handleCompleteOrder = async (orderId) => {
    if (!confirm("Selesaikan pesanan ini dan kosongkan meja?")) return;
    try {
      await api.patch(`/orders/${orderId}/complete`);
      fetchAll();
    } catch (err) {
      setError("Gagal menyelesaikan pesanan");
    }
  };

  if (loading) return <div className="loading-wrap" style={{ padding: 40 }}><div className="spinner" /> Memuat...</div>;

  return (
    <div>
      <div className="dashboard-header">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div className="sidebar-brand-icon" style={{ background: "var(--primary-light)", color: "var(--primary-dark)" }}><Store size={19} /></div>
          <div>
            <h2 style={{ margin: 0, fontSize: 18 }}>Dashboard Kasir</h2>
            <p style={{ margin: 0, fontSize: 13 }}>{user?.name}</p>
          </div>
        </div>
        <button className="secondary" onClick={handleLogout}><LogOut size={15} /> Logout</button>
      </div>

      <div className="dashboard-body">
        {error && <p style={{ color: "#dc2626", fontSize: 13 }}>{error}</p>}

        <section style={{ marginBottom: 28 }}>
          <h3 style={{ fontSize: 16, marginBottom: 12 }}>Status Meja</h3>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {tables.map((t) => (
              <div key={t.id} className="card" style={{ minWidth: 110, textAlign: "center", padding: 14 }}>
                <strong style={{ fontSize: 16 }}>{t.nomor_meja}</strong>
                <p style={{ margin: "4px 0 6px", fontSize: 12 }}>{t.kapasitas} orang</p>
                <span className={`badge ${t.status === "kosong" ? "badge-success" : "badge-warning"}`}>
                  {t.status === "kosong" ? "Kosong" : "Terisi"}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: 28 }}>
          <h3 style={{ fontSize: 16, marginBottom: 12 }}>Buat Pesanan Manual</h3>
          <div className="card">
            <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
              <select value={selectedTable} onChange={(e) => setSelectedTable(e.target.value)} style={{ maxWidth: 200 }}>
                <option value="">-- Pilih Meja --</option>
                {tables.filter(t => t.status === "kosong").map((t) => (
                  <option key={t.id} value={t.id}>{t.nomor_meja}</option>
                ))}
              </select>
              <input type="text" placeholder="Nama customer" value={namaCustomer} onChange={(e) => setNamaCustomer(e.target.value)} style={{ maxWidth: 240 }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div>
                <h4 style={{ fontSize: 13, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 10 }}>Menu</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 280, overflowY: "auto" }}>
                  {menuItems.filter(m => m.tersedia).map((m) => (
                    <div key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 10px" }}>
                      <span style={{ fontSize: 13.5 }}>{m.nama} — Rp {Number(m.harga).toLocaleString("id-ID")}</span>
                      <button className="icon-btn" onClick={() => addToCart(m)}><ShoppingCart size={14} /></button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: 13, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 10 }}>Keranjang</h4>
                {cart.length === 0 ? (
                  <p style={{ fontSize: 13 }}>Belum ada item</p>
                ) : (
                  <>
                    {cart.map((c) => (
                      <div key={c.menu_item_id} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13.5 }}>
                        <span>{c.nama} x{c.qty}</span>
                        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          Rp {(c.harga * c.qty).toLocaleString("id-ID")}
                          <button className="icon-btn ghost" onClick={() => removeFromCart(c.menu_item_id)} style={{ padding: 2 }}><X size={13} /></button>
                        </span>
                      </div>
                    ))}
                    <hr style={{ border: "none", borderTop: "1px solid var(--border)" }} />
                    <strong>Total: Rp {totalCart.toLocaleString("id-ID")}</strong>
                  </>
                )}
                <div style={{ marginTop: 12 }}>
                  <button onClick={handleCreateOrder}>Buat Pesanan</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h3 style={{ fontSize: 16, marginBottom: 12 }}>Daftar Pesanan</h3>
          {orders.length === 0 ? (
            <div className="card empty-state"><p>Belum ada pesanan</p></div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Meja</th><th>Customer</th><th>Items</th><th>Total</th><th>Pembayaran</th><th style={{ width: 200 }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.table?.nomor_meja}</td>
                    <td>{order.nama_customer}</td>
                    <td style={{ fontSize: 13 }}>
                      {order.items?.map((it) => (
                        <div key={it.id}>{it.menu_item?.nama} x{it.qty} — <em>{it.status}</em></div>
                      ))}
                    </td>
                    <td style={{ fontWeight: 600 }}>Rp {Number(order.total_harga).toLocaleString("id-ID")}</td>
                    <td>
                      <span className={`badge ${order.status_pembayaran === "lunas" ? "badge-success" : "badge-warning"}`}>
                        {order.status_pembayaran === "lunas" ? "Lunas" : "Belum Bayar"}
                      </span>
                    </td>
                    <td>
                      {order.status_pembayaran !== "lunas" && (
                        <button className="secondary" onClick={() => handleMarkPaid(order.id)}>Tandai Lunas</button>
                      )}
                      <button className="secondary" onClick={() => handleCompleteOrder(order.id)}>Selesai</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
}