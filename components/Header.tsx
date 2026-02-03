
import React from 'react';
import { Language } from '../translations';

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
}

const Header: React.FC<HeaderProps> = ({ title, onMenuClick, language, setLanguage }) => {
  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 md:px-8 z-10 sticky top-0">
      <div className="flex items-center">
        <button 
          onClick={onMenuClick}
          className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg mr-2"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-xl font-semibold text-slate-800">{title}</h1>
      </div>
      
      <div className="flex items-center space-x-4">
        {/* Language Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg">
          <button 
            onClick={() => setLanguage('en')}
            className={`px-3 py-1 text-[10px] font-black uppercase rounded-md transition-all ${language === 'en' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            EN
          </button>
          <button 
            onClick={() => setLanguage('fr')}
            className={`px-3 py-1 text-[10px] font-black uppercase rounded-md transition-all ${language === 'fr' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            FR
          </button>
        </div>

        <div className="hidden sm:flex items-center space-x-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          <span>{language === 'en' ? 'Kinshasa Node Active' : 'Noeud Kinshasa Actif'}</span>
        </div>
        
        <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg relative">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
      </div>
    </header>
  );
};

export default Header;
