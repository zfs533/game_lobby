import HHPlayerMgr from "./hhPlayerMgr";
import HHPlayer from "./hhPlayer";
import HHAudio from "./hhAudio";
import HHRecord from "./hhRecord";
import HHTrend from "./hhTrend";
import HHMsg from "./hhMsg";

import BRgame from "../g-br/brGame";
import BRplayers from "../g-br/brOtherPlys";
import Game from "../g-share/game";
import PokerGame from "../g-share/pokerGame";

import { toj } from "../common/util";
import { showTip } from "../common/ui";

let Decimal = window.Decimal;

export enum GameStatus {
    STATUS_FREE,
    STATUS_BET,
    STATUS_DEAL_CARD,
    STATUS_RESULT,
    STATUS_END
}

export enum Area {
    Black,          //黑
    Red,            //红
    Special         //特殊
}

export enum Shape {
    ShapeInvalid,                       //无效类型
    ShapePoint = 1,                     //点子牌
    ShapePairSmall = 2,                 //对子(2~8)
    ShapePairBig = 3,                   //对子(9~A)
    ShapeStraight = 4,                  //顺子
    ShapeFlush = 5,                     //同花
    ShapeFlushStraight = 6,             //同花顺
    ShapeTreeOfAKind = 7                //三同
}

export const SHAPE_NAME = ["无效", "单牌", "对子", "对子", "顺子", "金花", "顺金", "豹子"];
interface iConfig {
    betTime: number,
    areaMaxMoney: string,
    areaSpecialMaxMoney: string,
    betList: string[],
    allowBetMinMoney: string,
}

const { ccclass, property } = cc._decorator;
@ccclass
export default class HHGame extends Game {
    @property({ type: HHAudio, override: true })
    adoMgr: HHAudio = undefined;

    @property({ type: HHPlayerMgr, override: true })
    plyMgr: HHPlayerMgr = undefined;

    @property(BRgame)
    brGame: BRgame = undefined;

    @property(PokerGame)
    pkrGame: PokerGame = undefined;

    @property(BRplayers)
    brPlys: BRplayers = undefined;

    @property([cc.Node])
    private blackRedCards: cc.Node[] = [];

    @property([cc.Sprite])
    private blackRedShape: cc.Sprite[] = [];

    @property([cc.Node])
    private dsBetLogos: cc.Node[] = [];// 赌神下注区域

    @property([cc.Label])
    private totalAreaBets: cc.Label[] = [];

    @property([cc.Label])
    private selfAreaBets: cc.Label[] = [];

    @property(cc.Label)
    private noGoldTips: cc.Label = undefined;

    @property(cc.Node)
    private betTimePanel: cc.Node = undefined;

    @property(cc.Node)
    private nodeRest: cc.Node = undefined;

    @property(cc.Node)
    private nodeVs: cc.Node = undefined;

    @property(cc.Node)
    private nOther: cc.Node = undefined;

    @property([cc.SpriteFrame])
    private sfShape: cc.SpriteFrame[] = [];

    @property(sp.Skeleton)
    private spVs: sp.Skeleton = undefined;

    @property(cc.Prefab)
    private preEndBetting: cc.Prefab = undefined;

    @property(cc.Prefab)
    preAnimWin: cc.Prefab = undefined;

    @property(cc.Prefab)
    preParticle: cc.Prefab = undefined;

    @property(HHPlayer)
    fhPlayer: HHPlayer = undefined;// 富豪

    @property(HHPlayer)
    dsPlayer: HHPlayer = undefined;// 赌神

    @property(HHRecord)
    hhRecord: HHRecord = undefined;

    @property(HHTrend)
    hhTrend: HHTrend = undefined;

    msg: HHMsg;
    isExistFh: boolean;
    isExistDs: boolean;

    private canPlayCoinAudio = true;
    private coinAudioInterval = 0.1;

