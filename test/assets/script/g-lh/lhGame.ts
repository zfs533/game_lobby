import LhPlayerMgr from "./lhPlayerMgr";
import LhPlayer from "./lhPlayer";
import LhAudio from "./lhAudio";
import LhRecord from "./lhRecord";
import LhTrend from "./lhTrend";
import LhMsg from "./lhMsg";

import BRgame from "../g-br/brGame";
import BRplayers from "../g-br/brOtherPlys";
import Game from "../g-share/game";
import PokerGame from "../g-share/pokerGame";

import { showTip } from "../common/ui";
import { toj } from "../common/util";

const { ccclass, property } = cc._decorator;
let Decimal = window.Decimal;
export enum Area {
    Error = -1,
    Dragon,             //龙
    Tiger,              //虎
    Peace               //和
}

export enum GameStatus {
    STATUS_FREE,
    STATUS_BET,
    STATUS_DEAL_CARD,
    STATUS_BALANCE
}
interface iConfig {
    betTime: number,
    areaMaxMoney: string,
    areaTieMaxMoney: string,
    allowBetMinMoney: string,
    betList: string[],
}

@ccclass
export default class LhGame extends Game {
    @property({ type: LhAudio, override: true })
    adoMgr: LhAudio = undefined;

    @property({ type: LhPlayerMgr, override: true })
    plyMgr: LhPlayerMgr = undefined;

    @property(BRgame)
    brGame: BRgame = undefined;

    @property(PokerGame)
    pkrGame: PokerGame = undefined;

    @property(BRplayers)
    brPlys: BRplayers = undefined;

    @property([cc.Node])
    private lhCards: cc.Node[] = []; // 龙虎牌

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
    private nRest: cc.Node = undefined;

    @property(cc.Node)
    private nodeVs: cc.Node = undefined;

    @property(cc.Node)
    private nOther: cc.Node = undefined;

    @property(sp.Skeleton)
    private spVs: sp.Skeleton = undefined;

    @property(cc.Prefab)
    private preEndBetting: cc.Prefab = undefined;

    @property(cc.Prefab)
    preAnimWin: cc.Prefab = undefined;

    @property(cc.Prefab)
    preParticle: cc.Prefab = undefined;

    @property(LhPlayer)
    fhPlayer: LhPlayer = undefined;// 富豪

    @property(LhPlayer)
    dsPlayer: LhPlayer = undefined;// 赌神


    @property(LhRecord)
    lhdzRecord: LhRecord = undefined;

    @property(LhTrend)
    lhdzTrend: LhTrend = undefined;

    msg: LhMsg;
    isExistFh: boolean;
    isExistDs: boolean;

    private canPlayCoinAudio = true;
    private coinAudioInterval = 0.1;

    private BET_TOTAL_TIME: number;                                             // 下注总时间
    private MAX_AREA_BET: string = "20000";                                     // 龙虎单区域最大下注额
    private MAX_SPECIAL_AREA_BET: string = "20000";                             // 特殊单区域最大下注额
    MIN_BET: string = "50";                                                     // 最小可下注额

    private dsLogoPoss: cc.Vec2[] = [];                                         // 赌神在各区域的标志

    private _currBetArea: number;
    private _currBetPoint: number;
    private _totalBets: string[];
    private _selfBets: string[];
    private _beforeBettingMoney: string;                                        // 下注之前自己的金额

    private _otherPos: cc.Vec2;

    private _records: number[] = [];
    setRecords(re: number[], isStation = false) {
        this._records = re;
        this.lhdzRecord.setRecord(this._records);
        this.lhdzTrend.setRecord(this._records, isStation);
    }
    get records() {
        return this._records;
    }

    onLoad() {
        for (let idx = 0; idx < this.dsBetLogos.length; idx++) {
            const logo = this.dsBetLogos[idx];
            logo.zIndex = 1;
            this.dsLogoPoss[idx] = logo.getPosition();
        }
        for (let i = 0; i < 2; i++) {
            let card = this.pkrGame.getPoker(0);
            card.setPosition(0, 0);
            card.name = 'card';
            this.lhCards[i].addChild(card);
        }

        super.onLoad();
        this._otherPos = this.nOther.convertToWorldSpaceAR(cc.v2(0, 0));
    }

