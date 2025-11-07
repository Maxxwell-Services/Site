import React from 'react';

const PerformanceGauge = ({ score }) => {
  // Calculate the rotation angle for the needle (0-180 degrees)
  const angle = (score / 100) * 180;
  
  // Determine color and label based on score
  const getScoreColor = () => {
    if (score >= 90) return '#22c55e'; // green
    if (score >= 75) return '#3b82f6'; // blue
    if (score >= 60) return '#eab308'; // yellow
    if (score >= 40) return '#f97316'; // orange
    return '#ef4444'; // red
  };

  const getScoreLabel = () => {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 60) return 'Fair';
    if (score >= 40) return 'Poor';
    return 'Critical';
  };

  return (
    <div className="flex flex-col items-center justify-center py-8">
      {/* Gauge Container */}
      <div className="relative w-80 h-40">
        {/* Background Arc */}
        <svg className="w-full h-full" viewBox="0 0 200 100">
          {/* Outer arc segments */}
          <path
            d="M 20 90 A 80 80 0 0 1 180 90"
            fill="none"
            stroke="#ef4444"
            strokeWidth="16"
            strokeLinecap="round"
            opacity="0.3"
          />
          <path
            d="M 20 90 A 80 80 0 0 1 56 34"
            fill="none"
            stroke="#ef4444"
            strokeWidth="16"
            strokeLinecap="round"
          />
          <path
            d="M 56 34 A 80 80 0 0 1 100 20"
            fill="none"
            stroke="#f97316"
            strokeWidth="16"
            strokeLinecap="round"
          />
          <path
            d="M 100 20 A 80 80 0 0 1 144 34"
            fill="none"
            stroke="#eab308"
            strokeWidth="16"
            strokeLinecap="round"
          />
          <path
            d="M 144 34 A 80 80 0 0 1 180 90"
            fill="none"
            stroke="#22c55e"
            strokeWidth="16"
            strokeLinecap="round"
          />
          
          {/* Center circle */}
          <circle cx="100" cy="90" r="8" fill="#1e40af" />
          
          {/* Needle */}
          <line
            x1="100"
            y1="90"
            x2="100"
            y2="30"
            stroke={getScoreColor()}
            strokeWidth="3"
            strokeLinecap="round"
            transform={`rotate(${angle - 90} 100 90)`}
            style={{ transition: 'transform 1s ease-out' }}
          />
          
          {/* Needle cap */}
          <circle 
            cx="100" 
            cy="90" 
            r="6" 
            fill={getScoreColor()}
          />
          
          {/* Score markers */}
          <text x="10" y="95" fontSize="10" fill="#6b7280" fontWeight="600">0</text>
          <text x="50" y="25" fontSize="10" fill="#6b7280" fontWeight="600">50</text>
          <text x="185" y="95" fontSize="10" fill="#6b7280" fontWeight="600">100</text>
        </svg>
      </div>
      
      {/* Score Display */}
      <div className="text-center mt-4">
        <div className="text-6xl font-bold" style={{ color: getScoreColor() }}>
          {score}
        </div>
        <div className="text-xl text-gray-600 font-semibold mt-1">
          {getScoreLabel()}
        </div>
        <div className="text-sm text-gray-500 mt-1">
          System Performance Score
        </div>
      </div>
    </div>
  );
};

export default PerformanceGauge;
