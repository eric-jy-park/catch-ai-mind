'use client';

interface PaperTextureProps {
  className?: string;
}

/**
 * Creates an authentic sketchbook/notebook paper texture background
 * Mimics a real paper notebook with lines, margins, and textures
 */
export function PaperTexture({ className = '' }: PaperTextureProps) {
  return (
    <>
      {/* Base paper color with subtle gradient */}
      <div
        className={`fixed inset-0 ${className}`}
        style={{
          background: 'linear-gradient(to bottom right, #FFFCF2 0%, #FFF9E6 30%, #FFFBF0 70%, #FFF8E1 100%)',
          zIndex: -20,
        }}
      />

      {/* Notebook ruled lines - More prominent */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.12]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            transparent,
            transparent 31px,
            rgba(91, 143, 249, 0.4) 31px,
            rgba(91, 143, 249, 0.4) 32px
          )`,
          zIndex: -18,
        }}
      />

      {/* Red margin line (left side like real notebooks) */}
      <div
        className="fixed left-0 top-0 bottom-0 w-[80px] pointer-events-none"
        style={{
          zIndex: -17,
        }}
      >
        {/* Double red lines for margin */}
        <div
          className="absolute left-[70px] top-0 bottom-0 w-[2px] opacity-30"
          style={{
            background: 'linear-gradient(to bottom, transparent 0%, #FF6B6B 5%, #FF6B6B 95%, transparent 100%)',
          }}
        />
        <div
          className="absolute left-[74px] top-0 bottom-0 w-[1.5px] opacity-20"
          style={{
            background: 'linear-gradient(to bottom, transparent 0%, #FF6B6B 5%, #FF6B6B 95%, transparent 100%)',
          }}
        />
      </div>

      {/* Spiral binding holes */}
      <div className="fixed left-[20px] top-0 bottom-0 pointer-events-none flex flex-col justify-start pt-16 gap-8" style={{ zIndex: -16 }}>
        {[...Array(15)].map((_, i) => (
          <div key={i} className="relative">
            {/* Hole shadow */}
            <div
              className="w-6 h-6 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.05) 50%, transparent 70%)',
              }}
            />
            {/* Hole center */}
            <div
              className="absolute inset-0 m-auto w-4 h-4 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.05) 60%, transparent 80%)',
                border: '1px solid rgba(0,0,0,0.08)',
              }}
            />
          </div>
        ))}
      </div>

      {/* Paper grain texture - More visible */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='3' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          zIndex: -19,
        }}
      />

      {/* Subtle paper fiber texture */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: `
            repeating-linear-gradient(90deg, transparent 0, transparent 2px, rgba(0,0,0,0.01) 2px, rgba(0,0,0,0.01) 3px),
            repeating-linear-gradient(0deg, transparent 0, transparent 2px, rgba(0,0,0,0.01) 2px, rgba(0,0,0,0.01) 3px)
          `,
          zIndex: -19,
        }}
      />

      {/* Subtle coffee stain/age spots for character */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: -18 }}>
        {/* Coffee ring stain - top right */}
        <div
          className="absolute top-32 right-64 w-32 h-32 rounded-full opacity-[0.03]"
          style={{
            background: 'radial-gradient(circle, rgba(139, 89, 46, 0.2) 0%, rgba(139, 89, 46, 0.1) 40%, transparent 70%)',
          }}
        />

        {/* Small coffee drip stain */}
        <div
          className="absolute top-96 right-48 w-12 h-20 rounded-full opacity-[0.02]"
          style={{
            background: 'radial-gradient(ellipse, rgba(139, 89, 46, 0.15) 0%, transparent 70%)',
            transform: 'rotate(-15deg)',
          }}
        />

        {/* Bottom left age spot */}
        <div
          className="absolute bottom-48 left-72 w-24 h-24 rounded-full opacity-[0.025]"
          style={{
            background: 'radial-gradient(circle, rgba(139, 89, 46, 0.15) 0%, rgba(139, 89, 46, 0.08) 50%, transparent 80%)',
          }}
        />
      </div>

      {/* Subtle vignette effect for depth */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, transparent 60%, rgba(0,0,0,0.02) 100%)',
          zIndex: -17,
        }}
      />

      {/* Torn edge effect on top */}
      <div
        className="fixed top-0 left-0 right-0 h-3 pointer-events-none opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 12'%3E%3Cpath d='M0,8 Q10,2 20,6 T40,8 T60,5 T80,7 T100,4 T120,8 T140,6 T160,5 T180,7 T200,8 T220,5 T240,6 T260,8 T280,4 T300,7 T320,5 T340,8 T360,6 T380,7 T400,5 T420,8 T440,6 T460,7 T480,5 T500,8 T520,6 T540,7 T560,5 T580,8 T600,6 T620,5 T640,7 T660,8 T680,5 T700,6 T720,8 T740,4 T760,7 T780,5 T800,8 T820,6 T840,7 T860,5 T880,8 T900,6 T920,7 T940,5 T960,8 T980,6 T1000,7 T1020,5 T1040,8 T1060,6 T1080,7 T1100,5 T1120,8 T1140,6 T1160,7 T1180,5 T1200,8 L1200,12 L0,12 Z' fill='%23828282'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat-x',
          backgroundSize: 'auto 100%',
          zIndex: -16,
        }}
      />
    </>
  );
}
