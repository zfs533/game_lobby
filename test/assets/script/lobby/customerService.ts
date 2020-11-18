import PopActionBox from "../lobby/popActionBox"
import { showTip, showLoading, hideLoading } from "../common/ui";
import { ErrCodes } from "../common/code";
import g from "../g";
import CSDetail from "./csDetail";
import { ItemNames } from "../common/enum";
import { formatTimeStr, setInteractable, getRechargeProblemUrl, doCountdown, getIsMessger } from "../common/util";
import net from "../common/net";
import Lobby from "./lobby";
import agentUtil from "./agentUtil";
const { ccclass, property } = cc._decorator;

type Faq = {
    question: string;
    answer: string
}

enum QUESTION_TYPE {
    TYPE_NULL,
    TYPE_NORMAL,                // 提问
    TYPE_REPORT_BUSINESS,       // 投诉商人
    TYPE_ALL
}

@ccclass
export default class CustomerService extends PopActionBox {

    @property(cc.Node)
    private nodeAsk: cc.Node = undefined;

    @property(cc.Node)
    private nodeFaq: cc.Node = undefined;

    @property(cc.Node)
    private leftTogs: cc.Node = undefined;

    @property(cc.Toggle)
    private togAsk: cc.Toggle = undefined;

    @property(cc.Toggle)
    private togFaq: cc.Toggle = undefined;

    @property(cc.Toggle)
    private togQues: cc.Toggle = undefined;

    @property(cc.Toggle)
    private togRecoder: cc.Toggle = undefined;

    @property(cc.Toggle)
    private togOnline: cc.Toggle = undefined;

    @property(cc.Label)
    private lblPrompt: cc.Label = undefined;

    @property(cc.EditBox)
    private editAsk: cc.EditBox = undefined;

    @property(cc.ScrollView)
    private scrollViewFaq: cc.ScrollView = undefined;

    @property(cc.RichText)
    private richFaqItem: cc.RichText = undefined;

    @property(cc.Button)
    private btnCommit: cc.Button = undefined;

    @property(cc.Node)
    private nodeRec: cc.Node = undefined;

    @property(cc.Node)
    recContent: cc.Node = undefined;

    @property(cc.Node)
    private recItem: cc.Node = undefined;

    @property(cc.Prefab)
    private preCSDetail: cc.Prefab = undefined;

    @property(cc.Toggle)
    private togRec: cc.Toggle = undefined;

    @property(cc.Button)
    private btnProblem: cc.Button = undefined;

    @property(cc.Node)
    private problem: cc.Node = undefined;

    @property(cc.Color)
    private titleColor: cc.Color = undefined;

    @property(cc.Color)
    private questionColor: cc.Color = undefined;

    @property(cc.Color)
    private answerColor: cc.Color = undefined;

    @property(cc.Node)
    msgPot: cc.Node = undefined; // 小红点

    @property(cc.Node)
    ndOtherOnline: cc.Node = undefined;     // 方便再次点击在线客服

    public tLobby: Lobby = undefined;
    private cdTime = 900
    ids: string[] = []
    private page = 1
    private faqPage = 0;
    private faqData: ps.HallCsHandlerGetFaq_Faq[] = [];
    private col1 = "";
    private col2 = "";
    private col3 = "";

    private onTextChanged() {
        this.lblPrompt.node.active = !this.editAsk.string;
    }

    private onClickBack() {
        this.nodeAsk.active = true;
        this.nodeFaq.active = false;
    }

    protected onLoad() {
        if (super.onLoad) {
            super.onLoad();
        }
        this.tLobby = cc.find('lobby').getComponent(Lobby);

        //设置小红点不显示
        this.msgPot.active = false;
        if (getIsMessger()) {
            this.msgPot.active = true;
        }

        this.recItem.removeFromParent()

        this.col1 = this.titleColor.toHEX("#rrggbbaa");
        this.col2 = this.questionColor.toHEX("#rrggbbaa")
        this.col3 = this.answerColor.toHEX("#rrggbbaa")
    }

    protected start() {
        if (super.start) {
            super.start();
        }

        this.initLeftBtStatus();
    }

    scroll(ev: any, et: cc.ScrollView.EventType) {
        if (cc.ScrollView.EventType.SCROLL_TO_BOTTOM === et) {
            this.getFaq();
        }
    }

    private getFaq() {
        if (this.faqData) {
            let data = this.faqData;
            let content = this.scrollViewFaq.content;
            for (let ofs = 0; ofs < 5; ofs++) {
                let idx = this.faqPage * 5 + ofs;
                let allInfo = data[idx];
                if (!allInfo) break;
                let qus = allInfo.question.replace("\n", "");
                let ans = allInfo.answer.replace("\n", "");
                let str = `<color=${this.col1}>问题${idx + 1}:</c><color=${this.col2}>${qus}</c><br/><color=${this.col1}>回答: </c><color=${this.col3}>${ans}</c>${idx !== data.length - 1 ? "<br/>" : ""}`;
                let item = cc.instantiate(this.richFaqItem.node);
                item.getComponent(cc.RichText).string = str;
                content.addChild(item);
            }
            this.faqPage++;
        }
    }

