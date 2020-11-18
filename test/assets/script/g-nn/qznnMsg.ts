import GameMsg from "../g-share/gameMsg"
import QznnGame, { GameState } from "./qznnGame"
import PokerCard from "../g-share/pokerCard"
import user from "../common/user"
import { BullType, nnPlayerState } from "./nnConst";
import net from "../common/net";
import { sortCards } from "./nnUtil";
import { PlayerState } from "../g-share/player";
import { ROUTE } from '../common/route';

enum Job {
    Dealer, //庄
    Player, //闲
}
let Decimal = window.Decimal;
export default class QznnMsg extends GameMsg {
    protected game: QznnGame
    //[pos] = {bullType, cards}
    public pCards: { [pos: number]: { bullType: number, cards: number[] } } = {}

    protected regMsgHanlder(): void {
        // cc.log('reg...........')
        this.onMsg(ROUTE.qznn_StatusChange, this.phaseChange)
        this.onMsg(ROUTE.qznn_EnterDoDealer, this.enterDoDealer)
        this.onMsg(ROUTE.qznn_DoDealer, this.handleGrabDealer)
        this.onMsg(ROUTE.qznn_AppointDealer, this.handleShowDealer)
        this.onMsg(ROUTE.qznn_DoBet, this.handleBet)
        this.onMsg(ROUTE.qznn_DealLastCard, this.handleDealLastCard)
        this.onMsg(ROUTE.qznn_DoHandout, this.handleDoHandout)
        this.onMsg(ROUTE.qznn_EnterBalance, this.handleResult)
    }
    private enterDoDealer(data: ps.Qznn_EnterDoDealer, doAni = true) {
        this.dealSomeCards(data.cards, doAni)
        this.phaseChange({ status: GameState.STATUS_DEAL_FOUR_CARDS, timer: 0 })
    }
    async dealSomeCards(cards: number[], doAni = true) {
        //4、5张牌信息
        for (let p of this.game.plyMgr.gamer) {
            if (p.isMe) {
                if (!p.isLooker)
                    this.game.dealCards(p, cards, doAni)
            } else {
                let temp = []
                for (let i = 0; i < cards.length; i++) {
                    temp.push(0)
                }
                this.game.dealCards(p, temp, doAni)
            }
            if (doAni) {
                await new Promise(resolve => setTimeout(resolve, 150))
            }
        }
    }
    async deal1Card(card: number, doAni = true) {
        for (let p of this.game.plyMgr.gamer) {
            let nodeCard
            if (p.isMe) {
                if (!p.isLooker)
                    nodeCard = this.game.pokerGame.getPoker(card)
            } else {
                nodeCard = this.game.pokerGame.getPoker(0)
            }
            this.game.dealCard(p, nodeCard, doAni)
            if (doAni) {
                await new Promise(resolve => setTimeout(resolve, 150));
            }
        }
    }
    private handleGrabDealer(data: ps.Qznn_DoDealer) {
        let p = this.getPlayer(data.pos)
        if (!p) {
            console.warn("no body grab dealer")
            return
        }
        p.grabVal = data.point
        p.changeState(nnPlayerState.GRABBED)
    }
    private handleShowDealer(data: ps.Qznn_AppointDealer) {
        this.phaseChange({ status: GameState.STATUS_APPOINT_DEALER, timer: 0 })
        if (!data.players) return
        let dealer, dealerPoint
        for (let gmr of data.players) {
            let p = this.getPlayer(gmr.pos)
            if (!p) continue
            p.grabVal = gmr.dealerPnt
            p.changeState(nnPlayerState.GRABBED)
            if (gmr.job === Job.Dealer) {
                this.game.dealerMultiple = gmr.dealerPnt
                dealer = p
                dealerPoint = gmr.dealerPnt
            }
        }
        if (!dealer) return
        dealer.isDealer = true
        // 选庄动画
        let dealerGrabs = []
        for (let d of data.players) {
            if (d.dealerPnt !== dealerPoint) continue
            let p = this.getPlayer(d.pos)
            if (!p || p.isLooker) continue
            dealerGrabs.push(p)
        }

        if (dealerGrabs.length > 1) {
            this.game.chooseDealer(dealer, dealerGrabs)
        } else {
            dealer.becomeDealer(true)
        }
    }

