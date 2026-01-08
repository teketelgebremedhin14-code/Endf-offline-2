// src/views/EnhancedTrainingSystem.tsx
// ADVANCED ENDF Education and Training System with AI/LLM Integration
// Complete 3-Directorate System with AI-Enhanced SRS, Predictive Analytics, and Military-Specific Features

import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, Users, GraduationCap, BrainCircuit, Activity, Target, 
  BarChart3, AlertOctagon, BookOpen, Zap, ChevronRight, LayoutDashboard,
  Search, Bell, Menu, X as CloseIcon, Loader2, Sparkles, Play, ArrowRight,
  Clipboard, HeartPulse, Truck, Map, BadgeCheck, Radio, Hammer,
  UserPlus, ScanLine, Terminal, Lock, Star, TrendingDown, Box, 
  ShieldAlert, Building2, RefreshCw, Camera, AlertTriangle, ClipboardCheck,
  Command, Globe, FileText, Award, Package, School, Cpu, Users as UsersIcon,
  UserCheck, Calendar, Clock, TrendingUp, AlertCircle, CheckCircle2,
  ChevronDown, Filter as FilterIcon, Download, Upload, Settings, BookMarked,
  Library, Scale, UsersRound, Building, Archive, Book,
  Clock as ClockIcon, Package as LogisticsIcon, Layout, LogOut,
  FileBarChart, HeartHandshake, GraduationCap as CapIcon, Brain,
  ClipboardList, Scale as ComplianceIcon, UsersRound as AlumniIcon,
  Building2 as HigherEdIcon, BookOpenCheck, Calendar as ScheduleIcon,
  MessageSquare, Inbox, Send, Archive as ArchiveIcon, Filter,
  Eye, Printer, FileDown, Database, Target as TargetIcon,
  Cpu as CPUIcon, Brain as BrainIcon, GitBranch, GitMerge,
  BookOpen as BookOpenIcon, Shield as ShieldIcon, BarChart,
  LineChart, PieChart, Radar, Settings as SettingsIcon,
  Cloud, Server, Database as DatabaseIcon, Network,
  Key, Lock as LockIcon, EyeOff, Eye as EyeIcon,
  UserCog, BookKey, Lightbulb, Rocket, TestTube,
  Microscope, Beaker, Wrench, Tool, Zap as ZapIcon,
  Globe as GlobeIcon, Languages, Award as AwardIcon,
  Trophy, Medal, Crown, Star as StarIcon,
  TrendingUp as TrendingUpIcon, AlertTriangle as AlertTriangleIcon,
  Heart, Target as TargetIcon2, Crosshair,
  Sword, Shield as ShieldIcon2, Anchor, Plane,
  Car, Ship, Truck as TruckIcon, Bike,
  Navigation, Compass, MapPin, Layers,
  Grid, Columns, Rows, Table,
  LayoutGrid, List, Grid3x3,
  Maximize2, Minimize2, Expand,
  Shrink, Move, RotateCw,
  RotateCcw, ZoomIn, ZoomOut,
  FilterX, Sliders, ToggleLeft,
  ToggleRight, ToggleRight as ToggleIcon,
  BellRing, BellOff, Volume2,
  VolumeX, Mic, MicOff,
  Video, VideoOff, Phone,
  PhoneOff, MessageCircle,
  MessageSquare as MessageSquareIcon,
  Mail, MailOpen, Inbox as InboxIcon,
  Send as SendIcon, Paperclip,
  DownloadCloud, UploadCloud,
  CloudRain, CloudSnow,
  CloudLightning, CloudDrizzle,
  Sun, Moon, Sunrise,
  Sunset, Thermometer,
  Droplets, Wind, Umbrella,
  Cloudy
} from 'lucide-react';

// ========== AI/ML Service Integration ==========
interface AIModelPrediction {
  traineeId: string;
  riskScore: number;
  riskTier: 'low' | 'medium' | 'high';
  contributingFactors: string[];
  confidence: number;
  recommendedActions: string[];
  lastUpdated: string;
}

interface LLMAnalysis {
  query: string;
  response: string;
  citations: string[];
  generatedContent: string;
  confidence: number;
}

interface Intervention {
  id: string;
  traineeId: string;
  type: 'academic' | 'attendance' | 'performance' | 'behavioral' | 'medical';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in-progress' | 'completed' | 'escalated';
  assignedTo: string;
  createdAt: string;
  deadline: string;
  notes: string[];
  outcome?: string;
}

// Mock AI Service
class AIEnhancedSRSService {
  private static instance: AIEnhancedSRSService;
  
  static getInstance(): AIEnhancedSRSService {
    if (!AIEnhancedSRSService.instance) {
      AIEnhancedSRSService.instance = new AIEnhancedSRSService();
    }
    return AIEnhancedSRSService.instance;
  }

