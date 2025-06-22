import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import GaugeChart from 'react-gauge-chart';

export default function SolarEfficiencyCard() {
  return (
    <Card className="p-4 shadow-sm bg-white border-0 rounded-4 w-100 mb-3">
      <h6 className="fw-semibold mb-3" style={{ fontSize: '14px' }}>Device Health</h6>
      <Row>
        <Col xs={4}>
          <ul className="list-unstyled small mb-0" style={{ fontSize: '13px' }}>
            <li>Low</li>
            <li>Good</li>
            <li>High</li>
            <li className="fw-bold fs-5 mt-2" style={{ color: '#008000' }}>Good</li>
          </ul>
        </Col>
        <Col xs={8} className="d-flex justify-content-center align-items-center">
          <GaugeChart
  id="efficiency-gauge"
  nrOfLevels={20}
  percent={0.6} // Can be a dynamic value like `efficiency / 100`
  animate={true} // ✅ This must be true
  needleColor="#333"
  textColor="#000"
  colors={['#FF6E6E', '#5BE12C', '#FFA500']}
  arcsLength={[0.3, 0.4, 0.3]}
  arcPadding={0.02}
  arcWidth={0.2}
  style={{ width: '100%' }}
/>

        </Col>
      </Row>
    </Card>
  );
}
