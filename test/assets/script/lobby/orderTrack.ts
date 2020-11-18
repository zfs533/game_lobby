import { showTip, showLoading, hideLoading } from "../common/ui";
import PopActionBox from "./popActionBox"
import AgentChat, { ChatInfo } from "./agentChat";
import * as util from "../common/util";
import { ErrCodes } from "../common/code";
import agentUtil from "./agentUtil"
import { ItemNames } from "../common/enum";
import { getRechargeProblemUrl } from "../common/util";
import net from "../common/net";
import Evaluation from "./evaluation";
import Lobby from "./lobby";
import g from "../g";


const { ccclass, property } = cc._decorator;


@ccclass("Order")
class Order {
    @property(cc.Node)
    item: cc.Node = undefined;

    @property(cc.Sprite)
    payTyoesIcon: cc.Sprite = undefined;
    @property(cc.Label)
    orderNumberLb: cc.Label = undefined;

    @property(cc.Label)
    payTyoesLb: cc.Label = undefined;

    @property(cc.Node)
    proceedPayBtn: cc.Node = undefined;

    @property(cc.Node)
    EvaluationBtn: cc.Node = undefined;

    @property(cc.Node)
    customerServiceBtn: cc.Node = undefined;

    @property(cc.Label)
    moneyLb: cc.Label = undefined;

    @property(cc.Node)
    msgUnread: cc.Node = undefined;

    @property(cc.Label)
    agentNameLb: cc.Label = undefined;

    @property(cc.Label)
    stateLb: cc.Label = undefined;

    @property(cc.Label)
    finishDateLb: cc.Label = undefined;

    @property(cc.Label)
    createDateLb: cc.Label = undefined;

    @property(cc.Button)
    copyBt: cc.Button = undefined;

    @property(cc.Button)
    enterBt: cc.Button = undefined;

    private iconSpriteFrames: cc.SpriteFrame[] = [];




}

@ccclass
export default class OrderTrack extends PopActionBox {

    @property(Order)
    OrderItem: Order = undefined;

    @property(cc.Node)
    content: cc.Node = undefined;

    @property(cc.Prefab)
    csPre: cc.Prefab = undefined;

    @property([cc.SpriteFrame])
    evaluationSps: cc.SpriteFrame[] = [];
    @property(cc.Prefab)
    newAgentRechargePrb: cc.Prefab = undefined;

    @property(cc.Node)
    evaluationPlan: cc.Node = undefined;

    @property(cc.Prefab)
    prEvaluation: cc.Prefab = undefined

    @property(cc.Button)
    lastBtn: cc.Button = undefined

    @property(cc.Button)
    nextBtn: cc.Button = undefined
    public agentChat: AgentChat = undefined;

    public evaluation: Evaluation = undefined
    public lobbyParent: cc.Node = undefined;
    public orderData: ps.ChatClientHandlerGetPayRecords_Chat[] = [];
    private orderState: string[] = ["未完成", "完成"];

    private orderEvaluationState: string[] = ["未评价", "已评价"];

    private payTypeName: string[] = ["官方代充", "支付宝支付", "微信支付", "云闪付支付"];
    private finishPayTypeName: string[] = ["官方代充", "支付宝充值", "微信充值", "云闪付充值"];
    private orderStateColor: string[] = ["#555657", "#20C681"];
    private orderItemArr: cc.Node[] = [];

    private orderType: number = 0;

    private curClickIndex: number = undefined;

    private canClick: boolean = true;

    private cdTime = 900
    public mpage: number = 1;

    private mcount: number = 6;

    protected onLoad() {
        super.onLoad();
        this.OrderItem.item.active = false;
        this.OrderItem.msgUnread.active = false;
        this.content.removeAllChildren();
        this.content.active = false;
        this.registerMethod();
        agentUtil.orderTrack = this;
    }

    registerMethod() {
        window.pomelo.off("AgentState");
        window.pomelo.on("AgentState", this.handleAgentState);

        window.pomelo.off("OrderState");
        window.pomelo.on("OrderState", this.handleOrderState.bind(this));

    }

    onDestroy() {
        window.pomelo.off("AgentState");
        window.pomelo.off("OrderState");
        agentUtil.orderTrack = undefined;
    }

    protected onEnable() {
        this.mpage = 0;
    }
    /**
     * 订单状态控制
     * @param data
     */
    handleOrderState(data: { orderId: string, state: number }) {
        if (!this.orderData) {
            return;
        }
        try {
            for (let i = 0; i < this.orderData.length; i++) {
                if (this.orderData[i].orderId === data.orderId) {
                    this.orderData[i].state = data.state;
                    if (this.orderType === 2) {
                        this.orderStateMsg(this.orderItemArr[i], data.state);
                    }

                }
            }
        } catch (error) {
            cc.log("<<<<<<< 错误", error);
        }

    }
    handleAgentState(data: { code: number }) {
        showTip(ErrCodes.getErrStr(data.code, "代理状态提示"));
    }

