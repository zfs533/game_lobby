import LhGame, { GameStatus } from "./lhGame";
import GameMsg from "../g-share/gameMsg";
import net from "../common/net";
import { ROUTE } from '../common/route';

export default class LhMsg extends GameMsg {
    protected game: LhGame;

    protected regMsgHanlder(): void {
        this.onMsg(ROUTE.lh_EnterBet, this.handleEnterBet);
        this.onMsg(ROUTE.lh_DoBet, this.handleDoBet);
        this.onMsg(ROUTE.lh_EnterDealCard, this.handleEnterDealCard);
        this.onMsg(ROUTE.lh_EnterBalance, this.handleEnterBalance);
    }

    /**
     * 断线重连
     * @param data
     */
    protected handleGameInfo(data: ps.Lh_GameInfo) {
        super.handleGameInfo(data);

        this.game.changeState(data.status);
        this.game.setTimer(data.leftTime);
        this.game.setMeLooker(true);

        if (data.players) {
            data.players.forEach(plr => {
                let chgMoney = new window.Decimal(0);
                if (data.status === GameStatus.STATUS_BET || data.status === GameStatus.STATUS_DEAL_CARD) {
                    if (plr.areaBets) {
                        let ply = this.game.plyMgr.getPlyByPos(plr.pos);
                        plr.areaBets.forEach(areaBet => {
                            chgMoney = chgMoney.sub(areaBet.bets);
                            if (ply) {
                                ply.doBet(areaBet.area, areaBet.bets);
                                if (ply.isMe) {
                                    this.game.setSelfAreaMoney(areaBet.area, +areaBet.bets);
                                }
                            }
                        })
                    }
                }
                // 结算之前玩家身上的金额都是下注前的，要减去
                this.game.plyMgr.updatePlyBets(plr.pos, chgMoney.toString(), plr.totalBets, plr.winCnt);
            })
            this.game.updateTbPlys();
        }

        // 只有下注、发牌阶段才显示金额
        if (data.status === GameStatus.STATUS_BET || data.status === GameStatus.STATUS_DEAL_CARD) {
            if (data.infos) {
                data.infos.forEach(info => {
                    this.game.setTotalAreaMoney(info.area, info.totalBets, true);
                });
            }
            if (data.cards) this.game.quickShowCards(data.cards);
        }

        if (data.status > GameStatus.STATUS_BET) {
            if (data.record) {
                let winArea = data.record[data.record.length - 1];
                this.game.brGame.setAreaEff(winArea);
            }
            this.game.brGame.setWaitTips(true);
        }

        if (data.record) {
            this.game.setRecords(data.record);
        }
    }

    /**
     * 开始下注
     * @param data
     */
    private handleEnterBet(data: ps.Lh_EnterBet) {
        this.game.changeState(GameStatus.STATUS_BET);
        this.game.setTimer(data.leftTime);
    }

    /**
     * 用户下注
     * @param data
     */
    private handleDoBet(data: ps.Lh_DoBet) {
        this.game.setTotalAreaMoney(data.area, data.bet);
        this.game.userDoBets(data.pos, data.area, data.bet);
    }


    /**
     * 发牌
     * @param data
     */
    private handleEnterDealCard(data: ps.Lh_EnterDealCard) {
        this.game.changeState(GameStatus.STATUS_DEAL_CARD);
        this.game.setRedBlackCards(data.cards);
        this.game.lhdzTrend.isTouchNext = false;
    }

    /**
     * 结算
     */
    private handleEnterBalance(data: ps.Lh_EnterBalance) {
        this.game.changeState(GameStatus.STATUS_BALANCE);
        this.game.setRecords(data.winLoseRecord);
        this.game.balanceAnim(data.winLoseRecord[data.winLoseRecord.length - 1], data.player);
    }

    //---------------------------------------------------

    sendDoBets(areaIdx: number, bets: number) {
        net.notify("game.lhHandler.doBets", { area: areaIdx, bets: bets });
    }
}
