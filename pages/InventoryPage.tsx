import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { PencilIcon, TrashIcon, ArrowsUpDownIcon } from '@heroicons/react/24/outline';
import ConfirmationModal from '../components/ConfirmationModal';
import AddPartModal from '../components/AddPartModal';
import { Part } from '../types';
import ManageCategoriesModal from '../components/ManageCategoriesModal';
import ManageSuppliersModal from '../components/ManageSuppliersModal';
import StockAdjustmentModal from '../components/StockAdjustmentModal';

const InventoryPage: React.FC = () => {
  const { parts, partCategories, suppliers, deletePart, addPart, updatePart, adjustPartStock } = useAppContext();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [partToDelete, setPartToDelete] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | null>(null);
  const [isManageCategoriesModalOpen, setIsManageCategoriesModalOpen] = useState(false);
  const [isManageSuppliersModalOpen, setIsManageSuppliersModalOpen] = useState(false);
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
  const [partToAdjust, setPartToAdjust] = useState<Part | null>(null);

  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return <span className="text-gray-400 italic">ไม่มีหมวดหมู่</span>;
    return partCategories.find(c => c.id === categoryId)?.name || 'N/A';
  }

  const getSupplierName = (supplierId?: string) => {
    if (!supplierId) return <span className="text-gray-400 italic">ไม่มี</span>;
    return suppliers.find(s => s.id === supplierId)?.name || 'N/A';
  }

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

  const handleOpenCreateModal = () => {
    setEditingPart(null);
    setIsModalOpen(true);
  };

  const handleEditPart = (part: Part) => {
    setEditingPart(part);
    setIsModalOpen(true);
  };
  
  const handleSavePart = async (partData: Part | Omit<Part, 'id'>) => {
    if ('id' in partData) {
      await updatePart(partData as Part);
    } else {
      await addPart(partData as Omit<Part, 'id'>);
    }
    setIsModalOpen(false);
  };

  const handleOpenAdjustmentModal = (part: Part) => {
    setPartToAdjust(part);
    setIsAdjustmentModalOpen(true);
  };

  const handleConfirmAdjustment = async (partId: string, adjustment: number) => {
    try {
      await adjustPartStock(partId, adjustment);
      setIsAdjustmentModalOpen(false);
      setPartToAdjust(null);
    } catch (error) {
      console.error("Failed to adjust stock", error);
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center flex-wrap gap-4">
          <h2 className="text-lg font-semibold">อะไหล่และสต็อกสินค้า</h2>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button 
              onClick={() => setIsManageSuppliersModalOpen(true)}
              className="px-3 py-2 text-sm bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              จัดการแหล่งสั่งซื้อ
            </button>
            <button 
              onClick={() => setIsManageCategoriesModalOpen(true)}
              className="px-3 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              จัดการหมวดหมู่
            </button>
            <button 
              onClick={handleOpenCreateModal}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              เพิ่มอะไหล่ใหม่
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ชื่ออะไหล่</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">หมวดหมู่</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">แหล่งสั่งซื้อ</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">จำนวนคงเหลือ</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ราคา</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">จัดการ</span></th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {parts.map((part) => (
                <tr key={part.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{part.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{getCategoryName(part.categoryId)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{getSupplierName(part.supplierId)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={part.stock < 5 ? 'text-red-500 font-bold' : ''}>
                      {part.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">฿{part.price.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleOpenAdjustmentModal(part)} className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 mr-3" title="ปรับสต็อก"><ArrowsUpDownIcon className="h-5 w-5"/></button>
                    <button onClick={() => handleEditPart(part)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3" title="แก้ไข"><PencilIcon className="h-5 w-5"/></button>
                    <button onClick={() => openDeleteModal(part.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300" title="ลบ"><TrashIcon className="h-5 w-5"/></button>
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
      <AddPartModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePart}
        partToEdit={editingPart}
      />
      <ManageCategoriesModal
        isOpen={isManageCategoriesModalOpen}
        onClose={() => setIsManageCategoriesModalOpen(false)}
      />
      <ManageSuppliersModal
        isOpen={isManageSuppliersModalOpen}
        onClose={() => setIsManageSuppliersModalOpen(false)}
      />
      <StockAdjustmentModal
        isOpen={isAdjustmentModalOpen}
        onClose={() => setIsAdjustmentModalOpen(false)}
        partToAdjust={partToAdjust}
        onAdjust={handleConfirmAdjustment}
      />
    </>
  );
};

export default InventoryPage;