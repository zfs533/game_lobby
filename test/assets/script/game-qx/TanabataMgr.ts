/**
 * File: TanabataMgr
 */

import { showTip, showLoading, hideLoading } from "../common/ui";
import { ErrCodes } from "../common/code";
import lobby from "../lobby/lobby";
import * as TanType from "./TanType";
import { TipsType, QixiPrizeType, TanData, DyAvatarId } from "./TanType";
import Tanabata from "./Tanabata";
import audioQx from "./audioQx";
import { WelfareResult } from "../lobby/welfareEvents";
import User from "../common/user";
// import BYUtil from "../g-by/byUtil";
import * as util from "../common/util";
import FestivalBefore from "./FestivalBefore"
import Debug from "../start/debug";


const { ccclass, property } = cc._decorator;

/**七夕活动管理类 */
@ccclass
export default class TanabataMgr extends cc.Component {

    /**单例 */
    private static _instance: TanabataMgr = null;
    public static get Instance() {
        if (!this._instance) {
            this._instance = new TanabataMgr();
        }
        return this._instance;
    }
    constructor() {
        super();
        // this.hasQxStyle = true;//假数据
    }

    //---------------------------------- 脚本缓存 begin ------------------------
    /**大厅脚本 */
    lobby_script: lobby = undefined;
    /**活动界面脚本 */
    tanabata_script: Tanabata = undefined;
    /**音效脚本 */
    audioQx_script: audioQx = undefined;
    //----------------------------------- 脚本缓存 end -------------------------

    //------------------------------------配置数据 begin------------------------

    /**前置旋转圈速 */
    readonly rotateMaxCout: number = 4;

    /**旋转时长 单位：秒 */
    readonly rotateTime: number = 5;

    /**积分阶段 */
    readonly scoreArr: number[] = [100, 1000, 10000, 50000, 200000, 500000];

    /**请求排行榜冷却事件 单位：秒 */
    readonly requestInfoCDTime: number = 1 * 60;

    /**抽奖后弹窗提示文本数组 */
    readonly tipsArr: string[] = [
        "中奖啦～恭喜您获得%s金币。",
        "发财啦～恭喜您获得大红包。",
        "中奖啦～%s物品",
        "很遗憾～您本次未能中奖，请再接再厉，参与游戏可获得更多机会哟！",
    ];

    /**活动通知 */
    readonly notify: string[] = [
        "加载中",//[0]
        "您已拥有当前皮肤，请再摇一次！",//[1]
        "亲，赶快去参加国庆抽奖解锁吧，现在就要离开吗？",//[2]
        "您今天抽奖次数已经用完，请明日再来！",//[3]
        "活动未开放",
    ];

    /**跳转按钮文本数组 */
    goNameArr: string[] = ["<outline color=c65307 width=2>去看看</outline>",
        "<outline color=c65307 width=2>在线客服</outline>",
        "<outline color=c65307 width=2>玩一玩</outline>"];

    //------------------------------------配置数据 end---------------------------

    //-------------临时数据-----------

    /**存在活动配置 */
    activeIsOpen: boolean = false;

    /**是否解锁七夕炮台皮肤 */
    hasQxStyle: boolean = undefined;

    /**七夕炮台皮肤字段  此数据存在就代表活动开启过 （活动结束后，用此判断是否显示商店炮台皮肤） */
    hasQixiBulletStyle: number = undefined;

    /**当前奖励库key (id为值 依照配置数据顺序存储)*/
    curLibraryKey: number[] = [];

    /**当前奖励库 (请求  getEventConfig)*/
    curLibrary: TanData[] = [];

    /**缓存活动id */
    actID: number = undefined;

    /**活动是否开启 */
    onGoing: number = undefined;

    /**当前是活动第几天  0活动还没开启 */
    dayCount: number = 1;

    /**当天是否播放入场动画 */
    isShowDay: boolean = false;

    /**加载活动处理 */
    LoadingTimeID: any = undefined;

