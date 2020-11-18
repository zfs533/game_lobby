import PopActionBox from "./popActionBox"
import OrderTrack from "./orderTrack";
import { showTip, getAvatar } from "../common/ui";
import { ErrCodes } from "../common/code";
import User from "../common/user";
import ChatContent from "./chatContent"
import agentUtil from "./agentUtil"
import * as util from "../common/util";
import { ChatInfo, AcceptChatMsg, SendChatMsg } from "./agentChat"
import net from "../common/net";
import g from "../g";
import RechargeMessage from "./rechargeMessage";


const { ccclass, property } = cc._decorator;
enum orderState {
    UNFINISHED = 0,
    FINISHED = 1,
    CLOSED = 2,
}

@ccclass
export default class AgentRecharge extends PopActionBox {
    @property(ChatContent)
    leftItem: ChatContent = undefined;    // 代理发送内容的模版节点

    @property(ChatContent)
    rightItem: ChatContent = undefined;    // 自己发送内容的模版节点

    @property(cc.Node)
    evaluationItem: cc.Node = undefined;    // 评价节点

    @property(cc.Node)
    reportItem: cc.Node = undefined;    // 举报节点

    @property(cc.Node)
    addImage: cc.Node = undefined;    // 点击发送截图的按钮

    @property(cc.Node)
    sendBt: cc.Node = undefined;    // 点击发送消息的按钮

    @property(cc.EditBox)
    edit: cc.EditBox = undefined;      // 输入框

    @property(cc.ScrollView)
    scrollView: cc.ScrollView = undefined;      // 整个聊天节点的滚动

    @property(cc.Label)
    title: cc.Label = undefined;      // 本次聊天的标题

    @property(cc.Node)
    contentNode: cc.Node = undefined;

    @property(cc.Node)
    scaleNode: cc.Node = undefined;

    @property(cc.Sprite)
    scaleSp: cc.Sprite = undefined;

    @property(cc.Node)
    bottomBtsNode: cc.Node = undefined;

    @property(cc.Node)
    closeOrderBtNode: cc.Node = undefined;

    @property(cc.Node)
    tipNode: cc.Node = undefined;    // 订单完成，玩法继续聊天的提示节点


    @property(cc.Node)
    payTypes: cc.Node = undefined;

    @property(cc.Node)
    payMode: cc.Node = undefined;

    @property(cc.Node)
    payTypeItem: cc.Node = undefined;

    @property(cc.Node)
    payModeItem: cc.Node = undefined;

    @property(cc.Node)
    reportInfo: cc.Node = undefined;

    @property(cc.EditBox)
    reportEdit: cc.EditBox = undefined;


    @property(cc.Node)
    payInfo: cc.Node = undefined;

    @property(cc.Label)
    codeFeeRate: cc.Label = undefined;   // 二维码费率

    @property(cc.Label)
    txtFeeRate: cc.Label = undefined;  // 文字  费率


    @property(cc.Node)
    imageNode: cc.Node = undefined;

    @property(cc.Label)
    imageTitle: cc.Label = undefined;

    @property(cc.Sprite)
    imageSp: cc.Sprite = undefined;

    @property(cc.Node)
    textPay: cc.Node = undefined;
    @property(cc.Label)
    actLabel: cc.Label = undefined;
    @property(cc.Label)
    nameLabel: cc.Label = undefined;

    @property(cc.Label)
    matchInfo: cc.Label = undefined;


    @property(cc.Node)
    mask: cc.Node = undefined;

    @property(cc.Node)
    arrow: cc.Node = undefined;


    @property(cc.Label)
    agentID: cc.Label = undefined;

    @property(cc.Node)
    emojiKeyboard: cc.Node = undefined;
    @property([cc.Node])
    emojPages: cc.Node[] = [];

    @property(cc.Node)
    boxNode: cc.Node = undefined;

    @property(cc.Node)
    emojBt: cc.Node = undefined;   // 点击出现表情键盘的按钮

    @property(cc.Node)
    keyboardBt: cc.Node = undefined;  // 点击出现普通键盘的按钮

    @property(cc.Node)
    emjPage1: cc.Node = undefined;
    @property(cc.Node)
    emjPage2: cc.Node = undefined;
    @property(cc.Node)
    emjBtItem: cc.Node = undefined;

    @property(cc.Node)
    agentConfirm: cc.Node = undefined;

    @property(cc.Label)
    agentConfirmLabel: cc.Label = undefined;

    @property(cc.Node)
    agentConfirmCancleBt: cc.Node = undefined;

    @property(cc.Node)
    filler: cc.Node = undefined;   // 用于弹起键盘后 给scrollview填充

    @property(cc.Sprite)
    agentIcon: cc.Sprite = undefined;

    @property([cc.SpriteFrame])
    contentBg: cc.SpriteFrame[] = [];    //没有尖尖的 气泡框

    @property(cc.Layout)
    reportLayout: cc.Layout = undefined;    // 举报框里面的选项

    @property([cc.Color])
    payinfoBgColors: cc.Color[] = [];

    @property(cc.Node)
    zPayTypeScrJt: cc.Node = undefined;

    @property(cc.Node)
    yPayTypeScrJt: cc.Node = undefined;

    @property(cc.ScrollView)
    payTypeScr: cc.ScrollView = undefined;      // 充值方式的滚动

    @property(cc.Label)
    timeLb: cc.Label = undefined;

    @property(cc.Label)
    editBoxTestLb: cc.Label = undefined;

    @property(cc.Node)
    topNode: cc.Node = undefined;    // 需要进行屏幕适配的，上方的节点

    @property(cc.Node)
    payInfoBox: cc.Node = undefined;    // 需要进行屏幕适配的，支付详情里上方的节点

    @property(cc.Node)
    loadingNode: cc.Node = undefined;

    @property(cc.Node)
    bottomBarBg: cc.Node = undefined;    // 下方虚拟按键的背景
    @property(cc.Node)
    payInfoMaskbg: cc.Node = undefined;    // 显示payInfo时 后面用来 滑动关闭时的 渐隐背景

    @property(cc.Node)
    agentTipNode: cc.Node = undefined;    // 弱提示的节点

    @property(cc.Label)
    agentTipContentLabel: cc.Label = undefined;    // 弱提示的内容

    @property(cc.Node)
    toBottomBt: cc.Node = undefined;    // 滑至最下面的按钮

    @property(cc.Label)
    toBottomBtLabel: cc.Label = undefined;    // 滑至最下面的label

    @property(cc.Node)
    transferTip: cc.Node = undefined;    // 转账时的提示

    @property(cc.Node)
    contactTip: cc.Node = undefined;   // 联系方式时的提示

    @property(cc.Label)
    payInfoTitle: cc.Label = undefined;

    @property(cc.Label)
    chatIdTitle: cc.Label = undefined;

    @property(cc.Node)
    dividingLine: cc.Node = undefined;

    private tmpSp: cc.SpriteFrame = undefined;
    private agentName: string = undefined;  // 代理名字
    private agentUid: number = undefined;   // 代理ID
    private agentGender: number = undefined;  // 代理性别
    private agentAvatar: number = undefined;    // 代理头像
    private myGender: number = undefined;  // 自己的性别
    private myAvatar: number = undefined;  // 自己的头像
    private myName: string = undefined;  // 自己的名字
    public chatId: string = undefined; // 聊天ID
    public localChatId: string = ""; // 新老代充统一的本地消息存储key
    private _events: string[];
    private unReadLable: cc.Label[] = [];
    private nEvalaution: cc.Node = undefined;  // 评价node
    private nReport: cc.Node = undefined;  // 举报node
    private orderTrack: OrderTrack = undefined;
    private curOrderState: number = undefined;
    private curOrderEvaluation: number = undefined;  // 当前订单的评价
    private curOrderReport: number = undefined;  // 当前订单的评价
    private tmpPath: string = undefined;
    private canSendMsg: boolean = true;
    private imageSriteFrame: cc.SpriteFrame[] = [];
    public orgSize: number = 0;
    private orgTitleY: number = 0;

    private curPage: number = 0;
    private curZIndex: number = 0;

    private loadingPageInfo: boolean = false;

    private isWaiting: boolean = false;  //  等待中

    private needPayType: boolean = false;  //  需要加载支付宝充值

    private agentPayTypes: ps.ChatClientHandlerOpenChat_Chat_Pays[] = [];
    private agentPayFType: string[] = [];
    private agentPayCTypes: string[] = [];
    private curTypesDate: ps.ChatAgentHandlerGetChatHistory_TypeDate[] = undefined;

    private pngNumber: number = 0;
    private picAddrss: string = "";

    private fmsize: cc.Size = undefined;
    private rtsize: cc.Size = undefined;

    private agentConfirmOkFunc: Function = undefined;

    private orgBottomY: number = 0;
    private keyBoardHight: number = 0;

    private lastSpeakers: number = 0;   // 最后一次发言人   0 没有人     1 代理    2 自己
    private lastSpeakItem: ChatContent = undefined;

    private curReportIndx: number = 4; // 举报选择的选项
    private reportContent: string[] = ["充值太慢了", "没人理我", "商人让我加QQ", "商人向我推荐其他游戏", "其他"];

    private lastTime: number = 0;

    private orgTopY: number = 568;

    private showEmojiY: number = -268;  // 展示表情键盘时，键盘的Y坐标
    private adaptationHeight: number = 1136;
    private adaptationBottomBarH: number = 0;
    private payInfoTouchBeginPos: cc.Vec2 = undefined;
    private payInfoCanMove: boolean = true;    //  支付信息能否可以移动

    private requestPayTypeIng: boolean = false;  //  是否正在切换充值方式
    private needSroll: boolean = true;   // 增加新消息时 是否需要滚屏
    private unreadMsgNum: number = 0;   // 未读消息数量

    private mySpeakTime: number[] = [];   // 记录说话的时间，来判断禁言

