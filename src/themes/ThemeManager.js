import { NightTheme } from './NightTheme.js';
import { MorningTheme } from './MorningTheme.js';
import { DayTheme } from './DayTheme.js';
import { EveningTheme } from './EveningTheme.js';

export class ThemeManager {
    constructor() {
        this.themes = new Map();
        this.currentTheme = null;
        this.nextTheme = null;
        this.transitionProgress = 0;
        this.isTransitioning = false;
        this.transitionDuration = 2.0; // 2 секунды на переход
        this.autoSwitchInterval = 40.0; // 40 секунд между сменами тем
        this.timeSinceLastSwitch = 0;
        this.autoSwitchEnabled = true;
        
        // Регистрируем доступные темы
        this.registerTheme('night', new NightTheme());
        this.registerTheme('morning', new MorningTheme());
        this.registerTheme('day', new DayTheme());
        this.registerTheme('evening', new EveningTheme());
    }

    registerTheme(name, theme) {
        this.themes.set(name, theme);
    }

    setRandomTheme() {
        const themeNames = Array.from(this.themes.keys());
        const randomName = themeNames[Math.floor(Math.random() * themeNames.length)];
        this.currentTheme = this.themes.get(randomName);
        return this.currentTheme;
    }

    setTheme(name) {
        if (this.themes.has(name)) {
            this.currentTheme = this.themes.get(name);
            return this.currentTheme;
        }
        throw new Error(`Theme '${name}' not found`);
    }

    startThemeTransition() {
        if (this.isTransitioning) return;
        
        // Выбираем следующую тему (циклически)
        const themeNames = Array.from(this.themes.keys());
        const currentIndex = themeNames.findIndex(name => this.themes.get(name) === this.currentTheme);
        const nextIndex = (currentIndex + 1) % themeNames.length;
        
        this.nextTheme = this.themes.get(themeNames[nextIndex]);
        this.transitionProgress = 0;
        this.isTransitioning = true;
    }

    updateTransition(deltaTime) {
        if (!this.isTransitioning) return;
        
        this.transitionProgress += deltaTime / this.transitionDuration;
        
        if (this.transitionProgress >= 1) {
            this.transitionProgress = 1;
            this.currentTheme = this.nextTheme;
            this.nextTheme = null;
            this.isTransitioning = false;
            this.timeSinceLastSwitch = 0; // Сбрасываем таймер после завершения перехода
        }
    }

    updateAutoSwitch(deltaTime) {
        if (!this.autoSwitchEnabled || this.isTransitioning) return;
        
        this.timeSinceLastSwitch += deltaTime;
        
        if (this.timeSinceLastSwitch >= this.autoSwitchInterval) {
            this.startThemeTransition();
        }
    }

    getInterpolatedColors() {
        if (!this.isTransitioning) {
            const theme = this.currentTheme;
            return {
                sky: theme.getSkyColors(),
                horizon: theme.getHorizonColors(),
                ground: theme.getGroundColor(),
                tree: theme.getTreeColors(),
                starOpacity: theme.getStarOpacity()
            };
        }

        // Интерполяция между темами
        const t = this.smoothStep(this.transitionProgress);
        
        const currentColors = {
            sky: this.currentTheme.getSkyColors(),
            horizon: this.currentTheme.getHorizonColors(),
            ground: this.currentTheme.getGroundColor(),
            tree: this.currentTheme.getTreeColors(),
            starOpacity: this.currentTheme.getStarOpacity()
        };
        
        const nextColors = {
            sky: this.nextTheme.getSkyColors(),
            horizon: this.nextTheme.getHorizonColors(),
            ground: this.nextTheme.getGroundColor(),
            tree: this.nextTheme.getTreeColors(),
            starOpacity: this.nextTheme.getStarOpacity()
        };

        return {
            sky: {
                top: this.interpolateColor(currentColors.sky.top, nextColors.sky.top, t),
                middle: this.interpolateColor(currentColors.sky.middle, nextColors.sky.middle, t),
                bottom: this.interpolateColor(currentColors.sky.bottom, nextColors.sky.bottom, t)
            },
            horizon: {
                top: this.interpolateColor(currentColors.horizon.top, nextColors.horizon.top, t),
                middle: this.interpolateColor(currentColors.horizon.middle, nextColors.horizon.middle, t),
                bottom: this.interpolateColor(currentColors.horizon.bottom, nextColors.horizon.bottom, t)
            },
            ground: this.interpolateColor(currentColors.ground, nextColors.ground, t),
            tree: this.transitionProgress < 0.5 ? currentColors.tree : nextColors.tree,
            starOpacity: this.lerp(currentColors.starOpacity, nextColors.starOpacity, t)
        };
    }

    smoothStep(t) {
        return t * t * (3 - 2 * t);
    }

    interpolateColor(color1, color2, t) {
        const rgb1 = this.parseColor(color1);
        const rgb2 = this.parseColor(color2);
        
        const r = Math.round(this.lerp(rgb1.r, rgb2.r, t));
        const g = Math.round(this.lerp(rgb1.g, rgb2.g, t));
        const b = Math.round(this.lerp(rgb1.b, rgb2.b, t));
        
        if (color1.startsWith('rgba') || color2.startsWith('rgba')) {
            const a1 = rgb1.a || 1;
            const a2 = rgb2.a || 1;
            const a = this.lerp(a1, a2, t);
            return `rgba(${r}, ${g}, ${b}, ${a})`;
        }
        
        return `rgb(${r}, ${g}, ${b})`;
    }

    parseColor(color) {
        // Поддержка hex-цветов (#RRGGBB)
        if (color.startsWith('#')) {
            const hex = color.slice(1);
            return {
                r: parseInt(hex.substr(0, 2), 16),
                g: parseInt(hex.substr(2, 2), 16),
                b: parseInt(hex.substr(4, 2), 16),
                a: 1
            };
        }
        
        // Поддержка rgb/rgba цветов
        const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
        if (match) {
            return {
                r: parseInt(match[1]),
                g: parseInt(match[2]),
                b: parseInt(match[3]),
                a: parseFloat(match[4] || 1)
            };
        }
        
        return { r: 0, g: 0, b: 0, a: 1 };
    }

    lerp(a, b, t) {
        return a + (b - a) * t;
    }

    getCurrentTheme() {
        return this.currentTheme;
    }

    getTransitionState() {
        return {
            isTransitioning: this.isTransitioning,
            progress: this.transitionProgress,
            currentThemeName: this.currentTheme?.name || null,
            nextThemeName: this.nextTheme?.name || null
        };
    }

    // Для будущего расширения
    getAvailableThemes() {
        return Array.from(this.themes.keys());
    }
}
