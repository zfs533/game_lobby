/**
 * 开发状态列表
 */
export const enum DevStatus {
    LOCAL_DEV,  // 内网
    OUT_DEV,    // 外网
    OFFICIAL,   // 正式
}

/**
 * 登录方式
 */
export enum LoginWay {
    TOKEN,
    UUID,
    ACT,
    MOBILE,
}

// 退出游戏后展示
export const enum QuitShow {
    SHOWBANK,   // 展示银行界面
    SHOWRECHARGE,  // 展示充值界面
    NOSHOW,  // 不展示其他洁面
    Rebate, //返利活动界面
    Festvial,//抽奖活动界面
}

// localStorage 存储key
export const enum ItemNames {
    searchPaths = "SearchPaths",
    localVer = "localVer",
    effect = "effect",
    uuid = "uuid",
    account = "accout",
    password = "password",
    manifestMain = "manifestMain",
    lobbyPath = "game",
    token = "token",
    ddzTimes = "ddzTimes",
    pdkTimes = "pdkTimes",
    hotUpdateTime = "hotUpdateTime",
    devFlag = "devFlag",
    ipList = "pipipi",
    problemCD = "problemCD",
    guideState = "guideState",
    complainTime = "complainTime",
    officialUrl = 'officialUrl',
    rechargeQuestionUrl = 'rechargeQuestionUrl',
    weChat = 'weChat',
    qq = 'qq',
    channel = 'chl',
    deviceToken = 'deviceToken',
    showRebateTime = 'showRebateTime',    // 控制充值返利弹窗，一天一次
    showIosCfgTime = 'showIosCfgTime',    // 控制ios描述文件弹窗，一天一次
}

export const enum GameId {
    QZNN = "QZNN",
    JH = "JH",
    BRNN = "BRNN",
    DDZ = "DDZ",
    HH = "HH",
    BY = "BY",
    PDK = "PDK",
    JDNN = "JDNN",
    LH = "LH",
    ERMJ = "ERMJ",
    DZPK = 'DZPK',
    QHB = 'QHB',
    HBSL = 'HBSL',
    EBG = 'EBG',
    DFDC = 'DFDC',
    BCBM = 'BCBM',
    DGBJL = 'DGBJL',
    DGLP = 'DGLP',
    DGSB = 'DGSB',
    IM = 'IM',
    FQZS = 'FQZS',
}

export const enum Gender {
    FEMALE,
    MALE
}