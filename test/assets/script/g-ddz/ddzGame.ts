import Game, { AutoDesc } from "../g-dp/dpGame";
import Msg from "./ddzMsg";
import DdzTouchMgr from "./ddzTouchMgr"
import DdzPlayerMgr from "./ddzPlayerMgr";
import RecordCard from "./ddzRecordCard";
import DdzResult from "./ddzResult";
import DdzAudio from "./ddzAudio";
import DdzPoker from "./ddzPoker";
import { CARD_TYPE } from "./ddzCardTools";
import { toj, setInteractable, setNodeGray, setGray } from '../common/util';
import PokerGame from '../g-share/pokerGame';
import DdzCombinaiton from "./ddzCombination";

/**
 * 可叫的分数
 */
export enum ScoreStatus {
    ZERO = 0,
    ONE,
    TWO,
    THREE
}

export enum State {
    WaitPrepare,
    WaitStart,
    Start,
    End
}

interface iConfig {
    bets: string, maxBet: number
}

const { ccclass, property } = cc._decorator;

@ccclass
export default class DdzGame extends Game {
    @property(DdzCombinaiton)
    ddzCombination: DdzCombinaiton = undefined;

    @property({ type: DdzAudio, override: true })
    adoMgr: DdzAudio = undefined;

    @property({ type: DdzPlayerMgr, override: true })
    plyMgr: DdzPlayerMgr = undefined;

    @property({ type: DdzTouchMgr, override: true })
    touchMgr: DdzTouchMgr = undefined;

    @property({ type: PokerGame, override: true })
    pkrGame: PokerGame = undefined;

    @property(RecordCard)
    recordCardPanel: RecordCard = undefined;

    @property(DdzResult)
    resultPanel: DdzResult = undefined;

    @property(cc.Node)
    private nodeLordCards: cc.Node = undefined;

    @property(cc.Node)
    private showLordCardsPanel: cc.Node = undefined;

    @property(cc.Node)
    private scorePanel: cc.Node = undefined;

    @property(cc.Node)
    private addMulPanel: cc.Node = undefined;

    @property(cc.Label)
    private labBaseScore: cc.Label = undefined;

    @property(cc.Label)
    labMul: cc.Label = undefined;

    @property(cc.Node)
    private nodeRecord: cc.Node = undefined;


    @property(cc.Button)
    private btnNoPlay: cc.Button = undefined;

    @property(cc.Node)
    private btnAuto: cc.Node = undefined;

    @property(cc.Prefab)
    private preEffLords: cc.Prefab = undefined;

    @property(sp.Skeleton)
    private spBoom: sp.Skeleton = undefined;

    @property(sp.Skeleton)
    private dzWangzha: sp.Skeleton = undefined;

    @property(sp.Skeleton)
    private spSpring: sp.Skeleton = undefined;

    @property(sp.Skeleton)
    private spfSpring: sp.Skeleton = undefined;

    @property(sp.Skeleton)
    private spAirplane: sp.Skeleton = undefined;


    msg: Msg;

    private _currScore: number; // 当前叫分的分数

    private DOUBLE_MUL = 2;// 加倍
    private MAX_BET = 3;               // 最大倍率
    private _minScore: number;
    private _addingMul: boolean;

    bombDelayTime = 0.5;// 炸弹特效等待时间

    set currScore(score: number) {
        this._currScore = score;
    }

    onLoad() {
        super.onLoad();
        this.ddzCombination.init(this);
        // this.onRigstSpineOverEvent(this.spEffRocket)
        // this.onRigstSpineOverEvent(this.spEffBoom2)
        // this.onRigstSpineOverEvent(this.spEffSpring)
        // this.onRigstSpineOverEvent(this.spEffAirplane)
    }

    initRound(): void {
        // console.log("初始化一局");
        super.initRound();
        this.spSpring.node.active = false;
        this.spfSpring.node.active = false;
        this.spAirplane.node.active = false;
        this.spBoom.node.active = false;
        this.dzWangzha.node.active = false;

        this.scorePanel.active = false;
        this.showLordCardsPanel.active = false;

        this.recordCardPanel.hide();
        this.recordCardPanel.resetNum();
        this.nodeRecord.active = false;

        this.setAddMulPanel(false);
        this.hideAutoBtn();

        this._minScore = undefined;
        this._currScore = 0;
        this.labMul.string = "0";
    }

