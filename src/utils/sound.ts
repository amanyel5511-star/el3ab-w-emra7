// Web Audio Synth & Robust Arabic Speech Helper for Kids App (Cross-Platform Web + Android + iOS)
import { getSharedAudioContext, unlockAudioSystem, logAudioError } from './audioCore';
import { speechManager } from './SpeechManager';

class SoundManager {
  public soundEnabled: boolean = true;
  public voiceEnabled: boolean = true;

  constructor() {
    this.loadSettings();
  }

  private loadSettings() {
    try {
      const savedSfx = localStorage.getItem('app_sfx_enabled');
      if (savedSfx !== null) {
        this.soundEnabled = JSON.parse(savedSfx);
        this.voiceEnabled = JSON.parse(savedSfx);
      }
    } catch {
      this.soundEnabled = true;
      this.voiceEnabled = true;
    }
  }

  private saveSettings() {
    try {
      localStorage.setItem('app_sfx_enabled', JSON.stringify(this.soundEnabled));
    } catch {
      // localStorage fallback
    }
  }

  // Toggle Master Sound State for SFX & Speech (Does NOT affect Background Music)
  toggleMute(): boolean {
    this.soundEnabled = !this.soundEnabled;
    this.voiceEnabled = this.soundEnabled;
    this.saveSettings();

    if (!this.soundEnabled) {
      speechManager.stop('user_action');
    }
    return this.soundEnabled;
  }

  private getContext(): AudioContext | null {
    if (!this.soundEnabled) return null;
    const ctx = getSharedAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    return ctx;
  }

