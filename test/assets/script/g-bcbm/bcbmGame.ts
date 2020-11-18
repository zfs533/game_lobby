
import BCBMPlayerMgr from "./bcbmPlayerMgr";
import BCBMPlayer from "./bcbmPlayer";
import BCBMAudio from "./bcbmAudio";
import BCBMRecord from "./bcbmRecord";
import BCBMTrend from "./bcbmTrend";
import BCBMMsg from "./bcbmMsg";
import BCBMSpeed from "./bcbmSpeedNode";

import BRgame from "../g-br/brGame";
import BRplayers from "../g-br/brOtherPlys";
import Game from "../g-share/game";
import PokerGame from "../g-share/pokerGame";

import { toj } from "../common/util";
import { showTip, showConfirm } from "../common/ui";
import { BCBMGameStatus, BetAreaType, genAreaLoctions } from "./bcbmEnum";
import g from "../g";
import { GameId } from "../common/enum";
import BCBMCar from "./bcbmCar";
import BCBMPath from "./bcbmPath";
import BCBMEnd from "./bcbmEnd";

let Decimal = window.Decimal;

interface iConfig {
    betTime: number,
    areaMaxMoney: string,
    areaSpecialMaxMoney: string,
    betList: string[],
    allowBetMinMoney: string,
}


const { ccclass, property } = cc._decorator;

@ccclass
export default class BCBCGame extends Game {
    @property({ type: BCBMAudio, override: true })
    adoMgr: BCBMAudio = undefined;

    @property({ type: BCBMPlayerMgr, override: true })
    plyMgr: BCBMPlayerMgr = undefined;

    @property([cc.Label])
    private totalAreaBets: cc.Label[] = [];

    @property([cc.Label])
    private selfAreaBets: cc.Label[] = [];

    @property(BRgame)
    brGame: BRgame = undefined;

    @property(BCBMPlayer)
    fhPlayer: BCBMPlayer = undefined;// 富豪

    @property(BCBMPlayer)
    dsPlayer: BCBMPlayer = undefined;// 赌神

    @property(cc.Label)
    private noGoldTips: cc.Label = undefined;

    @property(cc.Node)
    private nOther: cc.Node = undefined;

    @property([cc.Node])
    private dsBetLogos: cc.Node[] = [];// 赌神下注区域

    @property(cc.Node)
    private betTimePanel: cc.Node = undefined;

    @property(BRplayers)
    brPlys: BRplayers = undefined;

    @property(cc.Prefab)
    preAnimWin: cc.Prefab = undefined;

    @property(cc.Prefab)
    preParticle: cc.Prefab = undefined;

    @property(BCBMCar)
    bcbmCar: BCBMCar = undefined;
    @property(BCBMPath)
    bcbmPath: BCBMPath = undefined;

    @property(BCBMRecord)
    bcbmRecord: BCBMRecord = undefined;

    @property(BCBMTrend)
    bcbmTrend: BCBMTrend = undefined;

    @property(cc.Node)
    choumaNode: cc.Node = undefined;

    @property(BCBMSpeed)
    bcbmSpeed: BCBMSpeed = undefined;

    @property(cc.Prefab)
    private preEndBetting: cc.Prefab = undefined;
    @property(cc.Prefab)
    private preStartBetting: cc.Prefab = undefined;

    @property(cc.Node)
    redlvdeng: cc.Node = undefined;

    @property(cc.Node)
    timeNode: cc.Node = undefined;

    @property(cc.Node)
    continueBtn: cc.Node = undefined;

    @property(cc.Node)
    private panelEnd: cc.Node = undefined;










