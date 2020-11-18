declare namespace gameIface {
    interface LoginInfo {
        pid: string,
        uuid?: string,
        act?: string,
        pwd?: string,
        code?: string,
        bundleId?: string,
        token?: string;
        channel?: string,
        platform?: string,
        ver?: string,
        businessPackage?: number
    }
    interface ShowPackageInfo {
        isUpdate?: number,
        title?: string,
        content?: string,
        url?: string
        desUrl?: string, // ios描述文件下载地址
    }

    interface IHallVal {
        saveGameList: { gid: string, idx: number, active: number, show: number }[],
        saveGameRoomList: {
            [gid: string]: ps.HallRoomHandlerGetYardList_Match[]
        },
        currBgmClip: cc.AudioClip,
        withdrawSwitch?: number,
        rechargeSwitch?: number,
        reportData: ps.HallHallHandlerEnter_Report,
        scene: string,
        showBind: boolean,
        shouldShowBillboard: boolean,
        showRegister: boolean,
        showShopPackage: boolean,
        guideCfg: ps.HallHallHandlerEnter_GuideCfg,
        csworkTime?: ps.HallHallHandlerEnter_WorkTime,
        gameCates: GameCategory[];
    }

    export interface GameCategory {
        name: string; //类别名称
        active: number; //是否显示
        idx: number; //排序id
        games: string[]; //分类下的子游戏
    }

    interface WithdrawOrder {
        SSSAccount: string;
        SSSRealName: string;
        money: string;
        createTime: number;
        state: number;
        status: number;
        amount: string;
        type: number;
        bankCardNumber: string;
        bankCardRealName: string;
    }

    interface WithdrawInfo {
        code: number,
        SSS?: number,
        bankCard?: number,
        agent?: number,
        rule?: LocationWithdrawRule,
        sssMinMoney?: string,
        sssMaxMoney?: string,
        bankCardMinMoney?: string,
        bankCardMaxMoney?: string,
        vip?: number,
        vipMinMoney?: string,
        vipMaxMoney?: string,
    }

    interface LocationWithdrawRule {
        withdrawA: number,
        withdrawB: number,
    }

    interface TransferRecrod {
        uid: number;
        vipUid: number;
        money: string;
        dateTime: number;
        state: number;
        status: number;
        orderId: string;
    }

    interface brPlayerInfo {
        money?: string;
        avatar: number;
        avatarFrame: number;
        gender: number;
        pos: number;
        location?: string;
        winCnt?: number,
        totalBets?: string,
        noBoomCnt?: number,
        totalSendMoney?: string,
        vipLevel?: number,
    }
}