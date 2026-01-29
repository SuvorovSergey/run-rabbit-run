import { Theme } from './Theme.js';

export class EveningTheme extends Theme {
    constructor() {
        super('evening');
    }

    getSkyColors() {
        return {
            top: '#FF6B35', // оранжево-красный
            middle: '#FF8C42', // теплый оранжевый
            bottom: '#FFB347' // светло-оранжевый у горизонта
        };
    }

    getHorizonColors() {
        return {
            top: 'rgba(255, 107, 53, 0.3)',
            middle: 'rgba(255, 140, 66, 0.6)',
            bottom: 'rgba(255, 179, 71, 0.3)'
        };
    }

    getTreeColors() {
        return {
            crownGreen: { min: 60, max: 120 }, // приглушенная зелень вечера
            trunkRed: { min: 50, max: 80 },
            trunkGreen: { min: 25, max: 40 },
            trunkBlue: { min: 10, max: 18 }
        };
    }

    getGroundColor() {
        return '#CD853F';
    }

    getStarOpacity() {
        return 0.3; // вечером начинают появляться первые звезды
    }

    getStarCount() {
        return { normal: 30, bright: 5 }; // немного звезд
    }
}
