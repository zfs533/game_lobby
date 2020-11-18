import * as util from "../../common/util";
import agentUtil from ".././agentUtil"
import Lobby from ".././lobby";
import g from "../../g";
import { showTip, hideLoading, showConfirm, showLoading } from "../../common/ui"
import CsPlatChatItem from "./csPlatChatItem";
import CsPlatEvalItem from "./csPlatEvalItem";
import CsPlatListItem from "./csPlatListItem";
import user from "../../common/user";

let Decimal = window.Decimal;
const { ccclass, property } = cc._decorator;


// 客服平台协议
const enum EVENT_MAP {
    ON_DENIED_CONNECTION = "2000", // 拒绝链接，如 被禁言
    ON_PLAYER_INCOME = "2001", // 推送用户信息到客服端
    ON_RECVEIVED_SERVICER_INFO = "2002", // 推送客服信息到用户端
    ON_RECEIVED_MESSAGE = "2003", // 接收消息
    ON_RECEIVED_CHAT_LIST = "2005", // 推送正在聊天的会话
    ON_READ_CHAT = "2006", // 已读消息
    ON_RECEIVED_MESSAGE_LIST = "2008", // 推送消息列表
    ON_END_CHAT = "2009", // 客服结束服务
    ON_NEED_QUEUE = "2010", // 需要排队
    ON_INPUT_NOW = "2012", // 监听对方输入状态
    ON_PLAYER_INFO = "2013", // 玩家信息

    ON_SEND_MESSAGE = "1003", // 发送消息
    ON_SEND_READED = "1006", // 发送消息已读状态
    ON_SEND_MESSAGE_LIST = "1008", // 拉取历史消息
    ON_FORBIDDEN_CHAT = "1010", // 玩家被禁言
    ON_SEND_EVA = "1011",   // 发送评价服务
    ON_SEND_INPUT = "1012", // 发送输入状态
    ON_RECEIVED_HEART = "3001", // 接收服务器心跳
    ON_WAITER_OUTLINE = "4002", // 客服掉线
    ON_EVA_OUTTIME = "4003", // 评价超时

}

// 玩家信息
interface playerInfoMsg {
    id: string,             // 玩家id
    username: string,       // 玩家用户名
    avatar: string,         // 玩家头像 如 https://a.com/b.jpg
    platId: string,         // 平台ID
    platName: string,       // 平台名称
}

// 客服信息
interface waiterInfoMsg {
    id: string,             // 客服id
    username: string,       // 客服名称
    time: string,           // 时间
    declaration: string,    // 客服宣言
    sessionId: string,      // 会话id
    avatar: string,         // 客服头像 如 https://a.com/b.jpg
}

// 收发消息
export interface platFormatMsg {
    time: number,           // 消息发送时间(秒) 如 1565433448
    text: string,           // 消息内容
    photo: string[],        // 图片地址数组 如 ['b.jpg'] text 和 photo 的内容只会有一个存在值(key字段必须存在),以此区分文字消息和图片消息;
    targetId: string,       // 接受人ID
    senderId: string,       // 发送着ID
    messageId: string,      // 消息ID(p-会话创建时间后8位) 如 p-10223361 ,以后每次累加1;
    sessionId: string,      // 会话ID
    isRead?: boolean,       // 是否已读
    username: string,       // 发送者昵称
    type: number,           // 用于区分本条消息是从客服到玩家还是玩家到客服, 客服消息：1，用户消息：2， 系统消息：3
}

// 发送历史消息
interface sendHistoryMsg {
    id: string,             // 用户id
    platId: string,         // 平台AppId
    currentSessionId: string,   // 当前会话Id
}

// 接收历史消息
interface receivedHistoryMsg {
    sessionId: string,              // 会话ID
    time: number,                   // 会话创建时间
    msgs: platFormatMsg[],          // 消息
}

// 还原本次消息
interface revertChatMsg extends waiterInfoMsg {
    msgs: platFormatMsg[],      // 消息
    isFreezed: boolean          // 是否被禁言
}

// 已读消息
interface readedMsg {
    senderId: string,
    targetId: string,
    sessionId: string,
    msgs: string[],
}

// 禁言消息
interface bannedMsg {
    reason: string,
    userId: string,
    time: number,
    opUserId: string,
    type: number,   // 1: 禁言 2: 解除
}

// 聊天结束消息
interface chatEndMsg {
    senderId: string,
    targetId: string,
    content: string,
    sessionId: string,
}

// 评价服务消息
export interface evaluationMsg {
    score: number,
    sessionId: string,
    content?: string,
}

// 客服掉线消息
interface waiterOutlineMsg {
    waiterId: string,
    time: number,
    notice: string,
    waiterName: string,
}

@ccclass
export default class CustomerServicePlat extends cc.Component {
    @property(cc.Sprite)
    ctmSvIcon: cc.Sprite = undefined;   // 客服头像

    @property(cc.Label)
    csTypeLb: cc.Label = undefined;   // 客服小妹  还是  vip客服

    @property(cc.Label)
    announceName: cc.Label = undefined;   // 宣言的名字

    @property(cc.Label)
    announceContent: cc.Label = undefined;   // 宣言的内容

    @property(cc.Label)
    lblWaiterInputStatus: cc.Label = undefined;   // 客服输入状态

    @property(CsPlatChatItem)
    leftItem: CsPlatChatItem = undefined;  // 左边说话

    @property(CsPlatChatItem)
    rightItem: CsPlatChatItem = undefined;  // 右边说话

    @property(cc.Node)
    evaluationNode: cc.Node = undefined;  // 评价的弹窗

    @property(cc.Node)
    contentNode: cc.Node = undefined;  // 整个聊天的滚动视图

    @property(cc.EditBox)
    edit: cc.EditBox = undefined;  // 聊天的输入框

    @property(cc.EditBox)
    evalautionEdit: cc.EditBox = undefined;  // 评价的输入框

    @property(cc.Label)
    timeLb: cc.Label = undefined;  // 聊天时间

    @property(cc.Node)
    bottomBtsNode: cc.Node = undefined;  // 需要在键盘弹起时，刷新Y坐标的节点

    @property(cc.Node)
    bottomInputBannerNode: cc.Node = undefined;  // 键盘输入栏