    initGame(): void {
        // console.log("初始化 init");
        super.initGame();
        this.msg = new Msg(this);
        this.msg.init();
        this.resultPanel.setGame(this);

        this.nodeLordCards.removeAllChildren();
        for (let index = 0; index < 3; index++) {
            let card = this.pkrGame.getDdzCard(0);
            card.setPosition(0, 0);
            card.scale = 0.35;
            card.addComponent(DdzPoker);
            this.nodeLordCards.addChild(card);
            card.active = false;
        }
    }


    dealRoomData(data: ps.GameRoomHandlerGetRoomData) {
        let config = toj<iConfig>(data.config)
        this.labBaseScore.string = config.bets + "";
        this.MAX_BET = config.maxBet;
        this.touchMgr.clearCards();
        this.resultPanel.hide();
        this.initRound();
    }

    changeState(s: number, left?: number) {
        super.changeState(s);
    }

    updateUI(): void {
        let me = this.plyMgr.me;

        switch (this.gameState) {
            // 等待开始
            case State.WaitStart:
                break;
            // 开始
            case State.Start:
                this.gaming = true;
                this.hideTicker();
                break;
            case State.End:
                this.gaming = false;
                break;
        }
        this.menu.updateBtnState();
    }

    setGameStart(): void {
        this.plyMgr.initEnable();
    }
    setGameEnd(): void {
        this.changeState(State.End);
    }

    initHolds(cards: number[]) {
        super.initHolds(cards);
        this.recordCardPanel.saveDiscardNum(cards);

        this.adoMgr.playInitHolds();
        this.adoMgr.playMusic();
    }

    sendCardsAnimation() {
        this.touchMgr.sendCardsAnimation();
    }

    delayShowBtnHosted() {
        this.scheduleOnce(() => {
            this.btnHosted.active = true;
        }, .8);
    }

    /**
     * 轮到玩家叫分
     * @param leftTime
     * @param rPos
     */
    turnPlayerScore(leftTime: number, rPos: number) {
        let player = this.plyMgr.getPlyByPos(rPos);
        if (player) {
            player.turnJiaoFen(leftTime);
            if (player.isMe) {
                this.showScorePanel(this._currScore);
            }
        }
    }

    /**
     * 展示玩家叫的分
     * @param point
     * @param rPos
     */
    showPlayerScore(point: number, rPos: number) {
        if (point > 0) {
            this._currScore = point;
            this.labMul.string = point.toString();
        }
        let player = this.plyMgr.getPlyByPos(rPos);
        if (player) {
            player.showScoreStatus(point);
            this.adoMgr.playScore(player.isMale, point);
            if (player.isMe) {
                this.scorePanel.active = false;
            }
        }
    }

    /**
     * 叫分
     * @param minScore
     */
    showScorePanel(minScore: number) {
        this._minScore = minScore;
        if (this._isHosted) {
            return;
        }

        this.scorePanel.active = true;
        this.scorePanel.children.forEach(node => {
            node.stopAllActions();
            node.scale = 1;
        });
        for (let idx = ScoreStatus.ONE; idx <= ScoreStatus.THREE; idx++) {
            let node = this.scorePanel.getChildByName(`btn_${idx}`);
            let btn = node.getComponent(cc.Button);
            if (idx > minScore) {
                setInteractable(btn, true);
            } else {
                setInteractable(btn, false)
            }
        }
    }

