import Player, { PlayerState } from "../g-share/player"
import PokerCard from "../g-share/pokerCard"
import JDNNGame from "./jdnnGame"
import QznnGame from "./qznnGame"
import { randf, parabola, } from "../common/util"
import { BullType, nnPlayerState, bullBoost } from "./nnConst"
import JdnnGame from "./jdnnGame";
import { getBullTypeBg } from "../g-nn/nnUtil";
const { ccclass, property } = cc._decorator



@ccclass
export default class NNPlayer extends Player {

    @property(cc.Node)
    private nodeCards: cc.Node = undefined

    @property(cc.Node)
    private nodeCardDesc: cc.Node = undefined

    @property(cc.Sprite)
    private spriteCardDesc: cc.Sprite = undefined

    @property(cc.Label)
    private nodeCardboost: cc.Label = undefined

    @property(cc.Node)
    private nodeThinking: cc.Node = undefined

    @property(cc.Sprite)
    private spDealerFrame: cc.Sprite = undefined

    @property(cc.Node)
    private dealerEff: cc.Node = undefined

    @property(cc.Node)
    private winEff: cc.Node = undefined



    game: JDNNGame | QznnGame
    private cards: PokerCard[]
    grabVal: number
    betVal: number

    changeState(state: nnPlayerState | PlayerState): void {
        this.state = state
        this.updateThinkingMask(false)
        switch (state) {
            case PlayerState.UNREADY:
                this.becomeDealer(false)
                this.clearCards()
                this.grabVal = undefined
                this.betVal = undefined
                this.lblBets.node.active = false
                this.nodeCardDesc.active = false
                this.dealerEff.active = false
                this.winEff.active = false
                break
            case nnPlayerState.GRABBING:
                this.updateThinkingMask(true)
                break
            case nnPlayerState.GRABBED:
                this.updateGrab(true)
                if (this.isMe) {
                    this.game.operation.showDealer(false)
                }
                break
            case nnPlayerState.BETTING:
                if (!this.isDealer) {
                    this.updateGrab(false)
                    this.updateThinkingMask(true)
                }
                break
            case nnPlayerState.BETTED:
                if (!this.isDealer) {
                    this.updateBet(true)
                    if (this.isMe) {
                        this.game.operation.showBet(false)
                    }
                }
                break
        }
        this.updateLookerView()
    }

    init(game: QznnGame | JdnnGame) {
        super.init(game);
        this.sAva.node.active = true
        this.lLoc.node.active = true
        this.lLoc.string = "--"
        this.sMoneyIcon.node.active = false
        this.lMoney.node.active = true
        this.lMoney.string = "--"
        this.lblBets.node.active = false
        this.nodeCards.active = true
        this.nodeCardDesc.active = false
        this.nodeThinking.active = false
        this.spDealerFrame.node.active = false
        this.spDealerFrame.node.active = true
        this.dealerEff.active = false
        this.winEff.active = false
        this.changeState(PlayerState.UNREADY)
        this.clearCards()
    }

    clearCards() {

        this.cards = []
        this.nodeCards.destroyAllChildren()
        this.nodeCards.removeAllChildren(true)
        this.nodeCards.width = 0
    }

    addCard(card: PokerCard, doAnim = true, toLeft = false) {
        if (!this.cards || this.cards.length >= 5) {
            card.node.destroy()
            return
        }
        this.cards.push(card)

        let nodeCard = card.node
        let parent = nodeCard.parent
        let nodeCards = this.nodeCards

        let layout = nodeCards.getComponent(cc.Layout)
        layout.enabled = this.isMe

        if (doAnim) {
            let posW = parent.convertToWorldSpaceAR(nodeCard.position)
            parent.removeChild(nodeCard)
            nodeCards.addChild(nodeCard)
            let pos = nodeCards.convertToNodeSpaceAR(posW)
            nodeCard.setPosition(pos)
            let duration = 0.5
            let actions = cc.sequence(
                cc.spawn(
                    cc.scaleTo(duration, 1),
                    parabola(duration, cc.v2(nodeCard.position), this.getNewCardPos(nodeCard, toLeft ? 0 : undefined))
                ),
                cc.moveTo(0.2, this.getNewCardPos(nodeCard))
            )
            // nodeCard.runAction(actions)
            cc.tween(nodeCard).then(actions).start();
        } else {
            if (nodeCard.parent) {
                nodeCard.parent.removeChild(nodeCard)
            }
            nodeCards.addChild(nodeCard)
            nodeCard.scale = 1
            nodeCard.setPosition(this.getNewCardPos(nodeCard))
        }
    }

    private getNewCardPos(card: cc.Node, index?: number) {
        if (index === undefined) {
            index = card.getSiblingIndex()
        }
        let node = this.nodeCards
        let layout = node.getComponent(cc.Layout)
        let spaceX = (index > 0 ? layout.spacingX : 0)
        let baseWidth = index * card.width
        let x = baseWidth + card.width / 2 + spaceX * index
        return cc.v2(x, 0)
    }

    becomeDealer(yeah = true, doAnim = true) {
        this.isDealer = yeah
        this.spDealerFrame.node.active = yeah
        if (yeah) {
            if (doAnim) {
                let actions = cc.sequence(
                    cc.blink(1, 5),
                    cc.callFunc(() => {
                        this.spDealerFrame.node.active = this.isDealer
                        this.spDealerFrame.node.active = this.isDealer
                        this.game.playDealerAnim(this.dealerEff)
                    })
                )
                // this.spDealerFrame.node.runAction(actions)
                cc.tween(this.spDealerFrame.node).then(actions).start();
            } else {
                this.spDealerFrame.node.active = this.isDealer
                this.spDealerFrame.node.active = this.isDealer
            }
        } else {
            this.spDealerFrame.node.active = this.isDealer
        }
    }

