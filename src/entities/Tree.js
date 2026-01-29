import { Entity } from './Entity.js';
import { ThemeManager } from '../themes/ThemeManager.js';
export class Tree extends Entity {
    constructor(x, z, themeManager = null) {
        super(x, z);

        // Используем переданный ThemeManager или создаем временный для получения цветов
        const theme = themeManager ? themeManager.getCurrentTheme() : new ThemeManager().setRandomTheme();
        const treeColors = theme.getTreeColors();

        const maxTrunkH = 300;
        const minTrunkH = 200;

        const trunkHeight = minTrunkH + Math.random() * (maxTrunkH - minTrunkH);
        const trunkWidth = 15 + Math.random() * 15;

        const crownScale = 2.2 + (trunkHeight / maxTrunkH) * 0.8 * Math.random();
        
        // Добавляем разнообразие форм кроны
        const crownTypes = ['ellipse', 'circle', 'triangle'];
        const crownType = crownTypes[Math.floor(Math.random() * crownTypes.length)];
        
        // Параметры для разных форм кроны
        let crownWidth, crownHeight;
        switch (crownType) {
            case 'circle':
                crownWidth = 45 + Math.random() * 20;
                crownHeight = crownWidth;
                break;
            case 'triangle':
                crownWidth = 40 + Math.random() * 25;
                crownHeight = 60 + Math.random() * 30;
                break;
            default: // ellipse
                crownWidth = 50 + Math.random() * 15;
                crownHeight = 70 + Math.random() * 20;
        }

        this.renderable = {
            type: 'tree',
            crownType: crownType,
            crownScale: crownScale,
            crownWidth: crownWidth,
            crownHeight: crownHeight,
            crownColor: `rgb(0, ${treeColors.crownGreen.min + Math.floor(Math.random() * (treeColors.crownGreen.max - treeColors.crownGreen.min))}, 0)`,
            trunkColor: `rgb(${treeColors.trunkRed.min + Math.floor(Math.random() * (treeColors.trunkRed.max - treeColors.trunkRed.min))}, 
                    ${treeColors.trunkGreen.min + Math.floor(Math.random() * (treeColors.trunkGreen.max - treeColors.trunkGreen.min))}, 
                    ${treeColors.trunkBlue.min + Math.floor(Math.random() * (treeColors.trunkBlue.max - treeColors.trunkBlue.min))})`,
            trunkWidth: trunkWidth,
            trunkHeight: trunkHeight,
        };

        this.collider = {
            width: trunkWidth
        };
    }
}