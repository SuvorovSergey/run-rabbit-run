export class Theme {
    constructor(name) {
        this.name = name;
    }

    // Методы для переопределения в дочерних темах
    getSkyColors() {
        throw new Error('getSkyColors() must be implemented in theme subclass');
    }

    getHorizonColors() {
        throw new Error('getHorizonColors() must be implemented in theme subclass');
    }

    getTreeColors() {
        throw new Error('getTreeColors() must be implemented in theme subclass');
    }

    getGroundColor() {
        throw new Error('getGroundColor() must be implemented in theme subclass');
    }

    getStarOpacity() {
        return 0; // по умолчанию звезды не видны
    }

    getStarCount() {
        return 0; // по умолчанию нет звезд
    }
}
