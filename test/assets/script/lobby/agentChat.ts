import { showTip, showLoading, hideLoading } from "../common/ui";
import { ErrCodes } from "../common/code";
import OrderTrack from "./orderTrack";
import RechargeMessage from "./rechargeMessage";
import agentUtil from "./agentUtil";
import net from "../common/net";
import Lobby from "../lobby/lobby";
import AgentRechargeItem from "./agentRechargeItem";

const { ccclass, property } = cc._decorator;
export interface ChatInfo {
    chatId: string,
    aUid: string,
    aName: string,
    msgs?: ps.ChatClientHandlerOpenChat_Chat_ChatMsg[],
    pays?: ps.ChatClientHandlerOpenChat_Chat_Pays[],
    state?: number,
    evaluation?: number,
    report?: number,
    gender?: number,
    avatar?: number,
    typesDate?: ps.ChatAgentHandlerGetChatHistory_TypeDate[],
    localChatId?: string,
}

export interface SendChatMsg {
    chatId: string,
    type: number,
    content: string,
    aUid: number,
    createDate: number,
    fromType: number,
}
export interface AcceptChatMsg {
    code: number,
    chatId: string,
    msgId: string,
    type: number,
    content: string,
    createDate: number,
    aUid: number,
    uid: number,
    fromType: number,
    localChatId?: string,
}

@ccclass
export default class AgentChat extends cc.Component {
    @property(cc.Node)
    unReadTip: cc.Node = undefined;

    @property(cc.Node)
    oSvItem: cc.Node = undefined;

    @property(cc.Node)
    redDot: cc.Node = undefined;

    @property(cc.ScrollView)
    private scrollView: cc.ScrollView = undefined;

    @property(cc.Prefab)
    OrderTrackPrb: cc.Prefab = undefined;

    @property(cc.Prefab)
    newAgentRechargePrb: cc.Prefab = undefined;

    @property(cc.Prefab)
    agentRechargePlatPrb: cc.Prefab = undefined;

    @property(cc.Prefab)
    rechargeMessagePrb: cc.Prefab = undefined;

    @property([cc.SpriteFrame])
    paySpriteFrame: cc.SpriteFrame[] = [];

    @property(cc.Node)
    ndTitLabel: cc.Node = undefined;

    lobby: Lobby = undefined;

    public lobbyParent: cc.Node = undefined;
    public mPayType: string = "";

    private agentRequest: ps.ChatClientHandlerMatchAgent_Agents[] = [];
    private agentRequestNode: AgentRechargeItem[] = [];
    private head: string = undefined;

    onLoad() {
        this.addExtraListeners();
        agentUtil.agentChat = this;
        this.oSvItem.active = false;
        let lobby = cc.director.getScene();
        this.lobby = lobby.getChildByName("lobby").getComponent(Lobby);
        this.redDot.active = this.lobby.isNewMess;
    }

    async onEnable() {
        this.mPayType = "";
        agentUtil.sendChatEnter();
        this.scrollView.content.removeAllChildren();
        this.getPay();
    }

    public addExtraListeners(): void {
        window.pomelo.off("ChatMsg");
        window.pomelo.on("ChatMsg", agentUtil.handleChatToClientMsg.bind(this));
    }

    async getPay() {
        showLoading("加载中");
        this.ndTitLabel.active = false;
        let data = await net.request("chat.clientHandler.matchAgent", {});
        if (data.code === 200) {
            if (data.type === 2) {                  // 代充平台
                agentUtil.platWsUrl = data.wsUrl;
                agentUtil.platFileSeverUrl = data.fileServerUrl;
            } else if (data.type === 1) {           // 后台代充
                agentUtil.platWsUrl = "";
                agentUtil.platFileSeverUrl = "";
                this.getAgentDef();
            }
            if (data.agents && data.agents.length > 0) {
                this.show(data.agents, data.type);
                this.ndTitLabel.active = false;
            }
            else this.ndTitLabel.active = true;
        } else {
            this.ndTitLabel.active = true;
            showTip(ErrCodes.getErrStr(data.code));
        }
        hideLoading();
    }

    /**
     * 展示商人信息
     * @param data
     */
    async show(data: ps.ChatClientHandlerMatchAgent_Agents[], type: number) {
        this.oSvItem.active = false;
        this.scrollView.stopAutoScroll();
        this.scrollView.content.setPosition(cc.Vec2.ZERO);
        this.scrollView.content.removeAllChildren();
        this.agentRequest = [];
        this.agentRequestNode = [];
        this.randomupset(data);
        for (let idx = 0; idx < data.length; idx++) {
            let item: cc.Node;
            item = cc.instantiate(this.oSvItem);
            this.scrollView.content.addChild(item);
            item.setPosition(cc.Vec2.ZERO);
            item.active = true;
            let itemObj = item.getComponent(AgentRechargeItem);
            itemObj.curAgentInfo = data[idx];
            itemObj.setData();

            if (data[idx].pays && data[idx].pays.length > 0) {
                let num = 0;
                for (let i = 0; i < data[idx].pays.length; i++) {
                    let payFType = data[idx].pays[i].payFType;
                    // itemObj.showPayMethodStr(payFType);
                    if (num < itemObj.spPayMethods.length) {
                        let index = agentUtil.getIndexByType(payFType, false);
                        let sp = this.paySpriteFrame[index];
                        if (sp) {
                            itemObj.showPayMethodImg(sp, num);
                            num++;
                        }
                    }
                }
            }

            this.agentRequest.push(data[idx]);
            this.agentRequestNode.push(itemObj);
            if (type === 1) {   // 旧版代充
                let aUidHead = data[idx].aUid + "head";
                if (localStorage.getItem(aUidHead) && cc.sys.isNative) {
                    agentUtil.saveBase64ToFile(localStorage.getItem(aUidHead));
                    await agentUtil.loadTmpPng(itemObj.spHead);
                    // console.log("=send png===1=", def.spriteFrame.name);
                }
            }
        }
    }