    /**成功请求到（活动数据） */
    isActiveOK: boolean = false;
    /**成功请求到（配置数据） */
    isConfigOK: boolean = false;

    /**有效下注，即积分 */
    score: number = 0;

    /**剩余抽奖次数 */
    remainCount: number = 0;

    /**幸运玩家列表 */
    luckyplayerList: TanType.LuckyData[] = [];

    /**个人记录列表 */
    personalRecordList: TanType.PersonData[] = [];

    /**实物奖励列表 */
    awardList: TanType.AwardData[] = [];

    /**当前抽奖缓存ID */
    curItemID: number = undefined;

    /**上次请求排行榜时间 单位：秒 */
    preRequestTime: number = 0;

    /**不再提示剩余次数 */
    dontShowFestvailTimes = false;

    //////////////////////////////////////////////////////////////

    /**是否有七夕活动 有配置 则为有 */
    get isActiveOpen(): boolean {
        return this.activeIsOpen;
    }

    /**是否显示炮台 */
    get isShowPaotai(): boolean {
        return true;
    }

    /**满足条件可打开活动界面 */
    open() {
        if (this.isActiveOK && this.isConfigOK) {
            this.lobby_script.showNationalDay();
        }
    }

    /**玩家解锁七夕皮肤*/
    setHasQxStyle(hasQixiBulletStyle: number) {
        this.hasQixiBulletStyle = hasQixiBulletStyle;
        this.hasQxStyle = (hasQixiBulletStyle && hasQixiBulletStyle == 1) ? true : false;
    }


    /**当前id是否是炮台 */
    isPaoTai(): boolean {
        //return this.curItemID == QixiPrizeType.fort_skin;
        let cfg = this.getTipData(this.curItemID);
        return (cfg.type == TipsType.skin);
    }

    /**关闭活动界面 数据处理*/
    close() {
        this.isActiveOK = false;
        this.closeLottery();
    }

    // /**当前进度值 */
    // get curPro(){
    //     let idx:number;
    //     let f:number = 0;
    //     let di:number = 1;
    //     let max = this.scoreArr[this.scoreArr.length - 1];
    //     if(this.score >= max){
    //         idx = 6;
    //         f = this.score - this.scoreArr[idx - 1];
    //         di = 1000000 - this.scoreArr[idx - 1];
    //         let pro:number = Number(1/7) * Number(f/di) + Number(1/7) * idx;
    //         if (pro > 1){
    //             pro = 1;
    //         }
    //         return pro;
    //     }else if(this.score < this.scoreArr[0]){
    //         idx = 0;
    //         f = this.score - 0;
    //         di = this.scoreArr[idx] - 0;
    //     }else{
    //         for (let index = 0; index < this.scoreArr.length - 1; index++) {
    //             if(this.score >= this.scoreArr[index] && this.score < this.scoreArr[index + 1]){
    //                 idx = index + 1;
    //                 f = this.score - this.scoreArr[idx - 1];
    //                 di = this.scoreArr[idx] - this.scoreArr[idx - 1];
    //                 break;
    //             }
    //         }
    //     }
    //     let pro:number = Number(1/7) * Number(f/di) + Number(1/7) * idx + 0.002;
    //     return pro;
    // }


    /////////////////////////////////////////////////////////////////////////

    /**获取库中最小id */
    getMinID(): number {
        let curLibraryKey = TanabataMgr.Instance.curLibraryKey;
        let minID = 900;
        for (let index = 0; index < curLibraryKey.length; index++) {
            const element = curLibraryKey[index];
            if (element < minID) {
                minID = element;
            }
        }
        return minID;
    }

    /**
      * 获取对应物品数据
      * @param id
      */
    getTipData(id: number): TanType.TanData {
        if (this.curLibraryKey[id] != undefined) {
            return this.curLibrary[id];
        }
        cc.error(id, "对应物品ID,在配置列表中找不到");
    }

    /**
     * 获取对应物品类型
     * @param id
     */
    getTipType(id: number): number {
        if (this.curLibraryKey[id] != undefined) {
            return this.curLibrary[id].type;
        }
        cc.error(id, "对应物品ID,在配置列表中找不到");
    }

