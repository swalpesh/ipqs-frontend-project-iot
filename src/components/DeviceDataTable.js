import React, { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import { CSVLink } from 'react-csv';
import { format } from 'date-fns';
import { Card, Spinner, Alert, Form, Button } from 'react-bootstrap';

export default function DeviceDataTable({ device_id }) {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [date, setDate] = useState('');
  const [hour, setHour] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterHour, setFilterHour] = useState('');
  const [csvData, setCsvData] = useState([]);

  const getCurrentDateHourMinusOne = () => {
    const now = new Date();
    now.setHours(now.getHours() - 1);
    const dateStr = now.toISOString().split('T')[0];
    const prevHour = now.getHours();
    return { dateStr, prevHour };
  };

  const fetchHourlyData = async (targetDate, targetHour) => {
    const token = localStorage.getItem('token');
    const apiUrl = `${process.env.REACT_APP_API_BASE_URL}/hourly/device/${device_id}/date/${targetDate}/hour/${targetHour}`;
    setLoading(true);

    try {
      const res = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('No data found');
      const data = await res.json();

      if (!data || Object.keys(data).length === 0) {
        setErrorMsg('No data found for selected hour.');
        setTableData([]);
        setCsvData([]);
      } else {
        setErrorMsg('');
        setTableData([data]);
        setCsvData([data]); // Set complete JSON for export
      }
    } catch (err) {
      console.error('Fetch Error:', err);
      setErrorMsg(err.message);
      setTableData([]);
      setCsvData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const { dateStr, prevHour } = getCurrentDateHourMinusOne();
    setDate(dateStr);
    setHour(prevHour);
    fetchHourlyData(dateStr, prevHour);

    const intervalId = setInterval(() => {
      const { dateStr: newDate, prevHour: newHour } = getCurrentDateHourMinusOne();
      setDate(newDate);
      setHour(newHour);
      fetchHourlyData(newDate, newHour);
    }, 60 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [device_id]);

  const handleFilter = () => {
    if (filterDate && filterHour !== '') {
      fetchHourlyData(filterDate, filterHour);
    } else {
      alert('Please select both date and hour.');
    }
  };

  const columns = [
    { name: 'Timestamp', selector: row => format(new Date(row.timestamp_utc), 'yyyy-MM-dd HH:mm:ss'), sortable: true },
    { name: 'Running PF', selector: row => row.running_power_factor ?? '--' },
    { name: 'Running KVAR Total', selector: row => row.running_kvar_total ?? '--' },
    { name: 'kWh Diff', selector: row => row.kwh_diff ?? '--' },
    { name: 'kVAh Diff', selector: row => row.kvah_diff ?? '--' },
    { name: 'Kvarh Lag Diff', selector: row => row.kvarh_lag_diff ?? '--' },
    { name: 'Kvarh Lead Diff', selector: row => row.kvarh_lead_diff ?? '--' },
    { name: 'Calculated PF', selector: row => row.calculated_pf ?? '--' },
  ];

  return (
    <Card className="p-4 shadow-sm bg-white border-0 rounded-4 w-100">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3">
        <h6 className="fw-bold mb-2 mb-md-0">Device Detailed Data</h6>
        {csvData.length > 0 && (
          <CSVLink
            data={csvData}
            filename={`device-${device_id}-hourly.csv`}
            className="btn btn-sm btn-outline-success"
          >
            Export Excel
          </CSVLink>
        )}
      </div>

      <div><small>Showing data 1 hour prior to current time.</small></div>

      <div className="row g-3 mb-4 mt-4">
        <div className="col-md-4">
          <Form.Label>Select Date</Form.Label>
          <Form.Control
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>
        <div className="col-md-4">
          <Form.Label>Select Hour (0-23)</Form.Label>
          <Form.Control
            type="number"
            min="0"
            max="23"
            value={filterHour}
            onChange={(e) => setFilterHour(e.target.value)}
          />
        </div>
        <div className="col-md-4 d-flex align-items-end">
          <Button variant="primary" className="w-100" onClick={handleFilter}>
            Fetch Data
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-4">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : errorMsg ? (
        <Alert variant="warning" className="text-center">{errorMsg}</Alert>
      ) : (
        <div className="table-responsive">
          <DataTable
            columns={columns}
            data={tableData}
            pagination
            highlightOnHover
            striped
            responsive
          />
        </div>
      )}
    </Card>
  );
}
