'use client';
import React from 'react';
import Image from 'next/image';

export interface CardProps {
  image?: string;
  title?: string;
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function Card({ image, title, children, className = '', onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {image && (
        <div className="relative w-full h-48">
          <Image src={image} alt={title || ''} fill className="object-contain p-2" />
        </div>
      )}
      <div className="p-4">
        {title && <h3 className="font-medium text-[#131921] mb-2 line-clamp-2">{title}</h3>}
        {children}
      </div>
    </div>
  );
}
