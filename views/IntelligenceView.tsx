
import React, { useState, useRef, useEffect } from 'react';
import { Eye, Radio, ShieldAlert, Wifi, Globe, Terminal, Activity, Share2, Crosshair, Video, Search, ExternalLink, Zap, User, DollarSign, Home, Box, CheckCircle, X, BrainCircuit, Scale, Upload, MapPin, Bot, FileWarning, ScanFace, Lock, AlertTriangle, Network } from 'lucide-react';
import MetricCard from '../components/MetricCard';
import TacticalMap, { Unit } from '../components/TacticalMap';
import { searchIntelligence, runTerminalCommand } from '../services/ollamaService';
import { useLanguage } from '../contexts/LanguageContext';

interface OsintResult {
    text: string;
    sources: any[];
}

interface GraphNode {
    id: string;
    label: string;
    type: 'target' | 'finance' | 'location' | 'cache';
    x: number;
    y: number;
    connections: string[];
}

interface IntelligenceViewProps {
    onBack?: () => void;
}

// Helper to safely render AI text that might be returned as an object
const SafeRender = ({ content }: { content: any }) => {
    if (typeof content === 'string' || typeof content === 'number') return <>{content}</>;
    if (typeof content === 'object' && content !== null) {
        return <>{JSON.stringify(content)}</>;
    }
    return null;
};

