import React, { useEffect, useState } from 'react';
import { Card } from 'react-bootstrap';
import './MonthlyGeneration.css';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function MonthlyGeneration({ device_id }) {
  const [generationData, setGenerationData] = useState([]);

  useEffect(() => {
    const fetchMonthlyPF = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/monthly/device/${device_id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const result = await res.json();

        const allMonths = MONTH_NAMES.map((name, idx) => ({
          month: name,
          value: 0
        }));

        result?.forEach(entry => {
          const monthIndex = parseInt(entry.month.split('-')[1], 10) - 1;
          if (monthIndex >= 0 && monthIndex < 12) {
            allMonths[monthIndex].value = parseFloat(entry.power_factor || 0);
          }
        });

        setGenerationData(allMonths);
      } catch (err) {
        console.error('Failed to fetch monthly generation data:', err);
        setGenerationData(MONTH_NAMES.map(name => ({ month: name, value: 0 })));
      }
    };

    fetchMonthlyPF();
  }, [device_id]);

  return (
    <Card className="p-4 shadow-sm bg-white border-0 rounded-4 w-100">
      <h6 className="fw-bold mb-3">Monthly Power Factor</h6>
      <div className="monthly-grid">
        {generationData.map((item, idx) => (
          <div className="month-card" key={idx}>
            <div className="month">{item.month}</div>
            <div className="value">{item.value.toFixed(3)} <span className="unit">PF</span></div>
          </div>
        ))}
      </div>
    </Card>
  );
}