    /**获取弹窗提示文本 */
    getTipsString(): string {
        let curData = this.getTipData(this.curItemID);
        let str: string;
        switch (curData.type) {
            case TipsType.none:
                str = this.tipsArr[3];
                break;
            case TipsType.gold:
                str = this.formtString(this.tipsArr[0], curData.quantity);
                break;
            case TipsType.hongbao:
                str = this.tipsArr[1];
                break;
            case TipsType.skin:
            case TipsType.avatarBox:
            case TipsType.real:
                str = this.formtString(this.tipsArr[2], curData.name);
                break;
            default:
                break;
        }
        return str;
    }

    /**抽奖记录时间排序 */
    sort_compare(a: any, b: any) {
        if (a.date > b.date) {
            return -1;
        }
        if (a.date < b.date) {
            return 1;
        }
        return 0;
    }

    //////////////////////////////////----- MSG ----/////////////////////////////////////////

    /**对服务端的推送作出响应 */
    public addExtraListeners() {
        window.pomelo.off("qixiRefreshLuckyUsers");
        window.pomelo.on("qixiRefreshLuckyUsers", this.qixiRefreshLuckyUsers.bind(this));
    }

    /**注销响应 */
    public removeExtraListeners() {
        window.pomelo.off("qixiRefreshLuckyUsers");
    }

    /**请求当前奖励配置 */
    getEventConfig() {
        window.pomelo.request("event.eventHandler.getEventConfig", { actId: this.actID }, (
            msg: {
                code: number,                     // 返回码
                config: TanType.TanData[]
            }) => {
            if (msg.code !== 200) {
                showTip(ErrCodes.getErrStr(msg.code, "获取活动数据失败" + msg.code));
            } else if (msg.config) {
                for (let index = 0; index < msg.config.length; index++) {
                    const element = msg.config[index];
                    this.curLibrary[element.id] = element;
                    this.curLibraryKey.push(element.id);
                }
                // cc.log("&&&&&&&&&&-------this.curLibraryKey:",this.curLibraryKey);
                // cc.log("&&&&&&&&&&-------this.curLibrary:",this.curLibrary);
                this.isConfigOK = true;
                this.open();
            }
            this.isConfigOK = true;
        });
    }


