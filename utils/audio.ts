
// Audio Utility using Web Audio API (Synthesizer)
// No external files required.

class SynthAudioController {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    // Initialize on first interaction usually, but we setup context structure here
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
    } catch (e) {
      console.warn("Web Audio API not supported");
    }

    // Load mute preference
    if (typeof localStorage !== 'undefined') {
        this.isMuted = localStorage.getItem('slot_is_muted') === 'true';
    }
  }

  private getContext(): AudioContext | null {
    if (!this.ctx) return null;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Public method to toggle mute
  public toggleMute(): boolean {
      this.isMuted = !this.isMuted;
      if (typeof localStorage !== 'undefined') {
          localStorage.setItem('slot_is_muted', String(this.isMuted));
      }
      
      // If unmuting, ensure context is running
      if (!this.isMuted) {
          this.getContext();
      }
      
      return this.isMuted;
  }

  public getMuted(): boolean {
      return this.isMuted;
  }

  // Helper to create an oscillator sound
  private playTone(freq: number, type: OscillatorType, duration: number, startTime: number = 0, vol: number = 0.1) {
    const ctx = this.getContext();
    if (!ctx || this.isMuted) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
    
    gain.gain.setValueAtTime(vol, ctx.currentTime + startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime + startTime);
    osc.stop(ctx.currentTime + startTime + duration);
  }

  public playClick() {
    this.playTone(800, 'square', 0.05, 0, 0.05);
  }

  public playSpinStart() {
    const ctx = this.getContext();
    if (!ctx || this.isMuted) return;
    
    // A rising sound
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.3);
    
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  }

  public playReelStop() {
    this.playTone(150, 'sawtooth', 0.15, 0, 0.15);
  }

  public playWin(amount: 'small' | 'big') {
    if (amount === 'small') {
        this.playTone(523.25, 'sine', 0.1, 0); // C5
        this.playTone(659.25, 'sine', 0.1, 0.1); // E5
        this.playTone(783.99, 'sine', 0.4, 0.2); // G5
    } else {
        [0, 0.1, 0.2, 0.3, 0.4, 0.6].forEach((t, i) => {
            const freq = [523.25, 659.25, 783.99, 1046.50, 783.99, 1046.50][i];
            this.playTone(freq, 'square', 0.2, t, 0.1);
        });
    }
  }

  public playGambleWin() {
    this.playTone(1200, 'sine', 0.1, 0, 0.1);
    this.playTone(1800, 'sine', 0.4, 0.1, 0.1);
  }

  public playGambleLose() {
    this.playTone(150, 'sawtooth', 0.3, 0, 0.2);
    this.playTone(100, 'sawtooth', 0.4, 0.1, 0.2);
  }
}

export const SoundManager = new SynthAudioController();
