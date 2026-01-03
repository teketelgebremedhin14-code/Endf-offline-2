
import React, { useState, useEffect } from 'react';
import { BrainCircuit, Activity, Network, TrendingUp, Cpu, Database, Share2, Layers, AlertTriangle, Lightbulb, Hexagon, Globe, BookOpen, ShieldAlert, Crosshair, Users, MapPin, Zap, Scale, FileText, Code, GitBranch, Lock, Microscope, Radio, Server, RefreshCw, X } from 'lucide-react';
import MetricCard from '../components/MetricCard';
import { useLanguage } from '../contexts/LanguageContext';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, Tooltip, LineChart, Line, XAxis, YAxis, PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis, BarChart, Bar, CartesianGrid } from 'recharts';
import { runAdvancedSimulation } from '../services/ollamaService';

interface AINexusViewProps {
    onBack?: () => void;
}

const AINexusView: React.FC<AINexusViewProps> = ({ onBack }) => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<'knowledge' | 'swarm' | 'defense_echo' | 'threat_echo' | 'federated' | 'globenet' | 'material'>('swarm');
    const [loading, setLoading] = useState(false);
    
    // Dynamic Data States
    const [geoRiskData, setGeoRiskData] = useState([
        { subject: 'Border Volatility', A: 85, fullMark: 100 },
        { subject: 'Econ. Stability', A: 65, fullMark: 100 },
        { subject: 'Cyber Threat', A: 92, fullMark: 100 },
        { subject: 'Supply Chain', A: 70, fullMark: 100 },
        { subject: 'Civil Sentiment', A: 78, fullMark: 100 },
        { subject: 'Climate Risk', A: 88, fullMark: 100 },
    ]);

    const [swarmLog, setSwarmLog] = useState([
        "[SYSTEM] Goal: Secure Sector 4 Supply Route",
        "[INTEL_AGT] Threat Analysis: Low Probability of IEDs. Recommending Route B.",
        "[LOG_AGT] Constraint: Route B bridge capacity < 40 Tons. Heavy armor cannot pass.",
        "[CMD_CORE] Synthesis: Rerouting Armor to Route A. Light Supply convoy takes Route B.",
        "[EXEC] Orders generated. Awaiting approval."
    ]);

    const [defenseData, setDefenseData] = useState([
        { t: 'T+0', stability: 85, cost: 20 },
        { t: 'T+1', stability: 82, cost: 25 },
        { t: 'T+2', stability: 75, cost: 40 },
        { t: 'T+3', stability: 70, cost: 60 },
    ]);

    const [disinfoData, setDisinfoData] = useState([
        { x: 10, y: 30, z: 200, name: 'Organic Discourse' },
        { x: 50, y: 50, z: 400, name: 'Verified News' },
        { x: 80, y: 90, z: 1000, name: 'Bot Network A' },
        { x: 20, y: 20, z: 100, name: 'Local Chatter' },
        { x: 85, y: 85, z: 800, name: 'State Actor Proxy' },
    ]);

    const [materialCandidates, setMaterialCandidates] = useState([
        { id: 'MAT-2991', type: 'Polymer', property: 'Ballistic Res', score: 98, status: 'Synthesizing' },
        { id: 'MAT-3042', type: 'Alloy', property: 'Heat Dissipation', score: 94, status: 'Testing' },
        { id: 'MAT-1102', type: 'Composite', property: 'Radar Abs.', score: 99, status: 'Production' },
    ]);

    const loadAIData = async () => {
        setLoading(true);
        try {
            let resultString = "{}";
            if (activeTab === 'knowledge') {
                resultString = await runAdvancedSimulation('knowledge', { region: 'Horn of Africa', focus: 'Risk Assessment' });
                const data = JSON.parse(resultString);
                if (Array.isArray(data)) setGeoRiskData(data);
            } else if (activeTab === 'swarm') {
                resultString = await runAdvancedSimulation('swarm', { objective: 'Counter-Insurgency', agents: 4 });
                const data = JSON.parse(resultString);
                if (Array.isArray(data)) setSwarmLog(data);
            } else if (activeTab === 'defense_echo') {
                resultString = await runAdvancedSimulation('defense_echo', { policy: 'Border Tightening' });
                const data = JSON.parse(resultString);
                if (Array.isArray(data)) setDefenseData(data);
            } else if (activeTab === 'threat_echo') {
                resultString = await runAdvancedSimulation('threat_echo', { source: 'Social Media', topic: 'Election' });
                const data = JSON.parse(resultString);
                if (Array.isArray(data)) setDisinfoData(data);
            } else if (activeTab === 'material') {
                resultString = await runAdvancedSimulation('material', { goal: 'Lightweight Armor' });
                const data = JSON.parse(resultString);
                if (Array.isArray(data)) setMaterialCandidates(data);
            }
        } catch (e) {
            console.error("Failed to parse AI response or fetch data", e);
        }
        setLoading(false);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 flex flex-col h-[calc(100vh-140px)]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2 flex-shrink-0">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">{t('ai_title')}</h2>
                    <p className="text-gray-400 text-sm">{t('ai_subtitle')}</p>
                </div>
                
                <div className="mt-4 md:mt-0 flex gap-2 items-center">
                    <button 
                        onClick={loadAIData}
                        disabled={loading}
                        className={`px-4 py-2 rounded text-xs font-bold flex items-center shadow-lg transition-all ${loading ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-military-accent text-white hover:bg-sky-500'}`}
                    >
                        <RefreshCw size={14} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                        {loading ? 'AI PROCESSING...' : 'LIVE REFRESH'}
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

            <div className="bg-military-800 p-1 rounded-lg border border-military-700 flex flex-wrap gap-1 mb-4 flex-shrink-0">
                <button onClick={() => setActiveTab('knowledge')} className={`px-3 py-1.5 text-[10px] font-bold rounded flex items-center transition-all ${activeTab === 'knowledge' ? 'bg-cyan-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}>
                    <BookOpen size={12} className="mr-2"/> 14.1 CORPUS
                </button>
                <button onClick={() => setActiveTab('swarm')} className={`px-3 py-1.5 text-[10px] font-bold rounded flex items-center transition-all ${activeTab === 'swarm' ? 'bg-purple-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}>
                    <Hexagon size={12} className="mr-2"/> 14.2 HIVE
                </button>
                <button onClick={() => setActiveTab('defense_echo')} className={`px-3 py-1.5 text-[10px] font-bold rounded flex items-center transition-all ${activeTab === 'defense_echo' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}>
                    <Activity size={12} className="mr-2"/> 14.3 DEF. ECHO
                </button>
                <button onClick={() => setActiveTab('federated')} className={`px-3 py-1.5 text-[10px] font-bold rounded flex items-center transition-all ${activeTab === 'federated' ? 'bg-green-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}>
                    <Network size={12} className="mr-2"/> 14.4 FED. NET
                </button>
                <button onClick={() => setActiveTab('globenet')} className={`px-3 py-1.5 text-[10px] font-bold rounded flex items-center transition-all ${activeTab === 'globenet' ? 'bg-indigo-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}>
                    <Globe size={12} className="mr-2"/> 14.5 GLOBENET
                </button>
                <button onClick={() => setActiveTab('threat_echo')} className={`px-3 py-1.5 text-[10px] font-bold rounded flex items-center transition-all ${activeTab === 'threat_echo' ? 'bg-red-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}>
                    <AlertTriangle size={12} className="mr-2"/> 14.6 THREAT
                </button>
                <button onClick={() => setActiveTab('material')} className={`px-3 py-1.5 text-[10px] font-bold rounded flex items-center transition-all ${activeTab === 'material' ? 'bg-orange-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}>
                    <Layers size={12} className="mr-2"/> 14.7 MATGEN
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-shrink-0">
                <MetricCard title={t('ai_metric_nodes')} value="150k+" icon={BrainCircuit} color="purple" />
                <MetricCard title={t('ai_metric_predictions')} value="94.2%" change={1.5} icon={TrendingUp} color="accent" />
                <MetricCard title={t('ai_metric_models')} value="12" icon={Network} color="success" />
                <MetricCard title={t('ai_metric_materials')} value="3" icon={Layers} color="warning" />
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto relative">
                
                {/* 14.1 FOUNDATIONAL KNOWLEDGE CORPUS */}
                {activeTab === 'knowledge' && (
                    <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto">
                        <div className="bg-military-800 rounded-lg p-6 border border-military-700 flex flex-col h-[400px] lg:h-full">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                                <BookOpen className="mr-2 text-cyan-500" size={20} /> Cognitive Modeling & Analysis
                            </h3>
                            <div className="flex-1">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={geoRiskData}>
                                        <PolarGrid stroke="#334155" />
                                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                        <Radar name="Risk Profile" dataKey="A" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.4} />
                                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-4 p-3 bg-cyan-900/20 border border-cyan-500/30 rounded text-xs text-cyan-300">
                                <strong>Engine:</strong> Integrated Palantir Gotham & QuantCube Logic.
                                <br/>Real-time fusion of economic, legal (Westlaw), and geospatial signals.
                            </div>
                        </div>
                        <div className="bg-military-800 rounded-lg p-6 border border-military-700 overflow-y-auto">
                            <h3 className="text-lg font-bold text-white mb-4">Active Knowledge Streams</h3>
                            <div className="space-y-3">
                                <div className="p-3 bg-military-900 rounded border border-military-600 flex items-center justify-between">
                                    <div className="flex items-center">
                                        <Globe size={16} className="text-blue-400 mr-3" />
                                        <div>
                                            <h4 className="text-sm font-bold text-white">Geopolitical (BlackSky)</h4>
                                            <p className="text-[10px] text-gray-400">Satellite Imagery & Signal Analysis</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-green-500 font-mono">LIVE</span>
                                </div>
                                <div className="p-3 bg-military-900 rounded border border-military-600 flex items-center justify-between">
                                    <div className="flex items-center">
                                        <Scale size={16} className="text-yellow-400 mr-3" />
                                        <div>
                                            <h4 className="text-sm font-bold text-white">Legal (Westlaw Edge)</h4>
                                            <p className="text-[10px] text-gray-400">Constitutional Compliance Check</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-green-500 font-mono">INDEXED</span>
                                </div>
                                <div className="p-3 bg-military-900 rounded border border-military-600 flex items-center justify-between">
                                    <div className="flex items-center">
                                        <Users size={16} className="text-purple-400 mr-3" />
                                        <div>
                                            <h4 className="text-sm font-bold text-white">Psych-Social (IBM Watson)</h4>
                                            <p className="text-[10px] text-gray-400">Civil Sentiment & Morale Modeling</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-green-500 font-mono">UPDATING</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 14.2 COMMAND HIVE */}
                {activeTab === 'swarm' && (
                    <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto">
                        <div className="bg-military-800 rounded-lg p-6 border border-military-700 flex flex-col relative overflow-hidden h-[400px] lg:h-full">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                                <Hexagon className="mr-2 text-purple-500" size={20} /> Hierarchical Swarm State
                            </h3>
                            <div className="flex-1 flex items-center justify-center">
                                <div className="relative w-48 h-48 sm:w-64 sm:h-64">
                                    <div className="absolute inset-0 border-2 border-purple-500/30 rounded-full animate-spin-slow"></div>
                                    <div className="absolute inset-4 border-2 border-blue-500/30 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="text-center">
                                            <GitBranch size={48} className="text-white mx-auto mb-2" />
                                            <div className="text-xs font-mono text-purple-300">AutoGPT Core</div>
                                        </div>
                                    </div>
                                    {/* Orbiting Agents */}
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 bg-military-900 px-2 py-1 rounded border border-purple-500 text-[10px] text-white">Logistics Agent</div>
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-4 bg-military-900 px-2 py-1 rounded border border-blue-500 text-[10px] text-white">Intel Agent</div>
                                    <div className="absolute left-0 top-1/2 -translate-x-4 -translate-y-1/2 bg-military-900 px-2 py-1 rounded border border-green-500 text-[10px] text-white">Tactical Agent</div>
                                    <div className="absolute right-0 top-1/2 translate-x-4 -translate-y-1/2 bg-military-900 px-2 py-1 rounded border border-yellow-500 text-[10px] text-white">Legal Agent</div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-military-800 rounded-lg p-6 border border-military-700 flex flex-col">
                            <h3 className="text-lg font-bold text-white mb-4">Agent Reasoning Log (CoT)</h3>
                            <div className="flex-1 bg-black/40 rounded p-4 font-mono text-xs overflow-y-auto space-y-3 max-h-[400px]">
                                {swarmLog.map((log, i) => (
                                    <div key={i} className="border-l-2 border-gray-700 pl-2 text-gray-300">
                                        {log}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* 14.3 DEFENSE ECHO */}
                {activeTab === 'defense_echo' && (
                    <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto">
                        <div className="bg-military-800 rounded-lg p-6 border border-military-700 flex flex-col h-[400px] lg:h-full">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                                <Activity className="mr-2 text-blue-500" size={20}/> Causal Policy Simulator
                            </h3>
                            <p className="text-xs text-gray-400 mb-4">Powered by Causalens & BlackRock Aladdin Logic</p>
                            
                            <div className="flex-1 relative bg-black/20 rounded border border-military-600 p-4">
                                {/* Simulated Causal Graph Nodes */}
                                <div className="absolute top-1/4 left-1/4 bg-blue-900/50 p-2 rounded border border-blue-500 text-xs text-white text-center w-24">
                                    Import Tariff
                                </div>
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-900/50 p-2 rounded border border-red-500 text-xs text-white text-center w-24 animate-pulse">
                                    Inflation
                                </div>
                                <div className="absolute bottom-1/4 right-1/4 bg-yellow-900/50 p-2 rounded border border-yellow-500 text-xs text-white text-center w-24">
                                    Civil Unrest
                                </div>
                                
                                {/* Connectors */}
                                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                                    <line x1="30%" y1="30%" x2="45%" y2="45%" stroke="#4b5563" strokeWidth="2" markerEnd="url(#arrow)" />
                                    <line x1="55%" y1="55%" x2="70%" y2="70%" stroke="#ef4444" strokeWidth="3" markerEnd="url(#arrow)" />
                                    <defs>
                                        <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                                            <path d="M0,0 L0,6 L9,3 z" fill="#4b5563" />
                                        </marker>
                                    </defs>
                                </svg>
                            </div>
                        </div>
                        <div className="bg-military-800 rounded-lg p-6 border border-military-700 h-[400px] lg:h-full">
                            <h3 className="text-lg font-bold text-white mb-4">Impact Forecast</h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={defenseData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                        <XAxis dataKey="t" stroke="#94a3b8" />
                                        <YAxis stroke="#94a3b8" />
                                        <Tooltip contentStyle={{ backgroundColor: '#1e293b' }} />
                                        <Line type="monotone" dataKey="stability" stroke="#ef4444" name="Stability Index" />
                                        <Line type="monotone" dataKey="cost" stroke="#eab308" name="Ops Cost" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded text-xs text-red-300">
                                <strong>Warning:</strong> Current policy trajectory indicates instability risk by T+3.
                            </div>
                        </div>
                    </div>
                )}

                {/* 14.4 FEDFORCENET */}
                {activeTab === 'federated' && (
                    <div className="h-full bg-military-800 rounded-lg p-6 border border-military-700 flex flex-col items-center justify-center overflow-y-auto">
                        <Network size={64} className="text-green-500 mb-6" />
                        <h3 className="text-2xl font-bold text-white mb-2">Federated Intelligence Network</h3>
                        <p className="text-gray-400 mb-8 text-sm">Powered by PySyft & NVIDIA FLARE. Zero-Trust Data Sovereignty.</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
                            <div className="flex flex-col items-center p-4 bg-military-900 rounded border border-military-600">
                                <Database size={32} className="text-blue-400 mb-2" />
                                <span className="text-white font-bold">North Node</span>
                                <span className="text-xs text-gray-500">Local Training</span>
                                <div className="w-full bg-gray-800 h-1 mt-2 rounded"><div className="bg-blue-500 h-1 w-3/4 animate-pulse"></div></div>
                            </div>
                            <div className="flex flex-col items-center p-4 bg-military-900 rounded border border-military-600 relative">
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-600 text-white text-[10px] px-2 py-0.5 rounded">AGGREGATOR</div>
                                <Server size={40} className="text-green-500 mb-2" />
                                <span className="text-white font-bold">HQ Core Model</span>
                                <span className="text-xs text-gray-500">Weight Update v4.2</span>
                            </div>
                            <div className="flex flex-col items-center p-4 bg-military-900 rounded border border-military-600">
                                <Database size={32} className="text-yellow-400 mb-2" />
                                <span className="text-white font-bold">East Node</span>
                                <span className="text-xs text-gray-500">Local Training</span>
                                <div className="w-full bg-gray-800 h-1 mt-2 rounded"><div className="bg-yellow-500 h-1 w-1/2 animate-pulse"></div></div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 14.5 GLOBENET */}
                {activeTab === 'globenet' && (
                    <div className="h-full grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-y-auto">
                        <div className="lg:col-span-2 bg-black rounded-lg border border-military-700 relative overflow-hidden flex items-center justify-center min-h-[400px]">
                            <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] bg-cover opacity-20 invert"></div>
                            <div className="z-10 text-center">
                                <Globe size={64} className="text-indigo-500 mx-auto mb-4 animate-pulse" />
                                <h3 className="text-xl font-bold text-white">AR Command Interface</h3>
                                <p className="text-xs text-indigo-300">CesiumJS 3D Visualization Layer Active</p>
                            </div>
                            {/* AR Elements */}
                            <div className="absolute top-1/4 left-1/4 border border-indigo-500/50 bg-black/50 p-2 rounded text-[10px] text-white">
                                Unit 42 (Moving)
                            </div>
                            <div className="absolute bottom-1/3 right-1/4 border border-red-500/50 bg-black/50 p-2 rounded text-[10px] text-white">
                                Hostile Sig
                            </div>
                        </div>
                        <div className="bg-military-800 rounded-lg p-6 border border-military-700 flex flex-col h-[400px] lg:h-auto">
                            <h3 className="font-bold text-white mb-4 flex items-center">
                                <Radio className="mr-2 text-indigo-500" size={20} /> Live Translation Stream
                            </h3>
                            <p className="text-xs text-gray-400 mb-4">Google/DeepL Neural Engine</p>
                            <div className="flex-1 bg-black/40 rounded p-3 overflow-y-auto space-y-3 font-mono text-xs">
                                <div className="p-2 border-l-2 border-blue-500 bg-blue-900/10">
                                    <div className="text-gray-500 mb-1">AUDIO IN (AMHARIC):</div>
                                    <div className="text-white">"ክፍል 4 ወደ ምዕራብ እየተንቀሳቀሰ ነው።"</div>
                                    <div className="text-indigo-400 mt-1">>> "Unit 4 is moving west."</div>
                                </div>
                                <div className="p-2 border-l-2 border-yellow-500 bg-yellow-900/10">
                                    <div className="text-gray-500 mb-1">AUDIO IN (SOMALI):</div>
                                    <div className="text-white">"Gaadiidka saadka ayaa soo daahay."</div>
                                    <div className="text-indigo-400 mt-1">>> "The logistics convoy is delayed."</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 14.6 THREAT ECHO */}
                {activeTab === 'threat_echo' && (
                    <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto">
                        <div className="bg-military-800 rounded-lg p-6 border border-military-700 h-[400px] lg:h-full">
                            <h3 className="font-bold text-white mb-4 flex items-center">
                                <ShieldAlert className="mr-2 text-red-500" size={20} /> Disinformation Cluster Analysis
                            </h3>
                            <p className="text-xs text-gray-400 mb-4">Graphika / New Knowledge Logic Engine</p>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                        <XAxis type="number" dataKey="x" name="Velocity" stroke="#94a3b8" />
                                        <YAxis type="number" dataKey="y" name="Reach" stroke="#94a3b8" />
                                        <ZAxis type="number" dataKey="z" range={[50, 400]} />
                                        <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#1e293b' }} />
                                        <Scatter name="Clusters" data={disinfoData} fill="#ef4444" shape="circle" />
                                    </ScatterChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-2 text-xs text-red-400 text-center">
                                AI Detected Anomalies in social sentiment.
                            </div>
                        </div>
                        <div className="bg-military-800 rounded-lg p-6 border border-military-700 flex flex-col h-[400px] lg:h-full">
                            <h3 className="font-bold text-white mb-4">Adversarial Simulation (PALADIN)</h3>
                            <div className="flex-1 bg-black/40 rounded border border-military-600 p-4 flex flex-col justify-between">
                                <div className="flex justify-between items-center text-sm text-gray-300">
                                    <span>Red Team AI Agent</span>
                                    <span className="text-red-500 font-bold">ATTACKING</span>
                                </div>
                                <div className="space-y-2 my-4">
                                    <div className="h-2 bg-gray-700 rounded overflow-hidden">
                                        <div className="h-full bg-red-600 w-3/4 animate-pulse"></div>
                                    </div>
                                    <div className="text-xs text-gray-500">Vector: DDoS on Logistics Server</div>
                                </div>
                                <div className="flex justify-between items-center text-sm text-gray-300">
                                    <span>Blue Team AI Agent</span>
                                    <span className="text-blue-500 font-bold">DEFENDING</span>
                                </div>
                                <div className="space-y-2 my-4">
                                    <div className="h-2 bg-gray-700 rounded overflow-hidden">
                                        <div className="h-full bg-blue-600 w-2/3"></div>
                                    </div>
                                    <div className="text-xs text-gray-500">Action: Rerouting Traffic / Firewall Up</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 14.7 MATGEN FORGE */}
                {activeTab === 'material' && (
                    <div className="h-full grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-y-auto">
                        <div className="lg:col-span-2 bg-military-800 rounded-lg p-6 border border-military-700 flex flex-col h-[400px] lg:h-full">
                            <h3 className="font-bold text-white mb-4 flex items-center">
                                <Layers className="mr-2 text-orange-500" size={20} /> DeepMind GNoME Crystal Structure
                            </h3>
                            <div className="flex-1 bg-black rounded border border-orange-900/30 flex items-center justify-center relative overflow-hidden">
                                {/* Simulated 3D Crystal */}
                                <div className="relative w-48 h-48 animate-spin-slow">
                                    <div className="absolute inset-0 border border-orange-500/50 transform rotate-45"></div>
                                    <div className="absolute inset-4 border border-orange-500/50 transform rotate-12"></div>
                                    <div className="absolute inset-8 border border-orange-500/50 transform -rotate-12"></div>
                                    <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-orange-500 rounded-full shadow-[0_0_20px_orange]"></div>
                                    {[...Array(6)].map((_, i) => (
                                        <div key={i} className="absolute w-2 h-2 bg-white rounded-full" style={{
                                            top: `${50 + 40 * Math.sin(i)}%`,
                                            left: `${50 + 40 * Math.cos(i)}%`
                                        }}></div>
                                    ))}
                                </div>
                                <div className="absolute bottom-4 left-4 text-xs text-orange-300 font-mono">
                                    Structure: Hexagonal Close-Packed<br/>
                                    Stability: 99.98%
                                </div>
                            </div>
                        </div>
                        <div className="bg-military-800 rounded-lg p-6 border border-military-700 overflow-y-auto">
                            <h3 className="font-bold text-white mb-4 flex items-center"><Microscope className="mr-2 text-orange-500"/> Candidate Materials</h3>
                            <div className="space-y-3">
                                {materialCandidates.map((mat) => (
                                    <div key={mat.id} className="p-3 bg-military-900 rounded border border-military-600 hover:border-orange-500 transition-colors">
                                        <div className="flex justify-between mb-1">
                                            <span className="font-bold text-white text-sm">{mat.id}</span>
                                            <span className="text-[10px] bg-orange-900/30 text-orange-400 px-2 py-0.5 rounded">{mat.status}</span>
                                        </div>
                                        <div className="text-xs text-gray-400 mb-2">{mat.type} • {mat.property}</div>
                                        <div className="flex items-center space-x-2">
                                            <div className="flex-1 bg-gray-800 h-1.5 rounded-full">
                                                <div className="bg-orange-500 h-full rounded-full" style={{width: `${mat.score}%`}}></div>
                                            </div>
                                            <span className="text-[10px] text-orange-400">{mat.score}%</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default AINexusView;
