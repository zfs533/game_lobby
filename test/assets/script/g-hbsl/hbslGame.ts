import HbslRedBagInfo from "./hbslRedBagInfo";
import HbslPackRedBag from "./hbslPackRedBag";
import HbslRecord from "./hbslRecord";
import HbslPlayerMgr from "./hbslPlayerMgr";
import { random, toj } from "../common/util";
import Game from "../g-share/game";
import HbslAudio from "./hbslAudio";
import HbslMsg from "./hbslMsg";
import HbslAutoGrab from "./hbslAutoGrab";
import HbslOther from "./hbslOther";
import net from "../common/net";
import { showTip } from "../common/ui";


interface iConfig {
    maxSendCount?: number;
    moneyList?: number[];
    hongBaoLeftTime: number
}

interface sendRecord {
    rbMoney: string,
    boomedPly: number,
}

interface grabRecord {
    money: string,
    boom: number,
    grabMoney: string,
    isBoom: number,
}
const { ccclass, property } = cc._decorator;

@ccclass
export default class HbslGame extends Game {

    @property({ type: HbslAudio, override: true })
    adoMgr: HbslAudio = undefined;

    @property({ type: HbslPlayerMgr, override: true })
    plyMgr: HbslPlayerMgr = undefined;

    @property([cc.Node])
    redBags: cc.Node[] = [];

    @property(cc.Node)
    packRedBag: cc.Node = undefined;

    @property(cc.Node)
    autoGrabRedBag: cc.Node = undefined;

    @property(cc.Node)
    grabRecordRedBag: cc.Node = undefined;

    @property(cc.Node)
    autoGrabBtn: cc.Node = undefined;
    @property(cc.Node)
    sopAutoGrabBtn: cc.Node = undefined;

    @property(HbslPackRedBag)
    hbslPackRedBag: HbslPackRedBag = undefined;

    @property(HbslAutoGrab)
    hbslAutoGrab: HbslAutoGrab = undefined;

    @property(HbslRecord)
    hbslRecord: HbslRecord = undefined

    @property(HbslOther)
    hbslOther: HbslOther = undefined

    @property(cc.Node)
    otherPayer: cc.Node = undefined;

    @property(cc.Label)
    lblWaitingRound: cc.Label = undefined;

    @property([cc.Node])
    waitingAniNds: cc.Node[] = [];

    @property(cc.Prefab)
    preWinBool: cc.Prefab = undefined;


    msg: HbslMsg;
    public sRecord: sendRecord[] = [];              // 我的战绩发红包记录
    public gRecord: grabRecord[] = [];              // 我的战绩抢红包记录
    onLoad() {
        super.onLoad()

    }
    start() {
        super.start()
    }
    initRound(): void {
        // console.log("初始化一局");

    }
    initGame(): void {
        this.msg = new HbslMsg(this);
        this.msg.init();

    }
    updateUI(): void {

    }
    dealRoomData(data: ps.GameRoomHandlerGetRoomData) {
        let config = toj<iConfig>(data.config)
        this.hbslPackRedBag.init(this, config.moneyList, config.maxSendCount);
        for (let index = 0; index < this.redBags.length; index++) {
            let info = this.redBags[index].getComponent(HbslRedBagInfo)
            info.init(this, config.hongBaoLeftTime)
        }
        this.hbslAutoGrab.init(this, config.moneyList)
        this.hbslRecord.setGame(this);
        this.hbslOther.setGame(this);
        net.notify(<any>"game.hbslHandler.loadGameInfo", {})
    }

    /**
     * 更新红包
     */
    updateRedBagsInfo(data: ps.Hbsl_ChangeHongBao_hbInfo) {
        let info = this.redBags[data.area].getComponent(HbslRedBagInfo)
        info.updateRedBagsInfo(data)
    }


    /**
    * 断线重连更新红包
    */
    handleRedBagsInfo(data: ps.Hbsl_GameInfo_hbInfo) {
        let info = this.redBags[data.area].getComponent(HbslRedBagInfo)
        if (data.isBoom) {
            info.myGrabWinOrLose(true, data.payMoney, data.isBoom, data.grabMoney)
        } else {
            info.myGrabWinOrLose(false, data.grabMoney, data.isBoom, data.grabMoney)
        }
    }

    /***
     * 结算
     */
    balanceRedBag(data: ps.Hbsl_GrabBalance) {
        let info = this.redBags[data.area].getComponent(HbslRedBagInfo)
        info.balance(data);
    }