  // Play click pop sound
  playClick() {
    unlockAudioSystem();
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(850, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch (err: any) {
      logAudioError('playClick', err?.name || 'OscillatorError', err?.message || 'Failed to play click sound effect');
    }
  }

  // Play paint splash / bucket fill
  playPaintFill() {
    unlockAudioSystem();
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(640, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (err: any) {
      logAudioError('playPaintFill', err?.name || 'OscillatorError', err?.message || 'Failed to play paint fill sound');
    }
  }

  // Play star sparkle
  playStar() {
    unlockAudioSystem();
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.06);
        gain.gain.setValueAtTime(0.25, ctx.currentTime + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.06 + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.06);
        osc.stop(ctx.currentTime + idx * 0.06 + 0.2);
      });
    } catch (err: any) {
      logAudioError('playStar', err?.name || 'OscillatorError', err?.message || 'Failed to play star chime sound');
    }
  }

  // Success Fanfare Tone
  playSuccess() {
    unlockAudioSystem();
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
        gain.gain.setValueAtTime(0.3, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.08 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.25);
      });
    } catch (err: any) {
      logAudioError('playSuccess', err?.name || 'OscillatorError', err?.message || 'Failed to play success fanfare');
    }
  }

  // Gentle Try Again Tone
  playTryAgain() {
    unlockAudioSystem();
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(240, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch (err: any) {
      logAudioError('playTryAgain', err?.name || 'OscillatorError', err?.message || 'Failed to play try again sound');
    }
  }

  private playFeedbackAudio(filename: string): Promise<void> {
    unlockAudioSystem();
    if (!this.soundEnabled) return Promise.resolve();

    const audioUrl = `/audio/feedback/${filename}`;
    return new Promise((resolve) => {
      try {
        const audio = new Audio(audioUrl);
        audio.onended = () => resolve();
        audio.onerror = (e) => {
          logAudioError('playFeedbackAudio', 'AudioLoadError', `Failed to play ${audioUrl}: ${e}`);
          resolve();
        };
        audio.play().catch((err) => {
          logAudioError('playFeedbackAudio', 'PlayError', err?.message);
          resolve();
        });
      } catch (err: any) {
        logAudioError('playFeedbackAudio', 'Exception', err?.message);
        resolve();
      }
    });
  }

  // Feedback for correct answer
  playCorrectFeedback() {
    this.playSuccess();
    const isRaea = Math.random() > 0.5;
    const filename = isRaea ? '01_raea.mp3' : '02_momtaz.mp3';
    this.playFeedbackAudio(filename);
  }

  // Feedback for wrong answer
  playWrongFeedback() {
    this.playTryAgain();
    this.playFeedbackAudio('03_hawel_marra_okhra.mp3');
  }

  // Specific feedback options
  playFeedbackRaea() {
    this.playSuccess();
    this.playFeedbackAudio('01_raea.mp3');
  }

  playFeedbackMomtaz() {
    this.playSuccess();
    this.playFeedbackAudio('02_momtaz.mp3');
  }

  playFeedbackTryAgain() {
    this.playTryAgain();
    this.playFeedbackAudio('03_hawel_marra_okhra.mp3');
  }

  playFeedbackNextQuestion() {
    this.playTryAgain();
    this.playFeedbackAudio('04_hawel_marra_okhra_fel_soal_eltaly.mp3');
  }

  playFeedbackNextStage() {
    this.playSuccess();
    this.playFeedbackAudio('05_elmarhala_eltalya.mp3');
  }

  playFeedbackMicUnclear() {
    this.playTryAgain();
    this.playFeedbackAudio('06_microphone_unclear.mp3');
  }

  private motivationalPhrases: string[] = [
    'أنت بطل ذكي ومذهل! أحسنت صنعاً!',
    'عمل رائع جداً! واصل الإبداع والتعلم!',
    'أحسنت يا بطل! أنا فخور بك وبذكائك!',
    'يا لك من نجم ساطع! إجاباتك ممتازة!',
    'ممتاز جداً! لقد حصلت على نجوم جديدة براقة!',
    'أنت أسطورة اليوم! استمر في التميز!'
  ];

  // Play random or targeted motivational speech audio with fanfare
  playAudioMotivation(phraseIndex?: number) {
    this.playSuccess();
    const idx =
      phraseIndex !== undefined && phraseIndex >= 0 && phraseIndex < this.motivationalPhrases.length
        ? phraseIndex
        : Math.floor(Math.random() * this.motivationalPhrases.length);
    const phrase = this.motivationalPhrases[idx];
    this.speakArabic(phrase, 0.9);
    return phrase;
  }

  // Play game completion audio cheer
  playGameCompletionAudio(gameTitle?: string, starsEarned: number = 3) {
    this.playCelebrationCheer();
    setTimeout(() => {
      if (gameTitle) {
        this.speakArabic(`مبارك! أتممت لعبة ${gameTitle} بنجاح واكتسبت ${starsEarned} نجوم براقة! أنت بطل رائع!`, 0.9);
      } else {
        this.speakArabic(`مبارك! أتممت اللعبة بنجاح واكتسبت ${starsEarned} نجوم براقة! أنت بطل رائع!`, 0.9);
      }
    }, 400);
  }

  // Play milestone star achievement celebration audio
  playMilestoneCelebration(milestoneStars: number) {
    this.playCelebrationCheer();
    setTimeout(() => {
      this.speakArabic(`مبارك يا بطل! أسطوري! لقد جمعت ${milestoneStars} نجمة ذهبية! أنت النجم الذهبي اليوم!`, 0.85);
    }, 500);
  }

  // Audio Fanfare + Synthesized Cheering Chords
  playCelebrationCheer() {
    unlockAudioSystem();
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const chords = [
        [523.25, 659.25, 783.99], // C Major
        [587.33, 698.46, 880.0], // F Major
        [659.25, 783.99, 987.77], // G Major
        [1046.5, 1318.51, 1567.98] // C High Victory
      ];

      chords.forEach((chord, step) => {
        chord.forEach((freq) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + step * 0.12);
          gain.gain.setValueAtTime(0.2, ctx.currentTime + step * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + step * 0.12 + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + step * 0.12);
          osc.stop(ctx.currentTime + step * 0.12 + 0.35);
        });
      });
    } catch (err: any) {
      logAudioError('playCelebrationCheer', err?.name || 'OscillatorError', err?.message || 'Failed to play celebration cheer sound');
    }
  }

  // Cross-Platform Speech Synthesis Method for Arabic (Optimized for Chrome Android & Garbage Collection Safe)
  speakArabic(text: string, rate: number = 0.85) {
    unlockAudioSystem();
    if (!this.soundEnabled || !this.voiceEnabled || typeof window === 'undefined') return;

    speechManager.speakArabic(text, {
      rate,
      onError: () => this.playMelodicFallback()
    });
  }

  // Synthesizes pleasant musical chime if Speech Synthesis is blocked or unavailable
  private playMelodicFallback() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch (err: any) {
      logAudioError('playMelodicFallback', err?.name || 'OscillatorError', err?.message || 'Failed to play melodic fallback chime');
    }
  }
}

export const soundManager = new SoundManager();
