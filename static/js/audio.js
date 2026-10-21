/**
 * SubAlert - Web Audio API Sound Synthesizer
 * Generates custom alarm and notification sounds in real-time without external audio files.
 */
class SoundEngine {
    constructor() {
        this.ctx = null;
        this.masterVolume = 0.8;
        this.activeAlarmLoop = null;
        this.isPlaying = false;
    }

    initContext() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    setVolume(val) {
        this.masterVolume = Math.max(0, Math.min(1, parseFloat(val) || 0.8));
    }

    // Play a single shot or preview of any sound
    play(soundType, volume = this.masterVolume) {
        this.initContext();
        const now = this.ctx.currentTime;
        const gainNode = this.ctx.createGain();
        gainNode.gain.setValueAtTime(volume * 0.4, now);
        gainNode.connect(this.ctx.destination);

        switch (soundType) {
            case 'chime_zen':
                this._playZenChime(now, gainNode);
                break;
            case 'radar_alert':
                this._playRadarAlert(now, gainNode);
                break;
            case 'classic_beep':
                this._playClassicBeep(now, gainNode);
                break;
            case 'ascending_melody':
                this._playAscendingMelody(now, gainNode);
                break;
            case 'cyber_pulse':
            default:
                this._playCyberPulse(now, gainNode);
                break;
        }
    }

    // Continuous Alarm loop until stopped
    startAlarm(soundType, volume = this.masterVolume) {
        this.stopAlarm();
        this.isPlaying = true;
        this.play(soundType, volume);

        // Interval depends on sound type
        const intervalMs = soundType === 'radar_alert' ? 1200 :
                           soundType === 'classic_beep' ? 900 :
                           soundType === 'chime_zen' ? 2200 : 1500;

        this.activeAlarmLoop = setInterval(() => {
            if (this.isPlaying) {
                this.play(soundType, volume);
            }
        }, intervalMs);
    }

    stopAlarm() {
        this.isPlaying = false;
        if (this.activeAlarmLoop) {
            clearInterval(this.activeAlarmLoop);
            this.activeAlarmLoop = null;
        }
    }

    // Sound Synthesizers:
    _playCyberPulse(now, dest) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.35);

        gain.gain.setValueAtTime(1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);

        osc.connect(gain);
        gain.connect(dest);
        osc.start(now);
        osc.stop(now + 0.45);

        // Secondary harmonic
        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(660, now + 0.1);
        osc2.frequency.exponentialRampToValueAtTime(1320, now + 0.25);

        gain2.gain.setValueAtTime(0.7, now + 0.1);
        gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.45);

        osc2.connect(gain2);
        gain2.connect(dest);
        osc2.start(now + 0.1);
        osc2.stop(now + 0.45);
    }

    _playRadarAlert(now, dest) {
        [0, 0.25, 0.5].forEach((offset, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            const freq = 650 + idx * 250;
            osc.frequency.setValueAtTime(freq, now + offset);
            osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + offset + 0.18);

            gain.gain.setValueAtTime(0.8, now + offset);
            gain.gain.exponentialRampToValueAtTime(0.01, now + offset + 0.2);

            osc.connect(gain);
            gain.connect(dest);
            osc.start(now + offset);
            osc.stop(now + offset + 0.2);
        });
    }

    _playClassicBeep(now, dest) {
        [0, 0.18].forEach(offset => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(987.77, now + offset); // B5

            gain.gain.setValueAtTime(0.5, now + offset);
            gain.gain.exponentialRampToValueAtTime(0.01, now + offset + 0.12);

            osc.connect(gain);
            gain.connect(dest);
            osc.start(now + offset);
            osc.stop(now + offset + 0.13);
        });
    }

    _playZenChime(now, dest) {
        const freqs = [528, 792, 1056]; // Healing & harmonic triad
        freqs.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now);

            gain.gain.setValueAtTime(0.6 / (idx + 1), now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

            osc.connect(gain);
            gain.connect(dest);
            osc.start(now);
            osc.stop(now + 1.8);
        });
    }

    _playAscendingMelody(now, dest) {
        const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
        notes.forEach((freq, idx) => {
            const time = now + idx * 0.12;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, time);

            gain.gain.setValueAtTime(0.7, time);
            gain.gain.exponentialRampToValueAtTime(0.01, time + 0.25);

            osc.connect(gain);
            gain.connect(dest);
            osc.start(time);
            osc.stop(time + 0.26);
        });
    }
}

// Global instance
window.soundEngine = new SoundEngine();
