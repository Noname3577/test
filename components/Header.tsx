import React from 'react';
import { useLocation } from 'react-router-dom';

const titleMapping: { [key: string]: string } = {
  dashboard: 'แดชบอร์ด',
  repairs: 'งานซ่อม',
  customers: 'ลูกค้า',
  technicians: 'ช่างเทคนิค',
  inventory: 'อะไหล่/สต็อก',
  reports: 'รายงาน',
  settings: 'ตั้งค่า',
};

const Header: React.FC = () => {
  const location = useLocation();
  const getTitle = () => {
    const path = location.pathname.split('/')[1];
    return titleMapping[path] || 'แดชบอร์ด';
  };

  return (
    <header className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between p-4 h-16">
        <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white md:ml-0 ml-12">{getTitle()}</h1>
        </div>
        <div className="flex items-center">
           {/* Placeholder for user menu */}
           <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
               A
           </div>
        </div>
      </div>
    </header>
  );
};

export default Header;