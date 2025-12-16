// src/components/GaugeMeter.js
import React from "react";
import ReactSpeedometer from "react-d3-speedometer";

export default function GaugeMeter({ value = 60 }) {
  return (
    <div className="d-flex flex-column align-items-center">
      <ReactSpeedometer
        value={value}
        minValue={0}
        maxValue={100}

        width={220}
        height={140}

        needleColor="#222"
        needleHeightRatio={0.7}

        // Semi-circle mode
        forceRender={true}
        maxSegmentLabels={0}
        ringWidth={25}

        // Gradient-like colors
        segments={3}
        segmentColors={["#F9C74F", "#43AA8B", "#F94144"]}

        // Value text
        currentValueText={`${value}%`}
        textColor="#000"
      />
    </div>
  );
}
