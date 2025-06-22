// src/components/LiveGauges.js
import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import ReactSpeedometer from "react-d3-speedometer";

export default function LiveGauges() {
  const voltage = 230; // Dummy data (replace with live value)
  const current = 12;  // Dummy data (replace with live value)

  return (
    <Card className="p-4 shadow-sm bg-white border-0 rounded-4 w-100">
      <h5 className="fw-bold mb-4">Live Readings</h5>
      <Row>
        <Col md={6} className="d-flex flex-column align-items-center">
          <h6 className="mb-2">Voltage (V)</h6>
          <ReactSpeedometer
            value={voltage}
            minValue={0}
            maxValue={300}
            currentValueText={`${voltage} V`}
            needleColor="steelblue"
            startColor="#f5cd19"
            segments={10}
            endColor="#dc3545"
            height={200}
          />
        </Col>

        <Col md={6} className="d-flex flex-column align-items-center">
          <h6 className="mb-2">Current (A)</h6>
          <ReactSpeedometer
            value={current}
            minValue={0}
            maxValue={50}
            currentValueText={`${current} A`}
            needleColor="#28a745"
            startColor="#00c9a7"
            segments={10}
            endColor="#ff6f61"
            height={200}
          />
        </Col>
      </Row>
    </Card>
  );
}
