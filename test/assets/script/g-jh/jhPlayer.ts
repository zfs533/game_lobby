const { ccclass, property } = cc._decorator;
import { PlayerState } from "../g-share/player";
import JHGame, { CardsType } from "./jhGame";
import TurningPlayer from "../g-share/turningPlayer";
import { parabola } from "../common/util";
import PokerCard from '../g-share/pokerCard';
import { UserOpt } from './jhOperation';

let Decimal = window.Decimal;
@ccclass
export default class JHPlayer extends TurningPlayer {
    @property(cc.Sprite)
    private nodeBg: cc.Sprite = undefined;

    @property(cc.Sprite)
    private spDealerFrame: cc.Sprite = undefined;

    @property(cc.Sprite)
    private spLoseMask: cc.Sprite = undefined;

    @property(cc.Sprite)
    private spLoseType: cc.Sprite = undefined;

    @property(cc.SpriteFrame)
    private sfTypeLose: cc.SpriteFrame = undefined;

    @property(cc.SpriteFrame)
    private sfTypeDiscard: cc.SpriteFrame = undefined;

    @property(cc.Node)
    private nodeAction: cc.Node = undefined;

    @property(cc.Node)
    private nodeCards: cc.Node = undefined;

    @property(cc.Sprite)
    private spLookedCards: cc.Sprite = undefined;

    @property(cc.Sprite)
    private spCardType: cc.Sprite = undefined;

    @property(cc.SpriteFrame)
    private sfDiscard: cc.SpriteFrame = undefined;

    @property(cc.SpriteFrame)
    private sfRaise: cc.SpriteFrame = undefined;

    @property(cc.SpriteFrame)
    private sfCall: cc.SpriteFrame = undefined;

    @property(cc.SpriteFrame)
    private sfAllIn: cc.SpriteFrame = undefined;

    @property(cc.Sprite)
    private cardsMask: cc.Sprite = undefined;

    @property(cc.Node)
    private dealerEff: cc.Node = undefined;

    game: JHGame;

    get isMe() {
        return false;
    }

    private cards: cc.Node[];
    /**
     * 是否已经看牌
     *
     * @type {boolean}
     * @memberof JHPlayer
     */
    isLooked: boolean;
    /**
     * 是否已比牌输掉
     *
     * @type {boolean}
     * @memberof JHPlayer
     */
    isLoser: boolean;
    /**
     * 牌型
     *
     * @type {CardsType}
     * @memberof JHPlayer
     */
    cardType: CardsType;
    /**
     * 是否已弃牌
     *
     * @type {boolean}
     * @memberof JHPlayer
     */
    isDiscarded: boolean;

    private _bets: number;
    get bets() {
        return this._bets;
    }
    private _isTuring: boolean;
    get isTuring() {
        return this._isTuring;
    }
    private _actionAnim: cc.Action;
    private _actionAnimTween: cc.Tween = undefined
    private _shouldHideAction: boolean;
    /**
     * 是否为旁观者
     *
     * @readonly
     * @memberof Player
     */
    get isLooker() {
        if (this.state && this.state !== PlayerState.UNREADY && !this.isDiscarded && !this.isLoser) {
            return false;
        }
        return true;
    }

    changeState(state: PlayerState): void {
        this.state = state;
        switch (state) {
            case PlayerState.UNREADY:
                this.cardType = CardsType.Normal;
                this.isDealer = false;
                this.isLooked = false;
                this.isDiscarded = false;
                this.updateLoseMask(false);
                this.becomeDealer(false);
                this.updateCardType(false);
                this.updateLooked(false);
                this.clearCards();
                this.spLoseType.node.active = false;
                this.spLoseMask.node.active = false;
                this.dealerEff.active = false;
                this.resetBets();
                break;
        }
        this.updateLookerView();
    }

    protected onEnable() {
        this.initUI();
    }

    private initUI() {
        this.sAva.node.active = true;
        this.lblBets.node.parent.active = false;
        this.lblBets.string = "0";
        this.nodeAction.active = false;
        this.nodeCards.active = true;
        this.spCardType.node.parent.active = false;
        this.spDealerFrame.node.active = false;
        this.spLookedCards.node.active = false;
        this.spLoseMask.node.active = false;
        this.spriteTimer.node.active = false;
        this.resetBets();
        this.changeState(PlayerState.UNREADY);
        this.clearCards();
    }

    clearCards() {
        if (this.cards) {
            this.cards.forEach(c => {
                c.removeFromParent(true);
            });
        }
        this.cards = [];
        this.nodeCards.destroyAllChildren();
    }

