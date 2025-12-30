'use client';

import { ReactNode } from 'react';

interface RoughBorderProps {
  children: ReactNode;
  color?: string;
  strokeWidth?: number;
  roughness?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Creates a hand-drawn, sketchy border around children using SVG paths
 * Inspired by Excalidraw's rough notation style
 */
export function RoughBorder({
  children,
  color = '#2B2B2B',
  strokeWidth = 3,
  roughness = 1,
  className = '',
  style = {},
}: RoughBorderProps) {
  // Generate rough path data with wobbles and imperfections
  const generateRoughPath = (width: number, height: number) => {
    const padding = strokeWidth * 2;
    const w = width - padding;
    const h = height - padding;
    const offset = padding / 2;

    // Helper function to add randomness
    const wobble = (value: number) => {
      return value + (Math.random() - 0.5) * roughness * 2;
    };

    // Generate multiple slightly offset strokes for crayon effect
    const strokes: string[] = [];
    const numStrokes = 2; // Multiple strokes for crayon texture

    for (let i = 0; i < numStrokes; i++) {
      const variance = i * 0.5;

      // Top line
      const topPath = `M ${wobble(offset + variance)} ${wobble(offset + variance)}
        L ${wobble(offset + w / 3)} ${wobble(offset + variance)}
        L ${wobble(offset + (w * 2) / 3)} ${wobble(offset + variance)}
        L ${wobble(offset + w - variance)} ${wobble(offset + variance)}`;

      // Right line
      const rightPath = `M ${wobble(offset + w - variance)} ${wobble(offset + variance)}
        L ${wobble(offset + w - variance)} ${wobble(offset + h / 3)}
        L ${wobble(offset + w - variance)} ${wobble(offset + (h * 2) / 3)}
        L ${wobble(offset + w - variance)} ${wobble(offset + h - variance)}`;

      // Bottom line
      const bottomPath = `M ${wobble(offset + w - variance)} ${wobble(offset + h - variance)}
        L ${wobble(offset + (w * 2) / 3)} ${wobble(offset + h - variance)}
        L ${wobble(offset + w / 3)} ${wobble(offset + h - variance)}
        L ${wobble(offset + variance)} ${wobble(offset + h - variance)}`;

      // Left line
      const leftPath = `M ${wobble(offset + variance)} ${wobble(offset + h - variance)}
        L ${wobble(offset + variance)} ${wobble(offset + (h * 2) / 3)}
        L ${wobble(offset + variance)} ${wobble(offset + h / 3)}
        L ${wobble(offset + variance)} ${wobble(offset + variance)}`;

      strokes.push(topPath, rightPath, bottomPath, leftPath);
    }

    return strokes;
  };

  return (
    <div className={`relative ${className}`} style={style}>
      {/* SVG overlay for rough borders */}
      <svg
        className="absolute inset-0 pointer-events-none"
        style={{
          width: '100%',
          height: '100%',
          overflow: 'visible',
        }}
      >
        <g>
          {generateRoughPath(400, 300).map((path, i) => (
            <path
              key={i}
              d={path}
              stroke={color}
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.7 - i * 0.1}
            />
          ))}
        </g>
      </svg>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

/**
 * Simpler version with rounded corners for cards
 */
export function RoughCard({
  children,
  color = '#2B2B2B',
  strokeWidth = 4,
  className = '',
  style = {},
  selected = false,
}: RoughBorderProps & { selected?: boolean }) {
  return (
    <div className={`relative ${className}`} style={style}>
      {/* Rough border SVG */}
      <svg
        className="absolute inset-0 pointer-events-none"
        style={{
          width: 'calc(100% + 8px)',
          height: 'calc(100% + 8px)',
          left: '-4px',
          top: '-4px',
          overflow: 'visible',
        }}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {/* Multiple strokes for crayon effect */}
        {[0, 1, 2].map((strokeNum) => (
          <g key={strokeNum} opacity={selected ? 0.9 - strokeNum * 0.15 : 0.6 - strokeNum * 0.1}>
            <path
              d={`M ${5 + strokeNum * 0.3} ${10 + Math.sin(strokeNum) * 2}
                 C ${8 + Math.cos(strokeNum * 2) * 1.5} ${5 + strokeNum * 0.4}
                   ${15 + Math.sin(strokeNum * 3) * 1.2} ${3 + strokeNum * 0.3}
                   ${25 + Math.cos(strokeNum) * 1} ${3 + strokeNum * 0.2}
                 L ${75 - Math.sin(strokeNum * 2) * 1} ${3 + strokeNum * 0.3}
                 C ${85 + Math.cos(strokeNum) * 1.2} ${3 + strokeNum * 0.4}
                   ${92 + Math.sin(strokeNum * 3) * 1} ${5 + strokeNum * 0.3}
                   ${95 - strokeNum * 0.3} ${10 + Math.cos(strokeNum * 2) * 2}
                 L ${95 - strokeNum * 0.3} ${90 - Math.sin(strokeNum) * 2}
                 C ${92 + Math.cos(strokeNum * 2) * 1} ${95 - strokeNum * 0.3}
                   ${85 + Math.sin(strokeNum) * 1.2} ${97 - strokeNum * 0.4}
                   ${75 + Math.cos(strokeNum * 3) * 1} ${97 - strokeNum * 0.2}
                 L ${25 - Math.sin(strokeNum * 2) * 1} ${97 - strokeNum * 0.3}
                 C ${15 + Math.cos(strokeNum) * 1.2} ${97 - strokeNum * 0.4}
                   ${8 + Math.sin(strokeNum * 3) * 1} ${95 - strokeNum * 0.3}
                   ${5 + strokeNum * 0.3} ${90 - Math.cos(strokeNum * 2) * 2}
                 Z`}
              stroke={color}
              strokeWidth={selected ? strokeWidth * 1.2 : strokeWidth}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        ))}
      </svg>

      {/* Content with padding */}
      <div className="relative z-10 p-6">
        {children}
      </div>
    </div>
  );
}
