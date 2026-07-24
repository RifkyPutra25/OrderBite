import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShoppingBag, Plus, Minus, X } from "lucide-react";
import publicApi from "../../api/publicAxios";

export default function CustomerMenu() {
  const { tableId } = useParams();
  const navigate = useNavigate();

  const [table, setTable] = useState(null);
  const [categories, setCategories] = useState([]);
  const [customerName, setCustomerName] = useState(localStorage.getItem(`ob_name_${tableId}`) || "");
  const [nameInput, setNameInput] = useState("");
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tableRes, menuRes] = await Promise.all([
          publicApi.get(`/tables/${tableId}`),
          publicApi.get("/menu"),
        ]);
        setTable(tableRes.data);
        setCategories(menuRes.data);
      } catch (err) {
        setError("Meja tidak ditemukan. Pastikan Anda scan QR code yang benar.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [tableId]);

  const handleSetName = (e) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    localStorage.setItem(`ob_name_${tableId}`, nameInput);
    setCustomerName(nameInput);
  };

  const addToCart = (item) => {
    const existing = cart.find((c) => c.menu_item_id === item.id);
    if (existing) {
      setCart(cart.map((c) => c.menu_item_id === item.id ? { ...c, qty: c.qty + 1 } : c));
    } else {
      setCart([...cart, { menu_item_id: item.id, nama: item.nama, harga: item.harga, qty: 1, catatan: "" }]);
    }
  };

  const updateQty = (menuItemId, delta) => {
    setCart(cart.map((c) => c.menu_item_id === menuItemId ? { ...c, qty: c.qty + delta } : c).filter((c) => c.qty > 0));
  };

  const updateNote = (menuItemId, catatan) => {
    setCart(cart.map((c) => c.menu_item_id === menuItemId ? { ...c, catatan } : c));
  };

  const total = cart.reduce((sum, c) => sum + c.harga * c.qty, 0);
  const cartCount = cart.reduce((sum, c) => sum + c.qty, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await publicApi.post("/orders", {
        resto_table_id: tableId,
        nama_customer: customerName,
        items: cart.map((c) => ({ menu_item_id: c.menu_item_id, qty: c.qty, catatan: c.catatan || null })),
      });
      localStorage.setItem(`ob_last_order_${tableId}`, res.data.id);
      navigate(`/order/${tableId}/status/${res.data.id}`);
    } catch (err) {
      setError("Gagal membuat pesanan, coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading-wrap" style={{ padding: 40, justifyContent: "center" }}><div className="spinner" /> Memuat...</div>;
  if (error && !table) return <p style={{ padding: 20, color: "#dc2626", textAlign: "center" }}>{error}</p>;

  if (!customerName) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #a9cba3 0%, #4f8a5c 100%)" }}>
        <div className="login-container" style={{ margin: 0 }}>
          <h2>🍽️ Selamat Datang</h2>
          <p style={{ marginBottom: 0 }}>Meja: <strong style={{ color: "var(--text)" }}>{table?.nomor_meja}</strong></p>
          <form onSubmit={handleSetName}>
            <input type="text" placeholder="Masukkan nama Anda" value={nameInput} onChange={(e) => setNameInput(e.target.value)} required />
            <button type="submit">Lanjut ke Menu</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", paddingBottom: cart.length > 0 ? 140 : 30 }}>
      <div style={{ background: "linear-gradient(135deg, #a9cba3, #4f8a5c)", color: "white", padding: "28px 20px", borderRadius: "0 0 20px 20px", marginBottom: 20 }}>
        <p style={{ margin: 0, opacity: 0.9, fontSize: 13 }}>Meja {table?.nomor_meja}</p>
        <h2 style={{ margin: "4px 0 0", color: "white" }}>Halo, {customerName}! 👋</h2>
      </div>

      <div style={{ padding: "0 20px" }}>
        {categories.map((cat) => (
          <div key={cat.id} style={{ marginBottom: 26 }}>
            <h3 style={{ fontSize: 17, marginBottom: 12 }}>{cat.nama_kategori}</h3>
            {(!cat.menu_items || cat.menu_items.length === 0) ? (
              <p style={{ fontSize: 13 }}>Belum ada menu di kategori ini</p>
            ) : (
              cat.menu_items.map((item) => (
                <div key={item.id} className="card" style={{ marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "center", flex: 1 }}>
                    {item.foto_full_url && (
                      <img src={item.foto_full_url} alt={item.nama} style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 10, flexShrink: 0 }} />
                    )}
                    <div>
                      <strong style={{ fontSize: 14.5 }}>{item.nama}</strong>
                      <p style={{ margin: "3px 0", fontSize: 12.5 }}>{item.deskripsi}</p>
                      <span style={{ fontWeight: 700, color: "var(--primary-dark)", fontSize: 14 }}>Rp {Number(item.harga).toLocaleString("id-ID")}</span>
                    </div>
                  </div>
                  <button className="icon-btn" onClick={() => addToCart(item)}><Plus size={16} /></button>
                </div>
              ))
            )}
          </div>
        ))}
      </div>

      {cart.length > 0 && (
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          background: "white", padding: 18, maxHeight: "45vh", overflowY: "auto",
          boxShadow: "0 -8px 24px rgba(22,36,26,0.12)", borderRadius: "20px 20px 0 0",
        }}>
          <h4 style={{ margin: "0 0 12px", display: "flex", alignItems: "center", gap: 8 }}>
            <ShoppingBag size={17} /> Keranjang ({cartCount})
          </h4>
          {cart.map((c) => (
            <div key={c.menu_item_id} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13.5 }}>{c.nama}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button className="icon-btn secondary" style={{ padding: 4 }} onClick={() => updateQty(c.menu_item_id, -1)}><Minus size={12} /></button>
                  {c.qty}
                  <button className="icon-btn secondary" style={{ padding: 4 }} onClick={() => updateQty(c.menu_item_id, 1)}><Plus size={12} /></button>
                  <span style={{ fontWeight: 600, minWidth: 70, textAlign: "right" }}>Rp {(c.harga * c.qty).toLocaleString("id-ID")}</span>
                </span>
              </div>
              <input type="text" placeholder="Catatan (opsional)" value={c.catatan} onChange={(e) => updateNote(c.menu_item_id, e.target.value)} style={{ marginTop: 4, fontSize: 12, padding: "6px 10px" }} />
            </div>
          ))}
          <hr style={{ border: "none", borderTop: "1px solid var(--border)" }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 15 }}>
            <span>Total</span>
            <span>Rp {total.toLocaleString("id-ID")}</span>
          </div>
          {error && <p style={{ color: "#dc2626", fontSize: 13 }}>{error}</p>}
          <button onClick={handleCheckout} disabled={submitting} style={{ width: "100%", justifyContent: "center", marginTop: 12, padding: 12 }}>
            {submitting ? "Memproses..." : "Checkout"}
          </button>
        </div>
      )}
    </div>
  );
}