    private fastSendAgentMsg: string[] = ["亲，成功付款后，请点击右下方的上传按钮，上传您的充值截图哦～", "我已经付款了，请尽快充值!"];     //快捷回复
    private chatRecordMes: ChatInfo = undefined;

    public isChangeInterfaceOrientations = false;

    public lobbyParent: cc.Node = undefined;
    public errPay: string = undefined;


    public content: { [index: number]: string } = {
        1: "亲，成功付款后，请点击右下方的上传按钮，上传您的充值截图哦～",
        15021: "亲，当前充值代理已暂停接单，请复制代理信息；返回游戏大厅点击在线客服咨询反馈",
        15024: "您好，当前充值代理处于离线状态，如充值过程中遇到任何问题，请返回游戏大厅联系游戏客服进行反馈",
        15019: "亲，您的充值明细截图充值代理已收到，请勿重复上传截图"

    }



    get events() {
        if (!this._events) {
            this._events = [];
        }
        return this._events;
    }

    protected onLoad() {
        super.onLoad();
        this.agentTipNode.opacity = 0;
        this.fmsize = cc.view.getFrameSize();
        this.rtsize = cc.view.getDesignResolutionSize();

        this.orgTopY = this.topNode.y;
        this.orgTitleY = this.title.node.y;
        this.contentNode.active = false;
        this.orgSize = this.leftItem.node.height;
        this.leftItem.node.active = false;
        this.rightItem.node.active = false;
        this.evaluationItem.active = false;
        this.reportItem.active = false;
        this.scaleNode.active = false;
        this.curPage = 0;

        //this.addExtraListeners();
        agentUtil.agentRecharge = this;

        if (cc.sys.isNative) {
            this.picAddrss = jsb.fileUtils.getWritablePath() + "agentRecTmp";
        }

        this.orgBottomY = this.bottomBtsNode.y;
        this.emojiKeyboard.active = false;
        this.initEmojClickEvent();
        this.chgCurShowInputTypeBt(1);
        this.setKeyBoarHightCallBack();
        this.setKeyBoardReturnType();
        this.screenAdaptation();
        this.initPayInfoTouchEvent();

        this.addAndroidBackListen();
    }
    openAnim() {
        this.node.active = true;
        this.node.position = cc.v3(0, 0);
        this.nodeBg.active = true;
        this.nodeBox.active = true;
        this.node.opacity = 255;
        this.contentNode.x = 0;
        this.contentNode.y = 0;
        this.contentNode.active = true;
        this.scrollView.scrollToBottom();
        this.payTypes.active = false;
        if (this.needPayType) {
            this.paymentMethod();

            this.payTypeScr.content = this.payMode;
            // this.initPayTypes(this.agentPayFType);
        }
    }

    /**
     * 支付方式
     */
    public paymentMethod() {
        this.initPayTypes(this.agentPayFType, this.payMode, this.payModeItem);
    }

    public addExtraListeners(): void {
        net.off("OrderState");
        net.off("MsgReaded");
        this.listen("OrderState", this.handleOrderState);
        this.listen("MsgReaded", this.handleMsgIsRead);
    }


    private listen(event: string, func: Function) {
        let p = window.pomelo;
        p.on(event, func.bind(this));
        this.events.push(event);
    }

    onDestroy() {
        // this.cancleConfirm();
        if (!this.isChangeInterfaceOrientations) {
            agentUtil.changeInterfaceOrientations("2");
        } else {
            try {
                let rechargeMessage = this.lobbyParent.getChildByName("rechargeMessage")
                if (rechargeMessage) {
                    rechargeMessage.getComponent(RechargeMessage).show(false);
                }
                agentUtil.initRedDot();
            } catch (error) {
                cc.log("<<<<<<<<  ", error)
            }

        }

        window.pomelo.off("OrderState");
        window.pomelo.off("MsgReaded");
        // agentUtil.agentRecharge = undefined;
    }
    public removeExtraListeners(): void {
        this.events.forEach(e => {
            window.pomelo.off(e);
        });
    }

    async init(data: ChatInfo, isServer: boolean) {
        this.contentNode.children.forEach(el => {
            if (el.active) el.active = false;
        });
        // cc.log("-----2----", data);
        try {
            this.imageSriteFrame = [];
            this.chatId = data.chatId;
            this.agentUid = +data.aUid;
            this.localChatId = User.uid + "-" + data.aUid;
            data.localChatId = this.localChatId;    // 构建一个新老代充统一的本地存储key
            this.agentName = data.aName;
            this.curOrderState = data.state;
            this.curOrderEvaluation = data.evaluation;
            this.curOrderReport = data.report;
            this.agentGender = data.gender;
            this.agentAvatar = data.avatar;
            let user = User;
            this.myAvatar = user.avatarId;
            this.myGender = user.gender;
            this.myName = user.nick;
            // cc.log("-----3----");
            this.agentIcon.spriteFrame = getAvatar(this.myGender === 1 ? true : false, this.myAvatar);
            this.tipNode.parent.active = false;
            this.curReportIndx = 0;

            if (data.typesDate) {
                this.curTypesDate = data.typesDate;
            }
            this.agentPayFType = [];
            if (data.pays) {
                this.agentPayTypes = data.pays;
                this.agentPayTypes.forEach(el => {
                    this.agentPayFType.push(el.payFType);
                });
            }
            this.initTitle(false);
            this.chatRecordMes = data;
            let localData: ChatInfo = JSON.parse(localStorage.getItem(this.localChatId));
            if (localData) {
                let chatRecordMes: ChatInfo = localData;
                if (chatRecordMes.msgs && chatRecordMes.msgs.length != 0) {
                    this.chatRecordMes = localData;
                    if (data.msgs && data.msgs.length != 0 && isServer) {
                        this.chatRecordMes.msgs.unshift(data.msgs[0]);
                        localStorage.setItem(this.localChatId, JSON.stringify(this.chatRecordMes));
                    }
                } else {
                    if (!this.chatRecordMes.msgs) {
                        this.chatRecordMes.msgs = [];
                    }
                    localStorage.setItem(this.localChatId, JSON.stringify(this.chatRecordMes));
                }
            } else {
                if (!this.chatRecordMes.msgs) {
                    this.chatRecordMes.msgs = [];
                }
                localStorage.setItem(this.localChatId, JSON.stringify(this.chatRecordMes));
            }
            let message = agentUtil.messageLocalRecord(false, this.chatRecordMes, 0)
            if (this.chatRecordMes.msgs.length != 0 && this.chatRecordMes.msgs[0].type === 2) {
                message.content = "图片";
            }
            agentUtil.messageRecordSaving(message);
            this.initContent(this.chatRecordMes.msgs);
        } catch (error) {
            cc.log("------错误------  ", error);
        }
        this.needPayType = true;
        this.bottomBtsNode.active = true;
        this.setCloseOrderBtnodeActive(true);
        this.canSendMsg = true;
        this.title.node.y = this.orgTitleY;
        // this.chatIdTitle.string = "ID:" + this.chatId
        this.chatIdTitle.node.active = false;
    }
    setCloseOrderBtnodeActive(active: boolean) {
        if (this.closeOrderBtNode) {
            this.closeOrderBtNode.active = active;
        }
    }

    initWait() {
        this.contentNode.children.forEach(el => {
            if (el.active) el.active = false;
        });
        this.isWaiting = true;
        this.initTitle(true);
        this.setCloseOrderBtnodeActive(false);
        this.bottomBtsNode.active = false;
        this.tipNode.getComponent(cc.Label).string = "匹配中，暂时无法发送消息";
        if (agentUtil.allPayType) {
            this.needPayType = true;
            this.agentPayFType = agentUtil.allPayType;
            // this.initPayTypes(agentUtil.allPayType);
        }
        this.tipNode.parent.active = true;
        this.title.node.y = 0;
        this.canSendMsg = false;
    }
    clientReadMsg() {
        // net.notify("chat.clientHandler.readChatMsg", { chatId: this.chatId });
        agentUtil.decReadMsg(this.chatId);
    }

    initOrderTrack(orderTrack: OrderTrack) {
        this.orderTrack = orderTrack;
    }
    initTitle(isWait: boolean = false) {
        if (isWait) {
            // let tmp = Math.ceil(Math.random() * 5);
            this.matchInfo.node.active = true;
            this.title.node.active = false;
            this.matchInfo.string = `当前充值方式为：${agentUtil.getNameByType(agentUtil.agentChat.mPayType, true)}
该充值方式的代理忙需要等待，请稍候
推荐您在左侧选择其他支付方式，减少排队时间`;
        } else {
            this.matchInfo.node.active = false;
            this.title.node.active = true;
            this.title.string = `${this.agentName}`;
        }
    }
    async initContent(data: ps.ChatClientHandlerOpenChat_Chat_ChatMsg[]) {
        if (!data) {
            this.initUI();
            return;
        }
        let number = 0;
        if (data.length < 15) {        // 初始化消息小于10个  说明是 没有分页的
            this.loadingPageInfo = true;      // 设置不再加载历史记录
            number = data.length - 1;
        } else {
            number = 14;
        }
        for (let i = number; i >= 0; i--) {
            let tmsg = data[i];
            if (tmsg.fromType !== 0) {
                await this.createOneLeftItem(tmsg);
            } else {
                await this.createOneRightItem(tmsg, true);
            }
        }
        if (this.chatRecordMes && this.chatRecordMes.msgs.length !== 0) {
            this.creatDividingLineItme();
        }
        this.initUI();
        this.scheduleOnce(() => {
            if (this.contentNode.height > this.scrollView.node.height) {
                this.scrollView.scrollToBottom();
            }
        }, 0.1);  // 在下一帧执行  否则contentNode的高度没有刷新
    }

    initUI() {
        // 订单 完成或取消
        if (this.curOrderState === orderState.FINISHED || this.curOrderState === orderState.CLOSED) {
            this.bottomBtsNode.active = false;
            this.setCloseOrderBtnodeActive(false);
            this.tipNode.parent.active = true;
            this.tipNode.getComponent(cc.Label).string = "警告，此订单已关闭无法充值和发送付款截图!";
            this.canSendMsg = false;
            if (this.curOrderState === orderState.FINISHED) {
                // 未评价
                if (this.curOrderEvaluation === 0) {
                    this.createEvaluationItem();
                }
                if (!this.curOrderReport) {
                    this.createReportItem();
                }
            }
        }
    }

    /**
     * 初始化 该代理的支持的支付方式
     */
    initPayTypes(payData: string[], parent: cc.Node, item: cc.Node) {
        let myReportBt;
        parent.children.forEach(el => {
            if (el.name === "item") el.active = false;
            if (el.name === "reportBt") {
                myReportBt = el;
                if (this.curOrderReport) el.active = false;
            }
        });
        if (!payData || payData.length === 0) {
            return;
        }
        for (let i = 0; i < payData.length; i++) {
            let xItem = cc.instantiate(item);
            xItem.name = "item";
            if (parent.name === "pay") {
                xItem.getComponentInChildren(cc.Label).string = agentUtil.getNameByType(payData[i], true);
            } else {
                xItem.getComponentInChildren(cc.Label).string = agentUtil.getNameByPayType(payData[i]);
            }
            xItem.getComponent(cc.Button).clickEvents[0].customEventData = payData[i];
            xItem.active = true;
            parent.addChild(xItem);
        }
        if (myReportBt && myReportBt.active) {
            myReportBt.zIndex = 999;
        }
    }

    // 点击了 充值方式左箭头
    onClickLeftJt() {
        this.payTypeScr.scrollToRight();
        this.zPayTypeScrJt.active = false;
        this.yPayTypeScrJt.active = true;
    }

    // 点击了 充值方式右箭头
    onClickRightJt() {
        this.payTypeScr.scrollToLeft();
        this.yPayTypeScrJt.active = false;
        this.zPayTypeScrJt.active = true;
    }

    onPayTypeScrIng() {

        if (this.payTypeScr.getScrollOffset().x < -20) {
            this.yPayTypeScrJt.active = true;
        } else {
            this.yPayTypeScrJt.active = false;
        }
        if (this.payTypeScr.getScrollOffset().x > -(this.payTypeScr.content.width - this.payTypeScr.node.width - 20)) {
            this.zPayTypeScrJt.active = true;
        } else {
            this.zPayTypeScrJt.active = false;
        }
    }

    /**
     * 点击充值方式
     * @param event
     * @param customData
     */
    async onClickPayType(event: cc.Event, customData: string) {
        if (this.requestPayTypeIng) return;
        this.requestPayTypeIng = true;

        // 自动发送使用什么充值
        let sendMsg = {
            content: "使用" + agentUtil.getNameByType(customData, true) + "充值",
            chatId: this.chatId,
            type: 1,
            createDate: Date.now(),
            aUid: this.agentUid,
            fromType: 0,
        }
        // cc.log("<<<<<<<<<<<<   ", agentUtil.getNameByType(customData, true))
        this.sendMessage(sendMsg);

        let data = await net.request("chat.clientHandler.chgPayAct", { chatId: this.chatId, type: customData });
        try {
            if (data.code != 200) {
                this.showAgentTip(ErrCodes.getErrStr(data.code, "切换支付方式失败"));
                this.requestPayTypeIng = false;
                return;
            }
            if (data.chat.msgs) {
                data.chat.msgs.forEach(el => {
                    this.chatRecordMes.msgs.unshift(el);
                    localStorage.setItem(this.localChatId, JSON.stringify(this.chatRecordMes));

                    let message = agentUtil.messageLocalRecord(false, this.chatRecordMes, 0)
                    agentUtil.messageRecordSaving(message);
                    this.createOneLeftItem(el);
                });
            }

        } catch (error) {
            cc.log("<<<<<<<  错误", error);
        }

        this.requestPayTypeIng = false;
    }

    createOneLeftItem(data: any, zIndex?: number) {
        // cc.log("------createOneLeftItem---------", data);
        return new Promise(async reslove => {

            try {
                let leftItem = this.leftItem;
                leftItem.resetChatLabel();
                leftItem.getComponent(ChatContent).content.getComponent(cc.Sprite).spriteFrame = this.contentBg[0];
                if (data.type === 1 || data.type === 3 || data.type === 4) {  // 文字
                    leftItem.chatLb.node.active = true;
                    leftItem.payType.active = false;
                    leftItem.setChatLbStr(data.content);
                    leftItem.setCopyBtState(data.type === 4 ? false : true);
                } else if (data.type === 5) {  // 收款信息
                    leftItem.chatLb.node.active = false;
                    leftItem.payType.active = true;
                    let jsonData = JSON.parse(data.content);
                    leftItem.setPayTitle(agentUtil.getNameByType(jsonData[0].type, true) + "充值");
                    leftItem.setIndex(agentUtil.getIndexByType(jsonData[0].type, false));
                    // console.log("<<<<<<<<<<<<<setPayButtonCustomData   ", data.content)
                    leftItem.setPayButtonCustomData(data.content);
                    leftItem.setPayItemRebateInfo();

                    if (this.curTypesDate) {
                        let haveType = false;
                        for (const value of this.curTypesDate) {
                            if (jsonData.length === 1 && value.type != jsonData[0].type) continue;
                            if (jsonData.length === 2 && value.type != jsonData[0].type && value.type != jsonData[1].type) continue;
                            haveType = true;
                            if (value.date < data.createDate) continue;
                            leftItem.setPayButtonCustomData("expired");
                        }
                        if (!haveType) leftItem.setPayButtonCustomData("expired");
                    }

                    if (!this.agentPayFType || this.agentPayFType.length === 0) {
                        leftItem.setPayButtonCustomData("expired");
                    }
                }
                this.createTimeLabel(data.createDate);

                leftItem.setTimeLbStr(data.createDate);
                leftItem.setIconSp(this.agentGender, this.agentAvatar);
                let nLeftItem = cc.instantiate(leftItem.node);
                nLeftItem.active = true;
                nLeftItem.getComponent(ChatContent).adaptiveChatLabel();
                if (zIndex) nLeftItem.zIndex = zIndex;
                this.contentNode.addChild(nLeftItem);
                if (!this.needSroll && !zIndex) {
                    this.unreadMsgNum++;
                    this.chgToBottomBtNumLabel();
                } else if (!zIndex && this.contentNode.height > this.scrollView.node.height) {
                    this.scrollView.scrollToBottom(1);
                }

                this.lastSpeakItem = nLeftItem.getComponent(ChatContent);

            } catch (error) {
                cc.log("-------错误-----    ", error);
            }


            reslove();
        })
    }
    async createOneRightItem(data: any, isHistory: boolean, zIndex?: number) {
        return new Promise<cc.Node>(async reslove => {
            let rightItem = this.rightItem;
            rightItem.node.height = this.orgSize;
            rightItem.resetChatLabel();
            if (data.type === 2) {   //  base64图片
                rightItem.image.node.active = true;
                rightItem.chatLb.node.active = false;
                if (cc.sys.isNative) {
                    if (isHistory) {
                        this.saveBase64ToFile(data.content);
                    }
                    await this.loadTmpPng();
                    rightItem.setImage(this.tmpSp);
                }
            } else {
                rightItem.image.node.active = false;
                rightItem.chatLb.node.active = true;
                rightItem.setChatLbStr(data.content);
            }
            let xdate = Date.now();
            if (isHistory) xdate = data.createDate;
            rightItem.setTimeLbStr(xdate);
            this.createTimeLabel(data.createDate);

            rightItem.setLoadingActive(!isHistory);
            rightItem.setStateLbStr(data.read);
            rightItem.setIconSp(this.myGender, this.myAvatar);
            rightItem.setStatusLabelString();//设置状态不显示
            let nRightItem = cc.instantiate(rightItem.node);
            let chatContent = nRightItem.getComponent(ChatContent);
            this.unReadLable.push(chatContent.stateLb);

            chatContent.adaptiveChatLabel();
            nRightItem.active = true;
            if (zIndex) nRightItem.zIndex = zIndex;
            this.contentNode.addChild(nRightItem);
            if (!zIndex && this.contentNode.height > this.scrollView.node.height) this.scrollView.scrollToBottom(2);
            this.lastSpeakItem = chatContent;

            if (zIndex) {
                this.mySpeakTime.unshift(data.createDate);
            } else {
                this.mySpeakTime.push(data.createDate);
            }

            reslove(nRightItem);
        })
    }

    /**
    * 判断是否需要禁言
    */
    determineWhetherIsBanned() {
        let needShow = true;
        if (this.mySpeakTime.length >= 10) {
            for (let i = this.mySpeakTime.length - 1; i > this.mySpeakTime.length - 10; i--) {
                let el1 = this.mySpeakTime[i];
                let el2 = this.mySpeakTime[i - 1];
                if ((el1 - el2) / 1000 > 2) {
                    needShow = false;
                    break;
                }
            }
        } else {
            needShow = false;
        }
        let ntime = (Date.now() - this.mySpeakTime[this.mySpeakTime.length - 1]) / 1000;
        if (needShow && ntime < 20) {
            showTip(`发送消息太频繁，请${Math.floor(20 - ntime)}秒后再试`);
            return true;
        }
        return false;
    }


