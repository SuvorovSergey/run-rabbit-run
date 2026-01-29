import { CONFIG } from '../Config.js';
import { ThemeManager } from '../themes/ThemeManager.js';

export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.canvas.width = CONFIG.CANVAS_WIDTH;
        this.canvas.height = CONFIG.CANVAS_HEIGHT;
        this.ctx = canvas.getContext('2d');
        
        // Инициализация системы тем
        this.themeManager = new ThemeManager();
        this.themeManager.setRandomTheme();
        
        // Генерируем звезды один раз при инициализации
        this.stars = this.generateStars();
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }


    drawText(text, x, y, options = {}) {
        const {
            color = 'white',
            font = '20px Arial',
            align = 'left',
            shadow = false,
            shadowColor = 'black',
            shadowBlur = 4
        } = options;

        this.ctx.save();

        this.ctx.fillStyle = color;
        this.ctx.font = font;
        this.ctx.textAlign = align;
        this.ctx.textBaseline = 'top';

        if (shadow) {
            this.ctx.shadowColor = shadowColor;
            this.ctx.shadowBlur = shadowBlur;
            this.ctx.shadowOffsetX = 2;
            this.ctx.shadowOffsetY = 2;
        }

        this.ctx.fillText(text, x, y);

        this.ctx.restore();
    }


    getTextWidth(text, size = 24) {
        let current = this.ctx.font;
        this.ctx.font = `${size}px Arial`;

        let width = this.ctx.measureText(text).width;
        this.ctx.font = current;

        return width;
    }

    drawSky() {
        const colors = this.themeManager.getInterpolatedColors().sky;
        const horizonY = this.canvas.height * 0.4;
        
        const gradient = this.ctx.createLinearGradient(0, 0, 0, horizonY);
        gradient.addColorStop(0, colors.top);
        gradient.addColorStop(0.5, colors.middle);
        gradient.addColorStop(1, colors.bottom);
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, horizonY);
    }

    drawGround() {
        const groundColor = this.themeManager.getInterpolatedColors().ground;
        const horizonY = this.canvas.height * 0.4;
        
        this.ctx.fillStyle = groundColor;
        this.ctx.fillRect(0, horizonY, this.canvas.width, this.canvas.height - horizonY);
    }

    generateStars() {
        const stars = [];
        const horizonY = this.canvas.height * 0.4;
        const margin = 50;
        
        // Генерируем максимальное количество звезд для всех сценариев
        // Ночная тема: 150 обычных + 20 ярких        
        
        // Обычные звезды
        for (let i = 0; i < 150; i++) {
            stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * (horizonY - margin),
                size: Math.random() * 2,
                opacity: 0.3 + Math.random() * 0.7
            });
        }
        
        // Яркие звезды со свечением
        for (let i = 0; i < 20; i++) {
            stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * (horizonY - margin),
                size: 1.5 + Math.random() * 1.5,
                bright: true
            });
        }
        
        return stars;
    }

    drawStars() {
        const starOpacity = this.themeManager.getInterpolatedColors().starOpacity;
        
        if (starOpacity === 0) return; // Если звезды не видны, не рисуем их
        
        this.ctx.save();
        this.ctx.globalAlpha = starOpacity;
        
        this.stars.forEach(star => {
            if (star.bright) {
                // Рисуем яркую звезду со свечением
                const gradient = this.ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.size * 3);
                gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
                gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)');
                gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                
                this.ctx.fillStyle = gradient;
                this.ctx.beginPath();
                this.ctx.arc(star.x, star.y, star.size * 3, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Центральная точка звезды
                this.ctx.fillStyle = 'white';
                this.ctx.beginPath();
                this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                this.ctx.fill();
            } else {
                // Рисуем обычную звезду
                this.ctx.save();
                this.ctx.globalAlpha = star.opacity * starOpacity;
                this.ctx.fillStyle = 'white';
                this.ctx.beginPath();
                this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.restore();
            }
        });
        
        this.ctx.restore();
    }

    drawHorizon(y) {
        const colors = this.themeManager.getInterpolatedColors().horizon;
        
        this.ctx.save()
        this.ctx.beginPath();
        this.ctx.moveTo(0, y);
        this.ctx.lineTo(this.canvas.width, y);
        
        // Создаем градиент для линии горизонта на основе текущей темы
        const gradient = this.ctx.createLinearGradient(0, y - 2, 0, y + 2);
        gradient.addColorStop(0, colors.top);
        gradient.addColorStop(0.5, colors.middle);
        gradient.addColorStop(1, colors.bottom);
        
        this.ctx.strokeStyle = gradient;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        this.ctx.closePath();
        this.ctx.restore();
    }

    drawTree(x, y, scale, options) {
        const { crownColor, crownScale, crownType, crownWidth, crownHeight, trunkColor, trunkWidth, trunkHeight } = options;
        
        // Вычисляем фактор затемнения на основе расстояния (scale)
        // Чем меньше scale, тем дальше дерево и тем темнее оно должно быть
        const darknessFactor = Math.max(0.3, Math.min(1, scale * 2));
        
        // Применяем затемнение к цветам
        const applyDarkness = (color) => {
            const rgb = color.match(/\d+/g);
            if (rgb) {
                const r = Math.floor(rgb[0] * darknessFactor);
                const g = Math.floor(rgb[1] * darknessFactor);
                const b = Math.floor(rgb[2] * darknessFactor);
                return `rgb(${r}, ${g}, ${b})`;
            }
            return color;
        };
        
        const darkenedCrownColor = applyDarkness(crownColor);
        const darkenedTrunkColor = applyDarkness(trunkColor);
        
        const trunkW = trunkWidth * scale;
        const trunkH = trunkHeight * scale;

        const crownS = scale * crownScale;
        const crownW = crownWidth * crownS;
        const crownH = crownHeight * crownS;

        this.ctx.save()

        // ствол - рисуем ВВЕРХ от точки y (основание на земле)
        this.ctx.fillStyle = darkenedTrunkColor;
        this.ctx.fillRect(
            x - trunkW / 2,
            y - trunkH,
            trunkW,
            trunkH
        );

        // крона - над стволом
        this.ctx.fillStyle = darkenedCrownColor;
        this.ctx.beginPath();
        
        switch (crownType) {
            case 'circle':
                this.ctx.arc(
                    x,
                    y - trunkH - crownH / 2 + 10,
                    crownW / 2,
                    0, Math.PI * 2
                );
                break;
            case 'triangle':
                this.ctx.moveTo(x, y - trunkH - crownH + 10);
                this.ctx.lineTo(x - crownW / 2, y - trunkH + 10);
                this.ctx.lineTo(x + crownW / 2, y - trunkH + 10);
                this.ctx.closePath();
                break;
            case 'rect':
                this.ctx.rect(
                    x - crownW / 2,
                    y - trunkH - crownH + 10,
                    crownW,
                    crownH
                );
                break;
            default: // ellipse
                this.ctx.ellipse(
                    x,
                    y - trunkH - crownH / 2 + 10,
                    crownW / 2,
                    crownH / 2,
                    0, 0, Math.PI * 2
                );
        }
        
        this.ctx.fill();
        this.ctx.restore();
    }

    drawRabbit(x, y, time) {
        const s = 50;

        // фаза анимации
        const t = time * 16;
        const bounce = Math.sin(t) * 4;

        this.ctx.save();
        this.ctx.translate(x, y + bounce);

        // тело        
        this.ctx.fillStyle = '#ddd';
        this.ctx.beginPath();
        this.ctx.ellipse(0, 10, s * 0.35, s * 0.45, 0, 0, Math.PI * 2);
        this.ctx.fill();


        // голова
        this.ctx.beginPath();
        this.ctx.ellipse(0, -20, s * 0.25, s * 0.25, 0, 0, Math.PI * 2);
        this.ctx.fill();


        // уши (анимация)        
        const earSpread = Math.sin(t + Math.PI / 2) * 6;

        this.ctx.fillStyle = '#ccc';
        this.ctx.beginPath();
        this.ctx.ellipse(-10 - earSpread, -50, 6, 20, -0.1, 0, Math.PI * 2);
        this.ctx.ellipse(10 + earSpread, -50, 6, 20, 0.1, 0, Math.PI * 2);
        this.ctx.fill();

        // задние лапы (мелькание)
        const runPhase = Math.sin(t);
        const legY = 35;
        const legOffset = 10;
        const legLift = Math.max(0, runPhase) * 8;

        this.ctx.fillStyle = '#bbb';

        // левая лапа
        if (runPhase > -0.2) {
            this.ctx.beginPath();
            this.ctx.ellipse(
                -legOffset,
                legY + legLift,
                6,
                14,
                0,
                0,
                Math.PI * 2
            );
            this.ctx.fill();
        }

        // правая лапа
        if (runPhase > -0.2) {
            this.ctx.beginPath();
            this.ctx.ellipse(
                legOffset,
                legY + legLift,
                6,
                14,
                0,
                0,
                Math.PI * 2
            );
            this.ctx.fill();
        }

        // хвост         
        const tailPulse = 1 + Math.sin(t * 2) * 0.1;

        this.ctx.fillStyle = '#fff';
        this.ctx.beginPath();
        this.ctx.arc(0, 25, 8 * tailPulse, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.restore();
    }

    drawCarrot(x, y, scale) {
        const carrotWidth = 12 * scale;
        const carrotHeight = 25 * scale;
        const greenWidth = 8 * scale;
        const greenHeight = 6 * scale;

        // Вычисляем фактор затемнения на основе расстояния
        const darknessFactor = Math.max(0.4, Math.min(1, scale * 2));

        this.ctx.save();

        // Рисуем морковную часть
        const orangeColor = `rgba(255, ${Math.floor(140 * darknessFactor)}, 0, 1)`;
        this.ctx.fillStyle = orangeColor;
        
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(x - carrotWidth / 2, y + carrotHeight);
        this.ctx.lineTo(x + carrotWidth / 2, y + carrotHeight);
        this.ctx.closePath();
        this.ctx.fill();

        // Рисуем зеленую ботву
        const greenColor = `rgba(0, ${Math.floor(150 * darknessFactor)}, 0, 1)`;
        this.ctx.fillStyle = greenColor;
        
        this.ctx.beginPath();
        this.ctx.ellipse(x, y - greenHeight / 2, greenWidth, greenHeight, 0, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.restore();
    }

    drawMushroom(x, y, scale) {
        const capWidth = 20 * scale;
        const capHeight = 10 * scale;
        const stemWidth = 8 * scale;
        const stemHeight = 12 * scale;

        // Вычисляем фактор затемнения на основе расстояния
        const darknessFactor = Math.max(0.4, Math.min(1, scale * 2));

        this.ctx.save();

        // Рисуем ножку гриба
        const stemColor = `rgba(255, 255, 255, ${0.9 * darknessFactor})`;
        this.ctx.fillStyle = stemColor;
        
        this.ctx.beginPath();
        this.ctx.rect(x - stemWidth / 2, y, stemWidth, stemHeight);
        this.ctx.fill();

        // Рисуем шляпку гриба (красная с белыми точками)
        const capColor = `rgba(220, 20, 60, ${0.9 * darknessFactor})`;
        this.ctx.fillStyle = capColor;
        
        this.ctx.beginPath();
        this.ctx.ellipse(x, y - capHeight / 2, capWidth / 2, capHeight, 0, 0, Math.PI * 2);
        this.ctx.fill();

        // Рисуем белые точки на шляпке
        const dotColor = `rgba(255, 255, 255, ${0.8 * darknessFactor})`;
        this.ctx.fillStyle = dotColor;
        
        // Центральная точка
        this.ctx.beginPath();
        this.ctx.arc(x, y - capHeight / 2, 2 * scale, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Боковые точки
        this.ctx.beginPath();
        this.ctx.arc(x - capWidth / 4, y - capHeight / 2, 1.5 * scale, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.arc(x + capWidth / 4, y - capHeight / 2, 1.5 * scale, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.restore();
    }
}
