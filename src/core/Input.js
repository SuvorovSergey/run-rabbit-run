export class Input {
    constructor() {
        this.keys = new Set();          // сейчас нажатые клавиши
        this.keysPressed = new Set();   // нажатые в этом кадре
        this.keysReleased = new Set();  // отпущенные в этом кадре
        
        // Touch controls
        this.touches = new Map();       // активные касания
        this.touchZones = new Map();    // зоны управления
        this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

        this.setupListeners();
        this.setupTouchControls();
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
        
        // Touch event listeners
        document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
        
        // Mouse event listeners for desktop testing
        document.addEventListener('mousedown', this.handleMouseDown.bind(this));
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        document.addEventListener('mouseup', this.handleMouseUp.bind(this));
    }

    setupTouchControls() {
        // Определяем зоны управления для мобильных устройств
        const updateTouchZones = () => {
            const canvas = document.getElementById('game');
            if (!canvas) return;
            
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            
            // Конвертируем координаты в canvas координаты
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            
            // Зона движения влево (левая треть канваса)
            this.touchZones.set('left', {
                x: 0,
                y: 0,
                width: canvasWidth / 3,
                height: canvasHeight
            });
            
            // Зона движения вправо (правая треть канваса)
            this.touchZones.set('right', {
                x: (canvasWidth / 3) * 2,
                y: 0,
                width: canvasWidth / 3,
                height: canvasHeight
            });
            
            // Сохраняем коэффициенты масштабирования для конвертации координат
            this.scaleX = scaleX;
            this.scaleY = scaleY;
            this.canvasRect = rect;
        };
        
        updateTouchZones();
        window.addEventListener('resize', updateTouchZones);
    }

    handleTouchStart(event) {
        event.preventDefault();
        
        // Проверяем, что touch zones уже инициализированы
        if (!this.canvasRect || !this.scaleX || !this.scaleY) {
            return;
        }
        
        for (const touch of event.changedTouches) {
            // Конвертируем координаты касания в координаты канваса
            const canvasX = (touch.clientX - this.canvasRect.left) * this.scaleX;
            const canvasY = (touch.clientY - this.canvasRect.top) * this.scaleY;
            
            this.touches.set(touch.identifier, {
                x: canvasX,
                y: canvasY,
                startX: canvasX,
                startY: canvasY
            });
            
            // Проверяем зону касания
            const zone = this.getTouchZone(canvasX, canvasY);
            if (zone === 'left') {
                this.keys.add('ArrowLeft');
                this.keysPressed.add('ArrowLeft');
            } else if (zone === 'right') {
                this.keys.add('ArrowRight');
                this.keysPressed.add('ArrowRight');
            }
        }
    }

    handleTouchMove(event) {
        event.preventDefault();
        
        // Проверяем, что touch zones уже инициализированы
        if (!this.canvasRect || !this.scaleX || !this.scaleY) {
            return;
        }
        
        for (const touch of event.changedTouches) {
            const existingTouch = this.touches.get(touch.identifier);
            if (existingTouch) {
                // Конвертируем координаты касания в координаты канваса
                const canvasX = (touch.clientX - this.canvasRect.left) * this.scaleX;
                const canvasY = (touch.clientY - this.canvasRect.top) * this.scaleY;
                
                existingTouch.x = canvasX;
                existingTouch.y = canvasY;
                
                // Обновляем состояние клавиш в зависимости от новой позиции
                const oldZone = this.getTouchZone(existingTouch.startX, existingTouch.startY);
                const newZone = this.getTouchZone(canvasX, canvasY);
                
                if (oldZone !== newZone) {
                    // Удаляем старые клавиши
                    if (oldZone === 'left') {
                        this.keys.delete('ArrowLeft');
                    } else if (oldZone === 'right') {
                        this.keys.delete('ArrowRight');
                    }
                    
                    // Добавляем новые клавиши
                    if (newZone === 'left') {
                        this.keys.add('ArrowLeft');
                    } else if (newZone === 'right') {
                        this.keys.add('ArrowRight');
                    }
                }
            }
        }
    }

    handleTouchEnd(event) {
        event.preventDefault();
        
        for (const touch of event.changedTouches) {
            const existingTouch = this.touches.get(touch.identifier);
            if (existingTouch) {
                const zone = this.getTouchZone(existingTouch.x, existingTouch.y);
                
                if (zone === 'left') {
                    this.keys.delete('ArrowLeft');
                } else if (zone === 'right') {
                    this.keys.delete('ArrowRight');
                }
                
                this.touches.delete(touch.identifier);
            }
        }
    }

    handleMouseDown(event) {
        // Проверяем, что touch zones уже инициализированы
        if (!this.canvasRect || !this.scaleX || !this.scaleY) {
            return;
        }
        
        // Конвертируем координаты мыши в координаты канваса
        const canvasX = (event.clientX - this.canvasRect.left) * this.scaleX;
        const canvasY = (event.clientY - this.canvasRect.top) * this.scaleY;
        
        const zone = this.getTouchZone(canvasX, canvasY);
        if (zone === 'left') {
            this.keys.add('ArrowLeft');
            this.keysPressed.add('ArrowLeft');
        } else if (zone === 'right') {
            this.keys.add('ArrowRight');
            this.keysPressed.add('ArrowRight');
        }
        
        this.touches.set('mouse', {
            x: canvasX,
            y: canvasY,
            startX: canvasX,
            startY: canvasY
        });
    }

    handleMouseMove(event) {
        const existingTouch = this.touches.get('mouse');
        if (existingTouch && event.buttons === 1) {
            // Проверяем, что touch zones уже инициализированы
            if (!this.canvasRect || !this.scaleX || !this.scaleY) {
                return;
            }
            
            // Конвертируем координаты мыши в координаты канваса
            const canvasX = (event.clientX - this.canvasRect.left) * this.scaleX;
            const canvasY = (event.clientY - this.canvasRect.top) * this.scaleY;
            
            const oldZone = this.getTouchZone(existingTouch.startX, existingTouch.startY);
            const newZone = this.getTouchZone(canvasX, canvasY);
            
            if (oldZone !== newZone) {
                if (oldZone === 'left') {
                    this.keys.delete('ArrowLeft');
                } else if (oldZone === 'right') {
                    this.keys.delete('ArrowRight');
                }
                
                if (newZone === 'left') {
                    this.keys.add('ArrowLeft');
                } else if (newZone === 'right') {
                    this.keys.add('ArrowRight');
                }
            }
            
            existingTouch.x = canvasX;
            existingTouch.y = canvasY;
        }
    }

    handleMouseUp(event) {
        const existingTouch = this.touches.get('mouse');
        if (existingTouch) {
            const zone = this.getTouchZone(existingTouch.x, existingTouch.y);
            
            if (zone === 'left') {
                this.keys.delete('ArrowLeft');
            } else if (zone === 'right') {
                this.keys.delete('ArrowRight');
            }
            
            this.touches.delete('mouse');
        }
    }

    getTouchZone(x, y) {
        for (const [zoneName, zone] of this.touchZones) {
            if (x >= zone.x && x <= zone.x + zone.width &&
                y >= zone.y && y <= zone.y + zone.height) {
                return zoneName;
            }
        }
        return null;
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
