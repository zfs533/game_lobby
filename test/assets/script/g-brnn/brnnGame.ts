import Game from "../g-share/game";
import PokerGame from "../g-share/pokerGame";
import BRgame from "../g-br/brGame";
import BRplayers from "../g-br/brOtherPlys";

import BrnnMsg from "./brnnMsg"
import BrnnPlyMgr from "./brnnPlayerMgr"
import BrnnPlayer from "./brnnPlayer"
import BrnnAudio from "./brnnAudio"
import { parseLocation, toj, toCNMoney, pad, parabola, setInteractable } from '../common/util';
import { showTip, getAvatar, getAvatarFrame } from "../common/ui"
import { getBullTypeBg } from "../g-nn/nnUtil";
import BrnnShowNew from "./brnnShowNew";

const Decimal = window.Decimal

export enum GameStatus {
    STATUS_FREE,
    STATUS_BET,
    STATUS_DEAL_CARD,
    STATUS_BALANCE,
}

interface DealerInfo {
    rPos: number,
    avatar: number,
    avatarFrame: number,
    gender: number,
    location: string,
    money: string,
    vip: number,
}

enum GameArea {
    DEALER = 0,
    ONE = 1,
    TWO = 2,
    THREE = 3,
    FOUR = 4,
}

enum BullType {
    None,
    Bull1,
    Bull2,
    Bull3,
    Bull4,
    Bull5,
    Bull6,
    Bull7,
    Bull8,
    Bull9,
    DoubleBull,
    BullBoom,
    bullFlower,
    BullSmall
}

enum PanelName {
    Main,
    Dealer,
    Other,
    History,
    Bill,
}


const BULL_CARD_TOTAL = 5;

const enum DEALER_STATUS {
    UP = "上庄",
    DOWN = "下庄",
    WANT = "我要上庄",
    WAIT1 = "等待上庄",
    EXIT = "我要下庄",
    WAIT2 = "等待下庄",
}
interface iConfig {
    "minDealerMoney": string,
    "maxMultiple": number, "maxDealerPay": string, "betList": string[],
    "maxDealerCnt": number, "maxNotBetCnt": number, "sysDealerAvatar": number, "sysDealerAvatarFrame": number,
    "sysDealerGender": number, "sysDealerName": string, "sysDealerMoney": string, "sysDealerPos": number, "sysVipLevel": number,
}

const { ccclass, property } = cc._decorator
@ccclass
export default class BrnnGame extends Game {

    @property(BrnnShowNew)
    newShowNode: BrnnShowNew = undefined;

    @property({ type: BrnnAudio, override: true })
    adoMgr: BrnnAudio = undefined;

    @property({ type: BrnnPlyMgr, override: true })
    plyMgr: BrnnPlyMgr = undefined;

    @property(BRgame)
    brGame: BRgame = undefined;

    @property(PokerGame)
    pkrGame: PokerGame = undefined;

    @property(BRplayers)
    brPlys: BRplayers = undefined;

    @property([cc.Label])
    private areaMoney: cc.Label[] = [];

    @property([cc.Label])
    private areaSelfMoney: cc.Label[] = [];

    @property([cc.Node])
    public nnTypeBgs: cc.Node[] = [];

    @property([cc.Sprite])
    private nnTypes: cc.Sprite[] = [];

    @property([cc.Label])
    private nnBoosts: cc.Label[] = [];

    @property([cc.Label])
    private finalScores: cc.Label[] = [];

    @property(cc.Node)
    private nodeFlyPos: cc.Node = undefined;

    @property(cc.Node)
    private nodeCard: cc.Node = undefined;

    @property(cc.Node)
    private nodeOther: cc.Node = undefined;

    @property(cc.Node)
    private panelTempShow: cc.Node = undefined;

    @property(cc.Node)
    private panelDealer: cc.Node = undefined;

    @property(cc.Node)
    private panelZST: cc.Node = undefined;

    @property(cc.Node)
    private panelBill: cc.Node = undefined;

    @property(cc.Node)
    private panelEnd: cc.Node = undefined;

    @property(cc.Label)
    private labDealer: cc.Label = undefined;

    @property(cc.Label)
    private labRule: cc.Label = undefined;
    @property(cc.Label)
    private labDealerCnt: cc.Label = undefined;

    @property(cc.Prefab)
    private preBullType: cc.Prefab = undefined;

    @property(cc.Prefab)
    private preBullTypeBg: cc.Prefab = undefined;

    @property([cc.Font])
    public fontScores: cc.Font[] = [];

    @property(cc.Prefab)
    private preAnimBetting: cc.Prefab = undefined;

    @property(cc.Prefab)
    private preAnimSend: cc.Prefab = undefined;

    @property(cc.Node)
    private animSuc: cc.Node = undefined;

    @property(cc.Node)
    private animFail: cc.Node = undefined;

    // 倒计时面板
    @property(cc.Node)
    private nodeRest: cc.Node = undefined;

    @property(cc.Node)
    private nodestage: cc.Node = undefined;

    @property(cc.Node)
    private nodeTime: cc.Node = undefined;

    // 庄家
    @property(cc.Sprite)
    private dealerHead: cc.Sprite = undefined;

    @property(cc.Sprite)
    private dealerHeadFrame: cc.Sprite = undefined;

    @property(cc.Label)
    private dealerVip: cc.Label = undefined;

    @property(cc.Label)
    private dealerName: cc.Label = undefined;

    @property(cc.Label)
    private dealerMoney: cc.Label = undefined;

    // 结算
    @property(cc.Node)
    private nodeEndBg: cc.Node = undefined;

    @property(cc.Label)
    private labEndSuc: cc.Label = undefined;

    @property(cc.Label)
    private labEndFail: cc.Label = undefined;

    // 上庄
    @property(cc.Label)
    private bLabLoc: cc.Label = undefined;
    @property(cc.Label)
    private bLabCount: cc.Label = undefined;
    @property(cc.Label)
    private bLabMoney: cc.Label = undefined;
    @property(cc.Label)
    private bLabPeople: cc.Label = undefined;
    @property(cc.Label)
    private bLabMinMoney: cc.Label = undefined;

    @property(cc.Label)
    private bLabMaxDealerCnt: cc.Label = undefined;

    @property(cc.Label)
    private bLabDesc: cc.Label = undefined;
    @property(cc.Node)
    private bSvContent: cc.Node = undefined;

    // 走势图
    @property(cc.Node)
    private zsNodeNew: cc.Node = undefined;
    @property(cc.Node)
    private zsNodeContent: cc.Node = undefined;

