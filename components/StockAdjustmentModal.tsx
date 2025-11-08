import React, { useState, useEffect } from 'react';
import { Part } from '../types';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  partToAdjust: Part | null;
  onAdjust: (partId: string, adjustment: number) => void;
}

const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({ isOpen, onClose, partToAdjust, onAdjust }) => {
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'reduce'>('add');
  const [quantity, setQuantity] = useState<number>(1);

  useEffect(() => {
    if (isOpen) {
      setAdjustmentType('add');
      setQuantity(1);
    }
  }, [isOpen]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partToAdjust || !quantity || quantity <= 0) {
      alert("กรุณาระบุจำนวนที่ถูกต้อง (มากกว่า 0)");
      return;
    }
    const adjustmentValue = adjustmentType === 'add' ? quantity : -quantity;
    onAdjust(partToAdjust.id, adjustmentValue);
  };

  if (!isOpen || !partToAdjust) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">ปรับสต็อก: {partToAdjust.name}</h3>
          <button onClick={onClose} type="button" className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white">
            <XMarkIcon className="w-5 h-5" />
            <span className="sr-only">ปิดหน้าต่าง</span>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">สต็อกปัจจุบัน: <span className="font-bold text-lg text-gray-900 dark:text-white">{partToAdjust.stock}</span> ชิ้น</p>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">ประเภทการปรับ</label>
            <div className="mt-2 flex items-center space-x-4">
              <label className="cursor-pointer">
                <input type="radio" name="adjustmentType" value="add" checked={adjustmentType === 'add'} onChange={() => setAdjustmentType('add')} className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300" />
                <span className="ml-2">เพิ่มสต็อก</span>
              </label>
              <label className="cursor-pointer">
                <input type="radio" name="adjustmentType" value="reduce" checked={adjustmentType === 'reduce'} onChange={() => setAdjustmentType('reduce')} className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300" />
                <span className="ml-2">ลดสต็อก</span>
              </label>
            </div>
          </div>
          
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">จำนวน*</label>
            <input
              type="number"
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
              min="1"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600"
              required
            />
          </div>

          <div className="flex justify-end pt-4 space-x-2 border-t border-gray-200 dark:border-gray-700">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">ยกเลิก</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">ยืนยันการปรับสต็อก</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockAdjustmentModal;