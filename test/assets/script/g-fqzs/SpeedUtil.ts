
export interface RoundConfig {
    maxSpeed: number;//每个格子的最短停留时间
    littleSpeed: number;//每个格子的最长停留时间
    spliceCount: number;//速度曲线的切片数
    keepMaxTime: number;//保持最大速度的时间
    lessSpeedFunc: Function;//减速的速度曲线函数获取
    addSpeedRunc: Function;//加速的速度曲线函数
    startAniCount: number;//开始动画加速的切片初始位置
    isDelayTarget?: boolean;//是否延时展现目标
}

export enum AnmationState {
    FirstAnimation = 0,
    SecondAnimation,
    ThreeAnimation,
    OtherAnimation,
    NoneAnimation,//无动画
}

export const firstAnimationTime = 4.2;//第一波动画时间，转圈加速到保持速度
export const secondAnmationTime = 4.8;//第二波动画时间，转圈减速到停止
export const threeAnimationTime = 3;//第三波动画，区域闪嗦和动物中奖表情
export const otherAnimationTime = 5;//第四波动画，输赢数字和筹码飞动

export const RoundConfigData_length = 3;//可选抽奖动画配置个数
export const RoundConfigData: { [key: number]: RoundConfig } = {
    0: {
        maxSpeed: 0.05,
        littleSpeed: 1.6,
        spliceCount: 15,
        keepMaxTime: 3.5,
        lessSpeedFunc: easeInExpo,
        addSpeedRunc: easeOutCubic,
        startAniCount: 5,
        isDelayTarget: false
    },
    1: {
        maxSpeed: 0.04,
        littleSpeed: 0.9,
        spliceCount: 12,
        keepMaxTime: 3.5,
        lessSpeedFunc: easeInQuad,
        addSpeedRunc: easeOutCirc,
        startAniCount: 8,
        isDelayTarget: false
    },
    2: {
        maxSpeed: 0.05,
        littleSpeed: 1.0,
        spliceCount: 12,
        keepMaxTime: 3.5,
        lessSpeedFunc: easeInCubic,
        addSpeedRunc: easeOutExpo,
        startAniCount: 8,
        isDelayTarget: false
    }
}


/**参考网站  https://easings.net/   */
////////////////////////////////////////////////////////////////////以下是曲线函数/////////////////////////////////////////////////////////////////////
/**
 * 速度由快变慢
 * @param x 时间
 */
export function easeOutQuad(x: number): number {
    return 1 - (1 - x) * (1 - x);
}

/**
 *速度由快变慢
 * @param x 时间
 */
export function easeOutCubic(x: number): number {
    return 1 - Math.pow(1 - x, 3);
}

/**
 *速度由快变慢
 * @param x 时间
 */
export function easeOutQuart(x: number): number {
    return 1 - Math.pow(1 - x, 4);
}

/**
 *速度由快变慢
 * @param x 时间
 */
export function easeOutQuint(x: number): number {
    return 1 - Math.pow(1 - x, 5);
}



/**
 * 速度由慢到快
 * @param x 时间
 */
export function easeInSine(x: number): number {
    return 1 - Math.cos((x * Math.PI) / 2);
}
/**
 * 速度由慢到快
 * @param x 时间
 */
export function easeInCubic(x: number): number {
    return x * x * x;
}
export function easeInQuint(x: number): number {
    return x * x * x * x * x;
}
export function easeInCirc(x: number): number {
    return 1 - Math.sqrt(1 - Math.pow(x, 2));
}


export function easeInOutQuad(x: number): number {
    return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
}

export function easeOutSine(x: number): number {
    return Math.sin((x * Math.PI) / 2);
}


export function easeOutCirc(x: number): number {
    return Math.sqrt(1 - Math.pow(x - 1, 2));
}
export function easeInOutCirc(x: number): number {
    return x < 0.5
        ? (1 - Math.sqrt(1 - Math.pow(2 * x, 2))) / 2
        : (Math.sqrt(1 - Math.pow(-2 * x + 2, 2)) + 1) / 2;
}


export function easeInQuad(x: number): number {
    return x * x;
}
export function easeInQuart(x: number): number {
    return x * x * x * x;
}
export function easeInExpo(x: number): number {
    return x === 0 ? 0 : Math.pow(2, 10 * x - 10);
}

export function easeOutExpo(x: number): number {
    return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
}