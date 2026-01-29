import { Theme } from './Theme.js';

export class DayTheme extends Theme {
    constructor() {
        super('day');
    }

    getSkyColors() {
        return {
            top: '#00BFFF', // яркий голубой
            middle: '#87CEEB', // светло-голубой
            bottom: '#E0F6FF' // очень светлый голубой у горизонта
        };
    }

    getHorizonColors() {
        return {
            top: 'rgba(224, 246, 255, 0.3)',
            middle: 'rgba(135, 206, 235, 0.6)',
            bottom: 'rgba(0, 191, 255, 0.3)'
        };
    }

    getTreeColors() {
        return {
            crownGreen: { min: 120, max: 220 }, // яркая летняя зелень
            trunkRed: { min: 80, max: 120 },
            trunkGreen: { min: 40, max: 60 },
            trunkBlue: { min: 15, max: 25 }
        };
    }

    getGroundColor() {
        return '#7CB342'; // более естественный зеленый травяной цвет
    }

    getStarOpacity() {
        return 0; // днем звезды не видны
    }

    getStarCount() {
        return { normal: 0, bright: 0 };
    }
}
