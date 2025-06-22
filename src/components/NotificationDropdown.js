import React, { useState, useEffect } from 'react';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CloseIcon from '@mui/icons-material/Close';

export default function NotificationDropdown({ onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [companyDevices, setCompanyDevices] = useState([]);
  const [devicesLoaded, setDevicesLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const token = localStorage.getItem('token');
  const alertSound = new Audio('/alert.mp3');

  // Resize listener
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch company device list
  useEffect(() => {
    if (!token) return;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const companyId = payload.company_id;

      fetch(`${process.env.REACT_APP_API_BASE_URL}/admin/devices/company/${companyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          const ids = data.devices?.map((d) => d.device_id) || [];
          console.log('[Dropdown] Devices:', ids);
          setCompanyDevices(ids);
          setDevicesLoaded(true);
        })
        .catch((err) => console.error('Dropdown device fetch error:', err));
    } catch (err) {
      console.error('Invalid token decoding:', err);
    }
  }, [token]);

  // Fetch alerts and filter
  useEffect(() => {
    if (!devicesLoaded || companyDevices.length === 0) return;

    const fetchAlerts = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/alerts`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        const matched = (Array.isArray(data) ? data : []).filter((alert) =>
          companyDevices.includes(alert.device_id)
        );

        const mapped = matched.map((alert, index) => ({
          id: alert.id || index + 1,
          text: `Powerfactor issue on ${alert.device_id}`,
          device_id: alert.device_id,
          time: new Date(alert.created_at).toLocaleString(),
        }));

        if (mapped.length > notifications.length) {
          alertSound.play().catch(() => {});
          if (navigator.vibrate) navigator.vibrate(200);
        }

        setNotifications(mapped.slice(0, 5)); // Only latest 5
      } catch (err) {
        console.error('Dropdown alert fetch error:', err);
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 1000);
    return () => clearInterval(interval);
  }, [devicesLoaded, companyDevices, token]);

  const handleRemove = async (id) => {
    try {
      await fetch(`${process.env.REACT_APP_API_BASE_URL}/alerts/mark-read/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (onClose) onClose(); // Optionally close dropdown
    } catch (err) {
      console.error('Error marking alert as read:', err);
    }
  };

  return (
    <div
      className="shadow bg-white rounded-4"
      style={{
        position: isMobile ? 'fixed' : 'absolute',
        top: isMobile ? '50%' : '60px',
        left: isMobile ? '50%' : 'auto',
        right: isMobile ? 'auto' : '20px',
        transform: isMobile ? 'translate(-50%, -50%)' : 'none',
        width: isMobile ? '90%' : '340px',
        zIndex: 1001,
        border: '1px solid #dee2e6',
        overflow: 'hidden',
        maxHeight: '80vh',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center px-4 py-3 border-bottom bg-white">
        <strong style={{ fontSize: '1.1rem' }}>Notifications</strong>
      </div>

      {/* Notifications List */}
      <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
        {notifications.length === 0 ? (
          <div className="text-center text-muted py-5">No notifications</div>
        ) : (
          notifications.map((note) => (
            <div
              className="d-flex align-items-start px-4 py-3 border-bottom"
              key={note.id}
              style={{ gap: '12px', cursor: 'pointer' }}
            >
              <div className="text-warning mt-1">
                <NotificationsIcon />
              </div>
              <div className="flex-grow-1" style={{ fontSize: '0.95rem', fontWeight: 500 }}>
                {note.text}
                <div className="text-muted" style={{ fontSize: '0.8rem' }}>{note.time}</div>
              </div>
              <div role="button" className="text-muted" onClick={() => handleRemove(note.id)}>
                <CloseIcon fontSize="small" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
