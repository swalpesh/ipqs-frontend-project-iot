import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Form, Button, Spinner } from 'react-bootstrap';
import GaugeChart from 'react-gauge-chart';

export default function SolarEfficiencyCard({ device_id }) {
  const [minPf, setMinPf] = useState('');
  const [maxPf, setMaxPf] = useState('');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(true); // true = inputs enabled
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_BASE_URL}/admin/devices/${device_id}/pf-range`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        setMinPf(data.min_pf);
        setMaxPf(data.max_pf);
        setEditing(false);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching PF range:', err);
        setLoading(false);
      });
  }, [device_id, token]);

  const handleSet = () => {
    if (!minPf || !maxPf) return;
    setLoading(true);
    fetch(`${process.env.REACT_APP_API_BASE_URL}/admin/devices/${device_id}/set-pf-range`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        min_pf: parseFloat(minPf),
        max_pf: parseFloat(maxPf),
      }),
    })
      .then(res => res.json())
      .then(() => {
        setEditing(false);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to update PF range:', err);
        setLoading(false);
      });
  };

  const handleReset = () => {
    setMinPf(0.999);
    setMaxPf(1.0);
    setEditing(true);
  };

  return (
    <Card className="p-4 shadow-sm bg-white border-0 rounded-4 w-100 mb-3">
      <h6 className="fw-semibold mb-3" style={{ fontSize: '14px' }}>Power Factor Thresholds</h6>
      {loading ? (
        <div className="text-center"><Spinner animation="border" size="sm" /></div>
      ) : (
        <>
          <Row className="align-items-center mb-3">
            <Col xs={6}>
              <Form.Label style={{ fontSize: '13px' }}>Min PF</Form.Label>
              <Form.Control
                type="number"
                value={minPf}
                disabled={!editing}
                onChange={(e) => setMinPf(e.target.value)}
                step="0.001"
                min="0"
                max="1.5"
              />
            </Col>
            <Col xs={6}>
              <Form.Label style={{ fontSize: '13px' }}>Max PF</Form.Label>
              <Form.Control
                type="number"
                value={maxPf}
                disabled={!editing}
                onChange={(e) => setMaxPf(e.target.value)}
                step="0.001"
                min="0"
                max="1.5"
              />
            </Col>
          </Row>

          <div className="d-flex justify-content-between">
            <Button
              size="sm"
              onClick={editing ? handleSet : handleReset}
              variant={editing ? 'success' : 'warning'}
            >
              {editing ? 'Set Range' : 'Reset to Default'}
            </Button>
          </div>
        </>
      )}
    </Card>
  );
}
