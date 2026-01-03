
import React, { useState } from 'react';
import { Package, Truck, Wrench, AlertTriangle, CheckCircle, Plus, X, Send, Warehouse, Zap, Droplets, Wifi, Home, Hammer, Map, Activity, Thermometer, Cpu, Crosshair, TrendingUp, Layers, PenTool, RefreshCw, Link, Plane, GitCommit } from 'lucide-react';
import MetricCard from '../components/MetricCard';
import LogisticsMap from '../components/LogisticsMap';
import { useLanguage } from '../contexts/LanguageContext';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { generateDynamicData } from '../services/ollamaService';

interface SupplyRequest {
    id: string;
    item: string;
    quantity: string;
    priority: 'Low' | 'Medium' | 'High' | 'Critical';
    status: 'Pending' | 'Approved' | 'In Transit';
    eta: string;
}

interface LogisticsViewProps {
    onBack?: () => void;
}

// Robust SafeRender Component
const SafeRender = ({ content }: { content: any }) => {
    if (typeof content === 'string' || typeof content === 'number') return <>{content}</>;
    if (typeof content === 'object' && content !== null) {
        // If it's an object, try to render a specific 'value' or 'text' property if it exists, otherwise stringify
        if (content.value !== undefined) return <>{String(content.value)}</>;
        return <>{JSON.stringify(content)}</>;
    }
    return null;
};

