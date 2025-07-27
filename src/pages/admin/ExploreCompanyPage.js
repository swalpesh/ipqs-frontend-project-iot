import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminDevicePreview from '../../components/admin/AdminDevicePreview';
import { Spinner, Card, Row, Col } from 'react-bootstrap';

export default function ExploreCompanyPage() {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(true);
  const [companyProfile, setCompanyProfile] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');

    // Fetch Company Devices (for Name)
    fetch(`${process.env.REACT_APP_API_BASE_URL}/admin/devices/company/${companyId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (res.status === 401) {
          localStorage.clear();
          window.location.href = '/login';
          return;
        }
        return res.json();
      })
      .then((data) => {
        setCompanyName(data.devices?.[0]?.company_name || companyId);
      })
      .catch((err) => {
        console.error('Error fetching company name:', err);
      });

    // Fetch Company Profile
    fetch(`${process.env.REACT_APP_API_BASE_URL}/admin/company/profile/${companyId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (res.status === 401) {
          localStorage.clear();
          window.location.href = '/login';
          return;
        }
        return res.json();
      })
      .then((data) => {
        setCompanyProfile(data.company);
      })
      .catch((err) => {
        console.error('Error fetching company profile:', err);
      })
      .finally(() => setLoading(false));
  }, [companyId]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <h4 className="fw-bold mb-0">{companyName}</h4>
      </div>

      {/* Device Preview */}
      <div className="mb-4">
        <AdminDevicePreview companyId={companyId} search={search} />
      </div>

      {/* Profile Card (below device section) */}
      {companyProfile && (
        <Card className="shadow-sm rounded-4 p-4 bg-white border-0 w-100">
          <h5 className="text-primary fw-semibold mb-4">Company Profile</h5>
          <Row className="mb-2">
            <Col xs={5} sm={3} className="fw-semibold text-muted">Name:</Col>
            <Col xs={7} sm={9}>{companyProfile.company_name || '—'}</Col>
          </Row>
          <Row className="mb-2">
            <Col xs={5} sm={3} className="fw-semibold text-muted">Email:</Col>
            <Col xs={7} sm={9}>{companyProfile.company_email || '—'}</Col>
          </Row>
          <Row className="mb-2">
            <Col xs={5} sm={3} className="fw-semibold text-muted">Phone:</Col>
            <Col xs={7} sm={9}>{companyProfile.company_phone || '—'}</Col>
          </Row>
          <Row className="mb-2">
            <Col xs={5} sm={3} className="fw-semibold text-muted">Address:</Col>
            <Col xs={7} sm={9}>{companyProfile.company_address || '—'}</Col>
          </Row>
          <Row className="mb-2">
            <Col xs={5} sm={3} className="fw-semibold text-muted">City:</Col>
            <Col xs={7} sm={9}>{companyProfile.company_city || '—'}</Col>
          </Row>
          <Row className="mb-2">
            <Col xs={5} sm={3} className="fw-semibold text-muted">State:</Col>
            <Col xs={7} sm={9}>{companyProfile.company_state || '—'}</Col>
          </Row>
          <Row className="mb-2">
            <Col xs={5} sm={3} className="fw-semibold text-muted">Country:</Col>
            <Col xs={7} sm={9}>{companyProfile.company_country || '—'}</Col>
          </Row>
          <Row className="mb-2">
            <Col xs={5} sm={3} className="fw-semibold text-muted">Status:</Col>
            <Col xs={7} sm={9}>
              <span className={`badge ${companyProfile.company_status === 'active' ? 'bg-success' : 'bg-danger'}`}>
                {companyProfile.company_status}
              </span>
            </Col>
          </Row>
        </Card>
      )}
    </div>
  );
}
