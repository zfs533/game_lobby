import LobbyHome from "./lobbyHome";
import LobbyUser from "./lobbyUser";
import Stage from "./stage";
import Bank from "./bank";
import { BillBoard } from "./billBoard";
import AudioLobby from "./audioLobby";
import PopActionBox from "./popActionBox"
import { MailMsg } from "./mailMsg";
import MailBox from "./mailBox";
import LoginHelper from "../start/loginHelper";
import g from "../g";
import { fitCanvas, getCommonRatio, setIsMessger, getIsMessger, checkLocalTime, formatTimeStr } from '../common/util';
import net from "../common/net";
import { hideLoading, showLoading, showTip, showConfirm } from "../common/ui";
import { ErrCodes } from "../common/code";
import { GameId, ItemNames } from "../common/enum";
import { SCENE_NAME, GAME_NAME } from "../common/cfg";
import User from "../common/user";
import GameHelp from "../g-share/gameHelp";
import { How2Play } from "../common/how2play";
import { WelfareEvents, WelfareResult } from "./welfareEvents";
import Debug from "../start/debug";
import shopPackage from "./shopPackage"
import agentUtil from "./agentUtil"
import PayRebateEvents from "./payRebateEvents";
import CustomerServiceChat from "./customerServiceChat";
import RechargeMessage from "./rechargeMessage";
import { AcceptChatMsg } from "./agentChat";
import VipView from "./vipWelfare/vipView";
import CustomerServicePlat from "./csPlat/customerServicePlat";
import Recharge from "./pay";
import { WeeklyRebateModel } from "./weeklyRebate/weeklyRebateModel";
import WeeklyRebate from "./weeklyRebate/weeklyRebate";
import FLLoginTip from "./weeklyRebate/flLoginTip";
import ActivityModel from "./activityModel";
import FootBall from "./IM/footBall";
import BG_Video from "./DG/bG_Vidoe";
import VIPWelfare from "./vipWelfare/vipWelfare";
import Loading from "../common/loading";
import ActivityPanel from "../activity/activityPanel";
import TanabataMgr from "../game-qx/TanabataMgr";
import Tanabata from "../game-qx/Tanabata";
import FestivalBefore from "../game-qx/FestivalBefore";
const { ccclass, property } = cc._decorator;

let Decimal = window.Decimal;
// 大厅现处于的界面
export enum LOBBY_STATUS {
    Lobby,
    Stage,

}
interface GetVipRed {
    code: number; //code码
    redInfo?: Array<GetVipRed_Info>; //红包信息

}

interface GetVipRed_Info {
    id: string; //红包id
    money: string; //红包金
}
@ccclass
export default class Lobby extends cc.Component {
    @property(AudioLobby)
    audioLobby: AudioLobby = undefined;

    @property(Stage)
    stage: Stage = undefined;

    @property(LobbyHome)
    lobbyHome: LobbyHome = undefined;

    @property(cc.Prefab)
    private preFallCoin: cc.Prefab = undefined;

    @property(MailMsg)
    mailMsg: MailMsg = undefined;

    @property(cc.Node)
    nodeParent: cc.Node = undefined;

    @property(cc.Node)
    newTransfer: cc.Node = undefined;

    @property(cc.Node)
    nodeTopMenu: cc.Node = undefined;

    @property(cc.Label)
    lblOffcialWeb: cc.Label = undefined;

    @property(cc.Node)
    private nodeCanvas: cc.Node = undefined;

    @property(cc.Node)
    private webviewbg: cc.Node = undefined;

    // 入口按钮
    @property(cc.Button)
    private btnQmdl: cc.Button = undefined;

    // 福利活动按钮
    @property(cc.Node)
    private nodeEvents: cc.Node = undefined;

    @property(cc.Button)
    private btnBack: cc.Button = undefined;

    @property(cc.Button)
    private btnWithdraw: cc.Button = undefined;

    @property(cc.Button)
    private btnBank: cc.Button = undefined;

    @property(cc.Button)
    protected btnQuickRecharge: cc.Button = undefined;

    @property(cc.Node)
    protected btnQuickBank: cc.Node = undefined;

    // 子界面
    @property(cc.Prefab)
    private preWelfare: cc.Prefab = undefined;

    @property(cc.Prefab)
    private preRechargeRebate: cc.Prefab = undefined;

    @property(cc.Prefab)
    private preBank: cc.Prefab = undefined;

    @property(cc.Prefab)
    private preWithdraw: cc.Prefab = undefined;

    @property(cc.Prefab)
    shopPackageView: cc.Prefab = undefined


    @property(cc.Prefab)
    private prefabPay: cc.Prefab = undefined;

    @property(cc.Prefab)
    private preCS: cc.Prefab = undefined;

    @property(cc.Prefab)
    private preBindUser: cc.Prefab = undefined;

    @property(cc.Prefab)
    private preRegister: cc.Prefab = undefined;

    @property(cc.Prefab)
    private preUserInfo: cc.Prefab = undefined;

    @property(cc.Prefab)
    private preSetting: cc.Prefab = undefined;

    @property(cc.Prefab)
    private preMail: cc.Prefab = undefined;

    @property(cc.Prefab)
    private preBillBoard: cc.Prefab = undefined;

    @property(cc.Prefab)
    private prePopularize: cc.Prefab = undefined;

    @property(cc.Prefab)
    private rechargeMessagePrb: cc.Prefab = undefined;


    @property(cc.Prefab)
    private preReportReward: cc.Prefab = undefined;

    @property(cc.Prefab)
    private gameHelp: cc.Prefab = undefined;

    @property(cc.Prefab)
    private vipwindow: cc.Prefab = undefined;

    @property(cc.Node)
    private msgPotNode: cc.Node = undefined;

    @property(cc.Prefab)
    private customerServiceChat: cc.Prefab = undefined;

    @property(cc.Prefab)
    private customerServicePlat: cc.Prefab = undefined;

    @property(cc.Prefab)
    private preVip: cc.Prefab = undefined;


    @property(cc.Node)
    newMess: cc.Node = undefined;


    @property(cc.Prefab)
    footBallPrb: cc.Prefab = undefined;

    @property(cc.Prefab)
    BG_VideoPrb: cc.Prefab = undefined;

    //VIP红包活动
    @property({ type: cc.Prefab, tooltip: "VIP红包福利弹窗" })
    VIP_Welfare: cc.Prefab = null;

    @property(cc.Node)
    download: cc.Node[] = [];

    @property(cc.Sprite)
    downloadLab: cc.Sprite[] = [];
    public isNewMess: boolean = false;
    private billTitle: ps.HallHallHandlerGetBulletinTitle_BulletinTitle[];
    private lUserRegister: PopActionBox = undefined;
    private lUserInfo: PopActionBox = undefined;
    private lMail: PopActionBox = undefined;
    private lBillBoard: BillBoard = undefined;

    private showStage: boolean = undefined;

    private welfareEvents: WelfareEvents = undefined;
    welfareEventID: number = 2;    // 活动id
    welfareCfgCondition: ps.HallEventHandlerChkChannel_Info[]; // 活动配置金额（包含充值与流水）
    welfareCurCondition: ps.HallEventHandlerChkChannel_Info; // 活动当前金额（包含充值与流水）
    welfareGetState: number;  // 活动是否领取状态

    private rechargeRebateSwitch: number;   // 返利活动开关
    isOpenRechargeRebate: boolean;          // 是否点击前往返利
    vipData: ps.HallHallHandlerGetUserVipInfo_VipInfo;  // vip数据暂存
    private isLoadingVipData: boolean = true;   // 是否请求了vip数据

