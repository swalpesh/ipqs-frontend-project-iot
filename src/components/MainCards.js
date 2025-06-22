import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { Card, Row, Col } from 'react-bootstrap';
import { Bolt, BatteryChargingFull, ElectricalServices } from '@mui/icons-material';
import ReactSpeedometer from "react-d3-speedometer";
import solarImage from '../assets/solar-panel.png';

const socket = io('http://31.97.9.220:4000'); // 👈 Adjust for deployment if needed

export default function MainCards({ device_id }) {
  const [data, setData] = useState({
    device_id: '',
    total_kW: 0,
    pf_avg: 0,
    total_kva: 0,
    total_kvar: 0,
    kw1: 0,
    voltage: 0,
    current: 0,
  });

  useEffect(() => {
    if (!device_id) {
      console.warn('❌ No device_id received by MainCards');
      return;
    }

    const eventName = `device-data-${device_id}`;
    console.log(`📡 Subscribing to: ${eventName}`);

    const handleData = (incoming) => {
      console.log('📲 Live data received:', incoming);
      setData(incoming);
    };

    socket.on(eventName, handleData);

    return () => {
      socket.off(eventName, handleData);
    };
  }, [device_id]);

  return (
    <Card className="p-4 shadow-sm bg-white border-0 rounded-4 w-100">
      <Row className="align-items-center">
        <Col md={4} className="text-center d-flex flex-column justify-content-center align-items-center mb-4 mb-md-0">
          <h6 className="text-muted">kW</h6>
          <h2 className="fw-bold">{data.kw} kW</h2>
          <img src={solarImage} alt="Solar Panel" width="90" className="my-2" />
          <h5 className="fw-bold mt-2">Device ID</h5>
          <h6 className="fw-bold text-uppercase">{device_id}</h6>
        </Col>

        <Col md={8}>
          <Row className="mb-3 g-3">
            <Col xs={6} className="d-flex align-items-center">
              <BatteryChargingFull className="me-2 text-primary" />
              <div>
                <small className="text-muted">Power Factor</small>
                <div className="fw-bold">{data.power_factor}</div>
              </div>
            </Col>
            <Col xs={6} className="d-flex align-items-center">
              <Bolt className="me-2 text-warning" />
              <div>
                <small className="text-muted">Kwh</small>
                <div className="fw-bold">{data.kwh}</div>
              </div>
            </Col>
            <Col xs={6} className="d-flex align-items-center">
              <Bolt className="me-2 text-warning" />
              <div>
                <small className="text-muted">Kvar</small>
                <div className="fw-bold">{data.kvar}</div>
              </div>
            </Col>
            <Col xs={6} className="d-flex align-items-center">
              <Bolt className="me-2 text-warning" />
              <div>
                <small className="text-muted">kvah</small>
                <div className="fw-bold">{data.kvah}</div>
              </div>
            </Col>
            <Col xs={6} className="d-flex align-items-center">
              <Bolt className="me-2 text-success" />
              <div>
                <small className="text-muted">kvarh (lag)</small>
                <div className="fw-bold">{data.kvarhlag}</div>
              </div>
            </Col>
            <Col xs={6} className="d-flex align-items-center">
              <Bolt className="me-2 text-success" />
              <div>
                <small className="text-muted">kvarh (lead)</small>
                <div className="fw-bold">{data.kvarhlead}</div>
              </div>
            </Col>
          </Row>

          <hr className="mb-4" />

          <Row className="justify-content-center">
            <Col md={6} className="d-flex flex-column align-items-center">
              <h6 className="mb-2">Voltage (V)</h6>
              <ReactSpeedometer
                value={data.voltage}
                minValue={0}
                maxValue={300}
                height={140}
                width={200}
                needleColor="#007bff"
                ringWidth={15}
                segments={6}
                maxSegmentLabels={6}
                currentValueText=""
                needleHeightRatio={0.7}
              />
              <h5 className="fw-bold mt-2">{data.voltage} V</h5>
            </Col>

            <Col md={6} className="d-flex flex-column align-items-center">
              <h6 className="mb-2">Current (A)</h6>
              <ReactSpeedometer
                value={data.current}
                minValue={0}
                maxValue={50}
                height={140}
                width={200}
                needleColor="#198754"
                ringWidth={15}
                segments={5}
                maxSegmentLabels={5}
                currentValueText=""
                needleHeightRatio={0.7}
              />
              <h5 className="fw-bold mt-2">{data.current} A</h5>
            </Col>
          </Row>
        </Col>
      </Row>
    </Card>
  );
}
