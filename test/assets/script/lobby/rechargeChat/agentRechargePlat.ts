import g from "../../g";
import net from "../../common/net";
import agentUtil from "../agentUtil";
import user from "../../common/user";
import rechargeMessage from "../rechargeMessage"
import AgentRechargePayInfo from "./agentRechargePayInfo";
import AgentRechargeChatItem from "./agentRechargeChatItem";
import { showLoading, hideLoading, showConfirm } from "../../common/ui";
import { getSecondsTime, getSupportNewImgPicker, setClipboard, getStatusBarHeighet, getTabbarSafeBottomMargin, toj, isIphoneX } from "../../common/util";
import { ErrCodes } from "../../common/code";

let localStorage = cc.sys.localStorage;
const { ccclass, property } = cc._decorator;

// 代充平台协议
const enum EVENT_MAP {
    ON_SEND_MESSAGE = "1003",       // 发送消息
    ON_SEND_READED = "1005",        // 发送消息已读状态
    ON_SEND_INPUT = "1006",         // 发送玩家输入状态
    ON_SEND_CUR_CHAT = "1007",     // 获取正在聊天的会话
    ON_SEND_MESSAGE_LIST = "1008",  // 拉取历史消息
    ON_SEND_ENDCHAT = "1009",       // 玩家结束服务
    ON_SEND_EXCEPTION = "1011",   // 账号异常

    ON_RECEIVED_CHAT_INFO = "2001", // 推送聊天人信息以及会话信息
    ON_RECEIVED_MESSAGE = "2003",   // 接收消息
    ON_RECEIVED_CONFIRM = "2004",    // 服务接收消息确认
    ON_RECEIVED_READED = "2005",    // 接收消息已读状态
    ON_RECEIVED_INPUT = "2006",    // 接收商人输入状态
    ON_RECEIVED_CHAT_LIST = "2007", // 接收正在聊天的会话
    ON_RECEIVED_MESSAGE_LIST = "2008",  // 拉取历史记录返回结果
    ON_RECEIVED_CHATEND = "2009",   // 收到结束服务

    ON_RECEIVED_HEART = "3001",     // 接收服务器心跳
    ON_RECEIVED_OUTLINE = "3003",   // 商人断线超时
}

// 当前会话信息
interface ChatInfoMsg {
    sessionId: string,      // 当前会话ID
    senderId: number,       // 发送人ID
    targetId: number,       // 接受人ID
}

// 收发消息
export interface ChatContentMsg extends ChatInfoMsg {
    messageId: string,      // 消息ID
    sendType: number,       // 消息方向     1 为玩家，2为商人
    messageType: number,    // 消息类型     1-文字 2-图片 11-支付消息
    text: string,           // 消息内容
    photo: string[],        // 图片地址数组 如 ['100-15713236869963']
    payload: string,        // 用户自定义内容 可将需要特殊处理的内容放在该字段内（支付方式等）
    createDate: number,     // 创建时间(仅前端使用) xxx秒
    isRead: number,         // 是否已读  1-未读  2-已读
    bank?: number,         // 开户行

}

// 支付方式
export interface PayMethodMsg {
    payMethod: number,      // 支付方式大类型
    payType: number,        // 支付方式小类型
    payTypeName: string,    // 支付方式名称
    account: string,        // 支付账号 如 "15888888888", "user@qq.com"
    name: string,           // 账户名称 如 "张三"
    bank: string,           // 开户行
    qrCode: string,         // 二维码地址   请自行拼接文件服务器前缀
    notice: string,         // 提示内容
    type: number,           // 不常用却依旧返回的字段
    isActive: boolean,      //
    targetId: number,       //
    sessionId: string,      //
}

// 收发消息确认
interface ChatConfirmMsg {
    messageId: string,
    senderId: number,
    sessionId: string,
    targetId: number
}

// 拉取历史记录
interface GetHistoryMsg {
    currentSessionId: string,
    senderId: number,
    targetId: number,
}

// 历史记录
export interface ChatHistoryMsg {
    aUid: string,
    aName: string,
    chatId: string,
    aHead: string,
    localChatId: string,
    msgs: ChatContentMsg[],
}

// 还原本次消息
interface RevertChatMsg {
    messageList: ChatContentMsg[],       // 消息列表
    sessionCreateTime: number,           // 会话创建时间
    userId: number,                      // 玩家ID
}

// 服务结束
interface ChatServiceEnd extends ChatInfoMsg {
    content: string,                // 结束服务的原因
}

@ccclass
export default class AgentRechargePlat extends cc.Component {
    @property(AgentRechargeChatItem)
    leftItem: AgentRechargeChatItem = undefined;    // 代理发送内容的模版节点

    @property(AgentRechargeChatItem)
    rightItem: AgentRechargeChatItem = undefined;    // 自己发送内容的模版节点

    @property(cc.Node)
    addImage: cc.Node = undefined;    // 点击发送截图的按钮

    @property(cc.Node)
    sendBt: cc.Node = undefined;    // 点击发送消息的按钮

    @property(cc.EditBox)
    edit: cc.EditBox = undefined;      // 输入框

    @property(cc.ScrollView)
    scrollView: cc.ScrollView = undefined;      // 整个聊天节点的滚动

    @property(cc.Node)
    contentNode: cc.Node = undefined;

    @property(cc.Label)
    title: cc.Label = undefined;      // 本次聊天的标题

    @property(cc.Node)
    bottomBtsNode: cc.Node = undefined;

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

    @property(AgentRechargePayInfo)
    payInfo: AgentRechargePayInfo = undefined;

    @property(cc.Node)
    mask: cc.Node = undefined;

    @property(cc.Node)
    arrow: cc.Node = undefined;

    @property(cc.Node)
    emojiKeyboard: cc.Node = undefined;

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

    @property(cc.Node)
    agentConfirmCancleBt: cc.Node = undefined;

    @property(cc.Node)
    filler: cc.Node = undefined;   // 用于弹起键盘后 给scrollview填充

    @property([cc.SpriteFrame])
    contentBg: cc.SpriteFrame[] = [];    //没有尖尖的 气泡框

    @property([cc.Color])
    payinfoBgColors: cc.Color[] = [];

    @property(cc.ScrollView)
    payTypeScr: cc.ScrollView = undefined;      // 充值方式的滚动

    @property(cc.Label)
    timeLb: cc.Label = undefined;

    @property(cc.Label)
    editBoxTestLb: cc.Label = undefined;

