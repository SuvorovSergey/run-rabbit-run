export class Fog {
    constructor(canvas, config = {}) {
        this.canvas = canvas;
        this.layers = [];
        this.isFoggy = false;
        this.intensity = 0;
        this.targetIntensity = 0;
        this.movement = 0;
        
        this.config = {
            maxLayers: 5,
            density: 0.6,
            speed: 0.5,
            fadeInDuration: 2.0,
            fadeOutDuration: 3.0,
            ...config
        };
        
        this.initLayers();
    }
    
    initLayers() {
        this.layers = [];
        for (let i = 0; i < this.config.maxLayers; i++) {
            this.layers.push(this.createLayer());
        }
    }
    
    createLayer() {
        return {
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            width: 200 + Math.random() * 300,
            height: 100 + Math.random() * 200,
            opacity: 0.1 + Math.random() * 0.3,
            speed: 0.2 + Math.random() * 0.8,
            scale: 0.5 + Math.random() * 0.5
        };
    }
    
    update(deltaTime) {
        if (this.intensity < this.targetIntensity) {
            this.intensity = Math.min(1, this.intensity + deltaTime / this.config.fadeInDuration);
        } else if (this.intensity > this.targetIntensity) {
            this.intensity = Math.max(0, this.intensity - deltaTime / this.config.fadeOutDuration);
        }
        
        if (this.intensity > 0) {
            this.updateMovement(deltaTime);
        }
    }
    
    updateMovement(deltaTime) {
        this.movement += deltaTime * this.config.speed;
        
        for (const layer of this.layers) {
            layer.x += layer.speed * deltaTime;
            
            if (layer.x > this.canvas.width + layer.width) {
                layer.x = -layer.width;
            }
            
            layer.y += Math.sin(this.movement + layer.x * 0.01) * 0.5;
        }
    }
    
    start(intensity = 0.6) {
        this.isFoggy = true;
        this.targetIntensity = intensity;
    }
    
    stop() {
        this.targetIntensity = 0;
        this.isFoggy = false;
    }
    
    setIntensity(intensity) {
        this.targetIntensity = Math.max(0, Math.min(1, intensity));
        this.isFoggy = this.targetIntensity > 0;
    }
    
    getEffects() {
        return {
            fogIntensity: this.intensity,
            fogLayers: this.layers,
            fogMovement: this.movement,
            visibilityMultiplier: 1 - (this.intensity * 0.6),
            speedMultiplier: 1 - (this.intensity * 0.1)
        };
    }
}
