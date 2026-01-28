import { CONFIG } from '../Config.js';

export class GameOverScene {
    constructor(game) {
        this.game = game

        this.title = 'Game Over'
        this.titleSize = CONFIG.CANVAS_WIDTH / 10
        this.titleX = CONFIG.CANVAS_WIDTH
        this.titleY = CONFIG.CANVAS_HEIGHT / 2
        this.titleXFinal = (CONFIG.CANVAS_WIDTH - this.game.renderer.getTextWidth(this.title, this.titleSize)) / 2
    }

    update(deltaTime) {
        if (this.game.input.isKeyPressed('Enter')) {
            this.game.sceneManager.setScene('start')
        }

        // Проверяем касание для мобильных устройств
        if (this.game.input.isTouchDevice) {
            for (const [touchId, touch] of this.game.input.touches) {
                // Любое касание в нижней половине экрана возвращает в меню
                if (touch.startY > CONFIG.CANVAS_HEIGHT / 2) {
                    this.game.sceneManager.setScene('start');
                    break;
                }
            }
        }

        if (this.titleX <= this.titleXFinal) {
            return
        }

        this.titleX -= 500 * deltaTime * 2;
    }

    draw() {
        // Рисуем фоновую сцену (игровую сцену)
        if (this.game.state.backgroundScene) {
            this.game.state.backgroundScene.draw();
            
            // Затемняем фон
            this.game.renderer.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.game.renderer.ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        } else {
            this.game.renderer.clear();
        }

        this.#drawGameOver();
        if (this.titleX <= this.titleXFinal) {
            this.#drawStats();
            this.#drawInstructions();
        }
    }

    #drawGameOver() {
        this.game.renderer.drawText(
            this.title,
            this.titleX,
            this.titleY - this.titleSize / 2,
            {
                font: `${this.titleSize}px Arial`,
            }
        );
    }

    #drawStats() {
        const stats = this.game.state.lastRunStats || {
            level: this.game.state.level,
            time: this.game.state.getFormattedTime(),
            trees: this.game.state.treeCount,
            speed: this.game.speed,
        };

        const level = stats.level;
        const time = stats.time;
        const trees = stats.trees;
        const speed = stats.speed.toFixed(1);

        const statsLines = [
            `Level: ${level}`,
            `Time: ${time}`,
            `Trees: ${trees}`,
            `Speed: ${speed}`,
            `🥕 Carrots: ${stats.carrots || 0}`,
        ];

        const statsSize = CONFIG.CANVAS_WIDTH / 50;
        const totalHeight = statsLines.length * (statsSize + 8);
        let startY = this.titleY + this.titleSize / 2 + statsSize;

        statsLines.forEach((line, index) => {
            const textWidth = this.game.renderer.getTextWidth(line, statsSize);
            const x = (CONFIG.CANVAS_WIDTH - textWidth) / 2;
            const y = startY + index * (statsSize + 8);

            this.game.renderer.drawText(
                line,
                x,
                y,
                {
                    font: `${statsSize}px Arial`,
                }
            );
        });
    }

    #drawInstructions() {
        const instructions = this.game.input.isTouchDevice ? [
            'Tap Screen to Continue'
        ] : [
            'Press Enter to Continue'
        ];
        
        const instructionSize = CONFIG.CANVAS_WIDTH / 50;
        const statsSize = CONFIG.CANVAS_WIDTH / 50;
        const statsLinesCount = 5;
        let startY =
            this.titleY
            + this.titleSize / 2
            + statsSize
            + statsLinesCount * (statsSize + 8)
            + 20;

        instructions.forEach((instruction, index) => {
            const textWidth = this.game.renderer.getTextWidth(instruction, instructionSize);
            const x = (CONFIG.CANVAS_WIDTH - textWidth) / 2;
            const y = startY + index * (instructionSize + 8);

            this.game.renderer.drawText(
                instruction,
                x,
                y,
                {
                    font: `${instructionSize}px Arial`,
                }
            );
        });
    }
}