    /**
     * 随机展示商人
     * @param endpoint
     */
    private randomupset(endpoint: ps.ChatClientHandlerMatchAgent_Agents[]) {
        for (let i = endpoint.length - 1; i >= 0; i--) {
            let idns = Math.floor(Math.random() * (i + 1));
            let seca = endpoint[idns];
            endpoint[idns] = endpoint[i];
            endpoint[i] = seca;
        }
    }

    /**
     * 旧版代充请求商人自定义头像
     */
    async getAgentDef() {
        for (let index = 0; index < this.agentRequest.length; index++) {
            let data = await net.request("chat.clientHandler.getAgentHead", { aUid: +this.agentRequest[index].aUid });
            if (data.code === 200) {
                this.head = data.head;
                let aUidHead = this.agentRequest[index].aUid + "head";
                localStorage.setItem(aUidHead, JSON.stringify(this.head));
                for (let idx = 0; idx < this.agentRequestNode.length; idx++) {
                    let rechargBtn = this.agentRequestNode[idx].btnRecharge;
                    if (rechargBtn.clickEvents[0].customEventData === this.agentRequest[index].aUid) {
                        let def = this.agentRequestNode[idx].spHead;
                        if (cc.sys.isNative) {
                            agentUtil.saveBase64ToFile(data.head);
                            await agentUtil.loadTmpPng(def);
                            //  console.log("=send png===1=", def.spriteFrame.name);
                        }
                    }
                }
            }
        }
    }

    /**
     * 点击打开消息界面
     */
    onClickRechargeMessage() {
        let rechargeMessagePrb = this.lobbyParent.getChildByName("rechargeMessage");
        if (!rechargeMessagePrb) {
            rechargeMessagePrb = cc.instantiate(this.rechargeMessagePrb);
            this.lobbyParent.addChild(rechargeMessagePrb);
        }
        let rechargeMessage = rechargeMessagePrb.getComponent(RechargeMessage);
        let isPlat = agentUtil.platWsUrl ? true : false;
        rechargeMessage.show(isPlat, this.lobbyParent);
    }

    /**
     * 点击充值记录
     */
    async onClickOrderTrack() {
        showLoading("请稍等");
        let data: ps.ChatClientHandlerGetPayRecords = await net.request("chat.clientHandler.getPayRecords", {
            payType: 0,
            page: 0,
            pageCnt: 6
        });
        hideLoading();
        if (data.code === 200) {
            this.showOrderTrack(data.chats);
        } else {
            showTip(ErrCodes.getErrStr(data.code, "加载订单失败"));
        }
    }

    showOrderTrack(data: ps.ChatClientHandlerGetPayRecords_Chat[]) {
        let orderTrackNode = this.lobbyParent.getChildByName("orderTrack");
        if (!orderTrackNode) {
            orderTrackNode = cc.instantiate(this.OrderTrackPrb);
            this.lobbyParent.addChild(orderTrackNode);
        }
        let orderTrack = orderTrackNode.getComponent(OrderTrack);
        orderTrack.lobbyParent = this.lobbyParent;
        orderTrack.initData(data, 0, 0);
        orderTrack.agentChat = this;
    }

    /**
     * 点击充值按钮
     * @param event
     * @param customData
     */
    onClickMoneyBt(event: cc.Event, customData: string) {
        this.mPayType = customData;
        agentUtil.curAgentInfo = event.target.parent.getComponent(AgentRechargeItem).curAgentInfo;
        this.recharge();
    }

    async recharge() {
        showLoading("加载中");
        if (!agentUtil.platWsUrl) {
            let data = await net.request("chat.clientHandler.openChat", { aUid: +this.mPayType });
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
                this.handleOpenChat(false, chatInfo)
            } else showTip(ErrCodes.getErrStr(data.code, "您点的太快了"));


        } else {
            this.handleOpenChat(true, agentUtil.curAgentInfo);
        }
    }

    /**
     * 打开代充聊天界面
     * @param isPlat 是否为代充平台
     * @param data 数据
     */
    handleOpenChat(isPlat: boolean, data: any) {
        let prb;
        if (!isPlat) {
            prb = this.newAgentRechargePrb;
            agentUtil.createAgentRecharge(data, prb, this.lobbyParent, undefined, true);
        } else {
            prb = this.agentRechargePlatPrb;
            agentUtil.createAgentRechargePlat(data, prb, this.lobbyParent, true);
        }
        agentUtil.initRedDot();
    }
}
