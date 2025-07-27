import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, OverlayTrigger, Tooltip, Form } from 'react-bootstrap';
import io from 'socket.io-client';
import DataTable from 'react-data-table-component';
import { toast } from 'react-toastify';

const socket = io("https://ipqsoms.com", {
  path: "/socket.io",
  transports: ["websocket"],
});

export default function Adminalldevices() {
  const [devices, setDevices] = useState([]);
  const [liveData, setLiveData] = useState({});
  const [notifiedDevices, setNotifiedDevices] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [pfRanges, setPfRanges] = useState([]);
  const navigate = useNavigate();

  // Fetch registered devices
  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`${process.env.REACT_APP_API_BASE_URL}/admin/devices`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setDevices(data.devices || []))
      .catch(err => console.error('Error fetching devices:', err));
  }, []);

  // Fetch PF ranges
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_BASE_URL}/admin/devices/pf-ranges`)
      .then(res => res.json())
      .then(data => {
        setPfRanges(data.devices || []);
        console.log('PF Ranges:', data.devices);
      })
      .catch(err => console.error('Error fetching PF ranges:', err));
  }, []);

  // MQTT Data Listener
  useEffect(() => {
    if (!devices.length) return;

    devices.forEach(device => {
      const eventName = `device-data-${device.device_id}`;

      const handleData = (incoming) => {
        const pf = parseFloat(incoming.power_factor);
        const pfRange = pfRanges.find(d => d.device_id === incoming.device_id);
        const min = parseFloat(pfRange?.min_pf || 0.999);
        const max = parseFloat(pfRange?.max_pf || 1.000);
        const isOutOfRange = pf < min || pf > max;

        if (isOutOfRange && !notifiedDevices.includes(incoming.device_id)) {
          // toast.warn(`⚠️ Power Factor out of range for Device ID: ${incoming.device_id}`);
          setNotifiedDevices(prev => [...prev, incoming.device_id]);
        }

        setLiveData(prev => ({
          ...prev,
          [incoming.device_id]: incoming,
        }));
      };

      socket.on(eventName, handleData);
      return () => socket.off(eventName, handleData); // Cleanup
    });
  }, [devices, pfRanges, notifiedDevices]);

  const renderPFCell = (row) => {
  const pf = parseFloat(liveData[row.device_id]?.power_factor);
  const showAlert = pf && (pf < parseFloat(pfRanges[row.device_id]?.min_pf ?? 0.96) || pf > parseFloat(pfRanges[row.device_id]?.max_pf ?? 1.2));
  const pfText = pf?.toFixed(3) ?? '--';  // ✅ display with 3 decimals

  if (showAlert) {
    return (
      <OverlayTrigger
        placement="top"
        overlay={
          <Tooltip id={`tooltip-${row.device_id}`}>
            Power Factor Alert for Device ID: {row.device_id}. Please note.
          </Tooltip>
        }
      >
        <span className="text-danger fw-bold">{pfText}</span>
      </OverlayTrigger>
    );
  }

  return pfText;
};


  const columns = [
    { name: 'Device ID', selector: row => row.device_id, sortable: true },
    { name: 'Company', selector: row => row.company_name, sortable: true },
    { name: 'kW', selector: row => liveData[row.device_id]?.kw ?? '--', sortable: true },
    { name: 'kWh', selector: row => liveData[row.device_id]?.kwh ?? '--', sortable: true },
    { name: 'Kvarh (Lag)', selector: row => liveData[row.device_id]?.kvarhlag ?? '--', sortable: true },
    { name: 'Kvarh (Lead)', selector: row => liveData[row.device_id]?.kvarhlead ?? '--', sortable: true },
    { name: 'kVAh', selector: row => liveData[row.device_id]?.kvah ?? '--', sortable: true },
    { name: 'kVAR', selector: row => liveData[row.device_id]?.kvar ?? '--', sortable: true },
    {
      name: 'PF',
      selector: row => renderPFCell(row),
      sortable: true,
      center: true,
    }
  ];

  const conditionalRowStyles = [
    {
      when: row => {
        const pf = parseFloat(liveData[row.device_id]?.power_factor);
        const pfRange = pfRanges.find(d => d.device_id === row.device_id);
        const min = parseFloat(pfRange?.min_pf || 0.999);
        const max = parseFloat(pfRange?.max_pf || 1.000);
        return pf && (pf < min || pf > max);
      },
      style: {
        backgroundColor: 'rgba(255, 0, 0, 0.1)',
      },
    },
  ];

  const handleRowClicked = (row) => {
    navigate(`/admindevices/${row.device_id}`);
  };

  const filteredDevices = devices.filter((device) =>
    device.device_id.toLowerCase().includes(searchText.toLowerCase()) ||
    device.company_name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="container-fluid py-4">
      <Card className="p-3 border-0 shadow-sm rounded-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3">
          <h5 className="fw-bold mb-2 mb-md-0">All Devices Overview</h5>
          <Form.Control
            type="text"
            placeholder="Search by Device ID or Company..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-100 w-md-auto"
            style={{ maxWidth: 300 }}
          />
        </div>

        <div style={{ overflowX: 'auto' }}>
          <DataTable
            columns={columns}
            data={filteredDevices}
            pagination
            highlightOnHover
            striped
            responsive
            onRowClicked={handleRowClicked}
            conditionalRowStyles={conditionalRowStyles}
          />
        </div>
      </Card>
    </div>
  );
}
