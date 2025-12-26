import { Player } from '../entities/Player.js';
import { Tree } from '../entities/Tree.js';

export class GameScene {
    constructor(game) {
        this.game = game;
        this.entities = [];
        this.player = new Player(0, 0);
    }

    init() {
        this.game.state.seconds = 0;
        this.game.state.level = 1;
        this.game.speed = this.game.config.SPEED;

        this.game.state.isPaused = false;
        this.baseTreeCount = this.game.state.treeCount;

        for (let i = 0; i < this.game.state.treeCount; i++) {
            this.entities.push(
                this.#spawnTree()
            );
        }
    }

    #spawnTree() {
        // более плотный лес в центре, реже по краям
        const x = (Math.random() - 0.5) * 2; // от -1 до 1
        const y = Math.random(); // от 0 до 1

        // квадратичное распределение - больше деревьев в центре
        const distributionFactor = 1 - x * x * 0.5;

        return new Tree(
            x * 3000 * distributionFactor,
            400 + y * 1200
        );
    }

    update(deltaTime) {
        this.#checkInput();
        if (this.game.state.isPaused) {
            return
        };
        this.game.state.update(deltaTime);

        this.#updateLevel();
        this.#updateEntities(deltaTime);
        this.#checkCollisions();
    }

    draw() {
        this.game.renderer.clear();
        this.#drawHorizon();
        this.#drawEntities();
        this.#drawTime();
        this.#drawLevel();
        this.#drawPlayer();
    }

    #drawLevel() {
        const levelText = `Level: ${this.game.state.level}`;
        const levelSize = this.game.config.CANVAS_WIDTH / 30;
        const x = 20;
        const y = 40;

        this.game.renderer.drawText(
            levelText,
            x,
            y,
            {
                color: 'white',
                font: `${levelSize}px Arial`,
                align: 'left'
            }
        );
    }

    #updateLevel() {
        const level = Math.floor(this.game.state.seconds / 30) + 1;
        if (level === this.game.state.level) {
            return;
        }

        this.game.state.level = level;
        this.game.state.treeCount =
            this.baseTreeCount + (level - 1) * 150;

        if (level % 2 === 0) {
            this.game.speed += 0.5;
        }
    }

    #checkInput() {
        const input = this.game.input;

        if (input.isKeyPressed('Space')) {
            this.game.state.togglePause();
        }

        if (input.isKeyPressed('Escape')) {
            this.game.sceneManager.setScene('start');
        }

        if (input.isKeyDown('ArrowLeft')) {
            this.game.camera.playerX -= this.game.speed * 2;
        }

        if (input.isKeyDown('ArrowRight')) {
            this.game.camera.playerX += this.game.speed * 2;
        }
    }

    #updateEntities(deltaTime) {
        this.entities.forEach(entity => {
            entity.z -= 50 * this.game.speed * deltaTime;
        });

        this.entities = this.entities.filter(entity => entity.z > 0);


        const treeCount = this.entities.filter(e => e instanceof Tree).length;

        if (treeCount < this.game.state.treeCount) {
            this.entities.push(
                this.#spawnTree()
            );
        }
    }

    #drawTime() {
        const formattedTime = this.game.state.getFormattedTime();
        const timeSize = this.game.config.CANVAS_WIDTH / 30;
        const x = this.game.config.CANVAS_WIDTH - this.game.renderer.getTextWidth(formattedTime, timeSize) - 20;
        const y = 40;

        this.game.renderer.drawText(
            formattedTime,
            x,
            y,
            {
                font: `${timeSize}px Arial`,
            }
        );
    }

    #drawHorizon() {
        this.game.renderer.drawHorizon(this.game.camera.horizonY);
    }

    #drawEntities() {
        this.entities
            .filter(entity => entity.renderable && entity.z > 0)
            .sort((a, b) => b.z - a.z)
            .forEach(entity => {
                const p = this.game.camera.project(entity);

                if (p.scale <= 0.001) {
                    return;
                };

                switch (entity.renderable.type) {
                    case 'tree':
                        this.game.renderer.drawTree(
                            p.x,
                            p.y,
                            p.scale,
                            entity.renderable
                        );
                        break;
                }
            });
    }

    #drawPlayer() {
        this.game.renderer.drawRabbit(
            this.game.config.CANVAS_WIDTH / 2,
            this.game.config.CANVAS_HEIGHT - 65,
            this.game.state.seconds
        );
    }

    #checkCollisions() {
        const playerX = this.game.config.CANVAS_WIDTH / 2;
        const playerY = this.game.config.CANVAS_HEIGHT - 65;
        const playerRadius = 14;

        for (const entity of this.entities) {
            if (!(entity instanceof Tree)) continue;
            if (!entity.collider) continue;
            if (entity.z <= 0 || entity.z > 300) continue;

            const p = this.game.camera.project(entity);
            if (!p || p.scale < 0.05) continue;

            // ⬇️ СМЕЩЕНИЕ К ОСНОВАНИЮ СТВОЛА
            const treeBaseY =
                p.y + entity.renderable.trunkHeight * p.scale;

            const treeRadius =
                (entity.collider.width / 2) * p.scale;

            const dx = p.x - playerX;
            const dy = treeBaseY - playerY;

            const r = playerRadius + treeRadius;

            if (dx * dx + dy * dy < r * r) {
                this.#onPlayerHit(entity);
                return;
            }
        }
    }

    #onPlayerHit(tree) {
        this.game.sceneManager.setScene('gameover');
    }
}
