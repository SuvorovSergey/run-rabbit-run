export class Camera {
    constructor(config) {
        this.width = config.CANVAS_WIDTH;
        this.height = config.CANVAS_HEIGHT;

        this.horizonY = this.height * 0.6;

        this.depth = 50;      // сила перспективы
        this.playerX = 0;     // позиция игрока в мире
    }

    project(entity) {
        const scale = this.depth / (entity.z + 1);

        return {
            x: this.width / 2 + (entity.x - this.playerX) * scale,
            y: this.horizonY - 150 * scale,
            scale
        };
    }
}