  async predictRisk(traineeId: string): Promise<AIModelPrediction> {
    // Simulate AI prediction
    return new Promise(resolve => {
      setTimeout(() => {
        const riskScore = Math.random() * 100;
        const riskTier: 'low' | 'medium' | 'high' = 
          riskScore < 30 ? 'low' : riskScore < 70 ? 'medium' : 'high';
        
        resolve({
          traineeId,
          riskScore,
          riskTier,
          contributingFactors: [
            'Attendance variance: 15% below cohort average',
            'Assessment performance declining in tactical modules',
            'Engagement metrics: Reduced participation in group exercises',
            'Peer review scores: Leadership indicators dropping'
          ],
          confidence: 0.87,
          recommendedActions: [
            'Schedule one-on-one mentoring session',
            'Assign additional tactical simulation exercises',
            'Recommend peer study group participation',
            'Monitor closely for next 14 days'
          ],
          lastUpdated: new Date().toISOString()
        });
      }, 500);
    });
  }

  async analyzeWithLLM(query: string, context?: any): Promise<LLMAnalysis> {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          query,
          response: `Based on current trainee performance data and historical patterns, analysis indicates that ${query.toLowerCase().includes('risk') ? 'there is a 65% probability of performance decline in the next 30 days. Recommended interventions include targeted remediation and increased monitoring.' : 'the trainee shows strong potential in leadership modules but requires additional support in technical assessments.'}`,
          citations: [
            'ENDF Training Regulation 2024-01',
            'Performance Analytics Module v2.3',
            'Historical Cohort Data (2020-2023)',
            'Instructor Feedback Database'
          ],
          generatedContent: `**AI-Generated Analysis Report**\n\nAssessment completed: ${new Date().toLocaleDateString()}\nPrimary Findings: ${query}\nRecommended Action Plan:\n1. Immediate review by unit commander\n2. Additional assessment in weak areas\n3. Bi-weekly progress check-ins\n4. Resource allocation adjustment if needed`,
          confidence: 0.92
        });
      }, 800);
    });
  }

  async generateInterventionPlan(traineeId: string): Promise<Intervention> {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          id: `INT-${Date.now()}`,
          traineeId,
          type: 'performance',
          priority: 'medium',
          status: 'pending',
          assignedTo: 'Unit Commander',
          createdAt: new Date().toISOString(),
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          notes: [
            'AI-detected performance decline in tactical modules',
            'Recommended: Additional simulation training',
            'Follow-up assessment required in 7 days'
          ]
        });
      }, 300);
    });
  }
}

// ========== Data Models ==========
interface Trainee {
  id: string;
  name: string;
  rank: string;
  unit: string;
  directorate: 'officer' | 'nco' | 'higher-ed';
  program: string;
  enrollmentDate: string;
  performanceScore: number;
  attendanceRate: number;
  riskLevel: 'low' | 'medium' | 'high';
  aiPredictions?: AIModelPrediction;
  interventions?: Intervention[];
}

interface Course {
  id: string;
  code: string;
  title: string;
  directorate: 'officer' | 'nco' | 'higher-ed';
  category: string;
  duration: string;
  instructor: string;
  capacity: number;
  enrolled: number;
  completionRate: number;
  status: 'active' | 'upcoming' | 'completed';
}

interface Resource {
  id: string;
  name: string;
  type: 'instructor' | 'facility' | 'equipment' | 'funding';
  status: 'available' | 'allocated' | 'maintenance' | 'unavailable';
  allocation: number; // percentage
  location: string;
}

