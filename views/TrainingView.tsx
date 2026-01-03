
import React, { useState, useRef, useEffect } from 'react';
import { GraduationCap, Users, Book, BrainCircuit, Target, MapPin, Award, Globe, Activity, CheckCircle, FileText, Send, PenTool, HelpCircle, AlertCircle, RefreshCw, ChevronRight, X, Play, BarChart2, Database, Shield, DollarSign, Clock, Layers, Filter, CheckSquare, Calendar, CreditCard, Bell, Lock, User, MessageSquare, Sparkles, FileBarChart, Siren, FileCheck, History, Printer, ClipboardList, Stethoscope, Camera, Mic, Image as ImageIcon, Calculator, StopCircle, Upload, Zap, LayoutTemplate, Network, UserCheck, School, Briefcase } from 'lucide-react';
import MetricCard from '../components/MetricCard';
import { useLanguage } from '../contexts/LanguageContext';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { generateExamQuestion, evaluateApplicant, draftSRSCommunication, generateCourseRecommendations, analyzeStudentRisk, generateInterventionPlan, generateCurriculumGapAnalysis } from '../services/ollamaService';

interface TrainingViewProps {
    onBack?: () => void;
}

// --- Types ---
interface TrainingBatch {
    id: string;
    center: string;
    course: string;
    trainees: number;
    startDate: string;
    progress: number;
    status: 'Active' | 'Planned' | 'Graduating';
}

interface ExamData {
    question: string;
    options: string[];
    correct_index: number;
    explanation: string;
}

interface ApplicantProfile {
    name: string;
    age: string;
    education: string;
    physical: string;
    psych: string;
    background: string;
}

