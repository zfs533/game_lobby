import { hideLoading } from "../common/ui";
import AgentRecharge from "./agentRecharge"
import OrderTrack from "./orderTrack";
import AgentChat, { ChatInfo, AcceptChatMsg } from "./agentChat";
import RechargeMessage, { rechargeMessageInfo } from "./rechargeMessage";
import Lobby from "./lobby";
import user from "../common/user";
import AgentRechargePlat from "./rechargeChat/agentRechargePlat";
import { toj, fitCanvas } from "../common/util";
import { WelfareResult } from "./welfareEvents";
import net from "../common/net";
import VipVideo from "./vipWelfare/vipVideo";

class AgentUtil {
    chatUnreadMsgIdList: string[] = [];
    agentChat: AgentChat = undefined;
    agentRecharge: AgentRecharge = undefined;
    agentRechargePlat: AgentRechargePlat = undefined;
    orderTrack: OrderTrack = undefined;
    names = ["支付宝", "微信", "银联", "信用卡", "花呗", "云闪付", "qq支付", "京东支付", "其他",
        "支付宝大额", "微信大额", "银联大额", "信用卡大额", "花呗大额", "云闪付大额", "qq支付大额", "京东支付大额",];
    payName = ["账号", "二维码", "支付宝大额", "微信大额", "银联大额", "信用卡大额", "花呗大额", "云闪付大额", "qq支付大额", "京东支付大额"];

    allPayType: string[] = [];

    fmsize: cc.Size = cc.view.getFrameSize();
    rtsize: cc.Size = cc.view.getDesignResolutionSize();
    isInited: boolean = false;
    rechargeRebateInfo: WelfareResult;
    public tmpPath: string = undefined;
    public picAddrss: string = "";
    public lobbyParent: cc.Node = undefined;

    public platWsUrl: string = "";          // 代充平台ws地址
    public platFileSeverUrl: string = "";   // 代充平台文件服务器地址
    public curAgentInfo: ps.ChatClientHandlerMatchAgent_Agents = undefined;    // 代充平台当前点击聊天的商人信息

    allEmoji: string[] = [
        "😁", "😂", "😅", "😆", "😉", "😊", "😋", "😎", "😍", "😘", "😚", "🙂", "🤗", "🤔", "😐", "😶", "🙄", "😏",
        "😣", "😥", "😮", "🤐", "😯", "😫", "😴", "😌", "😛", "😜", "😝", "😒", "😓", "😔", "😕", "🙃", "🤑", "😲", "🙁", "😖"
    ];

    public agentsData: ps.ChatClientHandlerMatchAgent_Agents[] = [];
    /**
     * 打开旧版代充面板
     * @param data
     * @param agentRechargePrb
     * @param lobbyParent
     * @param orderTrack
     * @param isServer
     */
    async createAgentRecharge(data: ChatInfo, agentRechargePrb: cc.Prefab, lobbyParent: cc.Node, orderTrack: OrderTrack, isServer: boolean) {
        hideLoading();
        this.changeInterfaceOrientations("1");
        this.lobbyParent = lobbyParent;
        let agentRechargeNode = lobbyParent.getChildByName("agentRecharge");
        if (!agentRechargeNode) {
            agentRechargeNode = cc.instantiate(agentRechargePrb);
            lobbyParent.addChild(agentRechargeNode);
        } else {
            agentRechargeNode.active = true;
        }
        let obj = agentRechargeNode.getComponent(AgentRecharge);
        if (orderTrack) obj.initOrderTrack(orderTrack);
        obj.init(data, isServer);
        obj.lobbyParent = lobbyParent;
    }

