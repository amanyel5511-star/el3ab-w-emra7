// Global Background Music Manager for Kids App
// Uses Web Audio API to synthesize an enthusiastic, cheerful, energetic kid-friendly musical loop.
// Persists settings (enabled/volume) in localStorage. Handles page visibility changes.
import { getSharedAudioContext, unlockAudioSystem, logAudioError } from './audioCore';

class BGMusicManager {
  private masterGain: GainNode | null = null;
  private isRunning: boolean = false;
  private intervalId: any = null;
  private step: number = 0;
  private enabled: boolean = true;
  private volume: number = 0.25; // default comfortable upbeat volume
  private userInteracted: boolean = false;

  // Energetic C Major Pitch Map (Frequencies in Hz)
  private readonly notes: { [key: string]: number } = {
    'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00, 'A3': 220.00, 'B3': 246.94,
    'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
    'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'A5': 880.00, 'B5': 987.77,
    'C6': 1046.50, 'D6': 1174.66, 'E6': 1318.51, 'F6': 1396.91, 'G6': 1567.98
  };

  // 32-step enthusiastic & bouncy kids melody loop
  private readonly melodyPattern: (string | null)[] = [
    // Phrase 1: Joyful ascending bounce
    'C5', 'E5', 'G5', 'C6',   'G5', 'E5', 'G5', 'C6',
    'D5', 'F5', 'A5', 'D6',   'B5', 'G5', 'A5', 'B5',
    // Phrase 2: Playful fan-fare & sparkle
    'C6', 'G5', 'E5', 'C5',   'F5', 'A5', 'C6', 'F6',
    'E6', 'D6', 'C6', 'B5',   'C6', 'G5', 'E5', 'C5',
  ];

  // Upbeat bouncy bassline (synth bass / tubby marimba)
  private readonly bassPattern: (string | null)[] = [
    'C3', null, 'G3', 'C3',   'G3', null, 'E3', 'G3',
    'D3', null, 'A3', 'D3',   'G3', null, 'D3', 'G3',
    'C3', null, 'E3', 'G3',   'F3', null, 'A3', 'C4',
    'G3', null, 'B3', 'D4',   'C3', 'G3', 'C3', null,
  ];

  constructor() {
    this.loadSettings();
    if (typeof window !== 'undefined') {
      document.addEventListener('visibilitychange', this.handleVisibilityChange);

      const unlockAudio = () => {
        this.userInteracted = true;
        unlockAudioSystem();
        if (this.enabled) {
          this.start();
        }
        window.removeEventListener('pointerdown', unlockAudio);
        window.removeEventListener('keydown', unlockAudio);
        window.removeEventListener('touchstart', unlockAudio);
      };

      window.addEventListener('pointerdown', unlockAudio, { passive: true });
      window.addEventListener('keydown', unlockAudio, { passive: true });
      window.addEventListener('touchstart', unlockAudio, { passive: true });
    }
  }

  private loadSettings() {
    try {
      const savedEnabled = localStorage.getItem('bg_music_enabled');
      if (savedEnabled !== null) {
        this.enabled = JSON.parse(savedEnabled);
      }
      const savedVol = localStorage.getItem('bg_music_volume');
      if (savedVol !== null) {
        this.volume = Math.max(0, Math.min(1, parseFloat(savedVol)));
      }
    } catch {
      this.enabled = true;
      this.volume = 0.25;
    }
  }

  private saveSettings() {
    try {
      localStorage.setItem('bg_music_enabled', JSON.stringify(this.enabled));
      localStorage.setItem('bg_music_volume', this.volume.toString());
    } catch {
      // localStorage fallback
    }
  }

