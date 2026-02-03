
import React, { useState, useEffect } from 'react';
import { TaxRecord, Invoice, PurchaseOrder } from '../types';
import { generateTaxSummary } from '../services/geminiService';
import { Language } from '../translations';

interface TaxForecastData {
  forecastItems: Array<{
    category: string;
    estimatedAmount: string;
    deadline: string;
    priority: string;
  }>;
  summary: string;
}

interface AccountingProps {
  taxes: TaxRecord[];
  setTaxes: React.Dispatch<React.SetStateAction<TaxRecord[]>>;
  invoices: Invoice[];
  pos: PurchaseOrder[];
  t: (key: any) => string;
  language: Language;
}

const Accounting: React.FC<AccountingProps> = ({ taxes, setTaxes, invoices, pos, t, language }) => {
  const [taxForecast, setTaxForecast] = useState<TaxForecastData | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);

  useEffect(() => {
    const fetchSummary = async () => {
      setLoadingReport(true);
      // Pass current language to get translated tax summaries
      const data = await generateTaxSummary(taxes, language);
      if (data) {
        setTaxForecast(data);
      }
      setLoadingReport(false);
    };
    fetchSummary();
  }, [taxes, language]);

  const handlePayTax = (id: string) => {
    setTaxes(prev => prev.map(t => t.id === id ? { ...t, status: 'Paid' } : t));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{t('accounting')}</h2>
          <p className="text-slate-500">{language === 'en' ? 'DRC tax obligations (TVA, IBC, Monthly & Quarterly)' : 'Obligations fiscales RDC (TVA, IBC, Mensuel & Trimestriel)'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <h3 className="font-semibold text-slate-800">{t('tax_payment_queue')}</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-xs text-slate-500 font-bold uppercase border-b">
                  <tr>
                    <th className="px-6 py-4">{language === 'en' ? 'Period' : 'Période'}</th>
                    <th className="px-6 py-4">{language === 'en' ? 'Tax Type' : 'Type Taxe'}</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Due Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {taxes.map(tax => (
                    <tr key={tax.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium">{tax.period}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                          tax.type === 'Monthly' ? 'bg-indigo-50 text-indigo-700' : 'bg-purple-50 text-purple-700'
                        }`}>
                          {tax.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">${tax.amount.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{tax.dueDate}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          tax.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}>
                          {tax.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {tax.status === 'Pending' && (
                          <button 
                            onClick={() => handlePayTax(tax.id)}
                            className="text-amber-600 hover:text-amber-700 font-bold text-sm"
                          >
                            {language === 'en' ? 'Mark as Paid' : 'Marquer Payé'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 p-6">
              <div className="flex items-center space-x-3 text-amber-400 mb-2">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h3 className="font-bold text-lg">{t('quarterly_forecast')}</h3>
              </div>
              <p className="text-slate-400 text-xs uppercase tracking-widest font-semibold">{language === 'en' ? 'AI Auditor Analysis' : 'Analyse de l\'Auditeur AI'}</p>
            </div>
            
            <div className="p-6 space-y-4">
              {loadingReport ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-20 bg-slate-100 rounded-xl"></div>
                  <div className="h-20 bg-slate-100 rounded-xl"></div>
                  <div className="h-4 bg-slate-100 rounded w-full"></div>
                </div>
              ) : taxForecast ? (
                <>
                  <div className="space-y-3">
                    {taxForecast.forecastItems.map((item, idx) => (
                      <div key={idx} className="p-4 rounded-xl border border-slate-100 bg-slate-50 hover:border-amber-200 transition-colors">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-xs font-bold text-slate-500 uppercase">{item.category}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            item.priority === 'High' ? 'bg-rose-100 text-rose-700' : 
                            item.priority === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {item.priority}
                          </span>
                        </div>
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-lg font-black text-slate-900">{item.estimatedAmount}</p>
                            <p className="text-[10px] text-slate-400 font-medium">Due: {item.deadline}</p>
                          </div>
                          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-slate-100 shadow-sm">
                            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                    <p className="text-xs text-amber-800 leading-relaxed italic">
                      "{taxForecast.summary}"
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-400 text-sm">{language === 'en' ? 'Unable to generate forecast.' : 'Impossible de générer les prévisions.'}</p>
                </div>
              )}
            </div>
            
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
              <button className="w-full bg-slate-900 text-white py-2.5 rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200 flex items-center justify-center space-x-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>{t('export_pack')}</span>
              </button>
            </div>
          </div>

          <div className="bg-emerald-50 rounded-xl border border-emerald-100 p-6">
            <h4 className="text-sm font-bold text-emerald-800 uppercase mb-3 tracking-wider">{t('compliance_status')}</h4>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 bg-emerald-500 rounded-full"></span>
                <span className="text-sm text-emerald-700">{language === 'en' ? 'All Filings Up to Date' : 'Déclarations à jour'}</span>
              </div>
              <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Accounting;