// ========== Enhanced Mock Data ==========
const ENHANCED_MOCK_DATA = {
  // Command Dashboard Metrics
  commandMetrics: {
    totalTrainees: 2456,
    activeCourses: 89,
    resourceUtilization: 78,
    readinessScore: 82.5,
    interventionRate: 12.3,
    graduationRate: 87.6,
    averagePerformance: 76.8
  },

  // Recruitment Flow
  recruitment: {
    monthlyApplications: 324,
    screeningRate: 45,
    acceptanceRate: 32,
    basicTrainingCapacity: 500,
    currentIntake: 423
  },

  // AI Predictions
  aiPredictions: {
    highRiskTrainees: 34,
    mediumRiskTrainees: 156,
    predictedDropouts: 23,
    successProbability: 88.4
  },

  // Trainee Data with AI Integration
  trainees: Array.from({ length: 50 }, (_, i) => ({
    id: `TR-2024-${String(i + 1).padStart(3, '0')}`,
    name: ['Lt. Abebe Kebede', 'Capt. Sarah Johnson', 'Maj. Sofia Rodriguez', 'Sgt. Dawit Haile', 'Pvt. Marcus Chen'][i % 5],
    rank: ['Lieutenant', 'Captain', 'Major', 'Sergeant', 'Private'][i % 5],
    unit: ['Alpha Company', 'Bravo Company', 'Charlie Company', 'Delta Company', 'Echo Company'][i % 5],
    directorate: ['officer', 'nco', 'higher-ed'][i % 3] as 'officer' | 'nco' | 'higher-ed',
    program: ['Strategic Leadership', 'Basic Combat Training', 'Military Engineering', 'Cyber Defense', 'Medical Corps'][i % 5],
    enrollmentDate: '2024-01-15',
    performanceScore: 60 + Math.random() * 40,
    attendanceRate: 70 + Math.random() * 30,
    riskLevel: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high'
  })),

  // Courses by Directorate
  courses: {
    officer: [
      { id: 'OFF-001', code: 'SLP-24', title: 'Strategic Leadership Program', category: 'Senior Officer', duration: '8 weeks', instructor: 'Col. Menelik', capacity: 25, enrolled: 24, completionRate: 92, status: 'active' },
      { id: 'OFF-002', code: 'JOP-09', title: 'Joint Operations Program', category: 'Command Staff', duration: '12 weeks', instructor: 'Gen. Tesfaye', capacity: 30, enrolled: 28, completionRate: 88, status: 'active' },
      { id: 'OFF-003', code: 'DCSC-101', title: 'Defense Command Staff College', category: 'Senior Education', duration: '1 year', instructor: 'Brig. Gen. Alem', capacity: 40, enrolled: 38, completionRate: 94, status: 'active' }
    ],
    nco: [
      { id: 'NCO-001', code: 'TOLAY-01', title: 'Advanced NCO Leadership', category: 'NCO Development', duration: '6 weeks', instructor: 'Sgt. Maj. Almaz', capacity: 50, enrolled: 48, completionRate: 89, status: 'active' },
      { id: 'NCO-002', code: 'BCT-42', title: 'Basic Combat Training', category: 'Recruit Training', duration: '12 weeks', instructor: 'Capt. Girma', capacity: 200, enrolled: 195, completionRate: 82, status: 'active' },
      { id: 'NCO-003', code: 'TECH-07', title: 'Technical Specialist Training', category: 'Specialized Skills', duration: '8 weeks', instructor: 'Maj. Teklu', capacity: 35, enrolled: 32, completionRate: 91, status: 'active' }
    ],
    'higher-ed': [
      { id: 'EDU-001', code: 'EDU-MILENG', title: 'Military Engineering Degree', category: 'Higher Education', duration: '4 years', instructor: 'Dr. Assefa', capacity: 60, enrolled: 58, completionRate: 85, status: 'active' },
      { id: 'EDU-002', code: 'EDU-CYBER', title: 'Cyber Defense Masters', category: 'Graduate Studies', duration: '2 years', instructor: 'Prof. Turing', capacity: 25, enrolled: 22, completionRate: 88, status: 'active' },
      { id: 'EDU-003', code: 'EDU-MED', title: 'Military Medical Program', category: 'Medical Education', duration: '6 years', instructor: 'Col. Dr. Mariam', capacity: 40, enrolled: 36, completionRate: 93, status: 'active' }
    ]
  },

  // Resources
  resources: [
    { id: 'RES-001', name: 'Col. Menelik', type: 'instructor', status: 'available', allocation: 75, location: 'Main Campus' },
    { id: 'RES-002', name: 'Lecture Hall A', type: 'facility', status: 'available', allocation: 60, location: 'Academic Wing' },
    { id: 'RES-003', name: 'Tactical Simulator', type: 'equipment', status: 'allocated', allocation: 90, location: 'Training Complex' },
    { id: 'RES-004', name: 'Quarterly Budget', type: 'funding', status: 'available', allocation: 45, location: 'Finance Office' }
  ],

  // International Programs
  internationalPrograms: [
    { country: 'United States', program: 'West Point Exchange', trainees: 12, status: 'active' },
    { country: 'United Kingdom', program: 'Sandhurst Partnership', trainees: 8, status: 'active' },
    { country: 'China', program: 'PLA Academy Collaboration', trainees: 15, status: 'pending' },
    { country: 'Germany', program: 'Bundeswehr Training', trainees: 6, status: 'completed' }
  ],

  // Research Projects
  researchProjects: [
    { id: 'RES-001', title: 'Advanced Drone Defense Systems', status: 'in-progress', progress: 65, funding: 4500000 },
    { id: 'RES-002', title: 'Cyber Threat Intelligence Platform', status: 'active', progress: 42, funding: 3200000 },
    { id: 'RES-003', title: 'Military Medical Robotics', status: 'planning', progress: 15, funding: 1800000 }
  ]
};

