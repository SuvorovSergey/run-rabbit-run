import { Player } from '../entities/Player.js';
import { Tree } from '../entities/Tree.js';
import { Carrot } from '../entities/Carrot.js';
import { Mushroom } from '../entities/Mushroom.js';

export class GameScene {
    constructor(game) {
        this.game = game;
        this.entities = [];
        this.player = new Player(0, 0);
        this.mushroomNotification = null;
    }

    init() {
        this.game.state.seconds = 0;
        this.game.state.level = 1;
        this.game.speed = this.game.config.SPEED;
        this.game.state.isPaused = false;
        this.game.state.treeCount = this.game.config.TREE_INITIAL_COUNT;
        this.game.state.carrotsCollected = 0;
        this.mushroomNotification = null;

        // наполняем стартовый лес деревьями
        this.entities = [];
        for (let i = 0; i < this.game.state.treeCount; i++) {
            this.entities.push(this.#spawnTree());
        }
        
        // добавляем начальные морковки
        for (let i = 0; i < 10; i++) {
            this.entities.push(this.#spawnCarrot());
        }
        
        // добавляем начальные мухоморы (реже чем морковки)
        for (let i = 0; i < 3; i++) {
            this.entities.push(this.#spawnMushroom());
        }
    }

    #spawnTree() {
        const centerX = this.game.camera.playerX || 0;
        const forestHalfWidth = this.game.config.FOREST_HALF_WIDTH || 3000;
    
        // X: плотнее к центру
        const xOffset = (Math.random() - 0.5) * 2;
        const treeX = centerX + xOffset * (1 - Math.abs(xOffset) * 0.5) * forestHalfWidth;
    
        // Z: плотнее к кролику
        const zRandom = Math.random();
        const treeZ = 400 + zRandom * zRandom * 600;
    
        return new Tree(treeX, treeZ, this.game.renderer.themeManager);
    }

    #spawnCarrot() {
        const centerX = this.game.camera.playerX || 0;
        const forestHalfWidth = this.game.config.FOREST_HALF_WIDTH || 3000;
    
        // X: случайная позиция в пределах леса
        const xOffset = (Math.random() - 0.5) * 2;
        const carrotX = centerX + xOffset * forestHalfWidth * 0.8;
    
        // Z: дальше от кролика, чтобы было время собраться
        const carrotZ = 500 + Math.random() * 800;
    
        return new Carrot(carrotX, carrotZ);
    }

    #spawnMushroom() {
        const centerX = this.game.camera.playerX || 0;
        const forestHalfWidth = this.game.config.FOREST_HALF_WIDTH || 3000;
    
        // X: случайная позиция в пределах леса
        const xOffset = (Math.random() - 0.5) * 2;
        const mushroomX = centerX + xOffset * forestHalfWidth * 0.8;
    
        // Z: дальше от кролика, чтобы было время собраться
        const mushroomZ = 500 + Math.random() * 800;
    
        return new Mushroom(mushroomX, mushroomZ);
    }

    update(deltaTime) {
        this.#checkInput();
        if (this.game.state.isPaused) {
            return
        };
        this.game.state.update(deltaTime);

        // Обновляем автоматическую смену тем и переходы
        this.game.renderer.themeManager.updateAutoSwitch(deltaTime);
        this.game.renderer.themeManager.updateTransition(deltaTime);

        // обновляем таймер уведомления о мухоморе
        if (this.mushroomNotification) {
            this.mushroomNotification.elapsed += deltaTime;
            if (this.mushroomNotification.elapsed >= this.mushroomNotification.duration) {
                this.mushroomNotification = null;
            }
        }

        this.#updateLevel();
        this.#updateEntities(deltaTime);
        this.#checkCollisions();
    }

    draw() {
        this.game.renderer.clear();
        this.game.renderer.drawSky();
        this.game.renderer.drawGround();
        this.game.renderer.drawStars();
        this.#drawHorizon();
        this.#drawEntities();
        this.#drawTime();
        this.#drawLevel();
        this.#drawCarrotCount();
        this.#drawMushroomNotification();
        this.#drawPlayer();
    }

