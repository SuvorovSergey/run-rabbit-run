export class GameState {
    constructor(config) {
        this.treeCount = config.TREE_INITIAL_COUNT || 10;
        this.seconds = 0;
        this.isPaused = false;
        this.level = 1;
    }

    update(deltaTime) {
        if (!this.isPaused) {
            this.seconds += deltaTime;
        }
    }

    reset() {
        this.seconds = 0;
    }

    // форматирование времени в MM:SS
    getFormattedTime() {
        const totalSeconds = Math.floor(this.seconds);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    togglePause() {
        this.isPaused = !this.isPaused;
    }
}