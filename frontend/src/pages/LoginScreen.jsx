import { useState, useEffect, useRef, useCallback } from 'react';
import { ScanningGrid } from '../components/Login/ScanningGrid';
import { DetectionBoxes } from '../components/Login/DetectionBoxes';
import { LightBeam } from '../components/Login/LightBeam';
import { LoginCard } from '../components/Login/LoginCard';
import { AIMascot } from '../components/Login/AIMascot';
import { Shield, Activity, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function LoginScreen() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const containerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const videoRef = useRef(null);

  // Auth check from original LoginScreen
  const navigate = useNavigate();
  const { currentUser, userProfile, loading } = useAuth();
  
  // Stable ID for the session display to prevent re-render flickering
  const sessionID = useRef(Math.random().toString(36).substr(2, 9).toUpperCase()).current;

  // If already logged in with valid profile, redirect to dashboard
  useEffect(() => {
      if (!loading && currentUser && userProfile && userProfile.status === 'active') {
          navigate('/', { replace: true });
      }
  }, [loading, currentUser, userProfile, navigate]);

  // Track mouse position for AI mascot eye following - Optimized with rAF
  const handleMouseMove = useCallback((e) => {
    if (containerRef.current) {
        requestAnimationFrame(() => {
            const rect = containerRef.current.getBoundingClientRect();
            setMousePosition({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            });
        });
    }
  }, []);

  useEffect(() => {
    // Check if video can auto-play efficiently
    if (videoRef.current) {
        videoRef.current.playbackRate = 0.8; // Slow down slightly for smoother effect
        videoRef.current.play().catch(() => {});
    }

    const throttledHandler = (e) => {
        // Simple throttle to ~30fps equivalent
        if (Date.now() % 2 === 0) handleMouseMove(e);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [handleMouseMove]);


  // Handle password typing
  const handlePasswordChange = () => {
    setIsTyping(true);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 500);
  };

  return (
    <div 
      ref={containerRef}
      className="relative min-h-screen w-full overflow-hidden bg-navy text-white"
    >
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          preload="auto"
          className="h-full w-full object-cover"
          style={{ filter: 'blur(8px) brightness(0.4) saturate(0.7)' }}
        >
          <source src="/factory-bg.mp4" type="video/mp4" />
        Your browser does not support the video tag.
        </video>
      </div>

      {/* Dark Gradient Overlay */}
      <div 
        className="absolute inset-0 z-[1]"
        style={{
          background: `
            linear-gradient(180deg, 
              rgba(2, 6, 23, 0.9) 0%, 
              rgba(15, 23, 42, 0.7) 30%, 
              rgba(15, 23, 42, 0.6) 50%, 
              rgba(15, 23, 42, 0.7) 70%, 
              rgba(2, 6, 23, 0.9) 100%
            )
          `,
        }}
      />

      {/* Scanning Grid Lines */}
      <ScanningGrid />

      {/* AI Detection Boxes */}
      <DetectionBoxes />

      {/* Light Beam Sweep Effect */}
      <LightBeam />

      {/* Corner HUD Elements */}
      <div className="absolute top-0 left-0 z-20 p-6 pointer-events-none">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Shield className="h-8 w-8 text-cyan" />
            <div className="absolute inset-0 animate-pulse-glow">
              <Shield className="h-8 w-8 text-cyan opacity-50" />
            </div>
          </div>
          <div>
            <h1 className="font-orbitron font-bold text-xl tracking-wider text-white">
              SAFEGUARD<span className="text-cyan">AI</span>
            </h1>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-cyan animate-pulse" />
              <p className="font-rajdhani text-xs tracking-[0.2em] text-cyan-dim">SYSTEM SECURE</p>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute top-0 right-0 z-20 p-6 flex flex-col items-end pointer-events-none">
        <div className="flex items-center gap-2 text-cyan-dim mb-1">
          <Activity className="h-4 w-4" />
          <span className="font-rajdhani text-xs tracking-wider">NET_STATUS: ACTIVE</span>
        </div>
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <div 
              key={i} 
              className="h-1 w-4 bg-cyan"
              style={{ opacity: 0.2 + (i * 0.2) }} 
            />
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 z-20 p-6 pointer-events-none">
        <div className="font-rajdhani text-xs text-cyan-dim/50 tracking-widest">
          ID: {sessionID} // SEC_LEVEL: ALPHA
        </div>
      </div>

      <div className="absolute bottom-0 right-0 z-20 p-6 pointer-events-none">
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-cyan-dim/50" />
          <span className="font-rajdhani text-xs text-cyan-dim/50 tracking-widest">ENCRYPTED CONNECTION</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center p-4">
        <div className="flex w-full max-w-6xl flex-col items-center gap-12 lg:flex-row lg:justify-between lg:gap-8">
          
          {/* Left Column: AI Mascot */}
          <div className="flex w-full flex-col items-center lg:items-center lg:w-1/2">
            <AIMascot 
              mousePosition={mousePosition}
              isPasswordFocused={isPasswordFocused}
              isTyping={isTyping}
            />
            
            <div className="mt-8 text-center hidden lg:block">
              <h2 className="font-orbitron text-3xl font-bold text-white mb-2 text-glow">
                Access Restricted
              </h2>
              <p className="font-rajdhani text-cyan-dim text-lg tracking-wide max-w-md mx-auto">
                Authorized personnel only. All access attempts are monitored and logged by AI security protocols.
              </p>
            </div>
          </div>

          {/* Right Column: Login Card */}
          <div className="flex w-full justify-center lg:w-1/2">
            <LoginCard 
              onPasswordFocus={() => setIsPasswordFocused(true)}
              onPasswordBlur={() => setIsPasswordFocused(false)}
              onPasswordChange={handlePasswordChange}
            />
          </div>

        </div>
      </div>
    </div>
  );
}

export default LoginScreen;
