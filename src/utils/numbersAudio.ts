import { ARABIC_NUMBERS, DIGIT_TO_WORD } from '../data/numbersData';
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

  public playAudioUrl(url: string): Promise<void> {
    unlockAudioSystem();
    this.stopCurrentAudio();

    if (!url) {
      logAudioError('NumbersAudio', 'MissingUrl', 'No audio URL provided for number');
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
        logAudioError('NumbersAudio', 'AudioPlaybackError', `${reason}: ${url}`, err);
        resolve();
      };

      let audio: HTMLAudioElement;
      try {
        audio = new Audio(url);
        audio.setAttribute('playsinline', 'true');
        audio.setAttribute('webkit-playsinline', 'true');
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
      if (item && item.audio) {
        return this.playAudioUrl(item.audio);
      }
      logAudioError('NumbersAudio', 'MissingNumberAudio', `No MP3 found for number: ${numOrWordOrItem}`);
      return Promise.resolve();
    }

    if (typeof numOrWordOrItem === 'string') {
      if (numOrWordOrItem.startsWith('/')) {
        return this.playAudioUrl(numOrWordOrItem);
      }
      const item = ARABIC_NUMBERS.find(n => n.word === numOrWordOrItem || n.digit === numOrWordOrItem || n.englishDigit === Number(numOrWordOrItem));
      if (item && item.audio) {
        return this.playAudioUrl(item.audio);
      }
      logAudioError('NumbersAudio', 'MissingNumberAudio', `No MP3 found for string: ${numOrWordOrItem}`);
      return Promise.resolve();
    }

    if (numOrWordOrItem && typeof numOrWordOrItem === 'object') {
      if (numOrWordOrItem.audio) {
        return this.playAudioUrl(numOrWordOrItem.audio);
      }
    }

    logAudioError('NumbersAudio', 'MissingNumberAudio', 'Invalid number item or missing MP3');
    return Promise.resolve();
  }
}

export const numbersAudio = new NumbersAudio();

