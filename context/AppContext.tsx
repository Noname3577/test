import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Customer, Technician, Part, RepairJob } from '../types';
import { db, populateDatabase } from '../db';
import { CubeIcon } from '@heroicons/react/24/outline';

interface AppContextType {
  customers: Customer[];
  technicians: Technician[];
  parts: Part[];
  repairJobs: RepairJob[];
  addCustomer: (customer: Omit<Customer, 'id'>) => Promise<string>;
  updateCustomer: (customer: Customer) => Promise<void>;
  deleteCustomer: (customerId: string) => Promise<void>;
  addRepairJob: (job: Omit<RepairJob, 'id' | 'repairCode'>) => Promise<void>;
  updateRepairJob: (job: RepairJob) => Promise<void>;
  deleteRepairJob: (jobId: string) => Promise<void>;
  getRepairJobById: (id: string) => RepairJob | undefined;
  addPart: (part: Omit<Part, 'id'>) => Promise<Part>;
  deleteTechnician: (technicianId: string) => Promise<void>;
  deletePart: (partId: string) => Promise<void>;
  exportData: () => Promise<void>;
  importData: (file: File) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [repairJobs, setRepairJobs] = useState<RepairJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        await populateDatabase();
        const [c, t, p, rj] = await Promise.all([
          db.customers.toArray(),
          db.technicians.toArray(),
          db.parts.toArray(),
          db.repairJobs.toArray(),
        ]);
        setCustomers(c);
        setTechnicians(t);
        setParts(p);
        setRepairJobs(rj);
      } catch (error) {
        console.error("Failed to load data from IndexedDB", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const addCustomer = async (customerData: Omit<Customer, 'id'>): Promise<string> => {
    const newCustomer: Customer = {
      id: `C${Date.now()}`,
      ...customerData,
    };
    await db.customers.add(newCustomer);
    setCustomers(prev => [...prev, newCustomer]);
    return newCustomer.id;
  };

  const updateCustomer = async (updatedCustomer: Customer) => {
    await db.customers.put(updatedCustomer);
    setCustomers(prev => prev.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
  };

  const deleteCustomer = async (customerId: string) => {
    await db.customers.delete(customerId);
    setCustomers(prev => prev.filter(c => c.id !== customerId));
  };
  
  const addRepairJob = async (jobData: Omit<RepairJob, 'id' | 'repairCode'>) => {
    const count = await db.repairJobs.count();
    const newJob: RepairJob = {
        id: `R${Date.now()}`,
        repairCode: `RP-${String(count + 1).padStart(6, '0')}`,
        ...jobData,
    };
    await db.repairJobs.add(newJob);
    setRepairJobs(prev => [...prev, newJob]);
  };
  
  const updateRepairJob = async (updatedJob: RepairJob) => {
    await db.repairJobs.put(updatedJob);
    setRepairJobs(prev => prev.map(j => j.id === updatedJob.id ? updatedJob : j));
  };

  const deleteRepairJob = async (jobId: string) => {
    await db.repairJobs.delete(jobId);
    setRepairJobs(prev => prev.filter(j => j.id !== jobId));
  };

  const getRepairJobById = (id: string) => {
    return repairJobs.find(job => job.id === id);
  };

  const addPart = async (partData: Omit<Part, 'id'>): Promise<Part> => {
    const newPart: Part = {
      id: `P${Date.now()}`,
      ...partData,
    };
    await db.parts.add(newPart);
    setParts(prev => [...prev, newPart]);
    return newPart;
  };

  const deleteTechnician = async (technicianId: string) => {
    await db.technicians.delete(technicianId);
    setTechnicians(prev => prev.filter(t => t.id !== technicianId));
  };

  const deletePart = async (partId: string) => {
    await db.parts.delete(partId);
    setParts(prev => prev.filter(p => p.id !== partId));
  };

  const exportData = async () => {
    try {
      const dataToExport = {
        customers: await db.customers.toArray(),
        technicians: await db.technicians.toArray(),
        parts: await db.parts.toArray(),
        repairJobs: await db.repairJobs.toArray(),
      };
      
      const jsonString = JSON.stringify(dataToExport, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      a.download = `repairsys-backup-${timestamp}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error("Failed to export data:", error);
      alert("เกิดข้อผิดพลาดในการส่งออกข้อมูล!");
    }
  };

  const importData = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result;
        if (typeof content !== 'string') {
          throw new Error("ไม่สามารถอ่านเนื้อหาไฟล์ได้");
        }
        const parsedData = JSON.parse(content);

        if (!parsedData.customers || !parsedData.technicians || !parsedData.parts || !parsedData.repairJobs) {
          throw new Error("รูปแบบไฟล์สำรองไม่ถูกต้อง");
        }

        await db.transaction('rw', db.customers, db.technicians, db.parts, db.repairJobs, async () => {
          await db.customers.clear();
          await db.technicians.clear();
          await db.parts.clear();
          await db.repairJobs.clear();

          await db.customers.bulkPut(parsedData.customers);
          await db.technicians.bulkPut(parsedData.technicians);
          await db.parts.bulkPut(parsedData.parts);
          await db.repairJobs.bulkPut(parsedData.repairJobs);
        });
        
        alert("นำเข้าข้อมูลสำเร็จ! แอปพลิเคชันจะทำการรีโหลด");
        window.location.reload();

      } catch (error) {
        console.error("Failed to import data:", error);
        alert(`เกิดข้อผิดพลาดในการนำเข้าข้อมูล: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };
    reader.onerror = () => {
        alert("เกิดข้อผิดพลาดในการอ่านไฟล์");
    };
    reader.readAsText(file);
  };


  const value = {
    customers,
    technicians,
    parts,
    repairJobs,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addRepairJob,
    updateRepairJob,
    deleteRepairJob,
    getRepairJobById,
    addPart,
    deleteTechnician,
    deletePart,
    exportData,
    importData,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
        <div className="flex items-center text-xl font-semibold text-gray-800 dark:text-white">
            <CubeIcon className="animate-spin h-8 w-8 mr-3 text-blue-500" />
            กำลังโหลดฐานข้อมูล...
        </div>
      </div>
    );
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};