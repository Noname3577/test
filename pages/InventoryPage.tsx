import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import ConfirmationModal from '../components/ConfirmationModal';

const InventoryPage: React.FC = () => {
  const { parts, deletePart } = useAppContext();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [partToDelete, setPartToDelete] = useState<string | null>(null);

  const openDeleteModal = (partId: string) => {
    setPartToDelete(partId);
    setIsConfirmModalOpen(true);
  };

  const closeDeleteModal = () => {
    setPartToDelete(null);
    setIsConfirmModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (partToDelete) {
      await deletePart(partToDelete);
      closeDeleteModal();
    }
  };


  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold">อะไหล่และสต็อกสินค้า</h2>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            เพิ่มอะไหล่ใหม่
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ชื่ออะไหล่</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">จำนวนคงเหลือ</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ราคา</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">จัดการ</span></th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {parts.map((part) => (
                <tr key={part.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{part.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={part.stock < 5 ? 'text-red-500 font-bold' : ''}>
                      {part.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">฿{part.price.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3"><PencilIcon className="h-5 w-5"/></button>
                    <button onClick={() => openDeleteModal(part.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"><TrashIcon className="h-5 w-5"/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
       <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDelete}
        title="ยืนยันการลบอะไหล่"
        message={`คุณแน่ใจหรือไม่ว่าต้องการลบอะไหล่ "${parts.find(p => p.id === partToDelete)?.name}"? การกระทำนี้ไม่สามารถย้อนกลับได้`}
      />
    </>
  );
};

export default InventoryPage;