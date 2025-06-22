import React from 'react';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';

export default function MiniChart({ data, color = "#007bff", label = "Voltage" }) {
  return (
    <div className="text-center">
      <h6 className="text-muted mb-1">{label}</h6>
      <ResponsiveContainer width="100%" height={80}>
        <LineChart data={data}>
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
