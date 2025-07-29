// AdminDashboard.js
import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Button, Spinner } from 'react-bootstrap';
import BusinessIcon from '@mui/icons-material/Business';
import DevicesIcon from '@mui/icons-material/Devices';
import SubscriptionsIcon from '@mui/icons-material/Description';
import { useNavigate } from 'react-router-dom';
import DeviceImage from '../../assets/solar-panel.png';
import io from 'socket.io-client';

const socket = io("https://ipqsoms.com", {
  path: "/socket.io",
  transports: ["websocket"],
});

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [totalCompanies, setTotalCompanies] = useState(0);
  const [totalDevices, setTotalDevices] = useState(0);
  const [topCompanies, setTopCompanies] = useState([]);
  const [liveData, setLiveData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    const fetchData = async () => {
      try {
        const [companiesRes, devicesRes, topPerformingRes] = await Promise.all([
          fetch(`${process.env.REACT_APP_API_BASE_URL}/admin/companies/devices`, { headers }),
          fetch(`${process.env.REACT_APP_API_BASE_URL}/admin/devices`, { headers }),
          fetch(`${process.env.REACT_APP_API_BASE_URL}/admin/top-performing-companies`, { headers })
        ]);

        if (
          companiesRes.status === 401 ||
          devicesRes.status === 401 ||
          topPerformingRes.status === 401
        ) {
          localStorage.clear();
          window.location.href = '/login';
          return;
        }

        const companiesData = await companiesRes.json();
        const devicesData = await devicesRes.json();
        const topCompaniesData = await topPerformingRes.json();

        setTotalCompanies(companiesData.total_companies || 0);
        setTotalDevices(devicesData.total_devices || 0);
        setTopCompanies(topCompaniesData || []);

        topCompaniesData.forEach(company => {
          company.devices.forEach(device => {
            const eventName = `device-data-${device.device_id}`;
            socket.on(eventName, (data) => {
              console.log('🔌 Live update:', data);
              setLiveData(prev => ({ ...prev, [data.device_id]: data }));
            });
            console.log(`📡 Subscribing to ${eventName}`);
          });
        });
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
      <div className="row mt-2 mb-3">
        <h1>Welcome Admin!</h1>
      </div>

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

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold mb-0">Top Performing Companies</h5>
        
      </div>

      <Row className="g-4">
        {topCompanies.length === 0 ? (
          <p className="text-muted">No top performing companies found.</p>
        ) : (
          topCompanies.map((company) => (
            <Col xs={12} sm={12} md={6} lg={6} key={company.company_id}>
              <Card className="rounded-4 border-0 shadow-sm p-4 h-100 position-relative">
                <div>
                  <h4 className="text-primary fw-bold mb-2">{company.company_name}</h4>

                  {company.devices.length > 0 ? (
                    company.devices.map((device) => {
                      const live = liveData[device.device_id] || {};
                      return (
                        <div key={device.device_id}>
                          <div className="text-muted small fw-semibold mb-1">Device ID: {device.device_id}</div>
                          <div className="text-success fw-bold mb-2">● Active</div>
                          <h2 className="fw-bold text-dark">{live.kw ?? '--'} kW</h2>
                          <p className="mb-1 text-muted small">
                            <strong>Current:</strong> {live.current ?? '--'} A &nbsp;&nbsp;&nbsp;
                            <strong>Voltage:</strong> {live.voltage ?? '--'} V
                          </p>

                          <Row className="gy-2 mt-3">
                            <Col xs={6} md={4}>
                              <div className="border rounded p-2 text-center shadow-sm bg-light">
                                <div className="small text-muted">KWh</div>
                                <div className="fw-bold">{live.kwh ?? '--'}</div>
                              </div>
                            </Col>
                            <Col xs={6} md={4}>
                              <div className="border rounded p-2 text-center shadow-sm bg-light">
                                <div className="small text-muted">Kvar</div>
                                <div className="fw-bold">{live.kvar ?? '--'}</div>
                              </div>
                            </Col>
                            <Col xs={6} md={4}>
                              <div className="border rounded p-2 text-center shadow-sm bg-light">
                                <div className="small text-muted">KVAh</div>
                                <div className="fw-bold">{live.kvah ?? '--'}</div>
                              </div>
                            </Col>
                            <Col xs={6} md={6}>
                              <div className="border rounded p-2 text-center shadow-sm bg-light">
                                <div className="small text-muted">Kvarh Lag</div>
                                <div className="fw-bold">{live.kvarhlag ?? '--'}</div>
                              </div>
                            </Col>
                            <Col xs={6} md={6}>
                              <div className="border rounded p-2 text-center shadow-sm bg-light">
                                <div className="small text-muted">Kvarh Lead</div>
                                <div className="fw-bold">{live.kvarhlead ?? '--'}</div>
                              </div>
                            </Col>
                          </Row>

                          <div className="mt-4">
                            <div className="fw-semibold text-muted mb-1">Power Factor</div>
                            <div className="position-relative" style={{ height: '25px' }}>
                              <div
                                className="position-absolute top-0 start-0 w-100 h-100 rounded"
                                style={{
                                  background: 'linear-gradient(to right, #ff0000 0%, #ffa500 25%, #00cc00 50%, #ffa500 75%, #ff0000 100%)',
                                }}
                              ></div>
                              <div
                                className="position-absolute top-50 translate-middle-y"
                                style={{
                                  left: `${Math.min(Math.max(((live.power_factor ?? 0) - 0.8) / 0.4, 0), 1) * 100}%`,
                                  width: '4px',
                                  height: '30px',
                                  backgroundColor: '#333',
                                }}
                              />
                              <div className="position-absolute top-50 translate-middle-y text-center w-100">
                                <strong>{ typeof live.power_factor === 'number' ? live.power_factor.toFixed(3) : '--' }</strong>
                              </div>
                            </div>
                          </div>

                          <hr className="my-4" />
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-muted">No devices assigned.</div>
                  )}
                </div>
                <img
                  src={DeviceImage}
                  alt="device"
                  style={{ width: 100, position: 'absolute', top: 50, right: 30 }}
                />
              </Card>
            </Col>
          ))
        )}
      </Row>
    </div>
  );
}