    // 战绩
    @property(cc.Node)
    private billContent: cc.Node = undefined;

    @property(cc.Prefab)
    preAnimWin: cc.Prefab = undefined;

    @property(cc.Prefab)
    preParticle: cc.Prefab = undefined;

    private MIN_DEALER_MONEY = "10000";       // 上庄下限
    private MAX_MULTIPLE = 3;               // 最大倍率场次
    private MAX_DEALER_PAY_POINT = "10000";    // 庄家最大赔付值
    private MAX_DEALER_LIST = 5;              // 上庄列表最大数
    private DEALER_RPOS = -1;                 // 庄家坐标
    MAX_DEALER_COUNT = 0;                      // 上庄玩家总庄数

    private CARD_SCALE = 0.45;

    private betTimePanelPosY: number;         // 闹钟初始坐标Y值

    // 庄
    private _sysDealerInfo: DealerInfo;
    private _currDealerPos: number = -1;
    private _dealerList: number[];

    private _currBetPoint: string;
    private _beforeBettingMoney: string;      // 下注之前自己的金额
    private _totalBets: number[];
    public _selfBets: number[];
    private _gameAreaInfo: ps.Brnn_EnterDealCard_Info[];
    private _currPanel: PanelName;

    private _otherPos: cc.Vec2;
    private _dealerPos: cc.Vec2;

    // 组件
    private nnTypeBtns: cc.Button[] = [];
    private zstWins: cc.Node[][] = [];
    private zstFails: cc.Node[][] = [];
    public sfBullTypes: cc.SpriteFrame[] = [];
    public sfBullTypeBgs: cc.SpriteFrame[] = [];

    //五堆牌
    private cardStacks: cc.Node[][] = [];

    msg: BrnnMsg;

    get crDealerPos() {
        return this._currDealerPos;
    }

    onLoad() {
        for (let index = 0; index < this.nnTypes.length; index++) {
            let nnType = this.nnTypes[index];
            this.nnTypeBtns[index] = nnType.node.getComponent(cc.Button);
        }

        let nBullType = cc.instantiate(this.preBullType);
        nBullType.children.forEach(n => this.sfBullTypes[n.name] = n.getComponent(cc.Sprite).spriteFrame);
        let nBullTypeBg = cc.instantiate(this.preBullTypeBg);
        nBullTypeBg.children.forEach(n => this.sfBullTypeBgs[n.name] = n.getComponent(cc.Sprite).spriteFrame);

        this._dealerList = [];

        // 保存走势图的胜败图标
        for (let idx = 0; idx < this.zsNodeContent.childrenCount; idx++) {
            let itemNode = this.zsNodeContent.getChildByName(idx.toString());
            let winArr: cc.Node[] = [];
            let failArr: cc.Node[] = [];
            for (let idx = 0; idx < itemNode.childrenCount / 2; idx++) {
                let labWin = itemNode.getChildByName(`suc${idx}`);
                let labFail = itemNode.getChildByName(`fail${idx}`);
                winArr[idx] = labWin;
                failArr[idx] = labFail;
            }
            this.zstWins[idx] = winArr;
            this.zstFails[idx] = failArr;
        }

        this.onClickClosePanel();
        this._currPanel = PanelName.Main;
        this.betTimePanelPosY = this.nodeTime.y;
        this.showAction(this.nodeTime, false);

        super.onLoad();
        this._otherPos = this.nodeOther.convertToWorldSpaceAR(cc.v2(0, 0));
        this._dealerPos = cc.v2(this.nodeFlyPos.getChildByName("sendCard").position)//this.nodeFlyPos.getChildByName("sendCard").convertToWorldSpaceAR(cc.v2(0, 0));
        this.newShowNode.node.active = false;
        this.newShowNode.init(this);
    }

    initRound(): void {
        // cc.log("  新一轮  ")
        this.brGame.setWaitTips(false)
        this.hideAllPanel();

        this.nodeCard.removeAllChildren();
        this.newShowNode.node.active = false;
        this.cardStacks = [];

        this._totalBets = [0, 0, 0, 0];
        this.areaMoney.forEach(lab => {
            lab.string = "0";
        });
        this.hideSelfArea();
        this.brGame.hideBet();

        this.plyMgr.initBets();
    }

    initGame(): void {
        this.msg = new BrnnMsg(this);
        this.msg.init();
        this.brPlys.hide();
    }

    setGameStart() {
        if (this._currDealerPos !== this.plyMgr.me.pos)
            this.setMeLooker(true);
    }

    setGameEnd() {
        if (this._currDealerPos !== this.plyMgr.me.pos)
            this.setMeLooker(true);
    }

    setMeLooker(isLooker: boolean) {
        let me = this.plyMgr.me;
        me.isLooker = isLooker;
    }

    changeState(s: number, left?: number) {
        super.changeState(s);
    }

    updateUI(): void {
        this.hideAllPanel();
        switch (this.gameState) {
            // 等待开始
            case GameStatus.STATUS_FREE:
                // console.log("等待状态");
                break;
            // 下注
            case GameStatus.STATUS_BET:
                // console.log("下注状态");
                if (this._currDealerPos !== this.DEALER_RPOS) {
                    this.setDealerCnt();
                    let player = this.plyMgr.getPlyByPos(this._currDealerPos);
                    if (player && player.isMe) {
                        this.gaming = true;
                    }
                }
                this.adoMgr.playStartSound();
                this.playAnim(this.preAnimBetting);

                this.showAction(this.nodeTime, true);
                this.panelTempShow.active = true;
                this.nodestage.active = true;
                this.nodeRest.active = false;

                let selfPlayer = this.plyMgr.me;
                if (selfPlayer && (selfPlayer.money !== undefined)) {
                    this._beforeBettingMoney = selfPlayer.money;
                }
                this.setAllowBet();
                break;
            // 发牌、展示
            case GameStatus.STATUS_DEAL_CARD:
                // console.log("发牌展示状态");
                this.showAction(this.nodeTime, false);
                this.panelTempShow.active = true;
                this.brGame.hideBet();
                break;
            // 结算
            case GameStatus.STATUS_BALANCE:
                // console.log("结算状态");
                this.hideTicker();
                this.showAction(this.nodeTime, true);
                this.panelTempShow.active = true;
                this.nodeRest.active = true;
                this.nodestage.active = false;
                this.nodeCard.removeAllChildren();
                this.newShowNode.node.active = false;
                this.brGame.hideBet();
                break;
        }
        this.menu.hideChangeBtn();
    }

