import React, { useEffect, useState } from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import deviceImg from '../../assets/solar-panel.png'; // Make sure this path is correct for your project
import io from 'socket.io-client';

const socket = io("https://ipqsoms.com", {
  path: "/socket.io",
  transports: ["websocket"],
});

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

  // Helper function to safely format numbers and prevent layout breaks
  const formatNumber = (val, decimals = 2) => {
    if (val === null || val === undefined || isNaN(val)) return '--';
    return Number(val).toFixed(decimals);
  };

  return (
    <div className="row g-4">
      {devices.map((device) => {
        const live = liveData[device.device_id] || {};
        const animate = liveAnimating[device.device_id];
        const isActive = device.status === 'active';
        const statusColor = isActive ? '#198754' : '#dc3545'; // Bootstrap success/danger greens and reds
        const pf = parseFloat(live?.power_factor);
        const pfMin = pfRanges[device.device_id]?.min ?? 0.999;
        const pfMax = pfRanges[device.device_id]?.max ?? 1.0;
        const pfAlert = pf && (pf < pfMin || pf > pfMax);

        return (
          <div className="col-12 col-md-6 col-xl-4" key={device.device_id}>
            <Card
              className={`rounded-4 border-0 shadow-sm h-100 device-card ${pfAlert ? 'bg-danger bg-opacity-10' : 'bg-white'}`}
              onClick={() => {
                if (isActive) {
                  handleNavigate(device.device_id);
                }
              }}
              title={!isActive ? 'Device is closed. Contact Superadmin to reactivate.' : ''}
              style={{
                cursor: isActive ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <Card.Body className="p-4 d-flex flex-column justify-content-between">
                
                {/* Header: Title, Status, and Image */}
                <div className="d-flex justify-content-between align-items-start mb-4">
                  <div>
                    <h5 className="fw-bold mb-2 text-dark">{device.device_name}</h5>
                    <div
                      className="fw-bold small"
                      style={{
                        color: statusColor,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <span
                        style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          backgroundColor: statusColor,
                          display: 'inline-block',
                          animation: animate ? 'pulse 0.6s ease-in-out' : 'none',
                        }}
                      />
                      {device.status}
                    </div>
                  </div>
                  <img
                    src={deviceImg}
                    alt="device"
                    style={{
                      width: '75px',
                      height: 'auto',
                      objectFit: 'contain',
                      filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.15))',
                    }}
                  />
                </div>

                {/* Main Metric: Power Factor (Limited to 4 decimals) */}
                <h2 className="fw-black text-dark mb-4" style={{ fontSize: '2.5rem', fontWeight: '800' }}>
                  {formatNumber(live?.power_factor, 4)} <span className="fs-4 text-muted fw-bold">PF</span>
                </h2>
                
                {/* Secondary Metrics: Current & Voltage */}
                <div className="mb-4">
                  <div className="mb-3">
                    <div className="text-uppercase text-muted small fw-bold" style={{ letterSpacing: '1px', fontSize: '0.75rem' }}>Current</div>
                    <div className="text-danger fw-bold fs-5">{formatNumber(live?.current, 3)} A</div>
                  </div>
                  <div>
                    <div className="text-uppercase text-muted small fw-bold" style={{ letterSpacing: '1px', fontSize: '0.75rem' }}>Voltage</div>
                    <div className="text-primary fw-bold fs-5">{formatNumber(live?.voltage, 4)} V</div>
                  </div>
                </div>
                
                {/* Installed Date */}
                <div className="mb-4">
                  <div className="text-muted small">Installed On:</div>
                  <div className="fw-medium text-dark">{new Date(device.created_at).toLocaleDateString('en-GB')}</div>
                </div>

                {/* FIXED LAYOUT: 2x2 Responsive Bottom Grid */}
                <div className="bg-light rounded-4 p-3 mt-auto">
                  <Row className="g-3">
                    <Col xs={6}>
                      <div className="fw-bold fs-5 text-dark">{formatNumber(live?.kw, 2)}</div>
                      <div className="text-muted text-uppercase fw-semibold" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>TOTAL kw</div>
                    </Col>
                    <Col xs={6}>
                      <div className="fw-bold fs-5 text-dark">{formatNumber(live?.kvar, 2)}</div>
                      <div className="text-muted text-uppercase fw-semibold" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>TOTAL Kvar</div>
                    </Col>
                    <Col xs={6}>
                      <div className="fw-bold fs-5 text-dark">{formatNumber(live?.kvarhlag, 2)}</div>
                      <div className="text-muted text-uppercase fw-semibold" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>Kvarh (Lag)</div>
                    </Col>
                    <Col xs={6}>
                      <div className="fw-bold fs-5 text-dark">{formatNumber(live?.kvarhlead, 2)}</div>
                      <div className="text-muted text-uppercase fw-semibold" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>Kvarh (Lead)</div>
                    </Col>
                  </Row>
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
            50% { transform: scale(1.6); opacity: 0.7; }
            100% { transform: scale(1); opacity: 1; }
          }
          
          .device-card:hover {
            transform: translateY(-5px) !important;
            box-shadow: 0 .5rem 1rem rgba(0,0,0,.15)!important;
          }
          
          .fw-black {
            font-weight: 900;
          }
        `}
      </style>
    </div>
  );
}