const LogisticsView: React.FC<LogisticsViewProps> = ({ onBack }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'supply' | 'fleet' | 'infra' | 'map'>('supply');
  const [showModal, setShowModal] = useState(false);
  const [requests, setRequests] = useState<SupplyRequest[]>([
      { id: 'REQ-8821', item: 'Medical Kits (Type A)', quantity: '500 Units', priority: 'High', status: 'In Transit', eta: '4h 20m' },
      { id: 'REQ-8822', item: 'Diesel Fuel', quantity: '10,000 L', priority: 'Medium', status: 'Approved', eta: '12h 00m' }
  ]);
  
  // Route Status State
  const [routeStatus, setRouteStatus] = useState([
      { name: 'Route Alpha (Djibouti-Galafi)', status: 'Clear', flow: 12 },
      { name: 'Route Bravo (Addis-Moyale)', status: 'Congested', flow: 4 }, 
      { name: 'Route Charlie (Addis-Mekelle)', status: 'Clear', flow: 8 }
  ]);

  const [loadingPred, setLoadingPred] = useState(false);
  const [predictiveData, setPredictiveData] = useState([
      { day: 'Mon', fuel: 4000, ammo: 2000 },
      { day: 'Tue', fuel: 4500, ammo: 2100 },
      { day: 'Wed', fuel: 4200, ammo: 2200 },
      { day: 'Thu', fuel: 5000, ammo: 3500 }, // Predicted Spike
      { day: 'Fri', fuel: 5500, ammo: 4000 },
      { day: 'Sat', fuel: 4800, ammo: 3000 },
      { day: 'Sun', fuel: 4100, ammo: 2500 },
  ]);

  // Blockchain Ledger Data (New Feature)
  const ledgerData = [
      { hash: '0x8f...a12', item: 'Ammo Crate X500', from: 'Depot A', to: 'Frontline', verified: true, timestamp: '10:42:00' },
      { hash: '0x3b...c99', item: 'Fuel Tanker 04', from: 'Refinery', to: 'Airbase', verified: true, timestamp: '10:45:30' },
      { hash: '0x1d...f44', item: 'Spare Parts (T-72)', from: 'Import', to: 'Workshop', verified: false, timestamp: '10:48:15' },
  ];

  const handleUpdatePrediction = async () => {
      setLoadingPred(true);
      
      const prompt = "Analyze supply chain consumption for next 7 days given high intensity maneuvers in Sector 4.";
      const schema = "Array of objects: { day: string (Day name), fuel: number (3000-6000), ammo: number (1500-5000) }";
      
      const data = await generateDynamicData(prompt, schema);
      if (Array.isArray(data) && data.length > 0) {
          // Sanitize data for Recharts (ensure numbers are numbers)
          const cleanData = data.map(item => ({
              day: typeof item.day === 'string' ? item.day : 'Unknown',
              fuel: typeof item.fuel === 'number' ? item.fuel : parseFloat(item.fuel) || 0,
              ammo: typeof item.ammo === 'number' ? item.ammo : parseFloat(item.ammo) || 0,
          }));
          setPredictiveData(cleanData);
      }
      
      setLoadingPred(false);
  }

  const handleRouteStatusChange = (routeId: number, isBlocked: boolean) => {
      setRouteStatus(prev => {
          const newState = [...prev];
          newState[routeId] = {
              ...newState[routeId],
              status: isBlocked ? 'BLOCKED' : 'Clear',
              flow: isBlocked ? 0 : (routeId === 1 ? 4 : (routeId === 0 ? 12 : 8))
          };
          return newState;
      });
  };
  
  // Fleet State
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>('V-T72-01');

  // Form State
  const [newItem, setNewItem] = useState('Ammunition 7.62mm');
  const [newQty, setNewQty] = useState('');
  const [newPriority, setNewPriority] = useState<SupplyRequest['priority']>('Medium');

  const bases = [
      { id: 'B-01', name: t('reg_north'), type: 'Command', power: 98, water: 100, security: 100, status: t('status_operational'), coordinates: 'Grid 44-A' },
      { id: 'B-04', name: 'Bishoftu Air Base', type: 'Airfield', power: 100, water: 95, security: 100, status: t('status_operational'), coordinates: 'Grid 12-C' },
      { id: 'FOB-9', name: 'Togoga Outpost', type: 'FOB', power: 45, water: 30, security: 75, status: 'Degraded', coordinates: 'Grid 88-X', alert: 'Generator Failure' },
      { id: 'B-07', name: 'Bahir Dar Logistics Hub', type: 'Logistics', power: 92, water: 88, security: 95, status: t('status_operational'), coordinates: 'Grid 33-B' },
  ];

  // Enhanced Vehicle List with Drones & Predictive Maintenance
  const vehicles = [
      { id: 'V-T72-01', type: `T-72 Tank`, status: t('status_operational'), location: 'Base Alpha', health: 95, fuel: 82, engineTemp: 85, ammo: 40, predictiveFail: 'Low (0.5% / 24h)' },
      { id: 'V-BMP2-04', type: 'BMP-2 IFV', status: t('status_maintenance'), location: 'Workshop B', health: 45, issue: 'Engine Overheat', fuel: 20, engineTemp: 115, ammo: 0, predictiveFail: 'CRITICAL (98% / 4h)' },
      { id: 'V-TRK-12', type: 'Ural-4320', status: t('status_operational'), location: 'Convoy 4', health: 88, fuel: 65, engineTemp: 90, ammo: 100, predictiveFail: 'Med (12% / 48h)' },
      { id: 'DRONE-LOG-01', type: 'Logistics Drone', status: 'In Flight', location: 'Route Alpha', health: 100, fuel: 75, engineTemp: 40, ammo: 0, predictiveFail: 'Low (0.1% / 24h)' }, // New Drone
      { id: 'DRONE-LOG-02', type: 'Logistics Drone', status: 'Charging', location: 'Base Alpha', health: 98, fuel: 100, engineTemp: 25, ammo: 0, predictiveFail: 'Low (0.1% / 24h)' }, // New Drone
      { id: 'V-HEL-02', type: 'Mi-35 Hind', status: t('status_maintenance'), location: 'Hangar 1', health: 70, issue: 'Rotor Inspection', fuel: 40, engineTemp: 60, ammo: 50, predictiveFail: 'High (45% / 24h)' },
  ];

  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId) || vehicles[0];

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const newReq: SupplyRequest = {
          id: `REQ-${Math.floor(Math.random() * 9000) + 1000}`,
          item: newItem,
          quantity: newQty,
          priority: newPriority,
          status: 'Pending',
          eta: 'Calculating...'
      };
      
      setRequests([newReq, ...requests]);
      setShowModal(false);
      setNewQty('');
      
      // Simulate processing
      setTimeout(() => {
          setRequests(prev => prev.map(r => r.id === newReq.id ? { ...r, status: 'Approved', eta: '24h 00m' } : r));
      }, 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 flex flex-col pb-20">
      {/* Header & Navigation */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2 flex-shrink-0">
         <div>
          <h2 className="text-2xl font-bold text-white tracking-tight font-display">{t('log_title')}</h2>
          <p className="text-gray-400 text-sm font-sans">{t('log_subtitle')} (Part 3.0)</p>
        </div>
        
        <div className="mt-4 md:mt-0 flex flex-wrap gap-2 items-center">
            {activeTab === 'supply' && (
                <button 
                    onClick={() => window.dispatchEvent(new CustomEvent('open-data-terminal'))}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs font-bold px-4 py-2 rounded flex items-center shadow-lg transition-all font-display tracking-wider animate-pulse"
                >
                    <PenTool size={16} className="mr-2" /> LOG INCIDENT
                </button>
            )}
            
            <div className="bg-military-800 p-1 rounded-lg border border-military-700 flex flex-wrap gap-1">
                <button 
                    onClick={() => setActiveTab('supply')}
                    className={`px-4 py-1.5 text-xs font-bold rounded flex items-center transition-all font-display tracking-wide ${activeTab === 'supply' ? 'bg-military-accent text-white shadow' : 'text-gray-400 hover:text-white'}`}
                >
                    <Package size={14} className="mr-2"/> {t('log_tab_supply')}
                </button>
                <button 
                    onClick={() => setActiveTab('map')}
                    className={`px-4 py-1.5 text-xs font-bold rounded flex items-center transition-all font-display tracking-wide ${activeTab === 'map' ? 'bg-military-accent text-white shadow' : 'text-gray-400 hover:text-white'}`}
                >
                    <Map size={14} className="mr-2"/> {t('log_tab_routes')}
                </button>
                <button 
                    onClick={() => setActiveTab('fleet')}
                    className={`px-4 py-1.5 text-xs font-bold rounded flex items-center transition-all font-display tracking-wide ${activeTab === 'fleet' ? 'bg-military-accent text-white shadow' : 'text-gray-400 hover:text-white'}`}
                >
                    <Wrench size={14} className="mr-2"/> {t('log_tab_fleet')}
                </button>
                <button 
                    onClick={() => setActiveTab('infra')}
                    className={`px-4 py-1.5 text-xs font-bold rounded flex items-center transition-all font-display tracking-wide ${activeTab === 'infra' ? 'bg-military-accent text-white shadow' : 'text-gray-400 hover:text-white'}`}
                >
                    <Warehouse size={14} className="mr-2"/> {t('log_tab_infra')}
                </button>
            </div>

            {activeTab === 'supply' && (
                <button 
                    onClick={() => setShowModal(true)}
                    className="bg-military-accent hover:bg-sky-500 text-white text-xs font-bold px-4 py-2 rounded flex items-center shadow-lg transition-all font-display tracking-wider"
                >
                    <Plus size={16} className="mr-2" /> {t('log_btn_req')}
                </button>
            )}

            {onBack && (
                <button 
                    onClick={onBack}
                    className="p-2 text-gray-400 hover:text-white hover:bg-military-700 rounded transition-colors"
                    title="Exit / Back"
                >
                    <X size={20} />
                </button>
            )}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto relative">
          
          {/* TAB: SUPPLY CHAIN */}
          {activeTab === 'supply' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <MetricCard title={t('log_metric_budget')} value="$700M" change={0} icon={Package} />
                    <MetricCard title={t('log_metric_eff')} value="92%" change={1.2} icon={Truck} color="success" />
                    <MetricCard title={t('log_metric_depots')} value="7 Active" change={0} icon={CheckCircle} color="success" />
                    <MetricCard title={t('sarms_anomaly')} value="0 Found" icon={AlertTriangle} color="success" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Predictive Demand Chart (SARMS) */}
                    <div className="lg:col-span-2 bg-military-800 rounded-lg p-6 border border-military-700 flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-lg text-white flex items-center">
                                <TrendingUp className="mr-2 text-yellow-500" size={20} /> {t('sarms_demand')}
                            </h3>
                            <button 
                                onClick={handleUpdatePrediction}
                                disabled={loadingPred}
                                className="text-xs bg-military-900 border border-military-600 px-3 py-1 rounded flex items-center text-gray-300 hover:text-white"
                            >
                                <RefreshCw size={12} className={`mr-1 ${loadingPred ? 'animate-spin' : ''}`} /> Recalculate
                            </button>
                        </div>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={predictiveData}>
                                    <defs>
                                        <linearGradient id="colorFuel" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#eab308" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorAmmo" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                                    <XAxis dataKey="day" stroke="#94a3b8" fontSize={10} />
                                    <YAxis stroke="#94a3b8" fontSize={10} />
                                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                                    <Area type="monotone" dataKey="fuel" stroke="#eab308" strokeWidth={2} fillOpacity={1} fill="url(#colorFuel)" name="Fuel (L)" />
                                    <Area type="monotone" dataKey="ammo" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorAmmo)" name="Ammo (Kg)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">AI Forecast: Anticipated surge in sector 4 consumption on Thursday due to planned maneuvers.</p>
                    </div>

                    {/* Inventory Status & Blockchain Ledger */}
                    <div className="flex flex-col gap-6">
                        <div className="bg-military-800 rounded-lg border border-military-700 overflow-hidden flex flex-col">
                            <div className="p-4 border-b border-military-700 bg-military-900/50 flex justify-between items-center">
                                <h3 className="font-semibold text-white font-display tracking-wide">{t('log_inventory_crit')}</h3>
                                <span className="text-xs text-gray-400 font-mono">Updated: 14:00</span>
                            </div>
                            <div className="p-0 flex-1">
                                <table className="w-full text-left text-sm text-gray-300">
                                    <thead className="bg-military-900 text-xs uppercase text-gray-500 font-semibold font-display">
                                        <tr>
                                            <th className="px-4 py-3">{t('log_col_item')}</th>
                                            <th className="px-4 py-3">{t('log_col_status')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-military-700 font-mono text-xs">
                                        <tr>
                                            <td className="px-4 py-4 font-sans text-sm">{t('log_item_ammo')}</td>
                                            <td className="px-4 py-4 text-green-400 font-bold">{t('status_nominal')}</td>
                                        </tr>
                                        <tr>
                                            <td className="px-4 py-4 font-sans text-sm">{t('log_item_fuel')}</td>
                                            <td className="px-4 py-4 text-yellow-400 font-bold">{t('status_medium')}</td>
                                        </tr>
                                        <tr>
                                            <td className="px-4 py-4 font-sans text-sm">{t('log_item_spares')}</td>
                                            <td className="px-4 py-4 text-red-400 font-bold flex items-center"> <AlertTriangle size={12} className="mr-1"/> {t('status_critical')}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Blockchain Ledger - New Feature */}
                        <div className="bg-military-800 rounded-lg border border-military-700 overflow-hidden flex flex-col flex-1">
                            <div className="p-4 border-b border-military-700 bg-military-900/50">
                                <h3 className="font-semibold text-white font-display tracking-wide flex items-center">
                                    <Link className="mr-2 text-cyan-500" size={16} /> Immutable Ledger
                                </h3>
                            </div>
                            <div className="p-3 space-y-2 overflow-y-auto max-h-[200px]">
                                {ledgerData.map((tx, i) => (
                                    <div key={i} className="text-xs bg-black/20 p-2 rounded border-l-2 border-cyan-500">
                                        <div className="flex justify-between text-gray-400 font-mono text-[9px]">
                                            <span><SafeRender content={tx.timestamp} /></span>
                                            <span><SafeRender content={tx.hash} /></span>
                                        </div>
                                        <div className="font-bold text-white mt-1"><SafeRender content={tx.item} /></div>
                                        <div className="flex justify-between items-center mt-1">
                                            <span className="text-[10px] text-gray-500"><SafeRender content={tx.from} /> &rarr; <SafeRender content={tx.to} /></span>
                                            {tx.verified ? <CheckCircle size={10} className="text-green-500"/> : <AlertTriangle size={10} className="text-red-500"/>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
              </div>
          )}

          {/* TAB: LIVE ROUTES MAP */}
          {activeTab === 'map' && (
              <div className="h-full flex flex-col">
                  <div className="mb-4">
                      <h3 className="font-semibold text-lg text-white flex items-center font-display">
                          <Map className="mr-2 text-military-accent" size={20} /> {t('log_route_network')}
                      </h3>
                      <p className="text-xs text-gray-400 font-sans">{t('log_route_tracking')}</p>
                  </div>
                  <div className="flex-1 bg-black rounded-lg border border-military-700 p-1 min-h-[300px]">
                      <LogisticsMap onRouteStatusChange={handleRouteStatusChange} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                      {routeStatus.map((status, index) => (
                          <div key={index} className="bg-military-800 p-3 rounded border border-military-700">
                              <div className="text-xs text-gray-500 uppercase font-bold font-display"><SafeRender content={status.name} /></div>
                              <div className={`font-bold text-sm font-mono ${status.status === 'BLOCKED' ? 'text-red-500' : status.status === 'Congested' ? 'text-yellow-400' : 'text-green-400'}`}>
                                  <SafeRender content={status.status} />
                              </div>
                              <div className="text-[10px] text-gray-400 font-mono">Flow Rate: <SafeRender content={status.flow} /> Trucks/hr</div>
                          </div>
                      ))}
                  </div>
              </div>
          )}

          {/* TAB: FLEET MAINTENANCE (DIAGNOSTICS CENTER) */}
          {activeTab === 'fleet' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full overflow-y-auto lg:overflow-hidden">
                   {/* Left: Vehicle List */}
                   <div className="bg-military-800 rounded-lg border border-military-700 flex flex-col min-h-[300px]">
                       <div className="p-4 bg-military-900 border-b border-military-700">
                           <h3 className="font-semibold text-white flex items-center font-display">
                               <Wrench size={16} className="mr-2 text-military-accent"/> {t('log_tab_fleet')}
                           </h3>
                       </div>
                       <div className="flex-1 overflow-y-auto p-2 space-y-2 max-h-[500px]">
                           {vehicles.map(v => (
                               <div 
                                    key={v.id} 
                                    onClick={() => setSelectedVehicleId(v.id)}
                                    className={`p-3 rounded border cursor-pointer transition-colors ${selectedVehicleId === v.id ? 'bg-military-700 border-military-accent' : 'bg-military-900/50 border-military-700 hover:border-gray-500'}`}
                               >
                                   <div className="flex justify-between items-start mb-1">
                                       <span className="font-bold text-white text-sm font-display flex items-center">
                                           {v.type.includes('Drone') && <Plane size={10} className="mr-1 text-cyan-400"/>}
                                           {v.type}
                                       </span>
                                       <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase font-mono ${
                                           v.status === t('status_operational') || v.status === 'In Flight' ? 'bg-green-900/30 text-green-400' :
                                           v.status === t('status_critical') ? 'bg-red-900/30 text-red-400 animate-pulse' :
                                           'bg-yellow-900/30 text-yellow-400'
                                       }`}>{v.status}</span>
                                   </div>
                                   <p className="text-xs text-military-accent mb-2 font-mono">{v.id}</p>
                                   
                                   <div className="w-full bg-military-900 rounded-full h-1.5 mb-1">
                                        <div 
                                            className={`h-1.5 rounded-full ${v.health < 40 ? 'bg-red-500' : v.health < 80 ? 'bg-yellow-500' : 'bg-green-500'}`} 
                                            style={{ width: `${v.health}%` }}
                                        ></div>
                                   </div>
                                   <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                                       <span>Health: {v.health}%</span>
                                       <span>{v.location}</span>
                                   </div>
                               </div>
                           ))}
                       </div>
                   </div>

                   {/* Right: Digital Twin Schematic */}
                   <div className="lg:col-span-2 bg-[#0b1120] rounded-lg border border-military-700 flex flex-col relative overflow-hidden min-h-[400px]">
                        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#0ea5e9 1px, transparent 1px), linear-gradient(90deg, #0ea5e9 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
                        
                        <div className="p-4 border-b border-military-800 z-10 flex flex-col md:flex-row justify-between items-start md:items-center bg-black/40 backdrop-blur gap-4">
                            <div>
                                <h3 className="font-mono text-lg font-bold text-white flex items-center font-display">
                                    <Layers className="mr-2 text-green-500" size={20} /> {t('sarms_twin')}
                                </h3>
                                <p className="text-xs text-gray-400 font-mono tracking-wider">UNIT: {selectedVehicle.id} // TYPE: {selectedVehicle.type.toUpperCase()}</p>
                            </div>
                            <div className="flex space-x-4 text-xs font-mono w-full md:w-auto justify-around md:justify-end">
                                <div className="text-center">
                                    <div className="text-gray-500 mb-1">PWR PLANT</div>
                                    <div className={`${selectedVehicle.engineTemp > 100 ? 'text-red-500 animate-pulse' : 'text-green-500'}`}>{selectedVehicle.engineTemp}°C</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-gray-500 mb-1">FUEL LEVEL</div>
                                    <div className={`${selectedVehicle.fuel < 20 ? 'text-red-500' : 'text-blue-400'}`}>{selectedVehicle.fuel}%</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-gray-500 mb-1">ORDNANCE</div>
                                    <div className={`${selectedVehicle.ammo < 30 ? 'text-yellow-500' : 'text-white'}`}>{selectedVehicle.ammo}%</div>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 flex items-center justify-center relative p-8">
                            {/* SVG Wireframe - Scaled for responsiveness */}
                            <svg viewBox="0 0 600 400" className="w-full h-full max-w-2xl drop-shadow-[0_0_10px_rgba(14,165,233,0.3)]">
                                <defs>
                                    <pattern id="hatch" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                                        <rect width="2" height="4" transform="translate(0,0)" fill="rgba(14,165,233,0.1)"></rect>
                                    </pattern>
                                </defs>
                                
                                {selectedVehicle.type.includes('Drone') ? (
                                    // Drone Visual
                                    <g>
                                        <path d="M 100 200 L 500 200" stroke="#0ea5e9" strokeWidth="2" /> {/* Wings */}
                                        <ellipse cx="300" cy="200" rx="40" ry="120" fill="none" stroke="#0ea5e9" strokeWidth="2" /> {/* Fuselage */}
                                        <circle cx="100" cy="200" r="20" stroke="#0ea5e9" fill="rgba(14,165,233,0.1)" className="animate-spin" /> {/* Rotor L */}
                                        <circle cx="500" cy="200" r="20" stroke="#0ea5e9" fill="rgba(14,165,233,0.1)" className="animate-spin" /> {/* Rotor R */}
                                        
                                        {/* Payload */}
                                        <rect x="280" y="180" width="40" height="40" stroke="white" fill="none" />
                                        <text x="330" y="190" fill="white" fontSize="10" fontFamily="monospace">PAYLOAD: MEDICAL</text>
                                    </g>
                                ) : (
                                    // Standard Vehicle Visual
                                    <g>
                                        {/* Chassis Body */}
                                        <path 
                                            d="M 50 250 L 550 250 L 580 200 L 520 150 L 80 150 L 20 200 Z" 
                                            fill="none" 
                                            stroke={selectedVehicle.health < 50 ? "#ef4444" : "#0ea5e9"} 
                                            strokeWidth="2"
                                            className="transition-all duration-500"
                                        />
                                        <path d="M 50 250 L 550 250 L 580 200 L 520 150 L 80 150 L 20 200 Z" fill="url(#hatch)" opacity="0.3" />

                                        {/* Turret (If tank/IFV) */}
                                        {selectedVehicle.type.includes('Tank') || selectedVehicle.type.includes('IFV') ? (
                                            <g className="group/turret">
                                                <path 
                                                    d="M 200 150 L 400 150 L 380 100 L 220 100 Z" 
                                                    fill="rgba(0,0,0,0.5)" 
                                                    stroke="#0ea5e9" 
                                                    strokeWidth="2" 
                                                />
                                                <rect x="380" y="115" width="150" height="10" fill="#0ea5e9" opacity="0.8" />
                                            </g>
                                        ) : null}

                                        {/* Engine Block (Rear) */}
                                        <g className="group/engine">
                                            <rect x="400" y="160" width="100" height="80" fill="none" stroke={selectedVehicle.engineTemp > 100 ? "#ef4444" : "#22c55e"} strokeWidth="2" strokeDasharray="5 5" />
                                            <circle cx="450" cy="200" r="4" fill={selectedVehicle.engineTemp > 100 ? "#ef4444" : "#22c55e"} className="animate-ping" />
                                        </g>

                                        {/* Tracks/Wheels */}
                                        <g className="group/track">
                                            <rect x="40" y="250" width="520" height="40" rx="10" fill="none" stroke="#64748b" strokeWidth="2" />
                                            {[...Array(6)].map((_, i) => (
                                                <circle key={i} cx={90 + i * 85} cy="270" r="15" fill="none" stroke="#475569" strokeWidth="2" />
                                            ))}
                                        </g>
                                    </g>
                                )}
                            </svg>
                        </div>
                        
                        {/* Alerts & Predictive Maintenance Area */}
                        <div className="absolute bottom-4 left-4 right-4 flex flex-col md:flex-row gap-4">
                            {selectedVehicle.issue && (
                                <div className="flex-1 bg-red-900/80 border border-red-500 text-white p-3 rounded flex items-center justify-between backdrop-blur animate-pulse">
                                    <div className="flex items-center">
                                        <AlertTriangle className="mr-3" />
                                        <div>
                                            <h4 className="font-bold text-sm font-display">CRITICAL ALERT</h4>
                                            <p className="text-xs font-mono"><SafeRender content={selectedVehicle.issue} /></p>
                                        </div>
                                    </div>
                                    <button className="bg-white text-red-900 text-xs font-bold px-3 py-1 rounded font-display">SCHEDULE REPAIR</button>
                                </div>
                            )}
                            
                            {/* AI Predictive Maintenance - New Feature */}
                            <div className="flex-1 bg-blue-900/80 border border-blue-500 text-white p-3 rounded flex items-center justify-between backdrop-blur">
                                <div className="flex items-center">
                                    <Cpu className="mr-3 text-blue-300" />
                                    <div>
                                        <h4 className="font-bold text-sm font-display">AI PREDICTIVE MAINT</h4>
                                        <p className="text-xs font-mono">Failure Prob: <SafeRender content={selectedVehicle.predictiveFail} /></p>
                                    </div>
                                </div>
                                <div className="text-[10px] text-blue-200 text-right">
                                    <div className="font-bold">MTBF: 420 HRS</div>
                                    <div>Analysis: {new Date().toLocaleTimeString()}</div>
                                </div>
                            </div>
                        </div>
                   </div>
              </div>
          )}

           {/* TAB: INFRASTRUCTURE */}
           {activeTab === 'infra' && (
               <div className="space-y-6 overflow-y-auto p-1 h-full">
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {bases.map(base => (
                            <div key={base.id} className="bg-military-800 rounded-lg border border-military-700 p-5 flex flex-col hover:border-military-500 transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-white font-display"><SafeRender content={base.name} /></h3>
                                        <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded mt-1 inline-block font-mono ${
                                            base.status === t('status_operational') ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
                                        }`}>
                                            <SafeRender content={base.status} />
                                        </span>
                                    </div>
                                    <div className="p-2 bg-military-900 rounded-lg">
                                        <Home size={20} className="text-military-accent" />
                                    </div>
                                </div>

                                <div className="space-y-3 flex-1">
                                    <div>
                                        <div className="flex justify-between text-xs text-gray-400 mb-1 font-mono">
                                            <span className="flex items-center"><Zap size={12} className="mr-1"/> Power Grid</span>
                                            <span className={`${base.power < 50 ? 'text-red-500 font-bold' : ''}`}>{base.power}%</span>
                                        </div>
                                        <div className="w-full bg-military-900 rounded-full h-1.5">
                                            <div className={`h-1.5 rounded-full ${base.power < 50 ? 'bg-red-500' : 'bg-yellow-400'}`} style={{ width: `${base.power}%` }}></div>
                                        </div>
                                    </div>
                                     <div>
                                        <div className="flex justify-between text-xs text-gray-400 mb-1 font-mono">
                                            <span className="flex items-center"><Droplets size={12} className="mr-1"/> Water Supply</span>
                                            <span>{base.water}%</span>
                                        </div>
                                        <div className="w-full bg-military-900 rounded-full h-1.5">
                                            <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${base.water}%` }}></div>
                                        </div>
                                    </div>
                                </div>

                                {base.alert && (
                                    <div className="mt-4 p-2 bg-red-900/20 border border-red-900/50 rounded flex items-center">
                                        <AlertTriangle size={14} className="text-red-500 mr-2" />
                                        <span className="text-[10px] text-red-300 font-mono"><SafeRender content={base.alert} /></span>
                                    </div>
                                )}
                                
                                <div className="mt-3 flex justify-between items-center text-[10px] text-gray-500 border-t border-military-700 pt-2 font-mono">
                                    <span>COORD: {base.coordinates}</span>
                                    <button className="text-blue-400 hover:text-white">DETAILS &gt;</button>
                                </div>
                            </div>
                        ))}
                   </div>
               </div>
           )}
      </div>

      {/* Modal */}
      {showModal && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
              <div className="bg-military-800 border border-military-600 rounded-lg w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                  <div className="p-4 border-b border-military-700 flex justify-between items-center bg-military-900">
                      <h3 className="font-bold text-white flex items-center font-display">
                          <Package className="mr-2 text-military-accent" /> {t('log_modal_title')}
                      </h3>
                      <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white"><X size={20}/></button>
                  </div>
                  <form onSubmit={handleSubmit} className="p-6 space-y-4">
                      <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('log_modal_item')}</label>
                          <select 
                              value={newItem} 
                              onChange={(e) => setNewItem(e.target.value)}
                              className="w-full bg-military-900 border border-military-600 rounded p-2 text-white text-sm focus:outline-none focus:border-military-accent"
                          >
                              <option>Ammunition 7.62mm</option>
                              <option>Diesel Fuel (1000L)</option>
                              <option>MRE Rations (Box)</option>
                              <option>Spare Parts (T-72)</option>
                              <option>Medical Kit (Trauma)</option>
                          </select>
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('log_modal_qty')}</label>
                          <input 
                              type="text" 
                              value={newQty}
                              onChange={(e) => setNewQty(e.target.value)}
                              className="w-full bg-military-900 border border-military-600 rounded p-2 text-white text-sm focus:outline-none focus:border-military-accent"
                              placeholder="e.g. 500 Boxes"
                              required
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('lbl_priority')}</label>
                          <select 
                              value={newPriority} 
                              onChange={(e) => setNewPriority(e.target.value as any)}
                              className="w-full bg-military-900 border border-military-600 rounded p-2 text-white text-sm focus:outline-none focus:border-military-accent"
                          >
                              <option>Low</option>
                              <option>Medium</option>
                              <option>High</option>
                              <option>Critical</option>
                          </select>
                      </div>
                      <div className="pt-2 flex justify-end">
                          <button 
                            type="submit" 
                            className="bg-military-accent hover:bg-sky-500 text-white font-bold py-2 px-6 rounded flex items-center transition-colors font-display tracking-wide"
                          >
                              <Send size={16} className="mr-2" /> {t('log_modal_submit')}
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default LogisticsView;
