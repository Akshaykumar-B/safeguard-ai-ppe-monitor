import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const AddWorkerScreen = () => {
    const navigate = useNavigate();
    const { addWorker, addToast } = useApp();
    const fileInputRef = useRef(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);

    const [form, setForm] = useState({ name: '', employeeId: '', role: 'Technician', department: 'Maintenance', site: 'Refinery Alpha' });
    const [images, setImages] = useState([]);
    const [errors, setErrors] = useState({});
    const [showCamera, setShowCamera] = useState(false);
    const [cameraReady, setCameraReady] = useState(false);
    const [countdown, setCountdown] = useState(null);

    const updateField = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
    };

    const handleImageUpload = (e) => {
        Array.from(e.target.files).forEach(file => {
            const reader = new FileReader();
            reader.onload = (ev) => setImages(prev => [...prev, { src: ev.target.result, type: 'upload' }]);
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (idx) => setImages(prev => prev.filter((_, i) => i !== idx));

    // ── Camera Functions ──
    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
        if (videoRef.current) videoRef.current.srcObject = null;
        setShowCamera(false);
        setCameraReady(false);
        setCountdown(null);
    }, []);

    const openCamera = useCallback(async () => {
        setShowCamera(true);
        setCameraReady(false);

        try {
            const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            streamRef.current = s;
            if (videoRef.current) {
                videoRef.current.srcObject = s;
                videoRef.current.onloadedmetadata = () => {
                    videoRef.current.play().catch(() => { });
                    setCameraReady(true);
                };
            }
        } catch (err) {
            console.error('Camera error:', err);
            addToast('Camera access failed: ' + err.message, 'danger');
            setShowCamera(false);
        }
    }, [addToast]);

    useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(t => t.stop());
            }
        };
    }, []);

    const capturePhoto = useCallback(() => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas || video.videoWidth === 0) {
            addToast('Camera not ready yet, please wait...', 'warning');
            return;
        }
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);
        setImages(prev => [...prev, { src: canvas.toDataURL('image/jpeg', 0.9), type: 'webcam' }]);
        addToast('📸 Photo captured!', 'success');
    }, [addToast]);

    const captureWithTimer = useCallback(() => {
        setCountdown(3);
        let c = 3;
        const iv = setInterval(() => {
            c--;
            if (c <= 0) { clearInterval(iv); setCountdown(null); capturePhoto(); }
            else setCountdown(c);
        }, 1000);
    }, [capturePhoto]);

    const validate = () => {
        const errs = {};
        if (!form.name.trim() || form.name.trim().length < 2) errs.name = 'Full name is required (min 2 chars)';
        if (!form.employeeId.trim()) errs.employeeId = 'Employee ID is required';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = () => {
        if (!validate()) return;

        if (images.length === 0) {
            addToast('Please capture or upload at least one photo.', 'warning');
            return;
        }

        stopCamera();
        addWorker({ name: form.name.trim(), role: form.role, site: form.site });
        navigate('/workers');
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark">
            <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 h-16 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button onClick={() => { stopCamera(); navigate('/workers'); }} className="material-icons text-slate-500 hover:text-primary mr-2 transition-colors">arrow_back</button>
                        <div className="bg-primary p-1.5 rounded-lg"><span className="material-icons text-white text-xl">security</span></div>
                        <h1 className="text-lg font-bold">SafeGuard AI</h1>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span className="material-icons text-sm">info</span> All fields marked with * are required
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold">Add New Worker Profile</h2>
                    <p className="text-slate-500">Register a new employee for AI-powered safety monitoring.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Worker Info */}
                    <div className="lg:col-span-5">
                        <div className="bg-white dark:bg-slate-900/50 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                <span className="material-icons text-primary">badge</span> Worker Information
                            </h3>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Full Name *</label>
                                <input value={form.name} onChange={e => updateField('name', e.target.value)}
                                    className={`w-full bg-slate-50 dark:bg-slate-800 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${errors.name ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'}`}
                                    placeholder="Robert Johnson" type="text" />
                                {errors.name && <p className="text-[10px] text-rose-500 font-medium mt-1">{errors.name}</p>}
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Employee ID *</label>
                                <input value={form.employeeId} onChange={e => updateField('employeeId', e.target.value)}
                                    className={`w-full bg-slate-50 dark:bg-slate-800 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${errors.employeeId ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'}`}
                                    placeholder="EMP-12345" type="text" />
                                {errors.employeeId && <p className="text-[10px] text-rose-500 font-medium mt-1">{errors.employeeId}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Role</label>
                                    <select value={form.role} onChange={e => updateField('role', e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                                        {['Technician', 'Electrician', 'Senior Electrician', 'Welder', 'Forklift Operator', 'Lab Technician', 'Maintenance Tech', 'Safety Inspector', 'Crane Operator', 'Pipe Fitter', 'Quality Analyst'].map(r => <option key={r}>{r}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Site Location</label>
                                    <select value={form.site} onChange={e => updateField('site', e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                                        {['Refinery Alpha', 'Loading Dock', 'Welding Bay B', 'Chemical Lab', 'Assembly Line 4'].map(s => <option key={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Face Dataset */}
                    <div className="lg:col-span-7">
                        <div className="bg-white dark:bg-slate-900/50 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-semibold text-lg flex items-center gap-2">
                                    <span className="material-icons text-primary">face</span> Face Dataset
                                </h3>
                                <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-1 rounded-full">{images.length} image(s)</span>
                            </div>

                            {/* Tabs */}
                            <div className="flex gap-2 mb-6 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                                <button onClick={stopCamera}
                                    className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${!showCamera ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700'}`}>
                                    <span className="material-icons text-sm">cloud_upload</span> Upload Photos
                                </button>
                                <button onClick={openCamera}
                                    className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${showCamera ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700'}`}>
                                    <span className="material-icons text-sm">videocam</span> Live Camera
                                </button>
                            </div>

                            {/* Camera View — video is ALWAYS in DOM */}
                            <div style={{ display: showCamera ? 'block' : 'none' }} className="mb-6 space-y-4">
                                <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border-4 border-slate-800 shadow-2xl">
                                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />

                                    {/* Loading spinner */}
                                    {!cameraReady && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-10">
                                            <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-3"></div>
                                            <p className="text-white text-sm font-medium">Starting camera...</p>
                                            <p className="text-slate-400 text-[10px] mt-1">Please allow camera access when prompted</p>
                                        </div>
                                    )}

                                    {/* Face guide */}
                                    {cameraReady && (
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <div className="w-48 h-60 border-2 border-dashed border-white/40 rounded-[50%]"></div>
                                        </div>
                                    )}

                                    <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 z-20">
                                        <span className={`w-2 h-2 rounded-full ${cameraReady ? 'bg-red-500 animate-pulse' : 'bg-yellow-500'}`}></span>
                                        {cameraReady ? 'CAMERA ACTIVE' : 'CONNECTING...'}
                                    </div>

                                    {/* Countdown */}
                                    {countdown !== null && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-30">
                                            <span className="text-8xl font-black text-white animate-pulse">{countdown}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Controls */}
                                <div className="flex items-center justify-center gap-4">
                                    <button onClick={capturePhoto} disabled={!cameraReady}
                                        className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 ring-4 ring-primary/20 disabled:opacity-40 disabled:hover:scale-100">
                                        <span className="material-icons text-white text-2xl">photo_camera</span>
                                    </button>
                                    <button onClick={captureWithTimer} disabled={!cameraReady}
                                        className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-40" title="3s Timer">
                                        <span className="material-icons text-lg">timer</span>
                                    </button>
                                    <button onClick={stopCamera}
                                        className="p-3 bg-rose-100 dark:bg-rose-900/30 text-rose-600 rounded-full hover:bg-rose-200 dark:hover:bg-rose-900/50 transition-colors" title="Stop Camera">
                                        <span className="material-icons text-lg">videocam_off</span>
                                    </button>
                                </div>
                                <p className="text-center text-[10px] text-slate-400">Position face in center • Click the camera button or use the timer</p>
                            </div>

                            {/* Upload area */}
                            {!showCamera && (
                                <div onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-10 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/50 hover:border-primary cursor-pointer mb-6 transition-colors">
                                    <span className="material-icons text-primary text-3xl mb-2">cloud_upload</span>
                                    <p className="font-semibold">Click or drag images here</p>
                                    <p className="text-xs text-slate-400 mt-1">Supports JPG, PNG. Multiple files allowed.</p>
                                    <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                                </div>
                            )}

                            {/* Hidden canvas */}
                            <canvas ref={canvasRef} style={{ display: 'none' }} />

                            {/* Images grid */}
                            {images.length > 0 && (
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase mb-3">
                                        Captured Images ({images.filter(i => i.type === 'webcam').length} webcam, {images.filter(i => i.type === 'upload').length} uploaded)
                                    </p>
                                    <div className="grid grid-cols-4 gap-4">
                                        {images.map((img, i) => (
                                            <div key={i} className="relative aspect-square rounded-lg overflow-hidden border-2 border-slate-200 dark:border-slate-700 group shadow-sm">
                                                <img className="w-full h-full object-cover" src={img.src} alt={`face-${i}`} />
                                                <div className="absolute top-1 left-1">
                                                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${img.type === 'webcam' ? 'bg-emerald-500 text-white' : 'bg-blue-500 text-white'}`}>
                                                        {img.type === 'webcam' ? '📸 LIVE' : '📁 FILE'}
                                                    </span>
                                                </div>
                                                <button onClick={() => removeImage(i)}
                                                    className="absolute top-1 right-1 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                                                    <span className="material-icons text-sm">close</span>
                                                </button>
                                            </div>
                                        ))}
                                        <div onClick={() => showCamera ? capturePhoto() : fileInputRef.current?.click()}
                                            className="aspect-square rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-slate-300 hover:text-primary hover:border-primary transition-colors cursor-pointer">
                                            <span className="material-icons">{showCamera ? 'photo_camera' : 'add'}</span>
                                            <span className="text-[8px] font-bold mt-1">{showCamera ? 'CAPTURE' : 'ADD'}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-8 flex justify-end gap-3 border-t border-slate-200 dark:border-slate-800 pt-6">
                    <button onClick={() => { stopCamera(); navigate('/workers'); }}
                        className="px-6 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleSubmit}
                        className="px-8 py-2.5 rounded-lg bg-primary text-white font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors">
                        Save Profile
                    </button>
                </div>
            </main>
        </div>
    );
};

export default AddWorkerScreen;
