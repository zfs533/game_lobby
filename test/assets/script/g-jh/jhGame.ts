import { GameId } from "../common/enum"
import JHOperation from "./jhOperation";
import JHMsg from "./jhMsg";
import JHPlayerMgr from "./jhPlayerMgr";
import { PlayerState } from "../g-share/player";
import JHInfo from "./jhInfo";
import JHAudio from "./jhAudio";
import JHPk from "./jhPk";
import * as util from "../common/util";
import Game from '../g-share/game';
import PokerGame from '../g-share/pokerGame';
import { UserOpt } from './jhOperation';
import Audio from "../g-share/audio";

const { ccclass, property } = cc._decorator;
let Decimal = window.Decimal;

export enum State {
    FREE,
    DEAL_CARD,
    BETS,
    CHALLENGE,
    BALANCE,
    END
}

export enum CardsType {
    Normal,//散牌
    Pair,//对子
    Straight,//顺子
    Flush,//金花
    StraightFlush,//顺金
    ThreeOfAKind,//豹子
}

/**
 * 二人局结算类型
 */
export enum ResultType {
    errorType,
    fold,       // 弃牌
    challenge,  // 比牌
    allin,      // 全押
    maxRound,   // 终极对决
}

interface iConfig {
    blindFollowRound: number,
    allowAllInRound: number,
    maxRound: number,
    maxBets: number,
    betsList: number[]
}

@ccclass
export default class JHGame extends Game {
    @property({ type: Audio, override: true })
    adoMgr: JHAudio = undefined;

    @property({ type: JHPlayerMgr, override: true })
    plyMgr: JHPlayerMgr = undefined;

    @property(PokerGame)
    pkrGame: PokerGame = undefined;

    @property(JHPk)
    pk: JHPk = undefined;

    @property(JHInfo)
    info: JHInfo = undefined;

    @property(cc.Node)
    chipsPool: cc.Node = undefined;

    @property(JHOperation)
    operation: JHOperation = undefined;

    @property({ type: cc.Prefab, tooltip: "动画播放背景预制" })
    private prefabAnimBg: cc.Prefab = undefined;

    @property([cc.Prefab])
    private prefabChips: cc.Prefab[] = [];

    @property([cc.SpriteFrame])
    private cardTypes: cc.SpriteFrame[] = [];

    @property(cc.Prefab)
    private animLeopard: cc.Prefab = undefined;

    @property(cc.Prefab)
    private animWin: cc.Prefab = undefined;

    @property(cc.Prefab)
    private animStraightGold: cc.Prefab = undefined;

    @property(cc.Node)
    private waitTips: cc.Node = undefined;

    @property([cc.Node])
    private particleEffAllIn: cc.Node[] = [];

    @property([cc.Label])
    private testShow: cc.Label[] = [];

    private _blindRound: number;//闷几轮，>这个值才能看牌
    get blindRound() {
        return this._blindRound;
    }

    private _allInRound: number;//all in轮，>=这个值才能all in
    get allInRound() {
        return this._allInRound;
    }
    get canRaise() {
        return this.lastBetType !== UserOpt.ALLIN && (this.curSingleBet < this.baseScore * this.betsList[this.betsList.length - 1]);
    }
    /**
     * 这局总下注
     *
     * @type {number}
     * @memberof JHGame
     */
    totalBets: number;
    /**
     * 当前单注
     *
     * @readonly
     * @memberof JHGame
     */
    curSingleBet: number;
    /**
     * 当前轮数
     *
     * @readonly
     * @memberof JHGame
     */
    round: number;
    /**
     * 一局游戏总轮数
     *
     * @readonly
     * @memberof JHGame
     */
    totalRound: number;

    /**
     * 当局玩家最大下注上限
     * @type {number}
     * @memberof JHGame
     */
    maxBets: number;

    betsList: number[];

    magicSymbol?: number;
    lastBetType: UserOpt;
    readonly raiseRates = [1, 2, 5, 8, 10];
    /**
     * 是否已经过了闷牌轮，可以看牌了
     *
     * @readonly
     * @memberof JHGame
     */
    get canLookCard() {
        return this.round > this._blindRound;
    }

