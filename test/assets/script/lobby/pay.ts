import User from "../common/user";
import { addSingleEvent, setClipboard } from "../common/util";
import { ErrCodes } from "../common/code";
import PayPage from "./payPage";
import g from "../g";
import PopActionBox from "./popActionBox"
import AgentChat from "./agentChat";
import AgentList from "./agentList";
import { getAppName } from "../common/app";
import { showTip, hideLoading } from "../common/ui";
import net from "../common/net";
import agentUtil from "./agentUtil";
import { WelfareResult } from "./welfareEvents";

const { ccclass, property } = cc._decorator;

let Decimal = window.Decimal

// ps.HallBillHandlerPayEnforce_RechargeEnforce 下为注释说明
interface RechargeEnforce {
    srTimesLLmit: number,                   //成功充值次数限制
    srTotalLLimit: string,                  //成功充值总金额限制
    srOnlyShowAgentRate: string,            //只显示代理几率
    srConNoBillTimes: number,               //连续展示几次代理但是不充值降低几率的次数
    srDecRate: string,                      //连续展示几次代理但是不充值降低记录的几率
    saOnlyShowAgentRate: string,            //代理充值成功过的玩家只展示代理的几率
    saConNoBillTimes: number,               //代理充值成功过的玩家只展示代理连续打开几次代理不充值降低几率的次数
    saDecRate: string,                      //代理充值成功过的玩家只展示代理连续代开几次代理不充值降低几率的几率
    perACIncRate: string,                   //玩家代理充值成功一次增加
    limitOtherChannelMaxMoney: number,     //是否限制其他充值方式最高金额
    otherChannelMaxMoney: string,           //其他充值方式最高金额

}

@ccclass("PayData")
class PayData {
    @property()
    payment: string = "";

    @property()
    title: string = "";

    @property(cc.SpriteFrame)
    iconFocus: cc.SpriteFrame = undefined;

    @property(cc.SpriteFrame)
    bg: cc.SpriteFrame = undefined;

    @property(cc.SpriteFrame)
    bg2: cc.SpriteFrame = undefined;

    @property(cc.Color)
    bgColor: cc.Color = cc.Color.WHITE;

    @property()
    tip: string = "";


}

const Person_Recharge = "ali_person";
const VIEW_TURN_INTERVAL = 4;

@ccclass
export default class Recharge extends PopActionBox {

    @property(cc.Node)
    clearBtnNode: cc.Node = undefined;//清除金额输入框按钮

    @property(AgentChat)
    agentChat: AgentChat = undefined;

    @property(AgentList)
    agentList: AgentList = undefined;

    @property(cc.ToggleContainer)
    private tgRecharge: cc.ToggleContainer = undefined;

    @property([PayData])
    private recharges: PayData[] = [];

    @property(cc.Node)
    private noRecharge: cc.Node = undefined;

    @property(cc.Node)
    private nodeRight: cc.Node = undefined;

    @property(cc.Node)
    private leftList: cc.Node = undefined;

    @property(cc.Node)
    private orderTrackBtn: cc.Node = undefined;

    @property(cc.Node)
    private itemLeft: cc.Node = undefined;

    @property(cc.Node)
    private itemRight: cc.Node = undefined;

    @property(cc.Label)
    private lblMyID: cc.Label = undefined;

    @property(cc.Node)
    private officialRecharge: cc.Node = undefined;

    @property(cc.PageView)
    private adsPageview: cc.PageView = undefined;


    private locationRule: ps.HallBillHandlerPayEnforce_LocationRechargeRule;

    private showAgent: boolean;

    private canShowChat: boolean = false;

    public limitOtherChannelMaxMoney: number = undefined;

    private _turnView: boolean = true;
    private _turnTime: number = 0;
    private _scrollToIndex = 0;
    private rechargeRebateInfo: WelfareResult;


