import { Entity } from './Entity.js';
export class Tree extends Entity {
    constructor(x, z) {
        super(x, z);

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
            crownColor: `rgb(0, ${20 + Math.floor(Math.random() * 60)}, 0)`, // темная зелень для ночи
            trunkColor: `rgb(${20 + Math.floor(Math.random() * 40)}, 
                    ${10 + Math.floor(Math.random() * 20)}, 
                    ${5 + Math.floor(Math.random() * 10)})`, // темный коричневый ствол
            trunkWidth: trunkWidth,
            trunkHeight: trunkHeight,
        };

        this.collider = {
            width: trunkWidth
        };
    }
}