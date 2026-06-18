'use client';
import React from 'react';

export interface RatingProps {
  value: number;
  size?: 'sm' | 'md' | 'lg';
  onChange?: (value: number) => void;
  className?: string;
}

const sizeMap = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-7 h-7' };

function Star({ fill, size, onClick }: { fill: 'full' | 'half' | 'empty'; size: string; onClick?: () => void }) {
  const color = fill === 'empty' ? '#d1d5db' : '#FF9900';
  return (
    <svg className={`${size} ${onClick ? 'cursor-pointer' : ''}`} onClick={onClick} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`half-${Math.random().toString(36).slice(2)}`}>
          <stop offset="50%" stopColor="#FF9900" />
          <stop offset="50%" stopColor="#d1d5db" />
        </linearGradient>
      </defs>
      {fill === 'half' ? (
        <>
          <clipPath id="leftHalf"><rect x="0" y="0" width="12" height="24" /></clipPath>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z" fill="#d1d5db" />
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z" fill="#FF9900" clipPath="url(#leftHalf)" />
        </>
      ) : (
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z" fill={color} />
      )}
    </svg>
  );
}

export default function Rating({ value, size = 'md', onChange, className = '' }: RatingProps) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    const fill = value >= i ? 'full' : value >= i - 0.5 ? 'half' : 'empty';
    stars.push(
      <Star key={i} fill={fill} size={sizeMap[size]} onClick={onChange ? () => onChange(i) : undefined} />
    );
  }
  return <div className={`inline-flex items-center gap-0.5 ${className}`}>{stars}</div>;
}
