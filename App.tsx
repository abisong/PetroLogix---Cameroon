
import React, { useState, useEffect } from 'react';
import { ViewType, Supplier, Customer, Vehicle, TaxRecord, PurchaseOrder, Invoice } from './types';
import { MOCK_SUPPLIERS, MOCK_CUSTOMERS, MOCK_VEHICLES, MOCK_TAXES, MOCK_POS, MOCK_INVOICES } from './constants';
import Dashboard from './views/Dashboard';
import Suppliers from './views/Suppliers';
import Customers from './views/Customers';
import Accounting from './views/Accounting';
import Logistics from './views/Logistics';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('Dashboard');
  const [suppliers] = useState<Supplier[]>(MOCK_SUPPLIERS);
  const [customers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [vehicles, setVehicles] = useState<Vehicle[]>(MOCK_VEHICLES);
  const [taxes, setTaxes] = useState<TaxRecord[]>(MOCK_TAXES);
  const [pos, setPos] = useState<PurchaseOrder[]>(MOCK_POS);
  const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Sync state to simulate persistence if needed
  useEffect(() => {
    // Request geolocation for logistics simulation
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setVehicles(prev => prev.map((v, i) => i === 0 ? {
            ...v,
            location: { lat: position.coords.latitude, lng: position.coords.longitude },
            lastUpdate: new Date().toLocaleTimeString()
          } : v));
        },
        (error) => console.warn("Geolocation blocked or unavailable:", error),
        { enableHighAccuracy: true }
      );
    }
  }, []);

  const renderView = () => {
    switch (currentView) {
      case 'Dashboard':
        return <Dashboard 
                  pos={pos} 
                  invoices={invoices} 
                  taxes={taxes} 
                  vehicles={vehicles}
                  customers={customers}
                />;
      case 'Suppliers':
        return <Suppliers suppliers={suppliers} pos={pos} setPos={setPos} />;
      case 'Customers':
        return <Customers customers={customers} invoices={invoices} setInvoices={setInvoices} />;
      case 'Accounting':
        return <Accounting taxes={taxes} setTaxes={setTaxes} invoices={invoices} pos={pos} />;
      case 'Logistics':
        return <Logistics vehicles={vehicles} setVehicles={setVehicles} />;
      default:
        return <Dashboard pos={pos} invoices={invoices} taxes={taxes} vehicles={vehicles} customers={customers} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar - Desktop */}
      <div className="hidden md:flex flex-shrink-0">
        <Sidebar activeView={currentView} setView={setCurrentView} />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 md:hidden bg-black/50 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        >
          <div className="w-64 h-full bg-slate-900 shadow-2xl animate-in slide-in-from-left duration-300" onClick={e => e.stopPropagation()}>
            <Sidebar activeView={currentView} setView={(v) => { setCurrentView(v); setIsSidebarOpen(false); }} />
          </div>
        </div>
      )}

      <div className="flex flex-col flex-1 w-0 overflow-hidden">
        <Header 
          title={currentView} 
          onMenuClick={() => setIsSidebarOpen(true)} 
        />
        
        <main className="flex-1 relative overflow-y-auto focus:outline-none p-4 md:p-6 lg:p-8">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default App;