    /**
     * @description 更新已看牌状态
     * @param {boolean} [vis]
     * @returns
     * @memberof JHPlayer
     */
    updateLooked(vis?: boolean) {
        if (!this.spLookedCards) {
            console.warn("no sprite to look");
            return;
        }
        if (vis !== undefined) {
            this.spLookedCards.node.active = vis;
            return
        }
        this.spLookedCards.node.active = this.isLooked && !this.isDiscarded;
    }

    updateLoseMask(vis: boolean) {
        this.isLoser = vis;
        this.spLoseMask.node.active = vis;
        //显示战败
        this.spLoseType.spriteFrame = this.sfTypeLose;
        this.spLoseType.node.active = vis;
    }

    updateCardType(vis: boolean) {
        let node = this.spCardType.node.parent;
        if (vis && this.cardType >= CardsType.Pair) {
            node.active = true;
            this.spCardType.spriteFrame = this.game.getCardTypeSf(this.cardType);
        } else {
            node.active = false;
        }
    }

    updateBets() {
        if (!this.lblBets || !this.lblBets.isValid) {
            return;
        }
        this.lblBets.node.parent.active = !!this._bets;
        this.lblBets.string = this._bets.toString();
    }

    resetBets() {
        this._bets = 0;
        this.updateBets();
    }

    /**
     * 开始回合
     *
     * @param {number} time second
     * @param {number} [totalTime] second
     * @memberof Player
     */
    startTurn(time: number, totalTime?: number) {
        this._isTuring = true;
        this.updateLookerView();
        totalTime = totalTime || time;
        this.showWaitingTimer(time, totalTime);
        this.hideAction();
    }

    endTurn(discard = false) {
        this._isTuring = false;
        this.clearWaitingTimer();
    }

    showAction(action: UserOpt, doAnim = true) {
        this._shouldHideAction = false;
        let actionImg = this.nodeAction.getChildByName("bg")
            .getChildByName("action")
            .getComponent(cc.Sprite);
        switch (action) {
            case UserOpt.FOLD:
                actionImg.spriteFrame = this.sfDiscard;
                break;
            case UserOpt.ADD:
                actionImg.spriteFrame = this.sfRaise;
                break;
            case UserOpt.FOLLOW:
                actionImg.spriteFrame = this.sfCall;
                break;
            case UserOpt.ALLIN:
                actionImg.spriteFrame = this.sfAllIn;
                this.game.adoMgr.playAllIn(true);
                if (this.isMe) {
                    this.game.showOrHideAllInParticle(true);
                }
                break;
        }
        this.game.adoMgr.noticeAction(this.isMale, action);
        let bg = this.nodeAction;
        bg.stopAllActions();
        bg.opacity = 255;
        bg.active = true;
        if (doAnim) {
            bg.scale = 0;
            let actions = cc.sequence(cc.scaleTo(0.3, 1, 1).easing(cc.easeBackOut()), cc.callFunc(() => {
                //this._actionAnim = undefined;
                this._actionAnimTween = undefined;
                if (this._shouldHideAction) {
                    this.hideAction();
                } else {
                    this.autoHideAction();
                }
            }))
            // this._actionAnim = bg.runAction(actions);
            this._actionAnimTween = cc.tween(bg).then(actions).start();
        } else {
            bg.scaleX = 1;
            bg.scaleY = 1;
            this.autoHideAction();
        }
    }

    private autoHideAction() {
        this.scheduleOnce(() => {
            if (this && this.nodeAction && this.nodeAction.isValid && this.nodeAction.activeInHierarchy) {
                this.hideAction();
            }
        }, 2);
    }

    hideAction() {
        // if (this._actionAnim) {
        //     this._shouldHideAction = true;
        //     return;
        // }
        if (this._actionAnimTween) {
            this._shouldHideAction = true;
            return;
        }
        let bg = this.nodeAction;
        let actions = cc.sequence(
            cc.scaleTo(0.1, 1, 1),
            cc.scaleTo(0.3, 0).easing(cc.easeBackIn()),
            cc.callFunc(() => {
                //this._actionAnim = undefined;
                this._actionAnimTween = undefined;
                bg.active = false;
            })
        )
        // this._actionAnim = bg.runAction(actions);
        this._actionAnimTween = cc.tween(bg).then(actions).start();
    }

