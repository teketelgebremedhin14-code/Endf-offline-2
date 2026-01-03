
import React, { useState, useRef, useEffect } from 'react';
import { Shield, Map, Activity, Users, Settings, Target, Layers, Truck, Zap, Globe, HardHat, Flag, AlertTriangle, CheckCircle, PenTool, TrendingUp, User, ChevronDown, ChevronRight, Edit3, Mic, Radio, StopCircle, BarChart2, X } from 'lucide-react';
import MetricCard from '../components/MetricCard';
import { useLanguage } from '../contexts/LanguageContext';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, RadarChart, PolarGrid, PolarAngleAxis, Radar, PieChart, Pie, Cell } from 'recharts';
import { analyzeCombatAudio } from '../services/ollamaService';

// Helper to safely render AI text that might be returned as an object
const SafeRender = ({ content }: { content: any }) => {
    if (typeof content === 'string' || typeof content === 'number') return <>{content}</>;
    if (typeof content === 'object' && content !== null) {
        return <>{JSON.stringify(content)}</>;
    }
    return null;
};

interface OrgNodeProps {
    label: string;
    role: string;
    level?: string;
    status?: 'Active' | 'Reserve' | 'Training' | 'Transit' | 'Engaged';
    children?: React.ReactNode;
    defaultOpen?: boolean;
}

