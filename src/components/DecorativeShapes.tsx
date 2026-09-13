import React from 'react';

export const StarDoodle: React.FC<{ className?: string; color?: string; size?: number }> = ({
  className = '',
  color = '#CFB850',
  size = 24
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={color}
    className={`inline-block transition-transform duration-300 hover:scale-125 ${className}`}
    aria-hidden="true"
  >
    <path d="M12 2L14.7 8.3L21.5 9L16.4 13.7L17.9 20.4L12 17L6.1 20.4L7.6 13.7L2.5 9L9.3 8.3L12 2Z" />
  </svg>
);

export const OrganicBlob: React.FC<{
  className?: string;
  color?: string;
}> = ({ className = '', color = 'var(--color-baby-blue)' }) => (
  <svg
    viewBox="0 0 200 200"
    className={`pointer-events-none select-none opacity-40 ${className}`}
    aria-hidden="true"
  >
    <path
      fill={color}
      d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.5,90,-16.3,87.6,-0.8C85.2,14.6,77.7,29.3,68.7,42.4C59.7,55.5,49.1,67,36.2,74.1C23.2,81.3,7.9,84,-7.8,82.8C-23.4,81.6,-39.3,76.5,-52.3,67.8C-65.3,59.1,-75.4,46.8,-81.2,32.7C-87,18.6,-88.6,2.7,-84.9,-11.9C-81.2,-26.5,-72.3,-39.7,-60.8,-47.5C-49.4,-55.3,-35.5,-57.6,-22.3,-65.4C-9.2,-73.2,3.3,-86.5,17.4,-88.2C31.5,-89.9,47.2,-79.9,44.7,-76.4Z"
      transform="translate(100 100)"
    />
  </svg>
);

export const SparkleGroup: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`relative pointer-events-none ${className}`} aria-hidden="true">
    <StarDoodle size={18} color="#CFB850" className="absolute -top-3 -left-3 animate-pulse" />
    <StarDoodle size={14} color="#D88B33" className="absolute top-2 left-6 opacity-80" />
    <StarDoodle size={10} color="#8F6BD4" className="absolute -bottom-2 left-1 opacity-70" />
  </div>
);

export const DottedTrail: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    viewBox="0 0 120 40"
    fill="none"
    className={`pointer-events-none stroke-brand-leaf/40 ${className}`}
    aria-hidden="true"
  >
    <path
      d="M5 25 Q 35 5, 65 25 T 115 20"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeDasharray="4 6"
    />
  </svg>
);