    /**
     * 获取活动数据
     * @param isOnce 第一次请求 //进入活动页面
     */
    getEventLotteryData(isOnce: boolean = false) {
        if (this.isActiveOpen == false) {
            showTip(this.notify[4]);
            return;
        }
        if (isOnce) {
            showLoading("加载中");
            if (this.LoadingTimeID) {
                clearTimeout(this.LoadingTimeID);
                this.LoadingTimeID = undefined;
            }
            this.LoadingTimeID = setTimeout(() => {
                hideLoading();
                showTip(ErrCodes.getErrStr(this.actID, "请求无反应"));
            }, 5000);
        } else {
            let curTime = (new Date).getTime();
            if (curTime - this.preRequestTime < this.requestInfoCDTime) {
                return;//冷却时间
            }
            this.preRequestTime = curTime;
        }
        //
        window.pomelo.request("event.eventHandler.getLotteryEventInfo", { actId: this.actID }, (msg: TanType.totalMsgData) => {
            if (isOnce) {
                if (this.LoadingTimeID) {
                    clearTimeout(this.LoadingTimeID);
                    this.LoadingTimeID = undefined;
                }
                hideLoading();
            }
            if (msg.code !== 200) {
                // 13010: "活动未开放",  1 有活动配置 但不在活动时间内
                // 13006: "活动即将来临",  2未到活动时间
                // 13007: "活动已结束",  3超过活动时间
                switch (msg.code) {
                    case 13006:
                        // this.lobby_script.showFestivalBefore(msg.startDate);
                        showTip("活动即将来临");
                        return;
                    case 13007:
                        this.activeIsOpen = false;
                        showTip("活动已结束");
                        return;
                    case 13010:
                        this.activeIsOpen = false;
                        showTip("活动未开放");
                        return;
                    ////
                    case 500:
                        this.activeIsOpen = false;
                        if (this.actID != undefined) {
                            window.pomelo.request("event.eventHandler.getEventData", {}, (data: { code: number, result: WelfareResult[] }) => {
                                if (data.code === 200) {
                                    Debug.log("qx活动信息2：  " + data.result);
                                    if (data.result) {
                                        data.result.forEach(element => {
                                            if (element.eventType === "lottery") {//节日活动抽奖
                                                TanabataMgr.Instance.activeIsOpen = true;
                                            }
                                        });
                                    };
                                }
                            });
                        }
                        if (this.activeIsOpen == false) {
                            showTip("活动未开放");
                            return;
                        }
                        return;
                    default:
                        showTip(ErrCodes.getErrStr(msg.code, "获取活动数据失败"));
                        break;
                }
            } else {
                if (msg.info) {
                    this.dayCount = msg.day;
                    //this.isShowDay = (msg.isShowDay == 1) ? true : false;
                    //国庆活动不需要播放入场动画
                    this.isShowDay = false;
                    // cc.log("-------------活动第" + this.dayCount + "天---------------------------");

                    this.score = parseInt(msg.info.betMoney);
                    if (!this.score) {
                        this.score = 0;
                    }
                    this.remainCount = msg.info.remainTimes;
                    // if (this.lobby_script) {
                    //     this.lobby_script.updateTanbataRed();
                    // }
                }

                if (msg.luckyUsers) {
                    this.luckyplayerList.splice(0, this.luckyplayerList.length);
                    this.luckyplayerList = msg.luckyUsers;
                    this.luckyplayerList.sort(this.sort_compare);
                    //筛选实物奖励 awardList
                    this.awardList.splice(0, this.awardList.length);
                    for (let index = 0; index < this.luckyplayerList.length; index++) {
                        const element: TanType.LuckyData = this.luckyplayerList[index];
                        if ((element.prizeType == TipsType.real
                            || element.prizeType == TipsType.skin
                            || element.prizeType == TipsType.avatarBox)) {
                            this.awardList.push({
                                prizeId: element.prizeId,
                                userName: element.userName,
                                date: element.date,
                                prizeName: element.prizeName
                            });
                            //排除实物奖励
                            this.luckyplayerList.splice(index, 1);
                            index--;
                        }
                    }
                }
                this.awardList.sort(this.sort_compare);

                if (msg.personRecords && msg.personRecords.length > 0) {
                    this.personalRecordList = msg.personRecords;
                    this.personalRecordList.sort(this.sort_compare);
                }
                if (isOnce) {
                    this.isActiveOK = true;
                    this.open();
                } else {
                    //刷新
                    if (this.tanabata_script) {
                        this.tanabata_script.RefreshLabel();
                        this.tanabata_script.Refresh();
                        this.tanabata_script.Refresh2();
                    }
                }
            }
        });//
    }

    /**点击转盘的抽奖按钮反馈 */
    doLottery() {
        if (this.isActiveOpen == false) {
            showTip(this.notify[4]);
            return;
        }
        window.pomelo.request("event.eventHandler.doLottery", { actId: this.actID }, (msg: TanType.WinnMsgData) => {
            if (msg.code !== 200 && msg.code != 13008) {
                showTip(ErrCodes.getErrStr(msg.code, "点击抽奖请求失败"));
            } else {
                if (!msg.info) {
                    cc.error(msg, "点击转盘的抽奖按钮反馈为空");
                    return;
                }
                if (msg.info) {
                    this.curItemID = msg.info.prizeId;

                    if (msg.info.hasFort == 1 || msg.code == 13008) {
                        this.hasQxStyle = true;
                    }

                    this.remainCount = msg.info.remainTimes;
                    this.tanabata_script.beginRotate(this.curItemID);

                    //手动将头像框加入
                    if (msg.info.prizeType == TipsType.avatarBox) {
                        if (User.avatarBoxList && User.avatarBoxList.indexOf(DyAvatarId.gq) < 0) {
                            User.avatarBoxList.push(DyAvatarId.gq);
                        }
                    }

                    // if (msg.info.prizeType == TipsType.none){
                    //     return;
                    // }

                    if (this.hasQxStyle && this.isPaoTai()) {
                        //炮台只能出现一次
                    } else {//
                        // cc.log("加入个人记录列表=======抽奖前  personalRecordList==========：",this.personalRecordList);
                        //加入个人记录列表
                        this.personalRecordList.push({
                            prizeId: msg.info.prizeId,
                            prizeType: msg.info.prizeType,
                            prizeQuantity: msg.info.prizeQuantity,
                            prizeName: msg.info.prizeName,
                            date: msg.info.date
                        });
                        this.personalRecordList.sort(this.sort_compare);
                        // cc.log("加入个人记录列表======抽奖后  personalRecordList==========：",this.personalRecordList);
                    }
                }
            }
        });
    }