    @property(cc.Node)
    topNode: cc.Node = undefined;    // 需要进行屏幕适配的，上方的节点

    @property(cc.Node)
    loadingNode: cc.Node = undefined;   //  拉取历史记录时的载入菊花

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

    @property(cc.Label)
    bannedTipLb: cc.Label = undefined;  // 遮挡输入框的提示

    @property(cc.Node)
    dividingLine: cc.Node = undefined;
    private tmpMySp: cc.SpriteFrame = undefined;
    private tmpAgentSp: cc.SpriteFrame = undefined;
    private tmpPath: string = undefined;
    public orgSize: number = 0;
    private orgTitleY: number = 0;
    private curPage: number = 0;
    private curZIndex: number = 0;
    private loadingPageInfo: boolean = false;
    public agentPayTypes: ps.ChatClientHandlerOpenChat_Chat_Pays[] = [];
    private agentPayFType: string[] = [];   // 支付大类
    private agentPayCTypes: string[] = [];  // 支付小类
    private pngNumber: number = 0;
    private picAddrss: string = "";
    private fmsize: cc.Size = undefined;
    private rtsize: cc.Size = undefined;
    private agentConfirmOkFunc: Function = undefined;
    private orgBottomY: number = 0;
    private lastTime: number = 0;
    private orgTopY: number = 568;
    private showEmojiY: number = -268;  // 展示表情键盘时，键盘的Y坐标
    private adaptationHeight: number = 1136;
    private adaptationBottomBarH: number = 0;
    private keyBoardHight: number = 0;
    private needSroll: boolean = true;   // 增加新消息时 是否需要滚屏
    private unreadMsgNum: number = 0;   // 未读消息数量
    private fastSendAgentMsg: string[] = ["亲，成功付款后，请点击右下方的上传按钮，上传您的充值截图哦～", "我已经付款了，请尽快充值!"];     //快捷回复
    public isChangeInterfaceOrientations = false;
    public lobbyParent: cc.Node = undefined;

    // 代充平台新增
    private chatHistoryMes: ChatHistoryMsg = undefined;
    private localMsgList: ChatContentMsg[] = [];
    private timeout: number = 15000;
    private messageId: number = 0;
    private messageIdList: string[] = [];
    private headSpUrl: string = "";
    private sessionId: string = "";
    private agentName: string = "";
    public aUid: string = "";       // 传给服务器的商人id
    public agentId: number = -1;    // 传给平台的商人Id
    public plyId: number = -1;
    public localChatId: string = "";    // 新老代充统一的本地消息存储key
    public chatItemList: AgentRechargeChatItem[] = [];  // 自己发出的消息列表
    private playerEditNowTime: number = 0;  // 标记玩家开始编辑的时间
    private playerEditIntervalTime: number = 5 * 1000;      // 玩家发送输入状态的检测间隔，消息节流处理
    private isGetHistory = false;   // 是否正在获取历史记录
    private curPayFType: string = "";       // 记录当前选择的支付大类
    private curPayCType: string = "";       // 记录当前选择的支付小类
    private exceptionPayType: string = ""   // 支付方式异常

    public agentUid: string = "";

    addExtraListeners() {
        // console.log("plat  ---addExtraListeners----");
        let pomelo = window.recharge;
        pomelo.on(EVENT_MAP.ON_RECEIVED_MESSAGE, this.receivedMessage.bind(this));  // 当收到新消息时,服务端会推送此协议内容。
        pomelo.on(EVENT_MAP.ON_RECEIVED_CONFIRM, this.receivedConfirm.bind(this));  // 服务端接受到消息，则会推送本协议告知客户端。
        pomelo.on(EVENT_MAP.ON_RECEIVED_READED, this.agentReadedMsg.bind(this));  // 服务端推送已读消息ID到客户端。
        pomelo.on(EVENT_MAP.ON_RECEIVED_INPUT, this.onAgentInputing.bind(this));  // 商人正在输入文字时会推送本协议到客户端。
        // pomelo.on(EVENT_MAP.ON_RECEIVED_CHAT_LIST, this.revertCurChatContent.bind(this));   // 推送正在聊天的会话,用于还原本次未结束的会话
        // pomelo.on(EVENT_MAP.ON_RECEIVED_MESSAGE_LIST, this.receivedHistoryMsg.bind(this));  // 服务端推送用户上次聊天记录。
        pomelo.on(EVENT_MAP.ON_RECEIVED_CHATEND, this.chatServiceEnd.bind(this));  // 当商人结束服务时,客户端将收到本协议。
        pomelo.on(EVENT_MAP.ON_RECEIVED_OUTLINE, this.agentOutline.bind(this));  // 当商人掉线，并且在规定时间内没有重连成功，客户端会收到本协议内容。
        // pomelo.on("3001", this.heartbeatTimeout.bind(this));  // 服务端主动心跳。
        pomelo.on("heartbeat timeout", this.heartbeatTimeout.bind(this)); // 客户端pomelo心跳。
    }

    removeExtraListeners() {
        // console.log("plat  ---removeExtraListeners----");
        let pomelo = window.recharge;
        pomelo.off(EVENT_MAP.ON_RECEIVED_MESSAGE);
        pomelo.off(EVENT_MAP.ON_RECEIVED_CONFIRM);
        pomelo.off(EVENT_MAP.ON_RECEIVED_READED);
        pomelo.off(EVENT_MAP.ON_RECEIVED_INPUT);
        // pomelo.off(EVENT_MAP.ON_RECEIVED_CHAT_LIST);
        // pomelo.off(EVENT_MAP.ON_RECEIVED_MESSAGE_LIST);
        pomelo.off(EVENT_MAP.ON_RECEIVED_CHATEND);
        pomelo.off(EVENT_MAP.ON_RECEIVED_OUTLINE);
        pomelo.off("heartbeat timeout");
    }

    /**
     * 获取当前会话内容
     */
    getCurChatContent() {
        let sendData = {
            userId: this.plyId,
            time: getSecondsTime(),
        }
        window.recharge.notify(EVENT_MAP.ON_SEND_CUR_CHAT, sendData)
    }

