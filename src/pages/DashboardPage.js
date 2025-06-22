import React, { useEffect, useState } from 'react';
import axios from 'axios';
import MySummaryCards from '../components/MySummaryCards';
import PendingAlerts from '../components/PendingAlerts';
import { useNavigate } from 'react-router-dom';
import DevicePreview from '../components/DevicePreview';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [companyName, setCompanyName] = useState('');
  const [companyId, setCompanyId] = useState('');

  const handleViewAll = () => navigate('/devices');

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/company/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const name = response.data?.company?.company_name;
        const id = response.data?.company?.company_id;
        setCompanyName(name);
        setCompanyId(id);
      } catch (error) {
        console.error('Error fetching company info:', error);
      }
    };

    fetchCompany();
  }, []);

  return (
    <div className="container-fluid mt-4 px-3">
      <div className="row g-4 align-items-start">
        {/* LEFT SIDE */}
        <div className="col-12 col-lg-8">
          <div className="mb-3">
            <h2 className="fw-bold" style={{ fontSize: '2rem', color: '#212529' }}>
              Welcome, <span style={{ color: '#1e88e5' }}>{companyName}</span>!
            </h2>
            <p className="text-muted" style={{ fontSize: '1rem' }}>
              Here’s a quick summary of your connected devices and recent alerts.
            </p>
          </div>

          {/* Summary Cards + Devices */}
          <div className="mb-4">
            <MySummaryCards />
          </div>

          {/* Device Cards */}
          <DevicePreview onViewAll={handleViewAll} />
        </div>

        {/* RIGHT SIDE: Notifications */}
        <div className="col-12 col-lg-4">
          <div
            style={{
              maxHeight: '550px',
              overflowY: 'auto',
              paddingRight: '6px'
            }}
            className='notification-panel'
          >
            <PendingAlerts companyId={companyId} />
          </div>
        </div>
      </div>
    </div>
  );
}
