// AdminAlertsPage.js
import React, { useEffect, useState } from 'react';
import {
  Card,
  Button,
  Form,
  Tabs,
  Tab,
  Badge,
  Accordion,
  Table,
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

export default function AdminAlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('live');
  const [selectedAlerts, setSelectedAlerts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const fetchAlerts = () => {
      fetch(`${process.env.REACT_APP_API_BASE_URL}/adminalerts`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => setAlerts(data))
        .catch((err) => console.error('Error fetching alerts:', err));
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 1000);
    return () => clearInterval(interval);
  }, []);

  const markAsRead = (id) => {
    const token = localStorage.getItem('token');
    fetch(`${process.env.REACT_APP_API_BASE_URL}/alerts/mark-read-admin/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(() => {
        setAlerts((prev) =>
          prev.map((alert) =>
            alert.id === id ? { ...alert, admin_status: 'read' } : alert
          )
        );
      })
      .catch((err) => console.error('Error marking alert as read:', err));
  };

  const markSelectedAsRead = () => {
    selectedAlerts.forEach((id) => markAsRead(id));
    setSelectedAlerts([]);
  };

  const toggleSelectAlert = (id) => {
    setSelectedAlerts((prev) =>
      prev.includes(id) ? prev.filter((aid) => aid !== id) : [...prev, id]
    );
  };

  const liveAlerts = alerts.filter((a) => a.type === 'live');
  const hourlyAlerts = alerts.filter((a) => a.type === 'hourly');
  const filteredAlerts = activeTab === 'live' ? liveAlerts : hourlyAlerts;
  const unreadCount = (list) => list.filter((a) => a.admin_status === 'unread').length;

  const groupedByCompany = (alertsArray) => {
    return alertsArray.reduce((acc, alert) => {
      if (!acc[alert.company_id]) acc[alert.company_id] = [];
      acc[alert.company_id].push(alert);
      return acc;
    }, {});
  };

  return (
    <div className="container-fluid py-4">
      <Card className="p-3 border-0 shadow-sm rounded-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3">
          <h5 className="fw-bold mb-2 mb-md-0">Power Factor Alerts</h5>
          <Form.Control
            type="text"
            placeholder="Search by Type or Company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: 300 }}
          />
        </div>

        <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-3" justify>
          <Tab
            eventKey="live"
            title={<span className='alt'>Live Alerts <Badge bg="danger">{unreadCount(liveAlerts)}</Badge></span>}
          />
          <Tab
            eventKey="hourly"
            title={<span className='alt'>Hourly Alerts <Badge bg="primary">{unreadCount(hourlyAlerts)}</Badge></span>}
          />
        </Tabs>

        {activeTab === 'live' && (
          <div className="mb-3 text-end">
            <Button variant="success" onClick={markSelectedAsRead} disabled={!selectedAlerts.length}>
              Mark Selected as Read
            </Button>
          </div>
        )}

        {activeTab === 'live' ? (
          <Accordion defaultActiveKey="0">
            {Object.entries(groupedByCompany(filteredAlerts)).map(([companyId, companyAlerts], index) => (
              <Accordion.Item eventKey={index.toString()} key={companyId}>
                <Accordion.Header>
                  <strong>{companyId}</strong> <Badge className="ms-2" bg="secondary">{companyAlerts.length}</Badge>
                </Accordion.Header>
                <Accordion.Body>
                  <Table hover responsive className="mb-0 small">
                    <thead>
                      <tr>
                        <th>
                          <Form.Check
                            type="checkbox"
                            checked={companyAlerts.every((a) => selectedAlerts.includes(a.id))}
                            onChange={() => {
                              const allIds = companyAlerts.map((a) => a.id);
                              const allSelected = allIds.every((id) => selectedAlerts.includes(id));
                              setSelectedAlerts((prev) =>
                                allSelected ? prev.filter((id) => !allIds.includes(id)) : [...new Set([...prev, ...allIds])]
                              );
                            }}
                          />
                        </th>
                        <th>Device ID</th>
                        <th>Timestamp</th>
                        <th>Power Factor</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {companyAlerts.map((alert) => (
                        <tr key={alert.id} style={{ backgroundColor: alert.admin_status === 'unread' ? '#fff3f3' : 'inherit' }}>
                          <td>
                            <Form.Check
                              type="checkbox"
                              checked={selectedAlerts.includes(alert.id)}
                              onChange={() => toggleSelectAlert(alert.id)}
                            />
                          </td>
                          <td>{alert.device_id}</td>
                          <td>{format(new Date(alert.timestamp_utc), 'dd/MM/yyyy, HH:mm:ss')}</td>
                          <td style={{ color: 'red', fontWeight: 'bold' }}>{parseFloat(alert.calculated_pf).toFixed(3)}</td>
                          <td>
                            <div className="d-flex gap-2">
                              <Button
                                size="sm"
                                variant="outline-primary"
                                onClick={() => navigate(`/admindevices/${alert.device_id}`)}
                              >
                                View
                              </Button>
                              <Button
                                size="sm"
                                variant="outline-success"
                                onClick={() => markAsRead(alert.id)}
                                disabled={alert.admin_status === 'read'}
                              >
                                {alert.admin_status === 'read' ? 'Read' : 'Mark as Read'}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
        ) : (
          <Table hover responsive className="small">
            <thead>
              <tr>
                <th>Device ID</th>
                <th>Company</th>
                <th>Timestamp</th>
                <th>Power Factor</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAlerts.map((row) => (
                <tr key={row.id} style={{ backgroundColor: row.admin_status === 'unread' ? '#fff3f3' : 'inherit' }}>
                  <td>{row.device_id}</td>
                  <td>{row.company_id}</td>
                  <td>{format(new Date(row.timestamp_utc), 'dd/MM/yyyy, HH:mm:ss')}</td>
                  <td style={{ color: 'red', fontWeight: 'bold' }}>{parseFloat(row.calculated_pf).toFixed(3)}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <Button size="sm" variant="outline-primary" onClick={() => navigate(`/admindevices/${row.device_id}`)}>
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-success"
                        onClick={() => markAsRead(row.id)}
                        disabled={row.admin_status === 'read'}
                      >
                        {row.admin_status === 'read' ? 'Read' : 'Mark as Read'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
