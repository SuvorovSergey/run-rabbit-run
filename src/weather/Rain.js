export class Rain {
    constructor(canvas, config = {}) {
        this.canvas = canvas;
        this.raindrops = [];
        this.isRaining = false;
        this.intensity = 0;
        this.targetIntensity = 0;
        this.windForce = 0;
        this.lightning = null;
        
        this.config = {
            maxRaindrops: 200,
            raindropSpeed: 15,
            raindropLength: 20,
            lightningChance: 0.001,
            fadeInDuration: 2.0,
            fadeOutDuration: 3.0,
            ...config
        };
        
        this.initRaindrops();
    }
    
    initRaindrops() {
        this.raindrops = [];
        for (let i = 0; i < this.config.maxRaindrops; i++) {
            this.raindrops.push(this.createRaindrop(true));
        }
    }
    
    createRaindrop(initial = false) {
        return {
            x: Math.random() * this.canvas.width,
            y: initial ? Math.random() * this.canvas.height : -this.config.raindropLength,
            speed: this.config.raindropSpeed + Math.random() * 5,
            length: this.config.raindropLength + Math.random() * 10,
            opacity: 0.3 + Math.random() * 0.4,
            width: 1 + Math.random()
        };
    }
    
    update(deltaTime) {
        if (this.intensity < this.targetIntensity) {
            this.intensity = Math.min(1, this.intensity + deltaTime / this.config.fadeInDuration);
        } else if (this.intensity > this.targetIntensity) {
            this.intensity = Math.max(0, this.intensity - deltaTime / this.config.fadeOutDuration);
        }
        
        if (this.intensity > 0) {
            this.updateRaindrops(deltaTime);
            this.updateLightning(deltaTime);
        }
    }
    
    updateRaindrops(deltaTime) {
        const activeDrops = Math.floor(this.raindrops.length * this.intensity);
        
        for (let i = 0; i < activeDrops; i++) {
            const drop = this.raindrops[i];
            
            drop.y += drop.speed * (1 + this.intensity);
            drop.x += this.windForce * this.intensity;
            
            if (drop.y > this.canvas.height) {
                drop.y = -drop.length;
                drop.x = Math.random() * this.canvas.width;
            }
            
            if (drop.x < 0) {
                drop.x = this.canvas.width;
            } else if (drop.x > this.canvas.width) {
                drop.x = 0;
            }
        }
    }
    
    updateLightning(deltaTime) {
        if (this.lightning) {
            this.lightning.elapsed += deltaTime;
            if (this.lightning.elapsed > this.lightning.duration) {
                this.lightning = null;
            }
        }
        
        if (this.isRaining && this.intensity > 0.7 && Math.random() < this.config.lightningChance) {
            this.triggerLightning();
        }
    }
    
    triggerLightning() {
        this.lightning = {
            elapsed: 0,
            duration: 0.2,
            intensity: 0.8 + Math.random() * 0.2
        };
    }
    
    start(intensity = 0.7) {
        this.isRaining = true;
        this.targetIntensity = intensity;
        this.windForce = (Math.random() - 0.5) * 2;
    }
    
    stop() {
        this.targetIntensity = 0;
        this.isRaining = false;
        this.windForce = 0;
    }
    
    setIntensity(intensity) {
        this.targetIntensity = Math.max(0, Math.min(1, intensity));
        this.isRaining = this.targetIntensity > 0;
        if (this.isRaining) {
            this.windForce = (Math.random() - 0.5) * 2;
        }
    }
    
    getEffects() {
        return {
            rainIntensity: this.intensity,
            windForce: this.windForce,
            lightning: this.lightning,
            visibilityMultiplier: 1 - (this.intensity * 0.3),
            speedMultiplier: 1 - (this.intensity * 0.15)
        };
    }
}
