/**
 * Kerala Private Bus - Audio Engine
 * Handles authentic native audio effects, synthesized air horns, bells,
 * air brakes, engine rumble, monsoonal rain ambience, and audio visualizer.
 */

class KeralaBusAudioEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.masterGain = null;
    this.rainGain = null;
    this.rainSource = null;
    this.isRaining = false;
    this.analyser = null;
    this.dataArray = null;

    // Preloaded Audio Elements
    this.hornAudio = new Audio('./assets/Bus_Horn.mp3');
    this.bellStartAudio = new Audio('./assets/start.mp3'); // Double bell (Ting-Ting)
    this.bellStopAudio = new Audio('./assets/stop.mp3');   // Single bell (Ting)

    this.hornAudio.preload = 'auto';
    this.bellStartAudio.preload = 'auto';
    this.bellStopAudio.preload = 'auto';

    // Bell counter state: alternating or explicit
    this.bellState = 0; // 0 = ready to stop, 1 = ready to start
  }

  initContext() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.85, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 64;
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      this.masterGain.connect(this.analyser);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Device Haptics Vibration
  haptic(pattern = [50]) {
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {
        // Ignore if restricted
      }
    }
  }

  // Authentic Conductor Bell
  playConductorBell(type = 'toggle') {
    this.initContext();
    let audioToPlay;

    if (type === 'start' || (type === 'toggle' && this.bellState === 1)) {
      audioToPlay = this.bellStartAudio;
      this.bellState = 0;
      this.haptic([40, 60, 40]);
    } else {
      audioToPlay = this.bellStopAudio;
      this.bellState = 1;
      this.haptic([60]);
    }

    try {
      audioToPlay.currentTime = 0;
      audioToPlay.volume = this.isMuted ? 0 : 0.95;
      const playPromise = audioToPlay.play();
      if (playPromise) {
        playPromise.catch(() => {
          // Synthesized bell fallback
          this.synthesizeBell(type === 'start' ? 2 : 1);
        });
      }
    } catch (e) {
      this.synthesizeBell(type === 'start' ? 2 : 1);
    }

    return this.bellState;
  }

  // Synthesized brass conductor bell fallback / enhancer
  synthesizeBell(tings = 1) {
    if (this.isMuted) return;
    this.initContext();

    for (let i = 0; i < tings; i++) {
      const startTime = this.ctx.currentTime + (i * 0.22);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(2850, startTime);
      osc.frequency.exponentialRampToValueAtTime(1400, startTime + 0.35);

      gain.gain.setValueAtTime(0.4, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(startTime);
      osc.stop(startTime + 0.36);
    }
  }

  // Authentic Private Bus Air Horn (Primary)
  playAirHorn() {
    this.initContext();
    this.haptic([120, 60, 160]);

    try {
      this.hornAudio.currentTime = 0;
      this.hornAudio.volume = this.isMuted ? 0 : 1.0;
      const playPromise = this.hornAudio.play();
      if (playPromise) {
        playPromise.catch(() => {
          this.playMusicalAirHornTune();
        });
      }
    } catch (e) {
      this.playMusicalAirHornTune();
    }
  }

  // Musical 3-Chamber Pneumatic Kerala Bus Horn Chime (Synthesized)
  playMusicalAirHornTune() {
    if (this.isMuted) return;
    this.initContext();
    this.haptic([80, 50, 80, 50, 180]);

    // Legendary Kerala 3-tone blast chords
    const notes = [
      { f: [349.23, 440.00, 523.25], t: 0.0, d: 0.16 }, // F chord
      { f: [392.00, 493.88, 587.33], t: 0.18, d: 0.16 }, // G chord
      { f: [440.00, 554.37, 659.25], t: 0.36, d: 0.35 }  // A Major blast!
    ];

    notes.forEach(chord => {
      chord.f.forEach(freq => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + chord.t);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(freq * 1.5, this.ctx.currentTime + chord.t);
        filter.Q.setValueAtTime(4, this.ctx.currentTime + chord.t);

        const startTime = this.ctx.currentTime + chord.t;
        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.linearRampToValueAtTime(0.2, startTime + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + chord.d);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc.start(startTime);
        osc.stop(startTime + chord.d + 0.05);
      });
    });

    // Add pneumatic hiss at the end
    setTimeout(() => this.playAirBrakeHiss(0.15), 650);
  }

  // Kerala Bus Reverse Gear Melody Tune
  playReverseMelodyHorn() {
    if (this.isMuted) return;
    this.initContext();
    this.haptic([60, 40, 60, 40, 60, 40, 100]);

    // Classic 8-bit melody horn
    const tune = [
      { f: 523.25, d: 0.12 }, // C5
      { f: 659.25, d: 0.12 }, // E5
      { f: 783.99, d: 0.12 }, // G5
      { f: 1046.50, d: 0.18 }, // C6
      { f: 783.99, d: 0.12 }, // G5
      { f: 1046.50, d: 0.28 } // C6
    ];

    let t = this.ctx.currentTime;
    tune.forEach(note => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, t);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + note.d);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + note.d + 0.02);

      t += note.d + 0.04;
    });
  }

  // Pneumatic Air Brake Exhaust Hiss ("Psssssshhht!")
  playAirBrakeHiss(duration = 0.35) {
    if (this.isMuted) return;
    this.initContext();
    this.haptic([80]);

    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(3200, this.ctx.currentTime);
    filter.Q.setValueAtTime(1.8, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    whiteNoise.start(now);
  }

  // Heavy Diesel Engine Throttle / Accelerator Rev
  playEngineRev() {
    if (this.isMuted) return;
    this.initContext();
    this.haptic([100, 50, 150]);

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const subOsc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(55, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.5);
    osc.frequency.exponentialRampToValueAtTime(65, now + 1.2);

    subOsc.type = 'triangle';
    subOsc.frequency.setValueAtTime(28, now);
    subOsc.frequency.exponentialRampToValueAtTime(70, now + 0.5);
    subOsc.frequency.exponentialRampToValueAtTime(32, now + 1.2);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(250, now);
    filter.frequency.exponentialRampToValueAtTime(800, now + 0.5);
    filter.frequency.exponentialRampToValueAtTime(280, now + 1.2);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    osc.connect(filter);
    subOsc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    subOsc.start(now);
    osc.stop(now + 1.25);
    subOsc.stop(now + 1.25);

    // Also trigger subtle air brake release after rev
    setTimeout(() => this.playAirBrakeHiss(0.25), 1100);
  }

  // Kerala Monsoon Rain Ambience on Windshield
  toggleRain(enable = null) {
    this.initContext();
    const targetState = enable !== null ? enable : !this.isRaining;

    if (targetState && !this.isRaining) {
      this.isRaining = true;
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Pinkish noise for lush rain
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
        b6 = white * 0.115926;
      }

      this.rainSource = this.ctx.createBufferSource();
      this.rainSource.buffer = buffer;
      this.rainSource.loop = true;

      const rainFilter = this.ctx.createBiquadFilter();
      rainFilter.type = 'lowpass';
      rainFilter.frequency.setValueAtTime(1400, this.ctx.currentTime);

      this.rainGain = this.ctx.createGain();
      this.rainGain.gain.setValueAtTime(0.01, this.ctx.currentTime);
      this.rainGain.gain.linearRampToValueAtTime(0.18, this.ctx.currentTime + 1.0);

      this.rainSource.connect(rainFilter);
      rainFilter.connect(this.rainGain);
      this.rainGain.connect(this.masterGain);

      this.rainSource.start();
    } else if (!targetState && this.isRaining) {
      this.isRaining = false;
      if (this.rainGain && this.rainSource) {
        this.rainGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
        setTimeout(() => {
          try {
            this.rainSource.stop();
            this.rainSource.disconnect();
          } catch (e) {}
        }, 550);
      }
    }

    return this.isRaining;
  }

  // Master Mute Toggle
  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.85, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  setVolume(vol) {
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, vol)), this.ctx.currentTime);
    }
  }

  // Get live visualizer frequency data for VU meter animations
  getVisualizerData() {
    if (!this.analyser || !this.dataArray) {
      // Generate dynamic pulsating values if audio context inactive
      return [40, 65, 80, 55, 90, 70, 45, 60];
    }
    this.analyser.getByteFrequencyData(this.dataArray);
    return this.dataArray;
  }
}

window.keralaBusAudio = new KeralaBusAudioEngine();