    @property(cc.Node)
    filler: cc.Node = undefined;   // 用于弹起键盘后 给scrollview填充

    @property(cc.ScrollView)
    chatScrollView: cc.ScrollView = undefined;

    @property(cc.Label)
    bannedTipLb: cc.Label = undefined;

    @property(cc.Node)
    emjBtItem: cc.Node = undefined; // 表情

    @property(cc.Node)
    emjiBtn: cc.Node = undefined;   // 表情按钮

    @property(cc.Node)
    keyboardBtn: cc.Node = undefined;   // 键盘按钮

    @property(cc.Node)
    evaluationItem: cc.Node = undefined;   // 评价系统

    @property(cc.Node)
    emojBt: cc.Node = undefined;   // 点击出现表情键盘的按钮

    @property(cc.Node)
    emojiKeyboard: cc.Node = undefined;

    @property([cc.Node])
    emojPages: cc.Node[] = [];

    @property(cc.Node)
    cbBotBtn: cc.Node = undefined; //底部回弹按钮

    @property(cc.Label)
    messgerContLabel: cc.Label = undefined; //未读消息Label

    @property(cc.Node)
    listItem: cc.Node = undefined;

    @property(cc.Label)
    editBoxTestLb: cc.Label = undefined;    // 假的输入框（2.0.9特有）

    @property(cc.Node)
    topNode: cc.Node = undefined;    // 需要进行屏幕适配的，上方的节点

    @property(cc.Node)
    bottomBarBg: cc.Node = undefined;    // 下方虚拟按键的背景

    @property(cc.Node)
    addImage: cc.Node = undefined;      // 发送图片按钮节点

    @property(cc.Node)
    sendBt: cc.Node = undefined;      // 发送消息按钮节点

    private messgerCont: number = 0; //未读消息条数

    private tmpSp: cc.SpriteFrame = undefined;  // 临时储存的 精灵
    private timeout: number = 15000;

    private tmpPath: string = "";
    private pngNumber: number = 0;
    private picAddrss: string = "";

    private showCopyBt: boolean = false;   // 是否显示复制按钮
    private banned: boolean = false;  //  玩家是否被禁言
    private evaluation: number = 2;  // 玩家选择的评价类型
    private lastTime: number = 0;
    private orgBottomY: number = 0;
    private orgTopY: number = 568;
    private showEmojiY: number = -268;  // 展示表情键盘时，键盘的Y坐标
    private adaptationHeight: number = 1136;
    private adaptationBottomBarH: number = 0;
    private keyBoardHight: number = 0;
    private fmsize: cc.Size = undefined;
    private rtsize: cc.Size = undefined;
    public tLobby: Lobby = undefined;
    private senderId: string = "";
    private targetId: string = "";
    private messageId: string = "";
    private messageIdList: string[] = [];
    private sessionId: string = "";
    private userName: string = "";
    private platId: string = "";
    private platName: string = "";
    private isGetHistory: boolean = false;  // 仅能拉取一次历史消息
    private tempPicName: string = "";
    private playerEditNowTime: number = 0;  // 标记玩家开始编辑的时间
    private playerEditIntervalTime: number = 5 * 1000;      // 玩家发送输入状态的检测间隔，消息节流处理
    private nowServerIsEnd: boolean = false;    // 本次会话是否结束
    private evaluationSrc: CsPlatEvalItem = undefined;
    public connUrl: string = "";    // 客服平台链接地址
    private isWaiting: boolean = false;   // 玩家是否在排队

    onLoad() {
        showLoading("客服分配中...");
        this.playerEditNowTime = Date.now()
        this.initScrollViewTouchEvent();
        this.fmsize = cc.view.getFrameSize();
        this.rtsize = cc.view.getDesignResolutionSize();
        this.tLobby = cc.find('lobby').getComponent(Lobby);

        // 初始化 图片暂存地址
        if (cc.sys.isNative) {
            this.picAddrss = jsb.fileUtils.getWritablePath() + "ctmtmp.jpg";
        }

        this.orgTopY = this.topNode.y;
        this.orgBottomY = this.bottomBtsNode.y;
        this.emojiKeyboard.active = false;
        this.keyboardBtn.active = false;

        //初始化表情
        this.initEmojClickEvent();
        this.chgCurShowInputTypeBt(1);
        this.setKeyBoarHightCallBack();
        this.setKeyBoardReturnType();
        this.screenAdaptation();

        this.contentNode.children.forEach(el => {
            if (el.active) el.active = false;
        });
    }

    onEnable() {    // 预制不销毁，保存聊天记录，再次激活时进行相关适配操作
        this.fmsize = cc.view.getFrameSize();
        this.rtsize = cc.view.getDesignResolutionSize();
        this.setKeyBoarHightCallBack();
        this.screenAdaptation();
        this.chatServiceHandShake(this.connUrl);
        if (window.kefu.socketReadyState() === 1) this.sendReadedStatus();
    }

