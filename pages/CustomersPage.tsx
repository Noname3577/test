import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import ConfirmationModal from '../components/ConfirmationModal';
import CustomerModal from '../components/CustomerModal';
import { Customer } from '../types';
import AlertModal from '../components/AlertModal';

const CustomersPage: React.FC = () => {
  const { customers, repairJobs, deleteCustomer, addCustomer, updateCustomer } = useAppContext();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const openDeleteModal = (customerId: string) => {
    const hasJobs = repairJobs.some(job => job.customerId === customerId);
    if (hasJobs) {
      const customerName = customers.find(c => c.id === customerId)?.name || 'ลูกค้ารายนี้';
      setAlertMessage(`ไม่สามารถลบลูกค้า "${customerName}" ได้ เนื่องจากยังมีงานซ่อมที่เกี่ยวข้องอยู่ในระบบ`);
      return;
    }
    setCustomerToDelete(customerId);
    setIsConfirmModalOpen(true);
  };

  const closeDeleteModal = () => {
    setCustomerToDelete(null);
    setIsConfirmModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (customerToDelete) {
      await deleteCustomer(customerToDelete);
      closeDeleteModal();
    }
  };

  const handleOpenCreateModal = () => {
    setEditingCustomer(null);
    setIsModalOpen(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsModalOpen(true);
  };

  const handleSaveCustomer = async (customerData: Customer | Omit<Customer, 'id'>) => {
    if ('id' in customerData) {
      await updateCustomer(customerData as Customer);
    } else {
      await addCustomer(customerData as Omit<Customer, 'id'>);
    }
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold">ลูกค้าทั้งหมด</h2>
          <button 
            onClick={handleOpenCreateModal}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            เพิ่มลูกค้าใหม่
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ชื่อ</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">เบอร์โทร</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">อีเมล</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ที่อยู่ลูกค้า</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">จัดการ</span></th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{customer.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{customer.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{customer.email || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{customer.address || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleEditCustomer(customer)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3"><PencilIcon className="h-5 w-5"/></button>
                    <button onClick={() => openDeleteModal(customer.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"><TrashIcon className="h-5 w-5"/></button>
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
        title="ยืนยันการลบลูกค้า"
        message={`คุณแน่ใจหรือไม่ว่าต้องการลบลูกค้า "${customers.find(c => c.id === customerToDelete)?.name}"? การกระทำนี้ไม่สามารถย้อนกลับได้`}
      />
      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCustomer}
        customerToEdit={editingCustomer}
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

export default CustomersPage;