    /**
     * 打开新版代充面板
     * @param data
     * @param agentRechargePrb
     * @param lobbyParent
     * @param orderTrack
     * @param isServer
     */
    async createAgentRechargePlat(data: ps.ChatClientHandlerMatchAgent_Agents, agentRechargePrb: cc.Prefab, lobbyParent: cc.Node, isServer: boolean) {
        try {
            hideLoading();
            this.changeInterfaceOrientations("1");
            this.lobbyParent = lobbyParent;
            let agentRechargeNode = lobbyParent.getChildByName("agentRechargePlat");
            if (!agentRechargeNode) {
                agentRechargeNode = cc.instantiate(agentRechargePrb);
                lobbyParent.addChild(agentRechargeNode);
            } else {
                agentRechargeNode.active = true;
            }
            let obj = agentRechargeNode.getComponent(AgentRechargePlat);
            obj.init(data, isServer);
            obj.lobbyParent = lobbyParent;
        } catch (error) {
            cc.log(error);
        }
    }

    /**
     * 通过支付类型获取图片数组下标
     * @param type 支付类型
     * @param isDE 是否为大额
     */
    getIndexByType(type: string, isDE: boolean) {
        let num = 0;
        if (isDE) {
            num = this.getIndexByTypeDE(type);
            if (num > 0) return num;
        }
        if (type.indexOf('ali_pay') != -1) {
            return 0
        } else if (type.indexOf('wx_pay') != -1) {
            return 1
        } else if (type.indexOf('union_pay') != -1) {
            return 2
        } else if (type.indexOf('xy_pay') != -1) {
            return 3
        } else if (type.indexOf('hb_pay') != -1) {
            return 4
        } else if (type.indexOf('yun_pay') != -1) {
            return 5
        } else if (type.indexOf('qq_pay') != -1) {
            return 6
        } else if (type.indexOf('jd_pay') != -1) {
            return 7
        } else {
            return 8
        }
    }
    /**
     * 大额的判断
     */
    getIndexByTypeDE(type: string) {
        if (type === "ali_pay_b" || type === "ali_pay_qr_b") {
            return 9
        } else if (type === 'wx_pay_b' || type === 'wx_pay_qr_b') {
            return 10
        } else if (type === 'union_pay_b' || type === 'union_pay_qr_b') {
            return 11
        } else if (type === 'xy_pay_b' || type === 'xy_pay_qr_b') {
            return 12
        } else if (type === 'hb_pay_b' || type === 'hb_pay_qr_b') {
            return 13
        } else if (type === 'yun_pay_b' || type === 'yun_pay_qr_b') {
            return 14
        } else if (type === 'qq_pay_b' || type === 'qq_pay_qr_b') {
            return 15
        } else if (type === 'jd_pay_b' || type === 'jd_pay_qr_b') {
            return 16
        }
    }

    getByTypeDE(type: string) {
        if (type.indexOf('pay_act') != -1 && type.indexOf('_b') == -1) {
            return 0
        } else if (type.indexOf('pay_qr') != -1 && type.indexOf('_b') == -1) {
            return 1
        } else if (type === "ali_pay_b" || type === "ali_pay_qr_b") {
            return 2
        } else if (type === 'wx_pay_b' || type === 'wx_pay_qr_b') {
            return 3
        } else if (type === 'union_pay_b' || type === 'union_pay_qr_b') {
            return 4
        } else if (type === 'xy_pay_b' || type === 'xy_pay_qr_b') {
            return 5
        } else if (type === 'hb_pay_b' || type === 'hb_pay_qr_b') {
            return 6
        } else if (type === 'yun_pay_b' || type === 'yun_pay_qr_b') {
            return 7
        } else if (type === 'qq_pay_b' || type === 'qq_pay_qr_b') {
            return 8
        } else if (type === 'jd_pay_b' || type === 'jd_pay_qr_b') {
            return 9
        }
    }

    /**
     * 代充平台通过支付类型获取ID(支付大类)
     */
    getBigIdByPayType(type: string) {
        if (type.indexOf('ali_pay') != -1) {
            return 101;
        } else if (type.indexOf('wx_pay') != -1) {
            return 102;
        } else if (type.indexOf('union_pay') != -1) {
            return 103;
        } else if (type.indexOf('xy_pay') != -1) {
            return 104;
        } else if (type.indexOf('hb_pay') != -1) {
            return 105;
        } else if (type.indexOf('yun_pay') != -1) {
            return 106;
        } else if (type.indexOf('qq_pay') != -1) {
            return 107;
        } else if (type.indexOf('jd_pay') != -1) {
            return 108;
        }
    }