    /**
    * 还原当前会话内容
    * @param remoteUrl
    * @param isAvatar
    * @param item
    */
    private async revertCurChatContent(data: { list: RevertChatMsg[] }) {
        // console.log("****还原当前会话内容****  ", data.list[0]);
        showLoading();
        let chatData = data.list[0];        // 自己的消息默认是第一条
        if (chatData && chatData.messageList && chatData.messageList.length > 0) {
            for (let i = 0; i < chatData.messageList.length; i++) {
                let zOrder = -chatData.messageList.length + i;
                let content = chatData.messageList[i];
                if (content.sendType === 2) {           // type = 2，表示商人发送的消息
                    await this.createOneLeftItem(content, zOrder);
                    if (content.messageId) this.messageIdList.push(content.messageId);
                } else if (content.sendType === 1) {    // type = 1，表示玩家发送的消息
                    await this.createOneRightItem(content, true, zOrder);
                }
            }
        }
        this.sendReadedStatus();
        hideLoading();
        this.scrollView.scrollToBottom();
    }

    /**
     * 服务端确认接收消息
     * @param data
     */
    receivedConfirm(data: ChatConfirmMsg) {
        // console.log("****服务端确认接收消息****  ", data);
        if (!this.chatItemList) return;
        this.chatItemList.forEach(item => {
            if (data.messageId === item.messageId) item.setLoadingActive(false, 'i');
        });
    }

    /**
     * 点击发送按钮
     */
    onClickSendMsgBtn() {
        // this.reqServerImg(this.base64Data);     // web测试使用
        if (!this.edit.string || this.edit.string === "") {
            this.showAgentTip("发送消息不能为空！");
            return;
        }
        let msgId = this.getMessageId();
        let sendData: ChatContentMsg = {
            sessionId: this.sessionId,
            senderId: this.plyId,
            targetId: this.agentId,
            messageId: msgId,
            sendType: 1,
            messageType: 1,
            text: this.edit.string,
            photo: [],
            payload: "",
            createDate: getSecondsTime(),
            isRead: 1
        };
        this.sendMessage(sendData);
        this.edit.string = "";
        this.onClickClearTextField();
        this.chgSendButtonStatus(true);
    }

    /**
     * 发送消息数据
     * @param data
     * @param isclearEdit
     */
    async sendMessage(data: ChatContentMsg) {
        let chatItem = await this.createOneRightItem(data, false);
        if (window.recharge.socketReadyState() > 1) {
            this.showAgentTip("网络连接失败，请退出重连！");
            chatItem.getComponent(AgentRechargeChatItem).setLoadingActive(true, 'e');
            return;
        }
        // 存储本地消息记录
        this.saveMsgToLocal(data);

        window.recharge.notify(EVENT_MAP.ON_SEND_MESSAGE, data);
    }

    /**
     * 本地消息存储
     * @param data
     */
    saveMsgToLocal(data: ChatContentMsg) {
        try {
            this.chatHistoryMes = toj(localStorage.getItem(this.localChatId));
            this.chatHistoryMes.msgs.unshift(data);
            localStorage.setItem(this.localChatId, JSON.stringify(this.chatHistoryMes));
            let message = agentUtil.messageLocalRecord(true, this.chatHistoryMes, 0);
            agentUtil.messageRecordSaving(message);
        } catch (error) {
            cc.log(error)
        }
    }

    /**
     * 通过游戏服发送图片
     * @param base64
     */
    async reqServerImg(base64: string) {
        showLoading("发送中，请稍候～");
        let arg: pc.ChatClientHandlerSendMsg = {
            aUid: +this.aUid,
            chatId: this.sessionId,
            type: 2,
            content: base64,
            playerId: `${this.agentId}_${this.plyId}`,
        }
        let data = await net.request("chat.clientHandler.sendMsg", arg);
        hideLoading();
        if (data.code === 200) {
            let msgId = this.getMessageId();
            let photo = data.proof;
            let sendData: ChatContentMsg = {
                messageId: msgId,
                sessionId: this.sessionId,
                senderId: this.plyId,
                targetId: this.agentId,
                sendType: 1,
                messageType: 2,
                text: "",
                photo: [photo],
                payload: "",
                createDate: getSecondsTime(),
                isRead: 1
            }
            this.sendMessage(sendData);
        } else {
            this.showAgentTip(ErrCodes.getErrStr(data.code));
        }
    }

    /**
     * 收到商人发送的消息
     * @param data
     */
    receivedMessage(data: ChatContentMsg) {
        // console.log("****商人发送的消息****  ", data);
        if (data.messageId) this.messageIdList.push(data.messageId);
        // if (!this.node.active) {
        //     if (this.tLobby && this.tLobby.node.active) {
        //         this.tLobby.showMessagePrompt(true);
        //     } else {
        //         if ((data.photo && data.photo.length > 0) || data.text) {
        //             util.setIsMessger(true);
        //         }
        //     }
        // } else {
        this.sendReadedStatus();  // 当收到商人消息，且该界面显示状态，则认为玩家已读消息
        // }

        this.createOneLeftItem(data);

        // 存储本地消息记录
        this.saveMsgToLocal(data);
    }

    /**
     * 发送已读消息
     * @param data
     */
    sendReadedStatus() {
        if (!this.sessionId) return;
        let sendMsg = {
            senderId: this.plyId,
            targetId: this.agentId,
            sessionId: this.sessionId,
            messageIds: this.messageIdList,
        }
        window.recharge.notify(EVENT_MAP.ON_SEND_READED, sendMsg);
        this.messageIdList = [];
    }

    /**
     * 商人已读消息
     * @param data
     */
    private agentReadedMsg(data: ChatInfoMsg) {
        // console.log("****商人已读消息****  ", data);
    }

    /**
    * 拉取历史消息
    */
    getHistoryMessage() {
        let sendData: GetHistoryMsg = {
            currentSessionId: this.sessionId,
            senderId: this.plyId,
            targetId: this.agentId,
        }
        window.recharge.notify(EVENT_MAP.ON_SEND_MESSAGE_LIST, sendData);
    }

    /**
     * 收到历史聊天记录
     * @param data
     */
    async receivedHistoryMsg(data: { sessionId: string, list: ChatContentMsg[] }) {
        // console.log("****收到上次聊天记录****  ", data);
        if (data && data.list && data.list.length > 0) {
            for (let i = 0; i < data.list.length; i++) {
                let chatData = data.list[i]
                let msgId = chatData.messageId;
                let str = msgId.substring(msgId.length - 8, msgId.length);
                let zOrder = -str + i;
                if (chatData.sendType === 2) {  // sendType = 2，表示商人发送的消息
                    await this.createOneLeftItem(chatData, zOrder);
                } else if (chatData.sendType === 1) {   // sendType = 1，表示玩家发送的消息
                    await this.createOneRightItem(chatData, true, zOrder);
                }
            }
            this.isGetHistory = true;
            this.unschedule(this.historyMessageCtr);
        }
        hideLoading();
        // this.scrollView.scrollToTop();
    }