    initUnread() {
        for (let j = 0; j < agentUtil.chatUnreadMsgIdList.length; j++) {
            let unReadId = agentUtil.chatUnreadMsgIdList[j];
            this.checkShowUnread(unReadId);
        }
    }

    checkShowUnread(chatId: string, isShow = true) {
        // if (this.orderData) {
        // for (let i = 0; i < this.orderData.length; i++) {
        // 下面注释了还不如全部注释
        // if (this.orderData[i].chatId === chatId) {
        //     this.orderItemArr[i].getChildByName("p").active = isShow;
        // }
        // }
        // }
    }

    openAnim() {
        super.openAnim(() => {
            this.content.x = 0;
            this.content.y = 0;
            this.content.active = true;
            this.canClick = true;
        });
    }

    /**
     *获得充值记录
     * @param orderType
     */
    async getPayRecords(orderType: number, isNext: number) {

        showLoading("请稍等");
        let data = await net.request("chat.clientHandler.getPayRecords", {
            payType: orderType,
            page: this.mpage,
            pageCnt: this.mcount
        });
        hideLoading();
        if (data.code === 200) {
            this.initData(data.chats, orderType, isNext);
        } else {
            this.mpage -= isNext;
            showTip(ErrCodes.getErrStr(data.code, "加载订单失败"));
        }
    }

    initData(data: ps.ChatClientHandlerGetPayRecords_Chat[], orderType: number, isNext: number) {
        if (isNext === 0) {
            this.content.removeAllChildren();
            this.content.parent.parent.getComponent(cc.ScrollView).stopAutoScroll();
            this.content.position = cc.Vec3.ZERO
        }
        if (!data) {
            this.mpage -= isNext;
            showTip("没有更多数据了!");
            return;
        }
        this.content.removeAllChildren();
        this.content.parent.parent.getComponent(cc.ScrollView).stopAutoScroll();
        this.content.position = cc.Vec3.ZERO
        this.orderItemArr = [];
        this.orderData = [];
        //this.orderData = data;
        for (let i = 0; i < data.length; i++) {
            const el = data[i];
            this.createOrderItem(el, i, orderType);
            this.orderData.push(el);
        }
        //this.initUnread();
    }

    createOrderItem(el: ps.ChatClientHandlerGetPayRecords_Chat, index: number, orderType: number) {
        this.OrderItem.orderNumberLb.string = el.orderId;
        this.OrderItem.moneyLb.string = "+" + el.money;
        this.OrderItem.agentNameLb.string = "" + el.aName + "   ID:" + el.aUid;
        this.OrderItem.finishDateLb.string = util.formatTimeStr("d", +el.finishDate);
        let payTypeId = this.getPayTypeName(el.payType)
        this.OrderItem.payTyoesLb.string = this.payTypeName[payTypeId];
        this.OrderItem.copyBt.clickEvents[0].customEventData = "" + el.orderId;
        this.OrderItem.enterBt.clickEvents[0].customEventData = "" + el.aUid;
        this.OrderItem.EvaluationBtn.getComponent(cc.Button).clickEvents[0].customEventData = "" + el.aUid;
        this.OrderItem.payTyoesIcon.node.active = false;
        this.OrderItem.customerServiceBtn.active = false;
        this.OrderItem.createDateLb.node.parent.active = false;
        this.OrderItem.agentNameLb.node.parent.active = true;
        this.OrderItem.finishDateLb.node.parent.active = true;
        let color = cc.Color.BLACK;
        this.OrderItem.moneyLb.node.color = color.fromHEX(this.orderStateColor[1]);  //更换颜色
        this.orderType = orderType;
        if (orderType === 0 || orderType === 1) {  //orderType 0 官方代充 1 未评价 2 在线充值
            if (el.state === 0) {
                this.OrderItem.EvaluationBtn.active = true;
            } else {
                this.OrderItem.EvaluationBtn.active = false;
            }
            //this.OrderItem.createDateLb.node.parent.active = false;
            this.OrderItem.proceedPayBtn.active = false;
            this.OrderItem.stateLb.string = "" + this.orderEvaluationState[el.state];
        } else if (orderType === 2) {
            this.OrderItem.createDateLb.node.parent.active = true;
            this.OrderItem.createDateLb.string = util.formatTimeStr("d", +el.createDate);
            this.OrderItem.agentNameLb.node.parent.active = false;
            if (el.state === 0) {
                this.OrderItem.payTyoesLb.string = this.payTypeName[payTypeId];
                this.OrderItem.finishDateLb.node.parent.active = false;
            } else {
                this.OrderItem.payTyoesLb.string = this.finishPayTypeName[payTypeId];
                this.OrderItem.finishDateLb.node.parent.active = true;
            }
            this.OrderItem.stateLb.string = "" + this.orderState[el.state];
            this.OrderItem.proceedPayBtn.active = false;
            this.OrderItem.EvaluationBtn.active = false;
            this.OrderItem.customerServiceBtn.active = true;
            this.OrderItem.payTyoesIcon.node.active = true;
            this.OrderItem.payTyoesIcon.spriteFrame = this.evaluationSps[payTypeId - 1];
            this.OrderItem.moneyLb.node.color = color.fromHEX(this.orderStateColor[el.state]);  //更换颜色
        }
        let nOrderItem = cc.instantiate(this.OrderItem.item);
        nOrderItem.active = true;
        this.orderItemArr.push(nOrderItem);
        this.content.addChild(nOrderItem);
    }


