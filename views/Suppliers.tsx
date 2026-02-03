
import React, { useState } from 'react';
import { Supplier, PurchaseOrder, FuelType } from '../types';

interface SuppliersProps {
  suppliers: Supplier[];
  pos: PurchaseOrder[];
  setPos: React.Dispatch<React.SetStateAction<PurchaseOrder[]>>;
}

const Suppliers: React.FC<SuppliersProps> = ({ suppliers, pos, setPos }) => {
  const [showModal, setShowModal] = useState(false);
  const [newPO, setNewPO] = useState<Partial<PurchaseOrder>>({
    supplierId: suppliers[0]?.id,
    items: [{ fuelType: FuelType.DIESEL, quantityLiters: 1000, unitPrice: 1.25 }],
    status: 'Draft'
  });

  const handleCreatePO = () => {
    const po: PurchaseOrder = {
      id: `PO-${Math.floor(Math.random() * 10000)}`,
      supplierId: newPO.supplierId!,
      date: new Date().toISOString().split('T')[0],
      items: newPO.items!,
      status: 'Sent',
      totalAmount: newPO.items!.reduce((acc, curr) => acc + (curr.quantityLiters * curr.unitPrice), 0)
    };
    setPos([po, ...pos]);
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Supplier Operations</h2>
          <p className="text-slate-500">Manage vendors and generate purchase orders</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-slate-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-800 transition-colors flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          New Purchase Order
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="font-semibold">Recent Purchase Orders</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-xs text-slate-500 font-bold uppercase border-b">
                  <tr>
                    <th className="px-6 py-4">PO #</th>
                    <th className="px-6 py-4">Supplier</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pos.map(po => (
                    <tr key={po.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium">{po.id}</td>
                      <td className="px-6 py-4">{suppliers.find(s => s.id === po.supplierId)?.name || po.supplierId}</td>
                      <td className="px-6 py-4">{po.date}</td>
                      <td className="px-6 py-4 font-bold">${po.totalAmount.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          po.status === 'Sent' ? 'bg-blue-100 text-blue-700' : 
                          po.status === 'Received' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {po.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold mb-4">Supplier Directory</h3>
            <div className="space-y-4">
              {suppliers.map(s => (
                <div key={s.id} className="flex items-center justify-between p-3 border rounded-lg hover:border-amber-500 transition-colors cursor-pointer group">
                  <div>
                    <p className="font-semibold text-slate-800">{s.name}</p>
                    <p className="text-xs text-slate-500">{s.phone}</p>
                  </div>
                  <svg className="w-5 h-5 text-slate-400 group-hover:text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-8 py-6 border-b flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold">Create Purchase Order</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Select Supplier</label>
                <select 
                  className="w-full bg-slate-50 border rounded-lg px-4 py-2"
                  value={newPO.supplierId}
                  onChange={(e) => setNewPO({...newPO, supplierId: e.target.value})}
                >
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Fuel Type</label>
                <select className="w-full bg-slate-50 border rounded-lg px-4 py-2">
                  <option>{FuelType.DIESEL}</option>
                  <option>{FuelType.GASOLINE}</option>
                  <option>{FuelType.JET_A1}</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Quantity (L)</label>
                  <input type="number" className="w-full bg-slate-50 border rounded-lg px-4 py-2" placeholder="e.g. 5000" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Unit Price ($)</label>
                  <input type="number" step="0.01" className="w-full bg-slate-50 border rounded-lg px-4 py-2" placeholder="e.g. 1.25" />
                </div>
              </div>
            </div>
            <div className="px-8 py-6 bg-slate-50 border-t flex justify-end space-x-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium">Cancel</button>
              <button 
                onClick={handleCreatePO}
                className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-lg font-bold shadow-md shadow-amber-200 transition-all"
              >
                Send PO
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Suppliers;
