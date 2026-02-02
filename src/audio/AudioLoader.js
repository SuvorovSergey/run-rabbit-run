export class AudioLoader {
    static createLoopingAudio(srcUrl) {
        const audio = new Audio(srcUrl);
        audio.loop = true;
        audio.preload = 'auto';
        audio.volume = 0;
        return audio;
    }

    static createOneShotAudio(srcUrl) {
        const audio = new Audio(srcUrl);
        audio.loop = false;
        audio.preload = 'auto';
        audio.volume = 0;
        return audio;
    }

    static safePlay(audio) {
        try {
            const play = audio.play();
            if (play && typeof play.catch === 'function') {
                play.catch(() => {});
            }
            return play;
        } catch {
            return null;
        }
    }

    static safePause(audio) {
        try {
            audio.pause();
        } catch {
            // Ignore errors
        }
    }
}