    createTimeLabel(time: number) {
        let showTimeString = "";
        let tDate, nDate, showTime;
        let willShow = false;
        tDate = new Date(time);   // 传入进来的时间
        nDate = new Date(Date.now());    // 当前时间
        showTime = tDate;
        let ctime = ((time - this.lastTime) / 1000 / 60);
        if (this.lastTime === 0 || ctime > 5) {
            willShow = true;
        }
        if (!willShow) return;

        if (nDate.getFullYear() - tDate.getFullYear() > 0) {
            // 超过一年
            showTimeString = `${showTime.getFullYear()}年${showTime.getMonth()}月${showTime.getDay()}日`
        } else if (nDate.getMonth() - tDate.getMonth() > 0 || nDate.getDay() - tDate.getDay() > 1) {
            showTimeString = `${showTime.getMonth()}月${showTime.getDay()}日`
        } else if (nDate.getDay() - tDate.getDay() > 0) {
            showTimeString = `昨日${showTime.getHours()}:${showTime.getMinutes()}`
            if (showTime.getMinutes() < 10) showTimeString = `昨日${showTime.getHours()}:0${showTime.getMinutes()}`
        } else if (nDate.getHours() - tDate.getHours() > 0 || nDate.getMinutes() - tDate.getMinutes() > 0) {
            showTimeString = `${showTime.getHours()}:${showTime.getMinutes()}`
            if (showTime.getMinutes() < 10) showTimeString = `${showTime.getHours()}:0${showTime.getMinutes()}`
        } else {
            showTimeString = `${showTime.getHours()}:${showTime.getMinutes()}`
        }
        this.lastTime = time;
        if (showTimeString != "") {
            this.timeLb.string = showTimeString;
            let xTimeItem = cc.instantiate(this.timeLb.node);
            xTimeItem.active = true;
            this.contentNode.addChild(xTimeItem);
        }
    }

