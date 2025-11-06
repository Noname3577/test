import React from 'react';
import { useAppContext } from '../context/AppContext';
import { RepairJob, RepairStatus, DeviceType } from '../types';
import { UserIcon, WrenchScrewdriverIcon, CalendarDaysIcon, DevicePhoneMobileIcon, ComputerDesktopIcon, DeviceTabletIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

const columns: { title: RepairStatus; color: string }[] = [
  { title: RepairStatus.RECEIVED, color: 'bg-blue-500' },
  { title: RepairStatus.AWAITING_PARTS, color: 'bg-yellow-500' },
  { title: RepairStatus.IN_PROGRESS, color: 'bg-indigo-500' },
];

const RepairMonitorPage: React.FC = () => {
  const { repairJobs, customers, technicians } = useAppContext();

  const getCustomerName = (id: string) => customers.find(c => c.id === id)?.name || 'N/A';
  const getTechnicianName = (id?: string) => technicians.find(t => t.id === id)?.name || 'ยังไม่มอบหมาย';

  const calculateDaysSinceReceived = (receivedDate: string) => {
    const today = new Date();
    const received = new Date(receivedDate);
    const diffTime = Math.abs(today.getTime() - received.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  const getDeviceIcon = (deviceType: DeviceType) => {
    switch (deviceType) {
        case DeviceType.MOBILE:
            return <DevicePhoneMobileIcon className="h-4 w-4 mr-2 flex-shrink-0" />;
        case DeviceType.NOTEBOOK:
            return <ComputerDesktopIcon className="h-4 w-4 mr-2 flex-shrink-0" />;
        case DeviceType.TABLET:
            return <DeviceTabletIcon className="h-4 w-4 mr-2 flex-shrink-0" />;
        default:
            return <QuestionMarkCircleIcon className="h-4 w-4 mr-2 flex-shrink-0" />;
    }
}

  const activeJobs = repairJobs.filter(job =>
    columns.some(c => c.title === job.status)
  );

  const jobsByStatus = activeJobs.reduce((acc, job) => {
    (acc[job.status] = acc[job.status] || []).push(job);
    return acc;
  }, {} as Record<RepairStatus, RepairJob[]>);

  return (
    <div className="flex h-full overflow-x-auto space-x-4 pb-4">
      {columns.map(column => (
        <div key={column.title} className="flex-shrink-0 w-full sm:w-80 md:w-96 bg-gray-200 dark:bg-gray-800 rounded-lg shadow-lg flex flex-col">
          <div className={`flex items-center justify-between p-3 rounded-t-lg ${column.color}`}>
            <h2 className="font-semibold text-white">{column.title}</h2>
            <span className="px-2 py-1 text-xs font-bold text-white bg-white/30 rounded-full">
              {jobsByStatus[column.title]?.length || 0}
            </span>
          </div>
          <div className="p-3 space-y-3 overflow-y-auto flex-1">
            {(jobsByStatus[column.title] || []).map(job => {
              const days = calculateDaysSinceReceived(job.receivedDate);
              let daysBadgeColor = 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
              if (days >= 4 && days <= 7) {
                  daysBadgeColor = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
              } else if (days > 7) {
                  daysBadgeColor = 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
              }
              
              return (
                <div key={job.id} className="bg-white dark:bg-gray-700 rounded-md shadow p-4 space-y-2 transform hover:-translate-y-1 transition-transform duration-200">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center font-bold text-sm text-gray-800 dark:text-white mr-2 flex-1 min-w-0">
                        {getDeviceIcon(job.deviceType)}
                        <span className="truncate">{job.deviceModel}</span>
                    </div>
                    <p className="text-xs flex-shrink-0 font-mono bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">{job.repairCode}</p>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 break-words">{job.issueDescription}</p>
                  <div className="border-t border-gray-200 dark:border-gray-600 pt-2 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center text-gray-700 dark:text-gray-300">
                        <UserIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{getCustomerName(job.customerId)}</span>
                      </div>
                      <div className="flex items-center text-gray-700 dark:text-gray-300">
                        <WrenchScrewdriverIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                         <span className="truncate">{getTechnicianName(job.technicianId)}</span>
                      </div>
                    </div>
                    <div className="flex items-center mt-2">
                      <CalendarDaysIcon className="h-4 w-4 mr-2 flex-shrink-0 text-gray-500 dark:text-gray-400" />
                      <span className={`px-2 py-1 inline-flex text-xs leading-4 font-bold rounded-full ${daysBadgeColor}`}>
                        ผ่านมาแล้ว {days} วัน
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            {(!jobsByStatus[column.title] || jobsByStatus[column.title].length === 0) && (
              <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-10">
                ไม่มีงานในสถานะนี้
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default RepairMonitorPage;