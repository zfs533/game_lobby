import GameMsg from "../g-share/gameMsg"
import DFDCGame from "./dfdcGame";
import net from "../common/net";
import { ROUTE } from "../common/route";
import * as ui from "../common/ui";
import Lobby from "../lobby/lobby";
import user from "../common/user"
let Decimal = window.Decimal;

let pomelo = window.pomelo
const { ccclass, property } = cc._decorator;

export enum GameStatus {
    START,          //开始
    STOP,           //停止并结算
    EGG,            //彩蛋阶段
    GAMEEND,        //游戏结束
}
enum Leave {
    leave,
    kick,
    lost,
    moneyNotEnough,
    forceChangeRoom,
    notBet,
    serverClosed = 7,
    balancing
}
export interface gameDoBalance {
    infos: {
        firstRow: number[],
        secondRow: number[],
        thirdRow: number[],
    }
    earnMoney: string,
    freeTime: number,
    lastBets: string,
    payRate: string,
    winIcon: winIcon[],
    jackPot: jackPotInfo,
    bowlType: number,
    goldIngotProportion: string;
    hasLucky: number;
    freeIcon: {
        icon: number;
        line: number;
    }
    diamondMultiple: number;

}

export interface winIcon {
    icon: number,
    line: number,
}

export interface winnerInfo {
    uid: number,
    gender: number,
    avatar: number,
    winMoney: string,
    winDate: string,
    ipLocation: string,

}

export interface DFDCJackPotWinnerInfo {
    winnerInfo: winnerInfo[],
}

export interface DFDCFreeInfo {
    freeTime: number,
    lastBetLevel: string,
    bowlType: number,
    lastBetMultiple: string,
    goldIngotProportion: string,

}

export interface jackPotInfo {
    duofu: string,
    duocai: string,
    duoxi: string,
    duoshou: string,
}



export enum eggIcons {
    DuoShou = 1,
    Duoxi,
    DuoCai,
    DuoFu,
}

export interface DFDCEggInfo {
    eggIcons: eggIcons[],
    winEggIcon: number,
    eggTime: number,
    openedEgg: DFDCOpenedEgg[],
}

interface DFDCHandlerOpenEgg {
    openedEgg: DFDCOpenedEgg[],
}

export interface DFDCOpenedEgg {
    openIcon: number,
    idx: number,
}

interface DFDCEggBalanceInfo {
    winEggIcon: number,
    eggWinMoney: string,
    jackPotInfo: jackPotInfo,
    bowlType: number,
    openedEgg: any;
}

interface userInfos {
    money: string,
    gender: number,
    location: string,
    betLevel: string,
    jackPot: jackPotInfo,
    bowlType: number,
    betMultiple: string,
}


export interface IConfig {
    duofu: string,
    duocai: string,
    duoxi: string,
    duoshou: string,
}

@ccclass
export default class DFDCMsg extends GameMsg {

    loadGameHandler = "game.DFDCHandler.loadGameInfo";
    notifyCurrentGame = "DFDCLoadGameInfo";
    protected game: DFDCGame;


    protected regMsgHanlder() {
        this.onMsg(ROUTE.userMoney, this.handleUserMoney.bind(this));
        this.onMsg(ROUTE.dfdc_DoBalance, this.handleDFDCDoBalance.bind(this));
        this.onMsg(ROUTE.dfdc_Bets, this.handleDFDCBets.bind(this));
        this.onMsg(ROUTE.dfdc_FreeInfo, this.handleFreeInfo.bind(this));
        this.onMsg(ROUTE.dfdc_JackPotInfo, this.handleJackPotInfo.bind(this));
        this.onMsg(ROUTE.dfdc_JackPotHistory, this.handleJackPotWinnerInfo.bind(this));
        this.onMsg(ROUTE.dfdc_EggInfo, this.handleDFDCEggInfo.bind(this));
        this.onMsg(ROUTE.dfdc_UserOpenEgg, this.handleDFDCOpenEggInfo.bind(this));
        this.onMsg(ROUTE.dfdc_EggBalance, this.handleDFDCEggBalanceInfo.bind(this));
        //this.onMsg(ROUTE.dfdc_RobotResetJackPot, this.handleDFDCRobotColorPool.bind(this));
        this.onMsg(ROUTE.dfdc_Double, this.handleDFDCDouble.bind(this));
        this.onMsg(ROUTE.dfdc_WaitDouble, this.handleIsDFDCDouble.bind(this));
        pomelo.on(ROUTE.dfdc_JackPotWinner, this.handleJackPotWinner.bind(this));


    }

