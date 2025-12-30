type SoundType = 'correct' | 'wrong' | 'click' | 'draw' | 'timer_warning' | 'round_start' | 'round_end' | 'game_end';

interface SoundConfig {
  volume: number;
  loop: boolean;
}

class SoundManager {
  private audioContext: AudioContext | null = null;
  private sounds: Map<SoundType, AudioBuffer> = new Map();
  private backgroundMusic: AudioBufferSourceNode | null = null;
  private backgroundGain: GainNode | null = null;
  private isMuted: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  private async initContext() {
    if (!this.audioContext) {
      console.error('No audio context available');
      return;
    }

    console.log('Audio context state:', this.audioContext.state);

    if (this.audioContext.state === 'suspended') {
      console.log('Resuming suspended audio context...');
      await this.audioContext.resume();
      console.log('Audio context resumed:', this.audioContext.state);
    }
  }

  private generateSound(type: SoundType): AudioBuffer | undefined {
    if (!this.audioContext) return undefined;

    const sampleRate = this.audioContext.sampleRate;
    let buffer: AudioBuffer;
    let duration: number;

    switch (type) {
      case 'correct': {
        duration = 0.3;
        buffer = this.audioContext.createBuffer(2, sampleRate * duration, sampleRate);
        for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
          const data = buffer.getChannelData(channel);
          for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const freq = 880 * (1 + t * 2);
            data[i] = 0.3 * Math.sin(2 * Math.PI * freq * t) * Math.exp(-t * 3);
          }
        }
        break;
      }
      case 'wrong': {
        duration = 0.2;
        buffer = this.audioContext.createBuffer(2, sampleRate * duration, sampleRate);
        for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
          const data = buffer.getChannelData(channel);
          for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const freq = 220 * (1 - t * 0.5);
            data[i] = 0.2 * Math.sin(2 * Math.PI * freq * t) * Math.exp(-t * 5);
          }
        }
        break;
      }
      case 'click': {
        duration = 0.05;
        buffer = this.audioContext.createBuffer(2, sampleRate * duration, sampleRate);
        for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
          const data = buffer.getChannelData(channel);
          for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            data[i] = 0.15 * Math.sin(2 * Math.PI * 1000 * t) * Math.exp(-t * 20);
          }
        }
        break;
      }
      case 'draw': {
        duration = 0.02;
        buffer = this.audioContext.createBuffer(2, sampleRate * duration, sampleRate);
        for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
          const data = buffer.getChannelData(channel);
          for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const freq = 2000 + Math.random() * 500;
            data[i] = 0.1 * Math.sin(2 * Math.PI * freq * t) * Math.exp(-t * 50);
          }
        }
        break;
      }
      case 'timer_warning': {
        duration = 0.1;
        buffer = this.audioContext.createBuffer(2, sampleRate * duration, sampleRate);
        for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
          const data = buffer.getChannelData(channel);
          for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            data[i] = 0.25 * Math.sin(2 * Math.PI * 440 * t) * Math.exp(-t * 10);
          }
        }
        break;
      }
      case 'round_start': {
        duration = 0.4;
        buffer = this.audioContext.createBuffer(2, sampleRate * duration, sampleRate);
        for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
          const data = buffer.getChannelData(channel);
          for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const freq = 523.25 * (1 + t);
            data[i] = 0.2 * Math.sin(2 * Math.PI * freq * t) * Math.exp(-t * 2);
          }
        }
        break;
      }
      case 'round_end': {
        duration = 0.5;
        buffer = this.audioContext.createBuffer(2, sampleRate * duration, sampleRate);
        for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
          const data = buffer.getChannelData(channel);
          for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const freq = 392 * (1 - t * 0.5);
            data[i] = 0.2 * Math.sin(2 * Math.PI * freq * t) * Math.exp(-t * 2);
          }
        }
        break;
      }
      case 'game_end': {
        duration = 1.0;
        buffer = this.audioContext.createBuffer(2, sampleRate * duration, sampleRate);
        for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
          const data = buffer.getChannelData(channel);
          for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const freqs = [523.25, 659.25, 783.99];
            const freqIndex = Math.floor(t * 3) % freqs.length;
            data[i] = 0.25 * Math.sin(2 * Math.PI * freqs[freqIndex] * t) * Math.exp(-t * 1.5);
          }
        }
        break;
      }
      default:
        return undefined;
    }

    return buffer;
  }

  async play(type: SoundType, config: Partial<SoundConfig> = {}) {
    await this.initContext();

    if (this.isMuted || !this.audioContext) return;

    const volume = config.volume ?? 0.5;
    const loop = config.loop ?? false;

    let buffer = this.sounds.get(type);
    if (!buffer) {
      buffer = this.generateSound(type);
      if (buffer) {
        this.sounds.set(type, buffer);
      }
    }

    if (!buffer) return;

    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();

    source.buffer = buffer;
    source.loop = loop;

    gainNode.gain.value = volume;

    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    source.start();
  }

  async playBackgroundMusic() {
    try {
      await this.initContext();

      if (this.isMuted) {
        console.log('Background music skipped: muted');
        return;
      }

      if (!this.audioContext) {
        console.log('Background music skipped: no audio context');
        return;
      }

      this.stopBackgroundMusic();

      const sampleRate = this.audioContext.sampleRate;
      const duration = 4;
      const buffer = this.audioContext.createBuffer(2, sampleRate * duration, sampleRate);

      for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
        const data = buffer.getChannelData(channel);
        for (let i = 0; i < data.length; i++) {
          const t = i / sampleRate;
          const melody = Math.sin(2 * Math.PI * 261.63 * t) * 0.3 +
                        Math.sin(2 * Math.PI * 329.63 * t) * 0.25 +
                        Math.sin(2 * Math.PI * 392.00 * t) * 0.2;
          const harmony = Math.sin(2 * Math.PI * 329.63 * t * 0.5) * 0.15 +
                         Math.sin(2 * Math.PI * 392.00 * t * 0.5) * 0.12;
          const envelope = 0.3 + 0.1 * Math.sin(t * Math.PI * 2);
          data[i] = (melody + harmony) * envelope;
        }
      }

      this.backgroundMusic = this.audioContext.createBufferSource();
      this.backgroundGain = this.audioContext.createGain();

      this.backgroundMusic.buffer = buffer;
      this.backgroundMusic.loop = true;

      this.backgroundGain.gain.value = 0.8;

      this.backgroundMusic.connect(this.backgroundGain);
      this.backgroundGain.connect(this.audioContext.destination);

      console.log('Starting background music...');
      console.log('Audio context state:', this.audioContext.state);
      console.log('Background gain:', this.backgroundGain.gain.value);
      console.log('Buffer duration:', buffer.duration);
      console.log('Sample rate:', buffer.sampleRate);

      this.backgroundMusic.start(0);
      console.log('Background music started successfully!');
    } catch (error) {
      console.error('Failed to play background music:', error);
    }
  }

  stopBackgroundMusic() {
    if (this.backgroundMusic) {
      this.backgroundMusic.stop();
      this.backgroundMusic = null;
    }
    if (this.backgroundGain) {
      this.backgroundGain.disconnect();
      this.backgroundGain = null;
    }
  }

  setBackgroundVolume(volume: number) {
    if (this.backgroundGain) {
      this.backgroundGain.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  mute() {
    this.isMuted = true;
    this.stopBackgroundMusic();
  }

  unmute() {
    this.isMuted = false;
  }

  isSoundMuted(): boolean {
    return this.isMuted;
  }

  async ensureAudioContext() {
    await this.initContext();
  }

  async forcePlayBackgroundMusic() {
    await this.initContext();

    if (!this.audioContext) {
      console.error('Cannot play: no audio context');
      return;
    }

    console.log('Force playing background music...');
    await this.playBackgroundMusic();

    if (!this.backgroundMusic) {
      console.error('Background music failed to start');
    } else {
      console.log('Background music is playing!');
    }
  }
}

let soundManagerInstance: SoundManager | null = null;

export function getSoundManager(): SoundManager {
  if (!soundManagerInstance) {
    soundManagerInstance = new SoundManager();
  }
  return soundManagerInstance;
}

export type { SoundType, SoundConfig };
