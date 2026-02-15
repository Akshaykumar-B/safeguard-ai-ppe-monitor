import { useEffect, useRef, useState } from 'react';

export function AIMascot({ mousePosition, isPasswordFocused, isTyping }) {
  const orbRef = useRef(null);
  const [eyePosition, setEyePosition] = useState({ x: 0, y: 0 });
  const [orbRotation, setOrbRotation] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);

  // Calculate eye position based on mouse
  useEffect(() => {
    if (orbRef.current) {
      const rect = orbRef.current.getBoundingClientRect();
      const orbCenterX = rect.left + rect.width / 2;
      const orbCenterY = rect.top + rect.height / 2;
      
      // Calculate angle and distance
      const deltaX = mousePosition.x - orbCenterX;
      const deltaY = mousePosition.y - orbCenterY;
      const angle = Math.atan2(deltaY, deltaX);
      const distance = Math.min(Math.sqrt(deltaX * deltaX + deltaY * deltaY), 100);
      
      // Limit eye movement
      const maxEyeMove = 8;
      const eyeMoveX = Math.cos(angle) * (distance / 100) * maxEyeMove;
      const eyeMoveY = Math.sin(angle) * (distance / 100) * maxEyeMove;
      
      setEyePosition({ x: eyeMoveX, y: eyeMoveY });
      
      // Subtle orb rotation
      const rotX = (deltaY / window.innerHeight) * 15;
      const rotY = (deltaX / window.innerWidth) * -15;
      setOrbRotation({ x: rotX, y: rotY });
    }
  }, [mousePosition]);

  // Blink animation
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, 4000 + Math.random() * 2000);
    
    return () => clearInterval(blinkInterval);
  }, []);

  // Calculate rotation away from password field
  const getPasswordRotation = () => {
    if (!isPasswordFocused) return { x: 0, y: 0 };
    // Rotate slightly away (to the right and up)
    return { x: -10, y: 15 };
  };

  const passwordRot = getPasswordRotation();
  const finalRotation = {
    x: orbRotation.x + passwordRot.x,
    y: orbRotation.y + passwordRot.y,
  };

  return (
    <div 
      ref={orbRef}
      className="relative w-48 h-48 orb-float"
      style={{
        transform: `perspective(500px) rotateX(${finalRotation.x}deg) rotateY(${finalRotation.y}deg)`,
        transition: isPasswordFocused ? 'transform 0.5s ease-out' : 'transform 0.1s ease-out',
      }}
    >
      {/* Animated Ripple Effect - REMOVED THICK CIRCLES */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
         {/* Very subtle glow pulse - Neutral Gray */}
         <div 
          className="absolute w-3/4 h-3/4 rounded-full bg-gray-400/5 blur-xl"
          style={{ 
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          }}
        />
      </div>

      {/* Main Orb Body - Plain & Glassy */}
      <div className="relative w-full h-full rounded-full backdrop-blur-[1px] overflow-hidden">
        
        {/* Subtle Gradient - Neutral */}
        <div 
          className="absolute inset-0 rounded-full bg-gradient-to-tr from-gray-500/5 to-transparent opacity-50"
        />
        
        {/* Core Glow - Soft & diffuse Gray */}
        <div 
          className="absolute inset-[25%] rounded-full bg-gray-400/10 blur-2xl"
        />

        {/* Minimal Tech Overlay - Just 4 tiny ticks - Gray */}
        <div className="absolute inset-0 animate-spin-slow" style={{ animationDuration: '10s' }}>
          <div className="absolute top-2 left-1/2 w-0.5 h-1 bg-gray-500/20 -translate-x-1/2" />
          <div className="absolute bottom-2 left-1/2 w-0.5 h-1 bg-gray-500/20 -translate-x-1/2" />
          <div className="absolute left-2 top-1/2 w-1 h-0.5 bg-gray-500/20 -translate-y-1/2" />
          <div className="absolute right-2 top-1/2 w-1 h-0.5 bg-gray-500/20 -translate-y-1/2" />
        </div>

        {/* Eyes Container */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative flex gap-8">
            {/* Left Eye - Sleek Metallic */}
            <div 
              className="relative w-8 h-2"
              style={{
                transform: `translate(${eyePosition.x}px, ${eyePosition.y}px) rotate(10deg)`,
                transition: 'transform 0.1s ease-out',
                background: isBlinking ? 'transparent' : '#d1d5db',
                boxShadow: '0 0 8px rgba(209, 213, 219, 0.6)',
                borderRadius: '1px',
                height: isBlinking ? '1px' : '6px',
              }}
            />

            {/* Right Eye - Sleek Metallic */}
            <div 
              className="relative w-8 h-2"
              style={{
                transform: `translate(${eyePosition.x}px, ${eyePosition.y}px) rotate(-10deg)`,
                transition: 'transform 0.1s ease-out',
                background: isBlinking ? 'transparent' : '#d1d5db',
                boxShadow: '0 0 8px rgba(209, 213, 219, 0.6)',
                borderRadius: '1px',
                height: isBlinking ? '1px' : '6px',
              }}
            />
          </div>
        </div>

        {/* Typing indicator - Clean lines Gray */}
        {isTyping && (
          <div className="absolute inset-x-8 bottom-12 flex justify-center gap-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-1 h-3 bg-gray-400"
                style={{
                  animation: `pulse-glow 0.6s ease-in-out infinite ${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Scanning line - Fast thin line Gray */}
        <div 
          className="absolute left-0 w-full h-[1px] bg-gray-400/50"
          style={{
            animation: 'scanline 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite',
            boxShadow: '0 0 4px #9ca3af',
          }}
        />
      </div>

      {/* Status Indicator - Minimal text */}
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-center w-full">
        <div className="flex items-center justify-center gap-2">
          <div 
            className={`w-1.5 h-1.5 rounded-full ${isPasswordFocused ? 'bg-amber-400' : 'bg-emerald-400'}`}
          />
          <span className="font-rajdhani text-[10px] text-gray-400 tracking-[0.2em] uppercase">
            {isPasswordFocused ? 'SECURE_MODE' : 'MONITORING'}
          </span>
        </div>
      </div>

      {/* Decorative elements - Thin accents Gray */}
      <div className="absolute -top-4 -right-4 w-8 h-8 border-t border-r border-gray-500/30 rounded-tr-xl" />
      <div className="absolute -bottom-6 -left-6 w-12 h-12 border-b border-l border-gray-500/20 rounded-bl-xl" />
    </div>
  );
}