    protected removeExtraListeners() {
        pomelo.off("userMoney");
        pomelo.off("DFDCDoBalance");
        pomelo.off("DFDCBets");
        pomelo.off("DFDCFreeInfo");
        pomelo.off("DFDCJackPotInfo");
        pomelo.off("DFDCJackPotHistory");
        pomelo.off("DFDCEggInfo");
        pomelo.off("DFDCUserOpenEgg");
        pomelo.off("DFDCEggBalance");
        pomelo.off("DFDCRobotResetJackPot");
        pomelo.off("DFDCDouble");
        pomelo.off("DFDCWaitDouble");
        pomelo.off("DFDCDoLuckyBalance");
        pomelo.off("DFDCDoLuckyInfo");


    }
    private handleUserMoney = (data: { money: string }) => {
        // cc.log("更新玩家金币", data.money);
        let me = this.game.playerMgr.me;
        // me.money = add(data.money, 0).toNumber();
        me.money = new Decimal(data.money).add(0).toString();
        //me.updateBets(0, me.balance, true);

    }

    handleStartGame = (data: { willChangeRoom: number, gameNo: string }) => {
        //this.game.labGameId.string = data.gameNo;
    }

    /**
     * 结算
     */
    async handleDFDCDoBalance(data: ps.Dfdc_DoBalance) {
        //cc.log("结算");
        this.game.gameBalance = data;
        this.game.showWinGameBalance = data;
        this.game.ratioEarnMoney = +data.earnMoney;
        let arr: any = [[]];
        for (let i = 0; i < 3; ++i) {
            arr[i] = [];
            for (let j = 0; j < 5; ++j) {
                if (i === 0) {
                    arr[i][j] = data.infos.firstRow[j];
                } else if (i === 1) {
                    arr[i][j] = data.infos.secondRow[j];
                } else {
                    arr[i][j] = data.infos.thirdRow[j];
                }
                this.game.slotsResultArr[i][j] = arr[i][j];
            }
        }
        this.game.diamondDoudle = data.diamondMultiple;
        this.game.stopSpin();

    }
    async DFDCDoBalance(data: ps.Dfdc_DoBalance) {
        this.game.isDoBalance = true;
        //cc.log("<<<<<<  结算信息222", data);
        this.game.initColorPools(data.jackPot, false);
        this.game.isWin = false;
        this.game.wildNun();
        if (data.winIcon && data.winIcon.length !== 0) {
            this.game.isWin = true;
        }

        this.game.playWinAni(+data.payRate, +data.earnMoney, true);
        if (data.freeTime && data.freeTime > 0) {
            this.game.startFreeGame(data.freeTime);
            if (+data.freeTime !== 8) {
                this.game.freeRatioEarnMoney += +data.earnMoney;
            }
            this.game.isWinningfree(false, data.freeIcon.cnt);
            if (this.game.curFreeTimesTip < data.freeTime) {
                this.game.isFreeTip = true;
                this.game.curFreeTimesTip = data.freeTime;
            }
        }
        this.game.isdelay();
        await this.game.coinToTreasureBowl();
        this.game.setTreasureBowl(data.bowlType);
    }
    public showWin(data: ps.Dfdc_DoBalance) {
        if (!this.game.playerMgr.me.isRatio) {
            this.game.playerMgr.me.showWinGold(+data.earnMoney);
        }
        if (this.game.isWin) {
            this.game.getWinItems(data.winIcon, +data.payRate);
        }
        this.game.playWinAni(+data.payRate, +data.earnMoney, false);
        this.game.delaytimes = 0;
        this.game.showWinGameBalance = undefined;
    }



    /**
        * 是否可以比倍
        */
    private handleIsDFDCDouble(data: { gameStatus: string }) {
        // cc.log("可以比倍");
        if (data.gameStatus === "1") {
            this.game.isDouble = true;
        }
        else {
            this.game.isDouble = false;
        }
    }

    private handleJackPotWinner(msgInfo: ps.Dfdc_JackPotWinner) {
        // cc.log("收到环境特效：", msgInfo);
        //暂时屏蔽多福多财中奖广播
        this.game.playAmbienceEffect(msgInfo);
    }

    /**
    * 比倍结果
    */
    private handleDFDCDouble(data: { result: number, doubleScore: string, doubleCount: number }) {

        //cc.log("比倍结果");
        this.game.ratioBalance(data.result, +data.doubleScore, data.doubleCount);

    }

    /**
     * 调整下注
     */
    private handleDFDCBets(data: { betLevel: string, betMultiple: string }) {
        // cc.log("调整下注");
        this.game.updatePlayerBet(data.betLevel, data.betMultiple);

    }


