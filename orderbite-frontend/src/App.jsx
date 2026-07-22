import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import AdminLayout from "./components/AdminLayout";
import KasirDashboard from "./pages/KasirDashboard";
import DapurDashboard from "./pages/DapurDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import CategoriesPage from "./pages/admin/CategoriesPage";
import MenuItemsPage from "./pages/admin/MenuItemsPage";
import TablesPage from "./pages/admin/TablesPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="categories" />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="menu-items" element={<MenuItemsPage />} />
        <Route path="tables" element={<TablesPage />} />
      </Route>

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