    dealRoomData(data: ps.GameRoomHandlerGetRoomData) {
        let config = toj<iConfig>(data.config)
        this.MAX_DEALER_PAY_POINT = config.maxDealerPay;
        this.MIN_DEALER_MONEY = config.minDealerMoney;
        this.MAX_MULTIPLE = config.maxMultiple;
        this.MAX_DEALER_COUNT = config.maxNotBetCnt;

        let avatar = config.sysDealerAvatar;
        let avatarFrame = config.sysDealerAvatarFrame;
        let gender = config.sysDealerGender;
        let location = config.sysDealerName;
        let money = config.sysDealerMoney;
        let vip = config.sysVipLevel;

        this._sysDealerInfo = { rPos: config.sysDealerPos, avatar: avatar, avatarFrame: avatarFrame, gender: gender, location: location, money: money, vip: vip };

        this.labRule.string = `1~${this.MAX_MULTIPLE}倍场`;
        this.bLabMaxDealerCnt.string = this.MAX_DEALER_COUNT.toString()

        this.bLabMinMoney.string = this.checkFloatCNMoney(this.MIN_DEALER_MONEY);;

        this.brGame.setChipPoint(config.betList);
        this.brGame.clickBetLsr = this.onClickBet.bind(this);
        this.brGame.clickAreaLsr = this.onClickArea.bind(this);
        this.initRound();
    }

    private checkFloatCNMoney(money: string) {
        let cnMoney = toCNMoney(money);
        let arr = cnMoney.split(".00")
        if (arr.length > 0) {
            let val = "";
            arr.forEach((v) => {
                val += v;
            })
            cnMoney = val;
        }
        return cnMoney;
    }

    refreshRoomInfo() {
        this.setAllowBet();
    }

    /**
     * 刷新已打开面板内容
     */
    updatePanel() {
        if (this._currPanel === PanelName.Dealer) {
            this.msg.sendDealerList();
        } else if (this._currPanel === PanelName.Other) {
            this.onClickOtherPlayer()
        } else if (this._currPanel === PanelName.History) {
            this.msg.sendGameHistory();
        } else if (this._currPanel === PanelName.Bill) {
            this.msg.sendGamerHistory();
        }
    }

    /**
     * 上庄界面
     * @param dealerPos
     * @param ctuCnt
     */
    showDealer(dealerPos: number[], ctuCnt?: number) {
        this._currPanel = PanelName.Dealer;
        this.panelDealer.active = true;
        let info: any;
        if (this._currDealerPos === -1) {
            info = this._sysDealerInfo;
        } else {
            info = this.plyMgr.getPlyInfoByPos(this._currDealerPos);
        }
        if (info) {
            this.bLabLoc.string = info.location;
            this.bLabMoney.string = toCNMoney(info.money);
        }

        if (dealerPos && dealerPos.length > 0) {
            this._dealerList = dealerPos;
            this.bLabPeople.string = dealerPos.length.toString();
            this.bSvContent.active = true;

            let itemNode = this.bSvContent.getChildByName("item");
            this.bSvContent.children.forEach((v) => {
                v.destroy();
            });
            for (let index = 0; index < dealerPos.length; index++) {
                let playerInfo = this.plyMgr.getPlyInfoByPos(dealerPos[index]);
                let item = cc.instantiate(itemNode);
                item.active = true;
                this.bSvContent.addChild(item);
                let vipLv = item.getChildByName("vipLevel").getComponent(cc.Label)
                let sort = item.getChildByName("sort").getComponent(cc.Label);
                let loc = item.getChildByName("loc").getComponent(cc.Label);
                let money = item.getChildByName("money").getComponent(cc.Label);
                vipLv.string = playerInfo.vipLevel.toString();
                sort.string = `${index + 1}`;
                loc.string = playerInfo.location;
                money.string = toCNMoney(playerInfo.money);
            }
        } else {
            this._dealerList = [];
            this.bLabPeople.string = "0";
            this.bSvContent.active = false;
        }
        this.bLabDesc.string = DEALER_STATUS.UP;
        if (ctuCnt !== undefined) {
            this.bLabCount.string = `第${ctuCnt}轮`;
        }

        // 判断自己是否在庄或在排队列表中
        this._dealerList.forEach(pos => {
            let player = this.plyMgr.getPlyByPos(pos);
            if (player && player.isMe) {
                this.bLabDesc.string = DEALER_STATUS.DOWN;
                this.labDealer.string = DEALER_STATUS.WAIT1;
            }
        });
        if (this._currDealerPos !== undefined) {
            let player = this.plyMgr.getPlyByPos(this._currDealerPos);
            if (player && player.isMe) {
                this.bLabDesc.string = DEALER_STATUS.DOWN;
            }
        }
    }

    /**
     * 走势图界面
     * @param history
     */
    showHistory(history: ps.Brnn_GameHistory_areaWin[]) {
        this._currPanel = PanelName.History;
        this.panelZST.active = true;
        history.reverse();
        if (history.length > 0) {
            this.zsNodeNew.active = true;
            this.zsNodeContent.active = true;

            for (let idx = 0; idx < this.zsNodeContent.childrenCount; idx++) {
                let itemNode = this.zsNodeContent.getChildByName(idx.toString());
                if (idx < history.length) {
                    itemNode.opacity = 255;
                    let histInfo = history[idx];
                    let wins = this.zstWins[idx];
                    wins[0].active = !!histInfo.area1;
                    wins[1].active = !!histInfo.area2;
                    wins[2].active = !!histInfo.area3;
                    wins[3].active = !!histInfo.area4;
                    let fails = this.zstFails[idx];
                    fails[0].active = !histInfo.area1;
                    fails[1].active = !histInfo.area2;
                    fails[2].active = !histInfo.area3;
                    fails[3].active = !histInfo.area4;
                } else {
                    itemNode.opacity = 0;
                }
            }
        } else {
            this.zsNodeNew.active = false;
            this.zsNodeContent.active = false;
        }
    }