    initRound(): void {
        // console.log("初始化一局");
        this.betTimePanel.active = false;
        // this.spVs.node.active = false;

        this.cleanBet();
        this.hideAllPanel();
        this.brGame.setWaitTips(false);
        this.brGame.hideBet();

        this._currBetArea = undefined;
        this.setRestShow(false);
        this.setVsShow(false);
        this.plyMgr.initBets();
        if (this.fhPlayer) this.fhPlayer.initBets();
        if (this.dsPlayer) this.dsPlayer.initBets();

        // 遮牌
        this.lhCards.forEach(card => {
            let c = card.getChildByName('card');
            c.stopAllActions();
            this.pkrGame.showFront(c, false);
        })
    }

    initGame(): void {
        this.msg = new LhMsg(this);
        this.msg.init();
        this.lhdzTrend.hide();
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
                // console.log("下注状态");
                this.beginBet();
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
            case GameStatus.STATUS_BALANCE:
                // console.log("结算状态");
                this.brGame.hideBet();
                break;
        }
        this.menu.hideChangeBtn();
    }
    dealRoomData(data: ps.GameRoomHandlerGetRoomData) {
        let config = toj<iConfig>(data.config)
        this.BET_TOTAL_TIME = config.betTime;
        this.MAX_AREA_BET = config.areaMaxMoney;
        this.MAX_SPECIAL_AREA_BET = config.areaTieMaxMoney;
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

    beginBet() {
        this.setVsShow(false);
        this.adoMgr.playStartBet();

        this.betTimePanel.active = true;
        this.setAllowBet();

        let selfPlayer = this.plyMgr.me;
        if (selfPlayer && (selfPlayer.money !== undefined)) {
            this._beforeBettingMoney = selfPlayer.money;
        }
    }

    /**
     * 休息时间
     * @param active
     */
    setRestShow(active: boolean) {
        this.nRest.active = active;
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

    setGameStart() {
        this.playVsAnim();
        this.lhdzTrend.isTouchNext = true;
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
     * 开牌
     * @param cardsInfo
     */
    async setRedBlackCards(cardsInfo: number[]) {
        this.adoMgr.playShow();
        await this.playAnim(this.preEndBetting);
        await this.drawCards(cardsInfo);
    }

    quickShowCards(cardsInfo: number[]) {
        this.drawCards(cardsInfo, true);
    }

    /**
     * 翻牌动作
     * @param cardsInfo
     * @param isQuick
     */
    async drawCards(cardsInfo: number[], isQuick: boolean = false) {
        for (let idx = 0; idx < cardsInfo.length; idx++) {
            const info = cardsInfo[idx];
            let nodeCard = this.lhCards[idx].getChildByName('card');
            nodeCard.active = true;

            await this.pkrGame.lhTurnAnim(nodeCard, info, !isQuick, 1);
            if (!isQuick) {
                this.adoMgr.playPoint(info);
            }
        }
    }

    /**
     * 用户下注
     * @param rPos
     * @param area
     * @param bets
     */
    userDoBets(rPos: number, area: number, bets: string) {
        let player: LhPlayer = this.getBetPlayer(rPos);
        let playerPos: cc.Vec2;
        if (player) {
            if (new Decimal(player.money).sub(bets).lt(0)) return;

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
                    this.setAllowBet();
                }
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
        let jump = cc.jumpTo(1, this.dsLogoPoss[areaIdx], 50, 1);
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
    getBetPlayer(rPos: number): LhPlayer | undefined {
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
            // console.log("获取大富豪 = " + this.isExistFh);
            return this.fhPlayer;
        }
        return undefined;
    }

    /**
     * 玩家最终结算动画
     * @param winArea
     * @param plys
     */
    async balanceAnim(winArea: number, plys: ps.Lh_EnterBalance_Info[]) {
        this.brGame.setAreaEff(winArea);
        // 筹码飞向胜利区域
        let tbPlyInfos: ps.Lh_EnterBalance_Info[] = [];
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
                        for (let area = Area.Dragon; area <= Area.Peace; area++) {
                            let bets = betInfos[area];
                            if (area === winArea || winArea === Area.Peace) {
                                this.brGame.chipFlyPly(area, pWorld, +bets);
                            }
                        }
                        this.playWinAnim(player);
                    }
                    // 计算玩家最后的金额时，桌子上的玩家要把下注的金额补回来
                    let betInfos = player.areaBetInfos;
                    let beforeBet = new Decimal(player.money).add(finalChg);
                    for (let area = Area.Dragon; area <= Area.Peace; area++) {
                        if (betInfos[area]) beforeBet = beforeBet.add(betInfos[area]);
                    }
                    player.money = beforeBet.toString();
                }
            });
        }

        // 再把桌上剩下的筹码飞向其他玩家
        for (let area = Area.Dragon; area <= Area.Peace; area++) {
            //this.brGame.chipFlyPly(area, this._otherPos);
            this.brGame.chipFlyPlyOther(area, this.nOther.position);
        }

        await new Promise(resolve => {
            this.scheduleOnce(() => { resolve() }, 0.8);
        });;
        this.adoMgr.playWinArea(winArea)
        this.adoMgr.playWinBet();

        // 刷新玩家的金币、展示输赢
        if (tbPlyInfos.length > 0) {
            tbPlyInfos.forEach(plyIf => {
                let ply = this.getBetPlayer(plyIf.pos);
                ply.updateMoney();
                if (!zero.eq(plyIf.chgMoney) || winArea === Area.Peace) {
                    ply.showWinOrLost(plyIf.chgMoney);
                }

                // 玩家金额不足则替换掉
                if (!ply.isMe && new Decimal(ply.money).sub(this.MIN_BET).lessThanOrEqualTo(0)) {
                    this.plyMgr.setPlyLeave(ply.pos);
                }
            });
        }
        this.updateTbPlys();
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

    updateTbPlys() {
        this.plyMgr.setBigRegalGambleGodPos();
    }

    onClickTrend() {
        this.lhdzTrend.show();
    }

    onClickOther() {
        this.brPlys.show(this.plyMgr.getAllPlayerInfo());
    }

    // ----------------------------------区域效果
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
            logo.setPosition(this.dsLogoPoss[idx]);
            logo.active = false;
        }
    }

    //--------------------------------------下注区域
    /**
     * 选择下注区域
     * @param ev
     * @param idx
     */
    private onClickArea(idx: number) {
        if (this.gameState === GameStatus.STATUS_BET) {
            if (this._currBetPoint) {
                // 不能龙虎区域同时下注
                if (this._currBetArea !== undefined && idx !== Area.Peace && idx !== this._currBetArea) {
                    showTip("不能在龙虎区域同时下注哦～");
                    return false;
                }

                // 不能大于该区域的最大下注额
                let currMaxBet = new Decimal(this._selfBets[idx]).add(this._currBetPoint);
                let maxBet = (Area.Peace === idx) ? this.MAX_SPECIAL_AREA_BET : this.MAX_AREA_BET;
                if (currMaxBet.gt(maxBet)) {
                    showTip("下注额超过下注上限～");
                    return false;
                }

                let player = this.plyMgr.me;
                if (new Decimal(player.money).sub(this._currBetPoint).gte(0)) {
                    this.msg.sendDoBets(idx, this._currBetPoint);
                    this.brGame.chipFlyArea(idx, player.convertToWorldPos(), this._currBetPoint);
                    this.adoMgr.playDoBeting();
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
        if (!this._selfBets) return cc.error("this._selfBetMoneyArr is null");
        if (!bet) return cc.warn("bet value not exist or equal zero!")
        if (area !== Area.Peace) this._currBetArea = area;   // 记录自己龙虎下注区域
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
    private onClickBet(idx: number) {
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
    async playWinAnim(player: LhPlayer) {
        let anim = <cc.Node>cc.instantiate(this.preAnimWin);
        this.nodeAnimation.addChild(anim);
        anim.setPosition(player.convertToNodePos(this.nodeAnimation));
        anim.setPosition(anim.position.x, anim.position.y + 20);
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
        // this.adoMgr.playVsSound();
    }
}
