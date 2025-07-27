import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Form, Button, Spinner } from 'react-bootstrap';

export default function SolarEfficiencyCard({ device_id }) {
  const [minPf, setMinPf] = useState('');
  const [maxPf, setMaxPf] = useState('');
  const [leadMinPf, setLeadMinPf] = useState('');
  const [leadMaxPf, setLeadMaxPf] = useState('');
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
        setLeadMinPf(data.lead_min_pf);
        setLeadMaxPf(data.lead_max_pf);
        setEditing(false);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching PF range:', err);
        setLoading(false);
      });
  }, [device_id, token]);

  const handleSet = async () => {
    if (!minPf || !maxPf || !leadMinPf || !leadMaxPf) return;
    setLoading(true);

    try {
      await Promise.all([
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
        }),
        fetch(`${process.env.REACT_APP_API_BASE_URL}/admin/devices/${device_id}/set-lead-pf-range`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            lead_min_pf: parseFloat(leadMinPf),
            lead_max_pf: parseFloat(leadMaxPf),
          }),
        }),
      ]);
      setEditing(false);
    } catch (err) {
      console.error('Failed to update PF ranges:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMinPf(0.999);
    setMaxPf(1.0);
    setLeadMinPf(0.96);
    setLeadMaxPf(0.99);
    setEditing(true);
  };

  return (
    <Card className="p-4 shadow-sm bg-white border-0 rounded-4 w-100 mb-3">
      <h6 className="fw-semibold mb-3" style={{ fontSize: '14px' }}>Set Lag & Lead Thresholds</h6>
      {loading ? (
        <div className="text-center"><Spinner animation="border" size="sm" /></div>
      ) : (
        <>
          <Row className="align-items-center mb-3">
            <Col xs={6}>
              <Form.Label style={{ fontSize: '13px' }}>Lag Min PF</Form.Label>
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
              <Form.Label style={{ fontSize: '13px' }}>Lag Max PF</Form.Label>
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

          <Row className="align-items-center mb-3">
            <Col xs={6}>
              <Form.Label style={{ fontSize: '13px' }}>Lead Min PF</Form.Label>
              <Form.Control
                type="number"
                value={leadMinPf}
                disabled={!editing}
                onChange={(e) => setLeadMinPf(e.target.value)}
                step="0.001"
                min="0"
                max="1.5"
              />
            </Col>
            <Col xs={6}>
              <Form.Label style={{ fontSize: '13px' }}>Lead Max PF</Form.Label>
              <Form.Control
                type="number"
                value={leadMaxPf}
                disabled={!editing}
                onChange={(e) => setLeadMaxPf(e.target.value)}
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
