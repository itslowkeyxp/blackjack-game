
class SoundService {
  private sounds: Record<string, HTMLAudioElement> = {};
  private isMuted: boolean = false;

  constructor() {
    // Using standard, reliable audio URLs for game effects
    this.sounds = {
      deal: new Audio('https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3'), // Card flick
      chip: new Audio('https://assets.mixkit.co/active_storage/sfx/1070/1070-preview.mp3'), // Chip clink
      win: new Audio('https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3'),  // Success
      loss: new Audio('https://assets.mixkit.co/active_storage/sfx/2006/2006-preview.mp3'), // Fail
      push: new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'), // Neutral click
    };

    // Preload and adjust volumes
    Object.values(this.sounds).forEach(audio => {
      audio.load();
      audio.volume = 0.4;
    });
    
    this.sounds.win.volume = 0.3;
    this.sounds.loss.volume = 0.3;
    this.sounds.deal.playbackRate = 1.5; // Make deal sound faster/crispier
  }

  setMute(mute: boolean) {
    this.isMuted = mute;
  }

  play(soundName: keyof typeof this.sounds) {
    if (this.isMuted) return;
    
    const sound = this.sounds[soundName];
    if (sound) {
      // Clone node to allow overlapping sounds (important for fast betting/dealing)
      const clone = sound.cloneNode() as HTMLAudioElement;
      clone.volume = sound.volume;
      clone.play().catch(() => {
        // Handle browsers blocking auto-play before interaction
      });
    }
  }
}

export const soundService = new SoundService();
