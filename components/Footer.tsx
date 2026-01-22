import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#FDF6F0] border-t border-[#6D597A]/20 mt-12">
      <div className="container max-w-screen-xl mx-auto px-4 py-6 text-center text-[#3A3A3A]/70">
        <p>© {new Date().getFullYear()} VisioAI. Powered by Google Gemini. Dibuat oleh <strong className="font-semibold text-[#3A3A3A]"><a href="https://cepat.digital" target="_blank">Cepat Digital Teknologi</a></strong>.</p>
        <p className="text-sm mt-2">Versi 1.2</p>
      </div>
    </footer>
  );
};