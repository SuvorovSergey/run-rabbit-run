export const AUDIO_CONFIG = {
    master: {
        volume: 0.6,
        fadeDuration: 2.0
    },
    
    ambience: {
        morning: { volume: 1.0, file: '../../assets/sounds/morning_forest.mp3' },
        day: { volume: 1.0, file: '../../assets/sounds/day_forest.mp3' },
        rain: { volume: 1.0, file: '../../assets/sounds/rain_forest.mp3' },
        night: [
            { volume: 1.0, file: '../../assets/sounds/night_forest.mp3' },
            { volume: 1.0, file: '../../assets/sounds/night_forest2.mp3' }
        ]
    },
    
    cuckoo: {
        volume: 0.9,
        fadeInDuration: 0.6,
        minInterval: 12,
        maxInterval: 28,
        file: '../../assets/sounds/cuckoo.mp3'
    },
    
    effects: {
        slam: {
            volume: 1.0,
            cooldown: 0.35,
            file: '../../assets/sounds/slam.mp3'
        },
        collect: {
            volume: 0.9,
            cooldown: 0.08,
            file: '../../assets/sounds/collect.mp3'
        }
    }
};
