import { useEffect, useState, useRef } from 'react';

export function DetectionBoxes() {
  const [boxes, setBoxes] = useState([]);
  const containerRef = useRef(null);

  useEffect(() => {
    // Generate random detection boxes
    const generateBoxes = () => {
      const newBoxes = [];
      const boxCount = 8;
      
      for (let i = 0; i < boxCount; i++) {
        newBoxes.push({
          id: i,
          x: Math.random() * 80 + 10, // 10% to 90% of screen width
          y: Math.random() * 70 + 15, // 15% to 85% of screen height
          width: Math.random() * 80 + 40, // 40px to 120px
          height: Math.random() * 60 + 30, // 30px to 90px
          delay: Math.random() * 4,
          duration: Math.random() * 2 + 3,
        });
      }
      setBoxes(newBoxes);
    };

    generateBoxes();
    
    // Regenerate boxes periodically
    const interval = setInterval(generateBoxes, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 z-[3] pointer-events-none overflow-hidden">
      {boxes.map((box) => (
        <div
          key={box.id}
          className="absolute"
          style={{
            left: `${box.x}%`,
            top: `${box.y}%`,
            width: `${box.width}px`,
            height: `${box.height}px`,
            animation: `detectionBox ${box.duration}s ease-in-out ${box.delay}s infinite`,
          }}
        >
          {/* Detection box corners */}
          <svg 
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {/* Top left corner */}
            <path
              d="M 0 15 L 0 0 L 15 0"
              fill="none"
              stroke="rgba(0, 234, 255, 0.4)"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
            {/* Top right corner */}
            <path
              d="M 85 0 L 100 0 L 100 15"
              fill="none"
              stroke="rgba(0, 234, 255, 0.4)"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
            {/* Bottom left corner */}
            <path
              d="M 0 85 L 0 100 L 15 100"
              fill="none"
              stroke="rgba(0, 234, 255, 0.4)"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
            {/* Bottom right corner */}
            <path
              d="M 85 100 L 100 100 L 100 85"
              fill="none"
              stroke="rgba(0, 234, 255, 0.4)"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          
          {/* Inner box */}
          <div 
            className="absolute inset-2 border border-cyan-faint"
            style={{ opacity: 0.1 }}
          />
          
          {/* Target crosshair in center */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="relative h-4 w-4">
              <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-cyan" style={{ opacity: 0.3 }} />
              <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-cyan" style={{ opacity: 0.3 }} />
            </div>
          </div>
          
          {/* Detection label */}
          <div 
            className="absolute -top-5 left-0 font-rajdhani text-[10px] tracking-wider text-cyan"
            style={{ opacity: 0.5 }}
          >
            OBJ-{String(box.id + 1).padStart(3, '0')}
          </div>
        </div>
      ))}
    </div>
  );
}
