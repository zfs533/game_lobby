import * as util from "../common/util";
import agentUtil from "./agentUtil"
import { showTip, showLoading, hideLoading } from "../common/ui";
import net from "../common/net";
import NestableScrollView_Outer from "./NestableScrollView_Outer";
import NestableScrollView_Inner from "./NestableScrollView_Inner";
import AgentRecharge from "./agentRecharge";
import { AcceptChatMsg, ChatInfo } from "./agentChat";
import user from "../common/user";
import RechargeMsgItem from "./rechargeMsgItem";
import AgentRechargePlat from "./rechargeChat/agentRechargePlat";
import { ErrCodes } from "../common/code";

export interface rechargeMessageInfo {
    content: string,
    aName: string,
    createDate: number,
    messageNum: number,
    chatId: string,
    aUid: string,
    aHead?: string,
    localChatId?: string,
    pays?: ps.ChatClientHandlerOpenChat_Chat_Pays[];

}
const { ccclass, property } = cc._decorator;

@ccclass
export default class rechargeMessage extends cc.Component {

    @property(cc.Node)
    oSvItem: cc.Node = undefined;
    @property(cc.Node)
    private oSvContent: cc.Node = undefined;

    @property(cc.Node)
    payInfo: cc.Node = undefined;


    @property(cc.Node)
    topNode: cc.Node = undefined;    // 需要进行屏幕适配的，上方的节点

    @property(cc.ScrollView)
    scrollView: cc.ScrollView = undefined;      // 整个聊天节点的滚动

    @property(cc.Prefab)
    newAgentRechargePrb: cc.Prefab = undefined;

    @property(cc.Prefab)
    agentRechargePlatPrb: cc.Prefab = undefined;

    @property(cc.Node)
    lab: cc.Node = undefined;

    private payInfoTouchBeginPos: cc.Vec2 = undefined;
    private fmsize: cc.Size = undefined;
    private messageInfos: rechargeMessageInfo[] = [];
    private lobbyParent: cc.Node = undefined;

    public agentsData: ps.ChatClientHandlerMatchAgent_Agents[] = [];


    onLoad() {
        agentUtil.changeInterfaceOrientations("1");
        this.fmsize = cc.view.getFrameSize();
        this.screenAdaptation();
        this.oSvItem.active = false;
        this.lab.active = false;
    }

    start() {
        if (agentUtil.platWsUrl) return;
        net.off("ChatMsg");
        net.on("ChatMsg", (data: AcceptChatMsg) => {
            agentUtil.handleChatToClientMsg(data);
        });
    }

    /**
     * 展示本地聊天记录
     * @param isPlat 是否为新版代充平台
     * @param lobbyParent
     */
    async show(isPlat: boolean, lobbyParent?: cc.Node) {
        this.node.active = true;
        this.oSvItem.active = false;
        if (lobbyParent) {
            this.lobbyParent = lobbyParent;
            agentUtil.lobbyParent = lobbyParent;
        }
        this.oSvContent.destroyAllChildren();
        this.lab.active = false;
        let message: rechargeMessageInfo[] = agentUtil.getIsPlatSaveMsgToLocal();
        this.messageInfos = message;
        if (message && message.length > 0) {
            for (let idx = 0; idx < message.length; idx++) {
                let item: cc.Node;
                item = cc.instantiate(this.oSvItem);
                this.oSvContent.addChild(item);
                let inner = item.getComponent(NestableScrollView_Inner);
                let outer = this.scrollView.getComponent(NestableScrollView_Outer);
                outer.m_InnerScrollViews.push(inner);
                outer.init();
                let obj = item.getComponent(RechargeMsgItem);
                obj.setInfo(message[idx]);
                item.active = true;
                // if (isPlat) this.setCurAgentInfo(message[idx]);
            }
        } else {
            this.lab.active = true;
        }
    }

    setCurAgentInfo(data: string) {
        if (this.messageInfos && this.messageInfos.length > 0) {
            for (let i = 0; i < this.messageInfos.length; i++) {
                if (data === this.messageInfos[i].aUid) {
                    let curAgentInfo: ps.ChatClientHandlerMatchAgent_Agents = {
                        aUid: this.messageInfos[i].aUid,
                        head: this.messageInfos[i].aHead,
                        name: this.messageInfos[i].aName,
                        pays: this.messageInfos[i].pays,
                        score: "0",
                        scoreCount: 0,
                    }
                    agentUtil.curAgentInfo = curAgentInfo;

                }
            }
        }
    }

