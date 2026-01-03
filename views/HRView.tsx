
import React, { useState } from 'react';
import { Users, UserPlus, GraduationCap, FileBadge, Navigation, MapPin, BookOpen, Clock, ShieldCheck, Heart, User, ChevronDown, ChevronRight, BrainCircuit, TrendingUp, Target, Search, RefreshCw, AlertOctagon, TrendingDown, UserX, Activity, X } from 'lucide-react';
import MetricCard from '../components/MetricCard';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, RadarChart, PolarGrid, PolarAngleAxis, Radar, LineChart, Line, ComposedChart } from 'recharts';
import { useLanguage } from '../contexts/LanguageContext';
import { generateDynamicData, analyzePersonnelRisk } from '../services/ollamaService';

interface HRViewProps {
    onBack?: () => void;
}

const OrgNode = ({ label, role, children, expanded = false }: { label: string, role: string, children?: React.ReactNode, expanded?: boolean }) => {
    const [isOpen, setIsOpen] = useState(expanded);
    return (
        <div className="ml-6 border-l border-military-600 pl-4 py-2">
            <div 
                className="flex items-center cursor-pointer hover:text-military-accent transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                {children ? (
                    isOpen ? <ChevronDown size={14} className="mr-2 text-gray-500" /> : <ChevronRight size={14} className="mr-2 text-gray-500" />
                ) : <span className="w-5"></span>}
                <div className="flex items-center bg-military-900/50 px-3 py-2 rounded border border-military-700 hover:border-military-500">
                    <User size={14} className="mr-2 text-blue-400" />
                    <div>
                        <div className="text-xs font-bold text-white">{label}</div>
                        <div className="text-[10px] text-gray-400">{role}</div>
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

