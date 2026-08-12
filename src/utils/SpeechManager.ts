// Single Unified SpeechSynthesis Manager for the entire application
import { bgMusicManager } from './bgMusicManager';

export interface SpeechOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  lang?: string;
  context?: string; // Current page or story context (e.g. 'StoriesHub - Page 2')
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: any) => void;
}

class SpeechManager {
  private activeUtterance: SpeechSynthesisUtterance | null = null;
  private gcUtterances: Set<SpeechSynthesisUtterance> = new Set();
  private intentionalCancel: boolean = false;
  private voices: SpeechSynthesisVoice[] = [];
  private currentContext: string = '';

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.initVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => this.initVoices();
      }
    }
  }

  private initVoices() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        this.voices = window.speechSynthesis.getVoices() || [];
      } catch {
        this.voices = [];
      }
    }
  }

  /**
   * Dynamically search for the best available Arabic voice on the device.
   * Priority: Female/Child/Natural Arabic voice > any Arabic voice > null (system fallback with lang='ar-SA')
   */
  public getBestArabicVoice(): SpeechSynthesisVoice | null {
    if (this.voices.length === 0) {
      this.initVoices();
    }
    if (!this.voices || this.voices.length === 0) {
      console.warn('[AudioSystem Diagnostic] ⚠️ No voices retrieved from SpeechSynthesis yet. Will fall back to system default with lang="ar-SA".');
      return null;
    }

    const arVoices = this.voices.filter(
      (v) => v.lang && v.lang.toLowerCase().replace('_', '-').startsWith('ar')
    );
    if (arVoices.length === 0) {
      console.warn('[AudioSystem Diagnostic] ⚠️ No explicit Arabic SpeechSynthesis voice found on this device. System default voice will be used with lang="ar-SA".');
      return null;
    }

    const femaleKeywords = [
      'female',
      'مرأة',
      'أنثى',
      'zeina',
      'salma',
      'laila',
      'zariyah',
      'mariam',
      'fatima',
      'hoda',
      'nora',
      'google',
      'natural'
    ];

    const preferredVoice = arVoices.find((v) => {
      const nameLower = (v.name || '').toLowerCase();
      return femaleKeywords.some((kw) => nameLower.includes(kw));
    });

    return preferredVoice || arVoices[0];
  }

  /**
   * Set current context (e.g., page name, component name) for diagnostic logging
   */
  public setContext(contextName: string) {
    this.currentContext = contextName;
  }

  /**
   * Orderly cancellation of current speech synthesis.
   * Marks intentionalCancel as true to prevent false 'interrupted' error logs.
   */
  public stop(reason: 'user_action' | 'navigation' | 'new_speech' | 'cleanup' = 'user_action') {
    bgMusicManager.unduckVolume();

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (this.activeUtterance || window.speechSynthesis.speaking || window.speechSynthesis.pending) {
      this.intentionalCancel = true;
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
      this.clearActiveUtterance();
    }
  }

  /**
   * Speak Arabic text with optimized options and speech management
   */
  public speakArabic(text: string, options: SpeechOptions | number = 0.85): void {
    const opts: SpeechOptions = typeof options === 'number' ? { rate: options } : options;
    this.speak(text, {
      lang: 'ar-SA',
      rate: 0.85,
      pitch: 1.1,
      ...opts
    });
  }

  /**
   * Primary speech synthesis trigger with full event lifecycle management and diagnostic reporting
   */
  public speak(text: string, options: SpeechOptions = {}): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      options.onError?.('NotSupported');
      return;
    }

    if (!text || !text.trim()) return;

    const context = options.context || this.currentContext || 'General';
    const wasAnotherRunning = this.isSpeaking();

    // 1. Orderly stop of previous utterance before launching a new one
    this.stop('new_speech');

    // Reset intentional cancel flag for the newly created utterance
    this.intentionalCancel = false;

    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      const rate = options.rate ?? 0.85;
      const pitch = options.pitch ?? 1.1;
      const volume = options.volume ?? 1.0;
      const lang = options.lang || 'ar-SA';

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = volume;

      const voice = this.getBestArabicVoice();
      if (voice) {
        utterance.voice = voice;
      }

      this.activeUtterance = utterance;
      this.gcUtterances.add(utterance); // Prevent GC from cutting off speech on Android Chrome

      utterance.onstart = () => {
        bgMusicManager.duckVolume();
        options.onStart?.();
      };

      utterance.onend = () => {
        bgMusicManager.unduckVolume();
        this.gcUtterances.delete(utterance);
        if (this.activeUtterance === utterance) {
          this.activeUtterance = null;
        }
        this.intentionalCancel = false;
        options.onEnd?.();
      };

      utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
        bgMusicManager.unduckVolume();
        this.gcUtterances.delete(utterance);
        const wasCurrent = this.activeUtterance === utterance;
        if (wasCurrent) {
          this.activeUtterance = null;
        }

        const isInterrupted = event.error === 'interrupted' || event.error === 'canceled';

        // If interrupted due to intentional cancel (user stop, page change, new speech), DO NOT log or warn!
        if (isInterrupted && this.intentionalCancel) {
          this.intentionalCancel = false;
          return;
        }

        // If interrupted unexpectedly WITHOUT an intentional cancel request, log full diagnostic info
        if (isInterrupted) {
          console.warn('[AudioSystem Diagnostic] 🔊 SpeechSynthesis Unexpected Interrupted Debug Info:', {
            text,
            context,
            wasAnotherUtteranceRunning: wasAnotherRunning,
            wasCancelCalled: this.intentionalCancel,
            selectedVoice: utterance.voice ? `${utterance.voice.name} (${utterance.voice.lang})` : 'Default System Voice',
            lang: utterance.lang,
            rate: utterance.rate,
            pitch: utterance.pitch,
            volume: utterance.volume,
            errorType: event.error
          });
        } else {
          console.warn(`[AudioSystem Diagnostic] 🔊 Source: "SpeechSynthesis" | ErrorType: ${event.error || 'Unknown'} | Context: ${context}`, {
            text,
            voice: utterance.voice?.name || 'Default'
          });
        }

        this.intentionalCancel = false;
        options.onError?.(event);
      };

      window.speechSynthesis.speak(utterance);
    } catch (err: any) {
      bgMusicManager.unduckVolume();
      this.clearActiveUtterance();
      options.onError?.(err);
    }
  }

  public isSpeaking(): boolean {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false;
    return !!(this.activeUtterance || window.speechSynthesis.speaking || window.speechSynthesis.pending);
  }

  private clearActiveUtterance() {
    this.activeUtterance = null;
  }
}

export const speechManager = new SpeechManager();