    public isRecharge: boolean = false;
    public _lUser: LobbyUser;
    NationalDayPanel: cc.Node = undefined
    festivalBeforePanel: cc.Node = undefined


    //---周返利移植----
    @property({ type: cc.Prefab, tooltip: "周返利预制资源" })
    weeklyRebatePrb: cc.Prefab = null;


    @property({ type: cc.Node, tooltip: "周返利消息提示" })
    zfl_MsgNode: cc.Node = null;


    @property({ type: cc.Prefab, tooltip: "周返利登陆弹窗" })
    FL_TanChuang: cc.Prefab = null;

    @property(cc.Prefab)
    activityPanel: cc.Prefab = null;
    //---结束---

    /**活动国庆Prefab */
    @property(cc.Prefab)
    preNationalDay: cc.Prefab = undefined;

    /**活动国庆预热Prefab */
    @property(cc.Prefab)
    festivalBefore: cc.Prefab = undefined;


    get lUser() {
        if (!this._lUser) {
            let topNode = cc.find("Canvas/top");
            this._lUser = topNode.getComponent(LobbyUser);
        }
        return this._lUser;
    }
    protected _currLobbyUI: LOBBY_STATUS;
    get currLobbyUI() {
        return this._currLobbyUI;
    }

    /**
     * 显示或隐藏的功能
     *
     * @private
     * @type {*}
     * @memberof Lobby
     */
    private static _availableFuncs: {
        withdraw?: 0 | 1,
        recharge?: 0 | 1,
    } = {};
    static get availableFuncs() {
        return this._availableFuncs;
    }

    onLoad() {
        fitCanvas(this.nodeCanvas);

        let ratio = getCommonRatio();
        let width = this.lobbyHome.node.width;
        this.lobbyHome.node.setContentSize(width * ratio, 640);
        this._currLobbyUI = LOBBY_STATUS.Lobby;

        this.lobbyHome.init(this);
        this.setAvatarShow(true);

        this.initChannelShield();

        if (cc.sys.isNative) {
            this.vipNotice();
        }



        agentUtil.init();

        if (getIsMessger()) {
            this.showMessagePrompt(true);
            setIsMessger(false);
        } else {
            this.showMessagePrompt(false);
            setIsMessger(false);
        }
        if (localStorage.getItem("isNewMess")) {
            let isNewMess = localStorage.getItem("isNewMess");
            if (isNewMess === "true") {
                this.isNewMess = true;
            } else {
                this.isNewMess = false;
            }
        }
        this.initActivity();
    }

    start() {
        if (g.gameVal.lastGame) {
            this.returnStage();
        } else {
            this.lobbyHome.node.active = true;
        }
        if (g.isOnKick) {
            window.pomelo.off("disconnect");
            window.pomelo.disconnect();
            let node;
            if (g.isOnKick === 'kick') {
                node = showConfirm("您的帐号已在其他设备登录！请注意账号安全！", "确定");
            } else if (g.isOnKick === "serverClosed") {
                node = showConfirm("亲，服务器正在停机维护中，已为您结算下线。", "确定");
            }
            node.okFunc = function () {
                LoginHelper.returnToLogin();
            };
            g.isOnKick = "";
        }
        // 依次显示游戏公告，绑定提示，新人奖，保险柜金币和官网地址
        this.showTips();
        this.showNewTransferTip();
        this.registerMethod();
        if (User.act) this.requestBankMoney();
    }