    /**
     * @description 更新手牌
     * @param {number} index
     * @param {number} cardVal
     * @param {boolean} [doAnim=true]
     * @returns
     * @memberof JHPlayer
     */
    addCards(index: number, cardVal: number, doAnim = true) {
        return new Promise((resolve: (card?: cc.Node) => void) => {
            let card = this.game.pkrGame.getPoker(cardVal);
            if (!card) {
                console.warn("获取卡牌" + cardVal + "失败");
                resolve();
                return;
            }
            let cardObj = card;
            this.turnCard(card, false, false);
            let width = cardObj.width;
            let handX = this.getEndX(width, index);
            this.nodeCards.addChild(cardObj, index);
            this.cards[index] = card;
            if (doAnim) {
                this.game.adoMgr.playDealCard();
                let centerPos = this.nodeCards.convertToNodeSpaceAR(cc.v2(cc.winSize.width / 2, cc.winSize.height / 2));
                cardObj.setPosition(centerPos);
                //cardObj.rotation = 0;
                cardObj.angle = 0;
                cardObj.scale = 0.5;
                let duration = 0.25;
                let actions = cc.sequence(
                    cc.spawn(
                        cc.scaleTo(duration, 1),
                        parabola(duration, cc.v2(cardObj.position), cc.v2(this.getEndX(width, 0), 0))
                    ),
                    cc.moveTo(0.2, handX, 0),
                    cc.callFunc(resolve, undefined, card)
                )
                //cardObj.runAction(actions);
                cc.tween(cardObj).then(actions).start();
            } else {
                cardObj.setPosition(handX, 0);
                resolve(card);
            }
        });
    }

    turnCard(nodeCard: cc.Node, toFront = true, doAnim = true) {
        if (doAnim) {
            this.game.adoMgr.playDealCard();
        }
        let card = nodeCard.getComponent(PokerCard)
        return card.turn(toFront, doAnim)
    }

    private getEndX(width: number, idx: number) {
        let spaceX = (width * 3 - this.nodeCards.width) / 2;
        let halfWidth = this.nodeCards.width / 2;
        return idx * (width - spaceX) - halfWidth + width / 2;
    }

    /**
     * @description 弃牌
     * @memberof JHPlayer
     */
    discard() {
        this.showAction(UserOpt.FOLD);
        this.endTurn(true);
        let size = cc.winSize;
        this.spCardType.node.parent.active = false;
        let centerPos = this.nodeCards.convertToNodeSpaceAR(cc.v2(size.width / 2, size.height / 2));
        this.nodeCards.children.forEach(c => {
            let actions =
                cc.sequence(
                    cc.spawn(
                        cc.scaleTo(0.3, 0),
                        cc.rotateBy(0.3, 3600),
                        cc.moveTo(0.3, centerPos)
                    ),
                    cc.callFunc(() => {
                        c.destroy();
                    })
                )
            // c.runAction(actions)
            cc.tween(c).then(actions).start();
        });
        this.isDiscarded = true;
        this.spLoseType.spriteFrame = this.isLoser ? this.sfTypeLose : this.sfTypeDiscard;
        this.spLoseType.node.active = true;
        this.updateLooked();
        this.updateLookerView();
    }

    updateDiscardSp() {
        this.isDiscarded = true;
        this.spLoseType.spriteFrame = this.sfTypeDiscard;
        this.spLoseType.node.active = true;
        this.updateLooked();
        this.updateLookerView();
    }

    updateLookerView() {
        if (this.isLooker) {
            this.nodeBg.node.opacity = 125;
        } else {
            this.nodeBg.node.opacity = 255;
        }
        this.sAva.node.opacity = 255;
    }

    becomeDealer(yeah = true, doAnim = true) {
        this.isDealer = yeah;
        this.spDealerFrame.node.active = yeah;
        if (doAnim) {
            let actions = cc.sequence(
                cc.blink(1, 5),
                cc.callFunc(() => {
                    this.spDealerFrame.node.active = this.isDealer;
                    if (this.isDealer)
                        this.game.playDealerAnim(this.dealerEff);
                })
            )
            // this.spDealerFrame.node.runAction(actions);
            cc.tween(this.spDealerFrame.node).then(actions).start();
        } else {
            this.spDealerFrame.node.active = this.isDealer;
        }
    }

    setBets(amount: string) {
        this._bets = +amount;
    }

