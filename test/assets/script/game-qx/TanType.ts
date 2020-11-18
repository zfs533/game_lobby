/**
 * File: TanType
 * 七夕活动  {枚举 interface }
 */

export enum eventType {
    recharge = "recharge",
    normal = "normal",
    festival = "festival",
}

/**
 * 动态头像框id
 */
export enum DyAvatarId {
    zq = 116,//中秋动态
    gq = 120,//国庆动态
}


//动态头像id列表
export const dyAvatarBoxIdArray = [DyAvatarId.zq, DyAvatarId.gq];

/**定型奖品类型 */
export enum QixiPrizeType {
    nothing = 1,// 再接再厉
    gold_1 = 2,
    gold_3 = 3, //
    gold_10 = 4,
    gold_168 = 5,
    hongbao_668 = 6,//红包668
    dyAvatar = 7,//动态头像框
    iphone = 8,//iphone11
    macPro = 9,//苹果Macpro
    bracelet = 10,//钻石手镯
}



/** 奖品类型*/
export enum TipsType {
    none = 0,       // 未中奖
    gold = 1,       // 金币奖励
    hongbao = 2,    // 红包，大额金币
    skin = 3,       // 中一次后，无效（炮台皮肤）
    avatarBox = 4,     // 中一次后，无效（头像框）
    code = 5,       // 激活码
    real = 6,       // 实物奖励
}

/**奖励配置物品数据结构*/
export interface TanData {
    id: number,
    name: string,//物品名字
    type: number, // 奖励类型 对应 TipsType
    quantity: string
}

////////////////////////////////////////////////////////

export interface LuckyData {
    prizeId: number,
    prizeType: number,                 // 奖品类型
    userName: string,    // 中奖用户名称
    prizeQuantity: string,          // 奖金
    prizeName: string,            // 奖品名称
    date: number,          // 中奖日期
}

export interface PersonData {
    prizeId: number,
    prizeType: number,   // 奖品类型
    prizeQuantity: string,   // 奖金
    prizeName: string,    // 奖品名称
    date: number,  // 中奖日期
}

export interface AwardData {
    prizeId: number,
    userName: string,    // 中奖用户名称
    date: number,  // 中奖日期
    prizeName: string,            // 奖品名称
}

////////////////////////////////////////////////////////

/**活动数据结构 */
export interface totalMsgData {
    code: number,                     // 返回码
    info: {
        betMoney?: string,
        chgMoney?: string,
        recharge?: string,
        taxMoney?: string,
        remainTimes: number,
    }
    luckyUsers: LuckyData[],
    personRecords: PersonData[],
    day: number,
    isShowDay: number,
    startDate: number
}


/**抽奖数据结构 ok*/
export interface WinnMsgData {
    code: number,
    info: {
        prizeId: number,
        prizeType: number,  // 奖品类型
        prizeName: string,   // 奖品名称
        prizeQuantity: string, // 奖金
        remainTimes: number, // 剩余次数
        date: number,  // 中奖日期
        hasFort: number, //是否已经拥有炮台皮肤，如果已经拥有重新抽奖
    }
}

export interface WinnMsgData2 {
    prizeId: number,
    prizeType: number,   // 奖品类型
    userName: string,   // 中奖用户昵称
    prizeName: string, // 名称
    prizeQuantity: string, // 奖金
    date: number, // 日期
}
