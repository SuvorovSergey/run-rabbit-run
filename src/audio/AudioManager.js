import { AUDIO_CONFIG } from './AudioConfig.js';
import { AmbienceManager } from './AmbienceManager.js';
import { SoundEffectsManager } from './SoundEffectsManager.js';
import { CuckooManager } from './CuckooManager.js';

export class AudioManager {
    constructor() {
        this.masterVolume = AUDIO_CONFIG.master.volume;
        this.fadeDuration = AUDIO_CONFIG.master.fadeDuration;
        
        this.ambience = new AmbienceManager();
        this.effects = new SoundEffectsManager();
        this.cuckoo = new CuckooManager();
        
        this.paused = false;
        this.muted = false;
    }

    start() {
        this.ambience.start();
    }

    playSlam() {
        if (this.paused || this.muted) return;
        this.effects.playSlam(this.masterVolume);
    }

    playCollect() {
        if (this.paused || this.muted) return;
        this.effects.playCollect(this.masterVolume);
    }

    setAmbienceBlend(blend) {
        this.ambience.setBlend(blend);
    }

    fadeOut() {
        this.ambience.fadeOut();
        this.cuckoo.setEnabled(false);
    }

    setPaused(paused) {
        this.paused = Boolean(paused);

        if (this.paused) {
            this.ambience.pauseAll();
            this.effects.pauseAll();
            this.cuckoo.pause();
        } else {
            if (!this.muted) {
                this.ambience.resumeAll();
                this.cuckoo.resume();
            }
        }
    }

    toggleMute() {
        this.setMuted(!this.muted);
    }

    setMuted(muted) {
        this.muted = Boolean(muted);

        if (this.muted) {
            this.ambience.pauseAll();
            this.effects.pauseAll();
            this.cuckoo.pause();
        } else {
            if (!this.paused) {
                this.ambience.resumeAll();
                this.cuckoo.resume();
            }
        }
    }

    setCuckooEnabled(enabled) {
        this.cuckoo.setEnabled(enabled);
    }

    update(deltaTime) {
        if (this.paused || this.muted) {
            return;
        }

        this.effects.update(deltaTime);
        this.ambience.update(deltaTime, this.masterVolume, this.fadeDuration);
        this.cuckoo.update(deltaTime, this.masterVolume);
    }

}
