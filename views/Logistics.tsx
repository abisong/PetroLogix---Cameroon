
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Vehicle } from '../types';
import { Language } from '../translations';

interface LogisticsProps {
  vehicles: Vehicle[];
  setVehicles?: React.Dispatch<React.SetStateAction<Vehicle[]>>;
  t: (key: any) => string;
  language: Language;
}

const Logistics: React.FC<LogisticsProps> = ({ vehicles, setVehicles, t, language }) => {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(vehicles[0]?.id || null);
  const [followVehicle, setFollowVehicle] = useState<boolean>(false);
  const [ping, setPing] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [manualLat, setManualLat] = useState<string>('');
  const [manualLng, setManualLng] = useState<string>('');
  
  // Map control states
  const [zoom, setZoom] = useState(1); // 1 = Default, > 1 = Zoomed In

  const selectedVehicle = useMemo(() => 
    vehicles.find(v => v.id === selectedVehicleId), 
    [vehicles, selectedVehicleId]
  );

  // Sync manual inputs when selected vehicle changes
  useEffect(() => {
    if (selectedVehicle?.location) {
      setManualLat(selectedVehicle.location.lat.toString());
      setManualLng(selectedVehicle.location.lng.toString());
    }
  }, [selectedVehicleId, selectedVehicle]);

  /**
   * ADVANCED SIMULATION ENGINE
   */
  useEffect(() => {
    let interval: number;
    if (isSimulating && setVehicles) {
      interval = window.setInterval(() => {
        setVehicles(prev => prev.map(v => {
          if (v.status === 'In Transit' && v.location) {
            const headingDrift = (Math.random() - 0.5) * 8; 
            const currentHeading = ((v.heading || 0) + headingDrift + 360) % 360;
            const speedFluctuation = (Math.random() - 0.5) * 4;
            const currentSpeed = Math.max(30, Math.min(80, (v.speed || 50) + speedFluctuation));
            const moveFactor = (currentSpeed / 3600) * 0.1; 
            const radians = (currentHeading - 90) * (Math.PI / 180);
            const dLat = Math.sin(radians) * moveFactor;
            const dLng = Math.cos(radians) * moveFactor;
            
            return {
              ...v,
              location: { 
                lat: v.location.lat - dLat,
                lng: v.location.lng + dLng 
              },
              speed: Math.floor(currentSpeed),
              heading: currentHeading,
              lastUpdate: new Date().toLocaleTimeString()
            };
          }
          return v;
        }));
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isSimulating, setVehicles]);

  const calculateETA = (vehicle: Vehicle) => {
    if (vehicle.status !== 'In Transit' || !vehicle.location || !vehicle.destination || !vehicle.speed || vehicle.speed < 5) {
      return null;
    }
    const dLat = vehicle.destination.lat - vehicle.location.lat;
    const dLng = vehicle.destination.lng - vehicle.location.lng;
    const distance = Math.sqrt(dLat * dLat + dLng * dLng) * 111; 
    const timeInHours = distance / vehicle.speed;
    const hours = Math.floor(timeInHours);
    const minutes = Math.round((timeInHours - hours) * 60);
    if (hours > 48) return '> 48h';
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getTripProgress = (vehicle: Vehicle) => {
    if (!vehicle.location || !vehicle.destination) return 0;
    const dLat = vehicle.destination.lat - vehicle.location.lat;
    const dLng = vehicle.destination.lng - vehicle.location.lng;
    const currentDist = Math.sqrt(dLat * dLat + dLng * dLng);
    const totalDist = 5; 
    const progress = Math.max(0, Math.min(100, 100 * (1 - currentDist / totalDist)));
    return Math.round(progress);
  };

  const handleManualUpdate = () => {
    if (!setVehicles || !selectedVehicleId) return;
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    if (isNaN(lat) || isNaN(lng)) return;

    setVehicles(prev => prev.map(v => 
      v.id === selectedVehicleId 
        ? { 
            ...v, 
            location: { lat, lng }, 
            lastUpdate: new Date().toLocaleTimeString(),
            speed: 0 
          } 
        : v
    ));
    setPing(selectedVehicleId);
    setTimeout(() => setPing(null), 1500);
  };

  const mapBounds = useMemo(() => {
    const activeLocs = vehicles.filter(v => v.location).map(v => v.location!);
    if (activeLocs.length === 0) return { minLat: -5, maxLat: -3, minLng: 14, maxLng: 17 };
    
    let centerLat, centerLng, latRange, lngRange;
    if (followVehicle && selectedVehicle?.location) {
      centerLat = selectedVehicle.location.lat;
      centerLng = selectedVehicle.location.lng;
      latRange = 0.5;
      lngRange = 0.5;
    } else {
      const lats = activeLocs.map(l => l.lat);
      const lngs = activeLocs.map(l => l.lng);
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);
      centerLat = (maxLat + minLat) / 2;
      centerLng = (maxLng + minLng) / 2;
      latRange = maxLat - minLat || 0.5;
      lngRange = maxLng - minLng || 0.5;
    }
    const newLatHalfRange = (latRange * 0.6) / zoom;
    const newLngHalfRange = (lngRange * 0.6) / zoom;
    return {
      minLat: centerLat - newLatHalfRange,
      maxLat: centerLat + newLatHalfRange,
      minLng: centerLng - newLngHalfRange,
      maxLng: centerLng + newLngHalfRange
    };
  }, [vehicles, zoom, followVehicle, selectedVehicle]);

  const getPosition = useCallback((lat: number, lng: number) => {
    const latRange = mapBounds.maxLat - mapBounds.minLat || 0.01;
    const lngRange = mapBounds.maxLng - mapBounds.minLng || 0.01;
    const top = ((mapBounds.maxLat - lat) / latRange) * 100;
    const left = ((lng - mapBounds.minLng) / lngRange) * 100;
    return { top: `${top}%`, left: `${left}%` };
  }, [mapBounds]);

  const handleVehicleSelect = (id: string) => {
    setSelectedVehicleId(id);
    setPing(id);
    setTimeout(() => setPing(null), 1500);
  };

  const zoomIn = () => setZoom(prev => Math.min(prev * 1.5, 20));
  const zoomOut = () => setZoom(prev => Math.max(prev / 1.5, 0.2));
  const resetMap = () => {
    setZoom(1);
    setFollowVehicle(false);
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter">{t('fleet_command')}</h2>
            <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase transition-colors ${
              isSimulating ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isSimulating ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
              <span>{isSimulating ? t('tracking_active') : t('satellite_standby')}</span>
            </div>
          </div>
          <p className="text-slate-500 text-sm mt-1">{t('logistics_desc')}</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setIsSimulating(!isSimulating)}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all shadow-lg ${
              isSimulating 
                ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-rose-200' 
                : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-200'
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isSimulating ? "M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" : "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"} />
            </svg>
            <span>{isSimulating ? t('stop_sim') : t('start_gps')}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 flex-1 min-h-[600px]">
        <div className="xl:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('deployment_roster')}</h3>
            <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">{vehicles.length} {t('units')}</span>
          </div>
          
          <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
            {vehicles.map(v => {
              const eta = calculateETA(v);
              return (
                <button
                  key={v.id}
                  onClick={() => handleVehicleSelect(v.id)}
                  className={`w-full text-left p-5 transition-all group relative ${
                    selectedVehicleId === v.id ? 'bg-amber-50 shadow-inner' : 'hover:bg-slate-50'
                  }`}
                >
                  {selectedVehicleId === v.id && (
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-500"></div>
                  )}
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${v.status === 'In Transit' ? 'bg-amber-500 animate-pulse' : 'bg-slate-300'}`}></div>
                      <span className="text-sm font-black text-slate-900 tracking-tight">{v.plateNumber}</span>
                    </div>
                    {eta && (
                      <span className="text-[9px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-black uppercase animate-pulse">
                        {t('eta')}: {eta}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm ${
                      selectedVehicleId === v.id ? 'bg-amber-500 text-white rotate-2' : 'bg-slate-100 text-slate-400'
                    }`}>
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1-1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between items-start">
                        <p className="text-xs font-bold text-slate-800 truncate">{v.driverName}</p>
                        <span className={`text-[8px] font-black uppercase ${v.status === 'In Transit' ? 'text-amber-600' : 'text-slate-400'}`}>{v.status}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5 uppercase tracking-tighter">
                        SIG: {isSimulating ? 'SECURE' : 'OFFLINE'} • {v.location?.lat.toFixed(3)}, {v.location?.lng.toFixed(3)}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {selectedVehicle && (
            <div className="bg-slate-900 text-white divide-y divide-slate-800">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('telemetry')}</span>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => setFollowVehicle(!followVehicle)}
                      className={`px-2 py-1 rounded text-[9px] font-black uppercase transition-colors ${followVehicle ? 'bg-amber-500 text-slate-900' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}
                    >
                      {followVehicle ? t('lock_on') : t('free_cam')}
                    </button>
                  </div>
                </div>
                
                {selectedVehicle.destination && (
                  <div className="mb-4 bg-slate-800/30 p-3 rounded-xl border border-slate-800/50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest">{t('active_dest')}</p>
                        <p className="text-xs font-bold text-amber-400">{selectedVehicle.destination.name}</p>
                      </div>
                      {calculateETA(selectedVehicle) && (
                        <div className="text-right">
                          <p className="text-[9px] text-emerald-500 uppercase font-black tracking-widest">{t('eta')}</p>
                          <p className="text-xs font-black text-emerald-400">{calculateETA(selectedVehicle)}</p>
                        </div>
                      )}
                    </div>
                    <div className="mt-3">
                       <div className="flex justify-between items-center mb-1">
                         <span className="text-[8px] font-black text-slate-600 uppercase">{t('trip_progress')}</span>
                         <span className="text-[8px] font-black text-amber-500 uppercase">{getTripProgress(selectedVehicle)}%</span>
                       </div>
                       <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-amber-500 transition-all duration-1000 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                            style={{ width: `${getTripProgress(selectedVehicle)}%` }}
                          ></div>
                       </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-800">
                    <p className="text-[9px] text-slate-500 uppercase font-black mb-1.5 tracking-widest">{t('velocity')}</p>
                    <p className="text-2xl font-black text-white">{selectedVehicle.speed || 0} <span className="text-[10px] font-medium text-slate-400 uppercase">Kph</span></p>
                  </div>
                  <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-800">
                    <p className="text-[9px] text-slate-500 uppercase font-black mb-1.5 tracking-widest">{t('bearing')}</p>
                    <p className="text-2xl font-black text-white">{Math.round(selectedVehicle.heading || 0)}° <span className="text-[10px] font-medium text-slate-400 uppercase text-amber-500">{language === 'en' ? 'True' : 'Vrai'}</span></p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-950/50">
                <div className="flex items-center space-x-2 mb-4">
                  <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">{t('manual_override')}</span>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-500 font-bold uppercase">{t('latitude')}</label>
                    <input 
                      type="number" 
                      value={manualLat}
                      onChange={(e) => setManualLat(e.target.value)}
                      step="0.0001"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-500 font-bold uppercase">{t('longitude')}</label>
                    <input 
                      type="number" 
                      value={manualLng}
                      onChange={(e) => setManualLng(e.target.value)}
                      step="0.0001"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                </div>
                <button 
                  onClick={handleManualUpdate}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg active:scale-95"
                >
                  {t('deploy_btn')}
                </button>
              </div>

              <div className="p-4 flex items-center justify-between text-[10px] font-bold">
                <span className="text-slate-500">{t('last_sync')}:</span>
                <span className="font-mono text-emerald-400">{selectedVehicle.lastUpdate || '--:--:--'}</span>
              </div>
            </div>
          )}
        </div>

        <div className="xl:col-span-3 bg-slate-950 rounded-2xl relative overflow-hidden shadow-2xl border border-slate-800 flex items-center justify-center group/map">
          <div className="absolute inset-0 opacity-10 pointer-events-none" 
            style={{ 
              backgroundImage: 'linear-gradient(#475569 1px, transparent 1px), linear-gradient(90deg, #475569 1px, transparent 1px)', 
              backgroundSize: '50px 50px' 
            }}
          ></div>

          <div className="absolute inset-8 rounded-[2rem] border border-white/5 bg-slate-900/40 backdrop-blur-sm overflow-hidden shadow-inner">
             {selectedVehicle && selectedVehicle.location && selectedVehicle.destination && (
               <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
                 <line 
                   x1={getPosition(selectedVehicle.location.lat, selectedVehicle.location.lng).left}
                   y1={getPosition(selectedVehicle.location.lat, selectedVehicle.location.lng).top}
                   x2={getPosition(selectedVehicle.destination.lat, selectedVehicle.destination.lng).left}
                   y2={getPosition(selectedVehicle.destination.lat, selectedVehicle.destination.lng).top}
                   stroke="rgba(245, 158, 11, 0.4)"
                   strokeWidth="1.5"
                   strokeDasharray="4,4"
                   className="animate-[dash_20s_linear_infinite]"
                 />
                 <style>{`
                    @keyframes dash { to { stroke-dashoffset: -100; } }
                 `}</style>
               </svg>
             )}

             {vehicles.map(v => v.destination && (
                <div 
                  key={`dest-${v.id}`}
                  className={`absolute transition-all duration-700 z-10 ${selectedVehicleId === v.id ? 'opacity-100' : 'opacity-30'}`}
                  style={{
                    ...getPosition(v.destination.lat, v.destination.lng),
                    transform: `translate(-50%, -100%) scale(${selectedVehicleId === v.id ? 1 : 0.8})`
                  }}
                >
                  <div className="relative group">
                    <svg className={`w-8 h-8 ${selectedVehicleId === v.id ? 'text-amber-500' : 'text-slate-500'}`} fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.45 4H4v18h2v-7h6.55l.4 2H20V6h-7.15l-.4-2z" />
                    </svg>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-[8px] font-black text-white whitespace-nowrap mb-1">
                      {v.destination.name}
                    </div>
                  </div>
                </div>
             ))}

             {vehicles.map((v) => v.location && (
               <div 
                 key={v.id}
                 className={`absolute transition-all duration-[2000ms] ease-linear cursor-pointer z-20`}
                 style={{
                   ...getPosition(v.location.lat, v.location.lng),
                   transform: `translate(-50%, -50%) scale(${selectedVehicleId === v.id ? 1.2 : 1})`
                 }}
                 onClick={() => handleVehicleSelect(v.id)}
               >
                 <div className="relative">
                   {(ping === v.id || (selectedVehicleId === v.id && isSimulating)) && (
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-amber-500/30 rounded-full animate-ping pointer-events-none"></div>
                   )}
                   
                   {v.status === 'In Transit' && (
                     <div 
                       className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 flex items-center justify-center transition-transform duration-1000"
                       style={{ transform: `translate(-50%, -50%) rotate(${v.heading || 0}deg)` }}
                     >
                        <div className="w-1.5 h-10 bg-gradient-to-t from-transparent via-amber-500/40 to-amber-400 rounded-full shadow-[0_0_15px_rgba(251,191,36,0.4)]"></div>
                     </div>
                   )}

                   <div className={`relative w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all duration-500 ${
                     selectedVehicleId === v.id ? 'bg-amber-500 border-white shadow-[0_0_30px_rgba(245,158,11,0.6)]' : 'bg-slate-950 border-slate-700 hover:border-slate-500'
                   }`}>
                      <svg className={`w-6 h-6 ${selectedVehicleId === v.id ? 'text-white' : 'text-slate-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1-1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1" />
                      </svg>
                   </div>

                   <div className={`absolute top-full mt-3 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-md text-[9px] font-black uppercase whitespace-nowrap border-2 transition-all shadow-xl flex flex-col items-center ${
                     selectedVehicleId === v.id ? 'bg-white text-slate-900 border-amber-500 opacity-100 translate-y-0' : 'bg-slate-900 text-slate-500 border-slate-800 opacity-0 group-hover/map:opacity-100 translate-y-1'
                   }`}>
                     <span className="font-bold">{v.plateNumber}</span>
                     {calculateETA(v) && (
                       <span className="text-emerald-600 border-t border-slate-100 mt-0.5 pt-0.5">{t('eta')}: {calculateETA(v)}</span>
                     )}
                   </div>
                 </div>
               </div>
             ))}

             <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
               <path d="M0,30 Q40,50 60,20 T100,50" stroke="white" strokeWidth="0.8" fill="none" strokeDasharray="5,5" />
               <path d="M10,0 Q60,30 40,80 T90,100" stroke="white" strokeWidth="0.8" fill="none" strokeDasharray="5,5" />
               <circle cx="50" cy="50" r="45" stroke="white" strokeWidth="0.1" fill="none" />
               <circle cx="50" cy="50" r="25" stroke="white" strokeWidth="0.1" fill="none" />
             </svg>
          </div>

          <div className="absolute top-12 left-12 flex flex-col space-y-2 pointer-events-auto z-30">
            <button onClick={zoomIn} className="w-10 h-10 bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl flex items-center justify-center text-white hover:bg-amber-500 transition-all shadow-xl active:scale-95 group">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
            </button>
            <button onClick={zoomOut} className="w-10 h-10 bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl flex items-center justify-center text-white hover:bg-amber-500 transition-all shadow-xl active:scale-95 group">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" /></svg>
            </button>
            <div className="h-2"></div>
            <button onClick={resetMap} className="w-10 h-10 bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl flex items-center justify-center text-white hover:bg-amber-500 transition-all shadow-xl active:scale-95 group" title={t('recenter')}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            </button>
          </div>

          <div className="absolute top-12 right-12 flex flex-col items-end space-y-3 pointer-events-none">
            <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl">
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{t('active_corridor')}</p>
                  <p className="text-sm font-bold text-white uppercase">Matadi-Kinshasa</p>
                </div>
                <div className="w-px h-8 bg-white/10"></div>
                <div className="text-center">
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{t('active_units')}</p>
                  <p className="text-sm font-bold text-amber-500 uppercase">{vehicles.filter(v => v.status === 'In Transit').length}</p>
                </div>
              </div>
            </div>
            <div className="bg-emerald-500/10 backdrop-blur-md border border-emerald-500/20 rounded-lg px-3 py-1.5 flex items-center space-x-2">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-tighter">{t('satellite_uplink')}</span>
            </div>
          </div>

          <div className="absolute bottom-12 left-12 flex items-center space-x-5 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl text-[10px] text-slate-400 font-mono pointer-events-none">
            <div className="space-y-1">
              <div className="flex items-center space-x-3"><span className="w-12 text-slate-600 font-black uppercase">{t('lat_min')}</span><span className="text-slate-200">{mapBounds.minLat.toFixed(4)}</span></div>
              <div className="flex items-center space-x-3"><span className="w-12 text-slate-600 font-black uppercase">{t('lat_max')}</span><span className="text-slate-200">{mapBounds.maxLat.toFixed(4)}</span></div>
            </div>
            <div className="w-px h-10 bg-white/10"></div>
            <div className="space-y-1">
              <div className="flex items-center space-x-3"><span className="w-12 text-slate-600 font-black uppercase">{t('lng_min')}</span><span className="text-slate-200">{mapBounds.minLng.toFixed(4)}</span></div>
              <div className="flex items-center space-x-3"><span className="text-slate-600 font-black uppercase w-12 text-right px-0">{t('zoom')}</span><span className="text-amber-500 font-bold">x{zoom.toFixed(1)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Logistics;
