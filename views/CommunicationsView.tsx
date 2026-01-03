
import React, { useState, useEffect, useRef } from 'react';
import { Wifi, Radio, Server, Globe, Lock, Activity, ShieldCheck, AlertTriangle, Key, Languages, Mic, X } from 'lucide-react';
import MetricCard from '../components/MetricCard';
import { useLanguage } from '../contexts/LanguageContext';
import { generateRadioChatter } from '../services/ollamaService';

interface CommunicationsViewProps {
    onBack?: () => void;
}

const CommunicationsView: React.FC<CommunicationsViewProps> = ({ onBack }) => {
    const { t } = useLanguage();
    const [frequencies, setFrequencies] = useState([
        { band: 'HF', usage: 45, status: t('status_clear'), color: 'bg-green-500' },
        { band: 'VHF', usage: 78, status: t('status_congested'), color: 'bg-yellow-500' },
        { band: 'UHF', usage: 32, status: t('status_clear'), color: 'bg-green-500' },
        { band: 'SAT', usage: 92, status: t('status_high_load'), color: 'bg-red-500' },
    ]);
    const [translationActive, setTranslationActive] = useState(false);
    const [liveTranscript, setLiveTranscript] = useState<string[]>([]);
    const [isFetching, setIsFetching] = useState(false);
    const transcriptRef = useRef<HTMLDivElement>(null);

    // Simulate spectrum changes
    useEffect(() => {
        const interval = setInterval(() => {
            setFrequencies(prev => prev.map(f => ({
                ...f,
                usage: Math.min(100, Math.max(0, f.usage + (Math.random() - 0.5) * 10))
            })));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Live AI Translation Stream - Optimized for Local LLM
    useEffect(() => {
        let interval: any;
        if (translationActive) {
            // Initial fetch
            if (!isFetching) fetchChatter();
            
            // Poll less frequently to respect local CPU (every 12s)
            interval = setInterval(() => {
                if (!isFetching) {
                    fetchChatter();
                }
            }, 12000); 
        }
        return () => clearInterval(interval);
    }, [translationActive, isFetching]);

    // Auto-scroll transcript
    useEffect(() => {
        if (transcriptRef.current) {
            transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
        }
    }, [liveTranscript]);

    const fetchChatter = async () => {
        setIsFetching(true);
        try {
            const batch = await generateRadioChatter();
            if (batch && batch.length > 0) {
                // Add items one by one for visual effect
                batch.forEach((item: any, i: number) => {
                    setTimeout(() => {
                        setLiveTranscript(prev => [`[${new Date().toLocaleTimeString()}] ${item.org} >> ${item.trans}`, ...prev].slice(0, 20));
                    }, i * 1500);
                });
            }
        } catch (e) {
            console.error("Failed to fetch chatter", e);
        } finally {
            setIsFetching(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 flex flex-col h-[calc(100vh-140px)]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2 flex-shrink-0">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight font-display">{t('comms_title')}</h2>
                    <p className="text-gray-400 text-sm font-sans">{t('comms_subtitle')}</p>
                </div>
                <div className="mt-4 md:mt-0 flex gap-2 items-center">
                    <div className="bg-green-900/20 px-3 py-1 rounded border border-green-500/30 flex items-center">
                        <Lock className="text-green-400 mr-2" size={16} />
                        <span className="text-xs font-mono text-green-300">NETSEC: LEVEL 5 ({t('status_high').toUpperCase()})</span>
                    </div>
                    {onBack && (
                        <button onClick={onBack} className="p-2 text-gray-400 hover:text-white hover:bg-military-700 rounded transition-colors" title="Exit / Back">
                            <X size={20} />
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-shrink-0">
                <MetricCard title={t('comms_metric_uptime')} value="99.99%" icon={Activity} color="success" />
                <MetricCard title={t('comms_metric_channels')} value="4,200" change={12} icon={Lock} color="accent" />
                <MetricCard title={t('comms_metric_sats')} value="3" icon={Globe} />
                <MetricCard title={t('comms_metric_jamming')} value="45/hr" change={5} icon={Radio} color="warning" />
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0 overflow-y-auto">
                {/* Frequency Spectrum Analyzer */}
                <div className="bg-military-800 rounded-lg p-6 border border-military-700">
                    <h3 className="font-semibold text-lg text-white mb-6 flex items-center">
                        <Activity className="mr-2 text-military-accent" size={20} /> {t('comms_spectrum')}
                    </h3>
                    <div className="space-y-6">
                        {frequencies.map((freq) => (
                            <div key={freq.band}>
                                <div className="flex justify-between items-end mb-2">
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-200">{t(`comms_band_${freq.band.toLowerCase()}` as any)}</h4>
                                        <p className="text-xs text-gray-500">{freq.status}</p>
                                    </div>
                                    <span className="text-sm font-bold text-white font-mono">{freq.usage.toFixed(1)}%</span>
                                </div>
                                <div className="w-full bg-military-900 rounded-full h-3 overflow-hidden border border-military-600">
                                    <div 
                                        className={`h-full transition-all duration-500 ${freq.usage > 80 ? 'bg-red-500' : freq.usage > 60 ? 'bg-yellow-500' : 'bg-green-500'}`} 
                                        style={{ width: `${freq.usage}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Multilingual Battlefield Communication System (Part 5.3.1) */}
                    <div className="bg-military-800 rounded-lg border border-military-700 flex flex-col">
                        <div className="p-4 border-b border-military-700 bg-military-900/50 flex justify-between items-center">
                            <h3 className="font-semibold text-white flex items-center">
                                <Languages size={16} className="mr-2 text-purple-400" /> 
                                GLOBENET AI Translation Stream
                            </h3>
                            <button 
                                onClick={() => setTranslationActive(!translationActive)}
                                className={`text-[10px] px-2 py-1 rounded font-bold transition-colors ${translationActive ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400'}`}
                            >
                                {translationActive ? 'ACTIVE' : 'OFFLINE'}
                            </button>
                        </div>
                        <div className="p-4 flex-1 h-48 overflow-hidden relative">
                            {translationActive ? (
                                <div className="h-full flex flex-col">
                                    <div ref={transcriptRef} className="flex-1 space-y-2 overflow-y-auto font-mono text-xs pr-2 custom-scrollbar">
                                        {liveTranscript.map((line, i) => (
                                            <div key={i} className="text-gray-300 border-l-2 border-purple-500 pl-2 animate-in slide-in-from-left-2 break-words">
                                                {line}
                                            </div>
                                        ))}
                                        {liveTranscript.length === 0 && !isFetching && <div className="text-gray-500 italic">Listening for multi-lingual chatter...</div>}
                                    </div>
                                    {isFetching && <div className="text-[10px] text-purple-400 animate-pulse mt-2">Deciphering Signal...</div>}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-gray-600">
                                    <Mic size={32} className="mb-2 opacity-20" />
                                    <p className="text-xs uppercase">AI Translation Subsystem Standby</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Encryption Status */}
                    <div className="bg-military-800 rounded-lg p-6 border border-military-700">
                         <h3 className="font-semibold text-lg text-white mb-4 flex items-center">
                            <Key className="mr-2 text-yellow-500" size={20} /> {t('comms_encryption')}
                        </h3>
                        <div className="flex justify-between items-center mb-4 p-3 bg-green-900/20 border border-green-900/50 rounded">
                            <div>
                                <h4 className="text-sm font-bold text-green-400">{t('comms_key_rotation')}</h4>
                                <p className="text-xs text-gray-400">Next scheduled rotation in 04:22:15</p>
                            </div>
                            <ShieldCheck className="text-green-500" size={24} />
                        </div>
                        <div className="space-y-2">
                             <div className="flex justify-between text-xs text-gray-300">
                                 <span>Tactical Radio (AES-256)</span>
                                 <span className="text-green-500">{t('status_secure')}</span>
                             </div>
                             <div className="flex justify-between text-xs text-gray-300">
                                 <span>Data Link 16</span>
                                 <span className="text-green-500">{t('status_secure')}</span>
                             </div>
                             <div className="flex justify-between text-xs text-gray-300">
                                 <span>Civilian Interconnect</span>
                                 <span className="text-yellow-500">{t('status_monitored')}</span>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommunicationsView;