    /**
     * 我是否在游戏中
     *
     * @readonly
     * @memberof JHGame
     */
    get amIInGame() {
        if (!this || !this.plyMgr) {
            return false;
        }
        let me = this.plyMgr.me;
        return me && me.exist && !me.isLooker;
    }

    msg: JHMsg;

    private chipsNodePool: cc.NodePool[];
    private initChipsNodePool() {
        this.chipsNodePool = [];
        for (let i = 0; i < this.raiseRates.length; i++) {
            let pool = new cc.NodePool();
            this.chipsNodePool.push(pool);
        }
    }

    initGame(): void {

        this.waitTips.active = false;
        this.info.node.active = true;
        this.chipsPool.active = false;
        this.operation.node.active = true;
        this.pk.node.active = false;
        this.nodeAnimation.active = true;
        this.operation.game = this;
        this.info.game = this;
        this.msg = new JHMsg(this);
        this.msg.init();
        this.pk.init(this);
        this.initChipsNodePool();
        this.showOrHideAllInParticle(false);
    }
    initRound(): void {
        this.pk.clearPK();
        this.waitTips.active = false;
        this.totalBets = undefined;
        this.round = undefined;
        this.curSingleBet = undefined;
        this.lastBetType = UserOpt.FOLD;

        this.doPrepare();

        this.hideTicker();
        this.plyMgr.clearOtherPlys();
        this.plyMgr.chgState(PlayerState.UNREADY);
        this.plyMgr.clearCards();
        this.plyMgr.setPlayersActive();
        this.clearChips();
        this.operation.init();
        this.refreshRoomInfo();
        this.showOrHideAllInParticle(false);
        this.testShow.forEach((test) => {
            test.string = ""
        })
    }

    onClickPrepare() {
        this.doPrepare();
    }

    // 全压特效显隐控制
    showOrHideAllInParticle(show: boolean) {
        this.particleEffAllIn.forEach(element => {
            element.active = show;
        });
    }

    //显示等待下局
    showWaitTips() {
        this.waitTips.active = true;
    }

    dealRoomData(data: ps.GameRoomHandlerGetRoomData) {
        let config = util.toj<iConfig>(data.config)
        this._blindRound = config.blindFollowRound;
        this._allInRound = config.allowAllInRound;
        this.totalRound = config.maxRound;
        this.maxBets = config.maxBets;
        this.betsList = config.betsList
        this.refreshRoomInfo()
        this.initRound();
    }
    refreshRoomInfo(): void {
        this.info.updateBetsPool();
        this.info.updateLeft();
        this.info.updateRight();
    }


    updateUI(): void {
        this.menu.updateBtnState();
    }