const TrainingView: React.FC<TrainingViewProps> = ({ onBack }) => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<'dashboard' | 'lms_exam' | 'lms_course' | 'srs_system'>('dashboard');

    // --- DASHBOARD DATA ---
    const batches: TrainingBatch[] = [
        { id: 'REC-34/24', center: 'Bilate Training Center', course: 'Basic Infantry', trainees: 12500, startDate: '2024-09-01', progress: 45, status: 'Active' },
        { id: 'OFF-12/24', center: 'Ethiopian Defense University', course: 'Command & Staff', trainees: 350, startDate: '2024-08-15', progress: 60, status: 'Active' },
        { id: 'PK-ATMIS-9', center: 'Hurso Contingent School', course: 'Pre-Deployment', trainees: 1200, startDate: '2024-10-01', progress: 85, status: 'Graduating' },
        { id: 'SPEC-AGAZI', center: 'Awash Arba', course: 'Commando Qual.', trainees: 400, startDate: '2024-09-10', progress: 30, status: 'Active' },
    ];

    const stats = [
        { label: 'Infantry', value: 25000 },
        { label: 'Mechanized', value: 8500 },
        { label: 'Air Wing', value: 1200 },
        { label: 'Special Ops', value: 850 },
    ];

    // --- LMS EXAM STATE ---
    const [examSubject, setExamSubject] = useState('Urban Warfare');
    const [examDifficulty, setExamDifficulty] = useState('Hard');
    const [examData, setExamData] = useState<ExamData | null>(null);
    const [examLoading, setExamLoading] = useState(false);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [revealAnswer, setRevealAnswer] = useState(false);
    const [examScore, setExamScore] = useState(0);
    const [examStreak, setExamStreak] = useState(0);
    const [adaptiveMode, setAdaptiveMode] = useState(false);

    // --- INTELLIGENT SRS BLUEPRINT STATE ---
    const [srsRole, setSrsRole] = useState<'admin' | 'teacher' | 'student' | 'parent'>('admin');
    
    // Admin Module States
    const [adminModule, setAdminModule] = useState<'analytics' | 'admission' | 'student_info' | 'finance' | 'graduation'>('analytics');
    const [admissionMode, setAdmissionMode] = useState<'text' | 'voice' | 'scan'>('text');
    const [applicantProfile, setApplicantProfile] = useState<ApplicantProfile>({ name: "", age: "", education: "", physical: "", psych: "", background: "" });
    const [evalResult, setEvalResult] = useState<any>(null);
    const [evalLoading, setEvalLoading] = useState(false);
    const [isRecordingAdm, setIsRecordingAdm] = useState(false);
    
    // Teacher Module States
    const [teacherModule, setTeacherModule] = useState<'roster' | 'attendance' | 'gradebook' | 'comms'>('roster');
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
    const [attendanceLog, setAttendanceLog] = useState<Record<string, 'Present' | 'Absent' | 'Late'>>({});
    const [gradeInput, setGradeInput] = useState<Record<string, string>>({});

    // Student/Parent States
    const [studentModule, setStudentModule] = useState<'profile' | 'schedule' | 'grades' | 'finance'>('profile');
    
    // Common SRS States
    const [isProcessingInput, setIsProcessingInput] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    
    // Mock Data Store
    const students = [
        { id: 'S001', name: 'Alemu T.', grade: 'A', attendance: 98, feeStatus: 'Paid', parent: 'Tadesse B.', contact: '+251...', medical: 'Clear' },
        { id: 'S002', name: 'Bekele W.', grade: 'B-', attendance: 85, feeStatus: 'Overdue', parent: 'Worku G.', contact: '+251...', medical: 'Asthma' },
        { id: 'S003', name: 'Chala D.', grade: 'A-', attendance: 92, feeStatus: 'Paid', parent: 'Deriba K.', contact: '+251...', medical: 'Clear' },
        { id: 'S004', name: 'Derartu M.', grade: 'C', attendance: 78, feeStatus: 'Pending', parent: 'Mamo A.', contact: '+251...', medical: 'Allergy' },
    ];

    const feeTransactions = [
        { id: 'TRX-101', date: '2024-10-01', amount: '5,000 ETB', type: 'Tuition', status: 'Completed' },
        { id: 'TRX-102', date: '2024-09-01', amount: '5,000 ETB', type: 'Tuition', status: 'Completed' },
    ];

    const performanceData = [
        { month: 'Jan', avg: 75, risk: 5 },
        { month: 'Feb', avg: 78, risk: 4 },
        { month: 'Mar', avg: 82, risk: 3 },
        { month: 'Apr', avg: 80, risk: 6 },
        { month: 'May', avg: 85, risk: 2 },
        { month: 'Jun', avg: 88, risk: 1 },
    ];

    // --- HANDLERS ---
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            mediaRecorderRef.current.start();
            setIsRecordingAdm(true);
        } catch (e) { console.error("Mic error", e); }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecordingAdm) {
            mediaRecorderRef.current.stop();
            setIsRecordingAdm(false);
            // Simulating voice processing
            setIsProcessingInput(true);
            setTimeout(() => {
                setApplicantProfile(prev => ({
                    ...prev,
                    name: "Detected from Voice",
                    background: "Transcribed: Applicant mentioned prior service in militia. Fluent in 3 languages.",
                    psych: "Voice Stress Analysis: Low Stress, High Confidence."
                }));
                setIsProcessingInput(false);
            }, 1500);
        }
    };

    const handleEvaluate = async () => {
        setEvalLoading(true);
        setEvalResult(null);
        const result = await evaluateApplicant(applicantProfile);
        setEvalResult(result);
        setEvalLoading(false);
    };

    const handleGenerateExam = async () => {
        setExamLoading(true);
        setSelectedOption(null);
        setRevealAnswer(false);
        const result = await generateExamQuestion(examSubject, examDifficulty);
        setExamData(result);
        setExamLoading(false);
    };

    const handleAnswerSelect = (idx: number) => {
        if (revealAnswer || !examData) return;
        setSelectedOption(idx);
        setRevealAnswer(true);
        if (idx === examData.correct_index) {
            setExamScore(prev => prev + 100 + (examStreak * 10));
            setExamStreak(prev => prev + 1);
            if (adaptiveMode) setExamDifficulty("Hard");
        } else {
            setExamStreak(0);
            if (adaptiveMode) setExamDifficulty("Medium");
        }
    };

    const handleGenerateCourses = async () => {
        if (!courseTopic) return;
        setCourseLoading(true);
        setGeneratedCourses([]);
        const result = await generateCourseRecommendations(courseTopic, courseLevel);
        setGeneratedCourses(result);
        setCourseLoading(false);
    };

    // --- COURSE GEN STATE ---
    const [courseTopic, setCourseTopic] = useState('');
    const [courseLevel, setCourseLevel] = useState('Advanced');
    const [generatedCourses, setGeneratedCourses] = useState<any[]>([]);
    const [courseLoading, setCourseLoading] = useState(false);

    return (
        <div className="space-y-6 animate-in fade-in duration-500 flex flex-col h-[calc(100vh-140px)]">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2 flex-shrink-0">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight font-display">{t('train_title')}</h2>
                    <p className="text-gray-400 text-sm font-sans">{t('train_subtitle')} • AI Education Command</p>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-4 md:mt-0 items-center">
                    <div className="bg-military-800 p-1 rounded-lg border border-military-700 flex flex-wrap gap-1 shadow-lg">
                        <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-2 text-xs font-bold rounded flex items-center transition-all ${activeTab === 'dashboard' ? 'bg-military-accent text-white shadow' : 'text-gray-400 hover:text-white hover:bg-military-700'}`}>
                            <Activity size={14} className="mr-2"/> OVERVIEW
                        </button>
                        <button onClick={() => setActiveTab('lms_exam')} className={`px-4 py-2 text-xs font-bold rounded flex items-center transition-all ${activeTab === 'lms_exam' ? 'bg-purple-600 text-white shadow' : 'text-gray-400 hover:text-white hover:bg-military-700'}`}>
                            <BrainCircuit size={14} className="mr-2"/> EXAM SIM
                        </button>
                        <button onClick={() => setActiveTab('lms_course')} className={`px-4 py-2 text-xs font-bold rounded flex items-center transition-all ${activeTab === 'lms_course' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white hover:bg-military-700'}`}>
                            <Book size={14} className="mr-2"/> COURSE ARCHITECT
                        </button>
                        <button onClick={() => setActiveTab('srs_system')} className={`px-4 py-2 text-xs font-bold rounded flex items-center transition-all ${activeTab === 'srs_system' ? 'bg-green-600 text-white shadow' : 'text-gray-400 hover:text-white hover:bg-military-700'}`}>
                            <Database size={14} className="mr-2"/> SRS PORTAL
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
                <MetricCard title={t('train_metric_staff')} value="1,450" icon={Users} color="accent" />
                <MetricCard title="AI Exam Bank" value="2.4M Qs" icon={BrainCircuit} color="purple" />
                <MetricCard title="Active Recruits" value="13,700" icon={Activity} color="success" />
                <MetricCard title="Avg Test Score" value="88%" icon={Award} color="warning" />
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto">
                
                {/* TAB: DASHBOARD */}
                {activeTab === 'dashboard' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full overflow-y-auto lg:overflow-hidden">
                        <div className="lg:col-span-2 bg-military-800 rounded-lg p-6 border border-military-700 flex flex-col h-full">
                            <h3 className="font-semibold text-lg text-white mb-6 flex items-center">
                                <Activity className="mr-2 text-green-500" size={20} /> Active Training Cycles
                            </h3>
                            <div className="space-y-4 overflow-y-auto flex-1">
                                {batches.map(batch => (
                                    <div key={batch.id} className="bg-military-900/50 p-4 rounded border border-military-600 hover:border-military-500 transition-all">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h4 className="font-bold text-white text-sm font-display tracking-wide">{batch.course}</h4>
                                                <p className="text-xs text-gray-400 flex items-center mt-1">
                                                    <MapPin size={10} className="mr-1"/> {batch.center}
                                                </p>
                                            </div>
                                            <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wider ${
                                                batch.status === 'Active' ? 'bg-blue-900/30 text-blue-300 border border-blue-900' :
                                                batch.status === 'Graduating' ? 'bg-green-900/30 text-green-300 border border-green-900' :
                                                'bg-yellow-900/30 text-yellow-300 border border-yellow-900'
                                            }`}>{batch.status}</span>
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-500 mb-2 font-mono">
                                            <span>{batch.trainees.toLocaleString()} Recruits</span>
                                            <span>{batch.progress}% Complete</span>
                                        </div>
                                        <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                                            <div className="bg-military-accent h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_#0ea5e9]" style={{width: `${batch.progress}%`}}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-military-800 rounded-lg p-6 border border-military-700 flex flex-col h-full">
                            <h3 className="font-semibold text-lg text-white mb-4">{t('train_throughput')}</h3>
                            <div className="flex-1 w-full min-h-[200px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                                        <XAxis dataKey="label" stroke="#94a3b8" fontSize={10} />
                                        <YAxis stroke="#94a3b8" fontSize={10} />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} 
                                            cursor={{fill: 'rgba(255,255,255,0.05)'}}
                                        />
                                        <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB: LMS EXAM GENERATOR */}
                {activeTab === 'lms_exam' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full overflow-y-auto">
                        <div className="bg-military-800 rounded-lg p-6 border border-military-700 flex flex-col h-full">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-semibold text-lg text-white flex items-center">
                                    <BrainCircuit className="mr-2 text-purple-500" size={20} /> AI Tactical Exam
                                </h3>
                                <div className="text-right">
                                    <div className="text-[10px] text-gray-400 uppercase">Current Score</div>
                                    <div className="text-2xl font-bold text-green-400 font-mono">{examScore}</div>
                                </div>
                            </div>
                            <div className="space-y-6 flex-1">
                                <div className="bg-military-900 p-4 rounded border border-military-600">
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="text-xs font-bold text-gray-400 uppercase">Configuration</h4>
                                        <label className="flex items-center text-xs text-gray-300 cursor-pointer">
                                            <input type="checkbox" checked={adaptiveMode} onChange={(e) => setAdaptiveMode(e.target.checked)} className="mr-2"/> Adaptive Difficulty (AI)
                                        </label>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 block mb-2">TOPIC</label>
                                            <select value={examSubject} onChange={(e) => setExamSubject(e.target.value)} className="w-full bg-military-800 border border-military-600 rounded p-2 text-white text-sm focus:border-purple-500 outline-none transition-colors">
                                                <option>Urban Warfare Tactics</option>
                                                <option>Cyber Security Hygiene</option>
                                                <option>International Humanitarian Law</option>
                                                <option>Logistics Chain Management</option>
                                                <option>Counter-Insurgency Ops</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 block mb-2">DIFFICULTY</label>
                                            <div className="flex gap-2">
                                                {['Easy', 'Medium', 'Hard'].map(d => (
                                                    <button key={d} onClick={() => setExamDifficulty(d)} disabled={adaptiveMode} className={`flex-1 py-2 rounded text-xs font-bold border transition-all ${examDifficulty === d ? 'bg-purple-600 text-white border-purple-500' : 'bg-military-800 text-gray-400 border-military-600 hover:border-gray-400 disabled:opacity-50'}`}>
                                                        {d.toUpperCase()}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={handleGenerateExam} disabled={examLoading} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded shadow-lg flex items-center justify-center disabled:opacity-50 transition-all hover:scale-105 active:scale-95">
                                    {examLoading ? <RefreshCw className="animate-spin mr-2"/> : <Play className="mr-2" size={16}/>}
                                    {examData ? "NEXT SCENARIO" : "START SIMULATION"}
                                </button>
                            </div>
                        </div>

                        <div className="bg-military-800 rounded-lg p-8 border border-military-700 flex flex-col justify-center relative overflow-hidden h-full min-h-[400px]">
                            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#a855f7 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
                            {!examData && !examLoading && (
                                <div className="text-center text-gray-500">
                                    <HelpCircle size={64} className="mx-auto mb-4 opacity-20" />
                                    <p className="text-sm font-mono uppercase tracking-widest">Awaiting Scenario Generation</p>
                                </div>
                            )}
                            {examLoading && (
                                <div className="text-center text-purple-400 absolute inset-0 flex flex-col items-center justify-center bg-military-800/90 backdrop-blur z-10">
                                    <RefreshCw size={48} className="mx-auto mb-4 animate-spin" />
                                    <p className="text-sm font-mono animate-pulse">Constructing Tactical Scenario...</p>
                                </div>
                            )}
                            {examData && (
                                <div className="animate-in fade-in slide-in-from-right-4 relative z-0 flex flex-col h-full overflow-y-auto">
                                    <div className="mb-8">
                                        <div className="flex items-center space-x-2 mb-4">
                                            <span className="text-[10px] text-purple-300 font-bold bg-purple-900/30 border border-purple-500/50 px-2 py-1 rounded uppercase tracking-wider">{examSubject}</span>
                                            <span className="text-[10px] text-gray-400 font-mono">SCENARIO ID: {Math.floor(Math.random() * 10000)}</span>
                                        </div>
                                        <h4 className="text-xl md:text-2xl font-bold text-white leading-relaxed font-display">{examData.question}</h4>
                                    </div>
                                    <div className="space-y-3 mb-8">
                                        {examData.options.map((opt, idx) => (
                                            <button key={idx} onClick={() => handleAnswerSelect(idx)} disabled={revealAnswer} className={`w-full text-left p-4 rounded border text-sm transition-all flex items-center group ${revealAnswer ? idx === examData.correct_index ? 'bg-green-600/20 border-green-500 text-white ring-1 ring-green-500' : idx === selectedOption ? 'bg-red-600/20 border-red-500 text-gray-400 opacity-70' : 'bg-military-900 border-military-600 text-gray-500 opacity-50' : 'bg-military-900 border-military-600 text-gray-300 hover:bg-military-700 hover:border-purple-400 hover:text-white'}`}>
                                                <div className={`w-6 h-6 rounded flex items-center justify-center mr-4 text-xs font-bold border transition-colors ${revealAnswer && idx === examData.correct_index ? 'bg-green-500 text-black border-green-500' : revealAnswer && idx === selectedOption ? 'bg-red-500 text-white border-red-500' : 'bg-military-800 border-military-500 text-gray-400 group-hover:border-purple-400 group-hover:text-white'}`}>
                                                    {String.fromCharCode(65 + idx)}
                                                </div>
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                    {revealAnswer && (
                                        <div className={`p-4 rounded border-l-4 animate-in slide-in-from-bottom-2 ${selectedOption === examData.correct_index ? 'bg-green-900/20 border-green-500' : 'bg-red-900/20 border-red-500'}`}>
                                            <div className="flex items-center mb-2">
                                                {selectedOption === examData.correct_index ? <CheckCircle className="text-green-500 mr-2" size={18}/> : <AlertCircle className="text-red-500 mr-2" size={18}/>}
                                                <span className={`font-bold text-sm ${selectedOption === examData.correct_index ? 'text-green-400' : 'text-red-400'}`}>
                                                    {selectedOption === examData.correct_index ? 'TACTICAL SUCCESS' : 'TACTICAL FAILURE'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-300 leading-relaxed font-mono text-xs">{examData.explanation}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* TAB: LMS COURSE ARCHITECT */}
                {activeTab === 'lms_course' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full overflow-y-auto">
                        <div className="bg-military-800 rounded-lg p-6 border border-military-700 flex flex-col h-full">
                            <h3 className="font-semibold text-lg text-white mb-6 flex items-center">
                                <Book className="mr-2 text-blue-500" size={20} /> AI Course Architect
                            </h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 block mb-2">TRAINING GOAL</label>
                                    <input type="text" placeholder="e.g. 'Advanced Sniper Ops in Urban Terrain'" className="w-full bg-military-900 border border-military-600 rounded p-3 text-white text-sm focus:border-blue-500 focus:outline-none" value={courseTopic} onChange={(e) => setCourseTopic(e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 block mb-2">PROFICIENCY LEVEL</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['Basic', 'Intermediate', 'Advanced', 'Specialist'].map(l => (
                                            <button key={l} onClick={() => setCourseLevel(l)} className={`py-2 rounded text-xs font-bold border transition-all ${courseLevel === l ? 'bg-blue-600 text-white border-blue-500' : 'bg-military-900 text-gray-400 border-military-600 hover:text-white'}`}>{l}</button>
                                        ))}
                                    </div>
                                </div>
                                <button onClick={handleGenerateCourses} disabled={courseLoading || !courseTopic} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded mt-2 flex items-center justify-center disabled:opacity-50 shadow-lg">
                                    {courseLoading ? <RefreshCw className="animate-spin mr-2"/> : <PenTool className="mr-2" size={16}/>} ARCHITECT SYLLABUS
                                </button>
                            </div>
                        </div>

                        <div className="lg:col-span-2 bg-military-800 rounded-lg p-6 border border-military-700 relative h-full min-h-[400px] overflow-y-auto">
                            {courseLoading && (
                                <div className="absolute inset-0 bg-military-800/90 z-10 flex flex-col items-center justify-center text-blue-400">
                                    <RefreshCw size={48} className="animate-spin mb-4" />
                                    <p className="font-mono text-sm animate-pulse">Compiling Tactical Curriculum...</p>
                                </div>
                            )}
                            {!generatedCourses.length ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                    <Book size={64} className="mb-4 opacity-20" />
                                    <p className="text-sm font-mono uppercase">Enter parameters to generate course map</p>
                                </div>
                            ) : (
                                <div className="relative pl-8 border-l-2 border-blue-900 space-y-8 py-4">
                                    {generatedCourses.map((course, idx) => (
                                        <div key={idx} className="relative animate-in slide-in-from-bottom-2" style={{animationDelay: `${idx * 150}ms`}}>
                                            <div className="absolute -left-[41px] top-4 w-6 h-6 bg-military-800 border-2 border-blue-500 rounded-full flex items-center justify-center text-[10px] font-bold text-blue-400 z-10">{idx + 1}</div>
                                            <div className="bg-military-900 rounded-lg border border-military-600 p-4 hover:border-blue-500 transition-colors group">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className="font-bold text-white text-base group-hover:text-blue-400 transition-colors">{course.title}</h4>
                                                    <span className="text-[10px] bg-blue-900/30 text-blue-300 px-2 py-0.5 rounded border border-blue-900">{course.duration}</span>
                                                </div>
                                                <div className="text-xs text-gray-400 mb-3 flex items-center">
                                                    <span className="bg-black/30 px-2 py-0.5 rounded text-gray-500 mr-2 uppercase font-bold text-[10px]">{course.module}</span>
                                                </div>
                                                <p className="text-sm text-gray-300 leading-relaxed bg-black/20 p-3 rounded border border-white/5">{course.reason}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* TAB: INTELLIGENT SRS (STUDENT RECORD SYSTEM) BLUEPRINT */}
                {activeTab === 'srs_system' && (
                    <div className="space-y-6 h-full flex flex-col">
                        
                        {/* 1. SRS Header with Role Switching */}
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-military-800 p-4 rounded-lg border border-military-700 shadow-lg flex-shrink-0">
                            <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                                <div className="bg-green-900/30 p-3 rounded-full border border-green-500/30">
                                    <School className="text-green-500" size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-lg flex items-center">
                                        Intelligent SRS Portal <Sparkles size={16} className="ml-2 text-purple-400 animate-pulse"/>
                                    </h3>
                                    <p className="text-xs text-gray-400">Select Role to View Dashboard</p>
                                </div>
                            </div>
                            
                            {/* Role Switcher */}
                            <div className="flex flex-wrap gap-1 bg-military-900 p-1 rounded border border-military-600">
                                <button onClick={() => setSrsRole('admin')} className={`px-4 py-2 text-xs font-bold rounded flex items-center transition-all uppercase ${srsRole === 'admin' ? 'bg-military-accent text-white shadow' : 'text-gray-400 hover:text-white'}`}>
                                    <Shield size={12} className="mr-2"/> ADMIN
                                </button>
                                <button onClick={() => setSrsRole('teacher')} className={`px-4 py-2 text-xs font-bold rounded flex items-center transition-all uppercase ${srsRole === 'teacher' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}>
                                    <Briefcase size={12} className="mr-2"/> TEACHER
                                </button>
                                <button onClick={() => setSrsRole('student')} className={`px-4 py-2 text-xs font-bold rounded flex items-center transition-all uppercase ${srsRole === 'student' ? 'bg-green-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}>
                                    <User size={12} className="mr-2"/> STUDENT
                                </button>
                                <button onClick={() => setSrsRole('parent')} className={`px-4 py-2 text-xs font-bold rounded flex items-center transition-all uppercase ${srsRole === 'parent' ? 'bg-purple-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}>
                                    <Users size={12} className="mr-2"/> PARENT
                                </button>
                            </div>
                        </div>

                        {/* 2. Main Content Area based on Role */}
                        <div className="flex-1 overflow-y-auto">
                            
                            {/* --- ADMINISTRATOR DASHBOARD --- */}
                            {srsRole === 'admin' && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                                        <div onClick={() => setAdminModule('analytics')} className={`p-4 rounded border cursor-pointer ${adminModule === 'analytics' ? 'bg-military-700 border-white' : 'bg-military-800 border-military-700 hover:border-gray-500'}`}>
                                            <Activity size={24} className="text-yellow-500 mb-2"/>
                                            <h4 className="font-bold text-white text-sm">Analytics</h4>
                                        </div>
                                        <div onClick={() => setAdminModule('admission')} className={`p-4 rounded border cursor-pointer ${adminModule === 'admission' ? 'bg-military-700 border-white' : 'bg-military-800 border-military-700 hover:border-gray-500'}`}>
                                            <UserCheck size={24} className="text-blue-500 mb-2"/>
                                            <h4 className="font-bold text-white text-sm">Admission</h4>
                                        </div>
                                        <div onClick={() => setAdminModule('student_info')} className={`p-4 rounded border cursor-pointer ${adminModule === 'student_info' ? 'bg-military-700 border-white' : 'bg-military-800 border-military-700 hover:border-gray-500'}`}>
                                            <Database size={24} className="text-green-500 mb-2"/>
                                            <h4 className="font-bold text-white text-sm">Student Info</h4>
                                        </div>
                                        <div onClick={() => setAdminModule('graduation')} className={`p-4 rounded border cursor-pointer ${adminModule === 'graduation' ? 'bg-military-700 border-white' : 'bg-military-800 border-military-700 hover:border-gray-500'}`}>
                                            <GraduationCap size={24} className="text-purple-500 mb-2"/>
                                            <h4 className="font-bold text-white text-sm">Graduation</h4>
                                        </div>
                                    </div>

                                    {/* Admin Module Content */}
                                    <div className="bg-military-800 p-6 rounded-lg border border-military-700">
                                        {adminModule === 'analytics' && (
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                <div>
                                                    <h3 className="text-lg font-bold text-white mb-4">Enrollment & Attendance Trends</h3>
                                                    <div className="h-64 w-full">
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <LineChart data={performanceData}>
                                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                                                                <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} />
                                                                <YAxis stroke="#94a3b8" fontSize={10} domain={[0, 100]} />
                                                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                                                                <Line type="monotone" dataKey="avg" stroke="#10b981" strokeWidth={2} name="Attendance %" />
                                                                <Line type="monotone" dataKey="risk" stroke="#ef4444" strokeWidth={2} name="Dropout Risk %" />
                                                            </LineChart>
                                                        </ResponsiveContainer>
                                                    </div>
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-white mb-4">Compliance Alerts</h3>
                                                    <div className="space-y-2">
                                                        <div className="p-3 bg-red-900/20 border border-red-500/30 rounded flex justify-between items-center">
                                                            <span className="text-sm text-white">Missing Grade Submissions (3 Teachers)</span>
                                                            <AlertCircle size={16} className="text-red-500"/>
                                                        </div>
                                                        <div className="p-3 bg-yellow-900/20 border border-yellow-500/30 rounded flex justify-between items-center">
                                                            <span className="text-sm text-white">Fee Collection Lag (Sector 4)</span>
                                                            <Clock size={16} className="text-yellow-500"/>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {adminModule === 'admission' && (
                                            <div className="flex flex-col gap-4">
                                                <h3 className="text-lg font-bold text-white mb-2">New Student Intake</h3>
                                                <div className="flex gap-2 mb-4">
                                                    <button onClick={() => setAdmissionMode('text')} className={`px-4 py-2 rounded text-xs font-bold ${admissionMode === 'text' ? 'bg-blue-600 text-white' : 'bg-military-900 text-gray-400'}`}>Form Entry</button>
                                                    <button onClick={() => setAdmissionMode('scan')} className={`px-4 py-2 rounded text-xs font-bold ${admissionMode === 'scan' ? 'bg-green-600 text-white' : 'bg-military-900 text-gray-400'}`}>ID Scan</button>
                                                </div>
                                                <div className="bg-military-900 p-4 rounded border border-military-600">
                                                    {admissionMode === 'text' ? (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <input type="text" placeholder="Full Name" className="bg-military-800 border border-military-700 p-2 rounded text-white text-sm" />
                                                            <input type="text" placeholder="Previous School" className="bg-military-800 border border-military-700 p-2 rounded text-white text-sm" />
                                                            <input type="text" placeholder="Parent Contact" className="bg-military-800 border border-military-700 p-2 rounded text-white text-sm" />
                                                            <button className="bg-blue-600 text-white rounded p-2 text-sm font-bold mt-4 md:mt-0">Register Student</button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                                                            <Camera size={48} className="mb-2 opacity-50"/>
                                                            <p>Camera Interface Placeholder</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {adminModule === 'student_info' && (
                                            <div>
                                                <h3 className="text-lg font-bold text-white mb-4">Student Database</h3>
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-left text-sm text-gray-300">
                                                        <thead className="bg-military-900 text-xs uppercase text-gray-500">
                                                            <tr>
                                                                <th className="p-3">ID</th>
                                                                <th className="p-3">Name</th>
                                                                <th className="p-3">Status</th>
                                                                <th className="p-3">Parent</th>
                                                                <th className="p-3">Action</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-military-700">
                                                            {students.map(s => (
                                                                <tr key={s.id}>
                                                                    <td className="p-3">{s.id}</td>
                                                                    <td className="p-3 font-bold text-white">{s.name}</td>
                                                                    <td className="p-3"><span className={`px-2 py-0.5 rounded text-[10px] ${s.feeStatus === 'Paid' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>{s.feeStatus}</span></td>
                                                                    <td className="p-3">{s.parent}</td>
                                                                    <td className="p-3"><button className="text-blue-400 text-xs hover:underline">View Profile</button></td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* --- TEACHER DASHBOARD --- */}
                            {srsRole === 'teacher' && (
                                <div className="space-y-6">
                                    <div className="bg-military-800 p-4 rounded-lg border border-military-700 flex flex-col sm:flex-row justify-between items-center gap-4">
                                        <h3 className="text-white font-bold">Class: Biology 101 (Section A)</h3>
                                        <div className="flex gap-2">
                                            <button onClick={() => setTeacherModule('attendance')} className={`px-3 py-1.5 rounded text-xs font-bold ${teacherModule === 'attendance' ? 'bg-blue-600 text-white' : 'bg-military-900 text-gray-400'}`}>Attendance</button>
                                            <button onClick={() => setTeacherModule('gradebook')} className={`px-3 py-1.5 rounded text-xs font-bold ${teacherModule === 'gradebook' ? 'bg-green-600 text-white' : 'bg-military-900 text-gray-400'}`}>Gradebook</button>
                                            <button onClick={() => setTeacherModule('comms')} className={`px-3 py-1.5 rounded text-xs font-bold ${teacherModule === 'comms' ? 'bg-purple-600 text-white' : 'bg-military-900 text-gray-400'}`}>Message</button>
                                        </div>
                                    </div>

                                    <div className="bg-military-800 p-6 rounded-lg border border-military-700">
                                        {teacherModule === 'attendance' && (
                                            <div>
                                                <div className="flex justify-between mb-4">
                                                    <h4 className="text-lg font-bold text-white">Daily Attendance</h4>
                                                    <span className="text-gray-400 text-sm">{new Date().toLocaleDateString()}</span>
                                                </div>
                                                <div className="space-y-2">
                                                    {students.map(s => (
                                                        <div key={s.id} className="flex items-center justify-between bg-military-900 p-3 rounded border border-military-600">
                                                            <span className="text-white text-sm">{s.name}</span>
                                                            <div className="flex gap-2">
                                                                <button className="bg-green-900/50 text-green-300 px-3 py-1 rounded text-xs border border-green-800 hover:bg-green-800">Present</button>
                                                                <button className="bg-red-900/50 text-red-300 px-3 py-1 rounded text-xs border border-red-800 hover:bg-red-800">Absent</button>
                                                                <button className="bg-yellow-900/50 text-yellow-300 px-3 py-1 rounded text-xs border border-yellow-800 hover:bg-yellow-800">Late</button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-bold text-sm">SUBMIT LOG</button>
                                            </div>
                                        )}

                                        {teacherModule === 'gradebook' && (
                                            <div>
                                                <h4 className="text-lg font-bold text-white mb-4">Assessment Entry: Final Exam</h4>
                                                <div className="space-y-2">
                                                    {students.map(s => (
                                                        <div key={s.id} className="flex items-center justify-between bg-military-900 p-3 rounded border border-military-600">
                                                            <div>
                                                                <span className="text-white text-sm block">{s.name}</span>
                                                                <span className="text-xs text-gray-500">Current Grade: {s.grade}</span>
                                                            </div>
                                                            <input type="number" placeholder="Score /100" className="bg-black/30 border border-military-500 rounded p-1 text-white text-sm w-24 text-right" />
                                                        </div>
                                                    ))}
                                                </div>
                                                <button className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded font-bold text-sm">SAVE GRADES</button>
                                            </div>
                                        )}
                                        
                                        {teacherModule === 'comms' && (
                                            <div>
                                                <h4 className="text-lg font-bold text-white mb-4">Broadcast Message</h4>
                                                <textarea className="w-full bg-military-900 border border-military-600 rounded p-3 text-white text-sm h-32" placeholder="Message to class parents..." />
                                                <div className="flex gap-2 mt-4">
                                                    <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded font-bold text-sm">SEND TO PARENTS</button>
                                                    <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-bold text-sm">SEND TO STUDENTS</button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* --- STUDENT DASHBOARD --- */}
                            {srsRole === 'student' && (
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className="lg:col-span-1 bg-military-800 p-6 rounded-lg border border-military-700 text-center h-auto lg:h-full">
                                        <div className="w-24 h-24 bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                                            <User size={48} className="text-gray-400"/>
                                        </div>
                                        <h3 className="text-xl font-bold text-white">Alemu Tadesse</h3>
                                        <p className="text-sm text-gray-400 mb-4">ID: S001 • Grade 12</p>
                                        <div className="flex justify-center gap-2">
                                            <span className="bg-green-900/30 text-green-400 px-2 py-1 rounded text-xs border border-green-800">Fee: Paid</span>
                                            <span className="bg-blue-900/30 text-blue-400 px-2 py-1 rounded text-xs border border-blue-800">GPA: 3.8</span>
                                        </div>
                                    </div>
                                    
                                    <div className="lg:col-span-2 space-y-6">
                                        <div className="bg-military-800 p-6 rounded-lg border border-military-700">
                                            <h4 className="text-lg font-bold text-white mb-4 flex items-center"><Calendar className="mr-2 text-blue-500" size={20}/> Class Schedule</h4>
                                            <div className="space-y-2">
                                                <div className="flex justify-between p-2 bg-military-900 rounded border-l-4 border-blue-500">
                                                    <span className="text-white text-sm">08:00 - Mathematics</span>
                                                    <span className="text-gray-400 text-xs">Room 101</span>
                                                </div>
                                                <div className="flex justify-between p-2 bg-military-900 rounded border-l-4 border-green-500">
                                                    <span className="text-white text-sm">10:00 - Biology</span>
                                                    <span className="text-gray-400 text-xs">Lab 3</span>
                                                </div>
                                                <div className="flex justify-between p-2 bg-military-900 rounded border-l-4 border-yellow-500">
                                                    <span className="text-white text-sm">14:00 - History</span>
                                                    <span className="text-gray-400 text-xs">Room 204</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="bg-military-800 p-6 rounded-lg border border-military-700">
                                            <h4 className="text-lg font-bold text-white mb-4 flex items-center"><FileText className="mr-2 text-purple-500" size={20}/> Recent Grades</h4>
                                            <div className="grid grid-cols-3 gap-4 text-center">
                                                <div className="bg-military-900 p-3 rounded">
                                                    <span className="block text-gray-400 text-xs">Math</span>
                                                    <span className="text-xl font-bold text-green-400">A</span>
                                                </div>
                                                <div className="bg-military-900 p-3 rounded">
                                                    <span className="block text-gray-400 text-xs">Physics</span>
                                                    <span className="text-xl font-bold text-yellow-400">B+</span>
                                                </div>
                                                <div className="bg-military-900 p-3 rounded">
                                                    <span className="block text-gray-400 text-xs">English</span>
                                                    <span className="text-xl font-bold text-green-400">A</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* --- PARENT DASHBOARD --- */}
                            {srsRole === 'parent' && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div className="bg-military-800 p-6 rounded-lg border border-military-700">
                                            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                                                <Activity className="mr-2 text-red-500" size={20}/> Child Monitor: Bekele W.
                                            </h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <div className="flex justify-between text-sm mb-1">
                                                        <span className="text-gray-400">Attendance Rate</span>
                                                        <span className="text-yellow-500 font-bold">85%</span>
                                                    </div>
                                                    <div className="w-full bg-military-900 h-2 rounded-full"><div className="bg-yellow-500 h-2 rounded-full" style={{width: '85%'}}></div></div>
                                                </div>
                                                <div className="p-3 bg-red-900/20 border border-red-500/30 rounded">
                                                    <h4 className="text-red-400 font-bold text-xs mb-1 flex items-center"><AlertCircle size={12} className="mr-1"/> Recent Incident</h4>
                                                    <p className="text-gray-300 text-xs">Late arrival on Oct 12. Explanation: Transport delay.</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-military-800 p-6 rounded-lg border border-military-700 flex flex-col">
                                            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                                                <CreditCard className="mr-2 text-green-500" size={20}/> Financial Status
                                            </h3>
                                            <div className="flex-1 flex flex-col justify-center items-center text-center p-4 bg-military-900 rounded border border-military-600 mb-4">
                                                <span className="text-xs text-gray-400">Outstanding Balance</span>
                                                <span className="text-3xl font-bold text-red-500 mt-1">5,000 ETB</span>
                                                <span className="text-xs text-red-400 mt-1">Due: Oct 01, 2024</span>
                                            </div>
                                            <button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded font-bold text-sm">PAY NOW (Mobile Money)</button>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-military-800 p-6 rounded-lg border border-military-700">
                                        <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                                            <MessageSquare className="mr-2 text-blue-500" size={20}/> Message Teacher
                                        </h3>
                                        <div className="flex gap-2">
                                            <input type="text" placeholder="Type message regarding Bekele..." className="flex-1 bg-military-900 border border-military-600 rounded p-3 text-white text-sm" />
                                            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded font-bold"><Send size={16}/></button>
                                        </div>
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

export default TrainingView;