    getUTF8(data: string) {
        if (!data) {
            return "";
        }
        var out, i, len, c;
        out = "";
        len = data.length;
        for (i = 0; i < len; i++) {
            c = data.charCodeAt(i);
            if ((c >= 0x0001) && (c <= 0x007F)) {
                out += data.charAt(i);
            } else if (c > 0x07FF) {
                out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F));
                out += String.fromCharCode(0x80 | ((c >> 6) & 0x3F));
                out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
            } else {
                out += String.fromCharCode(0xC0 | ((c >> 6) & 0x1F));
                out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
            }
        }
        return out;
    }
    createEvaluationItem() {

        this.nEvalaution = cc.instantiate(this.evaluationItem);
        this.nEvalaution.active = true;
        this.contentNode.addChild(this.nEvalaution);
        this.scrollView.scrollToBottom();

        this.bottomBtsNode.active = false;
        this.setCloseOrderBtnodeActive(false);
        this.tipNode.parent.active = true;
        this.tipNode.getComponent(cc.Label).string = "警告，此订单已关闭无法充值和发送付款截图!";
        this.canSendMsg = false;
    }


    createReportItem() {
        //  不在聊天列表里显示聊天
        // if (!this.curOrderReport) {
        //     this.nReport = cc.instantiate(this.reportItem);
        //     this.nReport.active = true;
        //     this.contentNode.addChild(this.nReport);
        //     this.scrollView.scrollToBottom();
        // }

        this.bottomBtsNode.active = false;
        this.setCloseOrderBtnodeActive(false);
        this.tipNode.parent.active = true;
        this.tipNode.getComponent(cc.Label).string = "警告，此订单已关闭无法充值和发送付款截图!";
        this.canSendMsg = false;
    }

    private onClickAddImage() {
        // this.cancleConfirm();
        // this.startConfirm();

        this.hideEmojpedia();
        this.onClickManualHideKeyBoard();

        this.hideMask();
        if (!this.canSendMsg) {
            return;
        }
        this.pngNumber++;
        this.tmpPath = this.picAddrss + this.pngNumber + ".png";
        cc.loader.release(this.tmpPath);
        console.log("------onClickAddImage-----", this.tmpPath);
        let callback = `cc.find('Canvas/parent/agentRecharge').getComponent('agentRecharge').choosePic();`;
        if (util.getSupportNewImgPicker()) {
            if (cc.sys.os === cc.sys.OS_IOS) {
                window.jsclass !== undefined ? JsClass.openImagePickeNew(this.tmpPath, callback, 0.7)
                    : jsb.reflection.callStaticMethod("NativeUtil", "openImagePickeNew:andCallback:qualitydata:", this.tmpPath, callback, 0.7);
            } else if (cc.sys.os === cc.sys.OS_ANDROID) {
                jsb.reflection.callStaticMethod("util/NativeUtil", "goPhotoAlbum", "(Ljava/lang/String;Ljava/lang/String;I)V", this.tmpPath, callback, 80);
            }
        } else {
            if (cc.sys.os === cc.sys.OS_IOS) {
                window.jsclass !== undefined ? JsClass.openImagePicke(this.tmpPath, callback)
                    : jsb.reflection.callStaticMethod("NativeUtil", "openImagePicke:andCallback:qualitydata:", this.tmpPath, callback, 1);
            } else if (cc.sys.os === cc.sys.OS_ANDROID) {
                jsb.reflection.callStaticMethod("util/NativeUtil", "goPhotoAlbum", "(Ljava/lang/String;Ljava/lang/String;)V", this.tmpPath, callback);
            }
        }
    }

    onClickSaveImage() {
        if (cc.sys.os === cc.sys.OS_IOS) {
            if (window.jsclass !== undefined) {
                JsClass.saveImage();
            } else {
                jsb.reflection.callStaticMethod("NativeUtil", "saveImage");
            }
        } else if (cc.sys.os === cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod("util/NativeUtil", "saveImage", "()V");
        }
        // this.showAgentTip("保存完成");
        this.showAgentTip("保存完成");
    }

    saveBase64ToFile(data: string) {
        if (data.indexOf("data:image/png") != -1) {
            data = data.replace("data:image/png", "data:image/jpeg");
        }
        this.pngNumber++;
        this.tmpPath = this.picAddrss + this.pngNumber + ".png";
        cc.loader.release(this.tmpPath);
        // console.debug("------saveBase64ToFile-----", this.tmpPath);
        if (cc.sys.os === cc.sys.OS_IOS) {
            if (window.jsclass !== undefined) {
                JsClass.saveBase64ToFile(this.tmpPath, data);
            } else {
                jsb.reflection.callStaticMethod("NativeUtil", "saveBase64ToFile:andData:", this.tmpPath, data);
            }
        } else if (cc.sys.os === cc.sys.OS_ANDROID) {
            let str = "data:image/jpeg;base64,";
            data = data.substr(str.length);
            jsb.reflection.callStaticMethod("util/NativeUtil", "saveBase64ToFile", "(Ljava/lang/String;Ljava/lang/String;)V", this.tmpPath, data);
        }
    }



    // 原生相册中选择图片后的回调
    choosePic() {
        let data: any = jsb.fileUtils.getDataFromFile(this.tmpPath);
        let base64data = this.arrayBufferToBase64(data);
        if (base64data === "data:image/jpeg;base64,") {
            showTip("选取图片失败，请重试")
            return;
        }
        let senddata = {
            content: base64data,
            type: 2,
            chatId: this.chatId,
            createDate: Date.now(),
            aUid: this.agentUid,
            fromType: 0,
        };
        if (jsb.fileUtils.isFileExist(this.tmpPath)) {
            let self = this;
            // console.debug("------choosePic-----", this.tmpPath);
            cc.loader.load({ url: this.tmpPath, type: 'jpeg' }, (err: any, sp: cc.Texture2D) => {
                self.tmpSp = new cc.SpriteFrame(sp);
                // this.createOneRightItem(senddata, false);
                this.sendMessage(senddata);
            });
        }
    }


    loadTmpPng() {
        return new Promise(resolve => {

            if (jsb.fileUtils.isFileExist(this.tmpPath)) {
                let self = this;
                // cc.loader.release(this.tmpPath);
                cc.loader.load({ url: this.tmpPath, type: 'jpeg' }, (err: any, sp: any) => {
                    // console.debug("=send png===1=" + this.tmpPath);
                    if (err) {
                        console.debug("=send png===2=" + err);
                    }
                    self.tmpSp = new cc.SpriteFrame(sp);
                    resolve();
                });
            }
        });
    }

    loadUrlPng(imageData: string) {
        let self = this;
        return new Promise(resolve => {
            cc.loader.load({ url: imageData, type: 'png' }, function (error: any, spriteFrame: cc.Texture2D) {
                if (!error) {
                    self.tmpSp = new cc.SpriteFrame(spriteFrame);
                    resolve();
                } else {
                    // this.showAgentTip("加载二维码失败，请重试!");
                    self.showAgentTip("加载二维码失败，请重试!");
                    // cc.log("----error-----", error);
                }
            });
        });
    }
    arrayBufferToBase64(raw: any) {
        var base64 = '';
        var encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        var bytes = new Uint8Array(raw);
        var byteLength = bytes.byteLength;
        var byteRemainder = byteLength % 3;
        var mainLength = byteLength - byteRemainder;
        var a, b, c, d;
        var chunk;
        // Main loop deals with bytes in chunks of 3
        for (var i = 0; i < mainLength; i = i + 3) {
            // Combine the three bytes into a single integer
            chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
            // Use bitmasks to extract 6-bit segments from the triplet
            a = (chunk & 16515072) >> 18; // 16515072 = (2^6 - 1) << 18
            b = (chunk & 258048) >> 12; // 258048 = (2^6 - 1) << 12
            c = (chunk & 4032) >> 6; // 4032 = (2^6 - 1) << 6
            d = chunk & 63; // 63 = 2^6 - 1
            // Convert the raw binary segments to the appropriate ASCII encoding
            base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d];
        }
        // Deal with the remaining bytes and padding
        if (byteRemainder == 1) {
            chunk = bytes[mainLength];
            a = (chunk & 252) >> 2 // 252 = (2^6 - 1) << 2;
            // Set the 4 least significant bits to zero
            b = (chunk & 3) << 4 // 3 = 2^2 - 1;
            base64 += encodings[a] + encodings[b] + '==';
        }
        else if (byteRemainder == 2) {
            chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1];
            a = (chunk & 16128) >> 8 // 16128 = (2^6 - 1) << 8;
            b = (chunk & 1008) >> 4 // 1008 = (2^6 - 1) << 4;
            // Set the 2 least significant bits to zero
            c = (chunk & 15) << 2 // 15 = 2^4 - 1;
            base64 += encodings[a] + encodings[b] + encodings[c] + '=';
        }
        return "data:image/jpeg;base64," + base64;
    }

    /**
    * 当输入框有字的时候，隐藏发送截图的按钮，展示发送消息的按钮
    */
    private chgSendButtonStatus(showImage: boolean) {
        this.addImage.active = showImage;
        this.sendBt.active = !showImage;
    }


    codePointAt(tmpStr: string, position: number) {

        let string = String(tmpStr);
        let size = string.length;
        // 变成整数
        let index = position ? Number(position) : 0;
        if (index != index) { // better `isNaN`
            index = 0;
        }
        // 边界
        if (index < 0 || index >= size) {
            return undefined;
        }
        // 第一个编码单元
        let first = string.charCodeAt(index);
        let second;
        if ( // 检查是否开始 surrogate pair
            first >= 0xD800 && first <= 0xDBFF && // high surrogate
            size > index + 1 // 下一个编码单元
        ) {
            second = string.charCodeAt(index + 1);
            if (second >= 0xDC00 && second <= 0xDFFF) { // low surrogate
                // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
                return (first - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
            }
        }
        return first;
    };
    /**
     * 点击删除按钮
     */
    private onClickDelButton() {
        let editStr = this.edit.string;
        if (editStr.length > 0) {
            let tmpStr;
            if (editStr.charCodeAt(editStr.length - 2) === this.codePointAt(editStr, editStr.length - 2)) {
                tmpStr = editStr.substring(0, editStr.length - 1);
            } else {
                tmpStr = editStr.substring(0, editStr.length - 2);
            }
            this.edit.string = tmpStr;
            this.updateEditBoxLb(this.edit.string);     // 针对emoji输入框填满后删除没有向右对齐 强制更新
            if (this.edit.string === "") {
                this.chgSendButtonStatus(true);
            }
        } else {
            this.chgSendButtonStatus(true);
        }
    }

    /**
     * 点击消息发送
     */
    private onClickSendButton() {
        // this.cancleConfirm();
        // this.startConfirm();
        if (!this.canSendMsg) {
            return;
        }
        if (this.determineWhetherIsBanned()) return;
        let data: SendChatMsg = undefined;
        let content = this.edit.string;
        this.edit.string = "";
        this.onClickClearTextField();
        this.chgSendButtonStatus(true);
        if (content === "" || !content) {
            // this.showAgentTip("发送内容不能为空!");
            this.showAgentTip("发送内容不能为空!");
            return;
        } else {
            data = {
                content: content,
                chatId: this.chatId,
                type: 1,
                createDate: Date.now(),
                aUid: this.agentUid,
                fromType: 0,
            }
        }

        // this.createOneRightItem(data, false);
        this.sendMessage(data);
    }
    async sendMessage(arg: any) {
        let content: cc.Node;
        this.chatRecordMes = JSON.parse(localStorage.getItem(this.localChatId));
        this.chatRecordMes.msgs.unshift(arg);
        localStorage.setItem(this.localChatId, JSON.stringify(this.chatRecordMes));
        if (arg.type != 4) {
            content = await this.createOneRightItem(arg, false);
        }
        let data = await net.request("chat.clientHandler.sendMsg", arg);
        let chatContent = content.getComponent(ChatContent)
        if (data.code === 200) {
            chatContent.setLoadingActive(false);
        } else {
            this.showAgentTip(ErrCodes.getErrStr(data.code));
            chatContent.setLoadingActive(true, data.code);
            this.chatRecordMes.msgs.splice(0, 1);
            localStorage.setItem(this.localChatId, JSON.stringify(this.chatRecordMes));
            this.sendAgentMsg(data.code);
        }
        let message = agentUtil.messageLocalRecord(false, this.chatRecordMes, 0)
        if (arg.type === 2) {
            message.content = "图片";
        }
        chatContent.setStatusLabelString(data.code); //设置消息状态
        agentUtil.messageRecordSaving(message);
        this.edit.string = "";
        this.onClickClearTextField();
    }
    /**
     * 点击评价
     * @param event
     * @param customData
     */
    async onClickEvaluationBt(event: cc.Event, customData: string) {
        // 评价功能已取消
        // let tip = customData === "2" ? "感谢您的好评,我们会做得更好!" : "感谢您的评价,我们会努力改正!";
        // let data = await net.request("chat.clientHandler.evaluation", { chatId: this.chatId, evaluation: +customData });
        // if (data.code === 200) {
        //     this.nEvalaution.active = false;
        //     this.scrollView.scrollToBottom();
        //     if (this.orderTrack) {
        //         this.orderTrack.chgOrderIcon(+customData);
        //     }
        //     this.showAgentTip(tip);
        // } else {
        //     this.showAgentTip(ErrCodes.getErrStr(data.code, "评价失败"));
        // }
    }


    /**
     * 点击举报按钮
     */
    onClickReport() {
        // this.cancleConfirm();
        // this.startConfirm();
        this.initReportLayout();
        this.onClickManualHideKeyBoard();
        this.hideEmojpedia();
        this.reportInfo.active = true;
    }

    onClcikCloseReportInfo() {
        this.reportInfo.active = false;
    }

    async onClickConfirmReport() {
        // 举报功能已取消
        let reportTxt = "";
        // if (this.curReportIndx === 4 && !this.reportEdit.string) {
        //     this.showAgentTip("请输入举报理由");
        //     return;
        // }
        // reportTxt = this.curReportIndx === 4 ? this.reportEdit.string : this.reportContent[this.curReportIndx];
        reportTxt = this.reportContent[this.curReportIndx];

        // let data = await net.request("chat.clientHandler.report", { chatId: this.chatId, reportRemarks: reportTxt });
        // if (data.code === 200) {
        //     this.showAgentTip("举报代理成功，我们会以邮件方式告知您处理结果!");
        //     if (this.nReport) this.nReport.active = false;
        //     if (this.reportInfo) this.reportInfo.active = false;
        //     this.curOrderReport = 1;
        //     this.payTypes.children.forEach(el => {
        //         if (el.name === "reportBt") el.active = false;
        //     });
        // } else {
        //     this.showAgentTip(ErrCodes.getErrStr(data.code, "举报代理失败"));
        // }
    }
    onClickScaleBt(event: cc.Event, customData: string) {
        // this.cancleConfirm();
        // this.startConfirm();
        this.scaleSp.spriteFrame = this.imageSriteFrame[+customData];
        this.changeImgSize(this.scaleSp.node, 350, false);
        this.scaleNode.active = true;
    }

    onClickScaleCloseBt() {
        this.scaleNode.active = false;
    }

    /**
     * 处理聊天消息
     * @param data
     */
    handleChatToClientMsg(data: AcceptChatMsg) {
        let locaChatId = data.localChatId ? data.localChatId : this.localChatId;
        let chatRecordMes: ChatInfo = JSON.parse(localStorage.getItem(locaChatId));
        let message = agentUtil.messageLocalRecord(false, chatRecordMes, 0);
        // cc.log("<<<<<<<<<处理聊天消息11  ", this.localChatId);
        if (this.localChatId === locaChatId) {
            agentUtil.messageRecordSaving(message);
            //  cc.log("<<<<<<<<<处理聊天消息  ", this.localChatId);
            this.createOneLeftItem(data);
        } else {
            let messageNum1 = agentUtil.newRecMesNum(data)
            message.messageNum = messageNum1;
            agentUtil.messageRecordSaving(message);
        }
    }

    /**
     * 处理订单状态  以便显示  评价.举报
     * @param data
     */
    handleOrderState(data: { chatId: string, state: number }) {
        if (data.chatId != this.chatId) {
            return;
        }
        if (data.state === orderState.FINISHED || data.state === orderState.CLOSED) {
            if (this.orderTrack) {
                this.orderTrack.chgOrderState(data.state);
            }
            this.curOrderState = data.state;
            this.onClickManualHideKeyBoard();
        }
    }

    /**
     * 处理消息已读
     */
    handleMsgIsRead(data: { code: number, chatId: string }) {
        if (data.chatId === this.chatId) {
            this.unReadLable.forEach(el => {
                el.string = "已读";
            });
        }
    }

    changeImgSize(imgNode: cc.Node, toSize: number = 400, isRotate: boolean = false) {
        let nheight = imgNode.height;
        let nwidth = imgNode.width;
        imgNode.angle = 0;
        imgNode.scale = 1;
        if (imgNode.height > imgNode.width) {
            imgNode.scale = toSize / nheight;
        } else if (imgNode.width >= imgNode.height) {
            imgNode.scale = toSize / nwidth;
        }
    }

    onClickCopy(ev: cc.Event, customData: string) {
        // this.cancleConfirm();
        // this.startConfirm();
        let node: cc.Node = ev.target;
        let parent = node.parent.parent;
        let lb = parent.getComponent(cc.Label);
        if (lb && lb.string) {
            util.setClipboard(lb.string);
            this.showAgentTip("内容已拷贝到剪切板!");
        }
    }

    closeAction() {
        this.onClickManualHideKeyBoard();
        this.node.active = false;
        this.node.removeFromParent(true);
        this.node.destroy();
        // agentUtil.closeAgentRecharge();
    }

    /**
     * 点击小卡片充值
     * @param event
     * @param customData
     */
    async onClickPay(event: cc.Event, customData: string) {
        if (this.curOrderState === orderState.FINISHED || this.curOrderState === orderState.CLOSED) {
            this.showAgentTip("亲,该订单已经关闭了哟～");
            return;
        }
        if (customData === "expired") {
            this.showAgentTip("当前订单已失效，请关闭订单后，重新选择");
            return;
        }
        // this.cancleConfirm();
        // this.startConfirm();

        this.onClickManualHideKeyBoard();

        try {
            this.imageNode.active = false;
            this.textPay.active = false;
            // this.agentID.string = "如果充值不到账，请将服务号提交给客服，我们会第一时间为您处理！本次服务号：" + this.agentUid;
            this.payInfoTitle.string = "收款";

            let tmp = JSON.parse(customData);
            //console.log("-----jsontmp----", tmp);

            for (let i = 0; i < tmp.length; i++) {
                let jData = tmp[i];

                if (jData.displayContact) {
                    if (jData.accountId || jData.accountType || jData.accountImg) {
                        // 有联系方式  只显示联系方式
                        this.chgPayInfoToContact(jData.accountImg, jData.accountId, jData.accountType, g.hallVal.reportData.wx);
                        break;
                    }
                }
                this.errPay = jData.type;
                if (jData.qrCode) {
                    // showLoading("加载中");
                    this.imageNode.active = true;
                    this.codeFeeRate.string = "手续费率：" + (jData.feeRate ? +jData.feeRate * 100 + "%" : "0");

                    if (cc.sys.isNative) {
                        this.saveBase64ToFile(jData.qrCode);
                        await this.loadTmpPng();
                        this.imageSp.spriteFrame = this.tmpSp;
                    }

                    this.imageSriteFrame.push(this.imageSp.spriteFrame);
                    this.imageSp.node.getComponent(cc.Button).clickEvents[0].customEventData = "" + (this.imageSriteFrame.length - 1);
                    this.changeImgSize(this.imageSp.node, 300, false);
                    this.imageTitle.string = "【" + agentUtil.getNameByType(jData.type, true) + "二维码付款" + "】";

                    // hideLoading();
                } else if (jData.act) {
                    this.txtFeeRate.string = "手续费率：" + (jData.feeRate ? +jData.feeRate * 100 + "%" : "0");
                    this.textPay.active = true;
                    this.actLabel.string = jData.act;
                    this.nameLabel.string = jData.name;
                    // let actlbl = this.textPay.getChildByName("ac");
                    // let namelbl = this.textPay.getChildByName("name");
                    // let actCopy = this.textPay.getChildByName("copy1");
                    // let nameCopy = this.textPay.getChildByName("copy2");
                    // actlbl.y = -18;
                    // namelbl.y = -71;
                    // actCopy.y = -18;
                    // nameCopy.y = -71;
                    // this.actLabel.node.y = -18;
                    // this.nameLabel.node.y = -71;
                    this.textPay.getChildByName("title").getComponent(cc.Label).string = "【" + agentUtil.getNameByType(jData.type, false) + "转账付款" + "】";
                }
                this.payInfo.getChildByName('bg').color = this.payinfoBgColors[agentUtil.getIndexByType(jData.type, false)];
            }


        } catch (error) {

            cc.log("--------错误---------", error);
        }

        this.payInfo.x = 0;
        this.payInfo.active = true;
        this.payInfoMaskbg.opacity = 255;
        this.payInfoMaskbg.active = true;
    }

    //  联系方式
    async chgPayInfoToContact(imageData: string, act: string, type: string, reportQQ: string) {
        this.payInfoTitle.string = "联系方式";
        if (imageData && imageData != "") {
            this.imageNode.active = true;
            if (cc.sys.isNative) {
                this.saveBase64ToFile(imageData);
                await this.loadTmpPng();
                this.imageSp.spriteFrame = this.tmpSp;
            }
            this.changeImgSize(this.imageSp.node, 300, false);
            // this.imageTitle.string = "【" + agentUtil.getNameByType(type) + "二维码" + "】";
            this.imageTitle.string = "【" + type + "二维码" + "】";
            this.imageNode.getChildByName("tip").getComponent(cc.Label).string = "截图保存二维码到相册，扫一扫添加好友";
        }

        if (act && act != "") {
            this.textPay.getChildByName("title").getComponent(cc.Label).string = "【" + type + "账号" + "】";
            this.textPay.getChildByName("tip").getComponent(cc.Label).string = "复制账号，添加好友";
            this.textPay.getChildByName("name").getComponent(cc.Label).string = "联系方式";
            this.textPay.active = true;
            this.actLabel.string = act;
            // this.nameLabel.string = agentUtil.getNameByType(type);
            this.nameLabel.string = type;
        }
        if (reportQQ) {
            this.contactTip.getChildByName("reportinfo").getComponent(cc.Label).string = "举报专用" + ":" + reportQQ;
            this.contactTip.getChildByName("reportinfo").active = true;
        } else {
            this.contactTip.getChildByName("reportinfo").active = false;
        }
        this.transferTip.active = false;
        this.contactTip.active = true;
    }


    /**
     * payInfo触摸事件
     */
    initPayInfoTouchEvent() {
        let self = this;
        let time = 0.2;
        this.payInfoMaskbg.on(cc.Node.EventType.TOUCH_START, function (event: cc.Event.EventTouch) {
            // var touches = event.getTouches();
            // var touchPos = touches[0].getLocation();
            if (!self.payInfoCanMove) {
                return;
            }
            let touchPos = event.getLocation();
            self.payInfoTouchBeginPos = touchPos;
        });

        this.payInfoMaskbg.on(cc.Node.EventType.TOUCH_END, function (event: cc.Event.EventTouch) {
            if (!self.payInfoTouchBeginPos) {
                return;
            }
            let touchPos = event.getLocation();
            let nx = touchPos.x - self.payInfoTouchBeginPos.x;
            self.payInfoTouchBeginPos = undefined;
            self.payInfoCanMove = false;
            if (nx > 130) {
                // self.payInfo.runAction(cc.sequence(cc.moveTo(time, cc.v2(640, 0)),
                //     cc.callFunc(() => {
                //         self.payInfoCanMove = true;
                //         self.payInfo.active = false;
                //     })));
                cc.tween(self.payInfo)
                    .to(time, { position: cc.v2(640, 0) })
                    .call(() => {
                        self.payInfoCanMove = true;
                        self.payInfo.active = false;
                    }).start();
                //self.payInfoMaskbg.runAction(cc.sequence(cc.fadeTo(time, 0), cc.callFunc(() => { self.payInfoMaskbg.active = false })));
                cc.tween(self.payInfoMaskbg)
                    .to(time, { opacity: 0 })
                    .call(
                        () => { self.payInfoMaskbg.active = false }
                    ).start();
            } else {
                //self.payInfo.runAction(cc.sequence(cc.moveTo(time, cc.v2(0, 0)), cc.callFunc(() => { self.payInfoCanMove = true })));
                cc.tween(self.payInfo)
                    .to(time, { position: cc.v2(0, 0) })
                    .call(
                        () => {
                            self.payInfoCanMove = true
                        }
                    ).start();
                //self.payInfoMaskbg.runAction(cc.fadeTo(time, 255));
                cc.tween(self.payInfo).to(time, { opacity: 255 }).start();
            }

        });

        this.payInfoMaskbg.on(cc.Node.EventType.TOUCH_MOVE, function (event: cc.Event.EventTouch) {
            if (!self.payInfoTouchBeginPos) {
                return;
            }
            let touchPos = event.getLocation();
            let nx = touchPos.x - self.payInfoTouchBeginPos.x;
            if (nx < 0) {
                self.payInfo.x = 0;
                return;
            }
            self.payInfo.x = nx;
            self.payInfoMaskbg.opacity = 255 + 255 * -self.payInfo.x / 640;
        });

        this.payInfoMaskbg.on(cc.Node.EventType.TOUCH_CANCEL, function (event: cc.Event.EventTouch) {
            if (!self.payInfoTouchBeginPos) {
                return;
            }
            let touchPos = event.getLocation();
            let nx = touchPos.x - self.payInfoTouchBeginPos.x;
            self.payInfoTouchBeginPos = undefined;
            self.payInfoCanMove = false;
            if (nx > 130) {
                // self.payInfo.runAction(cc.sequence(cc.moveTo(time, cc.v2(640, 0)),
                //     cc.callFunc(() => {
                //         self.payInfoCanMove = true;
                //         self.payInfo.active = false;
                //     })));
                cc.tween(self.payInfo)
                    .to(time, { position: cc.v2(640, 0) })
                    .call(
                        () => {
                            self.payInfoCanMove = true;
                            self.payInfo.active = false;
                        }
                    ).start();
                //self.payInfoMaskbg.runAction(cc.sequence(cc.fadeTo(time, 0), cc.callFunc(() => { self.payInfoMaskbg.active = false })));
                cc.tween(self.payInfoMaskbg)
                    .to(time, { opacity: 0 })
                    .call(
                        () => { self.payInfoMaskbg.active = false }
                    ).start();
            } else {
                //self.payInfo.runAction(cc.sequence(cc.moveTo(time, cc.v2(0, 0)), cc.callFunc(() => { self.payInfoCanMove = true })));
                cc.tween(self.payInfo)
                    .to(time, { position: cc.v2(0, 0) })
                    .call(
                        () => { self.payInfoCanMove = true }
                    ).start();
                //self.payInfoMaskbg.runAction(cc.fadeTo(time, 255));
                cc.tween(self.payInfoMaskbg).to(time, { opacity: 255 }).start();
            }

        });
    }

    /**
     * 点击已付款
     */
    onClickPaid() {
        if (this.curOrderState === orderState.FINISHED || this.curOrderState === orderState.CLOSED) {
            this.showAgentTip("亲,该订单已经关闭了哟～");
            return;
        }
        let data = {
            content: this.fastSendAgentMsg[1],
            chatId: this.chatId,
            type: 1,
            createDate: Date.now(),
            aUid: this.agentUid,
            fromType: 0,
        }

        this.sendMessage(data);
        this.sendAgentMsg();
        this.payInfo.active = false;
        this.payInfoMaskbg.active = false;
    }

    // 引导玩家强制点击发送截图的按钮
    showMask() {
        this.mask.active = true;
        this.arrow.stopAllActions();
        let actions = cc.sequence(cc.moveBy(0.4, cc.v2(0, -20)), cc.moveBy(0.7, cc.v2(0, 20))).repeatForever()
        //this.arrow.runAction(cc.sequence(cc.moveBy(0.4, cc.v2(0, -20)), cc.moveBy(0.7, cc.v2(0, 20))).repeatForever());
        cc.tween(this.arrow).then(actions).start();
    }

    hideMask() {
        this.mask.active = false;
        this.arrow.stopAllActions();
    }


    sendAgentMsg(code: number = 1) {
        let msg = this.content[code];
        if (!msg) return;
        let data = {
            content: msg,
            chatId: this.chatId,
            type: 4,
            createDate: Date.now(),
            aUid: this.agentUid,
            fromType: 1,
        }
        this.createOneLeftItem(data);
        this.sendMessage(data);
    }

    /**
     * 点击支付方式
     */
    onClickPaymentMethod(event: cc.Event, customData: string) {
        this.payTypes.active = true;
        this.payMode.active = false;
        this.payTypeScr.content = this.payTypes;
        this.agentPayTypes.forEach(el => {
            if (el.payFType === customData) {
                this.agentPayCTypes = el.payCTypes;
            }
        });

        this.initPayTypes(this.agentPayCTypes, this.payTypes, this.payTypeItem);

    }

    /**
       * 点击返回支付方式
       */
    onClickBackPaymentMethod() {
        this.payTypes.active = false;
        this.payMode.active = true;
        this.payTypeScr.content = this.payMode;
    }

    /**
     * 点击账户异常
     */
    onClickActException() {
        if (this.curOrderState === orderState.FINISHED || this.curOrderState === orderState.CLOSED) {
            this.showAgentTip("亲,该订单已经关闭了哟～");
            return;
        }
        net.request("chat.clientHandler.reportPayError", { chatId: this.chatId, pay: this.errPay });
        // let data = {
        //     content: "你的收款账户存在异常，请检查!",
        //     chatId: this.chatId,
        //     type: 0,
        //     createDate: Date.now(),
        //     aUid: this.agentUid,
        //     fromType: 0,
        // }

        // // this.createOneRightItem(data, false);
        // this.sendMessage(data);
        this.payInfo.active = false;
        this.payInfoMaskbg.active = false;
        this.payTypes.active = false;
        this.payMode.active = true;
        this.payTypeScr.content = this.payMode;
    }

    /**
     * 点击下一个支付方式
     */
    onClickNextPayInfo() {
        // this.cancleConfirm();
        // this.startConfirm();
        if (this.imageNode.active) {
            this.imageNode.active = false;
            this.textPay.active = true;
        } else {
            this.imageNode.active = true;
            this.textPay.active = false;
        }
    }

    onClickClosePayInfo() {
        this.payInfo.active = false;
        this.payInfoMaskbg.active = false;
    }

    onClickCopyAct() {
        util.setClipboard(this.actLabel.string);
        this.showAgentTip("内容已拷贝到剪切板!");
    }
    onClickCopyName() {
        util.setClipboard(this.nameLabel.string);
        this.showAgentTip("内容已拷贝到剪切板!");
    }

    /**
     * 滑动事件
     */
    onScrollEvent() {
        //cc.log("<<<<<<<<< 滑动事件 ", this.loadingPageInfo, this.isWaiting, this.scrollView.getScrollOffset().y);
        // 滑到最上面
        if (this.scrollView.getScrollOffset().y < -20 && !this.loadingPageInfo && !this.isWaiting) {
            this.loadingPageInfo = true;
            //cc.log("<<<<<<<<< 滑动事件 ");
            this.getOrderInfoPage();
        }
        if (this.scrollView.getMaxScrollOffset().y - this.scrollView.getScrollOffset().y > this.scrollView.node.height) {
            this.showToBottomBt();
            this.needSroll = false;
        } else if (this.scrollView.getMaxScrollOffset().y - this.scrollView.getScrollOffset().y < this.scrollView.node.height / 2) {
            this.needSroll = true;
            this.hideToBottomBt();
        }
    }

    /**
     * 下滑至底部按钮相关
     */
    showToBottomBt() {
        this.toBottomBt.active = true;
    }

    hideToBottomBt() {
        this.toBottomBt.active = false;
        this.unreadMsgNum = 0;
    }

    chgToBottomBtNumLabel() {
        this.toBottomBtLabel.node.parent.active = this.unreadMsgNum > 0 ? true : false;
        this.toBottomBtLabel.string = this.unreadMsgNum + "";
    }

    onClickToBottomBt() {
        this.scrollView.scrollToBottom();
        this.unreadMsgNum = 0;
        this.chgToBottomBtNumLabel();
        this.hideToBottomBt();
    }

    /**
     * 菊花loading
     * @param isShow
     */
    chgLoadContentAimStatus(isShow: boolean) {
        this.loadingNode.active = isShow;
        this.loadingNode.zIndex = -999;
    }

    async getOrderInfoPage() {
        // cc.log("====getOrderInfoPage====");
        //showLoading("加载历史消息中");
        this.chgLoadContentAimStatus(true);
        this.curPage++;
        let chatRecordMes = [];
        let number = 0;
        for (let index = this.curPage * 15; index < this.chatRecordMes.msgs.length; index++) {
            if (index < (this.curPage + 1) * 15 && index < this.chatRecordMes.msgs.length) {
                number++;
                chatRecordMes.push(this.chatRecordMes.msgs[index]);
            }
        }
        if (number > 0) {
            this.initPageContent(chatRecordMes);
        } else {

            this.showAgentTip("没有更多历史消息了!");
        }
        this.chgLoadContentAimStatus(false)
        // if (data.code === 200) {
        //     if (!data.msgs || data.msgs.length === 0) {
        //         this.showAgentTip("没有更多历史消息了!");
        //     } else {
        //         this.initPageContent(data.msgs);
        //     }
        // } else {
        //     this.loadingPageInfo = false;
        //     this.showAgentTip(ErrCodes.getErrStr(data.code, "加载失败"));
        // }
    }

    async initPageContent(data: ps.ChatClientHandlerOpenChat_Chat_ChatMsg[]) {
        if (!data) {
            return;
        }
        this.scrollView.stopAutoScroll();
        let highet = this.scrollView.getMaxScrollOffset().y;
        // console.log("----highet-----", highet);
        let firstH = 200;
        for (let i = 0; i < data.length; i++) {
            let tmsg = data[i];
            this.curZIndex--;
            if (tmsg.fromType !== 0) {
                //cc.log("<<<<<<<  ", this.curZIndex)
                await this.createOneLeftItem(tmsg, this.curZIndex);
            } else {
                await this.createOneRightItem(tmsg, true, this.curZIndex);
            }
        }
        let nhighet = this.scrollView.getMaxScrollOffset().y;
        // console.log("----nhighet-----", nhighet);
        this.scrollView.stopAutoScroll();
        let nOffsetY = nhighet - highet;
        nOffsetY = nOffsetY > 0 ? nOffsetY : 0;
        this.scrollView.scrollToOffset(cc.v2(0, nOffsetY));
        this.loadingPageInfo = false;
        this.scheduleOnce(() => {
            this.scrollView.stopAutoScroll();
        }, 0.1);
    }

    // 每隔一分钟若玩家无操作 提示玩家充值
    // startConfirm() {
    //     if (this.curOrderState === orderState.UNFINISHED || !this.curOrderState) {
    //         this.scheduleOnce(this.callBack, 60);
    //     }
    // }
    // callBack() {
    //     if (this.filler.parent === this.node) {
    //         if (agentUtil.getSupportNewAgentChatRcg()) {
    //             this.showAgentConfirm("亲，请问您充值了吗？请点击小卡片充值哦");
    //         } else {
    //             showConfirm("亲，请问您充值了吗？请点击小卡片充值哦");
    //         }
    //     }
    // }
    // cancleConfirm() {
    //     this.unschedule(this.callBack);
    // }

    /**
     * 玩家点击关闭订单
     */
    async onClickCloseOrder() {
        this.onClickManualHideKeyBoard();
        this.showAgentConfirm("此订单关闭后，本次充值将无法给该商人发送付款截图，请确定是否关闭", true);
    }

    // *****竖屏
    /**
     * 显示表情
     */
    onClickShowEmoj() {
        if (this.emojiKeyboard.active) {
            return;
        }
        this.onClickManualHideKeyBoard();
        this.emojiKeyboard.active = true;
        //this.emojiKeyboard.runAction(cc.moveTo(0.2, cc.v2(0, this.showEmojiY)));
        cc.tween(this.emojiKeyboard).to(0.2, { position: cc.v2(0, this.showEmojiY) }).start();
        this.bottomBtsNode.y = this.orgBottomY + 300;
        this.onShowKeyBoardScrollViewAdaptive(300);
        this.chgCurShowInputTypeBt(2);
    }
    hideEmojpedia() {
        cc.director.getActionManager().removeAllActionsFromTarget(this.emojiKeyboard, true);
        this.emojiKeyboard.active = false;
        this.emojiKeyboard.y = -700;
        this.bottomBtsNode.y = this.orgBottomY;
        this.filler.parent = this.node
        this.chgCurShowInputTypeBt(1);
    }

    /**
     * 显示普通键盘
     */
    onClickShowKeyBoard() {
        this.hideEmojpedia();
        this.edit.setFocus();
    }

    onKeyBoardHide(data: any) {

        this.edit.fontColor = new cc.Color(0, 0, 0, 255);
        this.scheduleOnce(() => {
            this.updateEditBoxLb(this.edit.string);
        }, 0.5);
        if (!this.emojiKeyboard.active) {
            this.chgCurShowInputTypeBt(1);
            this.bottomBtsNode.y = this.orgBottomY;
            this.filler.parent = this.node;
        }
    }

    onEditTextChg() {
        if (this.edit.string != "") {
            this.chgSendButtonStatus(false);
        } else {
            this.chgSendButtonStatus(true);
        }
    }

    onKeyBoardShow() {
        this.hideEmojpedia();
        this.chgCurShowInputTypeBt(1);
    }

    initEmojClickEvent() {
        for (const emj of agentUtil.allEmoji) {
            let xItem = cc.instantiate(this.emjBtItem);
            xItem.getComponentInChildren(cc.Label).string = emj;
            if (this.emjPage1.childrenCount < 20) {
                this.emjPage1.addChild(xItem);
            } else {
                this.emjPage2.addChild(xItem);
            }
        }
    }
    onclickEmoj(event: cc.Event, customData: string) {
        this.edit.string = this.edit.string + event.target.getComponentInChildren(cc.Label).string;
        this.updateEditBoxLb(this.edit.string);
        this.chgSendButtonStatus(false);
    }

    updateEditBoxLb(content: string) {
        this.editBoxTestLb.string = content;
        if (this.editBoxTestLb.node.width > 438) {
            this.edit.node.getChildByName("TEXT_LABEL").getComponent(cc.Label).horizontalAlign = cc.Label.HorizontalAlign.RIGHT;
        } else {
            this.edit.node.getChildByName("TEXT_LABEL").getComponent(cc.Label).horizontalAlign = cc.Label.HorizontalAlign.LEFT;
        }
    }

    /**
     * 更改输入框右边的按钮的类型
     * @param type 1=表情 2=普通键盘
     */
    chgCurShowInputTypeBt(type: number) {
        this.emojBt.active = type === 1;
        this.keyboardBt.active = type === 2;
    }

    onClickCloseBt() {
        if (!this.isChangeInterfaceOrientations) {
            agentUtil.changeInterfaceOrientations('2');
        }
    }

    showAgentConfirm(content: string, showCancle: boolean = false) {

        if (this.filler.parent === this.node) {
            this.agentConfirm.y = 0;
        } else {
            this.agentConfirm.y = 100;
        }
        // this.agentConfirmLabel.string = content;
        this.agentConfirmOkFunc = undefined;
        this.agentConfirm.active = true;
        this.agentConfirmCancleBt.active = showCancle;
    }

    onClcikAgentConfirmDefine() {
        this.agentConfirm.active = false;
        if (this.agentConfirmOkFunc) {
            this.agentConfirmOkFunc();
        }
    }
    onClcikAgentConfirmCancle() {
        this.agentConfirm.active = false;
    }

    /**
     * 手动关闭键盘
     */
    onClickManualHideKeyBoard() {
        // console.log("------manualHideKeyBoard-----");
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
     * 主动清理原生输入框内容
     */
    onClickClearTextField() {
        console.log("------onClickClearTextField-----");
        if (cc.sys.os === cc.sys.OS_IOS) {
            if (window.jsclass !== undefined) {
                JsClass.clearTextField();
            } else {
                jsb.reflection.callStaticMethod("NativeUtil", "clearTextField");
            }
        } else if (cc.sys.os === cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod("util/NativeUtil", "clearTextField", "()V");
        }
    }

    // 原生在弹起键盘后的回调
    adaptiveKeyboardHight(scale: number) {
        if (this.reportInfo && this.reportInfo.active) {
            return;
        }
        if (this.emojiKeyboard.active) {    // emoji 适配
            return;
        }
        this.edit.fontColor = new cc.Color(0, 0, 0, 0);
        // this.edit.fontColor = new cc.Color(0, 0, 0, 0);
        this.updateEditBoxLb(this.edit.string);


        let realChgHgt;
        // let realChgHgt = 1136 * scale;
        //  orgBottomY已经适配过一次 下方的高度了。 键盘高度会再加一次。 所以要减去一次   太过于贴近，加5
        // let realChgHgt = this.adaptationHeight * scale - this.adaptationBottomBarH;
        let isSupportNewAgentChat = util.getStatusBarHeighet(); // 旧版兼容
        if (isSupportNewAgentChat) {
            realChgHgt = this.adaptationHeight * scale - this.adaptationBottomBarH;
        } else {
            realChgHgt = 1136 * scale;
            if (util.isIphoneX()) {
                realChgHgt -= 15;
            }
        }
        // if (cc.sys.os === cc.sys.OS_ANDROID) {
        //     let size = cc.view.getFrameSize();
        //     // console.log("-bycc1---h----" + size.height + "-------w-----", size.width);
        //     let hpG = (size.height * scale - (size.height - size.width / 640 * 1136) / 2) * 640 / size.width;
        //     // console.log("-bycc----hpg-", hpG);
        //     realChgHgt = hpG;
        // }
        // console.log("----realChgHgt------", realChgHgt);
        this.keyBoardHight = realChgHgt;
        this.scheduleOnce(() => {
            this.bottomBtsNode.y = this.orgBottomY + realChgHgt;
        }, 0);
        // cc.log("------realChgHgt--", realChgHgt);
        this.onShowKeyBoardScrollViewAdaptive(realChgHgt);
    }

    /**
     * 当显示键盘的时候，滚动视图适应
     */
    onShowKeyBoardScrollViewAdaptive(height: number) {

        // cc.log("------onShowKeyBoardScrollViewAdaptive--");
        if (cc.sys.os === cc.sys.OS_IOS) {     // 某些安卓机型 点击下拉键盘会隐藏，这时也要进行适配
            if (height === 0) return;
        }
        this.scheduleOnce(() => {
            this.filler.height = height;
            this.filler.parent = this.contentNode;
            this.filler.zIndex = 999;
            this.scheduleOnce(() => {
                if (this.contentNode.height > this.scrollView.node.height) {
                    this.scrollView.scrollToBottom();
                }
            }, 0);
        }, 0);  // 在下一帧执行  否则contentNode的高度没有刷新

    }

    setKeyBoarHightCallBack() {
        let callback = `if(cc.find('Canvas/parent/agentRecharge'))
        cc.find('Canvas/parent/agentRecharge').getComponent('agentRecharge').adaptiveKeyboardHight(%f);`;
        if (cc.sys.os === cc.sys.OS_IOS) {
            if (window.jsclass !== undefined) {
                JsClass.setKeyBoarHightCallBack(callback);
            } else {
                jsb.reflection.callStaticMethod("NativeUtil", "setKeyBoarHightCallBack:", callback);
            }
        } else if (cc.sys.os === cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod("util/NativeUtil", "setKeyBoarHightCallBack", "(Ljava/lang/String;)V", callback);
        }
    }

    setKeyBoardReturnType() {
        if (cc.sys.os != cc.sys.OS_ANDROID) {
            this.edit.returnType = cc.EditBox.KeyboardReturnType.SEND;
        }
    }

    initReportLayout() {
        let lastIndex = this.reportLayout.node.childrenCount - 1;
        this.reportLayout.node.children[lastIndex].getComponent(cc.Toggle).isChecked = true;
        this.curReportIndx = 0;
    }

    onClickOtherReportItem(event: cc.Event, customData: string) {
        this.curReportIndx = +customData;
    }

    /**
     * 代充屏幕适配
     */
    screenAdaptation() {
        if (!util.getStatusBarHeighet()) {
            console.log("不支持屏幕适配");
            return;
        }
        let canvas = cc.find('Canvas');
        let canvasWidth = canvas.width;
        let canvasHeight = canvas.height;
        let scale = canvasWidth / this.fmsize.width;
        let tmpH = scale * this.fmsize.height;

        this.adaptationHeight = tmpH;
        let barHeight = util.getStatusBarHeighet();
        let tmpBarH = tmpH * barHeight;  // 状态栏的高度

        let bottomHighet = util.getTabbarSafeBottomMargin();
        let tmpBottomBarH = tmpH * bottomHighet;  // 底部圆形区域的高度
        this.adaptationBottomBarH = tmpBottomBarH;

        this.bottomBarBg.height = this.adaptationBottomBarH;
        this.bottomBarBg.y = -tmpH / 2;

        this.showEmojiY = -tmpH / 2 + 300 + tmpBottomBarH;

        this.orgBottomY = -tmpH / 2 + tmpBottomBarH;
        this.bottomBtsNode.y = this.orgBottomY;
        this.tipNode.parent.y = this.orgBottomY;

        this.topNode.y = tmpH / 2 - tmpBarH;
        this.scrollView.node.y = this.topNode.y - this.topNode.height;

        this.scrollView.node.height = tmpH - tmpBarH - this.topNode.height - tmpBottomBarH - this.bottomBtsNode.height;
        this.scrollView.node.getChildByName("view").height = this.scrollView.node.height;
        this.toBottomBt.y = -this.scrollView.node.height + 30;
        this.payInfoBox.y = this.payInfoBox.y + (this.topNode.y - this.orgTopY);
    }

    /**
     * 增加安卓手机返回键监听
     */
    addAndroidBackListen() {
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onClickAndroidBack, this);
    }

    onClickAndroidBack() {
        if (this.payInfo.active) {
            this.payInfo.active = false;
            this.payInfoMaskbg.active = false;
        } else {
            cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onClickAndroidBack, this);
            this.onClickCloseBt();
            this.closeAction();

        }
    }


    showAgentTip(content: string) {
        this.agentTipNode.stopAllActions();
        this.agentTipNode.opacity = 0;
        this.agentTipContentLabel.string = content;
        //this.agentTipNode.runAction(cc.sequence(cc.fadeIn(0.5), cc.delayTime(1.5), cc.fadeOut(0.5)));
        cc.tween(this.agentTipNode)
            .to(0.5, { opacity: 255 })
            .delay(1.5)
            .to(0.5, { opacity: 0 })
            .start();
    }
    /**
     *
         * 创建一个分割线
         */
    creatDividingLineItme() {
        let dingLineItme = cc.instantiate(this.dividingLine);
        dingLineItme.active = true;
        this.contentNode.addChild(dingLineItme);
    }

}