    doBet(data: { pos: number, bets: string, userTotalBets: string, curMinBets: string, gameTotalBets: string, opt: number }, doAnim = true) {
        switch (data.opt) {
            case UserOpt.FOLLOW:
                this.showAction(UserOpt.FOLLOW);
                break;
            case UserOpt.ADD:
                this.showAction(UserOpt.ADD);
                break;
            case UserOpt.ALLIN:
                this.showAction(UserOpt.ALLIN);
                break;
        }
        this.doBetAnim(+data.bets, doAnim);
        if (data.opt !== UserOpt.POTS) {
            this.endTurn();
        }
        if (data.userTotalBets && !isNaN(+data.userTotalBets)) {
            this._bets = +data.userTotalBets;
        }
        this.updateBets();
        if (this.money && !isNaN(+this.money)) {
            if (this.money !== undefined) {
                this.money = new Decimal(this.money).sub(data.bets).toString();
            }
            this.updateMoney();
        }
    }

    lose() {
        this.isLoser = true;
        this.spLoseMask.node.active = true;
        this.spLoseType.spriteFrame = this.sfTypeLose;
        this.spLoseType.node.active = true;
    }

    /**
     * @description 牌型展示
     * @param {CardsType} type
     * @returns
     * @memberof JHPlayer
     */
    showCardType(type: CardsType, doAnim = false) {
        if (!this.spCardType || !this.spCardType.isValid) {
            console.warn("no sprite to show card type");
            return;
        }
        this.updateLooked(false);
        let node = this.spCardType.node.parent;
        if (type === CardsType.Normal) {
            node.active = false;
        } else {
            if ((type === CardsType.StraightFlush || type === CardsType.ThreeOfAKind) && doAnim) {
                this.game.playCardTypeAnim(type);
            }
            this.spCardType.spriteFrame = this.game.getCardTypeSf(type);
            node.active = true;
        }
    }

    /**
     * @description 其他玩家看牌
     * @memberof JHPlayer
     */
    showFanCards() {
        this.cards.forEach((c, i) => {
            //c.rotation = (i - 1) * 15;
            c.angle = -(i - 1) * 15;
            c.x -= (i - 1) * c.width * 0.2;
        });
    }

    // 丢筹码动画
    private doBetAnim(amount: number, doAnim = true) {
        if (!amount) {
            return;
        }
        let fromBox = this.sAva.node.parent;
        let chips = this.game.addChips(amount);
        let chipsBox = this.game.chipsPool;
        if (doAnim) {
            chips.forEach(chip => {
                chip.active = true;
                this.game.adoMgr.playChip();
                let startPoint = fromBox.convertToWorldSpaceAR(cc.v2(0, 0));
                startPoint = chipsBox.convertToNodeSpaceAR(startPoint);
                let toPoint = chip.position;
                chip.setPosition(startPoint);
                let distance = Math.sqrt(Math.pow(startPoint.x - toPoint.x, 2) + Math.pow(startPoint.y - toPoint.y, 2))
                let time = distance / 500;
                let actions = cc.spawn(
                    cc.moveTo(time, cc.v2(toPoint)).easing(cc.easeExponentialOut()),
                    cc.sequence(
                        cc.delayTime(time * 0.7),
                        cc.callFunc(() => {
                            this.game.adoMgr.playChip();
                        })
                    )
                )
                // chip.runAction(actions);
                cc.tween(chip).then(actions).start();
            });
        }
    }

    getPkNode() {
        return this.nodeBg.node;
    }

    gainChips(totalWinner: number) {
        let chipsBox = this.game.chipsPool;
        let toBox = this.sAva.node.parent;
        let promises: Promise<{}>[] = [];
        let children = chipsBox.children;
        let amount = Math.ceil(children.length / totalWinner);
        for (let i = amount - 1; i >= 0; i--) {
            let childIndex = Math.floor(Math.random() * i);
            let child = chipsBox.children[childIndex];
            if (!child) {
                continue;
            }
            let pos = chipsBox.convertToWorldSpaceAR(child.position);
            pos = toBox.convertToNodeSpaceAR(pos);
            chipsBox.removeChild(child);
            toBox.addChild(child);
            child.setPosition(pos);
            let distance = Math.sqrt(pos.x * pos.x + pos.y + pos.y);
            this.game.adoMgr.playChip();
            let p = new Promise((resolve) => {
                let actions = cc.sequence(
                    cc.moveTo(Math.min(distance / 500, 1), cc.v2(0, 0)).easing(cc.easeExponentialOut()),
                    cc.fadeOut(0.2),
                    cc.callFunc(() => {
                        this.game.adoMgr.playChip();
                        this.game.recycleChips(child);
                        resolve();
                    })
                )
                // child.runAction(actions);
                cc.tween(child).then(actions).start();
            });
            promises.push(p);
        }
        return Promise.all(promises);
    }

    noticeTurnOver(): void {
        this.game.adoMgr.playSoundAlarm();
    }

}