const OrgNode: React.FC<OrgNodeProps> = ({ label, role, level, status, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    
    const getLevelColor = (l?: string) => {
        switch(l) {
            case 'Command': return 'border-l-purple-500';
            case 'Division': return 'border-l-blue-500';
            case 'Brigade': return 'border-l-green-500';
            case 'Battalion': return 'border-l-yellow-500';
            default: return 'border-l-gray-500';
        }
    };

    return (
        <div className={`ml-4 border-l-2 ${getLevelColor(level)} pl-4 py-2 relative animate-in slide-in-from-left-2`}>
            <div 
                className="flex items-center cursor-pointer hover:bg-military-800 p-2 rounded transition-colors group"
                onClick={() => setIsOpen(!isOpen)}
            >
                {children ? (
                    isOpen ? <ChevronDown size={14} className="mr-2 text-gray-500" /> : <ChevronRight size={14} className="mr-2 text-gray-500" />
                ) : <div className="w-5 mr-2"></div>}
                
                <div className="flex-1 min-h-0">
                    <div className="flex flex-wrap justify-between items-center gap-2">
                        <div className="flex items-center min-w-0">
                            {level && <span className="text-[9px] uppercase font-bold text-gray-500 mr-2 bg-black/30 px-1 rounded">{level}</span>}
                            <div className="text-sm font-bold text-white group-hover:text-green-400 truncate">{label}</div>
                        </div>
                        {status && (
                            <span className={`text-[9px] px-2 py-0.5 rounded font-mono uppercase whitespace-nowrap ${
                                status === 'Active' ? 'bg-green-900/30 text-green-400' :
                                status === 'Engaged' ? 'bg-red-900/30 text-red-400 animate-pulse' :
                                'bg-gray-700 text-gray-300'
                            }`}>{status}</span>
                        )}
                    </div>
                    <div className="text-[10px] text-gray-400 truncate flex items-center">
                        <User size={10} className="mr-1 inline" /> {role}
                    </div>
                </div>
            </div>
            {isOpen && children && (
                <div className="animate-in slide-in-from-top-2 fade-in duration-200">
                    {children}
                </div>
            )}
        </div>
    );
};

interface GroundForcesViewProps {
    onBack?: () => void;
}

const GroundForcesView: React.FC<GroundForcesViewProps> = ({ onBack }) => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<'strat_org' | 'capabilities' | 'ops_personnel' | 'future_ind' | 'sentinel'>('strat_org');

    // II. Inventory Data (Realistic estimates based on public defense databases)
    const armorStats = [
        { name: 'T-72/B1', count: 280, status: t('status_active') }, 
        { name: 'T-62', count: 120, status: t('status_reserve') },
        { name: 'T-55', count: 150, status: t('status_reserve') },
        { name: 'BMP-1/2', count: 800, status: t('status_active') },
        { name: 'ZSU-23-4', count: 60, status: t('status_active') },
    ];

    // V. Readiness Data
    const readinessMetrics = [
        { subject: t('reg_north'), A: 92, fullMark: 100 },
        { subject: t('reg_east'), A: 88, fullMark: 100 },
        { subject: t('reg_west'), A: 85, fullMark: 100 },
        { subject: t('reg_south'), A: 90, fullMark: 100 },
        { subject: t('reg_central'), A: 95, fullMark: 100 },
    ];

    // VI. Industry Data (DEIC Context)
    const industryData = [
        { name: 'Homicho (Ammo)', output: 95 },
        { name: 'Bishoftu (Vehicle)', output: 78 },
        { name: 'Gafat (Arms)', output: 85 },
    ];

    // Sentinel State
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [sentinelResult, setSentinelResult] = useState<any>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            chunksRef.current = [];
            
            mediaRecorderRef.current.ondataavailable = (e) => chunksRef.current.push(e.data);
            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                setAudioBlob(blob);
                handleAnalyzeAudio(blob);
            };
            
            mediaRecorderRef.current.start();
            setIsRecording(true);
            setSentinelResult(null);
        } catch (e) {
            console.error("Mic error", e);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
        }
    };

    const handleAnalyzeAudio = async (blob: Blob) => {
        setIsAnalyzing(true);
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
            const base64 = (reader.result as string).split(',')[1];
            const mime = blob.type; 
            const result = await analyzeCombatAudio(base64, mime);
            setSentinelResult(result);
            setIsAnalyzing(false);
        };
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 flex flex-col h-[calc(100vh-140px)]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2 flex-shrink-0">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight font-display">{t('ground_title')}</h2>
                    <p className="text-gray-400 text-sm font-sans">{t('ground_subtitle')} • Field Marshal Birhanu Jula</p>
                </div>
                
                <div className="mt-4 md:mt-0 flex flex-wrap gap-2 items-center">
                    <div className="bg-military-800 p-1 rounded-lg border border-military-700 flex flex-wrap gap-1">
                        <button 
                            onClick={() => setActiveTab('strat_org')}
                            className={`px-4 py-1.5 text-xs font-bold rounded flex items-center transition-all ${activeTab === 'strat_org' ? 'bg-green-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                        >
                            <Map size={14} className="mr-2"/> I. STRAT & ORG
                        </button>
                        <button 
                            onClick={() => setActiveTab('capabilities')}
                            className={`px-4 py-1.5 text-xs font-bold rounded flex items-center transition-all ${activeTab === 'capabilities' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                        >
                            <Shield size={14} className="mr-2"/> II. CAPABILITY
                        </button>
                        <button 
                            onClick={() => setActiveTab('ops_personnel')}
                            className={`px-4 py-1.5 text-xs font-bold rounded flex items-center transition-all ${activeTab === 'ops_personnel' ? 'bg-yellow-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                        >
                            <Users size={14} className="mr-2"/> III. OPS & PERS
                        </button>
                        <button 
                            onClick={() => setActiveTab('future_ind')}
                            className={`px-4 py-1.5 text-xs font-bold rounded flex items-center transition-all ${activeTab === 'future_ind' ? 'bg-purple-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                        >
                            <Settings size={14} className="mr-2"/> IV. FUT & IND
                        </button>
                        <button 
                            onClick={() => setActiveTab('sentinel')}
                            className={`px-4 py-1.5 text-xs font-bold rounded flex items-center transition-all ${activeTab === 'sentinel' ? 'bg-red-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                        >
                            <Radio size={14} className="mr-2"/> AI SENTINEL
                        </button>
                    </div>
                    {onBack && (
                        <button onClick={onBack} className="p-2 text-gray-400 hover:text-white hover:bg-military-700 rounded transition-colors" title="Exit / Back">
                            <X size={20} />
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-shrink-0">
                <MetricCard title={t('ground_metric_troops')} value="~150k" change={0.8} icon={Users} color="success" />
                <MetricCard title="Divisions" value="24+" icon={Layers} />
                <MetricCard title="Heavy Armor" value="~550" icon={Shield} color="warning" />
                <MetricCard title={t('ground_metric_readiness')} value="High" change={1.2} icon={Activity} color="accent" />
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto relative">
                
                {/* TAB 1: STRATEGY & ORGANIZATION */}
                {activeTab === 'strat_org' && (
                    <div className="h-full grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-y-auto lg:overflow-hidden">
                        {/* Interactive Map */}
                        <div className="lg:col-span-2 bg-[#0f172a] rounded-lg border border-military-700 relative overflow-hidden flex flex-col min-h-[400px]">
                            <div className="absolute top-4 left-4 z-10 bg-black/60 px-3 py-1 rounded border-l-2 border-green-500">
                                <h4 className="text-xs font-bold text-green-400">REGIONAL COMMANDS</h4>
                                <p className="text-[10px] text-gray-400">Territorial Defense Sectors</p>
                            </div>
                            
                            <svg viewBox="0 0 800 600" className="w-full h-full opacity-80">
                                <path d="M 200 100 L 500 80 L 600 200 L 500 500 L 200 550 L 100 300 Z" fill="#1e293b" stroke="#334155" strokeWidth="2" />
                                
                                {/* Sectors */}
                                <circle cx="350" cy="180" r="40" fill="#eab308" opacity="0.2" /> {/* North */}
                                <text x="330" y="185" fill="#eab308" fontSize="12" fontWeight="bold">NORTH</text>
                                
                                <circle cx="500" cy="300" r="40" fill="#22c55e" opacity="0.2" /> {/* East */}
                                <text x="480" y="305" fill="#22c55e" fontSize="12" fontWeight="bold">EAST</text>
                                
                                <circle cx="200" cy="300" r="30" fill="#3b82f6" opacity="0.2" /> {/* West */}
                                <text x="180" y="305" fill="#3b82f6" fontSize="12" fontWeight="bold">WEST</text>
                                
                                <circle cx="350" cy="450" r="30" fill="#ef4444" opacity="0.2" /> {/* South */}
                                <text x="330" y="455" fill="#ef4444" fontSize="12" fontWeight="bold">SOUTH</text>
                                
                                <circle cx="350" cy="300" r="20" fill="#a855f7" opacity="0.2" /> {/* Central */}
                                <text x="330" y="305" fill="#a855f7" fontSize="10" fontWeight="bold">HQ</text>
                            </svg>
                        </div>

                        {/* Order of Battle Tree */}
                        <div className="bg-military-800 rounded-lg p-6 border border-military-700 flex flex-col h-auto">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-white text-sm uppercase flex items-center">
                                    <Layers className="mr-2 text-green-500" size={16}/> Order of Battle
                                </h3>
                                <button className="text-[10px] flex items-center bg-military-900 px-2 py-1 rounded text-gray-300 hover:text-white border border-military-600 hover:border-gray-400">
                                    <Edit3 size={10} className="mr-1"/> Edit Structure
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto pr-2 max-h-[600px]">
                                <OrgNode label="Ground Forces Command" role="FM Birhanu Jula" level="Command" defaultOpen={true} status="Active">
                                    <OrgNode label={t('reg_north')} role="Lt. Gen. [Redacted]" level="Command" status="Active">
                                        <OrgNode label="4th Mechanized Division" role="Brig. Gen. [Redacted]" level="Division" status="Active" />
                                        <OrgNode label="11th Infantry Division" role="Col. [Redacted]" level="Division" status="Reserve" />
                                    </OrgNode>
                                    <OrgNode label={t('reg_east')} role="Maj. Gen. [Redacted]" level="Command" status="Engaged">
                                        <OrgNode label="Somalia Task Force" role="Col. [Redacted]" level="Battalion" status="Engaged" />
                                    </OrgNode>
                                    <OrgNode label="Republican Guard" role="Elite Protection" level="Brigade" status="Active" />
                                </OrgNode>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 2: CAPABILITIES */}
                {activeTab === 'capabilities' && (
                    <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto lg:overflow-hidden">
                        <div className="bg-military-800 rounded-lg p-6 border border-military-700 h-96 lg:h-auto">
                            <h3 className="font-semibold text-lg text-white mb-6 flex items-center">
                                <Shield className="mr-2 text-blue-500" size={20}/> Armor & Mechanized Inventory
                            </h3>
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={armorStats} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" />
                                        <XAxis type="number" stroke="#94a3b8" fontSize={10} />
                                        <YAxis dataKey="name" type="category" width={80} stroke="#94a3b8" fontSize={11} />
                                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} cursor={{fill: 'transparent'}} />
                                        <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-4 p-3 bg-military-900 rounded border border-military-600 text-xs text-gray-400">
                                <strong>Modernization Status:</strong> T-72 fleet currently undergoing upgrades at Bishoftu. Shift towards wheel-based IFVs for mobility.
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-military-800 rounded-lg p-6 border border-military-700">
                                <h3 className="font-semibold text-lg text-white mb-4 flex items-center">
                                    <Zap className="mr-2 text-yellow-500" size={20}/> Key Enablers
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center p-3 bg-military-900 rounded border border-military-600">
                                        <div>
                                            <h4 className="text-sm font-bold text-white">Artillery</h4>
                                            <p className="text-xs text-gray-400">BM-21 Grad / 122mm / 155mm</p>
                                        </div>
                                        <span className="text-xs font-bold text-green-500">High Readiness</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-military-900 rounded border border-military-600">
                                        <div>
                                            <h4 className="text-sm font-bold text-white">Air Defense</h4>
                                            <p className="text-xs text-gray-400">Pantsir-S1 / ZU-23-2</p>
                                        </div>
                                        <span className="text-xs font-bold text-blue-500">Integrated</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-military-900 rounded border border-military-600">
                                        <div>
                                            <h4 className="text-sm font-bold text-white">UAV Integration</h4>
                                            <p className="text-xs text-gray-400">TB2 / Wing Loong / Akinci</p>
                                        </div>
                                        <span className="text-xs font-bold text-purple-500">Rapid Expansion</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 3: OPS & PERSONNEL */}
                {activeTab === 'ops_personnel' && (
                    <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto lg:overflow-hidden">
                        <div className="bg-military-800 rounded-lg p-6 border border-military-700 flex flex-col h-96 lg:h-auto">
                            <h3 className="font-semibold text-lg text-white mb-6 flex items-center">
                                <Activity className="mr-2 text-green-500" size={20}/> Readiness by Command
                            </h3>
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={readinessMetrics}>
                                        <PolarGrid stroke="#334155" />
                                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                        <Radar name="Status" dataKey="A" stroke="#22c55e" fill="#22c55e" fillOpacity={0.4} />
                                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-military-800 rounded-lg p-6 border border-military-700">
                            <h3 className="font-semibold text-lg text-white mb-4 flex items-center">
                                <Truck className="mr-2 text-yellow-500" size={20}/> Logistics & Sustainment
                            </h3>
                            <div className="space-y-4">
                                <div className="p-3 bg-military-900 rounded border-l-4 border-red-500">
                                    <h4 className="text-sm font-bold text-white">Challenge: "Tyranny of Terrain"</h4>
                                    <p className="text-xs text-gray-400 mt-1">Highland operations significantly impact fuel consumption and vehicle wear. Supply chains rely on singular arterial routes.</p>
                                </div>
                                <div className="p-3 bg-military-900 rounded border-l-4 border-green-500">
                                    <h4 className="text-sm font-bold text-white">Tooth-to-Tail Ratio</h4>
                                    <p className="text-xs text-gray-400 mt-1">Efficient combat arm deployment. Improving sustainment capabilities for expeditionary ops (e.g. Somalia).</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 4: FUTURE & INDUSTRY */}
                {activeTab === 'future_ind' && (
                    <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto lg:overflow-hidden">
                        <div className="bg-military-800 rounded-lg p-6 border border-military-700">
                            <h3 className="font-semibold text-lg text-white mb-6 flex items-center">
                                <HardHat className="mr-2 text-orange-500" size={20}/> Defense Industrial Base (DEIC)
                            </h3>
                            <div className="space-y-4">
                                {industryData.map((ind, idx) => (
                                    <div key={idx} className="flex flex-col space-y-1">
                                        <div className="flex justify-between text-xs text-gray-300">
                                            <span>{ind.name}</span>
                                            <span className="text-green-400">{ind.output}% Capacity</span>
                                        </div>
                                        <div className="w-full bg-military-900 rounded-full h-2">
                                            <div className="bg-orange-500 h-2 rounded-full" style={{width: `${ind.output}%`}}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-gray-400 mt-4 italic">Focus on self-reliance in munitions and vehicle maintenance to reduce import dependence.</p>
                        </div>

                        <div className="bg-military-800 rounded-lg p-6 border border-military-700 flex flex-col">
                            <h3 className="font-semibold text-lg text-white mb-4 flex items-center">
                                <TrendingUp className="mr-2 text-purple-500" size={20}/> Future Trajectory
                            </h3>
                            <div className="flex-1 space-y-4">
                                <div className="bg-military-900 p-4 rounded border border-military-600">
                                    <h4 className="text-sm font-bold text-purple-400 mb-2">Transformation Program</h4>
                                    <p className="text-xs text-gray-300">Shifting towards <strong>Network-Centric Warfare</strong>. Reducing reliance on heavy static formations in favor of mobile, modular brigades.</p>
                                </div>
                                <div className="bg-military-900 p-4 rounded border border-military-600">
                                    <h4 className="text-sm font-bold text-red-400 mb-2">Key Challenges</h4>
                                    <ul className="text-xs text-gray-300 list-disc pl-4 space-y-1">
                                        <li>Obsolescence of legacy Cold War era equipment.</li>
                                        <li>Budget constraints limiting rapid modernization.</li>
                                        <li>Adapting doctrine for hybrid/urban warfare scenarios.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 5: AI SENTINEL */}
                {activeTab === 'sentinel' && (
                    <div className="h-full flex flex-col items-center justify-center p-6 bg-military-800 rounded-lg border border-military-700 min-h-[400px] overflow-y-auto">
                        <div className="max-w-2xl w-full text-center space-y-8">
                            <div>
                                <h3 className="text-3xl font-bold text-white font-display mb-2 flex justify-center items-center">
                                    <Radio className="mr-3 text-red-500" size={32}/> AI COMMS SENTINEL
                                </h3>
                                <p className="text-gray-400">Real-time battlefield audio analysis. Detects stress, combat sounds, and tactical urgency.</p>
                            </div>

                            <div className="relative">
                                {isRecording ? (
                                    <div className="w-48 h-48 mx-auto rounded-full bg-red-900/20 border-4 border-red-500 flex items-center justify-center animate-pulse cursor-pointer shadow-[0_0_50px_#ef4444]" onClick={stopRecording}>
                                        <StopCircle size={64} className="text-red-500" />
                                    </div>
                                ) : (
                                    <div className="w-48 h-48 mx-auto rounded-full bg-gray-900 border-4 border-gray-700 flex items-center justify-center hover:bg-gray-800 cursor-pointer transition-all hover:scale-105" onClick={startRecording}>
                                        <Mic size={64} className="text-gray-400" />
                                    </div>
                                )}
                                <div className="mt-4 font-mono text-sm text-gray-500">
                                    {isRecording ? "LISTENING..." : "CLICK TO RECORD COMMS"}
                                </div>
                            </div>

                            {isAnalyzing && (
                                <div className="flex items-center justify-center space-x-2 text-yellow-500 font-mono">
                                    <Activity className="animate-spin" size={16} /> 
                                    <span>ANALYZING WAVEFORM SIGNATURE...</span>
                                </div>
                            )}

                            {sentinelResult && (
                                <div className="bg-military-900 border border-military-600 rounded-lg p-6 text-left animate-in fade-in slide-in-from-bottom-4">
                                    <div className="flex justify-between items-start mb-4">
                                        <h4 className="text-lg font-bold text-white font-display">TACTICAL ANALYSIS REPORT</h4>
                                        <span className={`text-xs px-2 py-1 rounded font-bold ${
                                            sentinelResult.voice_stress_level === 'High' || sentinelResult.voice_stress_level === 'Panic' ? 'bg-red-900/50 text-red-400' : 'bg-green-900/50 text-green-400'
                                        }`}>STRESS: <SafeRender content={sentinelResult.voice_stress_level} /></span>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div className="bg-black/30 p-3 rounded">
                                            <div className="text-xs text-gray-500 font-bold mb-1">DETECTED SOUNDS</div>
                                            <div className="flex flex-wrap gap-2">
                                                {sentinelResult.environment_sounds?.map((s: string, i: number) => (
                                                    <span key={i} className="text-xs bg-military-800 text-gray-300 px-2 py-1 rounded border border-gray-700"><SafeRender content={s} /></span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="bg-black/30 p-3 rounded">
                                            <div className="text-xs text-gray-500 font-bold mb-1">KEYWORDS</div>
                                            <div className="flex flex-wrap gap-2">
                                                {sentinelResult.keywords_detected?.map((k: string, i: number) => (
                                                    <span key={i} className="text-xs bg-blue-900/20 text-blue-300 px-2 py-1 rounded border border-blue-500/30"><SafeRender content={k} /></span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-yellow-900/10 p-4 rounded border border-yellow-500/30">
                                        <h5 className="text-xs font-bold text-yellow-500 mb-2">SITUATION SUMMARY</h5>
                                        <p className="text-sm text-gray-300 leading-relaxed font-mono"><SafeRender content={sentinelResult.summary} /></p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default GroundForcesView;
