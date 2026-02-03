
import React, { useState } from 'react';
import { Supplier, PurchaseOrder, FuelType } from '../types';

interface SuppliersProps {
  suppliers: Supplier[];
  setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>;
  pos: PurchaseOrder[];
  setPos: React.Dispatch<React.SetStateAction<PurchaseOrder[]>>;
}

const Suppliers: React.FC<SuppliersProps> = ({ suppliers, setSuppliers, pos, setPos }) => {
  const [showPOModal, setShowPOModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  
  const [newPO, setNewPO] = useState<Partial<PurchaseOrder>>({
    supplierId: suppliers[0]?.id,
    items: [{ fuelType: FuelType.DIESEL, quantityLiters: 1000, unitPrice: 1.25 }],
    status: 'Draft'
  });

  const [newSupplier, setNewSupplier] = useState<Partial<Supplier>>({
    name: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
    taxId: ''
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
    setShowPOModal(false);
  };

  const handleAddSupplier = () => {
    if (!newSupplier.name) return;
    
    const supplier: Supplier = {
      id: `S-${Math.floor(Math.random() * 10000)}`,
      name: newSupplier.name!,
      contactName: newSupplier.contactName || '',
      email: newSupplier.email || '',
      phone: newSupplier.phone || '',
      address: newSupplier.address || '',
      taxId: newSupplier.taxId || ''
    };
    
    setSuppliers([supplier, ...suppliers]);
    setShowSupplierModal(false);
    setNewSupplier({
      name: '',
      contactName: '',
      email: '',
      phone: '',
      address: '',
      taxId: ''
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Supplier Operations</h2>
          <p className="text-slate-500">Manage vendors and generate purchase orders</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => setShowSupplierModal(true)}
            className="bg-white text-slate-900 border border-slate-200 px-4 py-2 rounded-lg font-medium hover:bg-slate-50 transition-colors flex items-center shadow-sm"
          >
            <svg className="w-5 h-5 mr-2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Add Supplier
          </button>
          <button 
            onClick={() => setShowPOModal(true)}
            className="bg-slate-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-800 transition-colors flex items-center shadow-lg shadow-slate-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            New Purchase Order
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="font-semibold text-slate-800">Recent Purchase Orders</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-xs text-slate-500 font-bold uppercase border-b bg-white">
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
                      <td className="px-6 py-4 font-mono text-sm">{po.id}</td>
                      <td className="px-6 py-4 font-medium">{suppliers.find(s => s.id === po.supplierId)?.name || po.supplierId}</td>
                      <td className="px-6 py-4 text-slate-600">{po.date}</td>
                      <td className="px-6 py-4 font-bold text-slate-900">${po.totalAmount.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                          po.status === 'Sent' ? 'bg-blue-100 text-blue-700' : 
                          po.status === 'Received' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {po.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {pos.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-slate-400 italic">No purchase orders recorded.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Supplier Directory
            </h3>
            <div className="space-y-3">
              {suppliers.map(s => (
                <div key={s.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl hover:border-amber-500 hover:bg-amber-50/30 transition-all cursor-pointer group">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 truncate">{s.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">{s.taxId || 'No Tax ID'}</p>
                  </div>
                  <div className="flex-shrink-0 ml-4">
                    <svg className="w-4 h-4 text-slate-300 group-hover:text-amber-500 transform group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* PO Modal */}
      {showPOModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-8 py-6 border-b flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-900">Create Purchase Order</h3>
              <button onClick={() => setShowPOModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Select Supplier</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                  value={newPO.supplierId}
                  onChange={(e) => setNewPO({...newPO, supplierId: e.target.value})}
                >
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Fuel Type</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all">
                  <option>{FuelType.DIESEL}</option>
                  <option>{FuelType.GASOLINE}</option>
                  <option>{FuelType.JET_A1}</option>
                  <option>{FuelType.KEROSENE}</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Quantity (L)</label>
                  <input type="number" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all" placeholder="e.g. 5000" />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Unit Price ($)</label>
                  <input type="number" step="0.01" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all" placeholder="e.g. 1.25" />
                </div>
              </div>
            </div>
            <div className="px-8 py-6 bg-slate-50 border-t flex justify-end space-x-3">
              <button onClick={() => setShowPOModal(false)} className="px-4 py-2 text-slate-600 hover:text-slate-800 font-bold text-sm uppercase tracking-wider">Cancel</button>
              <button 
                onClick={handleCreatePO}
                className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-2.5 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-amber-200 active:scale-95 transition-all"
              >
                Send PO
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Supplier Modal */}
      {showSupplierModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-8 py-6 border-b flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-900">Add New Supplier</h3>
              <button onClick={() => setShowSupplierModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-8 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Company Name *</label>
                  <input 
                    type="text" 
                    value={newSupplier.name}
                    onChange={(e) => setNewSupplier({...newSupplier, name: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all" 
                    placeholder="e.g. SEP Congo" 
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Contact Person</label>
                  <input 
                    type="text" 
                    value={newSupplier.contactName}
                    onChange={(e) => setNewSupplier({...newSupplier, contactName: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all" 
                    placeholder="Name" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Tax ID / RCCM</label>
                  <input 
                    type="text" 
                    value={newSupplier.taxId}
                    onChange={(e) => setNewSupplier({...newSupplier, taxId: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all" 
                    placeholder="e.g. CD/KNS/RCCM/..." 
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Phone</label>
                  <input 
                    type="tel" 
                    value={newSupplier.phone}
                    onChange={(e) => setNewSupplier({...newSupplier, phone: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all" 
                    placeholder="+243..." 
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Email</label>
                  <input 
                    type="email" 
                    value={newSupplier.email}
                    onChange={(e) => setNewSupplier({...newSupplier, email: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all" 
                    placeholder="info@company.cd" 
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Address</label>
                  <textarea 
                    value={newSupplier.address}
                    onChange={(e) => setNewSupplier({...newSupplier, address: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all min-h-[80px]" 
                    placeholder="Physical address in DRC" 
                  />
                </div>
              </div>
            </div>
            <div className="px-8 py-6 bg-slate-50 border-t flex justify-end space-x-3">
              <button onClick={() => setShowSupplierModal(false)} className="px-4 py-2 text-slate-600 hover:text-slate-800 font-bold text-sm uppercase tracking-wider">Cancel</button>
              <button 
                onClick={handleAddSupplier}
                disabled={!newSupplier.name}
                className="bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 text-white px-8 py-2.5 rounded-xl font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all"
              >
                Register Supplier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Suppliers;