    getPayTypeName(name: String) {
        if (name.indexOf('chat') != -1) {
            return 0
        } else if (name.indexOf('ali') != -1) {
            return 1
        } else if (name.indexOf('wx') != -1) {
            return 2
        } else if (name.indexOf('yun') != -1) {
            return 3
        }
    }

    getPayTypeNameZH(name: String) {
        if (name.indexOf('官方代充') != -1) {
            return 0
        } else if (name.indexOf('支付宝') != -1) {
            return 1
        } else if (name.indexOf('微信') != -1) {
            return 2
        } else if (name.indexOf('云闪付') != -1) {
            return 3
        }
    }

    /**
     *
     * 点击复制按钮
     * @param event
     * @param customData
     */
    onClickCopyBt(event: cc.Event, customData: string) {
        let data = undefined;
        this.orderData.forEach(element => {
            if (element.orderId === customData) {
                data = element;
            }

        });
        let string = data.orderId + " " + this.orderState[data.state] + " " + util.formatTimeStr("m", +data.createDate);
        util.setClipboard(string);
        showTip("内容已拷贝到剪切板!");
    }


    /**
     * 点击充订单
     */
    async onClickAllOrderTrack(event: cc.Event, customData: string) {
        this.mpage = 0;
        this.getPayRecords(+customData, 0);
        //cc.log("<<<<<<<<< 点击官方代充订单 ", this.nextBtn);
        this.lastBtn.clickEvents[0].customEventData = customData;
        this.nextBtn.clickEvents[0].customEventData = customData;

    }

    async onClickLastPage(event: cc.Event, customData: string) {
        if (this.mpage <= 0) {
            this.mpage = 0;
            showTip("已经是第一页了!");
            return;
        }
        this.mpage--;
        this.getPayRecords(+customData, -1);
    }

    async onClickNextPage(event: cc.Event, customData: string) {
        if (this.content.childrenCount < this.mcount) {
            showTip("没有更多数据了!");
            return;
        }
        this.mpage++;
        this.getPayRecords(+customData, 1);
    }
    /**
     * 点击进入商人聊天
     * @param event
     * @param customData
     */
    async onClickEnterBt(event: cc.Event, customData: string) {
        if (!this.canClick) {
            return;
        }
        this.canClick = false;
        showLoading("加载中");
        let data = await net.request("chat.clientHandler.openChat", {
            aUid: +customData
        });
        hideLoading();
        if (data.code === 200) {
            this.curClickIndex = +customData;
            this.handleOpenChat(data.chat);
        } else {
            showTip(ErrCodes.getErrStr(data.code));
        }
        this.canClick = true;
    }