    addExtraListeners() {
        // console.log("plat  ---addExtraListeners----");
        let pomelo = window.kefu;
        pomelo.on(EVENT_MAP.ON_FORBIDDEN_CHAT, this.playerIsBanned.bind(this));  // 服务器拒绝连接,如用户被客服禁言。
        pomelo.on(EVENT_MAP.ON_DENIED_CONNECTION, this.initPlayerBanned.bind(this));  // 用户被客服禁言。
        pomelo.on(EVENT_MAP.ON_RECVEIVED_SERVICER_INFO, this.initWaiterInfo.bind(this));  // 当玩家匹配到客服后,平台服务端推送本协议内容到客户端。
        pomelo.on(EVENT_MAP.ON_RECEIVED_CHAT_LIST, this.revertCurChatContent.bind(this));   // 推送正在聊天的会话,用于还原本次未结束的会话
        pomelo.on(EVENT_MAP.ON_RECEIVED_MESSAGE, this.receivedMessage.bind(this));  // 当收到新消息时,服务端会推送此协议内容。
        pomelo.on(EVENT_MAP.ON_READ_CHAT, this.waiterReadedMsg.bind(this));  // 服务端推送已读消息ID到客户端。
        pomelo.on(EVENT_MAP.ON_RECEIVED_MESSAGE_LIST, this.receivedHistoryMsg.bind(this));  // 服务端推送用户上次聊天记录。
        pomelo.on(EVENT_MAP.ON_END_CHAT, this.chatServiceEnd.bind(this));  // 当客服结束服务时,客户端将收到本协议。
        pomelo.on(EVENT_MAP.ON_NEED_QUEUE, this.playerIsWaiting.bind(this));  // 当没有空闲客服时,客户端将会收到本协议。
        pomelo.on(EVENT_MAP.ON_INPUT_NOW, this.onWaiterInputing.bind(this));  // 客服正在输入文字时会推送本协议到客户端。
        pomelo.on(EVENT_MAP.ON_WAITER_OUTLINE, this.onWiaterOuline.bind(this));  // 客服正在输入文字时会推送本协议到客户端。
        pomelo.on(EVENT_MAP.ON_EVA_OUTTIME, this.onEvaOutTime.bind(this));  // 客服结束服务超时未评价则自动默认评价时推送本协议到客户端。
        // pomelo.on("3001", this.heartbeatTimeout.bind(this));  // 服务端主动心跳。
        pomelo.on("heartbeat timeout", this.heartbeatTimeout.bind(this)); // 客户端pomelo心跳。
    }
    removeExtraListeners() {
        // console.log("plat  ---removeExtraListeners----");
        let pomelo = window.kefu;
        pomelo.off(EVENT_MAP.ON_FORBIDDEN_CHAT);
        pomelo.off(EVENT_MAP.ON_DENIED_CONNECTION);
        pomelo.off(EVENT_MAP.ON_RECVEIVED_SERVICER_INFO);
        pomelo.off(EVENT_MAP.ON_RECEIVED_MESSAGE);
        pomelo.off(EVENT_MAP.ON_READ_CHAT);
        pomelo.off(EVENT_MAP.ON_RECEIVED_MESSAGE_LIST);
        pomelo.off(EVENT_MAP.ON_END_CHAT);
        pomelo.off(EVENT_MAP.ON_NEED_QUEUE);
        pomelo.off(EVENT_MAP.ON_INPUT_NOW);
        pomelo.off(EVENT_MAP.ON_WAITER_OUTLINE);
        pomelo.off(EVENT_MAP.ON_EVA_OUTTIME);
        pomelo.off("heartbeat timeout");
    }

    onDestroy() {
        agentUtil.changeInterfaceOrientations("2");
        this.removeExtraListeners();
        window.kefu.off();
        window.kefu.disconnect();
    }

    /**
     * 收到客服信息
     * @param data
     */
    private initWaiterInfo(data: waiterInfoMsg) {
        // console.log("****收到客服信息****  ", data);
        showTip("分配客服成功！");
        this.banned = false;
        this.isWaiting = false;
        this.chgBannedTipShowState(false, false);
        this.targetId = data.id;
        this.sessionId = data.sessionId;
        if (data.avatar) this.loadUrlPng(data.avatar, true);
        this.announceContent.string = data.declaration;
        this.csTypeLb.string = (data.username ? data.username : this.csTypeLb.string) + ":";
        this.announceName.string = (data.username ? data.username : this.csTypeLb.string) + ":";
    }

    /**
     * 还原当前会话内容
     * @param remoteUrl
     * @param isAvatar
     * @param item
     */
    private async revertCurChatContent(data: { list: revertChatMsg[] }) {
        // console.log("****还原当前会话内容****  ", data.list[0]);
        showLoading();
        let chatData = data.list[0];        // 自己的消息默认是第一条
        if (chatData && chatData.msgs && chatData.msgs.length > 0) {
            for (let i = 0; i < chatData.msgs.length; i++) {
                let zOrder = -chatData.msgs.length + i;
                let content = chatData.msgs[i];
                if (content.senderId !== this.senderId/* content.type === 1 */) {           // type = 1，表示客服发送的消息
                    await this.createOneLeftItem(content, zOrder);
                    if (content.messageId) this.messageIdList.push(content.messageId);
                } else if (content.senderId === this.senderId/* content.type === 2 */) {    // type = 2，表示玩家发送的消息
                    await this.createOneRightItem(content, true, zOrder);
                }
            }
        }
        this.sendReadedStatus();
        hideLoading();
    }

    /**
     * 载入远端图片
     * @param remoteUrl 远端图片url地址
     * @param isAvatar 是否为客服头像
     * @param item 聊天气泡
     */
    loadUrlPng(remoteUrl: string, isAvatar: boolean, item?: CsPlatChatItem) {
        let self = this;
        cc.loader.load({ url: remoteUrl, type: 'jpeg' }, function (error: any, spriteFrame: cc.Texture2D) {
            if (!error) {
                let sp = new cc.SpriteFrame(spriteFrame);
                if (isAvatar) self.ctmSvIcon.spriteFrame = sp;
                else item.setImage(sp);
            } else {
                showTip("加载图片失败，请重试!");
                console.log("----加载图片 error-----", error);
            }
        });
    }

    /**
     * 点击发送按钮
     */
    onClickSendMsgBt() {
        // this.uploadPicture(this.bianrDataBase64);  // web测试使用
        if (!this.edit.string || this.edit.string === "") {
            showTip("发送消息不能为空！");
            return;
        }
        let time = this.getSecondsTime();
        this.messageId = this.getMessageId();
        let sendMsgId = "p-" + this.messageId;
        let isRead: boolean;
        let senddata: platFormatMsg = {
            type: 2,
            time: time,
            text: this.edit.string,
            photo: [],
            senderId: this.senderId,
            targetId: this.targetId,
            messageId: sendMsgId,
            sessionId: this.sessionId,
            username: this.userName,
        };
        this.sendMessage(senddata);
        this.edit.string = "";
        this.onClickClearTextField();
        this.chgSendButtonStatus(true);
    }

    /**
     * 发送消息数据
     * @param sendData
     * @param isclearEdit
     */
    async sendMessage(sendData: platFormatMsg, isclearEdit: boolean = true) {
        if (this.banned) {
            showTip("您已被禁言！请稍后重试！");
            return;
        }

        let chatItem = await this.createOneRightItem(sendData, false);
        if (window.kefu.socketReadyState() > 1) {
            showTip("网络连接失败，请退出重连！");
            chatItem.getComponent(CsPlatChatItem).setLoseNodeVisbel(true);
            return;
        }

        window.kefu.notify(EVENT_MAP.ON_SEND_MESSAGE, sendData);
    }

