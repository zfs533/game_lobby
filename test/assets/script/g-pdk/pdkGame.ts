import Game, { AutoDesc } from "../g-dp/dpGame";
import { CARD_TYPE } from "./pdkCardTools";
import Msg from "./pdkMsg";
import pdkPlayerMgr from "./pdkPlayerMgr";
import RecordCard from "./pdkRecordCard";
import Result from "./pdkResult";
import PdkAudio from "./pdkAudio";
import * as util from "../common/util";
import PdkTouchMgr from "./pdkTouchMgr";
import { runInThisContext } from "vm";

export enum State {
    WaitPrepare,
    WaitStart,
    Start,
    End
}

export enum gameStatus {
    STATUS_FREE, //空闲阶段
    STATUS_DEAL_CARD, // 发牌阶段
    STATUS_PLAY_CARD, //出牌
    STATUS_RESULT, //结算阶段
}

const { ccclass, property } = cc._decorator;
@ccclass
export default class PdkGame extends Game {
    @property({ type: PdkAudio, override: true })
    adoMgr: PdkAudio = undefined;

    @property({ type: pdkPlayerMgr, override: true })
    plyMgr: pdkPlayerMgr = undefined;

    @property(cc.Label)
    private labBaseScore: cc.Label = undefined;

    @property(RecordCard)
    recordCardPanel: RecordCard = undefined;

    @property(Result)
    resultPanel: Result = undefined;

    @property(cc.Node)
    private nodePayNotice: cc.Node = undefined;// 包赔提示

    @property(cc.Node)
    private nodeAdvanceTips: cc.Node = undefined;// 提前亮牌提示

    @property(cc.Node)
    private nodeHideHold: cc.Node = undefined;

    @property(cc.Node)
    private payPanel: cc.Node = undefined;

    @property(cc.Label)
    labTips: cc.Label = undefined;

    @property(sp.Skeleton)
    private spAirplane: sp.Skeleton = undefined;

    @property({ type: PdkTouchMgr, override: true })
    touchMgr: PdkTouchMgr = undefined;

    @property(cc.Node)
    private nodeRecord: cc.Node = undefined;

    @property(sp.Skeleton)
    private spBoom: sp.Skeleton = undefined;

    msg: Msg;

    readonly bombDelayTime = 0.5;// 炸弹特效等待时间
    readonly MIN_REMAIN_NUM = 1; // 特殊处理玩家剩余最低牌数

    onLoad() {
        super.onLoad();
        // this.onRigstSpineOverEvent(this.spEffectBoom)
    }

    initRound(): void {
        // cc.log("---------------init doPrepare1")

        super.initRound();
        // cc.log("---------------init doPrepare2")

        this.nodePayNotice.active = false;

        this.recordCardPanel.hide();
        this.nodeRecord.active = false;
    }

    initGame(): void {
        super.initGame();
        this.msg = new Msg(this);
        this.msg.init();
        this.resultPanel.setGame(this);
    }

    dealRoomData(data: ps.GameRoomHandlerGetRoomData) {
        this.labBaseScore.string = this.baseScore + "";
        this.touchMgr.clearCards();
        this.resultPanel.hide();
        this.initRound();
    }

    changeState(s: number, left?: number) {
        super.changeState(s);
    }

    updateUI(): void {
        switch (this.gameState) {
            // 等待开始
            case State.WaitStart:
                break;
            // 开始
            case State.Start:
                this.gaming = true;
                this.hideTicker();

                this.recordCardPanel.resetNum();
                this.meHosted(false);
                break;
            case State.End:
                this.gaming = false;
                break;
        }
        this.menu.updateBtnState();
    }

    setGameStart(): void {
        this.plyMgr.initEnable();
        this.changeState(State.Start);
    }
    setGameEnd(): void {
        this.changeState(State.End);
    }

    initHolds(cards: number[]) {
        super.initHolds(cards);
        this.recordCardPanel.saveDiscardNum(cards);
        this.adoMgr.playInitHolds();
    }

    sendCard(cards: number[]) {
        this.initHolds(cards);
        this.plyMgr.setRemainCard();
    }

    /**
     * 隐藏手牌
     * @param visible
     */
    hideHold(visible: boolean) {
        this.nodeHideHold.active = visible;
        this.touchMgr.setCardBack(visible);
    }

