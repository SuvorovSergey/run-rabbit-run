import { Entity } from './Entity.js';

export class Mushroom extends Entity {
    constructor(x, z) {
        super(x, z);
        this.renderable = {
            type: 'mushroom'
        };
        this.collider = {
            width: 25,
            height: 25
        };
    }
}
