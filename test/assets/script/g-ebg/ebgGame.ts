//游戏场景相关

import Game from "../g-share/game";
import BRgame from "../g-br/brGame";
import BRplayers from "../g-br/brOtherPlys";
import EbgMsg from "./ebgMsg";
import { parseLocation, toj, toCNMoney, pad, parabola, setInteractable } from '../common/util';
import EbgAudio from "./ebgAudio";
import EbgPlyMgr from "./ebgPlayerMgr";
import { showTip, getAvatar, getAvatarFrame } from "../common/ui"
import EbgPlayer from "./ebgPlayer"

const Decimal = window.Decimal;
/**
 * 游戏当前状态
 */
export enum GameStatus {

    STATUS_FREE,
    STATUS_BET,
    STATUS_DEAL_CARD,
    STATUS_END,
}
/**
 * 下注区域
 */
enum GameArea {
    DEALER = 0,
    ONE = 1,
    TWO = 2,
    THREE = 3,
    FOUR = 4,
}
enum cardEbgType {
    BIESHI = 1,
    YIDIAN = 2,
    YIDIANBAN = 3,
    ERDIAN = 4,
    ERDIANBAN = 5,
    SANDIAN = 6,
    SANDIANBAN = 7,
    SIDIAN = 8,
    SIDIANBAN = 9,
    WUDIAN = 10,
    WUDIANBAN = 11,
    LIUDIAN = 12,
    LIUDIANBAN = 13,
    QIDIAN = 14,
    QIDIANBAN = 15,
    BADIAN = 16,
    BADIANBAN = 17,
    JIUDIAN = 18,
    JIUDIANBAN = 19,
    ERBAGANG = 20,
    YIBAO = 21,
    ERBAO = 22,
    SANBAO = 23,
    SIBAO = 24,
    WUBAO = 25,
    LIUBAO = 26,
    QIBAO = 27,
    BABAO = 28,
    JIUBAO = 29,
    TIANWANG = 30
}

//牌的张数
const CARD_TOTAL = 2;
//最低限制分数
const MIN_LIMIT_MOENY = 50;
//白板
const CARD_BAIBAN = 256;
//背面
const CARD_BACK = 10;

/**
 * 庄家状态
 */
const enum DEALER_STATUS {
    UP = "上庄",
    DOWN = "下庄",
    EXIT = 0,       //我要下庄
    WAIT_UP = 1,    //等待上庄
    WANT = 2,       //我要上庄
    WAIT = 3,       //等待下庄
}
/**
 * 个人信息
 */
interface DealerInfo {
    rPos: number,
    avatar: number,
    avatarFrame: number,
    gender: number,
    location: string,
    money: string,
    vip: number,
}
/**
 * 根据消息内容 转化对应数据 模版
 */
interface iConfig {
    "balTotalTime": number,
    "betTotalTime": number,
    "maxDealerPay": string,
    "maxMultiple": number,
    "maxNotBetCnt": number,
    "minDealerMoney": string,
    "sysDealerAvatar": number,
    "sysDealerAvatarFrame": number,
    "sysDealerGender": number,
    "sysDealerMoney": string,
    "sysDealerName": string
    "sysDealerPos": number
    "betList": string[],
    "bets": string
    "maxDealerCnt": number;
    "sysVipLevel": number,
}

const { ccclass, property } = cc._decorator;
@ccclass
export default class EbgGame extends Game {
    //音效相关
    @property({ type: EbgAudio, override: true })
    adoMgr: EbgAudio = undefined;

    //个人信息相关
    @property({ type: EbgPlyMgr, override: true })
    plyMgr: EbgPlyMgr = undefined;

    //其他玩家
    @property(cc.Node)
    private nodeOther: cc.Node = undefined;

    //界面相关
    @property(cc.Node)
    private Chart_Node: cc.Node = undefined;

    @property(cc.Node)
    private Record_Node: cc.Node = undefined;

    @property(cc.Node)
    private Go_Banker_Node: cc.Node = undefined;

    @property(cc.Node)
    private Other_Node: cc.Node = undefined

    @property(cc.Node)
    private panelEnd: cc.Node = undefined;

    @property(cc.Node)
    private panelBill: cc.Node = undefined;
    @property(cc.Node)
    private billContent: cc.Node = undefined;

    @property(cc.Label)
    private labEndSuc: cc.Label = undefined;

    @property(cc.Label)
    private labEndFail: cc.Label = undefined;

    @property(cc.Node)
    private animSuc: cc.Node = undefined;

    @property(cc.Node)
    private animFail: cc.Node = undefined;

    @property(cc.Node)
    private panelZST: cc.Node = undefined;

    @property(cc.Node)// 走势图
    private zsNodeNew: cc.Node = undefined;

    @property(cc.Node)
    private zsNodeContent: cc.Node = undefined;

    @property(cc.Node)
    private showTipNoCoin: cc.Node = undefined;

    @property(cc.Node)
    private zsItem: cc.Node = undefined;


    //挂载相关 脚本
    @property(BRgame)
    brGame: BRgame = undefined;

    @property(BRplayers)
    brPlys: BRplayers = undefined;


    //下注
    @property([cc.Label])
    private areaMoney: cc.Label[] = [];

    @property([cc.Label])
    private areaSelfMoney: cc.Label[] = [];

    @property(cc.Node)
    betsParentNode: cc.Node = undefined;


