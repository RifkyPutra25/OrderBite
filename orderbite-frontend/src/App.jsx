import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import KasirDashboard from "./pages/KasirDashboard";
import DapurDashboard from "./pages/DapurDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/kasir"
        element={
          <ProtectedRoute allowedRoles={["kasir"]}>
            <KasirDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dapur"
        element={
          <ProtectedRoute allowedRoles={["dapur"]}>
            <DapurDashboard />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;