  private isDucked: boolean = false;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    const ctx = getSharedAudioContext();
    if (ctx && !this.masterGain) {
      try {
        this.masterGain = ctx.createGain();
        this.applyGainVolume();
        this.masterGain.connect(ctx.destination);
      } catch (err: any) {
        logAudioError('BGMusic MasterGain', err?.name || 'GainError', err?.message || 'Failed to connect BGMusic MasterGain');
      }
    }
    return ctx;
  }

  public duckVolume() {
    this.isDucked = true;
    this.applyGainVolume();
  }

  public unduckVolume() {
    this.isDucked = false;
    this.applyGainVolume();
  }

  private applyGainVolume() {
    const ctx = getSharedAudioContext();
    if (this.masterGain && ctx) {
      try {
        const targetVol = this.isDucked ? this.volume * 0.25 : this.volume;
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, ctx.currentTime);
        this.masterGain.gain.linearRampToValueAtTime(targetVol, ctx.currentTime + 0.2);
      } catch {
        // ignore
      }
    }
  }

  private handleVisibilityChange = () => {
    if (document.hidden) {
      this.pauseLoop();
    } else {
      if (this.enabled && this.userInteracted) {
        this.start();
      }
    }
  };

  public start() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    if (ctx.state === 'suspended' && !this.userInteracted) {
      // AudioContext is suspended and no user gesture occurred yet, wait for first touch/click
      return;
    }

    if (this.isRunning) return;
    this.isRunning = true;

    // Upbeat BPM (~140 BPM -> step time ~210ms)
    const stepDuration = 210;

    this.intervalId = setInterval(() => {
      this.playStep();
    }, stepDuration);
  }

  private playStep() {
    if (!this.enabled || !this.isRunning) return;
    const ctx = this.getContext();
    if (!ctx || !this.masterGain) return;

    const currentTime = ctx.currentTime;

    // 1. Play upbeat lead melody note
    const noteName = this.melodyPattern[this.step % this.melodyPattern.length];
    if (noteName && this.notes[noteName]) {
      this.playPluckNote(ctx, this.notes[noteName], currentTime, 0.18, 'triangle', 0.35);
    }

    // 2. Play energetic bouncy bass note
    const bassNote = this.bassPattern[this.step % this.bassPattern.length];
    if (bassNote && this.notes[bassNote]) {
      this.playPluckNote(ctx, this.notes[bassNote], currentTime, 0.16, 'square', 0.18);
    }

    // 3. Play cheerful woodblock percussive click on off-beats
    if (this.step % 2 === 1) {
      this.playWoodblockPercussion(ctx, currentTime);
    }

    this.step++;
  }

  private playPluckNote(ctx: AudioContext, freq: number, startTime: number, duration: number, type: OscillatorType, gainLevel: number) {
    if (!this.masterGain) return;
    try {
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);

      noteGain.gain.setValueAtTime(0.001, startTime);
      noteGain.gain.linearRampToValueAtTime(gainLevel, startTime + 0.015);
      noteGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.connect(noteGain);
      noteGain.connect(this.masterGain);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.03);
    } catch (err: any) {
      logAudioError('BGMusic Note', err?.name || 'OscillatorError', err?.message || 'Failed to trigger background music note');
    }
  }

  private playWoodblockPercussion(ctx: AudioContext, startTime: number) {
    if (!this.masterGain) return;
    try {
      const osc = ctx.createOscillator();
      const percGain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, startTime);
      osc.frequency.exponentialRampToValueAtTime(220, startTime + 0.03);

      percGain.gain.setValueAtTime(0.12, startTime);
      percGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.03);

      osc.connect(percGain);
      percGain.connect(this.masterGain);

      osc.start(startTime);
      osc.stop(startTime + 0.035);
    } catch (err: any) {
      logAudioError('BGMusic Percussion', err?.name || 'PercussionError', err?.message || 'Failed to trigger percussion beat');
    }
  }

  private pauseLoop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
  }

  public stop() {
    this.pauseLoop();
    this.step = 0;
  }

  public setEnabled(val: boolean) {
    this.enabled = val;
    this.saveSettings();
    if (this.enabled) {
      this.start();
    } else {
      this.stop();
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    this.saveSettings();
    this.applyGainVolume();
  }

  public getVolume(): number {
    return this.volume;
  }
}

export const bgMusicManager = new BGMusicManager();