// ========== Main Component ==========
const EnhancedEducationTrainingSystem = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [activeDirectorate, setActiveDirectorate] = useState<'overview' | 'officer' | 'nco' | 'higher-ed'>('overview');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [aiLoading, setAiLoading] = useState(false);
  const [selectedTrainee, setSelectedTrainee] = useState<Trainee | null>(null);
  const [aiPredictions, setAiPredictions] = useState<AIModelPrediction[]>([]);
  const [interventions, setInterventions] = useState<Intervention[]>([]);

  const aiService = AIEnhancedSRSService.getInstance();

  useEffect(() => {
    initializeAISystem();
  }, []);

  const initializeAISystem = async () => {
    setAiLoading(true);
    try {
      // Simulate AI system initialization
      const analysis = await aiService.analyzeWithLLM(
        'Initialize ENDF Education Command Dashboard with strategic readiness overview'
      );
      setAiAnalysis(analysis.response);
      
      // Load sample predictions
      const predictions = await Promise.all(
        ENHANCED_MOCK_DATA.trainees.slice(0, 5).map(t => 
          aiService.predictRisk(t.id)
        )
      );
      setAiPredictions(predictions);
    } catch (error) {
      console.error('AI System initialization failed:', error);
      setAiAnalysis('AI System offline - Running in limited mode');
    } finally {
      setAiLoading(false);
    }
  };

  const handleTraineeSelect = async (trainee: Trainee) => {
    setSelectedTrainee(trainee);
    const prediction = await aiService.predictRisk(trainee.id);
    setAiPredictions(prev => [...prev.filter(p => p.traineeId !== trainee.id), prediction]);
  };

  const handleGenerateIntervention = async (traineeId: string) => {
    const intervention = await aiService.generateInterventionPlan(traineeId);
    setInterventions(prev => [...prev, intervention]);
  };

  const renderContent = () => {
    if (activeView === 'dashboard') {
      return <CommandCentralDashboard 
        aiAnalysis={aiAnalysis}
        aiLoading={aiLoading}
        onTraineeSelect={handleTraineeSelect}
        onGenerateIntervention={handleGenerateIntervention}
        selectedTrainee={selectedTrainee}
        aiPredictions={aiPredictions}
        interventions={interventions}
      />;
    }

    switch (activeDirectorate) {
      case 'officer':
        return <OfficerTrainingDirectorate />;
      case 'nco':
        return <NCOEnlistedDirectorate />;
      case 'higher-ed':
        return <HigherEducationResearchDirectorate />;
      default:
        return <CommandCentralDashboard 
          aiAnalysis={aiAnalysis}
          aiLoading={aiLoading}
          onTraineeSelect={handleTraineeSelect}
          onGenerateIntervention={handleGenerateIntervention}
          selectedTrainee={selectedTrainee}
          aiPredictions={aiPredictions}
          interventions={interventions}
        />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-gradient-to-br from-slate-50 to-blue-50 text-slate-900 overflow-hidden font-sans">
      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen}
        activeView={activeView}
        activeDirectorate={activeDirectorate}
        onViewChange={setActiveView}
        onDirectorateChange={setActiveDirectorate}
        onToggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden ml-0 lg:ml-64 transition-all duration-300">
        <Header onToggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />
        
        <div className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </div>

        {/* AI Assistant Floating Button */}
        <AIAssistantButton />
      </main>
    </div>
  );
};

// ========== Sidebar Component ==========
const Sidebar = ({ 
  isOpen, 
  activeView, 
  activeDirectorate,
  onViewChange, 
  onDirectorateChange,
  onToggleSidebar 
}: any) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white 
        transform transition-transform duration-300 lg:relative lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 flex flex-col h-full">
          {/* Logo Section */}
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg">
              <Shield size={28} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-xl">ENDF</h1>
              <p className="text-xs text-slate-300">Education Command v4.2</p>
            </div>
          </div>

          {/* User Info */}
          <div className="mb-6 p-4 bg-slate-800/50 rounded-lg">
            <p className="text-xs text-slate-400 uppercase mb-2">Command Access</p>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
              <div>
                <p className="font-medium">Commander</p>
                <p className="text-xs text-slate-400">Security Level: MAXIMUM</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 overflow-y-auto">
            {/* Dashboard */}
            <SidebarItem 
              icon={LayoutDashboard}
              label="Command Dashboard"
              active={activeView === 'dashboard'}
              onClick={() => onViewChange('dashboard')}
            />

            {/* Directorates */}
            <div className="pt-4 border-t border-slate-700/50">
              <p className="text-xs text-slate-400 uppercase mb-2 px-4">Directorates</p>
              
              <SidebarItem 
                icon={TargetIcon}
                label="Officer Training"
                active={activeDirectorate === 'officer'}
                onClick={() => {
                  onDirectorateChange('officer');
                  onViewChange('directorate');
                }}
                badge="4"
              />
              
              <SidebarItem 
                icon={Hammer}
                label="NCO & Enlisted"
                active={activeDirectorate === 'nco'}
                onClick={() => {
                  onDirectorateChange('nco');
                  onViewChange('directorate');
                }}
                badge="3"
              />
              
              <SidebarItem 
                icon={GraduationCap}
                label="Higher Education & Research"
                active={activeDirectorate === 'higher-ed'}
                onClick={() => {
                  onDirectorateChange('higher-ed');
                  onViewChange('directorate');
                }}
                badge="AI"
              />
            </div>

            {/* AI Tools */}
            <div className="pt-4 border-t border-slate-700/50">
              <p className="text-xs text-slate-400 uppercase mb-2 px-4">AI Systems</p>
              
              <SidebarItem 
                icon={BrainCircuit}
                label="Predictive Analytics"
                onClick={() => onViewChange('analytics')}
              />
              
              <SidebarItem 
                icon={Sparkles}
                label="LLM Assistant"
                onClick={() => onViewChange('llm-assistant')}
              />
              
              <SidebarItem 
                icon={LineChart}
                label="Risk Dashboard"
                badge="12"
                onClick={() => onViewChange('risk-dashboard')}
              />
            </div>

            {/* System Admin */}
            <div className="pt-4 border-t border-slate-700/50">
              <p className="text-xs text-slate-400 uppercase mb-2 px-4">System</p>
              
              <SidebarItem 
                icon={Settings}
                label="Configuration"
                onClick={() => onViewChange('config')}
              />
              
              <SidebarItem 
                icon={Database}
                label="Data Warehouse"
                onClick={() => onViewChange('data-warehouse')}
              />
              
              <SidebarItem 
                icon={Shield}
                label="Security Center"
                onClick={() => onViewChange('security')}
              />
            </div>
          </nav>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-700/50">
            <button className="w-full py-3 bg-gradient-to-r from-red-900/50 to-red-800/30 hover:from-red-800/60 hover:to-red-700/40 rounded-lg flex items-center justify-center gap-2 text-sm transition-all duration-200">
              <LogOut size={16} /> Secure Logout
            </button>
            <div className="mt-4 text-center">
              <p className="text-xs text-slate-500">System Status: <span className="text-green-400">OPERATIONAL</span></p>
              <p className="text-xs text-slate-500 mt-1">AI Models: <span className="text-green-400">ACTIVE</span></p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

