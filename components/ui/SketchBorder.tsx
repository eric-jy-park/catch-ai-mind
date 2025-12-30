'use client';

import { ReactNode, useMemo } from 'react';

interface SketchBorderProps {
  children: ReactNode;
  color?: string;
  strokeWidth?: number;
  className?: string;
  style?: React.CSSProperties;
  roughness?: number;
  borderRadius?: number;
}

/**
 * Creates a truly hand-drawn pencil sketch border.
 * Uses multiple overlapping paths, variable widths, and jagged line segments
 * to simulate authentic pencil strokes.
 */
export function SketchBorder({
  children,
  color = '#2B2B2B',
  strokeWidth = 2,
  className = '',
  style = {},
  roughness = 1,
  borderRadius = 0,
}: SketchBorderProps) {
  const sketchPaths = useMemo(() => {
    const generateSketchyLine = (
      x1: number, 
      y1: number, 
      x2: number, 
      y2: number,
      displacement: number
    ) => {
      const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
      const segments = Math.max(3, Math.floor(length / 10));
      
      const startOvershootX = x1 - (x2 - x1) * 0.05 * (Math.random() + 0.5);
      const startOvershootY = y1 - (y2 - y1) * 0.05 * (Math.random() + 0.5);
      let path = `M ${startOvershootX},${startOvershootY}`;
      
      for (let i = 1; i <= segments; i++) {
        const t = i / segments;
        const targetX = x1 + (x2 - x1) * t;
        const targetY = y1 + (y2 - y1) * t;
        
        const noiseX = (Math.random() - 0.5) * displacement;
        const noiseY = (Math.random() - 0.5) * displacement;
        
        path += ` L ${targetX + noiseX},${targetY + noiseY}`;
      }
      
      const endOvershootX = x2 + (x2 - x1) * 0.02 * (Math.random() + 0.5);
      const endOvershootY = y2 + (y2 - y1) * 0.02 * (Math.random() + 0.5);
      path += ` L ${endOvershootX},${endOvershootY}`;
      
      return path;
    };

    const generateSketchyArc = (
      cx: number,
      cy: number,
      r: number,
      startAngle: number,
      endAngle: number,
      displacement: number
    ) => {
      const steps = 4;
      const angleStep = (endAngle - startAngle) / steps;
      let d = '';
      
      for (let i = 0; i <= steps; i++) {
        const angle = startAngle + i * angleStep;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        
        const noiseX = (Math.random() - 0.5) * displacement;
        const noiseY = (Math.random() - 0.5) * displacement;
        
        if (i === 0) {
          d += `M ${x + noiseX},${y + noiseY}`;
        } else {
          d += ` L ${x + noiseX},${y + noiseY}`;
        }
      }
      return d;
    };

    const passes = [];
    const numPasses = 3;
    
    const r = borderRadius > 0 ? borderRadius / 4 : 0;

    const p = 2;
    const width = 100 - 2 * p;
    const height = 100 - 2 * p;
    
    for (let i = 0; i < numPasses; i++) {
      const rough = roughness * (0.5 + Math.random() * 0.5);
      const offX = (Math.random() - 0.5) * 0.5;
      const offY = (Math.random() - 0.5) * 0.5;
      
      const x = p + offX;
      const y = p + offY;
      const w = width;
      const h = height;

      let pathData = '';

      if (r > 0) {
         pathData += generateSketchyLine(x + r, y, x + w - r, y, rough).replace('M', 'L');
         pathData += generateSketchyArc(x + w - r, y + r, r, -Math.PI/2, 0, rough).replace('M', 'L');
         pathData += generateSketchyLine(x + w, y + r, x + w, y + h - r, rough).replace('M', 'L');
         pathData += generateSketchyArc(x + w - r, y + h - r, r, 0, Math.PI/2, rough).replace('M', 'L');
         pathData += generateSketchyLine(x + w - r, y + h, x + r, y + h, rough).replace('M', 'L');
         pathData += generateSketchyArc(x + r, y + h - r, r, Math.PI/2, Math.PI, rough).replace('M', 'L');
         pathData += generateSketchyLine(x, y + h - r, x, y + r, rough).replace('M', 'L');
         pathData += generateSketchyArc(x + r, y + r, r, Math.PI, Math.PI * 1.5, rough).replace('M', 'L');
         
         pathData = 'M' + pathData.substring(1);
      } else {
         const top = generateSketchyLine(x, y, x + w, y, rough);
         const right = generateSketchyLine(x + w, y, x + w, y + h, rough);
         const bottom = generateSketchyLine(x + w, y + h, x, y + h, rough);
         const left = generateSketchyLine(x, y + h, x, y, rough);
         pathData = `${top} ${right} ${bottom} ${left}`;
      }

      passes.push(pathData);
    }
    
    return passes;
  }, [roughness, borderRadius]);

  return (
    <div className={`relative ${className}`} style={style}>
      <svg
        className="absolute inset-0 pointer-events-none"
        style={{
          width: '100%',
          height: '100%',
          overflow: 'visible',
        }}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {sketchPaths.map((d, i) => (
          <path
            key={i}
            d={d}
            stroke={color}
            strokeWidth={strokeWidth * (0.8 + Math.random() * 0.4)}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.6 + (Math.random() * 0.2)}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
