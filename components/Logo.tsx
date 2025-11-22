import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <defs>
      <linearGradient id="tracer-gradient" x1="5" y1="6" x2="19" y2="19" gradientUnits="userSpaceOnUse">
        <stop stopColor="currentColor" />
        <stop offset="1" stopColor="currentColor" stopOpacity="0.6" />
      </linearGradient>
    </defs>
    
    {/* Top Left Node (Req) */}
    <circle cx="5" cy="6" r="2" fill="currentColor" className="text-primary-600" stroke="none" />
    {/* Top Right Node (Design) */}
    <circle cx="19" cy="6" r="2" fill="currentColor" className="text-primary-400" stroke="none" />
    {/* Bottom Center Node (Code) */}
    <circle cx="12" cy="19" r="2" fill="currentColor" className="text-primary-700" stroke="none" />
    
    {/* Trace Links */}
    <path d="M7 6h10" className="text-slate-400" strokeWidth="2" /> {/* Top Bar */}
    <path d="M12 6v11" className="text-slate-400" strokeWidth="2" /> {/* Vertical Stem */}
    
    {/* AI/Cycle Arc - implying intelligence */}
    <path d="M19 6c0 5-3 13-7 13" className="text-primary-300" strokeWidth="1.5" strokeDasharray="2 2" />
  </svg>
);