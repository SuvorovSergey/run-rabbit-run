export class Input {
    constructor() {
        this.keys = new Set();          // сейчас нажатые клавиши
        this.keysPressed = new Set();   // нажатые в этом кадре
        this.keysReleased = new Set();  // отпущенные в этом кадре

        this.setupListeners();
    }

    setupListeners() {
        document.addEventListener('keydown', (event) => {
            this.keys.add(event.code);
            this.keysPressed.add(event.code);
        });
        document.addEventListener('keyup', (event) => {
            this.keys.delete(event.code);
            this.keysReleased.add(event.code);
        });
    }

    isKeyDown(keyCode) {
        return this.keys.has(keyCode);
    }

    isKeyPressed(keyCode) {
        return this.keysPressed.has(keyCode);
    }

    isKeyReleased(keyCode) {
        return this.keysReleased.has(keyCode);
    }

    resetFrameState() {
        this.keysPressed.clear();
        this.keysReleased.clear();
    }
}   
