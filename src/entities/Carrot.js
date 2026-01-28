import { Entity } from './Entity.js';

export class Carrot extends Entity {
    constructor(x, z) {
        super(x, z);
        this.renderable = {
            type: 'carrot'
        };
        this.collider = {
            width: 20,
            height: 30
        };
    }
}
