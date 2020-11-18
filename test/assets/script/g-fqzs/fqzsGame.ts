import FQZSPlayerMgr from "./fqzsPlayerMgr";
import FQZSPlayer from "./fqzsPlayer";
import FQZSAudio from "./fqzsAudio";
import FQZSRecord from "./fqzsRecord";
import FQZSTrend from "./fqzsTrend";
import FQZSMsg from "./fqzsMsg";

import BRgame from "../g-br/brGame";
import BRplayers from "../g-br/brOtherPlys";
import Game from "../g-share/game";


import { toj } from "../common/util";
import { showTip } from "../common/ui";
import { FQZSGameState, FQZSArea, GetAnimalArea, RoundId } from "./fqzsConf";
import { FQZSRound } from "./fqzsRound"
import * as speedUtil from "./SpeedUtil"
import { FQZSTrendData } from "./fqzsTrendData"
import { EventCenter } from "./EventManager";

let Decimal = window.Decimal;
interface iConfig {
    areaMaxMoney: string,//
    allowBetMinMoney: string,//
    betList?: string[]//筹码列表
}

const { ccclass, property } = cc._decorator;
@ccclass
export default class FQZSGame extends Game {
    @property({ type: FQZSAudio, override: true })
    adoMgr: FQZSAudio = undefined;

    @property({ type: FQZSPlayerMgr, override: true })
    plyMgr: FQZSPlayerMgr = undefined;

    @property(BRgame)
    brGame: BRgame = undefined;


    @property(BRplayers)
    brPlys: BRplayers = undefined;

    @property(FQZSRound)
    roundMgr: FQZSRound = undefined;

    @property(cc.Prefab)
    startBetAnimation: cc.Prefab = null;

    @property(cc.Prefab)
    stopBetAnmiation: cc.Prefab = null;

    @property(cc.Prefab)
    vsSpine: cc.Prefab = null;

    @property(cc.Label)
    private noGoldTips: cc.Label = undefined;

    @property(cc.Node)
    private betTimePanel: cc.Node = undefined;


    @property(cc.Node)
    private nOther: cc.Node = undefined;

    @property(cc.Prefab)
    preAnimWin: cc.Prefab = undefined;

    @property(cc.Prefab)
    preParticle: cc.Prefab = undefined;

    @property(FQZSPlayer)
    fhPlayer: FQZSPlayer = undefined;// 富豪

    @property(FQZSPlayer)
    dsPlayer: FQZSPlayer = undefined;// 赌神

    @property(FQZSRecord)
    fqzsRecord: FQZSRecord = undefined;

    @property(FQZSTrend)
    fqzsTrend: FQZSTrend = undefined;

    @property(cc.Node)
    private btn_rebet: cc.Node = null;
    @property(cc.Node)
    private dupTips: cc.Node = null;

    @property([cc.Node])
    private dsBetLogos: cc.Node[] = [];// 赌神下注区域

    @property([cc.Label])
    private totalAreaBets: cc.Label[] = [];

    @property([cc.Label])
    private selfAreaBets: cc.Label[] = [];



    msg: FQZSMsg;
    isExistFh: boolean;
    isExistDs: boolean;

    private canPlayCoinAudio = true;
    private coinAudioInterval = 0.1;


    private MAX_AREA_BET: any = null;                                     // 单区域最大下注额

    MIN_BET: string = "50";                                                     // 最小可下注额

    private dsLogoPosArr: cc.Vec2[] = [];                                       // 赌神在各区域的标志
    private _otherPos: cc.Vec2;

    private _currBetPoint: number;
    private _totalBets: string[];
    private _selfBets: string[];
    private _beforeBettingMoney: string;                                        // 下注之前自己的金额
    private _canRebet: boolean;
    private hasDupBet: boolean;
    private _records: ps.Fqzs_GameInfo_WinInfo[] = [];

