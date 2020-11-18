import HHGame, { GameStatus } from "./hhGame";
import GameMsg from "../g-share/gameMsg";
import net from "../common/net";
import { ROUTE } from '../common/route';

export default class HHMsg extends GameMsg {
    protected game: HHGame;

    protected regMsgHanlder(): void {
        this.onMsg(ROUTE.hh_EnterBet, this.handleEnterBet);
        this.onMsg(ROUTE.hh_DoBet, this.handleUserDoBets);
        this.onMsg(ROUTE.hh_EnterDealCard, this.handleEnterDealCard);
        this.onMsg(ROUTE.hh_EnterBalance, this.handleGameResult);
    }

    /**
     * 开始下注
     * @param data
     */
    private handleEnterBet(data: ps.Hh_EnterBet) {
        this.game.changeState(GameStatus.STATUS_BET);
        this.game.setTimer(data.leftTime);
    }

    /**
     * 用户下注
     * @param data
     */
    private handleUserDoBets(data: ps.Hh_DoBet) {
        this.game.setTotalAreaMoney(data.area, data.bet);
        this.game.userDoBets(data.pos, data.area, data.bet);
    }

    /**
     * 发牌
     * @param data
     */
    private handleEnterDealCard(data: ps.Hh_EnterDealCard) {
        this.game.changeState(GameStatus.STATUS_DEAL_CARD);
        this.game.setRedBlackCards(data.cardsInfo);
        this.game.hhTrend.isTouchNext = false;
    }

    /**
     * 结算
     */
    private handleGameResult(data: ps.Hh_EnterBalance) {
        this.game.changeState(GameStatus.STATUS_RESULT);
        this.game.setWinAreaEff(data.redWin, data.winShape);
        this.game.setRecords(data.winLoseRecord);
        this.game.balanceAnim(data.winLoseRecord[data.winLoseRecord.length - 1], data.players);
    }

    /**
     * 断线重连
     * @param data
     */
    protected handleGameInfo(data: ps.Hh_GameInfo) {
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
            this.game.plyMgr.setBigRegalGambleGodPos();
        }

        // 只有下注、发牌阶段才显示金额
        if (data.status === GameStatus.STATUS_BET || data.status === GameStatus.STATUS_DEAL_CARD) {
            if (data.AreaInfos) {
                data.AreaInfos.forEach(info => {
                    this.game.setTotalAreaMoney(info.area, info.totalBets, true);
                });
            }
            if (data.cards) this.game.quickShowCards(data.cards);
        }

        if (data.status > GameStatus.STATUS_BET) {
            if (data.winLoseRecord) {
                let winArea = data.winLoseRecord[data.winLoseRecord.length - 1];
                this.game.setWinAreaEff(winArea.redWin, winArea.winShape);
            }
            this.game.brGame.setWaitTips(true);
        }

        if (data.winLoseRecord) {
            this.game.setRecords(data.winLoseRecord);
        }
    }

    sendDoBets(areaIdx: number, bets: number) {
        net.notify("game.hhHandler.doBets", { area: areaIdx, bets: bets });
    }
}