    async initFaq() {
        this.ndOtherOnline.active = false;
        let reqData = await net.request("hall.csHandler.getFaq");
        if (reqData.code == 200 && reqData.faq) {
            this.faqData = reqData.faq;
        }
    }

    protected onEnable() {
        if (!g.CustomerJudge) {
            this.nodeFaq.active = false;
            this.checkCD();
        }
    }

    private onClickReset() {
        this.editAsk.string = "";
        this.onTextChanged();
    }

    private async onClickCommit() {
        let content = this.editAsk.string.trim();
        if (content.length < 8) {
            showTip("输入的问题字数不得少于8个！");
            return;
        }
        showLoading("提交中");

        let data = await net.request("hall.csHandler.submit", { type: QUESTION_TYPE.TYPE_NORMAL, content: content })
        hideLoading();
        if (data.code === 200) {
            showTip("提交成功！");
            let next = Date.now() + 60 * 10 * 1000;
            g.complainTime = next;
            cc.sys.localStorage.setItem(ItemNames.complainTime, next);
            this.onClickReset();
            this.checkCD();
        } else {
            showTip(ErrCodes.getErrStr(data.code, "问题提交失败"));
        }
    }

    private async onClickFaq() {
        this.nodeRec.active = false
        this.nodeAsk.active = false;
        this.problem.active = false;
        this.nodeFaq.active = true;
        this.getFaq();
        this.initFaq();
    }

    onClickProblem() {
        cc.sys.openURL(getRechargeProblemUrl())
    }

    startCountDown(t: number) {
        let label = this.btnProblem.getComponentInChildren(cc.Label);
        doCountdown(this.btnProblem, label, t);
    }

    private checkCD() {
        let latestComplainTime = cc.sys.localStorage.getItem(ItemNames.complainTime);
        let next = g.complainTime;
        if (latestComplainTime) {
            next = latestComplainTime;
        }
        if (!next || isNaN(next)) {
            return;
        }
        let now = Date.now();
        if (now < next) {
            setInteractable(this.btnCommit, false);
            let lbl = this.btnCommit.getComponentInChildren(cc.Label);
            let self = this;
            doCountdown(this.btnCommit, lbl, next, () => {
                if (!self || !self.btnCommit || !self.btnCommit.isValid) {
                    return true;
                }
                return false;
            });
        }
    }


    onCheckAsk() {
        this.nodeRec.active = false
        this.nodeAsk.active = true
        this.nodeFaq.active = false
        this.problem.active = false;
        this.ndOtherOnline.active = false;
    }

    onCheckRec() {
        this.nodeRec.active = true
        this.nodeAsk.active = false
        this.nodeFaq.active = false
        this.problem.active = false;
        this.ndOtherOnline.active = false;
    }
    onClickRecharge() {
        this.problem.active = true;
        this.nodeRec.active = false
        this.nodeAsk.active = false;
        this.nodeFaq.active = false;
        this.ndOtherOnline.active = false;
    }

    async loadRec(first = false) {
        showLoading("加载中");
        let data = await net.request('hall.csHandler.getQuestions', { page: this.page++ })
        hideLoading();
        if (data.code === 200) {
            for (const q of data.questions || []) {
                if (!q.read && first) {
                    first = false
                    this.showRec(q.id)
                    this.scheduleOnce(() => {
                        this.togRec.check()
                    }, 0.2)
                }
                this.ids.push(q.id)
                let item = cc.instantiate(this.recItem);
                item.active = true;
                this.recContent.addChild(item);
                let labs = item.getComponentsInChildren(cc.Label)
                labs[0].string = this.format(q.questionTime) + ' 提交'
                labs[1].string = this.format(q.answerTime) + ' 回复'
                labs[2].string = q.comment === undefined ? '未评价' : '已评价'
                labs[2].node.color = q.comment === undefined ? cc.Color.RED : cc.Color.GREEN
            }
        } else {
            showTip(ErrCodes.getErrStr(data.code));
        }
        this.ndOtherOnline.active = false;
    }

    svDidScroll(ev: any, eventType: cc.ScrollView.EventType) {
        if (cc.ScrollView.EventType.SCROLL_TO_BOTTOM === eventType) {
            this.loadRec()
        }
    }

    format(t: number) {
        let timeStr = formatTimeStr('m', +t);
        return timeStr;
    }

    onClickRec(ev: cc.Event.EventTouch) {
        this.showRec(this.ids[this.recContent.children.indexOf(ev.target)])
    }

