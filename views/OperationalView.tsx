
import React, { useState, useEffect, useRef } from 'react';
import { Swords, Monitor, Activity, Shield, Crosshair, AlertTriangle, Zap, Play, Square, Pause, RotateCcw, Settings, Terminal, ShieldAlert, Sparkles, BrainCircuit, Hexagon, Link, Skull, CheckCircle, ArrowRight, ChevronDown, ChevronRight, Volume2, StopCircle, RefreshCw, FileText, Lightbulb, Hammer, Archive, TrendingUp, Scale, Brain, Users, TrendingDown, Fuel, Package, Box, BarChart2, DollarSign, Target, Network, List, Layers, Plus, X, Maximize2, Map } from 'lucide-react';
import MetricCard from '../components/MetricCard';
import TacticalMap, { Unit } from '../components/TacticalMap';
import { useLanguage } from '../contexts/LanguageContext';
import { generateScenarioBriefing, runStrategySimulation, generateSpeech, generateAAR, expandSimulationDetail } from '../services/ollamaService';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell, ReferenceLine } from 'recharts';
import TaskList from '../components/TaskList';
import { Task } from '../types';

interface StrategyOption {
    id: string;
    name: string;
    description: string;
    deterrence_score: number;
    cost_projection: string;
    civilian_risk: string;
    win_probability: number;
}

interface SimResult {
    title?: string;
    summary?: string;
    adversary_analysis?: {
        profile: string;
        perception_filter: string;
        likely_response: string;
        red_lines: string[];
    };
    cross_domain_matrix?: {
        military_readiness: number;
        diplomatic_trust: number;
        economic_cost: number;
        domestic_morale: number;
        legal_compliance: number;
    };
    resource_impact?: {
        fuel_depletion: number;
        ammo_depletion: number;
        budget_burn: number;
        manpower_stress: number;
    };
    strategic_options?: StrategyOption[];
    rationale?: string;
    outcome_vector?: string;
    insider_insight?: string;
    hexad_analysis?: any;
    risks?: any[];
    recommendations?: any[];
}

interface OperationalViewProps {
    onBack?: () => void;
}

// Helper to safely render AI text that might be returned as an object
const SafeRender = ({ content }: { content: any }) => {
    if (typeof content === 'string' || typeof content === 'number') return <>{content}</>;
    if (typeof content === 'object' && content !== null) {
        // Try to handle common unexpected object shapes
        if (content.value !== undefined) return <>{String(content.value)}</>;
        if (content.text !== undefined) return <>{String(content.text)}</>;
        return <>{JSON.stringify(content)}</>;
    }
    return null;
};

const OrgNode = ({ label, role, children, expanded = false, level = 'Unit', status = 'Active' }: { label: string, role: string, children?: React.ReactNode, expanded?: boolean, level?: string, status?: string }) => {
    const [isOpen, setIsOpen] = useState(expanded);
    
    const getBorderColor = () => {
        switch(status) {
            case 'Active': return 'border-l-green-500';
            case 'Engaged': return 'border-l-red-500';
            case 'Reserve': return 'border-l-yellow-500';
            default: return 'border-l-gray-600';
        }
    };

    return (
        <div className={`ml-6 border-l-2 ${getBorderColor()} pl-4 py-2 relative animate-in slide-in-from-left-2`}>
            <div 
                className="flex items-center cursor-pointer hover:bg-military-700/30 p-2 rounded transition-colors group"
                onClick={() => setIsOpen(!isOpen)}
            >
                {children ? (
                    isOpen ? <ChevronDown size={14} className="mr-2 text-gray-500" /> : <ChevronRight size={14} className="mr-2 text-gray-500" />
                ) : <span className="w-5 mr-2"></span>}
                
                <div className="flex-1">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center">
                            <span className="text-[9px] uppercase bg-black/40 text-gray-400 px-1 rounded mr-2 border border-gray-700">{level}</span>
                            <span className="text-sm font-bold text-white group-hover:text-military-accent transition-colors">{label}</span>
                        </div>
                        <span className={`text-[9px] px-2 py-0.5 rounded font-mono uppercase ${
                            status === 'Active' ? 'bg-green-900/30 text-green-400' :
                            status === 'Engaged' ? 'bg-red-900/30 text-red-400 animate-pulse' :
                            'bg-gray-800 text-gray-400'
                        }`}>
                            {status}
                        </span>
                    </div>
                    <div className="text-[10px] text-gray-500 flex items-center mt-0.5">
                        <Users size={10} className="mr-1" /> {role}
                    </div>
                </div>
            </div>
            {isOpen && children && (
                <div className="mt-1">
                    {children}
                </div>
            )}
        </div>
    );
};

