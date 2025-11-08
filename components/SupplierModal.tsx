import React, { useState, useEffect } from 'react';
import { Supplier } from '../types';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface SupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (supplier: Supplier | Omit<Supplier, 'id'>) => Promise<void>;
  supplierToEdit?: Supplier | null;
}

const SupplierModal: React.FC<SupplierModalProps> = ({ isOpen, onClose, onSave, supplierToEdit }) => {
  const getInitialState = () => ({ name: '' });
  const [formData, setFormData] = useState(getInitialState());

  useEffect(() => {
    if (isOpen) {
      if (supplierToEdit) {
        setFormData({ name: supplierToEdit.name });
      } else {
        setFormData(getInitialState());
      }
    }
  }, [isOpen, supplierToEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      alert("กรุณากรอกชื่อแหล่งสั่งซื้อ");
      return;
    }

    if (supplierToEdit) {
      await onSave({ ...supplierToEdit, ...formData });
    } else {
      await onSave(formData);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{supplierToEdit ? 'แก้ไขแหล่งสั่งซื้อ' : 'เพิ่มแหล่งสั่งซื้อใหม่'}</h3>
          <button onClick={onClose} type="button" className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white">
            <XMarkIcon className="w-5 h-5" />
            <span className="sr-only">ปิดหน้าต่าง</span>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="supplierName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">ชื่อแหล่งสั่งซื้อ*</label>
            <input
              type="text" id="supplierName" name="name"
              value={formData.name} onChange={handleChange} required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <div className="flex justify-end pt-4 space-x-2 border-t border-gray-200 dark:border-gray-700">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">ยกเลิก</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">บันทึก</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupplierModal;