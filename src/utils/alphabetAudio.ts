import { AlphabetItem } from '../types';
import { ARABIC_ALPHABET } from '../data/alphabetData';
import { logAudioError, unlockAudioSystem } from './audioCore';

class AlphabetAudio {
  private currentAudio: HTMLAudioElement | null = null;

  /**
   * Stop any currently playing educational audio.
   * Does NOT affect background music or general SFX.
   */
  public stopCurrentAudio(): void {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch {
        // Ignore audio pause errors
      }
      this.currentAudio = null;
    }
  }

  /**
   * Play an MP3 file given its web URL (e.g. '/audio/alphabet/letters/alif.mp3').
   * Prevents overlap with previous educational audio.
   * Exclusively plays local MP3 files and logs warnings if missing or blocked.
   */
  public playAudioUrl(url: string): Promise<void> {
    unlockAudioSystem();
    this.stopCurrentAudio();

    if (!url) {
      logAudioError('AlphabetAudio', 'MissingUrl', 'No audio URL provided for playback');
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
        logAudioError('AlphabetAudio', 'AudioPlaybackError', `${reason}: ${url}`, err);
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
          // Successfully started playing MP3
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

  /**
   * Play the letter name MP3 (e.g., أَلِف -> /audio/alphabet/letters/alif.mp3).
   */
  public playLetter(itemOrId: AlphabetItem | string): Promise<void> {
    const item = typeof itemOrId === 'string'
      ? ARABIC_ALPHABET.find(a => a.id === itemOrId || a.letter === itemOrId || a.name === itemOrId)
      : itemOrId;

    if (item && item.letterAudio) {
      return this.playAudioUrl(item.letterAudio);
    }
    logAudioError('AlphabetAudio', 'MissingLetterAudio', `No MP3 found for letter: ${typeof itemOrId === 'string' ? itemOrId : itemOrId?.name}`);
    return Promise.resolve();
  }

  /**
   * Play Fatha sound (e.g., أَ -> /audio/alphabet/fatha/alif_fatha.mp3).
   */
  public playFatha(itemOrId: AlphabetItem | string): Promise<void> {
    const item = typeof itemOrId === 'string'
      ? ARABIC_ALPHABET.find(a => a.id === itemOrId || a.letter === itemOrId || a.name === itemOrId)
      : itemOrId;

    if (item && item.fatha && item.fatha.audio) {
      return this.playAudioUrl(item.fatha.audio);
    }
    logAudioError('AlphabetAudio', 'MissingFathaAudio', `No MP3 found for Fatha: ${typeof itemOrId === 'string' ? itemOrId : itemOrId?.letter}`);
    return Promise.resolve();
  }

  /**
   * Play Kasra sound (e.g., إِ -> /audio/alphabet/kasra/alif_kasra.mp3).
   */
  public playKasra(itemOrId: AlphabetItem | string): Promise<void> {
    const item = typeof itemOrId === 'string'
      ? ARABIC_ALPHABET.find(a => a.id === itemOrId || a.letter === itemOrId || a.name === itemOrId)
      : itemOrId;

    if (item && item.kasra && item.kasra.audio) {
      return this.playAudioUrl(item.kasra.audio);
    }
    logAudioError('AlphabetAudio', 'MissingKasraAudio', `No MP3 found for Kasra: ${typeof itemOrId === 'string' ? itemOrId : itemOrId?.letter}`);
    return Promise.resolve();
  }

  /**
   * Play Damma sound (e.g., أُ -> /audio/alphabet/damma/alif_damma.mp3).
   */
  public playDamma(itemOrId: AlphabetItem | string): Promise<void> {
    const item = typeof itemOrId === 'string'
      ? ARABIC_ALPHABET.find(a => a.id === itemOrId || a.letter === itemOrId || a.name === itemOrId)
      : itemOrId;

    if (item && item.damma && item.damma.audio) {
      return this.playAudioUrl(item.damma.audio);
    }
    logAudioError('AlphabetAudio', 'MissingDammaAudio', `No MP3 found for Damma: ${typeof itemOrId === 'string' ? itemOrId : itemOrId?.letter}`);
    return Promise.resolve();
  }

  /**
   * Play word MP3 (e.g. أَسَد -> /audio/alphabet/words/01_asad.mp3).
   */
  public playWord(itemOrUrlOrText: AlphabetItem | string): Promise<void> {
    if (typeof itemOrUrlOrText === 'string') {
      if (itemOrUrlOrText.startsWith('/')) {
        return this.playAudioUrl(itemOrUrlOrText);
      }
      const item = ARABIC_ALPHABET.find(a =>
        a.exampleWord === itemOrUrlOrText ||
        a.fatha?.word === itemOrUrlOrText ||
        a.damma?.word === itemOrUrlOrText ||
        a.kasra?.word === itemOrUrlOrText ||
        a.id === itemOrUrlOrText ||
        a.letter === itemOrUrlOrText ||
        a.name === itemOrUrlOrText
      );
      if (item) {
        if (item.exampleWord === itemOrUrlOrText && item.wordAudio) {
          return this.playAudioUrl(item.wordAudio);
        }
        if (item.fatha?.word === itemOrUrlOrText && item.fatha.wordAudio) {
          return this.playAudioUrl(item.fatha.wordAudio);
        }
        if (item.damma?.word === itemOrUrlOrText && item.damma.wordAudio) {
          return this.playAudioUrl(item.damma.wordAudio);
        }
        if (item.kasra?.word === itemOrUrlOrText && item.kasra.wordAudio) {
          return this.playAudioUrl(item.kasra.wordAudio);
        }
        if (item.wordAudio) {
          return this.playAudioUrl(item.wordAudio);
        }
      }
      logAudioError('AlphabetAudio', 'MissingWordAudio', `No MP3 found for word: ${itemOrUrlOrText}`);
      return Promise.resolve();
    } else if (itemOrUrlOrText && itemOrUrlOrText.wordAudio) {
      return this.playAudioUrl(itemOrUrlOrText.wordAudio);
    }
    logAudioError('AlphabetAudio', 'MissingWordAudio', 'Invalid item or missing wordAudio MP3');
    return Promise.resolve();
  }
}

export const alphabetAudio = new AlphabetAudio();