    private handleBet(data: ps.Qznn_DoBet) {
        let p = this.getPlayer(data.pos)
        if (!p) {
            console.warn("no body grab dealer")
            return
        }
        p.betVal = data.bets
        p.changeState(nnPlayerState.BETTED)
        this.game.adoMgr.playBet()
    }
    private handleDealLastCard(data: ps.Qznn_DealLastCard) {
        this.phaseChange({ status: GameState.STATUS_DEAL_LAST_CARD, timer: 0 })
        this.deal1Card(data.card)
    }
    private handleDoHandout(data: ps.Qznn_DoHandout) {
        // if (this.game.gameState > GameState.BullCalculate) {
        //     return;
        // }
        this.pCards[data.pos] = { bullType: data.bullType, cards: data.cards }
        this.showHandout(data.pos, data.bullType, data.cards);
    }

    private getPlayer(pos: number) {
        return this.game.plyMgr.getPlyByPos(pos)
    }

    private _showForLooker = true
    private _showForLookerLast = true


    private phaseChange(data: ps.Qznn_StatusChange, isReconnect = false) {
        let game = this.game
        let playerMgr = game.plyMgr
        let me = playerMgr.me


        game.changeState(data.status)
        //发牌和结算前阶段都需给旁观者补其他玩家的手牌，//自己是旁观者，不会收到发牌消息，模拟一个
        //补n张
        if (data.status < GameState.STATUS_BALANCE) {
            if (me.isLooker && this._showForLooker) {
                this._showForLooker = false
                if (data.status >= GameState.STATUS_DEAL_LAST_CARD)
                    this.dealSomeCards([0, 0, 0, 0, 0], data.status === GameState.STATUS_DEAL_LAST_CARD)
                else if (data.status >= GameState.STATUS_DEAL_FOUR_CARDS)
                    this.dealSomeCards([0, 0, 0, 0], data.status === GameState.STATUS_DEAL_FOUR_CARDS)
            }
        }

        switch (data.status) {
            case GameState.STATUS_FREE:
                break
            case GameState.STATUS_START:
                this._showForLooker = true
                this._showForLookerLast = true
                //roomdata消息中没有开始游戏，所以不会请求currentgameinfo，然后马上收到startgame，但自己是旁观，所以在这里再判断一次
                if (user.where == undefined && me.state < PlayerState.READY) {
                    this.game.showWaitTips()
                }
                break

            case GameState.STATUS_DODEALER:
                if (!me.isLooker) {
                    //显示时钟
                    this.game.showTicker(data.timer)
                }
                this.game.plyMgr.chgGmrState(nnPlayerState.GRABBING)
                break

            case GameState.STATUS_APPOINT_DEALER:
                //隐藏时钟
                game.hideTicker()
                break

            case GameState.STATUS_DOBET:
                if (!me.isLooker) {
                    //显示时钟
                    game.showTicker(data.timer)
                }
                playerMgr.chgGmrState(nnPlayerState.BETTING)
                break

            case GameState.STATUS_DEAL_LAST_CARD:
                //隐藏时钟
                game.hideTicker()
                break

            case GameState.STATUS_HANDOUT:

                if (!me.isLooker) {
                    //显示时钟
                    game.showTicker(data.timer)
                    game.dock.showCalculate()
                }
                break

            case GameState.STATUS_BALANCE:
                //隐藏时钟
                game.hideTicker()
                game.dock.hideCalculate()
                break

            // case GameState.End:
            //     this._showForLooker = true
            //     break
        }
    }