    /**
     * 展示地主牌
     * @param rPos
     * @param cards
     */
    showDealer(rPos: number, cards: number[]) {
        this._minScore = undefined;

        this.scorePanel.active = false;
        let player = this.plyMgr.getPlyByPos(rPos);
        if (player) {
            player.isDealer = true;

            if (player.isMe) {
                this.touchMgr.addDealerCard(cards);
                this.recordCardPanel.saveDiscardNum(cards);
            }
        }
        // 先居中展示地主牌
        this.showLordCardsPanel.active = true;
        this.showLordCardsPanel.stopAllActions();
        this.showLordCardsPanel.scale = 1;
        this.showLordCardsPanel.setPosition(0, 140);
        this.showLordCardsPanel.removeAllChildren();
        for (let idx = 0; idx < cards.length; idx++) {
            let card = this.pkrGame.getDdzCard(cards[idx]);
            card.scale = 0.7;
            card.setPosition(0, 0);
            this.showLordCardsPanel.addChild(card);
        }
        let moveTime = 0.3;
        let actions = cc.sequence(
            cc.delayTime(1),
            cc.spawn(cc.moveTo(moveTime, this.nodeLordCards.getPosition()), cc.scaleTo(moveTime, 0.3, 0.3)),
            cc.callFunc(() => {
                this.showLordCardsPanel.active = false;
                this.setDealerCards(cards);
            })
        )
        //this.showLordCardsPanel.runAction(actions);
        cc.tween(this.showLordCardsPanel).then(actions).start();
        this.playLordsAnim(rPos);
    }

    setDealerCards(cards: number[]) {
        this.nodeLordCards.children.forEach((card, idx) => {
            card.active = true;
            this.pkrGame.setDdzCard(card, cards[idx]);
            let poker = card.getComponent(DdzPoker);
            poker.setBack(false);
        });
    }

    hideDealerCards() {
        this.nodeLordCards.children.forEach(card => {
            card.active = true;
            let poker = card.getComponent(DdzPoker);
            poker.setBack(true);
        });
    }

    /**
     * 等待玩家选择是否加倍
     */
    waitPlayerAdd(leftTime: number) {
        this.plyMgr.turnAddMul(leftTime);
        let player = this.plyMgr.me;
        if (!player.isDealer) {
            this._addingMul = true;
            if (this._isHosted) {
                return;
            }

            this.setAddMulPanel(true);
        }
    }

    setAddMulPanel(visible: boolean) {
        this.addMulPanel.active = visible;
        if (true) {
            this.addMulPanel.children.forEach(node => {
                node.stopAllActions();
                node.scale = 1;
            });
        }
    }

    /**
     * 展示玩家加倍
     * @param rPos
     * @param addMul
     */
    showPlayerAdd(rPos: number, addMul: number) {
        cc.log('加倍')
        let player = this.plyMgr.getPlyByPos(rPos);
        if (player) {
            player.showMulStatus(addMul);
            this.adoMgr.playAddMul(player.isMale, addMul);
            if (player.isMe) {
                this._addingMul = undefined;
                this.setAddMulPanel(false);
                // 加倍
                if (addMul === this.DOUBLE_MUL) {
                    this.addGameMul();
                }
            }
        }
    }

    /**
     * 轮到玩家出牌
     * @param leftTime
     * @param rPos
     * @param first
     */
    turnPlayerPlay(leftTime: number, rPos: number, first: number) {
        this._isFirstPlay = !!first;
        let player = this.plyMgr.getPlyByPos(rPos);
        if (player) {
            player.turnPlay(leftTime);
            if (player.isMe) {
                this.ddzCombination.node.active = true;
                if (!!first) {
                    this.touchMgr.setPlayerData();
                } else {
                    this.touchMgr.setPlayerData(this._lastCardData);
                    if (this._lastCardSuit && this._lastCardSuit === CARD_TYPE.CT_ROCKET) {
                        this.msg.sendNotPlay();
                    }
                }
            }
            else {
                this.ddzCombination.node.active = false;
            }
        }
        if (this.autoPanel.active) {
            this.ddzCombination.node.active = false;
        }
        // 第一次轮到玩家出牌
        if (this._isFirstWaitOut) {
            this._isFirstWaitOut = false;
            this.nodeRecord.active = true;
            this.recordCardPanel.show();
            if (!this._isReturnGame) {
                this.plyMgr.hideAll();
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
                if (this._isFirstPlay || (shape === CARD_TYPE.CT_BOMB) || (shape === CARD_TYPE.CT_ROCKET)) {
                    this.playCardSound(player.isMale, shape, cards);
                } else {
                    let random = Math.floor(Math.random() * 2);
                    if (random === 0) {
                        this.playCardSound(player.isMale, shape, cards);
                    } else {
                        this.adoMgr.playDani(player.isMale);
                    }
                }
            } else {
                this.returnGame = true;
            }
        }

        // 刷新总倍数
        if (shape) {
            if (shape === CARD_TYPE.CT_BOMB || shape === CARD_TYPE.CT_ROCKET) {
                this.addGameMul();
            }
        }
    }

