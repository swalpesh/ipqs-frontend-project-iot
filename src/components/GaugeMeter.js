// src/components/GaugeMeter.js
import React from 'react';

export default function GaugeMeter({ value = 60 }) {
  const degree = (value / 100) * 180;

  return (
    <div className="position-relative" style={{ width: 200, height: 100 }}>
      <svg width="200" height="100" viewBox="0 0 200 100">
        <defs>
          <linearGradient id="gaugeColors" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F9C74F" />
            <stop offset="60%" stopColor="#43AA8B" />
            <stop offset="100%" stopColor="#F94144" />
          </linearGradient>
        </defs>
        <path
          d="M10,100 A90,90 0 0,1 190,100"
          fill="none"
          stroke="url(#gaugeColors)"
          strokeWidth="20"
        />
        <line
          x1="100"
          y1="100"
          x2={100 + 80 * Math.cos((Math.PI * (180 - degree)) / 180)}
          y2={100 - 80 * Math.sin((Math.PI * (degree)) / 180)}
          stroke="#222"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
      {/* <div className="text-center fw-bold mt-2">{value}%</div> */}
    </div>
  );
}
