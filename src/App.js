import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate
} from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';


/* Common Components */
import Sidebar from './components/Sidebar';
import AdminSidebar from './components/admin/AdminSidebar';
import TopNav from './components/TopNav';
import ScrollToTop from './components/ScrollToTop';
import FullPageLoader from './components/FullPageLoader';

/* Pages */
import Welcome from './pages/welcome';   // ✅ ADD THIS
import Login from './pages/Login';

/* User Pages */
import DashboardPage from './pages/DashboardPage';
import DevicesPage from './pages/DevicesPage';
import GroupsPage from './pages/GroupsPage';
import LogoutPage from './pages/LogoutPage';
import DeviceDetails from './pages/DeviceDetailpage';
import ProfilePage from './pages/CompanyProfilePage';

/* Admin Pages */
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCompanies from './pages/admin/AdminCompanies';
import ExploreCompanyPage from './pages/admin/ExploreCompanyPage';
import AdminCompanyProfile from './pages/CompanyProfilePage';
import DeviceDetailsadmin from './pages/admin/DeviceDetailpageadmin';
import Alldevicesadmin from './pages/admin/Adminalldevices';
import Adminalerts from './pages/admin/adminalerts';
import AdminSubscriptions from './pages/admin/AdminSubscriptions';

/* ================= PROTECTED ROUTE ================= */
function ProtectedRoute({ children, allowedRole }) {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) return <Navigate to="/login" replace />;

  if (allowedRole && role !== allowedRole) {
    return (
      <Navigate
        to={role === 'admin' ? '/admin/dashboard' : '/user'}
        replace
      />
    );
  }

  return children;
}

/* ================= APP CONTENT ================= */
function AppContent() {
  const location = useLocation();

  const isAdmin = location.pathname.startsWith('/admin');
  const isLoginPage = location.pathname === '/login';
  const isWelcomePage = location.pathname === '/';

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1024);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 1024;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };

    const timer = setTimeout(() => setLoading(false), 600);
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [location.pathname]);

  if (loading) return <FullPageLoader />;

  /* 🔹 If user already logged in, prevent welcome/login */
  if ((isWelcomePage || isLoginPage) && token) {
    if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (role === 'company') return <Navigate to="/user" replace />;
  }

  /* 🔹 Welcome Page */
  if (isWelcomePage) {
    return (
      <Routes>
        <Route path="/" element={<Welcome />} />
      </Routes>
    );
  }

  /* 🔹 Login Page */
  if (isLoginPage) {
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
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease'
        }}
      >
        <SidebarComponent
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
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
          minHeight: '100vh',
          backgroundColor: '#f8f9fa',
          transition: 'margin-left 0.3s ease'
        }}
      >
        <TopNav onToggleSidebar={() => setSidebarOpen(prev => !prev)} />

        <div className="p-3">
          <Routes>
            {/* Company Routes */}
            <Route
              path="/user"
              element={<ProtectedRoute allowedRole="company"><DashboardPage /></ProtectedRoute>}
            />
            <Route
              path="/devices"
              element={<ProtectedRoute allowedRole="company"><DevicesPage /></ProtectedRoute>}
            />
            <Route
              path="/groups"
              element={<ProtectedRoute allowedRole="company"><GroupsPage /></ProtectedRoute>}
            />
            <Route path="/logout" element={<LogoutPage />} />
            <Route
              path="/devices/:device_id"
              element={<ProtectedRoute allowedRole="company"><DeviceDetails /></ProtectedRoute>}
            />
            <Route
              path="/profile"
              element={<ProtectedRoute allowedRole="company"><ProfilePage /></ProtectedRoute>}
            />

            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={<ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute>}
            />
            <Route
              path="/admin/companies"
              element={<ProtectedRoute allowedRole="admin"><AdminCompanies /></ProtectedRoute>}
            />
            <Route
              path="/admin/companies/:companyId"
              element={<ProtectedRoute allowedRole="admin"><ExploreCompanyPage /></ProtectedRoute>}
            />
            <Route
              path="/admindevices/:device_id"
              element={<ProtectedRoute allowedRole="admin"><DeviceDetailsadmin /></ProtectedRoute>}
            />
            <Route
              path="/admincompanyprofile"
              element={<ProtectedRoute allowedRole="admin"><AdminCompanyProfile /></ProtectedRoute>}
            />
            <Route
              path="/admin/alldevices"
              element={<ProtectedRoute allowedRole="admin"><Alldevicesadmin /></ProtectedRoute>}
            />
            <Route
              path="/admin/alerts"
              element={<ProtectedRoute allowedRole="admin"><Adminalerts /></ProtectedRoute>}
            />
            <Route
              path="/admin/subscriptions"
              element={<ProtectedRoute allowedRole="admin"><AdminSubscriptions /></ProtectedRoute>}
            />
          </Routes>
        </div>
      </div>
    </div>
  );
}

/* ================= MAIN APP ================= */
export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <AppContent />
      <ToastContainer />
    </Router>
  );
}