    protected onLoad() {
        super.onLoad();
        this.showAgent = true;
        this.leftList.active = false
        this.orderTrackBtn.active = false

        this.adsPageview.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart);
        this.adsPageview.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd);
        this.adsPageview.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd);

        this.rechargeRebateInfo = agentUtil.rechargeRebateInfo;
        this.itemRight.active = false;
    }

    onTouchStart = (event: cc.Event.EventTouch) => {
        this._turnView = false;
    }

    onTouchEnd = (event: cc.Event.EventTouch) => {
        this._turnView = true;
    }

    onEnable() {
        this.checkAgentChat();
        this.lblMyID.string = "ID: " + User.uid.toString();
        this.autoDestroy = false;

        this.openAnim(() => {
            new Promise(async (resolve: (ok: boolean) => void) => {
                let data = await net.request("hall.billHandler.payEnforce", {});
                if (data.code === 200) {
                    g.payEnforceData = data;
                    if (data.locationRule) {
                        this.locationRule = data.locationRule;
                        if (!data.locationRule.rechargeAgent) {
                            this.hideAgent(false);
                        }
                    }

                    if (data.banVip || !data.vipSwitch) this.hideAgent(false);
                    else this.hideAgent(true)

                    if (this.canShowChat && data.newAgentSwitch) {
                        this.agentChat.lobbyParent = this.node.parent;
                        this.officialRecharge.active = true;
                    } else {
                        this.canShowChat = false;
                        this.officialRecharge.active = false;
                    }
                    this.initRecharges(data.payTypes)
                    if (this.canShowChat && data.agentVipSwitch) {
                        this.hideAgent(false);
                    }
                    this.showLeftTog();
                    this.showAds();
                    resolve(true);
                } else {
                    resolve(false);
                }
                hideLoading();
            });
        });
    }

    closePayAction(cb?: Function) {
        if (this.agentChat.node) {
            this.agentChat.node.active = false;
        }
        let animTime = 0.3;
        //this.nodeBg.runAction(cc.fadeTo(animTime, 0));
        cc.tween(this.nodeBg).to(animTime, { opacity: 0 }).start();
        let actions = cc.sequence(
            cc.scaleTo(animTime, 0).easing(cc.easeBackIn()),
            cc.callFunc(() => {
                if (cb && typeof cb === "function")
                    cb();
                this.node.active = false;
                this.node.emit("close");
                if (this.autoDestroy) {
                    this.node.removeFromParent(true);
                    this.node.destroy();
                }
            }))
        // this.nodeBox.runAction(actions);
        cc.tween(this.nodeBox).then(actions).start();
    }

    private hideAgent(show: boolean) {
        this.showAgent = show;
        let agentTg = this.tgRecharge.node.getChildByName("agentList");
        agentTg.active = show;
    }

    // 检查是否有 聊天充值
    private checkAgentChat() {
        this.canShowChat = agentUtil.getSupportNewAgentChatRcg();
        if (!this.canShowChat) {
            showTip("您当前版本已不支持官方代充，请前往官网下载最新版！");
        }
    }
    private initRecharges(payTypes: ps.HallBillHandlerPayEnforce_Types[]) {
        if (!payTypes) {
            // util.showTip("暂无充值项");
            return;
        }
        for (let i = 0; i < payTypes.length; i++) {  // 若vip默认显示到最下方，右侧界面显示内容为左侧第一位相应内容
            for (let j = i + 1; j < payTypes.length; j++) {
                let one = payTypes[i];
                let two = payTypes[j];
                if (one.idx > two.idx) {
                    let tmp = payTypes[i];
                    payTypes[i] = payTypes[j];
                    payTypes[j] = tmp;
                }
            }
        }
        for (let i = 0; i < payTypes.length; i++) {
            for (let j = 0; j < this.recharges.length; j++) {
                let r = this.recharges[j];
                if (r.payment === payTypes[i].payType) {
                    let leftNode = this.tgRecharge.node.getChildByName(r.payment);
                    if (leftNode) {
                        leftNode.zIndex = (payTypes[i].idx);
                        break;
                    }
                    let item = cc.instantiate(this.itemLeft);
                    let tog = item.getComponent(cc.Toggle);
                    let target = tog.target;
                    target.getChildByName("icon").getComponent(cc.Sprite).spriteFrame = r.iconFocus;
                    target.getChildByName("lab").getComponent(cc.Label).string = r.title;
                    let mark = tog.checkMark.node;
                    mark.getChildByName("icon").getComponent(cc.Sprite).spriteFrame = r.iconFocus;
                    mark.getChildByName("lab").getComponent(cc.Label).string = r.title;
                    if (r.payment === "ali_sdk_pay") {
                        target.getChildByName("label_tag").active = true
                        mark.getChildByName("label_tag").active = true
                    }
                    item.active = true;
                    item.name = r.payment;
                    this.tgRecharge.node.addChild(item);
                    item.zIndex = (payTypes[i].idx);
                    item.x = 0;

                    let handler = new cc.Component.EventHandler();
                    handler.target = this.node;
                    handler.component = cc.js.getClassName(this);
                    handler.handler = "onCheckLeft";
                    handler.customEventData = r.payment;
                    addSingleEvent(tog, handler);
                    let right = cc.instantiate(this.itemRight);
                    right.name = r.payment;
                    this.nodeRight.addChild(right);
                    right.setPosition(-110, -10);
                    let page = right.getComponent(PayPage);
                    page.init(r.payment, r.bg, r.bg2, r.tip, r.iconFocus);
                    page.mPay = this;
                    break;
                }
            }
        }
    }


    private onClickCopyID() {
        let uid = User.uid.toString();
        let success = setClipboard(`您好，我要充值《${getAppName()}》，我的id${uid}。`);
        if (success) {
            showTip("已拷贝到剪切板");
        }
    }

    private onCheckLeft(tog: cc.Toggle, data: string) {
        this.changeView(data);
    }

    private onClickCheck(tog: cc.Event, data: string) {
        let isChecked = this.officialRecharge.getComponent(cc.Toggle).isChecked;
        if (isChecked && this.agentChat.node.active) {
            this.changeView(data);
        }
    }

    private changeView(name: string) {
        let node = this.nodeRight.getChildByName(name);
        if (!node) {
            this.nodeRight.children.forEach(child => {
                if (child.name !== 'bg')
                    child.active = false
            });
            return;
        }
        let page = node.getComponent(PayPage);
        if (page && !node.active) {
            page.getCfg();
        }
        this.clearBtnNode.active = name == "usdt_pay" ? false : true;
        this.nodeRight.children.forEach(child => {
            if (child.name !== 'bg')
                child.active = false
        });
        if (name === "agentList") {
            this.agentList.init();
        } //else if (name === "agentChat") {

        //     this.agentChat.init();
        // }
        node.active = true;
    }

    resetCheck(payment: string) {
        let child: cc.Node = undefined;
        for (let i = 0; i < this.tgRecharge.node.children.length; i++) {
            let mchild = this.tgRecharge.node.children[i];
            if (mchild.active && mchild.name != payment) {
                child = mchild;
                break;
            }
        }
        if (child && child.active) {
            let oldItem = this.tgRecharge.node.getChildByName(payment);
            oldItem.active = false;

            child.getComponent(cc.Toggle).isChecked = true;
            let name = child.getComponent(cc.Toggle).checkEvents[0].customEventData;
            this.changeView(name);
        }
    }

    //动态展示
    private randomShowPayButton() {
        for (let i = 0; i < this.tgRecharge.node.childrenCount; i++) {
            let child = this.tgRecharge.node.children[i];
            if (child.name === "agentList" || child.name === "chat") {
                continue;
            }

            child.active = false;
        }

        let rechargeSwitch = !!g.hallVal.rechargeSwitch;
        if (!rechargeSwitch) {
            return;
        }
        this.rechargeTactics();
        this.showEventsTips();
    }

    /**
     * 充值策略
     */
    private rechargeTactics() {
        let data = <ps.HallBillHandlerPayEnforce>g.payEnforceData;
        if (data.code !== 200) {
            console.warn(ErrCodes.getErrStr(data.code, "获取充值通道失败"));
            return;
        }
        if (!data.payTypes) {
            console.warn("没有充值通道数据");
            return;
        }

        let ins = User;
        if (data.payEnforce === 0 || !ins.shieldStatus.usePayEnforce) {
            this.showOnline(data.payTypes);
            return;
        }
        let rechargeEnforce = data.re;

        let onlyRate = ins.onlyAgentRate;
        let ignoreNum = ins.ignoreAgent;
        let decRate = ins.decreaseRate;
        let onlyNum = ins.onlyAgent;
        let lastTimes = ins.agentTimes;

        let agentTimes = data.agentOKTimes || 0;
        let onlineTimes = data.onlineRechargeOKTimes || 0;
        let onlineTotal = data.onlineRecharge || "0";

        // 如果没有数据，就先初始化
        if (onlyRate <= 0) {
            if (ignoreNum === 0 && agentTimes > 0) { // 代理充值过的，不是反复不代理充值降到0的，一律为80%几率只显示代理
                onlyRate = new Decimal(rechargeEnforce.saOnlyShowAgentRate).add(0).toNumber();
                decRate = new Decimal(rechargeEnforce.saDecRate).add(0).toNumber();
            } else if (onlineTimes > rechargeEnforce.srTimesLLmit && new Decimal(onlineTotal).sub(rechargeEnforce.srTotalLLimit).toNumber() > 0) { // 否则在线充值金额够的，只显示代理几率为60%
                onlyRate = new Decimal(rechargeEnforce.srOnlyShowAgentRate).add(0).toNumber();
                decRate = new Decimal(rechargeEnforce.srDecRate).add(0).toNumber();
            }
        }

        let conNoBillTimes: number;
        if (lastTimes > 0) { // 如果记录有过代理充值
            conNoBillTimes = rechargeEnforce.saConNoBillTimes;
        } else {
            conNoBillTimes = rechargeEnforce.srConNoBillTimes;
        }

        if (agentTimes > lastTimes) { // 新增了代理成功次数
            onlyRate += new Decimal(agentTimes).sub(lastTimes).mul(rechargeEnforce.perACIncRate).toNumber(); // 增加相应只显示代理几率
            ignoreNum = 0; // 连续不代理次数重置
        } else { // 没有新增代理
            // 如果上次只展示了代理充值
            if (onlyNum > 0) {
                // 没代理充值次数+1
                ignoreNum++;
                // 如果达到一定次数，则减少只显示代理充值的几率
                if (ignoreNum >= conNoBillTimes) {
                    onlyRate -= decRate;
                }
            } else { // 否则将没代理充值次数重置
                ignoreNum = 0;
            }
        }

        lastTimes = agentTimes;
        // 得到几率
        let rate = Math.random();
        // 根据几率决定是否显示在线充值
        if (rate > onlyRate) {
            // 代理充值过的，除SSS外限制最高充值金额为500
            if (agentTimes > 0 && !!rechargeEnforce.limitOtherChannelMaxMoney) {
                this.limitOtherChannelMaxMoney = rechargeEnforce.limitOtherChannelMaxMoney;
            }
            // 显示在线充值
            this.showOnline(data.payTypes);
            // 连续只显示代理次数归零
            onlyNum = 0;
        } else {
            onlyNum++;
        }

        ins.onlyAgentRate = onlyRate;
        ins.ignoreAgent = ignoreNum;
        ins.decreaseRate = decRate;
        ins.onlyAgent = onlyNum;
        ins.agentTimes = lastTimes;
    }

    /**
     * 显示在线充值
     *
     * @private
     * @param {PayInfo[]} types
     * @returns
     * @memberof Recharge
     */
    private showOnline(types: ps.HallBillHandlerPayEnforce_Types[]) {
        if (!User.shieldStatus.allow3rdRecharge) {
            return;
        }
        if (!types) {
            return;
        }


        // 充值策略将在线分为 在线充值和个人zfb
        let showTypes: ps.HallBillHandlerPayEnforce_Types[] = [];
        if (this.locationRule) {
            types.forEach(t => {
                if (t.payType === Person_Recharge) {
                    if (!!this.locationRule.rechargePerson) {
                        showTypes.push(t);
                    }
                } else if (!!this.locationRule.rechargeOnline) {
                    showTypes.push(t);
                }
            });
        } else {
            showTypes = types.concat();
        }

        if (showTypes && showTypes.length === 0) {
            this.noRecharge.active = true;
        }
        showTypes.forEach(t => {
            let child = this.tgRecharge.node.getChildByName(t.payType);
            if (!child) {
                return;
            }
            let node = this.nodeRight.getChildByName(t.payType)
            if (!node) {
                return;
            }
            let page = node.getComponent(PayPage);
            if (!page) {
                return;
            }

            child.active = true;
            page.limitOtherChannelMaxMoney = this.limitOtherChannelMaxMoney;
        });

        let togs = this.tgRecharge.getComponentsInChildren(cc.Toggle);
        let togName;
        for (let tog of togs) {
            if (!tog.node.active) {
                continue;
            }
            tog.check();

            togName = tog.node.name;
            break;
        }

        // 若无代理充值则显示第一个在线充值
        if (!this.showAgent && togName) {
            this.changeView(togName);
        }
    }

    public async showLeftTog() {
        this.leftList.active = true
        this.orderTrackBtn.active = true
        this.randomShowPayButton();
        if (this.canShowChat) {
            this.tgRecharge.node.getChildByName('chat').getComponent(cc.Toggle).check();
            this.changeView("agentChat");
        } else {
            if (this.showAgent) {
                this.tgRecharge.node.getChildByName('agentList').getComponent(cc.Toggle).check();
                this.changeView("agentList");
            }
        }
        // if (this.isnotific) {
        //     await new Promise(resolve => {
        //         this.notificationShow();
        //         this.notificatbtn.node.on(cc.Node.EventType.TOUCH_START, function () {
        //             resolve();
        //         });
        //     });
        // }

        // this.showRecommend();
    }

    // 显示充值返利标签
    showEventsTips() {
        let childrens = this.tgRecharge.node.children;
        if (this.rechargeRebateInfo && this.rechargeRebateInfo.rechargeChannels) {

            let tps = this.rechargeRebateInfo.rechargeChannels;
            for (let j = 0; j < childrens.length; j++) {
                let obj = childrens[j];
                if ((obj.name === "chat" || obj.name === "yun_pay" || obj.name === "union_pay") && obj.active) {
                    let normal_tag = childrens[j].getChildByName("Background").getChildByName("label_tag");
                    let check_tag = childrens[j].getChildByName("checkmark").getChildByName("label_tag");
                    let desStr = "大额推荐";
                    let rebate = "返利1%";
                    if (this.rechargeRebateInfo.onGoing) {
                        if (obj.name === "chat" && tps.indexOf("official_pay") >= 0) {
                            // let rebate = +this.rechargeRebateInfo.interest * 100;
                            desStr = rebate;
                        } else if (obj.name === "yun_pay" && tps.indexOf("yun_pay") >= 0) {
                            desStr = rebate;
                        }
                    }
                    normal_tag.getComponentInChildren(cc.Label).string = desStr;
                    check_tag.getComponentInChildren(cc.Label).string = desStr;
                    normal_tag.active = true;
                    check_tag.active = true;
                } else {
                    if (obj.name === "agentList") {
                        let normal_tag = childrens[j].getChildByName("Background").getChildByName("label_tag");
                        let check_tag = childrens[j].getChildByName("checkmark").getChildByName("label_tag");
                        normal_tag.active = true;
                        check_tag.active = true;
                    }
                }
            }

        } else {
            // console.log("返利数据不存在！");
            for (let i = 0; i < childrens.length; i++) {
                let name = childrens[i].name;
                if (name === "agentList" || name === "union_pay") {
                    let normal_tag = childrens[i].getChildByName("Background").getChildByName("label_tag");
                    let check_tag = childrens[i].getChildByName("checkmark").getChildByName("label_tag");
                    normal_tag.active = true;
                    check_tag.active = true;
                }
            }
        }
    }

    /**
     * 广告图轮播
     */
    private showAds() {
        if (this.rechargeRebateInfo && this.rechargeRebateInfo.onGoing) {
            this.unschedule(this.adsSchedule);
            this.schedule(this.adsSchedule, 1);
        } else {
            this.adsPageview.enabled = false;
            // let nodePages = this.adsPageview.getPages();
            // if (nodePages[1]) {
            //     this.adsPageview.removePageAtIndex(1);
            // }
        }
    }

    /**
     * 轮播定时器
     */
    private adsSchedule() {
        if (!this._turnView) {
            this._turnTime = 0;
            return;
        };
        let nodePages = this.adsPageview.getPages();
        this._turnTime += 1;
        if (this._turnTime % VIEW_TURN_INTERVAL === 0) {
            let nextPageIdx = this.adsPageview.getCurrentPageIndex() + 1;
            if (nextPageIdx >= nodePages.length) {
                nextPageIdx = 0;
            }
            this.adsPageview.scrollToPage(nextPageIdx, 2);
            this._scrollToIndex = nextPageIdx;
        }
    }
}
