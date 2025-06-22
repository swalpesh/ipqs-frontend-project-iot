import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminDevicePreview from '../../components/admin/AdminDevicePreview';
import { Button, Spinner } from 'react-bootstrap';

export default function ExploreCompanyPage() {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
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
      {/* Header: Company Name + Profile Button */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <h4 className="fw-bold mb-0">{companyName}</h4>
        {/* <Button
          variant="outline-primary"
          className="rounded-pill"
          onClick={() => navigate('/admincompanyprofile')}
        >
          View Company Profile
        </Button> */}
      </div>

      {/* Search Input */}
      {/* <input
        type="text"
        className="form-control mb-4"
        placeholder="Search devices..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      /> */}

      {/* Device Cards with Live Data */}
      <AdminDevicePreview companyId={companyId} search={search} />
    </div>
  );
}
