import { ARABIC_NUMBERS, DIGIT_TO_WORD } from '../data/numbersData';
import { speechManager } from './SpeechManager';
import { logAudioError, unlockAudioSystem } from './audioCore';

class NumbersAudio {
  private currentAudio: HTMLAudioElement | null = null;

  public stopCurrentAudio(): void {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch {
        // ignore pause errors
      }
      this.currentAudio = null;
    }
  }

  public playAudioUrl(url: string, fallbackText?: string): Promise<void> {
    unlockAudioSystem();
    this.stopCurrentAudio();

    if (!url) {
      if (fallbackText) {
        speechManager.speakArabic(fallbackText);
      }
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      let handled = false;

      const finishAndFallback = (reason: string, err?: any) => {
        if (handled) return;
        handled = true;
        if (this.currentAudio === audio) {
          this.currentAudio = null;
        }
        logAudioError('NumbersAudio', 'AudioPlaybackFallback', `${reason}: ${url}`, err);
        if (fallbackText) {
          speechManager.speakArabic(fallbackText);
        }
        resolve();
      };

      let audio: HTMLAudioElement;
      try {
        audio = new Audio(url);
        this.currentAudio = audio;

        audio.onerror = (e) => {
          finishAndFallback('Failed to load audio source', e);
        };

        audio.onended = () => {
          if (this.currentAudio === audio) {
            this.currentAudio = null;
          }
          resolve();
        };

        audio.play().then(() => {
          // playing
        }).catch((err) => {
          if (err?.name === 'AbortError' || err?.message?.includes('interrupted')) {
            if (this.currentAudio === audio) {
              this.currentAudio = null;
            }
            resolve();
          } else {
            finishAndFallback('Play request failed', err);
          }
        });
      } catch (err) {
        finishAndFallback('Audio instantiation error', err);
      }
    });
  }

  public playNumber(numOrWordOrItem: any): Promise<void> {
    if (typeof numOrWordOrItem === 'number') {
      const item = ARABIC_NUMBERS.find(n => n.id === numOrWordOrItem || n.englishDigit === numOrWordOrItem);
      const word = DIGIT_TO_WORD[numOrWordOrItem] || (item ? item.word : String(numOrWordOrItem));
      if (item && item.audio) {
        return this.playAudioUrl(item.audio, word);
      }
      speechManager.speakArabic(word);
      return Promise.resolve();
    }

    if (typeof numOrWordOrItem === 'string') {
      if (numOrWordOrItem.startsWith('/')) {
        return this.playAudioUrl(numOrWordOrItem);
      }
      const item = ARABIC_NUMBERS.find(n => n.word === numOrWordOrItem || n.digit === numOrWordOrItem);
      if (item && item.audio) {
        return this.playAudioUrl(item.audio, item.word);
      }
      speechManager.speakArabic(numOrWordOrItem);
      return Promise.resolve();
    }

    if (numOrWordOrItem && typeof numOrWordOrItem === 'object') {
      if (numOrWordOrItem.audio) {
        return this.playAudioUrl(numOrWordOrItem.audio, numOrWordOrItem.word);
      }
      if (numOrWordOrItem.word) {
        speechManager.speakArabic(numOrWordOrItem.word);
      }
    }

    return Promise.resolve();
  }
}

export const numbersAudio = new NumbersAudio();