    private BET_TOTAL_TIME: number;                                             // 下注总时间
    private MAX_AREA_BET: string = "20000";                                     // 红黑单区域最大下注额
    private MAX_SPECIAL_AREA_BET: string = "20000";                             // 特殊单区域最大下注额
    MIN_BET: string = "50";                                                     // 最小可下注额

    private dsLogoPosArr: cc.Vec2[] = [];                                       // 赌神在各区域的标志
    private _otherPos: cc.Vec2;

    private _currBetArea: number;
    private _currBetPoint: number;
    private _totalBets: string[];
    private _selfBets: string[];
    private _beforeBettingMoney: string;                                        // 下注之前自己的金额

    private _records: ps.Hh_EnterBalance_WinLoseInfo[] = [];

    setRecords(re: ps.Hh_EnterBalance_WinLoseInfo[], isStation = false) {
        this._records = re;
        this.hhRecord.setRecord(this._records);
        this.hhTrend.setRecord(this._records, isStation);
    }

    get records() {
        return this._records;
    }

    onLoad() {
        for (let idx = 0; idx < this.dsBetLogos.length; idx++) {
            const logo = this.dsBetLogos[idx];
            logo.zIndex = (1);
            this.dsLogoPosArr[idx] = logo.getPosition();
        }

        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 3; j++) {
                let card = this.pkrGame.getPoker(0);
                card.setPosition(0, 0);
                card.name = 'card';
                this.blackRedCards[i].addChild(card);
            }
        }

        super.onLoad();
        this._otherPos = this.nOther.convertToWorldSpaceAR(cc.v2(0, 0));
    }

    initRound(): void {
        // console.log("初始化一局");
        this._currBetArea = undefined;
        this.betTimePanel.active = false;
        // this.spVs.node.active = false;

        this.cleanBet();
        this.brGame.hideBet();
        this.hideAllPanel();
        this.brGame.setWaitTips(false);

        this.setRestShow(false);
        this.setVsShow(false);

        this.plyMgr.initBets();
        if (this.fhPlayer) this.fhPlayer.initBets();
        if (this.dsPlayer) this.dsPlayer.initBets();

        // 遮牌
        this.blackRedCards.forEach(cards => {
            cards.children.forEach(c => {
                c.stopAllActions();
                this.pkrGame.showFront(c, false);
            })
        })

        this.blackRedShape.forEach(shape => {
            shape.node.stopAllActions();
            shape.node.scale = 0;
            shape.node.getParent().active = false;
        });
    }

    initGame(): void {
        // console.log("初始化 init ");
        this.msg = new HHMsg(this);
        this.msg.init();
        this.hhTrend.hide();
        this.brPlys.showDs = true;
        this.brPlys.hide();
        this.fhPlayer.init(this);
        this.dsPlayer.init(this);
    }

    changeState(s: number, left?: number) {
        super.changeState(s);
    }

    updateUI(): void {
        switch (this.gameState) {
            // 等待开始
            case GameStatus.STATUS_FREE:
                // console.log("等待状态");
                break;
            // 下注
            case GameStatus.STATUS_BET:
                this.beginBet();
                // console.log("下注状态");
                break;
            // 展示牌
            case GameStatus.STATUS_DEAL_CARD:
                // console.log("展示牌状态");

                this.adoMgr.playStopBet();
                this.setVsShow(true);
                this.betTimePanel.active = false;

                this.brGame.hideBet();
                break;
            // 结算
            case GameStatus.STATUS_RESULT:
                // console.log("结算状态");
                break;
        }
        this.menu.hideChangeBtn();
    }

    dealRoomData(data: ps.GameRoomHandlerGetRoomData) {
        let config = toj<iConfig>(data.config)
        this.BET_TOTAL_TIME = config.betTime;
        this.MAX_AREA_BET = config.areaMaxMoney;
        this.MAX_SPECIAL_AREA_BET = config.areaSpecialMaxMoney;
        this.MIN_BET = config.allowBetMinMoney;

        this.brGame.setChipPoint(config.betList);
        this.brGame.clickBetLsr = this.onClickBet.bind(this);
        this.brGame.clickAreaLsr = this.onClickArea.bind(this);
        this.initRound();
    }


    setNoGoldTips(str?: string) {
        this.noGoldTips.node.active = !!str;
        this.noGoldTips.string = str ? str : "";
    }

    /**
     * 休息时间
     * @param active
     */
    setRestShow(active: boolean) {
        this.nodeRest.active = active;
    }

    setVsShow(active: boolean) {
        if (active) {
            this.nodeVs.active = true;
            this.showAction(this.nodeVs, true, () => {
                this.setRestShow(false);
            })
        } else {
            this.showAction(this.nodeVs, false);
        }
    }

    /**
     * 设置展示牌
     * @param show
     */
    setCardsStatus(show: boolean) {
        this.blackRedCards.forEach(cards => {
            cards.active = show;
        })
        if (!show) {
            return;
        }

        // 发牌动作
        this.blackRedCards.forEach(cards => {
            let interval = -62;
            for (let idx = 0; idx < cards.children.length; idx++) {
                let card = cards.children[idx];
                card.stopAllActions();
                let actions = cc.sequence(
                    cc.moveTo(0.1, cc.v2(0, 0)),
                    cc.delayTime(0.3),
                    cc.moveTo(0.3, cc.v2(interval * (1 - idx), 0)).easing(cc.easeBackOut())
                )
                // card.runAction(actions);
                cc.tween(card).then(actions).start();
            }
        })
    }

    setGameStart() {
        this.playVsAnim();
        this.hhTrend.isTouchNext = true;
        // this.plyMgr.setBigRegalGambleGodPos();
        this.setMeLooker(true);
    }

    setGameEnd() {
        this.setMeLooker(true);
    }

    setMeLooker(isLooker: boolean) {
        let me = this.plyMgr.me;
        me.isLooker = isLooker;
    }

    /**
     *  开始下注
     */
    beginBet() {
        this.setVsShow(false);
        this.adoMgr.playStartBet();

        this.betTimePanel.active = true;
        this.setAllowBet();

        this._beforeBettingMoney = this.plyMgr.me.money;
    }

    /**
     * 开牌
     * @param cardsInfo
     */
    async setRedBlackCards(cardsInfo: ps.Hh_EnterDealCard_cardsInfo[]) {
        this.adoMgr.playShow();
        await this.playAnim(this.preEndBetting);
        await this.drawCards(cardsInfo);
    }

    quickShowCards(cardsInfo: ps.Hh_EnterDealCard_cardsInfo[]) {
        this.drawCards(cardsInfo, true);
    }

    /**
     * 翻牌动作
     * @param cardsInfo
     * @param isQuick
     */
    async drawCards(cardsInfo: ps.Hh_EnterDealCard_cardsInfo[], isQuick: boolean = false) {
        cardsInfo.sort((a, b) => {
            return a.area - b.area;
        })

        for (const info of cardsInfo) {
            let nodeCard = this.blackRedCards[info.area];
            nodeCard.active = true;
            let sprShape = this.blackRedShape[info.area];
            let nodes = nodeCard.children;
            let cards = info.cards;
            let shape = info.shape;
            cards.sort(this.cardsSort);

            // 先翻牌，再显示牌型
            sprShape.node.getParent().active = false;
            for (let idx = 0; idx < cards.length; idx++) {
                const data = cards[idx];
                let node = nodes[idx];
                if (isQuick) {
                    this.pkrGame.lhTurnAnim(node, data, false, 1);
                } else {
                    let delay = false;
                    if (idx === cards.length - 1) {
                        delay = true;
                    }
                    await this.pkrGame.lhTurnAnim(node, data, delay, 1);
                }
            }

            let scaleTime = isQuick ? 0.1 : 0.5;
            if (shape >= Shape.ShapePoint) {
                sprShape.node.getParent().active = true;
                sprShape.spriteFrame = this.sfShape[shape];
                let nodeShape = sprShape.node;
                nodeShape.stopAllActions();
                nodeShape.scale = 0;
                //nodeShape.runAction(cc.scaleTo(scaleTime, 1, 1).easing(cc.easeBounceOut()));
                cc.tween(nodeShape).then(cc.scaleTo(scaleTime, 1, 1).easing(cc.easeBounceOut())).start();
                this.adoMgr.playShape(shape);
            }
        }
    }

    private cardsSort(a: number, b: number) {
        let aPoint = a & 0x0f;
        let bPoint = b & 0x0f;
        return aPoint - bPoint;
    }

    /**
     * 用户下注
     * @param rPos
     * @param area
     * @param bets
     */
    userDoBets(rPos: number, area: number, bets: string) {
        let player: HHPlayer = this.getBetPlayer(rPos);
        let playerPos: cc.Vec2;
        if (player) {
            if (new Decimal(player.money).sub(bets).lessThan(0)) return;

            player.doBet(area, bets);
            let selfBalance = new Decimal(player.money);
            if (player.isMe) {
                this.setSelfAreaMoney(area, +bets);
                if (this._currBetPoint === undefined) return;
                if (selfBalance.sub(this._currBetPoint).lessThanOrEqualTo(0)
                    || selfBalance.sub(this.MIN_BET).lessThanOrEqualTo(0)) {
                    if (selfBalance.sub(this._currBetPoint).gt(0)) {
                        this._currBetPoint = undefined;
                    }
                }
                this.setAllowBet();
            } else {
                // 玩家金额不足则替换掉
                if (selfBalance.sub(this.MIN_BET).lessThanOrEqualTo(0)) {
                    this.plyMgr.setPlyLeave(player.pos);
                }
            }
            playerPos = player.convertToWorldPos();
            // 自己的话就不用再飞了
            if (!player || !player.isMe) {
                this.brGame.chipFlyArea(area, playerPos, +bets);
                if (this.canPlayCoinAudio) {
                    this.adoMgr.playBet();
                    this.canPlayCoinAudio = false;
                    this.scheduleOnce(() => {
                        this.canPlayCoinAudio = true;
                    }, this.coinAudioInterval);
                }
            }
        } else {
            if (Math.random() < 0.5) {
                return;
            }
            playerPos = this._otherPos;
            // 自己的话就不用再飞了
            if (!player || !player.isMe) {
                //this.brGame.chipFlyArea(area, playerPos, +bets);
                this.brGame.chipFlyAreaOther(area, this.nOther.position, +bets);
                if (this.canPlayCoinAudio) {
                    this.adoMgr.playBet();
                    this.canPlayCoinAudio = false;
                    this.scheduleOnce(() => {
                        this.canPlayCoinAudio = true;
                    }, this.coinAudioInterval);
                }
            }
        }



        // 赌神下注
        let dsPos = this.dsPlayer.pos;
        if (dsPos === rPos && this.isExistDs) {
            this.dsLogoFly(area);
        }
    }

    /**
     * 赌神下注
     * @param areaIdx
     */
    private dsLogoFly(areaIdx: number) {
        let areaLogo = this.dsBetLogos[areaIdx];
        if (areaLogo.active) return;
        areaLogo.active = true;

        let playerNode = this.dsPlayer.node;
        let worldPos = playerNode.convertToWorldSpaceAR(cc.v2(0, 0));
        let dsAreaPos = areaLogo.getParent().convertToNodeSpaceAR(worldPos);

        let motionStreakFunc = () => {
            let logoTemp = cc.instantiate(areaLogo);
            areaLogo.getParent().addChild(logoTemp, 0);
            let time = 1;
            let actions = cc.sequence(
                cc.spawn(cc.scaleTo(time, 0, 0), cc.fadeTo(time, 0)),
                cc.callFunc(logoTemp.destroy, logoTemp),
            )
            // logoTemp.runAction(actions);
            cc.tween(logoTemp).then(actions).start();
        }

        areaLogo.stopAllActions();
        areaLogo.setPosition(dsAreaPos);
        let jump = cc.jumpTo(1, this.dsLogoPosArr[areaIdx], 50, 1);
        let actions = cc.sequence(jump, cc.callFunc(() => {
            this.unschedule(motionStreakFunc);
        }))
        // areaLogo.runAction(actions);
        cc.tween(areaLogo).then(actions).start();
        this.schedule(motionStreakFunc, 0.1);
    }

    /**
     * 获取下注玩家
     */
    getBetPlayer(rPos: number): HHPlayer | undefined {
        if (rPos === undefined)
            return;

        let player = this.plyMgr.getPlyByPos(rPos);
        if (player) {
            return player;
        }
        let dsPos = this.dsPlayer.pos;
        let fhPos = this.fhPlayer.pos;
        if (rPos === dsPos && this.isExistDs) {
            return this.dsPlayer;
        }
        if (rPos === fhPos && this.isExistFh) {
            return this.fhPlayer;
        }
        return undefined;
    }

    /**
     * 玩家最终结算动画
     * @param winShape
     * @param redWin
     * @param users
     */
    async balanceAnim(winLoseInfo: ps.Hh_EnterBalance_WinLoseInfo, plys: ps.Hh_EnterBalance_Info[]) {
        let winArea = !!winLoseInfo.redWin ? Area.Red : Area.Black;
        let isWinShape = winLoseInfo.winShape > Shape.ShapePoint ? true : false;
        if (!plys) return;

        // 筹码飞向胜利区域
        let tbPlyInfos: ps.Hh_EnterBalance_Info[] = [];
        let zero = new Decimal(0);
        if (plys && plys.length > 0) {
            plys.forEach(plyIf => {
                // 同步玩家数据、总下注额、连胜次数
                let finalChg = plyIf.chgMoney;
                this.plyMgr.updatePlyBets(plyIf.pos, finalChg, plyIf.totalBets, plyIf.winCnt);

                let player = this.getBetPlayer(plyIf.pos);
                if (player) {
                    tbPlyInfos.push(plyIf);
                    let pWorld = player.convertToWorldPos();
                    if (zero.lt(plyIf.chgMoney)) {
                        // 先根据玩家赢的钱生存筹码飞向玩家
                        let betInfos = player.areaBetInfos;
                        for (let area = Area.Black; area <= Area.Special; area++) {
                            let bets = betInfos[area];
                            if (area === winArea || (isWinShape && area === Area.Special)) {
                                this.brGame.chipFlyPly(area, pWorld, +bets);
                            }
                        }
                        this.playWinAnim(player);
                    }
                    // 计算玩家最后的金额时，桌子上的玩家要把下注的金额补回来
                    let betInfos = player.areaBetInfos;
                    let beforeBet = new Decimal(player.money).add(finalChg);
                    for (let area = Area.Black; area <= Area.Special; area++) {
                        if (betInfos[area]) beforeBet = beforeBet.add(betInfos[area]);
                    }
                    player.money = beforeBet.toString();
                }
            });
        }

        // 再把桌上剩下的筹码飞向其他玩家
        for (let area = Area.Black; area <= Area.Special; area++) {
            //this.brGame.chipFlyPly(area, this._otherPos);
            this.brGame.chipFlyPlyOther(area, this.nOther.position);
        }
        await new Promise(resolve => {
            this.scheduleOnce(() => { resolve() }, 0.8);
        });;
        this.adoMgr.playWinBet();

        // 刷新玩家的金币、展示输赢
        if (tbPlyInfos.length > 0) {
            tbPlyInfos.forEach(plyIf => {
                let ply = this.getBetPlayer(plyIf.pos);
                ply.updateMoney();
                ply.showWinOrLost(plyIf.chgMoney);


                // 玩家金额不足则替换掉
                if (!ply.isMe && new Decimal(ply.money).sub(this.MIN_BET).lessThanOrEqualTo(0)) {
                    this.plyMgr.setPlyLeave(ply.pos);
                }
            });
        }
        this.plyMgr.setBigRegalGambleGodPos();
    }

    setTimer(time: number) {
        if (this.gameState === GameStatus.STATUS_BET) {
            this.showTicker(time);
        }
    }

    private showAction(node: cc.Node, show: boolean, callFunc?: Function) {
        callFunc = callFunc || function () { };
        if (show) {
            node.stopAllActions();
            node.scale = 0;
            let actions = cc.sequence(
                cc.moveBy(0, 0, -45),
                cc.spawn(
                    cc.scaleTo(0.1, 1, 1),
                    cc.moveBy(0.3, 0, 45).easing(cc.easeBackOut()),
                    cc.fadeIn(0.3)
                )
            )
            // node.runAction(actions);
            cc.tween(node).then(actions).start();
        } else {
            node.stopAllActions();
            node.scale = 1;
            let actions = cc.sequence(
                cc.spawn(
                    cc.scaleTo(0.1, 0, 0),
                    cc.moveBy(0.3, 0, -45).easing(cc.easeBackIn()),
                    cc.fadeOut(0.3)
                ),
                cc.moveBy(0, 0, 45),
                cc.callFunc(callFunc)
            )
            // node.runAction(actions);
            cc.tween(node).then(actions).start();
        }
    }

    onClickTrend() {
        this.hhTrend.show();
    }

    onClickOther() {
        this.brPlys.show(this.plyMgr.getAllPlayerInfo());
    }

    // ----------------------------------区域效果
    setWinAreaEff(redWin: number, winShape: number) {
        if (!!redWin) {
            this.brGame.setAreaEff(Area.Red);
        } else {
            this.brGame.setAreaEff(Area.Black);
        }
        if (winShape > Shape.ShapePairSmall) {
            this.brGame.setAreaEff(Area.Special);
        }
    }

    private hideAllPanel() {
        this.hideArea();
    };

    /**
     * 隐藏下注区域
     */
    private hideArea() {
        this.brGame.hideArea();
        for (let idx = 0; idx < this.dsBetLogos.length; idx++) {
            const logo = this.dsBetLogos[idx];
            logo.stopAllActions();
            logo.setPosition(this.dsLogoPosArr[idx]);
            logo.active = false;
        }
    }

    //--------------------------------------下注区域
    /**
     * 选择下注区域
     * @param idx
     */
    private onClickArea(areaIdx: number) {
        if (this.gameState === GameStatus.STATUS_BET) {
            if (this._currBetPoint) {
                // 不能同时下红黑
                if (this._currBetArea !== undefined && areaIdx !== Area.Special && areaIdx !== this._currBetArea) {
                    showTip("不能同时在红黑方下注～");
                    return false;
                }

                // 不能大于该区域的最大下注额
                let currMaxBet = new Decimal(this._selfBets[areaIdx]).add(this._currBetPoint);
                let maxBet = (Area.Special === areaIdx) ? this.MAX_SPECIAL_AREA_BET : this.MAX_AREA_BET;
                if (currMaxBet.gt(maxBet)) {
                    showTip("下注额超过下注上限～");
                    return false;
                }

                let player = this.plyMgr.me;
                if (new Decimal(player.money).sub(this._currBetPoint).gte(0)) {
                    this.msg.sendDoBets(areaIdx, this._currBetPoint);
                    this.brGame.chipFlyArea(areaIdx, player.convertToWorldPos(), this._currBetPoint);
                    this.adoMgr.playBet();
                    return true;
                } else {
                    showTip("金币不足～");
                }
            } else {
                showTip(`金币不足${this.MIN_BET}不能下注，请您充值～`);
            }
        } else {
            console.log("非下注时间");
        }
        return false;
    }

    /**
     * 设置该区域所有的筹码
     */
    setTotalAreaMoney(area: number, bet: string, showDefaultClips = false) {
        if (!this._totalBets || new Decimal(bet).eq(0)) return;

        this._totalBets[area] = new Decimal(this._totalBets[area]).add(bet).toString();
        this.totalAreaBets[area].string = this._totalBets[area];

        if (showDefaultClips) {
            this.brGame.setAreaMoney(area, +bet)
        }
    }

    /**
     * 设置该区域自己的筹码
     */
    setSelfAreaMoney(area: number, bet: number) {
        if (!this._selfBets) return;
        if (!bet) return cc.warn("bet value not exist or equal zero!");
        if (area !== Area.Special) this._currBetArea = area;    // 记录自己红黑下注区域
        this._selfBets[area] = new Decimal(this._selfBets[area]).add(bet).toString();
        let labArea = this.selfAreaBets[area];
        labArea.string = this._selfBets[area];
        labArea.node.getParent().active = true;

        this.setMeLooker(false);
    }

    //---------------------------------------- 己方筹码
    /**
     * 选择筹码
     */
    private onClickBet(idx: string) {
        this._currBetPoint = +this.brGame.chipPoints[idx];
        return this.gameState === GameStatus.STATUS_BET;
    }

    /**
     * 挑选自己可选择的筹码
     */
    setAllowBet() {
        let money = this.plyMgr.me.money;
        // 金额低于50不能下注
        if (new Decimal(money).sub(this.MIN_BET).lt(0)) {
            this._currBetPoint = undefined;
            this.brGame.setAllowBet(0);
            this.brGame.setBetLight(-1);
            this.setNoGoldTips(`金币不足${this.MIN_BET}不能下注，请您充值～`)
            return;
        } else {
            this.setNoGoldTips()
        }

        let allowNum = 0;
        let currChooseNum = 0;
        for (let idx = 0; idx < this.brGame.chipPoints.length; idx++) {
            let btnScore = this.brGame.chipPoints[idx];
            if (new Decimal(money).sub(btnScore).greaterThanOrEqualTo(0)) {
                allowNum += 1;
                if (this._currBetPoint && (this._currBetPoint === +this.brGame.chipPoints[idx])) {
                    currChooseNum = allowNum;
                }
            }
        }

        if (allowNum > 0) {
            this.brGame.setAllowBet(allowNum);

            if (currChooseNum) {
                allowNum = currChooseNum;
            } else if (!this._currBetPoint) {
                allowNum = 1;
            }
            let maxBetVal = +this.brGame.chipPoints[allowNum - 1];
            this._currBetPoint = maxBetVal;

            this.brGame.setBetLight(allowNum - 1);
        } else {
            this.brGame.setBetLight(-1);
        }
    }

    private cleanBet() {
        this._totalBets = ["0", "0", "0"];
        for (const lab of this.totalAreaBets) {
            lab.string = "0";
        }
        this.cleanSelfBet();
    }

    private cleanSelfBet() {
        this._selfBets = ["0", "0", "0"];
        for (const lab of this.selfAreaBets) {
            lab.string = "0";
            lab.node.getParent().active = false;
        }
    }

    // --------------------------动画
    async playWinAnim(player: HHPlayer) {
        let anim = <cc.Node>cc.instantiate(this.preAnimWin);
        this.nodeAnimation.addChild(anim);
        anim.setPosition(player.convertToNodePos(this.nodeAnimation));

        let nodeParticle = cc.instantiate(this.preParticle);
        anim.addChild(nodeParticle);
        await this.playAnim(anim);

        anim.removeAllChildren();
        anim.removeFromParent();
    }

    playVsAnim() {
        this.spVs.node.active = true;
        this.spVs.animation = "animation";
        // this.playAnim(this.spVs);
    }
}
