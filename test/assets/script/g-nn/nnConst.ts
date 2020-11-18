export enum BullType {
    Bull0,
    Bull1,
    Bull2,
    Bull3,
    Bull4,
    Bull5,
    Bull6,
    Bull7,
    Bull8,
    Bull9,
    Bull10,
    BullBoom,
    BullFlower,
    BullSmall
}
export const bullBoost = {
    [BullType.Bull0]: 1,
    [BullType.Bull1]: 1,
    [BullType.Bull2]: 1,
    [BullType.Bull3]: 1,
    [BullType.Bull4]: 1,
    [BullType.Bull5]: 1,
    [BullType.Bull6]: 1,
    [BullType.Bull7]: 2,
    [BullType.Bull8]: 2,
    [BullType.Bull9]: 2,
    [BullType.Bull10]: 3,
    [BullType.BullBoom]: 4,
    [BullType.BullFlower]: 5,
    [BullType.BullSmall]: 5,
}
export enum nnPlayerState {
    //开始抢庄
    GRABBING = 3,
    //抢庄了
    GRABBED,
    //开始下注
    BETTING,
    //下注了
    BETTED,
    //计算
    CALCULATING,
    //计算了
    CALCULATED,
    //结算了
    RESULT,
    //end了
    END,
    //断线了
    OFFLINE
}
export const nnDesc = {
    descForLooker: 0,      //旁观
    descGameReadyStart: 0, //等待游戏开始
    descForGrab: 1,        //请抢庄
    descForDealerBet: 2,   //等待其他玩家投注
    descForBet: 2,         //请投注
    descForCal: 3,         //请摊牌
    descForWaitCal: 4,     //等待其他玩家摊牌
}
