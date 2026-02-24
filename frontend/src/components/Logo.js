import React from 'react';
import { Link } from 'react-router-dom';

const Logo = ({ size = 'default' }) => {
  const sizes = {
    small: { container: 'w-8 h-8', text: 'text-lg', subtext: 'text-[8px]' },
    default: { container: 'w-12 h-12', text: 'text-2xl', subtext: 'text-xs' },
    large: { container: 'w-16 h-16', text: 'text-3xl', subtext: 'text-sm' },
  };

  const s = sizes[size];

  return (
    <div className="flex items-center space-x-3">
      <div className="relative">
        <div 
          className={`${s.container} rounded-lg flex items-center justify-center shadow-md`}
          style={{
            background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)'
          }}
        >
          <svg className="w-3/5 h-3/5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div 
          className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white"
          style={{ background: 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)' }}
        ></div>
      </div>
      <div>
        <h1 
          className={`${s.text} font-bold leading-none`}
          style={{
            fontFamily: "'Brush Script MT', 'Lucida Handwriting', cursive",
            background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          Ambica
        </h1>
        <p 
          className={`${s.subtext} font-bold tracking-wider leading-none`}
          style={{ color: '#f97316' }}
        >
          DIAGNOSTIC CENTRE
        </p>
      </div>
    </div>
  );
};

export default Logo;