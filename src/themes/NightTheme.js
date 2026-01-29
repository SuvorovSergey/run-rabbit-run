import { Theme } from './Theme.js';

export class NightTheme extends Theme {
    constructor() {
        super('night');
    }

    getSkyColors() {
        return {
            top: '#0C1445',
            middle: '#1e3c72',
            bottom: '#2a5298'
        };
    }

    getHorizonColors() {
        return {
            top: 'rgba(42, 82, 152, 0.3)',
            middle: 'rgba(30, 60, 114, 0.8)',
            bottom: 'rgba(12, 20, 69, 0.3)'
        };
    }

    getTreeColors() {
        return {
            crownGreen: { min: 20, max: 80 },
            trunkRed: { min: 20, max: 60 },
            trunkGreen: { min: 10, max: 30 },
            trunkBlue: { min: 5, max: 15 }
        };
    }

    getGroundColor() {
        return '#1a1a2e';
    }

    getStarOpacity() {
        return 1; // звезды полностью видны
    }

    getStarCount() {
        return { normal: 150, bright: 20 };
    }
}