    /**
     * 代充平台通过支付类型获取ID（支付小类）
     * 账号：1  小额扫码：2   大额扫码：3
     */
    getSmallIdByPayType(type: string) {
        if (type.indexOf('act') != -1) {
            return 1;
        } else if (type.indexOf('qr_b') != -1) {
            return 3;
        } else {
            return 2;
        }
    }

    getFPayTypeByBigId(id: number) {
        let str = "";
        switch (id) {
            case 101:
                str = "ali_pay";
                break;
            case 102:
                str = "wx_pay";
                break;
            case 103:
                str = "union_pay";
                break;
            case 104:
                str = "xy_pay";
                break;
            case 105:
                str = "hb_pay";
                break;
            case 106:
                str = "yun_pay";
                break;
            case 107:
                str = "qq_pay";
                break;
            case 108:
                str = "jd_pay";
                break;
            default:
                break;
        }
        return str;
    }

    getNameByType(type: string, isDE: boolean) {
        return this.names[this.getIndexByType(type, isDE)];
    }

    getNameByPayType(type: string) {
        return this.payName[this.getByTypeDE(type)];
    }

    addUnReadMsg(data: AcceptChatMsg) {
        if (this.agentRecharge) {
            this.agentRecharge.handleChatToClientMsg(data);
        }
    }

    decReadMsg(unreadId: string) {
        let index = this.chatUnreadMsgIdList.indexOf(unreadId);
        if (index >= 0) {
            this.chatUnreadMsgIdList.splice(index, 1);
        }
        this.dealAgentChatUnreadTip();
        this.dealOrderTrackUnreadTip(unreadId, false);
    }

    dealOrderTrackUnreadTip(unreadId: string, isshow: boolean) {
        if (this.orderTrack) {
            this.orderTrack.checkShowUnread(unreadId, isshow);
        }
    }
    dealAgentChatUnreadTip() {
        if (this.agentChat) {
            this.agentChat.unReadTip.active = this.chatUnreadMsgIdList.length > 0 ? true : false;
        }
    }

    getSupportNewAgentChatRcg() {
        let support = true;
        // if (!cc.sys.isNative) {
        //     support = true;
        // } else if (cc.sys.os === cc.sys.OS_IOS) {
        //     if (window.jsclass !== undefined) {
        //         support = JsClass.haveNewAgentChat();
        //     } else {
        //         support = jsb.reflection.callStaticMethod("NativeUtil", "haveNewAgentChat");
        //     }
        // } else if (cc.sys.os === cc.sys.OS_ANDROID) {
        //     support = jsb.reflection.callStaticMethod("util/NativeUtil", "haveNewAgentChat", "()Z");
        // }
        return support;
    }

