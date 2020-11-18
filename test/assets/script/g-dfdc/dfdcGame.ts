import Game from "../g-share/game";
import { GameId } from "../common/enum";
import * as util from "../common/util";
import DFDCItem, { ItemId } from "./dfdcItem";
import DFDCPlayerMgr from "./dfdcPlayerMgr";
import DFDCMsg, { winIcon, jackPotInfo, winnerInfo } from "./dfdcMsg";
import { showConfirm, showTip } from "../common/ui";
import DFDCAudio from "./dfdcAudio";
import DFDCCOLORPOOL from "./dfdccolorPool";
import DFDCWinner from "./dfdcWinner";
import DFDCEgg from "./dfdcEgg";
import User from "../common/user";
import DFDCRatio from "./dfdcRatio";
import DFDCPlayer from "./dfdcPlayer";
import DFDCHelp from "./dfdcHelp";
import dfdcAmbienceEffect from "./dfdcAmbienceEffect";


const { ccclass, property } = cc._decorator;

@ccclass
export default class DFDCGame extends Game {

    @property({ type: DFDCAudio, override: true })
    adoMgr: DFDCAudio = undefined;

    @property({ type: DFDCPlayerMgr, override: true })
    plyMgr: DFDCPlayerMgr = undefined;

    @property(cc.Node)
    private dfdccolorPool: cc.Node = undefined;

    @property(cc.Button)
    private gearPosbtnAdd: cc.Button = undefined;

    @property(cc.Button)
    private multiplebtnAdd: cc.Button = undefined;

    @property(cc.Button)
    private ratioBet: cc.Button = undefined;

    @property(cc.Node)
    private ndStartGame: cc.Node = undefined;

    @property(cc.Node)
    private ndStartText: cc.Node = undefined;

    @property(cc.Node)
    private ndStartTextZD: cc.Node = undefined;

    @property(cc.Label)
    private lblAutoTimes: cc.Label = undefined;

    @property(cc.Node)
    private lblStopText: cc.Node = undefined;

    @property(cc.Node)
    private lblFastStop: cc.Node = undefined;

    @property(cc.Node)
    private ndMenu: cc.Node = undefined;

    @property(cc.Node)
    private uiLayer: cc.Node = undefined;

    @property(cc.Node)
    private ndCoin: cc.Node = undefined;

    @property(cc.Prefab)
    private preSlotsItem: cc.Prefab = undefined;

    @property(cc.Prefab)
    private preHelp: cc.Prefab = undefined;

    @property(cc.Prefab)
    public preLeaderboard: cc.Prefab = undefined;

    @property(cc.Prefab)
    private preRatio: cc.Prefab = undefined;

    @property(cc.Node)
    private panRatio: cc.Node = undefined;

    @property(cc.Prefab)
    public preEggPanle: cc.Prefab = undefined;

    @property(cc.Prefab)
    private preSetting: cc.Prefab = undefined;

    dfdcEgg: DFDCEgg = undefined;

    public dfdcWinner: DFDCWinner = undefined;

    @property(cc.Prefab)
    private preCoin: cc.Prefab = undefined;

    @property(cc.Label)
    private lblWinAniGold: cc.Label = undefined;

    @property(cc.Prefab)
    private preTreasureBowl: cc.Prefab = undefined;

    private ndTreasureBowl: cc.Node = undefined;

    @property(cc.Node)
    private ndBowlCollect: cc.Node = undefined;

    @property(cc.Node)
    private pentupian: cc.Node = undefined;

    @property([cc.Button])
    private btnColorPools: cc.Button[] = [];

    @property(cc.Node)
    private parColorPoolAni: cc.Node = undefined;

    @property([cc.Prefab])
    private preColorPoolAniAll: cc.Prefab[] = [];

    @property(cc.Label)
    private tipLab: cc.Label = undefined;

    @property([cc.Node])
    private ndSlotsAreas: cc.Node[] = [];

    @property([cc.Prefab])
    private sfTreasureBowl: cc.Prefab[] = [];

    @property([cc.SpriteFrame])
    public sfSlotsItemBgs: cc.SpriteFrame[] = [];

    @property([cc.SpriteFrame])
    public sfSlotsItems: cc.SpriteFrame[] = [];

    @property([cc.SpriteFrame])
    private sfGeatPosItemD: cc.SpriteFrame[] = [];

    @property([cc.SpriteFrame])
    private sfGeatPosItemX: cc.SpriteFrame[] = [];

    @property([cc.Sprite])
    private geatPosItem: cc.Sprite[] = [];

    @property(cc.Prefab)
    public preWildAnim: cc.Prefab = undefined;

    @property(cc.Prefab)
    public preFreeAnim: cc.Prefab = undefined;

    @property(cc.Prefab)
    public preFreeStartAnim: cc.Prefab = undefined;

    @property(cc.Node)
    public parWildnode: cc.Node = undefined;

    @property(cc.Node)
    public paeWildnodeStart: cc.Node = undefined;

    @property(cc.Node)
    public parFuZi: cc.Node = undefined;

    @property(cc.Prefab)
    public preFuZi: cc.Prefab = undefined;

    private WildAnim: cc.Node[] = [];

    private freeAnim: cc.Node[] = [];

    private freeStartAnim: cc.Node[] = [];

    private freeFuZiAnim: cc.Node[] = [];

    @property(cc.Node)
    public diamondAnim: cc.Node = undefined;

    @property([cc.Node])
    private fuwu: cc.Node[] = [];

    @property(cc.Node)
    public freebtn: cc.Node = undefined;
    @property(cc.Label)
    public freebtnTip: cc.Label = undefined;

    @property(cc.Node)
    public freeTip: cc.Node = undefined;

    @property(cc.Node)
    public RatioBtnEffect: cc.Node = undefined;

    @property([cc.SpriteFrame])
    public diamondItem: cc.SpriteFrame[] = [];

    @property([cc.SpriteFrame])
    public FreeBgSprite: cc.SpriteFrame[] = [];

    @property(cc.Sprite)
    public bg1: cc.Sprite = undefined;

    @property(cc.Sprite)
    public bg2: cc.Sprite = undefined;
    @property(cc.Node)
    public ziDong: cc.Node = undefined;

    @property(cc.Node)
    public smartChoice: cc.Node = undefined;

    @property(cc.SpriteFrame)
    public smartChoiceItem: cc.SpriteFrame[] = [];

    @property(cc.Node)
    public playerGold: cc.Node = undefined;


    @property(cc.Node)
    public dc_mulian: cc.Node = undefined;

    @property(dfdcAmbienceEffect)
    private ambienceEffect: dfdcAmbienceEffect = null;

    gameName = GameId.DFDC;
    dfdcplaye: DFDCPlayer;
    msg: DFDCMsg;
    // audioMgr: DFDCAudio;
    get audioMgr() {
        return this.adoMgr as DFDCAudio;
    }

    get playerMgr() {
        return this.plyMgr as DFDCPlayerMgr;
    }
    dfdcRatio: DFDCRatio;
    private itemHeight: number = 152;   // 单个图片高度137
    private moveDis: number = 0;        // 移动距离
    private maxY: number = 0;           // 极限值
    private minY: number = 0;
    private startDelayTime: number = 0.1;
    private serverBackTime: number = 0;   // 记录服务器未返回的时间
    private clickColorPoolNum: number = 0;// 记录打开彩池的编号

