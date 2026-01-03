
import React, { useState } from 'react';
import { BrainCircuit, Activity, User, Shield, Zap, RefreshCw, FileText, CheckCircle, X } from 'lucide-react';
import MetricCard from '../components/MetricCard';
import { useLanguage } from '../contexts/LanguageContext';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { runPsychometricAnalysis } from '../services/ollamaService';

interface AssessmentQuestion {
    id: number;
    text: string;
    type: 'scale' | 'text';
}

interface PsychProfileViewProps {
    onBack?: () => void;
}

const PsychProfileView: React.FC<PsychProfileViewProps> = ({ onBack }) => {
    const { t } = useLanguage();
    const [analyzing, setAnalyzing] = useState(false);
    const [profileData, setProfileData] = useState<any>(null);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [currentStep, setCurrentStep] = useState(0);

    const questions: AssessmentQuestion[] = [
        { id: 1, text: "In a high-pressure combat scenario where comms are down, do you prioritize the mission objective or the immediate safety of your squad?", type: "text" },
        { id: 2, text: "Describe a time you failed. How did you handle the aftermath?", type: "text" },
        { id: 3, text: "Rate your ability to adapt to sudden plan changes on a scale of 1-10.", type: "scale" },
        { id: 4, text: "You discover a superior officer violating protocol. What is your immediate reaction?", type: "text" },
        { id: 5, text: "How do you handle interpersonal conflict within your unit?", type: "text" },
    ];

    const handleAnswer = (val: string) => {
        setAnswers({ ...answers, [questions[currentStep].id]: val });
    };

    const nextStep = () => {
        if (currentStep < questions.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            submitAssessment();
        }
    };

    const submitAssessment = async () => {
        setAnalyzing(true);
        const result = await runPsychometricAnalysis(answers);
        setProfileData(result);
        setAnalyzing(false);
    };

    // Default chart data if no analysis yet
    const defaultRadarData = [
        { subject: 'IQ (Logic)', A: 0, fullMark: 140 },
        { subject: 'EQ (Emotion)', A: 0, fullMark: 100 },
        { subject: 'SQ (Social)', A: 0, fullMark: 100 },
        { subject: 'AQ (Adversity)', A: 0, fullMark: 100 },
    ];

    const radarData = profileData ? [
        { subject: 'IQ (Logic)', A: profileData.scores.iq, fullMark: 140 },
        { subject: 'EQ (Emotion)', A: profileData.scores.eq, fullMark: 100 },
        { subject: 'SQ (Social)', A: profileData.scores.sq, fullMark: 100 },
        { subject: 'AQ (Adversity)', A: profileData.scores.aq, fullMark: 100 },
    ] : defaultRadarData;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 flex flex-col h-[calc(100vh-140px)]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2 flex-shrink-0">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight flex items-center">
                        <BrainCircuit className="mr-3 text-purple-500" /> AI Psychometric Profiling
                    </h2>
                    <p className="text-gray-400 text-sm">Deep Psychological & Intelligence Assessment Module</p>
                </div>
                 {onBack && (
                    <button 
                        onClick={onBack}
                        className="mt-4 md:mt-0 p-2 text-gray-400 hover:text-white hover:bg-military-700 rounded transition-colors"
                        title="Exit / Back"
                    >
                        <X size={20} />
                    </button>
                )}
            </div>

            {!profileData && !analyzing && (
                <div className="flex-1 flex flex-col items-center justify-center bg-military-800 rounded-lg border border-military-700 p-8 max-w-2xl mx-auto w-full">
                    <h3 className="text-xl font-bold text-white mb-6">Subject Assessment: Question {currentStep + 1}/{questions.length}</h3>
                    
                    <div className="w-full mb-8">
                        <p className="text-lg text-gray-200 mb-4">{questions[currentStep].text}</p>
                        {questions[currentStep].type === 'text' ? (
                            <textarea 
                                className="w-full bg-military-900 border border-military-600 rounded p-4 text-white focus:border-purple-500 focus:outline-none h-32"
                                placeholder="Enter your response..."
                                value={answers[questions[currentStep].id] || ''}
                                onChange={(e) => handleAnswer(e.target.value)}
                            />
                        ) : (
                            <input 
                                type="range" 
                                min="1" max="10" 
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                value={answers[questions[currentStep].id] || 5}
                                onChange={(e) => handleAnswer(e.target.value)}
                            />
                        )}
                    </div>

                    <button 
                        onClick={nextStep}
                        disabled={!answers[questions[currentStep].id]}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded flex items-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {currentStep === questions.length - 1 ? "FINALIZE ASSESSMENT" : "NEXT QUESTION"}
                    </button>
                </div>
            )}

            {analyzing && (
                <div className="flex-1 flex flex-col items-center justify-center text-purple-400">
                    <RefreshCw size={64} className="animate-spin mb-4" />
                    <h3 className="text-xl font-bold animate-pulse">GENERATING PSYCHOLOGICAL PROFILE...</h3>
                    <p className="text-gray-500 mt-2">Analyzing linguistic patterns, decision vectors, and emotional markers.</p>
                </div>
            )}

            {profileData && (
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0 overflow-y-auto">
                    {/* Intelligence Metrics */}
                    <div className="bg-military-800 rounded-lg p-6 border border-military-700 flex flex-col">
                        <h3 className="font-bold text-white mb-4 flex items-center">
                            <Activity className="mr-2 text-purple-500" /> Intelligence Matrix
                        </h3>
                        <div className="flex-1 min-h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                    <PolarGrid stroke="#334155" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                    <Radar name="Subject" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.5} />
                                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="grid grid-cols-4 gap-2 text-center mt-4">
                            <div className="bg-military-900 p-2 rounded border border-military-600">
                                <span className="block text-xs text-gray-500">IQ</span>
                                <span className="text-xl font-bold text-white">{profileData.scores.iq}</span>
                            </div>
                            <div className="bg-military-900 p-2 rounded border border-military-600">
                                <span className="block text-xs text-gray-500">EQ</span>
                                <span className="text-xl font-bold text-white">{profileData.scores.eq}</span>
                            </div>
                            <div className="bg-military-900 p-2 rounded border border-military-600">
                                <span className="block text-xs text-gray-500">SQ</span>
                                <span className="text-xl font-bold text-white">{profileData.scores.sq}</span>
                            </div>
                            <div className="bg-military-900 p-2 rounded border border-military-600">
                                <span className="block text-xs text-gray-500">AQ</span>
                                <span className="text-xl font-bold text-white">{profileData.scores.aq}</span>
                            </div>
                        </div>
                    </div>

                    {/* Personality & Analysis */}
                    <div className="bg-military-800 rounded-lg p-6 border border-military-700 overflow-y-auto">
                        <h3 className="font-bold text-white mb-4 flex items-center">
                            <User className="mr-2 text-blue-500" /> Psychological Analysis
                        </h3>
                        
                        <div className="bg-blue-900/10 border border-blue-500/30 p-4 rounded mb-6">
                            <h4 className="text-sm font-bold text-blue-400 mb-2">Executive Summary</h4>
                            <p className="text-sm text-gray-300 leading-relaxed">{profileData.analysis.summary}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <h4 className="text-xs font-bold text-green-500 uppercase mb-2">Core Strengths</h4>
                                <ul className="space-y-1">
                                    {profileData.analysis.strengths.map((s: string, i: number) => (
                                        <li key={i} className="flex items-start text-xs text-gray-300">
                                            <CheckCircle size={12} className="mr-2 mt-0.5 text-green-500" /> {s}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-red-500 uppercase mb-2">Limitations / Risks</h4>
                                <ul className="space-y-1">
                                    {profileData.analysis.limitations.map((s: string, i: number) => (
                                        <li key={i} className="flex items-start text-xs text-gray-300">
                                            <Zap size={12} className="mr-2 mt-0.5 text-red-500" /> {s}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Personality Traits (Big Five Model)</h4>
                            <div className="space-y-3">
                                {profileData.traits.map((trait: any, i: number) => (
                                    <div key={i}>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-white">{trait.trait}</span>
                                            <span className="text-gray-400">{trait.score}%</span>
                                        </div>
                                        <div className="w-full bg-military-900 rounded-full h-1.5">
                                            <div 
                                                className="bg-purple-500 h-1.5 rounded-full" 
                                                style={{ width: `${trait.score}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-[10px] text-gray-500 mt-0.5">{trait.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PsychProfileView;