    showMyBill(billHistory: ps.Brnn_PlayerHistory_playerHistory[]) {
        this._currPanel = PanelName.Bill;
        this.panelBill.active = true;
        if (billHistory.length > 0) {
            let itemNode = this.billContent.getChildByName("item");
            this.billContent.children.forEach((v) => {
                v.destroy();
            });

            for (let idx = 0; idx < billHistory.length; idx++) {
                let bill = billHistory[idx];
                let col = (+bill.win >= 0) ? (new cc.Color).fromHEX("#000000C8") : (new cc.Color).fromHEX("#A7D6FF");

                let item = cc.instantiate(itemNode);
                item.active = true;
                this.billContent.addChild(item);

                let labNumber = item.getChildByName("number").getComponent(cc.Label);
                let labTime = item.getChildByName("time").getComponent(cc.Label);
                let labMoney = item.getChildByName("money").getComponent(cc.Label);
                // let labTax = item.getChildByName("tax").getComponent(cc.Label);
                labNumber.string = `${idx + 1}`;
                let date = new Date(bill.startTime);
                let dateStr = date.getFullYear() + "-" + pad(date.getMonth() + 1, 2) + "-" + date.getDate() + " " + pad(date.getHours(), 2) + ":" + pad(date.getMinutes(), 2);
                labTime.string = dateStr;
                labMoney.string = bill.win;
                labMoney.node.color = col;
                // labTax.string = bill.tax;
            }
        }
    }

    // 不能大于 (庄家自己的本钱和最大赔付值的最小值)
    private getDealerPay() {
        let dealerInfo: any;
        if (this._currDealerPos === -1) {
            dealerInfo = this._sysDealerInfo;
        } else {
            dealerInfo = this.plyMgr.getPlyInfoByPos(this._currDealerPos);
        }
        let dealerMoney = this.MAX_DEALER_PAY_POINT;
        if (dealerInfo) {
            dealerMoney = dealerInfo.money;
        }
        let minPayMoney = (dealerMoney > this.MAX_DEALER_PAY_POINT) ? this.MAX_DEALER_PAY_POINT : dealerMoney;
        return minPayMoney;
    }

    getDealerPly() {
        return this.plyMgr.getPlyByPos(this.crDealerPos);
    }

    /**
     * 点击下注区
     * @param idx
     */
    onClickArea(idx: number) {
        // 排除自己是庄家的情况
        let player = this.plyMgr.getPlyByPos(this._currDealerPos);
        if (player && player.isMe) {
            showTip("庄家无法下注哦～");
            return false;
        }
        if (this._currDealerPos && this.gameState === GameStatus.STATUS_BET) {
            let player = this.plyMgr.me;
            if (new Decimal(player.money).gt(this._currBetPoint)) {
                let areaTotalPoint = new Decimal(0);
                this._totalBets.forEach(money => {
                    areaTotalPoint = areaTotalPoint.add(money);
                });
                let currTotalPoint = areaTotalPoint.add(this._currBetPoint);
                currTotalPoint = currTotalPoint.mul(this.MAX_MULTIPLE);

                let minPayMoney = this.getDealerPay();
                if (currTotalPoint.lt(minPayMoney)) {
                    // 自己下注的区域总金额不能大于自己最大赔付率
                    let selfTotalAreaMoney = new Decimal(0);
                    this._selfBets.forEach(money => {
                        selfTotalAreaMoney = selfTotalAreaMoney.add(money);
                    });

                    let currSelfPoint = selfTotalAreaMoney.add(this._currBetPoint);
                    let maxBetPoint = currSelfPoint.mul(this.MAX_MULTIPLE);

                    if (maxBetPoint.lte(this._beforeBettingMoney)) {
                        this.msg.sendDoBet(+idx + 1, this._currBetPoint);
                        this.brGame.chipFlyArea(idx, player.convertToWorldPos(), +this._currBetPoint);
                        return true;
                    } else {
                        showTip("不能下注了，您的余额已经不足最大赔率咯~~");
                    }
                    this.setAllowBet();
                } else {
                    showTip("不能下注了，超过庄家最大赔付值咯~~");
                }
            } else {
                console.warn("钱不够了");
            }
        }
        return false;
    }

    onClickBet(idx: number) {
        this._currBetPoint = this.brGame.chipPoints[idx];
        return this.gameState === GameStatus.STATUS_BET;
    }

    onClickDealer() {
        let btnText = this.labDealer.string;
        if (btnText === DEALER_STATUS.WANT) {
            this.msg.sendDealerList();
        } else if (btnText === DEALER_STATUS.EXIT) {
            this.msg.sendExitDealer();
            this.labDealer.string = DEALER_STATUS.WAIT2;
        } else if (btnText === DEALER_STATUS.WAIT2) {
            showTip("此轮结束即可下庄噢~~");
        }
    }

    onClickDoDealer() {
        if (this._dealerList.length >= this.MAX_DEALER_LIST) {
            showTip(`排队人数已达${this.MAX_DEALER_LIST}人上限，请稍后再来噢~~`);
        } else {
            let btnText = this.bLabDesc.string;
            if (btnText === DEALER_STATUS.UP) {
                console.log("上庄");
                let player = this.plyMgr.me;
                if (new Decimal(player.money).gte(this.MIN_DEALER_MONEY)) {
                    this.msg.sendDoDealer();
                } else {
                    showTip(`亲，金币不足不能上庄噢~~`);
                }
            } else if (btnText === DEALER_STATUS.DOWN) {
                console.log("下庄");
                this.msg.sendExitDealer();
                // this.msg.sendDealerList();
            }
        }
    }

    onClickOtherPlayer() {
        this.brPlys.show(this.plyMgr.getAllPlayerInfo());
    }

    onClickBill() {
        this.msg.sendGamerHistory();
    }

    onClickZoushi() {
        this.msg.sendGameHistory();
    }

    onClickGame() {
        this.panelEnd.active = false;
        this.animSuc.active = false;
        this.animFail.active = false;
    }

    onClickClosePanel() {
        let currPanel: cc.Node;
        if (this.panelDealer.active) {
            currPanel = this.panelDealer;
        }
        if (this.brPlys.active) {
            this.brPlys.hide();
        }
        if (this.panelZST.active) {
            currPanel = this.panelZST;
        }
        if (this.panelBill.active) {
            currPanel = this.panelBill;
        }
        if (currPanel) {
            let actions = cc.sequence(
                cc.fadeTo(0.3, 0),
                cc.callFunc(() => {
                    currPanel.opacity = 255;
                    currPanel.active = false;
                }),
            )
            // currPanel.runAction(actions);
            cc.tween(currPanel).then(actions).start();
        }
        this._currPanel = PanelName.Main;
    }

