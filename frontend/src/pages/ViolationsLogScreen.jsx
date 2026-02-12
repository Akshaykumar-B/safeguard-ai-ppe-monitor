import { useState, useMemo } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

const ViolationsLogScreen = () => {
    const { violations, updateViolationStatus, exportViolationsCSV } = useApp();
    const { hasPermission } = useAuth();
    const canAcknowledge = hasPermission('acknowledgeViolations');
    const [timePeriod, setTimePeriod] = useState('all');
    const [severityFilters, setSeverityFilters] = useState({
        Critical: true, High: true, Medium: true, Low: true
    });
    const [statusFilter, setStatusFilter] = useState('All');
    const [selectedViolation, setSelectedViolation] = useState(null);

    const toggleSeverity = (sev) => {
        setSeverityFilters(prev => ({ ...prev, [sev]: !prev[sev] }));
    };

    const filteredViolations = useMemo(() => {
        return violations.filter(v => {
            const matchSeverity = severityFilters[v.severity];
            const matchStatus = statusFilter === 'All' || v.status === statusFilter;
            let matchTime = true;
            if (timePeriod === '24h') {
                matchTime = v.date.includes('Feb 10');
            } else if (timePeriod === '7d') {
                matchTime = v.date.includes('Feb 10') || v.date.includes('Feb 09') || v.date.includes('Feb 08');
            }
            return matchSeverity && matchStatus && matchTime;
        });
    }, [violations, severityFilters, statusFilter, timePeriod]);

    const severityStyle = (sev) => {
        switch (sev) {
            case 'Critical': return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400';
            case 'High': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
            case 'Medium': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
            case 'Low': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const statusStyle = (status) => {
        switch (status) {
            case 'Pending': return 'bg-amber-100 text-amber-700';
            case 'Reviewed': return 'bg-blue-100 text-blue-700';
            case 'Resolved': return 'bg-emerald-100 text-emerald-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    return (
        <div className="flex min-h-screen bg-background-light dark:bg-background-dark">
            <Sidebar />
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <Header title="Violation Logs" />
                <div className="flex-1 flex overflow-hidden">
                    {/* Filters Sidebar */}
                    <aside className="w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                            <h2 className="font-semibold flex items-center gap-2">
                                <span className="material-icons text-primary text-lg">filter_list</span>
                                Advanced Filters
                            </h2>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase mb-3 block">Time Period</label>
                                <select
                                    value={timePeriod}
                                    onChange={e => setTimePeriod(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 py-2 px-3"
                                >
                                    <option value="all">All Time</option>
                                    <option value="24h">Last 24 Hours</option>
                                    <option value="7d">Last 7 Days</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase mb-3 block">Severity Level</label>
                                <div className="flex flex-col gap-2">
                                    {Object.entries(severityFilters).map(([sev, checked]) => (
                                        <label key={sev} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-2 h-2 rounded-full ${sev === 'Critical' ? 'bg-rose-500' : sev === 'High' ? 'bg-orange-500' : sev === 'Medium' ? 'bg-amber-500' : 'bg-blue-500'}`}></span>
                                                <span className="text-sm">{sev}</span>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={() => toggleSeverity(sev)}
                                                className="rounded text-primary focus:ring-primary cursor-pointer"
                                            />
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase mb-3 block">Status</label>
                                <div className="flex flex-col gap-2">
                                    {['All', 'Pending', 'Reviewed', 'Resolved'].map(status => (
                                        <button
                                            key={status}
                                            onClick={() => setStatusFilter(status)}
                                            className={`text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === status ? 'bg-primary/10 text-primary font-bold' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                            <button
                                onClick={exportViolationsCSV}
                                className="w-full py-2.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                            >
                                <span className="material-icons text-sm">file_download</span>
                                Export Filtered Data
                            </button>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
                            <span className="text-sm text-slate-500"><strong className="text-slate-900 dark:text-white">{filteredViolations.length}</strong> violations found</span>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-slate-400 font-bold uppercase">Quick:</span>
                                {['Pending', 'Critical'].map(q => (
                                    <button
                                        key={q}
                                        onClick={() => {
                                            if (q === 'Critical') {
                                                setSeverityFilters({ Critical: true, High: false, Medium: false, Low: false });
                                                setStatusFilter('All');
                                            } else {
                                                setSeverityFilters({ Critical: true, High: true, Medium: true, Low: true });
                                                setStatusFilter('Pending');
                                            }
                                        }}
                                        className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded hover:bg-primary/20 transition-colors"
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="p-6 overflow-auto flex-1 custom-scrollbar">
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-50 dark:bg-slate-800/50">
                                        <tr>
                                            <th className="p-4 text-xs font-bold text-slate-500 uppercase">Snapshot</th>
                                            <th className="p-4 text-xs font-bold text-slate-500 uppercase">Timestamp</th>
                                            <th className="p-4 text-xs font-bold text-slate-500 uppercase">Worker Info</th>
                                            <th className="p-4 text-xs font-bold text-slate-500 uppercase">Violation</th>
                                            <th className="p-4 text-xs font-bold text-slate-500 uppercase">Severity</th>
                                            <th className="p-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                                            <th className="p-4 text-xs font-bold text-slate-500 uppercase text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {filteredViolations.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="p-12 text-center text-slate-400">
                                                    <span className="material-icons text-4xl mb-2 block">filter_list_off</span>
                                                    No violations match your filters.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredViolations.map(v => (
                                                <tr key={v.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                                    <td className="p-4">
                                                        {v.snapshot ? (
                                                            <img className="w-16 h-10 object-cover rounded border border-slate-200" src={v.snapshot} alt="violation" />
                                                        ) : (
                                                            <div className="w-16 h-10 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                                <span className="material-icons text-slate-400 text-sm">image</span>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="text-sm font-medium">{v.date}</div>
                                                        <div className="text-xs text-slate-400 font-mono">{v.time}</div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="text-sm font-semibold">{v.worker}</div>
                                                        <div className="text-xs text-slate-400">ID: {v.workerId}</div>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${severityStyle(v.severity)}`}>
                                                            {v.type}
                                                        </span>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${severityStyle(v.severity)}`}>
                                                            {v.severity}
                                                        </span>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${statusStyle(v.status)}`}>
                                                            {v.status}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <div className="flex items-center justify-center gap-1">
                                                            {canAcknowledge && v.status === 'Pending' && (
                                                                <button
                                                                    onClick={() => updateViolationStatus(v.id, 'Reviewed')}
                                                                    className="px-3 py-1.5 text-xs font-bold bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                                                >
                                                                    Review
                                                                </button>
                                                            )}
                                                            {canAcknowledge && v.status !== 'Resolved' && (
                                                                <button
                                                                    onClick={() => updateViolationStatus(v.id, 'Resolved')}
                                                                    className="px-3 py-1.5 text-xs font-bold bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                                                                >
                                                                    Resolve
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => setSelectedViolation(selectedViolation === v.id ? null : v.id)}
                                                                className="px-3 py-1.5 text-xs font-bold bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                                                            >
                                                                Details
                                                            </button>
                                                        </div>
                                                        {selectedViolation === v.id && (
                                                            <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-left text-xs space-y-1">
                                                                <p><strong>ID:</strong> {v.id}</p>
                                                                <p><strong>Zone:</strong> {v.zone}</p>
                                                                <p><strong>Type:</strong> {v.type}</p>
                                                                <p><strong>Severity:</strong> {v.severity}</p>
                                                                <p><strong>Status:</strong> {v.status}</p>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ViolationsLogScreen;
