import { useState, useMemo } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useApp } from '../context/AppContext';

const WorkersScreen = () => {
    const { workers, deleteWorker, stats, exportWorkersCSV } = useApp();
    const [search, setSearch] = useState('');
    const [siteFilter, setSiteFilter] = useState('All Sites');
    const [selectedWorkers, setSelectedWorkers] = useState([]);
    const [sortField, setSortField] = useState(null);
    const [sortDir, setSortDir] = useState('asc');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

    // Get unique sites
    const sites = useMemo(() => ['All Sites', ...new Set(workers.map(w => w.site))], [workers]);

    // Sort handler
    const handleSort = (field) => {
        if (sortField === field) {
            setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDir('asc');
        }
    };

    // Filter & sort
    const filteredWorkers = useMemo(() => {
        let result = workers.filter(w => {
            const matchSearch = !search ||
                w.name.toLowerCase().includes(search.toLowerCase()) ||
                w.id.toLowerCase().includes(search.toLowerCase());
            const matchSite = siteFilter === 'All Sites' || w.site === siteFilter;
            return matchSearch && matchSite;
        });

        if (sortField) {
            result = [...result].sort((a, b) => {
                const aVal = a[sortField]?.toString().toLowerCase() || '';
                const bVal = b[sortField]?.toString().toLowerCase() || '';
                return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
            });
        }

        return result;
    }, [workers, search, siteFilter, sortField, sortDir]);

    // Selection
    const toggleSelect = (id) => {
        setSelectedWorkers(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };
    const toggleSelectAll = () => {
        if (selectedWorkers.length === filteredWorkers.length) {
            setSelectedWorkers([]);
        } else {
            setSelectedWorkers(filteredWorkers.map(w => w.id));
        }
    };

    const complianceStyle = (status) => {
        switch (status) {
            case 'Compliant': return 'bg-emerald-500/10 text-emerald-600';
            case 'Violation': return 'bg-rose-500/10 text-rose-600';
            case 'Warning': return 'bg-amber-500/10 text-amber-600';
            default: return 'bg-slate-100 text-slate-500';
        }
    };

    const getInitials = (name) => name.split(' ').map(n => n[0]).join('').slice(0, 2);
    const getAvatarColor = (name) => {
        const colors = ['bg-blue-500', 'bg-purple-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500', 'bg-indigo-500'];
        const idx = name.charCodeAt(0) % colors.length;
        return colors[idx];
    };

    const workerStats = [
        { label: 'Total Workforce', value: stats.totalWorkers.toLocaleString(), icon: 'groups', color: 'primary' },
        { label: 'Currently Active', value: stats.activeWorkers.toLocaleString(), icon: 'sensors', color: 'emerald-500' },
        { label: 'PPE Violations', value: workers.filter(w => w.compliance === 'Violation').length, icon: 'report_problem', color: 'rose-500' },
        { label: 'Avg. Compliance', value: `${stats.complianceRate}%`, icon: 'verified_user', color: 'amber-500' },
    ];

    return (
        <div className="flex min-h-screen bg-background-light dark:bg-background-dark">
            <Sidebar />
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <Header title="Worker Directory" showAddWorker={true} />
                <section className="p-8 pb-0 grid grid-cols-1 md:grid-cols-4 gap-6">
                    {workerStats.map((stat, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-primary/5 shadow-sm hover:shadow-md transition-all">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                                    <h3 className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">{stat.value}</h3>
                                </div>
                                <div className={`w-10 h-10 bg-${stat.color}/10 text-${stat.color} rounded-lg flex items-center justify-center`}>
                                    <span className="material-icons">{stat.icon}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </section>

                <section className="p-8 pb-4">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-primary/5 shadow-sm">
                        <div className="relative w-full md:w-96">
                            <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-background-light dark:bg-background-dark border border-primary/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="Search by Worker Name or ID..."
                                type="text"
                            />
                        </div>
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <select
                                value={siteFilter}
                                onChange={e => setSiteFilter(e.target.value)}
                                className="flex-1 md:flex-none bg-background-light dark:bg-background-dark border border-primary/10 rounded-lg text-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                {sites.map(s => <option key={s}>{s}</option>)}
                            </select>
                            <button
                                onClick={exportWorkersCSV}
                                className="p-2 border border-primary/10 rounded-lg text-slate-500 hover:bg-primary/5 hover:text-primary transition-colors"
                                title="Export Workers CSV"
                            >
                                <span className="material-icons">file_download</span>
                            </button>
                        </div>
                    </div>
                    {selectedWorkers.length > 0 && (
                        <div className="mt-3 p-3 bg-primary/5 border border-primary/10 rounded-lg flex items-center justify-between">
                            <span className="text-sm font-semibold text-primary">{selectedWorkers.length} worker(s) selected</span>
                            <button
                                onClick={() => setSelectedWorkers([])}
                                className="text-xs font-bold text-slate-500 hover:text-primary"
                            >
                                Clear Selection
                            </button>
                        </div>
                    )}
                </section>

                <section className="px-8 pb-8 flex-1 overflow-hidden">
                    <div className="bg-white dark:bg-slate-900 border border-primary/5 rounded-xl shadow-sm h-full flex flex-col overflow-hidden">
                        <div className="overflow-auto flex-1 custom-scrollbar">
                            <table className="w-full text-left border-collapse min-w-[1000px]">
                                <thead className="bg-background-light/50 dark:bg-background-dark/80 sticky top-0 z-10 border-b border-primary/10">
                                    <tr>
                                        <th className="p-4 w-12">
                                            <input
                                                type="checkbox"
                                                checked={selectedWorkers.length === filteredWorkers.length && filteredWorkers.length > 0}
                                                onChange={toggleSelectAll}
                                                className="rounded border-primary/20 text-primary focus:ring-primary cursor-pointer"
                                            />
                                        </th>
                                        <th onClick={() => handleSort('id')} className="p-4 text-xs font-bold text-slate-500 uppercase cursor-pointer hover:text-primary select-none">
                                            Worker ID {sortField === 'id' && (sortDir === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th onClick={() => handleSort('name')} className="p-4 text-xs font-bold text-slate-500 uppercase cursor-pointer hover:text-primary select-none">
                                            Worker Name {sortField === 'name' && (sortDir === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th onClick={() => handleSort('role')} className="p-4 text-xs font-bold text-slate-500 uppercase cursor-pointer hover:text-primary select-none">
                                            Role {sortField === 'role' && (sortDir === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th onClick={() => handleSort('site')} className="p-4 text-xs font-bold text-slate-500 uppercase cursor-pointer hover:text-primary select-none">
                                            Site Location {sortField === 'site' && (sortDir === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th onClick={() => handleSort('compliance')} className="p-4 text-xs font-bold text-slate-500 uppercase cursor-pointer hover:text-primary select-none">
                                            Compliance {sortField === 'compliance' && (sortDir === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th className="p-4 text-xs font-bold text-slate-500 uppercase">Last Seen</th>
                                        <th className="p-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-primary/5">
                                    {filteredWorkers.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="p-12 text-center text-slate-400">
                                                <span className="material-icons text-4xl mb-2 block">search_off</span>
                                                No workers found matching your search.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredWorkers.map(worker => (
                                            <tr key={worker.id} className="hover:bg-primary/5 transition-colors group">
                                                <td className="p-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedWorkers.includes(worker.id)}
                                                        onChange={() => toggleSelect(worker.id)}
                                                        className="rounded border-primary/20 text-primary focus:ring-primary cursor-pointer"
                                                    />
                                                </td>
                                                <td className="p-4 font-mono text-xs text-slate-500">{worker.id}</td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        {worker.img ? (
                                                            <img className="w-8 h-8 rounded-full object-cover" src={worker.img} alt={worker.name} />
                                                        ) : (
                                                            <div className={`w-8 h-8 rounded-full ${getAvatarColor(worker.name)} text-white flex items-center justify-center text-[10px] font-bold`}>
                                                                {getInitials(worker.name)}
                                                            </div>
                                                        )}
                                                        <span className="font-semibold text-sm">{worker.name}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-sm">{worker.role}</td>
                                                <td className="p-4 text-sm">{worker.site}</td>
                                                <td className="p-4">
                                                    <span className={`inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-bold ${complianceStyle(worker.compliance)}`}>
                                                        {worker.compliance}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-xs text-slate-500">{worker.lastSeen}</td>
                                                <td className="p-4 text-right">
                                                    <div className="relative inline-block">
                                                        {showDeleteConfirm === worker.id ? (
                                                            <div className="flex items-center gap-1">
                                                                <button
                                                                    onClick={() => { deleteWorker(worker.id); setShowDeleteConfirm(null); }}
                                                                    className="text-[10px] font-bold text-white bg-rose-500 px-2 py-1 rounded hover:bg-rose-600 transition-colors"
                                                                >
                                                                    Confirm
                                                                </button>
                                                                <button
                                                                    onClick={() => setShowDeleteConfirm(null)}
                                                                    className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded hover:bg-slate-200 transition-colors"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => setShowDeleteConfirm(worker.id)}
                                                                className="material-icons text-slate-400 cursor-pointer hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                                                            >
                                                                delete
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-4 border-t border-primary/5 flex items-center justify-between text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/30">
                            <span>Showing {filteredWorkers.length} of {workers.length} workers</span>
                            <span className="font-semibold text-primary">{workers.filter(w => w.compliance === 'Compliant').length} Compliant</span>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default WorkersScreen;
