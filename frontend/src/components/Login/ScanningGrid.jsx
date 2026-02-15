import { useEffect, useRef } from 'react';

export function ScanningGrid() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId;
    let offset = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    let lastTime = 0;
    const fps = 30;
    const interval = 1000 / fps;

    const draw = (timestamp) => {
      animationId = requestAnimationFrame(draw);
      
      const elapsed = timestamp - lastTime;
      if (elapsed < interval) return;

      lastTime = timestamp - (elapsed % interval);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const gridSize = 60;
      const lineOpacity = 0.08;
      
      // Draw vertical lines
      for (let x = offset % gridSize; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.strokeStyle = `rgba(0, 234, 255, ${lineOpacity})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      
      // Draw horizontal lines
      for (let y = offset % gridSize; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.strokeStyle = `rgba(0, 234, 255, ${lineOpacity})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Draw intersection points
      for (let x = offset % gridSize; x < canvas.width; x += gridSize) {
        for (let y = offset % gridSize; y < canvas.height; y += gridSize) {
          ctx.beginPath();
          ctx.arc(x, y, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0, 234, 255, ${lineOpacity * 1.5})`;
          ctx.fill();
        }
      }

      offset += 0.3;
    };

    resize();
    window.addEventListener('resize', resize);
    requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };

  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-[2] pointer-events-none"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
