import React, { useEffect, useState } from 'react';
import { Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';
import SolarPowerIcon from '@mui/icons-material/SolarPower';
import deviceImg from '../../assets/solar-panel.png';
import io from 'socket.io-client';

const socket = io('http://31.97.9.220:4000'); // Adjust for production

export default function AdminDevicePreview({ companyId }) {
  const navigate = useNavigate();
  const [devices, setDevices] = useState([]);
  const [liveData, setLiveData] = useState({});
  const [liveAnimating, setLiveAnimating] = useState({});
  const [pfRanges, setPfRanges] = useState({});

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`${process.env.REACT_APP_API_BASE_URL}/admin/devices/company/${companyId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (res.status === 401) {
          localStorage.clear();
          window.location.href = '/login';
        }
        return res.json();
      })
      .then(data => setDevices(data.devices || []))
      .catch(err => console.error('Error fetching company devices:', err));
  }, [companyId]);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_BASE_URL}/admin/devices/pf-ranges`)
      .then(res => res.json())
      .then(data => {
        const rangeMap = {};
        data.devices.forEach(({ device_id, min_pf, max_pf }) => {
          rangeMap[device_id] = {
            min: parseFloat(min_pf),
            max: parseFloat(max_pf),
          };
        });
        setPfRanges(rangeMap);
      })
      .catch(err => console.error('Error fetching PF ranges:', err));
  }, []);

  useEffect(() => {
    if (!devices.length) return;

    devices.forEach((device) => {
      const eventName = `device-data-${device.device_id}`;

      const handleLiveData = (incoming) => {
        setLiveData((prev) => ({
          ...prev,
          [incoming.device_id]: incoming,
        }));

        setLiveAnimating((prev) => ({
          ...prev,
          [incoming.device_id]: true,
        }));

        setTimeout(() => {
          setLiveAnimating((prev) => ({
            ...prev,
            [incoming.device_id]: false,
          }));
        }, 600);
      };

      socket.on(eventName, handleLiveData);
      return () => socket.off(eventName, handleLiveData);
    });
  }, [devices]);

  const handleNavigate = (id) => {
    navigate(`/admindevices/${id}`);
  };

  return (
    <div className="row g-4">
      {devices.map((device) => {
        const live = liveData[device.device_id] || {};
        const animate = liveAnimating[device.device_id];
        const isActive = device.status === 'active';
        const statusColor = isActive ? 'green' : 'red';
        const pf = parseFloat(live?.power_factor);
        const pfMin = pfRanges[device.device_id]?.min ?? 0.999;
        const pfMax = pfRanges[device.device_id]?.max ?? 1.0;
        const pfAlert = pf && (pf < pfMin || pf > pfMax);

        return (
          <div className="col-12 col-md-6" key={device.device_id}>
            <Card
              className={`rounded-4 border-0 shadow-sm p-3 h-100 ${pfAlert ? 'bg-danger bg-opacity-10' : 'bg-white'}`}
              onClick={() => {
                if (isActive) {
                  handleNavigate(device.device_id);
                }
              }}
              title={!isActive ? 'Device is closed. Contact Superadmin to reactivate.' : ''}
              style={{
                cursor: isActive ? 'pointer' : 'not-allowed',
                transition: 'transform 0.2s ease-in-out',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.015)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <Card.Body className="d-flex flex-column justify-content-between">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h6 className="fw-semibold mb-2">{device.device_name}</h6>
                    <span
                      className="fw-semibold mb-1"
                      style={{
                        color: statusColor,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        fontWeight: 600,
                      }}
                    >
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: statusColor,
                          display: 'inline-block',
                          animation: animate ? 'pulse 0.6s ease-in-out' : 'none',
                        }}
                      />
                      {device.status}
                    </span>
                    <h4 className="fw-bold mt-2">{live?.power_factor ?? '--'} PF</h4>
                    <div className="small">
                      CURRENT <span className="text-danger fw-semibold">{live?.current ?? '--'} A</span> &nbsp;
                      VOLTAGE <span className="text-primary fw-semibold">{live?.voltage ?? '--'} V</span>
                    </div>
                    <div className="text-muted txt-inst">
                      Installed On: {new Date(device.created_at).toLocaleDateString('en-GB')}
                    </div>
                  </div>

                  <img
                    src={deviceImg}
                    alt="device"
                    style={{
                      width: 80,
                      height: 'auto',
                      objectFit: 'contain',
                      marginLeft: '10px',
                      filter: 'drop-shadow(0px 2px 5px rgba(0,0,0,0.2))',
                    }}
                  />
                </div>

                <div className="d-flex justify-content-between bg-light rounded-3 px-3 py-2 mt-3">
                  <div className="d-flex align-items-center gap-2">
                    <div>
                      <div className="fw-bold">{live?.kw ?? '--'}</div>
                      <small className="text-muted">TOTAL kw</small>
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    <div>
                      <div className="fw-bold">{live?.kvar ?? '--'}</div>
                      <small className="text-muted">TOTAL Kvar</small>
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    <div>
                      <div className="fw-bold">{live?.kvarhlag ?? '--'}</div>
                      <small className="text-muted">Kvarh (Lag)</small>
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    <div>
                      <div className="fw-bold">{live?.kvarhlead ?? '--'}</div>
                      <small className="text-muted">Kvarh (Lead)</small>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </div>
        );
      })}

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