const HRView: React.FC<HRViewProps> = ({ onBack }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'overview' | 'org' | 'mobilization' | 'upas' | 'risk'>('overview');
  const [deploying, setDeploying] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState('3rd Infantry Division');
  const [selectedRegion, setSelectedRegion] = useState('North Command');
  
  // Dynamic UPAS State
  const [candidateName, setCandidateName] = useState('Maj. Dawit K.');
  const [talentData, setTalentData] = useState([
    { subject: 'Leadership', A: 120, fullMark: 150 },
    { subject: 'Tactics', A: 98, fullMark: 150 },
    { subject: 'Tech', A: 86, fullMark: 150 },
    { subject: 'Logistics', A: 99, fullMark: 150 },
    { subject: 'Diplomacy', A: 85, fullMark: 150 },
    { subject: 'Morale', A: 65, fullMark: 150 },
  ]);
  const [evalLoading, setEvalLoading] = useState(false);

  // Risk & Retention State
  const [riskLoading, setRiskLoading] = useState(false);
  const [riskData, setRiskData] = useState<any>(null);

  // Helper for safe rendering
  const safeRender = (content: any) => {
      if (typeof content === 'string' || typeof content === 'number') return content;
      if (typeof content === 'object' && content !== null) return JSON.stringify(content);
      return '';
  };

  // Data moved inside component to access translation keys
  const rankData = [
    { rank: t('hr_rank_gen'), count: 12 },
    { rank: t('hr_rank_ltgen'), count: 24 },
    { rank: t('hr_rank_majgen'), count: 48 },
    { rank: t('hr_rank_briggen'), count: 96 },
    { rank: t('hr_rank_col'), count: 450 },
    { rank: t('hr_rank_ltcol'), count: 1200 },
    { rank: t('hr_rank_maj'), count: 2500 },
    { rank: t('hr_rank_capt'), count: 5000 },
    { rank: t('hr_rank_lt'), count: 8000 },
    { rank: t('hr_rank_nco'), count: 45000 },
    { rank: t('hr_rank_enlisted'), count: 100000 },
  ];

  const retentionData = [
      { year: '2020', rate: 92 },
      { year: '2021', rate: 91 },
      { year: '2022', rate: 89 },
      { year: '2023', rate: 93 },
      { year: '2024', rate: 95 },
      { year: '2025 (Est)', rate: 96 },
  ];

  const handleDeploy = () => {
      setDeploying(true);
      setTimeout(() => {
          setDeploying(false);
          alert(`${t('hr_orders_issued')}: ${selectedUnit} ${t('hr_deploy_msg')} ${selectedRegion}.`);
      }, 2000);
  };

  const handleEvaluateCandidate = async () => {
      setEvalLoading(true);
      const prompt = `Generate a leadership evaluation profile for military officer ${candidateName}. 
      Context: Ethiopian National Defense Force. Rank: Major. Experience: 10 Years.`;
      
      const schema = `Array of objects: { subject: string (e.g. Leadership, Tactics, etc), A: number (0-150), fullMark: 150 }`;
      
      const data = await generateDynamicData(prompt, schema);
      if (Array.isArray(data) && data.length > 0) {
          setTalentData(data);
      }
      setEvalLoading(false);
  };

  const handleRiskAnalysis = async () => {
      setRiskLoading(true);
      const metrics = {
          deployment_tempo: "High (3 rotations in 24 months)",
          pay_status: "Regular",
          incident_reports: 12,
          unit_morale: "Moderate"
      };
      
      const data = await analyzePersonnelRisk(selectedUnit, metrics);
      setRiskData(data);
      setRiskLoading(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 flex flex-col h-[calc(100vh-140px)]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2 flex-shrink-0">
         <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">{t('hr_title')}</h2>
          <p className="text-gray-400 text-sm">{t('hr_subtitle')}</p>
        </div>
        <div className="flex flex-wrap gap-2 mt-4 md:mt-0 items-center">
            <div className="flex flex-wrap gap-1 bg-military-800 p-1 rounded-lg border border-military-700">
                <button onClick={() => setActiveTab('overview')} className={`px-3 py-1.5 text-xs font-bold rounded ${activeTab === 'overview' ? 'bg-blue-600 text-white' : 'bg-military-800 text-gray-400'}`}>OVERVIEW</button>
                <button onClick={() => setActiveTab('upas')} className={`px-3 py-1.5 text-xs font-bold rounded flex items-center ${activeTab === 'upas' ? 'bg-purple-600 text-white' : 'bg-military-800 text-gray-400'}`}>
                    <BrainCircuit size={12} className="mr-1" /> {t('hr_tab_upas')}
                </button>
                <button onClick={() => setActiveTab('risk')} className={`px-3 py-1.5 text-xs font-bold rounded flex items-center ${activeTab === 'risk' ? 'bg-red-600 text-white' : 'bg-military-800 text-gray-400'}`}>
                    <AlertOctagon size={12} className="mr-1" /> RISK
                </button>
                <button onClick={() => setActiveTab('org')} className={`px-3 py-1.5 text-xs font-bold rounded ${activeTab === 'org' ? 'bg-blue-600 text-white' : 'bg-military-800 text-gray-400'}`}>CHAIN</button>
                <button onClick={() => setActiveTab('mobilization')} className={`px-3 py-1.5 text-xs font-bold rounded ${activeTab === 'mobilization' ? 'bg-blue-600 text-white' : 'bg-military-800 text-gray-400'}`}>MOBILIZATION</button>
            </div>
            {onBack && (
                <button onClick={onBack} className="p-2 text-gray-400 hover:text-white hover:bg-military-700 rounded transition-colors" title="Exit / Back">
                    <X size={20} />
                </button>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-shrink-0">
        <MetricCard title={t('hr_total_strength')} value="~162,000" change={0.5} icon={Users} />
        <MetricCard title={t('hr_new_recruits')} value="20,000/yr" change={12} icon={UserPlus} color="success" />
        <MetricCard title={t('hr_active_term')} value="7 Yrs" icon={Clock} color="warning" />
        <MetricCard title={t('hr_promotions')} value="Major 2025" icon={FileBadge} />
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
          {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full overflow-y-auto lg:overflow-hidden">
                  {/* Rank Distribution Chart */}
                  <div className="bg-military-800 rounded-lg p-6 border border-military-700">
                      <h3 className="font-semibold text-lg text-white mb-4">{t('hr_rank_dist')}</h3>
                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={rankData} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" />
                                <XAxis type="number" stroke="#94a3b8" />
                                <YAxis dataKey="rank" type="category" width={100} stroke="#94a3b8" fontSize={11} />
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} cursor={{fill: 'transparent'}} />
                                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={15} />
                            </BarChart>
                        </ResponsiveContainer>
                      </div>
                  </div>

                  {/* Regulatory Quick Ref */}
                  <div className="bg-military-800 rounded-lg border border-military-700 overflow-hidden flex flex-col">
                      <div className="p-4 bg-military-900 border-b border-military-700 flex justify-between">
                          <h3 className="font-semibold text-white flex items-center">
                              <BookOpen size={16} className="mr-2 text-military-accent"/> {t('hr_reg_ref')}
                          </h3>
                      </div>
                      <div className="p-4 space-y-3 flex-1 overflow-y-auto">
                          <div className="p-3 bg-military-900 rounded border border-military-600 group hover:border-military-accent transition-colors">
                              <div className="flex justify-between items-center mb-1">
                                  <span className="text-xs font-bold text-white group-hover:text-military-accent flex items-center"><Clock size={12} className="mr-1"/> {t('hr_annual_leave')}</span>
                                  <span className="text-[10px] text-gray-500">Reg 460/2019 Art. 34</span>
                              </div>
                              <p className="text-xs text-gray-400">{t('hr_entitlement')} <span className="text-white font-mono font-bold">38 {t('hr_consecutive_days')}</span> {t('hr_with_pay')}.</p>
                          </div>
                           <div className="p-3 bg-military-900 rounded border border-military-600 group hover:border-military-accent transition-colors">
                              <div className="flex justify-between items-center mb-1">
                                  <span className="text-xs font-bold text-white group-hover:text-military-accent flex items-center"><ShieldCheck size={12} className="mr-1"/> {t('hr_retirement_age')}</span>
                                  <span className="text-[10px] text-gray-500">Proc 1100/2019 Art. 10</span>
                              </div>
                              <div className="grid grid-cols-3 gap-2 text-xs text-gray-400 mt-1">
                                  <div className="bg-military-800 p-1 rounded text-center">
                                      <span className="block text-[9px] text-gray-500">Lt-Capt</span>
                                      <span className="text-white font-bold">48 Yrs</span>
                                  </div>
                                  <div className="bg-military-800 p-1 rounded text-center">
                                      <span className="block text-[9px] text-gray-500">Maj-Col</span>
                                      <span className="text-white font-bold">52 Yrs</span>
                                  </div>
                                  <div className="bg-military-800 p-1 rounded text-center">
                                      <span className="block text-[9px] text-gray-500">General</span>
                                      <span className="text-white font-bold">55 Yrs</span>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          )}

          {/* RISK & RETENTION ANALYTICS */}
          {activeTab === 'risk' && (
              <div className="h-full flex flex-col gap-6 overflow-y-auto">
                  <div className="bg-military-800 rounded-lg p-6 border border-military-700">
                      <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
                          <h3 className="font-semibold text-lg text-white flex items-center">
                              <AlertOctagon className="mr-2 text-red-500" size={20} /> Predictive Risk & Retention Modeling
                          </h3>
                          <div className="flex gap-2">
                              <select 
                                  value={selectedUnit} 
                                  onChange={(e) => setSelectedUnit(e.target.value)}
                                  className="bg-military-900 border border-military-600 rounded px-2 py-1 text-xs text-white"
                              >
                                  <option>3rd Infantry Division</option>
                                  <option>4th Mechanized</option>
                                  <option>Air Wing Tech Corps</option>
                              </select>
                              <button 
                                  onClick={handleRiskAnalysis}
                                  disabled={riskLoading}
                                  className="bg-red-600 hover:bg-red-700 text-white text-xs px-4 py-1 rounded flex items-center disabled:opacity-50"
                              >
                                  {riskLoading ? <RefreshCw className="animate-spin mr-1" size={12}/> : <Activity className="mr-1" size={12}/>}
                                  RUN ANALYSIS
                              </button>
                          </div>
                      </div>

                      {!riskData && !riskLoading && (
                          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                              <Target size={48} className="mb-2 opacity-20" />
                              <p className="text-sm">Select unit and run analysis to view predictive models.</p>
                          </div>
                      )}

                      {riskData && (
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in slide-in-from-bottom-4">
                              
                              {/* Retention Forecast */}
                              <div className="bg-military-900 rounded-lg p-4 border border-military-600">
                                  <h4 className="text-sm font-bold text-white mb-4 flex items-center">
                                      <TrendingDown className="mr-2 text-blue-400" size={16} /> 6-Month Retention Forecast
                                  </h4>
                                  <div className="h-56 w-full">
                                      <ResponsiveContainer width="100%" height="100%">
                                          <ComposedChart data={riskData.retention_forecast}>
                                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                                              <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} />
                                              <YAxis domain={[80, 100]} stroke="#94a3b8" fontSize={10} />
                                              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                                              <Bar dataKey="rate" fill="#3b82f6" barSize={20} opacity={0.6} />
                                              <Line type="monotone" dataKey="rate" stroke="#60a5fa" strokeWidth={2} dot={{r:4}} />
                                          </ComposedChart>
                                      </ResponsiveContainer>
                                  </div>
                                  <div className="mt-2 text-xs text-gray-400 p-2 bg-black/20 rounded">
                                      <span className="font-bold text-blue-400">KEY DRIVER:</span> {safeRender(riskData.retention_forecast?.[riskData.retention_forecast?.length-1]?.risk_factor)}
                                  </div>
                              </div>

                              {/* Misconduct Risk Identifiers */}
                              <div className="flex flex-col">
                                  <div className="bg-military-900 rounded-lg p-4 border border-military-600 flex-1">
                                      <h4 className="text-sm font-bold text-white mb-4 flex items-center">
                                          <UserX className="mr-2 text-red-500" size={16} /> Behavioral Risk Flags
                                      </h4>
                                      <div className="space-y-3">
                                          {riskData.misconduct_risks?.map((risk: any, i: number) => (
                                              <div key={i} className="p-3 bg-red-900/10 border-l-4 border-red-500 rounded flex justify-between items-start">
                                                  <div>
                                                      <span className="font-bold text-white text-xs block mb-1">{safeRender(risk.id)} <span className="text-red-400">({safeRender(risk.risk_level)})</span></span>
                                                      <p className="text-[10px] text-gray-400 mb-1">{Array.isArray(risk.markers) ? risk.markers.join(", ") : safeRender(risk.markers)}</p>
                                                      <span className="text-[10px] bg-red-900/30 text-red-200 px-1.5 py-0.5 rounded border border-red-800">
                                                          Prob: {safeRender(risk.probability)}%
                                                      </span>
                                                  </div>
                                                  <button className="text-[10px] bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded">
                                                      Action
                                                  </button>
                                              </div>
                                          ))}
                                      </div>
                                  </div>
                                  <div className="mt-4 p-3 bg-green-900/20 border border-green-500/30 rounded text-xs text-green-300">
                                      <strong>AI Summary:</strong> {safeRender(riskData.unit_health_summary)}
                                  </div>
                              </div>
                          </div>
                      )}
                  </div>
              </div>
          )}

          {/* 5.1 UPAS (New Module) */}
          {activeTab === 'upas' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full overflow-y-auto lg:overflow-hidden">
                  {/* AI Evaluation Engine */}
                  <div className="bg-military-800 rounded-lg p-6 border border-military-700 flex flex-col">
                      <div className="flex justify-between items-center mb-4">
                          <h3 className="font-semibold text-lg text-white flex items-center">
                              <BrainCircuit className="mr-2 text-purple-500" size={20} /> {t('hr_upas_eval')}
                          </h3>
                          <button 
                            onClick={handleEvaluateCandidate}
                            disabled={evalLoading}
                            className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-3 py-1 rounded flex items-center disabled:opacity-50"
                          >
                              <RefreshCw size={12} className={`mr-1 ${evalLoading ? 'animate-spin' : ''}`} /> EVALUATE
                          </button>
                      </div>
                      
                      <div className="mb-4">
                          <label className="text-xs text-gray-400 uppercase font-bold block mb-1">Candidate Profile</label>
                          <select 
                            value={candidateName}
                            onChange={(e) => setCandidateName(e.target.value)}
                            className="w-full bg-military-900 border border-military-600 rounded p-2 text-sm text-white"
                          >
                              <option>Maj. Dawit K.</option>
                              <option>Lt. Col. Sarah M.</option>
                              <option>Capt. Aman B.</option>
                              <option>Brig. Gen. Yonas T.</option>
                          </select>
                      </div>

                      <div className="flex-1 min-h-[250px]">
                          <ResponsiveContainer width="100%" height="100%">
                              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={talentData}>
                                  <PolarGrid stroke="#334155" />
                                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                  <Radar name="Candidate Profile" dataKey="A" stroke="#a855f7" fill="#a855f7" fillOpacity={0.4} />
                                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                              </RadarChart>
                          </ResponsiveContainer>
                      </div>
                      <div className="mt-4 p-3 bg-military-900 rounded border border-military-600">
                          <h4 className="text-xs font-bold text-gray-300 mb-2 uppercase">{t('hr_upas_potential')}</h4>
                          <div className="space-y-2">
                              <div className="flex justify-between items-center text-xs">
                                  <span className="text-white">{candidateName}</span>
                                  <span className="text-green-400 font-mono">
                                      Score: {Math.round(talentData.reduce((acc, curr) => acc + curr.A, 0) / talentData.length / 1.5 * 10)}/100
                                  </span>
                              </div>
                          </div>
                      </div>
                  </div>

                  {/* Predictive Analytics & Skill Matching */}
                  <div className="flex flex-col gap-6">
                      <div className="bg-military-800 rounded-lg p-6 border border-military-700 flex-1">
                          <h3 className="font-semibold text-lg text-white mb-4 flex items-center">
                              <TrendingUp className="mr-2 text-blue-500" size={20} /> {t('hr_upas_retention')}
                          </h3>
                          <div className="h-48 w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                  <LineChart data={retentionData}>
                                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                                      <XAxis dataKey="year" stroke="#94a3b8" fontSize={10} />
                                      <YAxis domain={[80, 100]} stroke="#94a3b8" fontSize={10} />
                                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                                      <Line type="monotone" dataKey="rate" stroke="#3b82f6" strokeWidth={2} dot={{r: 4}} />
                                  </LineChart>
                              </ResponsiveContainer>
                          </div>
                      </div>

                      <div className="bg-military-800 rounded-lg p-6 border border-military-700 flex-1">
                          <h3 className="font-semibold text-lg text-white mb-4 flex items-center">
                              <Target className="mr-2 text-yellow-500" size={20} /> {t('hr_upas_skill')}
                          </h3>
                          <div className="bg-military-900 p-4 rounded border border-military-600 flex items-center justify-between">
                              <div>
                                  <h4 className="text-sm font-bold text-white">Project: Cyber Defense Unit</h4>
                                  <p className="text-xs text-gray-400">Required: Python, NetSec, L3 Clearance</p>
                              </div>
                              <button className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-3 py-1.5 rounded flex items-center">
                                  <Search size={12} className="mr-1" /> FIND MATCHES
                              </button>
                          </div>
                          <div className="mt-2 text-xs text-gray-500 text-center">
                              AI identified 14 qualified candidates from reserve pool.
                          </div>
                      </div>
                  </div>
              </div>
          )}

          {activeTab === 'org' && (
              <div className="bg-military-800 rounded-lg p-6 border border-military-700 overflow-y-auto h-full">
                  <div className="max-w-4xl mx-auto">
                      <div className="text-center mb-8">
                          <h3 className="text-xl font-bold text-white">ENDF Organizational Structure</h3>
                          <p className="text-xs text-gray-400">Chain of Command (2025)</p>
                      </div>
                      
                      <div className="pl-4">
                          <OrgNode label="Chief of General Staff" role="Field Marshal Birhanu Jula" expanded={true}>
                              <OrgNode label="Deputy Chief of Staff" role="General Abebaw Tadesse">
                                  <OrgNode label="Ground Forces Command" role="Field Marshal Birhanu (Direct)" expanded={true}>
                                      <OrgNode label="Northern Command" role="Maj. Gen. [Redacted]">
                                          <OrgNode label="4th Mechanized Division" role="Brig. Gen. [Redacted]" />
                                          <OrgNode label="11th Infantry Division" role="Col. [Redacted]" />
                                      </OrgNode>
                                      <OrgNode label="Eastern Command" role="Maj. Gen. [Redacted]">
                                          <OrgNode label="22nd Division" role="Brig. Gen. [Redacted]" />
                                      </OrgNode>
                                  </OrgNode>
                                  <OrgNode label="Air Force Command" role="Lt. Gen. Yilma Merdasa">
                                      <OrgNode label="Bishoftu Air Base" role="Brig. Gen. [Redacted]" />
                                  </OrgNode>
                                  <OrgNode label="Navy Command" role="Rear Admiral Kindu Gezu" />
                                  <OrgNode label="Republican Guard" role="Elite Protection" />
                              </OrgNode>
                              <OrgNode label="Education Main Dept" role="Gen. Yimer Mekonnen" />
                          </OrgNode>
                      </div>
                  </div>
              </div>
          )}

          {activeTab === 'mobilization' && (
              <div className="bg-military-800 rounded-lg p-6 border border-military-700 relative overflow-hidden flex items-center justify-center min-h-[400px]">
                   <div className="absolute top-0 right-0 p-4 opacity-10">
                       <Navigation size={200} />
                   </div>
                   <div className="w-full max-w-lg z-10 space-y-6">
                       <h3 className="font-semibold text-xl text-white mb-4 flex items-center justify-center">
                           <MapPin className="mr-2 text-military-accent" /> {t('hr_mobilization')}
                       </h3>
                       <div className="space-y-4">
                           <div>
                               <label className="text-xs text-gray-500 uppercase font-bold block mb-1">{t('hr_select_unit')}</label>
                               <select 
                                   value={selectedUnit}
                                   onChange={(e) => setSelectedUnit(e.target.value)}
                                   className="w-full bg-military-900 border border-military-600 rounded p-3 text-white text-sm"
                               >
                                   <option>3rd Infantry Division</option>
                                   <option>12th Mechanized Brigade</option>
                                   <option>Special Forces Command (Agazi)</option>
                                   <option>Engineering Corps Beta</option>
                               </select>
                           </div>
                           <div className="flex justify-center py-2">
                               <span className="text-gray-500 text-xs">⬇ {t('hr_deploy_to')} ⬇</span>
                           </div>
                           <div>
                               <label className="text-xs text-gray-500 uppercase font-bold block mb-1">{t('hr_target_region')}</label>
                               <select 
                                   value={selectedRegion}
                                   onChange={(e) => setSelectedRegion(e.target.value)}
                                   className="w-full bg-military-900 border border-military-600 rounded p-3 text-white text-sm"
                               >
                                   <option>{t('reg_north')}</option>
                                   <option>{t('reg_south')}</option>
                                   <option>{t('reg_east')}</option>
                                   <option>{t('reg_west')}</option>
                                   <option>Addis Ababa (Reserve)</option>
                               </select>
                           </div>
                           
                           <button 
                               onClick={handleDeploy}
                               disabled={deploying}
                               className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded mt-4 transition-all flex items-center justify-center disabled:opacity-50 shadow-lg"
                           >
                               {deploying ? (
                                   <span className="animate-pulse">TRANSMITTING ORDERS...</span>
                               ) : (
                                   <>{t('hr_issue_order')}</>
                               )}
                           </button>
                       </div>
                   </div>
              </div>
          )}
      </div>
    </div>
  );
};

export default HRView;
