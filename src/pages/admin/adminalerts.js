import React, { useEffect, useState } from 'react';
import { Card, Button, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import { format } from 'date-fns';

export default function AdminAlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  // Fetch alerts every 1 second
  useEffect(() => {
    const token = localStorage.getItem('token');
    const fetchAlerts = () => {
      fetch(`${process.env.REACT_APP_API_BASE_URL}/adminalerts`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(data => {
          setAlerts(data);
          setFilteredAlerts(data);
        })
        .catch(err => console.error('Error fetching alerts:', err));
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 1000);
    return () => clearInterval(interval);
  }, []);

  // Filter alerts on search
  useEffect(() => {
    if (search.trim() === '') {
      setFilteredAlerts(alerts);
    } else {
      setFilteredAlerts(alerts.filter(a =>
        a.device_id.toLowerCase().includes(search.toLowerCase())
      ));
    }
  }, [search, alerts]);

  // API to mark admin alert as read
  const markAsRead = (id) => {
    const token = localStorage.getItem('token');
    fetch(`${process.env.REACT_APP_API_BASE_URL}/alerts/mark-read-admin/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(() => {
        setAlerts(prev =>
          prev.map(alert =>
            alert.id === id ? { ...alert, admin_status: 'read' } : alert
          )
        );
      })
      .catch(err => console.error('Error marking alert as read:', err));
  };

  const columns = [
    {
      name: 'Device ID',
      selector: row => row.device_id,
      sortable: true,
    },
    {
      name: 'Timestamp',
      selector: row => format(new Date(row.timestamp_utc), 'dd/MM/yyyy, HH:mm:ss'),
      sortable: true,
    },
    {
      name: 'Power Factor',
      selector: row => parseFloat(row.calculated_pf).toFixed(3),
      sortable: true,
    },
    {
      name: 'Actions',
      cell: row => (
        <div className="d-flex gap-2">
          <Button
            size="sm"
            variant="outline-primary"
            className="px-2 py-1"
            style={{ fontSize: '0.75rem', minWidth: '60px' }}
            onClick={() => navigate(`/admindevices/${row.device_id}`)}
          >
            View
          </Button>
          <Button
            size="sm"
            variant="outline-success"
            className="px-2 py-1"
            style={{ fontSize: '0.75rem', minWidth: '90px' }}
            onClick={() => markAsRead(row.id)}
            disabled={row.admin_status === 'read'}
          >
            {row.admin_status === 'read' ? 'Read' : 'Mark as Read'}
          </Button>
        </div>
      )
    },
  ];

  const conditionalRowStyles = [
    {
      when: row => row.admin_status === 'unread',
      style: {
        backgroundColor: 'rgba(255, 0, 0, 0.05)',
      },
    },
  ];

  return (
    <div className="container-fluid py-4">
      <Card className="p-3 border-0 shadow-sm rounded-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3">
          <h5 className="fw-bold mb-2 mb-md-0">Power Factor Alerts</h5>
          <Form.Control
            type="text"
            placeholder="Search by Device ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-100 w-md-auto"
            style={{ maxWidth: 300 }}
          />
        </div>

        <div style={{ overflowX: 'auto' }}>
          <DataTable
            columns={columns}
            data={filteredAlerts}
            pagination
            highlightOnHover
            striped
            responsive
            conditionalRowStyles={conditionalRowStyles}
          />
        </div>
      </Card>
    </div>
  );
}
