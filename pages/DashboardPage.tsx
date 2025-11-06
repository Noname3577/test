import React from 'react';
import { useAppContext } from '../context/AppContext';
import { RepairStatus } from '../types';
import DashboardCard from '../components/DashboardCard';
import { WrenchIcon, ClockIcon, CubeTransparentIcon, BanknotesIcon } from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DashboardPage: React.FC = () => {
  const { repairJobs, parts } = useAppContext();

  const activeJobs = repairJobs.filter(j => 
    j.status === RepairStatus.IN_PROGRESS || 
    j.status === RepairStatus.AWAITING_PARTS ||
    j.status === RepairStatus.RECEIVED
  ).length;

  const awaitingParts = repairJobs.filter(j => j.status === RepairStatus.AWAITING_PARTS).length;
  const lowStockParts = parts.filter(p => p.stock < 5).length;
  
  const completedJobs = repairJobs
    .filter(j => j.status === RepairStatus.COMPLETED || j.status === RepairStatus.RETURNED);

  const totalRevenue = completedJobs.reduce((sum, job) => sum + job.laborCost + job.partsCost, 0);
  const laborOnlyRevenue = completedJobs.reduce((sum, job) => sum + job.laborCost, 0);

  const data = [
    { name: RepairStatus.RECEIVED, count: repairJobs.filter(j => j.status === RepairStatus.RECEIVED).length },
    { name: RepairStatus.AWAITING_PARTS, count: awaitingParts },
    { name: RepairStatus.IN_PROGRESS, count: repairJobs.filter(j => j.status === RepairStatus.IN_PROGRESS).length },
    { name: RepairStatus.COMPLETED, count: repairJobs.filter(j => j.status === RepairStatus.COMPLETED).length },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard 
          title="งานซ่อมปัจจุบัน" 
          value={activeJobs}
          icon={<WrenchIcon className="h-6 w-6 text-white"/>}
          color="bg-blue-500"
        />
        <DashboardCard 
          title="งานที่รออะไหล่" 
          value={awaitingParts}
          icon={<ClockIcon className="h-6 w-6 text-white"/>}
          color="bg-yellow-500"
        />
        <DashboardCard 
          title="อะไหล่ใกล้หมด" 
          value={lowStockParts}
          icon={<CubeTransparentIcon className="h-6 w-6 text-white"/>}
          color="bg-red-500"
        />
        <DashboardCard 
          title="รายรับทั้งหมด (งานเสร็จสิ้น)" 
          value={`฿${totalRevenue.toLocaleString()}`}
          secondaryLabel="เฉพาะค่าแรง"
          secondaryValue={`฿${laborOnlyRevenue.toLocaleString()}`}
          icon={<BanknotesIcon className="h-6 w-6 text-white"/>}
          color="bg-green-500"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">ภาพรวมสถานะงานซ่อม</h2>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700"/>
              <XAxis dataKey="name" className="text-xs fill-current text-gray-600 dark:text-gray-400" />
              <YAxis className="text-xs fill-current text-gray-600 dark:text-gray-400" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(31, 41, 55, 0.8)',
                  borderColor: '#4b5563',
                  color: '#ffffff',
                  borderRadius: '0.5rem'
                }}
              />
              <Legend />
              <Bar dataKey="count" fill="#3b82f6" name="จำนวน" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;