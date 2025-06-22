import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import MainCards from '../components/MainCards';
import PerformanceChart from '../components/PerformanceChart';
import MonthlyGeneration from '../components/MonthlyGeneration';
import SolarEfficiencyCard from '../components/SolarEfficiencyCard';
import DeviceInfoCard from '../components/DeviceInfoCard';
import DeviceDataTable from '../components/DeviceDataTable';

export default function DeviceDetailPage() {
  const { device_id } = useParams(); // ✅ Extracted from URL
  const navigate = useNavigate();

  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const role = localStorage.getItem('role');

  useEffect(() => {
    const token = localStorage.getItem('token');

    fetch(`${process.env.REACT_APP_API_BASE_URL}/company/devices`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const targetDevice = data.devices.find(d => d.device_id === device_id);
        if (!targetDevice) {
          toast.error('Device not found.');
          navigate('/');
          return;
        }

        setStatus(targetDevice.status);
        setLoading(false);

        // 🚫 Block company from viewing closed device
        if (targetDevice.status === 'closed' && role === 'company') {
          toast.error('Device is closed. Please contact IPQS.', { autoClose: 3000 });
          navigate('/user');
        }
      })
      .catch(() => {
        toast.error('Failed to fetch device data.');
        navigate('/user');
      });
  }, [device_id, role, navigate]);

  if (loading) return null;

  return (
    <div
      className="device-detail-wrapper"
      style={{
        backgroundColor: '#f8f9fa',
        minHeight: 'calc(100vh - 56px)',
        overflowY: 'auto',
        overflowX: 'hidden',
      }}
    >
      {/* Cards */}
      <div className="row g-3">
        <div className="col-12 col-xl-8">
          <MainCards device_id={device_id} />
        </div>
        <div className="col-12 col-xl-4">
          <SolarEfficiencyCard />
          <DeviceInfoCard />
        </div>
      </div>

      {/* Performance */}
      <div className="row g-3 mt-3">
        <div className="col-12 col-md-6 performance-card">
          <PerformanceChart device_id={device_id}/>
        </div>
        <div className="col-12 col-md-6">
          <MonthlyGeneration device_id={device_id}/>
        </div>
      </div>

      {/* Table */}
      <div className="row g-3 mt-3">
        <div className="col-12">
          <DeviceDataTable device_id={device_id}/>
        </div>
      </div>
    </div>
  );
}