// ========== Header Component ==========
const Header = ({ onToggleSidebar }: any) => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center justify-between px-6 shadow-sm">
      <div className="flex items-center gap-4">
        <button 
          onClick={onToggleSidebar}
          className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <Menu size={24} />
        </button>
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            ENDF Education Command System
          </h1>
          <p className="text-xs text-slate-600">AI-Enhanced Training Management Platform</p>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="hidden md:flex items-center bg-slate-100 rounded-lg px-3 py-2">
          <Search size={18} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search trainees, courses, reports..."
            className="bg-transparent border-none outline-none ml-2 text-sm w-64"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* AI Status */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm font-medium">AI: Active</span>
        </div>

        {/* Notifications */}
        <button className="relative p-2 hover:bg-slate-100 rounded-lg">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            3
          </span>
        </button>

        {/* User */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium">Command Staff</p>
            <p className="text-xs text-slate-600">Education Directorate</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
            CS
          </div>
        </div>
      </div>
    </header>
  );
};

// ========== Command Central Dashboard ==========
const CommandCentralDashboard = ({ 
  aiAnalysis, 
  aiLoading,
  onTraineeSelect,
  onGenerateIntervention,
  selectedTrainee,
  aiPredictions,
  interventions
}: any) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'recruitment' | 'performance' | 'resources'>('overview');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold">Command Central Dashboard</h2>
          <p className="text-slate-600">Strategic Oversight • AI-Enhanced Analytics • Real-time Monitoring</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:shadow-lg transition-shadow">
            <Sparkles /> AI Strategic Brief
          </button>
          <button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:shadow-lg transition-shadow">
            <RefreshCw /> Refresh Intelligence
          </button>
        </div>
      </div>

      {/* Alert Status */}
      <div className="bg-gradient-to-r from-blue-900 to-slate-900 text-white p-6 rounded-2xl shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <ShieldAlert size={48} className="text-blue-300" />
            <div>
              <p className="text-sm text-blue-300 uppercase tracking-wider">DEFENSE READINESS STATUS</p>
              <p className="text-2xl font-bold mt-1">OPERATIONAL READINESS: LEVEL 1</p>
              <p className="text-blue-200 mt-1">All systems nominal • AI models active • Security: MAXIMUM</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-bold">
              DEFCON 5: NORMAL
            </button>
            <button className="bg-yellow-600/30 hover:bg-yellow-600/40 px-4 py-3 rounded-lg border border-yellow-600/50">
              DEFCON 3: ELEVATED
            </button>
            <button className="bg-red-900/30 hover:bg-red-900/40 px-4 py-3 rounded-lg border border-red-700/50">
              DEFCON 1: CRITICAL
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex space-x-1">
          {['overview', 'recruitment', 'performance', 'resources'].map((tab) => (
            <button
              key={tab}
              className={`px-6 py-3 font-medium text-sm rounded-t-lg transition-colors ${
                activeTab === tab
                  ? 'bg-white border-t border-l border-r border-slate-200 text-blue-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              onClick={() => setActiveTab(tab as any)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Metrics */}
        <div className="lg:col-span-2 space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Trainees', value: ENHANCED_MOCK_DATA.commandMetrics.totalTrainees, icon: Users, color: 'blue', change: '+12%' },
              { label: 'Active Courses', value: ENHANCED_MOCK_DATA.commandMetrics.activeCourses, icon: BookOpen, color: 'green', change: '+5%' },
              { label: 'Readiness Score', value: `${ENHANCED_MOCK_DATA.commandMetrics.readinessScore}%`, icon: Target, color: 'purple', change: '+2.3%' },
              { label: 'Intervention Rate', value: `${ENHANCED_MOCK_DATA.commandMetrics.interventionRate}%`, icon: AlertTriangle, color: 'yellow', change: '-1.8%' },
            ].map((metric, i) => (
              <div key={i} className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <metric.icon size={24} className={`text-${metric.color}-600`} />
                  <span className={`text-${metric.color}-600 text-sm font-bold`}>{metric.change}</span>
                </div>
                <p className="text-3xl font-bold">{metric.value}</p>
                <p className="text-sm text-slate-600 mt-1">{metric.label}</p>
              </div>
            ))}
          </div>

          {/* AI Risk Predictions */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold flex items-center gap-3">
                <BrainCircuit className="text-purple-600" /> AI Risk Predictions
              </h3>
              <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                View All Predictions →
              </button>
            </div>
            
            <div className="space-y-4">
              {aiPredictions.slice(0, 3).map((prediction, i) => (
                <div key={i} className={`p-4 rounded-lg border ${
                  prediction.riskTier === 'high' ? 'bg-red-50 border-red-200' :
                  prediction.riskTier === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                  'bg-green-50 border-green-200'
                }`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold">TR-{prediction.traineeId.split('-').pop()}</p>
                      <p className="text-sm text-slate-600">Risk Score: {prediction.riskScore.toFixed(1)}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                      prediction.riskTier === 'high' ? 'bg-red-100 text-red-800' :
                      prediction.riskTier === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {prediction.riskTier.toUpperCase()} RISK
                    </span>
                  </div>
                  <div className="mt-3">
                    <p className="text-sm text-slate-700 mb-2">Primary Factors:</p>
                    <ul className="text-sm text-slate-600 space-y-1">
                      {prediction.contributingFactors.slice(0, 2).map((factor, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <div className="w-1 h-1 rounded-full bg-slate-400 mt-2" />
                          {factor}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Trends */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-xl font-bold mb-6">Performance Analytics</h3>
            <div className="h-64 flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg">
              <div className="text-center">
                <TrendingUp size={48} className="mx-auto text-green-500 mb-4" />
                <p className="text-2xl font-bold text-green-600">+4.2% Improvement</p>
                <p className="text-slate-600 mt-2">Quarter-over-quarter performance increase</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* AI Insights */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-sm border border-blue-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="text-purple-600" />
              <h3 className="font-bold text-lg">Walia AI Insights</h3>
            </div>
            {aiLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin text-blue-600" size={32} />
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-slate-700">{aiAnalysis}</p>
                <div className="p-3 bg-white/50 rounded-lg">
                  <p className="font-bold text-sm mb-2">Recommended Actions:</p>
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li>• Review Bravo Company performance metrics</li>
                    <li>• Schedule leadership assessment for Q2 cohort</li>
                    <li>• Allocate additional resources to NCO development</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Active Interventions */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h3 className="font-bold text-lg mb-4">Active Interventions</h3>
            <div className="space-y-3">
              {interventions.slice(0, 3).map((intervention, i) => (
                <div key={i} className="p-3 bg-slate-50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-sm">{intervention.traineeId}</p>
                      <p className="text-xs text-slate-600">{intervention.type}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      intervention.priority === 'critical' ? 'bg-red-100 text-red-800' :
                      intervention.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {intervention.priority}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-2">Assigned to: {intervention.assignedTo}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h3 className="font-bold text-lg mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 p-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors">
                <FileText size={18} /> Generate Report
              </button>
              <button className="w-full bg-green-50 hover:bg-green-100 text-green-700 p-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors">
                <Users size={18} /> Review Cohort
              </button>
              <button className="w-full bg-purple-50 hover:bg-purple-100 text-purple-700 p-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors">
                <BrainCircuit size={18} /> Run AI Analysis
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ========== Officer Training Directorate ==========
const OfficerTrainingDirectorate = () => {
  const [activeModule, setActiveModule] = useState<'senior' | 'basic' | 'international'>('senior');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold">Officer Training Directorate</h2>
          <p className="text-slate-600">Strategic Leadership Development • Command Preparation • International Coordination</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2">
            <TargetIcon /> New Officer Program
          </button>
        </div>
      </div>

      {/* Module Navigation */}
      <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg">
        {[
          { id: 'senior', label: 'Senior Officer Education', icon: Crown },
          { id: 'basic', label: 'Basic Officer Training', icon: GraduationCap },
          { id: 'international', label: 'International Training', icon: Globe }
        ].map((module) => (
          <button
            key={module.id}
            onClick={() => setActiveModule(module.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-md transition-colors ${
              activeModule === module.id
                ? 'bg-white shadow-sm text-blue-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <module.icon size={20} />
            <span className="font-medium">{module.label}</span>
          </button>
        ))}
      </div>

      {/* Module Content */}
      {activeModule === 'senior' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: 'Defense Command Staff College', icon: School, stats: '98% Completion', color: 'blue' },
            { title: 'Strategic Leadership Programs', icon: Crown, stats: '45 Active Generals', color: 'purple' },
            { title: 'Joint Operations Training', icon: GitMerge, stats: '12 Exercises Planned', color: 'green' },
            { title: 'National Security Studies', icon: BookKey, stats: '24 Research Papers', color: 'orange' },
            { title: 'Policy Development', icon: FileText, stats: '8 Active Policies', color: 'red' },
            { title: 'Executive Leadership', icon: Users, stats: 'Senior Command Ready', color: 'indigo' },
          ].map((program, i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className={`p-3 w-12 h-12 rounded-lg bg-${program.color}-100 mb-4`}>
                <program.icon className={`text-${program.color}-600`} size={24} />
              </div>
              <h3 className="font-bold text-lg mb-2">{program.title}</h3>
              <p className="text-slate-600 text-sm mb-4">Advanced leadership and strategic thinking programs for senior officers</p>
              <div className="flex justify-between items-center">
                <span className={`px-3 py-1 bg-${program.color}-50 text-${program.color}-700 rounded-full text-sm font-medium`}>
                  {program.stats}
                </span>
                <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                  View →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeModule === 'basic' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-xl font-bold mb-4">Hurso Training School Operations</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Active Cadets', value: '324', change: '+8%' },
                { label: 'Graduation Rate', value: '92%', change: '+3%' },
                { label: 'Eagle Courses', value: '12', change: '+2' },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <p className="text-3xl font-bold">{stat.value}</p>
                  <p className="text-sm text-slate-600 mt-1">{stat.label}</p>
                  <p className="text-xs text-green-600 mt-1">{stat.change}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeModule === 'international' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h3 className="text-xl font-bold mb-6">International Training Coordination</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ENHANCED_MOCK_DATA.internationalPrograms.map((program, i) => (
              <div key={i} className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Globe className="text-blue-600" size={20} />
                    <span className="font-bold">{program.country}</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    program.status === 'active' ? 'bg-green-100 text-green-800' :
                    program.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {program.status}
                  </span>
                </div>
                <p className="text-slate-700 mb-2">{program.program}</p>
                <p className="text-sm text-slate-600">{program.trainees} officers in program</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ========== NCO Enlisted Directorate ==========
const NCOEnlistedDirectorate = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold">NCO & Enlisted Training Directorate</h2>
          <p className="text-slate-600">Non-Commissioned Leader Development • Basic Training • Specialist Skills</p>
        </div>
        <button className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2">
          <Hammer /> New NCO Program
        </button>
      </div>

      {/* IBADM Integration Banner */}
      <div className="bg-gradient-to-r from-green-900 to-emerald-800 text-white p-6 rounded-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BrainCircuit size={40} className="text-green-300" />
            <div>
              <p className="text-sm text-green-300 uppercase tracking-wider">IBADM INTEGRATION ACTIVE</p>
              <p className="text-xl font-bold mt-1">Real-time Performance Monitoring & Early Intervention</p>
              <p className="text-green-200 mt-1">AI-driven risk identification • Automated intervention workflows • Performance analytics</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">98.2%</p>
            <p className="text-green-300">System Accuracy</p>
          </div>
        </div>
      </div>

      {/* Training Centers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <School className="text-blue-600" size={28} />
            </div>
            <div>
              <h3 className="text-xl font-bold">Tolay Academy</h3>
              <p className="text-slate-600 mb-4">Advanced leadership school for Senior NCOs</p>
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-2xl font-bold">4</p>
                  <p className="text-sm text-slate-600">Active Courses</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">156</p>
                  <p className="text-sm text-slate-600">Current Trainees</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Target className="text-green-600" size={28} />
            </div>
            <div>
              <h3 className="text-xl font-bold">Bir Sheleko Training School</h3>
              <p className="text-slate-600 mb-4">Primary Recruit Training Center</p>
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-2xl font-bold">1,500</p>
                  <p className="text-sm text-slate-600">Recruit Capacity</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">423</p>
                  <p className="text-sm text-slate-600">Current Intake</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Specialist Training */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-xl font-bold mb-6">Specialist Training Coordination</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: 'Communications', icon: Radio, trainees: 45, status: 'active' },
            { title: 'Engineering', icon: Wrench, trainees: 68, status: 'active' },
            { title: 'Medical Corps', icon: HeartPulse, trainees: 32, status: 'active' },
            { title: 'Cyber Defense', icon: Cpu, trainees: 28, status: 'expanding' },
          ].map((specialty, i) => (
            <div key={i} className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-50 rounded">
                  <specialty.icon className="text-blue-600" size={20} />
                </div>
                <span className="font-bold">{specialty.title}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">{specialty.trainees}</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  specialty.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {specialty.status}
                </span>
              </div>
              <p className="text-sm text-slate-600 mt-1">Active trainees</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ========== Higher Education & Research Directorate ==========
const HigherEducationResearchDirectorate = () => {
  const [activeTab, setActiveTab] = useState<'srs' | 'research' | 'specialized'>('srs');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold">Higher Education & Research Directorate</h2>
          <p className="text-slate-600">AI-Enhanced SRS • Defense University • Research & Innovation</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2">
            <BrainCircuit /> AI System Dashboard
          </button>
        </div>
      </div>

      {/* AI SRS Banner */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-800 text-white p-6 rounded-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="relative">
              <Database size={48} className="text-purple-300" />
              <div className="absolute -top-2 -right-2">
                <Sparkles size={20} className="text-yellow-400" />
              </div>
            </div>
            <div>
              <p className="text-sm text-purple-300 uppercase tracking-wider">AI-ENHANCED STUDENT RECORD SYSTEM</p>
              <p className="text-xl font-bold mt-1">Version 4.2.1 • Active Predictive Analytics</p>
              <p className="text-purple-200 mt-1">LLM Integration • Automated Workflows • Real-time Risk Scoring</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
              <span className="font-bold">ALL SYSTEMS OPERATIONAL</span>
            </div>
            <p className="text-purple-300 mt-1">98.7% Prediction Accuracy</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex space-x-1">
          {[
            { id: 'srs', label: 'University Operations (SRS)' },
            { id: 'research', label: 'Research & Development' },
            { id: 'specialized', label: 'Specialized Education' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 font-medium text-sm rounded-t-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-white border-t border-l border-r border-slate-200 text-purple-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* SRS Content */}
      {activeTab === 'srs' && (
        <div className="space-y-6">
          {/* Role-Based Dashboards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Command Dashboard',
                icon: Shield,
                description: 'Strategic oversight & risk management',
                features: ['Risk Heatmaps', 'Intervention ROI', 'Forecast Analytics'],
                color: 'blue'
              },
              {
                title: 'Instructor Dashboard',
                icon: Users,
                description: 'Teaching effectiveness & student engagement',
                features: ['Gap Analysis', 'Auto-Feedback', 'Performance Insights'],
                color: 'green'
              },
              {
                title: 'Trainee Dashboard',
                icon: GraduationCap,
                description: 'Personalized learning & development',
                features: ['AI Coach', 'Progress Tracking', 'Resource Recommendations'],
                color: 'purple'
              }
            ].map((dashboard, i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div className={`p-3 w-12 h-12 rounded-lg bg-${dashboard.color}-100 mb-4`}>
                  <dashboard.icon className={`text-${dashboard.color}-600`} size={24} />
                </div>
                <h3 className="font-bold text-lg mb-2">{dashboard.title}</h3>
                <p className="text-slate-600 text-sm mb-4">{dashboard.description}</p>
                <div className="space-y-2">
                  {dashboard.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-slate-400" />
                      <span className="text-sm text-slate-700">{feature}</span>
                    </div>
                  ))}
                </div>
                <button className={`mt-6 w-full bg-${dashboard.color}-50 hover:bg-${dashboard.color}-100 text-${dashboard.color}-700 py-2 rounded-lg font-medium transition-colors`}>
                  Access Dashboard
                </button>
              </div>
            ))}
          </div>

          {/* AI Capabilities */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-xl font-bold mb-6">AI/LLM Capabilities</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { title: 'Predictive Risk Scoring', icon: Brain, status: 'active' },
                { title: 'LLM-Generated Reports', icon: FileText, status: 'active' },
                { title: 'Automated Interventions', icon: RefreshCw, status: 'active' },
                { title: 'Personalized Guidance', icon: UserCog, status: 'beta' },
              ].map((capability, i) => (
                <div key={i} className="p-4 border border-slate-200 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <capability.icon size={20} className="text-blue-600" />
                    <span className="font-bold">{capability.title}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-xs px-2 py-1 rounded ${
                      capability.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {capability.status}
                    </span>
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Research Content */}
      {activeTab === 'research' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-xl font-bold mb-6">Research & Innovation Portfolio</h3>
            <div className="space-y-4">
              {ENHANCED_MOCK_DATA.researchProjects.map((project, i) => (
                <div key={i} className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold text-lg">{project.title}</h4>
                      <p className="text-slate-600">Funding: ${(project.funding / 1000000).toFixed(1)}M</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      project.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                      project.status === 'active' ? 'bg-green-100 text-green-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <p className="text-sm text-slate-600 mt-1">{project.progress}% complete</p>
                    </div>
                    <button className="text-blue-600 hover:text-blue-800 font-medium">
                      Details →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ========== AI Assistant Button ==========
const AIAssistantButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleQuery = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    const aiService = AIEnhancedSRSService.getInstance();
    try {
      const analysis = await aiService.analyzeWithLLM(query);
      setResponse(analysis.response);
    } catch (error) {
      setResponse('Unable to process query. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-full p-5 shadow-2xl flex items-center gap-3 z-50 transition-all hover:scale-105"
      >
        <Sparkles size={28} />
        <span className="font-bold text-lg">Walia AI</span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
            {/* Header */}
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
                    <Sparkles size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Walia AI Assistant</h3>
                    <p className="text-slate-600">Ask me anything about ENDF training data</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                >
                  <CloseIcon size={20} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="mb-6">
                <div className="flex gap-2 mb-4">
                  {[
                    'Show high-risk trainees',
                    'Generate performance report',
                    'Predict graduation rates',
                    'Suggest interventions'
                  ].map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => setQuery(suggestion)}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleQuery()}
                    placeholder="Ask a question about trainee performance, risks, or analytics..."
                    className="w-full p-4 border border-slate-300 rounded-lg pr-12"
                  />
                  <button
                    onClick={handleQuery}
                    disabled={loading}
                    className="absolute right-3 top-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-2 rounded-lg disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <Send size={20} />
                    )}
                  </button>
                </div>
              </div>

              {response && (
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-2 mb-3">
                    <BrainCircuit size={20} className="text-blue-600" />
                    <span className="font-bold">AI Analysis</span>
                  </div>
                  <p className="text-slate-700">{response}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl">
              <div className="flex items-center justify-between text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Shield size={16} />
                  <span>Military-Grade Encryption</span>
                </div>
                <div className="flex items-center gap-2">
                  <BrainCircuit size={16} />
                  <span>Llama3 Enhanced</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ========== Sidebar Item Component ==========
const SidebarItem = ({ icon: Icon, label, active, onClick, badge }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all text-left relative group ${
      active
        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
    }`}
  >
    <Icon size={20} className={active ? 'text-white' : 'text-slate-400 group-hover:text-white'} />
    <span className="flex-1 font-medium">{label}</span>
    {badge && (
      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
        active
          ? 'bg-white/20 text-white'
          : 'bg-slate-700 text-slate-300 group-hover:bg-slate-600'
      }`}>
        {badge}
      </span>
    )}
    {active && (
      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-white rounded-l-lg" />
    )}
  </button>
);

export default EnhancedEducationTrainingSystem;