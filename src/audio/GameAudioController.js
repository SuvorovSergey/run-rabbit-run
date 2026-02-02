export class GameAudioController {
    constructor(audio, themeManager, weatherManager) {
        this.audio = audio;
        this.themeManager = themeManager;
        this.weatherManager = weatherManager;

        // Какие звуки включены для каждой темы
        this.themeSounds = {
            morning: { morning: 1, day: 0, night: 0, cuckoo: true },
            day: { morning: 0, day: 1, night: 0, cuckoo: true },
            evening: { morning: 0, day: 0, night: 1, cuckoo: true },
            night: { morning: 0, day: 0, night: 1, cuckoo: false },
        };
    }

    update() {
        const themeTransition = this.themeManager.getTransitionState();
        const weather = this.weatherManager.getWeatherEffects();
        
        // Получаем текущие и следующие звуки
        const currentSounds = this.#getThemeSounds(themeTransition.currentThemeName);
        const nextSounds = this.#getThemeSounds(themeTransition.nextThemeName);
        
        // Смешиваем звуки во время перехода
        const transitionProgress = themeTransition.isTransitioning ? themeTransition.progress : 0;
        const blendedSounds = this.#blendSounds(currentSounds, nextSounds, transitionProgress);
        
        // Добавляем звук дождя
        blendedSounds.rain = weather.rainIntensity;
        
        // Применяем настройки к аудио
        this.audio.start();
        this.audio.setAmbienceBlend({
            morning: blendedSounds.morning,
            day: blendedSounds.day,
            night: blendedSounds.night,
            rain: blendedSounds.rain
        });
        this.audio.setCuckooEnabled(blendedSounds.cuckoo > 0.5);
    }

    #getThemeSounds(themeName) {
        const sounds = this.themeSounds[themeName];
        if (!sounds) {
            // По умолчанию - тишина
            return { morning: 0, day: 0, night: 0, cuckoo: false };
        }
        
        return {
            morning: sounds.morning || 0,
            day: sounds.day || 0,
            night: sounds.night || 0,
            cuckoo: sounds.cuckoo ? 1 : 0
        };
    }
    
    #blendSounds(current, next, progress) {
        return {
            morning: this.#blend(current.morning, next.morning, progress),
            day: this.#blend(current.day, next.day, progress),
            night: this.#blend(current.night, next.night, progress),
            cuckoo: this.#blend(current.cuckoo, next.cuckoo, progress)
        };
    }

    #blend(from, to, progress) {
        return from * (1 - progress) + to * progress;
    }
}
