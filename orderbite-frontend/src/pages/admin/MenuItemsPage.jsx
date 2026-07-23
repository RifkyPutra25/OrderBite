import { useState, useEffect } from "react";
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
    if (fotoFile) {
      formData.append("foto", fotoFile);
    }

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

  if (loading) return <p>Memuat...</p>;

  return (
    <div>
      <h2>Kelola Menu</h2>

      {categories.length === 0 && (
        <p style={{ color: "orange" }}>
          Belum ada kategori. Silakan tambah kategori dulu di menu "Kategori".
        </p>
      )}

      <form onSubmit={handleSubmit} style={{ marginBottom: 20, display: "flex", flexDirection: "column", gap: 8, maxWidth: 400 }}>
        <select name="category_id" value={form.category_id} onChange={handleChange} required>
          <option value="">-- Pilih Kategori --</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.nama_kategori}</option>
          ))}
        </select>

        <input type="text" name="nama" placeholder="Nama menu" value={form.nama} onChange={handleChange} required />
        <textarea name="deskripsi" placeholder="Deskripsi" value={form.deskripsi} onChange={handleChange} />
        <input type="number" name="harga" placeholder="Harga" value={form.harga} onChange={handleChange} required min="0" step="0.01" />

        <input type="file" name="foto" accept="image/*" onChange={handleChange} />
        {editingId && !fotoFile && (
          <p style={{ fontSize: 12, color: "#666", margin: 0 }}>Kosongkan jika tidak ingin ganti foto</p>
        )}

        <label>
          <input type="checkbox" name="tersedia" checked={form.tersedia} onChange={handleChange} />
          {" "}Tersedia
        </label>

        <div>
          <button type="submit">{editingId ? "Update" : "Tambah"}</button>
          {editingId && <button type="button" onClick={resetForm}>Batal</button>}
        </div>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th>Foto</th>
            <th>Nama</th>
            <th>Kategori</th>
            <th>Harga</th>
            <th>Tersedia</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {menuItems.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ textAlign: "center" }}>Belum ada menu</td>
            </tr>
          ) : (
            menuItems.map((item) => (
              <tr key={item.id}>
                <td>
                  {item.foto_full_url ? (
                    <img src={item.foto_full_url} alt={item.nama} style={{ width: 50, height: 50, objectFit: "cover", borderRadius: 6 }} />
                  ) : (
                    <span style={{ color: "#ccc" }}>-</span>
                  )}
                </td>
                <td>{item.nama}</td>
                <td>{item.category?.nama_kategori || "-"}</td>
                <td>Rp {Number(item.harga).toLocaleString("id-ID")}</td>
                <td>{item.tersedia ? "Ya" : "Tidak"}</td>
                <td>
                  <button onClick={() => handleEdit(item)}>Edit</button>
                  <button onClick={() => handleDelete(item.id)}>Hapus</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}