import * as util from "../common/util";
import User from "../common/user";
import { ErrCodes } from "../common/code";
import agentUtil from "./agentUtil"
import { ItemNames, DevStatus } from "../common/enum";
import Lobby from "./lobby";
import g from "../g";
import { showTip, getAvatar, hideLoading, showConfirm, showLoading } from "../common/ui"
import EvalItem from "./evalItem"
import LoginHelper from "../start/loginHelper";
import ChatItem from "./chatItem";
import ListItem from "./listItem";

const { ccclass, property } = cc._decorator;

enum ContentType {
    txtMsg = 1,
    picMsg = 2
}
interface chatMsg {
    uid?: number,
    name?: string,
    date?: number,
    contentType?: number,
    msg?: string,
    type?: number   // 1 系统消息   2 客服消息
}


interface ListMsg {
    date?: number, //当前时间
    msg?: string, //消息
    number?: number, //排队序号
    type?: number //消息类型
}

interface sendMsg {
    // uid?: number,
    contentType?: number,   // 1文字   2图片
    msg?: string
}

interface historyMsg {
    name?: string,   // 客服消息则有姓名
    uid?: number,   // 用户消息则有uid
    role: number,
    type: number,
    date: number,
    contentType: number,
    msg: string
}
interface csInfo {
    isList: number, // 是否在排队，，1=在排队，2=没排队
    name: string, // 客服名字
    vip: number,   // 是否是vip客服，1=客服,2=普通客服
    state: number,  //  1=禁言。2=不禁言
    date: number,  // 禁言结束时间的时间戳
    chatId: string //当前对话客服id

}


interface eval {
    evaluation?: number,
    chatId?: string,
    msg?: string,
    token?: string
}

interface clInfo {
    msg: string,
    date: number,
    name: string

}

@ccclass
export default class CustomerServiceChat extends cc.Component {
    @property(cc.Sprite)
    ctmSvIcon: cc.Sprite = undefined;   // 客服头像

    @property(cc.Label)
    announceName: cc.Label = undefined;   // 宣言的名字

    @property(cc.Label)
    announceContent: cc.Label = undefined;   // 宣言的内容

    @property(ChatItem)
    leftItem: ChatItem = undefined;  // 左边说话

    @property(ChatItem)
    rightItem: ChatItem = undefined;  // 右边说话

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
    filler: cc.Node = undefined;   // 用于弹起键盘后 给scrollview填充

    @property(cc.ScrollView)
    chatScrollView: cc.ScrollView = undefined;

    @property(cc.Label)
    bannedTipLb: cc.Label = undefined;

    @property(cc.Label)
    csTypeLb: cc.Label = undefined;   // 客服小妹  还是  vip客服

    @property(cc.Node)
    emjBtItem: cc.Node = undefined; // 表情

    @property(cc.Node)
    emjiBtn: cc.Node = undefined;   // 表情按钮

    @property(cc.Node)
    keyboardBtn: cc.Node = undefined;   // 键盘按钮

    @property(EvalItem)
    evaluationItem: EvalItem = undefined;   // 评价系统

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


    private ctmSvName: string = undefined; // 客服的名字
    private ctmSvGender: number = undefined; // 客服性别
    private ctmSvAvatar: number = undefined; // 客服头像
    private tmpSp: cc.SpriteFrame = undefined;  // 临时储存的 精灵
    private timeout: number = 15000;
    private curl: string = g.serviceCfg.rechargeQuestionUrl;

    private tmpPath: string = "";
    private pngNumber: number = 0;
    private picAddrss: string = "";

    private showCopyBt: boolean = false;   // 是否显示复制按钮
    private banned: boolean = false;  //  玩家是否被禁言
    private evaluation: number = 2;  // 玩家选择的评价类型
    private lastTime: number = 0;
    private orgBottomY: number = 0;

    private isSendMessger: boolean = true;// 是否可以发信息

    private sendIndex: number = 0; //连续两秒之内发送消息次数

