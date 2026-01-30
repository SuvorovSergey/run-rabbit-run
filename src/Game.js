import { Renderer } from './render/Renderer.js';
import { GameState } from './GameState.js';
import { SceneManager } from './scene/SceneManager.js';
import { Input } from './core/Input.js';
import { Camera } from './render/Camera.js';
import { CONFIG } from './Config.js';
import { AudioManager } from './audio/AudioManager.js';

export class Game {
    constructor(canvas) {
        this.config = CONFIG;
        this.speed = this.config.SPEED;
        this.camera = new Camera(this.config);
        this.state = new GameState(this.config);
        this.renderer = new Renderer(canvas);
        this.sceneManager = new SceneManager(this);
        this.input = new Input();
        this.audio = new AudioManager();
        this.lastFrameTime = 0;
    }

    start() {
        this.sceneManager.setScene('start');
        requestAnimationFrame(this.loop.bind(this));
    }

    loop(timestamp) {
        if (this.lastFrameTime === 0) {
            this.lastFrameTime = timestamp;
        }

        const deltaTime = (timestamp - this.lastFrameTime) / 1000; // in seconds
        this.lastFrameTime = timestamp;

        this.update(deltaTime);
        this.draw();

        this.input.resetFrameState();
        
        requestAnimationFrame(this.loop.bind(this));
    }

    update(deltaTime) {
        this.sceneManager.update(deltaTime);
        this.audio.update(deltaTime);
    }

    draw() {
        this.sceneManager.draw();
    }
}
