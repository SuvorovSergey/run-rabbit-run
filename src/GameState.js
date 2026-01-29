export class GameState {
    constructor(config) {
        this.treeCount = config.TREE_INITIAL_COUNT || 10;
        this.seconds = 0;
        this.isPaused = false;
        this.level = 1;
        this.lastRunStats = null;
        this.backgroundScene = null;
        this.carrotsCollected = 0;
        this.noclipActive = false;
        this.noclipTimeLeft = 0;
        this.noclipNotification = null;
    }

    update(deltaTime) {
        if (!this.isPaused) {
            this.seconds += deltaTime;
            
            // Обновляем таймер noclip
            if (this.noclipActive) {
                this.noclipTimeLeft -= deltaTime;
                if (this.noclipTimeLeft <= 0) {
                    this.toggleNoclip();
                }
            }
            
            // Обновляем таймер уведомления
            if (this.noclipNotification) {
                this.noclipNotification.elapsed += deltaTime;
                if (this.noclipNotification.elapsed >= this.noclipNotification.duration) {
                    this.noclipNotification = null;
                }
            }
        }
    }

    reset() {
        this.seconds = 0;
        this.lastRunStats = null;
        this.backgroundScene = null;
        this.carrotsCollected = 0;
        this.noclipActive = false;
        this.noclipTimeLeft = 0;
        this.noclipNotification = null;
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

    toggleNoclip() {
        this.noclipActive = !this.noclipActive;
        
        if (this.noclipActive) {
            this.noclipTimeLeft = 180; // 3 минуты в секундах
            this.noclipNotification = {
                text: 'NOCLIP ACTIVATED - 3 minutes',
                duration: 3,
                elapsed: 0
            };
        } else {
            this.noclipTimeLeft = 0;
            this.noclipNotification = {
                text: 'NOCLIP DEACTIVATED',
                duration: 3,
                elapsed: 0
            };
        }
    }
}