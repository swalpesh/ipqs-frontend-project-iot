import React, { useEffect, useState } from 'react';
import { IconButton, Typography, Box } from '@mui/material';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import ClearIcon from '@mui/icons-material/Clear';

export default function PendingAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [companyDevices, setCompanyDevices] = useState([]);
  const [devicesLoaded, setDevicesLoaded] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const companyId = payload.company_id;

      fetch(`${process.env.REACT_APP_API_BASE_URL}/admin/devices/company/${companyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(data => {
          const ids = data.devices?.map(d => d.device_id) || [];
          setCompanyDevices(ids);
          setDevicesLoaded(true);
        })
        .catch(err => console.error('Error fetching devices:', err));
    } catch (error) {
      console.error('Invalid token or decode error:', error);
    }
  }, [token]);

  useEffect(() => {
    if (!devicesLoaded || companyDevices.length === 0) return;

    const fetchAlerts = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/alerts`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        const matchedAlerts = (Array.isArray(data) ? data : []).filter(alert =>
          companyDevices.includes(alert.device_id)
        );

        const mapped = matchedAlerts.map((alert, index) => ({
          id: alert.id || index + 1,
          device_id: alert.device_id,
          message: `Powerfactor issue for ${alert.device_id}`,
          time: new Date(alert.created_at).toLocaleString(),
          read: false,
        }));

        setAlerts(mapped.slice(0, 5));
      } catch (err) {
        console.error('Error fetching alerts:', err);
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 1000);
    return () => clearInterval(interval);
  }, [devicesLoaded, companyDevices, token]);

  const markAsRead = (id) =>
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));

  const handleClear = async (id) => {
    try {
      await fetch(`${process.env.REACT_APP_API_BASE_URL}/alerts/mark-read/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      setAlerts(prev => prev.filter(alert => alert.id !== id));
    } catch (err) {
      console.error('Failed to mark alert as read:', err);
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: '#fff',
        borderRadius: 3,
        boxShadow: 1,
        padding: 2,
        height: '100%',
        maxHeight: '100vh',
        overflowY: 'auto',
      }}
    >
      <Box className="d-flex justify-content-between align-items-center mb-3">
        <Typography variant="subtitle1" fontWeight="bold">
          <span role="img" aria-label="bell">🔔</span> Notifications
        </Typography>
      </Box>

      {alerts.length === 0 ? (
        <Typography variant="body2" color="text.secondary" align="center">
          No pending alerts.
        </Typography>
      ) : (
        alerts.map((alert) => (
          <Box
            key={alert.id}
            sx={{
              backgroundColor: alert.read ? '#f0f0f0' : '#fafafa',
              borderRadius: 2,
              padding: 1.5,
              marginBottom: 1.5,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: '#f5f5f5',
              },
              cursor: 'pointer',
            }}
            onClick={() => markAsRead(alert.id)}
          >
            <Box display="flex" gap={1}>
              <NotificationsActiveIcon sx={{ color: '#fbc02d', mt: '3px' }} fontSize="small" />
              <Box>
                <Typography variant="subtitle2" fontWeight={600}>
                  {alert.message}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {alert.time}
                </Typography>
              </Box>
            </Box>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleClear(alert.id);
              }}
              sx={{ color: '#ef5350' }}
            >
              <ClearIcon fontSize="small" />
            </IconButton>
          </Box>
        ))
      )}
    </Box>
  );
}
