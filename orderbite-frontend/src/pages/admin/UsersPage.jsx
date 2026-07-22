import { useState, useEffect } from "react";
import api from "../../api/axios";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "kasir" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch (err) {
      setError("Gagal memuat data akun");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/users", form);
      setForm({ name: "", email: "", password: "", role: "kasir" });
      fetchUsers();
    } catch (err) {
      setError("Gagal membuat akun. Pastikan email belum dipakai.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Yakin ingin menghapus akun ini?")) return;
    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
    } catch (err) {
      setError("Gagal menghapus akun");
    }
  };

  if (loading) return <p>Memuat...</p>;

  return (
    <div>
      <h2>Kelola Akun Kasir/Dapur</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: 20, display: "flex", flexDirection: "column", gap: 8, maxWidth: 300 }}>
        <input type="text" name="name" placeholder="Nama" value={form.name} onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required minLength={6} />
        <select name="role" value={form.role} onChange={handleChange}>
          <option value="kasir">Kasir</option>
          <option value="dapur">Dapur</option>
        </select>
        <button type="submit">Buat Akun</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th>Nama</th>
            <th>Email</th>
            <th>Role</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr><td colSpan="4" style={{ textAlign: "center" }}>Belum ada akun</td></tr>
          ) : (
            users.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td><button onClick={() => handleDelete(u.id)}>Hapus</button></td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}