    private orgTopY: number = 568;
    private showEmojiY: number = -268;  // 展示表情键盘时，键盘的Y坐标
    private adaptationHeight: number = 1136;
    private adaptationBottomBarH: number = 0;
    private keyBoardHight: number = 0;
    private fmsize: cc.Size = undefined;
    private rtsize: cc.Size = undefined;
    public tLobby: Lobby = undefined;

    //对话客服ID
    private chatId: string = '';

    onLoad() {
        this.fmsize = cc.view.getFrameSize();
        this.rtsize = cc.view.getDesignResolutionSize();
        this.chatServiceHandShake();
        this.tLobby = cc.find('lobby').getComponent(Lobby);

        // 初始化 图片暂存地址
        if (cc.sys.isNative) {
            this.picAddrss = jsb.fileUtils.getWritablePath() + "ctmtmp.jpg";
        }

        this.orgTopY = this.topNode.y;
        this.orgBottomY = this.bottomBtsNode.y;
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
    }

    addExtraListeners() {
        cc.log("---addExtraListeners----");
        let pomelo = window.kefu;
        pomelo.on("server.redHot", this.redHot.bind(this));
        pomelo.on("server.chatMsg", this.chatMsg.bind(this));
        pomelo.on("server.user.cs", this.userCs.bind(this));
        pomelo.on("server.user.shutUp", this.userShutUp.bind(this));
        pomelo.on("server.chatMsgHistory", this.chatMsgHistory.bind(this));
        pomelo.on("server.user.declaration", this.userDeclaration.bind(this));
        pomelo.on("server.user.close", this.customSevicerCloseChat.bind(this)); //客服关闭聊天
        pomelo.on("server.user.list", this.userListMessger.bind(this)); //排队
        pomelo.on("heartbeat timeout", this.heartbeatTimeout.bind(this));
    }
    removeExtraListeners() {
        let pomelo = window.kefu;
        pomelo.off("server.redHot");
        pomelo.off("server.chatMsg");
        pomelo.off("server.user.cs");
        pomelo.off("server.user.shutUp");
        pomelo.off("server.sendVerifyCode");
        pomelo.off("server.user.declaration");
        pomelo.off("server.user.close");
        pomelo.off("server.user.list");
        pomelo.off("heartbeat timeout");
    }
    onDestroy() {
        agentUtil.changeInterfaceOrientations("2");
        this.removeExtraListeners();
    }

    /**
     * 收到服务器排队消息
     * @param data
     */
    userListMessger(data?: ListMsg) {
        // console.log('调用===');

        // console.log("this.listItem=====", this.listItem);

        // this.listItem.active = true;

        let listItem = cc.instantiate(this.listItem);
        listItem.active = true;
        console.log("listItem====", listItem);
        let listSp = listItem.getComponent(ListItem);
        listSp.setMessgeAction(data);
        // let evalSp = evalution.getComponent(EvalItem);
        // listItem.setChatId(this.chatId);
        this.contentNode.addChild(listItem);
    }

    /**
     * 红点
     * @param data
     */
    redHot(data: any) {
        cc.log("---redHot--", data);
    }