    private cobet: number = 0; //总押注
    public gearPos_List: number[] = [];//档位列表
    public multiple_list: number[] = [];//倍数列表
    public multipleIdx: number = 0;
    public gearPosIdx: number = 0;
    MIN_BET: number = 50;                 // 最小可下注额
    private isClick: boolean = false;     // 开始按钮点击监控
    private oneClick: number = 0;
    private longClick: number = 0;
    private slotsItemPosY: number[] = []  // Y固定坐标
    private slotsItemsArr: cc.Node[][] = [[]];     // 图标对象
    public slotsResultArr: number[][] = [[]];       // 开奖结果
    public isAuto: boolean = false;                 // 自动状态
    public autoTotalTimes: number = 0;              // 自动次数
    public isFree: boolean = false;                 // 免费状态
    public curFreeTimes: number = 0;               // 当前免费次数
    public curFreeTimesTip: number = 0;               // 当前免费次数
    private _coinPool: cc.NodePool = undefined;     // 金币池
    private intervalId: cc.ActionInterval = undefined;                 // 计时器
    private intervalTween: cc.Tween = null;
    private FreeIntervalId: cc.ActionInterval = undefined;                 // 计时器
    private FreeIntervalTween: cc.Tween = null
    public EggFault: boolean = true;                //免费计时器
    public delaytimes: number = 0;                   //延迟时间
    private GameEnd: boolean = false;
    public autoTime: number = 1.5;                    //延迟时间
    public isDouble: boolean = false;                 //是否可以比倍
    public randomSlots: number[] = [8, 10, 12, 14, 16, 17, 7, 1, 2, 3, 4, 5, 6];
    private Row0 = [[100, 100], [-450, - 50], [-350, 200], [-350, 250], [100, 100]];
    private Row1 = [[100, 100], [-450, 150], [-350, 250], [-350, 250], [100, 100]];
    private Row2 = [[100, 100], [-450, 300], [-350, 300], [-350, 300], [100, 100]];
    /** 飞蝙蝠起点位置 */
    private Column = [this.Row0, this.Row1, this.Row2];
    /**播放音效的区间值 */
    private win1Clip0: number[] = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4.5, 5, 6, 8, 12, 16, 20, 25];
    private win1Clip1: number[] = [0.5, 1, 1.5, 2, 2.5, 5, 7, 9, 11, 14, 18, 27, 36, 45, 54];
    private win1Clip2: number[] = [0.5, 1, 1.5, 2, 2.5, 5, 11, 17, 23, 30, 38, 57, 76, 95, 114];
    private win1Clip3: number[] = [0.5, 1, 1.5, 2, 2.5, 5, 15, 25, 38, 54, 68, 102, 136, 170, 204];
    private win1Clip4: number[] = [0.5, 1, 1.5, 2, 2.5, 5, 15, 33, 51, 70, 88, 132, 176, 220, 264];
    private GeatPosItemX: number[] = [8, 10, 12, 14];
    private GeatPosItemD: number[] = [9, 11, 13, 15];

    @property(cc.Node)
    private freeBet: cc.Node = undefined;

    @property(cc.Node)
    public bet: cc.Node = undefined;
    public lngotsRewardPos: number[][] = [[]];       //金元宝奖励位置
    public lngotsProgressNum: number = 0;
    public islngotsReward: boolean = false;
    public lngotsBalancInfo: any = undefined;
    private isEgg: boolean = false;                    //是否中彩蛋
    public isWin: boolean = false;
    public diamondDoudle = 1;
    public isFreeTip: boolean = false;
    private column = 5;

    public isFreeBgAuido: boolean = false;

    private flyCoinDelay = 0;

    public isStopBtn: boolean = false;

    public isFastStop: boolean = false;

    public isStopSpin: boolean = false;

    public isDoBalance: boolean = false;
    public gameBalance: ps.Dfdc_DoBalance = undefined;

    public showWinGameBalance: ps.Dfdc_DoBalance = undefined;

    public stopSpinPro: Promise<{}>[] = [];
    public fastStopSpinPro: Promise<{}>[] = [];

    private stopSpinFun: cc.ActionInterval = undefined;
    private stopSpinFunTween: cc.Tween = undefined;

    private colorPoolName: string[] = ["小奖", "中奖", "大奖", "巨奖"];

    public ratioEarnMoney: number = 0;
    public freeRatioEarnMoney: number = 0;
    public isGaming: Boolean = false;
    private showWin: Function = undefined;
    private openScatterEff: Function = undefined;


    onLoad() {
        //cc.log("onload111!!!!");
        super.onLoad();
        this._coinPool = new cc.NodePool();
        this.moveDis = -40;
        this.maxY = this.itemHeight * 2;
        this.minY = -this.itemHeight * 3;
        this.slotsItemPosY = [this.itemHeight, 0, -this.itemHeight, this.itemHeight * 2, -this.itemHeight * 2];
        this.bet.active = true;
        this.freeBet.active = false;

        this.isRatio();
        this.ndStartGame.getComponent(cc.Button).interactable = false;
        this.setNodeGray(this.ndStartGame, false);
        util.setGray(this.ndStartGame, true);
        let node = this.instObj(this.preLeaderboard, this.uiLayer)
        this.dfdcWinner = node.getComponent(DFDCWinner);
        node.active = false;
        this.allBetBtnCtr(false);
        this.panRatio.active = false;

    }

    start() {
        super.start();
        this.dc_mulian.active = true;
    }

    initGame() {
        // cc.log("initGame!!!!");
        try {
            this.msg = new DFDCMsg(this);
            this.msg.init();
            this.ndMenu.active = false;
            this.startBtnTipsCtr(this.isFree, this.curFreeTimes, this.isAuto, this.autoTotalTimes);
            if (this.isFree) {
                this.audioMgr.initBg();
                this.audioMgr.playfreeMusic();
            }
        } catch (error) {
            cc.log("<<<<<<<<<<<<错误");
        }

    }
    dealRoomData(data: ps.GameRoomHandlerGetRoomData): void {
        // cc.log("setRoomInfo!!!!");
        try {
            let config = JSON.parse(data.config);
            this.MIN_BET = config.allowBetMinMoney;
            for (const k of Object.keys(config.betsList)) {
                this.gearPos_List.push(Number(config.betsList[k]));
            }
            for (const k of Object.keys(config.betMultiplesList)) {
                this.multiple_list.push(Number(config.betMultiplesList[k]));
            }
            // if (this.FreeIntervalId != null) {
            //     this.node.stopAction(this.FreeIntervalId);
            //     this.FreeIntervalId = null;
            // }
            if (this.FreeIntervalTween != null) {
                this.FreeIntervalTween.stop();
                this.FreeIntervalTween = null;
            }
            this.slotsResultArr = config.initInfo;
            this.initSlotsItem()
            this.allBetBtnCtr(true);
            this.ndStartGame.getComponent(cc.Button).interactable = true;
            this.setNodeGray(this.ndStartGame, true);
            util.setGray(this.ndStartGame, false);
            this.panRatio.active = true;
            let money = +data.users[0].money
            this.playerMgr.me.Playergold.string = money.toFixed(2).toString();
            this.playerMgr.me.money = money.toFixed(2).toString();
            this.betBtnCtr();

            this.initTouchEvent();
            //this.initRound();
            this.isGaming = false;
            this.initMulitipleGearPos();
            this.msg.sendDoFreeInfo(User.uid);
            this.msg.sendDoJackPotInfo();
            this.ratioBet.interactable = false;
            this.RatioBtnEffect.active = false;
            //this.ratioBet.node.getChildByName("icon").active = true;
            this.gameBtnCtr();
        } catch (error) {
            cc.log("<<<<<<<<<<<<错误");
        }

        // this.playerMgr.me.showWinEffect(3);
    }
    // initRound() {
    //     cc.log("refreshRoomInfo!!!!");

    // }
    // dealRoomData(data: any): void {
    //     cc.log("dealRoomData!!!!", data);
    //     this.updatePlayerGold();
    // }
    initRound(): void {
    }
    setWaitPrepare(): void {
    }
    showTicker(): void {
    }
    setStarted(): void {
    }
    hideTicker(): void {
    }
    setWaitStart(): void {
    }
    updateUI(): void {
    }

    // 初始化旋转图标
    private initSlotsItem() {
        for (let i = 0; i < this.column; ++i) {
            let slotsLine = this.ndSlotsAreas[i];
            this.slotsItemsArr[i] = [];
            for (let j = 0; j < this.column; ++j) {
                let item = cc.instantiate(this.preSlotsItem);
                slotsLine.addChild(item);
                item.name = "item" + j;
                item.setPosition(0, this.slotsItemPosY[j]);
                let slotsItem: DFDCItem = item.getComponent(DFDCItem);
                let itemId = 0;
                if (j < 3) {
                    itemId = this.slotsResultArr[j][i];
                } else {
                    let rand = util.random(0, this.randomSlots.length - 1);
                    itemId = this.randomSlots[rand];
                }
                slotsItem.init(this, itemId, this.moveDis, this.maxY, this.minY, this.startDelayTime, 0.1);
                this.slotsItemsArr[i][j] = item;
            }
        }
    }

    //更换免费BG
    freeBgSpriteFrame(isbg: number) {
        this.bg1.spriteFrame = this.FreeBgSprite[isbg];
        this.bg2.spriteFrame = this.FreeBgSprite[isbg];
    }
    // 聚宝盆状态设置
    public setTreasureBowl(state: number) {
        let gold;
        if (state >= 1) {
            gold = this.instObj(this.sfTreasureBowl[state - 1], this.pentupian);
            gold.position = cc.v2(0, 0);
            if (this.pentupian.childrenCount !== 0) {
                for (let index = 0; index < this.pentupian.childrenCount; index++) {
                    if (this.pentupian.children[index].name === gold.name) {
                        this.pentupian.children[index].active = true;
                    }
                    else {
                        this.pentupian.children[index].active = false;
                    }
                }
            }
        } else {
            if (this.pentupian.childrenCount !== 0) {
                for (let index = 0; index < this.pentupian.childrenCount; index++) {
                    this.pentupian.children[index].active = false;
                }
            }
        }
    }
    //点击事件注册
    private initTouchEvent() {
        let self = this;
        this.ndStartGame.on(cc.Node.EventType.TOUCH_START, function (event: cc.Event.EventTouch) {
            self.isClick = true;
            self.longClick = 0;
        })

        this.ndStartGame.on(cc.Node.EventType.TOUCH_END, function (event: cc.Event.EventTouch) {
            self.isClick = false;
            if (self.longClick >= 30) {
                self.btnStatus("long");
            } else {
                self.btnStatus("short");
            }
            self.longClick = 0;
        })
        this.ndStartGame.on(cc.Node.EventType.TOUCH_CANCEL, function (event: cc.Event.EventTouch) {
            self.isClick = false;
            self.longClick = 0;

        });


        for (let i = 0; i < this.btnColorPools.length; ++i) {
            let btn = this.btnColorPools[i];
            let handler = new cc.Component.EventHandler();
            handler.target = this.node;
            handler.component = cc.js.getClassName(this);
            handler.handler = "onClickColorPool";
            handler.customEventData = i.toString();
            btn.clickEvents.push(handler);
        }

        for (let i = 0; i < this.dfdcWinner.btnWinnerColorPools.length; ++i) {
            let btn = this.dfdcWinner.btnWinnerColorPools[i].getComponent(cc.Button);
            let handler = new cc.Component.EventHandler();
            handler.target = this.node;
            handler.component = cc.js.getClassName(this);
            handler.handler = "onClickColorPool";
            handler.customEventData = i.toString();
            btn.clickEvents.push(handler);
        }
    }

    // 点击自动
    private onClickAuto(idx: string) {
        this.enterOutfAuto(true, +idx);
        //this.hideAutoBetMenu();
        this.startGame();
        this.startBtnTipsCtr(this.isFree, this.curFreeTimes, this.isAuto, this.autoTotalTimes)
    }


    // 点击彩池
    private onClickColorPool(ev: cc.Event.EventTouch, idx: string) {

        this.audioMgr.playButtonClickSound();
        if (this.ndMenu.active) {
            this.onClickMenu();
        }
        this.clickColorPoolNum = +idx;
        this.msg.sendDoJackPotHistory(this.clickColorPoolNum);
    }
    // 打开下拉菜单
    public onClickMenu() {
        this.audioMgr.playButtonClickSound();
        this.ndMenu.stopAllActions();
        if (this.ndMenu.active) {
            // this.ndMenu.runAction(cc.sequence(
            //     cc.fadeOut(0.2),
            //     cc.callFunc(() => {
            //         this.ndMenu.active = false;
            //     })),
            // );
            cc.tween(this.ndMenu)
                .to(0.2, { opacity: 0 })
                .call(() => {
                    this.ndMenu.active = false;
                })
                .start();
        } else {
            this.ndMenu.opacity = 0;
            this.ndMenu.active = true;
            //this.ndMenu.runAction(cc.fadeIn(0.2));
            cc.tween(this.ndMenu).to(0.2, { opacity: 255 }).start();
        }
    }
    // 打开帮助界面
    public onClickHelp() {
        this.audioMgr.playButtonClickSound();
        let node = this.instObj(this.preHelp, this.uiLayer);
        node.getComponent(DFDCHelp).show(this.audioMgr)
        node.setPosition(0, 0);
    }
    // 打开设置界面
    public onClickSetting() {
        this.audioMgr.playButtonClickSound();
        let node = this.instObj(this.preSetting, this.uiLayer);
        node.getChildByName("panel").getChildByName("mid").getChildByName("relogin").active = false;
        node.active = true;
        node.setPosition(0, 0);
    }

    //初始化档位，倍数，分数
    initMulitipleGearPos() {
        for (let index = 0; index < this.fuwu.length; index++) {
            this.fuwu[index].getComponent(cc.Button).interactable = false;
            this.fuwu[index].scale = 1;
            this.fuwu[index].getChildByName("dc_tt_lizi").active = false;
        }
        this.geatPosItem[this.gearPosIdx].spriteFrame = this.sfGeatPosItemX[this.gearPosIdx];
        this.updatePlayerBet(this.gearPos_List[this.gearPosIdx].toString(), this.multiple_list[this.multipleIdx].toString());
    }

    /**
     * 放大动画
     */
    public zoomFuWuAime() {

        for (let index = 0; index < this.gearPosIdx; index++) {
            let anim = this.fuwu[index].getChildByName("dc_tt_lizi");
            let actions =
                cc.sequence(
                    cc.scaleTo(0.1, 0.8, 0.8),
                    cc.callFunc(() => {
                        anim.active = true;
                        anim.getComponent(cc.Animation).play();
                    }),
                    cc.scaleTo(0.2, 1.2, 1.2),
                )
            //this.fuwu[index].runAction(actions);
            cc.tween(this.fuwu[index]).then(actions).start();
        }
        for (let index = 0; index <= this.gearPosIdx; index++) {
            let anim = this.geatPosItem[index].node.getChildByName("dc_tt_lizi");
            let actions = cc.sequence(
                cc.scaleTo(0.1, 0.8, 0.8),
                cc.callFunc(() => {
                    anim.active = true;
                    anim.getComponent(cc.Animation).play();
                }),
                cc.scaleTo(0.2, 1.2, 1.2),
            )
            // this.geatPosItem[index].node.runAction(actions);
            cc.tween(this.geatPosItem[index].node).then(actions).start();
        }
        let actions = cc.sequence(
            cc.scaleTo(0.1, 1.2, 1.2),
            cc.callFunc(() => {
                if (this.gearPosIdx === 4) {
                    this.smartChoice.getComponent(cc.Sprite).spriteFrame = this.smartChoiceItem[1];
                }
            }),
            cc.scaleTo(0.2, 1, 1),
        )
        // this.smartChoice.parent.runAction(actions);
        cc.tween(this.smartChoice.parent).then(actions).start();
    }
    // 增加或减少下注
    public onClickAddSubBet(event: any, sert: any) {
        this.audioMgr.playButtonClickSound();
        if (this.ndMenu.active) {
            this.onClickMenu();
        }
        if (sert === "gearPos") {
            if (this.gearPosIdx + 1 < this.gearPos_List.length) {
                this.gearPosIdx++;
                let betScore = new window.Decimal(this.gearPos_List[this.gearPosIdx]).mul(this.multiple_list[this.multipleIdx]);
                this.cobet = +betScore;
                this.geatPosItem[this.gearPosIdx].spriteFrame = this.sfGeatPosItemX[this.gearPosIdx];
                this.fuwu[this.gearPosIdx - 1].getComponent(cc.Button).interactable = true;
                this.zoomFuWuAime();
                for (let i = 0; i < this.randomSlots.length; i++) {
                    if (this.randomSlots[i] === this.GeatPosItemX[this.gearPosIdx - 1]) {
                        this.randomSlots[i] = this.GeatPosItemD[this.gearPosIdx - 1];
                    }
                }
            }

            else {
                this.gearPosIdx = 0;
                for (let index = 0; index < 5; index++) {
                    this.geatPosItem[index].spriteFrame = this.sfGeatPosItemD[index];
                    this.geatPosItem[index].node.stopAllActions();
                    if (index !== 0) {
                        this.geatPosItem[index].node.scale = 1;
                    }
                    this.geatPosItem[index].node.getChildByName("dc_tt_lizi").active = false;
                    for (let i = 0; i < this.randomSlots.length; i++) {
                        if (this.randomSlots[i] === this.GeatPosItemD[index]) {
                            this.randomSlots[i] = this.GeatPosItemX[index];
                        }
                    }
                }
                for (let j = 0; j < this.fuwu.length; j++) {
                    this.fuwu[j].getComponent(cc.Button).interactable = false;
                    this.fuwu[j].stopAllActions();
                    this.fuwu[j].getChildByName("dc_tt_lizi").active = false;
                    this.fuwu[j].scale = 1;
                }
                this.smartChoice.getComponent(cc.Sprite).spriteFrame = this.smartChoiceItem[0];
                this.smartChoice.stopAllActions();
            }
        } else if (sert === "multiple") {
            if (this.multipleIdx + 1 < this.multiple_list.length) {
                this.multipleIdx++;
                let betScore = new window.Decimal(this.gearPos_List[this.gearPosIdx]).mul(this.multiple_list[this.multipleIdx]);
                this.cobet = +betScore;
            } else {
                this.multipleIdx = 0;
            }
        }

        this.updatePlayerBet(this.gearPos_List[this.gearPosIdx].toString(), this.multiple_list[this.multipleIdx].toString());
    }
    // 点击开始按钮
    public onClickStart() {
        this.audioMgr.playClickStartBtn();
        if (this.isAuto && this.longClick < 60) {
            this.stopGame();
        } else {
            if (this.longClick < 60)
                this.startGame();
        }
    }
    // 打开彩池历史赢家界面
    public openColorPoolWinnerPanel(data: winnerInfo[]) {
        this.dfdcWinner.show(data, this.clickColorPoolNum, this.audioMgr, this);
    }
    //刷新(检测是否长按)
    update() {
        if (this.isClick && !this.isFree && !this.GameEnd) {
            this.longClick++;
            if (this.longClick > 60) {
                this.longClick = 60;
                if (!this.isAuto) {
                    this.onClickAuto("1");
                }
                this.isClick = false;
            }
        }
    }

    // 开始游戏
    public startGame() {
        if (this.isEgg) return;
        this.playerMgr.me.isQuickStop = false;
        this.gameBalance = undefined;
        this.audioMgr.startBtnClick();
        if (!this.canBetGame()) {
            this.enterOutfAuto(false, 0);
            this.stopGame();
        } else {
            this.isGaming = true;
            this.GameEnd = true;
            this.isDouble = false;
            this.freeTip.active = false;
            this.unschedule(this.startGame);
            this.unschedule(this.openScatterEff);
            if (this.showWin) {
                this.unschedule(this.showWin);
            }
            if (this.ndMenu.active) {
                this.onClickMenu();
            }
            // if (this.FreeIntervalId != null) {
            //     this.node.stopAction(this.FreeIntervalId);
            //     this.FreeIntervalId = null;
            // }
            if (this.FreeIntervalTween != null) {
                this.FreeIntervalTween.stop();
                this.FreeIntervalTween = null;
            }
            //this.node.stopAction(this.intervalId);
            if (this.intervalTween != null) {
                this.intervalTween.stop()
                this.intervalTween = null;
            }

            //this.intervalId = null;
            this.isFreeTip = false;
            this.isStopBtn = false;
            this.isStopSpin = false;
            this.isFastStop = false;
            this.isDoBalance = false;
            this.hideDiamondAnimt();
            this.hideWinEffect(true);
            this.msg.sendDoOperate(0, this.gearPos_List[this.gearPosIdx].toString(), this.multiple_list[this.multipleIdx].toString(), 0);
            this.playerMgr.me.hideWinEffect();
            this.updatePlayerBetGold();
            this.islngotsReward = false;
            if (!this.isFree) {
                this.freeRatioEarnMoney = 0;
            }
            this.startSpin();
            if (this.curFreeTimes === 0 && this.curFreeTimesTip !== 0) {
                this.enterOutfAuto(false, 0);
                // if (!this.isFreeBgAuido) {
                //     this.enterOutfFree(true, 0);
                //     this.isFreeBgAuido = true;
                // }
                this.curFreeTimes = this.curFreeTimesTip;
                this.isFree = true;
                this.freeBgSpriteFrame(1);
                this.bet.active = false;
                this.freeBet.active = true;
                this.gameBtnCtr();
            }

            this.autoTime = 1.5;
            //cc.log("是否免费：  ", this.isFree, " 是否自动：  ", this.isAuto);
            this.playerMgr.me.resetWinGold();
            if (this.isFree) {
                this.curFreeTimes--;
            }
            this.audioMgr.stopWinContinue();
            //this.audioMgr.stopBG();
            this.schedule(this.checkSeverBack, 1);
            this.gameBtnCtr();
            this.isRatio();
            this.startGameEffectCtr();
            this.startBtnTipsCtr(this.isFree, this.curFreeTimes, this.isAuto, this.autoTotalTimes);
            if (!this.isFree) {
                this.freebtnTip.node.active = true;
                this.freebtnTip.string = `祝您好运!`;
            }
            if (!this.isAuto) {
                this.scheduleOnce(() => {
                    this.fastStopBtn();
                }, 0.05)
            }
        }
    }

    endGameFastStopBtn() {
        if (!this.isStopBtn) {
            this.isStopBtn = true;
            this.fastStopBtn();
        }
    }

    /**
     * 控制快速停止按钮
     */
    fastStopBtn() {
        if (!this.isStopBtn) {
            this.lblFastStop.active = true;
        } else {
            this.lblFastStop.active = false;
        }
    }

    /**
     * 停止自动
     */
    public stopGame() {
        this.enterOutfAuto(false, 0);
        this.gameBtnCtr();
        this.betBtnCtr();
        this.startGameEffectCtr();
        this.unschedule(this.startGame);
        this.startBtnTipsCtr(this.isFree, 0, this.isAuto, 0);
        if (!this.isGaming) {
            this.isRatio();
        }
    }
    /**
     *快速结束游戏
     */
    async OnClickStopGame() {
        this.audioMgr.playButtonClickSound();

        if (!this.gameBalance) {
            return;
        }
        if (!this.isFree) {
            this.unschedule(this.startGame);
        }
        this.unschedule(this.stopSpinItem);
        this.isStopBtn = true;
        // cc.log("快速停止：this.isStopBtn" + this.isStopBtn + "   this.isStopSpin:" + this.isStopSpin);
        //  cc.log("this.freeRatioEarnMoney:" + this.freeRatioEarnMoney + "   this.ratioEarnMoney:" + this.ratioEarnMoney);
        this.fastStopBtn();
        if (!this.isStopSpin) {
            // if (this.stopSpinFun != null) {
            //     this.node.stopAction(this.stopSpinFun);
            //     this.stopSpinFun = null;
            // }
            if (this.stopSpinFunTween != null) {
                this.stopSpinFunTween.stop();
                this.stopSpinFunTween = null;
            }
            this.isFastStop = true;
            await this.fastStopSpin();
            //  cc.log("this.freeRatioEarnMoneyxx:" + this.freeRatioEarnMoney + "   this.ratioEarnMoney:" + this.ratioEarnMoney);

            //   cc.log("this.freeRatioEarnMoneyyy:" + this.freeRatioEarnMoney + "   this.ratioEarnMoney:" + this.ratioEarnMoney);
            this.playerMgr.me.isQuickStop = true;
            let lbl = this.playerMgr.me.lblWinGold;
            if (this.freeRatioEarnMoney != 0) {
                lbl.string = (this.freeRatioEarnMoney + this.ratioEarnMoney).toFixed(2).toString();
            } else {
                lbl.string = (this.ratioEarnMoney).toFixed(2).toString();
            }
            //this.audioMgr.stopWinContinue();

            if (this.gameBalance) {
                this.msg.DFDCDoBalance(this.gameBalance);
            }
            // cc.log("lbl.string:" + lbl.string);
        }
        else {
            this.isFastStop = true;
            this.playerMgr.me.isQuickStop = true;
            let lbl = this.playerMgr.me.lblWinGold;
            if (this.freeRatioEarnMoney != 0) {
                if (this.isDoBalance) {
                    lbl.string = this.freeRatioEarnMoney.toFixed(2).toString();
                }
                else {
                    lbl.string = (this.freeRatioEarnMoney + this.ratioEarnMoney).toFixed(2).toString();
                }

            } else {
                lbl.string = (this.ratioEarnMoney).toFixed(2).toString();
            }
            //this.audioMgr.stopWinContinue();
            // cc.log("lbl.string:" + lbl.string);
        }

    }
    //游戏结束
    setGameEnd() {
        //this.isdelay();
    }
    //判断是否结束游戏
    public isdelay() {
        this.isGameEnd();
    }

    //比倍结果
    public ratioBalance(result: number, doubleScore: number, doubleCount: number) {
        this.dfdcRatio.ratioBalance(result, doubleScore, doubleCount);
    }

    //打开比倍面板
    public openRatioPanle() {
        let prerotio = this.panRatio.getChildByName(this.preRatio.name);
        if (!prerotio) {
            prerotio = cc.instantiate(this.preRatio);
            this.panRatio.addChild(prerotio);
        }
        this.dfdcRatio = prerotio.getComponent(DFDCRatio);
        this.dfdcRatio.openRatioPanle(this);
    }
    //是否可以比倍
    public isRatio() {
        this.ratioBet.node.active = !this.isDouble;
        this.RatioBtnEffect.active = this.isDouble;
        if (this.isDouble) {
            this.RatioBtnEffect.getComponent(cc.Animation).play();
        }
        else {
            this.RatioBtnEffect.getComponent(cc.Animation).stop();
        }
        util.setGray(this.ratioBet.node, !this.isDouble);
        // this.ratioBet.node.getChildByName("icon").active = !this.isDouble;
    }

    //游戏结束清空状态
    private isGameEnd() {
        this.isGaming = false;
        this.delaytimes = 0;
        this.GameEnd = false;
        let delay = 0;
        //this.playerMgr.me.showWinEffect(1);
        //this.gameBalance = undefined;
        if (this.isWin) {
            delay = 1.5;
        } else {
            if (this.flyCoinDelay !== 0) {
                this.autoTime = 0;
            }
        }
        if (this.curFreeTimes > 0) {
            this.isFree = true;
            if (!this.isGaming && !this.isEgg && this.curFreeTimes > 0) {
                let time = this.autoTime + delay + this.flyCoinDelay
                this.scheduleOnce(this.startGame, time);
            }
        } else {
            if (this.isFree && this.curFreeTimes == 0) {
                this.unschedule(this.startGame);
                // if (!this.isWin) {
                //     this.enterOutfFree(false, 0)
                // }
                this.audioMgr.endFreeMusic();
                this.freeBgSpriteFrame(0);
                this.bet.active = true;
                this.freeBet.active = false;
                this.curFreeTimesTip = 0;
            }
            this.isFree = false;
            if (this.autoTotalTimes > 0 && !this.isEgg) {
                let time = this.autoTime + delay + this.flyCoinDelay
                this.scheduleOnce(this.startGame, time);
            } else {
                this.unschedule(this.startGame);
                this.enterOutfAuto(false, 0);
            }
        }
        if (!this.isAuto) {
            this.isRatio();
        }
        this.gameBtnCtr();
        this.betBtnCtr();
        this.startGameEffectCtr();
        //TODO
        // if (!this.isStopBtn) {
        //     this.isStopBtn = true;
        //     this.fastStopBtn();
        // }
        this.startBtnTipsCtr(this.isFree, this.curFreeTimes, this.isAuto, this.autoTotalTimes)
        if (this.isWin && !this.isAuto && !this.isFree) {
            this.freebtnTip.node.active = true;
            this.freebtnTip.string = `点击博彩或继续玩!`;
        }
        else {
            if (!this.isFree) {
                this.freebtnTip.node.active = false;
            }
        }
        this.serverBackTime = 0;
        if (this.isFreeTip && this.curFreeTimes === 0) {
            this.isFreeTip = false;
            if (this.isAuto) {
                this.unschedule(this.startGame);
                this.stopGame();
            }
            this.freebtnTip.node.active = true;
            this.freebtnTip.string = `恭喜您获得${this.curFreeTimesTip.toString()}局免费游戏次数!`;
            this.allBetBtnCtr(false);
        }
        if (this.showWinGameBalance) {
            this.scheduleOnce(this.showWin = () => {
                this.msg.showWin(this.showWinGameBalance);
            }, this.flyCoinDelay);

            if (!this.isWin) {
                //cc.log("没有赢")
                this.endGameFastStopBtn();
            }
        }

    }
    // 开始旋转
    private startSpin() {
        let self = this;
        for (let i = 0; i < this.column; ++i) {
            for (let j = 0; j < this.column; ++j) {
                //this.scheduleOnce(function () {
                let item: DFDCItem = self.slotsItemsArr[i][j].getComponent(DFDCItem);
                item.startAction();
                // }, 0);
            }
        }
    }

    // 停止旋转
    public stopSpin() {
        this.stopSpinPro = [];
        let delay1 = 2;
        let delay = 0.8;
        this.scheduleOnce(this.stopSpinItem, delay);
        let delayFun = cc.delayTime(delay + delay1);
        let func = cc.callFunc(() => {
            this.msg.DFDCDoBalance(this.gameBalance);
        });
        //this.stopSpinFun = cc.sequence(delayFun, func);
        this.stopSpinFunTween = cc.tween(this.node).then(cc.sequence(delayFun, func));
        this.stopSpinFunTween.start();
        //this.node.runAction(this.stopSpinFun);
        // cc.tween(this.node)
        //     .delay(delay + delay1)
        //     .call(() => {
        //         this.msg.DFDCDoBalance(this.gameBalance);
        //     })
        //     .start();
    }
    /**
     * 快速停止旋转
     */
    public fastStopSpin() {
        return new Promise(resolve => {
            this.stopSpinItem();
            setTimeout(() => {
                resolve();
            }, 1 * 1000);
        });
    }
    public stopSpinItem() {
        if (this.isStopSpin) {
            //cc.log("已经在停止旋转转轴");
            return;
        }
        let self = this;
        this.isStopSpin = true;
        let speedtable: number[] = [];
        if (this.isStopBtn) {
            speedtable = [0, 0.1, 0.2, 0.3, 0.4];
        }
        else {
            speedtable = [0, 0.4, 0.8, 1.2, 1.6];
        }
        for (let i = 0; i < self.column; ++i) {
            for (let j = 0; j < self.column; ++j) {
                this.scheduleOnce(() => {
                    let data: number;
                    let item: DFDCItem;
                    item = self.slotsItemsArr[j][i].getComponent(DFDCItem);
                    if (i === 0) {
                        data = self.slotsResultArr[i][j]
                        item.setResult(data, this.itemHeight * 2);
                    } else if (i < 3) {
                        data = self.slotsResultArr[i][j]
                        item.setResult(data, this.itemHeight * (2 - i));
                    } else {
                        let rand = 0;
                        if (self.isFree) {
                            rand = util.random(0, 6);
                        }
                        else {
                            rand = util.random(0, self.randomSlots.length - 1);
                        }
                        item.setResult(self.randomSlots[rand], self.itemHeight * (2 - i));
                    }
                    item.stopSpin();
                    if (i === 0) {
                        this.scheduleOnce(() => {
                            if (j < this.isWinningfree(true, 0)) {
                                self.audioMgr.playwild();
                            }
                            else {
                                self.audioMgr.playStopGame();
                            }
                        }, 0.2);
                    }
                }, speedtable[j]);
            }
        }
        this.unschedule(self.checkSeverBack);
    }

    // 更新玩家金币
    public updatePlayerGold() {
        if (this.isFree) return;
        let player = this.playerMgr.me
        let money = parseFloat(player.money);
        this.playerMgr.me.Playergold.string = money.toFixed(2).toString();
    }
    // 更新玩家金币
    private updatePlayerBetGold() {
        if (this.curFreeTimes === 8) {
            this.playerMgr.me.Playergold.string = this.playerMgr.me.money;
        }
        if (this.isFree) return;
        let player = this.playerMgr.me;
        let curMoney = new window.Decimal(parseFloat(player.money)).sub(this.cobet);
        this.playerMgr.me.Playergold.string = curMoney.toFixed(2).toString();
    }
    // 更新玩家下注金额
    public updatePlayerBet(betLevel: string, mulitip: string) {
        let curMoney = new window.Decimal(parseFloat(betLevel)).mul(parseFloat(mulitip));
        this.cobet = +curMoney;
        this.playerMgr.me.changeBetsScore(this.cobet.toFixed(2).toString());
        this.playerMgr.me.mulitipleScore(mulitip);
        this.playerMgr.me.gearPosScore(betLevel);
        for (let i = 0; i < this.multiple_list.length; ++i) {
            let val = this.multiple_list[i];
            if (val.toString() === mulitip) this.multipleIdx = i;
        }
        for (let i = 0; i < this.gearPos_List.length; ++i) {
            let val = this.gearPos_List[i];
            if (val.toString() === betLevel) this.gearPosIdx = i;
        }
        for (let index = 0; index <= this.gearPosIdx; index++) {
            this.geatPosItem[index].spriteFrame = this.sfGeatPosItemX[index];
            this.geatPosItem[index].node.scale = 1.2;
            if (this.gearPosIdx === 4) {
                this.smartChoice.getComponent(cc.Sprite).spriteFrame = this.smartChoiceItem[1];
            }
            if (index != 0) {
                if (index <= this.fuwu.length) {
                    this.fuwu[index - 1].getComponent(cc.Button).interactable = true;
                    this.fuwu[index - 1].scale = 1.2;
                }
            }
            for (let i = 0; i < this.randomSlots.length; i++) {
                if (this.randomSlots[i] === this.GeatPosItemX[index]) {
                    this.randomSlots[i] = this.GeatPosItemD[index];
                }
            }
        }
        this.betBtnCtr();
    }
    // 返回大厅
    public onClickBack() {
        this.audioMgr.playButtonClickSound();
        if (this.isGaming || this.isFree || this.isAuto) {
            let confirmnode = showConfirm("亲，您当前正在游戏中，确定退出吗？", "确定", "取消");
            confirmnode.okFunc = () => {
                this.audioMgr.stopWinContinue();
                this.unscheduleAllCallbacks();
                this.leaveGame();
            };
        } else {
            this.audioMgr.stopWinContinue();
            this.unscheduleAllCallbacks();
            this.leaveGame();
        }
    }
    // 检测十秒 若服务器不返回停止  则踢出
    private checkSeverBack() {
        this.serverBackTime++;
        if (this.serverBackTime >= 9.5) {
            let confirmnode = showConfirm("网络出现错误！请重新进入游戏！");
            confirmnode.okFunc = () => {
                this.audioMgr.stopWinContinue();
                this.audioMgr.unInitBgm();
                this.leaveGame();
            };
            this.unschedule(this.checkSeverBack);
        }
    }

    // 能否下注判断
    private canBetGame() {
        // if (this.playerMgr.me.balance < this.MIN_BET && !this.isFree) {
        // util.showTip(`金币不足${this.MIN_BET}无法押注,请您充值！`);
        // return false;
        //} else
        if (+this.playerMgr.me.money < this.MIN_BET && !this.isFree) {
            showTip(`金币不足${this.MIN_BET}无法押注,请您充值！`);
            return false;
        }
        else if (+this.playerMgr.me.money < this.cobet && !this.isFree) {
            showTip(`金币不足${this.cobet}不能下注，请您更换注额～`);
            return false;
        }
        return true;
    }
    // 开始按钮状态设置
    private btnStatus(status: string) {
        if (status === "short") {
            this.oneClick++;
            this.scheduleOnce(() => {
                if (this.oneClick === 1) {
                    this.oneClick = 0;
                } else if (this.oneClick === 2) {
                    this.oneClick = 0;
                }
            }, 0.4)
        } else {
            this.oneClick = 0;
        }
    }
    // 自动或免费特效显隐
    private startGameEffectCtr() {
        if (this.isFree || this.isAuto) {
            this.ziDong.active = true;
        } else {
            this.ziDong.active = false;
        }
    }
    setNodeGray(obj: cc.Node, gray: boolean = true) {
        let orc = (<any>obj)["originalColor"];
        if (!orc) {
            orc = obj.color;
            let attr = { originalColor: orc }
            obj.attr(attr);
        }
        obj.color = gray ? cc.Color.GRAY : orc;
    }
    // 开始按钮下注按钮置灰控制
    private gameBtnCtr() {
        if (this.isFree) {
            this.ndStartGame.getComponent(cc.Button).interactable = !this.GameEnd;
            this.setNodeGray(this.ndStartGame, this.GameEnd);
            util.setGray(this.ndStartGame, this.GameEnd);
            this.allBetBtnCtr(false);
        } else {
            if (this.isAuto) {
                this.ndStartGame.getComponent(cc.Button).interactable = true;
                this.allBetBtnCtr(false);
            } else {
                this.ndStartGame.getComponent(cc.Button).interactable = !this.GameEnd;
                this.setNodeGray(this.ndStartGame, this.GameEnd);
                util.setGray(this.ndStartGame, this.GameEnd);
                this.allBetBtnCtr(!this.GameEnd);
            }
        }
    }
    // 下注按钮置灰控制
    private betBtnCtr() {
        if (this.isGaming || this.isFree) return;
        let player = this.playerMgr.me;
        if (+player.money < 0.8) {
            this.allBetBtnCtr(false);
            return;
        }
    }

    //所有的加减按钮置灰控制
    private allBetBtnCtr(is: boolean) {
        this.multiplebtnAdd.interactable = is;
        util.setGray(this.multiplebtnAdd.node, !is);
        this.gearPosbtnAdd.interactable = is;
        util.setGray(this.gearPosbtnAdd.node, !is);
    }

    // 开始按钮提示
    private startBtnTipsCtr(free: boolean, freeTimes: number, auto: boolean, autoTimes: number) {
        let b: boolean;
        if (free) {
            this.lblAutoTimes.string = freeTimes.toString();
            b = free;
            this.lblStopText.active = false;
            //this.lblFastStop.active = false;
            this.freebtn.active = true;
            this.freebtnTip.node.active = true;
            this.freebtnTip.string = `您还有${this.curFreeTimes.toString()}局免费游戏,祝您好运!`;
        } else {
            this.lblStopText.active = false;
            this.freebtn.active = false;
            this.freebtnTip.node.active = false;
            if (auto) {
                this.lblFastStop.active = false;
                if (autoTimes > 0) {
                    this.lblStopText.active = true;
                    b = auto;
                }
            } else {
                if (this.isGaming) {

                }
            }
        }
        this.ndStartText.position = cc.v3(0, 19);
        this.ndStartTextZD.active = !b;
        this.ndStartText.active = !b;
    }
    //自动切换
    private enterOutfAuto(isbool: boolean, freq: number) {
        this.isAuto = isbool;
        this.autoTotalTimes = freq;
    }

    public wildNun() {
        this.flyCoinDelay = 0;
        for (let i = 0; i < 3; ++i) {
            for (let j = 0; j < this.column; ++j) {
                let item = this.slotsItemsArr[j][i].getComponent(DFDCItem);
                if (item.id === ItemId.wild) {
                    this.flyCoinDelay = 2.5;
                }
            }
        }
    }
    //是否有百搭
    public coinToTreasureBowl() {
        return new Promise(resolve => {
            let isShow = false;
            let endPos = cc.v2(this.ndBowlCollect.x - 50, this.ndBowlCollect.y + 100);
            if (this._coinPool.size() < 0) {
                for (let index = 0; index < 30; index++) {
                    let coin = cc.instantiate(this.preCoin);
                    this._coinPool.put(coin);
                }
            }
            for (let i = 0; i < 3; ++i) {
                for (let j = 0; j < this.column; ++j) {
                    let item = this.slotsItemsArr[j][i].getComponent(DFDCItem);
                    if (item.id === ItemId.wild) {
                        let coord = this.Column[i][j];
                        let posit = cc.v2(coord[0], coord[1]);
                        isShow = true;
                        let startPos = item.node.convertToWorldSpaceAR(cc.Vec2.ZERO);
                        this.wildscaplay(item.node, 4);
                        this.wildscaplayFuZi(item.node);
                        this.flyCoin(5, startPos, endPos, posit);
                    }
                }
            }
            if (isShow) {
                this.audioMgr.playFlyCoin();
            }
            setTimeout(() => {
                resolve();
            }, this.flyCoinDelay * 1000);
        });
    }
    public wildscaplayFuZi(item: cc.Node) {
        let startPos = item.convertToWorldSpaceAR(cc.Vec2.ZERO);
        let pandu = null;
        let isOpen = false;
        let winLine = [];
        for (let k = 0; k < this.column; k++) {
            if (this.freeFuZiAnim.length === 0) {
                for (let index = 0; index < this.column; index++) {
                    let pre = cc.instantiate(this.preFuZi);
                    pre.active = false;
                    this.parFuZi.addChild(pre);
                    this.freeFuZiAnim.push(pre);
                }
            }
            pandu = this.freeFuZiAnim[k];
            if (pandu.active) {
                winLine.push(pandu.position);
            } else if (!isOpen && !pandu.active) {
                isOpen = true;
                pandu.position = pandu.parent.convertToNodeSpaceAR(startPos);
                if (winLine.length === 0) {
                    pandu.active = true;
                    pandu.getComponent(cc.Animation).play();
                }
                for (let index = 0; index < winLine.length; index++) {
                    if (winLine[index] != pandu.position) {
                        pandu.active = true;
                        pandu.getComponent(cc.Animation).play();
                    }
                }
                this.scheduleOnce(() => {
                    for (let index = 0; index < this.freeFuZiAnim.length; index++) {
                        this.freeFuZiAnim[index].active = false;
                    }
                }, 2);

            }
        }
    }

    //百搭特效
    private flyCoin(coinNum: number, startPos: cc.Vec2, endPos: cc.Vec2, coinss: cc.Vec2) {
        //cc.log('百搭特效');
        for (let i = 0; i < coinNum; ++i) {
            let coin = this.getBetCoin();
            if (!coin) {
                return;
            }
            coin.opacity = 255;
            coin.position = cc.v3(coin.parent.convertToNodeSpaceAR(startPos));
            let pos = coin.position;
            let randomPosX = util.random(-400, 400);
            let randomPosy = util.random(-350, 350);
            let Mdian1 = cc.v2(pos.x + randomPosX, pos.y + randomPosy);
            let Mdian2 = cc.v2(coinss.x, coinss.y);
            let Mdian3 = cc.v2(endPos.x, endPos.y);
            let beizier = [Mdian1, Mdian2, Mdian3];
            //let endRotation = cc.randomMinus1To1() * 90;
            let endRotation = 90;
            let particle = coin.getChildByName("Particle");
            let glow = coin.getChildByName("Glow");
            let light = coin.getChildByName("Light");
            let bianfu = coin.getChildByName("Bianfufei");
            particle.getComponent(cc.ParticleSystem).resetSystem();
            glow.getComponent(cc.ParticleSystem).resetSystem();
            light.getComponent(cc.ParticleSystem).resetSystem();
            bianfu.getComponent(cc.Animation).play();
            particle.active = true;
            glow.active = true;
            light.active = true;
            bianfu.active = true;
            let actions = cc.sequence(
                cc.rotateTo(0.01, 0),
                cc.delayTime(0.08 * i),
                cc.spawn(
                    cc.bezierTo(1, beizier),
                    cc.rotateTo(1, endRotation),
                    cc.fadeTo(1, 255),
                    cc.sequence(
                        cc.scaleTo(0.1, 0.7, 0.7),
                        cc.scaleTo(0.3, 1.2, 1.2),
                        cc.scaleTo(0.6, 0.4, 0.4),
                    ),
                    //cc.scaleTo(0.3, 0.9, 0.9),//原注释
                ),
                cc.spawn(
                    cc.scaleTo(0.2, 0, 0),
                    cc.fadeOut(0.2)),
                cc.callFunc(() => {
                    if (particle) {
                        particle.active = false;
                        particle.getComponent(cc.ParticleSystem).stopSystem();
                    }
                    if (glow) {
                        glow.active = false;
                        glow.getComponent(cc.ParticleSystem).stopSystem();
                    }
                    if (light) {
                        light.active = false;
                        light.getComponent(cc.ParticleSystem).stopSystem();
                    }
                    if (bianfu) {
                        bianfu.active = false;
                        bianfu.getComponent(cc.Animation).stop();

                    }
                },
                    cc.delayTime(0.08 * coinNum),
                    this.recoverAllCoins),
            )
            // coin.runAction(actions);
            cc.tween(coin).then(actions).start();
            // let tw = cc.tween
            // tw(coin)
            //     .to(0.01, { angle: 0 })
            //     .delay(0.08 * i)
            //     .parallel(
            //         cc.bezierTo(1, beizier),
            //         tw().to(1, { angle: -endRotation }),
            //         tw().to(1, { opacity: 255 }),
            //         tw(coin).to(0.1, { scale: 0.7 })
            //             .to(0.3, { scale: 1.2 })
            //             .to(0.6, { scale: 0.6 })
            //             .start()
            //     )
            //     .parallel(
            //         tw().to(0.2, { scale: 0 }),
            //         tw().to(0.2, { opacity: 0 }),
            //         tw().call(() => {
            //             if (particle) {
            //                 particle.active = false;
            //                 particle.getComponent(cc.ParticleSystem).stopSystem();
            //             }
            //             if (glow) {
            //                 glow.active = false;
            //                 glow.getComponent(cc.ParticleSystem).stopSystem();
            //             }
            //             if (light) {
            //                 light.active = false;
            //                 light.getComponent(cc.ParticleSystem).stopSystem();
            //             }
            //             if (bianfu) {
            //                 bianfu.active = false;
            //                 bianfu.getComponent(cc.Animation).stop();

            //             }
            //         }),
            //         tw().delay(0.08 * coinNum),
            //         tw().call(() => {
            //             this.recoverAllCoins();
            //         })
            //     )
            //     .start()
        }
    }

    //金币池
    private getBetCoin(): cc.Node {
        let coin: cc.Node;
        if (this._coinPool.size() > 0) {
            coin = this._coinPool.get();
        } else {
            coin = cc.instantiate(this.preCoin);
        }
        this.ndCoin.addChild(coin);
        return coin;
    }

    //金币回收处理
    recoverAllCoins() {
        let coins = this.ndCoin.children;
        for (let index = 0; index < coins.length; index++) {
            let coin = coins[index];
            coin.removeFromParent(true);
            coin.opacity = 255;
            coin.name = "";
            this._coinPool.put(coin);
        }
        if (this.ndCoin.children.length > 0) {
            this.recoverAllCoins();
        }
    }

    // 触发免费玩
    public doFreeInfo(data: ps.Dfdc_FreeInfo) {
        if (data.freeTime && data.freeTime > 0) {
            this.updatePlayerBet(data.lastBetLevel, data.lastBetMultiple);
            this.autoTime = 0;
            this.flyCoinDelay = 0;
            this.startFreeGame(data.freeTime);
            this.startGameEffectCtr();
            this.freebtnTip.node.active = true;
            this.freebtnTip.string = `恭喜您获得${data.freeTime.toString()}局免费游戏次数!`;
            // this.ndStartGame.getComponent(cc.Button).interactable = !this.GameEnd;
            // util.setGray(this.ndStartGame, false);
            this.allBetBtnCtr(false);
            if (this.isAuto) {
                this.stopGame();
            }
        }
    }
    // 免费游戏
    public startFreeGame(idx: number) {
        let delay = cc.delayTime(this.autoTime + this.flyCoinDelay);
        let func = cc.callFunc(() => {
            if (!this.isGaming && idx != 0) {
                if (!this.isFree) {
                    this.freeTip.active = true
                    let freeAni = this.freeTip.getComponent(cc.Animation);
                    freeAni.play();
                    this.scheduleOnce(function () {
                        freeAni.play('fmgame_ani2');
                    }, 4);
                    this.tipLab.getComponent(cc.Label).string = idx.toString();
                    this.freebtnTip.node.active = true;
                    this.freebtnTip.string = `按“开始”启动游戏`;
                    this.enterOutfFree(true, 0);
                    this.audioMgr.playFreeStart()
                    this.isFreeBgAuido = true;
                    this.ndStartTextZD.active = false;
                    this.ndStartText.position = cc.v3(0, 0);
                }
                this.enterOutfAuto(false, 0);
                this.curFreeTimes = idx;
                this.isFree = true;
                this.freeBgSpriteFrame(1);
                this.bet.active = false;
                this.freeBet.active = true;
                this.gameBtnCtr();
            }
        });
        //this.FreeIntervalId = cc.sequence(delay, func);
        //this.node.runAction(this.FreeIntervalId);
        this.FreeIntervalTween = cc.tween(this.node).then(cc.sequence(delay, func));
        this.FreeIntervalTween.start();
    }
    //免费切换
    private enterOutfFree(isbool: boolean, freq: number) {
        if (freq != 0) {
            this.audioMgr.playfreeWinning();
        }
        let self = this;
        this.scheduleOnce(function () {
            self.audioMgr.initBg();
            self.audioMgr.playfreeMusic();
        }, freq);
    }
    // 显示图标的胜利动画
    public getWinItems(winArr: winIcon[], rate: number) {
        if (winArr.length != 0) {
            if (winArr.length <= 1) {
                this.winningPlay(winArr, rate);
            } else {
                // if (this.intervalId != null) {
                //     this.node.stopAction(this.intervalId);
                //     this.intervalId = null;
                // }
                if (this.intervalTween != null) {
                    this.intervalTween.stop();
                    this.intervalTween = null;
                }
                let current = 1;
                let winArrs: winIcon[] = [];
                winArrs[0] = winArr[0];
                this.winningPlay(winArrs, rate);
                let delay = cc.delayTime(3.5);
                let func = cc.callFunc(() => {
                    this.hideWinEffect(true);
                    if (current >= winArr.length) {
                        current = 0;
                    }
                    winArrs[0] = winArr[current];
                    this.winningPlay(winArrs, rate);
                    ++current;
                });
                let action1 = cc.sequence(delay, func);
                //this.intervalId = cc.repeatForever(action1);
                //this.node.runAction(this.intervalId);
                this.intervalTween = cc.tween(this.node).then(cc.repeatForever(action1));
                this.intervalTween.start();
            }
        }
    }

    //判断是否中免费
    public isWinningfree(isbool: boolean, lianNum: number) {
        let Quantity = 0;
        let isNumber = 0;
        for (let k = 0; k < this.column; ++k) {
            for (let j = 0; j < 3; ++j) {
                let ketdata = this.slotsResultArr[j][k];
                if (ketdata === ItemId.scatter || ketdata === ItemId.wild) {
                    Quantity++;
                    isNumber = 0;
                    break;
                }
                else {
                    isNumber++;
                }
            }
            if (isNumber >= 3) {
                break;
            }
        }
        if (isbool) {

            return Quantity;

        } else {
            if (lianNum >= 3) {
                let serr: winIcon[] = [{ icon: 16, line: lianNum }];
                this.winningPlay(serr, 2);
            }
        }
    }
    //获取中奖图标
    private winningPlay(winArr: winIcon[], rate: number) {
        let time = 0;
        if (this.isWin) {
            time = this.autoTime;
        }
        let winLine: cc.Node[][] = [[]];
        for (let k = 0; k < winArr.length; ++k) {
            winLine[k] = [];
            let winId = winArr[k].icon;
            for (let i = 0; i < 3; ++i) {
                for (let j = 0; j < this.column; ++j) {
                    if (j < winArr[k].line) {
                        let item = this.slotsItemsArr[j][i];
                        let id = item.getComponent(DFDCItem).id;
                        if (id === winId && id === ItemId.scatter) {
                            let self = this;
                            this.scheduleOnce(this.openScatterEff = () => {
                                if (!self.isGaming) {
                                    self.wildscaplay(item, 2);
                                }
                            }, time + this.flyCoinDelay);
                        } else if (((id === winId || id === ItemId.wild) || (id === winId || id === ItemId.diamond))) {
                            if (id === ItemId.wild) {
                                if (this.isFree && this.isWin) {
                                    if (winId != ItemId.scatter) {
                                        this.wildscaplay(item, 1);
                                    }
                                } else {
                                    this.wildscaplay(item, 1);
                                }
                            } else if (id === ItemId.diamond) {
                                if (!this.diamondAnim.active) {
                                    this.wildscaplay(item, 3);
                                }
                            } else {
                                winLine[k].push(item);
                            }
                        }
                    }
                }
            }
        }
        if (winArr.length > 0) {
            this.showWinEffect(winLine);
        }
    }
    //播放图标特效
    private showWinEffect(winArr: cc.Node[][]) {
        for (let i = 0; i < winArr.length; ++i) {
            winArr[i].forEach(element => {
                element.getComponent(DFDCItem).showWinEffect();
            })
        }
    }

    //打开百搭或免费动画
    private wildscaplay(item: cc.Node, berse: number) {
        let startPos = item.convertToWorldSpaceAR(cc.Vec2.ZERO);
        let pandu: cc.Node = undefined;
        let isOpen = false;
        let winLine = [];
        for (let k = 0; k < this.column; k++) {
            if (berse === 1) { //百搭
                if (this.WildAnim.length === 0) {
                    for (let index = 0; index < this.column; index++) {
                        let pre = cc.instantiate(this.preWildAnim);
                        // let sf = pre.getComponentInChildren(cc.ParticleSystem);
                        // sf.spriteFrame = this.spLight02;
                        pre.active = false;
                        this.parWildnode.addChild(pre);
                        this.WildAnim.push(pre);
                    }
                }
                pandu = this.WildAnim[k];
            }
            else if (berse === 2) {//免费
                if (this.freeAnim.length === 0) {
                    for (let index = 0; index < 16; index++) {
                        let pre = cc.instantiate(this.preFreeAnim);
                        pre.active = false;
                        this.parWildnode.addChild(pre);
                        this.freeAnim.push(pre);
                    }
                }
                pandu = this.freeAnim[k];
            }
            else if (berse === 3) {//钻石
                if (this.diamondDoudle > 0) {
                    pandu = this.diamondAnim;
                    let icon = this.diamondAnim.getChildByName("5_icon");
                    icon.getComponent(cc.Sprite).spriteFrame = this.diamondItem[this.diamondDoudle - 1];
                    icon.getChildByName("5_icon").getComponent(cc.Sprite).spriteFrame = this.diamondItem[this.diamondDoudle - 1];
                }
            }
            else if (berse === 4) {//百搭
                if (this.freeStartAnim.length === 0) {
                    for (let index = 0; index < 5; index++) {
                        let pre = cc.instantiate(this.preFreeStartAnim);
                        pre.active = false;
                        this.paeWildnodeStart.addChild(pre);
                        this.freeStartAnim.push(pre);
                    }
                }
                pandu = this.freeStartAnim[k];
            }

            //这里pandu要判空下,目前代码可能会出现一些pandu为空的情况
            if (!pandu) {
                cc.error("pandu 是空的");
                return;
            }

            if (pandu.active) {
                winLine.push(pandu.position);
            } else if (!isOpen && !pandu.active) {
                isOpen = true;
                pandu.position = cc.v3(pandu.parent.convertToNodeSpaceAR(startPos));
                if (berse === 3) {
                    pandu.position = cc.v3(pandu.x, pandu.y + 5);
                }
                if (winLine.length === 0) {
                    pandu.active = true;
                    pandu.getComponent(cc.Animation).play();
                    let ps = pandu.getChildByName("Particle")
                    if (ps) {
                        ps.getComponent(cc.ParticleSystem).resetSystem();
                    }
                }
                for (let index = 0; index < winLine.length; index++) {
                    if (winLine[index] != pandu.position) {
                        pandu.active = true;
                        pandu.getComponent(cc.Animation).play();
                        //pandu.getChildByName("Particle").getComponent(cc.ParticleSystem).resetSystem();
                        let ps = pandu.getChildByName("Particle")
                        if (ps) {
                            ps.getComponent(cc.ParticleSystem).resetSystem();
                        }
                    }
                }
                if (berse === 4) {
                    let self = this;
                    this.scheduleOnce(function () {
                        for (let index = 0; index < self.freeStartAnim.length; index++) {
                            self.freeStartAnim[index].active = false;
                        }
                    }, 2);

                }

            }
        }

    }
    // 关闭图标特效动画
    public hideWinEffect(isbool: boolean) {
        for (let i = 0; i < this.column; ++i) {
            for (let j = 0; j < this.column; ++j) {
                let item = this.slotsItemsArr[i][j].getComponent(DFDCItem);
                if (isbool) {
                    item.hideWinEffect();
                }
            }
        }

    }

    /**
     * 关闭钻石和免费动画
     */
    hideDiamondAnimt() {
        if (this.diamondAnim.active) {
            this.diamondAnim.active = false;
            this.diamondAnim.position = cc.v3(0, 0);
        }
        for (let i = 0; i < this.column; ++i) {
            if (this.freeAnim.length > 0) {
                this.freeAnim[i].active = false;
                this.freeAnim[i].position = cc.v3(0, 0);
            }
            if (this.freeStartAnim.length > 0) {
                this.freeStartAnim[i].active = false;
                this.freeStartAnim[i].position = cc.v3(0, 0);
            }

            if (this.freeFuZiAnim.length > 0) {
                this.freeFuZiAnim[i].active = false;
                this.freeFuZiAnim[i].position = cc.v3(0, 0);
            }

            if (this.WildAnim.length > 0) {
                this.WildAnim[i].active = false;
                this.WildAnim[i].position = cc.v3(0, 0);
            }
        }
    }


    // 打开彩蛋界面
    async openEggPanel(data: ps.Dfdc_EggInfo) {
        this.enterOutfAuto(false, 0);
        this.isEgg = true;
        this.audioMgr.enterEggState();
        let self = this;
        this.scheduleOnce(function () {
            self.audioMgr.playBowl();
            self.EggPanelani(data);
        }, 5);
    }

    //播放彩蛋动画
    async EggPanelani(data: ps.Dfdc_EggInfo) {
        if (this.EggFault) {
            this.ndTreasureBowl = this.instObj(this.preTreasureBowl, this.ndBowlCollect.parent);
            this.ndTreasureBowl.position = this.ndBowlCollect.position;
            this.ndTreasureBowl.active = true;
            this.ndBowlCollect.active = false;
            await this.dfdccolorPool.getComponent(DFDCCOLORPOOL).playAni(this.ndTreasureBowl);
            this.ndBowlCollect.active = true;
            this.ndTreasureBowl.active = false;
            let prerotio = this.uiLayer.getChildByName(this.preEggPanle.name);
            if (!prerotio) {
                prerotio = cc.instantiate(this.preEggPanle);
                this.uiLayer.addChild(prerotio);
            }
            this.dfdcEgg = prerotio.getComponent(DFDCEgg);
            this.dfdcEgg.showEgg(this, data);
        }
    }

    //判断是否有钻石
    public isWinningDiamond() {
        for (let k = 0; k < 3; ++k) {
            for (let j = 0; j < this.column; ++j) {
                let ketdata = this.slotsResultArr[k][j];
                if (ketdata == ItemId.diamond) {

                    return true;
                }
            }
        }
        return false;

    }
    // 播放BGW胜利动画
    async playWinAni(rate: number, money: number, isAni: boolean) {
        let c = 0;
        if (rate > 0) {
            if (this.gearPos_List[this.gearPosIdx] === this.gearPos_List[0]) {
                c = this.playWinAudio(money, this.win1Clip0);
            }
            else if (this.gearPos_List[this.gearPosIdx] === this.gearPos_List[1]) {
                c = this.playWinAudio(money, this.win1Clip1);
            }
            else if (this.gearPos_List[this.gearPosIdx] === this.gearPos_List[2]) {
                c = this.playWinAudio(money, this.win1Clip2);
            }
            else if (this.gearPos_List[this.gearPosIdx] === this.gearPos_List[3]) {
                c = this.playWinAudio(money, this.win1Clip3);
            }
            else if (this.gearPos_List[this.gearPosIdx] === this.gearPos_List[4]) {
                c = this.playWinAudio(money, this.win1Clip4);
            }
            if (isAni) {

                this.audioMgr.playWinContinue(c, this, true);
            } else {
                if (!this.playerMgr.me.isRatio) {
                    this.audioMgr.playWinContinue(c, this, false);
                }
                if (c > 9 && c < 16) {
                    let num = 15 - c;
                    this.playerMgr.me.showWinEffect(num);
                }
            }


        }

    }

    playWinAudio(money: number, win1Clip: number[]) {
        let c = 0;
        let multiple = this.multiple_list[this.multipleIdx];
        for (let i = 0; i < win1Clip.length; i++) {
            if (money > (win1Clip[win1Clip.length - 1] * multiple)) {
                c = 15;
                return c;
            }
            if (money > (win1Clip[i] * multiple)) {
                c++;
            } else {
                return c;
            }
        }
    }

    // 播放彩池中奖动画
    async playColorPoolAni(idx: number, money: string) {
        this.isEgg = false;
        this.audioMgr.outEggState();
        let self = this;
        this.scheduleOnce(() => {
            self.audioMgr.playColorPool(idx);
            self.updatePlayerGold();
            let aniNode = self.instObj(self.preColorPoolAniAll[idx], self.parColorPoolAni)
            self.Animword(true, false, +money);
            aniNode.active = true;
            self.freebtnTip.node.active = true;
            self.freebtnTip.string = `${self.colorPoolName[idx]} - 赢取${money.toString()}`;
            self.scheduleOnce(function () {
                aniNode.active = false;
                self.isGameEnd();
                self.freebtnTip.node.active = true;
                self.freebtnTip.string = `${self.colorPoolName[idx]} - ${money.toString()}已支付!`;
                self.Animword(false);
            }, 4);
        }, 2);
    }


    //加载物体
    public instObj(pre: cc.Prefab, posit: cc.Node) {
        let prerotio = posit.getChildByName(pre.name);
        if (!prerotio) {
            prerotio = cc.instantiate(pre);
            posit.addChild(prerotio);
            return prerotio;
        } else {
            return prerotio;
        }
    }

    //动画字处理
    private Animword(isswitch: boolean, isPlay?: boolean, money?: number) {
        if (isswitch) {
            this.lblWinAniGold.node.active = true;
            this.lblWinAniGold.node.stopAllActions();
            this.lblWinAniGold.string = money.toString();
        } else {
            this.lblWinAniGold.node.active = false;
        }
    }
    // 初始化彩池金额
    public initColorPools(data: jackPotInfo, isInit: boolean) {
        this.dfdccolorPool.getComponent(DFDCCOLORPOOL).init(data, isInit);
    }

    //播放环境特效
    public playAmbienceEffect(msgInfo: ps.Dfdc_JackPotWinner) {
        if (this.ambienceEffect) {
            this.ambienceEffect.pushMsg(msgInfo);
        }
    }
}