    /**
    * 判断scrollview滑动，载入历史消息
    */
    initScrollViewTouchEvent() {
        this.scrollView.node.on(cc.Node.EventType.TOUCH_MOVE, (event: cc.Event.EventTouch) => {
            if (event.getTouches().length === 1) {
                let delta = event.touch.getDelta();
                let wsState = window.recharge.socketReadyState();
                console.log(this.isGetHistory);
                if (delta.y < -50 && !this.isGetHistory && this.sessionId && wsState === 1) {
                    showLoading("历史消息载入中...");
                    this.isGetHistory = true;
                    this.getHistoryMessage();
                    this.scheduleOnce(() => {
                        this.historyMessageCtr();
                    }, 10);
                }
            }
        });
    }

    historyMessageCtr() {
        hideLoading();
        this.isGetHistory = false;
        console.log(new Error().stack);
    }

    /**
     * 聊天服务结束
     * @param data
     */
    chatServiceEnd(data: ChatServiceEnd) {
        // console.log("****聊天服务结束****  ", data);
        this.chgBannedTipShowState(true, "本次服务已结束，祝您游戏愉快～");
        let content = data.content ? data.content : "本次服务已结束，祝您游戏愉快～";
        showConfirm(content);
        this.onClickManualHideKeyBoard();
        this.edit.string = "";
        this.onClickClearTextField();
    }

    /**
     * 商人掉线
     * @param data
     */
    agentOutline(data: { sessionId: string, userId: number }) {
        this.showAgentTip(`亲，不好意思，商人${data.userId}已掉线～`);
    }

    /**
    * 商人输入中状态
    * @param data
    */
    private onAgentInputing(data: any) {
        // console.log("****商人输入中****  ", data);
        this.title.string = "对方正在输入...";
        this.scheduleOnce(() => {
            this.title.string = `${this.agentName}正在为您服务`;
        }, 2);
    }

    /**
    * 玩家输入中状态
    * @param data
    */
    private onPlayerInputing() {
        // console.log("****玩家输入中****  ");
        if ((Date.now() - this.playerEditNowTime) > this.playerEditIntervalTime) {
            this.playerEditNowTime = Date.now();
            let sendData = {
                senderId: this.plyId,
                targetId: this.agentId,
                sessionId: this.sessionId
            }
            window.recharge.notify(EVENT_MAP.ON_SEND_INPUT, sendData);
        }
    }

    /**
     * 心跳超时处理
     */
    private heartbeatTimeout() {
        console.log("plat 心跳超时===,断线重连");
        this.removeExtraListeners();
        if (this.node.active) {
            let time = setTimeout(() => {
                clearTimeout(time);
                this.chatServiceHandShake(agentUtil.platWsUrl);
            }, 5000)
        }
    }

    /**
     * 输入栏提示状态处理
     * @param isShow 是否显示
     * @param content 提示内容
     */
    chgBannedTipShowState(isShow: boolean, content?: string) {
        if (this.bannedTipLb && this.bannedTipLb.node) {
            this.bannedTipLb.node.parent.active = isShow;
            this.bannedTipLb.string = content ? content : "";
        }
        this.edit.placeholder = "";
    }

    // pomelo 相关
    chatServiceHandShake(url: string) {
        return new Promise(async (resolve: (ret: number | number[]) => void, reject) => {
            let pomelo = window.recharge;
            // let domin = new URL(url); // 本地测试使用
            // let host = domin.host;
            // url = url.replace(host, "192.168.1.72:9527");
            // if (pomelo.socketReadyState() === 1) return
            // g.linkedCsUrl = url;

            // pomelo.off();
            // pomelo.disconnect();

            let timeout = this.timeout;
            let timer = setTimeout(() => {
                console.log('plat timeout=========')
                pomelo.off();
                pomelo.disconnect();
                hideLoading();
                this.showAgentTip("连接服务器超时");
                resolve(506);
            }, timeout);

            let errCb = (event) => {
                console.log('plat io-error=========', event)
                // console.log('plat io-error=========', toj(event))
                pomelo.off();
                pomelo.disconnect();
                this.showAgentTip("连接错误")
                clearTimeout(timer);
                hideLoading();
                resolve(505);
            }

            let cls = () => {
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
                let time = setTimeout(() => {
                    hideLoading();
                    this.showAgentTip("连接超时");
                    resolve(506);
                }, timeout);
                this.removeExtraListeners();
                this.addExtraListeners();

                pomelo.off(EVENT_MAP.ON_RECEIVED_CHAT_INFO);
                // 玩家连接成功以后, 客户端会收到本协议
                pomelo.once(EVENT_MAP.ON_RECEIVED_CHAT_INFO, (data: ChatInfoMsg) => {
                    clearTimeout(time);
                    if (!data) {
                        this.showAgentTip("连线失败，请稍后再试")
                        this.chgBannedTipShowState(true, "连线失败，请稍后再试。");
                    } else {
                        this.sessionId = data.sessionId;
                        this.agentId = data.senderId;
                        this.plyId = data.targetId;
                        this.title.string = `${this.agentName}正在为您服务`;
                        this.showAgentTip("连线成功");
                        this.chgBannedTipShowState(false);
                        // this.getCurChatContent();   // 链接成功后，尝试主动拉取当前会话记录
                    }
                    hideLoading();
                });
                resolve(200);
            }

            if (!url) {
                this.showAgentTip("打开代充失败，请稍后再试");
                return;
            }

            this.chgBannedTipShowState(true, "链接中，请耐心等待。");

            cc.log('plat curl====888======', url);
            pomelo.init({ url: url, initCallback: initCallback, customLog: log });
        });
    }

    registerPomelo() {
        let pomelo = window.recharge;
        pomelo.off("disconnect");
        pomelo.on("disconnect", async function () {
            pomelo.off("disconnect");
            cc.log("plat 商人聊天连接已断开...");
        });
    }

    /**
    * 生成递增的messageId
    */
    getMessageId() {
        if (this.messageId) {
            this.messageId = this.messageId + 1;
        } else {
            let messageId = getSecondsTime().toString();
            messageId = messageId.substring(messageId.length - 8, messageId.length);    // 取后8位
            this.messageId = +messageId;
        }
        let sendMsgId = "p-" + this.messageId;
        return sendMsgId;
    }

