import React from 'react';
import { DocumentTextIcon } from '@heroicons/react/24/outline';

const ReportsPage: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">รายงาน</h2>
      <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
        <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">โมดูลรายงาน</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          ส่วนนี้จะประกอบด้วยสรุปการเงิน, ผลการทำงานของช่าง, และตัวเลือกในการส่งออกข้อมูล
        </p>
      </div>
    </div>
  );
};

export default ReportsPage;