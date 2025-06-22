import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';


export default function DeviceCard() {
  return (
    <Card className="p-4 shadow-sm bg-white border-0 rounded-4 w-100">
      <h6 className="fw-semibold mb-4">Device Information</h6>

      <Row>
        <Col xs={6} className="mb-3">
          <small className="text-muted d-block mb-1">Device Name</small>
          <div className="fw-medium fs-6">Test IPQS</div>
        </Col>

        <Col xs={6} className="mb-3 d-flex align-items-center">
          <div>
            <small className="text-muted d-block mb-1">Status</small>
            <div className="d-flex align-items-center gap-1">
  <span className="pulse-dot"></span>
  <span className="text-success fw-semibold">Active</span>
</div>
          </div>
        </Col>

        
      </Row>
    </Card>
  );
}
