import Dexie, { Table } from 'dexie';
import { Customer, Technician, Part, RepairJob } from './types';
import { mockCustomers, mockTechnicians, mockParts, mockRepairJobs } from './data/mockData';

// Fix: Refactored to use direct Dexie instantiation instead of subclassing.
// This resolves the TypeScript error "Property 'version' does not exist on type 'RepairSystemDB'"
// which can occur due to environment-specific TypeScript configurations.
export const db = new Dexie('RepairSystemDB') as Dexie & {
  customers: Table<Customer, string>;
  technicians: Table<Technician, string>;
  parts: Table<Part, string>;
  repairJobs: Table<RepairJob, string>;
};

db.version(1).stores({
  customers: 'id, name, phone',
  technicians: 'id, name',
  parts: 'id, name',
  repairJobs: 'id, repairCode, customerId, technicianId, status, receivedDate',
});

export async function populateDatabase() {
  const customerCount = await db.customers.count();
  if (customerCount === 0) {
    try {
      console.log("Database is empty. Populating with initial data...");
      await db.customers.bulkAdd(mockCustomers);
      await db.technicians.bulkAdd(mockTechnicians);
      await db.parts.bulkAdd(mockParts);
      await db.repairJobs.bulkAdd(mockRepairJobs);
      console.log("Database populated successfully.");
    } catch (error) {
      console.error("Failed to populate database:", error);
    }
  }
}
