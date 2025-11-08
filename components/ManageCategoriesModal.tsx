import React, { useState } from 'react';
import { PartCategory } from '../types';
import { XMarkIcon, PencilIcon, TrashIcon, TagIcon } from '@heroicons/react/24/outline';
import { useAppContext } from '../context/AppContext';
import PartCategoryModal from './PartCategoryModal';
import ConfirmationModal from './ConfirmationModal';
import AlertModal from './AlertModal';

interface ManageCategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ManageCategoriesModal: React.FC<ManageCategoriesModalProps> = ({ isOpen, onClose }) => {
  const { parts, partCategories, addPartCategory, updatePartCategory, deletePartCategory } = useAppContext();

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<PartCategory | null>(null);
  const [isConfirmDeleteCategoryOpen, setIsConfirmDeleteCategoryOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<PartCategory | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const handleOpenCreateCategoryModal = () => {
    setEditingCategory(null);
    setIsCategoryModalOpen(true);
  };

  const handleEditCategory = (category: PartCategory) => {
    setEditingCategory(category);
    setIsCategoryModalOpen(true);
  };
  
  const handleSaveCategory = async (categoryData: PartCategory | Omit<PartCategory, 'id'>) => {
    if ('id' in categoryData) {
      await updatePartCategory(categoryData as PartCategory);
    } else {
      await addPartCategory(categoryData as Omit<PartCategory, 'id'>);
    }
    setIsCategoryModalOpen(false);
  };

  const openDeleteCategoryModal = (category: PartCategory) => {
    setCategoryToDelete(category);
    setIsConfirmDeleteCategoryOpen(true);
  };

  const handleConfirmDeleteCategory = async () => {
    if (categoryToDelete) {
      const isCategoryInUse = parts.some(p => p.categoryId === categoryToDelete.id);
      if (isCategoryInUse) {
        setAlertMessage(`ไม่สามารถลบหมวดหมู่ "${categoryToDelete.name}" ได้ เนื่องจากมีอะไหล่ใช้งานอยู่`);
      } else {
        await deletePartCategory(categoryToDelete.id);
      }
    }
    setIsConfirmDeleteCategoryOpen(false);
    setCategoryToDelete(null);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
          <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">จัดการหมวดหมู่อะไหล่</h3>
            <button
              onClick={onClose}
              type="button"
              className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
            >
              <XMarkIcon className="w-5 h-5" />
              <span className="sr-only">ปิดหน้าต่าง</span>
            </button>
          </div>
          <div className="p-6 overflow-y-auto">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              เพิ่ม, แก้ไข, หรือลบหมวดหมู่สำหรับจัดระเบียบอะไหล่ในสต็อก
            </p>
            <div className="flow-root">
              <ul role="list" className="-my-5 divide-y divide-gray-200 dark:divide-gray-700">
                {partCategories.length > 0 ? partCategories.map((category) => (
                  <li key={category.id} className="py-4 flex items-center space-x-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate dark:text-white">{category.name}</p>
                    </div>
                    <div>
                      <button onClick={() => handleEditCategory(category)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3"><PencilIcon className="h-5 w-5"/></button>
                      <button onClick={() => openDeleteCategoryModal(category)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"><TrashIcon className="h-5 w-5"/></button>
                    </div>
                  </li>
                )) : (
                  <div className="text-center py-6">
                    <TagIcon className="mx-auto h-10 w-10 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">ยังไม่มีหมวดหมู่</p>
                  </div>
                )}
              </ul>
            </div>
          </div>
           <div className="flex justify-between items-center p-4 border-t border-gray-200 dark:border-gray-700">
             <button
                onClick={handleOpenCreateCategoryModal}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-gray-800"
            >
                เพิ่มหมวดหมู่ใหม่
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
            >
              ปิด
            </button>
          </div>
        </div>
      </div>

      <PartCategoryModal 
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSave={handleSaveCategory}
        categoryToEdit={editingCategory}
      />

      <ConfirmationModal
        isOpen={isConfirmDeleteCategoryOpen}
        onClose={() => setIsConfirmDeleteCategoryOpen(false)}
        onConfirm={handleConfirmDeleteCategory}
        title="ยืนยันการลบหมวดหมู่"
        message={`คุณแน่ใจหรือไม่ว่าต้องการลบหมวดหมู่ "${categoryToDelete?.name}"? การกระทำนี้ไม่สามารถย้อนกลับได้`}
      />
       <AlertModal
        isOpen={!!alertMessage}
        onClose={() => setAlertMessage(null)}
        title="ไม่สามารถลบได้"
        message={alertMessage || ''}
      />
    </>
  );
};

export default ManageCategoriesModal;