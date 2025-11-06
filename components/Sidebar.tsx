import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { HomeIcon, WrenchScrewdriverIcon, UsersIcon, UserGroupIcon, CubeIcon, ChartBarIcon, Cog6ToothIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

const navigation = [
  { name: 'แดชบอร์ด', href: '/dashboard', icon: HomeIcon },
  { name: 'งานซ่อม', href: '/repairs', icon: WrenchScrewdriverIcon },
  { name: 'ลูกค้า', href: '/customers', icon: UsersIcon },
  { name: 'ช่างเทคนิค', href: '/technicians', icon: UserGroupIcon },
  { name: 'อะไหล่/สต็อก', href: '/inventory', icon: CubeIcon },
  { name: 'รายงาน', href: '/reports', icon: ChartBarIcon },
  { name: 'ตั้งค่า', href: '/settings', icon: Cog6ToothIcon },
];

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const NavLinks = () => (
    <nav className="mt-5 flex-1 px-2 space-y-1">
      {navigation.map((item) => (
        <NavLink
          key={item.name}
          to={item.href}
          onClick={() => setIsOpen(false)}
          className={({ isActive }) =>
            `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
              isActive
                ? 'bg-blue-600 text-white'
                : 'text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`
          }
        >
          <item.icon className="mr-3 flex-shrink-0 h-6 w-6" aria-hidden="true" />
          {item.name}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <>
      {/* Mobile menu button */}
      <button onClick={() => setIsOpen(!isOpen)} className="md:hidden fixed top-4 left-4 z-30 p-2 rounded-md text-gray-500 bg-gray-200 dark:bg-gray-800">
        {isOpen ? <XMarkIcon className="h-6 w-6"/> : <Bars3Icon className="h-6 w-6"/>}
      </button>

      {/* Mobile Sidebar */}
       <div className={`fixed inset-0 flex z-20 md:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}>
         <div className="flex flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center h-16 flex-shrink-0 px-4 bg-white dark:bg-gray-800">
             <WrenchScrewdriverIcon className="h-8 w-auto text-blue-500" />
            <span className="ml-2 text-xl font-semibold text-gray-800 dark:text-white">RepairSYS</span>
          </div>
          <div className="flex-1 h-0 overflow-y-auto">
            <NavLinks />
          </div>
         </div>
         <div className="flex-shrink-0 w-14" aria-hidden="true" onClick={() => setIsOpen(false)}></div>
       </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex items-center justify-center h-16 flex-shrink-0 px-4 bg-white dark:bg-gray-800 border-r dark:border-gray-700">
            <WrenchScrewdriverIcon className="h-8 w-auto text-blue-500" />
            <span className="ml-2 text-xl font-semibold text-gray-800 dark:text-white">RepairSYS</span>
          </div>
          <div className="flex-1 flex flex-col h-0 overflow-y-auto bg-white dark:bg-gray-800 border-r dark:border-gray-700">
            <NavLinks />
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;