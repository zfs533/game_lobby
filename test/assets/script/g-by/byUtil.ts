const festivalIDs = [101, 102, 174, 178, 128, 182, 146, 150, 154, 158, 162, 166, 170, 186]; //动态活动炮台数组  ---周返利

const rebateGunArr = [128, 146, 150, 154, 158, 162, 166, 170, 174, 178, 182, 186]; //十二星座炮台

/**
 *
 * v1和v0的夹角，象限转换
 */
export function getQuadrantDegree(v0: cc.Vec2, v1: cc.Vec2): number {
    if (v0 == undefined) return 0
    let y = (v1.y - v0.y)
    let x = (v1.x - v0.x)
    let rad = Math.atan(y / x)
    let degree = rad2Deg(rad)
    //一四象限
    if (x >= 0) {
        return -degree
    } else {
        //二三象限
        return (-degree - 180)
    }
}
/**
 * v1和v0的夹角
 */
export function getDegree(v0: cc.Vec2, v1: cc.Vec2) {
    let y = (v1.y - v0.y);
    let x = (v1.x - v0.x);
    let rad = Math.atan(y / x);
    let degree = rad2Deg(rad);
    return degree;
}
/**
 * 弧度转角度
 */
export function rad2Deg(rad: number) {
    return (rad * 180 / Math.PI)
}
/**
 * 角度转弧度
 */
export function deg2Rad(deg: number) {
    return deg * Math.PI / 180
}

export function getFishKindType(type: number) {
    return type / 10
}

/**
 * 一个玩家创建30个瞄准线的点
 */
export function createDotLine(sp: cc.Node, dotArr: cc.Node[]) {
    for (var i = 0; i < 20; i++) {
        let pot = cc.instantiate(sp);
        dotArr.push(pot);
        sp.parent.addChild(pot, -1);
    }
}
/**
 * 隐藏瞄准线
 */
export function hideDotLine(dotArr: cc.Node[]) {
    dotArr.forEach(dot => { dot.active = false })
}
/**
 * 绘制锁定状态时的瞄准线
 * @param v0 炮台位置
 * @param v1 瞄准点位置
 * @param dotArr
 */
export function drawDotLine(v0: cc.Vec2, v1: cc.Vec2, dotArr: cc.Node[]) {
    let gap = 50//间隙
    let distance = v1.sub(v0).mag()//距离
    let count = distance / gap
    let gapx = (v1.x - v0.x) / count
    let gapy = (v1.y - v0.y) / count
    let curx = 0
    let cury = 0
    for (let i = 0; i < dotArr.length; i++) {
        if (i < 3) {
            continue
        } else if (i > count) {
            if (dotArr[i].active) {
                dotArr[i].active = false
            } else {
                return
            }
        } else {
            dotArr[i].active = true
            curx = v0.x + gapx * i
            cury = v0.y + gapy * i
            dotArr[i].x = curx
            dotArr[i].y = cury
        }
    }
}

let defsMax = {
    fishId: { max: 0x1fff, bitwise: 13 },
    bulletId: { max: 0x3fff, bitwise: 14 },
    massId: { max: 0x1f, bitwise: 5 },
    ratio: { max: 0x1f, bitwise: 5 },
    angle: { max: 0xff, bitwise: 8 },
    sign: { max: 0x1, bitwise: 1 },
    pos: { max: 0x3, bitwise: 2 }
}
/**
 * 处理发子弹消息
 */
export function dealFireMsg(angle: number, ratio: number, bulletId: number): number {
    //|sign|angle|ratio|bulletid|
    if (angle < -180) {
        angle = 360 + angle
    }
    angle = Math.round(angle)
    if (ratio < 0 || ratio > defsMax.ratio.max) console.error('ratio超出范围了！！！！！')
    if (angle < -defsMax.angle.max || ratio > defsMax.angle.max) console.error('angle超出范围了！！！！！')
    if (bulletId < 0 || ratio > defsMax.bulletId.max) console.error('bulletId超出范围了！！！！！')

    let sign = angle < 0 ? 1 : 0
    sign = sign << (defsMax.bulletId.bitwise + defsMax.ratio.bitwise + defsMax.angle.bitwise)
    angle = (Math.abs(angle) & defsMax.angle.max) << (defsMax.bulletId.bitwise + defsMax.ratio.bitwise)
    ratio = (ratio & defsMax.ratio.max) << defsMax.bulletId.bitwise
    bulletId = (bulletId & defsMax.bulletId.max) << 0
    return sign | angle | ratio | bulletId
}
/**
 * 处理击中消息
 */
export function dealHitMsg(massId: number, fishId: number, bulletId: number): number {
    //|massid|fishid|bulletid|
    if (massId < 0 || massId > defsMax.massId.max) console.error('massId超出范围了！！！！！');
    if (fishId < 0 || fishId > defsMax.fishId.max) console.error('fishid超出范围了！！！！！');
    if (bulletId < 0 || bulletId > defsMax.bulletId.max) console.error('bulletId超出范围了！！！！！');

    massId = (massId & defsMax.massId.max) << (defsMax.fishId.bitwise + defsMax.bulletId.bitwise);
    fishId = (fishId & defsMax.fishId.max) << defsMax.bulletId.bitwise;
    bulletId = (bulletId & defsMax.bulletId.max) << 0;
    return massId | fishId | bulletId;
}