    msg: BCBMMsg;
    private _totalBets: string[];
    isExistFh: boolean;
    isExistDs: boolean;
    private _selfBets: string[];
    /* 续压 */
    public forwardMyBets: ps.BetInfo[] = [];
    private _currBetArea: number;
    private _currBetPoint: number;
    MIN_BET: string = "50";
    private canPlayCoinAudio = true;
    private coinAudioInterval = 0.1;
    private _otherPos: cc.Vec2;
    private dsLogoPosArr: cc.Vec2[] = [];
    private MAX_AREA_BET: string = "20000";                                     // 红黑单区域最大下注额
    private MAX_SPECIAL_AREA_BET: string = "20000";
    gameName: GameId.BCBM;
    public isCanContinue: boolean = false;
    public reConnectData: ps.gameInfoData;//断线重连数据
    public isClickedContnue: boolean = false;

    /* 是否已经下过注，用于处理第一次就输掉一大半，导致金币不足的提示 */
    public isDobets: boolean = false;


    onLoad() {
        for (let idx = 0; idx < this.dsBetLogos.length; idx++) {
            const logo = this.dsBetLogos[idx];
            logo.zIndex = (1);
            this.dsLogoPosArr[idx] = logo.getPosition();
        }
        super.onLoad();
        this._otherPos = this.nOther.convertToWorldSpaceAR(cc.v2(0, 0));

        setTimeout(() => {
            let list = genAreaLoctions();
            this.plyMgr.setBigRegalGambleGodPos();
            this.bcbmPath.setCarLog(list);
            /* 玩家进来的时候正在跑车阶段处理 */
            let data = this.reConnectData;
            if (data && data.status == BCBMGameStatus.DEAL) {
                let dt: ps.enterDealData = { time: data.leftTime, loc: data.loc, area: data.area, status: data.status };
                if (data.leftTime > 7) {
                    this.handleBcbmCar(dt);
                }
                else if (data.leftTime > 4) {
                    this.handleBcbmCar(dt, true);
                }
            }
        }, 500);
    }

    public playAnima(node: any) {
        this.playAnim(node, true);
    }

    async changeState(s: number, left?: number) {
        super.changeState(s);
        this.showContinueBtn(false)
        switch (this.gameState) {
            //开始下注
            case BCBMGameStatus.BET:
                this.hidePanelEnd();
                this.playAnim(this.preStartBetting);
                let bol: boolean = false;
                for (let i = 0; i < this.brGame.lightAreas.length; i++) {
                    if (this.brGame.lightAreas[i].active) {
                        bol = true;
                    }
                }
                this.showContinueBtn(!bol);
                break;
            //停止下注
            case BCBMGameStatus.DEAL:
                if (left == 15) {
                    await this.playAnim(this.preEndBetting);
                }
                break;
            case BCBMGameStatus.BALANCE:
                this.isDobets = false;
            default: break;
        }
    }

    hidePanelEnd() {
        this.panelEnd.active = false;
    }

    /* ---------------------abstract function-------------------------- */
    /**
     * 游戏初始化
     */
    initGame(): void {
        this.msg = new BCBMMsg(this);
        this.msg.init();
        this.bcbmTrend.hide();
        this.brPlys.showDs = true;
        this.brPlys.hide();
        this.adoMgr.init();
        this.fhPlayer.init(this);
        this.dsPlayer.init(this);
        this.bcbmCar.init(this);
        this.bcbmSpeed.init(this);
        this.redlvdeng.active = false;
        this.choumaNode.y = 0;
        // this.showContinueBtn(false);
        this.hidePanelEnd();

        this.bcbmRecord.init();
        this.bcbmTrend.init();
    }

    // 游戏单独处理房间信息
    dealRoomData(data: ps.GameRoomHandlerGetRoomData) {
        let config = toj<iConfig>(data.config)
        this.MIN_BET = config.allowBetMinMoney;
        this.MAX_AREA_BET = config.areaMaxMoney;
        this.MAX_SPECIAL_AREA_BET = config.areaSpecialMaxMoney;
        this.brGame.setChipPoint(config.betList);
        this.brGame.clickBetLsr = this.onClickBet.bind(this);
        this.brGame.clickAreaLsr = this.onClickArea.bind(this);
        this._currBetPoint = +this.brGame.chipPoints[0];
        this.initRound();
        this.plyMgr.setBigRegalGambleGodPos();
    }

