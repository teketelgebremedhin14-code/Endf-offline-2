
import React, { useState, useEffect, useRef } from 'react';
import { Rocket, Satellite, Radio, Globe, Activity, Zap, AlertTriangle, Crosshair, RefreshCw, Upload, MapPin, Camera, Eye, Scan, Target, CheckCircle, Video, X } from 'lucide-react';
import MetricCard from '../components/MetricCard';
import { useLanguage } from '../contexts/LanguageContext';
import { analyzeSatelliteTarget, analyzeSatelliteRecon } from '../services/ollamaService';

interface SatelliteAsset {
    id: string;
    nameKey: string;
    typeKey: string;
    orbit: 'LEO' | 'GEO' | 'MEO';
    statusKey: string;
    health: number;
    elevation: number;
    azimuth: number;
}

interface SpaceCommandViewProps {
    onBack?: () => void;
}

const SpaceCommandView: React.FC<SpaceCommandViewProps> = ({ onBack }) => {
    const { t, language } = useLanguage();
    const [activeTab, setActiveTab] = useState<'overview' | 'tasking' | 'imint'>('overview');
    const [satellites, setSatellites] = useState<SatelliteAsset[]>([
        { id: 'ETRSS-1', nameKey: 'space_sat_1_name', typeKey: 'space_type_obs', orbit: 'LEO', statusKey: 'space_stat_op', health: 96, elevation: 400, azimuth: 45 },
        { id: 'ET-COM-2', nameKey: 'space_sat_2_name', typeKey: 'space_type_comms', orbit: 'GEO', statusKey: 'space_stat_op', health: 99, elevation: 35000, azimuth: 120 },
        { id: 'ET-RES-X', nameKey: 'space_sat_3_name', typeKey: 'space_type_res', orbit: 'LEO', statusKey: 'space_stat_cal', health: 85, elevation: 550, azimuth: 280 },
    ]);

    const [telemetryStream, setTelemetryStream] = useState<string[]>([]);
    const [rotation, setRotation] = useState(0);
    const requestRef = useRef<number>();

    // Tasking State
    const [targetCoords, setTargetCoords] = useState<{x: number, y: number} | null>(null);
    const [targetName, setTargetName] = useState('Sector 4 Border Crossing');
    const [taskingStatus, setTaskingStatus] = useState<'IDLE' | 'ALIGNING' | 'IMAGING' | 'PROCESSING' | 'COMPLETE'>('IDLE');
    const [analysisResult, setAnalysisResult] = useState<string | null>(null);

    // IMINT State
    const [imintImage, setImintImage] = useState<string | null>(null);
    const [imintAnalysis, setImintAnalysis] = useState<any>(null);
    const [imintLoading, setImintLoading] = useState(false);
    const [cameraActive, setCameraActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // Helper for safe rendering
    const safeRender = (content: any) => {
        if (typeof content === 'string' || typeof content === 'number') return content;
        if (typeof content === 'object' && content !== null) return JSON.stringify(content);
        return '';
    };

    // Smooth Animation Loop (Visuals)
    const animate = () => {
        setRotation(prev => (prev + 0.05) % 360); // Slower, smoother rotation
        requestRef.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
        requestRef.current = requestAnimationFrame(animate);
        
        // Data Update Loop (Separate from visual loop to avoid thrashing)
        const dataInterval = setInterval(() => {
            // Random Telemetry
            const codes = ['SYNC', 'ACK', 'PING', 'DATA', 'TLM', 'PWR', 'THERM'];
            const hex = Math.floor(Math.random()*16777215).toString(16).toUpperCase().padStart(6, '0');
            const newLog = `[${new Date().toLocaleTimeString()}] ${satellites[0].id} > ${codes[Math.floor(Math.random()*codes.length)]} : 0x${hex}`;
            setTelemetryStream(prev => [newLog, ...prev].slice(0, 14));

            // Update Satellite Positions
            setSatellites(prev => prev.map(sat => ({
                ...sat,
                azimuth: (sat.azimuth + (sat.orbit === 'LEO' ? 0.5 : 0.05)) % 360
            })));
        }, 100);

        return () => {
            if (requestRef.current !== undefined) cancelAnimationFrame(requestRef.current);
            clearInterval(dataInterval);
            stopCamera();
        };
    }, []);

    const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (taskingStatus !== 'IDLE' && taskingStatus !== 'COMPLETE') return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setTargetCoords({ x, y });
        setAnalysisResult(null);
        setTaskingStatus('IDLE');
    };

    const handleTaskSatellite = async () => {
        if (!targetCoords) return;
        
        setTaskingStatus('ALIGNING');
        
        // Simulation Sequence
        setTimeout(() => setTaskingStatus('IMAGING'), 2000);
        setTimeout(async () => {
            setTaskingStatus('PROCESSING');
            // Call AI for analysis
            const coordString = `${Math.floor(targetCoords.y * 1.8)}°N, ${Math.floor(targetCoords.x * 3.6)}°E`;
            const result = await analyzeSatelliteTarget(coordString, targetName, language);
            setAnalysisResult(result);
            setTaskingStatus('COMPLETE');
        }, 5000);
    };

    // IMINT Handlers
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (ev) => {
                setImintImage(ev.target?.result as string);
                setImintAnalysis(null); // Reset analysis
            };
            reader.readAsDataURL(file);
        }
    };

    const startCamera = async () => {
        try {
            setCameraActive(true);
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Camera access error:", err);
            alert("Could not access camera.");
            setCameraActive(false);
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setCameraActive(false);
    };

    const captureImage = () => {
        if (videoRef.current && canvasRef.current) {
            const context = canvasRef.current.getContext('2d');
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
            context?.drawImage(videoRef.current, 0, 0);
            const dataUrl = canvasRef.current.toDataURL('image/jpeg');
            setImintImage(dataUrl);
            setImintAnalysis(null);
            stopCamera();
        }
    };

    const handleAnalyzeImage = async () => {
        if (!imintImage) return;
        setImintLoading(true);
        const base64Data = imintImage.split(',')[1];
        const mimeType = imintImage.split(';')[0].split(':')[1];
        
        const result = await analyzeSatelliteRecon(base64Data, mimeType, "Target Sector Alpha");
        setImintAnalysis(result);
        setImintLoading(false);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 flex flex-col h-[calc(100vh-140px)]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2 flex-shrink-0">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight font-display">{t('space_title')}</h2>
                    <p className="text-gray-400 text-sm font-sans">{t('space_subtitle')}</p>
                </div>
                <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
                    <div className="flex bg-military-800 p-1 rounded-lg border border-military-700 flex-wrap gap-1">
                        <button 
                            onClick={() => setActiveTab('overview')}
                            className={`px-4 py-1.5 text-xs font-bold rounded flex items-center transition-all ${activeTab === 'overview' ? 'bg-purple-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                        >
                            <Globe size={14} className="mr-2"/> OVERVIEW
                        </button>
                        <button 
                            onClick={() => setActiveTab('tasking')}
                            className={`px-4 py-1.5 text-xs font-bold rounded flex items-center transition-all ${activeTab === 'tasking' ? 'bg-purple-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                        >
                            <Crosshair size={14} className="mr-2"/> {t('space_tab_tasking')}
                        </button>
                        <button 
                            onClick={() => setActiveTab('imint')}
                            className={`px-4 py-1.5 text-xs font-bold rounded flex items-center transition-all ${activeTab === 'imint' ? 'bg-purple-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                        >
                            <Eye size={14} className="mr-2"/> AI RECON
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

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-shrink-0">
                <MetricCard title={t('space_metric_sats')} value="3" icon={Satellite} color="accent" />
                <MetricCard title={t('space_metric_uplink')} value="99.8%" icon={Activity} color="success" />
                <MetricCard title={t('space_metric_debris')} value="LOW" icon={AlertTriangle} color="warning" />
                <MetricCard title={t('space_metric_solar')} value="QUIET" icon={Zap} />
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto relative">
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* 3D Orbital Map */}
                        <div className="lg:col-span-2 bg-black rounded-xl border border-gray-800 relative overflow-hidden flex flex-col items-center justify-center group shadow-2xl perspective-[1000px] min-h-[400px]">
                             {/* Dynamic Starfield */}
                            <div className="absolute inset-0 opacity-60" style={{ 
                                backgroundImage: 'radial-gradient(white 1px, transparent 0)', 
                                backgroundSize: '50px 50px',
                                transform: `rotate(${rotation * 0.05}deg)`
                            }}></div>
                            
                            {/* 3D Globe Container */}
                            <div className="relative w-64 h-64 md:w-72 md:h-72 transition-transform duration-75 ease-linear" style={{ transformStyle: 'preserve-3d', transform: `rotateX(15deg) rotateY(${rotation}deg)` }}>
                                
                                {/* Earth Sphere */}
                                <div className="absolute inset-0 rounded-full bg-[#1e40af] opacity-40 blur-md"></div>
                                <div className="absolute inset-0 rounded-full border border-blue-500/30 bg-[radial-gradient(circle_at_30%_30%,#3b82f6,transparent)] opacity-80 shadow-[inset_0_0_40px_rgba(0,0,0,0.8)]">
                                    {/* Wireframe Grid */}
                                    <div className="w-full h-full rounded-full border border-blue-400/20" style={{
                                        backgroundImage: `linear-gradient(#3b82f6 1px, transparent 1px), linear-gradient(90deg, #3b82f6 1px, transparent 1px)`,
                                        backgroundSize: '24px 24px',
                                        opacity: 0.3,
                                        borderRadius: '50%'
                                    }}></div>
                                </div>

                                {/* Orbital Rings */}
                                <div className="absolute top-1/2 left-1/2 w-[140%] h-[140%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-gray-600/30" style={{ transform: 'rotateX(75deg)' }}></div>
                                <div className="absolute top-1/2 left-1/2 w-[180%] h-[180%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-gray-600/20" style={{ transform: 'rotateX(75deg) rotateY(45deg)' }}></div>

                                {/* Satellites */}
                                {satellites.map((sat, idx) => (
                                    <div 
                                        key={sat.id}
                                        className="absolute top-1/2 left-1/2 w-4 h-4 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
                                        style={{
                                            transformStyle: 'preserve-3d',
                                            transform: `rotateY(${sat.azimuth}deg) rotateZ(${idx * 45}deg) translateX(${sat.orbit === 'LEO' ? 140 : 200}px)`
                                        }}
                                    >
                                        <div className="w-2 h-2 bg-white rounded-full shadow-[0_0_10px_white] animate-pulse"></div>
                                        {/* Label always facing front reverse rotation */}
                                        <div className="absolute top-4 left-4 bg-black/80 border border-gray-700 px-2 py-1 rounded text-[8px] whitespace-nowrap text-cyan-400 font-mono" style={{ transform: `rotateY(${-rotation - sat.azimuth}deg)` }}>
                                            {sat.id}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* HUD Overlay */}
                            <div className="absolute top-4 right-4 p-4 flex flex-col items-end space-y-2 pointer-events-none">
                                <div className="flex items-center space-x-2">
                                    <span className="text-xs text-gray-400 font-mono">TRACKING</span>
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                                </div>
                                <div className="text-[10px] text-gray-500 font-mono">AZM: {rotation.toFixed(2)}°</div>
                                <div className="text-[10px] text-gray-500 font-mono">ELV: 15.00°</div>
                            </div>

                            {/* Ground Stations */}
                            <div className="absolute bottom-4 left-4 p-3 bg-gray-900/80 border border-gray-700 rounded backdrop-blur max-w-xs">
                                 <h4 className="text-xs font-bold text-gray-300 mb-2 border-b border-gray-700 pb-1 font-display">{t('space_ground_stn')}</h4>
                                 <div className="space-y-2">
                                     <div className="flex items-center justify-between space-x-4">
                                         <div className="flex items-center space-x-2">
                                             <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                             <span className="text-[10px] text-gray-400 font-mono">{t('space_stn_entoto')}</span>
                                         </div>
                                         <span className="text-[9px] text-green-600 font-mono">LINK STABLE</span>
                                     </div>
                                      <div className="flex items-center justify-between space-x-4">
                                         <div className="flex items-center space-x-2">
                                             <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                             <span className="text-[10px] text-gray-400 font-mono">{t('space_stn_mekelle')}</span>
                                         </div>
                                         <span className="text-[9px] text-green-600 font-mono">STANDBY</span>
                                     </div>
                                 </div>
                            </div>
                        </div>

                        {/* Telemetry & Assets */}
                        <div className="flex flex-col gap-6">
                            {/* Live Telemetry */}
                            <div className="bg-[#0b1120] rounded-xl border border-military-700 flex flex-col overflow-hidden shadow-lg min-h-[200px]">
                                <div className="p-3 border-b border-military-700 bg-military-900/50 flex justify-between items-center">
                                    <h3 className="font-semibold text-white text-sm flex items-center font-display">
                                        <Radio size={14} className="mr-2 text-green-500" /> {t('space_raw_tlm')}
                                    </h3>
                                    <RefreshCw size={12} className="text-green-500 animate-spin" />
                                </div>
                                <div className="flex-1 p-3 font-mono text-[10px] text-green-400/90 overflow-hidden bg-black relative">
                                    <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,2px_100%] pointer-events-none"></div>
                                    <div className="h-full overflow-y-auto scrollbar-hide max-h-[200px]">
                                        {telemetryStream.map((line, i) => (
                                            <div key={i} className="mb-1 opacity-80 border-l-2 border-green-900 pl-2">{line}</div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Asset List */}
                            <div className="bg-military-800 rounded-xl border border-military-700 flex flex-col shadow-lg overflow-hidden min-h-[200px]">
                                <div className="p-3 border-b border-military-700 bg-military-900/50">
                                    <h3 className="font-semibold text-white text-sm flex items-center font-display">
                                        <Rocket size={14} className="mr-2 text-purple-400"/> {t('space_asset_man')}
                                    </h3>
                                </div>
                                <div className="p-3 space-y-3 overflow-y-auto max-h-[300px]">
                                    {satellites.map(sat => (
                                        <div key={sat.id} className="bg-military-900/50 p-3 rounded border border-military-600 hover:border-purple-500 transition-colors group cursor-pointer">
                                            <div className="flex justify-between items-start mb-1">
                                                <div className="flex items-center">
                                                    <Satellite size={12} className="text-gray-400 mr-2 group-hover:text-white" />
                                                    <span className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors font-mono">{sat.id}</span>
                                                </div>
                                                <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-bold font-mono ${sat.statusKey.includes('op') ? 'bg-green-900/30 text-green-400 border border-green-900' : 'bg-yellow-900/30 text-yellow-400 border border-yellow-900'}`}>
                                                    {t(sat.statusKey as any)}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-gray-400 mb-2 pl-5 font-sans">{t(sat.nameKey as any)}</p>
                                            
                                            <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-500 pl-5 font-mono">
                                                <div className="flex justify-between border-b border-gray-700 pb-1">
                                                    <span>{t('space_orbit')}</span>
                                                    <span className="text-gray-300">{sat.orbit}</span>
                                                </div>
                                                <div className="flex justify-between border-b border-military-700 pb-1">
                                                    <span>{t('space_health')}</span>
                                                    <span className={`${sat.health > 90 ? 'text-green-500' : 'text-yellow-500'}`}>{sat.health}%</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'tasking' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Interactive Tasking Map */}
                        <div className="lg:col-span-2 bg-[#050b14] rounded-xl border border-military-700 relative overflow-hidden flex flex-col cursor-crosshair min-h-[400px]" onClick={handleMapClick}>
                            <div className="absolute top-4 left-4 z-10 bg-black/70 px-3 py-1 rounded border-l-2 border-purple-500">
                                <h4 className="text-xs font-bold text-purple-400 uppercase font-display">Target Selection (Ground Track)</h4>
                                <p className="text-[10px] text-gray-400 font-mono">Click map to designate target</p>
                            </div>
                            
                            <div className="flex-1 relative">
                                {/* SVG World Map */}
                                <svg viewBox="0 0 400 200" className="w-full h-full opacity-30 pointer-events-none">
                                    <path d="M 50 50 L 100 50 L 80 80 L 50 70 Z" fill="#1e293b" /> {/* NA */}
                                    <path d="M 60 90 L 80 90 L 70 140 L 60 130 Z" fill="#1e293b" /> {/* SA */}
                                    <path d="M 180 50 L 250 50 L 240 100 L 200 90 Z" fill="#1e293b" /> {/* Eurasia */}
                                    <path d="M 190 90 L 220 90 L 210 130 L 190 120 Z" fill="#1e293b" /> {/* Africa */}
                                    <path d="M 300 120 L 330 120 L 320 150 L 300 140 Z" fill="#1e293b" /> {/* Aus */}
                                    <line x1="0" y1="100" x2="400" y2="100" stroke="#334155" strokeWidth="0.5" strokeDasharray="5 2"/> {/* Equator */}
                                </svg>

                                {/* Satellite Ground Track Sine Wave */}
                                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                                    <path 
                                        d={`M 0 ${100 + Math.sin(0 + rotation/20)*45} 
                                           Q 100 ${100 + Math.sin(Math.PI/2 + rotation/20)*45} 
                                           200 ${100 + Math.sin(Math.PI + rotation/20)*45} 
                                           T 400 ${100 + Math.sin(2*Math.PI + rotation/20)*45}`}
                                        fill="none" 
                                        stroke="#a855f7" 
                                        strokeWidth="2"
                                        opacity="0.5"
                                    />
                                    {/* Satellite Marker */}
                                    <circle cx="200" cy={100 + Math.sin(Math.PI + rotation/20)*45} r="3" fill="white" className="animate-pulse" />
                                </svg>

                                {/* Selected Target Marker */}
                                {targetCoords && (
                                    <div 
                                        className="absolute w-6 h-6 border-2 border-red-500 rounded-full flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                                        style={{ left: `${targetCoords.x}%`, top: `${targetCoords.y}%` }}
                                    >
                                        <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                                        <div className="absolute w-full h-full border border-red-500/50 rounded-full animate-ping"></div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Tasking Controls */}
                        <div className="bg-military-800 rounded-xl border border-military-700 p-6 flex flex-col">
                            <h3 className="font-semibold text-white mb-6 flex items-center font-display">
                                <Camera className="mr-2 text-purple-500" size={20} /> Tasking & Acquisition
                            </h3>
                            
                            <div className="space-y-6 flex-1">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 block mb-2 font-mono">TARGET DESIGNATION</label>
                                    <div className="bg-military-900 border border-military-600 rounded p-3 text-sm text-white font-mono flex justify-between items-center">
                                        <span>
                                            {targetCoords ? 
                                                `${Math.floor(targetCoords.y * 1.8)}°N, ${Math.floor(targetCoords.x * 3.6)}°E` 
                                                : "NO TARGET SELECTED"}
                                        </span>
                                        <MapPin size={14} className={targetCoords ? "text-red-500" : "text-gray-600"} />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-500 block mb-2 font-mono">OPERATION NAME</label>
                                    <input 
                                        type="text" 
                                        value={targetName}
                                        onChange={(e) => setTargetName(e.target.value)}
                                        className="w-full bg-military-900 border border-military-600 rounded p-2 text-white text-sm focus:outline-none focus:border-purple-500 font-sans"
                                    />
                                </div>

                                {/* Status Display */}
                                <div className="bg-black/30 p-4 rounded border border-military-600">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs text-gray-400 font-mono">STATUS</span>
                                        <span className={`text-xs font-bold font-mono ${
                                            taskingStatus === 'COMPLETE' ? 'text-green-500' : 
                                            taskingStatus === 'IDLE' ? 'text-gray-500' : 'text-yellow-500 animate-pulse'
                                        }`}>
                                            {taskingStatus}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                                        <div 
                                            className="bg-purple-500 h-full transition-all duration-500" 
                                            style={{ width: taskingStatus === 'IDLE' ? '0%' : taskingStatus === 'COMPLETE' ? '100%' : '60%' }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Analysis Output */}
                                {analysisResult && (
                                    <div className="bg-green-900/10 border border-green-900/30 p-3 rounded animate-in fade-in slide-in-from-bottom-2">
                                        <h4 className="text-xs font-bold text-green-500 mb-1 font-display">AI ANALYSIS REPORT</h4>
                                        <p className="text-xs text-green-300 font-mono leading-relaxed whitespace-pre-line">
                                            {safeRender(analysisResult)}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4">
                                <button 
                                    onClick={handleTaskSatellite}
                                    disabled={!targetCoords || taskingStatus !== 'IDLE'}
                                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded text-sm font-bold flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-900/20 font-display tracking-wider"
                                >
                                    {taskingStatus === 'IDLE' ? (
                                        <><Upload size={16} className="mr-2" /> TRANSMIT TASKING ORDER</>
                                    ) : (
                                        <><RefreshCw size={16} className="animate-spin mr-2" /> PROCESSING...</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB: IMINT ANALYSIS */}
                {activeTab === 'imint' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4">
                        <div className="bg-military-800 rounded-lg border border-military-700 p-6 flex flex-col items-center justify-center relative overflow-hidden min-h-[400px]">
                            {!imintImage && !cameraActive ? (
                                <div className="text-center space-y-4">
                                    <Scan size={64} className="text-purple-500 mx-auto opacity-50" />
                                    <h3 className="text-xl font-bold text-white font-display">SATELLITE FEED SOURCE</h3>
                                    <p className="text-gray-400 text-xs">Upload Imagery or Capture Live Feed</p>
                                    <div className="flex gap-4 justify-center">
                                        <button 
                                            onClick={() => fileInputRef.current?.click()}
                                            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded font-bold text-sm flex items-center"
                                        >
                                            <Upload size={14} className="mr-2" /> UPLOAD FILE
                                        </button>
                                        <button 
                                            onClick={startCamera}
                                            className="bg-military-700 hover:bg-military-600 text-white px-6 py-2 rounded font-bold text-sm flex items-center border border-military-600"
                                        >
                                            <Camera size={14} className="mr-2" /> LIVE CAPTURE
                                        </button>
                                    </div>
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        className="hidden" 
                                        accept="image/*" 
                                        onChange={handleImageUpload} 
                                    />
                                </div>
                            ) : cameraActive ? (
                                <div className="relative w-full h-full flex flex-col">
                                    <div className="flex-1 relative bg-black rounded border border-military-600 overflow-hidden mb-4">
                                        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex justify-center gap-4">
                                        <button onClick={stopCamera} className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded font-bold text-xs">CANCEL</button>
                                        <button onClick={captureImage} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-bold text-xs">CAPTURE FRAME</button>
                                    </div>
                                    <canvas ref={canvasRef} className="hidden" />
                                </div>
                            ) : (
                                <div className="relative w-full h-full flex flex-col">
                                    <div className="flex-1 relative bg-black rounded border border-military-600 overflow-hidden mb-4">
                                        <img src={imintImage!} alt="Recon" className="w-full h-full object-contain" />
                                        {imintLoading && (
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                <div className="w-full h-1 bg-purple-500/50 absolute top-1/2 animate-scanline"></div>
                                                <div className="bg-black/80 px-4 py-2 rounded text-purple-400 font-mono text-xs animate-pulse">ANALYZING TERRAIN & ASSETS...</div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex justify-between">
                                        <button onClick={() => setImintImage(null)} className="text-gray-400 text-xs hover:text-white">CLEAR</button>
                                        <button 
                                            onClick={handleAnalyzeImage} 
                                            disabled={imintLoading}
                                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-bold text-xs flex items-center"
                                        >
                                            <Scan size={14} className="mr-2"/> RUN AI ANALYSIS
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="bg-military-800 rounded-lg border border-military-700 p-6 overflow-y-auto">
                            <h3 className="font-bold text-white mb-4 flex items-center border-b border-military-700 pb-2">
                                <Target size={18} className="mr-2 text-purple-500" /> ANALYSIS RESULTS
                            </h3>
                            
                            {imintAnalysis ? (
                                <div className="space-y-6 animate-in slide-in-from-right-4">
                                    <div className="bg-military-900 p-4 rounded border-l-4 border-purple-500">
                                        <h4 className="text-xs font-bold text-purple-400 mb-1">STRATEGIC ASSESSMENT</h4>
                                        <p className="text-sm text-gray-200">{safeRender(imintAnalysis.strategic_value)}</p>
                                    </div>

                                    <div>
                                        <h4 className="text-xs font-bold text-gray-500 mb-2">DETECTED ASSETS</h4>
                                        <div className="grid gap-2">
                                            {imintAnalysis.assets_detected.map((asset: any, idx: number) => (
                                                <div key={idx} className="flex justify-between items-center bg-black/30 p-2 rounded border border-military-600">
                                                    <span className="text-white text-sm font-bold">{safeRender(asset.type)}</span>
                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-xs text-gray-400">Count: {safeRender(asset.count)}</span>
                                                        <span className="text-[10px] bg-green-900/50 text-green-400 px-1 rounded">{safeRender(asset.confidence)}% Conf.</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-red-900/20 p-3 rounded border border-red-500/30">
                                            <div className="text-xs text-red-400 font-bold mb-1">THREAT LEVEL</div>
                                            <div className="text-lg text-white font-mono">{safeRender(imintAnalysis.threat_assessment)}</div>
                                        </div>
                                        <div className="bg-blue-900/20 p-3 rounded border border-blue-500/30">
                                            <div className="text-xs text-blue-400 font-bold mb-1">TERRAIN</div>
                                            <div className="text-xs text-white line-clamp-3">{safeRender(imintAnalysis.terrain_analysis)}</div>
                                        </div>
                                    </div>

                                    <div className="bg-green-900/10 p-4 rounded border border-green-500/30">
                                        <h4 className="text-xs font-bold text-green-500 mb-2 flex items-center"><CheckCircle size={12} className="mr-1"/> RECOMMENDATION</h4>
                                        <p className="text-sm text-gray-300 italic">"{safeRender(imintAnalysis.tactical_recommendation)}"</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-gray-500 mt-20">
                                    <Target size={48} className="mx-auto mb-2 opacity-20" />
                                    <p className="text-xs">Awaiting Imagery...</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SpaceCommandView;