export function resolveFireMsg(data: number) {
    // sign|angle|pos|ratio
    let sign = (data >> (defsMax.angle.bitwise + defsMax.pos.bitwise + defsMax.ratio.bitwise)) & defsMax.sign.max;
    let xangle = (data >> (defsMax.pos.bitwise + defsMax.ratio.bitwise)) & defsMax.angle.max;
    if (sign) xangle = -xangle;
    let xrPos = (data >> (defsMax.ratio.bitwise)) & defsMax.pos.max;
    let xratio = (data >> 0) & defsMax.ratio.max;
    let info = {
        angle: xangle,
        pos: xrPos,
        ratio: xratio
    }
    return info
}

// 获取是否为周返利炮台
export function isFestivalGuns(gunsID: number) {
    return (festivalIDs.indexOf(gunsID) >= 0);
}


//获取是否为十二星座炮台
export function isRebateGunArr(gunsID: number) {
    return (rebateGunArr.indexOf(gunsID) >= 0);
}


let fishDefs = [
    { type: 11, rate: 2, boom: "0.5", bodyType: 1, trajectory: [11, 14], group: true },
    { type: 12, rate: 3, boom: "0.333", bodyType: 1, trajectory: [12, 15], group: true },
    { type: 13, rate: 4, boom: "0.249", bodyType: 1, trajectory: [13, 16], group: true },

    { type: 21, rate: 5, boom: "0.2", bodyType: 2, trajectory: [21, 24], group: true },
    { type: 22, rate: 6, boom: "0.166", bodyType: 2, trajectory: [22, 25], group: true },
    { type: 23, rate: 7, boom: "0.142", bodyType: 2, trajectory: [23, 26], group: true },
    { type: 24, rate: 8, boom: "0.125", bodyType: 2, trajectory: [28, 27], group: true },
    { type: 25, rate: 9, boom: "0.111", bodyType: 2, trajectory: [29, 20], group: true },

    { type: 31, rate: 10, boom: "0.1", bodyType: 3, trajectory: [31, 36] },
    { type: 32, rate: 12, boom: "0.082", bodyType: 3, trajectory: [32, 37] },
    { type: 33, rate: 15, boom: "0.066", bodyType: 3, trajectory: [33, 38] },
    { type: 34, rate: 18, boom: "0.055", bodyType: 3, trajectory: [34, 39] },
    { type: 35, rate: 18, boom: "0.055", bodyType: 3, trajectory: [35, 30] },

    { type: 42, rate: 20, boom: "0.05", bodyType: 4, trajectory: [42, 41] },
    { type: 43, rate: 25, boom: "0.04", bodyType: 4, trajectory: [43, 47] },
    { type: 44, rate: 25, boom: "0.04", bodyType: 4, trajectory: [44, 48] },
    { type: 45, rate: 30, boom: "0.033", bodyType: 4, trajectory: [45, 49] },
    { type: 46, rate: 30, boom: "0.033", bodyType: 4, trajectory: [46, 40] },

    { type: 51, rate: 35, boom: "0.028", bodyType: 5, trajectory: [51, 54] },
    { type: 52, rate: 40, boom: "0.025", bodyType: 5, trajectory: [52, 55] },
    { type: 53, rate: 45, boom: "0.022", bodyType: 5, trajectory: [53, 56] },

    { type: 61, rate: 50, boom: "0.02", trajectory: [61, 66], cdTime: 22, gold: true },
    { type: 62, rate: 70, boom: "0.014", trajectory: [62, 67], cdTime: 37, gold: true },
    { type: 63, rate: 80, boom: "0.0125", trajectory: [63, 68], cdTime: 52, gold: true },
    { type: 64, rate: 100, boom: "0.01", trajectory: [64, 69], cdTime: 67, gold: true },
    { type: 65, rate: 200, boom: "0.005", trajectory: [65, 60], cdTime: 200, gold: true, isDelay: true },
    { type: 66, rate: 120, boom: "0.008", trajectory: [93, 98], cdTime: 50, gold: true },

    { type: 91, rate: 20, boom: "0.012", skillId: 1, trajectory: [91, 96], cdTime: 70, exclusive: true, },
    { type: 92, rate: 20, boom: "0.01", skillId: 2, trajectory: [92, 97], cdTime: 105, exclusive: true },
    { type: 94, rate: 10, boom: "0.08", skillId: 3, trajectory: [94, 99], cdTime: 115 },
    { type: 95, rate: 30, boom: "0.003", skillId: 4, trajectory: [95, 90], cdTime: 120, isDelay: true },

    { type: 71, rate: 40, boom: "0.025", trajectory: [71, 75], cdTime: 35, combination: true },
    { type: 72, rate: 60, boom: "0.0166", trajectory: [72, 76], cdTime: 45, combination: true },
    { type: 73, rate: 80, boom: "0.0125", trajectory: [73, 77], cdTime: 55, combination: true },
    { type: 74, rate: 90, boom: "0.0111", trajectory: [74, 78], cdTime: 75, combination: true },
];

//鱼种类倍数查询
export function getFishRateBytype(type: number) {
    for (let i = 0; i < fishDefs.length; i++) {
        if (type == fishDefs[i].type) {
            return fishDefs[i];
        }
    }
}