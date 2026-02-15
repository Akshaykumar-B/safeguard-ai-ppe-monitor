import { useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useApp } from '../context/AppContext';

const DashboardScreen = () => {
    const { stats, alerts, dismissAlert, markAlertRead, exportViolationsCSV } = useApp();
    const [chartPeriod, setChartPeriod] = useState('M');

    const weeklyData = [65, 72, 58, 78, 74, 82, 80];
    const monthlyData = [75, 82, 70, 88, 85, 95, 92];
    const chartData = chartPeriod === 'W' ? weeklyData : monthlyData;
    const chartLabels = chartPeriod === 'W'
        ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];

    return (
        <div className="flex min-h-screen bg-background-light dark:bg-background-dark">
            <Sidebar />
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <Header title="Safety Overview" />
                <div className="flex-1 overflow-y-auto p-8 bg-background-light dark:bg-background-dark">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-100 dark:border-blue-800/50 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                                    <span className="material-symbols-outlined">groups</span>
                                </div>
                                <span className="text-emerald-500 text-xs font-bold flex items-center bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                                    <span className="material-icons text-sm">trending_up</span>+4%
                                </span>
                            </div>
                            <p className="text-slate-500 dark:text-blue-200/60 text-xs font-bold uppercase tracking-wider mb-1">People Tracked</p>
                            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">{stats.totalWorkers}</h3>
                        </div>

                        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-800/50 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                                    <span className="material-symbols-outlined">visibility</span>
                                </div>
                                <span className="text-slate-500 text-[10px] font-bold uppercase tracking-tighter">Today</span>
                            </div>
                            <p className="text-slate-500 dark:text-indigo-200/60 text-xs font-bold uppercase tracking-wider mb-1">System FPS</p>
                            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">{stats.fps}</h3>
                        </div>

                        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-800/50 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                                    <span className="material-symbols-outlined">verified_user</span>
                                </div>
                                <span className="text-emerald-600 text-xs font-bold flex items-center bg-emerald-100 px-2 py-1 rounded-full">
                                    <span className="material-icons text-sm">check</span>{stats.complianceRate}%
                                </span>
                            </div>
                            <p className="text-slate-500 dark:text-emerald-200/60 text-xs font-bold uppercase tracking-wider mb-1">Compliance Rate</p>
                            <h3 className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{stats.complianceRate}%</h3>
                        </div>

                        <div className="bg-rose-50 dark:bg-rose-900/20 p-6 rounded-2xl border border-rose-100 dark:border-rose-800/50 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-rose-500/30">
                                    <span className="material-symbols-outlined">report_problem</span>
                                </div>
                                {stats.activeAlerts > 0 && (
                                    <span className="px-2 py-1 bg-rose-500 text-white text-[10px] font-extrabold rounded-full uppercase tracking-widest shadow-lg shadow-rose-500/40">Urgent</span>
                                )}
                            </div>
                            <p className="text-slate-500 dark:text-rose-200/60 text-xs font-bold uppercase tracking-wider mb-1">Active Violations</p>
                            <h3 className="text-3xl font-extrabold text-rose-600 dark:text-rose-400">{stats.activeAlerts}</h3>
                        </div>

                        <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-2xl border border-amber-100 dark:border-amber-800/50 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-500/30">
                                    <span className="material-symbols-outlined">analytics</span>
                                </div>
                                <div className="w-10 h-10 flex items-center justify-center text-amber-600 font-bold text-sm">{stats.overallScore}%</div>
                            </div>
                            <p className="text-slate-500 dark:text-amber-200/60 text-xs font-bold uppercase tracking-wider mb-1">Overall Score</p>
                            <div className="flex items-center gap-3">
                                <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">{stats.overallScore}</h3>
                                <div className="flex-1 h-2 bg-amber-200 dark:bg-amber-900/40 rounded-full overflow-hidden">
                                    <div className="bg-amber-500 h-full rounded-full transition-all duration-700" style={{ width: `${stats.overallScore}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            {/* Compliance Chart */}
                            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Compliance Evolution</h2>
                                        <p className="text-sm text-slate-500 font-medium">Real-time performance metrics</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setChartPeriod('W')}
                                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${chartPeriod === 'W' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'}`}
                                        >W</button>
                                        <button
                                            onClick={() => setChartPeriod('M')}
                                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${chartPeriod === 'M' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'}`}
                                        >M</button>
                                    </div>
                                </div>
                                <div className="relative h-[320px] w-full mt-4 flex items-end justify-between gap-2 overflow-hidden px-2 rounded-2xl">
                                    <div className="absolute inset-0 chart-gradient opacity-40"></div>
                                    {chartData.map((height, i) => (
                                        <div key={i} className="relative flex-1 group cursor-pointer" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                                            <div
                                                className={`relative w-full rounded-t-xl transition-all duration-500 hover:opacity-90 ${i === chartData.length - 1 ? 'bg-primary shadow-2xl shadow-primary/40' : 'bg-primary/20 hover:bg-primary/40'}`}
                                                style={{ height: `${height}%`, transition: 'height 0.5s ease-out' }}
                                            >
                                                {/* Tooltip */}
                                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg z-10">
                                                    {height}%
                                                </div>
                                            </div>
                                            <div className="text-[10px] text-slate-400 text-center mt-2 font-bold">{chartLabels[i]}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Live Feed */}
                            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                                        <span className="w-2 h-2 bg-accent-rose rounded-full animate-pulse"></span>
                                        Live Intelligent Feed
                                    </h2>
                                    <Link to="/live" className="px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors">
                                        Expand View
                                    </Link>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="aspect-video relative rounded-2xl overflow-hidden bg-slate-900 group cursor-pointer" onClick={() => window.location.href = '/live'}>
                                        <img className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBMSN8ivvM6gsZrmh8Be9XUsghWPcxABM5crtSr-oC5frREwPX0339_5IovOMGJzReoazC8FQrxJ2UNlE_xaiMSN-I01unRovYVJe_XavJreM_U1hSwsdN2lT5Eji5xcq2hDAgI4gkAxfSBOtTqHvMWHB6KF4dQ4Gzg-4urZbSLpCPhUD2Pq14x8QtSP4qCnqT6gEF_BZJWNpYSWcEhO8QGLo_d3pt8li9Djd7ibpqLjxdfjkEVyA9VyMyHCKXcn6xlz562ggDFLxY" />
                                        <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-lg text-[10px] text-white font-bold uppercase">Cam 04_North</div>
                                        <div className="absolute bottom-4 right-4 bg-emerald-500/90 text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>LIVE
                                        </div>
                                    </div>
                                    <div className="aspect-video relative rounded-2xl overflow-hidden bg-slate-900 group cursor-pointer" onClick={() => window.location.href = '/live'}>
                                        <img className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCsGOqMzb5QcZIE6qIRph49KTaA25QL8FOhCwCCybJPlAulkHOtk6pGAWFo_XN7a_LZ00ymomObR2_RTG9iEy1YDPwcmPTz6MnMcK4D8KKhi0vIP4rRm9ewAKt5B5d31aIdKSR-y5LfffpUfekC3tObgVm8NrmpKYPD09M8R_oiC5EBFKlczWHJAOzEzmHBlQZG2PIFQn_XG6srVqX7SrzRKEPoGM-1WPQZB8Jbp3dWyGr8bIRwJ8U4iJ1tyrdGaj2qYQBUlUEjvos" />
                                        <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-lg text-[10px] text-white font-bold uppercase">Cam 07_Dock</div>
                                        <div className="absolute bottom-4 right-4 bg-emerald-500/90 text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>LIVE
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Active Alerts Panel */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col h-full overflow-hidden">
                            <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
                                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Active Alerts</h2>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Real-time incident queue</p>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                                {alerts.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                                        <span className="material-icons text-4xl mb-2">check_circle</span>
                                        <p className="text-sm font-medium">All clear! No active alerts.</p>
                                    </div>
                                ) : (
                                    alerts.map((alert) => (
                                        <div key={alert.id} className={`p-5 rounded-2xl border transition-all ${alert.read
                                            ? 'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-700 opacity-60'
                                            : alert.color === 'rose'
                                                ? 'bg-rose-500/5 border-rose-500/10 hover:border-rose-500/30'
                                                : alert.color === 'amber'
                                                    ? 'bg-amber-500/5 border-amber-500/10 hover:border-amber-500/30'
                                                    : 'bg-blue-500/5 border-blue-500/10 hover:border-blue-500/30'
                                            }`}>
                                            <div className="flex justify-between items-start mb-3">
                                                <span className={`px-3 py-1 text-white text-[10px] font-black rounded-full uppercase tracking-widest shadow-lg ${alert.color === 'rose' ? 'bg-rose-500 shadow-rose-500/20' : alert.color === 'amber' ? 'bg-amber-500 shadow-amber-500/20' : 'bg-blue-500 shadow-blue-500/20'}`}>
                                                    {alert.type}
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-bold">{alert.time}</span>
                                            </div>
                                            <h4 className="font-extrabold text-slate-900 dark:text-white text-md leading-tight">{alert.title}</h4>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[14px]">location_on</span>
                                                {alert.zone}
                                            </p>
                                            <p className="text-[10px] text-slate-400 mt-1">{alert.worker}</p>
                                            <div className="mt-4 flex items-center gap-2">
                                                {!alert.read && (
                                                    <button
                                                        onClick={() => markAlertRead(alert.id)}
                                                        className="flex-1 px-3 py-2 bg-primary/10 text-primary text-[10px] font-black rounded-lg uppercase hover:bg-primary/20 transition-colors"
                                                    >
                                                        Mark Reviewed
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => dismissAlert(alert.id)}
                                                    className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-black rounded-lg uppercase hover:bg-slate-200 transition-colors"
                                                >
                                                    Dismiss
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="p-6 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    onClick={exportViolationsCSV}
                                    className="w-full py-3.5 bg-white dark:bg-slate-800 text-sm font-black text-slate-700 dark:text-slate-200 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-lg">download</span>
                                    EXPORT ANALYTICS LOG
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DashboardScreen;