    /**
     * 上庄
     * @param dealerPos
     * @param dealerCnt
     */
    setDealerUI(dealerPos: number, dealerCnt: number) {
        this._currDealerPos = dealerPos;

        let bankInfo: any;
        if (dealerPos === -1) {
            bankInfo = this._sysDealerInfo;
            this.labDealerCnt.node.active = false;
        } else {
            bankInfo = this.plyMgr.getPlyInfoByPos(dealerPos);
            this.setDealerCnt(dealerCnt);
        }

        if (bankInfo) {
            this.dealerHead.spriteFrame = getAvatar(!!bankInfo.gender, bankInfo.avatar);
            getAvatarFrame(bankInfo.avatarFrame, this.dealerHeadFrame);
            if (bankInfo.vip) {
                this.dealerVip.node.parent.active = false;
                this.dealerVip.string = bankInfo.vip.toString();
            } else {
                this.dealerVip.node.parent.active = true;
                this.dealerVip.string = bankInfo.vipLevel.toString();
            }

            this.dealerName.string = parseLocation(bankInfo.location);
            this.dealerMoney.string = toCNMoney(bankInfo.money)


            // 自己当庄的话要屏蔽所有按钮
            let player = this.plyMgr.getPlyByPos(this._currDealerPos);
            if (player && player.isMe) {
                this.labDealer.string = DEALER_STATUS.EXIT;
                this.brGame.hideBet();
                // 关闭上庄界面
                this.onClickClosePanel();
            } else {
                this.labDealer.string = DEALER_STATUS.WANT;
            }
        }
    }