    //记录房间最底下注下标
    private CurMinBet: string = null;


    //动画预制相关
    @property(cc.Prefab)
    private preAnimSend: cc.Prefab = undefined;

    @property(cc.Prefab)
    private preAnimBetting: cc.Prefab = undefined;

    @property(cc.Prefab)
    preAnimWin: cc.Prefab = undefined;

    @property(cc.Prefab)
    preParticle: cc.Prefab = undefined;

    @property(cc.Prefab)
    private AnimTianWang: cc.Prefab = undefined;

    @property(cc.Prefab)
    private TongSha_Win: cc.Prefab = undefined;

    @property(cc.Prefab)
    private TongSha_Lose: cc.Prefab = undefined;

    @property(cc.Prefab)
    private TongPei_Win: cc.Prefab = undefined;

    @property(cc.Prefab)
    private TongPei_Lose: cc.Prefab = undefined;
    private AnimTSorTP: number = 0;

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

    @property(cc.Label)
    private spDealer: cc.Label = undefined;

    @property(cc.Node) //上庄
    private panelDealer: cc.Node = undefined;

    @property(cc.Label)
    private bLabLoc: cc.Label = undefined;
    @property(cc.Label)
    private bLabCount: cc.Label = undefined;
    @property(cc.Label)
    private bLabMoney: cc.Label = undefined;
    @property(cc.Label)
    private bLabPeople: cc.Label = undefined;

    @property(cc.Label)
    private bLabDesc: cc.Label = undefined;

    @property(cc.Node)
    private bSvContent: cc.Node = undefined;

    @property(cc.Sprite)
    private labDealerCntSp: cc.Sprite = undefined;

    @property([cc.SpriteFrame])
    private dearlerSp: cc.SpriteFrame[] = [];

    @property(cc.Label)
    private bLabMinMoney: cc.Label = undefined;

    @property(cc.Label)
    private bLabMaxDealerCnt: cc.Label = undefined;

    //牌
    @property(cc.Node)
    nodeCard: cc.Node = undefined;

    @property(cc.Prefab)
    private gameCard: cc.Prefab = undefined;

    @property(cc.Node)
    private nodeFlyPos: cc.Node = undefined;

    @property([cc.Node])
    private ebgTypeBgs: cc.Node[] = [];

    @property([cc.Sprite])
    private ebgTypes: cc.Sprite[] = [];

    @property([cc.Label])
    private ebgBoosts: cc.Label[] = [];

    @property([cc.Label])
    private finalScores: cc.Label[] = [];

    @property([cc.Font])
    private fontScores: cc.Font[] = [];

    @property(cc.Prefab)
    private preEbgType: cc.Prefab = undefined;

    //时间节点
    @property(cc.Node)
    private nodeTime: cc.Node = undefined;
    @property(cc.Node)
    private nodeRest: cc.Node = undefined;

    @property(cc.Node)
    private nodestage: cc.Node = undefined;

    //4堆牌
    private cardStacks: cc.Node[][] = [];
    private _totalBets: number[];
    private _selfBets: number[];
    private _otherPos: cc.Vec2;
    private _dealerPos: cc.Vec2;

    //庄
    private _currDealerPos: number = -1;
    private _dealerList: number[];

    private _currBetPoint: string;
    private _beforeBettingMoney: string;      // 下注之前自己的金额

    private _gameAreaInfo: ps.Ebg_EnterDealCard_Info[];

    private betTimePanelPosY: number;         // 闹钟初始坐标Y值

    private sfebgTypes: cc.SpriteFrame[] = [];

    private CARD_SCALE = 0.9;

    private canPlayCoinAudio = true;
    private coinAudioInterval = 0.1;


    private _sysDealerInfo: DealerInfo;
    private MIN_DEALER_MONEY = "10000";
    private MAX_MULTIPLE = 3;
    private MAX_DEALER_PAY_POINT = "10000";
    private MAX_DEALER_LIST = 5;
    private DEALER_EPOS = -1;
    MAX_DEALER_COUNT = 0;
    private DEALER_DESC: string[] = ["我要下庄", "等待上庄", "我要上庄", "等待下庄"];

    msg: EbgMsg;

    onLoad() {
        super.onLoad();
        this.initHideAll();

        let ebgType = cc.instantiate(this.preEbgType);
        ebgType.children.forEach(n => this.sfebgTypes[n.name] = n.getComponent(cc.Sprite).spriteFrame);

        this._dealerList = [];
        this.betTimePanelPosY = this.nodeTime.y;

        this._otherPos = this.nodeOther.convertToWorldSpaceAR(cc.v2(0, 0));
        //this._dealerPos = this.nodeFlyPos.getChildByName("sendCard").convertToWorldSpaceAR(cc.v2(0, 0));
        this._dealerPos = cc.v2(this.nodeFlyPos.getChildByName("sendCard").position)
    }
    initHideAll() {
        this.panelEnd.active = false;
        this.animSuc.active = false;
        this.animFail.active = false;
        this.brGame.hideArea();
        this.cardTypeHide();
    }
    initGame() {
        this.msg = new EbgMsg(this);
        this.msg.init();
        this.brPlys.hide();
    }

    /**
     * 新开始一轮
     */
    initRound() {
        this.brGame.setWaitTips(false);
        this.initHideAll();

        this.nodeCard.removeAllChildren();
        this.hideSelfArea();
        this._totalBets = [0, 0, 0];
        this.resetAreMoney();
        this.brGame.hideBet();

        this.betsParentNode.removeAllChildren();//清楚桌面所以筹码
        this.plyMgr.initBets();
    }

