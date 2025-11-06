import React from 'react';
import { RepairStatus } from '../types';

interface StatusBadgeProps {
  status: RepairStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const statusStyles: { [key in RepairStatus]: string } = {
    [RepairStatus.RECEIVED]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    [RepairStatus.AWAITING_PARTS]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    [RepairStatus.IN_PROGRESS]: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
    [RepairStatus.COMPLETED]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    [RepairStatus.RETURNED]: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    [RepairStatus.CANCELLED]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  };

  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[status]}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
