import { useState, useEffect } from "react";
import { LayoutGrid, Plus, Pencil, Trash2, FolderOpen } from "lucide-react";
import api from "../../api/axios";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [namaKategori, setNamaKategori] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data);
    } catch (err) {
      setError("Gagal memuat data kategori");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, { nama_kategori: namaKategori });
      } else {
        await api.post("/categories", { nama_kategori: namaKategori });
      }
      setNamaKategori("");
      setEditingId(null);
      fetchCategories();
    } catch (err) {
      setError("Gagal menyimpan kategori");
    }
  };

  const handleEdit = (category) => {
    setEditingId(category.id);
    setNamaKategori(category.nama_kategori);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNamaKategori("");
  };

  const handleDelete = async (id) => {
    if (!confirm("Yakin ingin menghapus kategori ini?")) return;
    try {
      await api.delete(`/categories/${id}`);
      fetchCategories();
    } catch (err) {
      setError("Gagal menghapus kategori");
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-header-icon"><LayoutGrid size={22} /></div>
          <h2>Kelola Kategori</h2>
          <p>Atur kategori menu makanan & minuman restoran Anda.</p>
        </div>
      </div>

      <div className="form-card">
        <h4>{editingId ? "Edit Kategori" : "Tambah Kategori Baru"}</h4>
        <form onSubmit={handleSubmit}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
            <div className="form-row" style={{ flex: 1, minWidth: 220, marginBottom: 0 }}>
              <label>Nama Kategori</label>
              <input
                type="text"
                placeholder="Contoh: Makanan Utama"
                value={namaKategori}
                onChange={(e) => setNamaKategori(e.target.value)}
                required
              />
            </div>
            <div style={{ display: "flex" }}>
              <button type="submit">
                {editingId ? <Pencil size={15} /> : <Plus size={15} />}
                {editingId ? "Update" : "Tambah"}
              </button>
              {editingId && (
                <button type="button" className="secondary" onClick={handleCancelEdit}>Batal</button>
              )}
            </div>
          </div>
        </form>
        {error && <p style={{ color: "#dc2626", fontSize: 13, marginTop: 10, marginBottom: 0 }}>{error}</p>}
      </div>

      {loading ? (
        <div className="loading-wrap"><div className="spinner" /> Memuat data...</div>
      ) : categories.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon"><FolderOpen size={26} /></div>
          <p>Belum ada kategori. Tambahkan kategori pertama Anda di atas.</p>
        </div>
      ) : (
        <table>
          <thead>
            <tr>
              <th style={{ width: 60 }}>ID</th>
              <th>Nama Kategori</th>
              <th style={{ width: 160 }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id}>
                <td><span className="badge badge-neutral">#{cat.id}</span></td>
                <td style={{ fontWeight: 600 }}>{cat.nama_kategori}</td>
                <td>
                  <button className="icon-btn secondary" onClick={() => handleEdit(cat)} title="Edit">
                    <Pencil size={15} />
                  </button>
                  <button className="icon-btn danger" onClick={() => handleDelete(cat.id)} title="Hapus">
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}