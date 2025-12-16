import React, { useEffect, useState } from 'react';
import {
  Card,
  Table,
  Form,
  Button,
  Badge,
  Pagination
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

export default function AdminAlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
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

  const hourlyAlerts = alerts.filter((a) => a.type === 'hourly');
  const unreadCount = hourlyAlerts.filter((a) => a.admin_status === 'unread').length;

  const filteredAlerts = hourlyAlerts.filter(
    (a) =>
      a.device_id?.toLowerCase().includes(search.toLowerCase()) ||
      a.company_id?.toLowerCase().includes(search.toLowerCase())
  );

  const paginatedAlerts = filteredAlerts.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const totalPages = Math.ceil(filteredAlerts.length / rowsPerPage);

  return (
    <div className="container-fluid py-4">
      <Card className="p-4 border-0 shadow-sm rounded-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold mb-0">
            All Alerts Overview{' '}
            <Badge bg="danger" className="ms-1">{unreadCount}</Badge>
          </h5>
          <Form.Control
            type="text"
            placeholder="Search by Device ID or Company..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            style={{ maxWidth: 300 }}
          />
        </div>

        <Table hover responsive className="mb-0 small">
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
            {paginatedAlerts.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-4">No alerts found</td>
              </tr>
            ) : (
              paginatedAlerts.map((row) => (
                <tr key={row.id} style={{ backgroundColor: row.admin_status === 'unread' ? '#fff3f3' : 'inherit' }}>
                  <td>{row.device_id}</td>
                  <td>{row.company_id}</td>
                  <td>{format(new Date(row.timestamp_utc), 'dd/MM/yyyy, HH:mm:ss')}</td>
                  <td
                    style={{
                      color: parseFloat(row.calculated_pf) < 0.9 ? 'red' : 'inherit',
                      fontWeight: 'bold',
                    }}
                  >
                    {parseFloat(row.calculated_pf).toFixed(3)}
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <Button
                        size="sm"
                        variant="outline-primary"
                        onClick={() => navigate(`/admindevices/${row.device_id}`)}
                      >
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
              ))
            )}
          </tbody>
        </Table>

        <div className="d-flex justify-content-between align-items-center mt-3">
          <div>Rows per page: {rowsPerPage}</div>
          <Pagination className="mb-0">
            <Pagination.First onClick={() => setCurrentPage(1)} disabled={currentPage === 1} />
            <Pagination.Prev onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1} />
            <Pagination.Item active>
              {`${(currentPage - 1) * rowsPerPage + 1}-${Math.min(
                currentPage * rowsPerPage,
                filteredAlerts.length
              )} of ${filteredAlerts.length}`}
            </Pagination.Item>
            <Pagination.Next
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            />
            <Pagination.Last onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} />
          </Pagination>
        </div>
      </Card>
    </div>
  );
}
