// Shared Audio Core Engine for Cross-Platform Web & Mobile Chrome Compatibility

let sharedAudioCtx: AudioContext | null = null;
let sharedHtmlAudio: HTMLAudioElement | null = null;
let isAudioUnlocked = false;

// Standardized console error logger for audio diagnostics
export function logAudioError(sourceName: string, errorType: string, reason: string, extra?: any) {
  console.warn(
    `[AudioSystem Diagnostic] 🔊 Source: "${sourceName}" | ErrorType: ${errorType} | Cause: ${reason}`,
    extra || ''
  );
}

// Single Shared AudioContext getter across the entire app
export function getSharedAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;

  if (!sharedAudioCtx) {
    const AudioCtxClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

    if (AudioCtxClass) {
      try {
        sharedAudioCtx = new AudioCtxClass();
      } catch (err: any) {
        logAudioError(
          'AudioContext Creation',
          err?.name || 'InitializationError',
          err?.message || 'Failed to construct AudioContext'
        );
      }
    }
  }

  if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume().catch((err) => {
      logAudioError(
        'AudioContext Resume',
        err?.name || 'ResumeError',
        err?.message || 'AudioContext failed to resume'
      );
    });
  }

  return sharedAudioCtx;
}

// Single Shared HTMLAudioElement getter for reliable mobile MP3 playback
export function getSharedHTMLAudio(): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null;

  if (!sharedHtmlAudio) {
    try {
      sharedHtmlAudio = new Audio();
      sharedHtmlAudio.setAttribute('playsinline', 'true');
      sharedHtmlAudio.setAttribute('webkit-playsinline', 'true');
      sharedHtmlAudio.preload = 'auto';
    } catch (err: any) {
      logAudioError(
        'HTMLAudio Creation',
        err?.name || 'InitializationError',
        err?.message || 'Failed to construct HTMLAudioElement'
      );
    }
  }

  return sharedHtmlAudio;
}

// Universal User-Gesture Audio Unlocker for Mobile Chrome / iOS Safari
export function unlockAudioSystem(): boolean {
  const ctx = getSharedAudioContext();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch((err) => {
      logAudioError(
        'AudioContext Unlock',
        err?.name || 'UnlockError',
        err?.message || 'Failed to resume AudioContext during user gesture'
      );
    });
  }

  if (!isAudioUnlocked) {
    if (ctx) {
      // Play silent 1ms buffer to unlock audio hardware pipeline on Mobile Chrome & WebKit
      try {
        const silentBuffer = ctx.createBuffer(1, 1, 22050);
        const source = ctx.createBufferSource();
        source.buffer = silentBuffer;
        source.connect(ctx.destination);
        source.start(0);
      } catch (err: any) {
        logAudioError(
          'Silent Buffer Unlock',
          err?.name || 'BufferError',
          err?.message || 'Failed to play silent unlock buffer'
        );
      }
    }

    // Unlock HTMLAudioElement media pipeline for Mobile Web / iOS Safari
    const audio = getSharedHTMLAudio();
    if (audio) {
      try {
        const silentWav = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';
        audio.src = silentWav;
        audio.play().then(() => {
          isAudioUnlocked = true;
        }).catch((err) => {
          logAudioError(
            'HTMLAudio Unlock',
            err?.name || 'UnlockError',
            err?.message || 'HTMLAudioElement unlock attempt failed'
          );
        });
      } catch (err: any) {
        logAudioError(
          'HTMLAudio Exception',
          err?.name || 'Exception',
          err?.message || 'Failed to initialize HTMLAudioElement unlock'
        );
      }
    }
  }

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      window.speechSynthesis.getVoices();
    } catch (err: any) {
      logAudioError(
        'SpeechSynthesis Unlock',
        err?.name || 'SpeechUnlockError',
        err?.message || 'Failed to unlock speech synthesis engine'
      );
    }
  }

  return true;
}

// Global user interaction listener to unlock audio automatically on first touch/pointerdown/click
if (typeof window !== 'undefined') {
  const handleUserGesture = () => {
    unlockAudioSystem();
  };

  window.addEventListener('touchstart', handleUserGesture, { passive: true });
  window.addEventListener('pointerdown', handleUserGesture, { passive: true });
  window.addEventListener('click', handleUserGesture, { passive: true });
  window.addEventListener('keydown', handleUserGesture, { passive: true });
}