    /**
     * 收到客服发送的消息
     * @param data
     */
    receivedMessage(data: platFormatMsg, isCloes?: boolean) {
        // console.log("****客服发送的消息****  ", data);
        if (data.messageId) this.messageIdList.push(data.messageId);
        if (!this.node.active) {
            if (this.tLobby && this.tLobby.node.active) {
                this.tLobby.showMessagePrompt(true);
            } else {
                if ((data.photo && data.photo.length > 0) || data.text) {
                    util.setIsMessger(true);
                }
            }
        } else {
            this.sendReadedStatus();  // 当收到客服消息，且该界面显示状态，则认为玩家已读消息
        }

        this.createOneLeftItem(data);
    }

    /**
     * 发送已读消息
     * @param data
     */
    sendReadedStatus() {
        if (!this.sessionId) return;
        let sendMsg = {
            senderId: this.senderId,
            targetId: this.targetId,
            sessionId: this.sessionId,
            msgs: this.messageIdList,
        }
        window.kefu.notify(EVENT_MAP.ON_SEND_READED, sendMsg);
        this.messageIdList = [];
    }

    /**
    * 客服已读消息
    * @param data
    */
    private waiterReadedMsg(data: readedMsg) {
        // console.log("****客服已读消息****  ", data);
    }

    /**
    * 客服输入中状态
    * @param data
    */
    private onWaiterInputing(data: any) {
        // console.log("****客服输入中****  ", data);
        this.lblWaiterInputStatus.string = "客服输入中...";
        this.scheduleOnce(() => {
            this.lblWaiterInputStatus.string = "在线客服";
        }, 3);
    }

    /**
    * 发送玩家输入中状态
    * @param data
    */
    private onPlayerInputing() {
        // console.log("****玩家输入中****  ");
        if ((Date.now() - this.playerEditNowTime) > this.playerEditIntervalTime) {
            this.playerEditNowTime = Date.now();
            let sendData = {
                senderId: this.senderId,
                targetId: this.targetId,
            }
            // console.log("****玩家输入中****  节流处理");
            window.kefu.notify(EVENT_MAP.ON_SEND_INPUT, sendData);
        }
    }

    /**
     * 收到服务器排队消息
     * @param data
     */
    playerIsWaiting(data: { waitCount: number }) {
        // console.log("****收到服务器排队消息****  ", data);
        let listItem = cc.instantiate(this.listItem);
        listItem.active = true;
        let listSp = listItem.getComponent(CsPlatListItem);
        listSp.setMessgeAction(data);
        this.contentNode.addChild(listItem);
        this.isWaiting = true;
    }

    /**
     * 收到历史聊天记录
     * @param data
     */
    async receivedHistoryMsg(data: receivedHistoryMsg) {
        // console.log("****收到上次聊天记录****  ", data);
        if (data && data.msgs) {
            for (let i = 0; i < data.msgs.length; i++) {
                let zOrder = -data.msgs.length + i;
                let chatData = data.msgs[i]
                if (chatData.type === 1) {  // type = 1，表示客服发送的消息
                    await this.createOneLeftItem(chatData, zOrder);
                } else if (chatData.type === 2) {   // type = 2，表示玩家发送的消息
                    await this.createOneRightItem(chatData, true, zOrder);
                }
            }
            this.isGetHistory = true;
            this.unschedule(this.historyMessageCtr);
        }
        hideLoading();
    }

    /**
     * 聊天服务结束
     * @param data
     */
    chatServiceEnd(data: chatEndMsg) {
        // console.log("****聊天服务结束****  ", data);
        this.chgBannedTipShowState(false, true, "本次服务已结束，请评价。");
        showConfirm(data.content);
        this.onClickManualHideKeyBoard();
        this.createEvaluationItem();
        this.nowServerIsEnd = true;
        this.edit.string = "";
        this.onClickClearTextField();
    }

    /**
     * 提交评价
     * @param content 评价内容
     * @param str 评价内容
     */
    sendEvaluation(content: string, score: number) {
        // console.log("****发送评价信息****  ", content, score);
        let sendData: evaluationMsg = {
            sessionId: this.sessionId,
            content: content,
            score: score,
        }
        window.kefu.notify(EVENT_MAP.ON_SEND_EVA, sendData);
    }

    /**
     * 初次连接时玩家禁言
     * @param data
     */
    initPlayerBanned(data: { type: number, time: number }) {
        // console.log("****初次连接时玩家禁言****  ", data);
        // let bannedTime = util.formatTimeStr('s', data.time * 1000)
        if (data.type != 1) return;
        this.chgBannedTipShowState(true, true, `客服MM忙线中··  忙线倒计时：`, data.time);
    }

    /**
     * 用户被中途禁言
     * @param data
     */
    playerIsBanned(data: bannedMsg) {
        // console.log("****用户被中途禁言****  ", data);
        let content = data.type === 1 ? "客服MM忙线中··" : "客服MM已空闲，很高兴为您服务~"
        let confirm = showConfirm(content);
        this.onClickManualHideKeyBoard();
        let self = this;
        if (data.type === 1) {
            confirm.okFunc = () => {
                self.chgBannedTipShowState(true, true, "客服MM忙线中··  忙线倒计时：", data.time);
            };
        } else if (data.type === 2) {
            confirm.okFunc = () => {
                self.chgBannedTipShowState(true, false);
            };
        }
    }

    refreshTime: Function;
    /**
     * 输入栏提示状态处理
     * @param isBanned 是否为禁言
     * @param isShow 是否显示
     * @param content 提示内容
     */
    chgBannedTipShowState(isBanned: boolean, isShow: boolean, content?: string, time?: number) {
        let self = this;
        this.unschedule(this.refreshTime);
        this.refreshTime = function () {
            let curTime = self.getSecondsTime();
            let countdownTime = time - curTime;
            if (countdownTime <= 0) {
                self.unschedule(self.refreshTime);
                return;
            }
            let aa = util.getCountDownTime(countdownTime);
            let countdown = aa.hours + ":" + aa.mins + ":" + aa.secs;
            self.bannedTipLb.string = content ? content + countdown : "客服MM忙线中··";
        }
        if (isShow) {
            this.bannedTipLb.node.parent.active = true;
            if (time) {
                this.refreshTime();
                this.schedule(this.refreshTime, 1);
            } else {
                this.bannedTipLb.string = content ? content : "";
            }
            this.edit.placeholder = "";
        } else {
            this.unschedule(this.refreshTime);
            this.bannedTipLb.node.parent.active = false;
            this.edit.placeholder = "";
            this.bannedTipLb.string = content ? content : "";
        }
        if (isBanned) this.banned = isShow;
    }

