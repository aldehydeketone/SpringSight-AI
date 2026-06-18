import React, { useRef, useEffect } from 'react';

interface Pulse {
  x: number;
  y: number;
  dx: number;
  dy: number;
  horizontal: boolean;
  life: number;
  maxLife: number;
}

interface Cluster {
  x: number;
  y: number;
  radius: number;
  phase: number;
  speed: number;
}

export const ObservabilityBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let w = 0;
    let h = 0;

    // Grid constants
    const DOT_SPACING = 28;
    const LINE_SPACING = 112;

    // Data flow pulses (max 16)
    const pulses: Pulse[] = [];
    const MAX_PULSES = 16;

    // Activity clusters (4-6)
    const clusters: Cluster[] = [];

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Regenerate clusters on resize
      clusters.length = 0;
      const clusterCount = 4 + Math.floor(Math.random() * 3); // 4–6
      for (let i = 0; i < clusterCount; i++) {
        clusters.push({
          x: Math.random() * w,
          y: Math.random() * h,
          radius: 140 + Math.random() * 200,
          phase: Math.random() * Math.PI * 2,
          speed: 0.2 + Math.random() * 0.3,
        });
      }
    };

    resize();
    window.addEventListener('resize', resize);

    // Spawn a pulse along a grid line
    const spawnPulse = () => {
      if (pulses.length >= MAX_PULSES) return;

      const horizontal = Math.random() > 0.5;
      const speed = 0.25 + Math.random() * 0.35;

      if (horizontal) {
        // Pick a horizontal grid line
        const lineIndex = Math.floor(Math.random() * (h / LINE_SPACING));
        const y = lineIndex * LINE_SPACING;
        const goRight = Math.random() > 0.5;
        pulses.push({
          x: goRight ? -10 : w + 10,
          y,
          dx: goRight ? speed : -speed,
          dy: 0,
          horizontal: true,
          life: 0,
          maxLife: (w + 20) / speed,
        });
      } else {
        // Pick a vertical grid line
        const lineIndex = Math.floor(Math.random() * (w / LINE_SPACING));
        const x = lineIndex * LINE_SPACING;
        const goDown = Math.random() > 0.5;
        pulses.push({
          x,
          y: goDown ? -10 : h + 10,
          dx: 0,
          dy: goDown ? speed : -speed,
          horizontal: false,
          life: 0,
          maxLife: (h + 20) / speed,
        });
      }
    };

    // Stagger initial pulse spawning
    let lastSpawnTime = 0;
    const SPAWN_INTERVAL = 1200; // ms between spawn attempts

    const draw = (timestamp: number) => {
      ctx.clearRect(0, 0, w, h);

      // === 1. Dot Matrix Grid ===
      ctx.fillStyle = 'rgba(34, 211, 238, 0.08)';
      for (let x = 0; x < w; x += DOT_SPACING) {
        for (let y = 0; y < h; y += DOT_SPACING) {
          ctx.beginPath();
          ctx.arc(x, y, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // === 2. Telemetry Grid Lines ===
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.04)';
      ctx.lineWidth = 0.75;

      // Horizontal lines
      for (let y = 0; y < h; y += LINE_SPACING) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
      // Vertical lines
      for (let x = 0; x < w; x += LINE_SPACING) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      // === 3. Network Nodes (at grid intersections) ===
      ctx.fillStyle = 'rgba(34, 211, 238, 0.15)';
      for (let x = 0; x < w; x += LINE_SPACING) {
        for (let y = 0; y < h; y += LINE_SPACING) {
          ctx.beginPath();
          ctx.arc(x, y, 2.0, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // === 4. Activity Clusters (slow breathing) ===
      const timeS = timestamp / 1000;
      for (const cluster of clusters) {
        const breathe = Math.sin(timeS * cluster.speed + cluster.phase);
        const opacity = 0.035 + breathe * 0.025; // range ~0.010 to 0.060
        const gradient = ctx.createRadialGradient(
          cluster.x, cluster.y, 0,
          cluster.x, cluster.y, cluster.radius
        );
        gradient.addColorStop(0, `rgba(34, 211, 238, ${Math.max(0, opacity).toFixed(4)})`);
        gradient.addColorStop(1, 'rgba(34, 211, 238, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(cluster.x, cluster.y, cluster.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // === 5. Data Flow Pulses ===
      // Spawn new pulses at intervals
      if (timestamp - lastSpawnTime > SPAWN_INTERVAL) {
        spawnPulse();
        lastSpawnTime = timestamp;
      }

      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        p.x += p.dx;
        p.y += p.dy;
        p.life++;

        // Remove if off-screen or exceeded life
        if (p.x < -20 || p.x > w + 20 || p.y < -20 || p.y > h + 20 || p.life > p.maxLife) {
          pulses.splice(i, 1);
          continue;
        }

        // Draw the pulse dot
        const pulseGradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 5);
        pulseGradient.addColorStop(0, 'rgba(34, 211, 238, 0.50)');
        pulseGradient.addColorStop(1, 'rgba(34, 211, 238, 0)');
        ctx.fillStyle = pulseGradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
        ctx.fill();

        // Small solid center
        ctx.fillStyle = 'rgba(34, 211, 238, 0.35)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0"
      style={{ background: '#020817' }}
    />
  );
};

export default ObservabilityBackground;
