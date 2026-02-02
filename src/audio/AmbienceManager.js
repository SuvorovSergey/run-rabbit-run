import { AudioLoader } from './AudioLoader.js';
import { AUDIO_CONFIG } from './AudioConfig.js';

export class AmbienceManager {
    constructor() {
        this.tracks = {
            morning: AudioLoader.createLoopingAudio(new URL(AUDIO_CONFIG.ambience.morning.file, import.meta.url)),
            day: AudioLoader.createLoopingAudio(new URL(AUDIO_CONFIG.ambience.day.file, import.meta.url)),
            rain: AudioLoader.createLoopingAudio(new URL(AUDIO_CONFIG.ambience.rain.file, import.meta.url)),
            night: []
        };

        // Load night tracks
        AUDIO_CONFIG.ambience.night.forEach(config => {
            this.tracks.night.push(
                AudioLoader.createLoopingAudio(new URL(config.file, import.meta.url))
            );
        });

        this.currentNightTrack = null;
        this.targetVolumes = { morning: 0, day: 0, night: 0, rain: 0 };
        this.started = false;
    }

    start() {
        if (this.started) return;
        this.started = true;

        // Pick random night track
        this.currentNightTrack = this.tracks.night[Math.floor(Math.random() * this.tracks.night.length)];
        
        // Pause all night tracks except the current one
        this.tracks.night.forEach(track => {
            if (track !== this.currentNightTrack) {
                track.volume = 0;
                AudioLoader.safePause(track);
            }
        });

        // Start all tracks
        AudioLoader.safePlay(this.tracks.morning);
        AudioLoader.safePlay(this.tracks.day);
        AudioLoader.safePlay(this.tracks.rain);
        AudioLoader.safePlay(this.currentNightTrack);
    }

    setBlend(blend) {
        this.targetVolumes.morning = this.#clamp(blend.morning || 0, 0, 1);
        this.targetVolumes.day = this.#clamp(blend.day || 0, 0, 1);
        this.targetVolumes.night = this.#clamp(blend.night || 0, 0, 1);
        this.targetVolumes.rain = this.#clamp(blend.rain || 0, 0, 1);
    }

    fadeOut() {
        this.targetVolumes = { morning: 0, day: 0, night: 0, rain: 0 };
    }

    update(deltaTime, masterVolume, fadeDuration) {
        if (!this.started) return;

        const step = fadeDuration <= 0 ? 1 : (deltaTime / fadeDuration);

        this.tracks.morning.volume = this.#moveTowards(
            this.tracks.morning.volume, 
            this.targetVolumes.morning * masterVolume, 
            step
        );
        this.tracks.day.volume = this.#moveTowards(
            this.tracks.day.volume, 
            this.targetVolumes.day * masterVolume, 
            step
        );
        this.tracks.rain.volume = this.#moveTowards(
            this.tracks.rain.volume, 
            this.targetVolumes.rain * masterVolume, 
            step
        );

        if (this.currentNightTrack) {
            this.currentNightTrack.volume = this.#moveTowards(
                this.currentNightTrack.volume, 
                this.targetVolumes.night * masterVolume, 
                step
            );
        }

        // Check if all tracks are silent and can be stopped
        if (this.#areAllTracksSilent()) {
            this.#stopAll();
        }
    }

    pauseAll() {
        AudioLoader.safePause(this.tracks.morning);
        AudioLoader.safePause(this.tracks.day);
        AudioLoader.safePause(this.tracks.rain);
        AudioLoader.safePause(this.currentNightTrack);
    }

    resumeAll() {
        AudioLoader.safePlay(this.tracks.morning);
        AudioLoader.safePlay(this.tracks.day);
        AudioLoader.safePlay(this.tracks.rain);
        AudioLoader.safePlay(this.currentNightTrack);
    }

    #areAllTracksSilent() {
        return this.targetVolumes.morning === 0 && this.targetVolumes.day === 0 && 
               this.targetVolumes.night === 0 && this.targetVolumes.rain === 0 &&
               this.tracks.morning.volume === 0 && this.tracks.day.volume === 0 && 
               (this.currentNightTrack?.volume === 0) && this.tracks.rain.volume === 0;
    }

    #stopAll() {
        AudioLoader.safePause(this.tracks.morning);
        AudioLoader.safePause(this.tracks.day);
        AudioLoader.safePause(this.tracks.rain);
        AudioLoader.safePause(this.currentNightTrack);
        this.started = false;
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
