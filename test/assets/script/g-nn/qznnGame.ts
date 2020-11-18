import nnDock from "./nnDock"
import nnOperation from "./nnOperation"
import nnInfo from "./nnInfo"
import nnPlayerMgr from "./nnPlayerMgr"
import QznnMsg from "./qznnMsg"
import nnAudio from "./nnAudio"
import nnPlayer from "./nnPlayer"
import PokerCard from "../g-share/pokerCard"
import Game from "../g-share/game"
import { nnDesc } from "./nnConst"
import PokerGame from "../g-share/pokerGame"
import { PlayerState } from "../g-share/player"
import { sortCards } from "./nnUtil";
import { GAME_NAME } from "../common/cfg";
import { GameId } from "../common/enum";

const { ccclass, property } = cc._decorator

export enum GameState {
    STATUS_FREE = -1,
    STATUS_START = 0,
    STATUS_DEAL_FOUR_CARDS = 1,
    STATUS_DODEALER,//抢庄
    STATUS_APPOINT_DEALER, //播放选中庄家的特效
    STATUS_DOBET,//押注
    STATUS_DEAL_LAST_CARD,
    STATUS_HANDOUT,//出牌
    STATUS_BALANCE, //结算(数据库)
    Result,//结算(展示)
    End, //结束
}

@ccclass
export default class QznnGame extends Game {
    @property({ type: nnAudio, override: true })
    adoMgr: nnAudio = undefined

    @property({ type: nnPlayerMgr, override: true })
    plyMgr: nnPlayerMgr = undefined

    @property(cc.Node)
    readonly nodeDock: cc.Node = undefined

    @property(nnOperation)
    readonly operation: nnOperation = undefined

    @property(nnInfo)
    readonly info: nnInfo = undefined

    @property(cc.Font)
    readonly fontGrab: cc.Font = undefined

    @property(cc.Font)
    readonly fontBet: cc.Font = undefined

    @property(cc.SpriteFrame)
    readonly sfCalComplete: cc.SpriteFrame = undefined

    @property(cc.Node)
    readonly nodeCardBox: cc.Node = undefined

    @property([cc.SpriteFrame])
    readonly sfBullType: cc.SpriteFrame[] = []

    @property(cc.Prefab)
    readonly prefabAnimWinAll: cc.Prefab = undefined

    @property(cc.Prefab)
    readonly prefabAnimLose: cc.Prefab = undefined

    @property(cc.Prefab)
    readonly prefabAnimWin: cc.Prefab = undefined

    @property(cc.Prefab)
    readonly prefabAnimBullBoom: cc.Prefab = undefined

    @property(cc.Prefab)
    readonly prefabAnimBullMarble: cc.Prefab = undefined

    @property(cc.Prefab)
    readonly prefabAnimBullSmall: cc.Prefab = undefined

    @property(cc.Prefab)
    readonly prefabCoin: cc.Prefab = undefined

    @property(cc.Node)
    readonly nodeCoinBox: cc.Node = undefined

    @property(cc.Node)
    readonly waitTips: cc.Node = undefined

    @property(PokerGame)
    pokerGame: PokerGame = undefined

    dock: nnDock
    msg: QznnMsg
    dealerMultiple: number
    private _coinPool: cc.NodePool

    onLoad() {
        // cc.log('qznn onload')
        super.onLoad()
        this.plyMgr.hidePlys()
        this._coinPool = new cc.NodePool()
        for (let i = 0; i < 23; i++) {
            let coin = cc.instantiate(this.prefabCoin)
            this._coinPool.put(coin)
        }
    }

    getCoin() {
        let coin = this._coinPool.get()
        if (!coin) {
            coin = cc.instantiate(this.prefabCoin)
        }
        return coin
    }

    retrieveCoin(coin: cc.Node) {
        this._coinPool.put(coin)
    }

    initGame(): void {
        // cc.log('init game......................')
        this.waitTips.active = false
        this.info.node.active = false
        this.operation.node.active = true
        this.nodeAnimation.active = true
        this.dock = this.nodeDock.getComponent(nnDock)
        this.nodeDock.active = true
        this.dock.setGame(this)
        this.operation.init(this)
        this.info.init(this, GAME_NAME[GameId.QZNN])
        this.msg = new QznnMsg(this)
        this.msg.init()
        this.plyMgr.hidePlys()
        this.nodeAnimation.getComponentsInChildren(cc.Animation).forEach(a => {
            a.stop()
        })
    }
    initRound(): void {
        // cc.log('  initRound......................')
        this.waitTips.active = false
        this.doPrepare()
        this.hideTicker()
        this.plyMgr.clearOtherPlys()
        this.plyMgr.chgState(PlayerState.UNREADY)
        this.plyMgr.clearCards()
        this.operation.showDealer(false)
        this.operation.showBet(false)
        this.dock.init()
    }
    //显示等待下局
    showWaitTips() {
        this.waitTips.active = true;
    }

    dealRoomData(data: ps.GameRoomHandlerGetRoomData) {
        this.info.node.active = true;
        this.info.updateBetsPool();
        this.initRound();
    }


