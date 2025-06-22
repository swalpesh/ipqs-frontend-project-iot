import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Button, Spinner } from 'react-bootstrap';
import BusinessIcon from '@mui/icons-material/Business';
import DevicesIcon from '@mui/icons-material/Devices';
import SubscriptionsIcon from '@mui/icons-material/Description';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [totalCompanies, setTotalCompanies] = useState(0);
  const [totalDevices, setTotalDevices] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    const fetchData = async () => {
      try {
        const [companiesRes, devicesRes] = await Promise.all([
          fetch(`${process.env.REACT_APP_API_BASE_URL}/admin/companies/devices`, { headers }),
          fetch(`${process.env.REACT_APP_API_BASE_URL}/admin/devices`, { headers }),
        ]);

        if (companiesRes.status === 401 || devicesRes.status === 401) {
          localStorage.clear();
          window.location.href = '/login';
          return;
        }

        const companiesData = await companiesRes.json();
        const devicesData = await devicesRes.json();

        setCompanies(companiesData.companies || []);
        setTotalCompanies(companiesData.total_companies || 0);
        setTotalDevices(devicesData.total_devices || 0);
      } catch (error) {
        console.error('Error fetching admin dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const cards = [
    {
      title: 'Registered Companies',
      value: totalCompanies,
      icon: <BusinessIcon fontSize="large" className="text-primary" />,
      bg: '#e7f1ff',
    },
    {
      title: 'Installed Devices',
      value: totalDevices,
      icon: <DevicesIcon fontSize="large" className="text-success" />,
      bg: '#eaf9f0',
    },
    {
      title: 'Total Subscriptions',
      value: 'N/A',
      icon: <SubscriptionsIcon fontSize="large" className="text-warning" />,
      bg: '#fff8e1',
    },
  ];

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className="container-fluid mt-4">
      {/* Header */}
      <div className="row mt-2 mb-3">
        <h1>Welcome Admin!</h1>
      </div>

      {/* Metric Cards */}
      <div className="row g-4 mb-5">
        {cards.map((card, index) => (
          <Col key={index} xs={12} md={6} lg={4}>
            <Card className="rounded-4 shadow-sm border-0" style={{ background: card.bg }}>
              <Card.Body className="d-flex justify-content-between align-items-center p-4">
                <div>
                  <h6 className="text-uppercase text-muted fw-semibold small mb-2">{card.title}</h6>
                  <h3 className="fw-bold mb-0">{card.value}</h3>
                </div>
                <div>{card.icon}</div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </div>

      {/* Companies Overview */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold mb-0">Companies Overview</h5>
        <Button
          variant="outline-primary"
          className="rounded-pill fw-semibold px-4 py-1"
          size="sm"
          onClick={() => navigate('/admin/companies')}
        >
          Explore All Companies
        </Button>
      </div>

      <Row className="g-4">
        {companies.map((company) => (
          <Col key={company.company_id} xs={12} sm={6} lg={3}>
            <Card className="rounded-4 border-0 shadow-sm p-4 h-100 company-card transition">
              <div>
                <div className="text-muted small fw-semibold mb-2">COMPANY</div>
                <h5 className="fw-bold text-dark">{company.company_name}</h5>
                <div className="text-secondary mb-4">
                  <strong>{company.device_count}</strong> devices installed
                </div>
              </div>
              <Button
                variant="outline-dark"
                className="w-100 rounded-pill fw-semibold"
                onClick={() => navigate(`/admin/companies/${company.company_id}`)}
              >
                Explore Company
              </Button>
            </Card>
          </Col>
        ))}
      </Row>

      <style>{`
        .company-card:hover {
          transform: translateY(-4px);
          transition: all 0.2s ease-in-out;
        }
        .company-card:hover .btn {
          background-color: #45C8C2;
          border-color: #45C8C2;
          color: white;
        }
      `}</style>
    </div>
  );
}
