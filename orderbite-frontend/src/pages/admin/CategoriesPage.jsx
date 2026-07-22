import { useState, useEffect } from "react";
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

  if (loading) return <p>Memuat...</p>;

  return (
    <div>
      <h2>Kelola Kategori</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Nama kategori"
          value={namaKategori}
          onChange={(e) => setNamaKategori(e.target.value)}
          required
        />
        <button type="submit">{editingId ? "Update" : "Tambah"}</button>
        {editingId && (
          <button type="button" onClick={handleCancelEdit}>Batal</button>
        )}
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nama Kategori</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {categories.length === 0 ? (
            <tr>
              <td colSpan="3" style={{ textAlign: "center" }}>Belum ada kategori</td>
            </tr>
          ) : (
            categories.map((cat) => (
              <tr key={cat.id}>
                <td>{cat.id}</td>
                <td>{cat.nama_kategori}</td>
                <td>
                  <button onClick={() => handleEdit(cat)}>Edit</button>
                  <button onClick={() => handleDelete(cat.id)}>Hapus</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}