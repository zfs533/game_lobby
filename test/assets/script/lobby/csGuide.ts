import PopActionBox from "./popActionBox"
import { getRechargeProblemUrl, doCountdown } from "../common/util";
import g from "../g";
import net from "../common/net";
import Lobby from "./lobby";
const { ccclass, property } = cc._decorator;

@ccclass
export default class CSGuide extends PopActionBox {
    @property(cc.Prefab)
    preCS: cc.Prefab = undefined;

    @property(cc.Prefab)
    preVip: cc.Prefab = undefined;

    @property(cc.Button)
    private btnProblem: cc.Button = undefined;

    @property(cc.Node)
    private ndVipService: cc.Node = undefined;

    @property(cc.Node)
    private ndExchange: cc.Node = undefined;

    @property(cc.RichText)
    private rechargeRT1: cc.RichText = undefined;

    @property(cc.RichText)
    private rechargeRT2: cc.RichText = undefined;

    @property(cc.Label)
    private rechargelab3: cc.Label = undefined;

    @property(cc.RichText)
    private withdrawRT1: cc.RichText = undefined;

    @property(cc.RichText)
    private withdrawRT2: cc.RichText = undefined;

    @property(cc.Label)
    private withdrawlab3: cc.Label = undefined;

    @property(cc.RichText)
    private otherRT1: cc.RichText = undefined;

    @property(cc.RichText)
    private otherRT2: cc.RichText = undefined;

    @property(cc.Color)
    private normalColor: cc.Color = undefined;

    @property(cc.Color)
    private specialColor: cc.Color = undefined;

    @property(cc.Color)
    private remarkColor: cc.Color = undefined;

    @property(cc.Node)
    private arrow: cc.Node = undefined;
    private isappeal: boolean = false;
    public isRecharge: boolean = false;

    protected onLoad() {
        if (super.onLoad) {
            super.onLoad();
        }
        g.CustomerJudge = false;
        this.ndVipService.active = false;
        this.ndExchange.active = false;
        if (g._vip.isvip && g._vip.weChat != "") {
            this.ndVipService.active = true;
        } else {
            this.ndExchange.active = true;
        }
        let node = cc.find("lobby")
        if (node) {
            let lobby = node.getComponent(Lobby);
            this.isRecharge = lobby.isRecharge;
        }
        this.setRichTextAndLabelColor();
    }

    setRichTextAndLabelColor() {
        let c1 = this.normalColor.toHEX("#rrggbbaa");
        let c2 = this.specialColor.toHEX("#rrggbbaa");
        // let c3 = this.remarkColor.toHEX("#rrggbbaa");
        this.rechargeRT1.string = `<color=${c1}>付款成功后</c><color=${c2}>1分钟内</c><color=${c1}>到账，如遇网络延迟情况请耐心</c>`;
        this.btnProblem.node.active = this.isRecharge;
        this.arrow.active = this.isRecharge;
        if (this.isRecharge) {
            this.rechargeRT2.string = `<color=${c1}>等待</c><color=${c2}>3-10分钟</color><color=${c1}>。如还未到账请</c>`;
        } else {
            this.rechargeRT2.string = `<color=${c1}>等待</c><color=${c2}>3-10分钟</color><color=${c1}>，如还未到账请联系客服。</c>`;
        }
        this.rechargelab3.node.color = this.remarkColor;
        this.rechargelab3.string = `***同时我们建议您使用高效安全的“官方代理充值”。`;
        this.withdrawRT1.string = `<color=${c1}>提现成功后</c><color=${c2}>5分钟内</c><color=${c1}>到账，也可能会延迟10-60分钟，</c>`;
        this.withdrawRT2.string = `<color=${c1}>偶尔会有延迟</c><color=${c2}>1-8小时</color><color=${c1}>到账。但请您放心我们会及时处理。</c>`;
        this.withdrawlab3.node.color = this.remarkColor;
        this.withdrawlab3.string = `***状态为“提现延迟”并且未超过8小时，请勿联系客服。`;
        this.otherRT1.string = `<color=${c1}>本平台持</c><color=${c2}>公平公正</color><color=${c1}>原则，请用户放心</c><color=${c2}>安心使用</c><color=${c1}>，如</c>`;
        this.otherRT2.string = `<color=${c1}>遇其他问题请联系在线客服</c>`;
    }

    async onEnable() {
        let data = await net.request("hall.csHandler.showRechargeQuestion")
        if (data.code === 200 && data.show === 1) {
            this.isappeal = true;
        } else {
            this.isappeal = false;
        }
    }

    startCountDown(t: number) {
        let lbl = this.btnProblem.getComponentInChildren(cc.Label)
        doCountdown(this.btnProblem, lbl, t);
    }

    onClickFeedBackBtn() {
        if (this.isappeal) {
            g.CustomerJudge = true;
            this.onClickCustomerServices();
        } else {
            cc.sys.openURL(getRechargeProblemUrl())
        }
    }

    onClickCustomerServices() {
        let parent = this.node.parent;
        this.closeAction(() => {
            this.openAction(parent, this.preCS);
        });
    }

    onClickvipService() {
        let parent = this.node.parent;
        this.closeAction(() => {
            this.openAction(parent, this.preVip);
        });
    }
}
