import React from 'react';
import { useAppContext } from '../context/AppContext';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const TechniciansPage: React.FC = () => {
  const { technicians, repairJobs } = useAppContext();

  const getWorkload = (technicianId: string) => {
    return repairJobs.filter(job => job.technicianId === technicianId && (job.status === 'กำลังซ่อม' || job.status === 'รออะไหล่')).length;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
       <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h2 className="text-lg font-semibold">ช่างเทคนิคทั้งหมด</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          เพิ่มช่างใหม่
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ชื่อ</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ความชำนาญ</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">งานในมือ</th>
              <th scope="col" className="relative px-6 py-3"><span className="sr-only">จัดการ</span></th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {technicians.map((tech) => (
              <tr key={tech.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{tech.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{tech.specialty}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{getWorkload(tech.id)} งาน</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3"><PencilIcon className="h-5 w-5"/></button>
                  <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"><TrashIcon className="h-5 w-5"/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TechniciansPage;