    /* 初始化一局游戏 */
    initRound(): void {
        this._currBetArea = undefined;
        this.showTimePanel(false);
        this.cleanBet();
        this.hideAllPanel();
        this.adoMgr.init();
        this.brGame.hideBet();
        this.plyMgr.initBets();
        this.brGame.setWaitTips(false);
        this.brGame.cleanUpChip();


        if (this.fhPlayer) this.fhPlayer.initBets();
        if (this.dsPlayer) this.dsPlayer.initBets();
    }

    updateUI(): void {
        switch (this.gameState) {
            // 下注
            case BCBMGameStatus.BET:
                this.beginBet();
                console.log("下注状态");
                break;
            case BCBMGameStatus.DEAL:
                this.adoMgr.playStopBet();
                break;
            // 展示结果
            case BCBMGameStatus.BALANCE:
                this.showTimePanel(false);
                this.brGame.hideBet();
                break;
            default: break;
        }
        this.menu.hideChangeBtn();
    }
    /* ---------------------abstract function end-------------------------- */
    setTimer(time: number) {
        if (this.gameState === BCBMGameStatus.BET) {
            this.showTicker(time, (num) => {
                if (num <= 3) {
                    this.adoMgr.playCarStart();
                    let scale1 = cc.scaleTo(0.1, 0.2);
                    let scale2 = cc.scaleTo(0.1, 0.4);
                    let sequence = cc.sequence(scale1, scale2);
                    cc.tween(this.timeNode).then(sequence).start();
                    // this.timeNode.runAction(sequence);

                    if (num == 3) {
                        this.redlvdeng.active = true;
                        this.playRedLvDengEffect();
                        this.bcbmCar.showStartEffect();
                    }
                }
            });
        }
        else {
            this.redlvdeng.active = false;
            this.hideTicker();
        }
    }

    playRedLvDengEffect() {
        let leftAnim = this.redlvdeng.getChildByName("bc_ef_hld1");//.getComponent(cc.Animation);
        this.playAnim(leftAnim, true);
        let rightAnim = this.redlvdeng.getChildByName("bc_ef_hld2");//.getComponent(cc.Animation);
        this.playAnim(rightAnim, true);
    }

    /**
     * 设置该区域所有的筹码
     */
    setTotalAreaMoney(area: number, bet: string, showDefaultClips = false) {
        if (!this._totalBets || new Decimal(bet).eq(0)) return;
        area = area - 1;
        this._totalBets[area] = new Decimal(this._totalBets[area]).add(bet).toString();
        this.totalAreaBets[area].string = this._totalBets[area];

        if (showDefaultClips) {
            this.brGame.setAreaMoney(area, +bet)
        }
    }

