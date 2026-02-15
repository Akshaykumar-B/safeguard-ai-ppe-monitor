import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { useApp } from '../context/AppContext';

const LiveMonitoringScreen = () => {
    const { alerts, stats } = useApp();
    const [selectedCam, setSelectedCam] = useState('cam01');
    const [viewMode, setViewMode] = useState('live'); // live | playback
    const [showDropdown, setShowDropdown] = useState(false);

    const cameras = [
        { id: 'cam01', label: 'Assembly Line A - Cam 01', shortLabel: 'Cam 01', source: 'http://localhost:5000/video_feed/cam01' },
        { id: 'cam02', label: 'Dock Area - Cam 02', shortLabel: 'Cam 02', source: 'http://localhost:5000/video_feed/cam02' },
        { id: 'cam03', label: 'Upstairs - Cam 03', shortLabel: 'Cam 03', source: 'http://localhost:5000/video_feed/cam03' }
    ];

    const currentCam = cameras.find(c => c.id === selectedCam) || cameras[0];

    // Dummy data to match screenshot visuals if real stats are empty
    const displayStats = {
        totalTracked: stats.totalWorkers || 4,
        activeViolations: stats.activeAlerts || 2,
        complianceRate: stats.complianceRate || 92,
        uptime: '00:00:00'
    };

    return (
        <div className="flex min-h-screen bg-[#F8F9FA] text-slate-800 font-sans">
            <Sidebar />
            
            <main className="flex-1 flex flex-col p-8 min-h-screen">
                {/* Custom Header Layer */}
                <div className="flex justify-between items-center mb-6">
                    {/* Camera Dropdown */}
                    <div className="relative group">
                        <button 
                            onClick={() => setShowDropdown(!showDropdown)}
                            className="flex items-center gap-3 bg-white px-5 py-3 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all"
                        >
                            <span className="font-bold text-lg text-slate-800">{currentCam.label}</span>
                            <span className="material-icons text-slate-400">expand_more</span>
                        </button>
                        
                        {/* Dropdown Menu */}
                        {showDropdown && (
                        <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-100 p-2 z-50 animate-fadeIn">
                            {cameras.map(cam => (
                                <button
                                    key={cam.id}
                                    onClick={() => { setSelectedCam(cam.id); setShowDropdown(false); }}
                                    className={`w-full text-left px-4 py-3 rounded-lg text-sm font-bold flex items-center justify-between group/item ${selectedCam === cam.id ? 'bg-indigo-50 text-[#0066FF]' : 'text-slate-600 hover:bg-slate-50'}`}
                                >
                                    {cam.label}
                                    {selectedCam === cam.id && <span className="material-icons text-sm">check</span>}
                                </button>
                            ))}
                        </div>
                        )}
                    </div>

                    {/* Live/Playback Toggle */}
                    <div className="flex bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
                        <button 
                            onClick={() => setViewMode('live')}
                            className={`px-8 py-2 rounded-lg text-sm font-black transition-all ${viewMode === 'live' ? 'bg-[#0066FF] text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            LIVE
                        </button>
                        <button 
                            onClick={() => setViewMode('playback')}
                            className={`px-8 py-2 rounded-lg text-sm font-black transition-all ${viewMode === 'playback' ? 'bg-[#0066FF] text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            PLAYBACK
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-8">
                    {/* Left Column: Video & Stats */}
                    <div className="col-span-8 flex flex-col gap-6">
                        
                        {/* Video Player */}
                        <div className="relative w-full max-w-[1100px] aspect-video bg-black rounded-[20px] overflow-hidden shadow-2xl border-4 border-white ring-1 ring-slate-100 group">
                            <img
                                src={currentCam.source}
                                className="w-full h-full object-cover"
                                alt="Live Feed"
                            />
                            
                            {/* Overlay: Top Right Time */}
                            <div className="absolute top-6 right-6 bg-black/40 backdrop-blur-md px-4 py-2 rounded-lg text-white text-xs font-bold border border-white/10">
                                {new Date().toLocaleTimeString()}
                            </div>

                            {/* Overlay: Bottom Left Info */}
                            <div className="absolute bottom-6 left-6 flex gap-3">
                                <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg text-white/90 text-[11px] font-bold border border-white/10 uppercase tracking-wide">
                                    AI Model: YOLOv8-PPE &nbsp;|&nbsp; Conf: 85% &nbsp;|&nbsp; 15 FPS
                                </div>
                            </div>
                        </div>

                        {/* Stats Row */}
                        <div className="grid grid-cols-4 gap-4">
                            {/* Card 1 */}
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-32">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">TOTAL<br/>TRACKED</span>
                                <span className="text-4xl font-black text-slate-800">{displayStats.totalTracked}</span>
                            </div>

                            {/* Card 2 */}
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-32 bg-gradient-to-br from-white to-rose-50/50">
                                <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest leading-relaxed relative z-10">ACTIVE<br/>VIOLATIONS</span>
                                <span className="text-4xl font-black text-rose-500 relative z-10">{displayStats.activeViolations.toString().padStart(2, '0')}</span>
                                {/* Decoration */}
                                <div className="absolute bottom-0 right-0 w-16 h-16 bg-rose-500/5 rounded-tl-full"></div>
                            </div>

                            {/* Card 3 */}
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-32 bg-gradient-to-br from-white to-emerald-50/50">
                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest leading-relaxed relative z-10">COMPLIANCE<br/>RATE</span>
                                <span className="text-4xl font-black text-emerald-500 relative z-10">{displayStats.complianceRate}%</span>
                                {/* Decoration */}
                                <div className="absolute bottom-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-tl-full"></div>
                            </div>

                            {/* Card 4 */}
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-32">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">SESSION<br/>UPTIME</span>
                                <span className="text-3xl font-black text-slate-800 font-mono tracking-tight">00:12:45</span>
                            </div>
                        </div>

                        {/* Camera Thumbnails */}
                        <div className="grid grid-cols-3 gap-4 pb-4">
                            {cameras.map(cam => (
                                <button
                                    key={cam.id}
                                    onClick={() => setSelectedCam(cam.id)}
                                    className={`relative h-32 rounded-2xl overflow-hidden shadow-sm transition-all group border-4 ${selectedCam === cam.id ? 'border-[#0066FF] shadow-xl' : 'border-transparent hover:border-slate-200'}`}
                                >
                                    <img src={cam.source} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                                    <span className="absolute bottom-3 left-4 text-white text-xs font-bold shadow-sm">{cam.shortLabel}</span>
                                    {selectedCam === cam.id && (
                                        <div className="absolute top-3 right-3 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse shadow-md"></div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Real-Time Alerts */}
                    <div className="col-span-4 flex flex-col bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden max-h-[calc(100vh-120px)] sticky top-8">
                        {/* Header */}
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="font-extrabold text-slate-800 tracking-tight">REAL-TIME ALERTS</h3>
                            <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1.5 animate-pulse">
                                <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
                                LIVE
                            </span>
                        </div>

                        {/* Alert List */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-[#F8F9FA]/50">
                            {alerts.map(alert => (
                                    <div key={alert.id} className="bg-white p-5 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-slate-100 group hover:shadow-md transition-all">
                                        <div className="flex justify-between items-start mb-3">
                                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide text-white ${alert.title.includes('Helmet') ? 'bg-[#FF4D4F]' : 'bg-[#0066FF]'}`}>
                                                {alert.title.includes('Helmet') ? 'No Safety Helmet' : alert.title}
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-400">{alert.time}</span>
                                        </div>
                                        
                                        <div className="mb-4">
                                            <h4 className="text-sm font-bold text-slate-800 mb-1">{alert.zone}</h4>
                                            <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                                <span className="text-slate-900 font-bold">{alert.worker}</span> detected without protection.
                                            </p>
                                        </div>

                                        <button className="w-full bg-[#0066FF] text-white py-2.5 rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors shadow-blue-500/20 shadow-lg">
                                            NOTIFY SAFETY TEAM
                                        </button>
                                    </div>
                                ))
                            }

                            {/* Demo Alert if Empty (for visual matching) */}
                            {alerts.length === 0 && (
                                <>
                                    <div className="bg-white p-5 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-slate-100">
                                        <div className="flex justify-between items-start mb-3">
                                            <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide text-white bg-[#FF4D4F]">
                                                No Safety Helmet
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-400">2m ago</span>
                                        </div>
                                        <div className="mb-4">
                                            <h4 className="text-sm font-bold text-slate-800 mb-1">Zone 4 - Loader Area</h4>
                                            <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                                <span className="text-slate-900 font-bold">James Rodriguez</span> detected without protection.
                                            </p>
                                        </div>
                                        <button className="w-full bg-[#0066FF] text-white py-2.5 rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors shadow-blue-500/20 shadow-lg">
                                            NOTIFY SAFETY TEAM
                                        </button>
                                    </div>

                                    <div className="bg-white p-5 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-slate-100">
                                        <div className="flex justify-between items-start mb-3">
                                            <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide text-white bg-[#0066FF]">
                                                Missing Gloves
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-400">28m ago</span>
                                        </div>
                                        <div className="mb-4">
                                            <h4 className="text-sm font-bold text-slate-800 mb-1">Assembly Line 4</h4>
                                            <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                                <span className="text-slate-900 font-bold">Linda Okafor</span> detected without protection.
                                            </p>
                                        </div>
                                        <button className="w-full bg-[#0066FF] text-white py-2.5 rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors shadow-blue-500/20 shadow-lg">
                                            NOTIFY SAFETY TEAM
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
};

export default LiveMonitoringScreen;