    /**
     * 挑选自己可选择的筹码
     */
    setAllowBet() {
        let player = this.plyMgr.getPlyByPos(this._currDealerPos);
        if (player && player.isMe)
            return;

        // 自己当前所有下注额
        let selfTotalAreaMoney = new Decimal(0);
        if (this._selfBets) {
            this._selfBets.forEach(money => {
                selfTotalAreaMoney = selfTotalAreaMoney.add(money);
            });
        }


        let money = new Decimal(this.plyMgr.me.money);
        let maxMult = new Decimal(this.MAX_MULTIPLE);
        let bBetMoney = this._beforeBettingMoney ? new Decimal(this._beforeBettingMoney) : money;

        let allowNum = 0;
        let currChooseNum = 0;
        for (let idx = 0; idx < this.brGame.chipPoints.length; idx++) {
            let btnScore = this.brGame.chipPoints[idx];
            // 当前金额要大于等于自己可赔的最大倍率
            let isSelfMaxMul = money.gte(maxMult.mul(btnScore));
            // 下注后的总金额不能大于自己下注之前可赔的最大倍率
            let maxBetPoint = selfTotalAreaMoney.add(btnScore).mul(maxMult);
            let isDeaMaxMul = bBetMoney.gte(maxBetPoint);
            if (isSelfMaxMul && isDeaMaxMul) {
                allowNum += 1;
                if (this._currBetPoint && (this._currBetPoint === this.brGame.chipPoints[idx])) {
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
            let maxBetVal = this.brGame.chipPoints[allowNum - 1];
            this._currBetPoint = maxBetVal;

            this.brGame.setBetLight(allowNum - 1);
        } else {
            this.brGame.setAllowBet(0);
            this.brGame.setBetLight(-1);
        }
    }

    /**
     * 设置该区域所有的筹码
     */
    setTotalAreaMoney(pos: number, bet: string, showDefaultBet = false) {
        if (!this._totalBets || new Decimal(bet).eq(0) || pos === GameArea.DEALER) return;

        let areaIdx = pos - 1;
        this._totalBets[areaIdx] = new Decimal(this._totalBets[areaIdx]).add(bet).toNumber();
        this.areaMoney[areaIdx].string = this._totalBets[areaIdx].toString();

        if (showDefaultBet) {
            this.brGame.setAreaMoney(areaIdx, +bet)
        }
    }

    /**
     * 设置该区域自己的筹码
     */
    setSelfAreaMoney(pos: number, bet: string) {
        if (!this._selfBets || new Decimal(bet).eq(0)) return;

        let areaIdx = pos - 1;
        this._selfBets[areaIdx] = new Decimal(this._selfBets[areaIdx]).add(bet).toNumber();
        let labArea = this.areaSelfMoney[areaIdx];
        labArea.node.active = true;
        labArea.string = this._selfBets[areaIdx].toString();
        labArea.node.getParent().active = true;

        this.setMeLooker(false);
    }

    /**
     * 设置坐庄轮数
     * @param count
     */
    setDealerCnt(count?: number) {
        this.labDealerCnt.node.active = true;
        if (count === undefined) {
            let desc = this.labDealerCnt.string;
            count = +desc.substring(desc.length - 1);
            count += 1;
        }
        this.labDealerCnt.string = `连庄 X ${count}`;
    }

    setTimer(time: number) {
        if (this.gameState === GameStatus.STATUS_BET || this.gameState === GameStatus.STATUS_BALANCE) {
            this.showTicker(time);
        }
    }

    private showAction(node: cc.Node, show: boolean, callFunc?: Function) {
        callFunc = callFunc || function () { };
        if (show) {
            node.stopAllActions();
            node.scale = 0;
            node.y = this.betTimePanelPosY - 45;
            let actions = cc.spawn(
                cc.scaleTo(0.1, 1, 1),
                cc.moveBy(0.3, 0, 45).easing(cc.easeBackOut()),
                cc.fadeIn(0.3)
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

                cc.callFunc(() => {
                    node.y = this.betTimePanelPosY + 45;
                    callFunc();
                })
            )
            // node.runAction(actions);
            cc.tween(node).then(actions).start();
        }
    }

    /**
     * 隐藏所有面板
     */
    hideAllPanel() {
        // this.panelTimer.active = false;
        this.nodeRest.active = false;
        this.nodestage.active = false;
        this.panelTempShow.active = false;

        this.panelEnd.active = false;
        this.animSuc.active = false;
        this.animFail.active = false;

        this.brGame.hideArea();
        this.nnTypeBgs.forEach(node => {
            node.active = false;
        });
        this.nnTypes.forEach(sprite => {
            sprite.node.active = false;
        });
        this.nnBoosts.forEach(lab => {
            lab.node.active = false;
        });
        this.finalScores.forEach(lab => {
            lab.node.active = false;
        });
    }

    /**
     * 隐藏自己所下注区域
     */
    hideSelfArea() {
        this._selfBets = [0, 0, 0, 0];
        this.areaSelfMoney.forEach(lab => {
            lab.node.active = false;
            lab.node.getParent().active = false;
        });
    }

    /**
     * 下注
     */
    plyDoBet(pos: number, area: number, bet: string) {
        let player = this.plyMgr.getPlyByPos(pos);
        if (player) {
            if (player.isMe) {
                this.setSelfAreaMoney(area, bet);
                this.setAllowBet();
            } else {
                this.brGame.chipFlyArea(area - 1, player.convertToWorldPos(), +bet);
            }
            player.doBeting(area, bet, !player.isMe);
        } else {
            //this.brGame.chipFlyArea(area - 1, this._otherPos, +bet);
            this.brGame.chipFlyAreaOther(area - 1, this.nodeOther.position, +bet);
        }
    }

    /**
     * 展示牌动作
     * @param areaInfos
     */
    async flySendCard(areaInfos: ps.Brnn_EnterDealCard_Info[]) {
        this.adoMgr.playStartSound();
        await this.playAnim(this.preAnimSend);

        this._gameAreaInfo = areaInfos;
        this._gameAreaInfo.sort((a, b) => { return a.area - b.area });
        //先发庄家牌
        // await this.cardFlyAnim(this._gameAreaInfo[0], this._dealerPos);
        this.newShowNode.layoutCard(this._gameAreaInfo[0]);
        //再发四家
        for (let areaPos = GameArea.ONE; areaPos <= GameArea.FOUR; areaPos++) {
            let areaInfo = this._gameAreaInfo[areaPos];
            this.adoMgr.playSendCard();
            // await this.cardFlyAnim(areaInfo, this._dealerPos);
            this.newShowNode.layoutCard(areaInfo);
        }
        this.newShowNode.node.active = true;

        //一起翻开
        let turnPros: Promise<{}>[] = [];
        for (let idx = 0; idx < this._gameAreaInfo.length; idx++) {
            let areaInfo = this._gameAreaInfo[idx];
            turnPros.push(this.turnFrontCards(areaInfo));
        }
        await Promise.all(turnPros);

        //庄家开牌
        await this.turnOneCard(this._gameAreaInfo[0]);
        //四家开牌
        for (let areaPos = GameArea.ONE; areaPos <= GameArea.FOUR; areaPos++) {
            let areaInfo = this._gameAreaInfo[areaPos];
            this.adoMgr.playSendCard();
            await this.turnOneCard(areaInfo);
        }

        // 展示胜利区域
        for (let areaPos = GameArea.ONE; areaPos <= GameArea.FOUR; areaPos++) {
            let areaInfo = this._gameAreaInfo[areaPos];
            // 要判断输赢
            if (areaInfo.area > GameArea.DEALER && !!areaInfo.isWin) {
                this.brGame.setAreaEff(areaInfo.area - 1);
            }
        }
    }

    /**
     * 直接显示牌
     * @param areaInfos
     */
    showAllCards(areaInfos: ps.Brnn_GameInfo_AreaInfo[]) {
        areaInfos.sort((a, b) => { return a.area - b.area })
        this._gameAreaInfo = areaInfos;
        for (let idx = 0; idx < areaInfos.length; idx++) {
            let areaInfo = areaInfos[idx];
            if (areaInfo.cards) {
                this.newShowNode.node.active = true;
                this.newShowNode.layoutCard(areaInfo);
                // let cardBox = this.nodeFlyPos.getChildByName(`card${areaInfo.area}`);
                // areaInfo.cards.forEach((cardData, i) => {
                //     let node = this.pkrGame.getPoker(cardData);
                //     this.nodeCard.addChild(node);
                //     node.setPosition(cc.v2(cardBox.x + i * 22, cardBox.y));
                //     this.pkrGame.pokerTurn(node, true, true, this.CARD_SCALE);
                // });
                // this.cardNNType(areaInfo, 0.2);

                // 计算输赢
                if (areaInfo.area > GameArea.DEALER && !!areaInfo.isWin) {
                    this.brGame.setAreaEff(areaInfo.area - 1);
                }
            }
            this.setTotalAreaMoney(areaInfo.area, areaInfo.totalBets, true);
        }
    }

    private cardFlyAnim(areaInfo: ps.Brnn_EnterDealCard_Info, beginPos: cc.Vec2) {
        beginPos = beginPos//this.nodeCard.convertToNodeSpaceAR(beginPos);
        return new Promise(resolve => {
            this.cardStacks[areaInfo.area] = areaInfo.cards.map(cardData => {
                let node = this.pkrGame.getPoker(cardData);
                this.nodeCard.addChild(node);
                node.setPosition(beginPos.x, beginPos.y);
                this.pkrGame.pokerTurn(node, false, false, this.CARD_SCALE);
                node.scale = 0;
                return node;
            });

            let cardBox = this.nodeFlyPos.getChildByName(`card${areaInfo.area}`);
            for (let idx = 0; idx < BULL_CARD_TOTAL; idx++) {
                let nodeCard = this.cardStacks[areaInfo.area][idx];
                let moveTime = 0.3;
                let actions = cc.sequence(
                    cc.delayTime(idx * 0.05),
                    cc.spawn(
                        cc.scaleTo(moveTime, this.CARD_SCALE, this.CARD_SCALE),
                        parabola(moveTime, nodeCard.getPosition(), cc.v2(cardBox.x + idx * 22, cardBox.y))
                    ),
                    //翻牌
                    cc.callFunc(() => {
                        //发第1张牌时，开始发下一个堆
                        if (idx === 0) {
                            resolve(true);
                        }
                    }),
                )
                // nodeCard.runAction(actions);
                cc.tween(nodeCard).then(actions).start();
            }
            this.newShowNode.layoutCard(areaInfo);
        });
    }

    private turnFrontCards(areaInfo: ps.Brnn_EnterDealCard_Info) {
        return new Promise(resolve => {
            let nCards = this.cardStacks[areaInfo.area];
            let pros: Promise<{}>[] = [];
            for (let idx = 0; idx < nCards.length; idx++) {
                let nodeCard = nCards[idx];
                let actions = cc.sequence(
                    cc.delayTime(idx * 0.05),
                    //翻牌
                    cc.callFunc(() => {
                        if (idx == 3) {
                            this.pkrGame.pokerTurn(nodeCard, false, false, this.CARD_SCALE);
                        } else {
                            pros.push(this.pkrGame.pokerTurn(nodeCard, true, true, this.CARD_SCALE));
                        }
                    }),
                    cc.delayTime(1),
                    cc.callFunc(() => {
                        resolve();
                    }),
                )
                // nodeCard.runAction(actions);
                cc.tween(nodeCard).then(actions).start();
            }
        });
    }

    private turnOneCard(areaInfo: ps.Brnn_EnterDealCard_Info) {
        return new Promise(resolve => {
            //中心坐标和每张牌原始坐标存下来
            let cards = this.cardStacks[areaInfo.area];
            let centerX = cards[2].x;
            let oriXArr = [];
            for (let idx = 0; idx < cards.length; idx++) {
                oriXArr.push(cards[idx].x);
            }
            for (let idx = 0; idx < cards.length; idx++) {
                let nodeCard = cards[idx];
                let moveTime = 0.2;
                let actions = cc.sequence(
                    cc.moveTo(moveTime, new cc.Vec2(centerX, nodeCard.y)),
                    cc.callFunc(() => {
                        if (idx == 3) {
                            this.pkrGame.pokerTurn(nodeCard, true, false, this.CARD_SCALE);
                        }
                    }),
                    cc.moveTo(moveTime, new cc.Vec2(oriXArr[idx], nodeCard.y)),
                    cc.callFunc(() => {
                        if (idx === cards.length - 1) {
                            this.cardNNType(areaInfo, 0.5);
                            resolve(true);
                        }
                    }),
                )
                // nodeCard.runAction(actions);
                cc.tween(nodeCard).then(actions).start();
            }
        });
    }

    /**
     * 展示牌类型和自己的输赢
     * @param areaInfo
     * @param animTime
     */
    private cardNNType(areaInfo: ps.Brnn_EnterDealCard_Info, animTime: number) {
        // 用庄家的声音
        let playInfo;
        if (this._currDealerPos === -1) {
            playInfo = this._sysDealerInfo;
        } else {
            playInfo = this.plyMgr.getPlyInfoByPos(this._currDealerPos);
        }

        if (playInfo) {
            if (areaInfo.bullType === BullType.BullBoom) {
                this.adoMgr.playBullBoom(!!playInfo.gender);
            } else if (areaInfo.bullType === BullType.bullFlower) {
                this.adoMgr.playBullMarbled(!!playInfo.gender);
            } else if (areaInfo.bullType === BullType.BullSmall) {
                this.adoMgr.playBullSmall(!!playInfo.gender);
            } else {
                this.adoMgr.playBull(!!playInfo.gender, areaInfo.bullType);
            }
        }

        return;
        let bullBgIdx = getBullTypeBg(areaInfo.bullType)
        this.nnTypeBgs[areaInfo.area].getComponent(cc.Sprite).spriteFrame = this.sfBullTypeBgs[bullBgIdx];
        this.nnTypeBgs[areaInfo.area].active = true;
        let nnType = this.nnTypes[areaInfo.area];
        nnType.node.active = true;
        nnType.spriteFrame = this.sfBullTypes[areaInfo.bullType];
        nnType.node.stopAllActions();
        nnType.node.scale = 0;
        // nnType.node.runAction(cc.scaleTo(animTime, 1, 1).easing(cc.easeBounceOut()));
        cc.tween(nnType.node).then(cc.scaleTo(animTime, 1, 1).easing(cc.easeBounceOut())).start();

        if (!areaInfo.isWin && areaInfo.area > GameArea.DEALER) {
            setInteractable(this.nnTypeBtns[areaInfo.area], false);
        } else {
            setInteractable(this.nnTypeBtns[areaInfo.area], true);
        }

        let areaIdx = areaInfo.area;
        if (areaInfo.area >= GameArea.DEALER) {
            let lab_score = this.finalScores[areaIdx];
            lab_score.node.active = true;
            lab_score.string = "";
            lab_score.node.color = cc.Color.BLACK.fromHEX("#FFFFFF");
            let lab_boost = this.nnBoosts[areaIdx];
            lab_boost.node.active = true;

            let selfBet = +this._selfBets[areaIdx - 1];

            //下注了的文字
            if (selfBet > 0) {
                lab_score.fontSize = 20;
                if (areaInfo.isWin > 0) {
                    lab_score.font = this.fontScores[0];
                } else {
                    selfBet = -selfBet;
                    lab_score.font = this.fontScores[1];
                }
                lab_score.string = new Decimal(selfBet).mul(areaInfo.boost).toString();
            }
            //没下注的文字
            else {
                lab_score.font = null;
                lab_score.fontSize = 18;
                lab_score.string = "未下注";
                lab_score.node.color = cc.Color.BLACK.fromHEX("#5E1915");
            }
            lab_score.node.stopAllActions();

            if (areaInfo.boost) {
                lab_boost.string = `x${areaInfo.boost}`;
            } else {
                lab_boost.string = "";
            }
            lab_boost.node.stopAllActions();
        }
    }

    /**
     * 结算动画
     */
    async showBalanceAnim(balanceInfo?: ps.Brnn_EnterBalance_Info[]) {
        if (!balanceInfo) return;
        await this.dealerAreaAnim();

        // 赢钱区域
        let winAreaPos: number[] = [];
        for (let areaPos = GameArea.ONE; areaPos <= GameArea.FOUR; areaPos++) {
            let areaInfo = this._gameAreaInfo[areaPos];
            if (areaInfo.isWin) {
                winAreaPos.push(areaPos);
            }
        }
        // 遍历玩家数据
        let winPlyArea: { [area: number]: BrnnPlayer[] } = {};
        let tablePlyInfos: ps.Brnn_EnterBalance_Info[] = [];
        let zero = new Decimal(0);
        balanceInfo.forEach(info => {
            // 同步玩家数据、总下注额、连胜次数
            let finalChg = new Decimal(info.chgMoney);
            this.plyMgr.updatePlyBets(info.pos, finalChg.toString(), info.totalBets, info.winCnt);

            // 记录桌上玩家信息
            let player = this.plyMgr.getPlyByPos(info.pos);
            if (player) {
                // 按赢钱区域来存储玩家
                if (zero.lessThanOrEqualTo(info.chgMoney)) {
                    let betInfos = player.areaBetInfos;
                    for (let idx = 0; idx < winAreaPos.length; idx++) {
                        let areaPos = winAreaPos[idx];
                        if (betInfos[areaPos] && zero.lt(betInfos[areaPos])) {
                            if (winPlyArea[areaPos] === undefined) {
                                winPlyArea[areaPos] = [];
                            }
                            winPlyArea[areaPos].push(player);
                        }
                    }
                }
                tablePlyInfos.push(info);

                // 计算玩家最后的金额时，桌子上的玩家要把下注的金额补回来
                let betInfos = player.areaBetInfos;
                let beforeBet = new Decimal(player.money).add(finalChg);
                for (let areaPos = GameArea.ONE; areaPos <= GameArea.FOUR; areaPos++) {
                    if (betInfos[areaPos]) beforeBet = beforeBet.add(betInfos[areaPos]);
                }
                player.money = beforeBet.toString();
            }
        });
        // cc.log("tablePlyInfos = ", tablePlyInfos);

        //----------------------------从赢钱区域飞向赢钱的桌上玩家和其他玩家
        let flyPromiseArr: Promise<{}>[] = [];
        for (let areaPos = GameArea.ONE; areaPos <= GameArea.FOUR; areaPos++) {
            let winPlayers = winPlyArea[areaPos];
            if (winPlayers) {
                winPlayers.forEach(player => {
                    let plyMoney = player.areaBetInfos[areaPos];
                    let playerPos = player.convertToWorldPos();
                    flyPromiseArr.push(this.brGame.chipFlyPly(areaPos - 1, playerPos, +plyMoney));
                    //赢家动画，会有重复的，因为一个人可能赢几堆
                    this.playWinAnim(player);
                });
            }
            // 赢钱区域剩下的筹码飞向其他玩家
            if (winAreaPos.indexOf(areaPos) !== -1) {
                //flyPromiseArr.push(this.brGame.chipFlyPly(areaPos - 1, this._otherPos));
                flyPromiseArr.push(this.brGame.chipFlyPlyOther(areaPos - 1, this.nodeOther.position));
            }
        }

        // cc.log("flyPromiseArr = " + flyPromiseArr.length);
        if (flyPromiseArr.length > 0) {
            this.adoMgr.playCoins();
            await Promise.all(flyPromiseArr);
        }
        // cc.log("-------111---");
        //-------------------------- 更新桌上玩家金币
        let selfChg = "";
        if (this.crDealerPos !== -1) {  // 如果不是系统庄必定是玩家
            let ply = this.plyMgr.getPlyInfoByPos(this.crDealerPos)
            this.dealerMoney.string = toCNMoney(ply.money);
        }
        if (tablePlyInfos.length > 0) {
            tablePlyInfos.forEach(info => {
                let player = this.plyMgr.getPlyByPos(info.pos);
                player.updateMoney();
                // 更新金币
                if (player.isMe) {
                    selfChg = info.chgMoney;
                }
                // 输赢飘字
                if (+info.chgMoney !== 0) {
                    player.showWinOrLost(info.chgMoney);
                }

            })
        }

        // cc.log('selfChg: ', selfChg);
        this.selfBalance(selfChg);

        // 清空显示金额
        for (let idx = GameArea.ONE; idx <= GameArea.FOUR; idx++) {
            let areaIdx = idx - 1;
            this.areaMoney[areaIdx].string = "0";
        }

        // 刷新桌上玩家
        this.plyMgr.updateTablePlayer();
        if (this.brPlys.active) {
            this.onClickOtherPlayer();
        }
    }

    /**
     * 庄家与各区域之间的输赢动画
     */
    private async dealerAreaAnim() {
        let delayTime = 1; // 飞向庄家和庄家飞向玩家之间的间隔时间

        let sucPromiseArr: Promise<{}>[] = [];
        let failPromiseArr: Promise<{}>[] = [];

        let zero = new Decimal(0);
        for (let areaPos = GameArea.ONE; areaPos <= GameArea.FOUR; areaPos++) {
            let areaInfo = this._gameAreaInfo[areaPos];
            let areaIdx = areaInfo.area - 1;

            let currAreaMoney = this._totalBets[areaIdx];
            // 没人投掷的区域不播放动画
            if (zero.gt(currAreaMoney)) {
                continue;
            }
            if (!areaInfo.isWin) {
                // 庄家赢的区域，金币从这些区域飞向庄家位置
                //failPromiseArr.push(this.brGame.chipFlyPly(areaIdx, this._dealerPos));
                failPromiseArr.push(this.brGame.chipFlyPlyOther(areaIdx, this._dealerPos));
            } else {
                // 庄家输的区域，金币从庄家位置飞向这些区域
                //sucPromiseArr.push(this.brGame.chipFlyArea(areaIdx, this._dealerPos, currAreaMoney, delayTime));
                sucPromiseArr.push(this.brGame.chipFlyAreaOther(areaIdx, this._dealerPos, currAreaMoney, delayTime));
            }
        }

        // cc.log("failPromiseArr ------------- " + failPromiseArr.length);
        if (failPromiseArr.length > 0) {
            this.adoMgr.playCoins();
            await Promise.all(failPromiseArr);
        }
        // cc.log("sucPromiseArr ------------- " + sucPromiseArr.length);
        if (sucPromiseArr.length > 0) {
            if (failPromiseArr.length < 1) {
                this.adoMgr.playCoins();
            }
            await Promise.all(sucPromiseArr);
        }
    }

    /**
     * 显示自己的结算
     * @param chgMoney
     */
    private selfBalance(chgMoney: string) {
        let selfBetPoint = 0;
        this._selfBets.forEach(info => selfBetPoint += info);
        let player = this.plyMgr.getPlyByPos(this._currDealerPos);
        // 自己下注了才展示结算（非庄家情况） 或者 自己是庄家
        if ((!player && selfBetPoint > 0) || (player && player.isMe)) {
            this.panelEnd.active = true;
            this.labEndSuc.node.active = false;
            this.labEndFail.node.active = false;
            this.animSuc.active = false;
            this.animFail.active = false;
            this.nodeEndBg.scale = 0;
            if (new Decimal(chgMoney).gte(0)) {
                this.adoMgr.playWin();
                this.labEndSuc.node.active = true;
                this.labEndSuc.string = "+" + chgMoney;
                this.animSuc.active = true;
                this.playAnim(this.animSuc, true);
            } else {
                this.adoMgr.playLose();
                this.labEndFail.node.active = true;
                this.labEndFail.string = chgMoney;
                this.animFail.active = true;
                this.playAnim(this.animFail, true);
            }
            let actions = cc.sequence(
                cc.delayTime(0),
                cc.scaleTo(0.2, 1, 1).easing(cc.easeBounceOut()),
            )
            // this.nodeEndBg.runAction(actions);
            cc.tween(this.nodeEndBg).then(actions).start();
        }
    }

    // --------------------------动画
    async playWinAnim(player: BrnnPlayer) {
        let anim = <cc.Node>cc.instantiate(this.preAnimWin);
        this.nodeAnimation.addChild(anim);
        anim.setPosition(player.convertToNodePos(this.nodeAnimation));

        let nodeParticle = cc.instantiate(this.preParticle);
        anim.addChild(nodeParticle);
        await this.playAnim(anim);

        anim.removeAllChildren();
        anim.removeFromParent();
    }
}