    setRecords(re: ps.Fqzs_GameInfo_WinInfo[], animals: ps.Fqzs_GameInfo_AnimalStatis[], typeData: ps.Fqzs_GameInfo_CategoryStatis[]) {
        let records = re ? re : [];
        this._records = records;
        this.fqzsRecord.setRecord(this._records);
        FQZSTrendData.Instance.setRecords(this._records, animals, typeData);

    }
    addRecord(record: ps.Fqzs_GameInfo_WinInfo, showEnd: boolean = true) {
        FQZSTrendData.Instance.addRecord(record);
    }
    /**
     *更新走势图
     * @param isGaming 是否正常游戏，正常游戏添加单次游戏结果做延迟操作
     */
    updateRecord(isGaming: boolean = false) {
        this.fqzsRecord.setRecord(this._records);
        this.fqzsRecord.updateRecord();

        if (isGaming) {
            console.log("显示最后")
            FQZSTrendData.Instance.noticeUpdate()
        } else {
            console.log("不显示最后")
            FQZSTrendData.Instance.noticeUpdateLastJu();
        }
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
        // this.btn_rebet.active = false;
        this._canRebet = false;
        this.hasDupBet = false;
        super.onLoad();
        this._otherPos = this.nOther.convertToWorldSpaceAR(cc.v2(0, 0));
        // cc.game.on(cc.game.EVENT_HIDE, function () {
        //     console.log("游戏进入后台");
        //     this.onHideGame();//处理游戏切到后台时的事件
        // }, this);
        EventCenter.instance.addListener("onChooseIndex", this.onTarGetChoose, this);
        cc.game.on(cc.game.EVENT_SHOW, function () {
            console.log("重新返回游戏");
            //this.onShowGame();//处理游戏切回前台时的事件
            setTimeout(() => {
                this.updateRecord()
            }, 100);
        }, this);

    }
    onDestroy() {
        EventCenter.instance.removeListener('onChooseIndex', this)
        FQZSTrendData.release();
    }
    initRound(): void {
        console.log("---------initRound-------")

        this.adoMgr.stopOpenPrize();
        this.betTimePanel.active = false;

        this.cleanBet();
        this.brGame.hideBet();
        this.hideAllPanel();
        this.brGame.setWaitTips(false);

        this.plyMgr.initBets();
        if (this.fhPlayer) this.fhPlayer.initBets();
        if (this.dsPlayer) this.dsPlayer.initBets();


    }

    initGame(): void {
        // console.log("初始化 init ");
        this.msg = new FQZSMsg(this);
        this.msg.init();
        this.fqzsTrend.hide();
        this.brPlys.showDs = true;
        this.brPlys.hide();
        this.fhPlayer.init(this);
        this.dsPlayer.init(this);
    }

    onTarGetChoose() {
        this.adoMgr.playRound2();
    }
    changeState(s: number, left?: number) {
        super.changeState(s);
    }

    updateUI(): void {
        switch (this.gameState) {
            // 等待开始
            case FQZSGameState.STATUS_WAIT:
                this.brGame.hideBet();
                this.hideTicker();
                // console.log("等待状态");
                break;
            //开始动画
            case FQZSGameState.STATUS_START:
                console.log("开始动画");
                this.brGame.cleanUpChip();//清空所有筹码
                this.adoMgr.playStart();
                //this.setVsShow(true);
                this.betTimePanel.active = false;
                this.brGame.hideBet();
                this.setGameStart();

                break;
            // 下注
            case FQZSGameState.STATUS_BET:
                // console.log("下注状态");
                this.beginBet();
                break;
            // 结算
            case FQZSGameState.STATUS_RESULT:
                // console.log("结算状态");
                this.hideTicker();
                this.brGame.hideBet();
                break;
        }
        this.menu.hideChangeBtn();
    }

