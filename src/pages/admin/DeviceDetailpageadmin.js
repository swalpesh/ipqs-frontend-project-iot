import { useParams } from 'react-router-dom';

import MainCards from '../../components/MainCards';
import PerformanceChart from '../../components/PerformanceChart';
import MonthlyGeneration from '../../components/MonthlyGeneration';
import SetPFfordevice from '../../components/Adminpfsetter';
import DeviceInfoCard from '../../components/DeviceInfoCard';
import DeviceDataTable from '../../components/DeviceDataTable';

export default function DeviceDetailPage() {
  const { device_id } = useParams();

  return (
    <div
      className="device-detail-wrapper"
      style={{
        backgroundColor: '#f8f9fa',
        minHeight: 'calc(100vh - 56px)',
        overflowY: 'auto',
        overflowX: 'hidden',
      }}
    >
      {/* Cards */}
      <div className="row g-3">
        <div className="col-12 col-xl-8">
          <MainCards device_id={device_id} />
        </div>
        <div className="col-12 col-xl-4">
          <SetPFfordevice device_id={device_id} />
          <DeviceInfoCard />
        </div>
      </div>

      {/* Performance */}
      <div className="row g-3 mt-3">
        <div className="col-12 col-md-6 performance-card">
          <PerformanceChart device_id={device_id}/>
        </div>
        <div className="col-12 col-md-6">
          <MonthlyGeneration device_id={device_id}/>
        </div>
      </div>

      {/* Table */}
      <div className="row g-3 mt-3">
        <div className="col-12" >
          <DeviceDataTable device_id={device_id}/>
        </div>
      </div>
    </div>
  );
}
