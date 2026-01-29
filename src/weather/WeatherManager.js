import { Rain } from './Rain.js';
import { Fog } from './Fog.js';

export class WeatherManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.currentWeatherType = 'clear';
        
        this.weatherTimer = 0;
        this.weatherDuration = 20;
        this.weatherChance = 0.002;
        
        this.rain = new Rain(canvas);
        this.fog = new Fog(canvas);
    }
    
    update(deltaTime) {
        this.weatherTimer += deltaTime;
        
        if (!this.rain || !this.fog) return;
        
        if (!this.rain.isRaining && !this.fog.isFoggy && Math.random() < this.weatherChance) {
            const weatherType = Math.random() < 0.6 ? 'rain' : 'fog';
            if (weatherType === 'rain') {
                this.startRain();
            } else {
                this.startFog();
            }
        } else if ((this.rain.isRaining || this.fog.isFoggy) && this.weatherTimer > this.weatherDuration) {
            this.stopWeather();
        }
        
        this.rain.update(deltaTime);
        this.fog.update(deltaTime);
    }
    
    startRain(intensity = 0.7) {
        this.currentWeatherType = 'rain';
        this.rain.start(intensity);
        this.fog.stop();
        this.weatherTimer = 0;
    }
    
    startFog(intensity = 0.6) {
        this.currentWeatherType = 'fog';
        this.fog.start(intensity);
        this.rain.stop();
        this.weatherTimer = 0;
    }
    
    stopWeather() {
        this.rain.stop();
        this.fog.stop();
        this.currentWeatherType = 'clear';
    }
    
    stopRain() {
        this.rain.stop();
        if (!this.fog.isFoggy) {
            this.currentWeatherType = 'clear';
        }
    }
    
    stopFog() {
        this.fog.stop();
        if (!this.rain.isRaining) {
            this.currentWeatherType = 'clear';
        }
    }
    
    getWeatherEffects() {
        const rainEffects = this.rain.getEffects();
        const fogEffects = this.fog.getEffects();
        
        let visibilityMultiplier = 1;
        let speedMultiplier = 1;
        
        if (rainEffects.rainIntensity > 0) {
            visibilityMultiplier = Math.min(visibilityMultiplier, rainEffects.visibilityMultiplier);
            speedMultiplier = Math.min(speedMultiplier, rainEffects.speedMultiplier);
        }
        
        if (fogEffects.fogIntensity > 0) {
            visibilityMultiplier = Math.min(visibilityMultiplier, fogEffects.visibilityMultiplier);
            speedMultiplier = Math.min(speedMultiplier, fogEffects.speedMultiplier);
        }
        
        return {
            rainIntensity: rainEffects.rainIntensity,
            fogIntensity: fogEffects.fogIntensity,
            windForce: rainEffects.windForce,
            lightning: rainEffects.lightning,
            currentWeatherType: this.currentWeatherType,
            visibilityMultiplier: visibilityMultiplier,
            speedMultiplier: speedMultiplier,
            fogLayers: fogEffects.fogLayers,
            raindrops: this.rain.raindrops
        };
    }
    
    setRainIntensity(intensity) {
        this.rain.setIntensity(intensity);
        if (intensity > 0) {
            this.currentWeatherType = 'rain';
            this.fog.stop();
            this.weatherTimer = 0;
        }
    }
    
    setFogIntensity(intensity) {
        this.fog.setIntensity(intensity);
        if (intensity > 0) {
            this.currentWeatherType = 'fog';
            this.rain.stop();
            this.weatherTimer = 0;
        }
    }
    
    toggleRain() {
        if (!this.rain) return;
        if (this.rain.isRaining) {
            this.stopRain();
        } else {
            this.startRain();
        }
    }
    
    toggleFog() {
        if (this.fog.isFoggy) {
            this.stopFog();
        } else {
            this.startFog();
        }
    }
}
