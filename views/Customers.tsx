
import React, { useState } from 'react';
import { Customer, Invoice, FuelType } from '../types';
import { Language } from '../translations';

interface CustomersProps {
  customers: Customer[];
  invoices: Invoice[];
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
  t: (key: any) => string;
  language: Language;
}

const Customers: React.FC<CustomersProps> = ({ customers, invoices, setInvoices, t, language }) => {
  const [showModal, setShowModal] = useState(false);

  const handleCreateInvoice = () => {
    const inv: Invoice = {
      id: `INV-${Math.floor(Math.random() * 10000)}`,
      customerId: customers[0].id,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: [{ fuelType: FuelType.DIESEL, quantityLiters: 1000, unitPrice: 1.45 }],
      status: 'Unpaid',
      totalAmount: 1450
    };
    setInvoices([inv, ...invoices]);
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{t('customer_mgmt')}</h2>
          <p className="text-slate-500">{t('customer_desc')}</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-slate-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-800 transition-colors flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {t('new_invoice')}
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="font-semibold text-slate-800">{t('sales_history')}</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-xs text-slate-500 font-bold uppercase border-b bg-white">
                  <tr>
                    <th className="px-6 py-4 text-center">{t('inv_num')}</th>
                    <th className="px-6 py-4">{language === 'en' ? 'Customer' : 'Client'}</th>
                    <th className="px-6 py-4">{t('issue_date')}</th>
                    <th className="px-6 py-4">{t('due_date')}</th>
                    <th className="px-6 py-4">{t('total')}</th>
                    <th className="px-6 py-4">{t('status')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900 text-center">{inv.id}</td>
                      <td className="px-6 py-4 font-medium">{customers.find(c => c.id === inv.customerId)?.name || inv.customerId}</td>
                      <td className="px-6 py-4 text-slate-600">{inv.date}</td>
                      <td className="px-6 py-4 text-slate-600">{inv.dueDate}</td>
                      <td className="px-6 py-4 font-bold text-slate-900">${inv.totalAmount.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 
                          inv.status === 'Overdue' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {inv.status}
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
            <h3 className="font-bold mb-4">{t('top_accounts')}</h3>
            <div className="space-y-4">
              {customers.map(c => (
                <div key={c.id} className="p-4 border border-slate-100 rounded-xl bg-slate-50">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-slate-900">{c.name}</h4>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-slate-500 uppercase">{t('balance_due')}</span>
                    <span className="text-lg font-black text-rose-600">${c.balance.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-amber-50 rounded-xl border border-amber-200 p-6">
            <div className="flex items-center space-x-2 mb-2 text-amber-800 font-bold">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{t('overdue_tracking')}</span>
            </div>
            <p className="text-xs text-amber-700">3 {t('overdue_desc')} Mining Corp Katanga.</p>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl animate-in fade-in slide-in-from-bottom-4">
            <div className="px-8 py-6 border-b flex justify-between items-center">
              <h3 className="text-xl font-bold">{t('new_order')}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-8 grid grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1">{t('select_customer')}</label>
                <select className="w-full bg-slate-50 border rounded-lg px-4 py-2">
                  {customers.map(c => <option key={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">{t('fuel_selection')}</label>
                <select className="w-full bg-slate-50 border rounded-lg px-4 py-2">
                  <option>{FuelType.DIESEL}</option>
                  <option>{FuelType.GASOLINE}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">{t('qty_liters')}</label>
                <input type="number" className="w-full bg-slate-50 border rounded-lg px-4 py-2" placeholder="500" />
              </div>
              <div className="col-span-2 p-4 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                <div className="flex justify-between text-sm mb-1">
                  <span>{t('subtotal')}</span>
                  <span className="font-semibold">$0.00</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span>TVA (16%)</span>
                  <span className="font-semibold">$0.00</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
                  <span>{t('total')}</span>
                  <span className="text-amber-600">$0.00</span>
                </div>
              </div>
            </div>
            <div className="px-8 py-6 bg-slate-50 rounded-b-2xl border-t flex justify-end space-x-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 font-medium">{t('cancel')}</button>
              <button 
                onClick={handleCreateInvoice}
                className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-2 rounded-lg font-bold shadow-lg shadow-amber-200 transition-all"
              >
                {t('create_invoice')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
