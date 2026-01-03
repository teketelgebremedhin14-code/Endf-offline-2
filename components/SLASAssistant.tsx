
import React, { useState, useRef, useEffect } from 'react';
import { Mic, Send, Bot, AlertCircle, StopCircle, Volume2, VolumeX, Radio, Activity, FileText, CheckSquare, Zap, Clock, X, ChevronDown, Camera, Image as ImageIcon } from 'lucide-react';
import { streamSLASResponse, generateSpeech } from '../services/ollamaService';
import { ChatMessage } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface SLASAssistantProps {
  currentView: string;
}

const SLASAssistant: React.FC<SLASAssistantProps> = ({ currentView }) => {
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false); // Used for TTS output
  const [liveMode, setLiveMode] = useState(false); // Deprecated in Ollama version
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: t('slas_welcome'), timestamp: new Date() }
  ]);
  
  // Camera State
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(prev => {
        if (prev.length === 1 && prev[0].id === '1') {
            return [{ id: '1', role: 'model', text: t('slas_welcome'), timestamp: new Date() }];
        }
        return prev;
    });
  }, [t]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  // Camera Functions
  const startCamera = async () => {
      try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          mediaStreamRef.current = stream;
          if (videoRef.current) {
              videoRef.current.srcObject = stream;
          }
          setShowCamera(true);
      } catch (err) {
          console.error("Camera error:", err);
          alert("Unable to access camera.");
      }
  };

  const stopCamera = () => {
      if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach(track => track.stop());
          mediaStreamRef.current = null;
      }
      setShowCamera(false);
  };

  const captureImage = () => {
      if (videoRef.current && canvasRef.current) {
          const context = canvasRef.current.getContext('2d');
          canvasRef.current.width = videoRef.current.videoWidth;
          canvasRef.current.height = videoRef.current.videoHeight;
          context?.drawImage(videoRef.current, 0, 0);
          const dataUrl = canvasRef.current.toDataURL('image/jpeg');
          setCapturedImage(dataUrl);
          stopCamera();
      }
  };

  const handleSend = async (customText?: string) => {
    const textToSend = customText || input;
    const imageToSend = capturedImage;
    
    if ((!textToSend.trim() && !imageToSend) || loading) return;
    
    // Display message
    let displayText = textToSend;
    if (imageToSend && !textToSend) displayText = "[Image Attached]";
    
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: displayText, timestamp: new Date() };
    const currentHistory = [...messages, userMsg];
    setMessages(currentHistory);
    setInput('');
    setCapturedImage(null);
    setLoading(true);

    const botMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: botMsgId, role: 'model', text: '', timestamp: new Date() }]);

    let fullText = '';
    try {
        const stream = streamSLASResponse(textToSend || "Analyze this image.", currentView, currentHistory, language, imageToSend || undefined); 

        for await (const chunk of stream) {
            fullText += chunk;
            setMessages(prev => prev.map(msg => 
                msg.id === botMsgId ? { ...msg, text: fullText } : msg
            ));
        }
    } catch (e) {
        setMessages(prev => prev.map(msg => 
            msg.id === botMsgId ? { ...msg, text: "Error: Local AI Uplink Failed. Ensure Ollama is running." } : msg
        ));
    } finally {
        setLoading(false);
    }
  };

  return (
    <>
      {/* Mobile Trigger / Main Toggle */}
      <div className={`fixed z-[100] transition-all duration-300 ${isOpen ? 'inset-0' : 'bottom-16 right-4 md:bottom-6 md:right-6 w-auto'}`}>
        
        {/* Chat Interface Container */}
        {isOpen && (
          <div className="w-full h-full md:w-96 md:h-auto md:max-h-[80vh] bg-military-900 md:bg-military-800 md:border md:border-military-600 md:rounded-lg shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300 relative">
            
            {/* Header */}
            <div className="bg-military-900 p-4 md:p-3 border-b border-military-700 flex justify-between items-center shrink-0">
              <div className="flex items-center space-x-2">
                <Bot size={20} className="text-military-accent animate-pulse" />
                <span className="font-bold text-sm tracking-wider font-display text-white">{t('slas_module_title')}</span>
              </div>
              <div className="flex items-center space-x-3">
                  <span className="text-[10px] text-green-500 font-mono flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                      LOCAL LLAMA-3
                  </span>
                  <button onClick={() => { setIsOpen(false); }} className="text-gray-400 hover:text-white p-2">
                      <ChevronDown size={24} className="md:hidden" />
                      <X size={20} className="hidden md:block" />
                  </button>
              </div>
            </div>
            
            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-military-900/95 custom-scrollbar relative" ref={scrollRef}>
                <div className="flex justify-center">
                    <span className="text-[10px] bg-military-800 text-gray-400 px-2 py-0.5 rounded-full uppercase font-mono tracking-wide border border-military-700">
                        Context: {currentView}
                    </span>
                </div>

                {/* Camera Overlay */}
                {showCamera && (
                    <div className="absolute inset-0 bg-black z-20 flex flex-col">
                        <video ref={videoRef} autoPlay playsInline className="flex-1 w-full object-cover" />
                        <div className="p-4 flex justify-center space-x-4 bg-black/80">
                            <button onClick={stopCamera} className="bg-gray-700 px-4 py-2 rounded text-white text-xs font-bold">CANCEL</button>
                            <button onClick={captureImage} className="bg-red-600 px-6 py-2 rounded text-white text-xs font-bold">CAPTURE</button>
                        </div>
                        <canvas ref={canvasRef} className="hidden" />
                    </div>
                )}

                {/* 4.1 Feature Shortcuts */}
                {messages.length === 1 && (
                    <div className="grid grid-cols-1 gap-2 animate-in fade-in slide-in-from-bottom-2">
                        <button onClick={() => handleSend("Generate a situation report based on current metrics.")} className="flex items-center p-4 bg-military-800 border border-military-600 rounded text-sm text-gray-300 hover:bg-military-700 hover:text-white text-left transition-colors active:scale-95">
                            <FileText size={18} className="mr-3 text-blue-400" />
                            {t('slas_action_report')}
                        </button>
                        <button onClick={() => handleSend("Check for pending approvals requiring executive action.")} className="flex items-center p-4 bg-military-800 border border-military-600 rounded text-sm text-gray-300 hover:bg-military-700 hover:text-white text-left transition-colors active:scale-95">
                            <CheckSquare size={18} className="mr-3 text-green-400" />
                            {t('slas_action_approve')}
                        </button>
                        <button onClick={() => handleSend("Analyze resource allocation and suggest predictive tasks.")} className="flex items-center p-4 bg-military-800 border border-military-600 rounded text-sm text-gray-300 hover:bg-military-700 hover:text-white text-left transition-colors active:scale-95">
                            <Clock size={18} className="mr-3 text-yellow-400" />
                            {t('slas_action_task')}
                        </button>
                    </div>
                )}

                {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3 rounded-lg text-sm shadow-md leading-relaxed ${
                        msg.role === 'user' 
                        ? 'bg-military-accent text-white rounded-br-none font-sans font-medium' 
                        : 'bg-military-800 text-gray-200 rounded-bl-none border-l-2 border-military-accent font-sans'
                    }`}>
                    {msg.text}
                    {msg.role === 'model' && loading && msg.id === messages[messages.length - 1].id && (
                        <span className="inline-block w-2 h-4 bg-green-500 ml-1 animate-pulse align-middle"></span>
                    )}
                    </div>
                </div>
                ))}
            </div>

            {/* Captured Image Preview */}
            {capturedImage && (
                <div className="bg-military-800 p-2 border-t border-military-700 flex items-center justify-between">
                    <div className="flex items-center">
                        <img src={capturedImage} alt="Captured" className="h-10 w-10 object-cover rounded border border-military-600" />
                        <span className="ml-2 text-xs text-green-400 font-mono">[IMAGE READY - TEXT SIM]</span>
                    </div>
                    <button onClick={() => setCapturedImage(null)} className="text-gray-400 hover:text-white"><X size={16}/></button>
                </div>
            )}

            {/* Input Area */}
            <div className="p-3 bg-military-900 border-t border-military-700 flex items-center space-x-2 shrink-0 pb-safe md:pb-3">
              <button 
                onClick={startCamera} 
                disabled={loading || !!capturedImage}
                className="p-2 text-gray-400 hover:text-white rounded-full bg-military-800 border border-military-600 disabled:opacity-30"
              >
                  <Camera size={20} />
              </button>

              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={capturedImage ? "Add context..." : t('slas_placeholder')}
                className="flex-1 bg-military-800 border border-military-600 rounded-full px-4 py-3 text-base focus:outline-none focus:border-military-accent text-white placeholder-gray-500 font-sans"
                disabled={loading}
              />
              <button 
                onClick={() => handleSend()} 
                disabled={loading || (!input && !capturedImage)} 
                className="p-3 bg-military-accent hover:bg-sky-500 rounded-full text-white disabled:opacity-50 disabled:bg-gray-700 transition-colors shadow-lg"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Floating Action Button (Only visible when closed) */}
        {!isOpen && (
            <button 
                onClick={() => setIsOpen(true)}
                className="flex items-center justify-center w-14 h-14 md:w-auto md:h-auto md:px-6 md:py-3 rounded-full shadow-2xl transition-all border border-military-accent/50 bg-military-accent text-white hover:bg-sky-400 hover:scale-105 active:scale-95"
            >
                <div className="relative flex items-center">
                    <Bot size={28} className={loading ? "animate-spin" : ""} />
                    <span className="hidden md:inline font-semibold pl-2 font-display tracking-wide">SLAS AI</span>
                </div>
            </button>
        )}
      </div>
    </>
  );
};

export default SLASAssistant;
