'use client';

import { useEffect, useRef } from 'react';
import { getSoundManager, type SoundType } from './sound-manager';

export function useSound() {
  const soundManagerRef = useRef(getSoundManager());

  const play = (type: SoundType) => {
    soundManagerRef.current.play(type);
  };

  const playBackgroundMusic = () => {
    soundManagerRef.current.playBackgroundMusic();
  };

  const stopBackgroundMusic = () => {
    soundManagerRef.current.stopBackgroundMusic();
  };

  const setBackgroundVolume = (volume: number) => {
    soundManagerRef.current.setBackgroundVolume(volume);
  };

  const mute = () => {
    soundManagerRef.current.mute();
  };

  const unmute = () => {
    soundManagerRef.current.unmute();
  };

  const isMuted = () => {
    return soundManagerRef.current.isSoundMuted();
  };

  const ensureAudioContext = () => {
    return soundManagerRef.current.ensureAudioContext();
  };

  const forcePlayBackgroundMusic = () => {
    return soundManagerRef.current.forcePlayBackgroundMusic();
  };

  return {
    play,
    playBackgroundMusic,
    stopBackgroundMusic,
    setBackgroundVolume,
    mute,
    unmute,
    isMuted,
    ensureAudioContext,
    forcePlayBackgroundMusic,
  };
}

export function useClickSound(enabled: boolean = true) {
  const { play, ensureAudioContext } = useSound();

  useEffect(() => {
    if (!enabled) return;

    const handleClick = async () => {
      await ensureAudioContext();
      play('click');
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [enabled, play, ensureAudioContext]);
}