    /**
     * 用户下注
     * @param rPos
     * @param area
     * @param bets
     */
    userDoBets(rPos: number, area: number, bets: string) {
        area = area - 1;
        let player: BCBMPlayer = this.getBetPlayer(rPos);
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
                // return;
            }
            playerPos = this._otherPos;
            // 自己的话就不用再飞了
            if (!player || !player.isMe) {
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
     * 获取下注玩家
     */
    getBetPlayer(rPos: number): BCBMPlayer | undefined {
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
     * 设置该区域自己的筹码
     */
    setSelfAreaMoney(area: number, bet: number) {
        if (!this._selfBets) return;
        if (!bet) return cc.warn("bet value not exist or equal zero!");
        if (area !== BetAreaType.MIN) this._currBetArea = area;    // 记录自己红黑下注区域
        this._selfBets[area] = new Decimal(this._selfBets[area]).add(bet).toString();
        let labArea = this.selfAreaBets[area];
        labArea.string = this._selfBets[area];
        labArea.node.getParent().active = true;
        this.brGame.lightAreas[area].active = true;
        this.isDobets = true;
        this.showContinueBtn(false);
        this.setMeLooker(false);
    }
    async setGameStart() {
        // this.plyMgr.setBigRegalGambleGodPos();
        this.setMeLooker(true);
    }

    setMeLooker(isLooker: boolean) {
        let me = this.plyMgr.me;
        me.isLooker = isLooker;
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

        if (allowNum > 0 && this.brGame.getWaitTipsActive()) {
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

    setNoGoldTips(str?: string) {
        this.noGoldTips.node.active = !!str;
        this.noGoldTips.string = str ? str : "";
    }

    /**
    * 赌神下注
    * @param areaIdx
    */
    private dsLogoFly(areaIdx: number) {
        areaIdx = areaIdx;
        let areaLogo = this.dsBetLogos[areaIdx];
        console.log("赌神下注" + areaIdx + "--" + areaLogo.active);
        if (areaLogo.active) return;
        areaLogo.active = true;

        let playerNode = this.dsPlayer.node;
        let worldPos = playerNode.convertToWorldSpaceAR(cc.v2(0, 0));
        let dsAreaPos = areaLogo.getParent().convertToNodeSpaceAR(worldPos);
        let isDao: boolean = false;
        let motionStreakFunc = () => {
            if (isDao) { return; }
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
            isDao = true;
        }))
        // areaLogo.runAction(actions);
        cc.tween(areaLogo).then(actions).start();
        this.schedule(motionStreakFunc, 0.05, 20);
    }

    /**
     * 选择筹码
     */
    private onClickBet(idx: string) {
        this.adoMgr.playClick();
        this._currBetPoint = +this.brGame.chipPoints[idx];
        return this.gameState === BCBMGameStatus.BET;
    }

    /**
     * 选择下注区域
     * @param idx
     */
    private onClickArea(areaIdx: number) {
        if (this.gameState === BCBMGameStatus.BET && this.brGame.getWaitTipsActive()) {
            if (this._currBetPoint) {
                this.showContinueBtn(false);
                this._selfBets = this._selfBets || ["0", "0", "0", "0", "0", "0", "0", "0"];
                this._totalBets = this._totalBets || ["0", "0", "0", "0", "0", "0", "0", "0"];

                // 不能大于该区域的最大下注额
                let currMaxBet = new Decimal(this._selfBets[areaIdx]).add(this._currBetPoint);
                let maxBet = this.MAX_AREA_BET;

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
            showTip("非下注时间");
        }
        return false;
    }

    private cleanBet() {
        this._totalBets = ["0", "0", "0", "0", "0", "0", "0", "0"];
        for (const lab of this.totalAreaBets) {
            lab.string = "0";
        }
        this.cleanSelfBet();
    }

    private cleanSelfBet() {
        this._totalBets = ["0", "0", "0", "0", "0", "0", "0", "0"];
        this._selfBets = ["0", "0", "0", "0", "0", "0", "0", "0"];
        for (const lab of this.selfAreaBets) {
            lab.string = "0";
            lab.node.getParent().active = false;
        }
    }

    onClickOther() {
        this.adoMgr.playClick();
        this.brPlys.show(this.plyMgr.getAllPlayerInfo());
    }

    /**
     *  开始下注
     */
    beginBet() {
        this.adoMgr.playStartBet();
        this.showTimePanel(true);
        this.setAllowBet();
    }


    showTimePanel(bool: boolean) {
        this.betTimePanel.active = bool;
    }

    setWinAreaEff(winArea: number, winLoc: number) {
        this.brGame.setAreaEff(winArea);
        this.bcbmPath.setWinEffect(winLoc);
    }

    /**
     * 玩家最终结算动画
     * @param winShape
     * @param redWin
     * @param users
     */
    async balanceAnim(winLoseInfo: ps.enterDealData, plys: ps.infoItem[]) {
        let winArea = winLoseInfo.area;
        if (!plys) return;

        let areaCount = 8;
        // 再把桌上剩下的筹码飞向其他玩家
        for (let area = 0; area < areaCount; area++) {
            this.brGame.chipFlyPlyOther(area, this.nOther.position);
        }

        // 筹码飞向胜利区域
        let tbPlyInfos: ps.infoItem[] = [];
        let zero = new Decimal(0);
        let isMeAdd: boolean = false;
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
                        for (let area = 1; area <= 4; area++) {
                            let bets = betInfos[area - 1];
                            if (area === winArea) {
                                this.brGame.chipFlyPly(area - 1, pWorld, +bets);
                            }
                        }
                        this.playWinAnim(player);
                    }
                    // 计算玩家最后的金额时，桌子上的玩家要把下注的金额补回来
                    let betInfos = player.areaBetInfos;
                    let beforeBet = new Decimal(player.money).add(finalChg);
                    for (let area = 1; area <= 4; area++) {
                        if (betInfos[area]) beforeBet = beforeBet.add(betInfos[area]);
                    }
                    // if (Number(finalChg) > 0) {
                    //     player.money = beforeBet.toString();
                    // }
                    player.money = plyIf.money;
                    if (player.isMe) {
                        isMeAdd = true;
                        /* 播放输赢动画 */
                        this.playerSelfWinLoseEffect(finalChg, winLoseInfo.loc, winLoseInfo.area);
                    }
                }
            });
            if (!isMeAdd) {
                this.playerSelfWinLoseEffect("0", winLoseInfo.loc, winLoseInfo.area);
            }
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

