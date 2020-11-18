import GameMsg from "../g-share/gameMsg";
import net from "../common/net";
import { ROUTE } from "../common/route";
import HbslGame from "./hbslGame";
import HbslRedBagInfo from "./hbslRedBagInfo";
let Decimal = window.Decimal;

const { ccclass, property } = cc._decorator;

export enum ERR_CODE {
    //默认占位符
    DEFAULT = 0,
    //玩家金币不够
    NOMONY = 1,
    //所抢的红包不存在
    NOHONGBAO = 2,
    //已经抢过该红包
    ISGRABED = 3,
    //自己发的红包
    HONGBAOSELF = 4
}
@ccclass
export default class HbslMsg extends GameMsg {
    protected game: HbslGame;
    protected regMsgHanlder(): void {
        // 抢红包游戏中金额可退还，所以需要这里单独监听一下自身money的变化
        this.onMsg(ROUTE.userMoney, this.handleUserMoney.bind(this));
        // 抢红包这里要单独处理
        // this.onMsg(ROUTE.startFreeTick, this.startFreeTick.bind(this));
        this.onMsg(ROUTE.hbsl_ChangeHongBao, this.updateRedBagsInfo.bind(this));         //某个区域红包被抢完，更换红包
        // this.onMsg(ROUTE.hbsl_HongBaoRecordList, this.grabRecordRedBag.bind(this));        //玩家抢红包记录
        this.onMsg(ROUTE.hbsl_BaoHongBao, this.sendRedBag.bind(this));           //发红包成功
        // this.onMsg(ROUTE.hbsl_grabFail, this.grabFail.bind(this));   //抢红包失败回复
        this.onMsg(ROUTE.Hbsl_GrabBalance, this.grabHongBao.bind(this));                   //抢红包
        this.onMsg(ROUTE.hbsl_BackBalance, this.backBalance.bind(this));                   //结算

    }

    private handleUserMoney = (data: { money: string }) => {
        // cc.log("更新玩家金币", data.money);
        let me = this.game.plyMgr.me;
        me.money = new Decimal(data.money).add(0).toString();
        me.updateMoney()

    }
    /**
     *更新红包信息
     */
    updateRedBagsInfo(data: ps.Hbsl_ChangeHongBao) {
        if (data.queueLength > 0) {
            this.game.redBagWaitingAni(true, data.queueLength);
        } else {
            this.game.redBagWaitingAni(false, data.queueLength)
        }
        this.game.updateRedBagsInfo(data.changeHonBao);
        // 同步下注额
    }

    /**
     *抢红包成功玩家结算
     */
    grabHongBao(data: ps.Hbsl_GrabBalance) {
        // if (data.code){
        //     this.game.onGrabLose(data.code);
        //  return
        // }
        this.game.balanceRedBag(data)
        // 同步下注额
        this.game.plyMgr.updatePlyBets(data.graberInfo.pos, data.graberInfo.money,data.graberInfo.sendHongBaoCount.toString(), data.graberInfo.noBoomCount);
        this.game.plyMgr.updatePlyBets(data.masterInfo.pos, data.masterInfo.money, data.masterInfo.sendHongBaoCount.toString(), data.masterInfo.noBoomCount);

    }
    /**
    *发红包成功
    */
    sendRedBag(data: ps.Hbsl_BaoHongBao) {
        let p = this.game.plyMgr.getPlyByPos(data.pos);
        if (p && p.isMe) {
            let me = this.game.plyMgr.me;
            me.money = data.money
            me.updateMoney()
            if (data.queueLength && data.queueLength > 0) {
                this.game.redBagWaitingAni(true, data.queueLength);
            } else {
                this.game.redBagWaitingAni(false, data.queueLength)
            }
            if (!data.hbSendList) return
            this.game.hbslPackRedBag.sendRedBagList(data.hbSendList)
        }
         this.game.plyMgr.updatePlyBets(data.pos, data.money);

    }
    // /**
    //   *抢的红包记录
    //   */
    // grabRecordRedBag(data: ps.Hbsl_HongBaoRecordList) {
    //     // this.game.hbslRecord.redBagRecordInfo(data)
    // }

    /***
     * 红包结算
     */
    backBalance(data: ps.Hbsl_BackBalance) {
        if (!data.userInfo)  return;
        let payers = this.game.plyMgr.getPlyByPos(data.userInfo.pos)
        if (payers&&payers.isMe) {
            payers.money =data.userInfo.money
            payers.updateMoney();
        }
        this.game.plyMgr.updatePlyBets(data.userInfo.pos ,data.userInfo.money);
    }
    protected handleGameInfo(data: ps.Hbsl_GameInfo) {
        // cc.log("-------------------handleCurrentGameInfo------------------------", data);
        super.handleGameInfo(data);
        if (data.hongBaoList) {
            for (let index = 0; index < data.hongBaoList.length; index++) {
                this.game.updateRedBagsInfo(data.hongBaoList[index]);
                if (data.hongBaoList[index].isGrabbed) {
                    this.game.handleRedBagsInfo(data.hongBaoList[index])
                }
            }
        }
        if (data.queueLength) {
            if (data.queueLength > 0) {
                this.game.redBagWaitingAni(true, data.queueLength);
            } else {
                this.game.redBagWaitingAni(false, data.queueLength)
            }
        }
        if (data.userInfo) {
            data.userInfo.forEach((info) => {
                // 同步下注额
                this.game.plyMgr.updatePlyBets(info.pos, undefined, info.sendHongBaoCount.toString(), info.noBoomCount);
            })
        }
        if (data.hbSendList) {
            this.game.hbslPackRedBag.sendRedBagList(data.hbSendList)
        }
    }
    /**
    * 包红包
    */
    sendPackRedBag(money: string, boomNo: number, grabCount: number, hbCount: number) {
        net.notify("game.hbslHandler.baoHongBao", { money: money, boomNo: boomNo, grabCount: grabCount, hbCount: hbCount });
    }

    /**
    * 抢红包
    */
    sendGrabRedBag(area: number) {
        net.notify("game.hbslHandler.grabHongBao", { area: area });
    }
    /**
     * 点击红包列表
     */
    sendGetHongBaoList() {
        // net.notify("game.hbslHandler.getHongBaoList", {});
    }

    /**
   * 自动抢
   */
    sendAutoGrab(minMoney: string, maxMoney: string, grabBoomNo: number[]) {
        net.notify("game.hbslHandler.autoGrab", { minMoney: minMoney, maxMoney: maxMoney, grabBoomNo: grabBoomNo });
    }

    /**
  * 取消自动抢
  */
    sendCanceAutoGrab() {
        net.notify("game.hbslHandler.cancelAutoGrab", {});
    }
    // update (dt) {}
}