    /**
     * 轮到玩家出牌
     * @param rPos
     * @param first
     * @param leftTime
     */
    turnPlayerPlay(rPos: number, first: number = 1, leftTime?: number) {
        this._isFirstPlay = !!first;
        let player = this.plyMgr.getPlyByPos(rPos);
        if (player) {
            player.turnPlay(leftTime);
            if (player.isMe) {
                // 当下家只剩一张牌时提示
                let nextPlayer = this.plyMgr.getNextPlayer();
                if (nextPlayer && (nextPlayer.remainNum === this.MIN_REMAIN_NUM) && !this._isHosted) {
                    this.nodePayNotice.active = true;
                } else {
                    this.nodePayNotice.active = false;
                }

                if (!!first) {
                    this.touchMgr.setPlayerData();
                } else {
                    this.touchMgr.setPlayerData(this._lastCardData);
                }
                this.hideHold(false);
            } else {
                this.nodePayNotice.active = false;
                // ♥️3非自己时要隐藏手牌
                if (this._isFirstWaitOut && !this._isReturnGame) {
                    this.hideHold(true);
                }
            }
        }
        // 第一次轮到玩家出牌
        if (this._isFirstWaitOut) {
            this._isFirstWaitOut = false;
            this.nodeRecord.active = true;
            this.recordCardPanel.show();
            if (!this._isReturnGame) {
                this.plyMgr.hideAll();
                if (player) {
                    player.setFirst(true);
                }
            }
        }
    }

    /**
     * 展示玩家出牌
     * @param rPos
     * @param cards
     * @param shape
     */
    showPlayerDiscard(rPos: number, cards: number[], shape?: CARD_TYPE) {
        this._lastCardSuit = shape;
        this._lastCardData = cards;
        let player = this.plyMgr.getPlyByPos(rPos);
        if (player) {
            player.showDiscard(cards, shape);
            this.adoMgr.playOutCard();
            if (shape) {
                // shape用来处理断线重连
                if (player.isMe) {
                    this.hideOptPanel();
                    this.touchMgr.removePlayCards(cards);

                    this._isShowOpt = undefined;
                    player.checkBaojing(this.touchMgr.getCardNum());
                } else {
                    this.recordCardPanel.saveDiscardNum(cards);
                }

                this.playCardAnim(shape);
                // 不是先手出牌则可播放大你音效
                if (this._isFirstPlay || (shape === CARD_TYPE.CT_BOMB)) {
                    this.playCardSound(player.isMale, shape, cards);
                } else {
                    let random = Math.floor(Math.random() * 2);
                    if (random === 0) {
                        this.playCardSound(player.isMale, shape, cards);
                    } else {
                        this.adoMgr.playDani(player.isMale);
                    }
                }
            }
        }
    }

    showPlayerNoPlay(rPos: number) {
        let player = this.plyMgr.getPlyByPos(rPos);
        if (player) {
            this.adoMgr.playBuyao(player.isMale);
            super.showNoPlay(player);
        }
    }

    setPayAnim(payName: string) {
        this.payPanel.active = true;
        this.payPanel.children.forEach(node => {
            node.active = false;
        });
        let node = this.payPanel.getChildByName(payName);
        if (node) {
            node.active = true;
            node.stopAllActions();
            node.scale = 0;
            let actions = cc.sequence(
                cc.scaleTo(0.5, 1).easing(cc.easeBounceOut()),
                cc.delayTime(1),
                cc.callFunc(() => {
                    this.payPanel.active = false;
                })
            )
            // node.runAction(actions);
            cc.tween(node).then(actions).start()
        }
    }

    showAdvanceTips() {
        return new Promise((resolve) => {
            this.nodeAdvanceTips.active = true;
            this.nodeAdvanceTips.stopAllActions();
            this.nodeAdvanceTips.scaleY = 0;
            let actions = cc.sequence(
                cc.scaleTo(0.5, 1, 1).easing(cc.easeBounceOut()),
                cc.delayTime(1),
                cc.scaleTo(0.1, 1, 0).easing(cc.easeBounceIn()),
                cc.callFunc(resolve),
            )
            // this.nodeAdvanceTips.runAction(actions);
            cc.tween(this.nodeAdvanceTips).then(actions).start();
        });
    }

    // -------------------------------------------点击事件
    /**
     * 不出或要不起
     */
    onClickAbandon() {
        super.onClickAbandon();
        this.msg.sendNotPlay();
    }

    /**
     * 出牌
     */
    onClickOutCard() {
        this.outCardPanel.active = false;
        let data = this.touchMgr.getReadyDisCardsInfo();
        if (data) {
            this.msg.sendPlayCards(data.cardType, data.cardData);
        }
    }

    /**
     * 托管
     */
    onClickHosted() {
        this.msg.sendHosted();
    }

    /**
     * 取消托管
     */
    onClickCancel() {
        this.msg.sendHosted();
    }

    /**
     * 自动出牌
     */
    onClickAuto() {
        this.msg.sendHosted();
    }