    async showRec(id: string) {
        showLoading("加载中");
        let data = await net.request("hall.csHandler.read", { id: id });
        hideLoading();
        if (data.code === 200) {
            let di = cc.instantiate(this.preCSDetail);
            this.node.addChild(di);
            di.getComponent(CSDetail).setContent({ id, ...(data.question[0] || data.question) })
        } else {
            showTip(ErrCodes.getErrStr(data.code, ""));
        }
    }
    private onClickMail(even: cc.Event.EventTouch) {
        this.closeAction(() => {
            if (this.tLobby) {
                this.tLobby.onClickMail();
                this.node.zIndex = -1;
            } else {
                showTip("请到邮箱里面查看详情哟～");
            }
        });
    }

    private async onClickOnlineCustomerService(event: cc.Event, customeData: string) {
        await this.reqCsUrl();

        if (this.tLobby) {
            if (g.customerServiceUrl) {
                this.tLobby.onClickOnlineCustomerService(true, g.customerServiceUrl + "&protoType=2"); // 使用pomelo协议，固定type为2
            } else {
                this.tLobby.onClickOnlineCustomerService(false);
            }
            this.node.zIndex = -1;
            if (this.msgPot.active) this.msgPot.active = false;
        } else {
            showTip("暂不支持此功能！");
        }

        this.ndOtherOnline.active = true;
    }

    initLeftBtStatus() {
        if (agentUtil.getSupportNewAgentChatRcg()) {
            this.leftTogs.children.forEach(el => {
                el.active = false;
            });

            this.nodeAsk.active = false;
            this.togFaq.node.active = true;
            this.togOnline.node.active = true;
            this.initFaqData();
            this.onClickFaq();

            if (g.CustomerJudge) {
                // 放在onload中，toggle的check()执行无效，放入start中即可
                this.togQues.node.active = true;
                this.togQues.check();
            } else {
                this.loadRec(true)
            }
        } else {
            this.togOnline.node.active = false;
        }
    }

    async reqCsUrl() {
        showLoading();
        let data = await net.request("hall.csHandler.csUrlRequest", { type: 1 });
        hideLoading();
        if (data.code === 200) {
            if (data.csUrl) {
                g.customerServiceUrl = data.csUrl;
                g.customerFileServerUrl = data.fileServerUrl;
            }
            return;
        } else {
            showTip(ErrCodes.CODES[data.code]);
        }
        g.customerServiceUrl = "";
        showTip(ErrCodes.getErrStr(data.code, "打开客服失败"));
    }

    initFaqData() {
        this.faqData = [{ "question": "为什么我不能注册与绑定账号？没有收到验证码？", "answer": "请使用自己手机号获取验证码(确保手机可以收到短信)，方可注册与绑定账号；验证码接收可能因为网络原因导致延迟，请注意当前网络环境。" }, { "question": "充值有哪些方式？官方如何充值？", "answer": "我们目前支持支付宝、微信与代理商充值。进入商城选择对应金币数量，点击对应支付方式，进行支付即可成功购买。" }, { "question": "我为什么要升级正式账号？", "answer": "为了您的账户安全与游戏更好的体验，升级正式账号。确保您更全面体验与账号安全。" }, { "question": "代理充值是否靠谱？代理充值没有到账？", "answer": "代理充值都是经过官方认证的代理商；代理充值是通过保险柜转账发放，代理商充值成功后，请查看一下保险柜。" }, { "question": "遇到其他游戏问题怎么办？", "answer": "请通过客服中心提供您的账号、游戏ID；描述问题详情。问题核实后我们将第一时间联系您并处理。请及时留意邮件。" }, { "question": "充值后，在哪里可以看到到账的金币？", "answer": "充值金币后，即时到账，可以在头像信息的金币栏中看到变化，同时系统回有一封邮件发送给你。" }, { "question": "为什么我输入账号密码无法登入？", "answer": "请检查账号密码是否输入正确，如果正确请通过客服中心提供您的账号信息并说明情况。客服将为您核实详细情况后解决您的困扰。" }, { "question": "如何联系代理商进行充值？", "answer": "进入商城点击代充将会出现各个代理商；可以随意挑选自己喜欢的代理商，进行添加联系充值。" }, { "question": "充值后，如金币未到账怎么办？", "answer": "充值金币后，如果未即时到账，可能是充值延迟到账，请耐心等待一会或关闭游戏重新进入游戏。" }, { "question": "为什么我不能在代理商那儿充值呢？", "answer": "只有一种情况：游客账号无法在代理商充值，需要绑定正式账号方可在代理商充值。" }, { "question": "为什么充值后会多扣钱？", "answer": "多扣钱是因为您之前的订单充值完毕后扣款延迟。导致您误以为多扣钱了。" }, { "question": "我忘记密码了，请问如何登入自己的账号？", "answer": "您可以通过手机验证登入，输入手机账号，并输入获取的验证码即可登入。" }]
    }

}
