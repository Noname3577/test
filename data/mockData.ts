import { Customer, Technician, Part, RepairJob, RepairStatus } from '../types';

export const mockCustomers: Customer[] = [
  { id: 'C001', name: 'สมชาย ใจดี', phone: '081-234-5678', lineId: 'somchai.j', email: 'somchai.j@email.com' },
  { id: 'C002', name: 'สมหญิง จริงใจ', phone: '082-345-6789', email: 'somy@email.com' },
  { id: 'C003', name: 'อาทิตย์ ตั้งตรง', phone: '083-456-7890', lineId: 'artit.t' },
];

export const mockTechnicians: Technician[] = [
  { id: 'T001', name: 'วิชัย ชำนาญ', specialty: 'iPhone & iPad' },
  { id: 'T002', name: 'มานะ อดทน', specialty: 'Android & Laptops' },
  { id: 'T003', name: 'ปรีชา สามารถ', specialty: 'General Hardware' },
];

export const mockParts: Part[] = [
  { id: 'P001', name: 'iPhone 13 Screen', stock: 5, price: 2500 },
  { id: 'P002', name: 'MacBook Pro Battery A2141', stock: 3, price: 3500 },
  { id: 'P003', name: 'Samsung S22 Battery', stock: 10, price: 1800 },
  { id: 'P004', name: 'Laptop RAM DDR4 8GB', stock: 15, price: 1200 },
  { id: 'P005', name: 'SSD 512GB NVMe', stock: 8, price: 2200 },
];

export const mockRepairJobs: RepairJob[] = [
  {
    id: 'R001',
    repairCode: 'RP-000001',
    customerId: 'C001',
    technicianId: 'T001',
    deviceModel: 'iPhone 13 Pro',
    issueDescription: 'หน้าจอแตก',
    status: RepairStatus.COMPLETED,
    receivedDate: '2023-10-01',
    completedDate: '2023-10-03',
    laborCost: 800,
    partsCost: 2500,
    assignedParts: [{ partId: 'P001', quantity: 1 }],
  },
  {
    id: 'R002',
    repairCode: 'RP-000002',
    customerId: 'C002',
    technicianId: 'T002',
    deviceModel: 'MacBook Pro 16"',
    issueDescription: 'แบตเตอรี่เสื่อม',
    status: RepairStatus.IN_PROGRESS,
    receivedDate: '2023-10-02',
    laborCost: 1500,
    partsCost: 3500,
    assignedParts: [{ partId: 'P002', quantity: 1 }],
    notes: 'ลูกค้าต้องการให้รีบดำเนินการ',
  },
  {
    id: 'R003',
    repairCode: 'RP-000003',
    customerId: 'C003',
    deviceModel: 'Samsung S22 Ultra',
    issueDescription: 'เปิดไม่ติด',
    status: RepairStatus.AWAITING_PARTS,
    receivedDate: '2023-10-03',
    laborCost: 0,
    partsCost: 0,
    assignedParts: [],
  },
    {
    id: 'R004',
    repairCode: 'RP-000004',
    customerId: 'C001',
    technicianId: 'T002',
    deviceModel: 'Dell XPS 15',
    issueDescription: 'ต้องการอัปเกรด RAM และ SSD',
    status: RepairStatus.RETURNED,
    receivedDate: '2023-09-25',
    completedDate: '2023-09-28',
    laborCost: 1000,
    partsCost: 3400,
    assignedParts: [{ partId: 'P004', quantity: 1 }, { partId: 'P005', quantity: 1 }],
  },
];
