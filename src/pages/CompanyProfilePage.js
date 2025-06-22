import React, { useEffect, useState } from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import Avatar from '@mui/material/Avatar';

export default function CompanyProfilePage() {
  const [company, setCompany] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`${process.env.REACT_APP_API_BASE_URL}/company/dashboard`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        setCompany(data.company);
      })
      .catch(err => {
        console.error('Failed to fetch company dashboard:', err);
      });
  }, []);

  if (!company) {
    return <div className="text-center mt-5">Loading Company Profile...</div>;
  }

  // ✅ Safe to compute only after company is available
  const startDate = new Date(company.created_at);
  const endDate = new Date(startDate);
  endDate.setFullYear(endDate.getFullYear() + 1);
  const formatDate = (date) => date.toISOString().split('T')[0];

  const subscription = {
    plan: "Premium Tier",
    start: formatDate(startDate),
    end: formatDate(endDate),
    frequency: "N/A",
    cost: "N/A",
    autoRenew: true,
  };

  return (
    <div className="container py-4">
      <Row className="g-4">
        {/* LEFT PANEL */}
        <Col md={4}>
          <Card
            className="rounded-4 border-0 shadow-sm text-start"
            style={{ height: '100%', padding: '2rem 2.5rem' }}
          >
            <div className="d-flex flex-column align-items-start">
              <Avatar
                sx={{
                  width: 90,
                  height: 90,
                  fontSize: 36,
                  fontWeight: 'bold',
                  bgcolor: '#ADD8E6',
                  color: 'white',
                  marginBottom: '1rem',
                }}
              >
                {company.company_name.charAt(0).toUpperCase()}
              </Avatar>

              <h5 className="fw-bold mb-1">{company.company_id}</h5>
              <div className="text-muted mb-3 small">{company.company_name}</div>

              <hr className="w-100" />

              <div className="w-100">
                <div className="mb-3">
                  <strong className="d-block text-muted small">Company ID</strong>
                  <span>{company.company_id}</span>
                </div>

                <div className="mb-3">
                  <strong className="d-block text-muted small">Status</strong>
                  <span className={company.company_status === 'active' ? 'text-success fw-semibold' : 'text-danger fw-semibold'}>
                    {company.company_status.toUpperCase()}
                  </span>
                </div>

                <div className="mb-3">
                  <strong className="d-block text-muted small">Username</strong>
                  <span>{company.company_username}</span>
                </div>

                <div className="mb-3">
                  <strong className="d-block text-muted small">Email</strong>
                  <span>{company.company_email}</span>
                </div>

                <div>
                  <strong className="d-block text-muted small">Phone</strong>
                  <span>{company.company_phone}</span>
                </div>
              </div>
            </div>
          </Card>
        </Col>

        {/* RIGHT PANEL */}
        <Col md={8}>
          {/* Company Info Card */}
          <Card className="p-4 rounded-4 border-0 shadow-sm">
            <h5 className="fw-bold mb-3 border-bottom pb-2">Company Information</h5>
            <Row className="mb-3">
              <Col md={6}>
                <label className="text-muted small">Company Address</label>
                <div>{company.company_address}</div>
              </Col>
              <Col md={6}>
                <label className="text-muted small">City / State</label>
                <div>{company.company_city}, {company.company_state}</div>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <label className="text-muted small">Country</label>
                <div>{company.company_country}</div>
              </Col>
              <Col md={6}>
                <label className="text-muted small">Username</label>
                <div>{company.company_username}</div>
              </Col>
            </Row>
          </Card>

          {/* Subscription Info Card */}
          <Card className="p-4 rounded-4 border-0 shadow-sm mt-4">
            <h5 className="fw-bold mb-3 border-bottom pb-2">Subscription Details</h5>
            <Row className="mb-3">
              <Col md={6}>
                <label className="text-muted small">Plan</label>
                <div>{subscription.plan}</div>
              </Col>
              <Col md={6}>
                <label className="text-muted small">Start Date</label>
                <div>{subscription.start}</div>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <label className="text-muted small">End Date</label>
                <div>{subscription.end}</div>
              </Col>
              <Col md={6}>
                <label className="text-muted small">Billing Frequency</label>
                <div>{subscription.frequency}</div>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <label className="text-muted small">Total Cost</label>
                <div>{subscription.cost}</div>
              </Col>
              <Col md={6}>
                <label className="text-muted small">Auto Renewal</label>
                <div className={subscription.autoRenew ? 'text-success fw-semibold' : 'text-danger fw-semibold'}>
                  {subscription.autoRenew ? 'Enabled' : 'Disabled'}
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