    private async showHandout(pos: number, bullType: number, cards: number[]) {
        let p = this.getPlayer(pos)
        if (!p) return
        if (p.isMe) {
            this.game.dock.hideCalculate()
        }
        let nnCards = []
        let newCards = cards
        //排序
        if (bullType > BullType.Bull0 && bullType <= BullType.BullBoom) {
            newCards = []
            let idxes = sortCards(cards)
            idxes.forEach(val => {
                newCards.push(cards[val])
            })
        }

        for (let r of newCards) {
            let card = this.game.pokerGame.getPoker(r)
            nnCards.push(card.getComponent(PokerCard))
        }
        await p.showCard(nnCards, bullType, true)
        p.updateComplete(true)
    }

    private async handleResult(data: ps.Qznn_EnterBalance) {
        this.phaseChange({ status: GameState.STATUS_BALANCE, timer: 0 })
        let me = this.game.plyMgr.me
        if (me && !me.isLooker) {
            for (let ply of data.player) {
                let p = this.game.plyMgr.getPlyByPos(ply.pos)
                if (p && p.isMe && !p.isComplete()) {
                    this.showHandout(ply.pos, this.pCards[ply.pos].bullType, this.pCards[ply.pos].cards)
                }
            }
        }
        await this.showHandCards(data.player, false)
        await new Promise(resolve => {
            this.game.scheduleOnce(() => {
                resolve()
            }, 1.5)
        })
        let winners = []
        let losers = []
        //分别统计输赢人数
        let meWin = true
        let dealer
        for (let ply of data.player) {
            let p = this.getPlayer(ply.pos)
            if (!p) continue
            if (ply.job === Job.Dealer) {
                dealer = p
            }
            if (p.isMe) {
                meWin = +ply.chgMoney >= 0
            }
            if (ply.chgMoney.includes('.') && ply.chgMoney.substring(ply.chgMoney.indexOf('.')).length > 3) {
                cc.error("xxxxxxxxxxxxxx")
            }
            if (ply.tax.includes('.') && ply.tax.substring(ply.tax.indexOf('.')).length > 3) {
                cc.error("taxxxxxxxxxxxxxxx")
            }
            if (p && !p.isDealer) {
                if (+ply.chgMoney > 0) {
                    winners.push(ply)
                } else {
                    losers.push(ply)
                }
            }
        }
        if (me && !me.isLooker) {
            if (meWin) {
                if (me.isDealer && winners.length === 0 && losers.length >= 3) {
                    await this.game.playAnimWinAll()
                } else {
                    await this.game.playAnimWin()
                }
            } else {
                await this.game.playAnimLose()
            }
        }
        if (dealer) {
            let loseCoins = []
            for (let ret of losers) {
                let p = this.getPlayer(ret.pos)
                if (!isNaN(+ret.chgMoney) && +ret.chgMoney < 0) {
                    loseCoins.push(p.flyCoins(dealer))
                    dealer.showWinEff()
                }
            }
            await Promise.all(loseCoins)
            let winCoins = []
            for (let ret of winners) {
                let p = this.getPlayer(ret.pos)
                p.showWinEff()
                if (!isNaN(+ret.chgMoney) && +ret.chgMoney > 0) {
                    winCoins.push(dealer.flyCoins(p))
                }
            }
            await Promise.all(winCoins)
            let scores = []
            for (let ply of data.player) {
                let p = this.getPlayer(ply.pos)
                if (!p) continue

                scores.push(p.showWinOrLost(ply.chgMoney))
                if (p.money !== undefined)
                    p.updateMoney(new Decimal(p.money).add(ply.chgMoney).toString())
            }
            await Promise.all(scores)
            for (let ply of data.player) {
                let p = this.getPlayer(ply.pos)
                let type = this.pCards[ply.pos].bullType
                let cards = this.pCards[ply.pos].cards

                if (type >= BullType.BullBoom) {
                    this.game.adoMgr.playBull(type, p.isMale)
                }
                if (type === BullType.BullBoom) {
                    await this.game.playAnimBullBoom(cards)
                } else if (type === BullType.BullFlower) {
                    await this.game.playAnimBullMarble(cards)
                } else if (type === BullType.BullSmall) {
                    await this.game.playAnimBullSmall(cards)
                }
            }
        }
    }

