import DZPKAudio from "./dzpkAudio";
import DZPKPlayerMgr from "./dzpkPlayerMgr";
import DZPKMsg from "./dzpkMsg";
import DZPKCard from "./dzpkCard";
import DZPKOperation, { AutoState } from "./dzpkOperation";
import { getMaxShape } from "./dzpkCardType";

import Game from "../g-share/game";
import PokerGame from "../g-share/pokerGame";
import { PlayerState } from "../g-share/player";
import { toj } from "../common/util";
import { GameId } from "../common/enum";
import { How2Play } from "../common/how2play";
import Audio from "../g-share/audio";

let Decimal = window.Decimal;
interface iConfig {
    "raiseList": number[],
    "perRndAddBetCnt": number
}

export enum DZPKGameStatus {
    FREE,           //开始
    PREFLOP,        //发手牌
    PREFLOP_OPT,    // 翻牌前喊注
    FLOP,           // 翻牌圈
    FLOP_OPT,
    TURN,           // 转牌圈
    TURN_OPT,
    RIVER,          // 河牌圈
    RIVER_OPT,
    GAMEEND
};

export enum State {
    WaitPrepare,
    WaitStart, // 等待开始
    Start, // 开始
    BaseBet,
    Deal, // 发牌
    Draw,
    Turing,
    ChooseCard,
    Result,
    End
}

export enum DZPKCardType {

    gaoPai,     // 高牌，即单牌
    yiDui,      // 一对
    liangDui,   // 两对
    sanTiao,    // 三条+两散牌
    shunZi,     // 顺子
    tongHua,    // 同花
    huLu,       // 三条+一对
    siTiao,     // 四张
    tongHuaShun,    //同花顺
    huangJiaTongHuaShun     //皇家同花顺

}

enum DZPKCardTypestr {
    '高牌',     // 高牌，即单牌
    '一对',      // 一对
    '两对',   // 两对
    '三条',    // 三条+两散牌
    '顺子',     // 顺子
    '同花',    // 同花
    '葫芦',       // 三条+一对
    '四条',     // 四张
    '同花顺',    //同花顺
    '皇家同花顺'     //皇家同花顺
}

const { ccclass, property } = cc._decorator;
@ccclass
export default class DZPKGame extends Game {

    @property({ type: Audio, override: true })
    adoMgr: DZPKAudio = undefined;

    @property({ type: DZPKPlayerMgr, override: true })
    plyMgr: DZPKPlayerMgr = undefined;

    @property(PokerGame)
    pkrGame: PokerGame = undefined;

    @property(cc.Node)
    nodeInfo: cc.Node = undefined;

    @property(cc.Node)
    chipsPool: cc.Node = undefined;

    @property(cc.Label)
    betsPoolInfo: cc.Label = undefined;

    @property(cc.Label)
    allBetsInfo: cc.Label = undefined;

    @property(cc.Node)
    private dzpkAnimNode: cc.Node = undefined;


    @property(cc.Node)
    private waitTips: cc.Node = undefined;

    @property(cc.Label)
    lblCardType: cc.Label = undefined;

    @property([cc.Prefab])
    prefabChips: cc.Prefab[] = [];

    @property([cc.SpriteFrame])
    cardTypes: cc.SpriteFrame[] = [];

    @property(cc.Node)
    nodeCommonCards: cc.Node = undefined;

    @property(cc.Node)
    nodeCommonCardBg: cc.Node = undefined;

    @property(cc.Node)
    nodeDiscardMask: cc.Node = undefined;

    @property([cc.Node])
    nodeSmallBetPool: cc.Node[] = [];   // 分池节点

    @property(DZPKOperation)
    operation: DZPKOperation = undefined;

    @property([cc.Prefab])
    AnimArr: cc.Prefab[] = [];    // 依次为  顺子 同花 葫芦 金刚（四条）同花顺  皇家同花顺
    @property(cc.Prefab)
    private animWin: cc.Prefab = undefined;

    gameName = GameId.DZPK;
    private _tickerPos: cc.Vec2;
    private _totalBets: number;
    get totalBets() {
        return this._totalBets;
    }
    round: number;
    canAllIn: boolean;

    commonCardsValue: number[] = [];
    commonCards: DZPKCard[] = [];

    winnerNum: number;
    public maxAddBetCnt: number = 3;    // 每轮最高加注次数

    roundMaxBets: number;

    public autoState: AutoState;  // 系统自动操作状态