    playerSelfWinLoseEffect(chgMoney: string, loc: number, area: number) {
        this.hidePanelEnd();
        /* 结算界面，先留着 */
        // if (Number(chgMoney) == 0) { return; }
        // this.panelEnd.active = true;
        // this.panelEnd.getComponent(BCBMEnd).showInfo(this, Number(chgMoney), loc, area);
    }

    async playWinAnim(player: BCBMPlayer) {
        let anim = <cc.Node>cc.instantiate(this.preAnimWin);
        this.nodeAnimation.addChild(anim);
        anim.setPosition(player.convertToNodePos(this.nodeAnimation));

        let nodeParticle = cc.instantiate(this.preParticle);
        anim.addChild(nodeParticle);
        await this.playAnim(anim);

        anim.removeAllChildren();
        anim.removeFromParent();
    }

    private hideAllPanel() {
        this.hideArea();
    };

    /**
     * 隐藏下注区域
     */
    private hideArea() {
        this.brGame.hideArea();
        this.bcbmPath.hideWinEffect();
        for (let idx = 0; idx < this.dsBetLogos.length; idx++) {
            const logo = this.dsBetLogos[idx];
            logo.stopAllActions();
            logo.setPosition(this.dsLogoPosArr[idx]);
            logo.active = false;
        }
    }

    public aTest() {
        this.brGame.setAllowBet(0);
        this.brGame.setBetLight(-1);
        let moveTo = cc.moveTo(0.8, this.choumaNode.x, -135).easing(cc.easeBackIn());
        cc.tween(this.choumaNode).then(moveTo).start();
        // this.choumaNode.runAction(moveTo);
    }

    public handleBcbmCar(data: ps.enterDealData, iscut: boolean = false): void {
        this.bcbmCar.setInfo(data.loc, data.area);
        this.bcbmCar.startGo(iscut);
        this.brGame.setAllowBet(0);
        this.brGame.setBetLight(-1);
        this.handleChoumaNodePos(true);
    }

    handleChoumaNodePos(isHide: boolean = false) {
        let time = 0.8;
        if (isHide) {
            /* 隐藏底部筹码区 */
            let moveTo = cc.moveTo(time, this.choumaNode.x, -135);
            cc.tween(this.choumaNode).then(moveTo).start();
            // this.choumaNode.runAction(moveTo);
            this.bcbmSpeed.showNode();
        }
        else {
            let moveTo = cc.moveTo(time, this.choumaNode.x, 0);
            cc.tween(this.choumaNode).then(moveTo).start();
            // this.choumaNode.runAction(moveTo);
            this.bcbmSpeed.hideNode();
        }
    }

