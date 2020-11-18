import GameMsg from "../g-share/gameMsg";
import QHBGame from "./qhbGame";
import { showTip } from "../common/ui";
import { ROUTE } from "../common/route";
import net from "../common/net";

let Decimal = window.Decimal
const { ccclass, property } = cc._decorator;

export enum GameStatus {
    GRAB = 1,
    BALANCE,
}

@ccclass
export default class QHBMsg extends GameMsg {
    protected game: QHBGame;

    protected regMsgHanlder(): void {
        // 抢红包游戏中金额可退还，所以需要这里单独监听一下自身money的变化
        this.onMsg(ROUTE.userMoney, this.handleUserMoney.bind(this));
        // 抢红包这里要单独处理
        this.onMsg(ROUTE.startFreeTick, this.startFreeTick.bind(this));
        this.onMsg(ROUTE.qhb_ChangeStatus, this.updateGameStatus.bind(this));
        this.onMsg(ROUTE.qhb_CurHongBaoInfo, this.setCurRedBagInfo.bind(this));
        this.onMsg(ROUTE.qhb_BaoHongBao, this.refreshRedBagList.bind(this));
        this.onMsg(ROUTE.qhb_GrabHongBao, this.refreshGrabRedBagPlayerList.bind(this));
        this.onMsg(ROUTE.qhb_DoBalance, this.gameResult.bind(this));
        this.onMsg(ROUTE.qhb_GetHongBaoList, this.getHongBaoList.bind(this));

    }

    private handleUserMoney(data: { money: string }) {
        // cc.log("玩家金币变化", data);
        // 玩家在发红包队列中时，已经扣掉的金币，服务器并没有数据库结算，而当他抢的时候又会返回，此时特殊处理
        let me = this.game.plyMgr.me;
        if (this.game.isWaitingList) {
            if (this.game.autoSendMoney) { // 处理玩家抢了红包推出游戏再进当局没有结束autoSendMoney为空报错的情况
                let finalMoney = new Decimal(data.money).sub(this.game.autoSendMoney).toNumber();
                if (finalMoney < 0) {
                    showTip("因金币不足，已将您红包列表中的红包撤回！");
                    this.game.isWaitingList = false;
                    let myPos = this.game.plyMgr.getMePos();
                    for (let i = 0; i < this.game.redBagList.length; i++) {
                        if (myPos === this.game.redBagList[i].pos) {
                            this.game.redBagList.splice(i, 1);
                            this.game.refreshWaitingRedBagList(false);
                            break;
                        }
                    }
                    this.game.redBagWaitingAni(false, 0);
                    me.money = new Decimal(data.money).add(0).toString();
                } else {
                    me.money = finalMoney.toString();
                }
            }
        } else {
            me.money = new Decimal(data.money).add(0).toString();
        }
        me.updateBets(0, +me.money, true);
    }

    /**
    * 开局
    */
    private startFreeTick() {
        // cc.log("--------startFreeTick--------");
        if (this.game.robotIsClose) {
            this.game.switchRedBag();

            this.game.robotIsClose = false;
        }
    }

    /**
    * 设置当前红包信息
    */
    private setCurRedBagInfo(data: ps.Qhb_CurHongBaoInfo) {
        //cc.log("设置当前红包信息", data);
        this.game.robotIsClose = true;
        this.game.setCurRedBagInfo(data);
        //this.game.ndClockTimer.position = cc.v2(222.7, 210.1);
        this.game.clockTimerManger(true);
        // if (this.game.isClickGrab) {
        //     this.game.ndClockTimer.position = cc.v2(0, -82);
        // }
        this.game.setTimer(data.leftTime);
        if (this.game.autoGrab) {
            let curMoney = data.curHB.money;
            // let curBoomNo = data.curHB.boomNo;
            let b1 = this.game.checkCanGrab(curMoney)
            if (b1) { // && this.game.checkRedBagCanGrab(curMoney, curBoomNo)
                // let pos = this.game.plyMgr.getMePos();
                this.sendGrabRedBag();
                // this.game.ndClockTimer.position = cc.v2(0, -80);
                //this.game.clockTimerManger(false);

            } else {
                showTip("亲，金币不足自动抢已取消~");
                this.game.cancelAutoGrab();
            }
        }

        if (this.game.autoSend && !this.game.isWaitingList) {
            if (!this.game.checkMoneyEnoughAuto(this.game.autoSendMoney)) {
                this.game.cancelAutoSend();
                showTip("金币不足，自动发红包已取消～");
                return;
            }

            this.sendPackRedBag(this.game.autoSendMoney, this.game.autoSendBoomNo);
        }
    }

