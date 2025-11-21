import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-gray-900 mt-12 py-8">
      <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
        <p>&copy; {new Date().getFullYear()} 3D手办工坊. 保留所有权利。</p>
      </div>
    </footer>
  );
};