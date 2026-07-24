import { useState, useEffect } from "react";
import { UtensilsCrossed, Plus, Pencil, Trash2, ImageOff, PackageOpen } from "lucide-react";
import api from "../../api/axios";

export default function MenuItemsPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    category_id: "",
    nama: "",
    deskripsi: "",
    harga: "",
    tersedia: true,
  });
  const [fotoFile, setFotoFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      const [menuRes, catRes] = await Promise.all([
        api.get("/menu-items"),
        api.get("/categories"),
      ]);
      setMenuItems(menuRes.data);
      setCategories(catRes.data);
    } catch (err) {
      setError("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "file") {
      setFotoFile(files[0]);
    } else {
      setForm({ ...form, [name]: type === "checkbox" ? checked : value });
    }
  };

  const resetForm = () => {
    setForm({ category_id: "", nama: "", deskripsi: "", harga: "", tersedia: true });
    setFotoFile(null);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const formData = new FormData();
    formData.append("category_id", form.category_id);
    formData.append("nama", form.nama);
    formData.append("deskripsi", form.deskripsi);
    formData.append("harga", form.harga);
    formData.append("tersedia", form.tersedia ? 1 : 0);
    if (fotoFile) formData.append("foto", fotoFile);

    try {
      if (editingId) {
        formData.append("_method", "PUT");
        await api.post(`/menu-items/${editingId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/menu-items", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      resetForm();
      fetchData();
    } catch (err) {
      setError("Gagal menyimpan menu. Pastikan semua field terisi benar.");
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setForm({
      category_id: item.category_id,
      nama: item.nama,
      deskripsi: item.deskripsi || "",
      harga: item.harga,
      tersedia: !!item.tersedia,
    });
    setFotoFile(null);
  };

  const handleDelete = async (id) => {
    if (!confirm("Yakin ingin menghapus menu ini?")) return;
    try {
      await api.delete(`/menu-items/${id}`);
      fetchData();
    } catch (err) {
      setError("Gagal menghapus menu");
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-header-icon"><UtensilsCrossed size={22} /></div>
          <h2>Kelola Menu</h2>
          <p>Tambah, ubah, dan atur ketersediaan menu makanan & minuman.</p>
        </div>
      </div>

      {categories.length === 0 && (
        <div className="card" style={{ marginBottom: 20, background: "#fffbeb", border: "1px solid #fde68a" }}>
          <p style={{ margin: 0, color: "#92400e", fontSize: 14 }}>
            Belum ada kategori. Silakan tambah kategori dulu di menu "Kategori".
          </p>
        </div>
      )}

      <div className="form-card">
        <h4>{editingId ? "Edit Menu" : "Tambah Menu Baru"}</h4>
        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div className="form-row">
              <label>Kategori</label>
              <select name="category_id" value={form.category_id} onChange={handleChange} required>
                <option value="">-- Pilih Kategori --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.nama_kategori}</option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <label>Nama Menu</label>
              <input type="text" name="nama" placeholder="Contoh: Nasi Goreng Spesial" value={form.nama} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-row">
            <label>Deskripsi</label>
            <textarea name="deskripsi" placeholder="Deskripsi singkat menu" value={form.deskripsi} onChange={handleChange} rows={2} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div className="form-row">
              <label>Harga (Rp)</label>
              <input type="number" name="harga" placeholder="25000" value={form.harga} onChange={handleChange} required min="0" step="0.01" />
            </div>
            <div className="form-row">
              <label>Foto Menu</label>
              <input type="file" name="foto" accept="image/*" onChange={handleChange} />
              {editingId && !fotoFile && (
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Kosongkan jika tidak ingin ganti foto</span>
              )}
            </div>
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginBottom: 14 }}>
            <input type="checkbox" name="tersedia" checked={form.tersedia} onChange={handleChange} style={{ width: "auto" }} />
            <span style={{ fontSize: 14, fontWeight: 500, color: "var(--text)" }}>Tersedia untuk dipesan</span>
          </label>

          <div className="form-actions">
            <button type="submit">
              {editingId ? <Pencil size={15} /> : <Plus size={15} />}
              {editingId ? "Update Menu" : "Tambah Menu"}
            </button>
            {editingId && <button type="button" className="secondary" onClick={resetForm}>Batal</button>}
          </div>
        </form>
        {error && <p style={{ color: "#dc2626", fontSize: 13, marginTop: 10, marginBottom: 0 }}>{error}</p>}
      </div>

      {loading ? (
        <div className="loading-wrap"><div className="spinner" /> Memuat data...</div>
      ) : menuItems.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon"><PackageOpen size={26} /></div>
          <p>Belum ada menu. Tambahkan menu pertama Anda di atas.</p>
        </div>
      ) : (
        <table>
          <thead>
            <tr>
              <th style={{ width: 60 }}>Foto</th>
              <th>Nama</th>
              <th>Kategori</th>
              <th>Harga</th>
              <th>Status</th>
              <th style={{ width: 100 }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {menuItems.map((item) => (
              <tr key={item.id}>
                <td>
                  {item.foto_full_url ? (
                    <img src={item.foto_full_url} alt={item.nama} style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 8 }} />
                  ) : (
                    <div style={{ width: 44, height: 44, borderRadius: 8, background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-faint)" }}>
                      <ImageOff size={16} />
                    </div>
                  )}
                </td>
                <td style={{ fontWeight: 600 }}>{item.nama}</td>
                <td>{item.category?.nama_kategori || "-"}</td>
                <td>Rp {Number(item.harga).toLocaleString("id-ID")}</td>
                <td>
                  <span className={`badge ${item.tersedia ? "badge-success" : "badge-neutral"}`}>
                    {item.tersedia ? "Tersedia" : "Tidak Tersedia"}
                  </span>
                </td>
                <td>
                  <button className="icon-btn secondary" onClick={() => handleEdit(item)} title="Edit"><Pencil size={15} /></button>
                  <button className="icon-btn danger" onClick={() => handleDelete(item.id)} title="Hapus"><Trash2 size={15} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}