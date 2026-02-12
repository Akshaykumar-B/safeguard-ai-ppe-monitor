import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useApp } from '../context/AppContext';

const LiveMonitoringScreen = () => {
    const { alerts, stats } = useApp();
    const [selectedCam, setSelectedCam] = useState('cam01');
    const [isRecording, setIsRecording] = useState(false);

    const cameras = [
        { id: 'cam01', label: 'Cam 01 - Main Entrance', source: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBMSN8ivvM6gsZrmh8Be9XUsghWPcxABM5crtSr-oC5frREwPX0339_5IovOMGJzReoazC8FQrxJ2UNlE_xaiMSN-I01unRovYVJe_XavJreM_U1hSwsdN2lT5Eji5xcq2hDAgI4gkAxfSBOtTqHvMWHB6KF4dQ4Gzg-4urZbSLpCPhUD2Pq14x8QtSP4qCnqT6gEF_BZJWNpYSWcEhO8QGLo_d3pt8li9Djd7ibpqLjxdfjkEVyA9VyMyHCKXcn6xlz562ggDFLxY' },
        { id: 'cam02', label: 'Cam 02 - Dock Area', source: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCsGOqMzb5QcZIE6qIRph49KTaA25QL8FOhCwCCybJPlAulkHOtk6pGAWFo_XN7a_LZ00ymomObR2_RTG9iEy1YDPwcmPTz6MnMcK4D8KKhi0vIP4rRm9ewAKt5B5d31aIdKSR-y5LfffpUfekC3tObgVm8NrmpKYPD09M8R_oiC5EBFKlczWHJAOzEzmHBlQZG2PIFQn_XG6srVqX7SrzRKEPoGM-1WPQZB8Jbp3dWyGr8bIRwJ8U4iJ1tyrdGaj2qYQBUlUEjvos' },
        { id: 'cam03', label: 'Cam 03 - Warehouse', source: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAvDSufplSJfYJaxmK5sV8IG19ItPMurwcQGQcEF8ZqaiEwxRYqMeJizUiPOMGIWFz7BKF38ZpXZN8aTVt9QVdsgFc_H8ueLJI-jY0suCfIwYNPkRL1lOuueMPT_v_zR8tY9ub8CVFgi8CSjoi9X_mEqvjpV2k9PEqQxjhghJqois7mHqf85jkexjfq1m6ogTtrDzwWvoge2ERRWE32bdtmYY9cYIzx_yi-9aSheviRhQyRDrKDAp-ZANtazomY0Gn1D8PBmi9Xt6o' }
    ];

    const currentCam = cameras.find(c => c.id === selectedCam) || cameras[0];

    return (
        <div className="flex min-h-screen bg-slate-950 text-white">
            <Sidebar />
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <Header title="Live Intelligent Monitoring" />

                <div className="flex-1 flex overflow-hidden p-6 gap-6">
                    {/* Primary Feed */}
                    <div className="flex-[3] flex flex-col gap-6 overflow-hidden">
                        <div className="relative flex-1 bg-black rounded-3xl overflow-hidden border border-slate-800 shadow-2xl group">
                            <img
                                src={currentCam.source}
                                className="w-full h-full object-cover opacity-80"
                                alt="Live Feed"
                            />

                            {/* Overlay Controls */}
                            <div className="absolute top-6 left-6 flex items-center gap-3">
                                <div className="bg-rose-600 px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-black animate-pulse">
                                    <span className="w-2 h-2 bg-white rounded-full"></span>
                                    LIVE
                                </div>
                                <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-bold border border-white/10">
                                    {currentCam.label}
                                </div>
                            </div>

                            <div className="absolute top-6 right-6 flex gap-2">
                                <div className="bg-black/60 backdrop-blur-md p-2 rounded-lg border border-white/10 text-[10px] font-bold">
                                    FPS: {stats.fps.toFixed(1)}
                                </div>
                                <div className="bg-black/60 backdrop-blur-md p-2 rounded-lg border border-white/10 text-[10px] font-bold">
                                    {new Date().toLocaleTimeString()}
                                </div>
                            </div>

                            {/* Simulated Bounding Boxes Overlay */}
                            <div className="absolute inset-0 pointer-events-none">
                                <div className="absolute top-1/4 left-1/3 w-32 h-64 border-2 border-emerald-500 rounded-lg">
                                    <div className="absolute -top-6 left-0 bg-emerald-500 text-[10px] font-black px-2 py-0.5 rounded text-white uppercase">
                                        Worker_Compliant 98%
                                    </div>
                                </div>
                                <div className="absolute top-1/2 right-1/4 w-28 h-56 border-2 border-rose-500 rounded-lg">
                                    <div className="absolute -top-6 left-0 bg-rose-500 text-[10px] font-black px-2 py-0.5 rounded text-white uppercase">
                                        No_Helmet 94%
                                    </div>
                                </div>
                            </div>

                            {/* Bottom Controls */}
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-8 opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0">
                                <button className="hover:text-primary transition-colors">
                                    <span className="material-icons">videocam_off</span>
                                </button>
                                <button className="hover:text-primary transition-colors">
                                    <span className="material-icons">screenshot</span>
                                </button>
                                <button
                                    onClick={() => setIsRecording(!isRecording)}
                                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-rose-600 scale-110' : 'bg-white/10 hover:bg-white/20'}`}
                                >
                                    <span className="material-icons">{isRecording ? 'stop' : 'fiber_manual_record'}</span>
                                </button>
                                <button className="hover:text-primary transition-colors">
                                    <span className="material-icons">zoom_in</span>
                                </button>
                                <button className="hover:text-primary transition-colors">
                                    <span className="material-icons">settings</span>
                                </button>
                            </div>
                        </div>

                        {/* Camera Selector Grid */}
                        <div className="h-48 flex gap-4">
                            {cameras.map(cam => (
                                <button
                                    key={cam.id}
                                    onClick={() => setSelectedCam(cam.id)}
                                    className={`flex-1 relative rounded-2xl overflow-hidden border-2 transition-all ${selectedCam === cam.id ? 'border-primary shadow-lg shadow-primary/20 scale-[1.02]' : 'border-slate-800 opacity-60 hover:opacity-100'}`}
                                >
                                    <img src={cam.source} className="w-full h-full object-cover" alt={cam.label} />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                                    <div className="absolute bottom-3 left-3 text-[10px] font-bold truncate pr-3">{cam.label}</div>
                                    {selectedCam === cam.id && (
                                        <div className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full animate-ping"></div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right Sidebar - Analytics & Alerts */}
                    <div className="flex-1 min-w-[320px] bg-slate-900/50 backdrop-blur-md rounded-3xl border border-slate-800 flex flex-col overflow-hidden">
                        <div className="p-6 border-b border-slate-800">
                            <h3 className="text-lg font-bold">Live Stream Analytics</h3>
                            <p className="text-xs text-slate-500 mt-1">Real-time object tracking</p>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                            {/* Current Stats */}
                            <div className="grid grid-cols-2 gap-3 mb-6">
                                <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tracked</p>
                                    <p className="text-2xl font-black mt-1">{stats.totalWorkers}</p>
                                </div>
                                <div className="bg-rose-500/10 p-4 rounded-2xl border border-rose-500/20">
                                    <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Violations</p>
                                    <p className="text-2xl font-black mt-1 text-rose-500">{stats.activeAlerts}</p>
                                </div>
                            </div>

                            <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest px-2">Recent Incidents</h4>

                            {alerts.length === 0 ? (
                                <div className="text-center py-10 text-slate-600">
                                    <span className="material-icons text-4xl mb-2">verified</span>
                                    <p className="text-xs">No active violations on {selectedCam}</p>
                                </div>
                            ) : (
                                alerts.slice(0, 5).map(alert => (
                                    <div key={alert.id} className="p-4 bg-slate-800/30 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors">
                                        <div className="flex justify-between mb-2">
                                            <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${alert.color === 'rose' ? 'bg-rose-500' : 'bg-amber-500'}`}>
                                                {alert.type}
                                            </span>
                                            <span className="text-[10px] text-slate-500 font-bold">{alert.time}</span>
                                        </div>
                                        <p className="text-sm font-bold truncate">{alert.title}</p>
                                        <p className="text-[10px] text-slate-500 mt-1">{alert.worker} • {alert.zone}</p>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-6 bg-slate-900 border-t border-slate-800">
                            <button className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold border border-white/5 transition-colors">
                                GENERATE INCIDENT REPORT
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default LiveMonitoringScreen;