    resetAreMoney() {
        this.areaMoney.forEach(Num => {
            Num.string = "0";
        })
    }

    updateUI(): void {
        this.initHideAll();
        switch (this.gameState) {
            //等待开始
            case GameStatus.STATUS_FREE:
                // cc.log(" =====等待状态=====");
                break;
            case GameStatus.STATUS_BET:
                // cc.log("=====下注状态=====")
                if (this._currDealerPos !== this.DEALER_EPOS) {
                    this.setDealerCnt();

                    let player = this.plyMgr.getPlyByPos(this._currDealerPos);
                    if (player && player.isMe) {
                        this.gaming = true;
                    }
                }

                this.playAnim(this.preAnimBetting);
                this.adoMgr.startDoBets();

                this.showAction(this.nodeTime, true);
                this.nodestage.active = true;
                this.nodeRest.active = false;

                let selfPlayer = this.plyMgr.me;
                if (selfPlayer && (selfPlayer.money !== undefined)) {
                    this._beforeBettingMoney = selfPlayer.money;
                }
                this.setAllowBet();

                // 如果分数小于50
                if (+selfPlayer.money < MIN_LIMIT_MOENY) {
                    this.showTipNoCoin.active = true;
                    //按钮变灰
                    for (let i = 0; i < this.brGame.chipPoints.length; i++) {
                        this.brGame.setEnabled(i, false);
                    }
                    //区域不能点
                    this.brGame.setClickAreasEanble(false);
                    this.brGame.setBetLight(-1);
                } else {
                    this.showTipNoCoin.active = false;
                }
                break;
            // 发牌、展示
            case GameStatus.STATUS_DEAL_CARD:
                // console.log("=====发牌展示状态=====");
                this.showAction(this.nodeTime, false);
                this.brGame.hideBet();
                break;
            // 结算
            case GameStatus.STATUS_END:
                // console.log("=====结算状态=====");
                this.hideTicker();
                this.showAction(this.nodeTime, true);
                this.nodeRest.active = true;
                this.nodestage.active = false;
                this.nodeCard.removeAllChildren();

                this.cardTypeHide();
                this.brGame.hideBet();
                break;
        }
        this.menu.hideChangeBtn();
    }

    /**
     * 隐藏自己所下注区域
     */
    hideSelfArea() {
        this._selfBets = [0, 0, 0];
        this.areaSelfMoney.forEach(lab => {
            lab.node.active = false;
            lab.node.getParent().active = false;
        });
    }
    hideSelfArea_bg() {
        this.areaSelfMoney.forEach(lab => {
            lab.node.active = false;
            lab.node.getParent().active = false;
        });
    }