    /**
    * 刷新抢中红包玩家列表
    */
    private refreshGrabRedBagPlayerList(data: ps.Qhb_GrabHongBao) {
        // cc.log("刷新抢中红包玩家列表", data);
        this.game.refreshGrabPlayerList(data);
    }

    /**
    * 刷新待发红包列表
    */
    private refreshRedBagList(data: ps.Qhb_BaoHongBao) {
        // cc.log("刷新待发红包列表", data);
        // 收到最新的一个红包信息，添加进入红包待发红包列表
        this.game.redBagList.push(data.hongBao);
        if (data.hongBao.pos === this.game.plyMgr.me.pos) {
            this.game.isWaitingList = true;
            let me = this.game.plyMgr.me;
            let chgMoney = `-${this.game.autoSendMoney}`;
            me.refreshMoney(chgMoney);
            this.game.redBagWaitingAni(true, this.game.checkMyWaitingRound())
        }
        this.game.refreshWaitingRedBagList(true, data.hongBao);
    }

    /**
    * 更新游戏状态
    */
    private updateGameStatus(data: ps.Qhb_ChangeStatus) {
        // cc.log("更新游戏状态", data);
        this.game.changeState(data.status);
    }

    /**
    * 游戏结算
    */
    private gameResult(data: ps.Qhb_DoBalance) {
        // cc.log("游戏结算", data);
        if (data.userInfo) {
            this.game.gameResult(data);
            data.userInfo.forEach((info) => {
                // 同步下注额
                this.game.plyMgr.updatePlyBets(info.pos, info.totalSendMoney, info.noBoomCnt);
            })
        }
    }


    /**
     * 获得红包列表
     * @param data
     */
    private getHongBaoList(data: ps.Qhb_GetHongBaoList) {
        if (data.hongBaoList) {
            this.game.redBagList = data.hongBaoList;
        } else {
            this.game.redBagList = [];
        }
        this.game.qhbPack.showRedBagList();
    }

    /**
    * 断线重连
    */

    protected handleGameInfo(data: ps.Qhb_GameInfo) {
        // cc.log("-------------------handleCurrentGameInfo------------------------", data);
        super.handleGameInfo(data);
        this.game.changeState(data.status);
        this.game.robotIsClose = true;
        if (data.hongbaoList) {
            this.game.redBagList = data.hongbaoList;
        }
        if (data.curHongBao) {
            let rb = data.curHongBao;
            this.game.bankerPos = rb.pos;
            this.game.curRedBagInfo = rb;
            let p = this.game.plyMgr.getPlyInfoByPos(rb.pos);
            let redBag = this.game.getCurRedBagByOrder(0);
            redBag.setRedBagInfo(p, rb.money, 0);
        }

        if (data.userInfo) {
            data.userInfo.forEach((userInfo) => {
                if (userInfo.isGrabbed) {
                    this.game.refreshGrabPlayerList(userInfo);
                }
                // 同步下注额
                this.game.plyMgr.updatePlyBets(userInfo.pos, userInfo.totalSendMoney, userInfo.noBoomCnt);
            })
        }
    }


    /**
    * 包红包
    */
    sendPackRedBag(money: string, boomNo: number) {
        net.notify("game.qhbHandler.baoHongBao", { money: money, boomNo: boomNo });
    }

    /**
    * 抢红包
    */
    sendGrabRedBag() {
        net.notify("game.qhbHandler.grabHongBao", {});
    }
    /**
     * 点击红包列表
     */
    sendGetHongBaoList() {
        net.notify("game.qhbHandler.getHongBaoList", {});

    }

}
