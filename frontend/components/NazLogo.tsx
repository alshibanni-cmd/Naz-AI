'use client';

interface NazLogoProps {
  size?: number;
  className?: string;
  variant?: 'sidebar' | 'welcome' | 'header' | 'default';
}

export default function NazLogo({ 
  size = 32, 
  className = '',
  variant = 'default' 
}: NazLogoProps) {
  const logoSize = variant === 'welcome' ? 72 : size;
  
  return (
    <svg
      width={logoSize}
      height={logoSize}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="nazGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10A37F" />
          <stop offset="50%" stopColor="#1A7F64" />
          <stop offset="100%" stopColor="#0D5F4C" />
        </linearGradient>
        
        <linearGradient id="nGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E8F5F2" />
        </linearGradient>
        
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      
      <circle 
        cx="100" 
        cy="100" 
        r="90" 
        stroke="url(#nazGradient)" 
        strokeWidth="4" 
        fill="rgba(16, 163, 127, 0.1)"
        filter="url(#glow)"
      />
      
      <circle 
        cx="100" 
        cy="100" 
        r="80" 
        stroke="url(#nazGradient)" 
        strokeWidth="2" 
        fill="none"
        opacity="0.5"
      />
      
      <path
        d="M 50 50 L 50 150 L 65 150 L 65 85 L 135 150 L 150 150 L 150 50 L 135 50 L 135 115 L 65 50 Z"
        fill="url(#nGradient)"
        filter="url(#glow)"
      />
      
      <circle cx="50" cy="50" r="6" fill="#74E5C0" filter="url(#glow)" />
      <circle cx="150" cy="50" r="6" fill="#74E5C0" filter="url(#glow)" />
      <circle cx="50" cy="150" r="6" fill="#74E5C0" filter="url(#glow)" />
      <circle cx="150" cy="150" r="6" fill="#74E5C0" filter="url(#glow)" />
      <circle cx="100" cy="100" r="8" fill="#FFFFFF" filter="url(#glow)" />
      
      <text
        x="100"
        y="195"
        textAnchor="middle"
        fontSize="14"
        fontWeight="bold"
        fill="url(#nazGradient)"
        fontFamily="Arial, sans-serif"
      >
        NAZ AI
      </text>
    </svg>
  );
}