    /**
     * 删除
     */
    onClickDelete(ev: cc.Event.EventTouch, localChatId: string) {
        let idx = 0;
        for (let index = 0; index < this.messageInfos.length; index++) {
            if (this.messageInfos[index].localChatId === localChatId) {
                idx = index;
            }
        }
        let nodeObj = this.oSvContent.children[idx];
        nodeObj.active = false;
        nodeObj.removeFromParent(true);
        nodeObj.destroy();
        this.messageInfos.splice(idx, 1);
        agentUtil.setIsPlatSaveMsgToLocal(this.messageInfos)
        // localStorage.setItem(user.uid + "-messageInfos", JSON.stringify(this.messageInfos));
        if (util.toj(localStorage.getItem(localChatId))) {
            let chatRecordMes: any = util.toj(localStorage.getItem(localChatId));
            chatRecordMes.msgs = [];
            localStorage.setItem(localChatId, JSON.stringify(chatRecordMes));
        }
        if (!this.messageInfos || this.messageInfos.length <= 0) {
            this.lab.active = true;
            agentUtil.initRedDot();
        } else {
            this.lab.active = false;
        }
    }

    onClickCloseBt() {
        agentUtil.changeInterfaceOrientations('2');
        console.log("----------点击返回已完成")
    }

    async onClickEnterBt(event: cc.Event, customData: string) {
        showLoading("加载中");
        if (agentUtil.platWsUrl) {
            var index = customData.lastIndexOf("_");
            let aUid = customData.substring(index + 1, customData.length);
            let data = await net.request("chat.clientHandler.openChat", { aUid: +aUid });
            hideLoading();
            if (data.code === 200) {
                this.setCurAgentInfo(customData);
                agentUtil.setCurAgentInfo(customData);
                this.hadleOpenPlatChat(agentUtil.curAgentInfo, true);
            } else {
                showTip(ErrCodes.getErrStr(data.code));
            }
        } else {
            let data = await net.request("chat.clientHandler.openChat", { aUid: +customData });
            hideLoading();
            if (data.code === 200) {
                let chatInfo: ChatInfo = {
                    chatId: data.chat.chatId,
                    aUid: data.chat.aUid.toString(),
                    aName: data.chat.aName,
                    msgs: data.chat.msgs,
                    pays: data.chat.pays,
                    gender: data.chat.gender,
                    avatar: data.chat.avatar,
                }
                this.handleOpenChat(chatInfo, true);
            } else {
                for (let index = 0; index < this.messageInfos.length; index++) {
                    if (this.messageInfos[index].aUid === customData) {
                        let localChatId = this.messageInfos[index].localChatId;
                        if (util.toj(localStorage.getItem(localChatId))) {
                            let chatRecordMes: any = util.toj(localStorage.getItem(localChatId))
                            this.handleOpenChat(chatRecordMes, false);
                        } else {
                            showTip("您点的太快了，请休息一下哦～");
                        }
                    }
                }
            }
        }
    }

    async handleOpenChat(data: ChatInfo, isServer: boolean) {
        if (!agentUtil.getSupportNewAgentChatRcg()) return;
        let prb = this.newAgentRechargePrb;
        agentUtil.createAgentRecharge(data, prb, this.lobbyParent, undefined, isServer);
        let agentRechargeNode = this.lobbyParent.getChildByName("agentRecharge");
        agentRechargeNode.getComponent(AgentRecharge).isChangeInterfaceOrientations = true;
    }

    /**
     * 打开代充平台
     * @param data
     * @param isServer
     */
    hadleOpenPlatChat(data: ps.ChatClientHandlerMatchAgent_Agents, isServer: boolean) {
        if (!agentUtil.getSupportNewAgentChatRcg()) return;
        let prb = this.agentRechargePlatPrb;
        agentUtil.createAgentRechargePlat(data, prb, this.lobbyParent, isServer);
        let agentRechargeNode = this.lobbyParent.getChildByName("agentRechargePlat");
        agentRechargeNode.getComponent(AgentRechargePlat).isChangeInterfaceOrientations = true;
    }