    /**
     * 免费玩
     */
    private handleFreeInfo(data: ps.Dfdc_FreeInfo) {
        //cc.log("免费玩信息", data);
        this.game.doFreeInfo(data);
        this.game.setTreasureBowl(data.bowlType);
        // this.game.lngotsProgressNum = +data.goldIngotProportion;

    }

    /**
     * 彩池信息
     */
    private handleJackPotInfo(data: ps.Dfdc_JackPotInfo) {
        // cc.log("彩池信息", data);
        this.game.initColorPools(data, true)
    }

    /**
     * 彩池赢家信息
     */
    private handleJackPotWinnerInfo(data: ps.Dfdc_JackPotHistory) {
        //cc.log("彩池赢家信息");
        this.game.openColorPoolWinnerPanel(data.winnerInfo);
    }

    /**
     * 彩蛋信息
     */
    private handleDFDCEggInfo(data: ps.Dfdc_EggInfo) {
        //cc.log("彩蛋信息", data);
        this.game.EggFault = true;
        this.game.openEggPanel(data);
    }

    /**
     * 打开彩蛋信息
     */
    private handleDFDCOpenEggInfo(data: ps.Dfdc_UserOpenEgg) {
        //cc.log("打开彩蛋信息", data.openIcon);
        this.game.dfdcEgg.flipItem(data.openIcon, data.idx);
    }
    /**
     * 彩蛋结算信息
     */
    async handleDFDCEggBalanceInfo(data: DFDCEggBalanceInfo) {
        //cc.log("彩蛋结算信息", data);
        await this.game.dfdcEgg.Autoremake();
        this.game.EggFault = false;
        this.game.dfdcEgg.hide();
        this.sendDoJackPotInfo();
        this.game.playColorPoolAni(data.winEggIcon, data.eggWinMoney);
        //this.game.initColorPools(data.jackPotInfo, true);
        this.game.setTreasureBowl(data.bowlType);
    }

    /**
     * 断线重连
     * @param data
     */
    protected handleGameInfo(data: {
        leftTime: number, status: number, eggInfos: DFDCEggInfo, userInfo: userInfos,
    }): void {
        super.handleGameInfo(data);
        this.game.updatePlayerBet(data.userInfo.betLevel, data.userInfo.betMultiple);
        let me = this.game.playerMgr.me;
        me.money = new Decimal(data.userInfo.money).add(0).toString();
        //me.updateBets(0, me.balance, true);
        this.game.updatePlayerGold();
        this.game.setTreasureBowl(data.userInfo.bowlType);
        if (data.status === GameStatus.EGG) {
            this.game.EggFault = true;
            this.game.openEggPanel(data.eggInfos);
        }
    }

    /**
     * 机器人获得彩池
     */
    private handleDFDCRobotColorPool(data: jackPotInfo) {
        //cc.log("机器人获得彩池", data);
        this.game.initColorPools(data, true)
    }

    sendDoBets(betLevel: string, betMultiple: string) {
        //  net.notify("game.DFDCHandler.userBets", { betLevel: betLevel, betMultiple: betMultiple });
    }

    sendDoOperate(gameType: number, betLevel: string, betMultiple: string, doubleType: number) {
        net.notify("game.dfdcHandler.start", { gameType: gameType, betLevel: betLevel, betMultiple: betMultiple, doubleType: doubleType });
    }

    sendDoFreeInfo(uid: number) {
        net.notify("game.dfdcHandler.getFreeInfo", { uid: uid });
    }

    sendDoJackPotInfo() {
        net.notify("game.dfdcHandler.getJackPot", {});
    }

    sendDoJackPotHistory(idx: number) {
        net.notify("game.dfdcHandler.getJackPotHistory", { jackPotNum: idx });
    }

    sendDoOpenEgg(icon: number, idx: number) {
        net.notify("game.dfdcHandler.openEgg", { openIcon: icon, idx: idx });
    }
    handleLeaveReason(reason: any) {
        //被踢
        if (reason === Leave.kick) {
            ui.showConfirm("网络环境差，请重试！");
        } else if (reason === Leave.notBet) {
            ui.showConfirm("亲，你很久没有操作了，请休息一会儿再来吧～");
        } else if (reason === Leave.moneyNotEnough) {
            if (!user.shield) {
                let nodeLobby = cc.find("lobby");
                if (!nodeLobby) {
                    return;
                }
                let lobby = nodeLobby.getComponent(Lobby);
                let c = ui.showConfirm("亲，您身上的金币不太够了噢～请补充点金币吧。", "去充值", "去银行");
                c.showClose();
                c.okFunc = lobby.onClickRecharge.bind(lobby);
                c.cancelFunc = lobby.onClickBank.bind(lobby);
            }
        }
    }
}
