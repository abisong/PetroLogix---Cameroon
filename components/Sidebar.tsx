
import React from 'react';
import { ViewType } from '../types';

interface SidebarProps {
  activeView: ViewType;
  setView: (view: ViewType) => void;
  t: (key: any) => string;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setView, t }) => {
  const menuItems: { id: ViewType; icon: string; label: string }[] = [
    { id: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', label: t('dashboard') },
    { id: 'Suppliers', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', label: t('suppliers') },
    { id: 'Customers', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z', label: t('customers') },
    { id: 'Accounting', icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z', label: t('accounting') },
    { id: 'Logistics', icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7', label: t('logistics') },
  ];

  return (
    <div className="flex flex-col w-64 h-full bg-slate-900">
      <div className="flex items-center h-16 px-6 bg-slate-800">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-xl font-bold text-white tracking-tight">PetroLogix</span>
        </div>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
              activeView === item.id
                ? 'bg-amber-500 text-white'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
            </svg>
            {item.label}
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center px-2 py-3 space-x-3 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300">
            JD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">Julien Dosse</p>
            <p className="text-xs text-slate-400 truncate">{t('dashboard') === 'Dashboard' ? 'Admin Congo' : 'Administrateur Congo'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
