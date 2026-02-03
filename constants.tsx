
import React from 'react';
import { Supplier, Customer, Vehicle, FuelType, PurchaseOrder, Invoice, TaxRecord } from './types';

export const MOCK_SUPPLIERS: Supplier[] = [
  { id: 'S1', name: 'TotalEnergies Congo', contactName: 'Jean Kabamba', email: 'jean@total.cd', phone: '+243 81 000 001', address: 'Kinshasa, Gombe', taxId: 'T-10023-A' },
  { id: 'S2', name: 'Engen DRC', contactName: 'Marie Luvuezo', email: 'marie@engen.cd', phone: '+243 81 000 002', address: 'Lubumbashi, Haut-Katanga', taxId: 'E-44221-B' },
];

export const MOCK_CUSTOMERS: Customer[] = [
  { id: 'C1', name: 'Mining Corp Katanga', contactName: 'Bob Smith', email: 'procurement@mining.cd', phone: '+243 82 111 222', address: 'Kolwezi', balance: 45000 },
  { id: 'C2', name: 'Kinshasa Bus Express', contactName: 'Alain Makusu', email: 'alain@kbe.cd', phone: '+243 85 999 888', address: 'Kinshasa, Limete', balance: 12000 },
];

export const MOCK_VEHICLES: Vehicle[] = [
  { 
    id: 'V1', 
    plateNumber: 'A-1234-BC', 
    driverName: 'Dieu Merci', 
    status: 'In Transit', 
    speed: 45, 
    heading: 120, 
    lastUpdate: new Date().toLocaleTimeString(),
    location: { lat: -4.322, lng: 15.313 },
    destination: { lat: -5.850, lng: 13.450, name: 'Matadi Port' }
  },
  { 
    id: 'V2', 
    plateNumber: 'B-5678-XY', 
    driverName: 'Patient Zola', 
    status: 'Idle', 
    speed: 0, 
    heading: 0, 
    lastUpdate: new Date().toLocaleTimeString(),
    location: { lat: -4.441, lng: 15.266 },
    destination: { lat: -11.666, lng: 27.479, name: 'Lubumbashi Depot' }
  },
];

export const MOCK_TAXES: TaxRecord[] = [
  { id: 'T1', period: '2023-11', type: 'Monthly', amount: 8500, status: 'Pending', dueDate: '2023-12-15' },
  { id: 'T2', period: '2023-Q3', type: 'Quarterly', amount: 24000, status: 'Paid', dueDate: '2023-10-31' },
];

export const MOCK_POS: PurchaseOrder[] = [
  { id: 'PO-001', supplierId: 'S1', date: '2023-11-20', status: 'Received', totalAmount: 125000, items: [{ fuelType: FuelType.DIESEL, quantityLiters: 100000, unitPrice: 1.25 }] }
];

export const MOCK_INVOICES: Invoice[] = [
  { id: 'INV-1001', customerId: 'C1', date: '2023-11-22', dueDate: '2023-12-22', status: 'Unpaid', totalAmount: 55000, items: [{ fuelType: FuelType.DIESEL, quantityLiters: 40000, unitPrice: 1.375 }] }
];
