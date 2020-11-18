import { GameId, DevStatus } from "./enum"
import { ItemNames } from "../common/enum";
export const DEFAULT_IP = [

    //第一层
    // "119.23.18.32:22286",
    // "47.94.5.161:22286",
    // "106.14.254.38:22286",
    // "123.176.98.18:22286",
    "123.176.98.18:22286",
    "47.112.195.136:22286",
    "101.200.240.177:22286",
    "47.101.164.26:22286"
    // //第二层
    // "119.23.10.17:22286",
    // "47.93.185.246:22286",
    // "106.14.255.157:22286",
    // //第三层
    // "120.77.84.44:22286",
    // "47.93.53.218:22286",
    // "139.224.228.201:22286",

]

export const COMMON_URL = "json/common.json";
export const VER_URL = "json/test_version.json";

/**
 * 本地服务器列表
 */
export const enum LOC_SERVER {
    CY = "ws://192.168.0.147:5101",
    YB = "ws://192.168.1.129:5101",
    LJ = "ws://192.168.0.52:5101",
    GY = "ws://192.168.0.123:5101", //郭阳
}

/**
 * 资源服地址
 */
export const RES_URL: { [n: string]: string[][] } = {
    [DevStatus.LOCAL_DEV]: [["http://192.168.1.9/client/alocal/"]],
    [DevStatus.OUT_DEV]: [["http://client-q3.zk2x.com/hy/"]],
    [DevStatus.OFFICIAL]: [
        ["https://cjc.vnydqaz.cn/", "https://abr.dwaefyr.cn/"],
        ["https://eab.xbgvyac.cn/", "http://34.92.63.156:31222/"],
        ["http://47.95.7.204:31222/", "http://47.101.192.173:31222/"],
        ["http://47.112.243.11:31222/"]
        //["http://34.92.89.110:8303/"]  //花样测试节点
    ],
}

// 存储设置（music：2位，sound：1位），扩展震动：3位
let EffectCfg = 3
export function musicCfg() {
    return (EffectCfg >> 1) & 0b01
}
export function soundCfg() {
    return EffectCfg & 0b01
}
export function loadEffectCfg() {
    let r = cc.sys.localStorage.getItem(ItemNames.effect)
    if (r == null)
        EffectCfg = 3
    else
        EffectCfg = r
}
/**
 * 开关音乐
 */
export function shiftMusic() {
    let n = 2
    EffectCfg = EffectCfg ^ (1 << (n - 1))// n位取非
    cc.sys.localStorage.setItem(ItemNames.effect, EffectCfg)
}
/**
 * 开关音效
 */
export function shiftSound() {
    EffectCfg = EffectCfg ^ 1
    cc.sys.localStorage.setItem(ItemNames.effect, EffectCfg)
}
/**
 * 转发节点
 */
export const SERVER_NODE: { [n: string]: string[] } = {
    [DevStatus.LOCAL_DEV]: [LOC_SERVER.CY],
    [DevStatus.OUT_DEV]: ['game-server-q3.zk2x.com:5101'],
    [DevStatus.OFFICIAL]: DEFAULT_IP,
}

/**
 * 游戏名字
 */
export const GAME_NAME: { [index: string]: string } = {
    [GameId.JH]: "拼三张",
    [GameId.QZNN]: "抢庄牛牛",
    [GameId.JDNN]: "经典牛牛",
    [GameId.BRNN]: "百人牛牛",
    [GameId.HH]: "红黑大战",
    [GameId.LH]: "龙虎斗",
    [GameId.DDZ]: "斗地主",
    [GameId.PDK]: "跑得快",
    [GameId.BY]: "欢乐捕鱼",
    [GameId.ERMJ]: "二人麻将",
    [GameId.DZPK]: "德州扑克",
    [GameId.HBSL]: "红包扫雷",
    [GameId.EBG]: "二八杠",
    [GameId.DFDC]: "多福多财",
    [GameId.BCBM]: "奔驰宝马",
    [GameId.FQZS]: "飞禽走兽",
    [GameId.QHB]: "红包扫雷",
}

export const SCENE_NAME: { [index: string]: string } = {
    [GameId.JH]: "game-jh",
    [GameId.QZNN]: "game-qznn",
    [GameId.JDNN]: "game-jdnn",
    [GameId.BRNN]: "game-brnn",
    [GameId.HH]: "game-hh",
    [GameId.LH]: "game-lh",
    [GameId.DDZ]: "game-ddz",
    [GameId.PDK]: "game-pdk",
    [GameId.BY]: "game-by",
    [GameId.ERMJ]: "game-ermj",
    [GameId.DZPK]: "game-dzpk",
    [GameId.HBSL]: "game-hbsl",
    [GameId.EBG]: "game-ebg",
    [GameId.DFDC]: "game-dfdc",
    [GameId.BCBM]: "game-bcbm",
    [GameId.FQZS]: "game-fqzs",
    [GameId.QHB]: "game-qhb",
}