    /**
     * 客服发送的消息
     * @param data
     */
    chatMsg(data: chatMsg, isCloes?: boolean) {
        cc.log("---chatMsg--", data);
        let date = util.formatTimeStr('m', data.date);
        if (!this.node.active) {
            if (this.tLobby && this.tLobby.node.active) {
                this.tLobby.showMessagePrompt(true);
            } else {
                if (data.type != 1 && data.type) {
                    util.setIsMessger(true);
                }
            }
        }

        this.createOneLeftItem(data);
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
     * 本次的客服信息
     * @param data
     */
    userCs(data: csInfo) {
        cc.log("---userCs--", data);
        this.chgBannedTipShowState(data.state === 1);
        if (data.chatId && data.chatId != "") {
            this.chatId = data.chatId;
        }
        if (data.vip === 1) {  // 是vip客服
            this.setCtmSvIcon(2, Math.floor(Math.random() * 7 + 2));
        } else {
            this.setCtmSvIcon(2, 1);
        }
    }

    userDeclaration(data: { msg: string, name: string }) {
        this.setCtmSvIcon(2, Math.floor(Math.random() * 7 + 2));
        this.announceContent.string = data.msg;
        this.csTypeLb.string = (data.name ? data.name : this.csTypeLb.string) + ":";
        this.announceName.string = (data.name ? data.name : this.csTypeLb.string) + ":";
    }

    async initContent(historyMsgs: historyMsg[]) {
        if (historyMsgs) {
            for (let i = 0; i < historyMsgs.length; i++) {
                let msg = historyMsgs[i];
                if (msg.name) {  // 有name 表示是 客服的发送的消息
                    await this.createOneLeftItem(msg);
                } else {
                    await this.createOneRightItem(msg, true);
                }
            }
        }
    }

    /**
     * 用户禁言开关
     * @param data state  1=禁言。2=不禁言      date  禁言结束时间的时间戳
     */
    userShutUp(data: { state: number, date: number }) {
        cc.log("---userShutUp--", data);
        this.chgBannedTipShowState(data.state === 1);
    }

    /**
     * 历史消息
     * @param data
     */
    chatMsgHistory(data: any) {
        cc.log("---chatMsgHistory--", data);
    }

    scrollviewToBottom() {
        if (this.contentNode.height > this.chatScrollView.node.height) this.chatScrollView.scrollToBottom();
        this.cbBotBtn.active = false;
    }

    // 设置客服的头像
    setCtmSvIcon(gender: number, avatar: number) {
        this.ctmSvIcon.spriteFrame = getAvatar(gender === 1 ? true : false, avatar);
    }

    // 设置宣言
    setAnnounce(announceContent: string) {
        this.announceName.string = this.ctmSvName;
        this.announceContent.string = announceContent;
    }

    // 创建一个 客服说话的聊天内容
    createOneLeftItem(data: chatMsg, zIndex?: number) {
        return new Promise(async reslove => {
            cc.log("-----createOneLeftItem----", data);
            let leftItem = this.leftItem;
            leftItem.resetChatLabel();
            leftItem.chatLb.node.active = true;
            let name = data.type === 1 ? "系统消息：" : (data.name ? data.name + ':' : this.csTypeLb.string + ':');
            leftItem.setCtmSvNameLabel(name);

            if (data.contentType === 2) {  // 图片
                leftItem.image.node.active = true;
                leftItem.chatLb.node.active = false;
                if (cc.sys.isNative) {
                    this.saveBase64ToFile(data.msg);
                    await this.loadTmpPng();
                    leftItem.setImage(this.tmpSp);
                }
            } else {  // 文字
                leftItem.image.node.active = false;
                leftItem.chatLb.node.active = true;
            }

            leftItem.setChatMessger(data);
            this.createTimeLabel(data.date);
            // leftItem.setChatMessger(data);
            leftItem.resetCopyBtShow(this.showCopyBt);
            let nLeftItem = cc.instantiate(leftItem.node);
            let chatItem = nLeftItem.getComponent(ChatItem);
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
    createOneRightItem(data: chatMsg, isHistory: boolean, zIndex?: number): Promise<cc.Node> {
        return new Promise(async reslove => {
            cc.log("-----createOneRightItem----", data);
            let rightItem = this.rightItem;
            rightItem.resetChatLabel();
            if (data.contentType === 2) {  // 图片
                rightItem.image.node.active = true;
                rightItem.chatLb.node.active = false;
                if (cc.sys.isNative) {
                    if (isHistory) {
                        this.saveBase64ToFile(data.msg);
                    }
                    await this.loadTmpPng();
                    rightItem.setImage(this.tmpSp);
                }
            } else {  // 文字
                rightItem.image.node.active = false;
                rightItem.chatLb.node.active = true;
            }
            let xdate = Date.now();
            if (isHistory) xdate = data.date;
            rightItem.setTimeLbStr(xdate);
            this.createTimeLabel(data.date);

            // rightItem.setChatMessger(data);
            rightItem.setChatMessger(data);
            rightItem.resetCopyBtShow(this.showCopyBt);

            let nRightItem = cc.instantiate(rightItem.node);
            let chatItem = nRightItem.getComponent(ChatItem);
            // chatContent.setChatMessger(data);
            chatItem.adaptiveChatLabel(1);
            if (data.contentType === 2) {
                chatItem.setChatTimeLabelColor();
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
        let evalution = cc.instantiate(this.evaluationItem.node);
        evalution.active = true;
        let evalSp = evalution.getComponent(EvalItem);
        evalSp.setChatId(this.chatId);
        this.contentNode.addChild(evalution);
    }

    createTimeLabel(time: number) {
        let showTimeString = "";
        let tDate, nDate, showTime;

        let willShow = false;
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

    /**
     * 提交评价
     * @param evaluation 评价选项
     * @param str 评价内容
     */
    sendEvaluation(params: string, callback: Function) {
        console.log('params====>', params);
        let url = this.curl + '/s/evaluation'; //正式
        let xhr = new XMLHttpRequest();
        xhr.open('POST', url);
        xhr.timeout = 30000;
        xhr.setRequestHeader('Content-Type', "application/json");
        // xhr.setRequestHeader('Authorization', token);
        let self = this;
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status >= 200 && xhr.status < 400) {
                    let response = xhr.responseText;
                    if (response) {
                        let responseJson = JSON.parse(response);
                        console.log('responseJson-------', responseJson);
                        if (responseJson.code === 200) {
                            callback(true);
                            showTip("感谢您作出的评价～");
                        } else {
                            callback(false);
                            showTip(ErrCodes.getErrStr(responseJson.code, "评价失败"));
                        }
                    } else {
                        console.log('返回数据不存在');
                        callback(false);
                    }
                }
            } else {
                console.log('请求失败--', xhr.readyState);
                // callback(false);
            }
        }
        xhr.ontimeout = function () {
            hideLoading();
            console.log('网络连接超时');
            showConfirm("网络连接超时");
            self.onClickManualHideKeyBoard();
        };
        xhr.onerror = function () {
            hideLoading();
            console.log('不明错误哦');
            showConfirm("网络错误");
            self.onClickManualHideKeyBoard();
        };
        xhr.send(params);
    }
    onClickCloseEvaluation() {
        this.evaluationNode.active = false;
    }
    onClickEvaluationSelector(event: cc.Event, customData: string) {
        this.evaluation = +customData;
    }

    onClickSendMsgBt() {
        if (!this.edit.string || this.edit.string === "") {
            showTip("发送消息不能为空！");
            return;
        }
        // this.emjiBtn.active = true;
        // this.keyboardBtn.active = false;
        let senddata: sendMsg = {
            msg: this.edit.string,
            contentType: ContentType.txtMsg,
            // uid: User.instance.uid
        };
        this.sendMessage(senddata);
        this.edit.string = "";
        this.onClickClearTextField();
        this.chgSendButtonStatus(true);
    }

    // 发送消
    async sendMessage(sendData: sendMsg, isclearEdit: boolean = true) {
        if (this.banned) {
            showTip("客服MM忙线中··  请您稍作等待~");
            return;
        }

        let chatItem = await this.createOneRightItem(sendData, false);
        if (window.kefu.socketReadyState() > 1) {
            showTip("网络连接失败，请退出重连！");
            chatItem.getComponent(ChatItem).setLoseNodeVisbel(true);
            return;
        }

        let timer = setTimeout(() => {
            clearTimeout(timer);
            // console.log("消息发送失败===")
            showTip("网络连接失败，请退出重连！");
            chatItem.getComponent(ChatItem).setLoseNodeVisbel(true);
        }, 30000);

        // console.log("chatItem====>", chatItem);
        window.kefu.request("request.user.chatMsg", sendData, (data: { code: number }) => {
            clearTimeout(timer);
            if (data.code === 200) {
                chatItem.getComponent(ChatItem);
                if (isclearEdit) {
                    this.edit.string = "";
                    this.onClickClearTextField();
                }
            } else {
                showTip(ErrCodes.getErrStr(data.code, "发送信息失败"));
                chatItem.getComponent(ChatItem).setLoseNodeVisbel(true);
            }
        });
    }

    // 选择图
    onClcikChoosePic() {
        if (this.banned) {
            showTip("客服MM忙线中··  请您稍作等待~");
            return;
        }

        this.hideEmojpedia();
        this.onClickManualHideKeyBoard();

        this.pngNumber++;
        this.tmpPath = this.picAddrss + this.pngNumber + ".png";
        cc.loader.release(this.tmpPath);
        let callback = `cc.find('Canvas/parent/chatService').getComponent('customerServiceChat').choosePicCallBack();`;
        console.log("testimg");
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
        let data: any = jsb.fileUtils.getDataFromFile(this.tmpPath);
        let base64data = this.arrayBufferToBase64(data);
        if (base64data === "data:image/jpeg;base64,") {
            showTip("选取图片失败，请重试")
            return;
        }
        let senddata: sendMsg = {
            msg: base64data,
            contentType: ContentType.picMsg,
            // uid: User.instance.uid
        };

        if (jsb.fileUtils.isFileExist(this.tmpPath)) {
            let self = this;
            cc.loader.load({ url: this.tmpPath, type: 'jpeg' }, (err: any, sp: cc.Texture2D) => {
                self.tmpSp = new cc.SpriteFrame(sp);
                // this.createOneRightItem(senddata, false);
                this.sendMessage(senddata);
            });
        }
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
                    console.log("=send png===1=" + this.tmpPath);
                    if (err) {
                        console.log("=send png===2=" + err);
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
        this.node.active = false;
    }

    /*
    * 键盘自适应相关
    */
    onKeyBoardHide(event: cc.Event.EventTouch, ss: string) {
        console.log("--调用--onKeyBoardHide----")
        this.edit.fontColor = new cc.Color(0, 0, 0, 255);
        this.scheduleOnce(() => {
            this.updateEditBoxLb(this.edit.string);
        }, 0.5);
        if (!this.emojiKeyboard.active) {
            this.chgCurShowInputTypeBt(1);
            this.bottomBtsNode.y = this.orgBottomY;
            this.filler.parent = this.node;
        }

        // if (this.emojiKeyboard.active) {
        //     this.hideEmojpedia();
        // }
        // this.bottomBtsNode.y = this.orgBottomY;
        // console.log("this.bottomBtsNode.y==9999999===>>", this.bottomBtsNode.y);
        // this.filler.parent = this.node;
        // this.keyboardBtn.active = false;
        // this.emjiBtn.active = true;
    }

    // 当开始编辑的时候
    onKeyBoardShow() {
        console.log("--调用--onKeyBoardShow----")
        // this.keyboardBtn.active = false;
        // this.emjiBtn.active = true;
        this.hideEmojpedia();
        this.chgCurShowInputTypeBt(1);
    }

    onEditTextChg() {
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
        console.log('键盘高度返回====>', scale);
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
        let callback = `if(cc.find('Canvas/parent/chatService'))
        cc.find('Canvas/parent/chatService').getComponent('customerServiceChat').adaptiveKeyboardHight(%f);`;
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

    chgBannedTipShowState(isShow: boolean, content?: string) {
        if (isShow) {
            this.bannedTipLb.node.parent.active = true;
            this.bannedTipLb.string = content ? content : "客服正忙，请等待";
            this.edit.placeholder = "";
        } else {
            this.bannedTipLb.node.parent.active = false;
            this.edit.placeholder = "";
        }
        this.banned = isShow;
    }

    // pomelo 相关
    chatServiceHandShake() {
        showLoading('连线中...');
        return new Promise(async (resolve: (ret: number | number[]) => void, reject) => {
            let pomelo = window.kefu;
            let timeout = this.timeout;
            pomelo.disconnect();
            let timer = setTimeout(function () {
                pomelo.off();
                pomelo.disconnect();
                hideLoading();
                showTip("连接服务器超时");
                resolve(506);
            }, timeout);

            function errCb(event: Event) {
                console.log('io-error=========', event)
                showTip("连接失败")
                clearTimeout(timer);
                hideLoading();
                resolve(505);
            }

            let cls = function () {
                clearTimeout(timer);
                console.log("socket is close====");
                hideLoading();
                resolve(505);
            }
            pomelo.once("io-error", errCb);
            let log = (s: string) => {
                console.log("----chatService---", s);
            }
            let c = Math.random().toFixed(8);
            let self = this;
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
                self.addExtraListeners();
                pomelo.on("server.sendVerifyCode", (data: { code: string }) => {
                    clearTimeout(time);
                    if (data === undefined || data.code === undefined) {
                        showTip("连线失败");
                        hideLoading();
                        return;
                    }
                    let loginToken = localStorage.getItem(ItemNames.token);
                    let md5token = md5(loginToken + data.code + c);
                    pomelo.request("request.verify", { token: md5token }, (data: {
                        code: number, historyMsgs: historyMsg[],
                    }) => {
                        clearTimeout(time);
                        if (data.code != 200) {
                            showTip(ErrCodes.getErrStr(data.code, "连接失败!"));
                            resolve(data.code);
                            return;
                        }
                        showTip("连线成功");
                        self.initContent(data.historyMsgs);
                        hideLoading();
                    });
                });
                hideLoading();
                resolve(200);
            }

            let fastestServer;
            if (g._dev === DevStatus.OFFICIAL) {
                fastestServer = await LoginHelper.getFastestServer(g.gameServers);
            } else if (g._dev === DevStatus.OUT_DEV) {
                fastestServer = "ws://154.211.161.217:7066";    //ws://" + g.gameServers;
            } else {
                showTip("本地不支持在线客服！");
                return;
            }
            let curl = fastestServer + `/ws/chat?type=g&id=${User.uid}&c=${c}`;
            cc.log('curl====888======', curl);
            pomelo.init({ url: curl, initCallback: initCallback, customLog: log });
        });
    }

    /**
    * 客服关闭聊天，聊天结束
    * @param data
    */
    customSevicerCloseChat(data: clInfo) {
        console.log('--custoSevicerCloseChat--', data);
        showTip('聊天已结束！');
        // this.onClickShowEvaluation();

        //先创建一个客服结束语，在创建一个评价系统

        let msgData: chatMsg = {};

        msgData.contentType = 1;
        msgData.date = data.date;
        msgData.name = data.name;
        msgData.msg = data.msg;
        msgData.type = 2;


        this.createOneLeftItem(msgData);
        this.createEvaluationItem();
        this.removeExtraListeners();
        window.kefu.disconnect();
    }

    registerPomelo() {
        let pomelo = window.kefu;
        pomelo.off("disconnect");
        let self = this;
        pomelo.on("disconnect", async function () {
            pomelo.off("disconnect");
            cc.log("聊天连接已断开...");
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
                console.log('出现底部回弹-===');
                this.cbBotBtn.active = true;
                if (this.messgerCont > 0) {
                    this.messgerContLabel.node.parent.active = true;
                } else {
                    this.messgerContLabel.node.parent.active = false;
                }
            }
        } else {
            if (this.cbBotBtn.active) {
                console.log('关闭底部回弹====');
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

    heartbeatTimeout() {
        console.log("心跳超时===,断线重连");
        this.removeExtraListeners();
        if (this.node.active) {
            let time = setTimeout(() => {
                clearTimeout(time);
                this.chatServiceHandShake();
            }, 5000)
        }
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
     * 代充屏幕适配
     */
    screenAdaptation() {
        if (!util.getStatusBarHeighet()) {
            cc.log("不支持屏幕适配");
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
}