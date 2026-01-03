
import React, { useState, useEffect } from 'react';
import { FileText, Download, Plus, Search, Filter, Loader, AlertTriangle, Check, MessageSquare, X } from 'lucide-react';
import { generateReport } from '../services/ollamaService';
import DocumentViewer from '../components/DocumentViewer';
import { useLanguage } from '../contexts/LanguageContext';

interface Report {
    id: string;
    title: string;
    date: string;
    type: string;
    status: string;
    content: string;
    classification: 'UNCLASSIFIED' | 'CONFIDENTIAL' | 'SECRET' | 'TOP SECRET';
}

interface ReportsViewProps {
    onBack?: () => void;
    onFeedback?: () => void;
}

const ReportsView: React.FC<ReportsViewProps> = ({ onBack, onFeedback }) => {
    const { t, language } = useLanguage();
    const [generating, setGenerating] = useState(false);
    const [selectedReportType, setSelectedReportType] = useState('Daily SitRep');
    const [viewingReport, setViewingReport] = useState<Report | null>(null);
    const [reports, setReports] = useState<Report[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        // Reset reports when language changes to ensure translation
        setReports([
            { 
                id: 'R-2024-001', 
                title: t('rep_sample_log_title'), 
                date: '2024-03-10', 
                type: 'Logistics', 
                status: 'Final', 
                classification: 'CONFIDENTIAL',
                content: t('rep_sample_log_body')
            },
            { 
                id: 'R-2024-002', 
                title: t('rep_sample_intel_title'), 
                date: '2024-03-09', 
                type: 'Intelligence', 
                status: 'Classified', 
                classification: 'SECRET',
                content: t('rep_sample_intel_body')
            },
            { 
                id: 'R-2024-003', 
                title: t('rep_sample_hr_title'), 
                date: '2024-03-08', 
                type: 'HR', 
                status: 'Draft', 
                classification: 'UNCLASSIFIED',
                content: t('rep_sample_hr_body')
            },
        ]);
    }, [t]);

    const handleGenerate = async () => {
        setGenerating(true);
        const content = await generateReport(selectedReportType, language);
        
        const newReport: Report = {
            id: `R-2024-${Math.floor(Math.random() * 900) + 100}`,
            title: `${selectedReportType} - Automated`,
            date: new Date().toISOString().split('T')[0],
            type: 'Automated',
            status: 'Draft',
            classification: 'SECRET',
            content: content
        };
        
        setReports([newReport, ...reports]);
        setGenerating(false);
        setViewingReport(newReport); // Auto-open
    };

    const filteredReports = reports.filter(report => 
        report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500 h-[calc(100vh-140px)] flex flex-col">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center flex-shrink-0">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">{t('rep_title')}</h2>
                    <p className="text-gray-400 text-sm">{t('rep_subtitle')}</p>
                </div>
                {onBack && (
                    <button 
                        onClick={onBack}
                        className="mt-2 md:mt-0 p-2 text-gray-400 hover:text-white hover:bg-military-700 rounded transition-colors"
                        title="Exit / Back"
                    >
                        <X size={20} />
                    </button>
                )}
            </div>

            <div className="flex-1 min-h-0 bg-military-800 rounded-lg border border-military-700 flex flex-col">
                <div className="p-4 border-b border-military-700 bg-military-900/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 flex-shrink-0">
                    <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3 flex-1 w-full">
                         <div className="relative flex-1 w-full sm:max-w-md">
                            <Search className="absolute left-3 top-2.5 text-gray-500" size={14} />
                            <input 
                                type="text" 
                                placeholder={t('searchPlaceholder')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-military-900 border border-military-600 rounded pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-military-accent"
                            />
                        </div>
                        <select 
                            value={selectedReportType}
                            onChange={(e) => setSelectedReportType(e.target.value)}
                            className="w-full sm:w-auto bg-military-900 border border-military-600 text-white text-sm rounded px-3 py-2 focus:outline-none"
                         >
                             <option>Daily SitRep</option>
                             <option>Logistics Summary</option>
                             <option>Intelligence Brief</option>
                             <option>Incident Report</option>
                         </select>
                    </div>
                    <div className="flex space-x-2 w-full md:w-auto">
                         <button 
                            onClick={onFeedback}
                            className="flex-1 md:flex-none bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded flex items-center justify-center transition-colors whitespace-nowrap shadow-lg"
                         >
                             <MessageSquare size={14} className="mr-2" />
                             ADD INSIGHT
                         </button>
                         <button 
                            onClick={handleGenerate} 
                            disabled={generating}
                            className="flex-1 md:flex-none bg-military-accent hover:bg-sky-500 text-white text-xs font-bold px-4 py-2 rounded flex items-center justify-center disabled:opacity-50 transition-colors whitespace-nowrap"
                         >
                             {generating ? <Loader size={14} className="animate-spin mr-2" /> : <Plus size={14} className="mr-2" />}
                             {t('rep_generate_btn')}
                         </button>
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredReports.map((report) => (
                            <div 
                                key={report.id} 
                                onClick={() => setViewingReport(report)}
                                className="p-4 bg-military-900/50 hover:bg-military-700 rounded cursor-pointer border border-military-700 hover:border-military-500 transition-all group flex flex-col h-40"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="bg-gray-800 p-2 rounded text-gray-400 group-hover:text-white transition-colors">
                                        <FileText size={20} />
                                    </div>
                                    <span className={`text-[10px] px-2 py-0.5 rounded border font-bold ${
                                        report.classification === 'TOP SECRET' ? 'bg-red-900/20 text-red-400 border-red-900' :
                                        report.classification === 'SECRET' ? 'bg-orange-900/20 text-orange-400 border-orange-900' :
                                        'bg-green-900/20 text-green-400 border-green-900'
                                    }`}>{report.classification}</span>
                                </div>
                                <h4 className="text-sm font-semibold text-gray-200 group-hover:text-white line-clamp-2 mb-auto">{report.title}</h4>
                                
                                <div className="border-t border-military-700 pt-2 mt-2 flex justify-between items-center text-xs text-gray-500">
                                    <span>{report.id}</span>
                                    <span>{report.date}</span>
                                </div>
                            </div>
                        ))}
                        {filteredReports.length === 0 && (
                            <div className="col-span-full text-center text-gray-500 py-10">
                                <Search size={32} className="mx-auto mb-2 opacity-20" />
                                <p className="text-sm">No reports found matching your search.</p>
                            </div>
                        )}
                     </div>
                </div>
            </div>

            {/* Document Viewer Modal */}
            {viewingReport && (
                <DocumentViewer 
                    title={viewingReport.title}
                    content={viewingReport.content}
                    type={viewingReport.type}
                    date={viewingReport.date}
                    classification={viewingReport.classification}
                    onClose={() => setViewingReport(null)}
                />
            )}
        </div>
    );
};

export default ReportsView;
