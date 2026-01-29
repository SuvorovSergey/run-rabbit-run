import { Theme } from './Theme.js';

export class MorningTheme extends Theme {
    constructor() {
        super('morning');
    }

    getSkyColors() {
        return {
            top: '#87CEEB', // светло-голубой
            middle: '#98D8E8', // чуть темнее
            bottom: '#FDB813' // оранжево-желтый у горизонта
        };
    }

    getHorizonColors() {
        return {
            top: 'rgba(253, 184, 19, 0.3)',
            middle: 'rgba(255, 140, 0, 0.6)',
            bottom: 'rgba(255, 69, 0, 0.3)'
        };
    }

    getTreeColors() {
        return {
            crownGreen: { min: 80, max: 180 }, // яркая зелень утра
            trunkRed: { min: 60, max: 100 },
            trunkGreen: { min: 30, max: 50 },
            trunkBlue: { min: 10, max: 20 }
        };
    }

    getGroundColor() {
        return '#8B7355'; // теплый коричневато-песочный для утра
    }

    getStarOpacity() {
        return 0; // утром звезды не видны
    }

    getStarCount() {
        return { normal: 0, bright: 0 };
    }
}
