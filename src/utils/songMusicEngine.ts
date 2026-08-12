// Web Audio API & Audio File Music Engine for Children Songs
import { SongItem } from '../types';
import { soundManager } from './sound';
import { speechManager } from './SpeechManager';
import { getSharedAudioContext, unlockAudioSystem, logAudioError } from './audioCore';

class SongMusicEngine {
  private currentAudio: HTMLAudioElement | null = null;
  private isPlaying: boolean = false;
  private stopRequested: boolean = false;
  private activeTimeouts: number[] = [];

  private getAudioContext(): AudioContext | null {
    return getSharedAudioContext();
  }

  public stopAll() {
    this.stopRequested = true;
    this.isPlaying = false;

    // Clear active timeouts
    this.activeTimeouts.forEach((id) => window.clearTimeout(id));
    this.activeTimeouts = [];

    // Stop HTML5 audio if playing
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch (err: any) {
        logAudioError('SongAudio Stop', err?.name || 'PauseError', err?.message || 'Failed to pause active audio element');
      }
      this.currentAudio = null;
    }

    // Stop Speech synthesis
    speechManager.stop('user_action');
  }

  // Frequency mapping for musical notes
  private noteFreqs: Record<string, number> = {
    'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00, 'A3': 220.00, 'B3': 246.94,
    'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
    'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'A5': 880.00, 'B5': 987.77,
    'REST': 0
  };

  // Melody definition per song ID
  private getSongMelody(songId: string): { notes: string[]; durations: number[]; tempo: number; instrument: 'marimba' | 'piano' | 'flute' | 'bells' | 'brass' } {
    switch (songId) {
      case 'itsy-bitsy-spider':
        return {
          notes: ['G3', 'C4', 'C4', 'C4', 'D4', 'E4', 'E4', 'E4', 'D4', 'C4', 'D4', 'E4', 'C4', 'E4', 'F4', 'G4', 'G4', 'F4', 'E4', 'F4', 'G4', 'E4', 'C4', 'D4', 'E4', 'E4', 'D4', 'C4', 'D4', 'E4', 'C4'],
          durations: [0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.6, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.6, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.8],
          tempo: 120,
          instrument: 'marimba'
        };

      case 'mama-zamanha-gaya':
        return {
          notes: ['C4', 'E4', 'G4', 'G4', 'A4', 'G4', 'E4', 'C4', 'D4', 'E4', 'F4', 'D4', 'C4', 'E4', 'G4', 'C5', 'B4', 'A4', 'G4', 'F4', 'E4', 'D4', 'C4'],
          durations: [0.3, 0.3, 0.4, 0.3, 0.3, 0.4, 0.3, 0.3, 0.3, 0.3, 0.4, 0.4, 0.6, 0.3, 0.3, 0.4, 0.3, 0.3, 0.4, 0.3, 0.3, 0.4, 0.8],
          tempo: 125,
          instrument: 'flute'
        };

      case 'zahab-allayl':
        return {
          notes: ['G4', 'E4', 'E4', 'F4', 'D4', 'D4', 'C4', 'D4', 'E4', 'F4', 'G4', 'G4', 'G4', 'G4', 'E4', 'E4', 'F4', 'D4', 'D4', 'C4', 'E4', 'G4', 'G4', 'C5'],
          durations: [0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.3, 0.3, 0.3, 0.3, 0.4, 0.4, 0.6, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.3, 0.3, 0.4, 0.4, 0.8],
          tempo: 110,
          instrument: 'bells'
        };

      case 'toot-toot':
        return {
          notes: ['C4', 'G4', 'C5', 'G4', 'E4', 'C4', 'D4', 'E4', 'F4', 'G4', 'C4', 'G4', 'C5', 'G4', 'E4', 'C4', 'G4', 'F4', 'E4', 'D4', 'C4'],
          durations: [0.25, 0.25, 0.4, 0.25, 0.25, 0.4, 0.25, 0.25, 0.25, 0.4, 0.25, 0.25, 0.4, 0.25, 0.25, 0.4, 0.25, 0.25, 0.25, 0.25, 0.8],
          tempo: 140,
          instrument: 'brass'
        };

      case 'geddo-ali':
        return {
          notes: ['C4', 'C4', 'C4', 'G3', 'A3', 'A3', 'G3', 'E4', 'E4', 'D4', 'D4', 'C4', 'G3', 'C4', 'C4', 'C4', 'G3', 'A3', 'A3', 'G3', 'E4', 'E4', 'D4', 'D4', 'C4'],
          durations: [0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.6, 0.3, 0.3, 0.3, 0.3, 0.6, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.6, 0.3, 0.3, 0.3, 0.3, 0.8],
          tempo: 120,
          instrument: 'piano'
        };

      case 'alef-ba-bobaya':
        return {
          notes: ['C4', 'C4', 'G4', 'G4', 'A4', 'A4', 'G4', 'F4', 'F4', 'E4', 'E4', 'D4', 'D4', 'C4', 'G4', 'G4', 'F4', 'F4', 'E4', 'E4', 'D4', 'G4', 'G4', 'F4', 'F4', 'E4', 'E4', 'D4', 'C4', 'C4', 'G4', 'G4', 'A4', 'A4', 'G4'],
          durations: [0.35, 0.35, 0.35, 0.35, 0.35, 0.35, 0.7, 0.35, 0.35, 0.35, 0.35, 0.35, 0.35, 0.7, 0.35, 0.35, 0.35, 0.35, 0.35, 0.35, 0.7, 0.35, 0.35, 0.35, 0.35, 0.35, 0.35, 0.7, 0.35, 0.35, 0.35, 0.35, 0.35, 0.35, 0.8],
          tempo: 115,
          instrument: 'bells'
        };

      case 'shatir-shatir':
        return {
          notes: ['G4', 'G4', 'C5', 'G4', 'A4', 'B4', 'C5', 'E5', 'D5', 'C5', 'G4', 'A4', 'B4', 'C5'],
          durations: [0.3, 0.3, 0.5, 0.3, 0.3, 0.3, 0.6, 0.3, 0.3, 0.4, 0.3, 0.3, 0.3, 0.8],
          tempo: 130,
          instrument: 'brass'
        };

      default:
        return {
          notes: ['C4', 'D4', 'E4', 'C4', 'E4', 'F4', 'G4', 'C4', 'D4', 'E4', 'C4', 'G4', 'F4', 'E4', 'D4', 'C4'],
          durations: [0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.6, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.8],
          tempo: 120,
          instrument: 'marimba'
        };
    }
  }

  // Play a single note using Web Audio API synth
  private playSynthNote(ctx: AudioContext, note: string, startTime: number, duration: number, instrument: string) {
    if (note === 'REST' || !this.noteFreqs[note]) return;

    try {
      const freq = this.noteFreqs[note];
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (instrument === 'marimba') {
        osc.type = 'triangle';
        gain.gain.setValueAtTime(0.3, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration * 0.9);
      } else if (instrument === 'flute') {
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.05, startTime);
        gain.gain.linearRampToValueAtTime(0.25, startTime + 0.05);
        gain.gain.setValueAtTime(0.25, startTime + duration - 0.05);
        gain.gain.linearRampToValueAtTime(0.001, startTime + duration);
      } else if (instrument === 'bells') {
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.35, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration * 1.2);
      } else if (instrument === 'brass') {
        osc.type = 'sawtooth';
        gain.gain.setValueAtTime(0.15, startTime);
        gain.gain.linearRampToValueAtTime(0.001, startTime + duration);
      } else {
        osc.type = 'square';
        gain.gain.setValueAtTime(0.15, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration * 0.8);
      }

      osc.frequency.setValueAtTime(freq, startTime);
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);

      if (duration > 0.3) {
        const bassOsc = ctx.createOscillator();
        const bassGain = ctx.createGain();
        bassOsc.type = 'triangle';
        bassOsc.frequency.setValueAtTime(freq / 2, startTime);
        bassGain.gain.setValueAtTime(0.1, startTime);
        bassGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        bassOsc.connect(bassGain);
        bassGain.connect(ctx.destination);
        bassOsc.start(startTime);
        bassOsc.stop(startTime + duration);
      }
    } catch (err: any) {
      logAudioError('SongSynthNote', err?.name || 'OscillatorError', err?.message || `Failed playing note ${note}`);
    }
  }

  // Play rhythmic percussion beat
  private playDrumBeat(ctx: AudioContext, startTime: number) {
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(120, startTime);
      osc.frequency.exponentialRampToValueAtTime(30, startTime + 0.1);
      gain.gain.setValueAtTime(0.25, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.1);
    } catch (err: any) {
      logAudioError('SongDrumBeat', err?.name || 'DrumError', err?.message || 'Failed playing drum beat');
    }
  }

  public async playSong(
    song: SongItem,
    onProgress: (percent: number) => void,
    onEnded: () => void
  ) {
    unlockAudioSystem();
    this.stopAll();
    this.stopRequested = false;
    this.isPlaying = true;

    // Case 1: Custom Uploaded / Direct Audio URL
    if (song.audioUrl) {
      try {
        const audio = new Audio(song.audioUrl);
        this.currentAudio = audio;

        audio.ontimeupdate = () => {
          if (!this.stopRequested && audio.duration) {
            onProgress((audio.currentTime / audio.duration) * 100);
          }
        };

        audio.onended = () => {
          this.isPlaying = false;
          onEnded();
        };

        audio.onerror = (e) => {
          logAudioError(song.title, 'AudioLoadError', `Failed to load URL "${song.audioUrl}"`, e);
          this.playSyntheticSong(song, onProgress, onEnded);
        };

        await audio.play().catch((err) => {
          logAudioError(song.title, err?.name || 'NotAllowedError', err?.message || 'Audio play call failed', { url: song.audioUrl });
          this.playSyntheticSong(song, onProgress, onEnded);
        });
        return;
      } catch (err: any) {
        logAudioError(song.title, err?.name || 'PlayException', err?.message || 'Exception initiating HTML5 audio');
        this.playSyntheticSong(song, onProgress, onEnded);
        return;
      }
    }

    // Case 2: Web Audio API Real Music Generator
    this.playSyntheticSong(song, onProgress, onEnded);
  }

  private playSyntheticSong(
    song: SongItem,
    onProgress: (percent: number) => void,
    onEnded: () => void
  ) {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) {
        logAudioError(song.title, 'NoAudioContext', 'Shared AudioContext unavailable for synthetic song');
        this.isPlaying = false;
        onEnded();
        return;
      }

      const melody = this.getSongMelody(song.id);
      const now = ctx.currentTime;

      let totalDuration = 0;
      melody.durations.forEach((d) => (totalDuration += d));

      const loops = 2;
      let currentTime = now + 0.1;

      for (let l = 0; l < loops; l++) {
        melody.notes.forEach((note, index) => {
          const dur = melody.durations[index];
          this.playSynthNote(ctx, note, currentTime, dur, melody.instrument);

          if (index % 2 === 0) {
            this.playDrumBeat(ctx, currentTime);
          }

          currentTime += dur;
        });
      }

      const songDurationSeconds = loops * totalDuration;
      const songDurationMs = songDurationSeconds * 1000;

      const lyricsText = song.lyrics || song.lyricsSummary || song.title;
      const speechTimeout = window.setTimeout(() => {
        if (!this.stopRequested) {
          soundManager.speakArabic(lyricsText, 0.95);
        }
      }, 400);
      this.activeTimeouts.push(speechTimeout);

      const startTimeMs = Date.now();
      const intervalMs = 100;

      const progressInterval = window.setInterval(() => {
        if (this.stopRequested) {
          window.clearInterval(progressInterval);
          return;
        }

        const elapsedMs = Date.now() - startTimeMs;
        const percent = Math.min(100, (elapsedMs / songDurationMs) * 100);
        onProgress(percent);

        if (percent >= 100) {
          window.clearInterval(progressInterval);
          this.isPlaying = false;
          onEnded();
        }
      }, intervalMs);

      this.activeTimeouts.push(progressInterval);
    } catch (err: any) {
      logAudioError(song.title, err?.name || 'SyntheticSongError', err?.message || 'Error playing synthetic song');
      this.isPlaying = false;
      onEnded();
    }
  }
}

export const songMusicEngine = new SongMusicEngine();