const IntelligenceView: React.FC<IntelligenceViewProps> = ({ onBack }) => {
  const { t } = useLanguage();
  const activeTabRef = useRef<'dashboard' | 'cyber' | 'sigint' | 'surveillance' | 'osint' | 'link' | 'fusion'>('dashboard');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'cyber' | 'sigint' | 'surveillance' | 'osint' | 'link' | 'fusion'>('dashboard');
  
  // OSINT & Deepfake State
  const [osintQuery, setOsintQuery] = useState('');
  const [osintLoading, setOsintLoading] = useState(false);
  const [osintData, setOsintData] = useState<OsintResult | null>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | undefined>(undefined);
  const [deepfakeAnalysis, setDeepfakeAnalysis] = useState<any>(null);

  // Link Analysis State
  const [nodes, setNodes] = useState<GraphNode[]>([
      { id: 'n1', label: 'Cmdr. X', type: 'target', x: 400, y: 300, connections: ['n2', 'n3', 'n4'] },
      { id: 'n2', label: 'Bank Acc #992', type: 'finance', x: 250, y: 150, connections: ['n1', 'n5'] },
      { id: 'n3', label: 'Safehouse Alpha', type: 'location', x: 550, y: 150, connections: ['n1', 'n6'] },
      { id: 'n4', label: 'Arms Cache B', type: 'cache', x: 400, y: 450, connections: ['n1'] },
      { id: 'n5', label: 'Shell Corp', type: 'finance', x: 100, y: 100, connections: ['n2'] },
      { id: 'n6', label: 'Lt. Y', type: 'target', x: 700, y: 100, connections: ['n3'] }
  ]);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [draggingNode, setDraggingNode] = useState<string | null>(null);

  // Terminal Logic
  const [terminalHistory, setTerminalHistory] = useState<string[]>([
      "root@endf-cyber:~# initializing threat_scan --deep",
      "[SYSTEM] Connection established to secure node.",
      "[SYSTEM] Monitoring active channels...",
      "[INFO] 4.0.3 Cyber and Electronic Warfare Directorate Module Loaded.",
      "Type 'help' for available commands."
  ]);
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalProcessing, setTerminalProcessing] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // IFAN: Red Team & Threat Library
  const [redTeamLogs, setRedTeamLogs] = useState<string[]>([
      "[RED-AI] Probing Sector 4 Firewall...",
      "[DEF-AI] Attack Vector Identified: SQL Injection. Blocked.",
      "[RED-AI] Pivoting to Social Engineering simulation on HR portal...",
      "[DEF-AI] Anomaly Detected. Flagging for review.",
  ]);

  const threatLibrary = [
      { name: 'APT-29', type: 'State Actor', risk: 'Critical', status: 'Active' },
      { name: 'DarkSide', type: 'Ransomware', risk: 'High', status: 'Monitoring' },
      { name: 'Lazarus', type: 'Finance', risk: 'High', status: 'Dormant' },
      { name: 'Sandworm', type: 'Grid Attack', risk: 'Critical', status: 'Active' },
  ];

  const suggestedVectors = [
      t('intel_vec_sudan'),
      t('intel_vec_redsea'),
      t('intel_vec_drought'),
      t('intel_vec_gerd')
  ];

  useEffect(() => {
      activeTabRef.current = activeTab;
      if (activeTab === 'cyber') {
        terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
      if (activeTab === 'osint') {
          if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                  (pos) => setUserLocation({lat: pos.coords.latitude, lng: pos.coords.longitude}),
                  (err) => console.log("Location access denied")
              );
          }
      }
  }, [terminalHistory, activeTab]);

  // Red Team Animation Loop
  useEffect(() => {
      if (activeTab === 'fusion') {
          const interval = setInterval(() => {
              const actions = [
                  "[RED-AI] Attempting brute-force on Gateway 7...",
                  "[DEF-AI] Rate limit enforced. IP Shunted.",
                  "[RED-AI] Testing encryption entropy...",
                  "[DEF-AI] Quantum-resistant key rotation initiated.",
                  "[RED-AI] Simulating insider threat scenario...",
                  "[DEF-AI] Behavioral anomaly detected in Log 404.",
              ];
              const newAction = actions[Math.floor(Math.random() * actions.length)];
              setRedTeamLogs(prev => [...prev.slice(1), newAction]);
          }, 2500);
          return () => clearInterval(interval);
      }
  }, [activeTab]);

  // Graph Interactions
  const handleMouseDown = (e: React.MouseEvent, nodeId: string) => {
      e.stopPropagation();
      setDraggingNode(nodeId);
      setSelectedNode(nodes.find(n => n.id === nodeId) || null);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
      if (draggingNode) {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          setNodes(prev => prev.map(n => n.id === draggingNode ? { ...n, x, y } : n));
      }
  };

  const handleMouseUp = () => {
      setDraggingNode(null);
  };

  const handleTerminalCommand = async (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
          const rawCommand = terminalInput.trim();
          if (!rawCommand) return;

          setTerminalHistory(prev => [...prev, `root@endf-cyber:~# ${rawCommand}`]);
          setTerminalInput('');
          setTerminalProcessing(true);

          if (rawCommand.toLowerCase() === 'clear') {
              setTerminalHistory(["Console cleared."]);
              setTerminalProcessing(false);
              return;
          }

          try {
              const response = await runTerminalCommand(rawCommand);
              setTerminalHistory(prev => [...prev, response]);
          } catch (e) {
              setTerminalHistory(prev => [...prev, "Error: Command failed execution."]);
          }
          setTerminalProcessing(false);
      }
  };

  const handleOsintSearch = async (query?: string) => {
      const q = query || osintQuery;
      if (!q.trim()) return;
      
      setOsintLoading(true);
      setOsintData(null);
      setDeepfakeAnalysis(null);
      const result = await searchIntelligence(q, userLocation);
      setOsintData(result);
      
      // Simulate Deepfake Analysis if keywords match media/video
      if (q.toLowerCase().includes('video') || q.toLowerCase().includes('speech') || q.toLowerCase().includes('fake')) {
          setTimeout(() => {
              setDeepfakeAnalysis({
                  score: Math.floor(Math.random() * 80) + 10,
                  verdict: Math.random() > 0.5 ? "Manipulated Media" : "Authentic Source",
                  details: "Frame-by-frame artifact analysis complete. Audio spectrum inconsistencies detected."
              });
              setOsintLoading(false);
          }, 2000);
      } else {
          setOsintLoading(false);
      }
  };

  // Simulated SIGINT Data
  const [sigintFeed, setSigintFeed] = useState([
      { id: 1, freq: '442.5 MHz', sourceKey: 'intel_sig_source_unk', contentKey: 'intel_sig_content_enc', type: 'raw' },
      { id: 2, freq: '121.8 MHz', sourceKey: 'Sector 9', contentKey: 'intel_sig_content_move', type: 'voice' },
  ]);

  useEffect(() => {
      const interval = window.setInterval(() => {
          if (activeTabRef.current === 'sigint') {
              const newSignal = {
                  id: Date.now(),
                  freq: `${(Math.random() * 500 + 100).toFixed(1)} MHz`,
                  sourceKey: Math.random() > 0.5 ? 'Intercept 4' : 'intel_sig_source_unk',
                  contentKey: Math.random() > 0.7 ? 'intel_sig_content_enc' : 'intel_sig_content_move',
                  type: Math.random() > 0.7 ? 'raw' : 'voice'
              };
              setSigintFeed(prev => [newSignal, ...prev].slice(0, 15));
          }
      }, 2000);
      return () => clearInterval(interval);
  }, []);

  // Surveillance Logic
  const [selectedDrone, setSelectedDrone] = useState('UAV-01');
  const [droneUnits, setDroneUnits] = useState<Unit[]>([
      { id: 't1', name: 'Convoy Alpha', type: 'hostile', category: 'armor', x: 45, y: 50, status: 'moving', health: 100, ammo: 50, speed: 45, heading: 270 },
      { id: 't2', name: 'Scout 1', type: 'hostile', category: 'recon', x: 55, y: 40, status: 'active', health: 100, ammo: 20, speed: 20, heading: 180 },
      { id: 'f1', name: 'Patrol 4', type: 'friendly', category: 'infantry', x: 30, y: 60, status: 'engaged', health: 90, ammo: 80, speed: 0, heading: 90 },
  ]);

  const getNodeIcon = (type: string) => {
      switch(type) {
          case 'target': return <User size={24} className="text-red-500 pointer-events-none" />;
          case 'finance': return <DollarSign size={24} className="text-green-500 pointer-events-none" />;
          case 'location': return <Home size={24} className="text-blue-500 pointer-events-none" />;
          case 'cache': return <Box size={24} className="text-yellow-500 pointer-events-none" />;
          default: return <Activity size={24} className="pointer-events-none" />;
      }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 flex flex-col h-[calc(100vh-140px)]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2 flex-shrink-0">
         <div>
          <h2 className="text-2xl font-bold text-white tracking-tight font-display">{t('intel_title')}</h2>
          <p className="text-gray-400 text-sm font-sans">{t('intel_subtitle')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-4 md:mt-0">
            <button 
                onClick={() => window.dispatchEvent(new CustomEvent('open-data-terminal'))}
                className="text-xs flex items-center bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded font-bold transition-all shadow-lg animate-pulse"
            >
                <Upload size={14} className="mr-2"/> SUBMIT REPORT
            </button>
            <div className="bg-military-800 p-1 rounded-lg border border-military-700 flex flex-wrap gap-1">
                 <button 
                    onClick={() => setActiveTab('dashboard')}
                    className={`px-4 py-1.5 text-xs font-bold rounded flex items-center transition-all ${activeTab === 'dashboard' ? 'bg-military-accent text-white shadow' : 'text-gray-400 hover:text-white'}`}
                >
                    <Eye size={14} className="mr-2"/> {t('intel_tab_dash')}
                </button>
                <button 
                    onClick={() => setActiveTab('fusion')}
                    className={`px-4 py-1.5 text-xs font-bold rounded flex items-center transition-all ${activeTab === 'fusion' ? 'bg-purple-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                >
                    <BrainCircuit size={14} className="mr-2"/> {t('ifan_tab_fusion')}
                </button>
                <button 
                    onClick={() => setActiveTab('link')}
                    className={`px-4 py-1.5 text-xs font-bold rounded flex items-center transition-all ${activeTab === 'link' ? 'bg-military-accent text-white shadow' : 'text-gray-400 hover:text-white'}`}
                >
                    <Share2 size={14} className="mr-2"/> {t('intel_tab_link')}
                </button>
                <button 
                    onClick={() => setActiveTab('osint')}
                    className={`px-4 py-1.5 text-xs font-bold rounded flex items-center transition-all ${activeTab === 'osint' ? 'bg-military-accent text-white shadow' : 'text-gray-400 hover:text-white'}`}
                >
                    <Globe size={14} className="mr-2"/> {t('intel_tab_osint')}
                </button>
                <button 
                    onClick={() => setActiveTab('surveillance')}
                    className={`px-4 py-1.5 text-xs font-bold rounded flex items-center transition-all ${activeTab === 'surveillance' ? 'bg-military-accent text-white shadow' : 'text-gray-400 hover:text-white'}`}
                >
                    <Video size={14} className="mr-2"/> {t('intel_tab_drone')}
                </button>
                <button 
                    onClick={() => setActiveTab('cyber')}
                    className={`px-4 py-1.5 text-xs font-bold rounded flex items-center transition-all ${activeTab === 'cyber' ? 'bg-green-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                >
                    <Terminal size={14} className="mr-2"/> {t('intel_tab_cyber')}
                </button>
                <button 
                    onClick={() => setActiveTab('sigint')}
                    className={`px-4 py-1.5 text-xs font-bold rounded flex items-center transition-all ${activeTab === 'sigint' ? 'bg-military-accent text-white shadow' : 'text-gray-400 hover:text-white'}`}
                >
                    <Wifi size={14} className="mr-2"/> {t('intel_tab_sigint')}
                </button>
            </div>
            
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
          
          {/* TAB: DASHBOARD */}
          {activeTab === 'dashboard' && (
              <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <MetricCard title={t('intel_metric_cyber')} value="2,405" change={12.5} icon={ShieldAlert} color="accent" />
                    <MetricCard title={t('intel_metric_drone')} value="18" change={2} icon={Eye} color="success" />
                    <MetricCard title={t('intel_metric_sigint')} value="14.2k" change={5.1} icon={Wifi} />
                    <MetricCard title="Threat Level" value="MODERATE" icon={Radio} color="warning" />
                  </div>

                  <div className="bg-military-800 rounded-lg border border-military-700 flex flex-col">
                      <div className="p-4 border-b border-military-700 bg-military-900/50">
                          <h3 className="font-semibold text-white flex items-center font-display">
                              <Globe size={16} className="mr-2 text-military-accent" />
                              {t('intel_active_recon')}
                          </h3>
                      </div>
                      <div className="flex-1 p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-military-900 p-4 rounded border-l-2 border-green-500">
                              <div className="flex justify-between items-start">
                                  <h4 className="text-sm font-bold text-gray-200 font-sans">{t('intel_op_silent')}</h4>
                                  <span className="text-[10px] bg-green-900 text-green-300 px-1.5 py-0.5 rounded font-mono">LIVE</span>
                              </div>
                              <p className="text-xs text-gray-400 mt-2 font-sans">{t('intel_op_silent_desc')}</p>
                          </div>
                           <div className="bg-military-900 p-4 rounded border-l-2 border-yellow-500">
                              <div className="flex justify-between items-start">
                                  <h4 className="text-sm font-bold text-gray-200 font-sans">{t('intel_op_echo')}</h4>
                                  <span className="text-[10px] bg-yellow-900 text-yellow-300 px-1.5 py-0.5 rounded font-mono">ANALYSIS</span>
                              </div>
                              <p className="text-xs text-gray-400 mt-2 font-sans">{t('intel_op_echo_desc')}</p>
                          </div>
                           <div className="bg-military-900 p-4 rounded border-l-2 border-blue-500">
                              <div className="flex justify-between items-start">
                                  <h4 className="text-sm font-bold text-gray-200 font-sans">{t('intel_op_deep')}</h4>
                                  <span className="text-[10px] bg-blue-900 text-blue-300 px-1.5 py-0.5 rounded font-mono">ROUTINE</span>
                              </div>
                              <p className="text-xs text-gray-400 mt-2 font-sans">{t('intel_op_deep_desc')}</p>
                          </div>
                      </div>
                  </div>
              </div>
          )}

          {/* TAB: FUSION (IFAN) */}
          {activeTab === 'fusion' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full overflow-y-auto lg:overflow-hidden">
                  {/* Central Cognitive Core */}
                  <div className="lg:col-span-2 bg-[#0b1120] rounded-lg border border-military-700 relative flex flex-col items-center justify-center shadow-2xl p-6 min-h-[400px]">
                      <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(168,85,247,0.1),transparent)]"></div>
                      
                      <div className="relative w-64 h-64 md:w-96 md:h-96">
                          {/* Rotating Rings */}
                          <div className="absolute inset-0 rounded-full border border-purple-500/30 animate-[spin_10s_linear_infinite]"></div>
                          <div className="absolute inset-4 rounded-full border border-blue-500/30 animate-[spin_15s_linear_infinite_reverse]"></div>
                          <div className="absolute inset-8 rounded-full border border-green-500/30 animate-[spin_20s_linear_infinite]"></div>
                          
                          {/* Core Brain */}
                          <div className="absolute inset-0 flex items-center justify-center">
                              <BrainCircuit size={64} className="text-purple-400 animate-pulse" />
                          </div>

                          {/* Data Nodes */}
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-black/60 px-3 py-1 rounded border border-blue-500 text-blue-400 text-xs font-bold">SIGINT</div>
                          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-black/60 px-3 py-1 rounded border border-green-500 text-green-400 text-xs font-bold">HUMINT</div>
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 bg-black/60 px-3 py-1 rounded border border-yellow-500 text-yellow-400 text-xs font-bold">OSINT</div>
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 bg-black/60 px-3 py-1 rounded border border-red-500 text-red-400 text-xs font-bold">GEOINT</div>
                      </div>

                      <h3 className="text-xl font-bold text-white mt-4 font-display tracking-widest">{t('ifan_title')} CORE</h3>
                      <p className="text-xs text-gray-400 mt-1 max-w-md text-center">{t('ifan_fusion')}: Integrating multi-spectrum data for predictive foresight.</p>
                  </div>

                  {/* Analysis Modules */}
                  <div className="space-y-4">
                      {/* Cognitive Red Team - NEW ADDITION */}
                      <div className="bg-military-900 rounded-lg p-4 border border-red-900/50 flex flex-col h-48">
                          <h4 className="text-sm font-bold text-red-400 mb-2 flex items-center animate-pulse">
                              <Bot size={16} className="mr-2" /> Cognitive AI Red Team
                          </h4>
                          <div className="flex-1 bg-black/50 p-2 rounded text-[10px] font-mono overflow-hidden relative">
                              <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent to-black/50"></div>
                              <div className="space-y-1">
                                  {redTeamLogs.map((log, i) => (
                                      <div key={i} className={log.includes('RED') ? 'text-red-300' : 'text-green-300'}><SafeRender content={log} /></div>
                                  ))}
                              </div>
                          </div>
                      </div>

                      {/* Global Threat Library - NEW ADDITION */}
                      <div className="bg-military-800 p-4 rounded-lg border border-military-700 hover:border-purple-500 transition-colors">
                          <h4 className="text-sm font-bold text-white mb-2 flex items-center">
                              <FileWarning size={16} className="text-yellow-400 mr-2" /> Global Threat Library
                          </h4>
                          <div className="space-y-2">
                              {threatLibrary.map((threat, i) => (
                                  <div key={i} className="flex justify-between items-center text-xs bg-military-900/50 p-1.5 rounded">
                                      <span className="text-white font-bold">{threat.name}</span>
                                      <div className="flex space-x-2">
                                          <span className="text-gray-400">{threat.type}</span>
                                          <span className={`font-bold ${threat.risk === 'Critical' ? 'text-red-500' : 'text-yellow-500'}`}>{threat.risk}</span>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>

                      <div className="bg-military-800 p-4 rounded-lg border border-military-700 hover:border-blue-500 transition-colors">
                          <h4 className="text-sm font-bold text-white mb-2 flex items-center">
                              <Scale size={16} className="text-blue-400 mr-2" /> {t('ifan_cognitive')}
                          </h4>
                          <p className="text-xs text-gray-400 mb-3">Sector 9 Civilian Sentiment</p>
                          <div className="w-full bg-gray-700 h-2 rounded-full mb-1">
                              <div className="bg-blue-500 h-2 rounded-full" style={{width: '65%'}}></div>
                          </div>
                          <span className="text-[10px] text-blue-300">65% Supportive of Government Initiatives</span>
                      </div>
                  </div>
              </div>
          )}

          {/* TAB: LINK ANALYSIS */}
          {activeTab === 'link' && (
              <div className="h-full flex flex-col relative overflow-hidden bg-[#050b14] rounded-lg border border-military-700 min-h-[500px]">
                  <div className="absolute inset-0 pointer-events-none opacity-20" style={{backgroundImage: 'radial-gradient(#333 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
                  
                  {/* Toolbar */}
                  <div className="absolute top-4 left-4 z-10 bg-military-800/80 backdrop-blur p-2 rounded border border-military-600 flex space-x-2">
                      <div className="flex items-center space-x-1 px-2 border-r border-military-600">
                          <User size={14} className="text-red-500"/>
                          <span className="text-xs text-gray-300 font-sans">{t('intel_net_hvt')}</span>
                      </div>
                      <div className="flex items-center space-x-1 px-2 border-r border-military-600">
                          <DollarSign size={14} className="text-green-500"/>
                          <span className="text-xs text-gray-300 font-sans">{t('intel_net_fin')}</span>
                      </div>
                      <div className="flex items-center space-x-1 px-2">
                          <Home size={14} className="text-blue-500"/>
                          <span className="text-xs text-gray-300 font-sans">{t('intel_net_loc')}</span>
                      </div>
                  </div>

                  {/* Graph Canvas */}
                  <svg 
                    className="w-full h-full cursor-grab active:cursor-grabbing"
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                  >
                      {/* Connections */}
                      {nodes.map(node => 
                          node.connections.map(targetId => {
                              const target = nodes.find(n => n.id === targetId);
                              if (!target) return null;
                              return (
                                  <line 
                                    key={`${node.id}-${targetId}`}
                                    x1={node.x} y1={node.y}
                                    x2={target.x} y2={target.y}
                                    stroke="#475569" strokeWidth="2"
                                    strokeOpacity="0.5"
                                  />
                              );
                          })
                      )}

                      {/* Nodes */}
                      {nodes.map(node => (
                          <g 
                            key={node.id}
                            transform={`translate(${node.x}, ${node.y})`}
                            onMouseDown={(e) => handleMouseDown(e, node.id)}
                            className="cursor-pointer group"
                          >
                              {/* Pulse Effect for Selected */}
                              {selectedNode?.id === node.id && (
                                  <circle r="35" fill="none" stroke="white" strokeWidth="1" opacity="0.5" className="animate-ping" />
                              )}
                              
                              <circle r="28" fill="#1e293b" stroke={selectedNode?.id === node.id ? '#fff' : '#475569'} strokeWidth="2" className="transition-all group-hover:fill-military-700" />
                              <g transform="translate(-12, -12)">
                                  {getNodeIcon(node.type)}
                              </g>
                              <text y="45" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="monospace" fontWeight="bold" className="group-hover:fill-white">{node.label}</text>
                          </g>
                      ))}
                  </svg>
                  
                  {/* Details Panel */}
                  {selectedNode && (
                      <div className="absolute top-4 right-4 w-72 bg-military-800/90 backdrop-blur p-5 rounded-lg border border-military-600 animate-in slide-in-from-right-10 shadow-2xl">
                          <div className="flex justify-between items-start mb-4 border-b border-military-700 pb-2">
                              <div>
                                  <h4 className="font-bold text-white text-lg">{selectedNode.label}</h4>
                                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                                      selectedNode.type === 'target' ? 'bg-red-900/50 text-red-300' :
                                      selectedNode.type === 'finance' ? 'bg-green-900/50 text-green-300' : 'bg-blue-900/50 text-blue-300'
                                  }`}>
                                      {selectedNode.type}
                                  </span>
                              </div>
                              <button onClick={() => setSelectedNode(null)} className="text-gray-400 hover:text-white"><X size={18}/></button>
                          </div>
                          
                          <div className="space-y-3 text-xs text-gray-300 mb-4">
                              <div className="flex justify-between"><span className="text-gray-500">ENTITY ID</span><span className="font-mono">{selectedNode.id.toUpperCase()}</span></div>
                              <div className="flex justify-between"><span className="text-gray-500">CONNECTIONS</span><span>{selectedNode.connections.length} Linked Nodes</span></div>
                              <div className="flex justify-between"><span className="text-gray-500">THREAT SCORE</span><span className="text-red-400 font-bold">HIGH</span></div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2">
                              <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-xs font-bold transition-colors">DEEP DIVE</button>
                              <button className="bg-red-600 hover:bg-red-700 text-white py-2 rounded text-xs font-bold transition-colors">FLAG TARGET</button>
                          </div>
                      </div>
                  )}
              </div>
          )}

          {/* TAB: OSINT */}
          {activeTab === 'osint' && (
              <div className="flex flex-col p-6 bg-military-800 rounded-lg border border-military-700 h-full overflow-y-auto">
                  <div className="max-w-3xl mx-auto w-full flex flex-col h-full">
                      <div className="mb-8 text-center">
                          <h3 className="text-2xl font-bold text-white mb-2 font-display">{t('intel_global_search')}</h3>
                          <p className="text-gray-400 text-sm">{t('intel_search_placeholder')}</p>
                          {userLocation && (
                              <div className="mt-2 text-xs text-green-500 flex justify-center items-center">
                                  <MapPin size={12} className="mr-1" />
                                  Geospatial Context Active: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                              </div>
                          )}
                      </div>

                      <div className="flex space-x-2 mb-6">
                          <input 
                              type="text" 
                              value={osintQuery}
                              onChange={(e) => setOsintQuery(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleOsintSearch()}
                              placeholder="e.g. Red Sea maritime security incidents or 'Deepfake analysis'..."
                              className="flex-1 bg-black/30 border border-military-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-military-accent font-sans"
                          />
                          <button 
                              onClick={() => handleOsintSearch()}
                              disabled={osintLoading}
                              className="bg-military-accent hover:bg-sky-500 text-white px-6 rounded-lg font-bold flex items-center transition-colors disabled:opacity-50"
                          >
                              {osintLoading ? <Zap size={18} className="animate-spin" /> : <Search size={18} />}
                          </button>
                      </div>

                      <div className="flex-1 space-y-4">
                          {!osintData && !osintLoading && !deepfakeAnalysis && (
                              <div className="text-center text-gray-500 mt-12">
                                  <Globe size={48} className="mx-auto mb-4 opacity-20" />
                                  <p>{t('intel_await_input')}</p>
                                  <div className="mt-6 flex flex-wrap justify-center gap-2">
                                      {suggestedVectors.map((vec, i) => (
                                          <button 
                                            key={i}
                                            onClick={() => { setOsintQuery(vec); handleOsintSearch(vec); }}
                                            className="text-xs bg-military-900 border border-military-600 px-3 py-1 rounded-full hover:border-military-accent hover:text-white transition-colors"
                                          >
                                              {vec}
                                          </button>
                                      ))}
                                  </div>
                              </div>
                          )}

                          {osintLoading && (
                              <div className="text-center text-military-accent mt-12">
                                  <div className="inline-block w-8 h-8 border-4 border-current border-t-transparent rounded-full animate-spin mb-4"></div>
                                  <p className="font-mono text-sm animate-pulse">{t('intel_scan_btn')}</p>
                              </div>
                          )}

                          {/* Deepfake Analysis Panel - NEW ADDITION */}
                          {deepfakeAnalysis && (
                              <div className="bg-purple-900/20 border border-purple-500/50 p-4 rounded-lg flex items-center justify-between animate-in fade-in slide-in-from-bottom-2">
                                  <div className="flex items-center">
                                      <ScanFace size={32} className="text-purple-400 mr-4" />
                                      <div>
                                          <h4 className="text-lg font-bold text-white mb-1">AI Media Verification (Deepfake Scan)</h4>
                                          <p className="text-xs text-gray-300 max-w-md"><SafeRender content={deepfakeAnalysis.details} /></p>
                                          <p className="text-sm font-bold mt-1 text-purple-300"><SafeRender content={deepfakeAnalysis.verdict} /></p>
                                      </div>
                                  </div>
                                  <div className="text-right">
                                      <div className="text-xs text-gray-400 uppercase">Manipulated Probability</div>
                                      <div className={`text-3xl font-bold ${deepfakeAnalysis.score > 50 ? 'text-red-500' : 'text-green-500'}`}>
                                          <SafeRender content={deepfakeAnalysis.score} />%
                                      </div>
                                  </div>
                              </div>
                          )}

                          {osintData && (
                              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                                  <div className="bg-military-900/50 p-6 rounded-lg border border-military-600">
                                      <h4 className="text-sm font-bold text-green-400 mb-4 flex items-center font-display">
                                          <CheckCircle size={16} className="mr-2" /> {t('intel_briefing')}
                                      </h4>
                                      <div className="prose prose-invert prose-sm max-w-none text-gray-300">
                                          <p className="whitespace-pre-wrap leading-relaxed"><SafeRender content={osintData.text} /></p>
                                      </div>
                                  </div>

                                  {osintData.sources.length > 0 && (
                                      <div>
                                          <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 ml-1">
                                              {t('intel_sources')} / GEO-LINKS
                                          </h4>
                                          <div className="grid gap-2">
                                              {osintData.sources.map((source, idx) => {
                                                  // Prefer maps, then web
                                                  const link = source.maps?.uri || source.web?.uri;
                                                  const title = source.maps?.title || source.web?.title || "Unknown Source";
                                                  const isMap = !!source.maps?.uri;

                                                  return (
                                                      <a 
                                                        key={idx} 
                                                        href={link} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className={`flex items-center justify-between p-3 bg-military-900 rounded border transition-colors group ${isMap ? 'border-green-900 hover:border-green-500' : 'border-military-700 hover:border-military-500'}`}
                                                      >
                                                          <div className="flex items-center space-x-3 overflow-hidden">
                                                              {isMap ? <MapPin size={16} className="text-green-500 flex-shrink-0" /> : <Globe size={16} className="text-blue-400 flex-shrink-0" />}
                                                              <span className={`text-sm group-hover:underline truncate ${isMap ? 'text-green-300' : 'text-blue-400'}`}>{title}</span>
                                                          </div>
                                                          <ExternalLink size={14} className="text-gray-600 group-hover:text-white flex-shrink-0" />
                                                      </a>
                                                  );
                                              })}
                                          </div>
                                      </div>
                                  )}
                              </div>
                          )}
                      </div>
                  </div>
              </div>
          )}

          {/* TAB: DRONE SURVEILLANCE */}
          {activeTab === 'surveillance' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full overflow-y-auto lg:overflow-hidden">
                  {/* Main Feed */}
                  <div className="lg:col-span-2 bg-black rounded-lg border border-military-700 relative overflow-hidden group min-h-[400px]">
                      <div className="absolute inset-0">
                          {/* Use TacticalMap for Live Feed */}
                          <TacticalMap holoMode={true} customUnits={droneUnits} terrainType='Desert / Open' />
                      </div>
                      
                      {/* Drone HUD Overlay */}
                      <div className="absolute inset-0 pointer-events-none">
                          <div className="absolute top-4 left-4 font-mono text-xs text-white z-20">
                              <p className="text-red-500 font-bold bg-black/50 px-1">{t('intel_live_feed')}</p>
                              <p className="bg-black/50 px-1 mt-1">CAM-1 [IR]</p>
                              <p className="bg-black/50 px-1">{selectedDrone}</p>
                          </div>
                          
                          <div className="absolute bottom-4 right-4 text-right font-mono text-xs text-white z-20">
                              <p className="bg-black/50 px-1 mb-1">{t('lbl_alt')}: 18,400 FT</p>
                              <p className="bg-black/50 px-1 mb-1">{t('lbl_spd')}: 140 KTS</p>
                              <p className="bg-black/50 px-1">{t('lbl_hdg')}: 330 NW</p>
                          </div>
                      </div>
                  </div>

                  {/* Drone List */}
                  <div className="bg-military-800 rounded-lg p-4 border border-military-700 flex flex-col h-full overflow-y-auto">
                      <h3 className="font-semibold text-white mb-4">{t('intel_active_recon')}</h3>
                      <div className="space-y-3 flex-1 overflow-y-auto max-h-[300px]">
                          {['UAV-01', 'UAV-04', 'UAV-09'].map(drone => (
                              <div 
                                  key={drone}
                                  onClick={() => setSelectedDrone(drone)}
                                  className={`p-3 rounded border cursor-pointer flex justify-between items-center ${selectedDrone === drone ? 'bg-military-700 border-green-500' : 'bg-military-900 border-military-600 hover:border-gray-500'}`}
                              >
                                  <div className="flex items-center">
                                      <div className={`w-2 h-2 rounded-full mr-3 ${selectedDrone === drone ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
                                      <span className="text-sm font-bold text-white">{drone}</span>
                                  </div>
                                  <span className="text-xs text-gray-400">Sector 4</span>
                              </div>
                          ))}
                      </div>
                      
                      <div className="mt-4 p-3 bg-military-900 rounded border border-military-600">
                          <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">{t('intel_detected')}</h4>
                          <div className="space-y-1 text-xs text-white font-mono">
                              <div className="flex justify-between"><span>Vehicle (Truck)</span><span className="text-yellow-500">88%</span></div>
                              <div className="flex justify-between"><span>Personnel (Armed)</span><span className="text-red-500">92%</span></div>
                          </div>
                      </div>
                  </div>
              </div>
          )}

          {/* TAB: CYBER COMMAND */}
          {activeTab === 'cyber' && (
              <div className="bg-black font-mono text-sm p-4 rounded-lg border border-military-700 overflow-hidden flex flex-col min-h-[500px]">
                  <div className="flex justify-between items-center border-b border-gray-800 pb-2 mb-2">
                      <span className="text-green-500 font-bold">{t('intel_terminal')}</span>
                      <div className="flex space-x-2">
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      </div>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-1 p-2 max-h-[400px]" onClick={() => document.getElementById('terminal-input')?.focus()}>
                      {terminalHistory.map((line, i) => (
                          <div key={i} className={`whitespace-pre-wrap ${line.startsWith('root') ? 'text-blue-400' : line.includes('Error') ? 'text-red-500' : 'text-green-400'}`}>
                              <SafeRender content={line} />
                          </div>
                      ))}
                      {terminalProcessing && <div className="text-green-500 animate-pulse">_</div>}
                      <div ref={terminalEndRef} />
                  </div>
                  <div className="flex items-center mt-2 border-t border-gray-800 pt-2">
                      <span className="text-blue-400 mr-2">root@endf-cyber:~#</span>
                      <input 
                          id="terminal-input"
                          type="text" 
                          value={terminalInput}
                          onChange={(e) => setTerminalInput(e.target.value)}
                          onKeyDown={handleTerminalCommand}
                          className="flex-1 bg-transparent border-none focus:outline-none text-white"
                          autoFocus
                          autoComplete="off"
                          disabled={terminalProcessing}
                      />
                  </div>
              </div>
          )}

          {/* TAB: SIGINT */}
          {activeTab === 'sigint' && (
              <div className="flex flex-col space-y-6 h-full overflow-y-auto">
                  <div className="bg-military-800 rounded-lg p-6 border border-military-700 flex-1 flex flex-col">
                      <div className="flex justify-between items-center mb-4">
                          <h3 className="font-semibold text-lg text-white flex items-center">
                              <Radio className="mr-2 text-yellow-500" size={20} /> {t('intel_sig_live')}
                          </h3>
                          <span className="text-xs bg-red-900/50 text-red-400 px-2 py-1 rounded border border-red-900 animate-pulse">RECORDING</span>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto space-y-2 pr-2 max-h-[400px]">
                          {sigintFeed.map(sig => (
                              <div key={sig.id} className="bg-black/40 p-3 rounded border border-military-600 flex items-start space-x-3 animate-in slide-in-from-left-2">
                                  <div className="mt-1">
                                      {sig.type === 'voice' ? <Radio size={16} className="text-blue-400"/> : <Wifi size={16} className="text-gray-400"/>}
                                  </div>
                                  <div className="flex-1">
                                      <div className="flex justify-between text-xs text-gray-500 mb-1 font-mono">
                                          <span>{sig.freq}</span>
                                          <span>{t(sig.sourceKey as any)}</span>
                                      </div>
                                      <p className={`text-sm font-mono ${sig.type === 'voice' ? 'text-white' : 'text-gray-400 italic'}`}>
                                          {t(sig.contentKey as any)}
                                      </p>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
                  
                  {/* Frequency Visualizer (Fake) */}
                  <div className="h-32 bg-black rounded-lg border border-military-700 relative overflow-hidden">
                      <div className="absolute inset-0 flex items-end justify-between px-1">
                          {[...Array(50)].map((_, i) => (
                              <div 
                                key={i} 
                                className="w-1.5 bg-green-500/50 rounded-t transition-all duration-100"
                                style={{ 
                                    height: `${Math.random() * 80 + 10}%`,
                                    opacity: Math.random()
                                }}
                              ></div>
                          ))}
                      </div>
                      <div className="absolute top-2 left-2 text-xs text-green-500 font-mono">SPECTRUM ANALYZER [VHF/UHF]</div>
                  </div>
              </div>
          )}
      </div>
    </div>
  );
};

export default IntelligenceView;
