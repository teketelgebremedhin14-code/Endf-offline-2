
import React, { useState, useRef, useEffect } from 'react';
import { X, Mic, Send, StopCircle, RefreshCw } from 'lucide-react';
import { analyzeFieldInsight } from '../services/ollamaService';
import { useLanguage } from '../contexts/LanguageContext';

interface FeedbackModalProps {
    onClose: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ onClose }) => {
    const { t, language } = useLanguage();
    const [insight, setInsight] = useState('');
    const [analysis, setAnalysis] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Recording State
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    useEffect(() => {
        return () => {
            if (mediaRecorderRef.current && isRecording) {
                mediaRecorderRef.current.stop();
                mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
            }
        };
    }, [isRecording]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data);
            };

            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                setAudioBlob(blob);
                stream.getTracks().forEach(t => t.stop());
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Microphone access error:", err);
            alert("Could not access microphone.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const handleSubmit = async () => {
        if (!insight.trim() && !audioBlob) return;
        setIsSubmitting(true);
        
        let audioBase64: string | undefined;
        if (audioBlob) {
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            await new Promise<void>((resolve) => {
                reader.onloadend = () => {
                    audioBase64 = reader.result as string;
                    resolve();
                };
            });
        }

        const result = await analyzeFieldInsight(insight, language, audioBase64);
        setAnalysis(result);
        setIsSubmitting(false);
        setAudioBlob(null); // Reset audio after submission
    };

    const clearAudio = () => {
        setAudioBlob(null);
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
            <div className="bg-military-800 rounded-lg border border-military-600 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="bg-red-900/20 border-b border-red-900/50 p-4 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-red-500 flex items-center">
                        <span className="w-3 h-3 bg-red-500 rounded-full mr-3 animate-pulse"></span>
                        {t('feedback_title')}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="p-6 space-y-4">
                    <p className="text-sm text-gray-300">
                        {t('feedback_desc')}
                    </p>

                    <textarea
                        value={insight}
                        onChange={(e) => setInsight(e.target.value)}
                        className="w-full bg-military-900 border border-military-600 rounded p-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 h-32 resize-none"
                        placeholder={t('feedback_placeholder')}
                    />

                    {audioBlob && (
                        <div className="flex items-center justify-between bg-military-900 p-3 rounded border border-military-600">
                            <audio controls src={URL.createObjectURL(audioBlob)} className="h-8 w-64" />
                            <button onClick={clearAudio} className="text-red-400 hover:text-red-300 text-xs font-bold">REMOVE</button>
                        </div>
                    )}

                    {analysis && (
                        <div className="bg-military-900/50 p-3 rounded border border-military-600 text-sm">
                            <span className="text-purple-400 font-bold block mb-1">{t('feedback_ai_triage')}</span>
                            <p className="text-gray-300 italic">{analysis}</p>
                        </div>
                    )}

                    <div className="flex justify-between items-center pt-2">
                        {isRecording ? (
                            <button 
                                onClick={stopRecording}
                                className="text-red-500 hover:text-red-400 flex items-center text-sm animate-pulse font-bold"
                            >
                                <StopCircle size={16} className="mr-1"/> STOP RECORDING
                            </button>
                        ) : (
                            <button 
                                onClick={startRecording}
                                className="text-gray-400 hover:text-white flex items-center text-sm"
                            >
                                <Mic size={16} className="mr-1"/> {t('btn_record')}
                            </button>
                        )}
                        
                        <button 
                            onClick={handleSubmit}
                            disabled={isSubmitting || (!insight && !audioBlob)}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-medium flex items-center disabled:opacity-50"
                        >
                            {isSubmitting ? <><RefreshCw size={16} className="mr-2 animate-spin"/> Processing...</> : <><Send size={16} className="mr-2"/> {t('btn_submit_insight')}</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeedbackModal;
