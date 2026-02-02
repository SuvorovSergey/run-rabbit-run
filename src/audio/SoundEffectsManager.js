import { AudioLoader } from './AudioLoader.js';
import { AUDIO_CONFIG } from './AudioConfig.js';

export class SoundEffectsManager {
    constructor() {
        this.effects = {
            slam: AudioLoader.createOneShotAudio(new URL(AUDIO_CONFIG.effects.slam.file, import.meta.url)),
            collect: AudioLoader.createOneShotAudio(new URL(AUDIO_CONFIG.effects.collect.file, import.meta.url))
        };

        this.cooldowns = {
            slam: 0,
            collect: 0
        };
    }

    playSlam(masterVolume) {
        if (this.cooldowns.slam > 0) return;
        
        this.cooldowns.slam = AUDIO_CONFIG.effects.slam.cooldown;
        const volume = this.#clamp(AUDIO_CONFIG.effects.slam.volume * masterVolume, 0, 1);
        this.#playOneShot(this.effects.slam, volume);
    }

    playCollect(masterVolume) {
        if (this.cooldowns.collect > 0) return;
        
        this.cooldowns.collect = AUDIO_CONFIG.effects.collect.cooldown;
        const volume = this.#clamp(AUDIO_CONFIG.effects.collect.volume * masterVolume, 0, 1);
        this.#playOneShot(this.effects.collect, volume);
    }

    update(deltaTime) {
        this.cooldowns.slam = Math.max(0, this.cooldowns.slam - deltaTime);
        this.cooldowns.collect = Math.max(0, this.cooldowns.collect - deltaTime);
    }

    pauseAll() {
        AudioLoader.safePause(this.effects.slam);
        AudioLoader.safePause(this.effects.collect);
    }

    #playOneShot(audio, volume) {
        try {
            audio.pause();
            audio.currentTime = 0;
            audio.volume = volume;
            AudioLoader.safePlay(audio);
        } catch {
            // Ignore errors
        }
    }

    #clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }
}
