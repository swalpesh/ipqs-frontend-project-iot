import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import GaugeMeter from "./GaugeMeter.js";   // ✅ Correct import

export default function SolarEfficiencyCard() {

  const efficiency = 60; // Example dynamic value (0–100)

  return (
    <Card className="p-4 shadow-sm bg-white border-0 rounded-4 w-100 mb-3">
      <h6 className="fw-semibold mb-3" style={{ fontSize: '14px' }}>Device Health</h6>

      <Row>
        {/* Labels */}
        <Col xs={4}>
          <ul className="list-unstyled small mb-0" style={{ fontSize: '13px' }}>
            <li>Low</li>
            <li>Good</li>
            <li>High</li>
            <li className="fw-bold fs-5 mt-2" style={{ color: '#008000' }}>
              {efficiency >= 70 ? "High" : efficiency >= 40 ? "Good" : "Low"}
            </li>
          </ul>
        </Col>

        {/* Gauge Meter */}
        <Col xs={8} className="d-flex justify-content-center align-items-center">
          <GaugeMeter value={efficiency} />   {/* ✅ Replaced GaugeChart */}
        </Col>
      </Row>
    </Card>
  );
}