    /**
    * 设置该区域所有的筹码
    */
    setTotalAreaMoney(pos: number, bet: string, showDefaultBet = false) {
        if (!this._totalBets || new Decimal(bet).eq(0) || pos === GameArea.DEALER) { return; }
        let areaIdx = pos - 1;
        this._totalBets[areaIdx] = new Decimal(this._totalBets[areaIdx]).add(bet).toNumber();
        this.areaMoney[areaIdx].string = this._totalBets[areaIdx].toString();

        if (showDefaultBet) {
            this.brGame.setAreaMoney(areaIdx, +bet);
        }
    }
    /**
    * 下注
    */
    plyDoBet(pos: number, area: number, bet: string) {
        let player = this.plyMgr.getPlyByPos(pos);

        if (this.canPlayCoinAudio) {
            this.adoMgr.DoBets();
            this.canPlayCoinAudio = false;
            this.scheduleOnce(() => {
                this.canPlayCoinAudio = true;
            }, this.coinAudioInterval);
        }
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
    async flySendCard(areaInfos: ps.Ebg_EnterDealCard_Info[]) {
        this.adoMgr.StopDoBets();
        //开始send动画
        await this.playAnim(this.preAnimSend);

        this._gameAreaInfo = areaInfos;
        this._gameAreaInfo.sort((a, b) => { return a.area - b.area });

        await this.cardFlyAnim(this._gameAreaInfo[0], this._dealerPos);
        //再发四家
        for (let areaPos = 1; areaPos <= 3; areaPos++) {
            let areaInfo = this._gameAreaInfo[areaPos];
            this.adoMgr.playSendCard();
            await this.cardFlyAnim(areaInfo, this._dealerPos);
        }


        //隐藏自己下注分数
        await this.hideSelfArea_bg();

        //四家开牌
        await this.turnOneCard(this._gameAreaInfo[0]);
        for (let areaPos = 1; areaPos <= 3; areaPos++) {
            let areaInfo = this._gameAreaInfo[areaPos];
            this.adoMgr.playSendCard();
            await this.turnOneCard(areaInfo);
        }
        await this.Dalay();

        //开完牌之后在显示点数
        for (let i = 0; i <= 3; i++) {
            let areaInfo = this._gameAreaInfo[i];
            await this.cardType(areaInfo, 0.01, 2);
        }

        // 展示胜利区域  同时播放财神
        for (let areaPos = GameArea.ONE; areaPos <= GameArea.THREE; areaPos++) {
            let areaInfo = this._gameAreaInfo[areaPos];
            // 要判断输赢
            if (areaInfo.area > GameArea.DEALER && areaInfo.isWin == -1) {
                this.brGame.setAreaEff(areaInfo.area - 1);
            }
        }

    }
    setGameCard(index: number) {
        let card = cc.instantiate(this.gameCard);
        if (index === CARD_BAIBAN) {//白板
            index = 0;
        }
        card.getChildByName(`${index}`).active = true;
        return card;
    }
    showCard(node: cc.Node, value: number) {
        let back = node.getChildByName(`${CARD_BACK}`);
        if (back) {
            back.active = false;
            if (value == CARD_BAIBAN) {//白板
                node.getChildByName("0").active = true;
            } else {
                node.getChildByName(`${value}`).active = true;
            }
        } else {
            console.log("not find back!")
        }
    }
    /**
     * 开牌
     */
    openCard(node: cc.Node, doAnim = true, toFront, changeScale) {
        return new Promise((resolve) => {
            if (doAnim) {
                let actions = cc.sequence(
                    cc.callFunc(async () => {
                        this.showCard(node, toFront);
                    }),
                    cc.callFunc(() => {
                        resolve()
                    })
                )
                // node.runAction(actions)
                cc.tween(node).then(actions).start();
            } else {
                node.scaleX = changeScale;
                node.scaleY = changeScale;
                this.showCard(node, toFront);
                resolve()

            }
        })
    }

    /**
     * 牌动画
     * @param areaInfo
     * @param beginPos
     */
    private cardFlyAnim(areaInfo: ps.Ebg_EnterDealCard_Info, beginPos: cc.Vec2) {
        //beginPos = this.nodeCard.convertToNodeSpaceAR(beginPos);
        return new Promise(resolve => {
            this.cardStacks[areaInfo.area] = areaInfo.cards.map(cardData => {
                let node = this.setGameCard(CARD_BACK);
                this.nodeCard.addChild(node);
                node.setPosition(beginPos.x, beginPos.y);
                return node;
            });
            let cardBox = this.nodeFlyPos.getChildByName(`card${[areaInfo.area]}`);
            for (let idx = 0; idx < CARD_TOTAL; idx++) {
                let nodeCard = this.cardStacks[areaInfo.area][idx];
                let moveTime = 0.3;
                let actions = cc.sequence(
                    cc.delayTime(idx * 0.05),
                    cc.spawn(
                        cc.scaleTo(moveTime, this.CARD_SCALE, this.CARD_SCALE),
                        parabola(moveTime, <cc.Vec2>nodeCard.position, cc.v2(cardBox.x + idx * 60, cardBox.y))
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
        });
    }
    turnOneCard(areaInfo: ps.Ebg_EnterDealCard_Info) {

        return new Promise(resolve => {
            //中心坐标和每张牌原始坐标存下来
            let cards = this.cardStacks[areaInfo.area];
            let oriXArr = [];
            for (let idx = 0; idx < cards.length; idx++) {
                oriXArr.push(cards[idx].x);
            }
            for (let idx = 0; idx < cards.length; idx++) {
                let nodeCard = cards[idx];
                let actions = cc.sequence(
                    cc.delayTime(0.5),
                    cc.callFunc(() => {
                        this.openCard(nodeCard, true, this._gameAreaInfo[areaInfo.area].cards[idx], this.CARD_SCALE);
                    }),
                    cc.callFunc(() => {
                        if (idx === cards.length - 1) {
                            resolve(true);
                            this.cardType(areaInfo, 0.5, 1);
                        }
                    }),
                )
                // nodeCard.runAction(actions);
                cc.tween(nodeCard).then(actions).start();
            }
        });
    }

    /**
     * 根据值来获取 牌型
     */
    getCardType(value: number) {
        return value;
    }
    /**
 * 展示牌类型和自己的输赢
 * @param areaInfo
 * @param animTime
 */
    private async cardType(areaInfo: ps.Ebg_EnterDealCard_Info, animTime: number, showType: number) {
        return new Promise(reslove => {
            // 1=>普通 2=> 输赢显示
            // 用庄家的声音
            let playInfo;
            if (this._currDealerPos === -1) {
                playInfo = this._sysDealerInfo;
            } else {
                playInfo = this.plyMgr.getPlyInfoByPos(this._currDealerPos);
            }
            this.ebgTypeBgs[areaInfo.area].active = true;
            let nnType = this.ebgTypes[areaInfo.area];
            nnType.node.active = true;
            if (showType === 1) {
                nnType.spriteFrame = this.sfebgTypes[60 + this.getCardType(areaInfo.ebgType)];
                if (this.getCardType(areaInfo.ebgType) < cardEbgType.ERBAGANG) {
                    this.adoMgr.Aduio_CardType(this.getCardType(areaInfo.ebgType) - 1);
                } else if (this.getCardType(areaInfo.ebgType) == cardEbgType.TIANWANG) {
                    this.adoMgr.Aduio_CardType(cardEbgType.TIANWANG - 1);
                }
                else if (this.getCardType(areaInfo.ebgType) > cardEbgType.ERBAGANG) {
                    this.adoMgr.Aduio_CardType(this.getCardType(areaInfo.ebgType) - 2);
                } else {
                    this.adoMgr.Aduio_CardType(cardEbgType.TIANWANG - 2);
                }
            } else if (showType === 2) {
                if ((areaInfo.isWin !== -1 && areaInfo.area > GameArea.DEALER) || (areaInfo.isWin === 0 && this.AnimTSorTP === -1)) {//输  //庄家通赔
                    nnType.spriteFrame = this.sfebgTypes[30 + this.getCardType(areaInfo.ebgType)];
                } else {
                    nnType.spriteFrame = this.sfebgTypes[this.getCardType(areaInfo.ebgType)];
                }

                let areaIdx = areaInfo.area - 1;
                if (areaInfo.area > GameArea.DEALER) {
                    let lab_score = this.finalScores[areaIdx];
                    lab_score.node.active = true;
                    lab_score.string = "";
                    let lab_boost = this.ebgBoosts[areaIdx];
                    lab_boost.node.active = false;

                    let selfBet = +this._selfBets[areaIdx];
                    //下注了的文字
                    if (selfBet > 0) {
                        lab_score.fontSize = 20;
                        if (areaInfo.isWin === -1) {//庄家输 闲家赢
                            lab_score.font = this.fontScores[0];
                        } else if (areaInfo.isWin === 0) {
                            lab_score.font = this.fontScores[0];
                        }
                        else {
                            selfBet = -selfBet;
                            lab_score.font = this.fontScores[1];
                        }
                        if (areaInfo.isWin === 0) {
                            lab_score.string = "+0"
                        } else {
                            lab_score.string = new Decimal(selfBet).mul(areaInfo.boost).toString();
                        }

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

            nnType.node.stopAllActions();
            nnType.node.scale = 0;
            let actions = cc.sequence(cc.scaleTo(animTime, 1, 1).easing(cc.easeBounceOut()),
                cc.callFunc(() => {
                    reslove();
                })
            )
            // nnType.node.runAction(actions);
            cc.tween(nnType.node).then(actions).start();
        })
    }
    /**
 * 庄家与各区域之间的输赢动画
 */
    private async dealerAreaAnim() {
        let delayTime = 0.1; // 飞向庄家和庄家飞向玩家之间的间隔时间

        let sucPromiseArr: Promise<{}>[] = [];
        let failPromiseArr: Promise<{}>[] = [];

        let zero = new Decimal(0);
        for (let areaPos = GameArea.ONE; areaPos <= GameArea.THREE; areaPos++) {
            let areaInfo = this._gameAreaInfo[areaPos];
            let areaIdx = areaInfo.area - 1;

            let currAreaMoney = this._totalBets[areaIdx];
            // 没人投掷的区域不播放动画
            if (zero.gt(currAreaMoney)) {
                continue;
            }
            if (areaInfo.isWin == 1) {
                // 庄家赢的区域，金币从这些区域飞向庄家位置
                //failPromiseArr.push(this.brGame.chipFlyPly(areaIdx, this._dealerPos));
                failPromiseArr.push(this.brGame.chipFlyPlyOther(areaIdx, this._dealerPos));
            } else if (areaInfo.isWin == -1) {
                // 庄家输的区域，金币从庄家位置飞向这些区域
                //sucPromiseArr.push(this.brGame.chipFlyArea(areaIdx, this._dealerPos, currAreaMoney, delayTime));
                sucPromiseArr.push(this.brGame.chipFlyAreaOther(areaIdx, this._dealerPos, currAreaMoney, delayTime));
            }
        }

        if (failPromiseArr.length > 0) {
            this.adoMgr.playCoin();
            await Promise.all(failPromiseArr);
        }
        if (sucPromiseArr.length > 0) {
            if (failPromiseArr.length < 1) {
                this.adoMgr.playCoin();
            }
            await Promise.all(sucPromiseArr);
        }
    }
    /**
 * 结算动画
 */
    async showBalanceAnim(balanceInfo?: ps.Ebg_EnterBalance_Info[]) {

        //天王 不管同局有多少个天王都只播放一个天王的动画
        for (let i = 0; i < 4; i++) {
            let info = this._gameAreaInfo[i];
            if (info.ebgType === cardEbgType.TIANWANG) {
                await this.playAnim(this.AnimTianWang);
                break;
            }
        }

        //通杀    同赔
        if (this.AnimTSorTP === 1) {
            //如果是庄家坐庄
            if (this._currDealerPos === -1 || (this._currDealerPos !== this.plyMgr.me.pos)) {
                this.adoMgr.A_TSTP_Lose();
                await this.playAnim(this.TongSha_Lose)
            } else {
                this.adoMgr.A_TSTP_Win();
                await this.playAnim(this.TongSha_Win)
            }
        } else if (this.AnimTSorTP === -1) {
            //如果是庄家坐庄
            if (this._currDealerPos === -1 || (this._currDealerPos !== this.plyMgr.me.pos)) {
                this.adoMgr.A_TSTP_Win();
                await this.playAnim(this.TongPei_Win)
            } else {
                this.adoMgr.A_TSTP_Lose();
                await this.playAnim(this.TongPei_Lose)
            }
        }

        if (!balanceInfo) return;
        await this.dealerAreaAnim();
        // 赢钱区域
        let winAreaPos: number[] = [];
        for (let areaPos = GameArea.ONE; areaPos <= GameArea.THREE; areaPos++) {
            let areaInfo = this._gameAreaInfo[areaPos];
            if (areaInfo.isWin != 1) {
                winAreaPos.push(areaPos);
            }
        }
        // 遍历玩家数据
        let winPlyArea: { [area: number]: EbgPlayer[] } = {};
        let tablePlyInfos: ps.Ebg_EnterBalance_Info[] = [];
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
                for (let areaPos = GameArea.ONE; areaPos <= GameArea.THREE; areaPos++) {
                    if (betInfos[areaPos]) beforeBet = beforeBet.add(betInfos[areaPos]);
                }
                player.money = beforeBet.toString();
            }
        });
        //----------------------------从赢钱区域飞向赢钱的桌上玩家和其他玩家
        let flyPromiseArr: Promise<{}>[] = [];
        for (let areaPos = GameArea.ONE; areaPos <= GameArea.THREE; areaPos++) {
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
        if (flyPromiseArr.length > 0) {
            this.adoMgr.playCoin();
            await Promise.all(flyPromiseArr);
        }
        //-------------------------- 更新桌上玩家金币
        let selfChg = "";
        await this.updateDealerScore();
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
        this.selfBalance(selfChg);

        // 清空显示金额
        for (let idx = GameArea.ONE; idx <= GameArea.THREE; idx++) {
            let areaIdx = idx - 1;
            this.areaMoney[areaIdx].string = "0";
        }
        // 刷新桌上玩家
        this.plyMgr.updateTablePlayer();
        if (this.brPlys.active) {
            this.onClickOtherPlayer();
        }
    }
    // --------------------------动画
    async playWinAnim(player: EbgPlayer) {
        let anim = <cc.Node>cc.instantiate(this.preAnimWin);
        this.nodeAnimation.addChild(anim);
        anim.setPosition(player.convertToNodePos(this.nodeAnimation));

        let nodeParticle = cc.instantiate(this.preParticle);
        anim.addChild(nodeParticle);
        await this.playAnim(anim);

        anim.removeAllChildren();
        anim.removeFromParent();
    }
    updateDealerScore() {
        if (-1 !== this.crDealerPos) {
            let ply = this.plyMgr.getPlyInfoByPos(this.crDealerPos)
            this.dealerMoney.string = toCNMoney(ply.money);
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
            // this.nodeEndBg.scale = 0;
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
            // this.nodeEndBg.runAction(cc.sequence(
            //     cc.delayTime(0),
            //     cc.scaleTo(0.2, 1, 1).easing(cc.easeBounceOut()),
            // ));
        }
    }
    /**
 * 走势图界面
 * @param history
 */
    showHistory(history: ps.Ebg_GameHistory_areaWin[]) {
        this.panelZST.active = true;
        history.reverse();
        if (history.length > 0) {
            this.zsNodeNew.active = true;
            this.zsNodeContent.active = true;
            this.zsNodeContent.removeAllChildren();
            for (let i = 0; i < history.length; i++) {
                let info = history[i];
                let item = cc.instantiate(this.zsItem);
                Object.keys(info).forEach(function (keys) {
                    item.getChildByName(`${keys}`).getChildByName("win").active = (info[keys] === 1);
                    item.getChildByName(`${keys}`).getChildByName("fail").active = (info[keys] === 0);
                    item.getChildByName(`${keys}`).getChildByName("he").active = (info[keys] === 2);
                })
                this.zsNodeContent.addChild(item);
            }
        } else {
            this.zsNodeNew.active = false;
            this.zsNodeContent.active = false;
        }
    }
    showMyBill(billHistory: ps.Ebg_PlayerHistory_playerHistory[]) {
        this.panelBill.active = true;
        if (billHistory.length > 0) {
            let itemNode = this.billContent.getChildByName("item");
            this.billContent.children.forEach((v) => {
                v.destroy();
            });

            for (let idx = 0; idx < billHistory.length; idx++) {
                let bill = billHistory[idx];
                let col = (+bill.win >= 0) ? (new cc.Color).fromHEX("#FFF300") : (new cc.Color).fromHEX("#A7D6FF");

                let item = cc.instantiate(itemNode);
                item.active = true;
                this.billContent.addChild(item);

                let labNumber = item.getChildByName("number").getComponent(cc.Label);
                let labTime = item.getChildByName("time").getComponent(cc.Label);
                let labMoney = item.getChildByName("money").getComponent(cc.Label);
                labNumber.string = `${idx + 1}`;
                let date = new Date(bill.startTime);
                let dateStr = date.getFullYear() + "-" + pad(date.getMonth() + 1, 2) + "-" + date.getDate() + " " + pad(date.getHours(), 2) + ":" + pad(date.getMinutes(), 2);
                labTime.string = dateStr;
                labMoney.string = bill.win;
                labMoney.node.color = col;
            }
        }
    }
    /**
 * 上庄界面
 * @param dealerPos
 * @param ctuCnt
 */
    showDealer(dealerPos: number[], ctuCnt?: number) {
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
            this.spDealer.string = this.DEALER_DESC[DEALER_STATUS.WANT]
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
                this.spDealer.string = this.DEALER_DESC[DEALER_STATUS.WAIT_UP];
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
  * 上庄
  * @param dealerPos
  * @param dealerCnt
  */
    setDealerUI(dealerPos: number, dealerCnt: number, bankerSign?: number) {
        this._currDealerPos = dealerPos;

        let bankInfo: any;
        if (dealerPos === -1) {
            bankInfo = this._sysDealerInfo;
            this.labDealerCntSp.node.active = false;
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
                if (bankerSign == 1) {
                    this.spDealer.string = this.DEALER_DESC[DEALER_STATUS.WAIT];
                } else {
                    this.spDealer.string = this.DEALER_DESC[DEALER_STATUS.EXIT];
                }
                this.onClickGoBankerClose();
                this.brGame.hideBet();
            } else {
                this.spDealer.string = this.DEALER_DESC[DEALER_STATUS.WANT];
            }
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

    getSelfAreaMoney() {
        let isBet = false;
        for (const val of this._selfBets) {
            if (val > 0) {
                isBet = true;
                break;
            }
        }
        return isBet;
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
        this._selfBets.forEach(money => {
            selfTotalAreaMoney = selfTotalAreaMoney.add(money);
        });
        let money = new Decimal(this.plyMgr.me.money);
        let maxMult = new Decimal(this.MAX_MULTIPLE);
        let bBetMoney = this._beforeBettingMoney ? new Decimal(this._beforeBettingMoney) : money;

        let allowNum = 0;
        let currChooseNum = 0;
        for (let idx = 0; idx < this.brGame.chipPoints.length; idx++) {
            let btnScore = this.brGame.chipPoints[idx];
            // 当前金额要大于自己可赔的最大倍率
            let isSelfMaxMul = money.gte(maxMult.mul(btnScore));
            // 下注后的总金额不能大于自己下注之前可赔的最大倍率
            let maxBetPoint = selfTotalAreaMoney.add(btnScore).mul(maxMult);
            let isDeaMaxMul = bBetMoney.gte(maxBetPoint);
            if (isSelfMaxMul && isDeaMaxMul) {//当自己能赔 且庄家也能赔时
                allowNum += 1;
                if (this._currBetPoint && (this._currBetPoint === this.brGame.chipPoints[idx])) {
                    currChooseNum = allowNum;
                }
            }
        }

        if (allowNum >= 0) {

            this.brGame.setAllowBet(allowNum);//当前能下那些主
            let isEanble = this.brGame.getChipindex(this.CurMinBet);
            //隐藏不能点击下注按钮
            for (let i = 0; i < isEanble; i++) {
                this.brGame.setEnabled(i, false);
            }
            if (isEanble > 0) {
                currChooseNum = isEanble + 1;
            }
            if (currChooseNum) {
                allowNum = currChooseNum;
            } else if (!this._currBetPoint) {
                allowNum = 1;
            }
            let maxBetVal = this.brGame.chipPoints[allowNum - 1];
            this._currBetPoint = maxBetVal;


            this.brGame.setBetLight(allowNum - 1);
        } else {
            this.brGame.setBetLight(-1);
        }
    }
    cardTypeHide() {
        this.ebgTypeBgs.forEach(node => {
            node.active = false;
        });

        this.ebgTypes.forEach(sprite => {
            sprite.node.active = false;
        });

        this.ebgBoosts.forEach(lab => {
            lab.node.active = false;
        });
        this.finalScores.forEach(lab => {
            lab.node.active = false;
        });
    }

    /**
     *  1=====> 设置房间信息
     */
    dealRoomData(data: ps.GameRoomHandlerGetRoomData) {

        let config = toj<iConfig>(data.config);

        this.MAX_DEALER_PAY_POINT = config.maxDealerPay;
        this.MIN_DEALER_MONEY = config.minDealerMoney;
        this.MAX_MULTIPLE = config.maxMultiple;
        this.MAX_DEALER_COUNT = config.maxDealerCnt;

        let avatar = config.sysDealerAvatar;
        let avatarFrame = config.sysDealerAvatarFrame;
        let gender = config.sysDealerGender;
        let location = config.sysDealerName;
        let money = config.sysDealerMoney;
        let vip = config.sysVipLevel;

        this.CurMinBet = data.bets;

        this._sysDealerInfo = { rPos: config.sysDealerPos, avatar: avatar, avatarFrame: avatarFrame, gender: gender, location: location, money: money, vip: vip };


        this.brGame.setChipPoint(config.betList);

        this.brGame.clickBetLsr = this.onClickBet.bind(this);
        this.brGame.clickAreaLsr = this.onClickArea.bind(this);

        this.bLabMaxDealerCnt.string = this.MAX_DEALER_COUNT.toString();
        this.bLabMinMoney.string = toCNMoney(this.MIN_DEALER_MONEY).toString();

        this.initRound();
    }
    /**
     * 节点动画
     */

    actionToNode(node: cc.Node, _show: boolean) {
        if (_show) {
            node.active = true;
            node.setScale(1);
            let scale = cc.scaleTo(0.3, 1.3);
            let scale1 = cc.scaleTo(0.3, 1)

            // node.runAction(cc.sequence(scale, scale1));
            cc.tween(node).to(0.3, { scale: 1.3 }).to(0.3, { scale: 1 }).start();
        } else {
            let fadeout = cc.fadeTo(0.3, 0)
            // node.runAction(cc.sequence(fadeout, cc.callFunc(function () {
            //     node.opacity = 255;
            //     node.active = false;
            // })))
            cc.tween(node)
                .to(0.3, { opacity: 0 })
                .call(
                    () => {
                        node.opacity = 255;
                        node.active = false;
                    }
                )
                .start();
        }
    }
    onClickDoDealer() {
        if (this._dealerList.length >= this.MAX_DEALER_LIST) {
            showTip(`排队人数已达${this.MAX_DEALER_LIST}人上限，请稍后再来噢~~`);
        } else {
            let btnText = this.bLabDesc.string;
            if (btnText === DEALER_STATUS.UP) {
                let player = this.plyMgr.me;
                if (new Decimal(player.money).gte(this.MIN_DEALER_MONEY)) {
                    this.msg.sendDoDealer();
                } else {
                    showTip(`亲，金币不足不能上庄噢~~`);
                }
            } else if (btnText === DEALER_STATUS.DOWN) {
                this.msg.sendExitDealer();
                // this.msg.sendDealerList();
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
            if (!this._currBetPoint) {
                this._currBetPoint = "1";
            }
            if (new Decimal(player.money).gte(this._currBetPoint)) {
                let areaTotalPoint = new Decimal(0);
                this._totalBets.forEach(money => {
                    areaTotalPoint = areaTotalPoint.add(money);
                });
                let currTotalPoint = areaTotalPoint.add(this._currBetPoint);
                currTotalPoint = currTotalPoint.mul(this.MAX_MULTIPLE);

                let minPayMoney = this.getDealerPay();
                if (currTotalPoint.lte(minPayMoney)) {
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
                showTip("金币不足，无法下注～");
            }
        }
        return false;
    }

    /**
    * 设置坐庄轮数
    * @param count
    */
    setDealerCnt(count?: number) {
        if (count === undefined) {
            this.dearlerSp.forEach((sp, idx) => {
                if (sp == this.labDealerCntSp.spriteFrame) {
                    count = idx;
                }
            })
            count += 1;
        }
        if (count !== undefined && count === 0) {
            this.labDealerCntSp.node.active = false;
        } else {
            this.labDealerCntSp.node.active = true;
        }
        this.labDealerCntSp.spriteFrame = this.dearlerSp[count];
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
    showAllCards(areaInfos: ps.Ebg_GameInfo_AreaInfo[]) {
        areaInfos.sort((a, b) => { return a.area - b.area })
        this._gameAreaInfo = areaInfos;
        for (let idx = 0; idx < areaInfos.length; idx++) {
            let areaInfo = areaInfos[idx];
            if (areaInfo.cards) {
                let cardBox = this.nodeFlyPos.getChildByName(`card${areaInfo.area}`);
                areaInfo.cards.forEach((cardData, i) => {
                    let node = this.setGameCard(cardData);
                    this.nodeCard.addChild(node);
                    node.setPosition(cc.v2(cardBox.x + i * 65, cardBox.y));
                    this.openCard(node, true, true, this.CARD_SCALE);
                });
                this.cardType(areaInfo, 0.2, 2);

                // 计算输赢
                if (areaInfo.area > GameArea.DEALER && areaInfo.isWin === -1) {
                    this.brGame.setAreaEff(areaInfo.area - 1);
                }
            }
            this.setTotalAreaMoney(areaInfo.area, areaInfo.totalBets, true);
        }
    }
    isShowTSorTP(index: number) {
        this.AnimTSorTP = index;
    }
    setMeLooker(isLooker: boolean) {
        let me = this.plyMgr.me;
        me.isLooker = isLooker;
    }
    getDealerPly() {
        return this.plyMgr.getPlyByPos(this.crDealerPos);
    }
    Dalay() {
        return new Promise(relove => {
            this.scheduleOnce(() => { relove() }, 1);
        })
    }
    setTimer(time: number) {
        if (this.gameState === GameStatus.STATUS_BET || this.gameState === GameStatus.STATUS_END) {
            this.showTicker(time);
        }
    }
    get crDealerPos() {
        return this._currDealerPos;
    }
    setGameStart() {
        if (this._currDealerPos !== this.plyMgr.me.pos)
            this.setMeLooker(true);
    }
    setGameEnd() {
        if (this._currDealerPos !== this.plyMgr.me.pos)
            this.setMeLooker(true);
    }

    hideAreaSelfMoney() {
        this.areaSelfMoney.forEach(lab => {
            lab.node.active = false;
            lab.node.parent.active = false;
        })
    }

    //--------------------------------点击事件
    //点击走势图
    onClickChart() {
        this.msg.sendGameHistory();
    }
    onClickChartClose() {
        this.actionToNode(this.Chart_Node, false)
    }
    //点击战绩
    onClickRecord() {
        this.msg.sendGamerHistory();
    }
    onClickRecordClose() {
        this.actionToNode(this.Record_Node, false)
    }
    //点击返回
    onClickBack() {
        this.actionToNode(this.Record_Node, false)
    }
    onClickOtherPlayer() {
        this.brPlys.show(this.plyMgr.getAllPlayerInfo());
    }
    onClickOtherPlayerClose() {
        this.actionToNode(this.Other_Node, false)
    }
    onClickBet(idx: number) {
        this._currBetPoint = this.brGame.chipPoints[idx];
        return this.gameState === GameStatus.STATUS_BET;
    }
    onClickGoBanker() {
        let btnSp = this.spDealer.string;
        if (btnSp === this.DEALER_DESC[DEALER_STATUS.WANT]) {
            this.msg.sendDealerList();
        } else if (btnSp === this.DEALER_DESC[DEALER_STATUS.EXIT]) {
            this.msg.sendExitDealer();
            this.spDealer.string = this.DEALER_DESC[DEALER_STATUS.WAIT];
        } else if (btnSp === this.DEALER_DESC[DEALER_STATUS.WAIT]) {
            showTip("此局结束即可下庄噢~~");
        }
    }
    onClickGoBankerClose() {
        this.actionToNode(this.Go_Banker_Node, false)
    }
}