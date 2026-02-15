import { useState, useRef, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export function LoginCard({ onPasswordFocus, onPasswordBlur, onPasswordChange }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordInputFocused, setIsPasswordInputFocused] = useState(false);
  // Remove local isLoading and use auth loading but only for button
  const [isSubmitting, setIsSubmitting] = useState(false); 
  
  const cardRef = useRef(null);

  // Auth Hook Integration
  const navigate = useNavigate();
  const { login, loginWithGoogle, currentUser, userProfile, loading, authError, setAuthError } = useAuth();
  const [localError, setLocalError] = useState('');

  // 3D tilt effect
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / 30;
      const rotateY = (centerX - x) / 30;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    };

    const handleMouseLeave = () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setAuthError('');
    setIsSubmitting(true);
    try {
        await login(email, password);
        // Login successful, redirect happens via LoginScreen useEffect or AuthContext
    } catch (err) {
        setLocalError(err.message.replace('Firebase: ', ''));
    }
    setIsSubmitting(false);
  };

  const handleGoogleLogin = async () => {
    setLocalError('');
    setAuthError('');
    setIsSubmitting(true);
    try {
        await loginWithGoogle();
    } catch (err) {
        setLocalError(err.message.replace('Firebase: ', ''));
    }
    setIsSubmitting(false);
  };

  const handlePasswordInput = (e) => {
    setPassword(e.target.value);
    onPasswordChange();
  };

  const displayError = authError || localError;

  return (
    <div
      ref={cardRef}
      className="relative w-full max-w-md transition-transform duration-200 ease-out"
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* Card Glow Effect - Neutralized */}
      <div 
        className="absolute -inset-1 rounded-2xl opacity-40 blur-xl"
        style={{
          background: 'linear-gradient(135deg, rgba(156, 163, 175, 0.1) 0%, rgba(107, 114, 128, 0.1) 100%)',
          animation: 'pulse-glow 5s ease-in-out infinite',
        }}
      />
      
      {/* Main Card */}
      <div className="relative glassmorphism rounded-2xl p-8 overflow-hidden">
        {/* Corner Decorations - Gray */}
        <svg className="absolute top-0 left-0 w-16 h-16" viewBox="0 0 64 64">
          <path
            d="M 0 20 L 0 0 L 20 0"
            fill="none"
            stroke="rgba(156, 163, 175, 0.3)"
            strokeWidth="1"
          />
        </svg>
        <svg className="absolute top-0 right-0 w-16 h-16" viewBox="0 0 64 64">
          <path
            d="M 44 0 L 64 0 L 64 20"
            fill="none"
            stroke="rgba(156, 163, 175, 0.3)"
            strokeWidth="1"
          />
        </svg>
        <svg className="absolute bottom-0 left-0 w-16 h-16" viewBox="0 0 64 64">
          <path
            d="M 0 44 L 0 64 L 20 64"
            fill="none"
            stroke="rgba(156, 163, 175, 0.3)"
            strokeWidth="1"
          />
        </svg>
        <svg className="absolute bottom-0 right-0 w-16 h-16" viewBox="0 0 64 64">
          <path
            d="M 44 64 L 64 64 L 64 44"
            fill="none"
            stroke="rgba(156, 163, 175, 0.3)"
            strokeWidth="1"
          />
        </svg>

        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-800/50 mb-4 relative">
            <Shield className="w-8 h-8 text-gray-400" />
            <div className="absolute inset-0 rounded-full border border-gray-600/30" />
          </div>
          <h2 className="font-orbitron text-2xl font-bold text-white mb-2 tracking-wide">
            Secure Access Portal
          </h2>
          <p className="font-rajdhani text-sm text-cyan-dim tracking-wider">
            Real-time AI Safety Monitoring Platform
          </p>
        </div>

        {/* Error Display */}
        {displayError && (
             <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm p-4 rounded-xl mb-6 flex items-start gap-3"
             style={{ animation: 'slideIn 0.3s ease-out' }}>
                 <span className="material-icons text-lg mt-0.5">error</span>
                 <span>{displayError}</span>
             </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div className="relative">
            <label className="block font-rajdhani text-sm text-cyan-dim mb-2 tracking-wide">
              EMAIL ADDRESS
            </label>
            <div className="relative">
              <Mail 
                className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                  isEmailFocused ? 'text-cyan' : 'text-cyan-dim'
                }`}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setIsEmailFocused(true)}
                onBlur={() => setIsEmailFocused(false)}
                placeholder="admin@safeguard.ai"
                className="w-full bg-navy/50 border border-cyan-faint rounded-lg py-3 pl-12 pr-4 text-black placeholder-cyan-dim/50 font-rajdhani transition-all duration-300 input-glow focus:outline-none focus:border-cyan"
              />
              {/* Focus indicator line */}
              <div 
                className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-cyan to-electric transition-all duration-300 ${
                  isEmailFocused ? 'w-full' : 'w-0'
                }`}
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="relative">
            <label className="block font-rajdhani text-sm text-cyan-dim mb-2 tracking-wide">
              PASSWORD
            </label>
            <div className="relative">
              <Lock 
                className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                  isPasswordInputFocused ? 'text-cyan' : 'text-cyan-dim'
                }`}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={handlePasswordInput}
                onFocus={() => {
                  setIsPasswordInputFocused(true);
                  onPasswordFocus();
                }}
                onBlur={() => {
                  setIsPasswordInputFocused(false);
                  onPasswordBlur();
                }}
                placeholder="••••••••••••"
                className="w-full bg-navy/50 border border-cyan-faint rounded-lg py-3 pl-12 pr-12 text-black placeholder-cyan-dim/50 font-rajdhani transition-all duration-300 input-glow focus:outline-none focus:border-cyan"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-cyan-dim hover:text-cyan transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
              {/* Focus indicator line */}
              <div 
                className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-cyan to-electric transition-all duration-300 ${
                  isPasswordInputFocused ? 'w-full' : 'w-0'
                }`}
              />
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded border-cyan-faint bg-navy/50 text-cyan focus:ring-cyan" />
              <span className="font-rajdhani text-sm text-cyan-dim">Remember me</span>
            </label>
            <button type="button" className="font-rajdhani text-sm text-cyan hover:text-cyan-dim transition-colors">
              Forgot password?
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || loading}
            className="btn-cyber w-full bg-gradient-to-r from-cyan to-electric text-navy font-orbitron font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-glow-cyan-strong disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting || loading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-navy border-t-transparent rounded-full animate-spin" />
                <span>AUTHENTICATING...</span>
              </div>
            ) : (
              <>
                <span>ENTER CONTROL CENTER</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>

          {/* OR Divider */}
          <div className="relative flex items-center justify-center py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-cyan-faint"></div>
            </div>
            <div className="relative bg-[#0f172a] px-4 font-rajdhani text-xs text-cyan-dim uppercase tracking-wider">
              Or establish link via
            </div>
          </div>

          {/* Google Login Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isSubmitting || loading}
            className="w-full bg-navy/50 border border-cyan-faint hover:bg-cyan/10 hover:border-cyan text-white font-rajdhani font-bold py-3 rounded-lg flex items-center justify-center gap-3 transition-all duration-300 input-glow cursor-pointer disabled:opacity-50 group"
          >
            <div className="bg-white p-1 rounded-full">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            </div>
            <span className="tracking-wide group-hover:text-cyan transition-colors">ACCESS WITH GOOGLE</span>
          </button>
        </form>

        {/* Security Badge */}
        <div className="mt-6 pt-6 border-t border-cyan-faint">
          <div className="flex items-center justify-center gap-4 text-cyan-dim">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-cyan animate-pulse" />
              <span className="font-rajdhani text-xs">256-BIT ENCRYPTION</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-cyan animate-pulse" style={{ animationDelay: '0.5s' }} />
              <span className="font-rajdhani text-xs">SECURE CONNECTION</span>
            </div>
          </div>
        </div>

        {/* Decorative data streams */}
        <div className="absolute top-1/4 -left-20 w-20 h-px bg-gradient-to-r from-transparent via-cyan to-transparent opacity-30" />
        <div className="absolute top-1/3 -right-20 w-20 h-px bg-gradient-to-r from-transparent via-cyan to-transparent opacity-30" />
        <div className="absolute bottom-1/4 -left-16 w-16 h-px bg-gradient-to-r from-transparent via-cyan to-transparent opacity-20" />
      </div>
    </div>
  );
}
