import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card } from 'react-bootstrap';
import DevicesIcon from '@mui/icons-material/Devices';
import GroupIcon from '@mui/icons-material/Groups';

export default function MySummaryCards() {
  const [deviceCount, setDeviceCount] = useState(0);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/company/devices`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const count = response.data?.total_devices || 0;
        setDeviceCount(count);
      } catch (error) {
        console.error('Failed to fetch device count:', error);
        setDeviceCount(0);
      }
    };

    fetchDevices();
  }, []);

  const infoCards = [
    {
      id: 1,
      title: 'My Devices',
      value: `${deviceCount} Devices`,
      icon: <DevicesIcon style={{ color: '#2196f3', fontSize: 28 }} />,
      valueColor: 'text-primary',
      bg: 'rgba(33, 150, 243, 0.05)'
    },
    {
      id: 2,
      title: 'My Groups',
      value: 'Coming Soon',
      icon: <GroupIcon style={{ color: '#4caf50', fontSize: 28 }} />,
      valueColor: 'text-danger',
      bg: 'rgba(76, 175, 80, 0.05)'
    }
  ];

  return (
    <div className="row g-3">
      {infoCards.map((card) => (
        <div key={card.id} className="col-12 col-sm-6 col-md-6">
          <Card className="border-0 shadow-sm rounded-4 p-3 h-100" style={{ background: card.bg }}>
            <div className="d-flex align-items-center gap-3">
              <div
                className="d-flex justify-content-center align-items-center rounded-circle"
                style={{
                  backgroundColor: 'white',
                  width: 50,
                  height: 50,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                }}
              >
                {card.icon}
              </div>
              <div>
                <small className="text-muted fw-medium">{card.title}</small>
                <div className={`fw-bold fs-5 ${card.valueColor}`}>{card.value}</div>
              </div>
            </div>
          </Card>
        </div>
      ))}
    </div>
  );
}
