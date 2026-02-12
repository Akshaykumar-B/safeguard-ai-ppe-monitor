import { useMemo } from 'react';
import Sidebar from '../components/Sidebar';
import { useApp } from '../context/AppContext';

const AnalyticsScreen = () => {
    const { stats, violations, workers, exportViolationsCSV } = useApp();

    // Compute violation type breakdown
    const violationTypes = useMemo(() => {
        const counts = {};
        violations.forEach(v => {
            counts[v.type] = (counts[v.type] || 0) + 1;
        });
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .map(([type, count]) => ({ type, count }));
    }, [violations]);

    // Compute zone violations
    const zoneViolations = useMemo(() => {
        const counts = {};
        violations.forEach(v => {
            const zone = v.zone.split(' - ')[0] || v.zone;
            counts[zone] = (counts[zone] || 0) + 1;
        });
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([zone, count]) => ({ zone, count }));
    }, [violations]);

    const maxZoneCount = zoneViolations[0]?.count || 1;

    // Severity breakdown
    const severityBreakdown = useMemo(() => {
        const counts = { Critical: 0, High: 0, Medium: 0, Low: 0 };
        violations.forEach(v => { counts[v.severity] = (counts[v.severity] || 0) + 1; });
        return counts;
    }, [violations]);

    // Compliance by site
    const siteCompliance = useMemo(() => {
        const sites = {};
        workers.forEach(w => {
            if (!sites[w.site]) sites[w.site] = { total: 0, compliant: 0 };
            sites[w.site].total++;
            if (w.compliance === 'Compliant') sites[w.site].compliant++;
        });
        return Object.entries(sites).map(([site, data]) => ({
            site,
            rate: ((data.compliant / data.total) * 100).toFixed(1),
            total: data.total,
            compliant: data.compliant,
        }));
    }, [workers]);

    const sevColors = { Critical: 'rose', High: 'orange', Medium: 'amber', Low: 'blue' };

    return (
        <div className="flex min-h-screen bg-background-light dark:bg-background-dark">
            <Sidebar />
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="sticky top-0 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-8 py-6 z-40">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Safety Analytics & Reports</h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400">AI-powered PPE compliance overview</p>
                        </div>
                        <button
                            onClick={exportViolationsCSV}
                            className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors"
                        >
                            <span className="material-icons text-lg">file_download</span>
                            Export Report
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8 max-w-7xl mx-auto w-full space-y-8">
                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Compliance Rate</p>
                            <h3 className="text-3xl font-bold mt-1 text-emerald-600">{stats.complianceRate}%</h3>
                            <div className="mt-4 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-primary h-full rounded-full transition-all duration-700" style={{ width: `${stats.complianceRate}%` }}></div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Violations</p>
                            <h3 className="text-3xl font-bold mt-1">{stats.totalViolations}</h3>
                            <p className="text-xs text-slate-400 mt-2">{stats.pendingViolations} pending review</p>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Critical Incidents</p>
                            <h3 className="text-3xl font-bold mt-1 text-rose-600">{severityBreakdown.Critical}</h3>
                            <p className="text-xs text-slate-400 mt-2">{severityBreakdown.High} high severity</p>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Safety Score</p>
                            <h3 className="text-3xl font-bold mt-1">{(stats.overallScore / 10).toFixed(1)}/10</h3>
                            <div className="mt-2 flex gap-1">
                                {[...Array(10)].map((_, i) => (
                                    <div key={i} className={`h-2 flex-1 rounded-full ${i < Math.round(stats.overallScore / 10) ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Severity Distribution */}
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <h4 className="font-bold text-lg mb-6">Severity Distribution</h4>
                            <div className="space-y-4">
                                {Object.entries(severityBreakdown).map(([sev, count]) => (
                                    <div key={sev}>
                                        <div className="flex justify-between text-sm mb-1.5">
                                            <span className="font-medium flex items-center gap-2">
                                                <span className={`w-2.5 h-2.5 rounded-full bg-${sevColors[sev]}-500`}></span>
                                                {sev}
                                            </span>
                                            <span className="font-bold">{count}</span>
                                        </div>
                                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-lg overflow-hidden">
                                            <div
                                                className={`h-full rounded-lg transition-all duration-700 ${sev === 'Critical' ? 'bg-rose-500' : sev === 'High' ? 'bg-orange-500' : sev === 'Medium' ? 'bg-amber-500' : 'bg-blue-500'}`}
                                                style={{ width: `${stats.totalViolations > 0 ? (count / stats.totalViolations) * 100 : 0}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Violation Types */}
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <h4 className="font-bold text-lg mb-6">Violation Types</h4>
                            <div className="space-y-3">
                                {violationTypes.map((vt, i) => (
                                    <div key={i} className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                        <div className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                                            <span className="material-icons text-sm">warning</span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between mb-1">
                                                <span className="text-sm font-medium">{vt.type}</span>
                                                <span className="text-sm font-bold text-primary">{vt.count}</span>
                                            </div>
                                            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                                                <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${(vt.count / (violationTypes[0]?.count || 1)) * 100}%` }}></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* High-Risk Zones */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h4 className="font-bold text-lg mb-8">High-Risk Zones</h4>
                        <div className="space-y-6">
                            {zoneViolations.map((zv, i) => (
                                <div key={i} className="group">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="font-medium flex items-center gap-2">
                                            <span className="material-icons text-sm text-slate-400">location_on</span>
                                            {zv.zone}
                                        </span>
                                        <span className="text-rose-500 font-bold">{zv.count} Violations</span>
                                    </div>
                                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-8 rounded-lg overflow-hidden relative">
                                        <div className="bg-rose-500 h-full transition-all duration-700 rounded-lg" style={{ width: `${(zv.count / maxZoneCount) * 100}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Site Compliance */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h4 className="font-bold text-lg mb-6">Site Compliance Breakdown</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {siteCompliance.map((sc, i) => (
                                <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm font-semibold">{sc.site}</span>
                                        <span className={`text-sm font-bold ${parseFloat(sc.rate) >= 90 ? 'text-emerald-500' : parseFloat(sc.rate) >= 70 ? 'text-amber-500' : 'text-rose-500'}`}>
                                            {sc.rate}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden mb-2">
                                        <div
                                            className={`h-full rounded-full transition-all duration-700 ${parseFloat(sc.rate) >= 90 ? 'bg-emerald-500' : parseFloat(sc.rate) >= 70 ? 'bg-amber-500' : 'bg-rose-500'}`}
                                            style={{ width: `${sc.rate}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-[10px] text-slate-400">{sc.compliant}/{sc.total} workers compliant</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AnalyticsScreen;