    public uplDevToken() {
        if (cc.sys.os === cc.sys.OS_IOS) {
            //let Token = cc.sys.localStorage.getItem(ItemNames.deviceToken);
            let Device = jsb.reflection.callStaticMethod("NativeUtil", "getDeviceToken");
            let bundleId = g.bundleId;
            console.log("DeviceToken========" + Device);
            if (!Device) {
                console.log("no token upload")
                return;
            }
            console.log("上传DeviceToken");
            var xhr = new XMLHttpRequest();
            xhr.open("POST", g.serviceCfg.rechargeQuestionUrl + g.iosPushUrl);
            xhr.setRequestHeader('Content-Type', "application/json");
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && xhr.status === 200) {
                    console.log('上传成功');
                    cc.sys.localStorage.setItem(ItemNames.deviceToken, Device);
                }
            }
            xhr.ontimeout = function () {
                console.log('sendlog超时');
            };
            xhr.onerror = function () {
                console.log('sendlog失败');
            };
            let ret = {
                pid: g.pid,
                deviceToken: Device,
                bundleId: bundleId,
                token: md5(Device + "-1gdxg1dq2bn1bw1b" + bundleId + g.pid)
            }
            xhr.send(JSON.stringify(ret));

        }
    }

    private vipNotice() {
        // if (!cc.sys.isNative) {
        //     cc.log("ITS ENTER VIP")
        //     return;
        // }
        console.log("检测vip");
        let ret = this.createToken();
        let url = g.serviceCfg.rechargeQuestionUrl + '/s/vipInfo?token=' + ret;
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.setRequestHeader('Content-Type', "application/json");
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status === 200) {
                Debug.log("vip返回====" + xhr.response)
                let jsons = JSON.parse(xhr.response);
                if (jsons["msg"] && jsons["msg"]["isVip"]) {
                    g._vip.isvip = jsons.msg.isVip;
                    if (jsons["msg"]["currentServiceWx"]) {
                        g._vip.weChat = jsons.msg.currentServiceWx;
                    }
                    if (jsons["msg"]["dailyNotify"]) {
                        g._vip.dailyNotify = jsons.msg.dailyNotify.content;
                    }
                    if (jsons["msg"]["newVipNotify"]) {
                        g._vipinfo._newVipNotify.content = jsons.msg.newVipNotify.content;
                        g._vipinfo._newVipNotify.id = jsons.msg.newVipNotify.id;
                    }
                    if (jsons["msg"]["notifyPush"]) {
                        g._vipinfo._notifyPush.content = jsons.msg.notifyPush.content;
                        g._vipinfo._notifyPush.id = jsons.msg.notifyPush.id;
                    }
                    if (jsons["msg"]["wxChangeNotice"]) {
                        g._vipinfo._wxChangeNotice.content = jsons.msg.wxChangeNotice.content;
                        g._vipinfo._wxChangeNotice.id = jsons.msg.wxChangeNotice.id;
                    }
                } else {
                    g._vip.isvip = false;
                }
            }
        }
        xhr.ontimeout = function () {
            console.log('sendlog超时')
        };
        xhr.onerror = function () {
            console.log('sendlog失败')
        };
        xhr.send();
    }

    private vipRead(id: string, idx: number) {
        console.log("读取vip信息");
        let token = this.createToken();
        let url = g.serviceCfg.rechargeQuestionUrl + '/s/readVipNotice?token=' + token;
        var xhr = new XMLHttpRequest();
        xhr.open("POST", url);
        xhr.setRequestHeader('Content-Type', "application/json");
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status === 200) {
                switch (idx) {
                    case 1:
                        g._vipinfo._notifyPush.content = "";
                        g._vipinfo._notifyPush.id = "";
                        break;
                    case 2:
                        g._vipinfo._newVipNotify.content = "";
                        g._vipinfo._newVipNotify.id = "";
                        break;
                    case 3:
                        g._vipinfo._wxChangeNotice.content = "";
                        g._vipinfo._wxChangeNotice.id = "";
                        break;
                }
                g._vip.info = -1;
            }
        }
        xhr.ontimeout = function () {
            console.log('sendlog超时')
        };
        xhr.onerror = function () {
            console.log('sendlog失败')
        };
        let ret = {
            type: idx,
            id: id,
        }
        xhr.send(JSON.stringify(ret));
    }

    private createToken() {
        var crypto = require('crypto');
        var buffer = require('buffer').Buffer;
        let accessToken = localStorage.getItem(ItemNames.token);
        let uid = User.uid;
        let start = Date.now();
        const toSign = uid + "." + start + "." + accessToken;
        const hash = crypto.createHash("md5");
        const sign = hash.update(toSign).digest("hex");
        const toToken = uid + "." + start + "." + sign;
        const tokenBuffer = buffer.from(toToken);
        const token = tokenBuffer.toString("base64");
        return token;
    }

    private vipinfo() {
        let vipWin = cc.instantiate(this.vipwindow);
        this.nodeParent.addChild(vipWin, 999);
        return vipWin;
    }

    private setAvatarShow(visible: boolean) {
        this.lUser.getAvatar.active = visible;
        this.lUser.getAvatarBg.active = visible;
        this.btnBack.node.active = !visible;
    }

    public showWebUrl() {
        this.lblOffcialWeb.string = this.removePara(g.serviceCfg.web);
        this.lobbyHome.setQRContent();
    }

    removePara(link: string) {
        let segme = link.split("?");
        return segme[0];
    }

    /**
     * 设置显示或隐藏的功能，例如兑换
     */
    static setAvailableFuncs(data: any) {
        let func = this._availableFuncs;
        func.withdraw = data.withdrawSwitch;
        func.recharge = data.rechargeSwitch;
    }

    protected initChannelShield() {
        if (User.shield) {
            this.btnBank.node.active = false;
            this.btnWithdraw.node.active = false;
            this.btnQuickRecharge.node.active = false;
            if (this.btnQuickBank)
                this.btnQuickBank.active = false;
        }
        if (User.shieldStatus.channelApprentice) {
            this.btnQmdl.node.active = false;
        }
    }

    async registerMethod() {
        net.off("recharge");
        net.off("transferNotify");
        net.off("userMoney");
        net.off("bankMoney");
        net.off("hasNewMail");
        net.off("ChatRechargeNotify");
        net.off("addUserMoney");
        net.off("ChatMsg");
        net.off("hasNewVipRed");
        net.on("recharge", (data: ps.Recharge) => {
            let old = User.money
            User.money = data.money;
            showConfirm("充值" + new Decimal(data.money).sub(old).toString() + "金币成功。");
            this.rechargeSucc();
            this.updateVip(data.vipInfo);
            this._lUser.refreshUserInfos();
        });

        net.on("transferNotify", (data: ps.TransferNotify) => {
            User.bankMoney = data.bankMoney;
            this.updateVip(data.vipInfo);
            this._lUser.refreshUserInfos();
        });

        net.on("userMoney", (data: { money: string }) => {
            User.money = data.money;
            this._lUser.refreshUserInfos();
        });
        net.on("addUserMoney", (data: { money: string }) => {
            // User.money = data.money;
            User.money = new Decimal(data.money).add(User.money).toString();
            this._lUser.refreshUserInfos();
        });

        net.on("bankMoney", (data: { bankMoney: string }) => {
            User.bankMoney = data.bankMoney;
            this._lUser.refreshUserInfos();
        });

        net.on("hasNewMail", () => {
            this.mailMsg.onHasNewMail();
        });

        net.on("ChatRechargeNotify", (data: { money: string }) => {
            showConfirm("充值" + data.money + "金币成功,请到保险箱里查收!");
            this.onClickManualHideKeyBoard();
        });

        //监听聊天消息
        net.on("ChatMsg", (data: AcceptChatMsg) => {
            // cc.log("<<<<<", data.localChatId)
            agentUtil.handleChatToClientMsg(data);
        });
        // 检测新邮件
        this.checkNewMail();

        // 获取官网等配置
        this.getWeb();

        // 主动同步一次
        this._lUser.refreshUserInfos();

        // 活动开启判断
        //this.checkEvents();  //服务器活动停止
        //监听VIP福利红包通知
        window.pomelo.on("hasNewVipRed", async () => {
            console.log("vip红包派发通知===");
            this.requestVIP_RedAction();
        })

        // 提前获取vip数据
        this.getVipData();

        // 获取代充离线未读的消息
        this.getRecharUnReadMsg();
    }

    async getRecharUnReadMsg() {
        let enter = await net.request("chat.clientHandler.enter", {});
        if (enter.code !== 200) return;
        let data = await net.request("chat.clientHandler.getUnreadMsg");
        agentUtil.handleOutlineUnReadMsg(data);
    }

    async checkNewMail() {
        let data = await net.request("hall.mailHandler.checkNew");
        if (data.code === 200 && !!data.hasNew) {
            this.mailMsg.onHasNewMail();
        }
    }

    async getWeb() {
        let data1 = await net.request("hall.hallHandler.getWeb");
        if (data1.code === 200 && data1.web) {
            g.serviceCfg = { web: data1.web, weChat: data1.wx, qq: data1.qq, rechargeQuestionUrl: data1.rechargeQuestionUrl };
            this.isRecharge = (data1.active === 1) ? true : false;
            this.showWebUrl();
            if (data1.web) localStorage.setItem(ItemNames.officialUrl, data1.web);
            if (data1.wx) localStorage.setItem(ItemNames.weChat, data1.wx);
            if (data1.qq) localStorage.setItem(ItemNames.qq, data1.qq);
            if (data1.rechargeQuestionUrl) localStorage.setItem(ItemNames.rechargeQuestionUrl, data1.rechargeQuestionUrl);
        }
    }
    onClickManualHideKeyBoard() {
        if (cc.sys.os === cc.sys.OS_IOS) {
            if (window.jsclass !== undefined) {
                JsClass.manualHideKeyBoard();
            } else {
                jsb.reflection.callStaticMethod("NativeUtil", "manualHideKeyBoard");
            }
        } else if (cc.sys.os === cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod("util/NativeUtil", "manualHideKeyBoard", "()V");
        }
    }

    /**
     * 检测活动是否开启
     */
    async checkEvents() {
        let isShow = false;
        let data = await net.request("hall.eventHandler.getEvents");
        g.eventsActive = false;
        if (data.code === 200 && data.result && data.result.length > 0) {
            isShow = true;
            for (let idx in data.result) {
                if (data.result[idx].eventType === "recharge") continue;
                g.eventsActive = true;
                this.welfareEventID = data.result[idx].actId;
            }
        }
        return new Promise(resolve => {
            if (isShow) this.showEvents(data.result);
            // this.nodeEvents.active = g.eventsActive;
            this.lobbyHome.showOrHideEventPage("ad4", g.eventsActive);
            resolve();
        })

    }

    /**
     * 活动展示（目前包含联运、返利）
     */
    showEvents(data: WelfareResult[]) {
        agentUtil.rechargeRebateInfo = undefined;
        for (let i = 0; i < data.length; i++) {
            if (data[i].eventType === "recharge") {     // 返利活动
                agentUtil.rechargeRebateInfo = data[i];
                this.rechargeRebateSwitch = data[i].onGoing;
                if (data[i].onGoing) {
                    this.lobbyHome.showOrHideEventPage("ad5", true);
                } else {
                    Debug.log("充值返利活动 是否开启 = " + data[i].onGoing);
                }
                break;
            }
        }
    }

    private async requestBankMoney() {
        let data = await net.request("hall.bankHandler.enter");
        if (data.code === 200) {
            User.money = data.money;
            User.bankMoney = data.bankMoney;
            this._lUser.refreshUserInfos();
        }
    }

    /**
     * 返回最后加入的游戏
     *
     * @private
     * @returns
     * @memberof Lobby
     */
    private returnStage() {
        cc.log("returnStage:" + g.gameVal.lastGame);
        if (!g.gameVal.lastGame || g.gameVal.lastGame === GameId.HH || g.gameVal.lastGame === GameId.LH || g.gameVal.lastGame === GameId.EBG || g.gameVal.lastGame === GameId.DFDC || g.gameVal.lastGame === GameId.FQZS || g.gameVal.lastGame === GameId.HBSL) {
            this.backLobby();
            return;
        }
        this.showGameStage(g.gameVal.lastGame as GameId);
        g.gameVal.lastGame = undefined;
        // cc.log("returnStage over:" + g.gameVal.lastGame);
    }

    protected showNewTransferTip() {
        this.newTransfer.active = false;
        this.newMess.active = this.isNewMess;

    }

    hideOtherLobbyUI() {
        let p;
        switch (this._currLobbyUI) {
            case LOBBY_STATUS.Lobby:
                p = this.lobbyHome.hide();
                break;
            case LOBBY_STATUS.Stage:
                p = this.stage.hide();
                break;
            default:
                break;
        }
        return p;
    }
    showShopPackageView() {
        return new Promise(resolve => {
            let node = this.shopPackage(g.updateContent, g.updateTitel);
            g.hallVal.showShopPackage = false;
            if (!node) {
                resolve();
                return;
            }
            node.once("close", resolve);
        });
    }
    shopPackage(content: string, titel: string) {
        let view = cc.instantiate(this.shopPackageView);
        let viewScript = view.getComponent(shopPackage);
        viewScript.setContent(content);
        viewScript.setTitle(titel);
        this.nodeParent.addChild(view, 999);
        return view;
    }
    async showTips() {
        // 显示公告页面
        // if (g.hallVal.shouldShowBillboard) {
        // await new Promise(resolve => {
        //     this.onClickBillBoard();
        //     this.lBillBoard.node.once("close", resolve);
        //     g.hallVal.shouldShowBillboard = false;
        // });
        // }

        // 显示IOS描述文件下载提示
        if (g.iosDesUrl && checkLocalTime(ItemNames.showIosCfgTime)) {
            await this.showIOSDesUrl();
        }

        // 显示新人奖励提示窗口
        if (User.newbieBonus) {
            await this.showNewbieBonus();
        }

        //显示防调签名提示
        if (!!g.needIsUpdate && g.hallVal.showShopPackage && g.updateUrl) {
            await this.showShopPackageView();
        }

        // 显示充值返利活动页面
        if (this.rechargeRebateSwitch && checkLocalTime(ItemNames.showRebateTime)) {
            await this.showRechargeRebateView();
            if (this.isOpenRechargeRebate) return;
        }

        // 显示注册送金页面
        if (!User.act && g.hallVal.showBind) {
            await this.showBindReward();
        }

        // 显示vip用户通知页面
        if (g._vip.isvip) {
            await this.showVipNoticeView();
        }

        // 请求周返利弹窗信息
        // await this.showWeeklyRevatenidel();

        //请求公告活动弹窗
        this.autoOpenActivityPanle();

        //获取VIP福利弹窗
        await this.requestVIP_RedAction();
        if (!this || !this.isValid) {
            return;
        }
    }

    /**
            请求周返利弹窗信息
     *
     */
    async showWeeklyRevatenidel() {
        return new Promise(async (reslove) => {
            await this.getEventTaskinfo();
            let weeklyRebateModel = WeeklyRebateModel.instance();
            let Zfl_TanChuang: cc.Node;
            let data = await net.request("event.eventHandler.getWREventTimes", { actId: weeklyRebateModel.actId });
            console.log("周返利弹窗信息===>>>", data);
            if (data.code == 200) {
                if (data.remainTimes && data.remainTimes > 0) {
                    weeklyRebateModel.isChouJiang = true;
                } else {
                    weeklyRebateModel.isChouJiang = false;
                }
                Zfl_TanChuang = this.isFL_TanChuang();
            } else {
                //请求周返利详细信息
                await this.getEventTaskinfo();
                Zfl_TanChuang = this.isFL_TanChuang();
            }
            console.log("Zfl_TanChuang==", Zfl_TanChuang);
            if (Zfl_TanChuang) {
                await new Promise(resolve => {
                    let node = Zfl_TanChuang;
                    if (!node) {
                        resolve();
                        return;
                    }
                    node.once("close", resolve);
                });
            }
            reslove()
        })

    }

    showBindReward() {
        return new Promise(resolve => {
            let node = this.showBindTips();
            if (!node) {
                resolve();
                return;
            }
            g.hallVal.showBind = false;
            //let nodeComponent = node.getComponent(PopActionBox);
            //nodeComponent.init(this)    //这个方法没有，会报错，导致后面不执行
            node.once("close", () => {
                console.log("点击关闭");
                resolve()
            });
        });
    }

    showRechargeRebateView() {
        return new Promise(resolve => {
            let rebateView = cc.instantiate(this.preRechargeRebate);
            let rebateTs = rebateView.getComponent(PayRebateEvents);
            rebateTs.init(this, agentUtil.rechargeRebateInfo);
            this.nodeParent.addChild(rebateView);
            if (!rebateView) {
                resolve();
                return;
            }
            rebateView.once("close", resolve);
        });
    }

    showVipNoticeView() {
        return new Promise(resolve => {
            if (g._vipinfo._newVipNotify.id != "") {
                g._vip.info = 2;
                let node = this.vipinfo();
                if (!node) {
                    resolve();
                    return;
                }
                this.vipRead(g._vipinfo._newVipNotify.id, 2);
                node.once("close", resolve);
            }
            if (g._vipinfo._notifyPush.id != "") {
                g._vip.info = 1;
                let node = this.vipinfo();
                if (!node) {
                    resolve();
                    return;
                }
                this.vipRead(g._vipinfo._notifyPush.id, 1);
                node.once("close", resolve);
            }
            if (g._vipinfo._wxChangeNotice.id != "") {
                g._vip.info = 3;
                let node = this.vipinfo();
                if (!node) {
                    resolve();
                    return;
                }
                this.vipRead(g._vipinfo._wxChangeNotice.id, 3);
                node.once("close", resolve);
            }
            resolve();
        })
    }

    showBindTips() {
        let ui;
        if (g.hallVal.showRegister) {
            g.hallVal.showRegister = false;
            if (!this.lUserRegister) {
                ui = cc.instantiate(this.preRegister);
                this.lUserRegister = ui.getComponent(PopActionBox);
            } else {
                this.lUserRegister.openAnim();
            }
        } else {
            ui = cc.instantiate(this.preBindUser);
        }
        this.nodeParent.addChild(ui, 999);
        return ui;
    }

    showNewbieBonus() {
        // 获取新人奖励
        let bonus = User.newbieBonus;
        if (!bonus) {
            return;
        }
        return new Promise(resolve => {
            // cc.log("新人奖励")
            User.newbieBonus = undefined;
            let confirm = showConfirm("恭喜你获得新人奖励 金币" + bonus);
            confirm.okFunc = async () => {
                let data = await net.request("hall.hallHandler.getNewbieBonus");
                if (data.code === 200) {
                    User.money = data.money;
                    this.lUser.refreshUserInfos();
                    this.playFallCoin();
                }
                else {
                    showTip(ErrCodes.getErrStr(data.code, "错误"));
                }
            };
            confirm.node.once("close", resolve);
        });
    }

    /**
    * 下载描述文件
    */
    showIOSDesUrl() {
        return new Promise(resolve => {
            let confirm = showConfirm("游戏异常时，可以使用此工具修复，请务必安装", "确定", "取消");
            confirm.okFunc = () => {
                cc.sys.openURL(g.iosDesUrl + "?pid=" + g.pid);
                confirm.showClose();
                g.iosDesUrl = "";
                resolve();
            };
            confirm.cancelFunc = () => {
                g.iosDesUrl = "";
                resolve();
            }
            confirm.node.once("close", resolve);
        })
    }

    /**
     * 打开玩家信息
     */
    public onClickUser() {
        cc.log("打开用户消息" + User.act);

        if (!User.act) {
            this.showBindTips();
            return;
        }

        if (!this.lUserInfo) {
            let ui = cc.instantiate(this.preUserInfo);
            this.lUserInfo = ui.getComponent(PopActionBox);
            this.lUserInfo.autoDestroy = false
            this.nodeParent.addChild(ui);
        } else {
            this.lUserInfo.openAnim();
        }
    }

    public onClickCS() {
        if (!User.act) {
            this.showBindTips();
            return;
        }
        let di = cc.instantiate(this.preCS);
        this.nodeParent.addChild(di);
    }

    async onClickBank() {
        if (!User.act) {
            this.showBindTips();
            return;
        }
        showLoading("正在进入银行");

        let data = await net.request("hall.bankHandler.enter");
        hideLoading();
        if (data.code === 200) {
            let b = cc.instantiate(this.preBank);
            this.nodeParent.addChild(b);
            let bank = b.getComponent(Bank)
            bank.init(this);
            bank.beforeShow(data)
        } else if (data.code === 3006) {
            showTip("你正在游戏中，无法使用银行！");
        } else {
            showTip(ErrCodes.getErrStr(data.code, "进入银行失败"));
        }
    }

    async onClickRecharge() {
        showLoading();
        //服务器活动停止
        // await this.checkEvents();    // 再次请求活动数据，容错活动中途关闭
        let nodeRecharge = this.nodeParent.getChildByName("recharge")
        if (!nodeRecharge) {
            nodeRecharge = cc.instantiate(this.prefabPay);
            this.nodeParent.addChild(nodeRecharge);
        } else {
            let pay: Recharge = nodeRecharge.getComponent("pay");
            pay.openAnim();
        }
    }

    private onClickSetting() {
        let ui = cc.instantiate(this.preSetting);
        this.nodeParent.addChild(ui);
    }

    public async onClickVip() {
        showLoading("VIP数据载入中...");
        if (this.isLoadingVipData) {
            let data = await net.request("hall.hallHandler.getUserVipInfo")
            if (data.code !== 200) return showTip(ErrCodes.getErrStr(data.code, "VIP数据读取失败"));
            this.isLoadingVipData = false;
            this.vipData = data.vipInfo;
        }
        let vipView = this.nodeParent.getChildByName("vipView");
        if (!vipView) {
            vipView = cc.instantiate(this.preVip);
            this.nodeParent.addChild(vipView);
        }
        let vip = vipView.getComponent(VipView);
        vip.autoDestroy = false;
        vip.vipInit(this.vipData);
        vip.svGame.node.active = true;
        hideLoading();
    }

    async getVipData() {
        let data = await net.request("hall.hallHandler.getUserVipInfo")
        if (data.code !== 200) return;
        this.isLoadingVipData = false;
        this.vipData = data.vipInfo;
        User.vipLevel = this.vipData.vipLevel;
        this._lUser.labvip.string = this.vipData.vipLevel.toString();
    }

    updateVip(data: ps.Recharge_Info | ps.TransferNotify_Info) {
        if (!data) {
            Debug.log("updateVip data is undefined");
            return;
        }
        User.vipLevel = data.lev;
        this._lUser.labvip.string = data.lev.toString();
        let vipView = this.nodeParent.getChildByName("vipView");
        this.vipData.vipLevel = data.lev;
        if (data.curExp) this.vipData.curExp = data.curExp;
        if (data.limitExp) this.vipData.limitExp = data.limitExp;
        if (vipView && vipView.active) {
            let vip = vipView.getComponent("vipView");
            let vipExp = vip.ndTitle.getChildByName("vipExp").getComponent("vipExp");
            if (data.curExp && data.limitExp) vipExp.vipMoney(data.curExp, data.limitExp, data.lev);
            let page = (data.lev > 1) ? data.lev - 1 : 0;
            vip.svGame.setCurrentPageIndex(page);
        }
    }

    onClickPopularize() {
        let ui = cc.instantiate(this.prePopularize);
        this.nodeParent.addChild(ui);
    }

    /**
    * 点击打开消息界面
    */
    async onClickRechargeMessage() {
        showLoading();
        let isPlat = false;
        agentUtil.platWsUrl = "";
        agentUtil.platFileSeverUrl = "";
        let data = await net.request("chat.clientHandler.matchAgent", {});
        if (data.code === 200) {
            if (data.type === 2) {                  // 代充平台
                isPlat = true;
                agentUtil.platWsUrl = data.wsUrl;
                agentUtil.platFileSeverUrl = data.fileServerUrl;
            } else if (data.type === 1) {           // 后台代充
                isPlat = false;
                agentUtil.platWsUrl = "";
                agentUtil.platFileSeverUrl = "";
            }
        } else showTip(ErrCodes.getErrStr(data.code));
        hideLoading();
        let rechargeMessagePrb = this.nodeParent.getChildByName("rechargeMessage");
        if (!rechargeMessagePrb) {
            rechargeMessagePrb = cc.instantiate(this.rechargeMessagePrb);
            this.nodeParent.addChild(rechargeMessagePrb);
        }
        let rechargeMessage = rechargeMessagePrb.getComponent(RechargeMessage);
        agentUtil.agentsData = data.agents;
        rechargeMessage.show(isPlat, this.nodeParent);


    }

    public onClickMail() {
        if (!this.lMail) {
            let ui = cc.instantiate(this.preMail);
            this.nodeParent.addChild(ui);
            this.lMail = ui.getComponent(MailBox);
            this.lMail.autoDestroy = false
        } else {
            this.lMail.openAnim();
        }
        (<MailBox>this.lMail).setMailMsg(this.mailMsg);
    }

    private async onClickBillBoard() {
        if (!this.lBillBoard) {
            let ui = cc.instantiate(this.preBillBoard);
            this.nodeParent.addChild(ui);
            this.lBillBoard = ui.getComponent(BillBoard);
            this.lBillBoard.autoDestroy = false
            if (!this.billTitle) {
                this.lBillBoard.showLoading("加载公告");
                let data = await net.request("hall.hallHandler.getBulletinTitle");
                if (data.code === 200) {
                    this.billTitle = data.titles;
                }
                this.lBillBoard.hideLoading();
            }
            this.lBillBoard.showBillBoard(this.billTitle);

        } else {
            this.lBillBoard.openAnim();
        }
    }

    private onClickHelp() {
        let node = cc.instantiate(this.gameHelp);
        let canvas = cc.find("Canvas");
        canvas.addChild(node);
        node.active = true;
        node.setPosition(0, 0);
        let gameHelp = node.getComponent(GameHelp);
        gameHelp.showContent(How2Play.gameHelpDesc(g.gameVal.lastGame as GameId));

    }

    onClickWithdraw() {
        if (!User.act) {
            this.showBindTips();
            return;
        }
        let nodeWithdraw = cc.instantiate(this.preWithdraw);
        this.nodeParent.addChild(nodeWithdraw);
    }

    private onClickReport(ev: cc.Event.EventTouch) {
        let node = cc.instantiate(this.preReportReward);
        this.nodeParent.addChild(node);
    }

    private onClickCloseWbview() {
        this.webviewbg.active = false;
    }

    onClickWelfare() {
        if (!User.act) {
            this.showBindTips();
            return;
        }
        showLoading("福利载入中...");
        this.requestWelfareData();
    }

    async requestWelfareData() {
        // "event.eventHandler.getEventReward"
        let data = await net.request("event.eventHandler.getEventReward", { actId: this.welfareEventID });
        if (data.code === 200) {
            if (data.st) {
                let serverst = new Date(data.st).toLocaleString();
                //如果为0 则表示任意时间开始
                // cc.log("活动开始时间：  ", serverst)
            }
            if (data.ed) {
                let servered = new Date(data.ed).toLocaleString()
                //如果为0， 则表示任意时间结束
                // cc.log("活动结束时间：   ", servered);
            }
            if (data.cfgCondition) this.welfareCfgCondition = data.cfgCondition;
            if (data.curCondition) this.welfareCurCondition = data.curCondition;
            if (data.get) this.welfareGetState = data.get
            // cc.log(data.cfgCondition, data.curCondition, data.get);
            let localTime = Math.floor((new Date().getTime()) / 1000);
            if (data.st && data.st / 1000 <= localTime) {
                if (data.ed && data.ed / 1000 >= localTime) {
                    let nodeWelfare = cc.instantiate(this.preWelfare);
                    this.nodeParent.addChild(nodeWelfare);
                    this.welfareEvents = nodeWelfare.getComponent(WelfareEvents)
                    this.welfareEvents.init(this);
                } else {
                    showConfirm("亲，本次活动已结束，感谢您的参与，祝您游戏愉快！");
                }
            } else {
                if (data.st) {
                    let startTime = new Date(data.st).toLocaleString();
                    showConfirm("亲，活动将于" + startTime + "开始，请耐心等待");
                } else {
                    showConfirm("当前尚无活动！");
                }
            }
        } else {
            // cc.log("失败code：  ", data.code);
            showTip(ErrCodes.getErrStr(data.code, "载入失败"));
        }
        hideLoading()
    }

    /**
     * 金币下落特效
     */
    playFallCoin() {
        let fallCoin = cc.instantiate(this.preFallCoin);
        this.node.addChild(fallCoin);
        this.scheduleOnce(() => {
            fallCoin.removeFromParent();
        }, 3);
    }

    /**
     *  充值成功特效
     */
    private rechargeSucc() {
        this.playFallCoin();
        this.audioLobby.playRechargeSucc();
    }

    private onClickState(ev: cc.Event.EventTouch, info: string) {
        if (!info) {
            showTip("加入游戏没有info");
            return;
        }
        this.audioLobby.playClick();
        let yardInfo = JSON.parse(info);

        this.enterGame(yardInfo.rid, yardInfo);
    }

    backLobby(ev?: cc.Event.EventTouch) {
        this.lobbyHome.beforeShow().then(success => {
            g.gameVal.lastGame = undefined;
            this.nodeTopMenu.active = true
            hideLoading();
            if (success) {
                this.hideOtherLobbyUI();
                this.setAvatarShow(true);
                this.lobbyHome.show();
                this._currLobbyUI = LOBBY_STATUS.Lobby;
            }
        });
        this._lUser.labvip.node.parent.active = true;
    }

    enterGame(game: GameId, info: ps.HallRoomHandlerGetYardList_Match) {
        let { minMoney, maxMoney } = info;
        let sceneName = SCENE_NAME[game];
        if (!sceneName) {
            showTip("游戏暂未开放");
            return;
        }
        this.joinGame(sceneName, game, info.id, minMoney, maxMoney);
    }

    joinGame(sceneName: string, game: GameId, yardId: string, minMoney?: string, maxMoney?: string) {
        showLoading("加载中");
        cc.director.preloadScene(sceneName, async () => {
            let data = await net.request("hall.roomHandler.join", { gid: game, mid: yardId });
            if (!data) {
                hideLoading();
                showTip("加入房间失败，请稍后再试");
                return;
            }

            if (data.code !== 200 && data.code !== 4005) {
                if (!data.where) {
                    let money = User.money;
                    if (minMoney && minMoney !== "-1") {
                        let ret = new Decimal(money).cmp(minMoney);
                        if (ret === -1) {
                            if (!User.shield) {
                                let c = showConfirm("亲，您身上的金币不太多了噢~换个房间或者再补充点金币吧。", "去充值", "去银行");
                                c.showClose();
                                c.okFunc = this.onClickRecharge.bind(this);
                                c.cancelFunc = this.onClickBank.bind(this);
                            }
                            hideLoading();
                            return;
                        }
                    }
                }
                g.hallVal.saveGameRoomList[game] = null;
                this.enterFailHandler(data.code, maxMoney, data.where);
                return;
            }
            g.gameVal.lastGame = game
            g.gameVal.yid = yardId
            cc.director.loadScene(sceneName!);
        });
    }

    enterFailHandler(code: number, maxMoney, where?: ps.Where) {
        let cb = () => {
            hideLoading();
            if (code === 4006) {
                let confirm = showConfirm("您正在其他游戏房间中，是否回到该房间？", "确定", "取消");
                confirm.okFunc = () => {
                    LoginHelper.returnToGame(where);
                };
            } else if (code === 3012) {
                showTip("亲，您身上的金币超过" + maxMoney + "个了噢～，赶快到高级渔场吧！");
            } else {
                if (cc.director.getScene().name !== g.lobbyScene) {
                    cc.director.loadScene(g.lobbyScene, function () {
                        showTip(ErrCodes.getErrStr(code, "进入房间失败"));
                    });
                } else {
                    showTip(ErrCodes.getErrStr(code, "进入房间失败"));
                }
            }
        }
        if (cc.director.getScene().name !== g.lobbyScene) {
            cc.director.loadScene(g.lobbyScene, cb);
        } else {
            cb();
        }
    }

    async showGameStage(game: GameId) {
        if (this.currLobbyUI === LOBBY_STATUS.Stage || this.showStage)
            return
        this._lUser.labvip.node.parent.active = false;
        cc.log("当前游戏 " + GAME_NAME[game]);
        this.showStage = true;
        this.audioLobby.playClick();
        if (game === GameId.HH || game === GameId.LH || game == GameId.EBG || game == GameId.DFDC || game == GameId.BCBM || game === GameId.FQZS || game == GameId.HBSL) {
            let yards = g.hallVal.saveGameRoomList[game];
            if (!yards) {
                yards = await Stage.getYardList(game);
                if (yards) {
                    g.hallVal.saveGameRoomList[game] = yards;
                }
            }
            this.showStage = false;
            if (!yards) return;
            this.enterGame(game, yards[0]);

        } else {
            this.nodeTopMenu.active = false
            let succ = await this.stage.beforeShow(game);
            this.showStage = false;
            hideLoading();
            if (!succ) return;
            g.gameVal.lastGame = game;
            this._currLobbyUI = LOBBY_STATUS.Stage;
            this.setAvatarShow(false);
            this.lobbyHome.hide();
            this.stage.show();
        }
    }

    onClickOnlineCustomerService(isPlat: boolean, url?: string) { // 在线客服，客服平台区分
        agentUtil.changeInterfaceOrientations("1");
        let csChat;
        if (isPlat) csChat = this.nodeParent.getChildByName("customerServicePlat");
        else csChat = this.nodeParent.getChildByName("chatService");
        if (csChat) {
            let csSrc;
            if (isPlat) csSrc = csChat.getComponent(CustomerServicePlat);
            else csSrc = csChat.getComponent(CustomerServiceChat);
            let pomelo = window.kefu;
            let p = pomelo.socketReadyState();
            console.log('是否连接=====', p);
            if (p >= 2) {
                csSrc.removeExtraListeners();
                if (p !== 100) pomelo.disconnect();
                if (!isPlat) csSrc.chatServiceHandShake();
                else csSrc.connUrl = url;
            } else {
                if (isPlat) csSrc.connUrl = url;
            }
            csChat.active = true;
        } else {
            let ui;
            if (isPlat) {
                ui = cc.instantiate(this.customerServicePlat);
                let cs = ui.getComponent(CustomerServicePlat);
                cs.connUrl = url;
            } else {
                ui = cc.instantiate(this.customerServiceChat);
            }
            this.nodeParent.addChild(ui);
            ui.zIndex = 99;

        }
        //清除小红点
        this.showMessagePrompt(false);
        setIsMessger(false);
    }

    /**
    * 显示消息提示
    */
    showMessagePrompt(isTrue: boolean) {
        console.log('显示消息提示 消息来了===');
        this.msgPotNode.active = isTrue;
    }

    //---周返利移植----
    async clickTheWeeklyRebateButton() {
        let weeklyRebateModel = WeeklyRebateModel.instance();
        if (weeklyRebateModel.isGoing == 0) {
            showTip("活动未开启");
            return;
        }
        showLoading("加载中...");
        await this.getEventTaskinfo();
        hideLoading();
        if (weeklyRebateModel.code !== 200) {
            showTip(ErrCodes.getErrStr(weeklyRebateModel.code, "活动未开启！"));
            return;
        }
        let weeklyRebatePanel = this.nodeParent.getChildByName("weeklyRebate");
        if (!weeklyRebatePanel) {
            weeklyRebatePanel = cc.instantiate(this.weeklyRebatePrb);
            this.nodeParent.addChild(weeklyRebatePanel);
            let weeklyRebateSp = weeklyRebatePanel.getComponent(WeeklyRebate);
            weeklyRebateSp.Lobby_script = this;
        } else {
            weeklyRebatePanel.active = true;
        }
        if (this.zfl_MsgNode.active) {
            this.zfl_MsgNode.active = false;
            weeklyRebateModel.isActiveLobbyRed = false;
        }
    }

    async getEventTaskinfo() {
        let weeklyRebateModel = WeeklyRebateModel.instance();
        let data = await net.request("event.eventHandler.getRebateEventInfo", { actId: weeklyRebateModel.actId })
        // console.log("周返利活动请求返回====>>>", data);
        if (data.code !== 200) {
            WeeklyRebateModel.instance().code = data.code;
            return;
        }
        WeeklyRebateModel.instance().setData(data);
        if (WeeklyRebateModel.instance().isActiveLobbyRed) {
            this.zfl_MsgNode.active = true;
        }
    }

    /**
    * 是否需要返利登陆弹窗判断
    */
    isFL_TanChuang() {
        let today = formatTimeStr("d");
        let closeTiptime = localStorage.getItem("closeTip");
        // console.log("今天的日期===>>", today);
        // console.log("关闭提醒的日期===>>", closeTiptime);
        // let weeklyRebateModel = WeeklyRebateModel.instance();
        let activityDataMap = ActivityModel.instance();
        // let zfl = this.nodeParent.getChildByName("weeklyRebate")
        // if (zfl && zfl.active) return;
        let waterRebate = activityDataMap.activityDataMap["waterRebate"];
        if (!waterRebate) return;
        let onGoing = waterRebate.onGoing;
        if (closeTiptime != today && onGoing === 1) {
            let Zfl_TanChuang = this.tipFL_TanChuang();
            return Zfl_TanChuang;
        }
    }


    tipFL_TanChuang() {
        let Zfl_TanChuang = this.nodeParent.getChildByName("FL_TanChuang");
        if (!Zfl_TanChuang) {
            Zfl_TanChuang = cc.instantiate(this.FL_TanChuang);
            this.nodeParent.addChild(Zfl_TanChuang);
            let zfl_tCsp = Zfl_TanChuang.getComponent(FLLoginTip);
            zfl_tCsp.Lobby_script = this;
        } else {
            Zfl_TanChuang.active = true;
        }
        return Zfl_TanChuang;
    }


    /**
     * 初始化活动
     */
    initActivity() {
        // 联运活动
        let eventsList: WelfareResult[] = [];
        let activityModel = ActivityModel.instance();
        let data = activityModel.activityDataList;
        let waterRebate = activityModel.activityDataMap["waterRebate"];
        let weeklyRebateModel = WeeklyRebateModel.instance();
        if (waterRebate != null && waterRebate != undefined) {
            // this.zfl_MsgNode.parent.parent.getChildByName("weeklyRebate").active = true;
            weeklyRebateModel.actId = waterRebate.actId;
            weeklyRebateModel.isGoing = waterRebate.onGoing;
            weeklyRebateModel.isActive = true;
        } else {
            weeklyRebateModel.isActive = false;
            // this.zfl_MsgNode.parent.parent.getChildByName("weeklyRebate").active = false;
        }
        if (data != [] && data.length > 0) {
            // cc.log("活动信息：", data, "code:", data);
            if (data) {
                data.forEach((val) => {
                    eventsList.push(val);
                })
                eventsList.sort((a, b) => {
                    // console.log("0000000");
                    return a.idx - b.idx; // 按照idx升序
                });

            }
            let cont = -1;
            eventsList.forEach((Data, Key) => {
                if (Data.eventType === "recharge" && Data.rechargeChannels !== undefined && Data.onGoing) {
                    agentUtil.rechargeRebateInfo = Data;
                    this.rechargeRebateSwitch = Data.onGoing;
                    this.lobbyHome.showOrHideEventPage('ad5', true);
                } else if (Data.eventType === "lottery") {//节日抽奖活动
                    TanabataMgr.Instance.activeIsOpen = true;
                    TanabataMgr.Instance.actID = Data.actId;
                    TanabataMgr.Instance.onGoing = Data.onGoing;
                    TanabataMgr.Instance.getEventConfig();
                    // this.ndTanabataIcon.active = true;

                } else if (Data.eventType === "waterRebate") {
                    // 周流水返利
                } else if (Data.eventType === "accumulative" && Data.onGoing === 1) {
                    console.log("激活码活动=====>", Data);
                    this.welfareEventID = Data.actId;
                    // this.nodeEvents.active = true;

                } else if (Data.onGoing) cont = Key;


            });
        }
    }
    //TODO
    /**
     *
     * 自动弹出活动弹窗
     */
    autoOpenActivityPanle() {
        let today = formatTimeStr("d");
        let closeTiptime = localStorage.getItem("closeTip");
        if (closeTiptime != today) {
            this.openActivityPanel();
        }
    }
    async getIMRequset() {
        return new Promise(async (resolve) => {
            let data = await net.request("event.eventHandler.enterIM");
            resolve(data)
        });
    }


    async onClickFootBall() {
        //console.log("开始请求IM");
        showLoading("加载中...");
        let tryTimes = 3;
        let data;
        while ((!data || data.code != 200) && tryTimes > 0) {
            data = await this.getIMRequset();
            tryTimes--;
            //console.log("请求的次数", 3 - tryTimes, "获取的数据==》", data);
        }
        hideLoading();
        //Debug.log("请求IM返回===>" + JSON.stringify(data));
        if (data.code != 200) {
            showTip(ErrCodes.getErrStr(data.code, ""));
            return;
        }

        agentUtil.changeInterfaceOrientations("1", true);

        let footBall = this.nodeParent.getChildByName("footBall");
        if (!footBall) {
            footBall = cc.instantiate(this.footBallPrb);
            this.nodeParent.addChild(footBall);
            // zfl_tCsp.Lobby_script = this;
        } else {
            footBall.active = true;
        }
        let footBallsp = footBall.getComponent(FootBall);
        footBallsp.openUrl(data.url);
    }

    async requestColdUpdateAction() {
        let coldUpdateUrl;
        let data = await net.request("hall.hallHandler.getWeb");
        if (data.code != 200 || !data.web) {
            coldUpdateUrl = g.serviceCfg.web;
        } else {
            coldUpdateUrl = data.web;
        }
        this.openColdUpeateUrl(coldUpdateUrl);
    }


    openColdUpeateUrl(coldUpdateUrl: string) {
        let s = showConfirm(`当前游戏需要升级最新版本，是否更新？`, "确定", "取消");
        s.okFunc = async () => {
            cc.sys.openURL(coldUpdateUrl);
            // cc.game.end();
        }
    }
    getSupportDGGame() {
        let support = false;
        if (cc.sys.os === cc.sys.OS_IOS) {
            if (window.jsclass !== undefined) {
                support = JsClass.haveNewAgentChat();
            } else {
                support = jsb.reflection.callStaticMethod("NativeUtil", "haveDGGame");
            }
        } else if (cc.sys.os === cc.sys.OS_ANDROID) {
            support = jsb.reflection.callStaticMethod("util/NativeUtil", "haveDGGame", "()Z");
        }
        return support;
    }
    async onClickBigGame(event: cc.Event, customer: String) {
        if (!cc.sys.isNative) {
            showTip("此游戏只能在真机上运行!!");
            return;
        }
        if (!this.getSupportDGGame()) {
            this.requestColdUpdateAction();
            return;
        }
        showLoading("正在加载...");
        let data = await net.request("event.eventHandler.enterDGGame");
        console.log("请求BG视讯===>", data);
        if (data.code != 200) {
            showTip(ErrCodes.getErrStr(data.code, ""));
            hideLoading();
            return;
        }
        hideLoading();
        cc.audioEngine.pauseAll(); //暂停播放音频
        let callback = `cc.find('lobby').getComponent('lobby').leaveDGGame();`;

        if (cc.sys.os === cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod("util/NativeUtil", "setDGDownLoadUrl", "(Ljava/lang/String;)V", g.domainName);
        }

        if (cc.sys.os === cc.sys.OS_IOS) {
            if (window.jsclass !== undefined) {
                JsClass.setKeyBoarHightCallBack(callback);
            } else {
                jsb.reflection.callStaticMethod("NativeUtil", "openDreamGame:Domains:GameId:CallBack:", data.token, data.domains, customer, callback);
            }
        } else if (cc.sys.os === cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod("util/NativeUtil", "openDreamGame", "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V", data.token, data.domains, customer, callback);
        }
    }

    /**
     * 退出DG游戏
     */
    async leaveDGGame() {
        cc.audioEngine.resumeAll(); //恢复播放
        console.log("==退出SDk回调==");
        let data = await net.request("event.eventHandler.leaveDGGame");
        console.log("退出视讯返回===>", data.code);
        if (data.code != 200) {
            showTip(ErrCodes.getErrStr(data.code, ""));
        }
    }



    /**
    * 获取VIP福利红包
    */
    getVIP_RedEnvelope(): Promise<GetVipRed> {
        return new Promise((resolve) => {
            window.pomelo.request("hall.hallHandler.getVipRed", {}, (data: GetVipRed) => {
                Debug.log("请求VIP福利红包返回==" + JSON.stringify(data));
                console.log("请求VIP福利红包返回====>", data);
                resolve(data);
            })
        })
    }

    /**
     * 创建红包界面
     * @param data
     */
    creatVIP_RedNode(data: GetVipRed_Info) {
        console.log("创建红包界面====")
        return new Promise((resolve) => {
            let VIP_Welfare = this.nodeParent.getChildByName("VIP_Welfare");
            if (!VIP_Welfare) {
                VIP_Welfare = cc.instantiate(this.VIP_Welfare);
                this.nodeParent.addChild(VIP_Welfare);
                let VIP_WelfareSP = VIP_Welfare.getComponent(VIPWelfare);
                VIP_WelfareSP.Lobby_script = this;
                VIP_WelfareSP.initData(data);
            } else {
                VIP_Welfare.active = true;
            }
            resolve()
        })
    }

    //请求红包福利，有得话创建界面
    requestVIP_RedAction() {
        return new Promise(async (resolve) => {
            let vip_RedData = await this.getVIP_RedEnvelope();
            if (vip_RedData.code === 200 && vip_RedData.redInfo && vip_RedData.redInfo.length > 0) {
                //此时创建红包弹窗
                await this.creatVIP_RedNode(vip_RedData.redInfo[0]);
            }
            resolve();
        })
    }

    showTipDown() {
        cc.audioEngine.resumeAll(); //恢复播放
        showTip('正在更新游戏请稍后。。。');
    }
    downloadDG(str: string) {
        //  download = +str * 0.01
        let download = new Decimal(+str).mul(0.01).toNumber()
        console.log("----- download", download)
        for (let index = 0; index < this.download.length; index++) {
            this.download[index].active = true
            this.download[index].getChildByName("lab").getComponent(cc.Label).string = str + "%";
            this.downloadLab[index].fillRange = -download;
        }
        if (download >= 1) {
            for (let index = 0; index < this.download.length; index++) {
                this.download[index].active = false
            }

        }
    }
    /**
     * 打开活动面板
     */
    async openActivityPanel() {
        let activityPanel: cc.Node = cc.instantiate(this.activityPanel);
        this.nodeParent.addChild(activityPanel);
        let script = activityPanel.getComponent(ActivityPanel);
        script.scaleNormal = 0.9;
        script.lobbyScript = this;
        script.openAnim(() => {
            script.requestInfo();
        });
    }
    /**点击国庆活动图标 */
    onClickNationalDay() {
        TanabataMgr.Instance.lobby_script = this;
        TanabataMgr.Instance.getEventLotteryData(true);
    }

    /**显示国庆界面 */
    showNationalDay() {
        if (this.NationalDayPanel) {
            this.NationalDayPanel.getComponent(Tanabata).start();
        } else {
            this.NationalDayPanel = cc.instantiate(this.preNationalDay);
            this.nodeParent.addChild(this.NationalDayPanel, 999);
        }
    }
    /**显示国庆预热界面 */
    showFestivalBefore(time: number) {
        this.festivalBeforePanel.getComponent(FestivalBefore).show();
        this.festivalBeforePanel.getComponent(FestivalBefore).setStartTime(time);
    }
}
