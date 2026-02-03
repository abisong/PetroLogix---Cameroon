
import React, { useState, useEffect } from 'react';
import { PurchaseOrder, Invoice, TaxRecord, Vehicle, Customer } from '../types';
import { getBusinessInsights } from '../services/geminiService';
import { Language } from '../translations';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AIInsightData {
  insights: Array<{
    title: string;
    description: string;
    type: string;
    severity: 'positive' | 'warning' | 'info';
  }>;
  overallSummary: string;
}

interface DashboardProps {
  pos: PurchaseOrder[];
  invoices: Invoice[];
  taxes: TaxRecord[];
  vehicles: Vehicle[];
  customers: Customer[];
  t: (key: any) => string;
  language: Language;
}

const Dashboard: React.FC<DashboardProps> = ({ pos, invoices, taxes, vehicles, customers, t, language }) => {
  const [aiInsight, setAiInsight] = useState<AIInsightData | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const totalReceivables = invoices
    .filter(i => i.status !== 'Paid')
    .reduce((acc, curr) => acc + curr.totalAmount, 0);
  
  const totalPayables = pos
    .filter(p => p.status !== 'Paid')
    .reduce((acc, curr) => acc + curr.totalAmount, 0);

  const pendingTaxes = taxes
    .filter(t => t.status === 'Pending')
    .reduce((acc, curr) => acc + curr.amount, 0);

  useEffect(() => {
    const fetchAiInsights = async () => {
      setLoadingAi(true);
      const data = {
        receivables: totalReceivables,
        payables: totalPayables,
        taxLiability: pendingTaxes,
        fleetStatus: vehicles.map(v => v.status),
        customerCount: customers.length
      };
      // Pass the current language to the service to get translated insights
      const result = await getBusinessInsights(data, language);
      setAiInsight(result);
      setLoadingAi(false);
    };
    fetchAiInsights();
  }, [totalReceivables, totalPayables, pendingTaxes, vehicles.length, customers.length, language]);

  const chartData = [
    { name: 'Mon', sales: 4000, expenses: 2400 },
    { name: 'Tue', sales: 3000, expenses: 1398 },
    { name: 'Wed', sales: 2000, expenses: 9800 },
    { name: 'Thu', sales: 2780, expenses: 3908 },
    { name: 'Fri', sales: 1890, expenses: 4800 },
    { name: 'Sat', sales: 2390, expenses: 3800 },
    { name: 'Sun', sales: 3490, expenses: 4300 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard 
          title={t('receivables')} 
          value={`$${totalReceivables.toLocaleString()}`} 
          color="blue" 
          icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
        <StatCard 
          title={t('payables')} 
          value={`$${totalPayables.toLocaleString()}`} 
          color="rose" 
          icon="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
        />
        <StatCard 
          title={t('pending_taxes')} 
          value={`$${pendingTaxes.toLocaleString()}`} 
          color="amber" 
          icon="M9 14l6-6m-5.5.5h.5m.5 5.5h.5m-6 0h.5m8.5-5.5h.5m-1.5 8H5.5a2 2 0 01-2-2V5.5a2 2 0 012-2h13a2 2 0 012 2v13a2 2 0 01-2 2z"
        />
        <StatCard 
          title={t('active_vehicles')} 
          value={`${vehicles.filter(v => v.status === 'In Transit').length}/${vehicles.length}`} 
          color="emerald" 
          icon="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0zM13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold mb-6 text-slate-800">{language === 'en' ? 'Sales vs Expenses (Weekly)' : 'Ventes vs Dépenses (Hebdo)'}</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} tick={{ fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} fontSize={12} tick={{ fill: '#64748b' }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="sales" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 text-white rounded-2xl shadow-xl overflow-hidden flex flex-col border border-slate-800">
          <div className="bg-slate-800/50 p-6 border-b border-slate-700/50">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-2 text-amber-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <h3 className="text-sm font-black uppercase tracking-widest">{t('manager_intelligence')}</h3>
              </div>
              {loadingAi && (
                <div className="w-4 h-4 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin"></div>
              )}
            </div>
            <p className="text-slate-400 text-xs font-medium">{t('ai_audit')}</p>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {loadingAi ? (
              <div className="space-y-4 animate-pulse">
                {[1, 2, 3].map(i => (
                  <div key={i} className="space-y-2">
                    <div className="h-3 bg-slate-800 rounded w-1/4"></div>
                    <div className="h-12 bg-slate-800 rounded w-full"></div>
                  </div>
                ))}
              </div>
            ) : aiInsight ? (
              <>
                <div className="mb-4 pb-4 border-b border-slate-800">
                  <p className="text-sm font-semibold text-slate-300 italic">
                    "{aiInsight.overallSummary}"
                  </p>
                </div>
                {aiInsight.insights.map((insight, idx) => (
                  <div key={idx} className="group">
                    <div className="flex items-center space-x-2 mb-1">
                       <span className={`w-1.5 h-1.5 rounded-full ${
                         insight.severity === 'warning' ? 'bg-rose-500' : 
                         insight.severity === 'positive' ? 'bg-emerald-500' : 'bg-blue-500'
                       }`}></span>
                       <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{insight.type}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white mb-1 group-hover:text-amber-400 transition-colors">
                      {insight.title}
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {insight.description}
                    </p>
                  </div>
                ))}
              </>
            ) : (
              <div className="text-center py-10">
                <p className="text-slate-500 text-sm">{language === 'en' ? 'System ready.' : 'Système prêt.'}</p>
              </div>
            )}
          </div>

          <div className="p-4 bg-slate-950/50 border-t border-slate-800 text-[9px] text-slate-600 uppercase tracking-[0.2em] font-bold text-center">
            PetroLogix AI Core v3.0
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800">{t('recent_transactions')}</h3>
          <button className="text-sm font-bold text-amber-600 hover:text-amber-700 bg-amber-50 px-3 py-1 rounded-lg transition-colors">{t('audit_trail')}</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Ref ID</th>
                <th className="px-6 py-4">{language === 'en' ? 'Transaction Type' : 'Type de Transaction'}</th>
                <th className="px-6 py-4">{language === 'en' ? 'Entity' : 'Entité'}</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.slice(0, 3).map(inv => (
                <tr key={inv.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 font-mono text-xs text-slate-400">{inv.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                      <span className="text-sm font-semibold text-slate-900">{language === 'en' ? 'Sale Invoice' : 'Facture Vente'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{customers.find(c => c.id === inv.customerId)?.name || 'Unknown'}</td>
                  <td className="px-6 py-4 text-sm font-black text-slate-900 text-right">${inv.totalAmount.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-md text-[10px] font-black uppercase tracking-tighter">{inv.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: string; color: string; icon: string }> = ({ title, value, color, icon }) => {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    rose: 'bg-rose-50 text-rose-600',
    amber: 'bg-amber-50 text-amber-600',
    emerald: 'bg-emerald-50 text-emerald-600',
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2.5 rounded-lg ${colorMap[color]}`}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
          </svg>
        </div>
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live</div>
      </div>
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-black text-slate-900 mt-0.5 tracking-tight">{value}</p>
      </div>
    </div>
  );
};

export default Dashboard;