    public raiseRates = [4, 8, 20, 40, 80];

    roundBets: number;  // 当前轮 已经下过的最高注

    public curSmallPoolCount = 0;

    public isTwoWheel: boolean = false;   // 是第二轮以后

    public curRoomCfgMoney: number = 0;    // 当前房间 配置的钱

    get audioMgr() {
        return this.adoMgr as DZPKAudio;
    }
    msg: DZPKMsg;

    protected cardType = DZPKCard;

    public smallPos: number; // 小盲位
    /**
     * ‘我’是否在游戏中
     *
     * @readonly
     * @memberof Room
     */
    get amIInGame() {
        if (!this || !this.plyMgr) {
            return false;
        }
        let me = this.plyMgr.me;
        return me && me.exist && !me.isLooker;
    }

    get isWaitingStart() {
        return this.gameState === State.WaitStart;
    }

    get helpDesc() {
        return How2Play.gameHelpDesc(GameId.DZPK);
    }

    onLoad() {
        super.onLoad();
        for (let i = this.prefabChips.length - 1; i >= 0; i--) {
            let pool = new cc.NodePool();
            this.chipsNodePool[i] = pool;
        }
    }

    private chipsNodePool: cc.NodePool[];
    private initChipsNodePool() {
        this.chipsNodePool = [];
        for (let i = this.prefabChips.length - 1; i >= 0; i--) {
            let pool = new cc.NodePool();
            this.chipsNodePool[i] = pool;
        }
    }

    initGame(): void {
        // this.checkTouched = true;
        this.operation.game = this;
        this.msg = new DZPKMsg(this);
        this.msg.init();
        // this.plyMgr = new DZPKPlayerMgr();
        this.menu.init(this);
        this.initChipsNodePool();
    }

    dealRoomData(data: ps.GameRoomHandlerGetRoomData): void {
        let config = toj<iConfig>(data.config)
        this.raiseRates = config.raiseList;
        this.maxAddBetCnt = config.perRndAddBetCnt;
        this.initRound();
    }

    initRound(): void {
        // cc.log("初始化一局");
        this.plyMgr.me.handlePai = [];
        this.waitTips.active = false;
        this.autoState = AutoState.None;
        this.isTwoWheel = false;
        this.nodeDiscardMask.active = false;

        this.nodeInfo.active = true;
        this.chipsPool.active = false;
        this.operation.node.active = true;
        this.betsPoolInfo.node.parent.active = false;
        this.lblCardType.node.parent.active = false;
        this.nodeAnimation.active = true;

        this.changeState(State.WaitPrepare);
        this.setBetsInfo(0, 0);
        this.updateRoomInfo();
        this.resetOperations();
        this.hideSmallBetsPool();

        this.curSmallPoolCount = 0;
        if (!this.dontPrepare)
            this.doPrepare();
        else {
            this.dontPrepare = false;
        }
        this.hideTicker();
        this.plyMgr.clearOtherPlayers();
        this.plyMgr.clearAllWaitingTimer();
        this.plyMgr.chgState(PlayerState.UNREADY);
        this.plyMgr.clearCards();

        this.hideCardType();
        this.clearChips();
        this.clearCommonCard();
        this.resetRoundBets();
    }

