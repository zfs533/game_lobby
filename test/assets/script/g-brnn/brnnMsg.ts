import BrnnGame, { GameStatus } from "./brnnGame"
import GameMsg from "../g-share/gameMsg"
import { showTip } from "../common/ui"
import net from "../common/net"
import { ROUTE } from '../common/route';

enum Dealer {
    OverMaxCnt, //超过连续做庄次数
    OldQuit, //之前的玩家下庄
    MoneyInsufficient, //钱不够
}

export default class BrnnMsg extends GameMsg {
    protected game: BrnnGame;

    protected regMsgHanlder(): void {
        this.onMsg(ROUTE.brnn_EnterBet, this.handleEnterBet);
        this.onMsg(ROUTE.brnn_DoBet, this.handleDoBet);
        this.onMsg(ROUTE.brnn_EnterDealCard, this.handleEnterDealCard);
        this.onMsg(ROUTE.brnn_EnterBalance, this.handleEnterBalance);
        this.onMsg(ROUTE.brnn_GameHistory, this.handleGameHistory);
        this.onMsg(ROUTE.brnn_PlayerHistory, this.handlePlayerHistory);
        this.onMsg(ROUTE.brnn_ChangeDealer, this.brnnChangeDealer);
        this.onMsg(ROUTE.brnn_DealerList, this.handleDealerList);
    }


    ///////////////////////////////response/////////////////////////////////
    /**
 * 断线重连
 * @param data
 */
    protected handleGameInfo(data: ps.Brnn_GameInfo) {
        super.handleGameInfo(data)

        this.game.changeState(data.status)
        this.game.setDealerUI(data.dealerPos, data.curDealerCnt)
        this.game.setTimer(data.leftTime)
        this.game.setMeLooker(true);

        if (data.players) {
            data.players.forEach(plr => {
                let chgMoney = new window.Decimal(0)
                // 只有在下注、展示牌阶段才显示金额
                if (data.status === GameStatus.STATUS_BET || data.status === GameStatus.STATUS_DEAL_CARD) {
                    if (plr.areaBets) {
                        let ply = this.game.plyMgr.getPlyByPos(plr.pos)
                        plr.areaBets.forEach(areaBet => {
                            chgMoney = chgMoney.sub(areaBet.bets)
                            if (ply) {
                                ply.doBeting(areaBet.area, areaBet.bets)
                                if (ply.isMe) {
                                    this.game.setSelfAreaMoney(areaBet.area, areaBet.bets)
                                }
                            }
                        })
                    }
                }
                // 结算之前玩家身上的金额都是下注前的，要减去
                this.game.plyMgr.updatePlyBets(plr.pos, chgMoney.toString(), plr.totalBets, plr.winCnt)
            })
            this.game.plyMgr.updateTablePlayer()
        }
        if (data.infos) this.game.showAllCards(data.infos)
        if (data.status > GameStatus.STATUS_BET && this.game.plyMgr.me.pos !== data.dealerPos) {
            this.game.brGame.setWaitTips(true)
        }
        if (this.game.plyMgr.me.pos === data.dealerPos) {
            this.game.setMeLooker(false);
        }
    }

    /**
     * 开始下注
     */
    handleEnterBet(data: ps.Brnn_EnterBet) {
        this.game.changeState(data.status)
        this.game.setTimer(data.leftTime)
    }

    /**
    * 丢筹码
    * @param data
    * pos: number
    * area: number
    * bet: string
    */
    handleDoBet(data: ps.Brnn_DoBet) {
        this.game.setTotalAreaMoney(data.area, data.bet)
        this.game.plyDoBet(data.pos, data.area, data.bet)
    }

    /**
     * 发牌状态
     * @param data
     */
    handleEnterDealCard(data: ps.Brnn_EnterDealCard) {
        this.game.changeState(GameStatus.STATUS_DEAL_CARD)
        this.game.flySendCard(data.cards)
    }

    /**
     * 结算状态
     */
    handleEnterBalance(data: ps.Brnn_EnterBalance) {
        this.game.changeState(GameStatus.STATUS_BALANCE)
        this.game.showBalanceAnim(data.player)
        this.game.setTimer(data.leftTime)
    }

    /**
     * 走势
     */
    handleGameHistory(data: ps.Brnn_GameHistory) {
        if (data.history) {
            this.game.showHistory(data.history)
        } else {
            showTip("亲，当前没有走势图噢。")
        }
    }

    /**
     * 个人战绩
     * @param data
     */
    handlePlayerHistory(data: ps.Brnn_PlayerHistory) {
        if (data.history) {
            this.game.showMyBill(data.history)
        } else {
            showTip("亲，当前没有战绩噢。")
        }
    }

    /**
     * 庄家列表
     * @param data
     */
    handleDealerList(data: ps.Brnn_DealerList) {
        this.game.showDealer(data.poss, data.dealerCnt)
    }

    /**
     * 换庄家
     */
    brnnChangeDealer(data: ps.Brnn_ChangeDealer) {
        if (data.chgInfo) {
            let player = this.game.getDealerPly()
            if (player && player.isMe) {
                if (data.chgInfo === Dealer.MoneyInsufficient) {
                    showTip("亲，你的金币不足了，系统要求您暂时下庄噢。")
                } else if (data.chgInfo === Dealer.OverMaxCnt) {
                    showTip(`亲，您已经坐庄满${this.game.MAX_DEALER_COUNT}轮了，该让下一个玩家来上庄了。`)
                } else if (data.chgInfo === Dealer.OldQuit) {
                    showTip("亲，您已成功下庄了。")
                }
                this.game.setMeLooker(true);
            }
        }

        let player = this.game.plyMgr.getPlyByPos(data.rPos)
        if (player && player.isMe) {
            showTip("亲，你是庄家了噢。")
            this.game.setMeLooker(false);
        }
        this.game.setDealerUI(data.rPos, 0)
    }

    ///////////////////////////////send/////////////////////////////////
    /**
     * 点击上庄
     */
    sendDoDealer() {
        net.notify("game.brnnHandler.doDealer", {})
    }

    /**
     * 下庄
     */
    sendExitDealer() {
        net.notify("game.brnnHandler.quitDealer", {})
    }

    /**
     * 下注
     */
    sendDoBet(area: number, point: string) {
        net.notify("game.brnnHandler.doBet", { area: area, bets: point })
    }

    /**
     * 获取走势图
     */
    sendGameHistory() {
        net.notify("game.brnnHandler.roomHistory", {})
    }

    /**
     * 获取近8局的成绩
     */
    sendGamerHistory() {
        net.notify("game.brnnHandler.playerHistory", {})
    }

    /**
     * 获取上庄列表
     */
    sendDealerList() {
        net.notify("game.brnnHandler.dealerList", {})
    }
}
