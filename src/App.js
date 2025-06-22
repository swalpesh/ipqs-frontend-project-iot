import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

// User Components
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';
import ScrollToTop from './components/ScrollToTop';
import FullPageLoader from './components/FullPageLoader';

// Admin Components
import AdminSidebar from './components/admin/AdminSidebar';

// User Pages
import DashboardPage from './pages/DashboardPage';
import DevicesPage from './pages/DevicesPage';
import GroupsPage from './pages/GroupsPage';
import LogoutPage from './pages/LogoutPage';
import DeviceDetails from './pages/DeviceDetailpage';
import ProfilePage from './pages/CompanyProfilePage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCompanies from './pages/admin/AdminCompanies';
import ExploreCompanyPage from './pages/admin/ExploreCompanyPage';
import AdminCompanyProfile from './pages/CompanyProfilePage';
import DeviceDetailsadmin from './pages/admin/DeviceDetailpageadmin';
import Alldevicesadmin from './pages/admin/Adminalldevices';
import Adminalerts from './pages/admin/adminalerts';
import AdminSubscriptions from './pages/admin/AdminSubscriptions';

// Auth Page
import Login from './pages/Login';

function ProtectedRoute({ children, allowedRole }) {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) return <Navigate to="/login" />;
  if (allowedRole && role !== allowedRole) return <Navigate to={role === 'admin' ? '/admin/dashboard' : '/user'} />;

  return children;
}

function AppContent() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const isLoginPage = location.pathname === '/login';
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1024);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      const isNowMobile = window.innerWidth <= 1024;
      setIsMobile(isNowMobile);
      setSidebarOpen(!isNowMobile);
    };

    const timeout = setTimeout(() => setLoading(false), 800);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeout);
    };
  }, [location.pathname]);

  if (loading) return <FullPageLoader />;

  // ✅ Redirect root to login or dashboard
  if (location.pathname === '/') {
    if (!token) return <Navigate to="/login" />;
    if (role === 'admin') return <Navigate to="/admin/dashboard" />;
    if (role === 'company') return <Navigate to="/user" />;
  }

  // ✅ Login Page Rendering
  if (isLoginPage) {
    if (token) {
      if (role === 'admin') return <Navigate to="/admin/dashboard" />;
      if (role === 'company') return <Navigate to="/user" />;
    }
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
      </Routes>
    );
  }

  const SidebarComponent = isAdmin ? AdminSidebar : Sidebar;

  return (
    <div className="d-flex position-relative">
      {/* Sidebar */}
      <div
        className="bg-dark text-white position-fixed top-0 start-0"
        style={{
          width: '240px',
          height: '100vh',
          zIndex: 1100,
          transition: 'transform 0.3s ease-in-out',
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        }}
      >
        <SidebarComponent isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 1000 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div
        style={{
          marginLeft: isMobile ? '0' : '240px',
          width: '100%',
          transition: 'margin-left 0.3s ease',
          backgroundColor: '#f8f9fa',
          minHeight: '100vh',
        }}
      >
        <TopNav onToggleSidebar={() => setSidebarOpen(prev => !prev)} />
        <div className="p-3">
          <Routes>
            {/* Company Routes */}
            <Route path="/user" element={<ProtectedRoute allowedRole="company"><DashboardPage /></ProtectedRoute>} />
            <Route path="/devices" element={<ProtectedRoute allowedRole="company"><DevicesPage /></ProtectedRoute>} />
            <Route path="/groups" element={<ProtectedRoute allowedRole="company"><GroupsPage /></ProtectedRoute>} />
            <Route path="/logout" element={<LogoutPage />} />
            <Route path="/devices/:device_id" element={<ProtectedRoute allowedRole="company"><DeviceDetails /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute allowedRole="company"><ProfilePage /></ProtectedRoute>} />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/companies" element={<ProtectedRoute allowedRole="admin"><AdminCompanies /></ProtectedRoute>} />
            <Route path="/admin/companies/:companyId" element={<ProtectedRoute allowedRole="admin"><ExploreCompanyPage /></ProtectedRoute>} />
            <Route path="/admindevices/:device_id" element={<ProtectedRoute allowedRole="admin"><DeviceDetailsadmin /></ProtectedRoute>} />
            <Route path="/admincompanyprofile" element={<ProtectedRoute allowedRole="admin"><AdminCompanyProfile /></ProtectedRoute>} />
            <Route path="/admin/alldevices" element={<ProtectedRoute allowedRole="admin"><Alldevicesadmin /></ProtectedRoute>} />
            <Route path="/admin/alerts" element={<ProtectedRoute allowedRole="admin"><Adminalerts /></ProtectedRoute>} />
            <Route path="/admin/subscriptions" element={<ProtectedRoute allowedRole="admin"><AdminSubscriptions /></ProtectedRoute>} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <AppContent />
      <ToastContainer />
    </Router>
  );
}
