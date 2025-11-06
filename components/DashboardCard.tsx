import React from 'react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  secondaryValue?: string | number;
  secondaryLabel?: string;
  icon: React.ReactNode;
  color: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, secondaryValue, secondaryLabel, icon, color }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</p>
        <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{value}</p>
        {secondaryValue !== undefined && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {secondaryLabel ? `${secondaryLabel}: ${secondaryValue}` : secondaryValue}
          </p>
        )}
      </div>
      <div className={`flex-shrink-0 h-12 w-12 rounded-md flex items-center justify-center ${color}`}>
        {icon}
      </div>
    </div>
  );
};

export default DashboardCard;