    protected onLoad() {
        this.orgTopY = this.topNode.y;
        this.orgTitleY = this.title.node.y;
        this.orgBottomY = this.bottomBtsNode.y;
        this.orgSize = this.leftItem.node.height;
        this.contentNode.active = false;
        this.leftItem.node.active = false;
        this.rightItem.node.active = false;
        this.emojiKeyboard.active = false;
        this.curPage = 0;
        this.agentTipNode.opacity = 0;

        if (cc.sys.isNative) {
            this.picAddrss = jsb.fileUtils.getWritablePath() + "agentRecTmp";
        }

        agentUtil.agentRechargePlat = this;
        this.payInfo.init(this);
        this.chgCurShowInputTypeBt(1);
        this.initEmojClickEvent();
        this.setKeyBoardReturnType();
        this.addAndroidBackListen();
        // this.initScrollViewTouchEvent();
    }

    onEnable() {    // 预制不销毁，保存聊天记录，再次激活时进行相关适配操作
        this.fmsize = cc.view.getFrameSize();
        this.rtsize = cc.view.getDesignResolutionSize();
        this.setKeyBoarHightCallBack();
        this.screenAdaptation();
        if (window.recharge.socketReadyState() === 1) this.sendReadedStatus();
    }

    onDestroy() {
        if (!this.isChangeInterfaceOrientations) {
            agentUtil.changeInterfaceOrientations("2");
        } else {
            let rm = this.lobbyParent.getChildByName("rechargeMessage")
            if (rm) rm.getComponent(rechargeMessage).show(true);
            agentUtil.initRedDot();
        }
    }

    async init(data: ps.ChatClientHandlerMatchAgent_Agents, isLocal: boolean) {
        this.node.active = true;
        this.node.opacity = 255;
        this.contentNode.x = 0;
        this.contentNode.y = 0;
        this.node.setPosition(cc.v2(0, 0));
        this.payTypes.active = false;
        this.contentNode.active = true;
        this.bottomBtsNode.active = true;
        this.tipNode.parent.active = false;
        this.payTypeScr.content = this.payMode;
        this.title.node.y = this.orgTitleY;
        this.agentUid = data.aUid
        if (data.aUid.indexOf("_") !== -1) {
            let ids = data.aUid.split("_");
            this.aUid = ids[1];
            this.agentId = +ids[0];
        } else {    // 兼容处理
            this.aUid = data.aUid;
            this.agentId = +data.aUid;
        }
        this.agentName = data.name;
        this.headSpUrl = data.head;
        this.localChatId = user.uid + "-" + this.agentId;
        this.title.string = `${this.agentName}正在为您服务`;
        this.scrollView.scrollToBottom();
        if (data.pays) {
            this.paymentMethod(data);
        }
        this.revertChatFromLocal(isLocal, data.welcomeMsg);
        this.chatServiceHandShake(agentUtil.platWsUrl + `&targetImId=${this.agentId}`);
    }

    /**
     * 支付方式
     */
    public paymentMethod(data: ps.ChatClientHandlerMatchAgent_Agents) {
        this.agentPayFType = [];
        if (data.pays) {
            this.agentPayTypes = data.pays;
            this.agentPayTypes.forEach(el => {
                this.agentPayFType.push(el.payFType);
            });
        }
        this.initPayTypes(this.agentPayFType, this.payMode, this.payModeItem);
    }

    /**
     * 读取消息记录
     * @param data 消息记录
     * @param isLocal 是否从本地读取
     */
    revertChatFromLocal(isLocal: boolean, welcomeMsg: string) {
        try {
            let data = this.initChatHistoryMsg();
            this.chatHistoryMes = data;
            let localData: ChatHistoryMsg = toj(localStorage.getItem(this.localChatId));
            if (localData) {
                let chatMsg: ChatHistoryMsg = localData;
                if (chatMsg.msgs && chatMsg.msgs.length > 0) {
                    this.chatHistoryMes = localData;
                    if (data.msgs && data.msgs.length > 0 && isLocal) {
                        this.chatHistoryMes.msgs.unshift(data.msgs[0]);
                        localStorage.setItem(this.localChatId, JSON.stringify(this.chatHistoryMes));
                    }
                } else {
                    if (!this.chatHistoryMes.msgs) this.chatHistoryMes.msgs = [];
                    localStorage.setItem(this.localChatId, JSON.stringify(this.chatHistoryMes));
                }
            } else {
                if (!this.chatHistoryMes.msgs) this.chatHistoryMes.msgs = [];
                localStorage.setItem(this.localChatId, JSON.stringify(this.chatHistoryMes));
            }
            let message = agentUtil.messageLocalRecord(true, this.chatHistoryMes, 0);
            agentUtil.messageRecordSaving(message);

            this.initContent(this.chatHistoryMes.msgs, welcomeMsg);
        } catch (error) {
            cc.log(error)
        }
    }

    initChatHistoryMsg(): ChatHistoryMsg {
        if (this.chatHistoryMes) return this.chatHistoryMes;
        console.log("********initChatHistoryMsg********");
        let data: ChatHistoryMsg = {
            aUid: this.agentUid,
            aName: this.agentName,
            chatId: this.localChatId,
            aHead: this.headSpUrl,
            localChatId: this.localChatId,
            msgs: [],
        }
        return data;
    }

    /**
     * 载入历史消息或当前会话
     * @param data
     */
    async initContent(data: ChatContentMsg[], welcomeMsg: string) {
        if (!data || data.length <= 0) {
            if (welcomeMsg) this.sendAgentMsg(welcomeMsg)
            return
        }

        let number = 0;
        if (data.length < 15) {        // 初始化消息小于10个  说明是 没有分页的
            this.loadingPageInfo = true;      // 设置不再加载历史记录
            number = data.length - 1;
        } else {
            number = 14;
        }
        for (let i = number; i >= 0; i--) {
            let msg = data[i];
            if (msg.sendType === 2) {
                await this.createOneLeftItem(msg);
            } else if (msg.sendType === 1) {
                await this.createOneRightItem(msg, true);
            }
        }
        this.creatDividingLineItme();
        if (welcomeMsg) this.sendAgentMsg(welcomeMsg)
        this.scheduleOnce(() => {
            if (this.contentNode.height > this.scrollView.node.height) {
                this.scrollView.scrollToBottom();
            }
        }, 0.1);  // 在下一帧执行  否则contentNode的高度没有刷新
    }