    /**
     * 获取历史消息
     * @param isShow
     * @param content
     */
    getHistoryMessage() {
        let sendData: sendHistoryMsg = {
            id: this.senderId,
            platId: this.platId,
            currentSessionId: this.sessionId,
        }
        window.kefu.notify(EVENT_MAP.ON_SEND_MESSAGE_LIST, sendData);
    }

    /**
     * 客服掉线
     */
    onWiaterOuline(data: waiterOutlineMsg) {
        let content = data.notice ? data.notice : "当前客服已掉线，请稍后再试！";
        showConfirm(content);
        hideLoading();
        this.createEvaluationItem();
        this.nowServerIsEnd = true;
        this.edit.string = "";
        this.onClickClearTextField();
        this.onClickManualHideKeyBoard();
    }

    /**
     * 超时自动评价
     */
    onEvaOutTime() {
        if (this.nowServerIsEnd) {
            this.evaluationSrc.onClickSendBunttoAction()
        } else {
            this.chgBannedTipShowState(false, true, "服务超时，请关闭当前界面重新匹配。")
            this.hideEditBoxNode(false);
        }
    }

    /**
     * 键盘按钮点击事件
     */
    onClickKeyboadBtn() {
        this.hideEmojpedia();
        this.edit.setFocus();

        // this.edit.returnType = 6;
        // this.keyboardBtn.active = false;
        // this.emjiBtn.active = true;
    }

