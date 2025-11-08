import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { RepairJob, RepairStatus, DeviceType } from '../types';
import { UserIcon, WrenchScrewdriverIcon, CalendarDaysIcon, DevicePhoneMobileIcon, ComputerDesktopIcon, DeviceTabletIcon, QuestionMarkCircleIcon, MagnifyingGlassIcon, InboxIcon } from '@heroicons/react/24/outline';

const columns: { title: RepairStatus; color: string }[] = [
  { title: RepairStatus.RECEIVED, color: 'bg-blue-500' },
  { title: RepairStatus.AWAITING_PARTS, color: 'bg-yellow-500' },
  { title: RepairStatus.IN_PROGRESS, color: 'bg-indigo-500' },
  { title: RepairStatus.COMPLETED, color: 'bg-green-500' },
  { title: RepairStatus.RETURNED, color: 'bg-gray-500' },
  { title: RepairStatus.CANCELLED, color: 'bg-red-500' },
];

const RepairMonitorPage: React.FC = () => {
  const { repairJobs, customers, technicians } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');

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
            return <DevicePhoneMobileIcon className="h-5 w-5 mr-2 flex-shrink-0" />;
        case DeviceType.NOTEBOOK:
            return <ComputerDesktopIcon className="h-5 w-5 mr-2 flex-shrink-0" />;
        case DeviceType.TABLET:
            return <DeviceTabletIcon className="h-5 w-5 mr-2 flex-shrink-0" />;
        default:
            return <QuestionMarkCircleIcon className="h-5 w-5 mr-2 flex-shrink-0" />;
    }
}

  const filteredJobs = useMemo(() => {
    if (searchQuery.trim() === '') {
        return repairJobs;
    }
    const lowercasedQuery = searchQuery.toLowerCase();
    const strippedQuery = lowercasedQuery.replace(/-/g, '');
    return repairJobs.filter(job => {
        const customer = customers.find(c => c.id === job.customerId);
        return (
            job.repairCode.toLowerCase().includes(lowercasedQuery) ||
            (customer?.name.toLowerCase().includes(lowercasedQuery) ?? false) ||
            (customer?.phone.replace(/-/g, '').includes(strippedQuery) ?? false) ||
            job.deviceModel.toLowerCase().includes(lowercasedQuery)
        );
    });
  }, [searchQuery, repairJobs, customers]);

  const jobsByStatus = filteredJobs.reduce((acc, job) => {
    if (job.status) {
        (acc[job.status] = acc[job.status] || []).push(job);
    }
    return acc;
  }, {} as Record<RepairStatus, RepairJob[]>);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-gray-100 dark:bg-gray-900">
        <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
             <div className="relative w-full max-w-sm">
                <label htmlFor="search-monitor" className="sr-only">ค้นหา</label>
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                    id="search-monitor"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ค้นหา (รหัส, ลูกค้า, รุ่น, เบอร์โทร)..."
                    className="block w-full rounded-md border-gray-300 bg-white py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-indigo-500 focus:text-gray-900 focus:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                />
            </div>
        </div>
        <div className="flex-1 h-full overflow-x-auto">
            <div className="inline-flex space-x-4 h-full p-4 sm:p-6">
                {columns.map(column => (
                    <div key={column.title} className="flex-shrink-0 w-full sm:w-80 h-full bg-gray-200/60 dark:bg-gray-800/80 rounded-lg flex flex-col">
                    <div className={`flex items-center justify-between p-3 rounded-t-lg ${column.color}`}>
                        <h2 className="font-bold text-base text-white">{column.title}</h2>
                        <span className="px-2.5 py-1 text-xs font-bold text-white bg-black/20 rounded-full">
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
                             <div key={job.id} className="bg-white dark:bg-gray-700 rounded-lg shadow p-4 space-y-3 transform hover:-translate-y-1 transition-transform duration-200">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center font-bold text-gray-800 dark:text-white mr-2 flex-1 min-w-0">
                                        {getDeviceIcon(job.deviceType)}
                                        <span className="truncate text-base">{job.deviceModel}</span>
                                    </div>
                                    <p className="text-xs flex-shrink-0 font-mono bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">{job.repairCode}</p>
                                </div>
                                
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 break-words">{job.issueDescription}</p>
                                </div>

                                <div className="border-t border-gray-200 dark:border-gray-600 pt-3 text-sm space-y-2">
                                    <div className="flex items-center text-gray-700 dark:text-gray-300">
                                        <UserIcon className="h-4 w-4 mr-2 flex-shrink-0 text-gray-400" />
                                        <span className="font-medium">ลูกค้า:</span>
                                        <span className="truncate ml-2">{getCustomerName(job.customerId)}</span>
                                    </div>
                                    <div className="flex items-center text-gray-700 dark:text-gray-300">
                                        <WrenchScrewdriverIcon className="h-4 w-4 mr-2 flex-shrink-0 text-gray-400" />
                                        <span className="font-medium">ช่าง:</span>
                                        <span className="truncate ml-2">{getTechnicianName(job.technicianId)}</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-1">
                                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                            <CalendarDaysIcon className="h-4 w-4 mr-1.5 flex-shrink-0"/>
                                            <span>{job.receivedDate}</span>
                                        </div>
                                        <span className={`px-2 py-0.5 inline-flex text-xs leading-4 font-bold rounded-full ${daysBadgeColor}`}>
                                            {days} วัน
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                        })}
                        {(!jobsByStatus[column.title] || jobsByStatus[column.title].length === 0) && (
                        <div className="flex flex-col items-center justify-center h-full text-center text-sm text-gray-500 dark:text-gray-400 py-10 px-4">
                            <InboxIcon className="h-10 w-10 text-gray-400 mb-2" />
                            <span>ไม่มีงานในสถานะนี้</span>
                        </div>
                        )}
                    </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};

export default RepairMonitorPage;