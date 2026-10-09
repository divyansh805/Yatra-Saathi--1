import React from 'react';
import logoSvg from '../assets/images/yatra_saathi_logo.svg';

interface LogoProps {
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
}) => {
  // Sizing preserving natural proportions (~3.2:1 aspect ratio) of the Yatra-Saathi logo
  const sizeClasses = {
    sm: 'h-7 sm:h-8',
    md: 'h-8.5 sm:h-9.5',
    lg: 'h-11 sm:h-13',
  };

  return (
    <div className="flex items-center select-none group cursor-pointer">
      <img
        src={logoSvg}
        alt="Yatra-Saathi"
        className={`${sizeClasses[size]} w-auto object-contain shrink-0 transition-opacity duration-200 group-hover:opacity-95 rounded-lg`}
      />
    </div>
  );
};
