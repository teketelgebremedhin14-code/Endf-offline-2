
import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Save, ChevronUp, ChevronDown, Database, Hash, FileText, Check, AlertCircle, X, Camera, Mic, Radio, Image as ImageIcon, Trash2, StopCircle, Upload, Paperclip, Wand2, RefreshCw } from 'lucide-react';
import { ViewState } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { parseDataEntry } from '../services/ollamaService';

interface DataEntryTerminalProps {
    currentView: ViewState;
    isOpen: boolean;
    onToggle: () => void;
}

interface FieldConfig {
    key: string;
    label: string;
    type: 'text' | 'number' | 'select';
    options?: string[];
    placeholder?: string;
}

const DataEntryTerminal: React.FC<DataEntryTerminalProps> = ({ currentView, isOpen, onToggle }) => {
    const { t } = useLanguage();
    const [formData, setFormData] = useState<Record<string, string>>({});
    const [status, setStatus] = useState<'IDLE' | 'SAVING' | 'SUCCESS' | 'ERROR' | 'PARSING'>('IDLE');
    const [logs, setLogs] = useState<string[]>([]);
    
    // Smart Entry State
    const [smartInput, setSmartInput] = useState('');
    const [showSmartEntry, setShowSmartEntry] = useState(false);

    // Media State
    const [mediaMode, setMediaMode] = useState<'NONE' | 'CAMERA' | 'AUDIO'>('NONE');
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [attachedFile, setAttachedFile] = useState<File | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);

    // Refs
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Cleanup on close or unmount
    useEffect(() => {
        if (!isOpen) stopMediaTracks();
        return () => stopMediaTracks();
    }, [isOpen]);

    const stopMediaTracks = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        setMediaMode('NONE');
        setIsRecording(false);
        setRecordingTime(0);
    };

    // Configuration map for dynamic fields based on ViewState
    const getFieldsForView = (view: ViewState): FieldConfig[] => {
        switch (view) {
            case ViewState.GROUND_FORCES:
                return [
                    { key: 'unit_id', label: 'UNIT ID', type: 'text', placeholder: 'e.g. 4th Mech Div' },
                    { key: 'readiness', label: 'READINESS %', type: 'number', placeholder: '0-100' },
                    { key: 'status', label: 'STATUS', type: 'select', options: ['Active', 'Reserve', 'Transit', 'Engaged'] },
                    { key: 'location', label: 'GRID REF', type: 'text', placeholder: 'MGRS Coord' }
                ];
            case ViewState.NAVY:
                return [
                    { key: 'vessel_id', label: 'VESSEL ID', type: 'text', placeholder: 'e.g. P-201' },
                    { key: 'fuel', label: 'FUEL LEVEL', type: 'number', placeholder: '%' },
                    { key: 'hull', label: 'HULL INTEGRITY', type: 'number', placeholder: '%' },
                    { key: 'mission', label: 'MISSION', type: 'select', options: ['Patrol', 'Escort', 'Docked', 'Interception'] }
                ];
            case ViewState.AIR_FORCE:
                return [
                    { key: 'aircraft_id', label: 'TAIL NUMBER', type: 'text', placeholder: 'e.g. SU-27-04' },
                    { key: 'sortie_type', label: 'SORTIE', type: 'select', options: ['CAP', 'CAS', 'Recon', 'Training'] },
                    { key: 'ordnance', label: 'PAYLOAD', type: 'select', options: ['Standard', 'Precision', 'Recon Pod', 'Empty'] },
                    { key: 'flight_hours', label: 'FLIGHT HOURS', type: 'number', placeholder: 'Hrs' }
                ];
            case ViewState.INTELLIGENCE:
                return [
                    { key: 'intel_id', label: 'INTEL ID', type: 'text', placeholder: 'INT-XXXX' },
                    { key: 'sector', label: 'SECTOR', type: 'select', options: ['North', 'East', 'South', 'West', 'Cyber'] },
                    { key: 'threat_level', label: 'THREAT', type: 'select', options: ['Low', 'Medium', 'High', 'Critical'] },
                    { key: 'source', label: 'SOURCE', type: 'select', options: ['HUMINT', 'SIGINT', 'OSINT', 'IMINT'] }
                ];
            case ViewState.LOGISTICS:
                return [
                    { key: 'req_id', label: 'REQ ID', type: 'text', placeholder: 'Auto' },
                    { key: 'item', label: 'ITEM TYPE', type: 'select', options: ['Ammo', 'Fuel', 'Rations', 'Medical', 'Spares'] },
                    { key: 'qty', label: 'QUANTITY', type: 'number', placeholder: 'Units' },
                    { key: 'priority', label: 'PRIORITY', type: 'select', options: ['Low', 'Medium', 'High', 'Critical'] }
                ];
            case ViewState.SPECIAL_OPS:
                return [
                    { key: 'team_id', label: 'TEAM ID', type: 'text', placeholder: 'Agazi-X' },
                    { key: 'obj_status', label: 'OBJECTIVE', type: 'select', options: ['Pending', 'In Progress', 'Secured', 'Aborted'] },
                    { key: 'stealth', label: 'STEALTH', type: 'select', options: ['Green', 'Yellow', 'Red (Compromised)'] },
                    { key: 'cas', label: 'CAS REQ', type: 'select', options: ['None', 'Standby', 'Immediate'] }
                ];
            case ViewState.WARGAMING:
                return [
                    { key: 'scenario_id', label: 'SCENARIO ID', type: 'text', placeholder: 'Auto-Gen' },
                    { key: 'blue_strength', label: 'BLUE FORCE', type: 'number', placeholder: 'Strength' },
                    { key: 'red_strength', label: 'RED FORCE', type: 'number', placeholder: 'Strength' },
                    { key: 'terrain', label: 'TERRAIN', type: 'select', options: ['Urban', 'Desert', 'Mountain', 'Jungle'] }
                ];
            case ViewState.SPACE_COMMAND:
                return [
                    { key: 'sat_id', label: 'SAT ID', type: 'select', options: ['ETRSS-1', 'ET-COM-2', 'ET-RES-X'] },
                    { key: 'mode', label: 'MODE', type: 'select', options: ['Idle', 'Imaging', 'Relay', 'Maintenance'] },
                    { key: 'azimuth', label: 'AZIMUTH', type: 'number', placeholder: 'Deg' },
                    { key: 'elevation', label: 'ELEVATION', type: 'number', placeholder: 'Deg' }
                ];
            case ViewState.HR:
                return [
                    { key: 'personnel_id', label: 'SERVICE ID', type: 'text', placeholder: 'ENDF-XXXX' },
                    { key: 'action', label: 'ACTION', type: 'select', options: ['Promotion', 'Transfer', 'Leave', 'Disciplinary'] },
                    { key: 'unit_assign', label: 'ASSIGNMENT', type: 'text', placeholder: 'Unit Name' },
                    { key: 'clearance', label: 'CLEARANCE', type: 'select', options: ['L1', 'L2', 'L3', 'Top Secret'] }
                ];
            case ViewState.FINANCE:
                return [
                    { key: 'budget_code', label: 'BUDGET CODE', type: 'text', placeholder: 'GL-XXXX' },
                    { key: 'amount', label: 'AMOUNT (ETB)', type: 'number', placeholder: '0.00' },
                    { key: 'dept', label: 'DEPT', type: 'select', options: ['Ops', 'Logistics', 'Procurement', 'R&D'] },
                    { key: 'auth', label: 'AUTH', type: 'text', placeholder: 'Signatory' }
                ];
            case ViewState.HEALTH:
                return [
                    { key: 'triage_id', label: 'PATIENT ID', type: 'text', placeholder: 'Anon-ID' },
                    { key: 'status', label: 'TRIAGE', type: 'select', options: ['Green', 'Yellow', 'Red', 'Black'] },
                    { key: 'facility', label: 'FACILITY', type: 'text', placeholder: 'Hospital Code' },
                    { key: 'evac', label: 'EVAC REQ', type: 'select', options: ['No', 'Ambulance', 'Helo'] }
                ];
             case ViewState.PSYCH_EVAL:
                return [
                    { key: 'subject_id', label: 'SUBJECT ID', type: 'text', placeholder: 'Anon-ID' },
                    { key: 'test_type', label: 'TEST TYPE', type: 'select', options: ['Routine', 'Post-Deployment', 'Command Suitability'] },
                    { key: 'score', label: 'RAW SCORE', type: 'number', placeholder: '0-100' },
                    { key: 'flags', label: 'RISK FLAGS', type: 'select', options: ['None', 'Stress', 'Fatigue', 'Trauma'] }
                ];
            case ViewState.COMMUNICATIONS:
                return [
                    { key: 'freq', label: 'FREQUENCY', type: 'text', placeholder: 'MHz' },
                    { key: 'encrypt', label: 'ENCRYPTION', type: 'select', options: ['AES-256', 'Custom-X', 'Plain'] },
                    { key: 'status', label: 'LINK STATUS', type: 'select', options: ['Stable', 'Intermittent', 'Down'] },
                    { key: 'node', label: 'NODE ID', type: 'text', placeholder: 'Node-X' }
                ];
            default:
                return [
                    { key: 'log_entry', label: 'LOG ENTRY', type: 'text', placeholder: 'Enter general log data...' },
                    { key: 'category', label: 'CATEGORY', type: 'select', options: ['Routine', 'Urgent', 'Info'] },
                    { key: 'code', label: 'AUTH CODE', type: 'text', placeholder: 'User ID' }
                ];
        }
    };

    const fields = getFieldsForView(currentView);

    const handleInputChange = (key: string, value: string) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleSmartFill = async () => {
        if (!smartInput.trim()) return;
        setStatus('PARSING');
        try {
            const data = await parseDataEntry(smartInput, currentView);
            setFormData(prev => ({ ...prev, ...data }));
            setSmartInput('');
            setStatus('IDLE');
        } catch (e) {
            setStatus('ERROR');
            setTimeout(() => setStatus('IDLE'), 2000);
        }
    };

    // --- CAMERA HANDLERS ---
    const startCamera = async () => {
        setMediaMode('CAMERA');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Camera Access Error:", err);
            setLogs(prev => ["ERROR: Camera hardware access denied or unavailable.", ...prev]);
            setMediaMode('NONE');
        }
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL('image/jpeg');
                setCapturedImage(dataUrl);
                stopMediaTracks(); // Stop camera after capture
            }
        }
    };

    // --- AUDIO HANDLERS ---
    const startAudio = async () => {
        setMediaMode('AUDIO');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                setAudioBlob(blob);
                stopMediaTracks();
            };

            mediaRecorder.start();
            setIsRecording(true);
            
            timerRef.current = window.setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

        } catch (err) {
            console.error("Mic Access Error:", err);
            setLogs(prev => ["ERROR: Microphone hardware access denied.", ...prev]);
            setMediaMode('NONE');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
        }
    };

    // --- FILE UPLOAD HANDLERS ---
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setAttachedFile(e.target.files[0]);
        }
    };

    // --- SUBMISSION ---
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('SAVING');
        
        setTimeout(() => {
            const timestamp = new Date().toLocaleTimeString();
            let entrySummary = Object.entries(formData).map(([k, v]) => `${k.toUpperCase()}: ${v}`).join(' | ');
            
            if (capturedImage) entrySummary += " | [IMG ATTACHED]";
            if (audioBlob) entrySummary += " | [AUDIO LOG ATTACHED]";
            if (attachedFile) entrySummary += ` | [FILE: ${attachedFile.name.toUpperCase()}]`;

            setLogs(prev => [`[${timestamp}] DATA UPLOADED: ${entrySummary}`, ...prev].slice(0, 5));
            setStatus('SUCCESS');
            setFormData({});
            setCapturedImage(null);
            setAudioBlob(null);
            setAttachedFile(null);
            
            setTimeout(() => setStatus('IDLE'), 2000);
        }, 1500);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div 
            className={`fixed bottom-0 left-0 right-0 z-[60] transition-all duration-500 ease-in-out border-t border-military-600 bg-[#050b14]/95 backdrop-blur-md shadow-[0_-10px_40px_rgba(0,0,0,0.5)] ${
                isOpen ? 'translate-y-0' : 'translate-y-[calc(100%-40px)]'
            }`}
        >
            {/* Handle / Header */}
            <div 
                onClick={onToggle}
                className="h-10 bg-military-900 border-b border-military-700 flex justify-between items-center px-4 cursor-pointer hover:bg-military-800 transition-colors group"
            >
                <div className="flex items-center space-x-2">
                    <Terminal size={16} className={`text-military-accent ${isOpen ? 'text-military-accent' : 'text-gray-500 group-hover:text-military-accent'}`} />
                    <span className="text-xs font-bold font-display tracking-widest text-gray-300">
                        TACTICAL DATA ENCODER <span className="text-military-accent">//</span> {currentView.replace(/_/g, ' ')}
                    </span>
                </div>
                <div className="flex items-center space-x-4">
                    {status === 'SUCCESS' && <span className="text-xs text-green-500 flex items-center animate-in fade-in"><Check size={12} className="mr-1"/> UPLOAD COMPLETE</span>}
                    {isOpen ? <ChevronDown size={16} className="text-gray-500" /> : <ChevronUp size={16} className="text-gray-500" />}
                </div>
            </div>

            {/* Content Body */}
            <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8 h-96 overflow-y-auto">
                
                {/* Left Column: Form & Media Controls */}
                <div className="lg:col-span-2 flex flex-col h-full">
                    {/* Smart Input Toggle */}
                    <div className="flex justify-end mb-2">
                        <button 
                            onClick={() => setShowSmartEntry(!showSmartEntry)} 
                            className={`text-xs flex items-center space-x-1 ${showSmartEntry ? 'text-purple-400' : 'text-gray-500 hover:text-purple-300'}`}
                        >
                            <Wand2 size={12} /> <span>Smart Entry</span>
                        </button>
                    </div>

                    {showSmartEntry && (
                        <div className="mb-4 bg-purple-900/10 border border-purple-500/30 rounded p-2 flex gap-2">
                            <input 
                                type="text" 
                                value={smartInput}
                                onChange={(e) => setSmartInput(e.target.value)}
                                placeholder="e.g., 'Unit 4B low on fuel at grid 44-X priority high'"
                                className="flex-1 bg-transparent border-none focus:outline-none text-xs text-purple-200 placeholder-purple-500/50"
                                onKeyDown={(e) => e.key === 'Enter' && handleSmartFill()}
                            />
                            <button 
                                onClick={handleSmartFill} 
                                disabled={status === 'PARSING'}
                                className="bg-purple-600 hover:bg-purple-700 text-white rounded px-3 py-1 text-xs font-bold"
                            >
                                {status === 'PARSING' ? <RefreshCw className="animate-spin" size={12}/> : 'AUTO-FILL'}
                            </button>
                        </div>
                    )}

                    {/* Text Fields */}
                    <form className="grid grid-cols-2 md:grid-cols-4 gap-4 content-start mb-6">
                        {fields.map((field) => (
                            <div key={field.key} className={field.type === 'text' && fields.length <= 4 ? 'col-span-2' : 'col-span-1'}>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 font-mono tracking-wider">{field.label}</label>
                                {field.type === 'select' ? (
                                    <select 
                                        value={formData[field.key] || ''}
                                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                                        className="w-full bg-black/40 border border-military-600 text-white text-xs rounded p-2 focus:border-military-accent focus:outline-none font-mono"
                                    >
                                        <option value="">Select...</option>
                                        {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                ) : (
                                    <input 
                                        type={field.type}
                                        value={formData[field.key] || ''}
                                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                                        placeholder={field.placeholder}
                                        className="w-full bg-black/40 border border-military-600 text-white text-xs rounded p-2 focus:border-military-accent focus:outline-none font-mono placeholder-gray-700"
                                    />
                                )}
                            </div>
                        ))}
                    </form>

                    {/* Media Interface */}
                    <div className="flex-1 bg-black/30 border border-military-700 rounded-lg p-4 relative overflow-hidden flex flex-col md:flex-row gap-4">
                        
                        {/* Media Controls / Status */}
                        <div className="flex flex-col gap-2 w-full md:w-32 flex-shrink-0">
                            <span className="text-[10px] font-bold text-gray-500 uppercase mb-1">ATTACHMENTS</span>
                            
                            {/* Camera Toggle */}
                            <button 
                                onClick={capturedImage ? () => setCapturedImage(null) : startCamera}
                                disabled={mediaMode === 'AUDIO' || (mediaMode === 'CAMERA' && !capturedImage)}
                                className={`flex items-center justify-center p-2 rounded border transition-all ${
                                    capturedImage 
                                    ? 'bg-green-900/30 border-green-500 text-green-400' 
                                    : mediaMode === 'CAMERA' ? 'bg-military-accent border-military-accent text-white' : 'border-military-600 text-gray-400 hover:text-white'
                                } disabled:opacity-30`}
                            >
                                {capturedImage ? <Trash2 size={16} /> : <Camera size={16} />}
                                <span className="ml-2 text-xs font-bold">{capturedImage ? 'CLEAR' : 'VISUAL'}</span>
                            </button>

                            {/* Audio Toggle */}
                            <button 
                                onClick={audioBlob ? () => setAudioBlob(null) : startAudio}
                                disabled={mediaMode === 'CAMERA' || (mediaMode === 'AUDIO' && isRecording)}
                                className={`flex items-center justify-center p-2 rounded border transition-all ${
                                    audioBlob
                                    ? 'bg-green-900/30 border-green-500 text-green-400'
                                    : mediaMode === 'AUDIO' ? 'bg-red-600 border-red-500 text-white' : 'border-military-600 text-gray-400 hover:text-white'
                                } disabled:opacity-30`}
                            >
                                {audioBlob ? <Trash2 size={16} /> : <Mic size={16} />}
                                <span className="ml-2 text-xs font-bold">{audioBlob ? 'CLEAR' : 'VOICE'}</span>
                            </button>

                            {/* File Upload */}
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                onChange={handleFileSelect}
                            />
                            <button 
                                onClick={() => attachedFile ? setAttachedFile(null) : fileInputRef.current?.click()}
                                disabled={mediaMode === 'CAMERA' || mediaMode === 'AUDIO'}
                                className={`flex items-center justify-center p-2 rounded border transition-all ${
                                    attachedFile
                                    ? 'bg-green-900/30 border-green-500 text-green-400'
                                    : 'border-military-600 text-gray-400 hover:text-white'
                                } disabled:opacity-30`}
                            >
                                {attachedFile ? <Trash2 size={16} /> : <Paperclip size={16} />}
                                <span className="ml-2 text-xs font-bold">{attachedFile ? 'CLEAR' : 'FILE'}</span>
                            </button>
                        </div>

                        {/* Media Display Area */}
                        <div className="flex-1 bg-black border border-military-700 rounded relative flex items-center justify-center overflow-hidden">
                            {/* Placeholder / Default State */}
                            {mediaMode === 'NONE' && !capturedImage && !audioBlob && !attachedFile && (
                                <div className="text-gray-600 flex flex-col items-center">
                                    <div className="flex space-x-2 mb-2">
                                        <Camera size={24} className="opacity-50"/>
                                        <Mic size={24} className="opacity-50"/>
                                        <Paperclip size={24} className="opacity-50"/>
                                    </div>
                                    <span className="text-[10px] uppercase tracking-widest">No Media Attached</span>
                                </div>
                            )}

                            {/* Live Camera Feed */}
                            {mediaMode === 'CAMERA' && !capturedImage && (
                                <div className="relative w-full h-full">
                                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 flex items-end justify-center pb-4">
                                        <button 
                                            onClick={capturePhoto}
                                            className="w-12 h-12 rounded-full border-4 border-white bg-red-600 hover:scale-110 transition-transform shadow-lg"
                                        ></button>
                                    </div>
                                    <canvas ref={canvasRef} className="hidden" />
                                </div>
                            )}

                            {/* Captured Image Preview */}
                            {capturedImage && (
                                <div className="relative w-full h-full">
                                    <img src={capturedImage} alt="Captured" className="w-full h-full object-contain" />
                                    <div className="absolute top-2 right-2 bg-green-500 text-black text-[10px] font-bold px-2 py-1 rounded">IMAGE SECURED</div>
                                </div>
                            )}

                            {/* Audio Recording UI */}
                            {mediaMode === 'AUDIO' && isRecording && (
                                <div className="flex flex-col items-center justify-center w-full h-full bg-red-900/10">
                                    <div className="w-16 h-16 rounded-full bg-red-600 animate-ping mb-4 absolute opacity-20"></div>
                                    <Mic size={32} className="text-red-500 relative z-10 animate-pulse" />
                                    <span className="text-red-400 font-mono font-bold mt-4 text-lg">{formatTime(recordingTime)}</span>
                                    <button 
                                        onClick={stopRecording}
                                        className="mt-4 px-4 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold flex items-center"
                                    >
                                        <StopCircle size={14} className="mr-2"/> STOP REC
                                    </button>
                                </div>
                            )}

                            {/* Recorded Audio Preview */}
                            {audioBlob && (
                                <div className="flex flex-col items-center justify-center w-full h-full bg-green-900/10">
                                    <Radio size={32} className="text-green-500 mb-2" />
                                    <span className="text-green-400 font-mono text-xs font-bold uppercase mb-2">Voice Note Captured</span>
                                    <audio controls src={URL.createObjectURL(audioBlob)} className="h-8 w-3/4 opacity-70" />
                                </div>
                            )}

                            {/* File Preview */}
                            {attachedFile && (
                                <div className="flex flex-col items-center justify-center w-full h-full bg-blue-900/10">
                                    <FileText size={32} className="text-blue-500 mb-2" />
                                    <span className="text-blue-400 font-mono text-xs font-bold uppercase mb-2 text-center max-w-[200px] truncate">{attachedFile.name}</span>
                                    <span className="text-blue-500/50 text-[10px]">{(attachedFile.size / 1024).toFixed(1)} KB</span>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="mt-4 flex justify-end items-center border-t border-military-700/50 pt-4">
                        <button 
                            onClick={handleSubmit}
                            disabled={status === 'SAVING'}
                            className={`px-6 py-2 rounded bg-military-accent hover:bg-sky-500 text-white font-bold text-xs flex items-center shadow-lg transition-all ${status === 'SAVING' ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {status === 'SAVING' ? (
                                <><Database className="mr-2 animate-bounce" size={14} /> ENCODING...</>
                            ) : (
                                <><Save className="mr-2" size={14} /> COMMIT DATA PACKAGE</>
                            )}
                        </button>
                    </div>
                </div>

                {/* Live Log Area */}
                <div className="bg-black rounded border border-military-700 p-3 font-mono text-[10px] overflow-hidden flex flex-col relative h-full">
                    <div className="absolute top-0 right-0 p-2 text-military-600 opacity-20"><Hash size={48}/></div>
                    <h4 className="text-gray-500 font-bold border-b border-military-800 pb-1 mb-2">LOCAL_BUFFER_LOG</h4>
                    <div className="flex-1 overflow-y-auto space-y-1">
                        {logs.length === 0 && <span className="text-gray-700 italic">No recent entries...</span>}
                        {logs.map((log, idx) => (
                            <div key={idx} className="text-green-500/80 animate-in slide-in-from-left-2 break-words">{log}</div>
                        ))}
                    </div>
                    <div className="mt-2 text-right text-gray-600">
                        STATUS: <span className="text-green-500">ONLINE</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DataEntryTerminal;
