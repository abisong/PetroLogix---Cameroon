
export enum FuelType {
  DIESEL = 'Diesel (AGO)',
  GASOLINE = 'Gasoline (PMS)',
  JET_A1 = 'Jet A1',
  KEROSENE = 'Kerosene (DPK)'
}

export interface Supplier {
  id: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  taxId: string;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  date: string;
  items: POItem[];
  status: 'Draft' | 'Sent' | 'Received' | 'Paid';
  totalAmount: number;
}

export interface POItem {
  fuelType: FuelType;
  quantityLiters: number;
  unitPrice: number;
}

export interface Customer {
  id: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  balance: number;
}

export interface Invoice {
  id: string;
  customerId: string;
  date: string;
  dueDate: string;
  items: POItem[];
  status: 'Unpaid' | 'Partial' | 'Paid' | 'Overdue';
  totalAmount: number;
}

export interface TaxRecord {
  id: string;
  period: string; // e.g., "2023-10"
  type: 'Monthly' | 'Quarterly';
  amount: number;
  status: 'Pending' | 'Paid';
  dueDate: string;
}

export interface Vehicle {
  id: string;
  plateNumber: string;
  driverName: string;
  status: 'Idle' | 'In Transit' | 'Maintenance';
  speed?: number;
  heading?: number;
  lastUpdate?: string;
  location?: {
    lat: number;
    lng: number;
  };
  destination?: {
    lat: number;
    lng: number;
    name: string;
  };
}

export type ViewType = 'Dashboard' | 'Suppliers' | 'Customers' | 'Accounting' | 'Logistics' | 'Reports';
