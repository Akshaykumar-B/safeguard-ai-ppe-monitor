import { useEffect, useState } from 'react';

export function LightBeam() {
  const [beams, setBeams] = useState([]);

  useEffect(() => {
    // Generate beams with staggered delays
    const newBeams = [
      { id: 1, delay: 0, duration: 8 },
      { id: 2, delay: 4, duration: 10 },
      { id: 3, delay: 7, duration: 7 },
    ];
    setBeams(newBeams);
  }, []);

  return (
    <div className="absolute inset-0 z-[4] pointer-events-none overflow-hidden">
      {beams.map((beam) => (
        <div
          key={beam.id}
          className="absolute"
          style={{
            top: `${20 + beam.id * 25}%`,
            left: 0,
            width: '150%',
            height: '2px',
            animation: `beam-sweep ${beam.duration}s ease-in-out ${beam.delay}s infinite`,
          }}
        >
          {/* Main beam */}
          <div 
            className="h-full w-full"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(0, 234, 255, 0.3) 30%, rgba(0, 234, 255, 0.6) 50%, rgba(0, 234, 255, 0.3) 70%, transparent 100%)',
              boxShadow: '0 0 20px rgba(0, 234, 255, 0.4), 0 0 40px rgba(0, 234, 255, 0.2)',
            }}
          />
          
          {/* Secondary glow */}
          <div 
            className="absolute -top-2 left-0 h-5 w-full"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(0, 234, 255, 0.1) 30%, rgba(0, 234, 255, 0.2) 50%, rgba(0, 234, 255, 0.1) 70%, transparent 100%)',
              filter: 'blur(4px)',
            }}
          />
        </div>
      ))}
      
      {/* Vertical scan line that moves across */}
      <div 
        className="absolute top-0 h-full w-px"
        style={{
          left: 0,
          background: 'linear-gradient(180deg, transparent 0%, rgba(0, 234, 255, 0.2) 20%, rgba(0, 234, 255, 0.2) 80%, transparent 100%)',
          animation: 'beam-sweep 12s ease-in-out infinite',
          boxShadow: '0 0 15px rgba(0, 234, 255, 0.3)',
        }}
      />
    </div>
  );
}
