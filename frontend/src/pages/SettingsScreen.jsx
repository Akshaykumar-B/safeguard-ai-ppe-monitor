import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useApp } from '../context/AppContext';

const SettingsScreen = () => {
    const { settings, updateSettings, saveSettings, discardSettings, addToast } = useApp();
    const [newZone, setNewZone] = useState('');
    const [newPPE, setNewPPE] = useState('');
    const [showAddZone, setShowAddZone] = useState(false);

    const handleAddZoneRule = () => {
        if (!newZone.trim() || !newPPE.trim()) {
            addToast('Please fill in both zone name and PPE requirements', 'warning');
            return;
        }
        const ppeList = newPPE.split(',').map(p => p.trim()).filter(Boolean);
        const updated = [...(settings.zoneRules || []), { zone: newZone.trim(), ppe: ppeList }];
        updateSettings('zoneRules', updated);
        setNewZone('');
        setNewPPE('');
        setShowAddZone(false);
        addToast(`Zone rule added for ${newZone.trim()}`, 'success');
    };

    const removeZoneRule = (idx) => {
        const updated = (settings.zoneRules || []).filter((_, i) => i !== idx);
        updateSettings('zoneRules', updated);
        addToast('Zone rule removed', 'info');
    };

    return (
        <div className="flex min-h-screen bg-background-light dark:bg-background-dark">
            <Sidebar />
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <Header title="System Configuration" />
                <div className="flex-1 overflow-y-auto p-8 space-y-8 pb-24 custom-scrollbar">
                    {/* Camera & Input Source */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="material-icons text-primary">videocam</span>
                            <h3 className="text-lg font-semibold">Camera & Input Source</h3>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">

                            {/* Source Selection */}
                            <div>
                                <h4 className="font-bold text-sm mb-3">Video Feed Source</h4>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => updateSettings('cameraSource', 'webcam')}
                                        className={`flex-1 py-3 px-4 rounded-lg border-2 flex items-center justify-center gap-2 transition-all ${settings.cameraSource === 'webcam' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 dark:border-slate-800 text-slate-500 hover:border-primary/30'}`}
                                    >
                                        <span className="material-icons">laptop_chromebook</span>
                                        <span className="font-bold text-sm">Device Webcam</span>
                                    </button>
                                    <button
                                        onClick={() => updateSettings('cameraSource', 'rtsp')}
                                        className={`flex-1 py-3 px-4 rounded-lg border-2 flex items-center justify-center gap-2 transition-all ${settings.cameraSource === 'rtsp' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 dark:border-slate-800 text-slate-500 hover:border-primary/30'}`}
                                    >
                                        <span className="material-icons">router</span>
                                        <span className="font-bold text-sm">RTSP Stream (CCTV)</span>
                                    </button>
                                </div>
                            </div>

                            {/* RTSP Input */}
                            {settings.cameraSource === 'rtsp' && (
                                <div className="space-y-2 animate-fadeIn">
                                    <label className="text-sm font-medium">RTSP URL</label>
                                    <div className="flex gap-2">
                                        <input
                                            value={settings.rtspUrl || ''}
                                            onChange={e => updateSettings('rtspUrl', e.target.value)}
                                            placeholder="rtsp://admin:password@192.168.1.10:554/stream"
                                            className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono"
                                        />
                                        <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors">Test Connection</button>
                                    </div>
                                    <p className="text-[10px] text-slate-400">Enter the full RTSP stream URL provided by your IP camera manufacturer.</p>
                                </div>
                            )}

                            {/* Detection Targets */}
                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                <h4 className="font-bold text-sm mb-3">PPE Detection Targets</h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {['helmet', 'vest', 'mask', 'gloves', 'goggles', 'boots'].map(target => (
                                        <label key={target} className="flex items-center gap-3 cursor-pointer group">
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    checked={settings.detectionTargets?.[target] ?? true}
                                                    onChange={e => updateSettings('detectionTargets', { ...settings.detectionTargets, [target]: e.target.checked })}
                                                    className="peer sr-only"
                                                />
                                                <div className="w-10 h-6 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-4 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                            </div>
                                            <span className="text-sm font-medium capitalize group-hover:text-primary transition-colors">
                                                {target === 'helmet' ? 'Safety Helmet' :
                                                    target === 'vest' ? 'Safety Vest' :
                                                        target === 'mask' ? 'Face Mask' :
                                                            target === 'gloves' ? 'Safety Gloves' :
                                                                target === 'goggles' ? 'Protective Goggles' : 'Safety Boots'}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Identity Targets */}
                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                <h4 className="font-bold text-sm mb-3">Human & Identity Targets</h4>
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            checked={settings.detectionTargets?.face_id ?? false}
                                            onChange={e => updateSettings('detectionTargets', { ...settings.detectionTargets, face_id: e.target.checked })}
                                            className="peer sr-only"
                                        />
                                        <div className="w-10 h-6 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-4 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium group-hover:text-emerald-500 transition-colors">Worker Identification (Face ID)</span>
                                        <p className="text-[10px] text-slate-400">Match detected faces with registered worker profiles</p>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </section>

                    {/* Detection Settings */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="material-icons text-primary">radar</span>
                            <h3 className="text-lg font-semibold">Detection Settings</h3>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                <h4 className="font-bold text-sm">Detection Confidence Threshold</h4>
                                <p className="text-xs text-slate-500 mt-1">Current: {Math.round(settings.confidenceThreshold * 100)}%</p>
                                <input
                                    className="w-full mt-4 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
                                    type="range"
                                    min="0.5"
                                    max="0.99"
                                    step="0.01"
                                    value={settings.confidenceThreshold}
                                    onChange={e => updateSettings('confidenceThreshold', parseFloat(e.target.value))}
                                />
                                <div className="flex justify-between text-[10px] text-slate-400 mt-2">
                                    <span>50% (Lenient)</span>
                                    <span>99% (Strict)</span>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                <h4 className="font-bold text-sm">Inference Frequency</h4>
                                <p className="text-xs text-slate-500 mt-1">Higher FPS = more detection accuracy</p>
                                <select
                                    value={settings.inferenceFrequency}
                                    onChange={e => updateSettings('inferenceFrequency', e.target.value)}
                                    className="w-full mt-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                >
                                    <option value="5fps">5 FPS (Standard Monitoring)</option>
                                    <option value="15fps">15 FPS (High Risk Zones)</option>
                                    <option value="30fps">30 FPS (Maximum Accuracy)</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    {/* PPE Rules */}
                    <section className="space-y-6 pt-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="material-icons text-primary">engineering</span>
                            <h3 className="text-lg font-semibold">Site-Specific PPE Rules</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                <h4 className="font-bold text-sm mb-4">Required Gear by Zone</h4>
                                <div className="space-y-3">
                                    {(settings.zoneRules || []).map((rule, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg group">
                                            <span className="text-sm font-medium">{rule.zone}</span>
                                            <div className="flex items-center gap-1">
                                                {rule.ppe.map((p, i) => (
                                                    <span key={i} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-bold uppercase">{p}</span>
                                                ))}
                                                <button
                                                    onClick={() => removeZoneRule(idx)}
                                                    className="ml-2 text-slate-400 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <span className="material-icons text-sm">close</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {showAddZone ? (
                                    <div className="mt-4 p-4 border border-dashed border-primary/30 rounded-lg space-y-3">
                                        <input
                                            value={newZone}
                                            onChange={e => setNewZone(e.target.value)}
                                            placeholder="Zone name (e.g., Warehouse C)"
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        />
                                        <input
                                            value={newPPE}
                                            onChange={e => setNewPPE(e.target.value)}
                                            placeholder="PPE items (comma separated, e.g., Hard Hat, Gloves)"
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleAddZoneRule}
                                                className="flex-1 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-colors"
                                            >
                                                Add Rule
                                            </button>
                                            <button
                                                onClick={() => { setShowAddZone(false); setNewZone(''); setNewPPE(''); }}
                                                className="px-4 py-2 text-xs font-bold text-slate-500 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setShowAddZone(true)}
                                        className="w-full mt-4 py-2 border border-dashed border-primary/30 text-primary text-xs font-bold rounded-lg hover:bg-primary/5 transition-colors"
                                    >
                                        + ADD NEW ZONE RULE
                                    </button>
                                )}
                            </div>
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                <h4 className="font-bold text-sm mb-4">Exemption Policies</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 border border-slate-100 dark:border-slate-800 rounded-lg">
                                        <div>
                                            <p className="text-sm font-medium">Visitor Paths</p>
                                            <p className="text-[10px] text-slate-500">Disable helmet check in marked walkways</p>
                                        </div>
                                        <button
                                            onClick={() => updateSettings('exemptions', { ...(settings.exemptions || {}), visitorPaths: !settings.exemptions?.visitorPaths })}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.exemptions?.visitorPaths ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`}
                                        >
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.exemptions?.visitorPaths ? 'translate-x-6' : 'translate-x-1'}`}></span>
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between p-3 border border-slate-100 dark:border-slate-800 rounded-lg">
                                        <div>
                                            <p className="text-sm font-medium">Maintenance Windows</p>
                                            <p className="text-[10px] text-slate-500">Allow vest removal during HVAC repairs</p>
                                        </div>
                                        <button
                                            onClick={() => updateSettings('exemptions', { ...(settings.exemptions || {}), maintenanceWindows: !settings.exemptions?.maintenanceWindows })}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.exemptions?.maintenanceWindows ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`}
                                        >
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.exemptions?.maintenanceWindows ? 'translate-x-6' : 'translate-x-1'}`}></span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Privacy & Security */}
                    <section className="space-y-6 pt-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="material-icons text-primary">privacy_tip</span>
                            <h3 className="text-lg font-semibold">Privacy & Security</h3>
                        </div>
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                            <div className="p-6 flex items-center justify-between">
                                <div>
                                    <h4 className="font-bold text-sm">PII Anonymization (Auto-Blur)</h4>
                                    <p className="text-xs text-slate-500 mt-1">Automatically blur faces in stored footage to comply with GDPR/local laws.</p>
                                </div>
                                <button
                                    onClick={() => updateSettings('piiAnonymization', !settings.piiAnonymization)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.piiAnonymization ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.piiAnonymization ? 'translate-x-6' : 'translate-x-1'}`}></span>
                                </button>
                            </div>
                            <div className="p-6 flex items-center justify-between">
                                <div>
                                    <h4 className="font-bold text-sm">Local Processing Mode</h4>
                                    <p className="text-xs text-slate-500 mt-1">Keep all video data on-premise. Only metadata is sent to cloud dashboard.</p>
                                </div>
                                <button
                                    onClick={() => updateSettings('localProcessing', !settings.localProcessing)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.localProcessing ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.localProcessing ? 'translate-x-6' : 'translate-x-1'}`}></span>
                                </button>
                            </div>
                            <div className="p-6 flex items-center justify-between">
                                <div>
                                    <h4 className="font-bold text-sm">Data Retention Period</h4>
                                    <p className="text-xs text-slate-500 mt-1">Duration violation snapshots are kept.</p>
                                </div>
                                <select
                                    value={settings.dataRetention}
                                    onChange={e => updateSettings('dataRetention', e.target.value)}
                                    className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                >
                                    <option value="7">7 Days</option>
                                    <option value="30">30 Days</option>
                                    <option value="90">90 Days</option>
                                    <option value="365">1 Year</option>
                                </select>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Save / Discard Footer */}
                <footer className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 flex items-center justify-end px-8 gap-4 sticky bottom-0">
                    <button
                        onClick={discardSettings}
                        className="px-6 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                        Discard
                    </button>
                    <button
                        onClick={saveSettings}
                        className="px-8 py-2.5 bg-primary text-white text-sm font-bold rounded-lg shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors"
                    >
                        Save Configuration
                    </button>
                </footer>
            </main>
        </div>
    );
};

export default SettingsScreen;