    changeInterfaceOrientations(Orientations: string, isUrl: boolean = false) {
        if (!this.getSupportNewAgentChatRcg()) return;
        if (!this.isInited) return;
        if (cc.sys.os === cc.sys.OS_IOS) {
            if (window.jsclass !== undefined) {
                JsClass.setInterfaceOrientations(Orientations);
            } else {
                jsb.reflection.callStaticMethod("NativeUtil", "setInterfaceOrientations:", Orientations);
            }
        } else if (cc.sys.os === cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod("util/NativeUtil", "setInterfaceOrientations", "(Ljava/lang/String;)V", Orientations);
        }
        let canvas = cc.find('Canvas');
        if (!canvas) {
            return;
        }
        console.log("------his.fmsize-----", this.fmsize.height, this.fmsize.width);
        console.log("------his.rtsize-----", this.rtsize.height, this.rtsize.width);
        if ("1" === Orientations) {

            this.setEditboxKeepCCCOriginalStyle(!isUrl);
            this.setEnableKeyboardCallBack(!isUrl);
            this.setKeyboardDisplayedAllowSwipeScreen(!isUrl);



            cc.view.setFrameSize(this.rtsize.height, this.rtsize.width);
            cc.view.setDesignResolutionSize(this.rtsize.height, this.rtsize.width, cc.ResolutionPolicy.SHOW_ALL);
            cc.view.setOrientation(cc.macro.ORIENTATION_PORTRAIT);
            canvas.getComponent(cc.Canvas).designResolution = cc.size(640, 1136);
            canvas.width = 640;
            canvas.height = 1136;
            canvas.getComponent(cc.Canvas).fitHeight = true;
            canvas.getComponent(cc.Canvas).fitWidth = true;
            console.log("-------------" + canvas.getComponent(cc.Canvas).designResolution)
            console.log("-------------canvas.width" + canvas.width)
            console.log("-------------canvas.height" + canvas.height)
        } else {

            this.setEditboxKeepCCCOriginalStyle(false);
            this.setEnableKeyboardCallBack(false);
            this.setKeyboardDisplayedAllowSwipeScreen(false);

            cc.view.setFrameSize(this.rtsize.width, this.rtsize.height);
            cc.view.setOrientation(cc.macro.ORIENTATION_LANDSCAPE);
            cc.view.setDesignResolutionSize(this.rtsize.width, this.rtsize.height, cc.ResolutionPolicy.SHOW_ALL);
            fitCanvas(canvas);
        }
    }

    init() {
        this.fmsize = cc.view.getFrameSize();
        this.rtsize = cc.view.getDesignResolutionSize();
        this.isInited = true;
    }

    async sendChatEnter() {
        if (this.agentChat) {
            this.agentChat.addExtraListeners();
        }
    }

    /**
     * 初始是否有新的消息
     */
    initRedDot() {
        let message1: rechargeMessageInfo[] = this.getIsPlatSaveMsgToLocal();
        // let message1: rechargeMessageInfo[] = toj(localStorage.getItem(user.uid + "-messageInfos"));
        let messageNum1: boolean = false;
        if (message1 && message1.length !== 0) {
            for (let index = 0; index < message1.length; index++) {
                if (message1[index].messageNum > 0) messageNum1 = true;
            }
        } else {
            messageNum1 = false;
        }
        let s = cc.director.getScene();
        let no: cc.Node
        if (s) no = s.getChildByName("lobby");
        let lobby: Lobby
        if (no) {
            lobby = no.getComponent(Lobby);
            lobby.isNewMess = messageNum1;
            lobby.newMess.active = lobby.isNewMess;
        }
        if (this.agentChat && this.agentChat.redDot) this.agentChat.redDot.active = lobby.isNewMess
        localStorage.setItem("isNewMess", JSON.stringify(messageNum1));
    }

    /**
     * 新消息的数量
     */
    newRecMesNum(data: AcceptChatMsg) {
        // let message1: rechargeMessageInfo[] = toj(localStorage.getItem(user.uid + "-messageInfos"));
        let message1: rechargeMessageInfo[] = this.getIsPlatSaveMsgToLocal();
        let messageNum1 = 0;
        if (message1 && message1.length !== 0) {
            for (let index = 0; index < message1.length; index++) {
                if (message1[index].localChatId === data.localChatId) {
                    messageNum1 = message1[index].messageNum;
                }
            }
        }
        messageNum1++;
        return messageNum1;
    }

    handleChatToClientMsg(data: AcceptChatMsg) {
        let localChatId = data.localChatId ? data.localChatId : user.uid + "-" + data.aUid;
        let chatRecordMes: ChatInfo = toj(localStorage.getItem(localChatId));
        chatRecordMes.msgs.unshift(data);
        localStorage.setItem(localChatId, JSON.stringify(chatRecordMes))
        let agentRecharge: cc.Node;
        if (this.lobbyParent && this.lobbyParent.children != null) {
            agentRecharge = this.lobbyParent.getChildByName("agentRecharge");
        }
        if (agentRecharge) {
            agentUtil.addUnReadMsg(data);
        } else {
            let chatRecordMes: ChatInfo = toj(localStorage.getItem(localChatId));
            let messageNum1 = agentUtil.newRecMesNum(data);
            let message = agentUtil.messageLocalRecord(false, chatRecordMes, messageNum1);
            agentUtil.messageRecordSaving(message);
            agentUtil.initRedDot();
        }
    }

