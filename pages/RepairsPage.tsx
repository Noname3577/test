import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import StatusBadge from '../components/StatusBadge';
import { PencilIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { RepairJob, RepairStatus } from '../types';
import RepairJobModal from '../components/RepairJobModal';
import ConfirmationModal from '../components/ConfirmationModal';

const RepairsPage: React.FC = () => {
  const { repairJobs, customers, updateRepairJob, addRepairJob, deleteRepairJob } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<RepairJob | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<RepairStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusChangeData, setStatusChangeData] = useState<{ jobId: string; newStatus: RepairStatus; oldStatus: RepairStatus } | null>(null);


  const getCustomerName = (id: string) => customers.find(c => c.id === id)?.name || 'N/A';
  
  const handleStatusSelect = (job: RepairJob, newStatus: RepairStatus) => {
    if (job.status !== newStatus) {
      setStatusChangeData({ jobId: job.id, oldStatus: job.status, newStatus });
    }
  };

  const handleConfirmStatusChange = async () => {
    if (statusChangeData) {
      const { jobId, newStatus } = statusChangeData;
      const job = repairJobs.find(j => j.id === jobId);
      if (job) {
        await updateRepairJob({ ...job, status: newStatus });
      }
      setStatusChangeData(null);
    }
  };
  
  const handleCancelStatusChange = () => {
    setStatusChangeData(null);
  };

  const handleSaveJob = async (jobData: RepairJob | Omit<RepairJob, 'id' | 'repairCode'>) => {
    if ('id' in jobData) {
      await updateRepairJob(jobData as RepairJob);
    } else {
      await addRepairJob(jobData as Omit<RepairJob, 'id' | 'repairCode'>);
    }
    setEditingJob(null);
  };

  const handleOpenCreateModal = () => {
    setEditingJob(null);
    setIsModalOpen(true);
  };

  const handleEditJob = (job: RepairJob) => {
    setEditingJob(job);
    setIsModalOpen(true);
  };

  const openDeleteModal = (jobId: string) => {
    setJobToDelete(jobId);
    setIsConfirmModalOpen(true);
  };

  const closeDeleteModal = () => {
    setJobToDelete(null);
    setIsConfirmModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (jobToDelete) {
      await deleteRepairJob(jobToDelete);
      closeDeleteModal();
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingJob(null);
  }

  const filteredJobs = useMemo(() => {
    let jobs = repairJobs;

    if (statusFilter !== 'all') {
      jobs = jobs.filter(job => job.status === statusFilter);
    }

    if (searchQuery.trim() !== '') {
      const lowercasedQuery = searchQuery.toLowerCase();
      const strippedQuery = lowercasedQuery.replace(/-/g, '');
      jobs = jobs.filter(job => {
        const customer = customers.find(c => c.id === job.customerId);
        return (
          job.repairCode.toLowerCase().includes(lowercasedQuery) ||
          (customer?.name.toLowerCase().includes(lowercasedQuery) ?? false) ||
          (customer?.phone.replace(/-/g, '').includes(strippedQuery) ?? false) ||
          job.deviceModel.toLowerCase().includes(lowercasedQuery)
        );
      });
    }

    return jobs.sort((a, b) => b.repairCode.localeCompare(a.repairCode));
  }, [repairJobs, statusFilter, searchQuery, customers]);


  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-lg font-semibold">งานซ่อมทั้งหมด</h2>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                    <label htmlFor="search-repair" className="sr-only">ค้นหา</label>
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                        id="search-repair"
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="ค้นหา (รหัส, ลูกค้า, รุ่น, เบอร์โทร)..."
                        className="block w-full rounded-md border-gray-300 bg-white py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-indigo-500 focus:text-gray-900 focus:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                    />
                </div>
                <div>
                    <label htmlFor="status-filter" className="sr-only">กรองตามสถานะ</label>
                    <select
                        id="status-filter"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as RepairStatus | 'all')}
                        className="block w-full sm:w-auto rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 pl-3 pr-10 text-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                    >
                        <option value="all">สถานะทั้งหมด</option>
                        {Object.values(RepairStatus).map(status => (
                        <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                </div>
                <button 
                    onClick={handleOpenCreateModal}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 w-full sm:w-auto"
                >
                    สร้างงานซ่อมใหม่
                </button>
            </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">รหัสงานซ่อม</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ลูกค้า</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ประเภทอุปกรณ์</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">อุปกรณ์</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ราคารวม</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">สถานะ</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">วันที่รับเครื่อง</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">จัดการ</span></th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredJobs.map((job) => (
                <tr key={job.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{job.repairCode}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{getCustomerName(job.customerId)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{job.deviceType}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{job.deviceModel}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    ฿{(job.laborCost + job.partsCost).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <select
                          value={job.status}
                          onChange={(e) => handleStatusSelect(job, e.target.value as RepairStatus)}
                          className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-1 pl-2 pr-8 text-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                      >
                          {Object.values(RepairStatus).map(status => (
                              <option key={status} value={status}>{status}</option>
                          ))}
                      </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{job.receivedDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleEditJob(job)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3"><PencilIcon className="h-5 w-5"/></button>
                    <button onClick={() => openDeleteModal(job.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"><TrashIcon className="h-5 w-5"/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <RepairJobModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveJob}
        jobToEdit={editingJob}
      />
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDelete}
        title="ยืนยันการลบงานซ่อม"
        message={`คุณแน่ใจหรือไม่ว่าต้องการลบงานซ่อมรหัส "${repairJobs.find(j => j.id === jobToDelete)?.repairCode}"? การกระทำนี้ไม่สามารถย้อนกลับได้`}
      />
      <ConfirmationModal
        isOpen={!!statusChangeData}
        onClose={handleCancelStatusChange}
        onConfirm={handleConfirmStatusChange}
        title="ยืนยันการเปลี่ยนสถานะ"
        message={
          statusChangeData 
            ? `คุณแน่ใจหรือไม่ว่าต้องการเปลี่ยนสถานะงานซ่อม "${repairJobs.find(j => j.id === statusChangeData.jobId)?.repairCode}" จาก "${statusChangeData.oldStatus}" เป็น "${statusChangeData.newStatus}"?`
            : ''
        }
      />
    </>
  );
};

export default RepairsPage;