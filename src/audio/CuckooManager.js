import { AudioLoader } from './AudioLoader.js';
import { AUDIO_CONFIG } from './AudioConfig.js';

export class CuckooManager {
    constructor() {
        this.audio = AudioLoader.createOneShotAudio(new URL(AUDIO_CONFIG.cuckoo.file, import.meta.url));
        this.enabled = false;
        this.timer = this.#randomBetween(AUDIO_CONFIG.cuckoo.minInterval, AUDIO_CONFIG.cuckoo.maxInterval);
        this.isPlaying = false;
        this.targetVolume = 0;
    }

    setEnabled(enabled) {
        this.enabled = Boolean(enabled);
        if (!this.enabled) {
            this.targetVolume = 0;
        }
    }

    update(deltaTime, masterVolume) {
        if (!this.enabled) {
            if (this.isPlaying) {
                this.targetVolume = 0;
            }
            return;
        }

        if (this.isPlaying) {
            const step = AUDIO_CONFIG.cuckoo.fadeInDuration <= 0 ? 1 : (deltaTime / AUDIO_CONFIG.cuckoo.fadeInDuration);
            this.audio.volume = this.#moveTowards(this.audio.volume, this.targetVolume, step);
            return;
        }

        this.timer -= deltaTime;
        if (this.timer <= 0) {
            this.#startPlayback(masterVolume);
        }
    }

    pause() {
        AudioLoader.safePause(this.audio);
    }

    resume() {
        if (this.isPlaying) {
            AudioLoader.safePlay(this.audio);
        }
    }

    #startPlayback(masterVolume) {
        this.audio.volume = 0;
        this.audio.currentTime = 0;
        this.targetVolume = this.#clamp(AUDIO_CONFIG.cuckoo.volume * masterVolume, 0, 1);
        this.isPlaying = true;

        const play = AudioLoader.safePlay(this.audio);
        if (play && typeof play.catch === 'function') {
            play.catch(() => {
                this.isPlaying = false;
                this.targetVolume = 0;
            });
        }

        this.audio.onended = () => {
            this.isPlaying = false;
            this.targetVolume = 0;
            this.timer = this.#randomBetween(AUDIO_CONFIG.cuckoo.minInterval, AUDIO_CONFIG.cuckoo.maxInterval);
        };
    }

    #randomBetween(min, max) {
        return min + Math.random() * (max - min);
    }

    #moveTowards(current, target, step) {
        if (current === target) return current;
        if (step <= 0) return current;

        const diff = target - current;
        const next = current + diff * Math.min(1, step);

        const rounded = Math.abs(next - target) < 0.0005 ? target : next;
        return this.#clamp(rounded, 0, 1);
    }

    #clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }
}
