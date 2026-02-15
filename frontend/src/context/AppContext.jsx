import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AppContext = createContext(null);

// ── Seed Data (fallback when backend is offline) ───────────
const INITIAL_WORKERS = [
    { id: 'WRK-9402', name: 'Marcus Chen', role: 'Senior Electrician', site: 'Refinery Alpha', compliance: 'Compliant', lastSeen: '2m ago', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAuEb7j5y06EgKq5FEmHUUT-sBynCFCPFJ4_twGpXTUBCEdOajwF2kFwdwwXNrt2lG2vjmA_I4fuRp5tNwYLgRNY7xMTkRtb9HRDEkH0rSH9ZkCYcfp8qTQALfO8rjf8rQrr-K9GWsQK1TXb_g-C9p4F5qA_3V01Gqa94QeMPqA5A4SaMv35RaqGZh5UNL91T_vKNG1dh-odaN2_LdSp8QgMd_85IJtAsWSr61dhTCULa9yD9To2HueY8WGH4SlJZedetfQLWbEBfg' },
    { id: 'WRK-8810', name: 'Sarah Mitchell', role: 'Welder', site: 'Welding Bay B', compliance: 'Compliant', lastSeen: '5m ago', img: '' },
    { id: 'WRK-7654', name: 'James Rodriguez', role: 'Forklift Operator', site: 'Loading Dock', compliance: 'Violation', lastSeen: '1m ago', img: '' },
    { id: 'WRK-6230', name: 'Aisha Patel', role: 'Lab Technician', site: 'Chemical Lab', compliance: 'Compliant', lastSeen: '8m ago', img: '' },
    { id: 'WRK-5511', name: 'David Kim', role: 'Maintenance Tech', site: 'Refinery Alpha', compliance: 'Compliant', lastSeen: '12m ago', img: '' },
    { id: 'WRK-4902', name: 'Linda Okafor', role: 'Safety Inspector', site: 'Assembly Line 4', compliance: 'Compliant', lastSeen: '3m ago', img: '' },
    { id: 'WRK-3318', name: 'Tom Nguyen', role: 'Crane Operator', site: 'Loading Dock', compliance: 'Warning', lastSeen: '7m ago', img: '' },
    { id: 'WRK-2245', name: 'Emily Watson', role: 'Electrician', site: 'Welding Bay B', compliance: 'Compliant', lastSeen: '15m ago', img: '' },
    { id: 'WRK-1190', name: 'Carlos Mendez', role: 'Pipe Fitter', site: 'Refinery Alpha', compliance: 'Compliant', lastSeen: '20m ago', img: '' },
    { id: 'WRK-0087', name: 'Priya Sharma', role: 'Quality Analyst', site: 'Chemical Lab', compliance: 'Compliant', lastSeen: '25m ago', img: '' },
];
// Real-time Metrics State
const INITIAL_METRICS = {
    total_tracked: 0,
    active_violations: 0,
    compliance_rate: 100.0,
    fps: 0.0
};

const INITIAL_VIOLATIONS = [
    { id: 'VIO-001', snapshot: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAvDSufplSJfYJaxmK5sV8IG19ItPMurwcQGQcEF8ZqaiEwxRYqMeJizUiPOMGIWFz7BKF38ZpXZN8aTVt9QVdsgFc_H8ueLJI-jY0suCfIwYNPkRL1lOuueMPT_v_zR8tY9ub8CVFgi8CSjoi9X_mEqvjpV2k9PEqQxjhghJqois7mHqf85jkexjfq1m6ogTtrDzwWvoge2ERRWE32bdtmYY9cYIzx_yi-9aSheviRhQyRDrKDAp-ZANtazomY0Gn1D8PBmi9Xt6o', date: 'Feb 10, 2026', time: '12:20:05', worker: 'Robert Chen', workerId: 'EMP-0921', type: 'No High-Vis Vest', severity: 'High', zone: 'Zone 4 - Loader Area', status: 'Pending' },
    { id: 'VIO-002', snapshot: '', date: 'Feb 10, 2026', time: '11:45:22', worker: 'James Rodriguez', workerId: 'WRK-7654', type: 'No Safety Helmet', severity: 'Critical', zone: 'Loading Dock 4', status: 'Pending' },
    { id: 'VIO-003', snapshot: '', date: 'Feb 10, 2026', time: '10:32:18', worker: 'Tom Nguyen', workerId: 'WRK-3318', type: 'Missing Gloves', severity: 'Medium', zone: 'Dock 2 - Receiving', status: 'Reviewed' },
    { id: 'VIO-004', snapshot: '', date: 'Feb 09, 2026', time: '16:14:41', worker: 'Sarah Mitchell', workerId: 'WRK-8810', type: 'No Welding Mask', severity: 'Critical', zone: 'Welding Bay B', status: 'Resolved' },
    { id: 'VIO-005', snapshot: '', date: 'Feb 09, 2026', time: '14:55:33', worker: 'Marcus Chen', workerId: 'WRK-9402', type: 'No Safety Goggles', severity: 'Low', zone: 'Refinery Alpha', status: 'Resolved' },
    { id: 'VIO-006', snapshot: '', date: 'Feb 09, 2026', time: '09:08:12', worker: 'Emily Watson', workerId: 'WRK-2245', type: 'No High-Vis Vest', severity: 'High', zone: 'Welding Bay B', status: 'Reviewed' },
    { id: 'VIO-007', snapshot: '', date: 'Feb 08, 2026', time: '15:44:09', worker: 'David Kim', workerId: 'WRK-5511', type: 'No Safety Helmet', severity: 'High', zone: 'Refinery Alpha', status: 'Resolved' },
    { id: 'VIO-008', snapshot: '', date: 'Feb 08, 2026', time: '13:22:57', worker: 'Aisha Patel', workerId: 'WRK-6230', type: 'Missing Gloves', severity: 'Medium', zone: 'Chemical Lab', status: 'Resolved' },
];

const INITIAL_ALERTS = [
    { id: 1, type: 'High Severity', time: '2m ago', title: 'No Safety Helmet', zone: 'Zone 4 - Loader Area', worker: 'James Rodriguez', color: 'rose', read: false },
    { id: 2, type: 'Medium', time: '14m ago', title: 'No Safety Vest', zone: 'Dock 2 - Receiving', worker: 'Tom Nguyen', color: 'amber', read: false },
    { id: 3, type: 'Low', time: '28m ago', title: 'Missing Gloves', zone: 'Assembly Line 4', worker: 'Linda Okafor', color: 'blue', read: false },
];

const DEFAULT_SETTINGS = {
    confidenceThreshold: 0.75,
    inferenceFrequency: '15fps',
    cameraSource: 'webcam', // 'webcam' or 'rtsp'
    rtspUrl: '',
    detectionTargets: {
        helmet: true,
        vest: true
    },
    zoneRules: [
        { zone: 'Refinery Alpha', ppe: ['Hard Hat', 'Reflective Vest'] },
        { zone: 'Welding Bay B', ppe: ['Welding Mask', 'Gloves'] },
    ],
    exemptions: {
        visitorPaths: false,
        maintenanceWindows: false
    },
    piiAnonymization: true,
    localProcessing: true,
    dataRetention: 30
};

// ── Provider ───────────────────────────────────────────────
export function AppProvider({ children }) {
    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem('sg-darkMode');
        return saved ? JSON.parse(saved) : false;
    });
    const [backendOnline, setBackendOnline] = useState(false);
    const [workers, setWorkers] = useState(INITIAL_WORKERS);
    const [violations, setViolations] = useState(INITIAL_VIOLATIONS);
    const [alerts, setAlerts] = useState(INITIAL_ALERTS);
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [savedSettings, setSavedSettings] = useState(DEFAULT_SETTINGS);
    const [notifications, setNotifications] = useState([
        { id: 1, message: 'Critical: Helmet violation detected in Zone 4', time: '2m ago', read: false, type: 'danger' },
        { id: 2, message: 'Worker WRK-7654 non-compliant for 5 minutes', time: '5m ago', read: false, type: 'warning' },
        { id: 3, message: 'Shift B compliance rate reached 96%', time: '1h ago', read: true, type: 'success' },
    ]);
    const [realMetrics, setRealMetrics] = useState(INITIAL_METRICS);
    const [toasts, setToasts] = useState([]);

    // Dark mode sync
    useEffect(() => {
        document.documentElement.classList.toggle('dark', darkMode);
        localStorage.setItem('sg-darkMode', JSON.stringify(darkMode));
    }, [darkMode]);

    // Try to connect to backend on mount
    useEffect(() => {
        api.health().then(res => {
            if (res) {
                setBackendOnline(true);
                console.log('✅ Backend connected:', res.service, '| OpenCV:', res.opencv_version);
                // Sync data from backend
                api.getWorkers().then(data => { if (data) setWorkers(prev => data.map(w => ({ ...w, img: '' }))); });
                api.getViolations().then(data => { if (data && data.length > 0) setViolations(data.map(v => ({ ...v, snapshot: v.snapshot || '' }))); });
                api.getAlerts().then(data => { if (data && data.length > 0) setAlerts(data); });
                api.getSettings().then(data => {
                    if (data && Object.keys(data).length > 0) {
                        const merged = {
                            ...DEFAULT_SETTINGS,
                            ...data,
                            detectionTargets: { ...DEFAULT_SETTINGS.detectionTargets, ...(data.detectionTargets || {}) },
                            exemptions: { ...DEFAULT_SETTINGS.exemptions, ...(data.exemptions || {}) },
                            zoneRules: data.zoneRules || DEFAULT_SETTINGS.zoneRules,
                        };
                        setSettings(merged);
                        setSavedSettings(merged);
                    }
                });
            } else {
                console.log('⚡ Running in offline mode (frontend-only)');
            }
        });
    }, []);

    // REAL-TIME UPDATES: Poll backend processing results
    useEffect(() => {
        if (!backendOnline) return;

        const interval = setInterval(() => {
            // Fetch latest violations and alerts to update dashboard live
            api.getViolations().then(data => {
                if (data && data.length > 0) setViolations(data.map(v => ({ ...v, snapshot: v.snapshot || '' })));
            });
            api.getAlerts().then(data => {
                if (data && data.length > 0) setAlerts(data);
            });
            // Fetch real-time metrics
            api.getMetrics().then(data => {
                if (data) setRealMetrics(data);
            });
        }, 1000); // 1 second refresh rate

        return () => clearInterval(interval);
    }, [backendOnline]);

    // Toast helper
    const addToast = useCallback((message, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
    }, []);

    // Worker CRUD
    const addWorker = useCallback((worker) => {
        const newId = `WRK-${String(Math.floor(Math.random() * 9000) + 1000)}`;
        const newWorker = { ...worker, id: newId, compliance: 'Compliant', lastSeen: 'Just now', img: '' };
        setWorkers(prev => [newWorker, ...prev]);
        if (backendOnline) api.addWorker(worker);
        addToast(`Worker ${worker.name} added successfully!`);
    }, [addToast, backendOnline]);

    const deleteWorker = useCallback((workerId) => {
        setWorkers(prev => prev.filter(w => w.id !== workerId));
        if (backendOnline) api.deleteWorker(workerId);
        addToast('Worker removed', 'info');
    }, [addToast, backendOnline]);

    // Violation actions
    const updateViolationStatus = useCallback((violationId, status) => {
        setViolations(prev => prev.map(v => v.id === violationId ? { ...v, status } : v));
        if (backendOnline) api.updateViolation(violationId, { status });
        addToast(`Violation ${violationId} marked as ${status}`);
    }, [addToast, backendOnline]);

    // Alert actions
    const markAlertRead = useCallback((alertId) => {
        setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, read: true } : a));
        if (backendOnline) api.markAlertRead(alertId);
    }, [backendOnline]);

    const dismissAlert = useCallback((alertId) => {
        setAlerts(prev => prev.filter(a => a.id !== alertId));
        if (backendOnline) api.dismissAlert(alertId);
        addToast('Alert dismissed', 'info');
    }, [addToast, backendOnline]);

    // Notification actions
    const markNotificationRead = useCallback((notifId) => {
        setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
    }, []);

    const markAllNotificationsRead = useCallback(() => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }, []);

    // Settings actions
    const updateSettings = useCallback((key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    }, []);

    const saveSettings = useCallback(() => {
        setSavedSettings({ ...settings });
        if (backendOnline) api.saveSettings(settings);
        addToast('Settings saved successfully!');
    }, [settings, addToast, backendOnline]);

    const discardSettings = useCallback(() => {
        setSettings({ ...savedSettings });
        addToast('Changes discarded', 'info');
    }, [savedSettings, addToast]);

    // Computed stats
    const stats = {
        totalWorkers: realMetrics.total_tracked, // Using real-time tracked count
        activeWorkers: realMetrics.total_tracked,
        complianceRate: realMetrics.compliance_rate, // Real-time compliance rate
        activeAlerts: realMetrics.active_violations, // Real-time active violations
        totalViolations: violations.length,
        pendingViolations: violations.filter(v => v.status === 'Pending').length,
        detectedToday: violations.filter(v => v.date.includes('Feb 10')).length, // Keep for historical
        overallScore: Math.round(realMetrics.compliance_rate), // Use real compliance rate
        unreadNotifications: notifications.filter(n => !n.read).length,
        fps: realMetrics.fps // Expose FPS
    };

    // CSV Export (uses backend if online, otherwise local)
    const exportViolationsCSV = useCallback(() => {
        if (backendOnline) {
            window.open(api.exportViolationsUrl, '_blank');
        } else {
            const header = 'ID,Date,Time,Worker,Worker ID,Violation Type,Severity,Zone,Status\n';
            const rows = violations.map(v =>
                `${v.id},${v.date},${v.time},${v.worker},${v.workerId},${v.type},${v.severity},${v.zone},${v.status}`
            ).join('\n');
            const blob = new Blob([header + rows], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `safeguard-violations-${new Date().toISOString().slice(0, 10)}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        }
        addToast('Violations exported as CSV!');
    }, [violations, addToast, backendOnline]);

    const exportWorkersCSV = useCallback(() => {
        if (backendOnline) {
            window.open(api.exportWorkersUrl, '_blank');
        } else {
            const header = 'ID,Name,Role,Site,Compliance,Last Seen\n';
            const rows = workers.map(w =>
                `${w.id},${w.name},${w.role},${w.site},${w.compliance},${w.lastSeen}`
            ).join('\n');
            const blob = new Blob([header + rows], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `safeguard-workers-${new Date().toISOString().slice(0, 10)}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        }
        addToast('Workers exported as CSV!');
    }, [workers, addToast, backendOnline]);

    // PPE Detection
    const detectPPE = useCallback(async (imageFile) => {
        if (!backendOnline) {
            addToast('Backend is offline. Start the Flask server to use PPE detection.', 'warning');
            return null;
        }
        addToast('Analyzing image for PPE compliance...', 'info');
        const result = await api.detectPPE(imageFile);
        if (result) {
            if (result.compliance_status === 'Compliant') {
                addToast('✅ All PPE detected — Worker is compliant!', 'success');
            } else if (result.compliance_status === 'Violation') {
                addToast('🚨 PPE violation detected! Alert created.', 'danger');
            } else {
                addToast(`Detection result: ${result.compliance_status}`, 'info');
            }
        }
        return result;
    }, [backendOnline, addToast]);

    const value = {
        darkMode, setDarkMode,
        backendOnline,
        workers, addWorker, deleteWorker,
        violations, updateViolationStatus,
        alerts, markAlertRead, dismissAlert,
        settings, updateSettings, saveSettings, discardSettings,
        notifications, markNotificationRead, markAllNotificationsRead,
        stats, realMetrics,
        toasts,
        addToast,
        exportViolationsCSV,
        exportWorkersCSV,
        detectPPE,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error('useApp must be used within AppProvider');
    return ctx;
}
