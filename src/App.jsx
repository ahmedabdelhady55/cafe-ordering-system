import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

// صفحات العميل
import WelcomePage from './pages/customer/WelcomePage'
import MenuPage from './pages/customer/MenuPage'
import CartPage from './pages/customer/CartPage'
import OrderConfirmation from './pages/customer/OrderConfirmation'
import CustomerRegister from './pages/customer/CustomerRegister'

// صفحات الأدمن
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminLogin from './pages/admin/AdminLogin'
import CustomersPage from './pages/admin/CustomersPage'
import LoyaltySettings from './pages/admin/LoyaltySettings'
import StaffManagement from './pages/admin/StaffManagement'
import MenuManagement from './pages/admin/MenuManagement'
import BannerManagement from './pages/admin/BannerManagement'

// صفحات الموظفين
import StaffLogin from './pages/staff/StaffLogin'

// مكون حماية الصفحات
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <Router>
      <Routes>
        {/* صفحات العميل */}
        <Route path="/" element={<WelcomePage />} />
        <Route path="/register" element={<CustomerRegister />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/order-confirmation" element={<OrderConfirmation />} />
        
        {/* صفحات الأدمن */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/customers" element={
          <ProtectedRoute>
            <CustomersPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/loyalty" element={
          <ProtectedRoute>
            <LoyaltySettings />
          </ProtectedRoute>
        } />
        <Route path="/admin/staff" element={
          <ProtectedRoute requiredRole="admin">
            <StaffManagement />
          </ProtectedRoute>
        } />
        <Route path="/admin/menu" element={
          <ProtectedRoute>
            <MenuManagement />
          </ProtectedRoute>
        } />
        <Route path="/admin/banners" element={
          <ProtectedRoute>
            <BannerManagement />
          </ProtectedRoute>
        } />
        
        {/* صفحات الموظفين */}
        <Route path="/staff/login" element={<StaffLogin />} />
        
        {/* 404 */}
        <Route path="*" element={
          <div className="min-h-screen bg-bg-cream flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-primary mb-2">404</h1>
              <p className="text-text-secondary">الصفحة غير موجودة</p>
            </div>
          </div>
        } />
      </Routes>
    </Router>
  )
}

export default App