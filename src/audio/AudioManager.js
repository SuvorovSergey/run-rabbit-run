export class AudioManager {
    constructor() {
        this.fadeDuration = 2.0;
        this.masterVolume = 0.6;

        this.cuckooVolume = 0.9;
        this.cuckooFadeInDuration = 0.6;
        this.cuckooMinInterval = 12;
        this.cuckooMaxInterval = 28;

        this.slamVolume = 1.0;
        this.collectVolume = 0.9;
        this.slamCooldown = 0.35;
        this.collectCooldown = 0.08;

        this.morning = this.#createLoopingAudio(new URL('../../assets/sounds/morning_forest.mp3', import.meta.url));
        this.day = this.#createLoopingAudio(new URL('../../assets/sounds/day_forest.mp3', import.meta.url));
        this.rain = this.#createLoopingAudio(new URL('../../assets/sounds/rain_forest.mp3', import.meta.url));
        this.nightTracks = [
            this.#createLoopingAudio(new URL('../../assets/sounds/night_forest.mp3', import.meta.url)),
            this.#createLoopingAudio(new URL('../../assets/sounds/night_forest2.mp3', import.meta.url))
        ];
        this.night = null;

        this.cuckoo = this.#createOneShotAudio(new URL('../../assets/sounds/cuckoo.mp3', import.meta.url));
        this.cuckooEnabled = false;
        this.cuckooTimer = this.#randomBetween(this.cuckooMinInterval, this.cuckooMaxInterval);
        this.cuckooIsPlaying = false;
        this.cuckooTargetVolume = 0;

        this.slam = this.#createOneShotAudio(new URL('../../assets/sounds/slam.mp3', import.meta.url));
        this.collect = this.#createOneShotAudio(new URL('../../assets/sounds/collect.mp3', import.meta.url));
        this.slamCooldownLeft = 0;
        this.collectCooldownLeft = 0;

        this.paused = false;
        this.muted = false;

        this.started = false;
        this.target = { morning: 0, day: 0, night: 0, rain: 0 };
    }

    #createLoopingAudio(srcUrl) {
        const audio = new Audio(srcUrl);
        audio.loop = true;
        audio.preload = 'auto';
        audio.volume = 0;
        return audio;
    }

    #createOneShotAudio(srcUrl) {
        const audio = new Audio(srcUrl);
        audio.loop = false;
        audio.preload = 'auto';
        audio.volume = 0;
        return audio;
    }

    start() {
        if (this.started) return;
        this.started = true;

        this.night = this.#pickRandomNightTrack();

        this.morning.volume = 0;
        this.day.volume = 0;
        this.rain.volume = 0;
        this.night.volume = 0;

        this.cuckoo.volume = 0;
        this.cuckooIsPlaying = false;
        this.cuckooTargetVolume = 0;

        this.slam.volume = 0;
        this.collect.volume = 0;
        this.slamCooldownLeft = 0;
        this.collectCooldownLeft = 0;

        this.nightTracks.forEach(track => {
            if (track !== this.night) {
                track.volume = 0;
                track.pause();
            }
        });

        const dayPlay = this.day.play();
        const nightPlay = this.night.play();
        const morningPlay = this.morning.play();
        const rainPlay = this.rain.play();

        if (this.paused || this.muted) {
            this.#pauseAll();
            return;
        }

        if (dayPlay && typeof dayPlay.catch === 'function') {
            dayPlay.catch(() => {
                this.started = false;
            });
        }

        if (nightPlay && typeof nightPlay.catch === 'function') {
            nightPlay.catch(() => {
                this.started = false;
            });
        }

        if (morningPlay && typeof morningPlay.catch === 'function') {
            morningPlay.catch(() => {
                this.started = false;
            });
        }

        if (rainPlay && typeof rainPlay.catch === 'function') {
            rainPlay.catch(() => {
                this.started = false;
            });
        }
    }

    playSlam() {
        if (this.paused || this.muted) return;
        if (this.slamCooldownLeft > 0) return;
        this.slamCooldownLeft = this.slamCooldown;

        this.#playOneShot(this.slam, this.#clamp(this.slamVolume * this.masterVolume, 0, 1));
    }

    playCollect() {
        if (this.paused || this.muted) return;
        if (this.collectCooldownLeft > 0) return;
        this.collectCooldownLeft = this.collectCooldown;

        this.#playOneShot(this.collect, this.#clamp(this.collectVolume * this.masterVolume, 0, 1));
    }

    setAmbienceBlend(blend) {
        const morning = typeof blend?.morning === 'number' ? blend.morning : 0;
        const day = typeof blend?.day === 'number' ? blend.day : 0;
        const night = typeof blend?.night === 'number' ? blend.night : 0;
        const rain = typeof blend?.rain === 'number' ? blend.rain : 0;

        this.target.morning = this.#clamp(morning, 0, 1);
        this.target.day = this.#clamp(day, 0, 1);
        this.target.night = this.#clamp(night, 0, 1);
        this.target.rain = this.#clamp(rain, 0, 1);
    }

    fadeOut() {
        this.target.morning = 0;
        this.target.day = 0;
        this.target.night = 0;
        this.target.rain = 0;
        this.cuckooEnabled = false;
        this.cuckooTargetVolume = 0;
    }

    setPaused(paused) {
        this.paused = Boolean(paused);

        if (!this.started) return;

        if (this.paused) {
            this.#pauseAll();
        } else {
            if (!this.muted) {
                this.#resumeAll();
            }
        }
    }

    toggleMute() {
        this.setMuted(!this.muted);
    }

    setMuted(muted) {
        this.muted = Boolean(muted);

        if (!this.started) return;

        if (this.muted) {
            this.#pauseAll();
        } else {
            if (!this.paused) {
                this.#resumeAll();
            }
        }
    }

    setCuckooEnabled(enabled) {
        this.cuckooEnabled = Boolean(enabled);

        if (!this.cuckooEnabled) {
            this.cuckooTargetVolume = 0;
        }
    }

    update(deltaTime) {
        if (!this.started) return;

        if (this.paused || this.muted) {
            return;
        }

        this.slamCooldownLeft = Math.max(0, this.slamCooldownLeft - deltaTime);
        this.collectCooldownLeft = Math.max(0, this.collectCooldownLeft - deltaTime);

        const step = this.fadeDuration <= 0 ? 1 : (deltaTime / this.fadeDuration);

        this.morning.volume = this.#moveTowards(this.morning.volume, this.target.morning * this.masterVolume, step);
        this.day.volume = this.#moveTowards(this.day.volume, this.target.day * this.masterVolume, step);
        this.night.volume = this.#moveTowards(this.night.volume, this.target.night * this.masterVolume, step);
        this.rain.volume = this.#moveTowards(this.rain.volume, this.target.rain * this.masterVolume, step);

        if (this.cuckooIsPlaying || this.cuckooTargetVolume > 0) {
            const cuckooStep = this.cuckooFadeInDuration <= 0 ? 1 : (deltaTime / this.cuckooFadeInDuration);
            this.cuckoo.volume = this.#moveTowards(this.cuckoo.volume, this.cuckooTargetVolume, cuckooStep);
        }

        this.#updateCuckoo(deltaTime);

        if (
            this.target.morning === 0
            && this.target.day === 0
            && this.target.night === 0
            && this.target.rain === 0
            && this.morning.volume === 0
            && this.day.volume === 0
            && this.night.volume === 0
            && this.rain.volume === 0
        ) {
            this.morning.pause();
            this.day.pause();
            this.night.pause();
            this.rain.pause();
            this.started = false;
        }
    }

    #updateCuckoo(deltaTime) {
        if (this.paused || this.muted) {
            return;
        }

        if (!this.cuckooEnabled) {
            if (this.cuckooIsPlaying) {
                this.cuckooTargetVolume = 0;
            }
            return;
        }

        if (this.cuckooIsPlaying) {
            return;
        }

        this.cuckooTimer -= deltaTime;
        if (this.cuckooTimer > 0) {
            return;
        }

        this.cuckoo.volume = 0;
        this.cuckoo.currentTime = 0;
        this.cuckooTargetVolume = this.#clamp(this.cuckooVolume * this.masterVolume, 0, 1);
        this.cuckooIsPlaying = true;

        const play = this.cuckoo.play();
        if (play && typeof play.catch === 'function') {
            play.catch(() => {
                this.cuckooIsPlaying = false;
                this.cuckooTargetVolume = 0;
            });
        }

        this.cuckoo.onended = () => {
            this.cuckooIsPlaying = false;
            this.cuckooTargetVolume = 0;
            this.cuckooTimer = this.#randomBetween(this.cuckooMinInterval, this.cuckooMaxInterval);
        };
    }

    #playOneShot(audio, volume) {
        try {
            audio.pause();
            audio.currentTime = 0;
            audio.volume = volume;
            const play = audio.play();
            if (play && typeof play.catch === 'function') {
                play.catch(() => {});
            }
        } catch {
        }
    }

    #pauseAll() {
        try {
            this.morning.pause();
            this.day.pause();
            this.rain.pause();
            this.night?.pause();
            this.cuckoo.pause();
            this.slam.pause();
            this.collect.pause();
        } catch {
        }
    }

    #resumeAll() {
        try {
            this.morning.play().catch(() => {});
            this.day.play().catch(() => {});
            this.rain.play().catch(() => {});
            this.night?.play().catch(() => {});
            if (this.cuckooIsPlaying) {
                this.cuckoo.play().catch(() => {});
            }
        } catch {
        }
    }

    #pickRandomNightTrack() {
        if (!this.nightTracks.length) {
            throw new Error('No night ambience tracks configured');
        }

        const index = Math.floor(Math.random() * this.nightTracks.length);
        return this.nightTracks[index];
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