const OperationalView: React.FC<OperationalViewProps> = ({ onBack }) => {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'live' | 'missions' | 'readiness' | 'structure'>('live');
  const [showSimModal, setShowSimModal] = useState(false);
  const [showMissionModal, setShowMissionModal] = useState(false);
  
  // ACSAS (4.2) Toggles
  const [acsasBFT, setAcsasBFT] = useState(true); // Blue Force Tracking
  const [acsasPredict, setAcsasPredict] = useState(false); // Enemy Prediction
  const [acsasUAV, setAcsasUAV] = useState(true); // UAV Integration

  // Independent States for Red and Blue Teams
  const [simMode, setSimMode] = useState<'standard' | 'red_team'>('standard');
  const [simParams, setSimParams] = useState({
      timeHorizon: '180 Days',
      adversaryProfile: 'Paranoid / Conventional',
      resources: 'Standard Readiness (Level 3)'
  });
  const [blueScenario, setBlueScenario] = useState('');
  const [redScenario, setRedScenario] = useState('');
  const [blueResult, setBlueResult] = useState<SimResult | null>(null);
  const [redResult, setRedResult] = useState<SimResult | null>(null);
  const [simulating, setSimulating] = useState(false);

  // Audio State
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  // Detail Expansion State
  const [expandingId, setExpandingId] = useState<string | null>(null);
  const [expandedDetails, setExpandedDetails] = useState<Record<string, string>>({});

  const [holoMode, setHoloMode] = useState(false);
  
  // Real-Time Units for Map
  const [mapUnits, setMapUnits] = useState<Unit[]>([]);

  // Cleanup audio on unmount
  useEffect(() => {
      return () => stopAudio();
  }, []);

  const stopAudio = () => {
      if (audioSourceRef.current) {
          try { audioSourceRef.current.stop(); } catch(e) {}
          audioSourceRef.current = null;
      }
      setIsSpeaking(false);
  };

  const playBriefing = async (result: SimResult) => {
      if (!result) return;
      stopAudio();
      setIsSpeaking(true);

      const isRed = simMode === 'red_team';
      const intro = isRed ? "Nemesis Omega Analysis Complete." : "Aegis Prime Analysis Complete.";
      const title = typeof result.title === 'string' ? result.title : "Simulation Report";
      const outcome = typeof result.outcome_vector === 'string' ? `Projected Outcome: ${result.outcome_vector}.` : "";
      
      let summary = typeof result.summary === 'string' ? result.summary : "Analysis data available on screen.";
      if (summary.length > 500) summary = summary.substring(0, 500) + "...";

      const topRisk = result.risks?.[0]?.label && typeof result.risks[0].label === 'string' ? `Primary Factor: ${result.risks[0].label}.` : "";
      
      const script = `${intro} ${title}. ${outcome} ${summary} ${topRisk}`;
      const voice = isRed ? 'Fenrir' : 'Kore'; 

      try {
          const buffer = await generateSpeech(script, voice);
          if (buffer) {
               if (!audioContextRef.current) {
                    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
                }
                const ctx = audioContextRef.current;
                if (ctx.state === 'suspended') await ctx.resume();
                
                const source = ctx.createBufferSource();
                source.buffer = buffer;
                source.connect(ctx.destination);
                source.onended = () => setIsSpeaking(false);
                source.start();
                audioSourceRef.current = source;
          } else {
              setIsSpeaking(false);
          }
      } catch (e) {
          console.error("TTS Failed", e);
          setIsSpeaking(false);
      }
  }

  // Initialize Map Units with detailed telemetry
  useEffect(() => {
      const units: Unit[] = [
          { id: 'u1', name: 'Alpha Co.', type: 'friendly', category: 'infantry', x: 30, y: 40, status: 'engaged', health: 85, ammo: 40, speed: 5, heading: 45 },
          { id: 'u2', name: 'Bravo Bat.', type: 'friendly', category: 'armor', x: 45, y: 55, status: 'moving', health: 92, ammo: 78, speed: 45, heading: 120 },
          { id: 'u3', name: 'Eagle 1', type: 'friendly', category: 'air', x: 60, y: 20, status: 'active', health: 100, ammo: 100, speed: 450, heading: 90, altitude: 15400 },
          { id: 'h1', name: 'Insurgent Grp A', type: 'hostile', category: 'infantry', x: 35, y: 35, status: 'engaged', health: 40, ammo: 20, speed: 0, heading: 225 },
          { id: 'h2', name: 'Unknown Vehicle', type: 'hostile', category: 'armor', x: 70, y: 60, status: 'moving', health: 100, ammo: 0, speed: 60, heading: 270 },
      ];
      setMapUnits(units);
  }, []);

  // Map Simulation Loop for Live View
  useEffect(() => {
      if (activeTab !== 'live') return;

      const interval = setInterval(() => {
          setMapUnits(prev => prev.map(u => {
              if (u.status === 'moving' || u.category === 'air') {
                  const dx = (Math.random() - 0.5) * 0.5;
                  const dy = (Math.random() - 0.5) * 0.5;
                  
                  // Basic telemetry simulation
                  let newHeading = u.heading;
                  if (u.heading !== undefined) {
                      newHeading = (u.heading + (Math.random() - 0.5) * 5 + 360) % 360;
                  }
                  
                  let newSpeed = u.speed;
                  if (u.speed !== undefined) {
                      newSpeed = Math.max(0, u.speed + (Math.random() - 0.5) * 5);
                  }

                  let newAlt = u.altitude;
                  if (u.category === 'air' && u.altitude !== undefined) {
                      newAlt = u.altitude + (Math.random() - 0.5) * 50;
                  }

                  return { 
                      ...u, 
                      x: Math.max(5, Math.min(95, u.x + dx)), 
                      y: Math.max(5, Math.min(95, u.y + dy)),
                      heading: newHeading,
                      speed: newSpeed,
                      altitude: newAlt
                  };
              }
              return u;
          }));
      }, 1000);
      return () => clearInterval(interval);
  }, [activeTab]);

  const cleanJsonString = (str: string) => {
      let cleaned = str.trim();
      if (cleaned.startsWith('```json')) {
          cleaned = cleaned.replace(/^```json/, '').replace(/```$/, '');
      } else if (cleaned.startsWith('```')) {
          cleaned = cleaned.replace(/^```/, '').replace(/```$/, '');
      }
      return cleaned.trim();
  };

  const gatherSystemContext = () => {
      // Simulate gathering real-time data from other modules (Logistics, HR, etc.)
      return {
          logistics: {
              fuel_north: "45% (Critical)",
              ammo_small_arms: "92% (Healthy)",
              spare_parts_t72: "Delayed (2 weeks)",
              route_bravo: "Congested"
          },
          personnel: {
              readiness_4th_mech: "92%",
              readiness_12th_inf: "85%",
              stress_level_3rd_div: "High (Sleep Debt)",
              morale_agazi: "Excellent"
          },
          intelligence: {
              threat_level: "Elevated",
              recent_signals: "Spike in Sector 4",
              cyber_status: "Active Defense (Level 5)"
          },
          assets: {
              air_support: "Available (Su-27, MiG-23)",
              drone_fleet: "Active (Sector 1, 4)",
              navy_patrols: "Red Sea Sector 7 Active"
          }
      };
  };

  const handleSimulation = async () => {
    const activeScenario = simMode === 'standard' ? blueScenario : redScenario;
    if (!activeScenario.trim()) return;
    
    setSimulating(true);
    stopAudio(); 
    setExpandedDetails({}); // Reset expanded details
    
    if (simMode === 'standard') setBlueResult(null);
    else setRedResult(null);

    const insiderData = gatherSystemContext();

    try {
        const rawResult = await runStrategySimulation(
            activeScenario, 
            simMode, 
            language,
            {
                ...simParams,
                systemContext: insiderData
            }
        );
        
        let parsedResult: SimResult;
        try {
            const cleaned = cleanJsonString(rawResult);
            parsedResult = JSON.parse(cleaned);
        } catch (e) {
            console.error("Failed to parse JSON, falling back to text wrapper", e);
            parsedResult = { 
                summary: rawResult, 
                title: "Simulation Output (Raw Text)", 
                rationale: "Data parsing failed. Raw output displayed." 
            };
        }

        if (simMode === 'standard') setBlueResult(parsedResult);
        else setRedResult(parsedResult);

        playBriefing(parsedResult);

    } catch (e) {
        console.error(e);
    }
    
    setSimulating(false);
  };

  const handleExpandItem = async (label: string, type: 'risk' | 'recommendation') => {
      if (expandedDetails[label]) {
          // Toggle off if already expanded
          const newDetails = {...expandedDetails};
          delete newDetails[label];
          setExpandedDetails(newDetails);
          return;
      }

      setExpandingId(label);
      const activeScenario = simMode === 'standard' ? blueScenario : redScenario;
      
      const detail = await expandSimulationDetail(activeScenario, label, type, simMode);
      setExpandedDetails(prev => ({...prev, [label]: detail}));
      setExpandingId(null);
  };

  const [missions, setMissions] = useState<any[]>([
      { id: 'OP-ALPHA', name: 'Operation Desert Wind', status: 'Active', priority: 'High', commander: 'Col. Tadesse', progress: 65, start: '06:00', end: '18:00', phase: 'Execution' },
      { id: 'OP-BETA', name: 'Border Security Phase II', status: 'Planning', priority: 'Medium', commander: 'Gen. Abate', progress: 15, start: 'Mar 15', end: 'Mar 20', phase: 'Logistics Prep' },
      { id: 'OP-GAMMA', name: 'Relief Convoy Escort', status: 'Active', priority: 'Critical', commander: 'Maj. Girma', progress: 88, start: '08:30', end: '14:00', phase: 'Extraction' },
      { id: 'OP-DELTA', name: 'Night Watch Surveillance', status: 'Completed', priority: 'Low', commander: 'Lt. Col. Bekele', progress: 100, start: 'Yesterday', end: 'Today', phase: 'Debrief' },
  ]);
  
  const [newMissionName, setNewMissionName] = useState('');
  const [newMissionCommander, setNewMissionCommander] = useState('');
  const [newMissionPriority, setNewMissionPriority] = useState('Medium');

  const handleCreateMission = (e: React.FormEvent) => {
      e.preventDefault();
      const newMission = {
          id: `OP-${Math.floor(Math.random() * 10000)}`.toUpperCase(),
          name: newMissionName,
          status: 'Planning',
          priority: newMissionPriority,
          commander: newMissionCommander,
          progress: 0,
          start: 'TBD',
          end: 'TBD',
          phase: 'Init'
      };
      setMissions([newMission, ...missions]);
      setShowMissionModal(false);
      setNewMissionName('');
      setNewMissionCommander('');
  };

  const getSeverityColor = (severity?: string) => {
      const s = typeof severity === 'string' ? severity.toLowerCase() : '';
      if (s.includes('critical') || s.includes('high')) return 'border-red-500 bg-red-950/20 text-red-200';
      if (s.includes('moderate') || s.includes('medium')) return 'border-yellow-500 bg-yellow-950/20 text-yellow-200';
      return 'border-blue-500 bg-blue-950/20 text-blue-200';
  };

  const currentResult = simMode === 'standard' ? blueResult : redResult;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 flex flex-col h-[calc(100vh-140px)]">
      {/* Header & Navigation */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2 flex-shrink-0">
         <div>
          <h2 className="text-2xl font-bold text-white tracking-tight font-display">{t('op_title')}</h2>
          <p className="text-gray-400 text-sm font-sans">{t('op_subtitle')}</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 mt-4 md:mt-0">
            {/* Sub-Module Tabs */}
            <div className="bg-military-800 p-1 rounded-lg border border-military-700 flex flex-wrap gap-1">
                <button 
                    onClick={() => setActiveTab('live')}
                    className={`px-4 py-1.5 text-xs font-bold rounded flex items-center transition-all font-display ${activeTab === 'live' ? 'bg-military-accent text-white shadow' : 'text-gray-400 hover:text-white'}`}
                >
                    <Map size={14} className="mr-2"/> {t('op_tab_live')}
                </button>
                <button 
                    onClick={() => setActiveTab('structure')}
                    className={`px-4 py-1.5 text-xs font-bold rounded flex items-center transition-all font-display ${activeTab === 'structure' ? 'bg-military-accent text-white shadow' : 'text-gray-400 hover:text-white'}`}
                >
                    <Network size={14} className="mr-2"/> STRUCT
                </button>
                <button 
                    onClick={() => setActiveTab('missions')}
                    className={`px-4 py-1.5 text-xs font-bold rounded flex items-center transition-all font-display ${activeTab === 'missions' ? 'bg-military-accent text-white shadow' : 'text-gray-400 hover:text-white'}`}
                >
                    <List size={14} className="mr-2"/> {t('op_tab_mission')}
                </button>
                <button 
                    onClick={() => setActiveTab('readiness')}
                    className={`px-4 py-1.5 text-xs font-bold rounded flex items-center transition-all font-display ${activeTab === 'readiness' ? 'bg-military-accent text-white shadow' : 'text-gray-400 hover:text-white'}`}
                >
                    <Shield size={14} className="mr-2"/> READY
                </button>
            </div>

            <button 
                onClick={() => setShowSimModal(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2 rounded flex items-center shadow-lg transition-all font-display tracking-wider animate-pulse"
            >
                <BrainCircuit size={16} className="mr-2" /> AI SIM
            </button>

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

      {/* Main Content */}
      <div className="flex-1 min-h-0 overflow-y-auto relative">
          {activeTab === 'live' && (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
                  {/* Left: ACSAS Controls */}
                  <div className="bg-military-800 rounded-lg p-4 border border-military-700 space-y-4 h-auto lg:col-span-1">
                      <h3 className="font-bold text-white text-sm flex items-center mb-4">
                          <Layers size={16} className="mr-2 text-military-accent" /> {t('acsas_title')}
                      </h3>
                      
                      <div className="space-y-3">
                          <label className="flex items-center justify-between cursor-pointer p-2 bg-military-900 rounded border border-military-600 hover:border-military-500">
                              <span className="text-xs text-gray-300">{t('acsas_bft')}</span>
                              <div className={`w-8 h-4 rounded-full relative transition-colors ${acsasBFT ? 'bg-green-500' : 'bg-gray-600'}`} onClick={() => setAcsasBFT(!acsasBFT)}>
                                  <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${acsasBFT ? 'left-4.5' : 'left-0.5'}`}></div>
                              </div>
                          </label>
                          <label className="flex items-center justify-between cursor-pointer p-2 bg-military-900 rounded border border-military-600 hover:border-military-500">
                              <span className="text-xs text-gray-300">{t('acsas_enemy')}</span>
                              <div className={`w-8 h-4 rounded-full relative transition-colors ${acsasPredict ? 'bg-red-500' : 'bg-gray-600'}`} onClick={() => setAcsasPredict(!acsasPredict)}>
                                  <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${acsasPredict ? 'left-4.5' : 'left-0.5'}`}></div>
                              </div>
                          </label>
                          <label className="flex items-center justify-between cursor-pointer p-2 bg-military-900 rounded border border-military-600 hover:border-military-500">
                              <span className="text-xs text-gray-300">{t('acsas_uav')}</span>
                              <div className={`w-8 h-4 rounded-full relative transition-colors ${acsasUAV ? 'bg-blue-500' : 'bg-gray-600'}`} onClick={() => setAcsasUAV(!acsasUAV)}>
                                  <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${acsasUAV ? 'left-4.5' : 'left-0.5'}`}></div>
                              </div>
                          </label>
                      </div>

                      <div className="mt-6 pt-4 border-t border-military-700">
                          <h4 className="text-xs font-bold text-gray-400 mb-2 uppercase">{t('op_active_units')}</h4>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                              {mapUnits.filter(u => u.type === 'friendly').map(u => (
                                  <div key={u.id} className="flex justify-between items-center text-xs p-1 hover:bg-military-700 rounded">
                                      <span className="text-blue-400">{u.name}</span>
                                      <span className="text-green-500 font-mono">{u.speed ? u.speed.toFixed(0) + ' km/h' : 'Static'}</span>
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>

                  {/* Right: Tactical Map with Telemetry */}
                  <div className="lg:col-span-3 bg-black rounded-lg border border-military-700 overflow-hidden relative min-h-[400px]">
                      <TacticalMap holoMode={holoMode} customUnits={mapUnits} />
                      <div className="absolute bottom-4 right-4 flex gap-2">
                          <button 
                              onClick={() => setHoloMode(!holoMode)}
                              className={`p-2 rounded text-xs font-bold border ${holoMode ? 'bg-cyan-900/50 text-cyan-400 border-cyan-500' : 'bg-military-900 text-gray-300 border-gray-600'}`}
                          >
                              {holoMode ? '2D VIEW' : '3D HOLO'}
                          </button>
                      </div>
                  </div>
              </div>
          )}

          {activeTab === 'missions' && (
              <div className="h-full bg-military-800 rounded-lg p-6 border border-military-700 flex flex-col">
                  {/* ... mission content ... */}
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="font-semibold text-lg text-white font-display">Active Mission Manifest</h3>
                      <button 
                          onClick={() => setShowMissionModal(true)}
                          className="bg-military-accent hover:bg-sky-500 text-white text-xs font-bold px-4 py-2 rounded flex items-center shadow-lg transition-all"
                      >
                          <Plus size={16} className="mr-2" /> {t('op_mission_create')}
                      </button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {missions.map(mission => (
                              <div key={mission.id} className="bg-military-900 p-4 rounded border border-military-600 hover:border-military-accent transition-all group relative overflow-hidden">
                                  {mission.priority === 'Critical' && <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-red-500/20 to-transparent pointer-events-none"></div>}
                                  
                                  <div className="flex justify-between items-start mb-2">
                                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                                          mission.status === 'Active' ? 'bg-green-900/30 text-green-400 border border-green-900' : 
                                          mission.status === 'Planning' ? 'bg-blue-900/30 text-blue-400 border border-blue-900' : 
                                          'bg-gray-800 text-gray-400'
                                      }`}>{mission.status}</span>
                                      <span className={`text-[10px] font-mono ${mission.priority === 'Critical' ? 'text-red-500 font-bold animate-pulse' : 'text-gray-500'}`}>{mission.priority}</span>
                                  </div>
                                  
                                  <h4 className="text-sm font-bold text-white mb-1 group-hover:text-military-accent transition-colors">{mission.name}</h4>
                                  <p className="text-xs text-gray-400 mb-3">{mission.id} • {mission.commander}</p>
                                  
                                  <div className="space-y-2">
                                      <div className="flex justify-between text-[10px] text-gray-500">
                                          <span>Progress</span>
                                          <span>{mission.progress}%</span>
                                      </div>
                                      <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                                          <div 
                                              className={`h-full rounded-full ${mission.status === 'Completed' ? 'bg-gray-500' : 'bg-military-accent'}`} 
                                              style={{ width: `${mission.progress}%` }}
                                          ></div>
                                      </div>
                                      <div className="flex justify-between text-[10px] text-gray-500 mt-2 pt-2 border-t border-military-800">
                                          <span>Phase: {mission.phase}</span>
                                          <span>ETA: {mission.end}</span>
                                      </div>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          )}

          {activeTab === 'readiness' && (
              <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto lg:overflow-hidden">
                  {/* Readiness Chart */}
                  <div className="bg-military-800 rounded-lg p-6 border border-military-700 h-[350px] lg:h-auto">
                      <h3 className="font-semibold text-lg text-white mb-4">Unit Readiness Levels</h3>
                      <div className="h-[250px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={[
                                  { name: '4th Mech', value: 92 },
                                  { name: '12th Inf', value: 85 },
                                  { name: 'Air Wing', value: 95 },
                                  { name: 'Spec Ops', value: 98 },
                                  { name: 'Logistics', value: 88 },
                              ]} layout="vertical">
                                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" />
                                  <XAxis type="number" stroke="#94a3b8" domain={[0, 100]} />
                                  <YAxis dataKey="name" type="category" width={80} stroke="#94a3b8" fontSize={11} />
                                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                                  <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                              </BarChart>
                          </ResponsiveContainer>
                      </div>
                  </div>
                  
                  {/* Supply Status */}
                  <div className="bg-military-800 rounded-lg p-6 border border-military-700 h-[300px] lg:h-auto">
                      <h3 className="font-semibold text-lg text-white mb-4">Critical Supply Status</h3>
                      <div className="space-y-4">
                          <div>
                              <div className="flex justify-between text-xs mb-1">
                                  <span className="text-gray-300">Fuel Reserves (North)</span>
                                  <span className="text-yellow-500 font-bold">45%</span>
                              </div>
                              <div className="w-full bg-military-900 h-2 rounded-full"><div className="bg-yellow-500 h-2 rounded-full" style={{width: '45%'}}></div></div>
                          </div>
                          <div>
                              <div className="flex justify-between text-xs mb-1">
                                  <span className="text-gray-300">Ammunition (Small Arms)</span>
                                  <span className="text-green-500 font-bold">92%</span>
                              </div>
                              <div className="w-full bg-military-900 h-2 rounded-full"><div className="bg-green-500 h-2 rounded-full" style={{width: '92%'}}></div></div>
                          </div>
                          <div>
                              <div className="flex justify-between text-xs mb-1">
                                  <span className="text-gray-300">Medical Kits</span>
                                  <span className="text-green-500 font-bold">88%</span>
                              </div>
                              <div className="w-full bg-military-900 h-2 rounded-full"><div className="bg-green-500 h-2 rounded-full" style={{width: '88%'}}></div></div>
                          </div>
                      </div>
                  </div>
              </div>
          )}
          
          {activeTab === 'structure' && (
              <div className="h-full bg-military-800 rounded-lg p-6 border border-military-700 overflow-y-auto">
                  {/* ... structure content ... */}
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-white flex items-center font-display">
                          <Network size={24} className="mr-3 text-military-accent"/> 
                          Joint Operations Command Structure
                      </h3>
                      <div className="flex space-x-2">
                          <span className="text-xs bg-green-900/50 text-green-300 px-3 py-1 rounded border border-green-500/30">7 Principles Compliant</span>
                      </div>
                  </div>
                  
                  <div className="max-w-4xl mx-auto space-y-4">
                      <OrgNode label="Joint Operations HQ" role="Lt. Gen. [Redacted]" level="Strategic" expanded={true} status="Active">
                          {/* ... hierarchy ... */}
                          <OrgNode label="Ground Forces Command" role="Field Marshal Birhanu Jula" level="Component" expanded={true} status="Active">
                              <OrgNode label="Northern Command" role="Maj. Gen. [Redacted]" level="Regional" status="Active">
                                  <OrgNode label="4th Mechanized Division" role="Brig. Gen. [Redacted]" level="Tactical" status="Engaged" />
                              </OrgNode>
                              {/* ... */}
                          </OrgNode>
                          
                          {/* ... other commands ... */}
                          <OrgNode label="Air Force Command" role="Lt. Gen. Yilma Merdasa" level="Component" status="Active">
                              <OrgNode label="Harar Meda Air Base (HQ)" role="Brig. Gen. [Redacted]" level="Base" status="Active" />
                              <OrgNode label="Dire Dawa Air Base" role="Col. [Redacted]" level="Base" status="Active" />
                          </OrgNode>
                          
                          {/* ... */}
                      </OrgNode>
                  </div>
              </div>
          )}
      </div>

      {/* Simulation Modal (Deep Integration) */}
      {showSimModal && (
        <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4">
            <div className="bg-military-800 w-full max-w-[95vw] lg:max-w-[1600px] h-[95vh] md:h-[90vh] rounded-xl border border-military-600 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-4 border-b border-military-700 flex justify-between items-center bg-military-900">
                    <div className="flex items-center space-x-3">
                        <BrainCircuit className="text-purple-500" size={24} />
                        <div>
                            <h3 className="text-lg font-bold text-white font-display tracking-wider">STRATEGIC AI SIMULATOR (GEMINI 3 PRO)</h3>
                            <p className="text-[10px] text-gray-400 font-mono hidden md:block">HYPER-REALISTIC ADVERSARY MODELING • HEXAD ANALYSIS</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="flex bg-black/30 rounded p-1">
                            <button 
                                onClick={() => setSimMode('standard')}
                                className={`px-3 py-1 md:px-4 md:py-1.5 rounded text-[10px] md:text-xs font-bold transition-all ${simMode === 'standard' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                            >
                                BLUE TEAM (AEGIS)
                            </button>
                            <button 
                                onClick={() => setSimMode('red_team')}
                                className={`px-3 py-1 md:px-4 md:py-1.5 rounded text-[10px] md:text-xs font-bold transition-all ${simMode === 'red_team' ? 'bg-red-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                            >
                                RED TEAM (NEMESIS)
                            </button>
                        </div>
                        <button onClick={() => { setShowSimModal(false); stopAudio(); }} className="text-gray-400 hover:text-white"><X size={24}/></button>
                    </div>
                </div>

                <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                    {/* Left: Input Panel */}
                    <div className="w-full lg:w-1/3 xl:w-1/4 bg-military-900/50 p-6 border-r border-military-700 flex flex-col overflow-y-auto">
                        <div className="mb-6">
                            <label className="text-xs font-bold text-gray-400 uppercase block mb-2 font-display">
                                {simMode === 'standard' ? 'Operational Scenario' : 'Adversarial Objective'}
                            </label>
                            <textarea 
                                className={`w-full h-32 bg-black/40 border rounded p-3 text-sm focus:outline-none transition-colors ${simMode === 'standard' ? 'border-blue-500/50 focus:border-blue-500 text-blue-100' : 'border-red-500/50 focus:border-red-500 text-red-100'}`}
                                placeholder={simMode === 'standard' 
                                    ? "Describe the defensive scenario (e.g., 'Defend GERD from hybrid attack while securing food supply lines')..." 
                                    : "Describe the attack vector (e.g., 'Trigger social collapse using biological scarcity and disinformation')..."}
                                value={simMode === 'standard' ? blueScenario : redScenario}
                                onChange={(e) => simMode === 'standard' ? setBlueScenario(e.target.value) : setRedScenario(e.target.value)}
                            />
                        </div>

                        <div className="space-y-4 mb-6">
                            {/* ... select inputs ... */}
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Time Horizon</label>
                                <select 
                                    value={simParams.timeHorizon}
                                    onChange={(e) => setSimParams({...simParams, timeHorizon: e.target.value})}
                                    className="w-full bg-military-800 border border-military-600 rounded p-2 text-white text-xs"
                                >
                                    <option>24 Hours (Tactical)</option>
                                    <option>30 Days (Operational)</option>
                                    <option>180 Days (Strategic)</option>
                                    <option>1 Year (Long-term)</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Adversary Profile</label>
                                <select 
                                    value={simParams.adversaryProfile}
                                    onChange={(e) => setSimParams({...simParams, adversaryProfile: e.target.value})}
                                    className="w-full bg-military-800 border border-military-600 rounded p-2 text-white text-xs"
                                >
                                    <option>Paranoid / Conventional</option>
                                    <option>State Actor (Conventional)</option>
                                    <option>Insurgent / Guerilla</option>
                                    <option>Hybrid Warfare / Multi-Domain</option>
                                    <option>Cyber-Only</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-auto">
                            <button 
                                onClick={handleSimulation}
                                disabled={simulating || !(simMode === 'standard' ? blueScenario : redScenario)}
                                className={`w-full py-4 rounded font-bold text-white shadow-lg transition-all flex items-center justify-center relative overflow-hidden group ${
                                    simMode === 'standard' ? 'bg-blue-600 hover:bg-blue-500' : 'bg-red-600 hover:bg-red-500'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {simulating ? (
                                    <span className="flex items-center animate-pulse">
                                        <RefreshCw className="animate-spin mr-2" /> PROCESSING HEXAD VECTORS...
                                    </span>
                                ) : (
                                    <span className="flex items-center tracking-widest font-display">
                                        <Play className="mr-2 fill-current" /> RUN DEEP SIMULATION
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Right: Output Panel */}
                    <div className="flex-1 bg-black/20 p-8 overflow-y-auto relative">
                        {/* Background Grid */}
                        <div className="absolute inset-0 pointer-events-none opacity-10" style={{ backgroundImage: `linear-gradient(${simMode === 'standard' ? '#3b82f6' : '#ef4444'} 1px, transparent 1px), linear-gradient(90deg, ${simMode === 'standard' ? '#3b82f6' : '#ef4444'} 1px, transparent 1px)`, backgroundSize: '40px 40px' }}></div>

                        {!currentResult && !simulating && (
                            <div className="h-full flex flex-col items-center justify-center text-gray-600">
                                <Activity size={64} className="mb-4 opacity-20" />
                                <p className="text-sm font-mono uppercase tracking-widest">Awaiting Simulation Parameters</p>
                            </div>
                        )}

                        {currentResult && !simulating && (
                            <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 space-y-8 max-w-7xl mx-auto pb-8">
                                {/* Header */}
                                <div className={`border-l-4 ${simMode === 'standard' ? 'border-blue-500' : 'border-red-500'} pl-6 py-4 bg-military-900/30 rounded-r-lg`}>
                                    <div className="flex flex-col md:flex-row justify-between items-start">
                                        <h2 className="text-2xl md:text-3xl font-bold text-white font-display uppercase tracking-wide">
                                            <SafeRender content={currentResult.title || "SIMULATION REPORT"} />
                                        </h2>
                                        {isSpeaking ? (
                                            <button onClick={stopAudio} className="text-red-400 hover:text-white flex items-center text-xs animate-pulse mt-2 md:mt-0"><StopCircle size={16} className="mr-1"/> STOP AUDIO</button>
                                        ) : (
                                            <button onClick={() => playBriefing(currentResult)} className="text-green-400 hover:text-white flex items-center text-xs mt-2 md:mt-0"><Volume2 size={16} className="mr-1"/> PLAY BRIEFING</button>
                                        )}
                                    </div>
                                    <p className="text-gray-300 mt-2 text-sm md:text-lg leading-relaxed font-serif max-w-4xl border-l border-white/10 pl-4">
                                        <SafeRender content={currentResult.summary} />
                                    </p>
                                    
                                    {currentResult.outcome_vector && (
                                        <div className={`mt-4 inline-block px-3 py-1 rounded text-xs font-bold uppercase tracking-wider ${simMode === 'standard' ? 'bg-blue-900/50 text-blue-300' : 'bg-red-900/50 text-red-300'}`}>
                                            Outcome Vector: <SafeRender content={currentResult.outcome_vector} />
                                        </div>
                                    )}
                                </div>

                                {currentResult.insider_insight && (
                                    <div className="bg-purple-900/20 border border-purple-500/30 p-4 rounded-lg relative overflow-hidden animate-in slide-in-from-left-4">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
                                        <h3 className="text-sm font-bold text-purple-400 uppercase tracking-widest mb-2 flex items-center">
                                            <BrainCircuit className="mr-2" size={16}/> INSIDER DATA EXPLOITATION
                                        </h3>
                                        <p className="text-sm text-gray-300 italic">"<SafeRender content={currentResult.insider_insight} />"</p>
                                    </div>
                                )}

                                {/* Hexad Analysis Grid */}
                                {currentResult.hexad_analysis && (
                                    <div>
                                        <h3 className={`text-sm font-bold uppercase tracking-widest mb-4 flex items-center ${simMode === 'standard' ? 'text-blue-400' : 'text-red-400'}`}>
                                            <Hexagon className="mr-2" size={16}/> {simMode === 'standard' ? 'Hexad Defense Matrix' : 'Hexad Vulnerability Exploitation'}
                                        </h3>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {Object.entries(currentResult.hexad_analysis).map(([key, val]) => (
                                                <div key={key} className={`p-4 rounded border ${simMode === 'standard' ? 'bg-blue-900/10 border-blue-500/30' : 'bg-red-900/10 border-red-500/30'} hover:scale-[1.02] transition-transform`}>
                                                    <h4 className="text-xs font-bold uppercase mb-2 opacity-70">{key}</h4>
                                                    <p className="text-xs text-white leading-snug"><SafeRender content={val} /></p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Risks / Opportunities (Clickable) */}
                                {currentResult.risks && (
                                    <div className="mt-8">
                                        <h3 className={`text-sm font-bold uppercase tracking-widest mb-4 flex items-center ${simMode === 'standard' ? 'text-blue-400' : 'text-red-400'}`}>
                                            {simMode === 'standard' ? <Shield className="mr-2" /> : <Skull className="mr-2" />}
                                            {simMode === 'standard' ? 'Threat Assessment & Mitigation' : 'Attack Vectors & Exploitation'}
                                        </h3>
                                        <div className="grid grid-cols-1 gap-4">
                                            {currentResult.risks.map((risk, idx) => (
                                                <div key={idx} className={`bg-military-900/40 border rounded-lg overflow-hidden transition-all duration-300 ${getSeverityColor(risk.severity)}`}>
                                                    <div 
                                                        className="p-4 cursor-pointer flex justify-between items-center"
                                                        onClick={() => handleExpandItem(typeof risk.label === 'string' ? risk.label : `Risk ${idx}`, 'risk')}
                                                    >
                                                        <div className="flex items-center">
                                                            <div className={`w-2 h-8 rounded mr-4 ${risk.severity === 'Critical' ? 'bg-red-500' : risk.severity === 'High' ? 'bg-orange-500' : 'bg-yellow-500'}`}></div>
                                                            <div>
                                                                <h4 className="font-bold text-white text-base md:text-lg"><SafeRender content={risk.label} /></h4>
                                                                <p className="text-xs opacity-70 line-clamp-1"><SafeRender content={risk.impact_description} /></p>
                                                            </div>
                                                        </div>
                                                        {expandingId === (typeof risk.label === 'string' ? risk.label : `Risk ${idx}`) ? <RefreshCw className="animate-spin" size={20}/> : <Maximize2 size={20} className="opacity-50 hover:opacity-100" />}
                                                    </div>
                                                    
                                                    {expandedDetails[typeof risk.label === 'string' ? risk.label : `Risk ${idx}`] && (
                                                        <div className="p-4 bg-black/40 border-t border-white/10 animate-in slide-in-from-top-2">
                                                            <div className="prose prose-invert prose-sm max-w-none text-gray-300 text-xs">
                                                                <div className="whitespace-pre-wrap"><SafeRender content={expandedDetails[typeof risk.label === 'string' ? risk.label : `Risk ${idx}`]} /></div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Recommendations (Clickable) */}
                                {currentResult.recommendations && (
                                    <div className="pb-8 mt-8">
                                        <h3 className="text-sm font-bold text-green-400 uppercase tracking-widest mb-4 flex items-center">
                                            <CheckCircle className="mr-2" /> Recommended Course of Action
                                        </h3>
                                        <div className="grid grid-cols-1 gap-4">
                                            {currentResult.recommendations.map((rec, idx) => (
                                                <div key={idx} className="bg-green-900/10 border border-green-500/30 rounded-lg overflow-hidden transition-colors">
                                                    <div 
                                                        className="p-4 cursor-pointer flex justify-between items-center"
                                                        onClick={() => handleExpandItem(typeof rec.action === 'string' ? rec.action : `Rec ${idx}`, 'recommendation')}
                                                    >
                                                        <div className="flex items-center">
                                                            <div className="w-2 h-8 bg-green-500 rounded mr-4"></div>
                                                            <div>
                                                                <h4 className="font-bold text-white text-lg"><SafeRender content={rec.action} /></h4>
                                                                <span className="text-xs text-green-300 bg-green-900/30 px-2 py-0.5 rounded border border-green-500/20"><SafeRender content={rec.priority} /> Priority</span>
                                                            </div>
                                                        </div>
                                                        {expandingId === (typeof rec.action === 'string' ? rec.action : `Rec ${idx}`) ? <RefreshCw className="animate-spin" size={20}/> : <Maximize2 size={20} className="opacity-50 hover:opacity-100" />}
                                                    </div>
                                                    
                                                    {expandedDetails[typeof rec.action === 'string' ? rec.action : `Rec ${idx}`] && (
                                                        <div className="p-4 bg-black/40 border-t border-green-500/30 animate-in slide-in-from-top-2">
                                                            <div className="prose prose-invert prose-sm max-w-none text-gray-300 text-xs">
                                                                <div className="whitespace-pre-wrap"><SafeRender content={expandedDetails[typeof rec.action === 'string' ? rec.action : `Rec ${idx}`]} /></div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                <div className="text-center pt-8 border-t border-gray-800">
                                    <p className="text-xs text-gray-500 font-mono">SIMULATION ID: {Math.floor(Math.random() * 1000000)} • GEMINI 3 PRO PREVIEW ENGINE</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Mission Creation Modal */}
      {showMissionModal && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
              <div className="bg-military-800 border border-military-600 rounded-lg w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                  <div className="p-4 border-b border-military-700 flex justify-between items-center">
                      <h3 className="font-bold text-white flex items-center font-display">
                          <List className="mr-2 text-military-accent" /> {t('op_mission_create')}
                      </h3>
                      <button onClick={() => setShowMissionModal(false)} className="text-gray-400 hover:text-white"><X size={20}/></button>
                  </div>
                  <form onSubmit={handleCreateMission} className="p-6 space-y-4">
                      <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('op_lbl_codename')}</label>
                          <input 
                              type="text" 
                              required
                              value={newMissionName}
                              onChange={(e) => setNewMissionName(e.target.value)}
                              className="w-full bg-military-900 border border-military-600 rounded p-2 text-white focus:outline-none focus:border-military-accent"
                              placeholder="e.g. Operation Iron Shield"
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Commander</label>
                          <input 
                              type="text" 
                              required
                              value={newMissionCommander}
                              onChange={(e) => setNewMissionCommander(e.target.value)}
                              className="w-full bg-military-900 border border-military-600 rounded p-2 text-white focus:outline-none focus:border-military-accent"
                              placeholder="Rank & Name"
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Priority</label>
                          <select 
                              value={newMissionPriority}
                              onChange={(e) => setNewMissionPriority(e.target.value as any)}
                              className="w-full bg-military-900 border border-military-600 rounded p-2 text-white focus:outline-none focus:border-military-accent"
                          >
                              <option>Low</option>
                              <option>Medium</option>
                              <option>High</option>
                              <option>Critical</option>
                          </select>
                      </div>
                      <div className="pt-4 flex justify-end">
                          <button 
                            type="submit" 
                            className="bg-military-accent hover:bg-sky-500 text-white font-bold py-2 px-6 rounded flex items-center transition-colors font-display tracking-wide"
                          >
                              {t('op_btn_authorize')}
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default OperationalView;
