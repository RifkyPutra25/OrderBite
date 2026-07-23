import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function KasirDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [tables, setTables] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Form pesanan manual
  const [selectedTable, setSelectedTable] = useState("");
  const [namaCustomer, setNamaCustomer] = useState("");
  const [cart, setCart] = useState([]); // { menu_item_id, nama, harga, qty }

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
    // Polling setiap 5 detik untuk update real-time sederhana
    const interval = setInterval(fetchAll, 5000);
    return () => clearInterval(interval);
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

  const removeFromCart = (menuItemId) => {
    setCart(cart.filter((c) => c.menu_item_id !== menuItemId));
  };

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

  if (loading) return <p>Memuat...</p>;

  return (
    <div style={{ padding: 30, display: "flex", flexDirection: "column", gap: 30 }}>
        <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
  <h1 style={{ margin: 0 }}>Dashboard Kasir — {user?.name}</h1>
  <button onClick={handleLogout} style={{ background: "#dc2626" }}>Logout</button>
    </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Status Meja */}
      <section>
        <h2>Status Meja</h2>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {tables.map((t) => (
            <div key={t.id} style={{
              padding: 15,
              border: "1px solid #ccc",
              borderRadius: 8,
              background: t.status === "kosong" ? "#d1fae5" : "#fee2e2",
              minWidth: 100,
              textAlign: "center",
            }}>
              <strong>{t.nomor_meja}</strong>
              <p style={{ margin: 0, fontSize: 12 }}>{t.kapasitas} orang</p>
              <p style={{ margin: 0, fontSize: 12 }}>{t.status === "kosong" ? "Kosong" : "Terisi"}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Buat Pesanan Manual */}
      <section>
        <h2>Buat Pesanan Manual</h2>
        <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
          <select value={selectedTable} onChange={(e) => setSelectedTable(e.target.value)}>
            <option value="">-- Pilih Meja --</option>
            {tables.filter(t => t.status === "kosong").map((t) => (
              <option key={t.id} value={t.id}>{t.nomor_meja}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Nama customer"
            value={namaCustomer}
            onChange={(e) => setNamaCustomer(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", gap: 20 }}>
          <div style={{ flex: 1 }}>
            <h4>Menu</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 5, maxHeight: 300, overflowY: "auto" }}>
              {menuItems.filter(m => m.tersedia).map((m) => (
                <div key={m.id} style={{ display: "flex", justifyContent: "space-between", border: "1px solid #eee", padding: 8 }}>
                  <span>{m.nama} — Rp {Number(m.harga).toLocaleString("id-ID")}</span>
                  <button onClick={() => addToCart(m)}>+ Tambah</button>
                </div>
              ))}
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <h4>Keranjang</h4>
            {cart.length === 0 ? (
              <p>Belum ada item</p>
            ) : (
              <>
                {cart.map((c) => (
                  <div key={c.menu_item_id} style={{ display: "flex", justifyContent: "space-between", padding: 5 }}>
                    <span>{c.nama} x{c.qty}</span>
                    <span>
                      Rp {(c.harga * c.qty).toLocaleString("id-ID")}
                      <button onClick={() => removeFromCart(c.menu_item_id)} style={{ marginLeft: 8 }}>x</button>
                    </span>
                  </div>
                ))}
                <hr />
                <strong>Total: Rp {totalCart.toLocaleString("id-ID")}</strong>
              </>
            )}
            <div style={{ marginTop: 10 }}>
              <button onClick={handleCreateOrder}>Buat Pesanan</button>
            </div>
          </div>
        </div>
      </section>

      {/* Daftar Order Aktif */}
      <section>
        <h2>Daftar Pesanan</h2>
        <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th>Meja</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Pembayaran</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: "center" }}>Belum ada pesanan</td></tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.table?.nomor_meja}</td>
                  <td>{order.nama_customer}</td>
                  <td>
                    {order.items?.map((it) => (
                      <div key={it.id}>
                        {it.menu_item?.nama} x{it.qty} — <em>{it.status}</em>
                      </div>
                    ))}
                  </td>
                  <td>Rp {Number(order.total_harga).toLocaleString("id-ID")}</td>
                  <td>{order.status_pembayaran === "lunas" ? "Lunas" : "Belum Bayar"}</td>
                  <td>
                    {order.status_pembayaran !== "lunas" && (
                      <button onClick={() => handleMarkPaid(order.id)}>Tandai Lunas</button>
                    )}
                    <button onClick={() => handleCompleteOrder(order.id)}>Selesai</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}