    recycleChips(c: cc.Node) {
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

    /**
     * 在桌面添加一定额度的筹码
     *
     * @param {number} amount
     * @param {boolean} double
     * @returns
     * @memberof Room
     */
    addChips(amount: number) {
        let baseScore = this.baseScore/* this.isCustom ? 1 : 0.01 */;
        let chips: cc.Node[] = [];
        for (let i = this.raiseRates.length - 1; i >= 0; i--) {
            let prefab = this.prefabChips[i];
            if (!prefab) {
                continue;
            }
            let num = new Decimal(this.raiseRates[i]).mul(baseScore);

            if (new Decimal(amount).cmp(num) === -1) {
                continue;
            }
            let count = Math.floor(new Decimal(amount).div(num).toNumber());
            //限制最大个数
            if (count > 50) {
                count = 50;
            }

            if (count < 1) {
                continue;
            }
            while (count-- > 0) {
                let node = this.chipsNodePool[i].get();
                if (!node) {
                    node = cc.instantiate(prefab);
                }
                node.groupIndex = i;
                let lbl = node.getComponentInChildren(cc.Label);
                if (lbl) {
                    lbl.string = num.toString();
                }
                node.scale = 0.8;
                this.chipsPool.addChild(node);
                chips.push(node);
                node.angle = util.randf(-1, 1) * 30;
                let x = util.randf(-1, 1) * (this.chipsPool.width / 2 - node.width) * Math.random();
                let y = util.randf(-1, 1) * (this.chipsPool.height / 2 - node.height / 2 * node.scale) * Math.random();
                node.setPosition(x, y);
            }
            amount = new Decimal(amount).mod(num).toNumber();
            if (amount === 0) {
                break;
            }
        }
        this.chipsPool.active = true;
        return chips;
    }

    getCardTypeSf(type: CardsType) {
        if (type === CardsType.Normal) {
            return undefined;
        } else {
            return this.cardTypes[type - 1];
        }
    }

    getCardTypeAnim(type: CardsType.StraightFlush | CardsType.ThreeOfAKind) {
        if (type === CardsType.StraightFlush) {
            return cc.instantiate(this.animStraightGold);
        } else if (type === CardsType.ThreeOfAKind) {
            return cc.instantiate(this.animLeopard);
        }
    }

    setGameStart(): void {
        super.setGameStart()
        this.changeState(State.FREE);
    }
    setGameEnd(): void {
        super.setGameEnd()
        this.changeState(State.END);
        this.plyMgr.endTurn();
    }

    playCardTypeAnim(type: CardsType.StraightFlush | CardsType.ThreeOfAKind) {
        let anim = this.getCardTypeAnim(type);
        if (anim) {
            this.playAnim(anim, true);
        }
    }

    playAnimWin() {
        this.adoMgr.playSoundWin();
        return this.playAnim2(this.animWin);
    }

    playDealerAnim(node: cc.Node) {
        return this.playAnim(node, true);
    }

    playAnim2(animPrefab: cc.Prefab, cards?: cc.Node[]) {
        return new Promise(resolve => {
            if (!animPrefab) {
                // console.warn("no anim prefab")
                resolve(false)
                return
            }

            let node = this.nodeAnimation.getChildByName(animPrefab.name)
            if (!node) {
                node = cc.instantiate(animPrefab)
                this.nodeAnimation.addChild(node)
            }
            node.active = true
            let anim = node.getComponent(cc.Animation)
            if (!anim) {
                console.warn("prefab no anim")
                resolve(false)
                return
            }
            if (cards) {
                for (let i = 0; i < cards.length; i++) {
                    let n = node.getChildByName("c" + (i + 1))
                    if (n && cards[i]) {
                        n.destroyAllChildren()
                        n.removeAllChildren()
                        n.addChild(cards[i])
                    }
                }
            }
            let bg = this.nodeAnimation.getChildByName("animBg")
            if (!bg) {
                bg = cc.instantiate(this.prefabAnimBg)
                this.nodeAnimation.addChild(bg)
                bg.name = "animBg"
                bg.setSiblingIndex(0)
            }
            bg.active = true
            bg.opacity = 0
            bg.stopAllActions()
            //bg.runAction(cc.fadeTo(0.2, 100))
            cc.tween(bg).to(0.2, { opacity: 100 }).start();

            if (anim.defaultClip) {
                anim.play()
            } else {
                let clips = anim.getClips()
                if (!clips || clips.length === 0) {
                    resolve(false)
                    return
                }
                anim.play(clips[0].name)
            }
            anim.on("stop", function finish() {
                anim.off("stop", finish)
                node.active = false
                bg.stopAllActions()
                // bg.runAction(cc.sequence(
                //     cc.fadeOut(0.2),
                //     cc.callFunc(() => {
                //         bg.active = false
                //     })
                // ))
                cc.tween(bg).then(
                    cc.sequence(
                        cc.fadeOut(0.2),
                        cc.callFunc(() => {
                            bg.active = false
                        })
                    )
                ).start();
                resolve(true)
            })
        })
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

    testRobotShow(data: any) {
        let p = this.plyMgr.getPlyByPos(data.pos)
        let position = p.node.position;
        this.testShow[data.pos].node.setPosition(position);
        this.testShow[data.pos].string = "";
        this.testShow[data.pos].string = this.testShow[data.pos].string + "座位：" + data.pos + "\n";
        this.testShow[data.pos].string = this.testShow[data.pos].string + "胜率：" + data.winRate + "\n";
        this.testShow[data.pos].string = this.testShow[data.pos].string + "回报率：" + data.responseRate + "\n";
        this.testShow[data.pos].string = this.testShow[data.pos].string + "牌面：" + data.cardStr + "\n";
        this.testShow[data.pos].string = this.testShow[data.pos].string + "牌值：" + data.handCards[0] + " " + data.handCards[1] + " " + data.handCards[2] + "\n";
        this.testShow[data.pos].string = this.testShow[data.pos].string + "牌型：" + data.type + "\n"
    }
}