    updateUI(): void {
        let me = this.plyMgr.me;
        this.info.hidePrompt();
        this.operation.showDealer(false);
        this.operation.showBet(false);
        switch (this.gameState) {
            case GameState.STATUS_START:
                if (!me.isLooker) {
                    this.info.showPrompt(nnDesc.descGameReadyStart);
                }
                break;
            case GameState.STATUS_DODEALER:
                if (!me.isLooker) {
                    this.info.showPrompt(nnDesc.descForGrab);
                    this.operation.showDealer();
                }
                break;
            case GameState.STATUS_DOBET:
                if (!me.isLooker) {
                    if (me.isDealer) {
                        this.info.showPrompt(nnDesc.descForDealerBet);
                    } else {
                        this.info.showPrompt(nnDesc.descForBet);
                        this.operation.showBet();
                    }
                }
                break;
            case GameState.STATUS_HANDOUT:
                if (!me.isLooker) {
                    this.info.showPrompt(nnDesc.descForCal);
                }
                break;
            case GameState.End:
                this.plyMgr.clearOtherPlys()
                break;
        }
        if (me.isLooker
            && this.gameState >= GameState.STATUS_DEAL_FOUR_CARDS
            && this.gameState < GameState.Result) {
            this.info.showPrompt(nnDesc.descForLooker);
        }
        this.menu.updateBtnState();
    }

    setGameStart(): void {
        super.setGameStart()
        this.changeState(GameState.STATUS_START);
    }
    setGameEnd(): void {
        super.setGameEnd()
        this.changeState(GameState.End);
    }

    dealCard(p: nnPlayer, nodeCard: cc.Node, doAnim = true, toLeft = false) {
        let card = nodeCard.getComponent(PokerCard)
        this.nodeCardBox.addChild(nodeCard)
        nodeCard.setPosition(0, 0)
        if (doAnim) {
            card.turn(false, false)
            nodeCard.scale = 0.2
        }
        if (p.isMe && this.gameState < GameState.STATUS_BALANCE) {
            this.dock.addCard(card, doAnim, toLeft)
        } else {
            p.addCard(card, doAnim, toLeft)
        }
        this.adoMgr.playDeal()
    }

    async dealCards(p: nnPlayer, cards: number[], doAnim = true) {
        let nodeCards = []
        for (let r of cards) {
            let card = this.pokerGame.getPoker(r)
            nodeCards.push(card)
        }
        for (let c of nodeCards) {
            this.dealCard(p, c, doAnim, true)
            await new Promise(resolve => setTimeout(resolve, 50))
        }
    }

    playAnimWin() {
        this.adoMgr.playWin()
        return super.playAnim(this.prefabAnimWin)
    }

    playAnimWinAll() {
        this.adoMgr.playWinAll()
        return this.playAnim(this.prefabAnimWinAll)
    }

    playAnimLose() {
        this.adoMgr.playLose()
        return this.playAnim(this.prefabAnimLose)
    }

    private playAnimBull(prefab: cc.Prefab, cards: number[]) {
        let nodeCards = []
        cards.forEach(r => {
            let c = this.pokerGame.getPoker(r);
            nodeCards.push(c);
        });
        //先把扑克牌替换掉，再播放动画
        let node = this.nodeAnimation.getChildByName(prefab.name)
        if (!node) {
            node = cc.instantiate(prefab)
            this.nodeAnimation.addChild(node)
        }
        if (nodeCards) {
            for (let i = 0; i < nodeCards.length; i++) {
                let n = node.getChildByName("c" + (i + 1))
                if (n && nodeCards[i]) {
                    n.destroyAllChildren()
                    n.removeAllChildren()
                    n.addChild(nodeCards[i])
                }
            }
        }
        return this.playAnim(node);
    }
    playAnimBullBoom(runes: number[]) {
        //排序
        let newCards = []
        let idxes = sortCards(runes)
        idxes.forEach(val => {
            newCards.push(runes[val])
        })
        return this.playAnimBull(this.prefabAnimBullBoom, newCards);
    }

    playAnimBullMarble(runes: number[]) {
        return this.playAnimBull(this.prefabAnimBullMarble, runes);
    }

    playAnimBullSmall(runes: number[]) {
        return this.playAnimBull(this.prefabAnimBullSmall, runes);
    }

    playDealerAnim(node: cc.Node) {
        return this.playAnim(node, true);
    }

    playWinAnim(node: cc.Node) {
        return this.playAnim(node);
    }

    async chooseDealer(dealer: nnPlayer, targets: nnPlayer[]) {
        let duration = 50
        targets.sort((a, b) => a.seat - b.seat)
        let lastShow
        let start = Date.now()
        for (let i = 0; ; i++) {
            if (!this.isValid) {
                return
            }
            if (i >= targets.length) {
                i = 0
            }
            if (lastShow) {
                lastShow.showDealerFrame(false)
            }
            let t = targets[i]
            t.showDealerFrame(true)
            lastShow = t
            let now = Date.now()
            if (now - start >= 1000 && t === dealer) {
                dealer.becomeDealer(true, true)
                this.adoMgr.playDealerChoose()
                return
            }
            await new Promise(resolve => setTimeout(resolve, duration))
            duration += duration / (2 * targets.length)
            if (duration <= 0) {
                break
            }
        }
    }
}