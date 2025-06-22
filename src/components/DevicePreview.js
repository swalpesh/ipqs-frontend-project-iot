import React, { useEffect, useState } from 'react';
import { Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';
import io from 'socket.io-client';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import deviceImg from '../assets/solar-panel.png';

const socket = io('http://31.97.9.220:4000');

export default function DevicePreview({ onViewAll, showAll = false }) {
  const navigate = useNavigate();
  const [devices, setDevices] = useState([]);
  const [deviceData, setDeviceData] = useState({});
  const [liveUpdated, setLiveUpdated] = useState({});
  const [pfRanges, setPfRanges] = useState({});
  const role = localStorage.getItem('role');

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`${process.env.REACT_APP_API_BASE_URL}/company/devices`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setDevices(data.devices));

    fetch(`${process.env.REACT_APP_API_BASE_URL}/admin/devices/pf-ranges`, {
    
    })
      .then((res) => res.json())
      .then((data) => {
        const rangeMap = {};
        data.devices.forEach(d => {
          rangeMap[d.device_id] = {
            min: parseFloat(d.min_pf),
            max: parseFloat(d.max_pf)
          };
        });
        setPfRanges(rangeMap);
      });
  }, []);

  useEffect(() => {
    devices.forEach((device) => {
      const eventName = `device-data-${device.device_id}`;
      if (device.status.toLowerCase() !== 'active') return;

      const handleData = (incoming) => {
        setDeviceData((prev) => ({ ...prev, [incoming.device_id]: incoming }));
        setLiveUpdated((prev) => ({ ...prev, [incoming.device_id]: true }));
        setTimeout(() => setLiveUpdated((prev) => ({ ...prev, [incoming.device_id]: false })), 600);
      };

      socket.on(eventName, handleData);
      return () => socket.off(eventName, handleData);
    });
  }, [devices]);

  const handleNavigate = (device) => {
    const status = device.status.toLowerCase();
    if (status === 'closed' && role === 'company') {
      toast.error('Device status is closed. Please contact IPQS support.', {
        position: 'top-right',
        autoClose: 3500,
        theme: 'colored',
      });
      return;
    }
    navigate(`/devices/${device.device_id}`);
  };

  useEffect(() => {
    const currentPath = window.location.pathname;
    const deviceIdFromPath = currentPath.split('/devices/')[1];
    const matchedDevice = devices.find((d) => d.device_id === deviceIdFromPath);
    if (matchedDevice && matchedDevice.status.toLowerCase() === 'closed' && role === 'company') {
      toast.error('Device status is closed. Please contact IPQS support.', {
        position: 'top-right',
        autoClose: 3500,
        theme: 'colored',
      });
      navigate('/');
    }
  }, [devices, role, navigate]);

  const devicesToShow = showAll ? devices : devices.slice(0, 4);

  return (
    <div className="mt-4">
      <ToastContainer />

      {!showAll && (
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold">Connected Devices</h5>
          <Button size="sm" variant="outline-primary" onClick={onViewAll}>
            View All Devices
          </Button>
        </div>
      )}

      <div className="row g-4">
        {devicesToShow.map((device) => {
          const live = deviceData[device.device_id];
          const isLiveAnimating = liveUpdated[device.device_id];
          const isActive = device.status.toLowerCase() === 'active';
          const pf = parseFloat(live?.power_factor ?? 1);

          const pfRange = pfRanges[device.device_id] || { min: 0.999, max: 1.0 };
          const isBadPF = isActive && (pf < pfRange.min || pf > pfRange.max);
          const statusColor = isActive ? 'green' : 'red';

          return (
            <div className="col-12 col-md-12" key={device.device_id}>
              <Card
                className={`rounded-4 border-0 shadow-sm p-3 h-100 ${
                  isBadPF ? 'bg-danger bg-opacity-10' : 'bg-white'
                }`}
                style={{ cursor: 'pointer', transition: 'transform 0.2s ease-in-out' }}
                onClick={() => handleNavigate(device)}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.015)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                <Card.Body className="d-flex flex-column justify-content-between">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h6 className="fw-semibold mb-2">{device.device_id}</h6>
                      <span
                        className="fw-semibold mb-1"
                        style={{ color: statusColor, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                      >
                        <span
                          style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: statusColor, display: 'inline-block', animation: isLiveAnimating ? 'pulse 0.6s ease-in-out' : 'none' }}
                        />
                        {device.status}
                      </span>
                      <h4 className="fw-bold mt-2">{isActive ? (live?.power_factor ?? '--') : '--'} PF</h4>
                      <div className="small">
                        CURRENT <span className="text-danger fw-semibold">{isActive ? (live?.current ?? '--') : '--'} A</span> &nbsp;
                        VOLTAGE <span className="text-primary fw-semibold">{isActive ? (live?.voltage ?? '--') : '--'} V</span>
                      </div>
                      <div className="text-muted txt-inst">
                        Installed On: {new Date(device.created_at).toLocaleDateString('en-GB')}
                      </div>
                    </div>

                    <img src={deviceImg} alt="device" style={{ width: 80, objectFit: 'contain', marginLeft: '10px', filter: 'drop-shadow(0px 2px 5px rgba(0,0,0,0.2))' }} />
                  </div>

                  <div className="d-flex justify-content-between bg-light rounded-3 px-3 py-2 mt-3">
                    <div className="d-flex align-items-center gap-2">
                      <BatteryChargingFullIcon className="text-success nnn" />
                      <div>
                        <div className="fw-bold">{isActive ? (live?.kw ?? '--') : '--'}</div>
                        <small className="text-muted">TOTAL kw</small>
                      </div>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <BatteryChargingFullIcon className="text-success nnn" />
                      <div>
                        <div className="fw-bold">{isActive ? (live?.kvar ?? '--') : '--'}</div>
                        <small className="text-muted">TOTAL Kvar</small>
                      </div>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <BatteryChargingFullIcon className="text-success nnn" />
                      <div>
                        <div className="fw-bold">{isActive ? (live?.kvarhlag ?? '--') : '--'}</div>
                        <small className="text-muted">Kvarh (Lag)</small>
                      </div>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <BatteryChargingFullIcon className="text-success nnn" />
                      <div>
                        <div className="fw-bold">{isActive ? (live?.kvarhlead ?? '--') : '--'}</div>
                        <small className="text-muted">Kvarh (Lead)</small>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </div>
          );
        })}
      </div>

      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.8); opacity: 0.5; }
            100% { transform: scale(1); opacity: 1; }
          }
        `}
      </style>
    </div>
  );
}
