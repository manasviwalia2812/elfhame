import typewriterMp3 from './typewriter.mp3';
import palaceMp3 from './kingdom_dance_tangled.mp3';
import underseaMp3 from './Danny_Elfman_Moon_Dance.mp3';

class ElfhameSynthesizer {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.droneGain = null;
    this.chimeGain = null;
    this.isPlaying = false;
    this.oscillators = [];
    this.harmonyInterval = null;
    this.currentChords = [
      [130.81, 155.56, 196.00], // C3, Eb3, G3 (C Minor)
      [146.83, 174.61, 220.00], // D3, F3, A3 (D Minor/Dim)
      [116.54, 138.59, 174.61], // Bb2, Db3, F3 (Bb Minor)
      [103.83, 130.81, 155.56], // Ab2, C3, Eb3 (Ab Major)
    ];
    this.currentChordIndex = 0;
    this.currentScene = 'default';
    this.palaceAudio = null;
    this.palaceGain = null;
    this.underseaAudio = null;
    this.underseaGain = null;
  }

  init() {
    if (this.ctx) return;
    
    // Create Audio Context
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContextClass();
    
    // Create Master Gain node
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);
    
    // Create Sub-Gain nodes
    this.droneGain = this.ctx.createGain();
    this.droneGain.gain.setValueAtTime(0.0, this.ctx.currentTime);
    this.droneGain.connect(this.masterGain);
    
    this.chimeGain = this.ctx.createGain();
    this.chimeGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
    this.chimeGain.connect(this.masterGain);

    // Setup Reverb / Delay effect node for chimes
    this.delayNode = this.ctx.createDelay(1.0);
    this.delayNode.delayTime.setValueAtTime(0.3, this.ctx.currentTime);
    
    this.delayFeedback = this.ctx.createGain();
    this.delayFeedback.gain.setValueAtTime(0.4, this.ctx.currentTime);
    
    this.chimeGain.connect(this.delayNode);
    this.delayNode.connect(this.delayFeedback);
    this.delayFeedback.connect(this.delayNode);
    this.delayFeedback.connect(this.masterGain); // Send delay output to master
  }

  start() {
    this.init();
    if (this.isPlaying) return;
    
    // Resume context if suspended
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    
    this.isPlaying = true;
    
    if (this.currentScene === 'palace') {
      this.playPalaceMusic();
    } else if (this.currentScene === 'undersea') {
      this.playUnderseaMusic();
    } else {
      // Fade in Master
      this.droneGain.gain.linearRampToValueAtTime(0.25, this.ctx.currentTime + 3.0);
      
      // Start Ambient Drone oscillators
      this.startDrone();
      
      // Cycle harmonies every 6 seconds
      this.harmonyInterval = setInterval(() => {
        this.currentChordIndex = (this.currentChordIndex + 1) % this.currentChords.length;
        this.updateDroneHarmony();
        // Occasionally trigger a soft random background chime
        if (Math.random() > 0.4) {
          this.playRandomAmbientChime();
        }
      }, 6000);
    }
  }

  stop() {
    if (!this.isPlaying) return;
    
    this.isPlaying = false;
    this.stopTypewriterLoop();
    
    if (this.currentScene === 'palace') {
      this.stopPalaceMusic();
    } else if (this.currentScene === 'undersea') {
      this.stopUnderseaMusic();
    } else {
      // Fade out
      if (this.droneGain) {
        this.droneGain.gain.linearRampToValueAtTime(0.0, this.ctx.currentTime + 1.5);
      }
      
      setTimeout(() => {
        this.oscillators.forEach(osc => {
          try { osc.stop(); } catch(e) {}
        });
        this.oscillators = [];
        clearInterval(this.harmonyInterval);
      }, 1500);
    }
  }

  setScene(sceneName) {
    this.init();
    const prevScene = this.currentScene;
    if (prevScene === sceneName) return;
    
    this.currentScene = sceneName;
    
    // 1. Stop/Fade out whatever was playing
    if (prevScene === 'palace') {
      this.stopPalaceMusic();
    } else if (prevScene === 'undersea') {
      this.stopUnderseaMusic();
    } else {
      // Fade out ambient drone
      clearInterval(this.harmonyInterval);
      if (this.droneGain && this.ctx) {
        this.droneGain.gain.cancelScheduledValues(this.ctx.currentTime);
        this.droneGain.gain.linearRampToValueAtTime(0.0, this.ctx.currentTime + 1.0);
      }
      setTimeout(() => {
        if (this.currentScene !== 'default') {
          this.oscillators.forEach(osc => {
            try { osc.stop(); } catch(e) {}
          });
          this.oscillators = [];
        }
      }, 1000);
    }
    
    // 2. Play/Fade in the new scene's sound
    if (sceneName === 'palace') {
      this.playPalaceMusic();
    } else if (sceneName === 'undersea') {
      this.playUnderseaMusic();
    } else {
      // Transition back to default
      if (this.isPlaying) {
        if (this.droneGain && this.ctx) {
          this.droneGain.gain.cancelScheduledValues(this.ctx.currentTime);
          this.droneGain.gain.linearRampToValueAtTime(0.25, this.ctx.currentTime + 1.5);
        }
        this.startDrone();
        this.harmonyInterval = setInterval(() => {
          this.currentChordIndex = (this.currentChordIndex + 1) % this.currentChords.length;
          this.updateDroneHarmony();
          if (Math.random() > 0.4) {
            this.playRandomAmbientChime();
          }
        }, 6000);
      }
    }
  }

  playPalaceMusic() {
    if (!this.ctx) return;
    
    if (!this.palaceAudio) {
      this.palaceAudio = new Audio(palaceMp3);
      this.palaceAudio.loop = true;
      
      try {
        const source = this.ctx.createMediaElementSource(this.palaceAudio);
        this.palaceGain = this.ctx.createGain();
        this.palaceGain.gain.setValueAtTime(0, this.ctx.currentTime);
        source.connect(this.palaceGain);
        this.palaceGain.connect(this.masterGain);
      } catch (e) {
        console.error("Palace audio binding error:", e);
        this.palaceAudio.volume = 0.5;
      }
    }
    
    if (this.isPlaying) {
      this.palaceAudio.currentTime = 0;
      this.palaceAudio.play().catch(e => console.error("Palace audio play error:", e));
      if (this.palaceGain) {
        this.palaceGain.gain.cancelScheduledValues(this.ctx.currentTime);
        this.palaceGain.gain.setValueAtTime(0, this.ctx.currentTime);
        this.palaceGain.gain.linearRampToValueAtTime(0.4, this.ctx.currentTime + 1.5);
      }
    }
  }

  stopPalaceMusic() {
    if (this.palaceAudio) {
      if (this.palaceGain && this.ctx) {
        this.palaceGain.gain.cancelScheduledValues(this.ctx.currentTime);
        this.palaceGain.gain.linearRampToValueAtTime(0.0, this.ctx.currentTime + 1.0);
        setTimeout(() => {
          if (this.currentScene !== 'palace') {
            this.palaceAudio.pause();
            this.palaceAudio.currentTime = 0;
          }
        }, 1000);
      } else {
        this.palaceAudio.pause();
        this.palaceAudio.currentTime = 0;
      }
    }
  }

  playUnderseaMusic() {
    if (!this.ctx) return;
    
    if (!this.underseaAudio) {
      this.underseaAudio = new Audio(underseaMp3);
      this.underseaAudio.loop = true;
      
      try {
        const source = this.ctx.createMediaElementSource(this.underseaAudio);
        this.underseaGain = this.ctx.createGain();
        this.underseaGain.gain.setValueAtTime(0, this.ctx.currentTime);
        source.connect(this.underseaGain);
        this.underseaGain.connect(this.masterGain);
      } catch (e) {
        console.error("Undersea audio binding error:", e);
        this.underseaAudio.volume = 0.5;
      }
    }
    
    if (this.isPlaying) {
      this.underseaAudio.currentTime = 0;
      this.underseaAudio.play().catch(e => console.error("Undersea audio play error:", e));
      if (this.underseaGain) {
        this.underseaGain.gain.cancelScheduledValues(this.ctx.currentTime);
        this.underseaGain.gain.setValueAtTime(0, this.ctx.currentTime);
        this.underseaGain.gain.linearRampToValueAtTime(0.4, this.ctx.currentTime + 1.5);
      }
    }
  }

  stopUnderseaMusic() {
    if (this.underseaAudio) {
      if (this.underseaGain && this.ctx) {
        this.underseaGain.gain.cancelScheduledValues(this.ctx.currentTime);
        this.underseaGain.gain.linearRampToValueAtTime(0.0, this.ctx.currentTime + 1.0);
        setTimeout(() => {
          if (this.currentScene !== 'undersea') {
            this.underseaAudio.pause();
            this.underseaAudio.currentTime = 0;
          }
        }, 1000);
      } else {
        this.underseaAudio.pause();
        this.underseaAudio.currentTime = 0;
      }
    }
  }

  startDrone() {
    // Generate low fundamental and fifths
    const notes = this.currentChords[this.currentChordIndex];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const oscGain = this.ctx.createGain();
      
      osc.type = idx === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(250 + idx * 50, this.ctx.currentTime);
      
      oscGain.gain.setValueAtTime(idx === 0 ? 0.4 : 0.2, this.ctx.currentTime);
      
      osc.connect(filter);
      filter.connect(oscGain);
      oscGain.connect(this.droneGain);
      
      osc.start();
      this.oscillators.push({ osc, oscGain, baseFreq: freq });
    });
  }

  updateDroneHarmony() {
    if (!this.ctx || this.oscillators.length === 0) return;
    const newNotes = this.currentChords[this.currentChordIndex];
    
    this.oscillators.forEach((oscObj, idx) => {
      const targetFreq = newNotes[idx] || newNotes[0] * 1.5;
      oscObj.osc.frequency.exponentialRampToValueAtTime(targetFreq, this.ctx.currentTime + 4.0);
    });
  }

  playRandomAmbientChime() {
    const scale = [523.25, 587.33, 622.25, 698.46, 783.99, 880.00, 932.33, 1046.50]; // C minor pentatonic scale (high notes)
    const randomFreq = scale[Math.floor(Math.random() * scale.length)];
    this.triggerPhysicalChime(randomFreq, 0.1, 1.2);
  }

  playMarkerHover() {
    if (!this.ctx || !this.isPlaying) return;
    const scale = [587.33, 783.99, 880.00, 1046.50, 1174.66]; // D, G, A, C, D
    const freq = scale[Math.floor(Math.random() * scale.length)];
    this.triggerPhysicalChime(freq, 0.05, 0.4);
  }

  playMarkerClick() {
    if (!this.ctx || !this.isPlaying) return;
    const notes = [440, 554.37, 659.25, 880]; // A Major/Minor arpeggio
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        if (this.isPlaying) {
          this.triggerPhysicalChime(freq * 1.5, 0.15, 0.8);
        }
      }, idx * 80);
    });
  }

  triggerPhysicalChime(frequency, gainVal, decayTime) {
    if (!this.ctx || this.ctx.state === 'suspended') return;
    
    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);
    
    // Add metal ring (inharmonious frequency)
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(frequency * 1.618, this.ctx.currentTime);
    
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(frequency, this.ctx.currentTime);
    filter.Q.setValueAtTime(5, this.ctx.currentTime);
    
    gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(gainVal, this.ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + decayTime);
    
    osc.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.chimeGain);
    
    osc.start();
    osc2.start();
    
    osc.stop(this.ctx.currentTime + decayTime + 0.1);
    osc2.stop(this.ctx.currentTime + decayTime + 0.1);
  }

  playTypingSound() {
    if (!this.ctx || this.ctx.state === 'suspended' || !this.isPlaying) return;
    
    // Very quiet, tiny high frequency pluck for typewriter effect
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    // Randomize slightly for a more organic feel
    const baseFreq = 800 + Math.random() * 400;
    osc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
    
    gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.008, this.ctx.currentTime + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.04);
  }

  playTypewriterLoop() {
    if (!this.ctx || this.ctx.state === 'suspended' || !this.isPlaying) return;
    
    if (this.typewriterAudio) {
      this.typewriterAudio.currentTime = 0;
      this.typewriterAudio.play().catch(e => console.error(e));
      return;
    }

    this.typewriterAudio = new Audio(typewriterMp3);
    this.typewriterAudio.loop = true;
    
    try {
      const source = this.ctx.createMediaElementSource(this.typewriterAudio);
      source.connect(this.masterGain);
    } catch (e) {
      this.typewriterAudio.volume = 0.35;
    }
    
    this.typewriterAudio.play().catch(e => console.error(e));
  }

  stopTypewriterLoop() {
    if (this.typewriterAudio) {
      this.typewriterAudio.pause();
      this.typewriterAudio.currentTime = 0;
    }
  }

  setVolume(volume) {
    if (!this.masterGain) return;
    this.masterGain.gain.setValueAtTime(volume, this.ctx.currentTime);
  }
}

export const audioSynth = new ElfhameSynthesizer();
export default audioSynth;
