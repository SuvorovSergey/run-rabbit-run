import { Entity } from './Entity.js';
export class Tree extends Entity {
    constructor(x, z) {
        super(x, z);

        const maxTrunkH = 400;
        const minTrunkH = 200;

        const trunkHeight = minTrunkH + Math.random() * (maxTrunkH - minTrunkH);
        const trunkWidth = 15 + Math.random() * 15;

        const crownScale = 2.2 + (trunkHeight / maxTrunkH) * 0.8 * Math.random();

        this.renderable = {
            type: 'tree',
            crownScale: crownScale,
            crownColor: `rgb(0, ${100 + Math.floor(Math.random() * 155)}, 0)`,
            trunkColor: `rgb(${70 + Math.floor(Math.random() * 60)}, 
                    ${30 + Math.floor(Math.random() * 40)}, 
                    ${Math.floor(Math.random() * 20)})`,
            trunkWidth: trunkWidth,
            trunkHeight: trunkHeight,
        };

        this.collider = {
            width: trunkWidth
        };
    }
}