    private async showHandCards(data: { pos: number, job: number }[], doAni = false) {
        if (!data) {
            console.warn("no handCard data")
            return
        }
        let result = data.slice()
        result.sort((a, b) => {
            let ret = a.job - b.job
            if (ret !== 0) {
                return ret
            }
            return (this.pCards[a.pos].bullType || -1) - (this.pCards[b.pos].bullType || -1)
        })
        for (let ret of result) {
            let p = this.getPlayer(ret.pos)
            if (p.isComplete()) {
                continue
            }
            let cards: PokerCard[] = []
            for (let r of this.pCards[ret.pos].cards) {
                let card = this.game.pokerGame.getPoker(r).getComponent(PokerCard)
                cards.push(card)
            }
            await p.showCard(cards, this.pCards[ret.pos].bullType, doAni)
        }
    }

    protected handleGameInfo(data: ps.Qznn_GameInfo) {
        if (!data) return
        super.handleGameInfo(data)

        //显示等待提示
        let me = this.game.plyMgr.me;
        if (user.where == undefined && data.status >= GameState.STATUS_FREE && me.state < PlayerState.READY) {
            this.game.showWaitTips();
        }
        //重连跳过handout阶段
        // if (data.status === GameState.STATUS_HANDOUT) {
        //     data.status = GameState.STATUS_BALANCE
        // }
        this.phaseChange({ status: data.status, timer: data.timer }, true)
        if (!data.playerInfo) return

        for (let gmr of data.playerInfo) {
            let p = this.getPlayer(gmr.pos)
            if (!p) continue

            p.changeState(PlayerState.READY)
            if (gmr.job === Job.Dealer) {
                this.game.dealerMultiple = gmr.dealerPnt
                p.becomeDealer(true, false)
            }
        }
        if (data.status === GameState.STATUS_DEAL_LAST_CARD) {
            //发5张牌
            for (let gmr of data.playerInfo) {
                if (gmr.cards && gmr.cards.length === 5) {
                    this.dealSomeCards(gmr.cards, false)
                }
            }
        } else if (data.status < GameState.STATUS_HANDOUT) {
            for (let gmr of data.playerInfo) {
                let p = this.getPlayer(gmr.pos)
                if (gmr.cards && gmr.cards.length > 0) {
                    if (gmr.cards.length === 4) {
                        this.dealSomeCards(gmr.cards, false)
                    } else if (gmr.cards.length === 1) {
                        this.deal1Card(gmr.cards[0], false)
                    }
                }
            }
        } else {
            if (data.status === GameState.STATUS_HANDOUT) {
                for (let gmr of data.playerInfo) {
                    let p = this.getPlayer(gmr.pos)
                    if (!gmr.isHandouted) {
                        if (p.isMe) {
                            this.game.dealCards(p, gmr.cards, false)
                        } else {
                            this.game.dealCards(p, [0, 0, 0, 0, 0], false)
                        }
                    }
                }
            }
            for (let gmr of data.playerInfo) {
                this.pCards[gmr.pos] = { bullType: gmr.bullType, cards: gmr.cards }
            }
        }
        //抢庄值
        if (data.status >= GameState.STATUS_DODEALER) {
            for (let gmr of data.playerInfo) {
                if (gmr.dealerPnt !== -1) {
                    this.handleGrabDealer({ pos: gmr.pos, point: gmr.dealerPnt })
                }
            }
        }
        //押注值
        if (data.status >= GameState.STATUS_DOBET) {
            for (let gmr of data.playerInfo) {
                if (gmr.betPnt !== 0) {
                    this.handleBet({ pos: gmr.pos, bets: gmr.betPnt })
                }
            }
        }
        //结算亮牌
        if (data.status >= GameState.STATUS_BALANCE) {
            //展示玩家手牌
            this.showHandCards(data.playerInfo, false);
        }
    }
    sendBet(val: number) {
        net.notify("game.qznnHandler.doBet", { betPoint: val })
    }

    sendDealer(val: number) {
        net.notify("game.qznnHandler.doDealer", { dealerPoint: val })
    }

    //计算完成
    sendFinish() {
        net.notify("game.qznnHandler.doHandout", {})
    }
}