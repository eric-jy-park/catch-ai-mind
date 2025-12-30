'use client';

import { SketchBorder } from '@/components/ui/SketchBorder';
import { AdSenseAutoSlot, type AdFormat } from '@/lib/ads/adsense';

interface AdBannerProps {
  variant: AdFormat;
  className?: string;
}

const CONTAINER_DIMENSIONS: Record<AdFormat, { width: string; height: string }> = {
  vertical: { width: 'w-[180px]', height: 'h-[640px]' },
  rectangle: { width: 'w-[320px]', height: 'h-[280px]' },
};

export function AdBanner({ variant, className = '' }: AdBannerProps) {
  const dimensions = CONTAINER_DIMENSIONS[variant];
  
  return (
    <SketchBorder
      color="#2B2B2B"
      strokeWidth={1}
      borderRadius={24}
      className={`bg-white rounded-3xl ${className} ${dimensions.width} ${dimensions.height}`}
      style={{ 
        boxShadow: '6px 6px 0 rgba(0,0,0,0.08)',
      }}
    >
      <div className="p-4 relative z-10 w-full h-full flex flex-col items-center justify-center">
        <div className="text-sketch-gray text-sm mb-2 font-hand">광고</div>
        <AdSenseAutoSlot format={variant} />
      </div>
    </SketchBorder>
  );
}