    //显示等待下局
    showWaitTips() {
        this.waitTips.active = true;
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
                break;
            case State.BaseBet:
                this.gaming = true;
                break;
            case State.Deal:
                break;
            case State.Draw:
                this.gaming = true;
                break;
            case State.End:
                this.gaming = false;
                break;
        }
        this.menu.updateBtnState();
    }

    setBetsInfo(current: number, total: number) {
        if (this.roundBets < current) {
            this.roundBets = current;
            // if (this.commonCards.length === 0){
            //     // 如果没有公共牌 即第一轮 则  当前轮下注 需要减去一个大盲
            //     this.roundBets = this.roundBets - this.baseScore * 2 >= 0 ? this.roundBets - this.baseScore * 2 : 0;
            // }
        }
        this._totalBets = total;
    }
    updateRoomInfo() {
        this.betsPoolInfo.node.parent.active = true;

        this.betsPoolInfo.string = `小/大盲注：${this.baseScore}/${this.baseScore * 2}`;
        this.allBetsInfo.string = `${this._totalBets}`
    }
    showOperations() {
        this.operation.showTurn();
    }
    hideOperations() {
        this.operation.hideTurn();
    }
    resetOperations() {
        this.operation.reset();
    }
    changeOperationsDefultRaiseLabel() {
        this.operation.showDefultRiseLeblOne(false);
    }

    dealMyCardType() {
        let myCards = this.plyMgr.me.cards.map(c => c.value)
        if (myCards.length < 2) {
            return;
        }
        let cards = this.commonCardsValue.concat(myCards)
        // cc.log("--dealMyCardType----", cards);
        this.showCardType(getMaxShape(cards));
    }

    showCardType(type: DZPKCardType) {

        if (!this.plyMgr.me.isDisCarded && !this.amIInGame) {
            return;
        }

        let typeStr: string = DZPKCardTypestr[type] || '高牌';

        this.lblCardType.node.parent.active = true;
        this.lblCardType.string = typeStr;
    }
    hideCardType() {
        this.lblCardType.node.parent.active = false;
    }

    resetRoundBets() {
        this.roundBets = 0;
        this.plyMgr.resetRoundBets();
        this.updateRoomInfo();
    }

    /**
     * 处理边池
     */
    dealSmallBetsPool(poolBetsArr: number[]) {
        for (let i = 0; i < this.nodeSmallBetPool.length; i++) {
            this.nodeSmallBetPool[i].active = false;
        }
        let smallPosIndex = 0;
        for (let i = 0; i < poolBetsArr.length; i++) {
            if (poolBetsArr[i] === 0 || !poolBetsArr[i]) {
                continue;
            }

            let tSmallBetsPool = this.nodeSmallBetPool[smallPosIndex];
            smallPosIndex++;
            tSmallBetsPool.active = true;
            let label = tSmallBetsPool.getComponentInChildren(cc.Label);
            label.string = "" + poolBetsArr[i];

            let icon = tSmallBetsPool.getComponentInChildren(cc.Sprite);

            let chip = this.getOneChip(poolBetsArr[i]);
            // cc.log("-poolBetsArr---", poolBetsArr[i]);
            if (!chip) {
                continue;
            }
            chip.opacity = 0;
            icon.spriteFrame = chip.getComponent(cc.Sprite).spriteFrame;

            // chip.runAction(cc.sequence(cc.delayTime(0.1), cc.callFunc(() => {
            //     this.recycleChips(chip);
            // })
            // ));
            cc.tween(chip)
                .delay(0.1)
                .call(() => {
                    this.recycleChips(chip);
                })
                .start();
        }
    }

    /**
     * 隐藏边池
     */
    hideSmallBetsPool() {
        for (let i = 0; i < this.nodeSmallBetPool.length; i++) {
            let smallbet = this.nodeSmallBetPool[i];
            smallbet.active = false;
        }
    }

    /**
     * 赢家收集筹码动画
     */
    protected winnerGainChipsAnim(winnerPos: number, postTaxEarn: string, finalMoney: string, tax?: string) {
        let winner = this.plyMgr.getPlyByPos(winnerPos);
        if (winner && winner.exist) {
            winner.gainChips(postTaxEarn, tax, () => {
                winner.takeMoney = finalMoney;
                winner.updateBalance();
                this.setBetsInfo(0, 0);
                this.updateRoomInfo();
            });
        }
    }

    showResult(info: ps.Dzpk_DoBalance_UserInfo) {
        let me = this.plyMgr.me;
        if (info.cardType !== undefined && info.cardType !== -1 && info.isWinner === 1 && info.cardType < DZPKCardType.huangJiaTongHuaShun + 1) {
            this.audioMgr.noticeWin(info.cardType);
        }
        if (me && me.exist && me.pos === info.pos && info.isWinner) {
            if (info.cardType < DZPKCardType.shunZi) {
                this.playAnim(this.animWin);
            } else {
                me.showMyCardsToCommonCardNode();
                this.showCardTypeAnim(info.cardType);
            }
            this.audioMgr.playCheer();
            // this.playAnimWin();
        }
        if (info.isWinner || +info.chgMoney > 0) {
            this.scheduleOnce(() => {
                this.winnerGainChipsAnim(info.pos, info.chgMoney, info.userMoney, info.tax);
            }, 1);
        } else {
            if (+info.backMoney > 0) {
                this.scheduleOnce(() => {
                    this.winnerGainChipsAnim(info.pos, info.backMoney, info.userMoney, info.tax);
                }, 1);
            }
        }
    }

    private _chipsMulti: number[] = [1, 5, 20, 50, 100];
    /**
     * 在桌面添加一定额度的筹码
     *
     * @param {number} amount
     * @returns
     * @memberof Room
     */
    addChips(amount: number) {

        let minCount = 3;
        let curCount = 0;
        let curIndex = -1;
        let maxCount = 10;

        let baseScore = this.baseScore/* this.isCustom ? 1 : 0.01 */;
        let chips: cc.Node[] = [];
        let chipsPrefabNum = this.prefabChips.length;
        for (let i = chipsPrefabNum - 1; i >= 0; i--) {
            let val = new Decimal(baseScore).mul(this._chipsMulti[i]);
            if (new Decimal(amount).cmp(val) !== -1) {
                let chipNum = Math.floor(amount / val.toNumber());
                amount = new Decimal(amount).mod(val).toNumber();
                if (!this.prefabChips[i]) {
                    continue;
                }
                while (chipNum > 0) {
                    chipNum--;
                    let node;
                    node = this.chipsNodePool[i].get();
                    if (!node) {
                        node = cc.instantiate(this.prefabChips[i]);
                    }
                    node.groupIndex = i;
                    let lbl = node.getComponentInChildren(cc.Label);
                    if (lbl) {
                        lbl.string = "";
                    }
                    node.active = true;
                    node.scale = 0.6;
                    this.chipsPool.addChild(node);
                    chips.push(node);

                    curIndex = i;
                    curCount++;
                    if (curCount > maxCount) {
                        break;
                    }
                    // node.rotation = randomMinus1To1() * 30;
                    // let x = randomMinus1To1() * (this.chipsPool.width / 2 - node.width) * cc.random0To1();
                    // let y = randomMinus1To1() * (this.chipsPool.height / 2 - node.height / 2 * node.scale) * cc.random0To1();
                    // node.setPosition(x, y);
                }
            }
            if (amount <= 0) {
                break;
            }
        }
        if (curCount < minCount && curIndex != -1) {
            for (let i = 0; i < minCount - curCount; i++) {
                let node;
                node = this.chipsNodePool[curIndex].get();
                if (!node) {
                    node = cc.instantiate(this.prefabChips[curIndex]);
                }
                node.groupIndex = i;
                let lbl = node.getComponentInChildren(cc.Label);
                if (lbl) {
                    lbl.string = "";
                }
                node.active = true;
                node.scale = 0.6;
                this.chipsPool.addChild(node);
                chips.push(node);
            }
        }
        this.chipsPool.active = true;
        return chips;
    }

    getOneChip(amount: number) {
        let baseScore = this.baseScore/* this.isCustom ? 1 : 0.01 */;

        let chips: cc.Node = undefined;
        let chipsPrefabNum = this.prefabChips.length;

        for (let i = chipsPrefabNum - 1; i >= 0; i--) {
            if (!this.prefabChips[i]) {
                continue;
            }
            let val = new Decimal(baseScore).mul(this._chipsMulti[i]);
            if (new Decimal(amount).cmp(val) !== -1) {
                let node;
                node = this.chipsNodePool[i].get();
                if (!node) {
                    node = cc.instantiate(this.prefabChips[i]);
                }
                let lbl = node.getComponentInChildren(cc.Label);
                if (lbl) {
                    lbl.string = "";
                }
                if (!node) {
                    continue;
                }
                node.groupIndex = i;
                node.scale = 0.6;
                node.opacity = 255;
                chips = node;
                this.chipsPool.addChild(chips);
                this.chipsPool.active = true;
                return chips;
            }
        }
        return chips;
    }


    recycleChips(c: cc.Node) {
        if (!c) {
            return;
        }
        let tag = c.groupIndex;
        let pool = this.chipsNodePool[tag];
        if (!pool) {
            return;
        }
        c.removeFromParent(true);
        c.opacity = 255;
        c.scale = 1;
        c.angle = 0;
        pool.put(c);
    }

    clearChips() {
        this.chipsPool.children.forEach(c => {
            this.recycleChips(c);
        });
        this.chipsPool.destroyAllChildren();
    }

    playAnimEff(animNode: cc.Node) {
        this.playAnim(animNode);
    }
    async dealHandCard() {
        let handlePai = this.plyMgr.me.handlePai;
        let poarr = [];
        for (let i = 0; i < this.plyMgr.playerCount; i++) {
            let startPos = this.smallPos;
            startPos = startPos + i;
            if (startPos >= this.plyMgr.playerCount) {
                startPos = startPos - this.plyMgr.playerCount;
            }
            let p = this.plyMgr.getPlyByPos(startPos);

            if ((p && !p.isLooker) || (p && p.isMe && handlePai.length > 0 && handlePai[0] != -1)) {
                // cc.log("---pdealHandCard---", startPos);
                for (const i in handlePai) {
                    poarr.push(p.addCards(+i, p.isMe ? handlePai[i] : 0));
                }
            }
            await Promise.all(poarr);
        }

        // then(() => {
        this.dealMyCardType();
        // });

        // 发完牌后  显示  自动让牌 等按钮
        // let me = this.plyMgr.me;
        // if (!me.isLooker) {
        //     this.operation.showOther();
        // }
    }

    showCardTypeAnim(type: DZPKCardType) {
        let index = type - DZPKCardType.shunZi;
        if (this.AnimArr[index]) {
            this.playDzpkAnim(this.AnimArr[index]);
        }
    }

    playDzpkAnim(animPrefab: cc.Prefab) {
        if (!animPrefab) {
            return;
        }
        let node = this.dzpkAnimNode.getChildByName(animPrefab.name);
        if (!node) {
            node = cc.instantiate(animPrefab);
            node.position = cc.v2(0, 80)
            this.dzpkAnimNode.addChild(node);
        }

        if (this.nodeCommonCards) {
            let commonCard = cc.instantiate(this.nodeCommonCards);
            commonCard.position = cc.v2(0, -20);
            this.dzpkAnimNode.addChild(commonCard);
        }

        // let me = this.plyMgr.me;
        // if (me && me.layoutCards && me.layoutCards.node) {
        //     let cardnode = me.layoutCards.node;
        //     let myCard = cc.instantiate(cardnode);
        //     myCard.position = cc.v2(0, -20);
        //     this.dzpkAnimNode.addChild(myCard);
        // }

        node.active = true;
        let anim = node.getComponent(cc.Animation);
        if (!anim) {
            cc.warn("prefab no anim");
            return;
        }
        if (anim.defaultClip) {
            anim.play();
        } else {
            let clips = anim.getClips();
            if (!clips || clips.length === 0) {
                return;
            }
            anim.play(clips[0].name);
        }

        let self = this;
        anim.on("stop", function finish() {
            anim.off("stop", finish);
            try {
                node.active = false;
                self.dzpkAnimNode.removeAllChildren();
                self.clearCommonCard();
            } catch (error) {
                cc.error(error);
            }
        });
    }

    dealCommonCard(c: number) {
        this.commonCardsValue.push(c);
        // this.showCommonCardBg();
        let card: DZPKCard = this.pkrGame.getPoker(c).addComponent(DZPKCard);
        card.turn(false, false);
        this.commonCards.push(card);

        this.isTwoWheel = true;

        this.nodeCommonCards.addChild(card.node);

        card.node.scale = 0;
        let actions = cc.sequence(
            cc.spawn(
                cc.scaleTo(.2, 1.4, 1.4),
                cc.moveTo(.2, (this.commonCardsValue.length - 3) * (card.node.width * 1.4 + 10), 0)
            ),
            cc.delayTime(.3),
            cc.callFunc(() => {
                card.turn(true, true, 1.4);
            })
        )
        // card.node.runAction(actions);
        cc.tween(card.node).then(actions).start();
    }

    showCommonCardBg() {
        if (!this.nodeCommonCardBg.active) {
            this.nodeCommonCardBg.active = true;
            //this.nodeCommonCardBg.runAction(cc.fadeIn(0.3));
            cc.tween(this.nodeCommonCardBg).to(0.3, { opacity: 255 }).start();
        }
    }

    clearCommonCard() {
        // this.nodeCommonCardBg.opacity = 0;
        // this.nodeCommonCardBg.active = false;
        this.commonCardsValue = [];
        this.commonCards = [];
        this.nodeCommonCards.destroyAllChildren();

    }

    showDiscardMask() {
        this.nodeDiscardMask.active = true;
    }

    hideDiscardMask() {
        this.nodeDiscardMask.active = false;
    }

    setGameStart(): void {
        super.setGameStart();
        this.changeState(State.Start);
    }
    setGameEnd(): void {
        super.setGameEnd();
        this.changeState(State.End);
    }

    onDestroy() {
        super.onDestroy();
        if (!this.chipsNodePool) {
            return;
        }
        for (let i = this.chipsNodePool.length - 1; i >= 0; i--) {
            let p = this.chipsNodePool[i];
            p.clear();
        }
    }
}