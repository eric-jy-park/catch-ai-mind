'use client';

import { ReactNode } from 'react';
import { PaperTexture } from '../ui/PaperTexture';
import { AdBanner } from '../ui/AdBanner';
import { SketchBorder } from '@/components/ui/SketchBorder';

interface GameLayoutProps {
  header: ReactNode;
  canvas: ReactNode;
  guessInput: ReactNode;
  targetWord?: ReactNode;
}

export function GameLayout({ header, canvas, guessInput, targetWord }: GameLayoutProps) {
  return (
    <div className="min-h-screen relative p-6 overflow-x-hidden">
      <PaperTexture />

      <div className="relative z-10 flex justify-center gap-6">
        <div className="hidden min-[1400px]:block sticky top-6 h-fit shrink-0">
          <AdBanner variant="vertical" />
        </div>

        <div className="max-w-[1200px] w-full space-y-6">
          {header}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 aspect-[4/3] relative">
              {canvas}
            </div>

            <div className="space-y-6">
              {targetWord && (
                <SketchBorder
                  color="#2B2B2B"
                  strokeWidth={1}
                  borderRadius={24}
                  className="bg-white rounded-3xl"
                  style={{ boxShadow: '6px 6px 0 rgba(0,0,0,0.08)' }}
                >
                  <div className="p-6 relative z-10">{targetWord}</div>
                </SketchBorder>
              )}

              <SketchBorder
                color="#2B2B2B"
                strokeWidth={1}
                borderRadius={24}
                className="bg-white rounded-3xl"
                style={{ boxShadow: '6px 6px 0 rgba(0,0,0,0.08)' }}
              >
                <div className="p-6 relative z-10">{guessInput}</div>
              </SketchBorder>
            </div>
          </div>
        </div>

        <div className="hidden min-[1400px]:block sticky top-6 h-fit shrink-0">
          <AdBanner variant="vertical" />
        </div>
      </div>
    </div>
  );
}