    onClickNext() {
        this.resultPanel.hide();
        this.doPrepare();
        this.plyMgr.clearCards();
        this.touchMgr.clearCards();
        this.plyMgr.initEnable();
    }

    //-----------------------------声音、动画

    playCardAnim(cardType: CARD_TYPE) {
        if (cardType === CARD_TYPE.CT_THREE_STRAIGHT
            || cardType === CARD_TYPE.CT_THREE_STRAIGHT_ONE
            || cardType === CARD_TYPE.CT_THREE_STRAIGHT_TWO) {
            // 飞机
            this.playAirplaneAnim();
        } else if (cardType === CARD_TYPE.CT_BOMB) {
            // 炸弹
            this.playBombAnim();
        }
    }

    playCardSound(isMale: boolean, cardType: CARD_TYPE, cards: number[]) {
        if (cardType === CARD_TYPE.CT_SINGLE) {
            // 单牌
            this.adoMgr.playSingle(isMale, cards[0]);
        } else if (cardType === CARD_TYPE.CT_DOUBLE) {
            // 对子
            this.adoMgr.playDouble(isMale, cards[0]);
        } else if (cardType === CARD_TYPE.CT_THREE) {
            // 三条
            this.adoMgr.playTuple(isMale);
        } else if (cardType === CARD_TYPE.CT_SINGLE_STRAIGHT) {
            // 顺子
            this.adoMgr.playShunzi(isMale);
        } else if (cardType === CARD_TYPE.CT_DOUBLE_STRAIGHT) {
            // 连对
            this.adoMgr.playLiandui(isMale);
        } else if (cardType === CARD_TYPE.CT_THREE_STRAIGHT) {
            // 飞机
            this.adoMgr.playFeiji(isMale);
        } else if (cardType === CARD_TYPE.CT_THREE_STRAIGHT_ONE
            || cardType === CARD_TYPE.CT_THREE_STRAIGHT_TWO) {
            // 飞机带翅膀
            this.adoMgr.playFjWings(isMale);
        } else if (cardType === CARD_TYPE.CT_THREE_TAKE_ONE) {
            // 三带一单
            this.adoMgr.playSandaiyi(isMale);
        } else if (cardType === CARD_TYPE.CT_THREE_TAKE_TWO) {
            // 三带两单
            this.adoMgr.playSandaier(isMale);
        } else if (cardType === CARD_TYPE.CT_FOUR_TAKE_ONE) {
            // 四带一
            this.adoMgr.playSidaiyi(isMale);
        } else if (cardType === CARD_TYPE.CT_FOUR_TAKE_TWO) {
            // 四带二
            this.adoMgr.playSidaier(isMale);
        } else if (cardType === CARD_TYPE.CT_FOUR_TAKE_THREE) {
            // 四带三
            this.adoMgr.playSidaisan(isMale);
        } else if (cardType === CARD_TYPE.CT_BOMB) {
            // 炸弹
            this.adoMgr.playZhadan(isMale);
        }
    }

    playSirenAnim(node: cc.Node) {
        this.playAnim(node, true);
        this.adoMgr.playAlert();
    }

    playAirplaneAnim() {
        this.adoMgr.playAnimPlane();
        // this.playAnim(this.preEffAirplane);
        this.playSpine(this.spAirplane, "animation")
        this.scheduleOnce(() => {
            this.spAirplane.node.active = false;
        }, 1.5);
    }

    playBombAnim() {
        this.scheduleOnce(() => {
            this.adoMgr.playAnimBomb();
            // this.playAnim(this.preEffBoom);
            this.playSpine(this.spBoom, "animation")
            this.shake();
        }, this.bombDelayTime);
    }

    showPrepareTicker(timer?: number) {
        if (!this.dontPrepare) {
            this.doPrepare();
        } else {
            this.resultPanel.showTicker(timer);
            this.dontPrepare = false;
        }
    }
    playSpine(spine: sp.Skeleton, aniName: string) {
        if (!spine) {
            cc.warn("no spine animation ")
            return
        }
        spine.node.active = true
        spine.clearTracks()
        //spine.addAnimation(0, aniName, false, 0)
        spine.setAnimation(0, aniName, false)
    }

    onRigstSpineOverEvent(spine: sp.Skeleton) {
        if (!spine) {
            cc.warn("no spine animation ")
            return
        }
        spine.node.active = false
        spine.loop = false
        spine.setCompleteListener(() => {
            //spine.node.active = false
            // cc.log("on spine animation over --")
        })
    }

    /**
  * 记牌器
  */
    onClickRecord() {
        if (this.recordCardPanel) {
            this.recordCardPanel.click();
        }
    }
}