    dealRoomData(data: ps.GameRoomHandlerGetRoomData) {
        let config = toj<iConfig>(data.config)
        this.MAX_AREA_BET = config.areaMaxMoney;
        //console.log("最大下注配置：", this.MAX_AREA_BET);
        this.MIN_BET = config.allowBetMinMoney;

        this.brGame.setChipPoint(config.betList ? config.betList : ["1", "10", "50", "100", "500"]);
        this.brGame.clickBetLsr = this.onClickBet.bind(this);
        this.brGame.clickAreaLsr = this.onClickArea.bind(this);
        this.initRound();
    }


    setNoGoldTips(str?: string) {
        this.noGoldTips.node.active = !!str;
        this.noGoldTips.string = str ? str : "";
    }


    setGameStart() {
        this.playVsAnim();
        this.stopRoundAnimation()
        this.fqzsTrend.isTouchNext = true;
        // this.plyMgr.setBigRegalGambleGodPos();
        this.setMeLooker(true);
    }

    stopRoundAnimation() {
        if (this._records.length > 0) {
            //console.log("停止动画--round")
            this.roundMgr.stopAllAnimation(this._records[this._records.length - 1].stopIcon)
        }
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
        //this.setVsShow(false);
        this.adoMgr.playStartBet();

        this.betTimePanel.active = true;
        this.setAllowBet();

        this._beforeBettingMoney = this.plyMgr.me.money;
    }




