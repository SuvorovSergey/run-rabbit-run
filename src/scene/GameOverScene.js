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

        if (this.titleX <= this.titleXFinal) {
            return
        }

        this.titleX -= 500 * deltaTime * 2;
    }

    draw() {
        this.game.renderer.clear();

        this.#drawGameOver();
        if (this.titleX <= this.titleXFinal) {
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

    #drawInstructions() {
        const instructions = [
            'Press Enter to Continue'
        ];
        const instructionSize = CONFIG.CANVAS_WIDTH / 40;
        let startY = this.titleY + this.titleSize;

        instructions.forEach((instruction, index) => {
            const textWidth = this.game.renderer.getTextWidth(instruction, instructionSize);
            const x = (CONFIG.CANVAS_WIDTH - textWidth) / 2;
            const y = startY + index * (instructionSize + 10);

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