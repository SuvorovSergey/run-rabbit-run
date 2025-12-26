import { StartScene } from './StartScene.js';
import { GameScene } from './GameScene.js';
import { GameOverScene } from './GameOverScene.js';

export class SceneManager {
    constructor(game) {
        this.game = game
        this.currentScene = null
    }

    update(deltaTime) {
        this.currentScene.update(deltaTime)
    }

    draw() {
        this.currentScene.draw()
    }

    setScene(sceneName) {
        switch (sceneName) {
            case 'start':
                this.currentScene = new StartScene(this.game)
                break;
            case 'game':
                this.currentScene = new GameScene(this.game)
                this.currentScene.init();
                break;
            case 'gameover':
                this.currentScene = new GameOverScene(this.game)
                break;
        }
    }
}