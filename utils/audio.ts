// Audio Utility using HTML5 Audio for custom sound files
// Place your audio files in 'public/assets/sounds/'

const SOUND_FILES = {
  click: '/assets/sounds/click.mp3',
  spin: '/assets/sounds/spin.mp3',
  reelStop: '/assets/sounds/land.mp3',
  winSmall: '/assets/sounds/win_small.mp3',
  winBig: '/assets/sounds/win_big.mp3',
  gambleWin: '/assets/sounds/gamble_win.mp3',
  gambleLose: '/assets/sounds/gamble_lose.mp3'
};

class AudioController {
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private isMuted: boolean = false;

  constructor() {
    // Preload sounds
    if (typeof window !== 'undefined') {
        Object.entries(SOUND_FILES).forEach(([key, path]) => {
            const audio = new Audio(path);
            audio.volume = 0.4;
            this.sounds.set(key, audio);
        });
    }
  }

  private play(key: string, volume: number = 0.4) {
    if (this.isMuted) return;
    const sound = this.sounds.get(key);
    if (sound) {
        // Clone node allows multiple instances of the same sound to overlap (e.g., rapid clicks)
        const clone = sound.cloneNode() as HTMLAudioElement;
        clone.volume = volume;
        clone.play().catch(e => {
            // Browsers often block auto-play until user interaction
            // This ignores the error in the console if it happens
        });
    }
  }

  public playClick() {
    this.play('click', 0.3);
  }

  public playSpinStart() {
    this.play('spin', 0.5);
  }

  public playWin(amount: 'small' | 'big') {
    if (amount === 'big') {
        this.play('winBig', 0.6);
    } else {
        this.play('winSmall', 0.5);
    }
  }

  public playReelStop() {
    this.play('reelStop', 0.4);
  }

  public playGambleWin() {
    this.play('gambleWin', 0.5);
  }

  public playGambleLose() {
    this.play('gambleLose', 0.5);
  }
}

export const SoundManager = new AudioController();