    /**
     * 初始化 该代理的支持的支付方式
     */
    initPayTypes(payData: string[], parent: cc.Node, item: cc.Node) {
        // console.log("初始化 该代理的支持的支付方式", payData);
        parent.children.forEach(el => {
            if (el.name === "item") el.destroy();
        });
        if (!payData || payData.length === 0) return;

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
    }

    createOneLeftItem(data: ChatContentMsg, zIndex?: number) {
        return new Promise(async reslove => {
            try {
                let leftItem = this.leftItem;
                leftItem.resetChatLabel();
                if (data.messageType === 1) {       // 文字
                    leftItem.chatLb.node.active = true;
                    leftItem.payType.active = false;
                    leftItem.spAgent.node.active = false;
                    leftItem.setChatLbStr(data.text);
                    leftItem.setCopyBtState(false);
                } else if (data.messageType === 2) {     // 图片
                    leftItem.spAgent.node.active = true;
                    leftItem.chatLb.node.active = false;
                    leftItem.payType.active = false;
                    if (data.photo && data.photo.length > 0) {
                        await this.loadUrlPng(data.photo[0]);
                        leftItem.setImage(false, this.tmpAgentSp);
                    }
                } else if (data.messageType === 11) {  // 收款信息
                    leftItem.chatLb.node.active = false;
                    leftItem.spAgent.node.active = false;
                    leftItem.payType.active = true;
                    let jsonData: PayMethodMsg = toj(data.payload);
                    let fType = agentUtil.getFPayTypeByBigId(jsonData.payMethod);
                    leftItem.setPayTitle(agentUtil.getNameByType(fType, true) + "充值");
                    leftItem.setIndex(agentUtil.getIndexByType(fType, false));
                    // console.log("<<<<<<<<<<<<<setPayButtonCustomData   ", data.content)
                    leftItem.setPayButtonCustomData(JSON.stringify(jsonData));
                    leftItem.setPayItemRebateInfo();
                }
                this.createTimeLabel(data.createDate);
                let nLeftItem = cc.instantiate(leftItem.node);
                let obj = nLeftItem.getComponent(AgentRechargeChatItem);
                obj.content.getComponent(cc.Sprite).spriteFrame = this.contentBg[0];
                obj.adaptiveChatLabel();
                nLeftItem.active = true;
                if (zIndex) nLeftItem.zIndex = zIndex;
                this.contentNode.addChild(nLeftItem);
                if (!this.needSroll && !zIndex) {
                    this.unreadMsgNum++;
                    this.chgToBottomBtNumLabel();
                } else if (!zIndex && this.contentNode.height > this.scrollView.node.height) {
                    this.scrollView.scrollToBottom(1);
                }
            } catch (error) {
                cc.log("-------错误-----    ", error);
            }

            reslove();
        })
    }

    async createOneRightItem(data: ChatContentMsg, isHistory: boolean, zIndex?: number) {
        return new Promise<cc.Node>(async reslove => {
            try {
                let rightItem = this.rightItem;
                rightItem.node.height = this.orgSize;
                rightItem.resetChatLabel();
                if (data.messageType === 2) {   //  base64图片
                    rightItem.image.node.active = true;
                    rightItem.chatLb.node.active = false;
                    if (cc.sys.isNative) {
                        // console.log("plat -----createOneRightItem----11111 ");
                        if (isHistory) {
                            if (data.photo && data.photo.length > 0) {
                                await this.loadUrlPng(data.photo[0]);
                                rightItem.setImage(true, this.tmpAgentSp);
                            }
                        } else {
                            await this.loadTmpPng();
                            rightItem.setImage(true, this.tmpMySp);
                        }
                    }
                } else {
                    rightItem.image.node.active = false;
                    rightItem.chatLb.node.active = true;
                    rightItem.setChatLbStr(data.text);
                }
                this.createTimeLabel(data.createDate);
                rightItem.setStateLbStr(data.isRead);
                let nRightItem = cc.instantiate(rightItem.node);
                let chatContent = nRightItem.getComponent(AgentRechargeChatItem);
                chatContent.setLoadingActive(!isHistory);
                chatContent.adaptiveChatLabel();
                chatContent.messageId = data.messageId;
                nRightItem.active = true;
                if (zIndex) nRightItem.zIndex = zIndex;
                this.contentNode.addChild(nRightItem);
                this.chatItemList.push(chatContent);
                if (!zIndex && this.contentNode.height > this.scrollView.node.height) this.scrollView.scrollToBottom(2);

                reslove(nRightItem);
            } catch (error) {
                cc.log("-------错误-----    ", error);
            }
        })
    }