    showDealerFrame(show: boolean) {
        if (show) {
            this.game.adoMgr.playDealerChoosing()
        }
        this.spDealerFrame.node.active = show
    }

    showWinEff() {
        this.scheduleOnce(() => {
            if (!this.winEff.active) {
                this.game.playWinAnim(this.winEff)
            }
        }, 0.2)
    }

    updateThinkingMask(thinking: boolean) {
        if (this.isLooker) {
            return
        }
        this.nodeThinking.active = thinking
    }

    updateGrab(flag: boolean) {
        if (flag) {
            this.lblBets.node.active = true
            if (this.grabVal >= 0) {
                this.lblBets.string = ""

                let betNode = this.lblBets.node
                betNode.color = (new cc.Color).fromHEX("#fff66b")
                let outLine = betNode.getComponent(cc.LabelOutline)
                outLine.color = (new cc.Color).fromHEX("#9e470e")

                let descArray = ["不抢", "抢x1", "抢x2", "抢x3", "抢x4"]
                this.lblBets.string = descArray[this.grabVal]
            }
        } else {
            this.lblBets.node.active = false
        }
    }

    updateBet(flag: boolean) {
        if (flag) {
            this.lblBets.node.active = true
            if (this.grabVal >= 0) {
                this.lblBets.string = ""

                let betNode = this.lblBets.node
                betNode.color = (new cc.Color).fromHEX("#AFFFFF")
                let outLine = betNode.getComponent(cc.LabelOutline)
                outLine.color = (new cc.Color).fromHEX("#1F474E")

                this.lblBets.string = "x" + this.betVal
            }
        } else {
            this.lblBets.node.active = false
        }
    }

    isComplete() {
        return this.nodeCardDesc.active
    }

    updateComplete(flag: boolean) {
        if (!flag) {
            this.nodeCardDesc.active = false
            return
        } else {
            this.nodeCardDesc.active = true
            let layout = this.nodeCards.getComponent(cc.Layout)
            layout.enabled = true
        }
    }

    showCard(cards: PokerCard[], bullType: BullType, doAnim = true) {
        return new Promise(resolve => {
            this.clearCards()
            for (let c of cards) {
                this.addCard(c, false)
            }
            if (bullType === BullType.BullBoom) {
                let node = new cc.Node()
                node.width = 100
                this.nodeCards.addChild(node)
                node.setSiblingIndex(4)
            } else if (bullType >= BullType.Bull1 && bullType <= BullType.Bull10) {
                let node = new cc.Node()
                node.width = 100
                this.nodeCards.addChild(node)
                node.setSiblingIndex(3)
            }
            let layout = this.nodeCards.getComponent(cc.Layout)
            layout.enabled = true
            this.nodeCardDesc.active = true
            this.nodeCardDesc.y = this.nodeCards.y - 18
            this.spriteCardDesc.spriteFrame = this.game.sfBullType[bullType]
            this.nodeCardboost.string = `x${bullBoost[bullType]}`;
            let node = this.spriteCardDesc.node
            if (doAnim) {
                node.scale = 5
                let actions = cc.sequence(
                    cc.scaleTo(0.2, 1),
                    cc.delayTime(0.3),
                    cc.callFunc(resolve)
                )
                // node.runAction(actions)
                cc.tween(node).then(actions).start();
            } else {
                node.scale = 1
                resolve()
            }
            if (bullType !== BullType.BullBoom && bullType !== BullType.BullFlower && bullType !== BullType.BullSmall) {
                this.game.adoMgr.playBull(bullType, this.isMale)
            }
        })
    }

    flyCoins(tar: NNPlayer) {
        let node = this.game.nodeCoinBox
        let from = this.sAva.node
        let to = tar.sAva.node
        let fromPos = from.convertToWorldSpaceAR(cc.v2(0, 0))
        fromPos = node.convertToNodeSpaceAR(fromPos)
        let toPos = to.convertToWorldSpaceAR(cc.v2(0, 0))
        toPos = node.convertToNodeSpaceAR(toPos)
        let promises = []
        this.game.adoMgr.playChips()
        for (let i = 0; i < 23; i++) {
            let p = new Promise(resolve => {
                setTimeout(() => {
                    if (!this.game || !this.game.isValid) {
                        resolve()
                        return
                    }
                    let r = randf(-1, 1) * 20
                    let r1 = randf(-1, 1) * 20
                    let coin = this.game.getCoin()
                    node.addChild(coin)
                    coin.setPosition(fromPos.x + r1, fromPos.y + r)
                    let actions = cc.sequence(
                        parabola((500 + r) / 1000, cc.v2(coin.position), cc.v2(toPos.x + r, toPos.y + r1)),
                        cc.callFunc(() => {
                            if (this.game && this.game.isValid) {
                                this.game.retrieveCoin(coin)
                            } else {
                                coin.destroy()
                            }
                            resolve()
                        })
                    )
                    // coin.runAction(actions)
                    cc.tween(coin).then(actions).start();
                }, i * 30)
            })
            promises.push(p)
        }
        return Promise.all(promises)
    }

    updateLookerView() {
        if (this.isLooker) {
            this.node.opacity = 125
        } else {
            this.node.opacity = 255
        }
        this.sAva.node.opacity = 255
    }
}