    closeAction() {
        console.log("----------点击返回")
        this.node.active = false;
        this.node.removeFromParent(true);
        this.node.destroy();
    }

    /**
    * 消息触摸事件
    */
    initRechargeMessageTouchEvent(message: cc.Node, uid: number) {
        let self = this;
        let time = 0.2;
        let isMove = false;
        let isVertical = true;
        message.on(cc.Node.EventType.TOUCH_START, function (event: cc.Event.EventTouch) {
            let touchPos = event.getLocation();
            self.payInfoTouchBeginPos = touchPos;
            isMove = false;
        });
        message.on(cc.Node.EventType.TOUCH_END, function (event: cc.Event.EventTouch) {
            if (!self.payInfoTouchBeginPos) {
                return;
            }
            self.scrollView.vertical = true;
            isVertical = true;
            let touchPos = event.getLocation();
            let nx = touchPos.x - self.payInfoTouchBeginPos.x;
            self.payInfoTouchBeginPos = undefined;
            if (nx < -130) {
                //message.runAction(cc.moveTo(time, cc.v2(-120, 0)));
                cc.tween(message).to(time, { position: cc.v2(-120, 0) }).start();
            } else {
                //message.runAction(cc.moveTo(time, cc.v2(0, 0)));
                cc.tween(message).to(time, { position: cc.v2(0, 0) }).start();
            }

        });
        message.on(cc.Node.EventType.TOUCH_MOVE, function (event: cc.Event.EventTouch) {
            if (!self.payInfoTouchBeginPos) {
                return;
            }
            isMove = true;
            let touchPos = event.getLocation();
            let nx = touchPos.x - self.payInfoTouchBeginPos.x;
            let ny = touchPos.y - self.payInfoTouchBeginPos.y;
            if (Math.abs(ny) > 2 && self.scrollView.vertical) {
                isVertical = false;
                return;
            } else if (Math.abs(nx) > 3 && isVertical) {
                self.scrollView.vertical = false;
                if (message.x + nx < -130 || message.x + nx > 3) {
                    return;
                }
                message.x = message.x + nx;
            }
        });
        message.on(cc.Node.EventType.TOUCH_CANCEL, function (event: cc.Event.EventTouch) {
            if (!self.payInfoTouchBeginPos) {
                return;
            }
            self.scrollView.vertical = true;
            isVertical = true;
            let touchPos = event.getLocation();
            let nx = touchPos.x - self.payInfoTouchBeginPos.x;
            self.payInfoTouchBeginPos = undefined;
            if (nx < -130) {
                //message.runAction(cc.moveTo(time, cc.v2(-120, 0)));
                cc.tween(message).to(time, { position: cc.v2(-120, 0) }).start();
            } else {
                //message.runAction(cc.moveTo(time, cc.v2(0, 0)));
                cc.tween(message).to(time, { position: cc.v2(0, 0) }).start();
            }

        });
    }

    /***
     *适配
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

        let barHeight = util.getStatusBarHeighet();
        let tmpBarH = tmpH * barHeight;  // 状态栏的高度

        let bottomHighet = util.getTabbarSafeBottomMargin();
        let tmpBottomBarH = tmpH * bottomHighet;  // 底部圆形区域的高度
        this.topNode.y = tmpH / 2 - tmpBarH;
        this.scrollView.node.y = this.topNode.y - this.topNode.height;
        this.scrollView.node.height = tmpH - tmpBarH - this.topNode.height - tmpBottomBarH;
        this.scrollView.node.getChildByName("view").height = this.scrollView.node.height;
        console.log("--------topNode     " + this.topNode.position);
        console.log("----------canvasWidth    " + canvasWidth)
        console.log("----------this.fmsize.width    " + this.fmsize.width)
        console.log("----------scale   " + scale)
        console.log("----------this.fmsize.height    " + this.fmsize.height)
        console.log("----------tmpH    " + tmpH)
        console.log("----------barHeight   " + barHeight)
        console.log("----------tmpBarH   " + tmpBarH)




    }
}