    handleOutlineUnReadMsg(data: ps.ChatClientHandlerGetUnreadMsg) {
        if (data.code === 200 && data.chatMsgs) {
            let chatId = "";
            for (let i = 0; i < data.chatMsgs.length; i++) {
                let msg = data.chatMsgs[i];
                let newMsg: AcceptChatMsg = {
                    code: data.code,
                    chatId: msg.chatId,
                    msgId: "",
                    type: msg.type,
                    content: msg.content,
                    createDate: msg.createDate,
                    aUid: msg.aUid,
                    uid: msg.uid,
                    fromType: msg.fromType,
                }
                this.handleChatToClientMsg(newMsg);
                if (chatId !== msg.chatId) {
                    chatId = msg.chatId;
                    net.request("chat.clientHandler.readChatMsg", { chatId: chatId });
                }
            }
        }
    }

    /**
    * 消息本地记录
    */
    messageLocalRecord(isPlat: boolean, data: any, num: number) {
        let content = "图片";
        let time = 0;
        let isExist = false;

        if (!isPlat) {
            if (data.msgs.length !== 0) {
                if (data.msgs[0].type !== 5) {
                    content = data.msgs[0].content;
                    if (!content && data.msgs[0].text) {
                        content = data.msgs[0].text;
                    }
                } else {
                    content = "图片";
                }
                isExist = true;
            }
        } else {
            if (data.msgs.length !== 0) {
                if (data.msgs[0].messageType !== 2) {
                    content = data.msgs[0].text;
                    if (!content && data.msgs[0].content) {
                        content = data.msgs[0].content;
                    }
                } else {
                    content = "图片";
                }
                isExist = true;
            }
        }
        if (isExist) time = data.msgs[0].createDate;
        else content = "";
        let message: rechargeMessageInfo = {
            content: content,
            aName: data.aName,
            createDate: time,
            messageNum: num,
            chatId: data.chatId,
            aUid: data.aUid,
            aHead: data.aHead ? data.aHead : "",
            localChatId: data.localChatId ? data.localChatId : "",
            // pays: this.agentRechargePlat.agentPayTypes ? this.agentRechargePlat.agentPayTypes : this.agentRechargePlat.agentPayTypes = [],
        }
        if (isPlat) {
            message.pays = this.agentRechargePlat.agentPayTypes ? this.agentRechargePlat.agentPayTypes : this.agentRechargePlat.agentPayTypes = []
        }
        return message;
    }

    /**
    * 消息记录保存
    * @param data
    */
    messageRecordSaving(data: rechargeMessageInfo) {
        // let message: rechargeMessageInfo[] = toj(localStorage.getItem(user.uid + "-messageInfos"));
        let message: rechargeMessageInfo[] = this.getIsPlatSaveMsgToLocal();
        let num = 0;
        let idx = 0;

        if (message && message.length > 0) {
            for (let index = 0; index < message.length; index++) {
                if (message[index].localChatId === data.localChatId) {
                    message[index] = data;
                    idx = index;
                    num++;
                }
            }
            let mes = message[idx];
            message.splice(idx, 1);
            message.unshift(mes);

            if (num === 0) {
                let obj: any;
                if (!agentUtil.platWsUrl) obj = this.agentRecharge;
                else obj = this.agentRechargePlat

                if (!obj && data.localChatId !== obj.localChatId) data.messageNum = 1;
                else data.messageNum = 0;

                message.unshift(data);
            }

        } else {
            message = [];
            message.unshift(data);
        }
        // localStorage.setItem(user.uid + "-messageInfos", JSON.stringify(message));
        this.setIsPlatSaveMsgToLocal(message);
        if (this.lobbyParent && this.lobbyParent.children != null) {
            let rechargeMessage = this.lobbyParent.getChildByName("rechargeMessage");
            let node = null;
            let isPlat = false;
            if (!agentUtil.platWsUrl) {
                node = this.lobbyParent.getChildByName("agentRecharge");
                isPlat = false;
            } else {
                node = this.lobbyParent.getChildByName("agentRechargePlat");
                isPlat = true;
            }
            if (rechargeMessage && !node) rechargeMessage.getComponent(RechargeMessage).show(isPlat);
        }
    }

