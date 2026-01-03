
import React, { useState } from 'react';
import { Shield, Target, Activity, Globe, Map, BookOpen, Clock, FileText, CheckCircle, Award, Crosshair, Users, ChevronRight, AlertTriangle, File, X, MessageSquare, ArrowUpRight, Plus, RefreshCw, BrainCircuit, Lightbulb, Anchor, Plane, Tent, List } from 'lucide-react';
import MetricCard from '../components/MetricCard';
import { useLanguage } from '../contexts/LanguageContext';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { recommendStrategy } from '../services/ollamaService';
import TaskList from '../components/TaskList';
import { Task } from '../types';

interface ChiefOfStaffViewProps {
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

const ChiefOfStaffView: React.FC<ChiefOfStaffViewProps> = ({ onBack }) => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<'command' | 'strategy' | 'directives'>('command');
    
    // Strategy AI Director State
    const [sitRep, setSitRep] = useState('');
    const [stratDomain, setStratDomain] = useState<'Land' | 'Air' | 'Naval' | 'Joint'>('Land');
    const [enemyProfile, setEnemyProfile] = useState('Conventional Force');
    const [isThinking, setIsThinking] = useState(false);
    const [strategyResult, setStrategyResult] = useState<any>(null);

    // Strategic Directives (Tasks)
    const [tasks, setTasks] = useState<Task[]>([
        { id: '1', title: 'Review Northern Sector Defense Plan', description: 'Assess 4th Mech Div readiness post-maneuvers.', dueDate: '2024-10-30', priority: 'high', status: 'in-progress', isCompleted: false },
        { id: '2', title: 'Authorize Logistics Budget Adjustment', description: 'Emergency fuel allocation for Air Force operations.', dueDate: '2024-10-25', priority: 'medium', status: 'pending', isCompleted: false },
        { id: '3', title: 'Intelligence Briefing: Horn of Africa', description: 'Review weekly INSA report on regional actors.', dueDate: '2024-10-26', priority: 'high', status: 'pending', isCompleted: false }
    ]);

    const handleAddTask = () => {
        const newTask: Task = {
            id: Date.now().toString(),
            title: 'New Strategic Directive',
            description: 'Enter directive details...',
            dueDate: new Date().toISOString().split('T')[0],
            priority: 'medium',
            status: 'pending',
            isCompleted: false
        };
        setTasks([newTask, ...tasks]);
    };

    const handleUpdateTask = (updatedTask: Task) => {
        setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    };

    const handleDeleteTask = (id: string) => {
        setTasks(prev => prev.filter(t => t.id !== id));
    };