    /**
     * 点击打开评价界面
     * @param event
     * @param customData
     */
    async onClickEvaluationBt(event: cc.Event, customData: string) {
        showLoading("加载中");
        try {
            let aUid = +customData;
            let head: string = undefined
            let order: ps.ChatClientHandlerGetPayRecords_Chat = undefined;
            let orderIdx = 0;
            for (let index = 0; index < this.orderData.length; index++) {
                if (this.orderData[index].aUid === +customData) {
                    order = this.orderData[index];
                    orderIdx = index;
                    let chatIdhead = this.orderData[index].aUid + "head";
                    head = JSON.parse(localStorage.getItem(chatIdhead))
                }
            }
            if (!head) {
                let data = await net.request("chat.clientHandler.getAgentHead", { aUid: aUid });
                head = data.head
            }
            hideLoading();
            let evaluationPlan = this.node.getChildByName("evaluationPlan");
            if (!evaluationPlan) {
                evaluationPlan = cc.instantiate(this.prEvaluation);
                this.lobbyParent.addChild(evaluationPlan);
            }
            this.evaluation = evaluationPlan.getComponent(Evaluation);
            this.evaluation.initData(order.aName, orderIdx, order, this);
            this.evaluation.orderItemArr = this.orderItemArr;
            this.evaluation.orderData = this.orderData;
            if (head) {
                agentUtil.saveBase64ToFile(head);
                agentUtil.loadTmpPng(this.evaluation.icon);
            }
        } catch (error) {
            cc.log("<<<<<<< 错误", error);
        }

    }




    async handleOpenChat(data: ps.ChatClientHandlerOpenChat_Chat) {
        // if (data.state === 0) {
        //     showTip("当前代理不在线!!");
        // }
        if (!agentUtil.getSupportNewAgentChatRcg()) {
            return;
        }
        let prb = this.newAgentRechargePrb;
        let chatInfo: ChatInfo = {
            chatId: data.chatId,
            aUid: data.aUid.toString(),
            aName: data.aName,
            pays: data.pays,
            msgs: data.msgs,
            gender: data.gender,
            avatar: data.avatar,
        }
        agentUtil.createAgentRecharge(chatInfo, prb, this.lobbyParent, this, true);
    }

    onClickComplaintAgent() {
        let lastTime = cc.sys.localStorage.getItem(ItemNames.problemCD)
        let leftTime = util.getLeftTime(this.cdTime, lastTime);
        if (leftTime) {
            showTip(`${leftTime}后方能再次发起问题申诉`);
        } else {
            cc.sys.openURL(getRechargeProblemUrl())
            cc.sys.localStorage.setItem(ItemNames.problemCD, Date.now())
        }
    }

    /**
     *  根据评价更改 订单 评价icon
     * @param evaluation 评价
     */
    chgOrderIcon(evaluation: number) {
        let itemNode = this.orderItemArr[this.curClickIndex];
        let icon = itemNode.getChildByName("sp");
        icon.getComponent(cc.Sprite).spriteFrame = this.evaluationSps[evaluation];
    }

    chgOrderState(state: number) {
        let itemNode = this.orderItemArr[this.curClickIndex];
        this.orderStateMsg(itemNode, state);

    }
    orderStateMsg(itemNode: cc.Node, state: number) {
        try {
            let head = itemNode.getChildByName("head");
            let state1 = head.getChildByName("state").getChildByName("state").getComponent(cc.Label)
            state1.string = "" + this.orderState[state];
            let payTypes = head.getChildByName("payTypes").getChildByName("payTypes").getChildByName("name").getComponent(cc.Label);
            let finishDateLb = head.getChildByName("finishDate");
            let num = this.getPayTypeNameZH(payTypes.string);
            if (state === 0) {
                let name = this.payTypeName[num];
                payTypes.string = name;
                finishDateLb.active = false;
            } else {
                let name = this.finishPayTypeName[num];
                payTypes.string = name;
                finishDateLb.active = true;
            }

            let color = cc.Color.BLACK;
            let money = itemNode.getChildByName("money").getComponent(cc.Label);
            money.node.color = color.fromHEX(this.orderStateColor[state]);  //更换颜色
        } catch (error) {
            cc.log("<<<<<<<<错误   ", error)
        }

    }

    async onClickOnlineCustomerService(event: cc.Event, customeData: string) {
        // this.onlineCs.uncheck();
        await this.reqCsUrl();
        let lobby = cc.find("lobby");
        let tLobby = lobby.getComponent(Lobby);
        if (tLobby) {
            if (g.customerServiceUrl) {
                tLobby.onClickOnlineCustomerService(true, g.customerServiceUrl + "&protoType=2");
            } else {
                tLobby.onClickOnlineCustomerService(false);
            }
        } else {
            showTip("暂不支持此功能！");
        }
    }

    onClcikBg() {
        // this.node.active = false;
    }

    async reqCsUrl() {
        showLoading();
        let data = await net.request("hall.csHandler.csUrlRequest", { type: 1 });
        hideLoading();
        if (data.code === 200) {
            if (data.csUrl) {
                g.customerServiceUrl = data.csUrl;
                g.customerFileServerUrl = data.fileServerUrl;
                return;
            }
        } else {
            showTip(ErrCodes.CODES[data.code]);
        }
        g.customerServiceUrl = "";
    }
}
