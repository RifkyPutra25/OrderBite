import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
    setCart(cart
      .map((c) => c.menu_item_id === menuItemId ? { ...c, qty: c.qty + delta } : c)
      .filter((c) => c.qty > 0)
    );
  };

  const updateNote = (menuItemId, catatan) => {
    setCart(cart.map((c) => c.menu_item_id === menuItemId ? { ...c, catatan } : c));
  };

  const total = cart.reduce((sum, c) => sum + c.harga * c.qty, 0);

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

  if (loading) return <p style={{ padding: 20 }}>Memuat...</p>;
  if (error && !table) return <p style={{ padding: 20, color: "red" }}>{error}</p>;

  // Layar input nama dulu, sebelum bisa lihat menu
  if (!customerName) {
    return (
      <div style={{ padding: 20, maxWidth: 400, margin: "40px auto" }}>
        <h2>Selamat datang di OrderBite</h2>
        <p>Meja: <strong>{table?.nomor_meja}</strong></p>
        <form onSubmit={handleSetName} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <input
            type="text"
            placeholder="Masukkan nama Anda"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            required
          />
          <button type="submit">Lanjut ke Menu</button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: "0 auto", paddingBottom: 120 }}>
      <h2>Menu — Meja {table?.nomor_meja}</h2>
      <p>Halo, {customerName}!</p>

      {categories.map((cat) => (
        <div key={cat.id} style={{ marginBottom: 25 }}>
          <h3>{cat.nama_kategori}</h3>
          {(!cat.menu_items || cat.menu_items.length === 0) ? (
            <p style={{ color: "#888" }}>Belum ada menu di kategori ini</p>
          ) : (
            cat.menu_items.map((item) => (
              <div key={item.id} style={{ border: "1px solid #eee", padding: 12, borderRadius: 8, marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong>{item.nama}</strong>
                  <p style={{ margin: "4px 0", fontSize: 13, color: "#666" }}>{item.deskripsi}</p>
                  <span>Rp {Number(item.harga).toLocaleString("id-ID")}</span>
                </div>
                <button onClick={() => addToCart(item)}>+ Tambah</button>
              </div>
            ))
          )}
        </div>
      ))}

      {/* Keranjang fixed di bawah */}
      {cart.length > 0 && (
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          background: "white", borderTop: "2px solid #ddd", padding: 15,
          maxHeight: "40vh", overflowY: "auto",
        }}>
          <h4>Keranjang</h4>
          {cart.map((c) => (
            <div key={c.menu_item_id} style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>{c.nama}</span>
                <span>
                  <button onClick={() => updateQty(c.menu_item_id, -1)}>-</button>
                  {" "}{c.qty}{" "}
                  <button onClick={() => updateQty(c.menu_item_id, 1)}>+</button>
                  {" "}Rp {(c.harga * c.qty).toLocaleString("id-ID")}
                </span>
              </div>
              <input
                type="text"
                placeholder="Catatan (opsional)"
                value={c.catatan}
                onChange={(e) => updateNote(c.menu_item_id, e.target.value)}
                style={{ width: "100%", fontSize: 12, marginTop: 4 }}
              />
            </div>
          ))}
          <hr />
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
            <span>Total</span>
            <span>Rp {total.toLocaleString("id-ID")}</span>
          </div>
          {error && <p style={{ color: "red" }}>{error}</p>}
          <button onClick={handleCheckout} disabled={submitting} style={{ width: "100%", marginTop: 10, padding: 10 }}>
            {submitting ? "Memproses..." : "Checkout"}
          </button>
        </div>
      )}
    </div>
  );
}