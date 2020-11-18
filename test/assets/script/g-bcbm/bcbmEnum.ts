/* 这里的所有东西与服务器同步，拷贝至服务器 */
const Decimal = window.Decimal;


/**
 * 游戏的阶段（游戏状态）
 */
export const enum BCBMGameStatus {
    /* 开局，开始下 */
    BET,
    /* 下注阶段 停止下注 */
    DEAL,
    /* 计算结果阶段 */
    BALANCE,
    /* 结算阶段(服务器状态) */
    END_NEXTBET
}


/**
 * 大小车标枚举
 */
export const enum AreaAwardType {
    /* 扩展使用，暂时未用 */
    Single,
    /* 大图标 */
    Big,
    /* 小图标 */
    Small
}

export enum BetAreaType {
    MIN = 0,         //未知
    BC_B = 1,         //奔驰
    BM_B = 2,          //宝马
    AD_B = 3,             //奥迪
    DZ_B = 4,           //大众
    BC_M = 5,         //奔驰
    BM_M = 6,          //宝马
    AD_M = 7,             //奥迪
    DZ_M = 8,           //大众
    MAX = 9
}


interface AreaAwardCfg {
    rate: number,
    awardType: AreaAwardType
}

interface AreaRateCfg {
    award: {
        /* 单区域 */
        single?: AreaAwardCfg,
        /* 开大 */
        wide?: AreaAwardCfg,
        /* 开小 */
        small?: AreaAwardCfg
    },
}

/**
 * 区域倍率
 */
export const BetAreaRateCfg: { [key: number]: AreaRateCfg } = {
    [BetAreaType.BC_B]: {
        award: {
            single: { rate: 40, awardType: AreaAwardType.Single },
        },
    },
    [BetAreaType.BM_B]: {
        award: {
            single: { rate: 30, awardType: AreaAwardType.Single },
        },

    },
    [BetAreaType.AD_B]: {
        award: {
            single: { rate: 15, awardType: AreaAwardType.Single },
        },
    },
    [BetAreaType.DZ_B]: {
        award: {
            single: { rate: 10, awardType: AreaAwardType.Single },
        },
    },
    [BetAreaType.BC_M]: {
        award: {
            single: { rate: 4, awardType: AreaAwardType.Single }
        },
    },
    [BetAreaType.BM_M]: {
        award: {
            single: { rate: 3, awardType: AreaAwardType.Single }
        },

    },
    [BetAreaType.AD_M]: {
        award: {
            single: { rate: 2, awardType: AreaAwardType.Single }
        },
    },
    [BetAreaType.DZ_M]: {
        award: {
            single: { rate: 1, awardType: AreaAwardType.Single }
        },
    }
}

interface AreaLocation {
    loc: number;
    area: BetAreaType;
    awardType: AreaAwardType;
}

const ONE_AREA_LOCATION_CNT = 4;

/**
 * 计算32个车标信息[{loc:,area:,awardType}]
 */
export function genAreaLoctions() {
    const areaLoctions: AreaLocation[] = [];
    let locIndex = 0;
    for (let j = 1; j <= ONE_AREA_LOCATION_CNT; j++) {
        for (let i = BetAreaType.MIN + 1; i < BetAreaType.MAX; i++) {
            let area: BetAreaType = i;
            let areaCfg = BetAreaRateCfg[area];
            if (areaCfg.award.single) {
                areaLoctions.push({
                    loc: ++locIndex,
                    area: area,
                    awardType: areaCfg.award.single.awardType
                });
            }
            if (areaCfg.award.wide) {
                areaLoctions.push({
                    loc: ++locIndex,
                    area: area,
                    awardType: areaCfg.award.wide.awardType
                });
            }
            if (areaCfg.award.small) {
                areaLoctions.push({
                    loc: ++locIndex,
                    area: area,
                    awardType: areaCfg.award.small.awardType
                });
            }
        }
    }
    return areaLoctions;
}
