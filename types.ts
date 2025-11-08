export enum RepairStatus {
  RECEIVED = 'รับเครื่อง',
  AWAITING_PARTS = 'รออะไหล่',
  IN_PROGRESS = 'กำลังซ่อม',
  COMPLETED = 'เสร็จสิ้น',
  RETURNED = 'ส่งคืนแล้ว',
  CANCELLED = 'ยกเลิก'
}

export enum DeviceType {
  MOBILE = 'โทรศัพท์มือถือ',
  NOTEBOOK = 'โน้ตบุ๊ก',
  TABLET = 'แท็บเล็ต',
  OTHER = 'อื่นๆ',
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address?: string;
  email?: string;
}

export interface Technician {
  id: string;
  name: string;
  specialty: string;
}

export interface PartCategory {
  id: string;
  name: string;
}

export interface Supplier {
  id: string;
  name: string;
}

export interface Part {
  id: string;
  name: string;
  stock: number;
  price: number;
  categoryId?: string;
  supplierId?: string;
}

export interface RepairJob {
  id: string;
  repairCode: string;
  customerId: string;
  technicianId?: string;
  deviceType: DeviceType;
  deviceModel: string;
  issueDescription: string;
  status: RepairStatus;
  receivedDate: string;
  completedDate?: string;
  laborCost: number;
  partsCost: number;
  assignedParts: { partId: string; quantity: number }[];
  notes?: string;
  images?: { before: string[]; after: string[] };
}