    createTimeLabel(time: number) {
        let showTimeString = "";
        let tDate, nDate, showTime;
        let willShow = false;
        tDate = new Date(time * 1000);   // 传入进来的时间
        nDate = new Date(Date.now());    // 当前时间
        showTime = tDate;
        let ctime = ((time - this.lastTime) / 1000 / 60);
        if (this.lastTime === 0 || ctime > 5) willShow = true;
        if (!willShow) return;

        if (nDate.getFullYear() - tDate.getFullYear() > 0) {    // 超过一年
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

    hideMask() {
        this.mask.active = false;
        this.arrow.stopAllActions();
    }

    private onClickAddImage() {
        this.hideEmojpedia();
        this.onClickManualHideKeyBoard();

        this.hideMask();
        this.pngNumber++;
        this.tmpPath = this.picAddrss + this.pngNumber + ".png";
        cc.loader.release(this.tmpPath);
        console.log("testimg3");
        // console.debug("------onClickAddImage-----", this.tmpPath);
        let callback = `cc.find('Canvas/parent/agentRechargePlat').getComponent('agentRechargePlat').choosePic();`;
        if (getSupportNewImgPicker()) {
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
            this.showAgentTip("选取图片失败，请重试")
            return;
        }
        if (jsb.fileUtils.isFileExist(this.tmpPath)) {
            let self = this;
            // console.debug("------choosePic-----", this.tmpPath);
            cc.loader.load({ url: this.tmpPath, type: 'jpeg' }, (err: any, sp: cc.Texture2D) => {
                self.tmpMySp = new cc.SpriteFrame(sp);
                self.reqServerImg(base64data);
            });
        }
    }

    /**
     * 载入本地相册图片
     */
    loadTmpPng() {
        return new Promise(resolve => {
            if (jsb.fileUtils.isFileExist(this.tmpPath)) {
                let self = this;
                cc.loader.load({ url: this.tmpPath, type: 'jpeg' }, (err: any, sp: any) => {
                    // console.debug("=send png===1=" + this.tmpPath);
                    if (err) console.debug("=send png===2=" + err);
                    self.tmpMySp = new cc.SpriteFrame(sp);
                    resolve();
                });
            }
        });
    }

    /**
     * 载入远端URL图片
     * @param remoteUrl 远端图片url地址
     * @param isAvatar 是否为客服头像
     * @param imgNode 聊天气泡
     */
    loadUrlPng(remoteUrl: string) {
        return new Promise(resolve => {
            let self = this;
            cc.loader.load({ url: remoteUrl, type: 'jpeg' }, function (error: any, spriteFrame: cc.Texture2D) {
                if (!error) {
                    self.tmpAgentSp = new cc.SpriteFrame(spriteFrame);
                } else {
                    self.showAgentTip("加载图片失败，请重试!");
                    console.log("----加载图片 error-----", error);
                }
                resolve();
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
        if (index != index) index = 0; // better `isNaN`
        // 边界
        if (index < 0 || index >= size) return undefined;
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
            if (this.edit.string === "") this.chgSendButtonStatus(true);
        } else {
            this.chgSendButtonStatus(true);
        }
    }

    onClickCopy(ev: cc.Event, customData: string) {
        let node: cc.Node = ev.target;
        let parent = node.parent.parent;
        let lb = parent.getComponent(cc.Label);
        if (lb && lb.string) {
            setClipboard(lb.string);
            this.showAgentTip("内容已拷贝到剪切板!");
        }
    }

    /**
     * 点击小卡片充值
     * @param event
     * @param customData
     */
    async onClickPay(event: cc.Event, customData: string) {
        // console.log("点击小卡片充值", customData);
        this.onClickManualHideKeyBoard();

        try {
            this.payInfo.initUI();
            let jData: PayMethodMsg = toj(customData);
            let fType = agentUtil.getFPayTypeByBigId(jData.payMethod);
            let payBgColorIdx = agentUtil.getIndexByType(fType, false);
            this.exceptionPayType = jData.payMethod + "_" + jData.payType;
            if (jData.account) { // 有联系方式  只显示联系方式
                let payName = agentUtil.getNameByType(fType, false)
                this.payInfo.chgPayInfoToContact(false, jData, fType, payName, g.hallVal.reportData.wx);
            } else if (jData.qrCode) {
                let payName = agentUtil.getNameByType(fType, true)
                this.payInfo.chgPayInfoToContact(true, jData, fType, payName, g.hallVal.reportData.wx);
            }
            this.payInfo.chgBgColor(this.payinfoBgColors[payBgColorIdx]);
        } catch (error) {
            cc.log("--------错误---------", error);
        }
        this.payInfo.setShowUI();
    }

    // 异常账户
    exceptionAct() {
        this.payTypes.active = false;
        this.payMode.active = true;
        this.payTypeScr.content = this.payMode;
    }

    /**
     * 点击已付款(我充好了)
     */
    onClickPaid(event: cc.Event, customData: string) {
        // console.log("点击已付款  ", customData)
        let msgId = this.getMessageId();
        let data: ChatContentMsg = {
            messageId: msgId,
            sessionId: this.sessionId,
            senderId: this.plyId,
            targetId: this.agentId,
            sendType: 1,
            messageType: 1,
            text: this.fastSendAgentMsg[1],
            photo: [],
            payload: "",
            createDate: getSecondsTime(),
            isRead: 2,
        }

        this.sendMessage(data);
        this.sendAgentMsg();
        this.payInfo.hideView();
    }

    /**
     * 模拟商人回复，提醒玩家上传截图
     */
    async sendAgentMsg(welcomeMsg?: string) {
        let msgId = this.getMessageId();
        let data: ChatContentMsg = {
            messageId: msgId,
            sessionId: this.sessionId,
            senderId: this.plyId,
            targetId: this.agentId,
            sendType: 2,
            messageType: 1,
            text: welcomeMsg ? welcomeMsg : this.fastSendAgentMsg[0],
            photo: [],
            payload: "",
            createDate: getSecondsTime(),
            isRead: 2,
        }
        await this.createOneLeftItem(data);
        // 存储本地消息记录
        this.saveMsgToLocal(data);
    }

    /**
     * 点击大类充值方式
     * @param event
     * @param customData
     */
    onClickPaymentMethod(event: cc.Event, customData: string) {
        // console.log("点击大类充值方式  ", customData)
        this.curPayFType = customData;
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
     * 点击小类充值方式
     * @param event
     * @param customData
     */
    async onClickPayType(event: cc.Event, customData: string) {
        // console.log("点击小类充值方式  ", customData)
        this.curPayCType = customData;
        // 自动发送使用什么充值
        let msgId = this.getMessageId();
        let payName = agentUtil.getNameByType(customData, true);
        let fType = agentUtil.getBigIdByPayType(this.curPayFType);
        let cType = agentUtil.getSmallIdByPayType(this.curPayCType);
        let payLoad = {
            "payMethod": fType,
            "payType": cType
        }
        let sendData: ChatContentMsg = {
            messageId: msgId,
            sessionId: this.sessionId,
            senderId: this.plyId,
            targetId: this.agentId,
            sendType: 1,
            messageType: 1,
            text: "使用" + payName + "充值",
            photo: [],
            payload: JSON.stringify(payLoad),
            createDate: getSecondsTime(),
            isRead: 1
        }

        this.sendMessage(sendData);
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
     * 点击下一个支付方式
     */
    onClickNextPayInfo() {
        this.payInfo.switchNextPayInfo();
    }

    /**
     * 滑动事件
     */
    onScrollEvent() {
        // cc.log("<<<<<<<<< 滑动事件 ", this.loadingPageInfo, this.isWaiting, this.scrollView.getScrollOffset().y);
        // 滑到最上面
        if (this.scrollView.getScrollOffset().y < -20 && !this.loadingPageInfo) {
            this.loadingPageInfo = true;
            // cc.log("<<<<<<<<< 滑动事件 ");
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

    async getOrderInfoPage() {
        // showLoading("加载历史消息中");
        this.chgLoadContentAimStatus(true);
        this.curPage++;
        let chatRecordMes = [];
        let number = 0;
        for (let index = this.curPage * 15; index < this.chatHistoryMes.msgs.length; index++) {
            if (index < (this.curPage + 1) * 15 && index < this.chatHistoryMes.msgs.length) {
                number++;
                chatRecordMes.push(this.chatHistoryMes[index]);
            }
        }
        if (number > 0) this.initPageContent(chatRecordMes);
        else this.showAgentTip("没有更多历史消息了!");

        this.chgLoadContentAimStatus(false)
    }

    /**
     * 菊花loading
     * @param isShow
     */
    chgLoadContentAimStatus(isShow: boolean) {
        this.loadingNode.active = isShow;
        this.loadingNode.zIndex = -999;
    }

    async initPageContent(data: ChatContentMsg[]) {
        if (!data) return;
        this.scrollView.stopAutoScroll();
        let highet = this.scrollView.getMaxScrollOffset().y;
        // console.log("----highet-----", highet);
        let firstH = 200;
        for (let i = 0; i < data.length; i++) {
            let tmsg = data[i];
            this.curZIndex--;
            if (tmsg.sendType === 2) {
                //cc.log("<<<<<<<  ", this.curZIndex)
                await this.createOneLeftItem(tmsg, this.curZIndex);
            } else if (tmsg.sendType === 1) {
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
        if (this.emojiKeyboard.active) return;
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
        this.onPlayerInputing();
        if (this.edit.string != "") this.chgSendButtonStatus(false);
        else this.chgSendButtonStatus(true);
    }

    onKeyBoardShow() {
        this.hideEmojpedia();
        this.chgCurShowInputTypeBt(1);
    }

    initEmojClickEvent() {
        for (const emj of agentUtil.allEmoji) {
            let xItem = cc.instantiate(this.emjBtItem);
            xItem.getComponentInChildren(cc.Label).string = emj;
            if (this.emjPage1.childrenCount < 20) this.emjPage1.addChild(xItem);
            else this.emjPage2.addChild(xItem);
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
        if (!this.isChangeInterfaceOrientations) agentUtil.changeInterfaceOrientations('2');
        this.notifySeverExit();
        this.closeAction();
    }

    closeAction() {
        this.onClickManualHideKeyBoard();
        this.node.active = false;
        this.node.removeFromParent(true);
        this.node.destroy();
    }

    notifySeverExit() {
        let sendData = {
            senderId: this.plyId,
            targetId: this.agentId,
            sessionId: this.sessionId,
            content: "玩家主动离开"
        }
        window.recharge.notify(EVENT_MAP.ON_SEND_ENDCHAT, sendData);
    }

    showAgentConfirm(content: string, showCancle: boolean = false) {
        if (this.filler.parent === this.node) this.agentConfirm.y = 0;
        else this.agentConfirm.y = 100;

        this.agentConfirmOkFunc = undefined;
        this.agentConfirm.active = true;
        this.agentConfirmCancleBt.active = showCancle;
    }

    onClcikAgentConfirmDefine() {
        this.agentConfirm.active = false;
        if (this.agentConfirmOkFunc) this.agentConfirmOkFunc();
    }

    onClcikAgentConfirmCancle() {
        this.agentConfirm.active = false;
    }

    /**
     * 手动关闭键盘
     */
    onClickManualHideKeyBoard() {
        console.log("------manualHideKeyBoard-----");
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
        let callback = `if(cc.find('Canvas/parent/agentRechargePlat'))
        cc.find('Canvas/parent/agentRechargePlat').getComponent('agentRechargePlat').adaptiveKeyboardHight(%f);`;
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

    // 键盘弹起后的回调
    adaptiveKeyboardHight(scale: number) {
        // console.log('plat 键盘高度返回====>', scale);
        if (cc.sys.os === cc.sys.OS_ANDROID) {     // android下（emoji 适配）  ios下不需要，否则会引起适配bug
            if (this.emojiKeyboard.active) return;
        }
        this.edit.fontColor = new cc.Color(0, 0, 0, 0);
        this.updateEditBoxLb(this.edit.string);

        let realChgHgt;
        let isSupportNewAgentChat = getStatusBarHeighet(); // 旧版兼容
        if (isSupportNewAgentChat) {
            realChgHgt = this.adaptationHeight * scale - this.adaptationBottomBarH;
        } else {
            realChgHgt = 1136 * scale;
            if (isIphoneX()) realChgHgt -= 15;
        }
        this.keyBoardHight = realChgHgt;
        this.scheduleOnce(() => {
            this.bottomBtsNode.y = this.orgBottomY + realChgHgt;
        }, 0);
        this.onShowKeyBoardScrollViewAdaptive(realChgHgt);
    }

    // 设置键的回车样式
    setKeyBoardReturnType() {
        if (cc.sys.os != cc.sys.OS_ANDROID) {
            this.edit.returnType = cc.EditBox.KeyboardReturnType.SEND;
        }
    }

    /**
     * 代充屏幕适配
     */
    screenAdaptation() {
        if (!getStatusBarHeighet()) {
            console.log("不支持屏幕适配");
            return;
        }
        let canvas = cc.find('Canvas');
        let canvasWidth = canvas.width;
        let canvasHeight = canvas.height;
        let scale = canvasWidth / this.fmsize.width;
        let tmpH = scale * this.fmsize.height;

        this.adaptationHeight = tmpH;
        let barHeight = getStatusBarHeighet();
        let tmpBarH = tmpH * barHeight;  // 状态栏的高度

        let bottomHighet = getTabbarSafeBottomMargin();
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
        this.payInfo.ndInfoBox.y = this.payInfo.ndInfoBox.y + (this.topNode.y - this.orgTopY);
    }

    /**
     * 增加安卓手机返回键监听
     */
    addAndroidBackListen() {
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onClickAndroidBack, this);
    }

    onClickAndroidBack() {
        if (this.payInfo.node.active) {
            this.payInfo.hideView();
        } else {
            cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onClickAndroidBack, this);
            this.onClickCloseBt();
            this.closeAction();
        }
    }

    /**
     * 界面内提示
     * @param content
     */
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
    /**
     * 推送账号异常
     */
    sendActException() {
        let sendData = {
            sessionId: this.sessionId,
            senderId: this.plyId,
            targetId: this.agentId,
            type: this.exceptionPayType,
        }
        window.recharge.notify(EVENT_MAP.ON_SEND_EXCEPTION, sendData);
    }

    private base64Data = "data:image/jpeg;base64,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"
}
