import React from 'react';
import DevicePreview from '../components/DevicePreview';

export default function DevicesPage() {
  return (
    <div className="container-fluid mt-4 px-3">

      <h5 className="fw-bold">Connected Devices</h5>
      
        <DevicePreview showAll={true} />
      
    </div>
  );
}
