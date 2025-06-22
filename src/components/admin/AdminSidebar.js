import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  Business,
  Devices,
  NotificationsActive,
  Subscriptions as SubscriptionsIcon
} from '@mui/icons-material';
import logo from '../../assets/logo.png';

export default function AdminSidebar() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const fetchAlerts = () => {
      fetch(`${process.env.REACT_APP_API_BASE_URL}/adminalerts`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(data => {
          const unread = data.filter(alert => alert.admin_status === 'unread');
          setUnreadCount(unread.length);
        })
        .catch(err => console.error('Error fetching alert count:', err));
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000); // every 10 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="d-flex flex-column p-3 text-white" style={{ height: '100%', backgroundColor: '#1c1c1c' }}>
      <div className="mb-4">
        <img
          src={logo}
          alt="IPQS Logo"
          style={{
            width: '180px',
            height: '60px',
            objectFit: 'contain',
            marginBottom: '8px',
          }}
        />
      </div>

      <NavLink to="/admin/dashboard" className="nav-link text-white mb-3">
        <Home style={{ marginRight: 8 }} /> Dashboard
      </NavLink>

      <NavLink to="/admin/companies" className="nav-link text-white mb-3">
        <Business style={{ marginRight: 8 }} /> Companies
      </NavLink>

      <NavLink to="/admin/alldevices" className="nav-link text-white mb-3">
        <Devices style={{ marginRight: 8 }} /> All Devices
      </NavLink>

      <NavLink to="/admin/alerts" className="nav-link text-white mb-3 d-flex align-items-center justify-content-between">
        <span>
          <NotificationsActive style={{ marginRight: 8 }} /> PF Alerts
        </span>
        {unreadCount > 0 && (
          <span
            className="badge bg-danger"
            style={{
              fontSize: '0.7rem',
              padding: '4px 8px',
              borderRadius: '12px',
              marginLeft: 8,
            }}
          >
            {unreadCount}
          </span>
        )}
      </NavLink>

      <NavLink to="/admin/subscriptions" className="nav-link text-white mb-3">
        <SubscriptionsIcon style={{ marginRight: 8 }} /> Subscriptions
      </NavLink>
    </div>
  );
}