    /**
     * 显示趋势图
     */
    async onClickTrend() {
        this.adoMgr.playClick();
        this.bcbmTrend.showSelf();
    }

    /**
     * 刷新记录，趋势图
     * */
    async setDeskRecordList(locInfo: ps.LocInfo) {
        this.bcbmRecord.refreshListData(locInfo);
        this.bcbmTrend.refreshListData(locInfo, this.bcbmRecord.recordListRd);
    }

    /**
     * 初始化记录，趋势图
     * */
    async initDeskRecordList(locs: ps.LocInfo[]) {
        this.bcbmRecord.initListData(locs);
        this.bcbmTrend.initListData(locs);
    }

    /**
     * 退出游戏，回到大厅
     */
    public backMainGame() {
        let str = "亲，确定不再多玩一会儿了吗？";
        if (this.isDobets) {
            str = "亲，退出后会被托管至本局结束，确定要退出吗？"
            this.brGame.setWaitTips(false);
        }
        let confirmnode = showConfirm(str, "确定", "取消");
        confirmnode.okFunc = () => {
            g.gameVal.lastGame = "";
            this.adoMgr.stopCarAdd();
            this.adoMgr.stopCarStart();
            this.adoMgr.stopCarStop();
            this.leaveGame()
        };
    }

    showContinueBtn(bool: boolean) {
        // if (bool && this.gameState === BCBMGameStatus.BET && !this.isClickedContnue) {
        //     this.continueBtn.getChildByName("bg").getComponent(cc.Sprite).setMaterial(0, this.materialNormal);
        //     this.continueBtn.getChildByName("Label").getComponent(cc.Label).setMaterial(0, this.materialNormal);
        //     this.continueBtn.getComponent(cc.Button).enabled = true;
        // }
        // else {
        //     this.continueBtn.getChildByName("bg").getComponent(cc.Sprite).setMaterial(0, this.materialGray);
        //     this.continueBtn.getChildByName("Label").getComponent(cc.Label).setMaterial(0, this.materialGray);
        //     this.continueBtn.getComponent(cc.Button).enabled = false;
        // }
        this.continueBtn.active = bool;
    }

    /**
     * 续投
     */
    handleContinueEvent() {
        this.adoMgr.playClick();
        if ((!this.forwardMyBets || this.forwardMyBets.length < 1) && !this.isDobets) {
            showTip("亲，您还没有下过注哦")
            return;
        }
        if (!this.isCanContinue) {
            showTip("金币不足～");
            return;
        }
        console.log(this.forwardMyBets);
        this.showContinueBtn(false);
        this.msg.sendContinueBets();
        /*
        [{"area":2,"money":"1"},{"area":2,"money":"1"},{"area":3,"money":"1"},{"area":3,"money":"1"}]}
        */
        for (let i = 0; i < this.forwardMyBets.length; i++) {
            let item = this.forwardMyBets[i];
            let areaIdx = item.area - 1;
            let money = item.money;
            if (Number(money) > 0) {
                let _currBetPoint: number = Number(money);
                if (_currBetPoint) {
                    // 不能大于该区域的最大下注额
                    let currMaxBet = new Decimal(money).add(_currBetPoint);
                    let maxBet = this.MAX_AREA_BET;

                    if (currMaxBet.gt(maxBet)) {
                        showTip("下注额超过下注上限～");
                        return false;
                    }

                    let player = this.plyMgr.me;
                    if (new Decimal(player.money).sub(_currBetPoint).gte(0)) {
                        this.brGame.chipFlyArea(areaIdx, player.convertToWorldPos(), _currBetPoint);
                        this.brGame.lightAreas[areaIdx].active = true;
                        this.adoMgr.playBet();
                    } else {
                        showTip("金币不足～");
                    }
                }
            }
        }

    }
}