    /**活动页面关闭 请求*/
    public closeLottery() {
        window.pomelo.request("event.eventHandler.closeLottery", { actId: this.actID }, (data: { code: number }) => { })
    }

    /** 有玩家中奖后实时刷新*/
    qixiRefreshLuckyUsers(msg: TanType.WinnMsgData2) {
        //加入幸运玩家列表
        if (msg) {
            if ((msg.prizeType == TipsType.real
                || msg.prizeType == TipsType.skin
                || msg.prizeType == TipsType.avatarBox)) {
                //缓存实物列表  能是炮台
                cc.log("缓存实物列表======抽奖  awardList==========：", this.awardList);
                this.awardList.push({
                    prizeId: msg.prizeId,
                    userName: msg.userName,
                    date: msg.date,
                    prizeName: msg.prizeName
                });
                this.awardList.sort(this.sort_compare);
                cc.log("缓存实物列表======抽奖后  awardList==========：", this.awardList);
            } else {
                cc.log("加入幸运玩家列表======抽奖  luckyplayerList==========：", this.luckyplayerList);
                this.luckyplayerList.push({
                    prizeId: msg.prizeId,
                    prizeType: msg.prizeType,
                    userName: msg.userName,
                    prizeQuantity: msg.prizeQuantity,
                    prizeName: msg.prizeName,
                    date: msg.date,
                });
                this.luckyplayerList.sort(this.sort_compare);
                cc.log("加入幸运玩家列表======抽奖后  luckyplayerList==========：", this.luckyplayerList);
            }
            // cc.log("===================执行刷新2==================");
        }
    }

    //////////////////////////通用方法  //////////////////////////////

    /**
     * 字符串模糊处理  50%
     * @param name
     */
    halfName(name: string) {
        if (!name || name === "") {
            return "";
        }
        let len: number = name.length;
        let halfIdx = 3;//Math.floor(len/2);
        let target: string = name.slice(0, halfIdx)
        for (let index = halfIdx; index < len; index++) {
            target = target.concat('*');
        }
        return target;
    }

    /**
     * 格式化字符串
     * @param str 原串
     * @param target 目标串
     * @param rep 默认替换协议
     */
    formtString(str: string, target: string, rep = /%s/i,) {
        var newstr = str.replace(rep, target);
        return newstr
    }

    /**
     * 销毁节点树(递归实现 )
     * @param node 目标节点
     * @param isDes true :不销毁根节点(node)
     */
    allDestroy(node: cc.Node, isDes?: boolean) {
        // cc.log("--------开始销毁目标节点树---",node.name,isDes ? "保留目标节点" : "销毁目标节点");
        if (!node || !node.isValid) {
            cc.error("GlobalFunction.allDestroy err", node);
        }
        while (node.childrenCount > 0) {
            this.allDestroy(node.children.pop());
        }
        if (!isDes) {
            if (node.parent) {
                cc.log("Destroy:(" + node.name, ")  parent:" + node.parent.name);
                node.parent.removeChild(node);
                node.destroy();
            }
        }
    }

}
