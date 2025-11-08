import React, { useState } from 'react';
import { Supplier } from '../types';
import { XMarkIcon, PencilIcon, TrashIcon, BuildingStorefrontIcon } from '@heroicons/react/24/outline';
import { useAppContext } from '../context/AppContext';
import SupplierModal from './SupplierModal';
import ConfirmationModal from './ConfirmationModal';
import AlertModal from './AlertModal';

interface ManageSuppliersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ManageSuppliersModal: React.FC<ManageSuppliersModalProps> = ({ isOpen, onClose }) => {
  const { parts, suppliers, addSupplier, updateSupplier, deleteSupplier } = useAppContext();

  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [isConfirmDeleteSupplierOpen, setIsConfirmDeleteSupplierOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const handleOpenCreateSupplierModal = () => {
    setEditingSupplier(null);
    setIsSupplierModalOpen(true);
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setIsSupplierModalOpen(true);
  };
  
  const handleSaveSupplier = async (supplierData: Supplier | Omit<Supplier, 'id'>) => {
    if ('id' in supplierData) {
      await updateSupplier(supplierData as Supplier);
    } else {
      await addSupplier(supplierData as Omit<Supplier, 'id'>);
    }
    setIsSupplierModalOpen(false);
  };

  const openDeleteSupplierModal = (supplier: Supplier) => {
    setSupplierToDelete(supplier);
    setIsConfirmDeleteSupplierOpen(true);
  };

  const handleConfirmDeleteSupplier = async () => {
    if (supplierToDelete) {
      const isSupplierInUse = parts.some(p => p.supplierId === supplierToDelete.id);
      if (isSupplierInUse) {
        setAlertMessage(`ไม่สามารถลบแหล่งสั่งซื้อ "${supplierToDelete.name}" ได้ เนื่องจากมีอะไหล่ใช้งานอยู่`);
      } else {
        await deleteSupplier(supplierToDelete.id);
      }
    }
    setIsConfirmDeleteSupplierOpen(false);
    setSupplierToDelete(null);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
          <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">จัดการแหล่งสั่งซื้อ</h3>
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
              เพิ่ม, แก้ไข, หรือลบข้อมูลแหล่งสั่งซื้อ (Supplier) สำหรับอะไหล่
            </p>
            <div className="flow-root">
              <ul role="list" className="-my-5 divide-y divide-gray-200 dark:divide-gray-700">
                {suppliers.length > 0 ? suppliers.map((supplier) => (
                  <li key={supplier.id} className="py-4 flex items-center space-x-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate dark:text-white">{supplier.name}</p>
                    </div>
                    <div>
                      <button onClick={() => handleEditSupplier(supplier)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3"><PencilIcon className="h-5 w-5"/></button>
                      <button onClick={() => openDeleteSupplierModal(supplier)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"><TrashIcon className="h-5 w-5"/></button>
                    </div>
                  </li>
                )) : (
                  <div className="text-center py-6">
                    <BuildingStorefrontIcon className="mx-auto h-10 w-10 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">ยังไม่มีแหล่งสั่งซื้อ</p>
                  </div>
                )}
              </ul>
            </div>
          </div>
           <div className="flex justify-between items-center p-4 border-t border-gray-200 dark:border-gray-700">
             <button
                onClick={handleOpenCreateSupplierModal}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-gray-800"
            >
                เพิ่มแหล่งสั่งซื้อใหม่
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

      <SupplierModal 
        isOpen={isSupplierModalOpen}
        onClose={() => setIsSupplierModalOpen(false)}
        onSave={handleSaveSupplier}
        supplierToEdit={editingSupplier}
      />

      <ConfirmationModal
        isOpen={isConfirmDeleteSupplierOpen}
        onClose={() => setIsConfirmDeleteSupplierOpen(false)}
        onConfirm={handleConfirmDeleteSupplier}
        title="ยืนยันการลบแหล่งสั่งซื้อ"
        message={`คุณแน่ใจหรือไม่ว่าต้องการลบแหล่งสั่งซื้อ "${supplierToDelete?.name}"? การกระทำนี้ไม่สามารถย้อนกลับได้`}
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

export default ManageSuppliersModal;