    async saveBase64ToFile(data: string) {
        if (data.indexOf("data:image/png") != -1) {
            data = data.replace("data:image/png", "data:image/jpeg");
        }
        if (cc.sys.isNative) {
            this.picAddrss = jsb.fileUtils.getWritablePath();
        }
        // this.pngNumber++;
        let md1 = md5(data);
        this.tmpPath = this.picAddrss + md1 + ".png";
        if (jsb.fileUtils.isFileExist(this.tmpPath)) {
            return;
        }
        // cc.loader.release(this.tmpPath);
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

    loadTmpPng(tmpSp: cc.Sprite) {
        return new Promise(resolve => {
            if (jsb.fileUtils.isFileExist(this.tmpPath)) {
                // cc.loader.release(this.tmpPath);
                cc.loader.load({ url: this.tmpPath, type: 'jpeg' }, (err: any, sp: any) => {
                    if (err) console.debug("=send png===2=" + err);
                    tmpSp.spriteFrame = new cc.SpriteFrame(sp);
                    resolve();
                });
            }
        });
    }


    setEditboxKeepCCCOriginalStyle(enable: boolean) {
        if (cc.sys.os === cc.sys.OS_IOS) {
            jsb.reflection.callStaticMethod("NativeUtil", "setEditboxKeepCCCOriginalStyle:", enable);
        } else if (cc.sys.os === cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod("util/NativeUtil", "setEditboxKeepCCCOriginalStyle", "(Z)V", enable);
        }
    }
    setKeyboardDisplayedAllowSwipeScreen(enable: boolean) {
        if (cc.sys.os === cc.sys.OS_IOS) {
            jsb.reflection.callStaticMethod("NativeUtil", "setKeyboardDisplayedAllowSwipeScreen:", enable);
        } else if (cc.sys.os === cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod("util/NativeUtil", "setKeyboardDisplayedAllowSwipeScreen", "(Z)V", enable);
        }
    }
    setEnableKeyboardCallBack(enable: boolean) {
        if (cc.sys.os === cc.sys.OS_IOS) {
            jsb.reflection.callStaticMethod("NativeUtil", "setEnableKeyboardCallBack:", enable);
        } else if (cc.sys.os === cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod("util/NativeUtil", "setEnableKeyboardCallBack", "(Z)V", enable);
        }
    }

    setCurAgentInfo(data: string) {
        if (this.agentsData && this.agentsData.length > 0) {
            for (let i = 0; i < this.agentsData.length; i++) {
                if (this.agentsData[i].aUid.indexOf("_") !== -1) {
                    // let ids = this.agentsData[i].aUid.split("_");
                    // let aUid = ids[0];
                    if (data === this.agentsData[i].aUid) {
                        this.curAgentInfo = this.agentsData[i]
                    }
                }
            }
        }
    }

    /**
     * 获取金鱼还是后台本地消息
     */
    getIsPlatSaveMsgToLocal() {
        let message: rechargeMessageInfo[] = [];
        if (agentUtil.platWsUrl) message = toj(localStorage.getItem(user.uid + "-NPlatMessageInfos"));
        else message = toj(localStorage.getItem(user.uid + "-messageInfos"));
        return message;
    }

    /**
    * 保存金鱼还是后台本地消息
    */
    setIsPlatSaveMsgToLocal(message: rechargeMessageInfo[]) {
        if (agentUtil.platWsUrl) localStorage.setItem(user.uid + "-NPlatMessageInfos", JSON.stringify(message));
        else localStorage.setItem(user.uid + "-messageInfos", JSON.stringify(message));
    }
}





let agentUtil = new AgentUtil();
export default agentUtil;