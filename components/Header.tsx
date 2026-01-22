import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-[#007A3E] via-[#15935A] to-[#E6B800] border-b border-white/20 sticky top-0 z-50">
      <div className="container max-w-screen-xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M18 5l1.5 2.5L22 9l-2.5 1.5L18 13l-1.5-2.5L14 9l2.5-1.5z"></path>
          </svg>
          <h1 className="text-xl font-bold text-white flex items-baseline">
            <span>Cepat Digital Studio</span>
            <span className="text-sm font-light text-white/90 ml-2">by CepatDigitalTeknologi</span>
          </h1>
        </div>
      </div>
    </header>
  );
};