    /**
     * 点击表情按钮
     */
    onClickEmojiKeyBordBtn() {
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

    /**
     * 更改输入框右边的按钮的类型
     * @param type 1=表情 2=普通键盘
     */
    chgCurShowInputTypeBt(type: number) {
        this.emojBt.active = type === 1;
        this.keyboardBtn.active = type === 2;
    }

    /**
     * 隐藏表情键盘
     */
    hideEmojpedia() {
        cc.director.getActionManager().removeAllActionsFromTarget(this.emojiKeyboard, true);
        this.emojiKeyboard.active = false;
        this.emojiKeyboard.y = -700;
        this.bottomBtsNode.y = this.orgBottomY;
        this.filler.parent = this.node
        this.chgCurShowInputTypeBt(1);
    }

    /**
     * 点击表情键盘里面的表情
     * @param event
     * @param customData
     */
    onClickEmoji(event: cc.Event, customData: string) {
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

    initEmojClickEvent() {
        for (const emj of agentUtil.allEmoji) {
            let xItem = cc.instantiate(this.emjBtItem);
            xItem.getComponentInChildren(cc.Label).string = emj;
            if (this.emojPages[0].childrenCount < 20) {
                this.emojPages[0].addChild(xItem);
            } else {
                this.emojPages[1].addChild(xItem);
            }
        }
    }

    /**
     * 历史消息
     * @param data
     */
    chatMsgHistory(data: any) {
        cc.log("plat ---chatMsgHistory--", data);
    }

    scrollviewToBottom() {
        if (this.contentNode.height > this.chatScrollView.node.height) this.chatScrollView.scrollToBottom();
        this.cbBotBtn.active = false;
    }

    // 创建一个 客服说话的聊天内容
    createOneLeftItem(data: platFormatMsg, zIndex?: number) {
        return new Promise(async reslove => {
            // console.log("plat -----createOneLeftItem----", data);
            let leftItem = this.leftItem;
            leftItem.resetChatLabel();
            leftItem.chatLb.node.active = true;
            let name = data.type === 3 ? "系统消息：" : this.csTypeLb.string;
            leftItem.setCtmSvNameLabel(name);

            if (data.photo && data.photo.length > 0) {  // 图片
                leftItem.image.node.active = true;
                leftItem.chatLb.node.active = false;
            } else {  // 文字
                leftItem.image.node.active = false;
                leftItem.chatLb.node.active = true;
            }

            leftItem.setChatMessger(data);
            this.createTimeLabel(data.time);
            // leftItem.setChatMessger(data);
            leftItem.resetCopyBtShow(this.showCopyBt);
            let nLeftItem = cc.instantiate(leftItem.node);
            let chatItem = nLeftItem.getComponent(CsPlatChatItem);
            if (data.photo && data.photo.length > 0) {
                let remoteUrl = g.customerFileServerUrl + "/" + data.photo[0];
                // console.log("******createOneLeftItem******22222 ", remoteUrl);
                this.loadUrlPng(remoteUrl, false, chatItem);
            }
            chatItem.adaptiveChatLabel(2);
            nLeftItem.active = true;
            if (zIndex) nLeftItem.zIndex = zIndex;
            this.contentNode.addChild(nLeftItem);

            let maxOffset = this.chatScrollView.getMaxScrollOffset();
            let nowOffset = this.chatScrollView.getScrollOffset();
            let scroViewHeight = this.chatScrollView.node.getContentSize().height;
            if ((maxOffset.y - nowOffset.y) < scroViewHeight / 2) {
                this.scrollviewToBottom();
            } else {
                this.messgerCont += 1;
                if (this.messgerCont > 0) {
                    this.messgerContLabel.string = this.messgerCont.toString();
                    this.messgerContLabel.node.parent.active = true;
                } else {
                    this.messgerContLabel.node.parent.active = false;
                }
            }
            reslove();
        });
    }

    // 创建一个 玩家说话的聊天内容
    createOneRightItem(data: platFormatMsg, isHistory: boolean, zIndex?: number): Promise<cc.Node> {
        return new Promise(async reslove => {
            // console.log("plat -----createOneRightItem----", data);
            let rightItem = this.rightItem;
            rightItem.resetChatLabel();
            if (data.photo && data.photo[0]) {  // 图片
                rightItem.image.node.active = true;
                rightItem.chatLb.node.active = false;
                if (!isHistory && cc.sys.isNative) {
                    // console.log("plat -----createOneRightItem----11111 ");
                    await this.loadTmpPng();
                    rightItem.setImage(this.tmpSp);
                }
            } else {  // 文字
                rightItem.image.node.active = false;
                rightItem.chatLb.node.active = true;
            }
            let xdate = Date.now();
            if (isHistory) xdate = data.time;
            rightItem.setTimeLbStr(xdate);
            this.createTimeLabel(data.time);

            // rightItem.setChatMessger(data);
            rightItem.setChatMessger(data);
            rightItem.resetCopyBtShow(this.showCopyBt);

            let nRightItem = cc.instantiate(rightItem.node);
            let chatItem = nRightItem.getComponent(CsPlatChatItem);
            // chatContent.setChatMessger(data);
            chatItem.adaptiveChatLabel(1);
            if (data.photo && data.photo[0]) {
                chatItem.setChatTimeLabelColor();
                if (isHistory) {
                    let remoteUrl = g.customerFileServerUrl + "/" + data.photo[0];
                    // console.log("plat -----createOneRightItem----22222", remoteUrl);
                    this.loadUrlPng(remoteUrl, false, chatItem);
                }
            }
            nRightItem.active = true;
            if (zIndex) nRightItem.zIndex = zIndex;

            this.contentNode.addChild(nRightItem);
            this.scrollviewToBottom();
            reslove(nRightItem);
        });
    }

    /**
     * 创建一个评价系统
     */
    createEvaluationItem() {
        let evalution = cc.instantiate(this.evaluationItem);
        this.evaluationSrc = evalution.getComponent(CsPlatEvalItem);
        this.evaluationSrc.init();
        evalution.active = true;
        this.contentNode.addChild(evalution);
    }

    createTimeLabel(time: number) {
        let showTimeString = "";
        let tDate, nDate, showTime;

        let willShow = false;
        time = time * 1000;
        tDate = new Date(time);   // 传入进来的时间
        nDate = new Date(Date.now());    // 当前时间
        showTime = tDate;
        let ctime = ((time - this.lastTime) / 1000 / 60);
        if (this.lastTime === 0 || ctime > 2) {
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
            showTimeString = "";
        }
        this.lastTime = time;
        if (showTimeString != "") {
            this.timeLb.string = showTimeString;
            let xTimeItem = cc.instantiate(this.timeLb.node);
            xTimeItem.active = true;
            this.contentNode.addChild(xTimeItem);
        }
    }

    onClickCopy(event: cc.Event, customData: string) {
        util.setClipboard(event.target.parent.parent.getComponent(cc.Label).string);
        showTip("内容已拷贝到剪切板!");
    }

    onClickCloseEvaluation() {
        this.evaluationNode.active = false;
    }
    onClickEvaluationSelector(event: cc.Event, customData: string) {
        this.evaluation = +customData;
    }

    // 选择图
    onClcikChoosePic() {
        if (this.banned) {
            showTip("您已被禁言！请稍后重试！");
            return;
        }

        this.hideEmojpedia();
        this.onClickManualHideKeyBoard();

        this.pngNumber++;
        this.tmpPath = this.picAddrss + this.pngNumber + ".png";
        cc.loader.release(this.tmpPath);
        console.log("testimg2");
        let callback = `cc.find('Canvas/parent/customerServicePlat').getComponent('customerServicePlat').choosePicCallBack();`;
        if (util.getSupportNewImgPicker()) {
            if (cc.sys.os === cc.sys.OS_IOS) {
                window.jsclass !== undefined ? JsClass.openImagePickeNew(this.tmpPath, callback, 0.7)
                    : jsb.reflection.callStaticMethod("NativeUtil", "openImagePicke:andCallback:qualitydata:", this.tmpPath, callback, 0.7);
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

    choosePicCallBack() {
        console.log("******choosePicCallBack******  ");
        let data: any = jsb.fileUtils.getDataFromFile(this.tmpPath);
        let base64data = this.arrayBufferToBase64(data);
        if (base64data === "data:image/jpeg;base64,") {
            showTip("选取图片失败，请重试")
            return;
        }
        this.uploadPicture(base64data, this.upLoadPicCallBack);

        // if (jsb.fileUtils.isFileExist(this.tmpPath)) {
        //     let self = this;
        //     cc.loader.load({ url: this.tmpPath, type: 'jpeg' }, (err: any, sp: cc.Texture2D) => {
        //         self.tmpSp = new cc.SpriteFrame(sp);
        //         // this.createOneRightItem(senddata, false);
        //     });
        // }
    }

    uploadPicture(fileData: string, cb?: Function) {
        let self = this;
        let url = g.customerFileServerUrl + "/" + this.platId + this.getSecondsTime();
        // console.log("uploadUrl:   ", url);
        let xhr = new XMLHttpRequest();
        xhr.open("POST", url);
        xhr.setRequestHeader("Content-Type", "application/json");
        let all = g.customerServiceUrl.split("&");
        let appIds = all[all.length - 1].split("=");
        let authorization = `${user.uid}&${appIds[1]}&${this.sessionId}`;
        xhr.setRequestHeader("Authorization", authorization);
        xhr.onreadystatechange = function (event: Event) {
            // console.log("******xmlRequest******  ", xhr.readyState, xhr.status);
            if (xhr.readyState === 4) {
                if (xhr.status >= 200 && xhr.status < 400) {
                    let ret;
                    try {
                        ret = JSON.parse(xhr.responseText);
                        self.tempPicName = ret.data;
                        self.upLoadPicCallBack(self.tempPicName);
                    } catch (error) {
                        //console.log("-----------JSON.parse err ----------", url, xhr.responseText);
                    }
                    //console.log("获取url: ", url, "数据ret: ", ret);
                } else {
                    // console.log("******xhr.status******  ", xhr.status);
                    showTip("文件上传失败，请稍后重试");
                }
            }
        };

        xhr.timeout = 30000;
        xhr.ontimeout = function () {
            showTip("上传超时");
            // console.log('文件上传超时');
        };
        xhr.onerror = function () {
            showTip("上传失败");
            // console.log('文件上传失败');
        };
        let sendData = {
            file: fileData,
        }

        xhr.send(JSON.stringify(sendData));

        // let file = new Blob([this.binaryData], {
        //     type: "image/png"
        // });
        // let formData = new FormData()
        // formData.append("file", file)

        // let file = this.dataURLtoBlob(fileData);
        // console.log("file   ", file);
        // let data = { file: file };
        // console.log("data   ", data);
    }
    dataURLtoBlob(dataurl) {
        // console.log("dataurl   ", dataurl);
        let arr = dataurl.split(',');
        let mime = arr[0].match(/:(.*?);/)[1];
        let bstr = atob(arr[1]);
        let n = bstr.length;
        let u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], {
            type: mime
        });
    }

    upLoadPicCallBack(photoName: string) {
        // console.log("******upLoadPicCallBack******  ");
        let time = this.getSecondsTime();
        this.messageId = this.getMessageId();
        let sendMsgId = "p-" + this.messageId;
        let isRead: boolean;
        let senddata: platFormatMsg = {
            type: 2,
            time: time,
            text: "",
            photo: [photoName],
            senderId: this.senderId,
            targetId: this.targetId,
            messageId: sendMsgId,
            sessionId: this.sessionId,
            username: this.userName,
        };

        this.sendMessage(senddata);
    }

    /**
     * 获得秒级时间戳
     */
    getSecondsTime() {
        let time = parseInt((new Date().getTime() / 1000).toString());
        return time;
    }

    /**
     * 生成递增的messageId
     */
    getMessageId() {
        if (this.messageId) {
            this.messageId = new Decimal(this.messageId).add(1).toString();
        } else {
            let messageId = this.getSecondsTime().toString();
            messageId = messageId.substring(messageId.length - 8, messageId.length);    // 取后8位
            this.messageId = messageId;
        }
        return this.messageId;
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

    loadTmpPng() {
        return new Promise(resolve => {
            if (jsb.fileUtils.isFileExist(this.tmpPath)) {
                let self = this;
                // cc.loader.release(this.tmpPath);
                cc.loader.load({ url: this.tmpPath, type: 'jpeg' }, (err: any, sp: any) => {
                    console.log("plat =send png===1=" + this.tmpPath);
                    if (err) {
                        console.log("plat =send png===2=" + err);
                    }
                    self.tmpSp = new cc.SpriteFrame(sp);
                    resolve();
                });
            }
        });
    }

    // 点击返回按钮
    onClickBackBt() {
        this.onClickManualHideKeyBoard();
        agentUtil.changeInterfaceOrientations('2');

        if (this.nowServerIsEnd) {  // 如果本次会话已经结束，默认评分
            this.evaluationSrc.onClickSendBunttoAction();
            this.chgBannedTipShowState(false, false);
            this.removeExtraListeners();

        }
        if (this.isWaiting) {       // 如果玩家退出时在排队状态则关闭ws
            window.kefu.off();
            window.kefu.disconnect();
        }
        this.node.active = false;
    }

    /*
    * 键盘隐藏
    */
    onKeyBoardHide() {
        // console.log("plat --调用--onKeyBoardHide----")
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

    /*
    * 键盘显示
    */
    onKeyBoardShow() {
        // console.log("plat --调用--onKeyBoardShow----")
        this.hideEmojpedia();
        this.chgCurShowInputTypeBt(1);
    }

    /**
     * 输入内容发生变化
     */
    onEditTextChg() {
        this.onPlayerInputing();
        if (this.edit.string != "") {
            this.chgSendButtonStatus(false);
        } else {
            this.chgSendButtonStatus(true);
        }
    }

    /**
    * 当输入框有字的时候，隐藏发送截图的按钮，展示发送消息的按钮
    */
    private chgSendButtonStatus(showImage: boolean) {
        this.addImage.active = showImage;
        this.sendBt.active = !showImage;
    }

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

    // 键盘弹起后的回调
    adaptiveKeyboardHight(scale: number) {
        // console.log('plat 键盘高度返回====>', scale);
        if (cc.sys.os === cc.sys.OS_ANDROID) {     // android下（emoji 适配）  ios下不需要，否则会引起适配bug
            if (this.emojiKeyboard.active) {
                return;
            }
        }
        this.edit.fontColor = new cc.Color(0, 0, 0, 0);
        this.updateEditBoxLb(this.edit.string);

        let realChgHgt;
        let isSupportNewAgentChat = util.getStatusBarHeighet(); // 旧版兼容
        if (isSupportNewAgentChat) {
            realChgHgt = this.adaptationHeight * scale - this.adaptationBottomBarH;
        } else {
            realChgHgt = 1136 * scale;
            if (util.isIphoneX()) {
                realChgHgt -= 15;
            }
        }
        this.keyBoardHight = realChgHgt;
        this.scheduleOnce(() => {
            this.bottomBtsNode.y = this.orgBottomY + realChgHgt;
        }, 0);
        this.onShowKeyBoardScrollViewAdaptive(realChgHgt);
    }

    /**
    * 当显示键盘的时候，滚动视图适应
    */
    onShowKeyBoardScrollViewAdaptive(height: number) {
        if (cc.sys.os === cc.sys.OS_IOS) {     // 某些安卓机型 点击下拉键盘会隐藏，这时也要进行适配
            if (height === 0) return;
        }
        this.scheduleOnce(() => {
            this.filler.height = height;
            this.filler.parent = this.contentNode;
            this.filler.zIndex = 999;
            this.scheduleOnce(() => {
                if (this.contentNode.height > this.chatScrollView.node.height) {
                    this.chatScrollView.scrollToBottom();
                }
            }, 0);
        }, 0);  // 在下一帧执行  否则contentNode的高度没有刷新
    }

    // 设置键盘弹起后的回调
    setKeyBoarHightCallBack() {
        let callback = `if(cc.find('Canvas/parent/customerServicePlat'))
    cc.find('Canvas/parent/customerServicePlat').getComponent('customerServicePlat').adaptiveKeyboardHight(%f);`;
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

    // 设置键的回车样式
    setKeyBoardReturnType() {
        if (cc.sys.os != cc.sys.OS_ANDROID) {
            this.edit.returnType = cc.EditBox.KeyboardReturnType.SEND;
        }
    }

    // pomelo 相关
    chatServiceHandShake(url: string) {
        return new Promise(async (resolve: (ret: number | number[]) => void, reject) => {
            let pomelo = window.kefu;
            // let domin = new URL(url); // 本地测试使用
            // let host = domin.host;
            // url = url.replace(host, "192.168.1.72:9527");
            if (url === g.linkedCsUrl && pomelo.socketReadyState() === 1) return
            g.linkedCsUrl = url;

            // pomelo.off();
            // pomelo.disconnect();

            let timeout = this.timeout;
            let timer = setTimeout(function () {
                console.log('plat timeout=========')
                pomelo.off();
                pomelo.disconnect();
                hideLoading();
                showTip("连接服务器超时");
                resolve(506);
            }, timeout);

            function errCb(event: Event) {
                console.log('plat io-error=========', event)
                pomelo.off();
                pomelo.disconnect();
                showTip("连接错误")
                clearTimeout(timer);
                hideLoading();
                resolve(505);
            }

            let cls = function () {
                clearTimeout(timer);
                console.log("plat socket is close====");
                hideLoading();
                resolve(505);
            }
            pomelo.once("io-error", errCb);
            let log = (s: string) => {
                console.log("plat ----chatService---", s);
            }
            let initCallback = () => {
                this.registerPomelo();
                clearTimeout(timer);
                pomelo.off("io-error", errCb);
                pomelo.once("close", cls);
                let time = setTimeout(function () {
                    hideLoading();
                    showTip("连接超时");
                    resolve(506);
                }, timeout);
                this.removeExtraListeners();
                this.addExtraListeners();

                pomelo.off(EVENT_MAP.ON_PLAYER_INFO);
                // 玩家连接成功以后, 客户端会收到本协议, 包含玩家的昵称、ID、头像等。
                pomelo.once(EVENT_MAP.ON_PLAYER_INFO, (data: playerInfoMsg) => {
                    clearTimeout(time);
                    this.hideEditBoxNode(true);
                    if (data === undefined || data.id === undefined) {
                        showTip("连线失败，请稍后再试")
                        this.chgBannedTipShowState(false, true, "连线失败，请稍后再试。");
                    } else {
                        this.senderId = data.id;
                        this.userName = data.username;
                        this.platId = data.platId;
                        this.platName = data.platName;
                        showTip("连线成功");
                        this.nowServerIsEnd = false;
                        this.chgBannedTipShowState(false, true, "排队中，请耐心等待。");
                    }
                    hideLoading();
                });
                resolve(200);
            }

            if (!url) {
                showTip("打开客服失败，请稍后再试");
                return;
            }
            cc.log('plat curl====888======', url);
            pomelo.init({ url: url, initCallback: initCallback, customLog: log });
        });
    }

    registerPomelo() {
        let pomelo = window.kefu;
        pomelo.off("disconnect");
        pomelo.on("disconnect", async function () {
            pomelo.off("disconnect");
            cc.log("plat 聊天连接已断开...");
        });
    }

    /**
     * scrollView滑动回调方法
     * @param event 当前划动scrollView对象
     * @param info
     */
    scrollViewAction(event: cc.ScrollView, info: string) {
        let maxOffset = event.getMaxScrollOffset();
        let offset = event.getScrollOffset();
        let height = event.node.getContentSize().height;
        if ((maxOffset.y - offset.y) >= height / 2) {
            if (!this.cbBotBtn.active) {
                // console.log('plat 出现底部回弹-===');
                this.cbBotBtn.active = true;
                if (this.messgerCont > 0) {
                    this.messgerContLabel.node.parent.active = true;
                } else {
                    this.messgerContLabel.node.parent.active = false;
                }
            }
        } else {
            if (this.cbBotBtn.active) {
                // console.log('plat 关闭底部回弹====');
                this.cbBotBtn.active = false;
                this.messgerCont = 0;
            }
        }
    }

    /**
     * 滚动视图回弹底部
     */
    scrollViewToBottomAction() {
        this.cbBotBtn.active = false;
        this.chatScrollView.scrollToBottom(1);
        this.messgerCont = 0;
    }

    /**
     * 隐藏输入框
     */
    hideEditBoxNode(show: boolean) {
        this.bottomBtsNode.active = show;
    }

    /**
     * 心跳超时处理
     */
    heartbeatTimeout() {
        console.log("plat 心跳超时===,断线重连");
        this.removeExtraListeners();
        if (this.node.active) {
            let time = setTimeout(() => {
                clearTimeout(time);
                this.chatServiceHandShake(this.connUrl);
            }, 5000)
        }
    }

    /**
     * 手动关闭键盘
     */
    onClickManualHideKeyBoard() {
        // console.log("plat ------manualHideKeyBoard-----");
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
        // console.log("plat ------onClickClearTextField-----");
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

    /**
     * 代充屏幕适配
     */
    screenAdaptation() {
        if (!util.getStatusBarHeighet()) {
            cc.log("plat 不支持屏幕适配");
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

        this.topNode.y = tmpH / 2 - tmpBarH;
        this.chatScrollView.node.y = this.topNode.y - this.topNode.height;

        this.chatScrollView.node.height = tmpH - tmpBarH - this.topNode.height - tmpBottomBarH - this.bottomBtsNode.height;
        this.chatScrollView.node.getChildByName("view").height = this.chatScrollView.node.height;
    }

    /**
     * 判断scrollview滑动，载入历史消息
     */
    initScrollViewTouchEvent() {
        let self = this;
        this.chatScrollView.node.on(cc.Node.EventType.TOUCH_MOVE, function (event: cc.Event.EventTouch) {
            if (event.getTouches().length === 1) {
                let delta = event.touch.getDelta();
                let wsState = window.kefu.socketReadyState();
                if (delta.y < -50 && !self.isGetHistory && self.sessionId && wsState === 1) {
                    showLoading("历史消息载入中...");
                    self.isGetHistory = true;
                    self.getHistoryMessage();
                    self.scheduleOnce(() => {
                        self.historyMessageCtr();
                    }, 10);
                }
            }
        });
    }

    historyMessageCtr() {
        hideLoading();
        this.isGetHistory = false;
    }
}