    const handleToggleTask = (id: string) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, isCompleted: !t.isCompleted, status: !t.isCompleted ? 'completed' : 'in-progress' } : t));
    };

    // Mock Data for Readiness Radar
    const readinessData = [
        { subject: 'Personnel', A: 95, fullMark: 100 },
        { subject: 'Equipment', A: 88, fullMark: 100 },
        { subject: 'Logistics', A: 92, fullMark: 100 },
        { subject: 'Intel', A: 98, fullMark: 100 },
        { subject: 'Cyber', A: 85, fullMark: 100 },
        { subject: 'Morale', A: 90, fullMark: 100 },
    ];

    const capabilityData = [
        { name: 'Power Projection', current: 65, target: 85 },
        { name: 'Cyber Defense', current: 78, target: 95 },
        { name: 'Rapid Response', current: 82, target: 90 },
        { name: 'Joint Ops', current: 70, target: 100 },
    ];

    const [insights, setInsights] = useState([
        { id: 'INS-044', source: 'Sgt. Kebede (3rd Div)', text: 'Rations quality in Sector 4 deteriorating. Morale impact observed.', severity: 'High', status: 'Pending' },
        { id: 'INS-045', source: 'Lt. Sarah (Signals)', text: 'New radio encryption protocols causing lag in remote outposts.', severity: 'Medium', status: 'Pending' },
        { id: 'INS-042', source: 'Cpl. Dawit (Eng)', text: 'Bridge structural weakness detected near Supply Route B.', severity: 'Critical', status: 'Actioned' },
    ]);

    const handleActionInsight = (id: string) => {
        setInsights(prev => prev.map(ins => ins.id === id ? { ...ins, status: 'Actioned' } : ins));
    };

    const handleGenerateStrategy = async () => {
        if (!sitRep.trim()) return;
        setIsThinking(true);
        setStrategyResult(null);
        
        try {
            const result = await recommendStrategy(sitRep, stratDomain, enemyProfile);
            setStrategyResult(result);
        } catch (e) {
            console.error(e);
        }
        setIsThinking(false);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 flex flex-col h-[calc(100vh-140px)]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2 flex-shrink-0">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight font-display">{t('cogs_title')}</h2>
                    <p className="text-gray-400 text-sm font-sans">{t('cogs_subtitle')}</p>
                </div>
                
                <div className="mt-4 md:mt-0 bg-military-800 p-1 rounded-lg border border-military-700 flex flex-wrap gap-1">
                    <button 
                        onClick={() => setActiveTab('command')}
                        className={`px-4 py-1.5 text-xs font-bold rounded flex items-center transition-all ${activeTab === 'command' ? 'bg-military-accent text-white shadow' : 'text-gray-400 hover:text-white'}`}
                    >
                        <Shield size={14} className="mr-2"/> {t('cogs_tab_command')}
                    </button>
                    <button 
                        onClick={() => setActiveTab('directives')}
                        className={`px-4 py-1.5 text-xs font-bold rounded flex items-center transition-all ${activeTab === 'directives' ? 'bg-green-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                    >
                        <List size={14} className="mr-2"/> {t('cogs_tab_directives')}
                    </button>
                    <button 
                        onClick={() => setActiveTab('strategy')}
                        className={`px-4 py-1.5 text-xs font-bold rounded flex items-center transition-all ${activeTab === 'strategy' ? 'bg-purple-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                    >
                        <BrainCircuit size={14} className="mr-2"/> AI STRATEGY DIRECTOR
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

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-shrink-0">
                <MetricCard title={t('cogs_metric_readiness')} value="91.2%" change={0.8} icon={Activity} color="success" />
                <MetricCard title={t('cogs_metric_ops')} value="14" change={2} icon={Crosshair} color="danger" />
                <MetricCard title="Strategy Models" value="Active" icon={BookOpen} color="purple" />
                <MetricCard title={t('cogs_metric_partners')} value="8 Active" icon={Globe} color="accent" />
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto relative">
                
                {/* 10.1 Professional Military Command Dashboard */}
                {activeTab === 'command' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                        
                        {/* Operations Command Interface */}
                        <div className="bg-military-800 rounded-lg p-6 border border-military-700 flex flex-col min-h-[400px]">
                            <h3 className="font-semibold text-lg text-white mb-4 flex items-center">
                                <Target className="mr-2 text-red-500" size={20} /> {t('cogs_ops_interface')}
                            </h3>
                            <div className="flex-1 space-y-3 overflow-y-auto pr-2">
                                <div className="p-3 bg-military-900 rounded border-l-4 border-green-500 flex justify-between items-center group hover:bg-military-800 transition-colors">
                                    <div>
                                        <h4 className="text-sm font-bold text-white">Op. Highland Secure</h4>
                                        <p className="text-xs text-gray-400">Sector North • 4th Mech Div</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-green-400 font-bold mb-1">92% Success Prob.</div>
                                        <span className="text-[10px] bg-green-900/50 text-green-300 px-2 py-0.5 rounded">ACTIVE</span>
                                    </div>
                                </div>
                                <div className="p-3 bg-military-900 rounded border-l-4 border-yellow-500 flex justify-between items-center group hover:bg-military-800 transition-colors">
                                    <div>
                                        <h4 className="text-sm font-bold text-white">Op. Desert Watch</h4>
                                        <p className="text-xs text-gray-400">Sector East • 12th Bde</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-yellow-400 font-bold mb-1">Resource Allocation</div>
                                        <span className="text-[10px] bg-yellow-900/50 text-yellow-300 px-2 py-0.5 rounded">PLANNING</span>
                                    </div>
                                </div>
                                <div className="p-3 bg-military-900 rounded border-l-4 border-blue-500 flex justify-between items-center group hover:bg-military-800 transition-colors">
                                    <div>
                                        <h4 className="text-sm font-bold text-white">Op. Blue Shield</h4>
                                        <p className="text-xs text-gray-400">Air Defense Zone • GERD</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-blue-400 font-bold mb-1">100% Coverage</div>
                                        <span className="text-[10px] bg-blue-900/50 text-blue-300 px-2 py-0.5 rounded">PATROL</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-6">
                            {/* Readiness Management System */}
                            <div className="bg-military-800 rounded-lg p-6 border border-military-700 flex flex-col h-[300px]">
                                <h3 className="font-semibold text-lg text-white mb-4 flex items-center">
                                    <Activity className="mr-2 text-green-500" size={20} /> {t('cogs_readiness_mgmt')}
                                </h3>
                                <div className="flex-1 w-full relative">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={readinessData}>
                                            <PolarGrid stroke="#334155" />
                                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                            <Radar name="Current Status" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
                                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                    <div className="absolute top-0 right-0 p-2 bg-black/40 rounded border border-red-500/30 flex items-center">
                                        <AlertTriangle size={12} className="text-red-500 mr-2" />
                                        <span className="text-[10px] text-red-300">Cyber Resilience: Low</span>
                                    </div>
                                </div>
                            </div>

                            {/* Field Insight Triage */}
                            <div className="bg-military-800 rounded-lg p-6 border border-military-700 flex flex-col flex-1 min-h-[300px]">
                                <h3 className="font-semibold text-lg text-white mb-4 flex items-center">
                                    <MessageSquare className="mr-2 text-purple-500" size={20} /> Field Insight Triage (Sec 3.3)
                                </h3>
                                <div className="flex-1 space-y-3 overflow-y-auto">
                                    {insights.map(ins => (
                                        <div key={ins.id} className="bg-military-900 p-3 rounded border border-military-600">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${ins.severity === 'Critical' ? 'bg-red-900 text-red-300' : ins.severity === 'High' ? 'bg-yellow-900 text-yellow-300' : 'bg-blue-900 text-blue-300'}`}>
                                                    {ins.severity}
                                                </span>
                                                <span className="text-[10px] text-gray-500">{ins.source}</span>
                                            </div>
                                            <p className="text-xs text-gray-300 mb-2 italic">"{ins.text}"</p>
                                            <div className="flex justify-end">
                                                {ins.status === 'Pending' ? (
                                                    <button 
                                                        onClick={() => handleActionInsight(ins.id)}
                                                        className="bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-bold px-3 py-1 rounded flex items-center"
                                                    >
                                                        <ArrowUpRight size={10} className="mr-1" /> APPROVE FOR ACTION
                                                    </button>
                                                ) : (
                                                    <span className="text-[10px] text-green-500 flex items-center">
                                                        <CheckCircle size={10} className="mr-1" /> ACTION TRACKED
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* DIRECTIVES TRACKER */}
                {activeTab === 'directives' && (
                    <div className="bg-military-800 rounded-lg p-6 border border-military-700 flex flex-col h-full">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-semibold text-lg text-white flex items-center">
                                <List className="mr-2 text-green-500" size={20} /> {t('cogs_task_title')}
                            </h3>
                            <button 
                                onClick={handleAddTask}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-xs font-bold flex items-center"
                            >
                                <Plus size={14} className="mr-2" /> ADD DIRECTIVE
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            <TaskList 
                                tasks={tasks} 
                                onDelete={handleDeleteTask} 
                                onUpdate={handleUpdateTask} 
                                onToggle={handleToggleTask} 
                            />
                        </div>
                    </div>
                )}

                {/* 10.2 AI Strategy Director */}
                {activeTab === 'strategy' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full overflow-y-auto lg:overflow-hidden">
                        
                        {/* Input Panel */}
                        <div className="w-full lg:col-span-1 bg-military-800 rounded-lg p-6 border border-military-700 flex flex-col h-auto lg:h-full">
                            <h3 className="font-bold text-white text-lg font-display mb-6 flex items-center">
                                <BrainCircuit className="mr-2 text-purple-500" /> AI Strategy Director
                            </h3>
                            
                            <div className="space-y-6 flex-1 overflow-y-auto">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 block mb-2">OPERATIONAL DOMAIN</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        <button onClick={() => setStratDomain('Land')} className={`p-2 rounded border flex flex-col items-center justify-center transition-all ${stratDomain === 'Land' ? 'bg-green-600 border-green-400 text-white' : 'bg-military-900 border-military-600 text-gray-400 hover:text-white'}`}>
                                            <Tent size={16} className="mb-1"/>
                                            <span className="text-[10px]">LAND</span>
                                        </button>
                                        <button onClick={() => setStratDomain('Air')} className={`p-2 rounded border flex flex-col items-center justify-center transition-all ${stratDomain === 'Air' ? 'bg-cyan-600 border-cyan-400 text-white' : 'bg-military-900 border-military-600 text-gray-400 hover:text-white'}`}>
                                            <Plane size={16} className="mb-1"/>
                                            <span className="text-[10px]">AIR</span>
                                        </button>
                                        <button onClick={() => setStratDomain('Naval')} className={`p-2 rounded border flex flex-col items-center justify-center transition-all ${stratDomain === 'Naval' ? 'bg-blue-600 border-blue-400 text-white' : 'bg-military-900 border-military-600 text-gray-400 hover:text-white'}`}>
                                            <Anchor size={16} className="mb-1"/>
                                            <span className="text-[10px]">NAVAL</span>
                                        </button>
                                        <button onClick={() => setStratDomain('Joint')} className={`p-2 rounded border flex flex-col items-center justify-center transition-all ${stratDomain === 'Joint' ? 'bg-purple-600 border-purple-400 text-white' : 'bg-military-900 border-military-600 text-gray-400 hover:text-white'}`}>
                                            <Users size={16} className="mb-1"/>
                                            <span className="text-[10px]">JOINT</span>
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-400 block mb-2">ENEMY PROFILE</label>
                                    <select 
                                        value={enemyProfile} 
                                        onChange={(e) => setEnemyProfile(e.target.value)}
                                        className="w-full bg-military-900 border border-military-600 rounded p-3 text-white text-sm focus:border-purple-500 outline-none"
                                    >
                                        <option>Conventional Force (State Actor)</option>
                                        <option>Insurgent / Guerilla</option>
                                        <option>Hybrid / Asymmetric</option>
                                        <option>Terrorist Cell</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-400 block mb-2">SITUATION REPORT</label>
                                    <textarea 
                                        value={sitRep}
                                        onChange={(e) => setSitRep(e.target.value)}
                                        className="w-full h-40 bg-military-900 border border-military-600 rounded p-3 text-white text-sm focus:border-purple-500 outline-none resize-none"
                                        placeholder="Describe the tactical situation (e.g., 'Enemy digging in at key mountain pass, heavy artillery support')..."
                                    />
                                </div>

                                <button 
                                    onClick={handleGenerateStrategy}
                                    disabled={isThinking || !sitRep}
                                    className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded shadow-lg flex items-center justify-center disabled:opacity-50"
                                >
                                    {isThinking ? <RefreshCw className="animate-spin mr-2" /> : <Lightbulb className="mr-2" />} 
                                    GENERATE STRATEGY
                                </button>
                            </div>
                        </div>

                        {/* Result Panel */}
                        <div className="lg:col-span-2 bg-[#0b1120] rounded-lg border border-military-700 p-8 overflow-y-auto relative h-auto lg:h-full min-h-[500px]">
                            {/* Background Pattern */}
                            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#a855f7 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

                            {!strategyResult && !isThinking && (
                                <div className="flex flex-col items-center justify-center h-full text-gray-600">
                                    <BrainCircuit size={64} className="mb-4 opacity-20" />
                                    <p className="text-sm font-mono uppercase tracking-widest">Awaiting Command Input...</p>
                                </div>
                            )}

                            {isThinking && (
                                <div className="flex flex-col items-center justify-center h-full text-purple-500">
                                    <RefreshCw size={48} className="mb-4 animate-spin" />
                                    <p className="text-sm font-mono uppercase tracking-widest animate-pulse">Consulting Military Doctrine...</p>
                                </div>
                            )}

                            {strategyResult && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                                    <div className="border-l-4 border-purple-500 pl-6">
                                        <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Recommended Course of Action</span>
                                        <h2 className="text-3xl font-bold text-white mt-1 font-display">
                                            <SafeRender content={strategyResult.recommended_strategy} />
                                        </h2>
                                        <div className="text-gray-300 mt-4 text-sm leading-relaxed">
                                            <SafeRender content={strategyResult.rationale} />
                                        </div>
                                    </div>

                                    {strategyResult.principle_application && (
                                        <div>
                                            <h4 className="text-sm font-bold text-white uppercase mb-4 flex items-center"><CheckCircle size={16} className="mr-2 text-green-500"/> Principles of War Applied</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                {strategyResult.principle_application.map((p: any, idx: number) => (
                                                    <div key={idx} className="bg-military-900/50 p-4 rounded border border-military-600">
                                                        <span className="text-purple-400 font-bold block mb-1 text-sm"><SafeRender content={p.principle} /></span>
                                                        <p className="text-xs text-gray-400"><SafeRender content={p.application} /></p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {strategyResult.operational_approach && (
                                        <div>
                                            <h4 className="text-sm font-bold text-white uppercase mb-4 flex items-center"><Activity size={16} className="mr-2 text-blue-500"/> Operational Phases</h4>
                                            <div className="space-y-4 relative pl-4 border-l border-military-600 ml-2">
                                                {strategyResult.operational_approach.map((step: any, idx: number) => (
                                                    <div key={idx} className="relative">
                                                        <div className="absolute -left-[21px] top-1.5 w-3 h-3 bg-blue-500 rounded-full border-2 border-[#0b1120]"></div>
                                                        <h5 className="text-sm font-bold text-blue-400"><SafeRender content={step.phase} /></h5>
                                                        <p className="text-sm text-gray-300 mt-1"><SafeRender content={step.action} /></p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default ChiefOfStaffView;
