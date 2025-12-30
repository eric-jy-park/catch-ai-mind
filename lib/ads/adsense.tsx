'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * HOW TO GET ADSENSE CREDENTIALS:
 * 1. Go to https://www.google.com/adsense/
 * 2. Sign up or sign in to your AdSense account
 * 3. Get your Publisher ID (ca-pub-XXXXXXXXXXXXXXXX) from Settings > Account > Account Information
 * 4. Create ad units at Ads > By ad unit
 * 5. Copy the ad slot IDs for each unit you create
 * 6. Add the credentials to your .env.local file
 */

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>;
  }
}

export type AdFormat = 'vertical' | 'rectangle';

export interface AdSenseAdProps {
  slot: string;
  format: AdFormat;
  className?: string;
  testMode?: boolean;
}

export function getAdSenseClientId(): string | undefined {
  return process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
}

export function getAdSlotId(format: AdFormat): string | undefined {
  switch (format) {
    case 'vertical':
      return process.env.NEXT_PUBLIC_ADSENSE_SLOT_VERTICAL;
    case 'rectangle':
      return process.env.NEXT_PUBLIC_ADSENSE_SLOT_RECTANGLE;
    default:
      return undefined;
  }
}

const AD_DIMENSIONS: Record<AdFormat, { width: number; height: number }> = {
  vertical: { width: 160, height: 600 },
  rectangle: { width: 300, height: 250 },
};

export function AdSenseAd({ 
  slot, 
  format, 
  className = '',
  testMode = false,
}: AdSenseAdProps) {
  const adRef = useRef<HTMLModElement>(null);
  const [adError, setAdError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const clientId = getAdSenseClientId();
  const dimensions = AD_DIMENSIONS[format];

  useEffect(() => {
    if (typeof window === 'undefined' || testMode) return;

    if (!clientId || !slot) {
      setAdError(true);
      return;
    }

    const initializeAd = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (!window.adsbygoogle) {
          setAdError(true);
          return;
        }

        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          setIsLoaded(true);
        } catch {
          setAdError(true);
        }
      } catch {
        setAdError(true);
      }
    };

    initializeAd();
  }, [clientId, slot, testMode]);

  if (testMode || adError || !clientId || !slot) {
    return (
      <div 
        className={`flex items-center justify-center bg-paper border-2 border-dashed border-sketch-gray rounded-lg ${className}`}
        style={{ 
          width: dimensions.width, 
          height: dimensions.height,
        }}
      >
        <div className="text-center p-4">
          <span className="text-sketch-gray font-hand text-sm">
            {!clientId || !slot ? '광고 설정 필요' : '광고'}
          </span>
          {format === 'vertical' && (
            <div className="mt-2 text-xs text-sketch-gray/50 transform -rotate-2">
              (Vertical Banner)
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <ins
      ref={adRef}
      className={`adsbygoogle block ${className}`}
      style={{
        display: 'block',
        width: dimensions.width,
        height: dimensions.height,
        backgroundColor: isLoaded ? 'transparent' : 'rgba(0,0,0,0.02)',
      }}
      data-ad-client={clientId}
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="false"
    />
  );
}

export function AdSenseAutoSlot({ 
  format, 
  className = '',
  testMode = false,
}: Omit<AdSenseAdProps, 'slot'>) {
  const slot = getAdSlotId(format);
  
  if (!slot) {
    return (
      <div 
        className={`flex items-center justify-center bg-paper border-2 border-dashed border-sketch-gray rounded-lg ${className}`}
        style={{ 
          width: AD_DIMENSIONS[format].width, 
          height: AD_DIMENSIONS[format].height,
        }}
      >
        <div className="text-center p-4">
          <span className="text-sketch-gray font-hand text-sm">
            광고 슬롯 미설정
          </span>
        </div>
      </div>
    );
  }

  return (
    <AdSenseAd 
      slot={slot} 
      format={format} 
      className={className}
      testMode={testMode}
    />
  );
}
