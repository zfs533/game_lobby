import GameMsg from "../g-share/gameMsg";
import EbgGame, { GameStatus } from "./ebgGame";
import { ROUTE } from "../common/route";
import { showTip } from "../common/ui"
import net from "../common/net";
//游戏 消息类
enum Dealer {
    OverMaxCnt, //超过连续做庄次数
    OldQuit, //之前的玩家下庄
    MoneyInsufficient, //钱不够
}
const { ccclass, property } = cc._decorator;
@ccclass
export default class EbgMsg extends GameMsg {

    protected game: EbgGame;

    /**
     * 注册消息
     */
    protected regMsgHanlder(): void {
        this.onMsg(ROUTE.ebg_EnterBet, this.handleEnterBet);
        this.onMsg(ROUTE.ebg_DoBet, this.headleDoBet);
        this.onMsg(ROUTE.ebg_EnterDealCard, this.handleEnterDealCard);
        this.onMsg(ROUTE.ebg_EnterBalance, this.handleEnterBalance);
        this.onMsg(ROUTE.ebg_GameHistory, this.handleGameHistory);
        this.onMsg(ROUTE.ebg_PlayerHistory, this.handlePlayerHistory);
        this.onMsg(ROUTE.ebg_ChangeDealer, this.ebgChangeDealer);
        this.onMsg(ROUTE.ebg_DealerList, this.handleDealerList);
    }

    /**
  * 断线重连
  * @param data
  */
    protected handleGameInfo(data: ps.Ebg_GameInfo) {
        super.handleGameInfo(data)
        this.game.changeState(data.status)
        this.game.setDealerUI(data.dealerPos, data.curDealerCnt, data.dealerQuit)
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
        if (data.status > GameStatus.STATUS_BET && !this.game.getSelfAreaMoney() && this.game.plyMgr.me.pos !== data.dealerPos) {
            this.game.brGame.setWaitTips(true)
        }
        if (this.game.plyMgr.me.pos === data.dealerPos) {
            this.game.setMeLooker(false);
        }
        if (data.status > GameStatus.STATUS_BET) {
            this.game.hideAreaSelfMoney();
        }
        if (data.status === GameStatus.STATUS_END) {
            this.game.resetAreMoney();
            this.game.brGame.hideArea();
            this.game.cardTypeHide();
            this.game.nodeCard.removeAllChildren();
            this.game.betsParentNode.removeAllChildren();//清楚桌面所以筹码
        }
    }
    /**
     * 开始下注
     */
    handleEnterBet(data: ps.Ebg_EnterBet) {
        this.game.changeState(data.status);
        this.game.setTimer(data.leftTime);
    }
    /**
     * 丢筹码
     */
    headleDoBet(data: ps.Ebg_DoBet) {
        this.game.setTotalAreaMoney(data.area, data.bet);
        this.game.plyDoBet(data.pos, data.area, data.bet);
    }
    /**
 * 发牌状态
 * @param data
 */
    handleEnterDealCard(data: ps.Ebg_EnterDealCard) {
        this.game.changeState(GameStatus.STATUS_DEAL_CARD)
        this.game.flySendCard(data.cards)
        this.game.isShowTSorTP(data.isAllKillOrLose);
    }

    /**
 * 结算状态
 */
    handleEnterBalance(data: ps.Ebg_EnterBalance) {
        this.game.changeState(GameStatus.STATUS_END)
        this.game.showBalanceAnim(data.player)
        this.game.setTimer(data.leftTime)
    }

    /**
     * 走势
     */
    handleGameHistory(data: ps.Ebg_GameHistory) {
        if (data.history && data.history.length != 0) {
            this.game.showHistory(data.history)
        } else {
            showTip("亲，当前没有走势图噢。")
        }
    }

    /**
     * 个人战绩
     * @param data
     */
    handlePlayerHistory(data: ps.Ebg_PlayerHistory) {
        if (data.history && data.history.length != 0) {
            this.game.showMyBill(data.history)
        } else {
            showTip("亲，当前没有战绩噢。")
        }
    }

    /**
     * 庄家列表
     * @param data
     */
    handleDealerList(data: ps.Ebg_DealerList) {
        this.game.showDealer(data.poss, data.dealerCnt)
    }

    /**
     * 换庄家
     */
    ebgChangeDealer(data: ps.Ebg_ChangeDealer) {
        // cc.log("=====ebg  换庄家=====");
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
        net.notify("game.ebgHandler.doDealer", {})
    }

    /**
     * 下庄
     */
    sendExitDealer() {
        net.notify("game.ebgHandler.quitDealer", {})
    }

    /**
     * 下注
     */
    sendDoBet(area: number, point: string) {
        net.notify("game.ebgHandler.doBet", { area: area, bets: point })
    }

    /**
     * 获取走势图
     */
    sendGameHistory() {
        net.notify("game.ebgHandler.roomHistory", {})
    }

    /**
     * 获取近8局的成绩
     */
    sendGamerHistory() {
        net.notify("game.ebgHandler.playerHistory", {})
    }

    /**
     * 获取上庄列表
     */
    sendDealerList() {
        net.notify("game.ebgHandler.dealerList", {})
    }
}