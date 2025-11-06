import React from 'react';
import { CogIcon } from '@heroicons/react/24/outline';

const SettingsPage: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">ตั้งค่า</h2>
      <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
        <CogIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">ตั้งค่าระบบ</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          จัดการข้อมูลร้านค้า, สิทธิ์ผู้ใช้งาน, และการสำรองข้อมูลได้จากส่วนนี้
        </p>
      </div>
    </div>
  );
};

export default SettingsPage;