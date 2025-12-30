'use client';

import type { AICharacter } from '@/types/game-state';
import Image from 'next/image';

interface AILogoProps {
  character: AICharacter;
  size?: number;
}

export function AILogo({ character, size = 80 }: AILogoProps) {
  // Using local logo files from public/logos
  const logoUrls: Record<AICharacter, string> = {
    chatgpt: '/logos/chatgpt.svg',
    gemini: '/logos/gemini.png',
    claude: '/logos/claude.png',
    grok: '/logos/grok.png',
    deepseek: '/logos/deepseek.png',
  };

  return (
    <div className="relative inline-block" style={{ width: size, height: size }}>
      <Image
        src={logoUrls[character]}
        alt={`${character} logo`}
        width={size}
        height={size}
        className="rounded-full object-cover"
      />
    </div>
  );
}
