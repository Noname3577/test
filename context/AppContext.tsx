import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Customer, Technician, Part, RepairJob, PartCategory, Supplier, RepairStatus } from '../types';
import { db } from '../firebaseConfig';
import { mockCustomers, mockTechnicians, mockParts, mockRepairJobs, mockPartCategories, mockSuppliers } from '../data/mockData';
// Fix: Removed Firebase v9 modular imports as they are not compatible with the older Firebase SDK version that seems to be in use.
import { CubeIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface AppContextType {
  customers: Customer[];
  technicians: Technician[];
  parts: Part[];
  partCategories: PartCategory[];
  suppliers: Supplier[];
  repairJobs: RepairJob[];
  addCustomer: (customer: Omit<Customer, 'id'>) => Promise<string>;
  updateCustomer: (customer: Customer) => Promise<void>;
  deleteCustomer: (customerId: string) => Promise<void>;
  addRepairJob: (job: Omit<RepairJob, 'id' | 'repairCode'>) => Promise<void>;
  updateRepairJob: (job: RepairJob) => Promise<void>;
  deleteRepairJob: (jobId: string) => Promise<void>;
  getRepairJobById: (id: string) => RepairJob | undefined;
  addPart: (part: Omit<Part, 'id'>) => Promise<Part>;
  updatePart: (part: Part) => Promise<void>;
  adjustPartStock: (partId: string, adjustment: number) => Promise<void>;
  addTechnician: (technician: Omit<Technician, 'id'>) => Promise<void>;
  updateTechnician: (technician: Technician) => Promise<void>;
  deleteTechnician: (technicianId: string) => Promise<void>;
  deletePart: (partId: string) => Promise<void>;
  addPartCategory: (category: Omit<PartCategory, 'id'>) => Promise<void>;
  updatePartCategory: (category: PartCategory) => Promise<void>;
  deletePartCategory: (categoryId: string) => Promise<void>;
  addSupplier: (supplier: Omit<Supplier, 'id'>) => Promise<void>;
  updateSupplier: (supplier: Supplier) => Promise<void>;
  deleteSupplier: (supplierId: string) => Promise<void>;
  exportData: () => Promise<void>;
  importData: (file: File) => Promise<void>;
  seedSampleData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [partCategories, setPartCategories] = useState<PartCategory[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [repairJobs, setRepairJobs] = useState<RepairJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fix: Converted Firebase v9 getDocs(collection()) to v8 .collection().get() syntax.
        const [customersSnap, techniciansSnap, partsSnap, repairJobsSnap, partCategoriesSnap, suppliersSnap] = await Promise.all([
          db.collection("customers").get(),
          db.collection("technicians").get(),
          db.collection("parts").get(),
          db.collection("repairJobs").get(),
          db.collection("partCategories").get(),
          db.collection("suppliers").get(),
        ]);

        setCustomers(customersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer)));
        setTechnicians(techniciansSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Technician)));
        setParts(partsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Part)));
        setPartCategories(partCategoriesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as PartCategory)));
        setSuppliers(suppliersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Supplier)));
        setRepairJobs(repairJobsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as RepairJob)));
      } catch (err: any) {
        console.error("Failed to load data from Firestore", err);
        let errorMessage = "ไม่สามารถเชื่อมต่อฐานข้อมูลได้ กรุณาตรวจสอบการตั้งค่า Firebase";
        if (err.message && err.message.includes("Could not reach Cloud Firestore backend")) {
          errorMessage = `ไม่สามารถเชื่อมต่อกับฐานข้อมูล Firestore ได้\n\nกรุณาตรวจสอบสิ่งต่อไปนี้:\n1. การเชื่อมต่ออินเทอร์เน็ตของคุณ\n2. คุณได้ใส่ข้อมูลการตั้งค่าที่ถูกต้องจากโปรเจกต์ Firebase ของคุณในไฟล์ \`firebaseConfig.ts\` แล้ว\n3. คุณได้สร้างฐานข้อมูล Cloud Firestore ใน Firebase Console สำหรับโปรเจกต์นี้แล้ว (เลือกโหมดทดสอบเพื่อเริ่มต้นได้ง่าย)\n4. กฎความปลอดภัย (Security Rules) ของ Firestore อนุญาตให้มีการอ่านและเขียนข้อมูล (สำหรับทดสอบ: allow read, write: if true;)`;
        } else if (err.message && err.message.includes("Missing or insufficient permissions")) {
            errorMessage = `ไม่มีสิทธิ์ในการเข้าถึงข้อมูล (Missing or insufficient permissions)\n\nปัญหานี้เกิดจาก "กฎความปลอดภัย" (Security Rules) ในโปรเจกต์ Firebase ของคุณกำลังบล็อกการเข้าถึงจากแอปพลิเคชัน\n\n**วิธีแก้ไข (สำหรับช่วงพัฒนา):**\n1. ไปที่ Firebase Console ของโปรเจกต์คุณ\n2. ไปที่เมนู **Build > Cloud Firestore**\n3. เลือกแท็บ **Rules**\n4. แก้ไขโค้ดใน Rules Editor ให้เป็นดังนี้:\n\n\`\`\`\nrules_version = '2';\nservice cloud.firestore {\n  match /databases/{database}/documents {\n    match /{document=**} {\n      allow read, write: if true;\n    }\n  }\n}\n\`\`\`\n\n5. กด **Publish** เพื่อบันทึกการเปลี่ยนแปลง\n\n**คำเตือน:** กฎนี้อนุญาตให้ทุกคนเข้าถึงข้อมูลได้ เหมาะสำหรับช่วงเริ่มต้นพัฒนาเท่านั้น อย่าใช้กฎนี้ในแอปพลิเคชันที่ใช้งานจริง`;
        }
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const addCustomer = async (customerData: Omit<Customer, 'id'>): Promise<string> => {
    // Fix: Converted Firebase v9 addDoc(collection()) to v8 .collection().add() syntax.
    const docRef = await db.collection("customers").add(customerData);
    const newCustomer: Customer = { id: docRef.id, ...customerData };
    setCustomers(prev => [...prev, newCustomer]);
    return docRef.id;
  };

  const updateCustomer = async (updatedCustomer: Customer) => {
    const { id, ...customerData } = updatedCustomer;
    // Fix: Converted Firebase v9 updateDoc(doc()) to v8 .collection().doc().update() syntax.
    await db.collection("customers").doc(id).update(customerData);
    setCustomers(prev => prev.map(c => c.id === id ? updatedCustomer : c));
  };

  const deleteCustomer = async (customerId: string) => {
    // Fix: Converted Firebase v9 deleteDoc(doc()) to v8 .collection().doc().delete() syntax.
    await db.collection("customers").doc(customerId).delete();
    setCustomers(prev => prev.filter(c => c.id !== customerId));
  };
  
  const handleStockForJobChange = async (newJob: RepairJob | null, oldJob: RepairJob | null) => {
    const stockAffectingStatuses = [RepairStatus.COMPLETED, RepairStatus.RETURNED];
    const stockChanges = new Map<string, number>();

    // Restore stock from old job if it was affecting stock
    if (oldJob && stockAffectingStatuses.includes(oldJob.status) && oldJob.assignedParts) {
        for (const { partId, quantity } of oldJob.assignedParts) {
            stockChanges.set(partId, (stockChanges.get(partId) || 0) + quantity);
        }
    }

    // Deduct stock for new job if it is affecting stock
    if (newJob && stockAffectingStatuses.includes(newJob.status) && newJob.assignedParts) {
        for (const { partId, quantity } of newJob.assignedParts) {
            stockChanges.set(partId, (stockChanges.get(partId) || 0) - quantity);
        }
    }

    if (stockChanges.size === 0) return;

    // Validation
    const partsToUpdate: Part[] = [];
    const currentPartsMap = new Map(parts.map(p => [p.id, p]));
    let validationPassed = true;

    for (const [partId, change] of stockChanges.entries()) {
        const part = currentPartsMap.get(partId);
        if (!part) {
            console.warn(`Part with ID ${partId} not found in state during stock update.`);
            continue;
        }
        
        const newStock = part.stock + change;
        
        if (newStock < 0) {
            alert(`ไม่สามารถดำเนินการได้ สต็อกอะไหล่ "${part.name}" ไม่เพียงพอ (มีในสต็อก ${part.stock} ชิ้น, แต่ต้องการใช้ ${part.stock - newStock} ชิ้น)`);
            validationPassed = false;
            break;
        }
        partsToUpdate.push({ ...part, stock: newStock });
    }

    if (!validationPassed) {
        throw new Error("Insufficient stock.");
    }

    // Commit
    if (partsToUpdate.length > 0) {
        const batch = db.batch();
        partsToUpdate.forEach(part => {
            const partRef = db.collection("parts").doc(part.id);
            batch.update(partRef, { stock: part.stock });
        });
        await batch.commit();

        // Update local state
        setParts(currentParts => {
            const newPartsMap = new Map(currentParts.map(p => [p.id, p]));
            partsToUpdate.forEach(updatedPart => {
                newPartsMap.set(updatedPart.id, updatedPart);
            });
            return Array.from(newPartsMap.values());
        });
    }
  };
  
  const addRepairJob = async (jobData: Omit<RepairJob, 'id' | 'repairCode'>) => {
    const count = repairJobs.length;
    const repairCode = `RP-${String(count + 1).padStart(6, '0')}`;
    const jobPayload = { ...jobData, repairCode };
    
    const docRef = await db.collection("repairJobs").add(jobPayload);
    const newJob: RepairJob = { id: docRef.id, ...jobPayload };

    try {
        await handleStockForJobChange(newJob, null);
        setRepairJobs(prev => [...prev, newJob]);
    } catch (error) {
        console.error("Stock update failed on add, reverting job creation.", error);
        await db.collection("repairJobs").doc(newJob.id).delete();
        throw error;
    }
  };
  
  const updateRepairJob = async (updatedJob: RepairJob) => {
    const oldJob = repairJobs.find(j => j.id === updatedJob.id);
    if (!oldJob) return;

    try {
        await handleStockForJobChange(updatedJob, oldJob);
        
        const { id, ...jobData } = updatedJob;
        await db.collection("repairJobs").doc(id).update(jobData);
        setRepairJobs(prev => prev.map(j => j.id === id ? updatedJob : j));
    } catch (error) {
        console.error("Failed to update repair job:", error);
    }
  };

  const deleteRepairJob = async (jobId: string) => {
    const jobToDelete = repairJobs.find(j => j.id === jobId);
    if (!jobToDelete) return;

    try {
        await handleStockForJobChange(null, jobToDelete);

        await db.collection("repairJobs").doc(jobId).delete();
        setRepairJobs(prev => prev.filter(j => j.id !== jobId));
    } catch (error) {
        console.error("Failed to delete repair job:", error);
    }
  };

  const getRepairJobById = (id: string) => {
    return repairJobs.find(job => job.id === id);
  };

  const addPart = async (partData: Omit<Part, 'id'>): Promise<Part> => {
    // Fix: Converted Firebase v9 addDoc(collection()) to v8 .collection().add() syntax.
    const docRef = await db.collection("parts").add(partData);
    const newPart: Part = { id: docRef.id, ...partData };
    setParts(prev => [...prev, newPart]);
    return newPart;
  };

  const updatePart = async (updatedPart: Part) => {
    const { id, ...partData } = updatedPart;
    await db.collection("parts").doc(id).update(partData);
    setParts(prev => prev.map(p => p.id === id ? updatedPart : p));
  };

  const adjustPartStock = async (partId: string, adjustment: number) => {
    const part = parts.find(p => p.id === partId);
    if (!part) {
        console.error(`Part with ID ${partId} not found.`);
        throw new Error("Part not found.");
    }

    const newStock = part.stock + adjustment;
    if (newStock < 0) {
        alert(`ไม่สามารถปรับสต็อกได้ สต็อกคงเหลือไม่เพียงพอ (ปัจจุบัน: ${part.stock}, ต้องการลด: ${-adjustment})`);
        throw new Error("Insufficient stock for adjustment.");
    }

    const updatedPart = { ...part, stock: newStock };
    
    await db.collection("parts").doc(partId).update({ stock: newStock });
    setParts(prev => prev.map(p => p.id === partId ? updatedPart : p));
  };

  const addTechnician = async (technicianData: Omit<Technician, 'id'>) => {
    const docRef = await db.collection("technicians").add(technicianData);
    const newTechnician: Technician = { id: docRef.id, ...technicianData };
    setTechnicians(prev => [...prev, newTechnician]);
  };

  const updateTechnician = async (updatedTechnician: Technician) => {
    const { id, ...technicianData } = updatedTechnician;
    await db.collection("technicians").doc(id).update(technicianData);
    setTechnicians(prev => prev.map(t => t.id === id ? updatedTechnician : t));
  };

  const deleteTechnician = async (technicianId: string) => {
    // Fix: Converted Firebase v9 deleteDoc(doc()) to v8 .collection().doc().delete() syntax.
    await db.collection("technicians").doc(technicianId).delete();
    setTechnicians(prev => prev.filter(t => t.id !== technicianId));
  };

  const deletePart = async (partId: string) => {
    // Fix: Converted Firebase v9 deleteDoc(doc()) to v8 .collection().doc().delete() syntax.
    await db.collection("parts").doc(partId).delete();
    setParts(prev => prev.filter(p => p.id !== partId));
  };

  const addPartCategory = async (categoryData: Omit<PartCategory, 'id'>) => {
    const docRef = await db.collection("partCategories").add(categoryData);
    const newCategory: PartCategory = { id: docRef.id, ...categoryData };
    setPartCategories(prev => [...prev, newCategory]);
  };

  const updatePartCategory = async (updatedCategory: PartCategory) => {
    const { id, ...categoryData } = updatedCategory;
    await db.collection("partCategories").doc(id).update(categoryData);
    setPartCategories(prev => prev.map(c => c.id === id ? updatedCategory : c));
  };
  
  const deletePartCategory = async (categoryId: string) => {
    await db.collection("partCategories").doc(categoryId).delete();
    setPartCategories(prev => prev.filter(c => c.id !== categoryId));
  };

  const addSupplier = async (supplierData: Omit<Supplier, 'id'>) => {
    const docRef = await db.collection("suppliers").add(supplierData);
    const newSupplier: Supplier = { id: docRef.id, ...supplierData };
    setSuppliers(prev => [...prev, newSupplier]);
  };

  const updateSupplier = async (updatedSupplier: Supplier) => {
    const { id, ...supplierData } = updatedSupplier;
    await db.collection("suppliers").doc(id).update(supplierData);
    setSuppliers(prev => prev.map(s => s.id === id ? updatedSupplier : s));
  };

  const deleteSupplier = async (supplierId: string) => {
    await db.collection("suppliers").doc(supplierId).delete();
    setSuppliers(prev => prev.filter(s => s.id !== supplierId));
  };

  const exportData = async () => {
    try {
      const dataToExport = {
        customers,
        technicians,
        parts,
        repairJobs,
        partCategories,
        suppliers,
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
        setIsLoading(true);
        const content = event.target?.result;
        if (typeof content !== 'string') throw new Error("ไม่สามารถอ่านเนื้อหาไฟล์ได้");
        
        const parsedData = JSON.parse(content);
        if (!parsedData.customers || !parsedData.technicians || !parsedData.parts || !parsedData.repairJobs) {
          throw new Error("รูปแบบไฟล์สำรองไม่ถูกต้อง");
        }

        const collections: { [key: string]: any[] } = {
            customers: parsedData.customers || [],
            technicians: parsedData.technicians || [],
            parts: parsedData.parts || [],
            repairJobs: parsedData.repairJobs || [],
            partCategories: parsedData.partCategories || [],
            suppliers: parsedData.suppliers || [],
        };

        // Clear existing collections
        for (const key of Object.keys(collections)) {
            // Fix: Converted Firebase v9 getDocs(collection()) to v8 .collection().get() and deleteDoc() to .delete() syntax.
            const snapshot = await db.collection(key).get();
            const deletePromises = snapshot.docs.map(d => d.ref.delete());
            await Promise.all(deletePromises);
        }

        // Add new data from backup file
        for (const key of Object.keys(collections)) {
            // Fix: Converted Firebase v9 setDoc/addDoc to v8 .set()/.add() syntax.
            const addPromises = collections[key].map((item: any) => {
                const { id, ...data } = item;
                if (id) {
                    return db.collection(key).doc(id).set(data);
                }
                return db.collection(key).add(data);
            });
            await Promise.all(addPromises);
        }
        
        alert("นำเข้าข้อมูลสำเร็จ! แอปพลิเคชันจะทำการรีโหลด");
        window.location.reload();

      } catch (error) {
        console.error("Failed to import data:", error);
        alert(`เกิดข้อผิดพลาดในการนำเข้าข้อมูล: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
        alert("เกิดข้อผิดพลาดในการอ่านไฟล์");
    };
    reader.readAsText(file);
  };

  const seedSampleData = async () => {
    try {
      setIsLoading(true);

      const collections: { [key: string]: any[] } = {
        customers: mockCustomers,
        technicians: mockTechnicians,
        parts: mockParts,
        repairJobs: mockRepairJobs,
        partCategories: mockPartCategories,
        suppliers: mockSuppliers,
      };

      // Clear existing collections
      for (const key of Object.keys(collections)) {
        const snapshot = await db.collection(key).get();
        const deletePromises = snapshot.docs.map(d => d.ref.delete());
        await Promise.all(deletePromises);
      }

      // Add mock data
      for (const key of Object.keys(collections)) {
        const addPromises = collections[key].map((item: any) => {
          const { id, ...data } = item;
          // Use set with the predefined ID from mock data to maintain relationships
          return db.collection(key).doc(id).set(data);
        });
        await Promise.all(addPromises);
      }
      
      alert("สร้างข้อมูลตัวอย่างสำเร็จ! แอปพลิเคชันจะทำการรีโหลด");
      window.location.reload();

    } catch (error) {
      console.error("Failed to seed sample data:", error);
      alert(`เกิดข้อผิดพลาดในการสร้างข้อมูลตัวอย่าง: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsLoading(false);
    }
  };


  const value = {
    customers,
    technicians,
    parts,
    partCategories,
    suppliers,
    repairJobs,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addRepairJob,
    updateRepairJob,
    deleteRepairJob,
    getRepairJobById,
    addPart,
    updatePart,
    adjustPartStock,
    addTechnician,
    updateTechnician,
    deleteTechnician,
    deletePart,
    addPartCategory,
    updatePartCategory,
    deletePartCategory,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    exportData,
    importData,
    seedSampleData,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
        <div className="flex items-center text-xl font-semibold text-gray-800 dark:text-white">
            <CubeIcon className="animate-spin h-8 w-8 mr-3 text-blue-500" />
            กำลังเชื่อมต่อฐานข้อมูล...
        </div>
      </div>
    );
  }

  if (error) {
     return (
      <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900 p-4">
        <div className="w-full max-w-2xl text-center bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
           <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">เกิดข้อผิดพลาดในการเชื่อมต่อ</h2>
          <pre className="mt-4 text-left whitespace-pre-wrap bg-red-50 dark:bg-gray-700 p-4 rounded-md text-sm leading-6 text-red-700 dark:text-red-300 font-mono">{error}</pre>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            หากปัญหายังคงอยู่ กรุณาตรวจสอบ Console ของเบราว์เซอร์เพื่อดูข้อมูลทางเทคนิคเพิ่มเติม
          </p>
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