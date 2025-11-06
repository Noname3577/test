import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { RepairJob, RepairStatus, Part, DeviceType } from '../types';
import { XMarkIcon, TrashIcon } from '@heroicons/react/24/outline';
import AddPartModal from './AddPartModal';

interface RepairJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (job: RepairJob | Omit<RepairJob, 'id' | 'repairCode'>) => Promise<void>;
  jobToEdit?: RepairJob | null;
}

const RepairJobModal: React.FC<RepairJobModalProps> = ({ isOpen, onClose, onSave, jobToEdit }) => {
  const { customers, technicians, parts, addCustomer, addPart } = useAppContext();
  
  const getInitialState = () => ({
    customerId: customers[0]?.id || '',
    deviceType: DeviceType.MOBILE,
    deviceModel: '',
    issueDescription: '',
    technicianId: '',
    laborCost: 0,
  });

  const getInitialNewCustomerState = () => ({
    name: '',
    phone: '',
    email: '',
    lineId: '',
  });

  const [formData, setFormData] = useState(getInitialState());
  const [customerMode, setCustomerMode] = useState<'select' | 'new'>('select');
  const [newCustomer, setNewCustomer] = useState(getInitialNewCustomerState());
  const [assignedParts, setAssignedParts] = useState<{ partId: string; quantity: number }[]>([]);
  const [selectedPart, setSelectedPart] = useState('');
  const [partQuantity, setPartQuantity] = useState(1);
  const [isAddPartModalOpen, setIsAddPartModalOpen] = useState(false);
  
  useEffect(() => {
    if (!isOpen) return;

    if (jobToEdit) {
      setFormData({
        customerId: jobToEdit.customerId,
        deviceType: jobToEdit.deviceType,
        deviceModel: jobToEdit.deviceModel,
        issueDescription: jobToEdit.issueDescription,
        technicianId: jobToEdit.technicianId || '',
        laborCost: jobToEdit.laborCost,
      });
      setAssignedParts(jobToEdit.assignedParts || []);
      setCustomerMode('select');
    } else {
      setFormData(getInitialState());
      setNewCustomer(getInitialNewCustomerState());
      setCustomerMode('select');
      setAssignedParts([]);
      setSelectedPart('');
      setPartQuantity(1);
    }
  }, [isOpen, jobToEdit, customers]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const target = e.currentTarget as HTMLInputElement;
    setFormData(prev => ({
        ...prev, 
        [name]: target.type === 'number' ? (parseFloat(value) || 0) : value
    }));
  };
  
  const handleNewCustomerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewCustomer(prev => ({ ...prev, [name]: value }));
  };

  const handleAddPart = () => {
    if (!selectedPart || partQuantity <= 0) {
      alert("กรุณาเลือกอะไหล่และระบุจำนวนที่ถูกต้อง");
      return;
    }
    setAssignedParts(prev => {
      const existingPart = prev.find(p => p.partId === selectedPart);
      if (existingPart) {
        return prev.map(p => p.partId === selectedPart ? { ...p, quantity: p.quantity + partQuantity } : p);
      }
      return [...prev, { partId: selectedPart, quantity: partQuantity }];
    });
    setSelectedPart('');
    setPartQuantity(1);
  };

  const handleRemovePart = (partIdToRemove: string) => {
    setAssignedParts(prev => prev.filter(p => p.partId !== partIdToRemove));
  };
  
  const handleSaveNewPart = async (partData: Omit<Part, 'id'>) => {
    const newPart = await addPart(partData);
    setIsAddPartModalOpen(false);
    setSelectedPart(newPart.id); // Auto-select the newly created part
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let jobCustomerId: string;

    if (jobToEdit) {
        jobCustomerId = jobToEdit.customerId;
    } else if (customerMode === 'new') {
        if (!newCustomer.name || !newCustomer.phone) {
            alert("กรุณากรอกชื่อและเบอร์โทรของลูกค้าใหม่");
            return;
        }
        jobCustomerId = await addCustomer(newCustomer);
    } else {
        jobCustomerId = formData.customerId;
    }
    
    if (!jobCustomerId || !formData.deviceModel || !formData.issueDescription) {
        alert("กรุณากรอกข้อมูลลูกค้า, รุ่นอุปกรณ์, และอาการเสียให้ครบถ้วน");
        return;
    }

    const totalPartsCost = assignedParts.reduce((total, currentPart) => {
        const partInfo = parts.find(p => p.id === currentPart.partId);
        return total + (partInfo ? partInfo.price * currentPart.quantity : 0);
    }, 0);
    
    const commonData = {
        customerId: jobCustomerId,
        deviceType: formData.deviceType as DeviceType,
        deviceModel: formData.deviceModel,
        issueDescription: formData.issueDescription,
        technicianId: formData.technicianId || undefined,
        laborCost: formData.laborCost,
        partsCost: totalPartsCost,
        assignedParts: assignedParts,
    };

    if (jobToEdit) {
        await onSave({ ...jobToEdit, ...commonData });
    } else {
        await onSave({
            ...commonData,
            status: RepairStatus.RECEIVED,
            receivedDate: new Date().toISOString().split('T')[0],
        });
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4" aria-modal="true" role="dialog">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {jobToEdit ? 'แก้ไขงานซ่อม' : 'สร้างงานซ่อมใหม่'}
          </h3>
          <button
            onClick={onClose}
            type="button"
            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
          >
            <XMarkIcon className="w-5 h-5" />
            <span className="sr-only">ปิดหน้าต่าง</span>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          <fieldset disabled={!!jobToEdit}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">ลูกค้า*</label>
            <div className="mt-2 flex items-center space-x-4">
              <label className={jobToEdit ? "cursor-not-allowed" : ""}>
                <input type="radio" name="customerMode" value="select" checked={customerMode === 'select'} onChange={() => setCustomerMode('select')} className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300" />
                <span className="ml-2">เลือกลูกค้าเดิม</span>
              </label>
               <label className={jobToEdit ? "cursor-not-allowed" : ""}>
                <input type="radio" name="customerMode" value="new" checked={customerMode === 'new'} onChange={() => setCustomerMode('new')} className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300" />
                <span className="ml-2">เพิ่มลูกค้าใหม่</span>
              </label>
            </div>
            
            {customerMode === 'select' ? (
                <div>
                <select
                    id="customerId"
                    name="customerId"
                    value={formData.customerId}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 disabled:bg-gray-200 dark:disabled:bg-gray-700"
                    required
                >
                    <option value="" disabled>เลือกลูกค้า</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name} - {c.phone}</option>)}
                </select>
                </div>
            ) : (
                <div className="space-y-4 p-4 border border-gray-200 dark:border-gray-600 rounded-md">
                    <h4 className="text-md font-medium">ข้อมูลลูกค้าใหม่</h4>
                    <div>
                        <label htmlFor="newCustomerName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">ชื่อ*</label>
                        <input type="text" name="name" id="newCustomerName" value={newCustomer.name} onChange={handleNewCustomerChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" required />
                    </div>
                    <div>
                        <label htmlFor="newCustomerPhone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">เบอร์โทร*</label>
                        <input type="text" name="phone" id="newCustomerPhone" value={newCustomer.phone} onChange={handleNewCustomerChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" required />
                    </div>
                </div>
            )}
          </fieldset>
          
          <div>
            <label htmlFor="deviceType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">ประเภทอุปกรณ์*</label>
            <select
                id="deviceType"
                name="deviceType"
                value={formData.deviceType}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600"
                required
            >
                {Object.values(DeviceType).map(type => (
                    <option key={type} value={type}>{type}</option>
                ))}
            </select>
          </div>

          <div>
            <label htmlFor="deviceModel" className="block text-sm font-medium text-gray-700 dark:text-gray-300">รุ่นอุปกรณ์*</label>
            <input
              type="text"
              id="deviceModel"
              name="deviceModel"
              value={formData.deviceModel}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600"
              required
            />
          </div>

          <div>
            <label htmlFor="issueDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300">อาการเสีย*</label>
            <textarea
              id="issueDescription"
              name="issueDescription"
              rows={3}
              value={formData.issueDescription}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600"
              required
            />
          </div>

          <div>
            <label htmlFor="technicianId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">มอบหมายช่าง (ถ้ามี)</label>
            <select
              id="technicianId"
              name="technicianId"
              value={formData.technicianId}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="">ยังไม่มอบหมาย</option>
              {technicians.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          
          <div>
            <label htmlFor="laborCost" className="block text-sm font-medium text-gray-700 dark:text-gray-300">ค่าแรง (บาท)*</label>
            <input
              type="number"
              id="laborCost"
              name="laborCost"
              value={formData.laborCost}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600"
              required
              min="0"
            />
          </div>

           {/* Parts Section */}
          <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-md font-medium">อะไหล่ที่ใช้</h4>
            <div className="flex items-start md:items-center space-y-2 md:space-y-0 md:space-x-2 flex-col md:flex-row">
                <select 
                    value={selectedPart} 
                    onChange={e => setSelectedPart(e.target.value)}
                    className="flex-grow block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600"
                >
                    <option value="">เลือกอะไหล่</option>
                    {parts.map(p => <option key={p.id} value={p.id}>{p.name} (คงเหลือ: {p.stock})</option>)}
                </select>
                <input 
                    type="number"
                    value={partQuantity}
                    onChange={e => setPartQuantity(Math.max(1, parseInt(e.target.value, 10)))}
                    min="1"
                    className="w-full md:w-20 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600"
                />
                 <div className="flex space-x-2 w-full md:w-auto">
                    <button type="button" onClick={handleAddPart} className="w-full md:w-auto px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm">เพิ่ม</button>
                    <button type="button" onClick={() => setIsAddPartModalOpen(true)} className="w-full md:w-auto px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm">เพิ่มอะไหล่ใหม่</button>
                </div>
            </div>
            {assignedParts.length > 0 && (
                <ul className="mt-2 space-y-2">
                    {assignedParts.map(ap => {
                        const partInfo = parts.find(p => p.id === ap.partId);
                        return (
                            <li key={ap.partId} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-2 rounded-md">
                                <span className="text-sm">{partInfo?.name} x {ap.quantity}</span>
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">฿{((partInfo?.price ?? 0) * ap.quantity).toLocaleString()}</span>
                                    <button type="button" onClick={() => handleRemovePart(ap.partId)} className="text-red-500 hover:text-red-700">
                                        <TrashIcon className="h-4 w-4" />
                                    </button>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
          </div>
          
          <div className="flex justify-end pt-4 space-x-2 border-t border-gray-200 dark:border-gray-700 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {jobToEdit ? 'บันทึกการเปลี่ยนแปลง' : 'สร้างงานซ่อม'}
            </button>
          </div>
        </form>
      </div>
    </div>
    <AddPartModal
        isOpen={isAddPartModalOpen}
        onClose={() => setIsAddPartModalOpen(false)}
        onSave={handleSaveNewPart}
    />
    </>
  );
};

export default RepairJobModal;