    /**
     * 用户下注
     * @param rPos
     * @param area
     * @param bets
     */
    userDoBets(rPos: number, area: number, bets: string) {
        let player: FQZSPlayer = this.getBetPlayer(rPos);
        let playerPos: cc.Vec2;
        if (player) {
            if (new Decimal(player.money).sub(bets).lessThan(0)) return;
            player.doBet(area, bets);
            let selfBalance = new Decimal(player.money);
            if (player.isMe) {
                //console.log("自己下注的位置", area);
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
            if (player.isMe) {
                this.brGame.showHideChooseLight(area + "", true);
            }
        } else {
            // if (Math.random() < 0.5) {
            //     return;
            // }
            playerPos = this._otherPos;
        }
        this.brGame.chipFlyArea(area, playerPos, +bets);
        if (!player) {
            if (this.canPlayCoinAudio) {
                this.adoMgr.playBet();
                this.canPlayCoinAudio = false;
                this.scheduleOnce(() => {
                    this.canPlayCoinAudio = true;
                }, this.coinAudioInterval);
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
    getBetPlayer(rPos: number): FQZSPlayer | undefined {
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
    async balanceAnim(winLoseInfo: ps.Fqzs_EnterResult_WinInfo, plys: ps.Fqzs_EnterResult_PlayerInfo[]) {
        let winArea = GetAnimalArea(winLoseInfo.animal)
        // let isWinShape = winLoseInfo.winShape > Shape.ShapePoint ? true : false;
        if (!plys) {
            return;
        }

        // 筹码飞向胜利区域
        let tbPlyInfos: ps.Fqzs_EnterResult_PlayerInfo[] = [];
        let zero = new Decimal(0);
        if (plys && plys.length > 0) {
            plys.forEach(plyIf => {
                // 同步玩家数据、总下注额、连胜次数
                let finalChg = plyIf.winMoney;
                this.plyMgr.updatePlyBets(plyIf.pos, finalChg, plyIf.totalBets, plyIf.winCnt);

                let player = this.getBetPlayer(plyIf.pos);
                if (player) {
                    tbPlyInfos.push(plyIf);
                    let pWorld = player.convertToWorldPos();
                    if (zero.lt(finalChg)) {
                        // 先根据玩家赢的钱生存筹码飞向玩家
                        let betInfos = player.areaBetInfos;
                        for (let area = FQZSArea.Chicken; area <= FQZSArea.Shark; area++) {
                            let bets = betInfos[area];
                            for (let i = 0; i < winArea.length; i++) {
                                if (area === winArea[i]) {
                                    this.brGame.chipFlyPly(area, pWorld, +bets);
                                }
                            }
                        }
                        this.playWinAnim(player);
                    }
                    // 计算玩家最后的金额时，桌子上的玩家要把下注的金额补回来
                    let betInfos = player.areaBetInfos;
                    let beforeBet = new Decimal(player.money).add(finalChg);
                    for (let area = FQZSArea.Chicken; area <= FQZSArea.Shark; area++) {
                        if (betInfos[area]) beforeBet = beforeBet.add(betInfos[area]);
                    }
                    player.money = beforeBet.toString();
                }
            });
        }

        // 再把桌上剩下的筹码飞向其他玩家
        for (let area = FQZSArea.Chicken; area <= FQZSArea.Shark; area++) {
            this.brGame.chipFlyPly(area, this._otherPos);
            //this.brGame.chipFlyPlyOther(area, this.nOther.position);
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
                //如果没有下注，则不显示数字动画
                if (plyIf.isBet > 0) {
                    ply.showWinOrLost(plyIf.winMoney);
                }
                // 玩家金额不足则替换掉
                if (!ply.isMe && new Decimal(ply.money).sub(this.MIN_BET).lessThanOrEqualTo(0)) {
                    this.plyMgr.setPlyLeave(ply.pos);
                }
            });
        }
        this.plyMgr.setBigRegalGambleGodPos();
    }

    setTimer(time: number) {
        if (this.gameState === FQZSGameState.STATUS_BET) {
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
            node.runAction(actions);
            //cc.tween(node).then(actions).start();
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
            node.runAction(actions);
            //cc.tween(node).then(actions).start();
        }
    }

    onClickTrend() {
        this.fqzsTrend.show();
    }

    onClickOther() {
        this.brPlys.show(this.plyMgr.getAllPlayerInfo());
    }
    onClickRBet() {
        if (this._canRebet)
            this.msg.sendDupBet();
        else if (this.hasDupBet) {
            showTip("这局已经续压过了哦～!");
        }
        else {
            showTip("无法续压!");
        }
    }

    showDupBet(show: boolean, hasDupBet: boolean = false) {
        if (this.btn_rebet) {
            //console.log("是否显示续压===", show)
            // this.btn_rebet.getComponent(cc.Button).interactable = !!show;
            // this.btn_rebet.active = !!show;
        }
        this.hasDupBet = hasDupBet;
        this._canRebet = !!show;
    }
    showDupBetState(show: boolean = false) {
        if (this.dupTips) {
            this.dupTips.active = !!show;
            if (show) {
                this._currBetPoint = undefined;
                this.brGame.setAllowBet(0);
                this.brGame.setBetLight(-1);
                //this.brGame.hideBet();
            }
        }
    }

    // ----------------------------------区域效果
    async setWinAreaEff(iconIndex: number) {
        //console.log("停止的位置===", iconIndex);
        let areas = iconIndex === undefined ? [] : GetAnimalArea(RoundId[iconIndex].type)
        if (areas.length <= 0) return;
        await this.brGame.setAreaEffArr(areas)
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
        if (this.gameState === FQZSGameState.STATUS_BET) {
            this.showDupBet(false, this.hasDupBet);//点击下注就不能续压了
            if (this._currBetPoint) {
                // // 不能大于该区域的最大下注额
                let currMaxBet = new Decimal(this._selfBets[areaIdx]).add(this._currBetPoint);
                let maxBet = this.MAX_AREA_BET[areaIdx].maxMoney;
                if (currMaxBet.gt(maxBet)) {
                    showTip("下注额超过下注上限～");
                    return false;
                }

                let player = this.plyMgr.me;
                if (new Decimal(player.money).sub(this._currBetPoint).gte(0)) {
                    this.msg.sendDoBets(areaIdx, this._currBetPoint);
                    //this.brGame.chipFlyArea(areaIdx, player.convertToWorldPos(), this._currBetPoint);
                    //this.adoMgr.playBet();
                    return true;
                } else {
                    showTip("金币不足～");
                }
            } else {
                showTip(`金币不足${this.MIN_BET}不能下注，请您充值～`);
            }
        } else {
            //console.log("非下注时间");
            showTip("非下注时间");
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
        this._selfBets[area] = new Decimal(this._selfBets[area]).add(bet).toString();
        let labArea = this.selfAreaBets[area];
        labArea.string = this._selfBets[area];
        labArea.node.getParent().active = true;
        this.brGame.showHideChooseLight(area + "", true)
        this.setMeLooker(false);
    }

    //---------------------------------------- 己方筹码
    /**
     * 选择筹码
     */
    private onClickBet(idx: string) {
        this._currBetPoint = +this.brGame.chipPoints[idx];
        return this.gameState === FQZSGameState.STATUS_BET;
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
        this._totalBets = ["0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0"];
        for (const lab of this.totalAreaBets) {
            lab.string = "0";
        }
        this.cleanSelfBet();
    }

    private cleanSelfBet() {
        this._selfBets = ["0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0"];
        for (const lab of this.selfAreaBets) {
            lab.string = "0";
            lab.node.getParent().active = false;
        }
    }

    // --------------------------动画
    async playWinAnim(player: FQZSPlayer) {
        let anim = <cc.Node>cc.instantiate(this.preAnimWin);
        this.nodeAnimation.addChild(anim);
        anim.setPosition(player.convertToNodePos(this.nodeAnimation));

        let nodeParticle = cc.instantiate(this.preParticle);
        anim.addChild(nodeParticle);
        await this.playAnim(anim);

        anim.removeAllChildren();
        anim.removeFromParent();
    }

    playVsAnim(start: boolean = true) {
        // //console.log("播放开始动画");
        // this.playAnim(this.vsSpine);
        //this.vsSpine.
    }

    showBetAnimation(startBit?: boolean) {
        if (startBit) {
            this.playAnim(this.startBetAnimation);
        } else {
            this.playAnim(this.stopBetAnmiation);
            this.adoMgr.playStopBet();
        }
    }

    async playRoundAnimationNomal(data: ps.FQZS_EnterResult) {
        this.stopAllAnimation(data.info.startIcon);
        this.roundMgr.setAnimationClip()

        // this.adoMgr.playRound();

        this.adoMgr.stopRound();
        //let startTime = Date.now();
        //一阶段动画
        await this.roundMgr.startRoundAni(data.info.startIcon);
        //let firstTime = Date.now();
        //console.log("开始到加速最大保持(秒)====>", (firstTime - startTime) / 1000);
        //二阶段动画
        await this.roundMgr.stopRoundAnmation(data.info.stopIcon);
        //let secondTime = Date.now();
        //console.log("减速到停止(秒)====>", (secondTime - firstTime) / 1000);
        //console.log("动画阶段耗时(秒)===>", (secondTime - startTime) / 1000)s
        //三阶段动画
        await this.setWinAreaEff(data.info.stopIcon)
        //let threeTime = Date.now();
        //console.log("闪嗦耗时(秒)===>", (threeTime - secondTime) / 1000)

        //console.log("-----------------正常动画添加--------------------")
        this.updateRecord(true);
        //console.log("开始飞筹码")
        //四阶段动画
        this.balanceAnim(data.info, data.players);
    }
    /**
     *
     * @param startIndex 停止所以的动画
     */
    stopAllAnimation(startIndex: number) {
        this.roundMgr.stopAllAnimation(startIndex);

    }

    /**
     * 断线重连进入结算状态调用的动画
     * @param animationState  当前动画阶段
     * @param data   数据
     * @param isDellme  是否下注
     */
    async playRoundAnimationNew(animationState: speedUtil.AnmationState, data: ps.FQZS_GameInfo, isDellme: boolean) {
        console.log('-------------------中途进入')
        if (!data.winRecords || data.winRecords.length <= 0) {
            console.warn("断线重连进来的不是结算状态");
            return;
        }
        //通过时间来判断当前的动画状态是在哪个阶段
        let curRecord = data.winRecords[data.winRecords.length - 1]
        let winlossInfo: ps.Fqzs_EnterResult_WinInfo = { animal: curRecord.animal, startIcon: curRecord.startIcon, stopIcon: curRecord.stopIcon }
        let playerWinInfo: ps.Fqzs_EnterResult_PlayerInfo[] = []
        if (!data.players || data.players.length <= 0) return;
        for (let i = 0; i < data.players.length; i++) {
            playerWinInfo.push({ pos: data.players[i].pos, isBet: data.players[i].isBet, winCnt: data.players[i].winCnt, winMoney: data.players[i].winMoney, totalBets: data.players[i].totalBet })
        }
        //本次的结果要加入，因为进入这个函数前，去掉了最后一个结果
        this.addRecord(curRecord);

        this.adoMgr.stopRound();
        console.log("-----------------断线重连动画添加--------------------")
        if (animationState === speedUtil.AnmationState.FirstAnimation) {
            console.log("第一阶段动画开始");
            this.adoMgr.playRound();
            this.stopAllAnimation(data.curIcon);
            this.roundMgr.setAnimationClip()
            //一阶段动画
            await this.roundMgr.startRoundAni(data.curIcon);
            //二阶段动画
            await this.roundMgr.stopRoundAnmation(curRecord.stopIcon);
            //三阶段动画
            await this.setWinAreaEff(curRecord.stopIcon)
            this.updateRecord(true);
            //四阶段动画
            this.balanceAnim(winlossInfo, playerWinInfo);
        } else if (animationState === speedUtil.AnmationState.SecondAnimation) {
            console.log("第二阶段动画开始");
            this.adoMgr.playRound();
            this.stopAllAnimation(data.curIcon);
            this.roundMgr.setAnimationClip()
            //二阶段动画
            await this.roundMgr.stopRoundAnmation(curRecord.stopIcon);
            //三阶段动画
            await this.setWinAreaEff(curRecord.stopIcon)
            this.updateRecord(true);
            //四阶段动画
            this.balanceAnim(winlossInfo, playerWinInfo);
            this.adoMgr.stopRound();
        } else if (animationState === speedUtil.AnmationState.ThreeAnimation) {
            console.log("第三阶段动画开始");
            this.adoMgr.playRound();
            //三阶段动画
            await this.setWinAreaEff(curRecord.stopIcon)
            this.updateRecord(true);
            //四阶段动画
            this.balanceAnim(winlossInfo, playerWinInfo);
            this.adoMgr.stopRound();
        } else if (animationState === speedUtil.AnmationState.OtherAnimation) {
            console.log("第四阶段动画开始");
            this.updateRecord(true);
            //四阶段动画
            this.balanceAnim(winlossInfo, playerWinInfo);
        } else {
            console.log("无结算动画已处理");
        }
    }

    getAnimationState(leaveTime: number) {
        let timeb = speedUtil.otherAnimationTime;
        if (leaveTime < timeb) {
            return speedUtil.AnmationState.NoneAnimation;
        }
        timeb += speedUtil.threeAnimationTime
        if (leaveTime < timeb) {
            return speedUtil.AnmationState.OtherAnimation
        }
        timeb += speedUtil.secondAnmationTime
        if (leaveTime < timeb) {
            return speedUtil.AnmationState.ThreeAnimation
        }
        timeb += speedUtil.firstAnimationTime
        if (leaveTime < timeb) {
            return speedUtil.AnmationState.SecondAnimation
        }
        return speedUtil.AnmationState.FirstAnimation
    }
    setDefaultChooseIndex(inx: number) {
        this.roundMgr.setStartItem(inx);
    }

}
