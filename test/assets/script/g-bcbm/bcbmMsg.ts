import BCBMGame from "./bcbmGame";
import GameMsg from "../g-share/gameMsg";
import net from "../common/net";
import { ROUTE } from '../common/route';
import { BCBMGameStatus } from "./bcbmEnum";
import { showTip } from "../common/ui";

const { ccclass, property } = cc._decorator;
@ccclass
export default class BCBMMsg extends GameMsg {
    protected game: BCBMGame;
    private resultData: ps.enterDealData;
    protected regMsgHanlder(): void {
        /* 开始下注 */
        this.onMsg(ROUTE.bcbm_EnterBet, this.handleEnterBet);
        /* 用户下注 */
        this.onMsg(ROUTE.bcbm_DoBet, this.handleUserDoBets);
        /* 中奖车标消息 */
        this.onMsg(ROUTE.bcbm_EnterDeal, this.handleEnterDeal);
        /* 游戏结算 */
        this.onMsg(ROUTE.bcbm_EnterBalance, this.handleEnterBalance);
    }

    /**
     * 开始下注
     * @param time
     * @param status
     */
    private handleEnterBet(data: ps.enterBetData): void {
        let dt = JSON.stringify(data);
        this.game.changeState(data.status);
        this.game.setTimer(data.leftTime);
        this.game.isClickedContnue = false;
        this.game.forwardMyBets = data.dupBets || this.game.forwardMyBets;
        this.game.isCanContinue = data.canDupBet > 0 ? true : false;

    }

    /**
     * 用户下注
     * @param pos 玩家位置
     * @param area 下注区域
     * @param bet 下注money
     */
    private handleUserDoBets(data: ps.doBetData): void {
        this.game.setTotalAreaMoney(data.area, data.bet);
        this.game.userDoBets(data.pos, data.area, data.bet);
    }

    /**
     * 下注结束，展示中奖车标
     * @param data
     */
    private handleEnterDeal(data: ps.enterDealData): void {
        let dt = JSON.stringify(data);
        this.resultData = data;
        this.game.changeState(data.status, data.time);//BCBMGameStatus.DEAL
        this.game.handleBcbmCar(data);
        this.game.setTimer(data.time);
    }

    /**
     * 游戏结算
     * @param data ps.enterBalanceData
     */
    private handleEnterBalance(data: ps.enterBalanceData): void {
        this.game.changeState(data.status);
        this.game.balanceAnim(this.resultData, data.player);
        console.log(`this.game.plyMgr.seatOffset== ${this.game.plyMgr.seatOffset}`);
    }

    /**
     * 玩家自己下注
     * @param areaIdx 下注区域
     * @param bets 下注金额
     */
    sendDoBets(areaIdx: number, bets: number) {
        net.notify("game.bcbmHandler.doBets", { area: areaIdx + 1, bets: bets });
    }

    /**
     * 续投
     */
    sendContinueBets() {
        net.notify("game.bcbmHandler.dupBets", {});
    }

    /**
     * 凡是进入游戏必须请求一次这个消息
     * @param data
     */
    protected handleGameInfo(data: ps.gameInfoData) {
        console.log("-------bcbm断线重连-------");
        super.handleGameInfo(data);
        this.game.changeState(data.status);
        this.game.setTimer(data.leftTime);
        this.game.setMeLooker(true);
        this.game.reConnectData = data;

        this.game.isCanContinue = data.canDupBet > 0 ? true : false;
        this.game.forwardMyBets = data.dupBets;

        if (data.players) {
            data.players.forEach(plr => {
                let chgMoney = new window.Decimal(0);
                if (data.status === BCBMGameStatus.BET || data.status === BCBMGameStatus.DEAL) {
                    if (plr.areaBets) {
                        let ply = this.game.plyMgr.getPlyByPos(plr.pos);
                        plr.areaBets.forEach(areaBet => {
                            chgMoney = chgMoney.sub(areaBet.bets);
                            if (ply) {
                                ply.doBet(areaBet.area, areaBet.bets);
                                if (ply.isMe) {
                                    this.game.setSelfAreaMoney(areaBet.area - 1, +areaBet.bets);
                                }
                            }
                        })
                    }
                }
                // 结算之前玩家身上的金额都是下注前的，要减去
                this.game.plyMgr.updatePlyBets(plr.pos, chgMoney.toString(), plr.totalBets, plr.winCnt);
            })
            this.game.plyMgr.setBigRegalGambleGodPos();
        }

        // 只有下注、发牌阶段才显示金额
        if (data.status === BCBMGameStatus.BET || data.status === BCBMGameStatus.DEAL) {
            if (data.infos) {
                data.infos.forEach(info => {
                    this.game.setTotalAreaMoney(info.area, info.totalBets, true);
                });
            }
        }

        //处理下注结束，离开游戏后再回到游戏，结算时玩家头上不播放输赢动画
        if (data.status >= BCBMGameStatus.DEAL) {
            let dealData: ps.enterDealData = { status: data.status, time: data.leftTime, loc: data.loc, area: data.area };
            this.resultData = dealData;
        }

        if (data.status > BCBMGameStatus.BET && !this.game.isDobets) {
            this.game.brGame.setWaitTips(true);
        }
        if (data.winLoseRecords) {//记录
            this.game.initDeskRecordList(data.winLoseRecords);
        }
        if (data.locs) {
            this.game.bcbmPath.setCarLog(data.locs);
        }
    }
}