    /**
     *打开发红包界面
     */
    onPackRedBag() {
        this.adoMgr.playClick()
        this.packRedBag.active = true
    }
    /**
    *打开抢红包记录
    */
    onGrabRecordRedBag() {
        this.adoMgr.playClick()
        this.grabRecordRedBag.active = true
    }
    /**
   *打开自动抢红包界面
   */
    onAutoGrabRedBag() {
        this.adoMgr.playClick()
        this.autoGrabRedBag.active = true
    }

    /**
     * 停止自动抢
     */
    onSopAutoGrab() {
        this.adoMgr.playClick()
        this.hbslAutoGrab.isAutoGrab = false
        this.sopAutoGrabBtn.active = false
        // this.autoGrabRedBag.active = true
        this.autoGrabBtn.active = true
        // this.msg.sendCanceAutoGrab()
        // this.unschedule(this.autoGrab)
    }

    private onClickBack() {
        this.adoMgr.playClick()
        for (let index = 0; index < this.redBags.length; index++) {
            let info = this.redBags[index].getComponent(HbslRedBagInfo)
            if (info.isMe || (this.hbslPackRedBag.sendRedBagListInfo.length > 0)) {
                this.gaming = true
                cc.log("------- 游戏中")
                break
            } else {
                this.gaming = false
            }
        }
        cc.log("------- this.gaming", this.gaming)
        this.menu.onBackClick();
    }
    /**
        * 打开其他玩家列表
        */
    onClickOther() {
        this.adoMgr.playClick();
        this.hbslOther.node.active = true
        this.hbslOther.show();
    }

    /**
   * 检测红包是否可以抢
   */
    checkCanGrab(money: number) {
        let me = this.plyMgr.me;
        let curMoney = +me.money;
        if (curMoney < money) {
            return false;
        } else {
            return true;
        }
    }

    /**
    * 存储发红包战绩信息
    * @param boomedPly
    */
    saveSendRecord(boomedPly: number, money: string) {
        if (this.sRecord.length >= 10) this.sRecord.pop();
        let sRecord = <sendRecord>{};
        sRecord.boomedPly = boomedPly;
        sRecord.rbMoney = money;
        this.sRecord.unshift(sRecord);
        cc.log("-------this.sRecord", this.sRecord.length)
    }
    /**
     *存储抢红包战绩信息
     * @param dataMoney
     * @param isBoom
     * @param boomNo
     */
    saveGrabRecord(dataMoney: string, isBoom: number, boomNo: number, money: string) {
        if (this.gRecord.length >= 10) {
            this.gRecord.pop();
        }
        let gRecord = <grabRecord>{};
        gRecord.money = money;
        gRecord.boom = boomNo;
        gRecord.grabMoney = dataMoney;
        gRecord.isBoom = isBoom;
        this.gRecord.unshift(gRecord);
    }
    /**
   * 打开我的战绩
   */
    onClickMyRecord() {
        this.adoMgr.playClick();
        this.hbslRecord.show();
        this.hbslOther.hide();
    }

    /**
     * 雷包排队中动画
     * @param isShow: 显示or隐藏
     * @param round: 轮次
     */
    redBagWaitingAni(isShow: boolean, round: number) {
        if (isShow) {
            // this.waitingAni();
            this.schedule(this.waitingAni, 4);
            this.waitingAniNds[0].parent.active = true;
        } else {
            this.waitingAniNds.forEach((val, idx) => {
                val.stopAllActions();
                if (idx < 5) {
                    val.setPosition(0, 0);
                } else {
                    val.setPosition(0, -8);
                }
            })
            this.waitingAniNds[0].parent.active = false;
            this.unschedule(this.waitingAni);
        }
        if (round) {
            this.lblWaitingRound.string = round.toString();
        }
    }
    waitingAni() {
        let delay = 0.25;
        this.waitingAniNds.forEach((val, idx) => {
            let actions = cc.sequence(
                cc.delayTime(delay * idx),
                cc.jumpTo(0.25, cc.v2(val.x, val.y), 10, 1)
            )
            // val.runAction(actions);
            cc.tween(val).then(actions).start();
        });
    }


    /**
    * 抢失败
    */
    public onGrabLose(unm: number) {
        // this.gray.active = false;
        let sty = "抢红包失败，请重试！"
        switch (unm) {
            case 0:
                break;
            case 1:
                sty = "金币不足,请充值！"
                if (this.hbslAutoGrab.isAutoGrab) {
                    this.hbslAutoGrab.onCilckAutoGrab()
                }
                break;
            case 2:
                sty = "所抢的红包不存在！"
            case 3:
                sty = "红包已经被抢完！"
            case 5:
                sty = "亲，红包列表已经达到上线，稍等一会才可以发呦。"
                break;
            default:
                break;
        }
        showTip(sty)
    }

    // update (dt) {}
}
