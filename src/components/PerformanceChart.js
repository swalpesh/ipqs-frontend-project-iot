import React, { useEffect, useState } from 'react';
import { Card } from 'react-bootstrap';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid
} from 'recharts';

export default function PerformanceChart({ device_id }) {
  const [data, setData] = useState([]);

  const fetchPerformanceData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/summary/daily/device/${device_id}/weekly-summary`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      const result = await res.json();

      const orderedDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

      const apiData = result || [];
      const fullWeekData = orderedDays.map((day) => {
        const match = apiData.find((entry) => entry.day === day);
        return match
          ? {
              day,
              kw: parseFloat(match.kwh) || 0,
              kva: parseFloat(match.kvah) || 0,
              pf: parseFloat(match.power_factor)?.toFixed(3) || 0,
            }
          : {
              day,
              kw: 0,
              kva: 0,
              pf: 0,
            };
      });

      setData(fullWeekData);
    } catch (error) {
      console.error('Error fetching performance data:', error);
      setData([]);
    }
  };

  useEffect(() => {
    fetchPerformanceData();
    const interval = setInterval(fetchPerformanceData, 1000 * 60 * 60 * 5); // Refresh every 5 hours
    return () => clearInterval(interval);
  }, [device_id]);

  return (
    <Card className="p-4 shadow-sm bg-white border-0 rounded-4 w-100">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="fw-bold">Weekly Performance Monitoring</h6>
      </div>

      <ResponsiveContainer width="100%" height={330}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="day" stroke="#aaa" tick={{ fontSize: 12 }} />

          <YAxis
            yAxisId="left"
            domain={[0, 'auto']}
            stroke="#aaa"
            tick={{ fontSize: 12 }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            domain={[0.5, 1]}
            tickFormatter={(v) => v.toFixed(2)}
            stroke="#aaa"
            tick={{ fontSize: 12 }}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #eee',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
            labelStyle={{ fontWeight: 'bold' }}
            formatter={(value, name) => [value, name]}
          />

          <Legend
            verticalAlign="bottom"
            iconType="circle"
            height={36}
            formatter={(value) => (
              <span style={{ fontSize: '12px', fontWeight: 500 }}>{value}</span>
            )}
          />

          <Line
            yAxisId="left"
            type="monotone"
            dataKey="kw"
            name="Real Power (kWh)"
            stroke="#3f51b5"
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="kva"
            name="Apparent Power (kVAh)"
            stroke="#f44336"
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="pf"
            name="Power Factor"
            stroke="#4caf50"
            strokeDasharray="6 4"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