    showPlayerNoPlay(rPos: number) {
        let player = this.plyMgr.getPlyByPos(rPos);
        if (player) {
            player.showNoPlay();
            this.adoMgr.playBuyao(player.isMale);
            if (player.isMe) {
                this._isShowOpt = undefined;
                this.hideOptPanel();
                if (!this._isHosted)
                    this.touchMgr.enableCards(true);
            }
        }
    }

    /**
     * 添加倍数
     */
    addGameMul() {
        let mul = +this.labMul.string * 2;
        if (mul <= this.MAX_BET)
            this.labMul.string = mul.toString();
    }

    /**
     * 显示操作按钮
     */
    showOptPanel(isShowOpt: boolean) {
        this._isShowOpt = isShowOpt;
        if (this._isHosted) {
            return;
        }

        if (isShowOpt) {
            this.outCardPanel.active = true;
            this.autoPlay();
        } else {
            this.abandonPanel.active = true;
            this.touchMgr.enableCards(false);
            this.scheduleOnce(() => {
                if (this.abandonPanel.active) {
                    this.msg.sendNotPlay();
                }
            }, 5);
        }
    }

    hideOptPanel() {
        this.outCardPanel.active = false;
        this.abandonPanel.active = false;
        this.touchMgr.setHoldsSort();
    }

    /**
     * 自己先手出牌则隐藏不出按钮
     * @param visible
     */
    setFirstPlayPanel(visible: boolean) {
        setInteractable(this.btnNoPlay, visible);
    }

    /**
     * 显示自动出牌按钮
     */
    showAutoBtn() {
        if (!this._isHosted) {
            this.btnAuto.active = true;
            this.setAutoStatus(true);
        }
    }

    hideAutoBtn() {
        this.btnAuto.active = false;
        this.setAutoStatus(true);
    }

    setAutoStatus(auto: boolean) {
        let str = auto ? AutoDesc.Auto : AutoDesc.Cancel;
        let lab = this.btnAuto.getComponentInChildren(cc.Label);
        lab.string = str;
    }

    /**
     * 自动出牌
     */
    autoPlay() {
        let desc = this.btnAuto.getComponentInChildren(cc.Label).string;
        if (this.btnAuto.active && desc === AutoDesc.Cancel) {
            let cardData = this.touchMgr.getFinalCard();
            this.msg.sendPlayCards(CARD_TYPE.CT_SINGLE, [cardData]);
        }
    }

    // -------------------------------------------点击事件

    /**
     * 选择分数
     * @param ev
     * @param info
     */
    onClickScore(ev: cc.Event.EventTouch, info: string) {
        this.scorePanel.active = false;
        let score = +info;
        this.msg.sendJiaoFen(score);
    }

    onClickAddMul(ev: cc.Event.EventTouch, info: string) {
        this.setAddMulPanel(false);
        let mul = +info;
        this.msg.sendAddMulti(mul);
    }

    /**
     * 不出或要不起
     */
    onClickAbandon() {
        this.hideOptPanel();
        this.msg.sendNotPlay();
    }

    /**
     * 提示
     */
    onClickPrompt() {
        this.touchMgr.setPromptCard();
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
        this.ddzCombination.node.active = false;
    }