    #drawLevel() {
        const levelText = `Level: ${this.game.state.level}`;
        const levelSize = this.game.config.CANVAS_WIDTH / 30;
        const x = 20;
        const y = 40;

        const treeCount = this.entities.filter(e => e instanceof Tree).length;
        const statsText = `Trees: ${treeCount}  Speed: ${this.game.speed.toFixed(1)}`;
        const statsSize = levelSize * 0.5;
        const statsY = y + levelSize;

        this.game.renderer.drawText(
            levelText,
            x,
            y,
            {
                color: '#87CEEB',
                font: `${levelSize}px Arial`,
                align: 'left',
                shadow: true
            }
        );

        this.game.renderer.drawText(
            statsText,
            x,
            statsY,
            {
                color: '#90EE90',
                font: `${statsSize}px Arial`,
                align: 'left',
                shadow: true
            }
        );
    }

    #drawCarrotCount() {
        const carrotText = `🥕 Carrots: ${this.game.state.carrotsCollected}`;
        const carrotSize = this.game.config.CANVAS_WIDTH / 35;
        const x = 20;
        const y = 120;

        this.game.renderer.drawText(
            carrotText,
            x,
            y,
            {
                color: '#FFA500',
                font: `${carrotSize}px Arial`,
                align: 'left',
                shadow: true
            }
        );
    }

    #drawMushroomNotification() {
        if (!this.mushroomNotification) {
            return;
        }

        const notificationSize = this.game.config.CANVAS_WIDTH / 25;
        const x = this.game.config.CANVAS_WIDTH / 2;
        const y = 100;

        // Вычисляем прозрачность на основе времени
        const alpha = Math.max(0, 1 - (this.mushroomNotification.elapsed / this.mushroomNotification.duration));
        
        this.game.renderer.drawText(
            this.mushroomNotification.text,
            x,
            y,
            {
                color: `rgba(220, 20, 60, ${alpha})`, // красный цвет с прозрачностью
                font: `${notificationSize}px Arial`,
                align: 'center',
                shadow: true
            }
        );
    }

    #updateLevel() {
        const level = Math.floor(this.game.state.seconds / 15) + 1;
        if (level === this.game.state.level) {
            return;
        }

        this.game.state.level = level;
        this.game.state.treeCount = this.game.state.treeCount + 100;

        if (level % 2 === 0) {
            this.game.speed += 0.3;
            this.game.speed = Math.min(this.game.speed, 3); // ограничиваем скорость максимум 3
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

        if (input.isKeyPressed('KeyS') || input.isKeyPressed('S')) {
            this.game.renderer.themeManager.startThemeTransition();
        }

        if (input.isKeyDown('ArrowLeft')) {
            this.game.camera.playerX -= this.game.speed * 2;
        }

        if (input.isKeyDown('ArrowRight')) {
            this.game.camera.playerX += this.game.speed * 2;
        }
    }

    #updateEntities(deltaTime) {
        const forestHalfWidth = this.game.config.FOREST_HALF_WIDTH || 3000;
        const centerX = this.game.camera.playerX || 0;

        this.entities.forEach(entity => {
            entity.z -= 50 * this.game.speed * deltaTime;

            // оборачиваем деревья по X вокруг кролика, чтобы лес был бесконечным
            if (entity instanceof Tree) {
                if (entity.x < centerX - forestHalfWidth) {
                    entity.x += forestHalfWidth * 2;
                } else if (entity.x > centerX + forestHalfWidth) {
                    entity.x -= forestHalfWidth * 2;
                }
            }
        });

        // удаляем деревья, которые ушли за камеру
        this.entities = this.entities.filter(entity => entity.z > 0);

        // гарантируем, что количество деревьев не меньше заданного
        let treeCount = this.entities.filter(e => e instanceof Tree).length;
        while (treeCount < this.game.state.treeCount) {
            this.entities.push(this.#spawnTree());
            treeCount++;
        }
        
        // добавляем новые морковки периодически
        let carrotCount = this.entities.filter(e => e instanceof Carrot).length;
        if (carrotCount < 5 && Math.random() < 0.02) { // 2% шанс каждый кадр
            this.entities.push(this.#spawnCarrot());
        }
        
        // добавляем новые мухоморы реже чем морковки
        let mushroomCount = this.entities.filter(e => e instanceof Mushroom).length;
        if (mushroomCount < 2 && Math.random() < 0.005) { // 0.5% шанс каждый кадр (в 4 раза реже)
            this.entities.push(this.#spawnMushroom());
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
                color: '#FFD700',
                font: `${timeSize}px Arial`,
                align: 'left',
                shadow: true
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
                    case 'carrot':
                        this.game.renderer.drawCarrot(
                            p.x,
                            p.y,
                            p.scale
                        );
                        break;
                    case 'mushroom':
                        this.game.renderer.drawMushroom(
                            p.x,
                            p.y,
                            p.scale
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

        // проверка столкновений с деревьями
        for (const entity of this.entities) {
            if (!(entity instanceof Tree)) {
                continue
            };

            if (!entity.collider) {
                continue
            };

            if (entity.z <= 0 || entity.z > 300) {
                continue
            };

            const p = this.game.camera.project(entity);
            
            if (!p || p.scale < 0.05) {
                continue
            };

            const treeBaseY = p.y; // основание дерева на земле

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
        
        // проверка столкновений с морковками
        for (let i = this.entities.length - 1; i >= 0; i--) {
            const entity = this.entities[i];
            if (!(entity instanceof Carrot)) {
                continue;
            }

            if (!entity.collider) {
                continue;
            }

            if (entity.z <= 0 || entity.z > 300) {
                continue;
            }

            const p = this.game.camera.project(entity);
            
            if (!p || p.scale < 0.05) {
                continue;
            }

            const carrotRadius = (entity.collider.width / 2) * p.scale;

            const dx = p.x - playerX;
            const dy = p.y - playerY;

            const r = playerRadius + carrotRadius;

            if (dx * dx + dy * dy < r * r) {
                this.#onCarrotCollected(entity, i);
                return;
            }
        }
        
        // проверка столкновений с мухоморами
        for (let i = this.entities.length - 1; i >= 0; i--) {
            const entity = this.entities[i];
            if (!(entity instanceof Mushroom)) {
                continue;
            }

            if (!entity.collider) {
                continue;
            }

            if (entity.z <= 0 || entity.z > 300) {
                continue;
            }

            const p = this.game.camera.project(entity);
            
            if (!p || p.scale < 0.05) {
                continue;
            }

            const mushroomRadius = (entity.collider.width / 2) * p.scale;

            const dx = p.x - playerX;
            const dy = p.y - playerY;

            const r = playerRadius + mushroomRadius;

            if (dx * dx + dy * dy < r * r) {
                this.#onMushroomCollected(entity, i);
                return;
            }
        }
    }

    #onPlayerHit(tree) {
        const treeCount = this.entities.filter(e => e instanceof Tree).length;

        this.game.state.lastRunStats = {
            level: this.game.state.level,
            time: this.game.state.getFormattedTime(),
            trees: treeCount,
            speed: this.game.speed,
            carrots: this.game.state.carrotsCollected,
        };

        // Сохраняем текущую сцену для использования в GameOverScene
        this.game.state.backgroundScene = this;
        this.game.sceneManager.setScene('gameover');
    }

    #onCarrotCollected(carrot, index) {
        // увеличиваем счетчик морковок
        this.game.state.carrotsCollected++;
        
        // удаляем морковку из массива сущностей
        this.entities.splice(index, 1);
    }

    #onMushroomCollected(mushroom, index) {
        // снижаем скорость на 0.3
        this.game.speed = Math.max(0.5, this.game.speed - 0.3); // минимальная скорость 0.5
        
        // активируем уведомление о снижении скорости
        this.mushroomNotification = {
            text: '🍄 Speed Reduced!',
            duration: 3.0, // 3 секунды
            elapsed: 0
        };
        
        // удаляем мухомор из массива сущностей
        this.entities.splice(index, 1);
    }
}
