// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import CustomerMenu from './pages/CustomerMenu';
import KitchenHub from './pages/KitchenHub';
import AdminDashboard from './pages/AdminDashboard';
import MenuManagement from './pages/MenuManagement';
import MenuItemForm from './pages/MenuItemForm';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';
import RegistrationPage from './pages/RegistrationPage';
import TableManagement from './pages/TableManagement';
import { Navigate } from 'react-router-dom';
import './App.css'; // Global styles

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegistrationPage />} />
      <Route path="/menu/:restaurantId" element={<CustomerMenu />} />

      {/* Admin/Protected Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        {/* 3. Nest the admin pages as children. They will be rendered by the <Outlet/> */}
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="menu" element={<MenuManagement />} />
        <Route path="menu/new" element={<MenuItemForm />} />
        <Route path="menu/edit/:itemId" element={<MenuItemForm />} />
        <Route path="kitchen/hub" element={<KitchenHub />} />
        <Route path="tables" element={<TableManagement />} /> 
      </Route>

      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;