    meHosted(hosted: boolean) {
        this._isHosted = hosted;

        this.btnHosted.active = !hosted;
        this.autoPanel.active = hosted;
        this.touchMgr.enableCards(!hosted);

        if (hosted) {
            this.scorePanel.active = false;
            this.setAddMulPanel(false);
            this.hideOptPanel();
            this.btnAuto.active = false;
        } else {
            if (this._minScore !== undefined)
                this.showScorePanel(this._minScore);
            if (this._addingMul !== undefined)
                this.setAddMulPanel(true);
            if (this._isShowOpt !== undefined)
                this.showOptPanel(this._isShowOpt);
            if (this.touchMgr.getCardNum() === 1)
                this.showAutoBtn();
        }
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
        } else if (cardType === CARD_TYPE.CT_ROCKET) {
            // 火箭
            this.playRocketAnim();
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
            this.adoMgr.playTuple(isMale, cards[0]);
        } else if (cardType === CARD_TYPE.CT_SINGLE_STRAIGHT) {
            // 顺子
            this.adoMgr.playShunzi(isMale);
        } else if (cardType === CARD_TYPE.CT_DOUBLE_STRAIGHT) {
            // 连对
            this.adoMgr.playLiandui(isMale);
        } else if (cardType === CARD_TYPE.CT_THREE_STRAIGHT
            || cardType === CARD_TYPE.CT_THREE_STRAIGHT_ONE
            || cardType === CARD_TYPE.CT_THREE_STRAIGHT_TWO) {
            // 飞机
            this.adoMgr.playFeiji(isMale);
        } else if (cardType === CARD_TYPE.CT_THREE_TAKE_ONE) {
            // 三带一单
            this.adoMgr.playSandaiyi(isMale);
        } else if (cardType === CARD_TYPE.CT_THREE_TAKE_TWO) {
            // 三带一对
            this.adoMgr.playSandaiyidui(isMale);
        } else if (cardType === CARD_TYPE.CT_FOUR_TAKE_ONE) {
            // 四带两单
            this.adoMgr.playSidaier(isMale);
        } else if (cardType === CARD_TYPE.CT_FOUR_TAKE_TWO) {
            // 四带两对
            this.adoMgr.playSidailiangdui(isMale);
        } else if (cardType === CARD_TYPE.CT_BOMB) {
            // 炸弹
            this.adoMgr.playZhadan(isMale);
        } else if (cardType === CARD_TYPE.CT_ROCKET) {
            // 火箭
            this.adoMgr.playWangZha(isMale);
        }
    }

    playSirenAnim(node: cc.Node) {
        this.playAnim(node);
        this.adoMgr.playAlert();
    }

    async playLordsAnim(rPos: number) {
        let ok = await this.playAnim(this.preEffLords);
        if (ok) {
            this.plyMgr.getPlys().forEach(p => {
                if (p.pos === rPos) {
                    p.setDealer(true);
                } else {
                    p.setDealerHead(false);
                }
            });
        }
        this.adoMgr.playQuRenDizhu();
    }

    playAirplaneAnim() {
        this.adoMgr.playAnimPlane();
        // this.playAnim(this.preEffAirplane);
        this.spAirplane.node.active = true
        this.playSpine(this.spAirplane, "animation")
        this.scheduleOnce(() => {
            this.spAirplane.node.active = false;
        }, 1.5);
    }

    playBombAnim() {
        this.scheduleOnce(() => {
            this.adoMgr.playAnimBomb();
            // this.playAnim(this.preEffBoom);
            this.spBoom.node.active = true
            this.playSpine(this.spBoom, "animation")
            this.shake();
        }, this.bombDelayTime);
    }

    playRocketAnim() {
        this.adoMgr.playAnimWangBomb();
        // this.playAnim(this.preEffRocket);
        this.dzWangzha.node.active = true
        this.playSpine(this.dzWangzha, "animation")
        this.scheduleOnce(() => {
            this.shake();
        }, .7);
    }

    playSpringAnim() {
        this.adoMgr.playAnimCT();
        // return this.playAnim(this.preEffSpring);
        this.spSpring.node.active = true
        this.playSpine(this.spSpring, "animation")
        this.scheduleOnce(() => {
            this.spSpring.node.active = false;
            return new Promise(resolve => {
                resolve();
            });
        }, 1);
    }

    showPrepareTicker(timer?: number) {
        if (!this.dontPrepare)
            this.doPrepare();
        else {
            this.spSpring.node.active = false;
            this.spfSpring.node.active = false;
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
        //spine.addAnimation(0, aniName,false,0)
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

    // -------------------------------------------点击事件
    /**
     * 记牌器
     */
    onClickRecord() {
        if (this.recordCardPanel) {
            this.recordCardPanel.click();
        }
    }
}