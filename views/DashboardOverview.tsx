
import React, { useState, useEffect } from 'react';
import MetricCard from '../components/MetricCard';
import { Activity, Users, ShieldAlert, Truck, Radio, Target, BrainCircuit, RefreshCw, AlertTriangle, Satellite, Wifi, Globe, Zap, MapPin, Maximize2, LayoutGrid, Video, Crosshair, Eye, GraduationCap, ChevronRight } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { getStrategicForecast } from '../services/ollamaService';
import { useLanguage } from '../contexts/LanguageContext';
import { ViewState } from '../types';
import TacticalMap from '../components/TacticalMap';

interface DashboardOverviewProps {
    onNavigate: (view: ViewState) => void;
    defcon: number;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({ onNavigate, defcon }) => {
  const { t, language } = useLanguage();
  const [sitRoomMode, setSitRoomMode] = useState(false);
  const [telemetryData, setTelemetryData] = useState([
    { name: '00:00', readiness: 85, threats: 12 },
    { name: '04:00', readiness: 86, threats: 15 },
    { name: '08:00', readiness: 89, threats: 10 },
    { name: '12:00', readiness: 88, threats: 8 },
    { name: '16:00', readiness: 90, threats: 14 },
    { name: '20:00', readiness: 87, threats: 11 },
    { name: '24:00', readiness: 88, threats: 9 },
  ]);
  const [forecast, setForecast] = useState<string | null>(null);
  const [loadingForecast, setLoadingForecast] = useState(false);
  const [userCoords, setUserCoords] = useState<string>("Locating...");

  // Live Telemetry Simulation
  useEffect(() => {
    const interval = window.setInterval(() => {
      setTelemetryData(prevData => {
        const lastItem = prevData[prevData.length - 1];
        const newReadiness = Math.min(100, Math.max(70, lastItem.readiness + (Math.random() - 0.5) * 5));
        const newThreats = Math.max(0, Math.min(50, lastItem.threats + (Math.random() - 0.5) * 4));
        
        const now = new Date();
        const timeLabel = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        const newData = [...prevData.slice(1), { name: timeLabel, readiness: parseFloat(newReadiness.toFixed(1)), threats: parseFloat(newThreats.toFixed(1)) }];
        return newData;
      });
    }, 2000); 

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
      handleRefreshForecast();
      
      // Get Geolocation with proper error handling
      if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
              (position) => {
                  const { latitude, longitude } = position.coords;
                  setUserCoords(`${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E`);
              },
              (error) => {
                  console.warn("Geolocation warning:", error.message);
                  setUserCoords("GPS SIGNAL LOST");
              },
              { timeout: 10000, maximumAge: 60000 }
          );
      } else {
          setUserCoords("GPS N/A");
      }
  }, [language]);

  const handleRefreshForecast = async () => {
      setLoadingForecast(true);
      const data = await getStrategicForecast(language);
      setForecast(data);
      setLoadingForecast(false);
  }

  const isForecastError = forecast?.includes("offline") || forecast?.includes("unavailable");

  // Situation Room View
  if (sitRoomMode) {
      return (
          <div className="h-full flex flex-col space-y-4 animate-in fade-in zoom-in duration-300">
              <div className="flex flex-col md:flex-row justify-between items-center bg-red-900/20 p-2 rounded border border-red-900/50 shrink-0 backdrop-blur-md">
                  <div className="flex items-center space-x-4 mb-2 md:mb-0">
                      <span className="text-red-500 font-bold text-lg animate-pulse tracking-widest font-display">ENDF JOINT CMD :: SITUATION ROOM</span>
                      <span className="text-xs text-red-400 font-mono border border-red-500/50 px-2 py-0.5 rounded">DEFCON {defcon}</span>
                  </div>
                  <div className="text-xs text-gray-400 font-mono hidden md:block">
                      LOC: {userCoords}
                  </div>
                  <button 
                    onClick={() => setSitRoomMode(false)}
                    className="bg-military-800 hover:bg-military-700 text-white px-3 py-1 rounded text-xs flex items-center border border-military-600 font-sans transition-colors"
                  >
                      <LayoutGrid size={14} className="mr-2" /> EXIT SITROOM
                  </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0 overflow-y-auto">
                  {/* Top Left: Tactical Map */}
                  <div className="bg-black rounded border border-military-700 relative overflow-hidden flex flex-col min-h-[300px]">
                      <div className="absolute top-2 left-2 z-10 bg-black/60 px-2 rounded text-[10px] text-green-500 font-bold font-mono border border-green-900">LIVE OPS MAP</div>
                      <div className="flex-1">
                          <TacticalMap holoMode={true} />
                      </div>
                  </div>

                  {/* Top Right: Live Drone Feed */}
                  <div className="bg-black rounded border border-military-700 relative overflow-hidden flex flex-col min-h-[300px]">
                      <div className="absolute top-2 left-2 z-10 bg-red-600/80 px-2 rounded text-[10px] text-white font-bold animate-pulse font-mono">UAV-09 FEED</div>
                      <div className="flex-1 bg-[url('https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center grayscale opacity-60"></div>
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <Crosshair size={48} className="text-green-500/50" strokeWidth={1} />
                      </div>
                  </div>

                  {/* Bottom Left: Comms Waterfall */}
                  <div className="bg-black rounded border border-military-700 p-4 overflow-hidden relative min-h-[200px]">
                      <div className="absolute top-2 left-2 text-[10px] text-yellow-500 font-bold font-mono">ENCRYPTED COMMS STREAM</div>
                      <div className="mt-6 space-y-1 font-mono text-[10px] text-green-400 opacity-80">
                          <p>[10:42:12] ALPHA-1 &gt; CMD: Reached waypoint. Holding.</p>
                          <p>[10:42:15] BRAVO-6 &gt; CMD: Visual on target. Awaiting green light.</p>
                          <p>[10:42:18] INTEL &gt; ALL: Signal spike detected Sector 4.</p>
                          <p className="text-red-400 animate-pulse">[10:42:22] ALERT: Unidentified aircraft bearing 220.</p>
                          <p>[10:42:25] AIR &gt; CMD: Scrambling interceptors.</p>
                          <p>[10:42:30] LOG &gt; BASE: Convoy delayed. Rerouting.</p>
                          <p>[10:42:35] SAT &gt; LINK: Handshake complete. High bandwidth active.</p>
                      </div>
                  </div>

                  {/* Bottom Right: Threat Radar */}
                  <div className="bg-black rounded border border-military-700 relative flex items-center justify-center min-h-[200px]">
                      <div className="absolute top-2 left-2 text-[10px] text-blue-500 font-bold font-mono">THREAT RADAR</div>
                      <div className="w-48 h-48 rounded-full border border-green-900/50 relative flex items-center justify-center">
                          <div className="absolute w-full h-full rounded-full border border-green-900/30 animate-ping" style={{animationDuration: '3s'}}></div>
                          <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                          {/* Blips */}
                          <div className="absolute top-10 right-10 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_red]"></div>
                          <div className="absolute bottom-12 left-14 w-2 h-2 bg-yellow-500 rounded-full"></div>
                          {/* Sweep */}
                          <div className="absolute w-24 h-24 top-0 left-0 origin-bottom-right bg-gradient-to-t from-transparent to-green-500/20 animate-spin" style={{animationDuration: '4s'}}></div>
                      </div>
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 flex flex-col h-[calc(100vh-140px)]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2 flex-shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight font-display">{t('dash_title')}</h2>
          <div className="flex items-center space-x-2 mt-1">
              <p className="text-gray-400 text-sm font-sans">{t('dash_subtitle')}</p>
              <span className="text-gray-600 text-xs">•</span>
              <div className="flex items-center text-xs text-blue-400 font-mono bg-blue-900/20 px-2 py-0.5 rounded border border-blue-900/50">
                  <MapPin size={10} className="mr-1"/> {userCoords}
              </div>
          </div>
        </div>
        <div className="flex items-center space-x-3 mt-2 md:mt-0">
            <button 
                onClick={() => setSitRoomMode(true)}
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-1.5 rounded flex items-center shadow-lg shadow-red-900/30 transition-all border border-red-500 font-display tracking-wider hover:scale-105"
            >
                <Maximize2 size={14} className="mr-2" /> SITROOM
            </button>
            <div className="px-3 py-1 bg-green-900/30 border border-green-500/30 text-green-400 text-xs rounded-full flex items-center shadow-[0_0_10px_rgba(16,185,129,0.2)] font-mono">
                <Activity size={12} className="mr-2 animate-pulse" />
                {t('dash_live_feed')}
            </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="space-y-6">
            {/* Strategic Goals Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-military-800 p-4 rounded border border-military-700 flex items-center shadow-lg transition-transform hover:scale-[1.02] cursor-default">
                    <div className="p-3 rounded-full bg-blue-900/30 text-blue-400 mr-4 border border-blue-500/30"><Users size={20} /></div>
                    <div>
                        <h4 className="font-bold text-white text-sm">Ethical Leadership</h4>
                        <p className="text-xs text-gray-400">Objective, data-driven personnel development.</p>
                    </div>
                </div>
                <div className="bg-military-800 p-4 rounded border border-military-700 flex items-center shadow-lg transition-transform hover:scale-[1.02] cursor-default">
                    <div className="p-3 rounded-full bg-green-900/30 text-green-400 mr-4 border border-green-500/30"><Eye size={20} /></div>
                    <div>
                        <h4 className="font-bold text-white text-sm">Situational Awareness</h4>
                        <p className="text-xs text-gray-400">Fused, real-time intelligence picture.</p>
                    </div>
                </div>
                <div className="bg-military-800 p-4 rounded border border-military-700 flex items-center shadow-lg transition-transform hover:scale-[1.02] cursor-default">
                    <div className="p-3 rounded-full bg-purple-900/30 text-purple-400 mr-4 border border-purple-500/30"><BrainCircuit size={20} /></div>
                    <div>
                        <h4 className="font-bold text-white text-sm">Optimal Decisions</h4>
                        <p className="text-xs text-gray-400">AI-driven predictive crisis prevention.</p>
                    </div>
                </div>
            </div>

            {/* System Uplink Matrix */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div 
                    onClick={() => onNavigate(ViewState.SPACE_COMMAND)}
                    className="bg-military-800/50 border border-military-700 p-3 rounded flex items-center justify-between cursor-pointer hover:bg-military-800 hover:border-purple-500 transition-all group"
                >
                    <div className="flex items-center space-x-2">
                        <Satellite size={16} className="text-purple-400 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-bold text-gray-300 font-display tracking-wider group-hover:text-white">SPACE CMD</span>
                    </div>
                    <span className="text-[10px] text-green-500 font-mono">LINKED</span>
                </div>
                <div 
                    onClick={() => onNavigate(ViewState.AI_NEXUS)}
                    className="bg-military-800/50 border border-military-700 p-3 rounded flex items-center justify-between cursor-pointer hover:bg-military-800 hover:border-blue-500 transition-all group"
                >
                    <div className="flex items-center space-x-2">
                        <BrainCircuit size={16} className="text-blue-400 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-bold text-gray-300 font-display tracking-wider group-hover:text-white">AI NEXUS</span>
                    </div>
                    <span className="text-[10px] text-green-500 font-mono">ONLINE</span>
                </div>
                <div 
                    onClick={() => onNavigate(ViewState.COMMUNICATIONS)}
                    className="bg-military-800/50 border border-military-700 p-3 rounded flex items-center justify-between cursor-pointer hover:bg-military-800 hover:border-yellow-500 transition-all group"
                >
                    <div className="flex items-center space-x-2">
                        <Wifi size={16} className="text-yellow-400 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-bold text-gray-300 font-display tracking-wider group-hover:text-white">GLOBENET</span>
                    </div>
                    <span className="text-[10px] text-green-500 font-mono">SECURE</span>
                </div>
                <div 
                    onClick={() => onNavigate(ViewState.INTELLIGENCE)}
                    className="bg-military-800/50 border border-military-700 p-3 rounded flex items-center justify-between cursor-pointer hover:bg-military-800 hover:border-red-500 transition-all group"
                >
                    <div className="flex items-center space-x-2">
                        <ShieldAlert size={16} className="text-red-400 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-bold text-gray-300 font-display tracking-wider group-hover:text-white">CYBER DEF</span>
                    </div>
                    <span className="text-[10px] text-yellow-500 font-mono animate-pulse">ALERT</span>
                </div>
            </div>

            {/* Interactive Top Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard 
                    title={t('dash_readiness')} 
                    value={`${telemetryData[telemetryData.length-1].readiness}%`} 
                    change={1.2} 
                    icon={Activity} 
                    color="success" 
                    onClick={() => onNavigate(ViewState.OPERATIONS)}
                />
                <MetricCard 
                    title={t('dash_personnel')} 
                    value="162,040" 
                    change={0.5} 
                    icon={Users} 
                    onClick={() => onNavigate(ViewState.HR)}
                />
                <MetricCard 
                    title={t('dash_threats')} 
                    value={Math.floor(telemetryData[telemetryData.length-1].threats).toString()} 
                    change={-20} 
                    icon={ShieldAlert} 
                    color="danger" 
                    onClick={() => onNavigate(ViewState.INTELLIGENCE)}
                />
                <MetricCard 
                    title={t('dash_logistics')} 
                    value="94.5%" 
                    change={2.1} 
                    icon={Truck} 
                    color="warning" 
                    onClick={() => onNavigate(ViewState.LOGISTICS)}
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Main Chart Area */}
                <div className="lg:col-span-2 bg-military-800 rounded-lg p-6 border border-military-700 shadow-xl flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-semibold text-lg text-white flex items-center font-display">
                    <Activity className="mr-2 text-military-accent" size={20}/> 
                    {t('dash_chart_main')}
                    </h3>
                    <div className="flex space-x-2">
                        <span className="flex items-center text-[10px] text-gray-400 font-mono"><div className="w-2 h-2 bg-emerald-500 rounded-full mr-1"></div> Readiness</span>
                        <span className="flex items-center text-[10px] text-gray-400 font-mono"><div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div> Threats</span>
                    </div>
                </div>
                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={telemetryData}>
                        <defs>
                        <linearGradient id="colorReadiness" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorThreats" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} fontFamily="monospace" />
                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} fontFamily="monospace" />
                        <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '4px', fontFamily: 'monospace' }}
                        itemStyle={{ color: '#e2e8f0' }}
                        />
                        <Area type="monotone" dataKey="readiness" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorReadiness)" isAnimationActive={false} />
                        <Area type="monotone" dataKey="threats" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorThreats)" isAnimationActive={false} />
                    </AreaChart>
                    </ResponsiveContainer>
                </div>
                </div>

                {/* AI & Alerts Side Panel */}
                <div className="space-y-6">
                {/* AI Status */}
                <div className="bg-military-800 rounded-lg p-6 border border-military-700 relative overflow-hidden flex flex-col min-h-[200px] shadow-lg">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <BrainCircuit size={100} />
                    </div>
                    <div className="flex justify-between items-center mb-4 z-10">
                        <h3 className="font-semibold text-lg text-white flex items-center font-display">
                        <BrainCircuit className="mr-2 text-purple-400" size={20} />
                        {t('dash_ai_forecast')}
                        </h3>
                        <button onClick={handleRefreshForecast} disabled={loadingForecast} className="text-gray-400 hover:text-white transition-colors">
                            <RefreshCw size={14} className={loadingForecast ? "animate-spin" : ""} />
                        </button>
                    </div>
                    
                    <div className="flex-1 relative z-10 bg-military-900/50 rounded border border-military-600 p-4 text-sm text-gray-300">
                        {loadingForecast ? (
                            <div className="flex items-center justify-center h-full space-x-2 text-purple-400">
                                <BrainCircuit size={16} className="animate-pulse" />
                                <span className="font-mono">{t('intel_scan_btn')}</span>
                            </div>
                        ) : isForecastError ? (
                            <div className="flex flex-col items-center justify-center h-full text-yellow-500 p-2 text-center">
                                <AlertTriangle size={24} className="mb-2" />
                                <span className="font-bold text-xs font-mono">AI OFFLINE</span>
                                <p className="text-[10px] text-gray-400 mt-1 font-sans">Network unavailable or API key restricted. Displaying last cached metrics.</p>
                            </div>
                        ) : (
                            <div className="space-y-2 whitespace-pre-line text-xs md:text-sm animate-in fade-in font-sans leading-relaxed">
                                {forecast}
                            </div>
                        )}
                    </div>
                </div>

                {/* Training Quick Link Widget */}
                <div 
                    onClick={() => onNavigate(ViewState.TRAINING)}
                    className="bg-military-800 rounded-lg p-4 border border-military-700 hover:border-purple-500 cursor-pointer transition-colors shadow-lg group relative overflow-hidden"
                >
                    <div className="absolute right-0 top-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <GraduationCap size={64} />
                    </div>
                    <h3 className="font-semibold text-white mb-2 flex items-center font-display">
                        <GraduationCap className="mr-2 text-purple-500" size={18} /> Education Cmd
                    </h3>
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-xs text-gray-400">Next Cycle: 12 Oct</p>
                            <p className="text-xs text-green-400 font-bold">Recruits: 12,500</p>
                        </div>
                        <ChevronRight size={16} className="text-gray-500 group-hover:text-white transition-transform group-hover:translate-x-1" />
                    </div>
                </div>

                {/* Active Theaters */}
                <div className="bg-military-800 rounded-lg p-6 border border-military-700 shadow-lg">
                    <h3 className="font-semibold text-lg text-white mb-4 flex items-center font-display">
                    <MapPin className="mr-2 text-military-accent" size={20} />
                    Active Theaters
                    </h3>
                    <div className="space-y-3">
                    <div 
                        onClick={() => onNavigate(ViewState.ENGINEERING)}
                        className="flex items-center justify-between p-3 bg-military-900/50 rounded border-l-2 border-green-500 cursor-pointer hover:bg-military-700 transition-colors"
                    >
                        <div>
                        <h4 className="text-xs font-bold text-white font-sans">GERD Defense Zone</h4>
                        <p className="text-[10px] text-gray-400 font-mono">Air Defense: Active</p>
                        </div>
                        <ShieldAlert size={14} className="text-green-500" />
                    </div>
                    <div 
                        onClick={() => onNavigate(ViewState.PEACEKEEPING)}
                        className="flex items-center justify-between p-3 bg-military-900/50 rounded border-l-2 border-yellow-500 cursor-pointer hover:bg-military-700 transition-colors"
                    >
                        <div>
                        <h4 className="text-xs font-bold text-white font-sans">Somalia (ATMIS)</h4>
                        <p className="text-[10px] text-gray-400 font-mono">Sector 3: High Alert</p>
                        </div>
                        <AlertTriangle size={14} className="text-yellow-500" />
                    </div>
                    <div 
                        onClick={() => onNavigate(ViewState.OPERATIONS)}
                        className="flex items-center justify-between p-3 bg-military-900/50 rounded border-l-2 border-blue-500 cursor-pointer hover:bg-military-700 transition-colors"
                    >
                        <div>
                        <h4 className="text-xs font-bold text-white font-sans">Northern Border</h4>
                        <p className="text-[10px] text-gray-400 font-mono">Patrols: Routine</p>
                        </div>
                        <Activity size={14} className="text-blue-500" />
                    </div>
                    </div>
                </div>

                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
